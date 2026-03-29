
import { useStore } from '../../store/useStore';

const GLOBAL_KEYS = [
  'id','nom','prenom','pratique','sexe','dateNaissance','datePremiereConsult','age','avs','compOrtho','caisseMaladie','numGarantie','adresse','npaLocalite','telephone','email','representantLegal','medecinTraitant','medecinDentaire','autreInfo',
  'motifConsultation','praticien','dention','implant','implantDent','maladiesChroniques','maladiesChroniquesDetails','hasChirurgies','chirurgiesAnterieures',
  'hasTraitements','traitementsCours','allergiesMedic','hasAutreGen','autreGen','antecFamExtract','carieRecurrente','sensibilite','hasOrthoPasse','traitementsOrthoPasses',
  'hasAutreDent','autreDent','autreAntecDent','mauvaisesHabitudes','documents','extractionDetails',
  'hasFente','hasMacroglossie','hasSAOS','hasTroublesDeglutitionGrave','hasAsymetrieGrave','has17d'
];

const focusNext = (current: HTMLElement) => {
  const form = current.closest('.module-content, .card, main') || document;
  const focusable = Array.from(form.querySelectorAll<HTMLElement>(
    'input:not([type="hidden"]):not([type="file"]):not([readonly]), select, textarea, button:not([tabindex="-1"])'
  )).filter(el => !el.hasAttribute('disabled') && el.offsetParent !== null);
  const idx = focusable.indexOf(current);
  if (idx >= 0 && idx < focusable.length - 1) focusable[idx + 1].focus();
};

export const handleEnterKey = (e: React.KeyboardEvent<HTMLElement>) => {
  if (e.key === 'Enter') { e.preventDefault(); focusNext(e.currentTarget); }
};

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
    if (isGlobal) updatePatientField(name, value);
    else updateSessionField(activeSessionId, name, value);
  };

  const onValueChange = (value: any) => {
    if (isGlobal) updatePatientField(name, value);
    else updateSessionField(activeSessionId, name, value);
  };

  return { val, onChange, onValueChange };
};


export const Input = ({ label, name, type = 'text', ph = '', refObj = null, overrideValue, readOnly = false, ti }: any) => {
  const { val, onChange } = useFieldMapping(name);
  const displayVal = overrideValue !== undefined ? overrideValue : val;

  return (
    <div className="form-group" style={{ width: '100%' }}>
      {label && <label>{label}</label>}
      <input
        type={type}
        name={name}
        value={displayVal || ''}
        onChange={onChange}
        onKeyDown={handleEnterKey}
        placeholder={ph}
        ref={refObj}
        readOnly={readOnly}
        tabIndex={ti}
        className={!displayVal && !readOnly ? 'field-empty' : ''}
        style={readOnly ? { backgroundColor: 'var(--c-bg)', color: 'var(--c-text-muted)', cursor: 'not-allowed' } : undefined}
      />
    </div>
  );
};

export const Select = ({ label, name, options, normValue, refObj = null, ti }: any) => {
  const { val, onChange } = useFieldMapping(name);
  return (
    <div className="form-group">
      {label && <label>{label} {normValue && <span style={{ color: 'var(--c-text-muted)', fontStyle: 'italic', fontWeight: 400 }}>{normValue}</span>}</label>}
      <select name={name} value={val || ''} onChange={onChange} onKeyDown={handleEnterKey} ref={refObj} tabIndex={ti} className={!val ? 'field-empty' : ''}>
        <option value="">-</option>
        {options.map((o: string) => <option key={o} value={o}>{o}</option>)}
      </select>
    </div>
  );
};

export const Checkbox = ({ label, name, ti }: any) => {
  const { val, onChange } = useFieldMapping(name);
  return (
    <label style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', cursor: 'pointer', whiteSpace: 'nowrap', fontWeight: 500, color: 'var(--c-text)', fontSize: 'var(--fs-value)' }}>
      <input type="checkbox" name={name} checked={!!val} onChange={onChange} onKeyDown={handleEnterKey} tabIndex={ti} style={{ width: 'auto', margin: 0, transform: 'scale(1.1)' }} /> {label}
    </label>
  );
};

