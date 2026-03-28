import { useEffect } from 'react';
import { useStore } from './store/useStore';
import InfoTab from './components/tabs/InfoTab';
import DocumentationTab from './components/tabs/DocumentationTab';
import ClinicalTab from './components/tabs/ClinicalTab';
import MoulageTab from './components/tabs/MoulageTab';
import CephaloTab from './components/tabs/CephaloTab';
import OverviewTab from './components/tabs/OverviewTab';
import SettingsTab from './components/tabs/SettingsTab';
import SessionSelector from './components/tabs/SessionSelector';
import PatientHub from './components/views/PatientHub';
import { fileSystem } from './services/FileSystemService';

export default function App() {
  const activeTab = useStore(state => state.activeTab);
  const setActiveTab = useStore(state => state.setActiveTab);
  const patient = useStore(state => state.patient);
  const isHubConnected = useStore(state => state.isHubConnected);
  const patientDirectory = useStore(state => state.patientDirectory);
  const setPatientDirectory = useStore(state => state.setPatientDirectory);

  // Keyboard shortcut listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Shortcuts without Ctrl on Mac
      if (e.ctrlKey || e.metaKey) {
        switch (e.key) {
          case '1': e.preventDefault(); setActiveTab('overview'); break; // Mapped to overview logic (cascading)
          case '2': e.preventDefault(); setActiveTab('documents'); break;
          case '3': e.preventDefault(); setActiveTab('clinique'); break;
          case '4': e.preventDefault(); setActiveTab('moulages'); break;
          case '5': e.preventDefault(); setActiveTab('cepha'); break;
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [setActiveTab]);

  // Auto-save vers le FileSystem quand le patient change
  useEffect(() => {
    if (isHubConnected && patientDirectory && patient) {
      const timeout = setTimeout(() => {
        fileSystem.savePatientData(patientDirectory, patient).catch(console.error);
      }, 1000); // Debounce de 1s
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

  // Si on utilise l'API Fichier, obliger la connexion au hub
  if (!isHubConnected || !patientDirectory) {
    return <PatientHub />;
  }

  return (
    <div className="app-container">
      <aside className="sidebar no-print">
        <div className="sidebar-header" style={{padding: '1.5rem 1rem'}}>
          <h1 style={{fontSize:'1.1rem', margin:0, color:'var(--primary-color)'}}>OrthoDiag</h1>
          <button 
            onClick={() => { setPatientDirectory(null); setActiveTab('overview'); }} 
            style={{ width: '100%', padding: '0.4rem', fontSize: '0.8rem', marginTop: '1rem', background: '#f1f5f9', color: '#475569', border: '1px solid #cbd5e1', borderRadius: '4px', cursor: 'pointer', fontWeight: 600 }}
          >
            ← Changer de Dossier
          </button>
        </div>
        <div style={{ padding: '0 1rem', marginTop: '1rem' }}>
          <div 
            onClick={() => setActiveTab('overview')}
            title="Vue Globale de la Session"
            style={{ padding: '0.75rem', backgroundColor: '#f1f5f9', borderRadius: '4px', borderLeft: '3px solid var(--primary-color)', cursor: 'pointer', transition: 'background-color 0.2s' }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#e2e8f0'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#f1f5f9'}
          >
            <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--text-muted)' }}>Mise à jour VDDS : Auto</p>
            <p style={{ margin: '2px 0', fontSize: '0.9rem', color: 'var(--text-main)', fontWeight: 700 }}>{patient.nom || 'Patient'} {patient.prenom}</p>
            <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--text-muted)' }}>Sexe: {patient.sexe||'-'} | Âge: {ageCalcule||'-'}</p>
          </div>
        </div>
        
        <nav className="sidebar-nav">
          <button tabIndex={-1} className={`nav-item ${activeTab === 'info' ? 'active' : ''}`} onClick={() => setActiveTab('info')} style={{display:'flex', justifyContent:'space-between', alignItems:'center'}}>
            <span>1. Informations</span>
            <span style={{fontSize:'0.65rem', opacity:0.5}}>Ctrl+1</span>
          </button>
          <button tabIndex={-1} className={`nav-item ${activeTab === 'documents' ? 'active' : ''}`} onClick={() => setActiveTab('documents')} style={{display:'flex', justifyContent:'space-between', alignItems:'center'}}>
            <span>2. Doc. Clinique</span>
            <span style={{fontSize:'0.65rem', opacity:0.5}}>Ctrl+2</span>
          </button>
          <button tabIndex={-1} className={`nav-item ${activeTab === 'clinique' ? 'active' : ''}`} onClick={() => setActiveTab('clinique')} style={{display:'flex', justifyContent:'space-between', alignItems:'center'}}>
            <span>3. Analyse Clinique</span>
            <span style={{fontSize:'0.65rem', opacity:0.5}}>Ctrl+3</span>
          </button>
          <button tabIndex={-1} className={`nav-item ${activeTab === 'moulages' ? 'active' : ''}`} onClick={() => setActiveTab('moulages')} style={{display:'flex', justifyContent:'space-between', alignItems:'center'}}>
            <span>4. Analyse Moulage</span>
            <span style={{fontSize:'0.65rem', opacity:0.5}}>Ctrl+4</span>
          </button>
          <button tabIndex={-1} className={`nav-item ${activeTab === 'cepha' ? 'active' : ''}`} onClick={() => setActiveTab('cepha')} style={{display:'flex', justifyContent:'space-between', alignItems:'center'}}>
            <span>5. Analyse Radio.</span>
            <span style={{fontSize:'0.65rem', opacity:0.5}}>Ctrl+5</span>
          </button>
          
          <div style={{ flex: 1 }}></div>
          
          <button tabIndex={-1} className={`nav-item ${activeTab === 'settings' ? 'active' : ''}`} onClick={() => setActiveTab('settings')} style={{marginBottom: '0.5rem', fontSize: '0.9rem', border: '1px solid var(--border-color)', justifyContent: 'center'}}>
            Réglages Serveur
          </button>
        </nav>
      </aside>

      <main className="main-content">
        <div className="module-container" style={{maxWidth: '1200px'}}>

          {/* En-tête global pour les actions de session (sauf pour Réglage) */}
          {activeTab !== 'settings' && (
            <div className="no-print" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', background: '#f8fafc', padding: '0.75rem', borderRadius: '4px', border: '1px solid #e2e8f0' }}>
               <SessionSelector />
               
               {(activeTab === 'moulages' || activeTab === 'cepha') && (
                 <label className="btn" style={{padding:'0.5rem 1rem', fontSize:'0.85rem', background:'#e2e8f0', color:'#0f172a', border:'1px solid #cbd5e1', cursor:'pointer', fontWeight:600}}>
                    <input type="file" accept=".xlsx,.xls,.csv" style={{display:'none'}} onChange={(e) => {
                      if (e.target.files && e.target.files.length > 0) {
                        alert(`Fichier détecté : ${e.target.files[0].name}\n\nFonction Import Automatique prévue pour la Phase 4 !`);
                        e.target.value = ''; 
                      }
                    }}/>
                    Importer Excel / CSV
                 </label>
               )}
            </div>
          )}

          {/* Rendu dynamique des onglets */}
          {activeTab === 'overview' && <OverviewTab />}
          {activeTab === 'info' && <InfoTab />}
          {activeTab === 'documents' && <DocumentationTab />}
          {activeTab === 'clinique' && <ClinicalTab />}
          {activeTab === 'moulages' && <MoulageTab />}
          {activeTab === 'cepha' && <CephaloTab />}
          
          {activeTab === 'settings' && <SettingsTab />}

        </div>
      </main>
    </div>
  );
}
