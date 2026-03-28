
import { useStore } from '../../store/useStore';

const GLOBAL_KEYS = [
  'id','nom','prenom','pratique','sexe','dateNaissance','datePremiereConsult','age','avs','compOrtho','medecinTraitant','medecinDentaire','autreInfo',
  'motifConsultation','praticien','dention','implant','implantDent','maladiesChroniques','maladiesChroniquesDetails','hasChirurgies','chirurgiesAnterieures',
  'hasTraitements','traitementsCours','allergiesMedic','hasAutreGen','autreGen','antecFamExtract','carieRecurrente','sensibilite','hasOrthoPasse','traitementsOrthoPasses',
  'hasAutreDent','autreDent','autreAntecDent','mauvaisesHabitudes','documents'
];

export const useFieldMapping = (name: string) => {
  const isGlobal = GLOBAL_KEYS.includes(name) || GLOBAL_KEYS.includes(name.split('.')[0]);
  const patient = useStore(state => state.patient);
  const activeSessionId = patient.activeSessionId;
  const activeSession = patient.sessions.find(s => s.id === activeSessionId) || patient.sessions[0] || {} as any;
  const updatePatientField = useStore(state => state.updatePatientField);
  const updateSessionField = useStore(state => state.updateSessionField);

  let val: any = '';
  if (isGlobal) {
    if (name.includes('.')) {
      const [p, c] = name.split('.');
      val = (patient as any)[p]?.[c];
    } else {
      val = (patient as any)[name];
    }
  } else {
    val = (activeSession as any)[name];
  }

  const onChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const value = e.target.type === 'checkbox' ? (e.target as HTMLInputElement).checked : e.target.value;
    if (isGlobal) {
      updatePatientField(name, value);
    } else {
      updateSessionField(activeSessionId, name, value);
    }
  };

  const onValueChange = (value: any) => {
    if (isGlobal) {
      updatePatientField(name, value);
    } else {
      updateSessionField(activeSessionId, name, value);
    }
  };

  return { val, onChange, onValueChange };
};


export const Input = ({ label, name, type = 'text', ph = '', refObj = null, overrideValue, readOnly=false, ti }: any) => {
  const { val, onChange } = useFieldMapping(name);
  const displayVal = overrideValue !== undefined ? overrideValue : val;
  
  return (
    <div className="form-group" style={{width: '100%', margin: label ? '0 0 0.5rem 0' : '0' }}>
      {label && <label>{label}</label>}
      <input 
        type={type} 
        name={name} 
        value={displayVal || ''} 
        onChange={onChange} 
        placeholder={ph} 
        ref={refObj} 
        readOnly={readOnly}
        tabIndex={ti}
        className={!displayVal && !readOnly ? 'field-empty' : ''}
        style={readOnly ? { backgroundColor: '#f1f5f9', color: '#64748b', cursor: 'not-allowed' } : undefined}
      />
    </div>
  );
};

export const Select = ({ label, name, options, normValue, refObj=null, ti }: any) => {
  const { val, onChange } = useFieldMapping(name);
  return (
    <div className="form-group" style={{margin: label ? '0 0 0.5rem 0' : '0'}}>
      {label && <label>{label} {normValue && <span style={{color: '#94a3b8', fontStyle: 'italic', fontWeight: 400, marginLeft: '4px'}}>{normValue}</span>}</label>}
      <select name={name} value={val || ''} onChange={onChange} ref={refObj} tabIndex={ti} className={!val ? 'field-empty' : ''}>
        <option value="">-</option>
        {options.map((o:string) => <option key={o} value={o}>{o}</option>)}
      </select>
    </div>
  );
};

export const Checkbox = ({ label, name, ti }: any) => {
  const { val, onChange } = useFieldMapping(name);
  return (
    <label style={{display:'inline-flex', alignItems:'center', gap:'6px', cursor:'pointer', whiteSpace: 'nowrap', fontWeight:500, color:'#0f172a', fontSize:'0.9rem'}}>
      <input type="checkbox" name={name} checked={!!val} onChange={onChange} tabIndex={ti} style={{width:'auto', margin:0, transform: 'scale(1.1)'}}/> {label}
    </label>
  );
};

export const ConditionToggle = ({ label, fieldName }: { label: string, fieldName: string }) => {
  const checkName = `maladiesChroniques.${fieldName}`;
  const detailName = `maladiesChroniquesDetails.${fieldName}`;
  const { val: isChecked } = useFieldMapping(checkName);
  const { val: details, onChange: onDetailChange } = useFieldMapping(detailName);
  
  return (
    <div style={{marginBottom: '0.25rem'}}>
      <Checkbox label={label} name={checkName} />
      {isChecked && (
        <div style={{marginTop: '0.1rem', paddingLeft: '1.25rem', marginBottom: '0.25rem'}}>
          <input 
             type="text" 
             name={detailName} 
             value={details || ''} 
             onChange={onDetailChange} 
             placeholder={`Détail : ${label}...`} 
             style={{width: '100%', padding:'0.25rem 0.5rem', fontSize:'0.8rem', border:'1px solid var(--border-color)', borderRadius:'3px'}} 
          />
        </div>
      )}
    </div>
  );
};

