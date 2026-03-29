import { useEffect, useState, useMemo } from 'react';
import { useStore, initialSession } from '../../store/useStore';
import { fileSystem } from '../../services/FileSystemService';
import type { PatientDirectory } from '../../services/FileSystemService';

type SortKey = 'name' | 'folder';

export default function PatientHub() {
  const isHubConnected = useStore(state => state.isHubConnected);
  const setHubConnected = useStore(state => state.setHubConnected);
  const setPatientDirectory = useStore(state => state.setPatientDirectory);
  const importPatientData = useStore(state => state.importPatientData);
  const setActiveTab = useStore(state => state.setActiveTab);

  const [patients, setPatients] = useState<PatientDirectory[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState<SortKey>('name');

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

  useEffect(() => {
    if (isHubConnected && fileSystem.isReady()) {
      refreshPatients();
    }
    if (isHubConnected && !fileSystem.isReady()) {
      setHubConnected(false);
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

  const deletePatient = async (dir: PatientDirectory, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!window.confirm(`Supprimer le dossier "${dir.patientName}" ?\n\nCette action supprimera le dossier et son contenu du système de fichiers.`)) return;
    try {
      await fileSystem.deletePatientDirectory(dir.folderName);
      await refreshPatients();
    } catch (err: any) {
      setError("Impossible de supprimer : " + err.message);
    }
  };

  const createPatient = async () => {
    if (!newPatientNom.trim()) {
      alert("Le nom est obligatoire.");
      return;
    }

    const folderName = `${newPatientNom.trim().toUpperCase()}_${newPatientPrenom.trim()}`.replace(/[^\p{L}\p{N}_-]/gu, '');

    try {
      setLoading(true);
      setIsModalOpen(false);

      const handle = await fileSystem.createPatientDirectory(folderName);

      const newSession = {
        ...initialSession,
        id: 'T0',
        date: new Date().toISOString().split('T')[0],
        nomSession: 'Bilan Initial (T0)',
      };
      const emptyPatient = {
        id: 'P' + Date.now().toString().slice(-6),
        nom: newPatientNom.trim().toUpperCase(),
        prenom: newPatientPrenom.trim(),
        pratique: '', sexe: '', dateNaissance: '', datePremiereConsult: '', age: '',
        avs: '', compOrtho: '', caisseMaladie: '', numGarantie: '', adresse: '', npaLocalite: '',
        telephone: '', email: '', representantLegal: '',
        medecinTraitant: '', medecinDentaire: '', autreInfo: '',
        maladiesChroniques: { diabete: false, hypertension: false, allergies: false, cardio: false, respi: false, neuro: false },
        maladiesChroniquesDetails: { diabete: '', hypertension: '', allergies: '', cardio: '', respi: '', neuro: '' },
        mauvaisesHabitudes: { succionPouce: false, bruxisme: false, rongerOngles: false, respiBuccale: false },
        hasChirurgies: false, chirurgiesAnterieures: '', hasTraitements: false, traitementsCours: '',
        allergiesMedic: '', hasAutreGen: false, autreGen: '',
        antecFamExtract: false, extractionDetails: '', carieRecurrente: false, sensibilite: false,
        hasOrthoPasse: false, traitementsOrthoPasses: '', hasAutreDent: false, autreDent: '', autreAntecDent: '',
        hasFente: false, hasMacroglossie: false, hasSAOS: false, hasTroublesDeglutitionGrave: false, hasAsymetrieGrave: false, has17d: false,
        motifConsultation: '', praticien: '', dention: '', implant: '', implantDent: '',
        documents: [],
        sessions: [newSession],
        activeSessionId: 'T0',
      };

      await fileSystem.savePatientData(handle, emptyPatient as any);
      await refreshPatients();

      importPatientData(emptyPatient as any);
      setPatientDirectory(handle);
      setActiveTab('overview');

      setNewPatientNom('');
      setNewPatientPrenom('');
    } catch (err: any) {
      console.error(err);
      setError("Impossible de créer le patient : " + err.message);
    } finally {
      setLoading(false);
    }
  };

  // Filtered + sorted list
  const filteredPatients = useMemo(() => {
    let list = patients;
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(p => p.patientName.toLowerCase().includes(q) || p.folderName.toLowerCase().includes(q));
    }
    return [...list].sort((a, b) => {
      if (sortBy === 'name') return a.patientName.localeCompare(b.patientName);
      return a.folderName.localeCompare(b.folderName);
    });
  }, [patients, search, sortBy]);

  // ── Not connected ──
  if (!isHubConnected) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100vh', backgroundColor: '#f8fafc', padding: '2rem' }}>
        <div className="card" style={{ maxWidth: '500px', width: '100%', padding: '3rem 2rem', textAlign: 'center' }}>
          <h1 style={{ color: 'var(--c-primary)', fontSize: '1.8rem', marginBottom: '1rem' }}>OrthoDiag</h1>
          <p style={{ color: '#475569', marginBottom: '2rem', lineHeight: 1.5 }}>
            Cette application utilise une technologie locale sécurisée. Pour lire et sauvegarder les dossiers médicaux et les médias (STL, Radios), veuillez autoriser l'accès au répertoire "OrthoDiag_Patients" de votre ordinateur.
          </p>
          <button
            onClick={connectHub}
            disabled={loading}
            className="btn btn-primary"
            style={{ fontSize: '1.1rem', padding: '0.8rem 1.5rem', width: '100%', marginBottom: '1rem' }}
          >
            {loading ? 'Connexion...' : 'Connecter la Base de Données'}
          </button>
          {error && <p style={{ color: '#ef4444', fontSize: '0.9rem', backgroundColor: '#fef2f2', padding: '0.5rem', borderRadius: '4px' }}>{error}</p>}
        </div>
      </div>
    );
  }

  // ── Connected: Patient list ──
  return (
    <div style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ color: 'var(--c-primary)', fontSize: '1.5rem', margin: '0 0 0.25rem 0' }}>Tableau de Bord Patients</h1>
          <p style={{ color: '#64748b', margin: 0, fontSize: 'var(--fs-small)' }}>{patients.length} dossier{patients.length > 1 ? 's' : ''} trouvé{patients.length > 1 ? 's' : ''}</p>
        </div>
        <div style={{ display: 'flex', gap: 'var(--sp-2)' }}>
          <button onClick={refreshPatients} className="btn btn-outline" disabled={loading}>Rafraîchir</button>
          <button onClick={() => setIsModalOpen(true)} className="btn btn-primary" disabled={loading}>+ Nouveau Patient</button>
        </div>
      </div>

      {error && <div style={{ marginBottom: '1rem', padding: 'var(--sp-3)', background: '#fef2f2', color: '#b91c1c', borderLeft: '4px solid #ef4444', borderRadius: 'var(--radius)' }}>{error}</div>}

      {/* Search + Sort bar */}
      <div style={{ display: 'flex', gap: 'var(--sp-2)', marginBottom: '1rem', alignItems: 'center' }}>
        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Rechercher un patient..."
          style={{ flex: 1, maxWidth: '400px', padding: 'var(--sp-2) var(--sp-3)', fontSize: 'var(--fs-value)', border: '1px solid #cbd5e1', borderRadius: 'var(--radius)', background: '#fff' }}
          autoFocus
        />
        <select
          value={sortBy}
          onChange={e => setSortBy(e.target.value as SortKey)}
          style={{ padding: 'var(--sp-2)', fontSize: 'var(--fs-value)', border: '1px solid #cbd5e1', borderRadius: 'var(--radius)', background: '#fff' }}
        >
          <option value="name">Tri : Nom</option>
          <option value="folder">Tri : Dossier</option>
        </select>
      </div>

      {/* Patient grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1rem' }}>
        {filteredPatients.length === 0 && !loading && (
          <div style={{ gridColumn: '1 / -1', padding: '3rem', textAlign: 'center', background: '#f8fafc', border: '2px dashed #cbd5e1', borderRadius: '8px', color: '#64748b' }}>
            {search ? 'Aucun résultat pour cette recherche.' : 'Aucun dossier patient trouvé. Créez-en un nouveau !'}
          </div>
        )}

        {filteredPatients.map(p => (
          <div
            key={p.folderName}
            onClick={() => openPatient(p)}
            className="card"
            style={{ padding: '1rem', cursor: 'pointer', borderLeft: '4px solid var(--c-primary)', display: 'flex', alignItems: 'center', gap: 'var(--sp-3)' }}
          >
            <div style={{
              width: '36px', height: '36px', borderRadius: '50%',
              background: 'var(--c-primary-light)', display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '0.85rem', fontWeight: 700, color: 'var(--c-primary)', flexShrink: 0,
            }}>
              {(p.patientName[0] || '?').toUpperCase()}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <h3 style={{ margin: 0, fontSize: 'var(--fs-value)', fontWeight: 700, color: 'var(--c-text)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.patientName}</h3>
              <p style={{ margin: '2px 0 0', fontSize: 'var(--fs-badge)', color: 'var(--c-text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.folderName}</p>
            </div>
            <button
              onClick={(e) => deletePatient(p, e)}
              title="Supprimer"
              style={{ background: 'transparent', border: 'none', color: 'var(--c-text-muted)', cursor: 'pointer', padding: '4px', fontSize: '1rem', lineHeight: 1, opacity: 0.4, transition: 'opacity 0.15s' }}
              onMouseEnter={e => e.currentTarget.style.opacity = '1'}
              onMouseLeave={e => e.currentTarget.style.opacity = '0.4'}
            >
              ×
            </button>
          </div>
        ))}
      </div>

      {/* Modal Nouveau Patient */}
      {isModalOpen && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(15, 23, 42, 0.6)', backdropFilter: 'blur(4px)' }}>
          <div style={{ background: 'white', padding: '2rem', borderRadius: '12px', width: '90%', maxWidth: '400px', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)' }}>
            <h2 style={{ margin: '0 0 1.5rem 0', color: '#0f172a', fontSize: '1.25rem' }}>Nouveau Patient</h2>

            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600, color: '#475569', fontSize: '0.875rem' }}>Nom <span style={{ color: '#ef4444' }}>*</span></label>
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
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600, color: '#475569', fontSize: '0.875rem' }}>Prénom <span style={{ color: '#94a3b8', fontWeight: 400 }}>(Optionnel)</span></label>
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
              <button onClick={() => setIsModalOpen(false)} className="btn btn-outline">Annuler</button>
              <button
                onClick={createPatient}
                disabled={!newPatientNom.trim() || loading}
                className="btn btn-primary"
                style={{ opacity: newPatientNom.trim() ? 1 : 0.5, cursor: newPatientNom.trim() ? 'pointer' : 'not-allowed' }}
              >
                {loading ? 'Création...' : 'Créer'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
