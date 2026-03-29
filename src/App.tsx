import { useEffect, useRef, useState, useCallback } from 'react';
import { useStore } from './store/useStore';
import InfoTab from './components/tabs/InfoTab';
import DocumentationTab from './components/tabs/DocumentationTab';
import ClinicalTab from './components/tabs/ClinicalTab';
import MoulageTab from './components/tabs/MoulageTab';
import CephaloTab from './components/tabs/CephaloTab';
import TraitementTab from './components/tabs/TraitementTab';
import OverviewTab from './components/tabs/OverviewTab';
import SettingsTab from './components/tabs/SettingsTab';
import SessionSelector from './components/tabs/SessionSelector';
import PatientHub from './components/views/PatientHub';
import { fileSystem } from './services/FileSystemService';

type SaveStatus = 'saved' | 'saving' | 'idle';

function useCompletionBadges(patient: ReturnType<typeof useStore>['patient']) {
  const s = patient.sessions.find(s => s.id === patient.activeSessionId) || patient.sessions[0];
  if (!s) return { info: '0', docs: '0', clin: '0', moul: '0', radio: '0' };

  const countFilled = (fields: string[], obj: any) => fields.filter(f => !!obj[f]).length;

  const infoFields = ['nom', 'prenom', 'sexe', 'dateNaissance', 'avs', 'medecinTraitant'];
  const infoTotal = infoFields.length;
  const infoDone = countFilled(infoFields, patient);

  const clinFields = ['face','symetrieVisage','profil','angleNasolabial','angleLabiomental','troisQuarts','gummySmile','symetrieSourire','competenceLabiale','expoIncisives','overjet','classeCanineD','classeCanineG','classeMolaireD','classeMolaireG','overbite','cdsD','cdsG','lm','hygieneClin','phenotype'];
  const clinTotal = clinFields.length;
  const clinDone = countFilled(clinFields, s);

  const moulFields = ['t16','t15','t14','t13','t12','t11','t21','t22','t23','t24','t25','t26','t46','t45','t44','t43','t42','t41','t31','t32','t33','t34','t35','t36'];
  const moulTotal = moulFields.length;
  const moulDone = countFilled(moulFields, s);

  const radioFields = ['sna','snb','anb','wits','snSpaspp','spasppMego','snMego','incisifSn','incisifSpaspp','incisifMego','incisifIncisif','stadeMaturation'];
  const radioTotal = radioFields.length;
  const radioDone = countFilled(radioFields, s);

  const docsArrays = ['photosExtra','photosIntra','modelesStl','cephaloImages','opgImages','radioIntraImages'] as const;
  const docsCount = docsArrays.reduce((sum, k) => sum + ((s as any)[k]?.length || 0), 0);

  const traitFields = ['planTraitement1','planTraitement2','planTraitement3','planTraitement4','planTraitement5'];
  const traitDone = countFilled(traitFields, s);
  const traitTotal = traitFields.length;

  const fmt = (done: number, total: number) => done === 0 ? '0' : done === total ? 'ok' : `${done}`;

  return {
    info: fmt(infoDone, infoTotal),
    docs: docsCount > 0 ? `${docsCount}` : '0',
    clin: fmt(clinDone, clinTotal),
    moul: fmt(moulDone, moulTotal),
    radio: fmt(radioDone, radioTotal),
    trait: traitDone > 0 ? 'ok' : '0',
  };
}

