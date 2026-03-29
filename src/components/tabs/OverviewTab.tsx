import { useStore } from '../../store/useStore';

// ── Ceph norms ──
const CEPH_NORMS: Record<string, { ideal: number; dev: number; label: string }> = {
  sna:            { ideal: 82,  dev: 2,   label: 'SNA' },
  snb:            { ideal: 80,  dev: 2,   label: 'SNB' },
  anb:            { ideal: 2,   dev: 2,   label: 'ANB' },
  wits:           { ideal: 0,   dev: 0,   label: 'Wits' },
  snSpaspp:       { ideal: 7,   dev: 3,   label: 'SN-SpaSpp' },
  spasppMego:     { ideal: 25,  dev: 6,   label: 'SpaSpp-MeGo' },
  snMego:         { ideal: 32,  dev: 2.5, label: 'SN-MeGo' },
  incisifSn:      { ideal: 103, dev: 6,   label: '1/-SN' },
  incisifSpaspp:  { ideal: 110, dev: 6,   label: '1/-SpaSpp' },
  incisifMego:    { ideal: 93,  dev: 4,   label: '/1-MeGo' },
  incisifIncisif: { ideal: 132, dev: 6,   label: '1/-/1' },
};

// ── Clinical abnormal values ──
const ALERT_VALUES: Record<string, string[]> = {
  gummySmile: ['Oui (Sévère)'],
  competenceLabiale: ['Incompétentes'],
  hygieneClin: ['Mauvaise'],
};
const WARN_VALUES: Record<string, string[]> = {
  face: ['Hyperdivergent', 'Hypodivergent'],
  profil: ['Convexe', 'Concave', 'Biprotrusive', 'Biprochéilie'],
  angleNasolabial: ['Ouvert', 'Fermé', 'Aigu (<90°)', 'Ouvert (>110°)'],
  angleLabiomental: ['Ouvert', 'Fermé', 'Marqué', 'Effacé'],
  troisQuarts: ['Plan'],
  gummySmile: ['Oui (Léger)'],
  symetrieVisage: ['Asymétrique'],
  symetrieSourire: ['Asymétrique'],
  competenceLabiale: ['Ourlets inversés'],
  hygieneClin: ['Moyenne'],
  phenotype: ['Fin'],
};
const NORMAL_VALUES: Record<string, string[]> = {
  face: ['Normodivergent'],
  profil: ['Droit'],
  angleNasolabial: ['Normal', 'Normal (90-110°)'],
  angleLabiomental: ['Normal'],
  troisQuarts: ['Harmonieux'],
  gummySmile: ['Non'],
  symetrieVisage: ['Symétrique'],
  symetrieSourire: ['Symétrique'],
  competenceLabiale: ['Compétentes'],
  hygieneClin: ['Bonne'],
  phenotype: ['Normal', 'Épais'],
  lm: ['Centré'],
};

function valClass(field: string, val: string): string {
  if (!val) return 'ov-empty';
  if (ALERT_VALUES[field]?.includes(val)) return 'ov-alert';
  if (WARN_VALUES[field]?.includes(val)) return 'ov-warn';
  if (NORMAL_VALUES[field]?.includes(val)) return 'ov-ok';
  return '';
}

function valBgClass(field: string, val: string): string {
  if (!val) return '';
  if (ALERT_VALUES[field]?.includes(val)) return 'ov-alert-bg';
  if (WARN_VALUES[field]?.includes(val)) return 'ov-warn-bg';
  return '';
}

const DeltaColor = ({ v }: { v: number | null }) => {
  if (v === null) return <span className="ov-empty">—</span>;
  if (v < 0) return <span style={{ fontWeight: 700, color: 'var(--c-alert)' }}>{v}</span>;
  return <span style={{ fontWeight: 700, color: 'var(--c-filled)' }}>+{v}</span>;
};

function n(session: any, k: string): number {
  const v = session[k];
  if (!v && v !== 0) return 0;
  const p = parseFloat((v + '').replace(',', '.'));
  return isNaN(p) ? 0 : p;
}