export const ClinicalToggle = ({ label, stateField, detailField, ti }: { label: string, stateField: string, detailField: string, ti?: number }) => {
  const { val: isChecked } = useFieldMapping(stateField);
  const { val: detailVal, onChange: onDetailChange } = useFieldMapping(detailField);
  
  return (
    <div style={{ display: 'flex', alignItems: 'center', marginBottom: '0.25rem', gap: '0.5rem', flexWrap: 'wrap' }}>
      <Checkbox label={label} name={stateField} ti={ti} />
      {isChecked && (
        <input 
             type="text" 
             name={detailField} 
             value={detailVal || ''} 
             onChange={onDetailChange} 
             tabIndex={ti ? ti + 1 : undefined}
             placeholder="Précisez..." 
             className="detail-fade"
             style={{width: '140px', padding:'0.2rem 0.4rem', fontSize:'0.85rem', border:'1px solid #cbd5e1', borderRadius:'4px', backgroundColor: '#fff'}} 
        />
      )}
    </div>
  );
};

export const InlineMetric = ({ label, name, maxLength = 3, ti }: any) => {
  const { val, onChange } = useFieldMapping(name);
  return (
    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', marginRight: '1rem', marginBottom: '0.5rem' }}>
      {label && <label style={{ margin: 0, fontWeight: 600 }}>{label}</label>}
      <input 
        type="text" 
        name={name} 
        value={val || ''} 
        onChange={onChange} 
        maxLength={maxLength}
        tabIndex={ti}
        className={`inline-metric-input ${!val ? 'field-empty' : ''}`}
        style={{ width: '50px', padding: '0.3rem', fontSize: '0.9rem', textAlign: 'center', borderRadius: '4px', color: '#0f172a', background: '#ffffff', boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.05)' }} 
      />
    </div>
  );
};

export const TwoWayCheck = ({ label, name, options, detailOption, detailName, ti }: any) => {
  const { val, onValueChange } = useFieldMapping(name);
  const { val: detailVal, onChange: onDetailChange } = useFieldMapping(detailName || 'nothing');
  
  return (
    <div className="form-group" style={{ margin: label ? '0 0 0.5rem 0' : '0' }}>
      {label && <label>{label}</label>}
      <div className={`twoway-group ${val ? 'field-done' : 'field-pending'}`} style={{ display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
        {options.map((opt: string, i: number) => (
          <div key={opt} style={{ display: 'flex', alignItems: 'center' }}>
            <label style={{display:'inline-flex', alignItems:'center', gap:'6px', cursor:'pointer', fontSize:'0.9rem', color: '#0f172a', fontWeight: 500, margin: 0}}>
              <input type="checkbox" checked={val === opt} tabIndex={ti ? ti + i : undefined} onChange={(e) => onValueChange(e.target.checked ? opt : '')} style={{margin:0, transform: 'scale(1.1)'}} /> 
              {opt}
            </label>
            {val === detailOption && opt === detailOption && detailName && (
              <input type="text" name={detailName} value={detailVal||''} onChange={onDetailChange} tabIndex={ti ? ti + 2 : undefined} placeholder="Précisez..." className="detail-fade" style={{marginLeft: '0.5rem', width: '130px', padding:'0.2rem 0.4rem', fontSize:'0.85rem', border:'1px solid #cbd5e1', borderRadius:'4px'}} />
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export const CephInput = ({ label, name, normStr, ideal, dev }: { label: string, name: string, normStr: string, ideal: number, dev: number }) => {
  const { val, onChange } = useFieldMapping(name);
  const valNum = parseFloat((val || '').replace(',', '.'));
  const isError = !isNaN(valNum) && (valNum < ideal - dev || valNum > ideal + dev);
  
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'minmax(150px, 1fr) 100px', alignItems: 'center', gap: '1rem', justifyItems: 'end' }}>
      <div style={{ textAlign: 'right', display: 'flex', justifyContent: 'flex-end', alignItems: 'baseline', gap: '0.3rem' }}>
        <span style={{ color: '#0f172a', fontWeight: 500, fontSize: '0.85rem' }}>{label}</span>
        <span style={{ color: '#64748b', fontSize: '0.75rem', fontWeight: 400 }}>({normStr})</span>
      </div>
      <input 
        type="text" inputMode="decimal"
        name={name}
        value={val || ''}
        onChange={onChange}
        placeholder="-"
        style={{
          width: '100%', padding: '0.3rem 0.5rem', fontSize: '0.9rem', textAlign: 'center',
          border: '1px solid var(--border-color)', borderRadius: '4px',
          color: isError ? '#dc2626' : 'var(--text-main)',
          fontWeight: isError ? 700 : 500,
          background: '#fff',
          boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.05)'
        }}
        className={!val ? 'field-empty' : ''}
      />
    </div>
  );
};

export const OpgToggle = ({ label, rasField, detailField }: { label: string, rasField: string, detailField: string }) => {
  const { val: isRAS, onChange: onRasChange } = useFieldMapping(rasField);
  const { val: details, onChange: onDetailChange } = useFieldMapping(detailField);
  
  return (
    <div style={{ display: 'flex', alignItems: 'center', marginBottom: '0.5rem', gap: '1rem', width: '100%', flexWrap: 'wrap' }}>
      <div style={{ width: '100px', fontWeight: 600, color: '#0f172a', fontSize: '0.9rem' }}>{label}</div>
      <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 500, color: '#475569', minWidth: '60px' }}>
        <input type="checkbox" name={rasField} checked={!!isRAS} onChange={onRasChange} style={{ transform: 'scale(1.1)', margin: 0 }} /> RAS
      </label>
      {!isRAS && (
        <input 
             type="text" 
             name={detailField} 
             value={details || ''} 
             onChange={onDetailChange} 
             placeholder="Précisez..." 
             className="detail-fade"
             style={{flex: 1, minWidth: '140px', padding:'0.2rem 0.4rem', fontSize:'0.85rem', border:'1px solid #cbd5e1', borderRadius:'4px', backgroundColor: '#fff'}} 
        />
      )}
    </div>
  );
};
