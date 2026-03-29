
import { useStore } from '../../store/useStore';
import { Input, Select, Checkbox, ConditionToggle } from '../ui/Forms';

export default function InfoTab() {
  const patient = useStore(state => state.patient);
  const settings = useStore(state => state.settings);

  let ageCalcule = "";
  if (patient.dateNaissance) {
    const from = new Date(patient.dateNaissance);
    const to = patient.datePremiereConsult ? new Date(patient.datePremiereConsult) : new Date();
    if (!isNaN(from.getTime()) && !isNaN(to.getTime())) {
      let m = (to.getFullYear() - from.getFullYear()) * 12 + (to.getMonth() - from.getMonth());
      if (to.getDate() < from.getDate()) m--;
      const yStr = Math.floor(m / 12) > 0 ? `${Math.floor(m / 12)}a ` : "";
      ageCalcule = `${yStr}${m % 12}m`;
    }
  }

  const identityFields = ['nom', 'prenom', 'sexe', 'dateNaissance'];
  const identityDone = identityFields.filter(f => !!(patient as any)[f]).length;
  const adminFields = ['avs', 'medecinTraitant'];
  const adminDone = adminFields.filter(f => !!(patient as any)[f]).length;

  return (
    <div className="module-content tab-info">
      <div className="module-header mh-info"><h2>1. Informations</h2></div>

      <div className="card">
        <div className="card-header">
          <h3>Identité & Acteurs</h3>
          <span className={`completion-badge ${identityDone === identityFields.length ? 'complete' : ''}`}>{identityDone}/{identityFields.length}</span>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '0.7fr 1.2fr 1.2fr 1fr 0.5fr', gap: 'var(--sp-2)' }}>
          <Input label="ID" name="id" />
          <Input label="Nom" name="nom" />
          <Input label="Prénom" name="prenom" />
          <Select label="Praticien" name="praticien" options={settings.praticiens.map(p => p.abrev)} />
          <Select label="Sexe" name="sexe" options={["M", "F"]} />
        </div>
        <div className="grid-3" style={{ marginTop: 'var(--sp-2)' }}>
          <Input label="Date Naiss." name="dateNaissance" type="date" />
          <Input label="Date 1ère Consult." name="datePremiereConsult" type="date" />
          <Input label="Âge (Calculé)" name="age" overrideValue={ageCalcule} readOnly={true} />
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <h3>Administratif & Correspondants</h3>
          <span className={`completion-badge ${adminDone === adminFields.length ? 'complete' : ''}`}>{adminDone}/{adminFields.length}</span>
        </div>
        <div className="grid-2">
          <Input label="Numéro AVS" name="avs" />
          <Input label="Assurance Complémentaire" name="compOrtho" />
        </div>
        <div className="grid-2" style={{ marginTop: 'var(--sp-2)' }}>
          <Input label="Médecin Traitant" name="medecinTraitant" ph="Ex: Dr. Martin (Généraliste)" />
          <Select label="Médecin Dentiste" name="medecinDentaire" options={settings.doctors.map(d => `${d.nom} ${d.prenom}`)} />
        </div>
      </div>

      <div className="card">
        <div className="card-header"><h3>Anamnèse & Plaintes</h3></div>
        <Input label="Motif de Consultation (Plainte principale)" name="motifConsultation" />

        <div className="grid-2" style={{ marginTop: 'var(--sp-3)', gap: 'var(--sp-6)' }}>
          <div>
            <h4 className="section-title">Santé Générale</h4>
            <div className="grid-2 gap-1">
              <ConditionToggle label="Diabète" fieldName="diabete" />
              <ConditionToggle label="Hypertension" fieldName="hypertension" />
              <ConditionToggle label="Allergies" fieldName="allergies" />
              <ConditionToggle label="Cardiovasculaire" fieldName="cardio" />
              <ConditionToggle label="Respiratoire" fieldName="respi" />
            </div>
            <div style={{ marginTop: 'var(--sp-2)', display: 'flex', flexDirection: 'column', gap: 'var(--sp-2)' }}>
              <div>
                <Checkbox label="Chirurgies" name="hasChirurgies" />
                {patient.hasChirurgies && <input type="text" name="chirurgiesAnterieures" value={patient.chirurgiesAnterieures || ''} onChange={e => useStore.getState().updatePatientField('chirurgiesAnterieures', e.target.value)} placeholder="Ex: amygdalectomie, appendicite..." className="detail-fade" style={{ display: 'block', width: '100%', marginTop: '4px', padding: '3px 8px', fontSize: 'var(--fs-value)', border: '1px solid #cbd5e1', borderRadius: 'var(--radius)' }} />}
              </div>
              <div>
                <Checkbox label="Traitements Actuels" name="hasTraitements" />
                {patient.hasTraitements && <input type="text" name="traitementsCours" value={patient.traitementsCours || ''} onChange={e => useStore.getState().updatePatientField('traitementsCours', e.target.value)} placeholder="Ex: anticoagulants, antibiotiques..." className="detail-fade" style={{ display: 'block', width: '100%', marginTop: '4px', padding: '3px 8px', fontSize: 'var(--fs-value)', border: '1px solid #cbd5e1', borderRadius: 'var(--radius)' }} />}
              </div>
              <div>
                <Checkbox label="Autre (Médical)" name="hasAutreGen" />
                {patient.hasAutreGen && <input type="text" name="autreGen" value={patient.autreGen || ''} onChange={e => useStore.getState().updatePatientField('autreGen', e.target.value)} placeholder="Précisez..." className="detail-fade" style={{ display: 'block', width: '100%', marginTop: '4px', padding: '3px 8px', fontSize: 'var(--fs-value)', border: '1px solid #cbd5e1', borderRadius: 'var(--radius)' }} />}
              </div>
            </div>
          </div>

          <div>
            <h4 className="section-title">Santé Dentaire</h4>
            <div className="grid-2 gap-1">
              <Checkbox label="Sensibilité" name="sensibilite" />
              <Checkbox label="Succion (Lolette)" name="mauvaisesHabitudes.succionPouce" />
              <Checkbox label="Bruxisme" name="mauvaisesHabitudes.bruxisme" />
            </div>
            <div style={{ marginTop: 'var(--sp-2)', display: 'flex', flexDirection: 'column', gap: 'var(--sp-2)' }}>
              <div>
                <Checkbox label="Extractions" name="antecFamExtract" />
                {patient.antecFamExtract && <input type="text" name="extractionDetails" value={patient.extractionDetails || ''} onChange={e => useStore.getState().updatePatientField('extractionDetails', e.target.value)} placeholder="Ex: 14, 24, 34, 44..." className="detail-fade" style={{ display: 'block', width: '100%', marginTop: '4px', padding: '3px 8px', fontSize: 'var(--fs-value)', border: '1px solid #cbd5e1', borderRadius: 'var(--radius)' }} />}
              </div>
              <div>
                <Checkbox label="Historique Orthodontique" name="hasOrthoPasse" />
                {patient.hasOrthoPasse && <input type="text" name="traitementsOrthoPasses" value={patient.traitementsOrthoPasses || ''} onChange={e => useStore.getState().updatePatientField('traitementsOrthoPasses', e.target.value)} placeholder="Ex: bague 2 ans, appareil amovible..." className="detail-fade" style={{ display: 'block', width: '100%', marginTop: '4px', padding: '3px 8px', fontSize: 'var(--fs-value)', border: '1px solid #cbd5e1', borderRadius: 'var(--radius)' }} />}
              </div>
              <div>
                <Checkbox label="Autre (Dentaire)" name="hasAutreDent" />
                {patient.hasAutreDent && <input type="text" name="autreDent" value={patient.autreDent || ''} onChange={e => useStore.getState().updatePatientField('autreDent', e.target.value)} placeholder="Précisez..." className="detail-fade" style={{ display: 'block', width: '100%', marginTop: '4px', padding: '3px 8px', fontSize: 'var(--fs-value)', border: '1px solid #cbd5e1', borderRadius: 'var(--radius)' }} />}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
