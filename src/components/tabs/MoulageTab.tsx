
import { useStore } from '../../store/useStore';
import { Input, Select } from '../ui/Forms';

const DROSCHL_TABLE = [
  {sum:19.5, maxM:21.3, mandM:20.8, maxF:20.2, mandF:20.0},
  {sum:20.0, maxM:21.5, mandM:21.0, maxF:20.5, mandF:20.3},
  {sum:20.5, maxM:21.7, mandM:21.2, maxF:20.7, mandF:20.6},
  {sum:21.0, maxM:21.9, mandM:21.4, maxF:21.0, mandF:20.8},
  {sum:21.5, maxM:22.0, mandM:21.6, maxF:21.2, mandF:21.1},
  {sum:22.0, maxM:22.2, mandM:21.8, maxF:21.5, mandF:21.4},
  {sum:22.5, maxM:22.4, mandM:22.0, maxF:21.7, mandF:21.6},
  {sum:23.0, maxM:22.6, mandM:22.3, maxF:22.0, mandF:21.9},
  {sum:23.5, maxM:22.7, mandM:22.5, maxF:22.2, mandF:22.2},
  {sum:24.0, maxM:22.9, mandM:22.7, maxF:22.5, mandF:22.4},
  {sum:24.5, maxM:23.1, mandM:22.9, maxF:22.7, mandF:22.7},
  {sum:25.0, maxM:23.2, mandM:23.1, maxF:23.0, mandF:23.0},
  {sum:25.5, maxM:23.4, mandM:23.3, maxF:23.2, mandF:23.2},
  {sum:26.0, maxM:23.6, mandM:23.5, maxF:23.5, mandF:23.5},
  {sum:26.5, maxM:23.8, mandM:23.7, maxF:23.7, mandF:23.7},
  {sum:27.0, maxM:24.0, mandM:23.9, maxF:24.0, mandF:24.0},
] as const;

const MAX_TEETH_KEYS = ['t16','t15','t14','t13','t12','t11','t21','t22','t23','t24','t25','t26'];
const MAX_TEETH_LABELS = ['16','15','14','13','12','11','21','22','23','24','25','26'];
const MAND_TEETH_KEYS = ['t46','t45','t44','t43','t42','t41','t31','t32','t33','t34','t35','t36'];
const MAND_TEETH_LABELS = ['46','45','44','43','42','41','31','32','33','34','35','36'];

