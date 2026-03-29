import { useState } from 'react';
import { useStore } from '../../store/useStore';

export default function SettingsTab() {
  const patient = useStore(state => state.patient);
  const importPatientData = useStore(state => state.importPatientData);
  const settings = useStore(state => state.settings);
  const updateSettings = useStore(state => state.updateSettings);

  const [newDoctor, setNewDoctor] = useState({ nom: '', prenom: '' });
  const [newPraticien, setNewPraticien] = useState({ nom: '', prenom: '', abrev: '' });

  const handleAddDoctor = () => {
    if (newDoctor.nom) {
      updateSettings({ doctors: [...settings.doctors, { id: Date.now(), ...newDoctor }] });
      setNewDoctor({ nom: '', prenom: '' });
    }
  };

  const handleAddPraticien = () => {
    if (newPraticien.nom) {
      updateSettings({ praticiens: [...settings.praticiens, { id: Date.now(), ...newPraticien }] });
      setNewPraticien({ nom: '', prenom: '', abrev: '' });
    }
  };

  const handleDeleteDoctor = (id: number) => {
    updateSettings({ doctors: settings.doctors.filter(d => d.id !== id) });
  };

  const handleDeletePraticien = (id: number) => {
    updateSettings({ praticiens: settings.praticiens.filter(p => p.id !== id) });
  };

  const handleExportBackup = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(patient, null, 2));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", `orthodiag_backup_${patient.id}_${new Date().toISOString().split('T')[0]}.json`);
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
  };

  const handleImportBackup = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const importedData = JSON.parse(e.target?.result as string);
        if (importedData && typeof importedData === 'object') {
           if (importPatientData) importPatientData(importedData);
           else alert("Logique d'importation manquante dans le Store, mise à jour requise.");
        }
      } catch (err) {
        alert("Fichier non valide ou corrompu.");
      }
    };
    reader.readAsText(file);
    event.target.value = ''; // Reset
  };

  return (
    <div className="module-content">
      <div className="module-header"><h2>5. Réglages & Intégration</h2></div>

      <div className="card" style={{ borderLeft: '4px solid #10b981' }}>
        <h3 style={{ fontSize: '1.1rem', marginBottom: '1rem', color: '#0f172a' }}>Source des Données Administratives (Patient)</h3>
        <p style={{ fontSize: '0.85rem', color: '#64748b', marginBottom: '1rem' }}>
          Pour garantir la conformité LPD (Suisse), choisissez le mode de stockage et de synchronisation des données d'identité du patient. Les données cliniques restent exclusivement locales.
        </p>
        <div style={{ display: 'flex', gap: '2rem' }}>
          <label style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem', cursor: 'pointer' }}>
            <input 
              type="radio" 
              name="dataSource" 
              checked={settings.dataSource === 'LOCAL'} 
              onChange={() => updateSettings({ dataSource: 'LOCAL' })} 
              style={{ transform: 'scale(1.2)', marginTop: '4px' }}
            />
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <span style={{ fontWeight: 600, color: '#0f172a' }}>OrthoDiag Local (Indépendant)</span>
              <span style={{ fontSize: '0.75rem', color: '#64748b', marginBottom: '0.5rem' }}>Les données sont tapées manuellement et sauvegardées sur le serveur local.</span>
              
              {settings.dataSource === 'LOCAL' && (
                <div style={{ marginTop: '0.5rem', padding: '0.75rem', background: '#f8fafc', border: '1px solid #cbd5e1', borderRadius: '4px' }}>
                  <span style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#0f172a', marginBottom: '0.4rem' }}>Sauvegarde Manuelle (Fichier)</span>
                  <span style={{ display: 'block', fontSize: '0.75rem', color: '#475569', marginBottom: '0.5rem' }}>
                    Téléchargez ou chargez l'état clinique actuel du patient sous forme de fichier structuré (.json).
                  </span>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button onClick={handleExportBackup} className="btn btn-outline" style={{ fontSize: '0.8rem', padding: '0.4rem 0.8rem', display: 'flex', alignItems: 'center', gap: '0.4rem', fontWeight: 600 }}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
                      Exporter (Backup)
                    </button>
                    
                    <label className="btn btn-outline" style={{ margin: 0, fontSize: '0.8rem', padding: '0.4rem 0.8rem', display: 'flex', alignItems: 'center', gap: '0.4rem', fontWeight: 600, cursor: 'pointer' }}>
                      <input type="file" accept=".json" onChange={handleImportBackup} style={{ display: 'none' }} />
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="17 8 12 3 7 8"></polyline><line x1="12" y1="3" x2="12" y2="15"></line></svg>
                      Importer (Restaurer)
                    </label>
                  </div>
                </div>
              )}
            </div>
          </label>

          <label style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem', cursor: 'pointer' }}>
            <input 
              type="radio" 
              name="dataSource" 
              checked={settings.dataSource === 'ZAWIN'} 
              onChange={() => updateSettings({ dataSource: 'ZAWIN' })} 
              style={{ transform: 'scale(1.2)' }}
            />
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <span style={{ fontWeight: 600, color: '#0f172a' }}>Synchronisation ZaWin (API / Export)</span>
              <span style={{ fontSize: '0.75rem', color: '#64748b' }}>Statut : <span style={{ color: '#f59e0b', fontWeight: 'bold' }}>En attente de connexion Martisoft SA...</span></span>
            </div>
          </label>
        </div>
      </div>

      {/* ── Clinic Info ── */}
      <div className="card" style={{ borderLeft: '4px solid #8b5cf6' }}>
        <h3 style={{ fontSize: '1.1rem', marginBottom: '1rem', color: '#0f172a' }}>Informations de la Clinique</h3>
        <p style={{ fontSize: '0.85rem', color: '#64748b', marginBottom: '1rem' }}>
          Ces informations sont utilisées pour la génération automatique de documents (courriers, devis, demandes d'assurance).
        </p>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.5rem' }}>
          {[
            { key: 'clinicName', label: 'Nom de la Clinique', ph: 'Cabinet Orthodontique...' },
            { key: 'clinicAddress', label: 'Adresse', ph: 'Rue et n°' },
            { key: 'clinicNPA', label: 'NPA / Localité', ph: '1000 Lausanne' },
            { key: 'clinicPhone', label: 'Téléphone', ph: '+41 21...' },
            { key: 'clinicEmail', label: 'E-mail', ph: 'contact@clinique.ch' },
            { key: 'clinicRCC', label: 'N° RCC', ph: 'Registre Créancier' },
            { key: 'clinicGLN', label: 'N° GLN', ph: 'Global Location Number' },
          ].map(f => (
            <div key={f.key} className="form-group">
              <label style={{ fontSize: '0.75rem', fontWeight: 500, color: '#475569', marginBottom: '2px' }}>{f.label}</label>
              <input
                type="text"
                value={(settings.clinicInfo as any)[f.key] || ''}
                onChange={e => updateSettings({ clinicInfo: { ...settings.clinicInfo, [f.key]: e.target.value } })}
                placeholder={f.ph}
                style={{ padding: '0.4rem', border: '1px solid #cbd5e1', borderRadius: '4px', fontSize: '0.85rem' }}
              />
            </div>
          ))}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
        <div className="card" style={{ padding: '1rem' }}>
          <h3 style={{ marginBottom: '0.5rem' }}>Praticiens OrthoDiag</h3>
          <p style={{ fontSize: '0.85rem', color: '#64748b', marginBottom: '1rem' }}>Médecins orthodontistes de la clinique.</p>
          
          <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
            <input type="text" value={newPraticien.nom} onChange={e => setNewPraticien({...newPraticien, nom: e.target.value})} placeholder="Nom (ex: Al-Yassary)" style={{ flex: 1, padding: '0.4rem', border: '1px solid #cbd5e1', borderRadius: '4px', fontSize: '0.85rem' }} />
            <input type="text" value={newPraticien.prenom} onChange={e => setNewPraticien({...newPraticien, prenom: e.target.value})} placeholder="Prénom" style={{ flex: 1, padding: '0.4rem', border: '1px solid #cbd5e1', borderRadius: '4px', fontSize: '0.85rem' }} />
            <input type="text" value={newPraticien.abrev} onChange={e => setNewPraticien({...newPraticien, abrev: e.target.value})} placeholder="Abrév." style={{ width: '80px', padding: '0.4rem', border: '1px solid #cbd5e1', borderRadius: '4px', fontSize: '0.85rem' }} />
            <button onClick={handleAddPraticien} className="btn btn-primary" style={{ padding: '0.4rem 0.8rem', fontSize: '0.85rem' }}>Ajouter</button>
          </div>

          <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
            {settings.praticiens.map(p => (
              <li key={p.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem', background: '#f8fafc', borderBottom: '1px solid #f1f5f9' }}>
                <span style={{ fontSize: '0.9rem', color: '#0f172a' }}>{p.nom} {p.prenom} <span style={{ color: '#94a3b8' }}>({p.abrev})</span></span>
                <button onClick={() => handleDeletePraticien(p.id)} style={{ color: 'red', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 'bold' }}>×</button>
              </li>
            ))}
          </ul>
        </div>

        <div className="card" style={{ padding: '1rem' }}>
          <h3 style={{ marginBottom: '0.5rem' }}>Médecins Dentistes Correspondants</h3>
          <p style={{ fontSize: '0.85rem', color: '#64748b', marginBottom: '1rem' }}>Carnet d'adresses (en arrière-plan).</p>
          
          <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
            <input type="text" value={newDoctor.nom} onChange={e => setNewDoctor({...newDoctor, nom: e.target.value})} placeholder="Nom" style={{ flex: 1, padding: '0.4rem', border: '1px solid #cbd5e1', borderRadius: '4px', fontSize: '0.85rem' }} />
            <input type="text" value={newDoctor.prenom} onChange={e => setNewDoctor({...newDoctor, prenom: e.target.value})} placeholder="Prénom" style={{ flex: 1, padding: '0.4rem', border: '1px solid #cbd5e1', borderRadius: '4px', fontSize: '0.85rem' }} />
            <button onClick={handleAddDoctor} className="btn btn-primary" style={{ padding: '0.4rem 0.8rem', fontSize: '0.85rem' }}>Ajouter</button>
          </div>

          <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
            {settings.doctors.map(d => (
              <li key={d.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem', background: '#f8fafc', borderBottom: '1px solid #f1f5f9' }}>
                <span style={{ fontSize: '0.9rem', color: '#0f172a' }}>{d.nom} {d.prenom}</span>
                <button onClick={() => handleDeleteDoctor(d.id)} style={{ color: 'red', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 'bold' }}>×</button>
              </li>
            ))}
          </ul>
        </div>
      </div>


    </div>
  );
}
