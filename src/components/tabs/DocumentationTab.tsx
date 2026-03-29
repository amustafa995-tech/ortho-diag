import { useRef, useState, useMemo, useCallback } from 'react';
import { useStore } from '../../store/useStore';
import { fileSystem } from '../../services/FileSystemService';
import type { DocumentCategory, PatientDocument, ClinicInfo } from '../../types';
import { DOCUMENT_CATEGORIES } from '../../types';
import type { PatientRecord } from '../../types';

const formatFileSize = (bytes: number) => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

const generateDocFileName = (category: DocumentCategory, title: string, ext: string) => {
  const date = new Date().toISOString().split('T')[0];
  const clean = title.replace(/[^a-zA-Z0-9àâäéèêëïîôùûüÿçÀÂÄÉÈÊËÏÎÔÙÛÜŸÇ\s-]/g, '').replace(/\s+/g, '-').toLowerCase();
  return `${date}_${category}_${clean}.${ext}`;
};

const getFileExtension = (name: string) => {
  const parts = name.split('.');
  return parts.length > 1 ? parts.pop()!.toLowerCase() : '';
};

const getFileIcon = (mimeType: string) => {
  if (mimeType.startsWith('image/')) return 'IMG';
  if (mimeType === 'application/pdf') return 'PDF';
  if (mimeType.includes('word') || mimeType.includes('document')) return 'DOC';
  if (mimeType.includes('spreadsheet') || mimeType.includes('excel')) return 'XLS';
  return 'FIL';
};

const getIconColor = (mimeType: string) => {
  if (mimeType.startsWith('image/')) return '#3b82f6';
  if (mimeType === 'application/pdf') return '#ef4444';
  if (mimeType.includes('word') || mimeType.includes('document')) return '#2563eb';
  if (mimeType.includes('spreadsheet') || mimeType.includes('excel')) return '#16a34a';
  return '#6b7280';
};