export const ConditionToggle = ({ label, fieldName }: { label: string, fieldName: string }) => {
  const checkName = `maladiesChroniques.${fieldName}`;
  const detailName = `maladiesChroniquesDetails.${fieldName}`;
  const { val: isChecked } = useFieldMapping(checkName);
  const { val: details, onChange: onDetailChange } = useFieldMapping(detailName);

  return (
    <div style={{ marginBottom: '2px' }}>
      <Checkbox label={label} name={checkName} />
      {isChecked && (
        <div style={{ paddingLeft: 'var(--sp-4)', marginTop: '2px' }}>
          <input type="text" name={detailName} value={details || ''} onChange={onDetailChange} onKeyDown={handleEnterKey}
            placeholder={`Détail : ${label}...`}
            style={{ width: '100%', padding: '2px var(--sp-2)', fontSize: 'var(--fs-small)', border: '1px solid var(--c-border)', borderRadius: 'var(--radius)' }}
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
    <div className="flex-row gap-2" style={{ marginBottom: '2px', flexWrap: 'wrap' }}>
      <Checkbox label={label} name={stateField} ti={ti} />
      {isChecked && (
        <input type="text" name={detailField} value={detailVal || ''} onChange={onDetailChange} onKeyDown={handleEnterKey}
          tabIndex={ti ? ti + 1 : undefined}
          placeholder="Précisez..."
          className="detail-fade"
          style={{ width: '130px', padding: '2px var(--sp-2)', fontSize: 'var(--fs-value)', border: '1px solid #cbd5e1', borderRadius: 'var(--radius)' }}
        />
      )}
    </div>
  );
};

export const InlineMetric = ({ label, name, maxLength = 3, ti }: any) => {
  const { val, onChange } = useFieldMapping(name);
  return (
    <div className="flex-row gap-1" style={{ marginRight: 'var(--sp-2)' }}>
      {label && <label style={{ margin: 0, fontWeight: 600, fontSize: 'var(--fs-value)', whiteSpace: 'nowrap' }}>{label}</label>}
      <input type="text" name={name} value={val || ''} onChange={onChange} onKeyDown={handleEnterKey}
        maxLength={maxLength} tabIndex={ti}
        className={`inline-metric-input ${!val ? 'field-empty' : ''}`}
      />
    </div>
  );
};

export const TwoWayCheck = ({ label, name, options, detailOption, detailName, ti }: any) => {
  const { val, onValueChange } = useFieldMapping(name);
  const { val: detailVal, onChange: onDetailChange } = useFieldMapping(detailName || 'nothing');

  return (
    <div className="form-group">
      {label && <label>{label}</label>}
      <div className={`twoway-group ${val ? 'field-done' : 'field-pending'}`} style={{ display: 'flex', gap: 'var(--sp-3)', alignItems: 'center', flexWrap: 'wrap' }}>
        {options.map((opt: string, i: number) => (
          <div key={opt} className="flex-row gap-1">
            <label style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', cursor: 'pointer', fontSize: 'var(--fs-value)', color: 'var(--c-text)', fontWeight: 500, margin: 0 }}>
              <input type="checkbox" checked={val === opt} tabIndex={ti ? ti + i : undefined} onChange={(e) => onValueChange(e.target.checked ? opt : '')} style={{ margin: 0, transform: 'scale(1.1)' }} />
              {opt}
            </label>
            {val === detailOption && opt === detailOption && detailName && (
              <input type="text" name={detailName} value={detailVal || ''} onChange={onDetailChange} onKeyDown={handleEnterKey}
                tabIndex={ti ? ti + 2 : undefined} placeholder="Précisez..."
                className="detail-fade"
                style={{ width: '120px', padding: '2px var(--sp-2)', fontSize: 'var(--fs-value)', border: '1px solid #cbd5e1', borderRadius: 'var(--radius)' }}
              />
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
    <div style={{ display: 'grid', gridTemplateColumns: '100px 60px 1fr', alignItems: 'center', gap: 'var(--sp-2)' }}>
      <span style={{ fontWeight: 500, fontSize: 'var(--fs-value)', textAlign: 'right' }}>{label}</span>
      <input
        type="text" inputMode="decimal" name={name} value={val || ''} onChange={onChange} onKeyDown={handleEnterKey}
        placeholder="-"
        className={`${!val ? 'field-empty' : ''} ${isError ? 'ceph-value-error' : ''}`}
        style={{ width: '100%', padding: '2px var(--sp-2)', fontSize: 'var(--fs-value)', textAlign: 'center', border: '1px solid var(--c-border)', borderRadius: 'var(--radius)', color: isError ? 'var(--c-alert)' : 'var(--c-text)', fontWeight: isError ? 700 : 500 }}
      />
      <span style={{ color: 'var(--c-text-muted)', fontSize: 'var(--fs-small)' }}>({normStr})</span>
    </div>
  );
};

export const OpgToggle = ({ label, rasField, detailField }: { label: string, rasField: string, detailField: string }) => {
  const { val: isRAS, onChange: onRasChange } = useFieldMapping(rasField);
  const { val: details, onChange: onDetailChange } = useFieldMapping(detailField);

  return (
    <div className="flex-row" style={{ marginBottom: 'var(--sp-1)', width: '100%', flexWrap: 'wrap' }}>
      <div style={{ width: '90px', fontWeight: 600, fontSize: 'var(--fs-value)' }}>{label}</div>
      <label style={{ display: 'flex', alignItems: 'center', gap: '5px', cursor: 'pointer', fontSize: 'var(--fs-value)', fontWeight: 500, color: 'var(--c-text-secondary)', minWidth: '50px' }}>
        <input type="checkbox" name={rasField} checked={!!isRAS} onChange={onRasChange} style={{ transform: 'scale(1.1)', margin: 0 }} /> RAS
      </label>
      {!isRAS && (
        <input type="text" name={detailField} value={details || ''} onChange={onDetailChange} onKeyDown={handleEnterKey}
          placeholder="Précisez..."
          className="detail-fade"
          style={{ flex: 1, minWidth: '120px', padding: '2px var(--sp-2)', fontSize: 'var(--fs-value)', border: '1px solid #cbd5e1', borderRadius: 'var(--radius)' }}
        />
      )}
    </div>
  );
};
