import { useStore } from '../../store/useStore';
import type { InsuranceCriteria, PatientRecord, ClinicalSession } from '../../types';
import { calculateAge, calculateAgeYears } from '../../utils/age';

// ── Insurance analysis ──
type InsuranceResult = { code: string; label: string; status: 'eligible' | 'possible' | 'missing' | 'none'; detail: string; missing?: string[] };

function analyzeInsurance(patient: PatientRecord, s: ClinicalSession, criteria: InsuranceCriteria): { ai: InsuranceResult[]; lamal: InsuranceResult[]; hg: InsuranceResult[]; complementaire: InsuranceResult[] } {
  const p = (field: string) => { const v = parseFloat(((s as any)[field] || '').toString().replace(',', '.')); return isNaN(v) ? null : v; };
  const anb = p('anb');
  const snMego = p('snMego');
  const oj = p('overjet');
  // Age computation
  const ageYears = calculateAgeYears(patient.dateNaissance, patient.datePremiereConsult);

  // DDM totals for encombrement
  const necSup = [['t15','t14','t13'],['t12','t11'],['t21','t22'],['t23','t24','t25']].map(ks => ks.reduce((a,k) => a + (p(k) || 0), 0));
  const necInf = [['t45','t44','t43'],['t42','t41'],['t31','t32'],['t33','t34','t35']].map(ks => ks.reduce((a,k) => a + (p(k) || 0), 0));
  const dSKeys = ['dispSup1513','dispSup1211','dispSup2122','dispSup2325'];
  const dIKeys = ['dispInf4543','dispInf4241','dispInf3132','dispInf3335'];
  const totalDDMSup = dSKeys.every(k => p(k) !== null) && necSup.every(v => v > 0) ? dSKeys.reduce((a,k) => a + (p(k)||0), 0) - necSup.reduce((a,v) => a+v, 0) : null;
  const totalDDMInf = dIKeys.every(k => p(k) !== null) && necInf.every(v => v > 0) ? dIKeys.reduce((a,k) => a + (p(k)||0), 0) - necInf.reduce((a,v) => a+v, 0) : null;

  const under20 = ageYears !== null && ageYears < 20;
  const under18 = ageYears !== null && ageYears < criteria.hg_age_max;

  // ═══ AI ═══
  const ai: InsuranceResult[] = [];

  // 201/202 - Fente labiale/palatine
  if (patient.hasFente) {
    ai.push({ code: '201/202', label: 'Fente labiale/palatine', status: under20 ? 'eligible' : 'none', detail: 'Fente déclarée (anamnèse)' });
  }

  // 205 - Dysplasie dentaire
  if (s.hasDysplasieDentaire) {
    ai.push({ code: '205', label: 'Dysplasie dentaire', status: under20 ? 'eligible' : 'none', detail: 'Dysplasie déclarée (OPG)' });
  }

  // 206 - Anodontie
  if (s.hasAnodontie) {
    ai.push({ code: '206', label: 'Anodontie', status: under20 ? 'eligible' : 'none', detail: `Anodontie${s.anodontieDents ? ` : ${s.anodontieDents}` : ''}` });
  }

  // 207 - Hyperodontie
  if (s.hasHyperodontie) {
    ai.push({ code: '207', label: 'Hyperodontie', status: under20 ? 'eligible' : 'none', detail: 'Hyperodontie déclarée (OPG)' });
  }

  // 208 - Micromandibulie
  if (anb !== null && snMego !== null) {
    if (anb >= criteria.ai208_anb) {
      ai.push({ code: '208', label: 'Micromandibulie', status: under20 ? 'eligible' : 'none', detail: `ANB=${anb}° ≥ ${criteria.ai208_anb}°` });
    } else if (anb >= criteria.ai208_anb_combo && snMego >= criteria.ai208_snmego_combo) {
      ai.push({ code: '208', label: 'Micromandibulie (combo)', status: under20 ? 'eligible' : 'none', detail: `ANB=${anb}° + SN-MeGo=${snMego}°` });
    }
  } else if (oj !== null && oj >= criteria.ai208_overjet_screen) {
    const miss: string[] = [];
    if (anb === null) miss.push('ANB');
    if (snMego === null) miss.push('SN-MeGo');
    ai.push({ code: '208', label: 'Micromandibulie?', status: 'missing', detail: `OJ=${oj}mm (screening ≥${criteria.ai208_overjet_screen}mm)`, missing: miss });
  }
  // 208 - Articulé ciseaux (clinical)
  if (s.hasArticuleCiseaux) {
    ai.push({ code: '208', label: 'Articulé en ciseaux', status: under20 ? 'eligible' : 'none', detail: 'Articulé ciseaux déclaré (clinique)' });
  }

  // 209 - Mordex apertus / clausus
  if (anb !== null && snMego !== null) {
    if (snMego >= criteria.ai209_snmego_open) {
      ai.push({ code: '209', label: 'Mordex apertus', status: under20 ? 'eligible' : 'none', detail: `SN-MeGo=${snMego}° ≥ ${criteria.ai209_snmego_open}°` });
    } else if (snMego >= criteria.ai209_snmego_open_combo && anb >= criteria.ai208_anb_combo) {
      ai.push({ code: '209', label: 'Mordex apertus (combo)', status: under20 ? 'eligible' : 'none', detail: `SN-MeGo=${snMego}° + ANB=${anb}°` });
    }
    if (snMego <= criteria.ai209_snmego_deep) {
      ai.push({ code: '209', label: 'Mordex clausus', status: under20 ? 'eligible' : 'none', detail: `SN-MeGo=${snMego}° ≤ ${criteria.ai209_snmego_deep}°` });
    } else if (snMego <= criteria.ai209_snmego_deep_combo && anb >= criteria.ai208_anb_combo) {
      ai.push({ code: '209', label: 'Mordex clausus (combo)', status: under20 ? 'eligible' : 'none', detail: `SN-MeGo=${snMego}° + ANB=${anb}°` });
    }
  }
  // 209a - Béance incisives (clinical)
  if (s.hasBeanceIncisives) {
    ai.push({ code: '209a', label: 'Béance incisives', status: under20 ? 'eligible' : 'none', detail: 'Béance ant. déclarée (clinique)' });
  }

  // 210 - Prognathie inférieure
  if (anb !== null) {
    if (anb <= criteria.ai210_anb) {
      ai.push({ code: '210', label: 'Prognathie inf.', status: under20 ? 'eligible' : 'none', detail: `ANB=${anb}° ≤ ${criteria.ai210_anb}°`, missing: s.hasXBiteAnt ? undefined : ['X-bite ant. (2 paires)'] });
    } else if (anb <= criteria.ai210_anb_combo && snMego !== null && (snMego >= criteria.ai208_snmego_combo || snMego <= criteria.ai209_snmego_deep_combo)) {
      ai.push({ code: '210', label: 'Prognathie inf. (combo)', status: under20 ? 'eligible' : 'none', detail: `ANB=${anb}° + SN-MeGo=${snMego}°` });
    }
  }

  // 214 - Macroglossie
  if (patient.hasMacroglossie) {
    ai.push({ code: '214', label: 'Macroglossie', status: under20 ? 'eligible' : 'none', detail: 'Macroglossie déclarée (anamnèse)' });
  }

  // 218 - Rétention/Ankylose
  if (s.hasRetentionAnkylose) {
    ai.push({ code: '218', label: 'Rétention/Ankylose', status: under20 ? 'eligible' : 'none', detail: 'Rétention/Ankylose déclarée (OPG)' });
  }

  // ═══ LaMal ═══
  const lamal: InsuranceResult[] = [];

  // Art. 17a-17f: LaMal-specific items (NOT covered by AI codes)
  if (s.has17a) lamal.push({ code: '17a', label: 'Dislocation / inclusion path.', status: 'eligible', detail: 'Dent incluse avec pathologie associée (kyste, résorption, refoulement)' });
  if (s.has17b) lamal.push({ code: '17b', label: 'Parodontite juvénile', status: 'eligible', detail: 'Parodontite juvénile déclarée (clinique)' });
  if (s.has17c) lamal.push({ code: '17c', label: 'Dents surnuméraires path.', status: 'eligible', detail: 'Dents surnuméraires pathologiques (OPG)' });
  if (patient.has17d) lamal.push({ code: '17d', label: 'Dysgnathie (ATM)', status: 'eligible', detail: 'Dysgnathie fonctionnelle déclarée (ATM)' });
  else if (s.hasAtm) lamal.push({ code: '17d', label: 'Dysgnathie (ATM)?', status: 'possible', detail: 'Désordres ATM déclarés — confirmer 17d' });
  if (s.has17e) lamal.push({ code: '17e', label: 'Néoformations', status: 'eligible', detail: 'Néoformations déclarées (OPG)' });
  if (patient.hasSAOS) lamal.push({ code: '17f', label: 'SAOS (Apnée)', status: 'eligible', detail: 'Syndrome apnée du sommeil (anamnèse)' });
  if (patient.hasTroublesDeglutitionGrave) lamal.push({ code: '17f', label: 'Troubles déglutition', status: 'eligible', detail: 'Troubles déglutition grave (anamnèse)' });
  if (patient.hasAsymetrieGrave) lamal.push({ code: '17f', label: 'Asymétrie faciale grave', status: 'eligible', detail: 'Asymétrie faciale grave (anamnèse)' });

  // Art. 19a - AI relay after 20 years: show AI codes as LaMal instead
  // Under 20: AI items are shown directly, no duplication in LaMal
  // Over 20: AI items become LaMal art.19a (AI items will be filtered out in display)
  if (ageYears !== null && ageYears >= 20) {
    ai.forEach(r => {
      lamal.push({ ...r, label: `${r.label} (art.19a)`, status: r.status === 'eligible' ? 'possible' : r.status, detail: r.detail + ' — relais LaMal après 20 ans' });
    });
  }

  // ═══ HG ═══
  const hg: InsuranceResult[] = [];
  if (under18) {
    if (oj !== null && oj >= criteria.hg_overjet && s.competenceLabiale === 'Incompétentes') {
      hg.push({ code: 'OJ', label: 'Overjet sévère', status: 'eligible', detail: `OJ=${oj}mm + incompétence labiale` });
    } else if (oj !== null && oj >= criteria.hg_overjet) {
      hg.push({ code: 'OJ', label: 'Overjet sévère', status: 'possible', detail: `OJ=${oj}mm ≥ ${criteria.hg_overjet}mm`, missing: ['Interposition labiale?'] });
    }
    if (oj !== null && oj < 0) {
      hg.push({ code: 'OJ-', label: 'Overjet négatif', status: 'eligible', detail: `OJ=${oj}mm` });
    }
    if (s.hasTraumatisant) {
      hg.push({ code: 'OB', label: 'Supraclusion traumatisante', status: 'eligible', detail: 'Traumatisant déclaré' });
    }
    if (s.hasXBiteAnt || s.hasXSBitePost) {
      hg.push({ code: 'XB', label: 'Occlusion croisée', status: 'eligible', detail: [s.hasXBiteAnt && 'Ant.', s.hasXSBitePost && 'Post.'].filter(Boolean).join(' + ') });
    }
    // Béance latéro-postérieure
    if (s.hasBeanceLateroPost) {
      hg.push({ code: 'BLP', label: 'Béance latéro-post.', status: 'eligible', detail: `Béance latéro-post.${s.beanceLateroPostDent ? ` : ${s.beanceLateroPostDent}` : ''}` });
    }
    // Encombrement
    const worstDDM = Math.min(totalDDMSup ?? 0, totalDDMInf ?? 0);
    if ((totalDDMSup !== null || totalDDMInf !== null) && worstDDM <= -criteria.hg_encombrement) {
      hg.push({ code: 'ENC', label: 'Encombrement sévère', status: 'eligible', detail: `DDM=${Math.round(worstDDM*10)/10}mm` });
    }
    // Situations intrabuccales OPG
    if (s.hasRhizalyse) hg.push({ code: 'RHIZ', label: 'Rhizalyse', status: 'eligible', detail: 'Rhizalyse déclarée (OPG)' });
    if (s.hasAgenesieImportante) hg.push({ code: 'AGEN', label: 'Agénésie', status: 'eligible', detail: `Agénésie${s.agenesieImportanteDents ? ` : ${s.agenesieImportanteDents}` : ''}` });
    if (s.hasAnkyloseLait) hg.push({ code: 'ANKY', label: 'Ankylose mol. lait', status: 'eligible', detail: 'Ankylose molaires de lait (OPG)' });
    if (s.hasRetentionDent) hg.push({ code: 'RET', label: 'Rétention/retard', status: 'eligible', detail: 'Rétention / retard éruptif (OPG)' });
  }

  // Hauteur faciale auto-detection from face field
  if (s.face === 'Hyperdivergent' || (snMego !== null && snMego >= 37)) {
    const detail = [s.face === 'Hyperdivergent' && 'Face hyperdivergente', snMego !== null && snMego >= 37 && `SN-MeGo=${snMego}°`].filter(Boolean).join(' + ');
    if (!hg.some(r => r.code === 'HF') && under18) hg.push({ code: 'HF', label: 'Hauteur faciale ↑', status: 'possible', detail });
  }

  // ═══ Complémentaire ═══
  const complementaire: InsuranceResult[] = [];
  if (patient.compOrtho) {
    complementaire.push({ code: 'COMP', label: 'Assurance complémentaire', status: 'possible', detail: patient.compOrtho });
  }

  return { ai, lamal, hg, complementaire };
}

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
  const criteria = useStore(state => state.settings.insuranceCriteria);
  const s = patient.sessions.find(s => s.id === patient.activeSessionId) || patient.sessions[0];

  if (!s) return <div className="text-muted text-center">Aucune session</div>;

  // Age computation
  const age = calculateAge(patient.dateNaissance, patient.datePremiereConsult)?.display || '';

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
  const CephRow = ({ field, axis }: { field: string; axis?: { label: string; span: number } }) => {
    const norm = CEPH_NORMS[field];
    const val = (s as any)[field];
    const valNum = parseFloat((val || '').replace(',', '.'));
    const filled = val && !isNaN(valNum);
    const isError = filled && (valNum < norm.ideal - norm.dev || valNum > norm.ideal + norm.dev);
    const errorBg = isError ? { background: 'var(--c-alert-bg)', borderRadius: '2px' } : undefined;
    return (
      <>
        {axis && axis.label !== 'S' && (
          <tr><td colSpan={4} style={{ padding: 0, height: '1px' }}><div style={{ borderTop: '1px solid var(--c-border)', margin: '3px 0' }} /></td></tr>
        )}
        <tr>
          {axis && <td rowSpan={axis.span} className="ov-ceph-axis">{axis.label}</td>}
          <td className={`ceph-label ${isError ? 'ov-alert' : ''}`} style={errorBg}>{norm.label}</td>
          <td className={`ceph-val ${isError ? 'ov-alert' : (filled ? '' : 'ov-empty')}`} style={errorBg}>
            {filled ? valNum : '—'}
          </td>
          <td className="ceph-norm">{norm.ideal}±{norm.dev}</td>
        </tr>
      </>
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
    { label: 'Paro. juvénile (17b)', field: 'has17b' },
    { label: 'Béance incisives', field: 'hasBeanceIncisives' },
    { label: 'Art. ciseaux', field: 'hasArticuleCiseaux' },
    { label: 'Béance latéro-post.', field: 'hasBeanceLateroPost', detail: 'beanceLateroPostDent' },
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
    patient.hasFente && { label: 'Fente (201/202)' },
    patient.hasMacroglossie && { label: 'Macroglossie (214)' },
    patient.hasSAOS && { label: 'SAOS (17f)' },
    patient.hasTroublesDeglutitionGrave && { label: 'Troubles déglut. (17f)' },
    patient.hasAsymetrieGrave && { label: 'Asymétrie grave (17f)' },
    patient.has17d && { label: 'Dysgnathie (17d)' },
  ].filter(Boolean) as { label: string; detail?: string }[];

  const dentFlags: { label: string; detail?: string }[] = [
    patient.sensibilite && { label: 'Sensibilité' },
    hab.succionPouce && { label: 'Succion' },
    hab.bruxisme && { label: 'Bruxisme' },
    patient.antecFamExtract && { label: 'Extractions', detail: patient.extractionDetails },
    patient.hasOrthoPasse && { label: 'Ortho passé', detail: patient.traitementsOrthoPasses },
    patient.hasAutreDent && { label: 'Autre Dent.', detail: patient.autreDent },
  ].filter(Boolean) as { label: string; detail?: string }[];

  // Insurance analysis
  const insurance = criteria ? analyzeInsurance(patient, s, criteria) : { ai: [], lamal: [], hg: [], complementaire: [] };
  // Under 20: show AI items, hide LaMal art.19a duplicates (only show LaMal-specific 17a-17f)
  // Over 20: hide AI items (they're relayed to LaMal art.19a)
  const ageForInsurance = calculateAgeYears(patient.dateNaissance, patient.datePremiereConsult);
  const isOver20 = ageForInsurance !== null && ageForInsurance >= 20;
  const displayAi = isOver20 ? [] : insurance.ai;
  const displayLamal = insurance.lamal;
  const allInsurance = [...displayAi, ...displayLamal, ...insurance.hg];
  const hasEligible = allInsurance.some(r => r.status === 'eligible');
  const hasMissing = allInsurance.some(r => r.status === 'missing');

  // Treatment plans
  const plans = [s.planTraitement1, s.planTraitement2, s.planTraitement3, s.planTraitement4, s.planTraitement5]
    .map((p, i) => p ? { num: i + 1, text: p } : null)
    .filter(Boolean) as { num: number; text: string }[];
  const remarques = s.planTraitement6 || '';

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
            <div style={{ alignSelf: 'center', marginLeft: 'auto', display: 'flex', gap: 'var(--sp-2)', alignItems: 'center' }}>
              <button
                className="btn btn-outline no-print"
                onClick={(e) => { e.stopPropagation(); window.print(); }}
                style={{ padding: '2px 8px', fontSize: 'var(--fs-small)', cursor: 'pointer' }}
                title="Exporter PDF (Ctrl+P)"
              >
                PDF
              </button>
              <span className="ov-pill ov-pill-muted">{patient.id}</span>
            </div>
          </div>
        );
      })()}

      {/* ═══ INSURANCE ZONE ═══ */}
      {allInsurance.length > 0 && (
        <div style={{ gridColumn: '1 / -1', display: 'flex', gap: 'var(--sp-2)', padding: 'var(--sp-2) var(--sp-3)', background: hasEligible ? '#f0fdf4' : hasMissing ? '#fffbeb' : '#f8fafc', border: `1px solid ${hasEligible ? '#bbf7d0' : hasMissing ? '#fde68a' : 'var(--c-border)'}`, borderRadius: 'var(--radius-lg)', flexWrap: 'wrap', alignItems: 'center' }}>
          <span style={{ fontWeight: 700, fontSize: 'var(--fs-small)', color: 'var(--c-text-secondary)', marginRight: 'var(--sp-1)' }}>Prise en charge :</span>
          {displayAi.map((r, i) => (
            <span key={`ai-${i}`} title={r.detail + (r.missing ? ' — Manquant: ' + r.missing.join(', ') : '')}
              className={`ov-pill ${r.status === 'eligible' ? 'ov-pill-green' : r.status === 'missing' ? 'ov-pill-amber' : 'ov-pill-muted'}`}
              style={{ fontSize: 'var(--fs-badge)' }}>
              AI {r.code} — {r.label} {r.status === 'missing' && '⚠'}
            </span>
          ))}
          {displayLamal.map((r, i) => (
            <span key={`lamal-${i}`} title={r.detail}
              className={`ov-pill ${r.status === 'eligible' ? 'ov-pill-green' : r.status === 'possible' ? 'ov-pill-blue' : r.status === 'missing' ? 'ov-pill-amber' : 'ov-pill-muted'}`}
              style={{ fontSize: 'var(--fs-badge)' }}>
              LaMal {r.code} — {r.label} {r.status === 'missing' && '⚠'}
            </span>
          ))}
          {insurance.hg.map((r, i) => (
            <span key={`hg-${i}`} title={r.detail + (r.missing ? ' — ' + r.missing.join(', ') : '')}
              className={`ov-pill ${r.status === 'eligible' ? 'ov-pill-green' : r.status === 'possible' ? 'ov-pill-blue' : 'ov-pill-amber'}`}
              style={{ fontSize: 'var(--fs-badge)' }}>
              HG — {r.label} {r.status !== 'eligible' && '?'}
            </span>
          ))}
          {hasMissing && (
            <span style={{ fontSize: 'var(--fs-badge)', color: '#92400e', fontStyle: 'italic', marginLeft: 'auto' }}>
              Données manquantes — survolez pour détails
            </span>
          )}
        </div>
      )}

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
          <span className="ov-label">Expo. Inc.</span>
          {(() => {
            const v = parseFloat((s.expoIncisives || '').replace(',', '.'));
            const filled = s.expoIncisives && !isNaN(v);
            const isLow = filled && v < 80;
            return <span className={`ov-val ${isLow ? 'ov-alert ov-alert-bg' : filled ? '' : 'ov-empty'}`}>{filled ? `${v}%` : '—'}</span>;
          })()}
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
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div className="overview-zone-title" style={{ marginBottom: 0 }}>Céphalométrie</div>
          {s.stadeMaturation && <span className="ov-pill ov-pill-blue" style={{ fontSize: 'var(--fs-badge)' }}>{s.stadeMaturation}</span>}
        </div>

        <table className="ov-ceph-table" style={{ marginTop: 'var(--sp-1)' }}>
          <tbody>
            <CephRow field="sna" axis={{ label: 'S', span: 4 }} />
            <CephRow field="snb" />
            <CephRow field="anb" />
            <CephRow field="wits" />
            <CephRow field="snSpaspp" axis={{ label: 'V', span: 3 }} />
            <CephRow field="spasppMego" />
            <CephRow field="snMego" />
            <CephRow field="incisifSn" axis={{ label: 'D', span: 4 }} />
            <CephRow field="incisifSpaspp" />
            <CephRow field="incisifMego" />
            <CephRow field="incisifIncisif" />
          </tbody>
        </table>
      </div>

      {/* ═══ ROW 3: PARO+HABITUDES+TRAITEMENT | MOULAGE | OPG+ANAMNESE ═══ */}

      {/* Col 1: Paro + Habitudes + Plan de Traitement stacked */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-2)', minWidth: 0 }}>
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

        {/* Plan de Traitement */}
        {(plans.length > 0 || remarques) && (
          <div className="overview-zone" style={{ flex: 1 }} onClick={() => setActiveTab('traitement')} title="→ Plan de Traitement">
            <div className="overview-zone-title">Plan de Traitement</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '3px', fontSize: 'var(--fs-small)' }}>
              {plans.map(p => (
                <div key={p.num} style={{ display: 'flex', gap: 'var(--sp-2)', alignItems: 'baseline' }}>
                  <span style={{ fontWeight: 700, color: 'var(--c-primary)', minWidth: '18px', textAlign: 'right' }}>{p.num}.</span>
                  <span>{p.text}</span>
                </div>
              ))}
              {remarques && (
                <div style={{ marginTop: 'var(--sp-1)', paddingTop: 'var(--sp-1)', borderTop: '1px solid var(--c-border)', color: 'var(--c-text-secondary)', fontStyle: 'italic' }}>
                  {remarques}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Moulage */}
      <div className="overview-zone" onClick={() => setActiveTab('moulages')} title="→ Moulages">
        <div className="overview-zone-title">Moulage</div>

        {/* DDM full width */}
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 'var(--fs-small)', tableLayout: 'fixed' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--c-border)' }}>
              <th style={{ width: '28px', padding: '2px 3px' }}></th>
              <th style={{ padding: '2px 3px', textAlign: 'center', color: 'var(--c-text-muted)', fontWeight: 600, fontSize: 'var(--fs-badge)' }}>15-13</th>
              <th style={{ padding: '2px 3px', textAlign: 'center', color: 'var(--c-text-muted)', fontWeight: 600, fontSize: 'var(--fs-badge)' }}>12-11</th>
              <th style={{ padding: '2px 3px', textAlign: 'center', color: 'var(--c-text-muted)', fontWeight: 600, fontSize: 'var(--fs-badge)' }}>21-22</th>
              <th style={{ padding: '2px 3px', textAlign: 'center', color: 'var(--c-text-muted)', fontWeight: 600, fontSize: 'var(--fs-badge)' }}>23-25</th>
              <th style={{ padding: '2px 3px', textAlign: 'center', fontWeight: 700, borderLeft: '2px solid var(--c-border)', fontSize: 'var(--fs-badge)' }}>Total</th>
            </tr>
          </thead>
          <tbody>
            <tr style={{ borderBottom: '1px solid var(--c-border)', background: '#f8fafc' }}>
              <td style={{ padding: '3px', fontWeight: 700, color: '#1e40af' }}>Sup</td>
              {ddmSupQ.map((v,i) => <DDMCell key={i} v={v} />)}
              <td style={{ borderLeft: '2px solid var(--c-border)', textAlign: 'center', fontWeight: 700, color: ddmSupTotal === null ? '#94a3b8' : ddmSupTotal < 0 ? 'var(--c-alert)' : 'var(--c-filled)', padding: '3px' }}>
                {ddmSupTotal !== null ? (ddmSupTotal > 0 ? `+${ddmSupTotal}` : ddmSupTotal) : '—'}
              </td>
            </tr>
            <tr style={{ background: '#f8fafc' }}>
              <td style={{ padding: '3px', fontWeight: 700, color: '#1e40af' }}>Inf</td>
              {ddmInfQ.map((v,i) => <DDMCell key={i} v={v} />)}
              <td style={{ borderLeft: '2px solid var(--c-border)', textAlign: 'center', fontWeight: 700, color: ddmInfTotal === null ? '#94a3b8' : ddmInfTotal < 0 ? 'var(--c-alert)' : 'var(--c-filled)', padding: '3px' }}>
                {ddmInfTotal !== null ? (ddmInfTotal > 0 ? `+${ddmInfTotal}` : ddmInfTotal) : '—'}
              </td>
            </tr>
          </tbody>
        </table>

        <hr className="ov-sep" />

        {/* Bolton + Distances side by side */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr', gap: 'var(--sp-2)', alignItems: 'start' }}>
          {/* Bolton */}
          <div>
            <div className="ov-sub-title">Bolton</div>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 'var(--fs-small)' }}>
              <tbody>
                <tr style={{ borderBottom: '1px solid var(--c-border)' }}>
                  <td style={{ padding: '2px 4px', fontWeight: 600, color: 'var(--c-text-secondary)', width: '24px' }}>/6</td>
                  <td style={{ padding: '2px 4px', textAlign: 'right' }}>
                    <span className={hasInc ? (bolton6Excess > 1.5 ? 'ov-alert ov-alert-bg' : bolton6Excess > 0 ? '' : 'ov-ok') : 'ov-empty'} style={{ fontWeight: 600 }}>
                      {hasInc ? (bolton6Excess > 0 ? `${ratio6 > 0.772 ? 'mand.' : 'max.'} +${bolton6Excess}` : 'OK') : '—'}
                    </span>
                  </td>
                </tr>
                <tr>
                  <td style={{ padding: '2px 4px', fontWeight: 600, color: 'var(--c-text-secondary)' }}>/12</td>
                  <td style={{ padding: '2px 4px', textAlign: 'right' }}>
                    <span className={allTeeth ? (bolton12Excess > 1.5 ? 'ov-alert ov-alert-bg' : bolton12Excess > 0 ? '' : 'ov-ok') : 'ov-empty'} style={{ fontWeight: 600 }}>
                      {allTeeth ? (bolton12Excess > 0 ? `${ratio12 > 0.913 ? 'mand.' : 'max.'} +${bolton12Excess}` : 'OK') : '—'}
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="v-divider" />

          {/* Distances */}
          <div>
            <div className="ov-sub-title">Distances</div>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 'var(--fs-small)', textAlign: 'center' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--c-border)' }}>
                  <th style={{ width: '28px', padding: '1px 2px' }}></th>
                  <th style={{ padding: '1px 2px', fontWeight: 600, color: 'var(--c-text-muted)', fontSize: 'var(--fs-badge)' }}>Sup</th>
                  <th style={{ padding: '1px 2px', fontWeight: 600, color: 'var(--c-text-muted)', fontSize: 'var(--fs-badge)' }}>Inf</th>
                  <th style={{ padding: '1px 2px', fontWeight: 600, color: 'var(--c-text-muted)', fontSize: 'var(--fs-badge)' }}>Δ</th>
                </tr>
              </thead>
              <tbody>
                <tr style={{ borderBottom: '1px solid var(--c-border-light)' }}>
                  <td style={{ padding: '2px', fontWeight: 600, color: 'var(--c-text-secondary)', textAlign: 'left' }}>Mol</td>
                  <td style={{ padding: '2px' }}>{n(s,'distInterMolSup') || '—'}</td>
                  <td style={{ padding: '2px' }}>{n(s,'distInterMolInf') || '—'}</td>
                  <td style={{ padding: '2px' }}><DeltaColor v={distMolDelta} /></td>
                </tr>
                <tr style={{ borderBottom: '1px solid var(--c-border-light)' }}>
                  <td style={{ padding: '2px', fontWeight: 600, color: 'var(--c-text-secondary)', textAlign: 'left' }}>PM</td>
                  <td style={{ padding: '2px' }}>{n(s,'distPMSup') || '—'}</td>
                  <td style={{ padding: '2px' }}>{n(s,'distPMInf') || '—'}</td>
                  <td style={{ padding: '2px' }}><DeltaColor v={distPMDelta} /></td>
                </tr>
                <tr>
                  <td style={{ padding: '2px', fontWeight: 600, color: 'var(--c-text-secondary)', textAlign: 'left' }}>Can</td>
                  <td style={{ padding: '2px' }}>{n(s,'distCanSup') || '—'}</td>
                  <td style={{ padding: '2px' }}>{n(s,'distCanInf') || '—'}</td>
                  <td style={{ padding: '2px' }}><DeltaColor v={distCanDelta} /></td>
                </tr>
              </tbody>
            </table>
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
            const opgInsuranceFlags = [
              s.hasAnodontie && `Anodontie (206)${s.anodontieDents ? `: ${s.anodontieDents}` : ''}`,
              s.hasHyperodontie && 'Hyperodontie (207)',
              s.hasDysplasieDentaire && 'Dysplasie (205)',
              s.hasRetentionAnkylose && 'Rétention/Ankylose (218)',
              s.hasAgenesieImportante && `Agénésie (HG)${s.agenesieImportanteDents ? `: ${s.agenesieImportanteDents}` : ''}`,
              s.hasAnkyloseLait && 'Ankylose lait (HG)',
              s.hasRetentionDent && 'Rétention (HG)',
              s.hasRhizalyse && 'Rhizalyse (HG)',
              s.has17a && 'Dislocation/inclusion (17a)',
              s.has17c && 'Surnuméraires (17c)',
              s.has17e && 'Néoformations (17e)',
            ].filter(Boolean) as string[];
            return (
              <>
                <div className="ov-kv">
                  {withComment.map(o => (
                    <span key={o.label} style={{ display: 'contents' }}><span className="ov-label">{o.label}</span><span className="ov-val ov-warn ov-warn-bg">{o.detail}</span></span>
                  ))}
                  {withIssue.map(o => (
                    <span key={o.label} style={{ display: 'contents' }}><span className="ov-label">{o.label}</span><span className="ov-val ov-warn ov-warn-bg">—</span></span>
                  ))}
                </div>
                {opgInsuranceFlags.length > 0 && (
                  <div className="ov-flags" style={{ marginTop: 'var(--sp-1)' }}>
                    {opgInsuranceFlags.map(f => <span key={f} className="ov-pill ov-pill-green" style={{ fontSize: 'var(--fs-badge)' }}>{f}</span>)}
                  </div>
                )}
              </>
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

      {/* Treatment plan moved to col 1 with paro/habitudes */}
    </div>
  );
}
