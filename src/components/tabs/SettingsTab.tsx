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

      <div className="card" style={{ marginBottom: '1rem', padding: '1.5rem', borderLeft: '4px solid #10b981' }}>
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

      {/* ═══ Insurance Criteria ═══ */}
      <div className="card" style={{ padding: '1rem', marginTop: '1rem' }}>
        <h3 style={{ marginBottom: '0.5rem' }}>Critères de Prise en Charge (Assurances)</h3>
        <p style={{ fontSize: 'var(--fs-small)', color: '#64748b', marginBottom: '1rem' }}>
          Paramètres céphalométriques et cliniques déclenchant les alertes dans l'overview.
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
          {/* AI */}
          <div className="section-card" style={{ padding: 'var(--sp-2)' }}>
            <h4 className="section-title" style={{ background: '#f0fdf4', color: '#166534', borderColor: '#bbf7d0' }}>AI (Infirmités congénitales)</h4>
            {([
              ['ai208_anb', '208 ANB ≥', '°'],
              ['ai208_anb_combo', '208 ANB combo ≥', '°'],
              ['ai208_snmego_combo', '208 SN-MeGo combo ≥', '°'],
              ['ai208_overjet_screen', '208 OJ screening ≥', 'mm'],
              ['ai209_snmego_open', '209 Apertus SN-MeGo ≥', '°'],
              ['ai209_snmego_open_combo', '209 Apertus combo ≥', '°'],
              ['ai209_snmego_deep', '209 Clausus SN-MeGo ≤', '°'],
              ['ai209_snmego_deep_combo', '209 Clausus combo ≤', '°'],
              ['ai210_anb', '210 Progn. ANB ≤', '°'],
              ['ai210_anb_combo', '210 Progn. combo ≤', '°'],
            ] as const).map(([key, label, unit]) => (
              <div key={key} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '3px' }}>
                <label style={{ fontSize: 'var(--fs-badge)', fontWeight: 500, margin: 0 }}>{label}</label>
                <div style={{ display: 'flex', alignItems: 'center', gap: '2px' }}>
                  <input type="number" value={(settings.insuranceCriteria as any)[key]} onChange={e => updateSettings({ insuranceCriteria: { ...settings.insuranceCriteria, [key]: parseFloat(e.target.value) || 0 } })} style={{ width: '50px', textAlign: 'center', padding: '2px', fontSize: 'var(--fs-badge)' }} step="0.5" />
                  <span style={{ fontSize: 'var(--fs-badge)', color: '#64748b' }}>{unit}</span>
                </div>
              </div>
            ))}
          </div>

          {/* HG */}
          <div className="section-card" style={{ padding: 'var(--sp-2)' }}>
            <h4 className="section-title" style={{ background: '#eff6ff', color: '#1e40af', borderColor: '#bfdbfe' }}>HG (Hospice Général)</h4>
            {([
              ['hg_overjet', 'Overjet ≥', 'mm'],
              ['hg_overbite_open_teeth', 'Béance > N dents', ''],
              ['hg_encombrement', 'Encombrement ≥', 'mm'],
              ['hg_age_max', 'Âge max', 'ans'],
            ] as const).map(([key, label, unit]) => (
              <div key={key} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '3px' }}>
                <label style={{ fontSize: 'var(--fs-badge)', fontWeight: 500, margin: 0 }}>{label}</label>
                <div style={{ display: 'flex', alignItems: 'center', gap: '2px' }}>
                  <input type="number" value={(settings.insuranceCriteria as any)[key]} onChange={e => updateSettings({ insuranceCriteria: { ...settings.insuranceCriteria, [key]: parseFloat(e.target.value) || 0 } })} style={{ width: '50px', textAlign: 'center', padding: '2px', fontSize: 'var(--fs-badge)' }} step="1" />
                  <span style={{ fontSize: 'var(--fs-badge)', color: '#64748b' }}>{unit}</span>
                </div>
              </div>
            ))}
            <div style={{ marginTop: 'var(--sp-2)', fontSize: 'var(--fs-badge)', color: '#64748b' }}>
              Critères additionnels détectés automatiquement : OJ négatif, supraclusion traumatisante, occlusion croisée.
            </div>
          </div>

          {/* LaMal + Info */}
          <div className="section-card" style={{ padding: 'var(--sp-2)' }}>
            <h4 className="section-title" style={{ background: '#faf5ff', color: '#6b21a8', borderColor: '#e9d5ff' }}>LaMal / Complémentaire</h4>
            <div style={{ fontSize: 'var(--fs-small)', color: '#475569', lineHeight: 1.6 }}>
              <p style={{ margin: '0 0 var(--sp-2)' }}><b>LaMal art.19a :</b> Mêmes critères AI appliqués aux patients &gt; 20 ans (infirmités congénitales).</p>
              <p style={{ margin: '0 0 var(--sp-2)' }}><b>LaMal art.17f :</b> Dysgnathie avec troubles fonctionnels (apnée, déglutition, ATM). Détection auto si ATM cochée.</p>
              <p style={{ margin: 0 }}><b>Complémentaire :</b> Affichée si le champ "Assurance Complémentaire" est rempli dans Informations.</p>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}