export default function App() {
  const activeTab = useStore(state => state.activeTab);
  const setActiveTab = useStore(state => state.setActiveTab);
  const patient = useStore(state => state.patient);
  const isHubConnected = useStore(state => state.isHubConnected);
  const patientDirectory = useStore(state => state.patientDirectory);
  const setPatientDirectory = useStore(state => state.setPatientDirectory);
  const lastSavedRef = useRef<string>('');
  const [saveStatus, setSaveStatus] = useState<SaveStatus>('idle');

  const badges = useCompletionBadges(patient);

  // Global completion score
  const completionScore = (() => {
    const s = patient.sessions.find(s => s.id === patient.activeSessionId) || patient.sessions[0];
    if (!s) return 0;
    const countFilled = (fields: string[], obj: any) => fields.filter(f => !!obj[f]).length;
    const infoFields = ['nom', 'prenom', 'sexe', 'dateNaissance', 'avs', 'medecinTraitant'];
    const clinFields = ['face','symetrieVisage','profil','angleNasolabial','angleLabiomental','troisQuarts','gummySmile','symetrieSourire','competenceLabiale','expoIncisives','overjet','classeCanineD','classeCanineG','classeMolaireD','classeMolaireG','overbite','cdsD','cdsG','lm','hygieneClin','phenotype'];
    const moulFields = ['t16','t15','t14','t13','t12','t11','t21','t22','t23','t24','t25','t26','t46','t45','t44','t43','t42','t41','t31','t32','t33','t34','t35','t36'];
    const radioFields = ['sna','snb','anb','wits','snSpaspp','spasppMego','snMego','incisifSn','incisifSpaspp','incisifMego','incisifIncisif','stadeMaturation'];
    const traitFields = ['planTraitement1','planTraitement2','planTraitement3','planTraitement4','planTraitement5'];
    const total = infoFields.length + clinFields.length + moulFields.length + radioFields.length + traitFields.length;
    const done = countFilled(infoFields, patient) + countFilled(clinFields, s) + countFilled(moulFields, s) + countFilled(radioFields, s) + countFilled(traitFields, s);
    return Math.round((done / total) * 100);
  })();

  const forceSave = useCallback(() => {
    if (!isHubConnected || !patientDirectory) return;
    setSaveStatus('saving');
    fileSystem.savePatientData(patientDirectory, patient)
      .then(() => { lastSavedRef.current = JSON.stringify(patient); setSaveStatus('saved'); })
      .catch(() => setSaveStatus('idle'));
  }, [isHubConnected, patientDirectory, patient]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey) {
        switch (e.key) {
          case '1': e.preventDefault(); setActiveTab('info'); break;
          case '2': e.preventDefault(); setActiveTab('documents'); break;
          case '3': e.preventDefault(); setActiveTab('clinique'); break;
          case '4': e.preventDefault(); setActiveTab('moulages'); break;
          case '5': e.preventDefault(); setActiveTab('cepha'); break;
          case '6': e.preventDefault(); setActiveTab('traitement'); break;
          case 's': e.preventDefault(); forceSave(); break;
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [setActiveTab, forceSave]);

  // Auto-save with dirty check
  useEffect(() => {
    if (isHubConnected && patientDirectory && patient) {
      const serialized = JSON.stringify(patient);
      if (serialized === lastSavedRef.current) return;
      setSaveStatus('saving');
      const timeout = setTimeout(() => {
        fileSystem.savePatientData(patientDirectory, patient)
          .then(() => { lastSavedRef.current = serialized; setSaveStatus('saved'); })
          .catch(() => setSaveStatus('idle'));
      }, 1000);
      return () => clearTimeout(timeout);
    }
  }, [patient, isHubConnected, patientDirectory]);

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

  if (!isHubConnected || !patientDirectory) {
    return <PatientHub />;
  }

  const badgeClass = (val: string) => val === 'ok' ? 'nav-badge done' : val === '0' ? 'nav-badge' : 'nav-badge partial';

  const tabs = [
    { id: 'info', label: '1. Informations', key: '1', badge: badges.info },
    { id: 'documents', label: '2. Documents', key: '2', badge: badges.docs },
    { id: 'clinique', label: '3. Clinique', key: '3', badge: badges.clin },
    { id: 'moulages', label: '4. Moulage', key: '4', badge: badges.moul },
    { id: 'cepha', label: '5. Radio', key: '5', badge: badges.radio },
    { id: 'traitement', label: '6. Traitement', key: '6', badge: badges.trait },
  ];

  return (
    <div className="app-container">
      <aside className="sidebar no-print">
        <div className="sidebar-header">
          <h1 className="sidebar-brand">OrthoDiag</h1>
          <button className="btn-back" onClick={() => { setPatientDirectory(null); setActiveTab('overview'); }}>
            ← Changer de Dossier
          </button>
        </div>

        <div
          className="sidebar-patient-card"
          onClick={() => setActiveTab('overview')}
          title="Vue Globale"
        >
          <p className="sidebar-patient-name">{patient.nom || 'Patient'} {patient.prenom}</p>
          <p className="sidebar-patient-meta">
            {patient.sexe || '-'} | {ageCalcule || '-'} | {patient.id}
          </p>
        </div>

        <div style={{ padding: '0 var(--sp-3)', marginBottom: 'var(--sp-1)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2px' }}>
            <span style={{ fontSize: 'var(--fs-badge)', fontWeight: 600, color: 'var(--c-text-secondary)' }}>Complétion</span>
            <span style={{ fontSize: 'var(--fs-badge)', fontWeight: 700, color: completionScore === 100 ? 'var(--c-filled)' : completionScore > 50 ? 'var(--c-primary)' : 'var(--c-text-muted)' }}>{completionScore}%</span>
          </div>
          <div style={{ height: '4px', background: 'var(--c-border)', borderRadius: '2px', overflow: 'hidden' }}>
            <div style={{ height: '100%', width: `${completionScore}%`, background: completionScore === 100 ? 'var(--c-filled)' : 'var(--c-primary)', borderRadius: '2px', transition: 'width 0.3s' }} />
          </div>
        </div>

        <div className="save-indicator">
          <span className={`save-dot ${saveStatus === 'saving' ? 'saving' : ''}`} />
          {saveStatus === 'saving' ? 'Sauvegarde...' : saveStatus === 'saved' ? 'Sauvegardé' : 'Auto-save'}
          <span style={{ marginLeft: 'auto', opacity: 0.5 }}>Ctrl+S</span>
        </div>

        <nav className="sidebar-nav">
          {tabs.map(tab => (
            <button
              key={tab.id}
              tabIndex={-1}
              className={`nav-item ${activeTab === tab.id ? 'active' : ''}`}
              onClick={() => setActiveTab(tab.id)}
            >
              <span className="nav-label">{tab.label}</span>
              <span className={badgeClass(tab.badge)}>{tab.badge === 'ok' ? '✓' : tab.badge}</span>
              <span className="nav-shortcut">{tab.key}</span>
            </button>
          ))}

          <div style={{ flex: 1 }} />

          <button
            tabIndex={-1}
            className={`nav-item ${activeTab === 'settings' ? 'active' : ''}`}
            onClick={() => setActiveTab('settings')}
            style={{ border: '1px solid var(--c-border)', justifyContent: 'center' }}
          >
            Réglages
          </button>
        </nav>
      </aside>

      <main className="main-content">
        <div className="module-container" style={{ maxWidth: '1100px' }}>
          {activeTab !== 'settings' && (
            <div className="session-bar no-print">
              <SessionSelector />
              {(activeTab === 'moulages' || activeTab === 'cepha') && (
                <label className="btn btn-outline" style={{ cursor: 'pointer' }}>
                  <input type="file" accept=".xlsx,.xls,.csv" style={{ display: 'none' }} onChange={(e) => {
                    if (e.target.files?.[0]) {
                      alert(`Fichier détecté : ${e.target.files[0].name}\n\nImport prévu Phase 4.`);
                      e.target.value = '';
                    }
                  }} />
                  Importer Excel / CSV
                </label>
              )}
            </div>
          )}

          {activeTab === 'overview' && <OverviewTab />}
          {activeTab === 'info' && <InfoTab />}
          {activeTab === 'documents' && <DocumentationTab />}
          {activeTab === 'clinique' && <ClinicalTab />}
          {activeTab === 'moulages' && <MoulageTab />}
          {activeTab === 'cepha' && <CephaloTab />}
          {activeTab === 'traitement' && <TraitementTab />}
          {activeTab === 'settings' && <SettingsTab />}
        </div>
      </main>
    </div>
  );
}
