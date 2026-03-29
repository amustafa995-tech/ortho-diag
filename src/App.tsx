import { useEffect, useRef, useState, useCallback, useMemo } from 'react';
import { useStore } from './store/useStore';
import InfoTab from './components/tabs/InfoTab';
import DocumentationTab from './components/tabs/DocumentationTab';
import ClinicalTab from './components/tabs/ClinicalTab';
import MoulageTab from './components/tabs/MoulageTab';
import CephaloTab from './components/tabs/CephaloTab';
import TraitementTab from './components/tabs/TraitementTab';
import OverviewTab from './components/tabs/OverviewTab';
import SettingsTab from './components/tabs/SettingsTab';
import PriseEnChargeTab from './components/tabs/PriseEnChargeTab';
import SessionSelector from './components/tabs/SessionSelector';
import PatientHub from './components/views/PatientHub';
import { ErrorBoundary } from './components/ui/ErrorBoundary';
import { fileSystem } from './services/FileSystemService';
import { INFO_FIELDS, CLIN_FIELDS, MOUL_FIELDS, RADIO_FIELDS, TRAIT_FIELDS, countFilled } from './constants/fields';
import { calculateAge } from './utils/age';
import type { PatientRecord } from './types';

type SaveStatus = 'saved' | 'saving' | 'idle';

function useCompletionBadges(patient: PatientRecord) {
  const s = patient.sessions.find(ses => ses.id === patient.activeSessionId) || patient.sessions[0];
  if (!s) return { info: '0', docs: '0', clin: '0', moul: '0', radio: '0', trait: '0' };

  const infoDone = countFilled(INFO_FIELDS, patient);
  const clinDone = countFilled(CLIN_FIELDS, s);
  const moulDone = countFilled(MOUL_FIELDS, s);
  const radioDone = countFilled(RADIO_FIELDS, s);
  const docsCount = (patient.documents || []).length;
  const traitDone = countFilled(TRAIT_FIELDS, s);

  const fmt = (done: number, total: number) => done === 0 ? '0' : done === total ? 'ok' : `${done}`;

  return {
    info: fmt(infoDone, INFO_FIELDS.length),
    docs: docsCount > 0 ? `${docsCount}` : '0',
    clin: fmt(clinDone, CLIN_FIELDS.length),
    moul: fmt(moulDone, MOUL_FIELDS.length),
    radio: fmt(radioDone, RADIO_FIELDS.length),
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
  const completionScore = useMemo(() => {
    const ses = patient.sessions.find(x => x.id === patient.activeSessionId) || patient.sessions[0];
    if (!ses) return 0;
    const traitOk = TRAIT_FIELDS.some(f => !!(ses as any)[f]) ? 1 : 0;
    const total = INFO_FIELDS.length + CLIN_FIELDS.length + MOUL_FIELDS.length + RADIO_FIELDS.length + 1;
    const done = countFilled(INFO_FIELDS, patient) + countFilled(CLIN_FIELDS, ses) + countFilled(MOUL_FIELDS, ses) + countFilled(RADIO_FIELDS, ses) + traitOk;
    return Math.round((done / total) * 100);
  }, [patient]);

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

  // Reset lastSavedRef and revoke blob URLs when switching patients
  useEffect(() => {
    if (patientDirectory) {
      lastSavedRef.current = '';
    } else {
      fileSystem.revokeAllUrls();
    }
  }, [patientDirectory]);

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
      }, 2000);
      return () => clearTimeout(timeout);
    }
  }, [patient, isHubConnected, patientDirectory]);

  // Save before closing the page
  useEffect(() => {
    const handleBeforeUnload = () => {
      if (isHubConnected && patientDirectory) {
        fileSystem.savePatientData(patientDirectory, patient).catch(() => {});
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [isHubConnected, patientDirectory, patient]);

  const ageCalcule = calculateAge(patient.dateNaissance, patient.datePremiereConsult)?.display || '';

  if (!isHubConnected || !patientDirectory) {
    return <ErrorBoundary><PatientHub /></ErrorBoundary>;
  }

  const badgeStyle = (val: string, color: string) => {
    if (val === 'ok') return { background: `${color}18`, color, borderColor: `${color}40` };
    if (val !== '0') return { background: `${color}10`, color: `${color}cc`, borderColor: `${color}30` };
    return {};
  };

  const tabs = [
    { id: 'info', label: '1. Informations', key: '1', badge: badges.info, color: '#3b82f6' },
    { id: 'documents', label: '2. Documents', key: '2', badge: badges.docs, color: '#8b5cf6' },
    { id: 'clinique', label: '3. Clinique', key: '3', badge: badges.clin, color: '#10b981' },
    { id: 'moulages', label: '4. Moulage', key: '4', badge: badges.moul, color: '#f59e0b' },
    { id: 'cepha', label: '5. Radio', key: '5', badge: badges.radio, color: '#ef4444' },
    { id: 'traitement', label: '6. Traitement', key: '6', badge: badges.trait, color: '#6366f1' },
  ];

  return (
    <ErrorBoundary>
    <div className="app-container">
      <aside className="sidebar no-print" role="navigation" aria-label="Navigation principale">
        <div className="sidebar-header">
          <h1 className="sidebar-brand">OrthoDiag</h1>
          <button className="btn-back" onClick={() => { forceSave(); setPatientDirectory(null); setActiveTab('overview'); }}>
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
          <div style={{ display: 'flex', gap: '2px', height: '4px' }}>
            {tabs.filter(tab => tab.id !== 'documents').map(tab => {
              const isDone = tab.badge === 'ok';
              const isPartial = tab.badge !== '0' && tab.badge !== 'ok';
              return (
                <div key={tab.id} style={{ flex: 1, borderRadius: '2px', background: isDone ? tab.color : isPartial ? tab.color : 'var(--c-border)', opacity: isDone ? 1 : isPartial ? 0.4 : 0.2, transition: 'opacity 0.3s, background 0.3s' }} title={tab.label} />
              );
            })}
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
              <span className="nav-badge" style={{ ...badgeStyle(tab.badge, tab.color), border: '1px solid' }}>{tab.badge === 'ok' ? '✓' : tab.badge}</span>
              <span className="nav-shortcut">{tab.key}</span>
            </button>
          ))}

          <div style={{ flex: 1 }} />

          <button
            tabIndex={-1}
            className={`nav-item ${activeTab === 'priseencharge' ? 'active' : ''}`}
            onClick={() => setActiveTab('priseencharge')}
            style={{ border: '1px solid var(--c-border)', justifyContent: 'center' }}
          >
            Prise en charge
          </button>
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

      <main className="main-content" role="main" aria-label="Contenu principal">
        <div className="module-container" style={{ maxWidth: '1100px' }}>
          {['overview','clinique','moulages','cepha'].includes(activeTab) && (
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
          {activeTab === 'priseencharge' && <PriseEnChargeTab />}
          {activeTab === 'settings' && <SettingsTab />}
        </div>
      </main>
    </div>
    </ErrorBoundary>
  );
}