export default function DocumentationTab() {
  const patient = useStore(state => state.patient);
  const settings = useStore(state => state.settings);
  const isHubConnected = useStore(state => state.isHubConnected);
  const patientDirectory = useStore(state => state.patientDirectory);
  const addDocument = useStore(state => state.addDocument);
  const removeDocument = useStore(state => state.removeDocument);
  const updateDocument = useStore(state => state.updateDocument);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [activeCategory, setActiveCategory] = useState<DocumentCategory | null>(null);
  const [filterCategory, setFilterCategory] = useState<DocumentCategory | 'ALL'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [renamingId, setRenamingId] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState('');
  const [sortBy, setSortBy] = useState<'date' | 'name' | 'category'>('date');

  const docs = patient.documents || [];

  const filteredDocs = useMemo(() => docs
    .filter(d => filterCategory === 'ALL' || d.category === filterCategory)
    .filter(d => !searchQuery || d.displayName.toLowerCase().includes(searchQuery.toLowerCase()) || d.category.toLowerCase().includes(searchQuery.toLowerCase()))
    .sort((a, b) => {
      if (sortBy === 'date') return b.dateAdded.localeCompare(a.dateAdded);
      if (sortBy === 'name') return a.displayName.localeCompare(b.displayName);
      return a.category.localeCompare(b.category);
    }), [docs, filterCategory, searchQuery, sortBy]);

  const categoryCount = useCallback((cat: DocumentCategory) => docs.filter(d => d.category === cat).length, [docs]);

  const triggerUpload = (cat: DocumentCategory) => {
    setActiveCategory(cat);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
      fileInputRef.current.click();
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.length || !activeCategory) return;
    const files = Array.from(e.target.files);

    for (const file of files) {
      const ext = getFileExtension(file.name);
      const diskName = generateDocFileName(activeCategory, file.name.replace(`.${ext}`, ''), ext);

      if (isHubConnected && patientDirectory) {
        await fileSystem.saveDocument(patientDirectory, file, activeCategory, diskName);
      }

      const doc: PatientDocument = {
        id: `doc_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
        fileName: diskName,
        displayName: diskName,
        category: activeCategory,
        dateAdded: new Date().toISOString().split('T')[0],
        originalName: file.name,
        mimeType: file.type || 'application/octet-stream',
        size: file.size,
        notes: '',
      };
      addDocument(doc);
    }

    setActiveCategory(null);
  };

  const handleDelete = async (doc: PatientDocument) => {
    if (isHubConnected && patientDirectory) {
      await fileSystem.deleteDocument(patientDirectory, doc.category, doc.fileName);
    }
    removeDocument(doc.id);
  };

  const handleStartRename = (doc: PatientDocument) => {
    setRenamingId(doc.id);
    setRenameValue(doc.displayName);
  };

  const handleConfirmRename = async (doc: PatientDocument) => {
    if (!renameValue.trim() || renameValue === doc.displayName) {
      setRenamingId(null);
      return;
    }

    const ext = getFileExtension(doc.fileName);
    const newFileName = generateDocFileName(doc.category, renameValue.replace(`.${ext}`, ''), ext);

    if (isHubConnected && patientDirectory) {
      await fileSystem.renameDocument(patientDirectory, doc.category, doc.fileName, newFileName);
    }

    updateDocument(doc.id, { displayName: renameValue.trim(), fileName: newFileName });
    setRenamingId(null);
  };

  const handleCategoryChange = async (doc: PatientDocument, newCategory: DocumentCategory) => {
    if (newCategory === doc.category) return;

    if (isHubConnected && patientDirectory) {
      try {
        const oldCatDir = await fileSystem.ensureCategoryDir(patientDirectory, doc.category);
        const oldHandle = await oldCatDir.getFileHandle(doc.fileName);
        const file = await oldHandle.getFile();
        await fileSystem.saveDocument(patientDirectory, file, newCategory, doc.fileName);
        await fileSystem.deleteDocument(patientDirectory, doc.category, doc.fileName);
      } catch (err) {
        console.error('Erreur déplacement fichier:', err);
      }
    }

    updateDocument(doc.id, { category: newCategory });
  };

  const catLabel = (code: DocumentCategory) => DOCUMENT_CATEGORIES.find(c => c.code === code)?.label || code;

  const generateDocument = (templateId: string, category: DocumentCategory, p: PatientRecord, clinic: ClinicInfo) => {
    const today = new Date().toISOString().split('T')[0];
    const patientName = `${p.nom} ${p.prenom}`.trim() || 'Patient';
    const clinicBlock = [clinic.clinicName, clinic.clinicAddress, clinic.clinicNPA, clinic.clinicPhone, clinic.clinicEmail].filter(Boolean).join('\n');
    const patientBlock = [
      `Patient : ${patientName}`,
      p.dateNaissance ? `Né(e) le : ${p.dateNaissance}` : '',
      p.avs ? `AVS : ${p.avs}` : '',
      p.adresse ? `Adresse : ${p.adresse}, ${p.npaLocalite}` : '',
      p.caisseMaladie ? `Caisse : ${p.caisseMaladie}` : '',
      p.numGarantie ? `N° Garantie : ${p.numGarantie}` : '',
    ].filter(Boolean).join('\n');

    const praticienBlock = p.praticien ? `Praticien : ${p.praticien}` : '';
    const s = p.sessions.find(s => s.id === p.activeSessionId) || p.sessions[0];

    let title = '';
    let content = '';

    switch (templateId) {
      case 'lettre-medecin':
        title = `Lettre ${p.medecinTraitant || 'Médecin'}`;
        content = [
          clinicBlock, '', `${today}`, '',
          p.medecinTraitant ? `À l'attention de ${p.medecinTraitant}` : 'À l\'attention du Médecin Traitant',
          '', `Concerne : ${patientName}`, '',
          'Cher(e) Confrère/Consœur,',
          '',
          `Je me permets de vous adresser ce courrier concernant votre patient(e) ${patientName}, vu(e) en consultation orthodontique le ${p.datePremiereConsult || today}.`,
          '',
          `Motif de consultation : ${p.motifConsultation || '(non renseigné)'}`,
          '',
          'Diagnostic :',
          s?.overjet ? `  - Overjet : ${s.overjet} mm` : '',
          s?.overbite ? `  - Overbite : ${s.overbite} mm` : '',
          s?.classeMolaireD ? `  - Classe molaire D/G : ${s.classeMolaireD} / ${s.classeMolaireG}` : '',
          s?.classeCanineD ? `  - Classe canine D/G : ${s.classeCanineD} / ${s.classeCanineG}` : '',
          '',
          'Plan de traitement proposé :',
          s?.planTraitement1 ? `  1. ${s.planTraitement1}` : '',
          s?.planTraitement2 ? `  2. ${s.planTraitement2}` : '',
          s?.planTraitement3 ? `  3. ${s.planTraitement3}` : '',
          '',
          'Je reste à votre disposition pour tout renseignement complémentaire.',
          '',
          'Avec mes salutations confraternelles,',
          '', praticienBlock,
        ].filter(l => l !== undefined).join('\n');
        break;

      case 'demande-ai':
        title = 'Demande prise en charge AI';
        content = [
          clinicBlock, '', `${today}`, '',
          'Office AI du Canton', '', 'Objet : Demande de prise en charge orthodontique (AI)', '',
          patientBlock, '', praticienBlock, '',
          'Madame, Monsieur,',
          '',
          `Je sollicite la prise en charge orthodontique de ${patientName} au titre de l'assurance-invalidité.`,
          '',
          'Diagnostic clinique et radiologique :',
          s?.anb ? `  - ANB : ${s.anb}°` : '',
          s?.snMego ? `  - SN-MeGo : ${s.snMego}°` : '',
          s?.overjet ? `  - Overjet : ${s.overjet} mm` : '',
          s?.overbite ? `  - Overbite : ${s.overbite} mm` : '',
          '',
          'Documents joints : OPG, Téléradiographie, Photos cliniques',
          '',
          'Veuillez agréer, Madame, Monsieur, mes salutations distinguées.',
          '', praticienBlock,
        ].filter(l => l !== undefined).join('\n');
        break;

      case 'demande-lamal':
        title = 'Demande prise en charge LaMal';
        content = [
          clinicBlock, '', `${today}`, '',
          p.caisseMaladie ? `${p.caisseMaladie}` : 'Caisse maladie', '',
          'Objet : Demande de prise en charge au titre de la LAMal (Art. 17-19a OPAS)', '',
          patientBlock, '', praticienBlock, '',
          'Madame, Monsieur,',
          '',
          `Je sollicite la prise en charge du traitement orthodontique de ${patientName} selon les articles applicables de l'OPAS.`,
          '',
          'Veuillez agréer mes salutations distinguées.',
          '', praticienBlock,
        ].filter(l => l !== undefined).join('\n');
        break;

      case 'devis':
        title = 'Devis de traitement';
        content = [
          clinicBlock, '', `${today}`, '', 'DEVIS DE TRAITEMENT ORTHODONTIQUE', '',
          patientBlock, '', praticienBlock, '',
          'Plan de traitement :',
          s?.planTraitement1 ? `  1. ${s.planTraitement1}` : '',
          s?.planTraitement2 ? `  2. ${s.planTraitement2}` : '',
          s?.planTraitement3 ? `  3. ${s.planTraitement3}` : '',
          '',
          'Durée estimée : _____ mois',
          'Honoraires : CHF _____',
          '',
          'Ce devis est valable 3 mois à compter de sa date d\'émission.',
          '', praticienBlock,
        ].filter(l => l !== undefined).join('\n');
        break;

      case 'consentement':
        title = 'Consentement éclairé';
        content = [
          clinicBlock, '', `${today}`, '',
          'FORMULAIRE DE CONSENTEMENT ÉCLAIRÉ', '',
          patientBlock, '',
          'Je soussigné(e) déclare avoir été informé(e) par mon orthodontiste des éléments suivants :',
          '',
          '1. Nature du traitement orthodontique proposé',
          '2. Objectifs et résultats attendus',
          '3. Risques et effets secondaires possibles (résorptions radiculaires, sensibilités, récidive)',
          '4. Alternatives thérapeutiques',
          '5. Durée estimée du traitement',
          '6. Coût du traitement et modalités de paiement',
          '7. Nécessité d\'une bonne hygiène et d\'un suivi régulier',
          '',
          'J\'ai pu poser toutes les questions nécessaires et j\'ai reçu des réponses claires.',
          '',
          'Date : _______________    Signature du patient (ou représentant légal) : _______________',
          '',
          `Signature du praticien : ${p.praticien || '_______________'}`,
        ].join('\n');
        break;

      case 'attestation':
        title = 'Attestation de traitement';
        content = [
          clinicBlock, '', `${today}`, '',
          'ATTESTATION DE TRAITEMENT ORTHODONTIQUE', '',
          'Je soussigné(e), certifie que :',
          '', patientBlock, '',
          'est actuellement suivi(e) en traitement orthodontique dans notre cabinet.',
          '',
          `Début du traitement : ${p.datePremiereConsult || '_______________'}`,
          'Fin prévue : _______________',
          '',
          'Cette attestation est délivrée pour servir et valoir ce que de droit.',
          '', praticienBlock,
        ].join('\n');
        break;

      default:
        return;
    }

    // Generate and download text file
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const fileName = generateDocFileName(category, title, 'txt');
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    a.click();
    URL.revokeObjectURL(url);

    // Also add to documents list
    const doc: PatientDocument = {
      id: `doc_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
      fileName,
      displayName: fileName,
      category,
      dateAdded: today,
      originalName: `${title}.txt`,
      mimeType: 'text/plain',
      size: blob.size,
      notes: `Généré automatiquement — ${title}`,
    };
    addDocument(doc);
  };

  return (
    <div className="module-content tab-docs">
      <div className="module-header mh-docs"><h2>2. Documents</h2></div>

      <input
        type="file"
        multiple
        ref={fileInputRef}
        style={{ display: 'none' }}
        onChange={handleFileUpload}
        accept="image/*,.pdf,.doc,.docx,.xls,.xlsx,.stl,.csv"
      />

      {/* ── Category bar ── */}
      <div className="card" style={{ marginBottom: 'var(--sp-2)' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
          {DOCUMENT_CATEGORIES.map(cat => {
            const count = categoryCount(cat.code);
            return (
              <button
                key={cat.code}
                onClick={() => triggerUpload(cat.code)}
                title={`${cat.label} — ${cat.description}`}
                style={{
                  display: 'flex', alignItems: 'center', gap: '4px',
                  padding: '4px 10px', fontSize: 'var(--fs-value)', fontWeight: 600,
                  border: '1px solid var(--c-border)', borderRadius: 'var(--radius)',
                  background: count > 0 ? 'var(--c-filled-bg)' : 'var(--c-card)',
                  color: count > 0 ? 'var(--c-filled)' : 'var(--c-text-secondary)',
                  cursor: 'pointer', transition: 'all 0.15s',
                }}
              >
                + {cat.label}
                {count > 0 && <span style={{ fontSize: 'var(--fs-badge)', background: 'var(--c-filled)', color: '#fff', borderRadius: '8px', padding: '0 5px', minWidth: '16px', textAlign: 'center' }}>{count}</span>}
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Filter & Search bar ── */}
      <div className="card" style={{ marginBottom: 'var(--sp-2)', padding: 'var(--sp-2) var(--sp-3)' }}>
        <div style={{ display: 'flex', gap: 'var(--sp-2)', alignItems: 'center', flexWrap: 'wrap' }}>
          <select
            value={filterCategory}
            onChange={e => setFilterCategory(e.target.value as DocumentCategory | 'ALL')}
            style={{ height: '30px', fontSize: 'var(--fs-value)', border: '1px solid var(--c-border)', borderRadius: 'var(--radius)', padding: '0 var(--sp-2)', fontFamily: 'inherit' }}
          >
            <option value="ALL">Toutes catégories ({docs.length})</option>
            {DOCUMENT_CATEGORIES.map(cat => (
              <option key={cat.code} value={cat.code}>{cat.label} ({categoryCount(cat.code)})</option>
            ))}
          </select>
          <input
            type="text"
            placeholder="Rechercher un document..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            style={{ flex: 1, minWidth: '200px', height: '30px', padding: '0 var(--sp-2)', fontSize: 'var(--fs-value)', border: '1px solid var(--c-border)', borderRadius: 'var(--radius)' }}
          />
          <div style={{ display: 'flex', gap: '4px' }}>
            {(['date', 'name', 'category'] as const).map(s => (
              <button
                key={s}
                onClick={() => setSortBy(s)}
                style={{
                  padding: '3px 8px', fontSize: 'var(--fs-badge)', fontWeight: 600, cursor: 'pointer',
                  border: '1px solid var(--c-border)', borderRadius: 'var(--radius)',
                  background: sortBy === s ? 'var(--c-primary-light)' : 'transparent',
                  color: sortBy === s ? 'var(--c-primary)' : 'var(--c-text-muted)',
                }}
              >
                {s === 'date' ? 'Date' : s === 'name' ? 'Nom' : 'Catégorie'}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── Generate documents ── */}
      <div className="card" style={{ marginBottom: 'var(--sp-2)', background: '#faf5ff', border: '1px solid #e9d5ff' }}>
        <div className="card-header" style={{ borderColor: '#e9d5ff' }}>
          <h3 style={{ color: '#7c3aed' }}>Générer un Document</h3>
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--sp-2)' }}>
          {[
            { id: 'lettre-medecin', label: 'Lettre au Médecin', cat: 'LTR' as DocumentCategory, desc: 'Résumé diagnostic + plan' },
            { id: 'demande-ai', label: 'Demande AI', cat: 'ASS-DOC' as DocumentCategory, desc: 'Prise en charge AI' },
            { id: 'demande-lamal', label: 'Demande LaMal', cat: 'ASS-DOC' as DocumentCategory, desc: 'Prise en charge LaMal' },
            { id: 'devis', label: 'Devis de Traitement', cat: 'DEV' as DocumentCategory, desc: 'Basé sur plan' },
            { id: 'consentement', label: 'Consentement Éclairé', cat: 'CONS' as DocumentCategory, desc: 'Info patient + risques' },
            { id: 'attestation', label: 'Attestation de Traitement', cat: 'ASS-DOC' as DocumentCategory, desc: 'Pour l\'assurance' },
          ].map(tpl => (
            <button
              key={tpl.id}
              onClick={() => generateDocument(tpl.id, tpl.cat, patient, settings.clinicInfo)}
              style={{
                display: 'flex', flexDirection: 'column', alignItems: 'flex-start',
                padding: 'var(--sp-2) var(--sp-3)', border: '1px solid #d8b4fe', borderRadius: 'var(--radius)',
                background: '#fff', cursor: 'pointer', transition: 'all 0.15s', minWidth: '140px',
              }}
              onMouseEnter={e => { e.currentTarget.style.background = '#f3e8ff'; e.currentTarget.style.borderColor = '#a78bfa'; }}
              onMouseLeave={e => { e.currentTarget.style.background = '#fff'; e.currentTarget.style.borderColor = '#d8b4fe'; }}
            >
              <span style={{ fontWeight: 700, fontSize: 'var(--fs-value)', color: '#5b21b6' }}>{tpl.label}</span>
              <span style={{ fontSize: 'var(--fs-badge)', color: '#8b5cf6' }}>{tpl.desc}</span>
            </button>
          ))}
        </div>
      </div>

      {/* ── Document list ── */}
      {filteredDocs.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: 'var(--sp-6)', color: 'var(--c-text-muted)' }}>
          <div style={{ fontSize: '2rem', marginBottom: 'var(--sp-2)', opacity: 0.3 }}>&#128193;</div>
          <p style={{ margin: 0, fontWeight: 600 }}>Aucun document</p>
          <p style={{ margin: '4px 0 0', fontSize: 'var(--fs-small)' }}>Cliquez sur une catégorie ci-dessus pour ajouter un document</p>
        </div>
      ) : (
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 'var(--fs-value)' }}>
            <thead>
              <tr style={{ background: 'var(--c-bg)', borderBottom: '1px solid var(--c-border)' }}>
                <th style={{ textAlign: 'left', padding: 'var(--sp-2) var(--sp-3)', fontWeight: 700, fontSize: 'var(--fs-label)', color: 'var(--c-text-secondary)', width: '36px' }}></th>
                <th style={{ textAlign: 'left', padding: 'var(--sp-2)', fontWeight: 700, fontSize: 'var(--fs-label)', color: 'var(--c-text-secondary)' }}>Nom du document</th>
                <th style={{ textAlign: 'left', padding: 'var(--sp-2)', fontWeight: 700, fontSize: 'var(--fs-label)', color: 'var(--c-text-secondary)', width: '140px' }}>Catégorie</th>
                <th style={{ textAlign: 'center', padding: 'var(--sp-2)', fontWeight: 700, fontSize: 'var(--fs-label)', color: 'var(--c-text-secondary)', width: '90px' }}>Date</th>
                <th style={{ textAlign: 'right', padding: 'var(--sp-2)', fontWeight: 700, fontSize: 'var(--fs-label)', color: 'var(--c-text-secondary)', width: '70px' }}>Taille</th>
                <th style={{ padding: 'var(--sp-2) var(--sp-3)', width: '90px' }}></th>
              </tr>
            </thead>
            <tbody>
              {filteredDocs.map(doc => (
                <tr key={doc.id} style={{ borderBottom: '1px solid var(--c-border-light)', transition: 'background 0.1s' }}
                    onMouseEnter={e => (e.currentTarget.style.background = '#f8fafc')}
                    onMouseLeave={e => (e.currentTarget.style.background = '')}>
                  <td style={{ padding: 'var(--sp-1) var(--sp-3)', textAlign: 'center' }}>
                    <span style={{ display: 'inline-block', width: '28px', height: '28px', lineHeight: '28px', borderRadius: 'var(--radius)', fontSize: 'var(--fs-badge)', fontWeight: 800, color: '#fff', background: getIconColor(doc.mimeType), textAlign: 'center' }}>
                      {getFileIcon(doc.mimeType)}
                    </span>
                  </td>
                  <td style={{ padding: 'var(--sp-1) var(--sp-2)' }}>
                    {renamingId === doc.id ? (
                      <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
                        <input
                          type="text"
                          value={renameValue}
                          onChange={e => setRenameValue(e.target.value)}
                          onKeyDown={e => { if (e.key === 'Enter') handleConfirmRename(doc); if (e.key === 'Escape') setRenamingId(null); }}
                          autoFocus
                          style={{ flex: 1, height: '26px', padding: '0 var(--sp-2)', fontSize: 'var(--fs-value)', border: '1px solid var(--c-focus)', borderRadius: 'var(--radius)', outline: 'none' }}
                        />
                        <button onClick={() => handleConfirmRename(doc)} style={{ background: 'var(--c-filled)', color: '#fff', border: 'none', borderRadius: 'var(--radius)', padding: '2px 8px', fontSize: 'var(--fs-badge)', cursor: 'pointer', fontWeight: 700 }}>OK</button>
                        <button onClick={() => setRenamingId(null)} style={{ background: 'var(--c-bg)', color: 'var(--c-text-muted)', border: '1px solid var(--c-border)', borderRadius: 'var(--radius)', padding: '2px 8px', fontSize: 'var(--fs-badge)', cursor: 'pointer' }}>Annuler</button>
                      </div>
                    ) : (
                      <div>
                        <span style={{ fontWeight: 600, color: 'var(--c-text)' }}>{doc.displayName}</span>
                        {doc.originalName !== doc.displayName && (
                          <span style={{ display: 'block', fontSize: 'var(--fs-badge)', color: 'var(--c-text-muted)' }}>{doc.originalName}</span>
                        )}
                      </div>
                    )}
                  </td>
                  <td style={{ padding: 'var(--sp-1) var(--sp-2)' }}>
                    <select
                      value={doc.category}
                      onChange={e => handleCategoryChange(doc, e.target.value as DocumentCategory)}
                      style={{ height: '26px', fontSize: 'var(--fs-badge)', border: '1px solid var(--c-border)', borderRadius: 'var(--radius)', padding: '0 4px', fontFamily: 'inherit', fontWeight: 600, color: 'var(--c-primary)', background: 'var(--c-primary-light)' }}
                    >
                      {DOCUMENT_CATEGORIES.map(cat => (
                        <option key={cat.code} value={cat.code}>{cat.label}</option>
                      ))}
                    </select>
                  </td>
                  <td style={{ padding: 'var(--sp-1) var(--sp-2)', textAlign: 'center', fontSize: 'var(--fs-small)', color: 'var(--c-text-muted)' }}>
                    {doc.dateAdded}
                  </td>
                  <td style={{ padding: 'var(--sp-1) var(--sp-2)', textAlign: 'right', fontSize: 'var(--fs-small)', color: 'var(--c-text-muted)' }}>
                    {formatFileSize(doc.size)}
                  </td>
                  <td style={{ padding: 'var(--sp-1) var(--sp-3)', textAlign: 'right' }}>
                    <div style={{ display: 'flex', gap: '4px', justifyContent: 'flex-end' }}>
                      <button
                        onClick={() => handleStartRename(doc)}
                        title="Renommer"
                        style={{ background: 'transparent', border: '1px solid var(--c-border)', borderRadius: 'var(--radius)', padding: '2px 6px', cursor: 'pointer', fontSize: 'var(--fs-badge)', color: 'var(--c-text-secondary)', fontWeight: 600 }}
                      >
                        Aa
                      </button>
                      <button
                        onClick={() => handleDelete(doc)}
                        title="Supprimer"
                        style={{ background: 'transparent', border: '1px solid #fecaca', borderRadius: 'var(--radius)', padding: '2px 6px', cursor: 'pointer', fontSize: 'var(--fs-badge)', color: 'var(--c-alert)', fontWeight: 700 }}
                      >
                        x
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* ── Stats footer ── */}
      <div style={{ marginTop: 'var(--sp-2)', display: 'flex', justifyContent: 'space-between', fontSize: 'var(--fs-badge)', color: 'var(--c-text-muted)', padding: '0 var(--sp-1)' }}>
        <span>{filteredDocs.length} document{filteredDocs.length > 1 ? 's' : ''}{filterCategory !== 'ALL' ? ` dans ${catLabel(filterCategory as DocumentCategory)}` : ''}</span>
        <span>Total : {formatFileSize(docs.reduce((sum, d) => sum + d.size, 0))}</span>
      </div>
    </div>
  );
}
