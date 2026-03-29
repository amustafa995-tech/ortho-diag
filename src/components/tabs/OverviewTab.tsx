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

// ── DDM cell helper ──
const DDMCell = ({ v }: { v: number | null }) => {
  if (v === null) return <td style={{ textAlign: 'center', color: '#94a3b8', padding: '1px 2px', fontSize: 'var(--fs-badge)' }}>—</td>;
  const color = v < 0 ? 'var(--c-alert)' : v > 0 ? 'var(--c-filled)' : '#64748b';
  return (
    <td style={{ textAlign: 'center', fontWeight: 700, color, padding: '1px 2px', fontSize: 'var(--fs-badge)', whiteSpace: 'nowrap' }}>
      {v > 0 ? '+' : ''}{v}
    </td>
  );
};

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
  const maxKeys = ['t16','t15','t14','t13','t12','t11','t21','t22','t23','t24','t25','t26'];
  const mandKeys = ['t46','t45','t44','t43','t42','t41','t31','t32','t33','t34','t35','t36'];
  const sumMax6 = n(s,'t13')+n(s,'t12')+n(s,'t11')+n(s,'t21')+n(s,'t22')+n(s,'t23');
  const sumMand6 = n(s,'t43')+n(s,'t42')+n(s,'t41')+n(s,'t31')+n(s,'t32')+n(s,'t33');
  const sumMax12 = maxKeys.reduce((a,k) => a + n(s,k), 0);
  const sumMand12 = mandKeys.reduce((a,k) => a + n(s,k), 0);
  const hasInc = [n(s,'t12'),n(s,'t11'),n(s,'t21'),n(s,'t22'),n(s,'t42'),n(s,'t41'),n(s,'t31'),n(s,'t32')].some(v => v > 0);
  const allTeeth = maxKeys.every(k => n(s,k) > 0) && mandKeys.every(k => n(s,k) > 0);
  const ratio6 = sumMax6 > 0 ? sumMand6/sumMax6 : 0;
  const ratio12 = sumMax12 > 0 ? sumMand12/sumMax12 : 0;
  const bolton6Excess = ratio6 > 0.772 ? Math.round((sumMand6 - sumMax6*0.772)*10)/10 : Math.round((sumMax6 - sumMand6/0.772)*10)/10;
  const bolton12Excess = ratio12 > 0.913 ? Math.round((sumMand12 - sumMax12*0.913)*10)/10 : Math.round((sumMax12 - sumMand12/0.913)*10)/10;

  // DDM per quadrant
  const dSupKeys = ['dispSup1513','dispSup1211','dispSup2122','dispSup2325'];
  const dInfKeys = ['dispInf4543','dispInf4241','dispInf3132','dispInf3335'];
  const necSup = [n(s,'t15')+n(s,'t14')+n(s,'t13'), n(s,'t12')+n(s,'t11'), n(s,'t21')+n(s,'t22'), n(s,'t23')+n(s,'t24')+n(s,'t25')];
  const necInf = [n(s,'t45')+n(s,'t44')+n(s,'t43'), n(s,'t42')+n(s,'t41'), n(s,'t31')+n(s,'t32'), n(s,'t33')+n(s,'t34')+n(s,'t35')];
  const ddmSupQ = dSupKeys.map((k,i) => n(s,k) > 0 && necSup[i] > 0 ? Math.round((n(s,k) - necSup[i])*10)/10 : null);
  const ddmInfQ = dInfKeys.map((k,i) => n(s,k) > 0 && necInf[i] > 0 ? Math.round((n(s,k) - necInf[i])*10)/10 : null);
  const ddmSupTotal = ddmSupQ.every(v => v !== null) ? Math.round(ddmSupQ.reduce((a,v) => a + v!, 0)*10)/10 : null;
  const ddmInfTotal = ddmInfQ.every(v => v !== null) ? Math.round(ddmInfQ.reduce((a,v) => a + v!, 0)*10)/10 : null;

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

  // Intra-oral flags
  const intraFlags: { label: string; field: string; detail?: string }[] = [
    { label: 'Frein', field: 'hasFreins', detail: 'freinsDent' },
    { label: 'Carie', field: 'hasCaries', detail: 'cariesDent' },
    { label: 'Parodontite', field: 'hasParodontite', detail: 'parodontiteDetails' },
  ];
  const activeIntraFlags = intraFlags.filter(f => !!(s as any)[f.field]);

  // Paro & Habitudes flags
  const paroHabFlags: { label: string; field: string; detail?: string }[] = [
    { label: 'Déglu. Atypique', field: 'hasDeglutitionAtypique' },
    { label: 'Interpo. Labiale', field: 'hasInterpoLabial' },
    { label: 'Grincage', field: 'hasRincageDents' },
    { label: 'ATM', field: 'hasAtm', detail: 'atmDetails' },
  ];
  const activeParoHabFlags = paroHabFlags.filter(f => !!(s as any)[f.field]);

  const hab = patient.mauvaisesHabitudes;
  const habFlags = [
    hab.succionPouce && 'Succion',
    hab.bruxisme && 'Bruxisme',
    hab.rongerOngles && 'Ongles',
    hab.respiBuccale && 'Respi. Buccale',
  ].filter(Boolean) as string[];

  // Anamnèse flags
  const mc = patient.maladiesChroniques;
  const genFlags: { label: string; detail?: string }[] = [
    mc.diabete && { label: 'Diabète', detail: patient.maladiesChroniquesDetails?.diabete },
    mc.hypertension && { label: 'HTA', detail: patient.maladiesChroniquesDetails?.hypertension },
    mc.allergies && { label: 'Allergies', detail: patient.maladiesChroniquesDetails?.allergies },
    mc.cardio && { label: 'Cardio', detail: patient.maladiesChroniquesDetails?.cardio },
    mc.respi && { label: 'Respi', detail: patient.maladiesChroniquesDetails?.respi },
    patient.hasChirurgies && { label: 'Chirurgies', detail: patient.chirurgiesAnterieures },
    patient.hasTraitements && { label: 'Traitements', detail: patient.traitementsCours },
    patient.hasAutreGen && { label: 'Autre Méd.', detail: patient.autreGen },
  ].filter(Boolean) as { label: string; detail?: string }[];

  const dentFlags: { label: string; detail?: string }[] = [
    patient.sensibilite && { label: 'Sensibilité' },
    hab.succionPouce && { label: 'Succion' },
    hab.bruxisme && { label: 'Bruxisme' },
    patient.antecFamExtract && { label: 'Extractions', detail: patient.extractionDetails },
    patient.hasOrthoPasse && { label: 'Ortho passé', detail: patient.traitementsOrthoPasses },
    patient.hasAutreDent && { label: 'Autre Dent.', detail: patient.autreDent },
  ].filter(Boolean) as { label: string; detail?: string }[];

  // Treatment plans
  const plans = [s.planTraitement1, s.planTraitement2, s.planTraitement3, s.planTraitement4, s.planTraitement5, s.planTraitement6].filter(Boolean);

  return (
    <div className="overview-grid">
      {/* ═══ HEADER ═══ */}
      {(() => {
        const sexColor = patient.sexe === 'F' ? '#ec4899' : '#3b82f6';
        return (
          <div className="overview-header" style={{ borderLeftColor: sexColor }} onClick={() => setActiveTab('info')} title="→ Informations">
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 'var(--sp-2)', flexWrap: 'wrap' }}>
                <span style={{ fontSize: '1rem', fontWeight: 700, color: sexColor }}>{patient.nom} {patient.prenom}</span>
                {age && <span style={{ fontSize: 'var(--fs-small)', color: 'var(--c-text-secondary)' }}>{age}</span>}
                {patient.dateNaissance && <span style={{ fontSize: 'var(--fs-badge)', color: 'var(--c-text-muted)' }}>({patient.dateNaissance})</span>}
              </div>
              <div style={{ display: 'flex', gap: 'var(--sp-3)', marginTop: '2px', fontSize: 'var(--fs-small)', color: 'var(--c-text-secondary)', flexWrap: 'wrap' }}>
                {patient.motifConsultation && <span><b>MC :</b> {patient.motifConsultation}</span>}
                {patient.praticien && <span><b>Prat :</b> {patient.praticien}</span>}
              </div>
            </div>
            <span className="ov-pill ov-pill-muted" style={{ alignSelf: 'center', marginLeft: 'auto' }}>{patient.id}</span>
          </div>
        );
      })()}

      {/* ═══ ROW 2: EXTRA-ORAL | INTRA-ORAL | CEPH ═══ */}

      {/* Extra-oral */}
      <div className="overview-zone" onClick={() => setActiveTab('clinical')} title="→ Analyse Clinique">
        <div className="overview-zone-title">Extra-Oral</div>
        <div className="ov-kv" style={{ gridTemplateColumns: '85px 1fr' }}>
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
            <div className="ov-kv" style={{ gridTemplateColumns: '58px 1fr', marginBottom: '4px' }}>
              <span className="ov-label">OJ</span>
              {(() => {
                const ojNum = parseFloat((s.overjet || '').replace(',', '.'));
                const ojFilled = s.overjet && !isNaN(ojNum);
                const ojAlert = ojFilled && (ojNum < 0 || ojNum > 4);
                return <span className={`ov-val ${ojAlert ? 'ov-alert ov-alert-bg' : ''}`} style={{ fontWeight: 700 }}>{ojFilled ? `${ojNum} mm` : <span className="ov-empty">—</span>}</span>;
              })()}
              {s.hasXBiteAnt && (
                <><span className="ov-label">Ant. X-bite</span><span className="ov-val ov-alert ov-alert-bg">{s.xbiteAntDent || '—'}</span></>
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

        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--sp-2)', marginBottom: 'var(--sp-1)' }}>
          {s.stadeMaturation && <span className="ov-pill ov-pill-blue" style={{ fontSize: 'var(--fs-badge)' }}>{s.stadeMaturation}</span>}
          <div className="ov-sub-title" style={{ margin: 0, paddingBottom: 0, border: 'none' }}>Sagittal</div>
        </div>
        <table className="ov-ceph-table">
          <tbody>
            {['sna','snb','anb','wits'].map(f => <CephRow key={f} field={f} />)}
          </tbody>
        </table>

        <hr className="ov-sep" />
        <div className="ov-sub-title">Vertical</div>
        <table className="ov-ceph-table">
          <tbody>
            {['snSpaspp','spasppMego','snMego'].map(f => <CephRow key={f} field={f} />)}
          </tbody>
        </table>

        <hr className="ov-sep" />
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
        <div className="ov-kv" style={{ gridTemplateColumns: '85px 1fr' }}>
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
          {/* DDM quadrant table */}
          <div>
            <div className="ov-sub-title">DDM</div>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 'var(--fs-badge)' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--c-border)' }}>
                  <th style={{ padding: '1px 2px', textAlign: 'left', color: 'var(--c-text-muted)', fontWeight: 500 }}></th>
                  <th style={{ padding: '1px 2px', textAlign: 'center', color: 'var(--c-text-muted)', fontWeight: 500 }}>15-13</th>
                  <th style={{ padding: '1px 2px', textAlign: 'center', color: 'var(--c-text-muted)', fontWeight: 500 }}>12-11</th>
                  <th style={{ padding: '1px 2px', textAlign: 'center', color: 'var(--c-text-muted)', fontWeight: 500 }}>21-22</th>
                  <th style={{ padding: '1px 2px', textAlign: 'center', color: 'var(--c-text-muted)', fontWeight: 500 }}>23-25</th>
                  <th style={{ padding: '1px 2px', textAlign: 'center', fontWeight: 700, borderLeft: '1px solid var(--c-border)' }}>Tot.</th>
                </tr>
              </thead>
              <tbody>
                <tr style={{ borderBottom: '1px solid var(--c-border)' }}>
                  <td style={{ padding: '1px 2px', fontWeight: 700, color: '#1e40af', fontSize: 'var(--fs-badge)' }}>Sup</td>
                  {ddmSupQ.map((v,i) => <DDMCell key={i} v={v} />)}
                  <td style={{ borderLeft: '1px solid var(--c-border)', textAlign: 'center', fontWeight: 700, fontSize: 'var(--fs-badge)', color: ddmSupTotal === null ? '#94a3b8' : ddmSupTotal < 0 ? 'var(--c-alert)' : 'var(--c-filled)', padding: '1px 2px' }}>
                    {ddmSupTotal !== null ? (ddmSupTotal > 0 ? `+${ddmSupTotal}` : ddmSupTotal) : '—'}
                  </td>
                </tr>
                <tr>
                  <td style={{ padding: '1px 2px', fontWeight: 700, color: '#1e40af', fontSize: 'var(--fs-badge)' }}>Inf</td>
                  {ddmInfQ.map((v,i) => <DDMCell key={i} v={v} />)}
                  <td style={{ borderLeft: '1px solid var(--c-border)', textAlign: 'center', fontWeight: 700, fontSize: 'var(--fs-badge)', color: ddmInfTotal === null ? '#94a3b8' : ddmInfTotal < 0 ? 'var(--c-alert)' : 'var(--c-filled)', padding: '1px 2px' }}>
                    {ddmInfTotal !== null ? (ddmInfTotal > 0 ? `+${ddmInfTotal}` : ddmInfTotal) : '—'}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Bolton */}
          <div>
            <div className="ov-sub-title">Bolton</div>
            <div className="ov-kv">
              <span className="ov-label">/6</span>
              <span className={`ov-val ${hasInc ? (bolton6Excess > 0 ? 'ov-warn' : 'ov-ok') : 'ov-empty'}`}>
                {hasInc ? (bolton6Excess > 0
                  ? `Excès ${ratio6 > 0.772 ? 'mand.' : 'max.'} +${bolton6Excess} mm`
                  : 'Harmonieux') : '—'}
              </span>
              <span className="ov-label">/12</span>
              <span className={`ov-val ${allTeeth ? (bolton12Excess > 0 ? 'ov-warn' : 'ov-ok') : 'ov-empty'}`}>
                {allTeeth ? (bolton12Excess > 0
                  ? `Excès ${ratio12 > 0.913 ? 'mand.' : 'max.'} +${bolton12Excess} mm`
                  : 'Harmonieux') : '—'}
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

      {/* Col 3: OPG (compact) + Anamnèse stacked */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-2)', minWidth: 0 }}>
        {/* OPG */}
        <div className="overview-zone" onClick={() => setActiveTab('radio')} title="→ Analyse Radio">
          <div className="overview-zone-title">OPG</div>
          {(() => {
            const opgItems = [
              { label: 'Présence', ras: s.opgPresenceRas, detail: s.opgPresence },
              { label: 'Position', ras: s.opgPositionRas, detail: s.opgPosition },
              { label: 'Proportion', ras: s.opgProportionRas, detail: s.opgProportion },
              { label: 'Pathologie', ras: s.opgPathologieRas, detail: s.opgPathologie },
            ];
            const withComment = opgItems.filter(o => !o.ras && o.detail);
            const withIssue = opgItems.filter(o => !o.ras && !o.detail);
            if (withComment.length === 0 && withIssue.length === 0) {
              return <span className="ov-pill ov-pill-green">RAS</span>;
            }
            return (
              <div className="ov-kv">
                {withComment.map(o => (
                  <><span className="ov-label">{o.label}</span><span className="ov-val ov-warn ov-warn-bg">{o.detail}</span></>
                ))}
                {withIssue.map(o => (
                  <><span className="ov-label">{o.label}</span><span className="ov-val ov-warn ov-warn-bg">—</span></>
                ))}
              </div>
            );
          })()}
        </div>

        {/* Anamnèse & Plaintes */}
        <div className="overview-zone" style={{ flex: 1 }} onClick={() => setActiveTab('info')} title="→ Informations">
          <div className="overview-zone-title">Anamnèse & Plaintes</div>
          {genFlags.length === 0 && dentFlags.length === 0 ? (
            <span className="ov-pill ov-pill-green">RAS</span>
          ) : (
            <>
              {genFlags.length > 0 && (
                <>
                  <div style={{ fontSize: 'var(--fs-badge)', fontWeight: 600, color: 'var(--c-text-muted)', marginBottom: '2px' }}>Santé Générale</div>
                  <div className="ov-flags" style={{ marginBottom: 'var(--sp-1)' }}>
                    {genFlags.map((f, i) => (
                      <span key={i} className="ov-pill ov-pill-amber" title={f.detail || ''}>
                        {f.label}{f.detail ? ` (${f.detail})` : ''}
                      </span>
                    ))}
                  </div>
                </>
              )}
              {dentFlags.length > 0 && (
                <>
                  <div style={{ fontSize: 'var(--fs-badge)', fontWeight: 600, color: 'var(--c-text-muted)', marginBottom: '2px' }}>Santé Dentaire</div>
                  <div className="ov-flags">
                    {dentFlags.map((f, i) => (
                      <span key={i} className="ov-pill ov-pill-amber" title={f.detail || ''}>
                        {f.label}{f.detail ? ` (${f.detail})` : ''}
                      </span>
                    ))}
                  </div>
                </>
              )}
            </>
          )}
        </div>
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
