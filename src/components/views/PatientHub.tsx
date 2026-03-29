import { useEffect, useState } from 'react';
import { useStore } from '../../store/useStore';
import { fileSystem } from '../../services/FileSystemService';
import type { PatientDirectory } from '../../services/FileSystemService';

export default function PatientHub() {
  const isHubConnected = useStore(state => state.isHubConnected);
  const setHubConnected = useStore(state => state.setHubConnected);
  const setPatientDirectory = useStore(state => state.setPatientDirectory);
  const importPatientData = useStore(state => state.importPatientData);
  const setActiveTab = useStore(state => state.setActiveTab);

  const [patients, setPatients] = useState<PatientDirectory[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newPatientNom, setNewPatientNom] = useState('');
  const [newPatientPrenom, setNewPatientPrenom] = useState('');

  const connectHub = async () => {
    setLoading(true);
    setError(null);
    try {
      const ok = await fileSystem.requestRootAccess();
      if (ok) {
        setHubConnected(true);
        await refreshPatients();
      } else {
        setError("Accès au dossier refusé ou annulé.");
      }
    } catch (err: any) {
      setError(err.message || "Erreur lors de la connexion au dossier.");
    } finally {
      setLoading(false);
    }
  };

  const refreshPatients = async () => {
    setLoading(true);
    try {
      if (fileSystem.isReady()) {
        const list = await fileSystem.loadPatientsList();
        setPatients(list);
      }
    } catch (err) {
      console.error(err);
      setError("Erreur de lecture du dossier.");
    } finally {
      setLoading(false);
    }
  };

  // Restaure la connexion si le handle est déjà présent dans fileSystem
  useEffect(() => {
    if (isHubConnected && fileSystem.isReady()) {
      refreshPatients();
    }
    // Note: Chrome requires user interaction to re-verify directory handle if we store it in IndexedDB.
    // For this implementation, we just ask for it on mount if not ready.
    if (isHubConnected && !fileSystem.isReady()) {
      setHubConnected(false); // Force re-connection requiring a click
    }
  }, [isHubConnected]);

  const openPatient = async (dir: PatientDirectory) => {
    try {
      setLoading(true);
      const data = await fileSystem.loadPatientData(dir.handle);
      if (data) {
        importPatientData(data);
        setPatientDirectory(dir.handle);
        setActiveTab('overview');
      } else {
        setError(`Le dossier ${dir.folderName} est vide ou le fichier JSON est corrompu.`);
      }
    } catch (err) {
      setError("Impossible d'ouvrir ce dossier.");
    } finally {
      setLoading(false);
    }
  };

  const createPatient = async () => {
    if (!newPatientNom.trim()) {
      alert("Le nom est obligatoire.");
      return;
    }
    
    // Format folder name securely
    const folderName = `${newPatientNom.trim().toUpperCase()}_${newPatientPrenom.trim()}`.replace(/[^\p{L}\p{N}_-]/gu, '');
    
    try {
      setLoading(true);
      setIsModalOpen(false); // close modal immediately
      
      const handle = await fileSystem.createPatientDirectory(folderName);
      
      // Crée un squelette vide
      const emptyPatient = {
        id: 'P' + Date.now().toString().slice(-6),
        nom: newPatientNom.trim().toUpperCase(),
        prenom: newPatientPrenom.trim(),
        activeSessionId: 'T0',
        sessions: [{ id: 'T0', date: new Date().toISOString(), nomSession: 'Bilan Initial' }]
      };
      
      await fileSystem.savePatientData(handle, emptyPatient as any);
      await refreshPatients();
      
      // Open immediately
      importPatientData(emptyPatient as any);
      setPatientDirectory(handle);
      setActiveTab('overview');
      
      // Reset form
      setNewPatientNom('');
      setNewPatientPrenom('');
      
    } catch (err: any) {
      console.error(err);
      setError("Impossible de créer le patient : " + err.message);
    } finally {
      setLoading(false);
    }
  };

  if (!isHubConnected) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100vh', backgroundColor: '#f8fafc', padding: '2rem' }}>
        <div className="card" style={{ maxWidth: '500px', width: '100%', padding: '3rem 2rem', textAlign: 'center' }}>
          <h1 style={{ color: 'var(--primary-color)', fontSize: '1.8rem', marginBottom: '1rem' }}>OrthoDiag Local Hub</h1>
          <p style={{ color: '#475569', marginBottom: '2rem', lineHeight: 1.5 }}>
            Cette application utilise une technologie locale sécurisée. Pour lire et sauvegarder les dossiers médicaux et les médias (STL, Radios), veuillez autoriser l'accès au répertoire "OrthoDiag_Patients" de votre ordinateur.
          </p>
          <button 
            onClick={connectHub} 
            disabled={loading}
            className="btn btn-primary" 
            style={{ fontSize: '1.1rem', padding: '0.8rem 1.5rem', width: '100%', marginBottom: '1rem' }}
          >
            {loading ? 'Connexion...' : '📂 Connecter la Base de Données'}
          </button>
          {error && <p style={{ color: '#ef4444', fontSize: '0.9rem', backgroundColor: '#fef2f2', padding: '0.5rem', borderRadius: '4px' }}>{error}</p>}
        </div>
      </div>
    );
  }

  return (
    <div style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ color: 'var(--primary-color)', fontSize: '1.8rem', margin: '0 0 0.5rem 0' }}>Tableau de Bord Patients</h1>
          <p style={{ color: '#64748b', margin: 0 }}>Base de données locale connectée.</p>
        </div>
        <div style={{ display: 'flex', gap: '1rem' }}>
           <button onClick={refreshPatients} className="btn btn-outline" disabled={loading}>🔄 Rafraîchir</button>
           <button onClick={() => setIsModalOpen(true)} className="btn btn-primary" disabled={loading}>+ Nouveau Patient</button>
        </div>
      </div>

      {error && <div style={{ marginBottom: '1rem', padding: '1rem', background: '#fef2f2', color: '#b91c1c', borderLeft: '4px solid #ef4444', borderRadius: '4px' }}>{error}</div>}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
        {patients.length === 0 && !loading && (
          <div style={{ gridColumn: '1 / -1', padding: '3rem', textAlign: 'center', background: '#f8fafc', border: '2px dashed #cbd5e1', borderRadius: '8px', color: '#64748b' }}>
            Aucun dossier patient trouvé dans ce répertoire. Créez-en un nouveau !
          </div>
        )}
        
        {patients.map(p => (
          <div 
            key={p.folderName} 
            onClick={() => openPatient(p)}
            className="card"
            style={{ padding: '1.5rem', cursor: 'pointer', transition: 'transform 0.2s', borderLeft: '4px solid #3b82f6', display: 'flex', alignItems: 'center', gap: '1rem' }}
            onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'}
            onMouseLeave={e => e.currentTarget.style.transform = 'none'}
          >
            <div style={{ width: '40px', height: '40px', borderRadius: '8px', background: '#eff6ff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem', color: '#2563eb' }}>
              👤
            </div>
            <div>
              <h3 style={{ margin: '0 0 0.25rem 0', fontSize: '1.1rem', color: '#0f172a' }}>{p.patientName}</h3>
              <p style={{ margin: 0, fontSize: '0.8rem', color: '#64748b' }}>Dossier: {p.folderName}</p>
            </div>
          </div>
        ))}
      </div>
      {/* Modal Nouveau Patient */}
      {isModalOpen && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(15, 23, 42, 0.6)', backdropFilter: 'blur(4px)' }}>
          <div style={{ background: 'white', padding: '2rem', borderRadius: '12px', width: '90%', maxWidth: '400px', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)' }}>
            <h2 style={{ margin: '0 0 1.5rem 0', color: '#0f172a', fontSize: '1.25rem' }}>Créer un nouveau patient</h2>
            
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600, color: '#475569', fontSize: '0.875rem' }}>Nom de famille <span style={{color: '#ef4444'}}>*</span></label>
              <input 
                type="text" 
                value={newPatientNom} 
                onChange={e => setNewPatientNom(e.target.value)} 
                placeholder="Ex. Dupont" 
                style={{ width: '100%', padding: '0.75rem', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '1rem' }} 
                autoFocus
                onKeyDown={e => e.key === 'Enter' && createPatient()}
              />
            </div>

            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600, color: '#475569', fontSize: '0.875rem' }}>Prénom <span style={{color: '#94a3b8', fontWeight: 400}}>(Optionnel)</span></label>
              <input 
                type="text" 
                value={newPatientPrenom} 
                onChange={e => setNewPatientPrenom(e.target.value)} 
                placeholder="Ex. Jean" 
                style={{ width: '100%', padding: '0.75rem', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '1rem' }}
                onKeyDown={e => e.key === 'Enter' && createPatient()}
              />
            </div>

            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
              <button 
                onClick={() => setIsModalOpen(false)}
                style={{ padding: '0.5rem 1rem', background: 'transparent', border: '1px solid #cbd5e1', borderRadius: '6px', color: '#475569', cursor: 'pointer', fontWeight: 500 }}
              >
                Annuler
              </button>
              <button 
                onClick={createPatient}
                disabled={!newPatientNom.trim() || loading}
                style={{ padding: '0.5rem 1rem', background: newPatientNom.trim() ? '#3b82f6' : '#94a3b8', color: 'white', border: 'none', borderRadius: '6px', cursor: newPatientNom.trim() ? 'pointer' : 'not-allowed', fontWeight: 500 }}
              >
                {loading ? 'Création...' : 'Créer le dossier'}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
