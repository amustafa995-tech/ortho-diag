
import { useStore } from '../../store/useStore';
import { Input, Select, Checkbox, ConditionToggle } from '../ui/Forms';

export default function InfoTab() {
  const patient = useStore(state => state.patient);
  const settings = useStore(state => state.settings);

  // Computed values
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
    <div className="module-content">
      <div className="module-header"><h2>1. Informations</h2></div>
      
      <div className="card" style={{paddingBottom: '1rem'}}>
        <div className="card-header">
          <h3>Identité & Acteurs</h3>
          <span className={`completion-badge ${identityDone === identityFields.length ? 'complete' : ''}`}>{identityDone}/{identityFields.length}</span>
        </div>
        <div style={{display: 'grid', gridTemplateColumns: '1fr 1.5fr 1.5fr 1.5fr 0.8fr', gap: '1rem', marginBottom: '0.75rem'}}>
          <Input label="ID" name="id" />
          <Input label="Nom" name="nom" />
          <Input label="Prénom" name="prenom" />
          <Select label="Praticien" name="praticien" options={settings.praticiens.map(p => p.abrev)} />
          <Select label="Sexe" name="sexe" options={["M", "F"]} />
        </div>
        <div style={{display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem'}}>
          <Input label="Date Naiss." name="dateNaissance" type="date" />
          <Input label="Date 1ère Consult." name="datePremiereConsult" type="date" />
          <Input label="Âge (Calculé)" name="age" overrideValue={ageCalcule} readOnly={true} />
        </div>
      </div>

      <div className="card" style={{paddingBottom: '1rem'}}>
        <div className="card-header">
          <h3>Administratif & Correspondants</h3>
          <span className={`completion-badge ${adminDone === adminFields.length ? 'complete' : ''}`}>{adminDone}/{adminFields.length}</span>
        </div>
        <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '0.75rem'}}>
          <Input label="Numéro AVS" name="avs" />
          <Input label="Assurance Complémentaire" name="compOrtho" />
        </div>
        <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem'}}>
          <Input label="Médecin Traitant" name="medecinTraitant" ph="Ex: Dr. Martin (Généraliste)" />
          <Select 
            label="Médecin Dentiste" 
            name="medecinDentaire" 
            options={settings.doctors.map(d => `${d.nom} ${d.prenom}`)} 
          />
        </div>
      </div>
      
      <div className="card" style={{paddingBottom: '1rem'}}>
        <div className="card-header">
          <h3>Anamnèse & Plaintes</h3>
        </div>
        <div style={{marginBottom: '1rem'}}>
          <Input label="Motif de Consultation (Plainte principale)" name="motifConsultation" />
        </div>
        
        <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:'2rem'}}>
            <div>
              <h4 className="section-title">Santé Générale</h4>
              <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:'0.25rem'}}>
                <ConditionToggle label="Diabète" fieldName="diabete" />
                <ConditionToggle label="Hypertension" fieldName="hypertension" />
                <ConditionToggle label="Allergies" fieldName="allergies" />
                <ConditionToggle label="Cardiovasculaire" fieldName="cardio" />
                <ConditionToggle label="Respiratoire" fieldName="respi" />
              </div>
              <div style={{marginTop:'0.5rem'}}>
                  <div style={{marginBottom: '0.25rem'}}>
                    <Checkbox label="Chirurgies Antérieures" name="hasChirurgies" />
                    {patient.hasChirurgies && (
                      <div style={{marginTop: '0.1rem', paddingLeft: '1.25rem', marginBottom:'0.25rem'}}>
                        <Input name="chirurgiesAnterieures" ph="Précisez..." />
                      </div>
                    )}
                  </div>

                  <div style={{marginBottom: '0.25rem'}}>
                    <Checkbox label="Traitements Actuels" name="hasTraitements" />
                    {patient.hasTraitements && (
                      <div style={{marginTop: '0.1rem', paddingLeft: '1.25rem', marginBottom:'0.25rem'}}>
                        <Input name="traitementsCours" ph="Précisez..." />
                      </div>
                    )}
                  </div>

                  <div style={{marginBottom: '0.25rem'}}>
                    <Checkbox label="Autre (Médical)" name="hasAutreGen" />
                    {patient.hasAutreGen && (
                      <div style={{marginTop: '0.1rem', paddingLeft: '1.25rem', marginBottom:'0.25rem'}}>
                        <Input name="autreGen" ph="Précisez divers médical..." />
                      </div>
                    )}
                  </div>
              </div>
            </div>
            
            <div>
              <h4 className="section-title">Santé Dentaire</h4>
              <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:'0.25rem'}}>
                <Checkbox label="Sensibilité" name="sensibilite"/>
                <Checkbox label="Caries" name="carieRecurrente"/>
                <Checkbox label="Extractions" name="antecFamExtract"/>
                <Checkbox label="Succion (Lolette)" name="mauvaisesHabitudes.succionPouce"/>
                <Checkbox label="Bruxisme" name="mauvaisesHabitudes.bruxisme"/>
              </div>

              <div style={{marginTop:'0.5rem'}}>
                <div style={{marginBottom: '0.25rem'}}>
                  <Checkbox label="Historique Orthodontique" name="hasOrthoPasse" />
                  {patient.hasOrthoPasse && (
                    <div style={{marginTop: '0.1rem', paddingLeft: '1.25rem', marginBottom:'0.25rem'}}>
                       <Input name="traitementsOrthoPasses" ph="Précisez l'ancien traitement..." />
                    </div>
                  )}
                </div>

                <div style={{marginBottom: '0.25rem'}}>
                  <Checkbox label="Autre (Dentaire)" name="hasAutreDent" />
                  {patient.hasAutreDent && (
                    <div style={{marginTop: '0.1rem', paddingLeft: '1.25rem', marginBottom:'0.25rem'}}>
                       <Input name="autreDent" ph="Précisez divers dentaire..." />
                    </div>
                  )}
                </div>
              </div>
            </div>
        </div>
      </div>

    </div>
  );
}