// ── KV row helper ──
function KV({ label, field, val, suffix, noGreen }: { label: string; field?: string; val: string; suffix?: string; noGreen?: boolean }) {
  const f = field || '';
  const cls = f
    ? (noGreen
      ? (ALERT_VALUES[f]?.includes(val) ? 'ov-alert' : WARN_VALUES[f]?.includes(val) ? 'ov-warn' : (val ? '' : 'ov-empty'))
      : valClass(f, val))
    : (val ? '' : 'ov-empty');
  const bgCls = f ? valBgClass(f, val) : '';
  return (
    <>
      <span className="ov-label">{label}</span>
      <span className={`ov-val ${cls} ${bgCls}`}>{val || '—'}{suffix && val ? suffix : ''}</span>
    </>
  );
}

export default function OverviewTab() {
  const patient = useStore(state => state.patient);
  const setActiveTab = useStore(state => state.setActiveTab);
  const s = patient.sessions.find(s => s.id === patient.activeSessionId) || patient.sessions[0];

  if (!s) return <div className="text-muted text-center">Aucune session</div>;

  // Age computation
  let age = '';
  if (patient.dateNaissance) {
    const from = new Date(patient.dateNaissance);
    const to = patient.datePremiereConsult ? new Date(patient.datePremiereConsult) : new Date();
    if (!isNaN(from.getTime()) && !isNaN(to.getTime())) {
      let m = (to.getFullYear() - from.getFullYear()) * 12 + (to.getMonth() - from.getMonth());
      if (to.getDate() < from.getDate()) m--;
      const y = Math.floor(m / 12);
      age = y > 0 ? `${y}a ${m % 12}m` : `${m % 12}m`;
    }
  }

  // Bolton
  const incMax = [n(s,'t12'),n(s,'t11'),n(s,'t21'),n(s,'t22')];
  const incMand = [n(s,'t42'),n(s,'t41'),n(s,'t31'),n(s,'t32')];
  const sumMax6 = n(s,'t13')+n(s,'t12')+n(s,'t11')+n(s,'t21')+n(s,'t22')+n(s,'t23');
  const sumMand6 = n(s,'t43')+n(s,'t42')+n(s,'t41')+n(s,'t31')+n(s,'t32')+n(s,'t33');
  const maxKeys = ['t16','t15','t14','t13','t12','t11','t21','t22','t23','t24','t25','t26'];
  const mandKeys = ['t46','t45','t44','t43','t42','t41','t31','t32','t33','t34','t35','t36'];
  const sumMax12 = maxKeys.reduce((a,k) => a + n(s,k), 0);
  const sumMand12 = mandKeys.reduce((a,k) => a + n(s,k), 0);
  const hasInc = [...incMax,...incMand].some(v => v > 0);
  const allTeeth = maxKeys.every(k => n(s,k) > 0) && mandKeys.every(k => n(s,k) > 0);
  const ratio6 = sumMax6 > 0 ? sumMand6/sumMax6 : 0;
  const ratio12 = sumMax12 > 0 ? sumMand12/sumMax12 : 0;
  const bolton6 = Math.round(ratio6 * 1000) / 10;
  const bolton12 = Math.round(ratio12 * 1000) / 10;
  const bolton6Excess = ratio6 > 0.772 ? Math.round((sumMand6 - sumMax6*0.772)*10)/10 : Math.round((sumMax6 - sumMand6/0.772)*10)/10;
  const bolton12Excess = ratio12 > 0.913 ? Math.round((sumMand12 - sumMax12*0.913)*10)/10 : Math.round((sumMax12 - sumMand12/0.913)*10)/10;

  // DDM totals (simplified — reads dispo fields)
  const dSup = ['dispSup1513','dispSup1211','dispSup2122','dispSup2325'];
  const dInf = ['dispInf4543','dispInf4241','dispInf3132','dispInf3335'];
  const necSup = [n(s,'t15')+n(s,'t14')+n(s,'t13'), n(s,'t12')+n(s,'t11'), n(s,'t21')+n(s,'t22'), n(s,'t23')+n(s,'t24')+n(s,'t25')];
  const necInf = [n(s,'t45')+n(s,'t44')+n(s,'t43'), n(s,'t42')+n(s,'t41'), n(s,'t31')+n(s,'t32'), n(s,'t33')+n(s,'t34')+n(s,'t35')];

  const calcDDM = (dispKeys: string[], necArr: number[]): number | null => {
    const hasAll = dispKeys.every(k => n(s,k) > 0) && necArr.every(v => v > 0);
    if (!hasAll) return null;
    return Math.round(dispKeys.reduce((a,k,i) => a + (n(s,k) - necArr[i]), 0) * 10) / 10;
  };
  const ddmSup = calcDDM(dSup, necSup);
  const ddmInf = calcDDM(dInf, necInf);

  // Distances
  const distMolDelta = n(s,'distInterMolSup') > 0 && n(s,'distInterMolInf') > 0 ? Math.round((n(s,'distInterMolSup') - n(s,'distInterMolInf'))*10)/10 : null;
  const distPMDelta = n(s,'distPMSup') > 0 && n(s,'distPMInf') > 0 ? Math.round((n(s,'distPMSup') - n(s,'distPMInf'))*10)/10 : null;
  const distCanDelta = n(s,'distCanSup') > 0 && n(s,'distCanInf') > 0 ? Math.round((n(s,'distCanSup') - n(s,'distCanInf'))*10)/10 : null;

  // Ceph rendering helper
  const CephRow = ({ field }: { field: string }) => {
    const norm = CEPH_NORMS[field];
    const val = (s as any)[field];
    const valNum = parseFloat((val || '').replace(',', '.'));
    const filled = val && !isNaN(valNum);
    const isError = filled && (valNum < norm.ideal - norm.dev || valNum > norm.ideal + norm.dev);
    return (
      <tr>
        <td>{norm.label}</td>
        <td className={isError ? 'ov-alert' : (filled ? '' : 'ov-empty')} style={isError ? { background: 'var(--c-alert-bg)', borderRadius: '2px' } : undefined}>
          {filled ? valNum : '—'}
        </td>
        <td>{norm.ideal}±{norm.dev}</td>
      </tr>
    );
  };

  // Intra-oral class helper
  const classStatus = (val: string) => {
    if (!val) return 'ov-empty';
    if (val === 'class I') return 'ov-ok';
    return 'ov-warn';
  };

  // Metric with abnormal detection
  const MetricVal = ({ val, unit = 'mm', warnLow, warnHigh }: { val: string; unit?: string; warnLow?: number; warnHigh?: number }) => {
    const num = parseFloat((val || '').replace(',', '.'));
    const filled = val && !isNaN(num);
    if (!filled) return <span className="ov-empty">—</span>;
    const isWarn = (warnLow !== undefined && num < warnLow) || (warnHigh !== undefined && num > warnHigh);
    return <span className={isWarn ? 'ov-alert ov-alert-bg' : ''}>{num} {unit}</span>;
  };

  // OPG row
  const OpgRow = ({ label, rasField, detailField }: { label: string; rasField: string; detailField: string }) => {
    const isRas = !!(s as any)[rasField];
    const detail = (s as any)[detailField] || '';
    return (
      <>
        <span className="ov-label">{label}</span>
        <span className={`ov-val ${isRas ? 'ov-ok' : (detail ? 'ov-warn ov-warn-bg' : 'ov-empty')}`}>
          {isRas ? 'RAS' : (detail || '—')}
        </span>
      </>
    );
  };

  // Intra-oral flags (affichés dans la zone Intra-oral uniquement)
  const intraFlags: { label: string; field: string; detail?: string }[] = [
    { label: 'Frein', field: 'hasFreins', detail: 'freinsDent' },
    { label: 'Carie', field: 'hasCaries', detail: 'cariesDent' },
    { label: 'Parodontite', field: 'hasParodontite', detail: 'parodontiteDetails' },
  ];
  const activeIntraFlags = intraFlags.filter(f => !!(s as any)[f.field]);

  // Paro & Habitudes flags (affichés dans la zone Paro uniquement)
  const paroHabFlags: { label: string; field: string; detail?: string }[] = [
    { label: 'Déglu. Atypique', field: 'hasDeglutitionAtypique' },
    { label: 'Interpo. Labiale', field: 'hasInterpoLabial' },
    { label: 'Grincage', field: 'hasRincageDents' },
    { label: 'ATM', field: 'hasAtm', detail: 'atmDetails' },
  ];
  const activeParoHabFlags = paroHabFlags.filter(f => !!(s as any)[f.field]);

  // Habitudes from patient level
  const hab = patient.mauvaisesHabitudes;
  const habFlags = [
    hab.succionPouce && 'Succion',
    hab.bruxisme && 'Bruxisme',
    hab.rongerOngles && 'Ongles',
    hab.respiBuccale && 'Respi. Buccale',
  ].filter(Boolean) as string[];

  // Treatment plans
  const plans = [s.planTraitement1, s.planTraitement2, s.planTraitement3, s.planTraitement4, s.planTraitement5, s.planTraitement6].filter(Boolean);

  return (
    <div className="overview-grid">
      {/* ═══ HEADER ═══ */}
      <div className="overview-header" onClick={() => setActiveTab('info')} title="→ Informations">
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 'var(--sp-2)', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '1rem', fontWeight: 700 }}>{patient.nom} {patient.prenom}</span>
            <span className="ov-pill ov-pill-blue">{patient.sexe || '?'}</span>
            {age && <span style={{ fontSize: 'var(--fs-small)', color: 'var(--c-text-secondary)' }}>{age}</span>}
            {patient.dateNaissance && <span style={{ fontSize: 'var(--fs-badge)', color: 'var(--c-text-muted)' }}>({patient.dateNaissance})</span>}
            <span className="ov-pill ov-pill-muted">{patient.id}</span>
          </div>
          <div style={{ display: 'flex', gap: 'var(--sp-3)', marginTop: '2px', fontSize: 'var(--fs-small)', color: 'var(--c-text-secondary)', flexWrap: 'wrap' }}>
            {patient.motifConsultation && <span><b>Motif :</b> {patient.motifConsultation}</span>}
            {patient.antecFamExtract && <span className="ov-pill ov-pill-amber">Extractions{patient.extractionDetails ? ` (${patient.extractionDetails})` : ''}</span>}
            {patient.praticien && <span><b>Prat :</b> {patient.praticien}</span>}
            <span className="ov-pill ov-pill-blue">{s.nomSession}</span>
            {s.stadeMaturation && <span className="ov-pill ov-pill-blue">CVM {s.stadeMaturation}</span>}
          </div>
        </div>
      </div>

      {/* ═══ ROW 2: EXTRA-ORAL | INTRA-ORAL | CEPH ═══ */}

      {/* Extra-oral */}
      <div className="overview-zone" onClick={() => setActiveTab('clinical')} title="→ Analyse Clinique">
        <div className="overview-zone-title">Extra-Oral</div>
        <div className="ov-kv" style={{ gridTemplateColumns: '105px 1fr' }}>
          <KV label="Face" field="face" val={s.face} noGreen />
          <KV label="Symétrie" field="symetrieVisage" val={s.symetrieVisage} noGreen />
          {s.symetrieVisage === 'Asymétrique' && s.asymetrieDetails && (
            <><span className="ov-label"></span><span className="ov-val ov-warn" style={{ fontSize: 'var(--fs-badge)' }}>↳ {s.asymetrieDetails}</span></>
          )}
          <span className="ov-label" style={{ gridColumn: '1/-1', borderTop: '1px solid var(--c-border)', margin: '2px 0' }} />
          <KV label="Profil" field="profil" val={s.profil} noGreen />
          <KV label="∠ Nasolab. 85-120°" field="angleNasolabial" val={s.angleNasolabial} noGreen />
          <KV label="∠ Labiom. 110-130°" field="angleLabiomental" val={s.angleLabiomental} noGreen />
          <span className="ov-label" style={{ gridColumn: '1/-1', borderTop: '1px solid var(--c-border)', margin: '2px 0' }} />
          <KV label="3/4" field="troisQuarts" val={s.troisQuarts} noGreen />
          <KV label="Gummy" field="gummySmile" val={s.gummySmile} noGreen />
          <KV label="Sym. Sourire" field="symetrieSourire" val={s.symetrieSourire} noGreen />
          <KV label="Compét. Lab." field="competenceLabiale" val={s.competenceLabiale} noGreen />
          <KV label="Expo. Inc." val={s.expoIncisives} suffix="%" />
        </div>
      </div>

      {/* Intra-oral */}
      <div className="overview-zone" onClick={() => setActiveTab('clinical')} title="→ Analyse Clinique">
        <div className="overview-zone-title">Intra-Oral</div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr', gap: 'var(--sp-2)' }}>
          {/* Sagittal */}
          <div>
            <div className="ov-sub-title">Sagittal</div>
            <div className="ov-kv" style={{ gridTemplateColumns: '42px 1fr', marginBottom: '4px' }}>
              <span className="ov-label">OJ</span>
              <span className="ov-val" style={{ fontWeight: 700 }}><MetricVal val={s.overjet} warnLow={0} warnHigh={4} /></span>
              {s.hasXBiteAnt && (
                <><span className="ov-label">X-bite</span><span className="ov-val ov-alert ov-alert-bg">{s.xbiteAntDent || 'Ant.'}</span></>
              )}
            </div>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 'var(--fs-small)' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--c-border)' }}>
                  <th style={{ width: '32px', padding: '1px 4px' }}></th>
                  <th style={{ fontWeight: 600, color: 'var(--c-text-secondary)', padding: '1px 4px', textAlign: 'center' }}>D</th>
                  <th style={{ fontWeight: 600, color: 'var(--c-text-secondary)', padding: '1px 4px', textAlign: 'center' }}>G</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td style={{ color: 'var(--c-text-muted)', fontWeight: 600, padding: '1px 4px', whiteSpace: 'nowrap' }}>Can.</td>
                  <td style={{ textAlign: 'center', padding: '1px 4px', fontWeight: 700 }} className={classStatus(s.classeCanineD)}>{s.classeCanineD || '—'}</td>
                  <td style={{ textAlign: 'center', padding: '1px 4px', fontWeight: 700 }} className={classStatus(s.classeCanineG)}>{s.classeCanineG || '—'}</td>
                </tr>
                <tr>
                  <td style={{ color: 'var(--c-text-muted)', fontWeight: 600, padding: '1px 4px', whiteSpace: 'nowrap' }}>Mol.</td>
                  <td style={{ textAlign: 'center', padding: '1px 4px', fontWeight: 700 }} className={classStatus(s.classeMolaireD)}>{s.classeMolaireD || '—'}</td>
                  <td style={{ textAlign: 'center', padding: '1px 4px', fontWeight: 700 }} className={classStatus(s.classeMolaireG)}>{s.classeMolaireG || '—'}</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="v-divider" />

          {/* Vertical + Transversal */}
          <div>
            <div className="ov-sub-title">Vertical</div>
            <div className="ov-kv" style={{ gridTemplateColumns: '42px 1fr' }}>
              <span className="ov-label">OB</span>
              <span className="ov-val" style={{ fontWeight: 700 }}>
                <MetricVal val={s.overbite} warnLow={0} warnHigh={4} />
                {s.hasTraumatisant && <span className="ov-alert ov-alert-bg" style={{ marginLeft: '4px', fontWeight: 700, fontSize: 'var(--fs-badge)', padding: '0 4px', borderRadius: '2px' }}>Trauma</span>}
              </span>
              {s.hasOcclusalCant && (
                <><span className="ov-label"></span><span className="ov-val ov-warn ov-warn-bg">Occlusal Cant</span></>
              )}
              <span className="ov-label">CdS D/G</span>
              <span className="ov-val">
                {(s.cdsD || s.cdsG) ? <>{s.cdsD || '—'} / {s.cdsG || '—'} mm</> : <span className="ov-empty">—</span>}
              </span>
            </div>

            <div className="ov-sub-title" style={{ marginTop: 'var(--sp-1)' }}>Transversal</div>
            <div className="ov-kv" style={{ gridTemplateColumns: '48px 1fr' }}>
              <span className="ov-label">LM</span>
              <span className={`ov-val ${s.lm === 'Dévié' ? 'ov-warn ov-warn-bg' : (s.lm ? '' : 'ov-empty')}`}>
                {s.lm || '—'}{s.lm === 'Dévié' && s.lmDetails ? ` (${s.lmDetails})` : ''}
              </span>
              <span className="ov-label">X/S</span>
              <span className={`ov-val ${s.hasXSBitePost ? 'ov-alert ov-alert-bg' : 'ov-empty'}`}>
                {s.hasXSBitePost ? (s.xsbitePostDent || 'Post.') : '—'}
              </span>
            </div>
          </div>
        </div>

        {activeIntraFlags.length > 0 && (
          <>
            <hr className="ov-sep" />
            <div className="ov-flags">
              {activeIntraFlags.map(f => (
                <span key={f.field} className="ov-pill ov-pill-red">
                  {f.label}{f.detail && (s as any)[f.detail] ? ` (${(s as any)[f.detail]})` : ''}
                </span>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Céphalométrie */}
      <div className="overview-zone" onClick={() => setActiveTab('radio')} title="→ Analyse Radio">
        <div className="overview-zone-title">Céphalométrie</div>

        <div className="ov-sub-title">Sagittal</div>
        <table className="ov-ceph-table">
          <tbody>
            {['sna','snb','anb','wits'].map(f => <CephRow key={f} field={f} />)}
          </tbody>
        </table>

        <div className="ov-sub-title">Vertical</div>
        <table className="ov-ceph-table">
          <tbody>
            {['snSpaspp','spasppMego','snMego'].map(f => <CephRow key={f} field={f} />)}
          </tbody>
        </table>

        <div className="ov-sub-title">Dentaire</div>
        <table className="ov-ceph-table">
          <tbody>
            {['incisifSn','incisifSpaspp','incisifMego','incisifIncisif'].map(f => <CephRow key={f} field={f} />)}
          </tbody>
        </table>
      </div>

      {/* ═══ ROW 3: PARO+HABITUDES | MOULAGE | OPG ═══ */}

      {/* Paro + Habitudes */}
      <div className="overview-zone" onClick={() => setActiveTab('clinical')} title="→ Analyse Clinique">
        <div className="overview-zone-title">Paro & Habitudes</div>
        <div className="ov-kv">
          <KV label="Hygiène" field="hygieneClin" val={s.hygieneClin} />
          <KV label="Phénotype" field="phenotype" val={s.phenotype} />
        </div>
        {(habFlags.length > 0 || activeParoHabFlags.length > 0) && (
          <>
            <hr className="ov-sep" />
            <div className="ov-flags">
              {habFlags.map(h => <span key={h} className="ov-pill ov-pill-amber">{h}</span>)}
              {activeParoHabFlags.map(f => (
                <span key={f.field} className="ov-pill ov-pill-red">
                  {f.label}{f.detail && (s as any)[f.detail] ? ` (${(s as any)[f.detail]})` : ''}
                </span>
              ))}
            </div>
          </>
        )}
        {habFlags.length === 0 && activeParoHabFlags.length === 0 && s.hygieneClin && (
          <div style={{ marginTop: 'var(--sp-1)' }}><span className="ov-pill ov-pill-green">RAS</span></div>
        )}
      </div>

      {/* Moulage */}
      <div className="overview-zone" onClick={() => setActiveTab('moulages')} title="→ Moulages">
        <div className="overview-zone-title">Moulage</div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--sp-2)' }}>
          {/* DDM */}
          <div>
            <div className="ov-sub-title">DDM</div>
            <div className="ov-kv">
              <span className="ov-label">Sup</span>
              <span className={`ov-val ${ddmSup !== null ? (ddmSup < 0 ? 'ov-alert ov-alert-bg' : 'ov-ok') : 'ov-empty'}`}>
                {ddmSup !== null ? `${ddmSup > 0 ? '+' : ''}${ddmSup} mm` : '—'}
              </span>
              <span className="ov-label">Inf</span>
              <span className={`ov-val ${ddmInf !== null ? (ddmInf < 0 ? 'ov-alert ov-alert-bg' : 'ov-ok') : 'ov-empty'}`}>
                {ddmInf !== null ? `${ddmInf > 0 ? '+' : ''}${ddmInf} mm` : '—'}
              </span>
            </div>
          </div>

          {/* Bolton */}
          <div>
            <div className="ov-sub-title">Bolton</div>
            <div className="ov-kv">
              <span className="ov-label">Ant.</span>
              <span className={`ov-val ${hasInc ? (bolton6Excess > 0 ? 'ov-warn' : 'ov-ok') : 'ov-empty'}`}>
                {hasInc ? `${bolton6}%` : '—'}
              </span>
              <span className="ov-label">Total</span>
              <span className={`ov-val ${allTeeth ? (bolton12Excess > 0 ? 'ov-warn' : 'ov-ok') : 'ov-empty'}`}>
                {allTeeth ? `${bolton12}%` : '—'}
              </span>
            </div>
          </div>
        </div>

        <hr className="ov-sep" />

        {/* Distances */}
        <div className="ov-sub-title">Distances</div>
        <div style={{ fontSize: 'var(--fs-small)' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'auto 1fr 1fr 1fr', gap: '1px var(--sp-1)', textAlign: 'right' }}>
            <span></span><span className="ov-label" style={{ textAlign: 'center' }}>Sup</span><span className="ov-label" style={{ textAlign: 'center' }}>Inf</span><span className="ov-label" style={{ textAlign: 'center' }}>Δ</span>
            <span className="ov-label">Mol</span>
            <span>{n(s,'distInterMolSup') || '—'}</span>
            <span>{n(s,'distInterMolInf') || '—'}</span>
            <DeltaColor v={distMolDelta} />
            <span className="ov-label">PM</span>
            <span>{n(s,'distPMSup') || '—'}</span>
            <span>{n(s,'distPMInf') || '—'}</span>
            <DeltaColor v={distPMDelta} />
            <span className="ov-label">Can</span>
            <span>{n(s,'distCanSup') || '—'}</span>
            <span>{n(s,'distCanInf') || '—'}</span>
            <DeltaColor v={distCanDelta} />
          </div>
        </div>

        {/* Forme d'arcade */}
        {(s.formeArcadeSup || s.formeArcadeInf) && (
          <>
            <hr className="ov-sep" />
            <div className="ov-kv">
              <span className="ov-label">Arcades</span>
              <span className="ov-val">{s.formeArcadeSup || '—'} / {s.formeArcadeInf || '—'}</span>
            </div>
          </>
        )}
      </div>

      {/* OPG */}
      <div className="overview-zone" onClick={() => setActiveTab('radio')} title="→ Analyse Radio">
        <div className="overview-zone-title">OPG</div>
        <div className="ov-kv">
          <OpgRow label="Présence" rasField="opgPresenceRas" detailField="opgPresence" />
          <OpgRow label="Position" rasField="opgPositionRas" detailField="opgPosition" />
          <OpgRow label="Proportion" rasField="opgProportionRas" detailField="opgProportion" />
          <OpgRow label="Pathologie" rasField="opgPathologieRas" detailField="opgPathologie" />
        </div>
        {s.opgRemarque && (
          <>
            <hr className="ov-sep" />
            <div style={{ fontSize: 'var(--fs-small)', color: 'var(--c-text-secondary)' }}>
              <b>Note :</b> {s.opgRemarque}
            </div>
          </>
        )}
      </div>

      {/* ═══ ROW 4: TREATMENT PLAN ═══ */}
      {plans.length > 0 && (
        <div className="overview-zone overview-footer">
          <div className="overview-zone-title">Plan de Traitement</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 'var(--sp-1) var(--sp-3)', fontSize: 'var(--fs-small)' }}>
            {plans.map((p, i) => (
              <div key={i} style={{ display: 'flex', gap: 'var(--sp-1)' }}>
                <span style={{ fontWeight: 700, color: 'var(--c-primary)', minWidth: '16px' }}>{i + 1}.</span>
                <span>{p}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