export default function MoulageTab() {
  const patient = useStore(state => state.patient);
  const sexe = patient.sexe || 'M';
  const activeSessionId = patient.activeSessionId;
  const activeSession = patient.sessions.find(s => s.id === activeSessionId) || patient.sessions[0] || {} as any;
  const updateSessionField = useStore(state => state.updateSessionField);

  const n = (k: string) => {
    const valStr = (activeSession as any)[k];
    if (!valStr && valStr !== 0) return 0;
    const val = parseFloat((valStr + '').replace(',', '.'));
    return isNaN(val) ? 0 : val;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    updateSessionField(activeSessionId, e.target.name, e.target.type === 'checkbox' ? e.target.checked : e.target.value);
  };

  const incMax = [n('t12'),n('t11'),n('t21'),n('t22')];
  const incMand = [n('t42'),n('t41'),n('t31'),n('t32')];
  const sixs = [n('t16'),n('t26'),n('t36'),n('t46')];
  const pmCan = [n('t15'),n('t14'),n('t13'),n('t23'),n('t24'),n('t25'),n('t45'),n('t44'),n('t43'),n('t33'),n('t34'),n('t35')];
  const hasInc = [...incMax,...incMand].some(v => v > 0);
  const has6 = sixs.some(v => v > 0);
  const hasPMCan = pmCan.some(v => v > 0);
  const allFilled = MAX_TEETH_KEYS.every(k => n(k) > 0) && MAND_TEETH_KEYS.every(k => n(k) > 0);

  let stade = 'Non déterminé';
  let stadeColor = '#94a3b8';
  if (allFilled) { stade = 'Denture permanente'; stadeColor = '#3b82f6'; }
  else if (hasInc || has6 || hasPMCan) { stade = 'Mesures en cours'; stadeColor = '#64748b'; }
  else { stade = 'Aucune mesure'; stadeColor = '#94a3b8'; }

  const isMixte = !!activeSession.isDroschlActive;

  const sumIncMand = n('t42') + n('t41') + n('t31') + n('t32');
  const getDroschl = (arch: 'max'|'mand'): number => {
    if (sumIncMand <= 0) return 0;
    const key = arch === 'max' ? (sexe === 'F' ? 'maxF' : 'maxM') : (sexe === 'F' ? 'mandF' : 'mandM');
    if (sumIncMand <= DROSCHL_TABLE[0].sum) return DROSCHL_TABLE[0][key];
    if (sumIncMand >= DROSCHL_TABLE[DROSCHL_TABLE.length-1].sum) return DROSCHL_TABLE[DROSCHL_TABLE.length-1][key];
    for (let i = 0; i < DROSCHL_TABLE.length - 1; i++) {
      if (sumIncMand >= DROSCHL_TABLE[i].sum && sumIncMand <= DROSCHL_TABLE[i+1].sum) {
        const t = (sumIncMand - DROSCHL_TABLE[i].sum) / (DROSCHL_TABLE[i+1].sum - DROSCHL_TABLE[i].sum);
        return Math.round((DROSCHL_TABLE[i][key] + t * (DROSCHL_TABLE[i+1][key] - DROSCHL_TABLE[i][key])) * 10) / 10;
      }
    }
    return 0;
  };

  const necSup1513 = isMixte ? getDroschl('max') : n('t15')+n('t14')+n('t13');
  const necSup1211 = n('t12')+n('t11');
  const necSup2122 = n('t21')+n('t22');
  const necSup2325 = isMixte ? getDroschl('max') : n('t23')+n('t24')+n('t25');
  const necInf4543 = isMixte ? getDroschl('mand') : n('t45')+n('t44')+n('t43');
  const necInf4241 = n('t42')+n('t41');
  const necInf3132 = n('t31')+n('t32');
  const necInf3335 = isMixte ? getDroschl('mand') : n('t33')+n('t34')+n('t35');

  const dS1 = activeSession.dispSup1513; const dS2 = activeSession.dispSup1211; const dS3 = activeSession.dispSup2122; const dS4 = activeSession.dispSup2325;
  const dI1 = activeSession.dispInf4543; const dI2 = activeSession.dispInf4241; const dI3 = activeSession.dispInf3132; const dI4 = activeSession.dispInf3335;

  const calcBilan = (dispo: string | undefined, nec: number, reqFilled: boolean): number | null => {
    if (dispo === undefined || dispo === '') return null;
    if (reqFilled && nec > 0) return Math.round((parseFloat(dispo) - nec) * 10) / 10;
    return null;
  };

  const reqSup1513 = isMixte ? getDroschl('max') > 0 : (n('t15') > 0 && n('t14') > 0 && n('t13') > 0);
  const reqSup1211 = n('t12') > 0 && n('t11') > 0;
  const reqSup2122 = n('t21') > 0 && n('t22') > 0;
  const reqSup2325 = isMixte ? getDroschl('max') > 0 : (n('t23') > 0 && n('t24') > 0 && n('t25') > 0);
  
  const reqInf4543 = isMixte ? getDroschl('mand') > 0 : (n('t45') > 0 && n('t44') > 0 && n('t43') > 0);
  const reqInf4241 = n('t42') > 0 && n('t41') > 0;
  const reqInf3132 = n('t31') > 0 && n('t32') > 0;
  const reqInf3335 = isMixte ? getDroschl('mand') > 0 : (n('t33') > 0 && n('t34') > 0 && n('t35') > 0);

  const bilanSupD = calcBilan(dS1, necSup1513, reqSup1513);
  const bilanSupAD = calcBilan(dS2, necSup1211, reqSup1211);
  const bilanSupAG = calcBilan(dS3, necSup2122, reqSup2122);
  const bilanSupG = calcBilan(dS4, necSup2325, reqSup2325);
  
  const bilanInfD = calcBilan(dI1, necInf4543, reqInf4543);
  const bilanInfAD = calcBilan(dI2, necInf4241, reqInf4241);
  const bilanInfAG = calcBilan(dI3, necInf3132, reqInf3132);
  const bilanInfG = calcBilan(dI4, necInf3335, reqInf3335);

  const totalSup = (bilanSupD !== null && bilanSupAD !== null && bilanSupAG !== null && bilanSupG !== null) ? Math.round((bilanSupD+bilanSupAD+bilanSupAG+bilanSupG)*10)/10 : null;
  const totalInf = (bilanInfD !== null && bilanInfAD !== null && bilanInfAG !== null && bilanInfG !== null) ? Math.round((bilanInfD+bilanInfAD+bilanInfAG+bilanInfG)*10)/10 : null;

  const dSupTot = totalSup !== null ? Math.round((parseFloat(dS1||'0')+parseFloat(dS2||'0')+parseFloat(dS3||'0')+parseFloat(dS4||'0'))*10)/10 : undefined;
  const necSupTot = totalSup !== null ? Math.round((necSup1513+necSup1211+necSup2122+necSup2325)*10)/10 : undefined;
  const dInfTot = totalInf !== null ? Math.round((parseFloat(dI1||'0')+parseFloat(dI2||'0')+parseFloat(dI3||'0')+parseFloat(dI4||'0'))*10)/10 : undefined;
  const necInfTot = totalInf !== null ? Math.round((necInf4543+necInf4241+necInf3132+necInf3335)*10)/10 : undefined;

  const sumMax6 = n('t13')+n('t12')+n('t11')+n('t21')+n('t22')+n('t23');
  const sumMand6 = n('t43')+n('t42')+n('t41')+n('t31')+n('t32')+n('t33');
  const sumMax12 = MAX_TEETH_KEYS.reduce((s,k) => s+n(k), 0);
  const sumMand12 = MAND_TEETH_KEYS.reduce((s,k) => s+n(k), 0);
  const ratio6 = sumMax6 > 0 ? sumMand6/sumMax6 : 0;
  const ratio12 = sumMax12 > 0 ? sumMand12/sumMax12 : 0;
  const bolton6Pct = Math.round(ratio6 * 1000) / 10;
  const bolton12Pct = Math.round(ratio12 * 1000) / 10;
  const bolton6Excess = ratio6 > 0.772 ? Math.round((sumMand6 - sumMax6*0.772)*10)/10 : Math.round((sumMax6 - sumMand6/0.772)*10)/10;
  const bolton12Excess = ratio12 > 0.913 ? Math.round((sumMand12 - sumMax12*0.913)*10)/10 : Math.round((sumMax12 - sumMand12/0.913)*10)/10;

  const BilanVal = ({v, d, nec}:{v:number|null, d?:string|number, nec?:number}) => {
    if (v === null) return <span style={{color:'#94a3b8'}}>—</span>;
    const color = v < 0 ? '#dc2626' : '#1e40af';
    return (
      <div style={{display:'flex', flexDirection:'column', alignItems:'center', lineHeight:1.2}}>
        <span style={{fontWeight:700, color}}>{v > 0 ? '+' : ''}{v} mm</span>
        {d !== undefined && nec !== undefined && (
          <span style={{fontSize:'0.65rem', color:'#94a3b8', marginTop:'2px', fontWeight:500}}>({d} - {nec})</span>
        )}
      </div>
    );
  };

  const renderTeethInput = (name: string, label: string, ti: number) => (
    <div key={name} style={{display:'flex',flexDirection:'column',alignItems:'center',gap:'2px',flex:1,minWidth:0}}>
      <span style={{fontSize:'0.65rem',color:'#64748b',fontWeight:600}}>{label}</span>
      <input type="text" inputMode="decimal" name={name} value={(activeSession as any)[name]||''} onChange={handleChange} tabIndex={ti}
        className={`inline-metric-input ${!(activeSession as any)[name] ? 'field-empty' : ''}`}
        style={{width:'100%',padding:'0.25rem',fontSize:'0.8rem',textAlign:'center',borderRadius:'4px',color:'#0f172a',background:'#fff',boxShadow:'inset 0 1px 2px rgba(0,0,0,0.05)'}}
      />
    </div>
  );

  const DeltaVal = ({v}:{v:number|null}) => {
    if (v === null) return <span style={{color:'#94a3b8'}}>—</span>;
    const color = v < 0 ? '#dc2626' : '#1e40af';
    return <span style={{fontWeight:700, color}}>{v} mm</span>;
  };

  return (
    <div className="module-content">
      <div className="module-header" style={{ marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
        <h2 style={{ margin: 0 }}>4. Analyse Moulage</h2>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <span style={{ fontSize: '0.75rem', padding: '0.2rem 0.6rem', borderRadius: '12px', fontWeight: 700, color: '#fff', background: stadeColor }}>{stade}</span>
          {isMixte && <span style={{ fontSize: '0.7rem', color: '#f59e0b', fontWeight: 600 }}>Droschl actif ({sexe === 'F' ? 'Femme' : 'Homme'})</span>}
        </div>
      </div>

      <div className="flex-row" style={{ marginBottom: 'var(--sp-2)' }}>
        <Select label="Arcade Sup." name="formeArcadeSup" options={["Ovoïde", "Triangulaire", "Carrée"]} ti={390} />
        <Select label="Arcade Inf." name="formeArcadeInf" options={["Ovoïde", "Triangulaire", "Carrée"]} ti={391} />
      </div>

      <div className="card" style={{ marginBottom: '1rem', padding: '1rem' }}>
        <div className="card-header">
          <h3>Dimensions mésio-distales</h3>
          <span className={`completion-badge ${allFilled ? 'complete' : ''}`}>{MAX_TEETH_KEYS.filter(k=>n(k)>0).length + MAND_TEETH_KEYS.filter(k=>n(k)>0).length}/24</span>
        </div>
        <div style={{marginBottom:'0.75rem'}}>
          <div style={{display:'flex', gap:'4px', flexWrap:'nowrap'}}>
            {MAX_TEETH_KEYS.slice(0,6).map((k,i) => renderTeethInput(k, MAX_TEETH_LABELS[i], 400+i))}
            <div style={{width:'1px',background:'#cbd5e1',flexShrink:0,minHeight:'40px'}}></div>
            {MAX_TEETH_KEYS.slice(6).map((k,i) => renderTeethInput(k, MAX_TEETH_LABELS[6+i], 406+i))}
          </div>
        </div>
        <div>
          <div style={{display:'flex', gap:'4px', flexWrap:'nowrap'}}>
            {MAND_TEETH_KEYS.slice(0,6).map((k,i) => renderTeethInput(k, MAND_TEETH_LABELS[i], 420+i))}
            <div style={{width:'1px',background:'#cbd5e1',flexShrink:0,minHeight:'40px'}}></div>
            {MAND_TEETH_KEYS.slice(6).map((k,i) => renderTeethInput(k, MAND_TEETH_LABELS[6+i], 426+i))}
          </div>
        </div>
      </div>

      <div className="card" style={{ marginBottom: '1rem', padding: '1rem' }}>
        <div className="card-header">
          <h3>Espace Disponible</h3>
          <span className={`completion-badge ${['dispSup1513','dispSup1211','dispSup2122','dispSup2325','dispInf4543','dispInf4241','dispInf3132','dispInf3335'].every(k=>n(k)>0) ? 'complete' : ''}`}>{['dispSup1513','dispSup1211','dispSup2122','dispSup2325','dispInf4543','dispInf4241','dispInf3132','dispInf3335'].filter(k=>n(k)>0).length}/8</span>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: '0.5rem' }}>
          <Input label="15-13" name="dispSup1513" />
          <Input label="12-11" name="dispSup1211" />
          <Input label="21-22" name="dispSup2122" />
          <Input label="23-25" name="dispSup2325" />
          <Input label="45-43" name="dispInf4543" />
          <Input label="42-41" name="dispInf4241" />
          <Input label="31-32" name="dispInf3132" />
          <Input label="33-35" name="dispInf3335" />
        </div>
      </div>

      <div className="card" style={{ marginBottom: '1rem', padding: '1rem' }}>
        <div className="card-header">
          <h3>Bilan de Place</h3>
          {isMixte && <span style={{fontSize:'0.7rem', color:'#f59e0b', fontWeight:600}}>Droschl appliqué aux secteurs C+PM</span>}
        </div>
        <table style={{width:'100%', borderCollapse:'collapse', fontSize:'0.85rem', textAlign:'center'}}>
          <thead>
            <tr style={{background:'#f1f5f9', borderBottom:'1px solid #e2e8f0'}}>
              <th style={{padding:'0.4rem', textAlign:'left', fontWeight:600}}>Arcade</th>
              <th style={{padding:'0.4rem'}} colSpan={4}>Secteurs</th>
              <th style={{padding:'0.4rem', fontWeight:700, borderLeft:'2px solid #cbd5e1'}}>Total</th>
            </tr>
          </thead>
          <tbody>
            <tr style={{background:'#f8fafc'}}>
              <td></td>
              <td style={{padding:'0.25rem', fontSize:'0.7rem', fontWeight:600, color:'#64748b'}}>15-13</td>
              <td style={{padding:'0.25rem', fontSize:'0.7rem', fontWeight:600, color:'#64748b'}}>12-11</td>
              <td style={{padding:'0.25rem', fontSize:'0.7rem', fontWeight:600, color:'#64748b'}}>21-22</td>
              <td style={{padding:'0.25rem', fontSize:'0.7rem', fontWeight:600, color:'#64748b'}}>23-25</td>
              <td style={{borderLeft:'2px solid #cbd5e1'}}></td>
            </tr>
            <tr style={{borderBottom:'1px solid #e2e8f0'}}>
              <td style={{padding:'0.4rem', textAlign:'left', fontWeight:600, color:'#1e40af'}}>Sup.</td>
              <td><BilanVal v={bilanSupD} d={dS1} nec={Math.round(necSup1513*10)/10}/></td>
              <td><BilanVal v={bilanSupAD} d={dS2} nec={Math.round(necSup1211*10)/10}/></td>
              <td><BilanVal v={bilanSupAG} d={dS3} nec={Math.round(necSup2122*10)/10}/></td>
              <td><BilanVal v={bilanSupG} d={dS4} nec={Math.round(necSup2325*10)/10}/></td>
              <td style={{borderLeft:'2px solid #cbd5e1', fontWeight:700, background:'#f8fafc'}}><BilanVal v={totalSup} d={dSupTot} nec={necSupTot}/></td>
            </tr>
            <tr style={{background:'#f8fafc'}}>
              <td></td>
              <td style={{padding:'0.25rem', fontSize:'0.7rem', fontWeight:600, color:'#64748b'}}>45-43</td>
              <td style={{padding:'0.25rem', fontSize:'0.7rem', fontWeight:600, color:'#64748b'}}>42-41</td>
              <td style={{padding:'0.25rem', fontSize:'0.7rem', fontWeight:600, color:'#64748b'}}>31-32</td>
              <td style={{padding:'0.25rem', fontSize:'0.7rem', fontWeight:600, color:'#64748b'}}>33-35</td>
              <td style={{borderLeft:'2px solid #cbd5e1'}}></td>
            </tr>
            <tr>
              <td style={{padding:'0.4rem', textAlign:'left', fontWeight:600, color:'#1e40af'}}>Inf.</td>
              <td><BilanVal v={bilanInfD} d={dI1} nec={Math.round(necInf4543*10)/10}/></td>
              <td><BilanVal v={bilanInfAD} d={dI2} nec={Math.round(necInf4241*10)/10}/></td>
              <td><BilanVal v={bilanInfAG} d={dI3} nec={Math.round(necInf3132*10)/10}/></td>
              <td><BilanVal v={bilanInfG} d={dI4} nec={Math.round(necInf3335*10)/10}/></td>
              <td style={{borderLeft:'2px solid #cbd5e1', fontWeight:700, background:'#f8fafc'}}><BilanVal v={totalInf} d={dInfTot} nec={necInfTot}/></td>
            </tr>
          </tbody>
        </table>
      </div>

      <div className="card" style={{ marginBottom: '1rem', padding: '1rem' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1fr) minmax(0,1fr)', gap: '2rem' }}>
          <div>
            <div className="card-header"><h3 style={{fontSize:'1rem'}}>Index de Bolton</h3></div>
            <table style={{width:'100%', borderCollapse:'collapse', fontSize:'0.85rem'}}>
              <thead>
                <tr style={{borderBottom:'1px solid #e2e8f0'}}>
                   <th style={{textAlign:'left', padding:'0.3rem'}}>Analyses</th>
                   <th style={{padding:'0.3rem'}}>Ratio</th>
                   <th style={{padding:'0.3rem'}}>Excès</th>
                </tr>
              </thead>
              <tbody>
                <tr style={{borderBottom:'1px solid #f8fafc'}}>
                  <td style={{padding:'0.3rem', fontWeight:600}}>Antérieur (12)</td>
                  <td style={{padding:'0.3rem', textAlign:'center', color: hasInc ? '#0f172a' : '#94a3b8'}}>{hasInc ? `${bolton6Pct}%` : '—'}</td>
                  <td style={{padding:'0.3rem', textAlign:'center'}}>
                    {hasInc && bolton6Excess > 0 ? (
                      <span style={{color: ratio6 > 0.772 ? '#dc2626' : '#1e40af', fontWeight:600}}>
                        {ratio6 > 0.772 ? 'Mand. ' : 'Max. '}+{bolton6Excess}mm
                      </span>
                    ) : (hasInc ? <span style={{color:'#10b981', fontWeight:600}}>Harmonieux</span> : <span style={{color:'#94a3b8'}}>—</span>)}
                  </td>
                </tr>
                <tr>
                  <td style={{padding:'0.3rem', fontWeight:600}}>Total (24)</td>
                  <td style={{padding:'0.3rem', textAlign:'center', color: allFilled ? '#0f172a' : '#94a3b8'}}>{allFilled ? `${bolton12Pct}%` : '—'}</td>
                  <td style={{padding:'0.3rem', textAlign:'center'}}>
                     {allFilled && bolton12Excess > 0 ? (
                      <span style={{color: ratio12 > 0.913 ? '#dc2626' : '#1e40af', fontWeight:600}}>
                        {ratio12 > 0.913 ? 'Mand. ' : 'Max. '}+{bolton12Excess}mm
                      </span>
                    ) : (allFilled ? <span style={{color:'#10b981', fontWeight:600}}>Harmonieux</span> : <span style={{color:'#94a3b8'}}>—</span>)}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          <div style={{borderLeft:'1px solid var(--border-color)', paddingLeft:'2rem'}}>
            <div className="card-header" style={{marginBottom:'0.5rem'}}>
              <h3 style={{fontSize:'1rem'}}>Droschl</h3>
              <label style={{ display:'flex', alignItems:'center', gap:'0.4rem', cursor:'pointer', fontSize:'0.75rem', fontWeight:600, color:'#0f172a' }}>
                <input type="checkbox" name="isDroschlActive" checked={!!activeSession.isDroschlActive} onChange={handleChange} style={{ accentColor:'#f59e0b', width:'14px', height:'14px' }} />
                Activer
              </label>
            </div>
            {!isMixte && <div style={{fontSize:'0.7rem',color:'#64748b',marginBottom:'0.5rem'}}>Cochez pour prédire l'espace C+PM</div>}
            <div style={{fontSize:'0.82rem'}}>
              <div style={{marginBottom:'0.5rem'}}>
                <span style={{fontWeight:600}}>Incisives inf. (32-42) : </span>
                <span style={{fontWeight:700, color: sumIncMand > 0 ? '#0f172a' : '#94a3b8'}}>{sumIncMand > 0 ? `${sumIncMand} mm` : '—'}</span>
              </div>
              {isMixte && sumIncMand > 0 && (
                <table style={{width:'100%', borderCollapse:'collapse'}}>
                  <thead>
                    <tr style={{borderBottom:'1px solid #e2e8f0'}}>
                      <th style={{textAlign:'left', padding:'0.3rem'}}>Prédiction</th>
                      <th style={{padding:'0.3rem'}}>Max (C+PM)</th>
                      <th style={{padding:'0.3rem'}}>Mand (C+PM)</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td style={{padding:'0.3rem', fontWeight:600}}>{sexe === 'F' ? 'Fille' : 'Garçon'}</td>
                      <td style={{padding:'0.3rem', textAlign:'center', fontWeight:700, color:'#1e40af'}}>{getDroschl('max')} mm</td>
                      <td style={{padding:'0.3rem', textAlign:'center', fontWeight:700, color:'#1e40af'}}>{getDroschl('mand')} mm</td>
                    </tr>
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="card" style={{ marginBottom: '1rem', padding: '1rem' }}>
        <div className="card-header">
          <h3>Distances</h3>
          <span className={`completion-badge ${['distInterMolSup','distInterMolInf','distPMSup','distPMInf','distCanSup','distCanInf'].every(k=>n(k)>0) ? 'complete' : ''}`}>{['distInterMolSup','distInterMolInf','distPMSup','distPMInf','distCanSup','distCanInf'].filter(k=>n(k)>0).length}/6</span>
        </div>
        <table style={{width:'100%', borderCollapse:'collapse', fontSize:'0.85rem', textAlign:'center'}}>
          <thead>
            <tr style={{background:'#f1f5f9', borderBottom:'1px solid #e2e8f0'}}>
              <th style={{padding:'0.4rem', textAlign:'left', fontWeight:600}}>Mesure</th>
              <th style={{padding:'0.4rem'}}>Sup</th>
              <th style={{padding:'0.4rem'}}>Inf</th>
              <th style={{padding:'0.4rem', fontWeight:700, borderLeft:'2px solid #cbd5e1'}}>Différence</th>
            </tr>
          </thead>
          <tbody>
            <tr style={{borderBottom:'1px solid #f1f5f9'}}>
              <td style={{padding:'0.4rem', textAlign:'left', fontWeight:600, color:'#1e40af'}}>Dist. Mol.</td>
              <td style={{padding:'0.3rem'}}><Input name="distInterMolSup" ph="" /></td>
              <td style={{padding:'0.3rem'}}><Input name="distInterMolInf" ph="" /></td>
              <td style={{padding:'0.3rem', borderLeft:'2px solid #cbd5e1'}}>
                <DeltaVal v={n('distInterMolSup') > 0 && n('distInterMolInf') > 0 ? Math.round((n('distInterMolSup') - n('distInterMolInf'))*10)/10 : null} />
              </td>
            </tr>
            <tr style={{borderBottom:'1px solid #f1f5f9'}}>
              <td style={{padding:'0.4rem', textAlign:'left', fontWeight:600, color:'#1e40af'}}>Dist. PM.</td>
              <td style={{padding:'0.3rem'}}><Input name="distPMSup" ph="" /></td>
              <td style={{padding:'0.3rem'}}><Input name="distPMInf" ph="" /></td>
              <td style={{padding:'0.3rem', borderLeft:'2px solid #cbd5e1'}}>
                <DeltaVal v={n('distPMSup') > 0 && n('distPMInf') > 0 ? Math.round((n('distPMSup') - n('distPMInf'))*10)/10 : null} />
              </td>
            </tr>
            <tr>
              <td style={{padding:'0.4rem', textAlign:'left', fontWeight:600, color:'#1e40af'}}>Dist. Can.</td>
              <td style={{padding:'0.3rem'}}><Input name="distCanSup" ph="" /></td>
              <td style={{padding:'0.3rem'}}><Input name="distCanInf" ph="" /></td>
              <td style={{padding:'0.3rem', borderLeft:'2px solid #cbd5e1'}}>
                <DeltaVal v={n('distCanSup') > 0 && n('distCanInf') > 0 ? Math.round((n('distCanSup') - n('distCanInf'))*10)/10 : null} />
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
