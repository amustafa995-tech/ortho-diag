
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
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 'var(--sp-2)' }}>
          <Input label="Numéro AVS" name="avs" />
          <Input label="Caisse Maladie (LAMal)" name="caisseMaladie" ph="Ex: CSS, Helsana..." />
          <Input label="Assurance Complémentaire" name="compOrtho" />
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 'var(--sp-2)', marginTop: 'var(--sp-2)' }}>
          <Input label="Adresse" name="adresse" ph="Rue et n°" />
          <Input label="NPA / Localité" name="npaLocalite" ph="1000 Lausanne" />
          <Input label="N° Garantie / Police" name="numGarantie" />
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 'var(--sp-2)', marginTop: 'var(--sp-2)' }}>
          <Input label="Téléphone" name="telephone" ph="+41 79..." />
          <Input label="E-mail" name="email" ph="patient@mail.ch" />
          <Input label="Représentant légal" name="representantLegal" ph="Si mineur" />
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 'var(--sp-2)', marginTop: 'var(--sp-2)' }}>
          <Input label="Médecin Traitant" name="medecinTraitant" ph="Dr. Martin (Généraliste)" />
          <Select label="Médecin Dentiste" name="medecinDentaire" options={settings.doctors.map(d => `${d.nom} ${d.prenom}`)} />
          <Input label="Autre Correspondant" name="autreInfo" ph="ORL, Logopédiste..." />
        </div>
      </div>

      <div className="card">
        <div className="card-header"><h3>Anamnèse & Plaintes</h3></div>
        <Input label="Motif de Consultation (Plainte principale)" name="motifConsultation" />

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--sp-3)', marginTop: 'var(--sp-2)' }}>
          <div>
            <h4 className="section-title">Santé Générale</h4>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2px var(--sp-3)' }}>
              <ConditionToggle label="Diabète" fieldName="diabete" />
              <ConditionToggle label="Hypertension" fieldName="hypertension" />
              <ConditionToggle label="Allergies" fieldName="allergies" />
              <ConditionToggle label="Cardiovasculaire" fieldName="cardio" />
              <ConditionToggle label="Respiratoire" fieldName="respi" />
            </div>
            <div style={{ marginTop: 'var(--sp-2)', borderTop: '1px solid var(--c-border)', paddingTop: 'var(--sp-1)', display: 'flex', flexDirection: 'column', gap: '3px' }}>
              <div className="flex-row gap-2 flex-wrap">
                <Checkbox label="Chirurgies" name="hasChirurgies" />
                <Checkbox label="Traitements actuels" name="hasTraitements" />
                <Checkbox label="Autre" name="hasAutreGen" />
              </div>
              {patient.hasChirurgies && <input type="text" name="chirurgiesAnterieures" value={patient.chirurgiesAnterieures || ''} onChange={e => useStore.getState().updatePatientField('chirurgiesAnterieures', e.target.value)} placeholder="Chirurgies : amygdalectomie..." className="detail-fade" style={{ width: '100%', padding: '3px 8px', fontSize: 'var(--fs-value)', border: '1px solid #cbd5e1', borderRadius: 'var(--radius)' }} />}
              {patient.hasTraitements && <input type="text" name="traitementsCours" value={patient.traitementsCours || ''} onChange={e => useStore.getState().updatePatientField('traitementsCours', e.target.value)} placeholder="Traitements : anticoagulants..." className="detail-fade" style={{ width: '100%', padding: '3px 8px', fontSize: 'var(--fs-value)', border: '1px solid #cbd5e1', borderRadius: 'var(--radius)' }} />}
              {patient.hasAutreGen && <input type="text" name="autreGen" value={patient.autreGen || ''} onChange={e => useStore.getState().updatePatientField('autreGen', e.target.value)} placeholder="Autre médical..." className="detail-fade" style={{ width: '100%', padding: '3px 8px', fontSize: 'var(--fs-value)', border: '1px solid #cbd5e1', borderRadius: 'var(--radius)' }} />}
            </div>
          </div>

          <div>
            <h4 className="section-title">Santé Dentaire</h4>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2px var(--sp-3)' }}>
              <Checkbox label="Sensibilité" name="sensibilite" />
              <Checkbox label="Succion (Lolette)" name="mauvaisesHabitudes.succionPouce" />
              <Checkbox label="Bruxisme" name="mauvaisesHabitudes.bruxisme" />
            </div>
            <div style={{ marginTop: 'var(--sp-2)', borderTop: '1px solid var(--c-border)', paddingTop: 'var(--sp-1)', display: 'flex', flexDirection: 'column', gap: '3px' }}>
              <Checkbox label="Historique Orthodontique" name="hasOrthoPasse" />
              {patient.hasOrthoPasse && <input type="text" name="traitementsOrthoPasses" value={patient.traitementsOrthoPasses || ''} onChange={e => useStore.getState().updatePatientField('traitementsOrthoPasses', e.target.value)} placeholder="Ex: bague 2 ans, appareil amovible..." className="detail-fade" style={{ width: '100%', padding: '3px 8px', fontSize: 'var(--fs-value)', border: '1px solid #cbd5e1', borderRadius: 'var(--radius)' }} />}
              <Checkbox label="Autre (Dentaire)" name="hasAutreDent" />
              {patient.hasAutreDent && <input type="text" name="autreDent" value={patient.autreDent || ''} onChange={e => useStore.getState().updatePatientField('autreDent', e.target.value)} placeholder="Précisez..." className="detail-fade" style={{ width: '100%', padding: '3px 8px', fontSize: 'var(--fs-value)', border: '1px solid #cbd5e1', borderRadius: 'var(--radius)' }} />}
            </div>
          </div>
        </div>

        <div style={{ marginTop: 'var(--sp-2)', padding: 'var(--sp-2)', background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 'var(--radius)' }}>
          <span style={{ display: 'block', fontSize: 'var(--fs-badge)', fontWeight: 700, color: '#166534', marginBottom: 'var(--sp-1)' }}>Détection Assurance (AI / LaMal)</span>
          <div className="grid-3 gap-1">
            <Checkbox label="Fente labiale/palatine (201/202)" name="hasFente" />
            <Checkbox label="Macroglossie (214)" name="hasMacroglossie" />
            <Checkbox label="SAOS — Apnée du sommeil (17f)" name="hasSAOS" />
            <Checkbox label="Troubles déglutition grave (17f)" name="hasTroublesDeglutitionGrave" />
            <Checkbox label="Asymétrie faciale grave (17f)" name="hasAsymetrieGrave" />
            <Checkbox label="Dysgnathie fonctionnelle (17d)" name="has17d" />
          </div>
        </div>
      </div>
    </div>
  );
}
