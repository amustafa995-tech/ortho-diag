import React, { useState, useEffect, useRef } from 'react';

type DocFile = { name: string; url: string };

const FormContext = React.createContext<any>(null);

export const GLOBAL_KEYS = [
  'id', 'nom', 'prenom', 'pratique', 'sexe', 'dateNaissance', 'datePremiereConsult', 'age',
  'avs', 'compOrtho', 'medecinTraitant', 'medecinDentaire', 'autreInfo',
  'maladiesChroniques', 'maladiesChroniquesDetails', 'hasChirurgies', 'chirurgiesAnterieures',
  'hasTraitements', 'traitementsCours', 'allergiesMedic', 'hasAutreGen', 'autreGen',
  'antecFamExtract', 'carieRecurrente', 'sensibilite', 'hasOrthoPasse', 'traitementsOrthoPasses',
  'hasAutreDent', 'autreDent', 'autreAntecDent', 'mauvaisesHabitudes', 'motifConsultation',
  'praticien', 'dention', 'implant', 'implantDent', 'documents', 'sessions', 'activeSessionId'
];

export const initialSession = {
  id: "T0",
  date: new Date().toISOString().split('T')[0],
  nomSession: "Bilan Initial (T0)",
  face: "", competenceLabiale: "", expoIncisives: "", profil: "", angleNasolabial: "", angleLabiomental: "", gummySmile: "", troisQuarts: "", symetrieVisage: "", asymetrieDetails: "",
  hygieneClin: "", parodonte: "", phenotype: "", hasCaries: false, cariesDent: "", hasFreins: false, freinsDent: "", hasParodontite: false, parodontiteDetails: "",
  hasSuccionPouceClin: false, hasInterpoLabial: false, hasDeglutitionAtypique: false, respiClin: "", hasRincageDents: false, hasAtm: false, succionPouceDetails: "", interpoLabialDetails: "", deglutitionAtypiqueDetails: "", rincageDentsDetails: "", atmDetails: "", anamnGenClin: "", remarqueClin: "", opgRemarque: "",
  overjet: "", classeMolaireD: "", classeMolaireG: "", classeCanineD: "", classeCanineG: "", hasXBiteAnt: false, xbiteAntDent: "", overbite: "", cdsD: "", cdsG: "", hasOcclusalCant: false, hasTraumatisant: false, lm: "", lmDetails: "", hasXSBitePost: false, xsbitePostDent: "",
  t16:'',t15:'',t14:'',t13:'',t12:'',t11:'',t21:'',t22:'',t23:'',t24:'',t25:'',t26:'',
  t46:'',t45:'',t44:'',t43:'',t42:'',t41:'',t31:'',t32:'',t33:'',t34:'',t35:'',t36:'',
  dispSup1513:'',dispSup1211:'',dispSup2122:'',dispSup2325:'',
  dispInf4543:'',dispInf4241:'',dispInf3132:'',dispInf3335:'',
  distInterMolSup:'',distInterMolInf:'', distPMSup:'',distPMInf:'', distCanSup:'',distCanInf:'', isDroschlActive: false,
  anb: "", spasppMego: "", incisifSpaspp: "", incisifMego: "", appS1: "", appS2: "", appS3: "",
  sna: "", snb: "", wits: "", snSpaspp: "", snMego: "", incisifSn: "", incisifIncisif: "",
  opgPresenceRas: true, opgPositionRas: true, opgProportionRas: true, opgPathologieRas: true, 
  opgPresence: "", opgPosition: "", opgProportion: "", opgPathologie: "", radioOverview: "",
  planTraitement1: "", planTraitement2: "", planTraitement3: "",
  planTraitement4: "", planTraitement5: "", planTraitement6: ""
};

const CephInput = ({ label, name, normStr, ideal, dev }: { label: string, name: string, normStr: string, ideal: number, dev: number }) => {
  const { data, handleChange } = React.useContext(FormContext);
  const valStr = (data as any)[name];
  const val = parseFloat((valStr || '').replace(',', '.'));
  const isError = !isNaN(val) && (val < ideal - dev || val > ideal + dev);
  
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'minmax(150px, 1fr) 100px', alignItems: 'center', gap: '1rem', justifyItems: 'end' }}>
      <div style={{ textAlign: 'right', display: 'flex', justifyContent: 'flex-end', alignItems: 'baseline', gap: '0.3rem' }}>
        <span style={{ color: '#0f172a', fontWeight: 500, fontSize: '0.85rem' }}>{label}</span>
        <span style={{ color: '#64748b', fontSize: '0.75rem', fontWeight: 400 }}>({normStr})</span>
      </div>
      <input 
        type="text" inputMode="decimal"
        name={name}
        value={valStr || ''}
        onChange={handleChange}
        placeholder="-"
        style={{
          width: '100%', padding: '0.3rem 0.5rem', fontSize: '0.9rem', textAlign: 'center',
          border: '1px solid var(--border-color)', borderRadius: '4px',
          color: isError ? '#dc2626' : 'var(--text-main)',
          fontWeight: isError ? 700 : 500,
          background: '#fff',
          boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.05)'
        }}
        className={!valStr ? 'field-empty' : ''}
      />
    </div>
  );
};

const OpgToggle = ({ label, rasField, detailField }: { label: string, rasField: string, detailField: string }) => {
  const { data, handleChange } = React.useContext(FormContext);
  const isRAS = !!(data as any)[rasField];
  
  return (
    <div style={{ display: 'flex', alignItems: 'center', marginBottom: '0.5rem', gap: '1rem', width: '100%', flexWrap: 'wrap' }}>
      <div style={{ width: '100px', fontWeight: 600, color: '#0f172a', fontSize: '0.9rem' }}>{label}</div>
      <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 500, color: '#475569', minWidth: '60px' }}>
        <input type="checkbox" name={rasField} checked={isRAS} onChange={handleChange} style={{ transform: 'scale(1.1)', margin: 0 }} /> RAS
      </label>
      {!isRAS && (
        <input 
             type="text" 
             name={detailField} 
             value={(data as any)[detailField] || ''} 
             onChange={handleChange} 
             placeholder="Précisez..." 
             className="detail-fade"
             style={{flex: 1, minWidth: '140px', padding:'0.2rem 0.4rem', fontSize:'0.85rem', border:'1px solid #cbd5e1', borderRadius:'4px', backgroundColor: '#fff'}} 
        />
      )}
    </div>
  );
};

const Input = ({ label, name, type = 'text', ph = '', refObj = null, width='100%', overrideValue, readOnly=false, ti }: any) => {
  const { data, handleChange } = React.useContext(FormContext);
  const val = overrideValue !== undefined ? overrideValue : (data as any)[name];
  return (
    <div className="form-group" style={{width, margin: label ? '0 0 0.5rem 0' : '0' }}>
      {label && <label>{label}</label>}
      <input 
        type={type} 
        name={name} 
        value={val} 
        onChange={handleChange} 
        placeholder={ph} 
        ref={refObj} 
        readOnly={readOnly}
        tabIndex={ti}
        className={!val && !readOnly ? 'field-empty' : ''}
        style={readOnly ? { backgroundColor: '#f1f5f9', color: '#64748b', cursor: 'not-allowed' } : undefined}
      />
    </div>
  );
};

const InlineMetric = ({ label, name, maxLength = 3, ti }: any) => {
  const { data, handleChange } = React.useContext(FormContext);
  const val = (data as any)[name] || '';
  return (
    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', marginRight: '1rem', marginBottom: '0.5rem' }}>
      {label && <label style={{ margin: 0, fontWeight: 600 }}>{label}</label>}
      <input 
        type="text" 
        name={name} 
        value={val} 
        onChange={handleChange} 
        maxLength={maxLength}
        tabIndex={ti}
        className={`inline-metric-input ${!val ? 'field-empty' : ''}`}
        style={{ width: '50px', padding: '0.3rem', fontSize: '0.9rem', textAlign: 'center', borderRadius: '4px', color: '#0f172a', background: '#ffffff', boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.05)' }} 
      />
    </div>
  );
};

const Select = ({ label, name, options, normValue, refObj=null, ti }: any) => {
  const { data, handleChange } = React.useContext(FormContext);
  const val = (data as any)[name];
  return (
    <div className="form-group" style={{margin: label ? '0 0 0.5rem 0' : '0'}}>
      {label && <label>{label} {normValue && <span style={{color: '#94a3b8', fontStyle: 'italic', fontWeight: 400, marginLeft: '4px'}}>{normValue}</span>}</label>}
      <select name={name} value={val} onChange={handleChange} ref={refObj} tabIndex={ti} className={!val ? 'field-empty' : ''}>
        <option value="">-</option>
        {options.map((o:string) => <option key={o} value={o}>{o}</option>)}
      </select>
    </div>
  );
};

const Checkbox = ({ label, name, ti }: any) => {
  const { data, handleChange } = React.useContext(FormContext);
  const val = name.includes('.') ? (data as any)[name.split('.')[0]][name.split('.')[1]] : (data as any)[name];
  return (
    <label style={{display:'inline-flex', alignItems:'center', gap:'6px', cursor:'pointer', whiteSpace: 'nowrap', fontWeight:500, color:'#0f172a', fontSize:'0.9rem'}}>
      <input type="checkbox" name={name} checked={val} onChange={handleChange} tabIndex={ti} style={{width:'auto', margin:0, transform: 'scale(1.1)'}}/> {label}
    </label>
  );
};

const ConditionToggle = ({ label, fieldName }: { label: string, fieldName: string }) => {
  const { data, handleChange } = React.useContext(FormContext);
  const isChecked = data.maladiesChroniques[fieldName];
  const details = data.maladiesChroniquesDetails[fieldName];
  
  return (
    <div style={{marginBottom: '0.25rem'}}>
      <Checkbox label={label} name={`maladiesChroniques.${fieldName}`} />
      {isChecked && (
        <div style={{marginTop: '0.1rem', paddingLeft: '1.25rem', marginBottom: '0.25rem'}}>
          <input 
             type="text" 
             name={`maladiesChroniquesDetails.${fieldName}`} 
             value={details} 
             onChange={handleChange} 
             placeholder={`Détail : ${label}...`} 
             style={{width: '100%', padding:'0.25rem 0.5rem', fontSize:'0.8rem', border:'1px solid var(--border-color)', borderRadius:'3px'}} 
          />
        </div>
      )}
    </div>
  );
};

const ClinicalToggle = ({ label, stateField, detailField, ti }: { label: string, stateField: string, detailField: string, ti?: number }) => {
  const { data, handleChange } = React.useContext(FormContext);
  const isChecked = !!data[stateField];
  
  return (
    <div style={{ display: 'flex', alignItems: 'center', marginBottom: '0.25rem', gap: '0.5rem', flexWrap: 'wrap' }}>
      <Checkbox label={label} name={stateField} ti={ti} />
      {isChecked && (
        <input 
             type="text" 
             name={detailField} 
             value={data[detailField] || ''} 
             onChange={handleChange} 
             tabIndex={ti ? ti + 1 : undefined}
             placeholder="Dent(s)..." 
             className="detail-fade"
             style={{width: '140px', padding:'0.2rem 0.4rem', fontSize:'0.85rem', border:'1px solid #cbd5e1', borderRadius:'4px', backgroundColor: '#fff'}} 
        />
      )}
    </div>
  );
};

const TwoWayCheck = ({ label, name, options, detailOption, detailName, ti }: any) => {
  const { data, handleChange } = React.useContext(FormContext);
  const val = data[name];
  return (
    <div className="form-group" style={{ margin: label ? '0 0 0.5rem 0' : '0' }}>
      {label && <label>{label}</label>}
      <div className={`twoway-group ${val ? 'field-done' : 'field-pending'}`} style={{ display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
        {options.map((opt: string, i: number) => (
          <div key={opt} style={{ display: 'flex', alignItems: 'center' }}>
            <label style={{display:'inline-flex', alignItems:'center', gap:'6px', cursor:'pointer', fontSize:'0.9rem', color: '#0f172a', fontWeight: 500, margin: 0}}>
              <input type="checkbox" checked={val === opt} tabIndex={ti ? ti + i : undefined} onChange={(e) => handleChange({ target: { name, value: e.target.checked ? opt : '', type: 'text' } })} style={{margin:0, transform: 'scale(1.1)'}} /> 
              {opt}
            </label>
            {val === detailOption && opt === detailOption && detailName && (
              <input type="text" name={detailName} value={data[detailName]||''} onChange={handleChange} tabIndex={ti ? ti + 2 : undefined} placeholder="Précisez..." className="detail-fade" style={{marginLeft: '0.5rem', width: '130px', padding:'0.2rem 0.4rem', fontSize:'0.85rem', border:'1px solid #cbd5e1', borderRadius:'4px'}} />
            )}
          </div>
        ))}
      </div>
    </div>
  );
};



export default function App() {
  const [activeTab, setActiveTab] = useState('overview');
  const [isSessionModalOpen, setIsSessionModalOpen] = useState(false);
  const [sessionToDelete, setSessionToDelete] = useState<string | null>(null);
  const [newDateValue, setNewDateValue] = useState(new Date().toISOString().split('T')[0]);
  const firstInputRef = useRef<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>(null);

  useEffect(() => {
    if (firstInputRef.current) {
      firstInputRef.current.focus();
    }
  }, [activeTab]);

  // Settings State
  const [doctors, setDoctors] = useState([
    { id: 1, nom: "Martin", prenom: "Luc" },
    { id: 2, nom: "Roux", prenom: "Sophie" }
  ]);
  const [newDoctor, setNewDoctor] = useState({ nom: "", prenom: "" });

  const [praticiens, setPraticiens] = useState([
    { id: 1, nom: "Al-Yassary", prenom: "M.", abrev: "Dr. MA" },
    { id: 2, nom: "Dubois", prenom: "J.", abrev: "Dr. JD" }
  ]);
  const [newPraticien, setNewPraticien] = useState({ nom: "", prenom: "", abrev: "" });

  const handleAddDoctor = () => {
    if (newDoctor.nom) {
      setDoctors([...doctors, { id: Date.now(), ...newDoctor }]);
      setNewDoctor({ nom: "", prenom: "" });
    }
  };

  const handleAddPraticien = () => {
    if (newPraticien.nom) {
      setPraticiens([...praticiens, { id: Date.now(), ...newPraticien }]);
      setNewPraticien({ nom: "", prenom: "", abrev: "" });
    }
  };

  const handleDeleteDoctor = (id: number) => {
    setDoctors(doctors.filter(d => d.id !== id));
  };

  const handleDeletePraticien = (id: number) => {
    setPraticiens(praticiens.filter(p => p.id !== id));
  };

  const [data, setData] = useState({
    id: "VDDS-001", nom: "Dupont", prenom: "Jean", pratique: "", sexe: "M", dateNaissance: "", datePremiereConsult: "", age: "",
    avs: "", compOrtho: "", medecinTraitant: "", medecinDentaire: "", autreInfo: "",
    maladiesChroniques: { diabete: false, hypertension: false, allergies: false, cardio: false, respi: false, neuro: false },
    maladiesChroniquesDetails: { diabete: "", hypertension: "", allergies: "", cardio: "", respi: "", neuro: "" },
    hasChirurgies: false, chirurgiesAnterieures: "", hasTraitements: false, traitementsCours: "", allergiesMedic: "", hasAutreGen: false, autreGen: "",
    antecFamExtract: false, carieRecurrente: false, sensibilite: false, hasOrthoPasse: false, traitementsOrthoPasses: "", hasAutreDent: false, autreDent: "", autreAntecDent: "",
    mauvaisesHabitudes: { succionPouce: false, bruxisme: false, rongerOngles: false, respiBuccale: false },
    motifConsultation: "Dents en avant", praticien: "Dr. MA", dention: "", implant: "", implantDent: "",
    documents: {
      idCard: [] as DocFile[],
      insurance: [] as DocFile[],
      consent: [] as DocFile[],
      other: [] as DocFile[]
    },
    sessions: [initialSession],
    activeSessionId: "T0"
  });

  const activeSession = data.sessions.find(s => s.id === data.activeSessionId) || data.sessions[0];
  const viewData = { ...data, ...activeSession };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    const isGlobal = GLOBAL_KEYS.includes(name) || GLOBAL_KEYS.includes(name.split('.')[0]);

    setData(prev => {
      if (isGlobal) {
        if (type === 'checkbox') {
          const checked = (e.target as HTMLInputElement).checked;
          if (name.includes('.')) {
            const [p, c] = name.split('.');
            return { ...prev, [p]: { ...(prev as any)[p], [c]: checked } };
          } else return { ...prev, [name]: checked };
        } else {
           if (name.includes('.')) {
             const [p, c] = name.split('.');
             return { ...prev, [p]: { ...(prev as any)[p], [c]: value } };
           } else {
             return { ...prev, [name]: value };
           }
        }
      } else {
        const updatedSessions = prev.sessions.map(sess => {
          if (sess.id !== prev.activeSessionId) return sess;
          if (type === 'checkbox') {
             return { ...sess, [name]: (e.target as HTMLInputElement).checked };
          } else {
             return { ...sess, [name]: value };
          }
        });
        return { ...prev, sessions: updatedSessions };
      }
    });
  };

  const SessionSelector = () => (
    <div className="no-print" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', background: '#f8fafc', padding: '0.25rem 0.5rem', borderRadius: '4px', border: '1px solid #e2e8f0', marginLeft: 'auto' }}>
      <label style={{ fontWeight: 600, color: 'var(--text-main)', fontSize: '0.85rem', margin: 0 }}>📅 Session :</label>
      <select 
        value={data.activeSessionId} 
        onChange={(e) => setData(prev => ({ ...prev, activeSessionId: e.target.value }))}
        style={{ padding: '0.25rem 0.5rem', borderRadius: '3px', border: '1px solid #cbd5e1', fontSize: '0.85rem', backgroundColor: '#fff', cursor: 'pointer', outline:'none' }}
      >
        {data.sessions.map((s) => (
          <option key={s.id} value={s.id}>{new Date(s.date).toLocaleDateString('fr-CH')} - {s.nomSession}</option>
        ))}
      </select>
      <button 
        onClick={() => setIsSessionModalOpen(true)}
        style={{ padding: '0.25rem 0.6rem', fontSize: '0.8rem', backgroundColor: '#e2e8f0', color: 'var(--text-main)', border: '1px solid #cbd5e1', cursor: 'pointer', borderRadius: '3px', fontWeight:600 }}
      >
        ⚙️ Sessions
      </button>
    </div>
  );

  const handleFileUpload = (category: 'idCard' | 'insurance' | 'consent' | 'other', e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files).map(f => ({
         name: f.name,
         url: URL.createObjectURL(f)
      }));
      setData(prev => ({
         ...prev,
         documents: {
           ...prev.documents,
           [category]: [...prev.documents[category], ...newFiles]
         }
      }));
    }
  };

  const removeFile = (category: 'idCard' | 'insurance' | 'consent' | 'other', index: number) => {
    setData(prev => {
       const newList = [...categoryList(prev, category)];
       newList.splice(index, 1);
       return { ...prev, documents: { ...prev.documents, [category]: newList } };
    });
  };

  const categoryList = (state: typeof data, category: 'idCard' | 'insurance' | 'consent' | 'other') => state.documents[category];



  // ── Keyboard shortcuts (Ctrl+1..5) ──
  React.useEffect(() => {
    const tabs = ['info', 'documents', 'clinique', 'moulages', 'cepha'] as const;
    const handler = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key >= '1' && e.key <= '5') {
        e.preventDefault();
        setActiveTab(tabs[parseInt(e.key) - 1]);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  const getSafeDate = (dateStr: string) => {
    if (!dateStr) return null;
    const parsed = new Date(dateStr.replace(/-/g, '/'));
    return isNaN(parsed.getTime()) ? null : parsed;
  };

  const ageCalcule = React.useMemo(() => {
    const birthDate = getSafeDate(viewData.dateNaissance);
    if (!birthDate) return "";
    const targetDate = getSafeDate(viewData.datePremiereConsult) || new Date();
    let calculatedAge = targetDate.getFullYear() - birthDate.getFullYear();
    const m = targetDate.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && targetDate.getDate() < birthDate.getDate())) {
      calculatedAge--;
    }
    return calculatedAge >= 0 ? calculatedAge.toString() : "";
  }, [viewData.dateNaissance, viewData.datePremiereConsult]);

  // Section 1 completion counters
  const identityFields = ['nom', 'prenom', 'dateNaissance', 'datePremiereConsult', 'sexe'];
  const identityDone = identityFields.filter(f => !!(viewData as any)[f]).length;
  const adminFields = ['avs', 'compOrtho', 'medecinTraitant', 'medecinDentaire'];
  const adminDone = adminFields.filter(f => !!(viewData as any)[f]).length;
  const docCount = Object.values(viewData.documents).reduce((sum, arr) => sum + arr.length, 0);

  const dataWithAge = { ...viewData, age: ageCalcule };

  const n = (key: string): number => {
    const val = (viewData as any)[key];
    if (typeof val !== 'string') return parseFloat(val) || 0;
    return parseFloat(val.replace(',', '.')) || 0;
  };

  return (
    <FormContext.Provider value={{ data: dataWithAge as any, handleChange }}>
      <div className="app-container">
        <aside className="sidebar no-print">
        <div className="sidebar-header" style={{padding: '1.5rem 1rem'}}>
          <h1 style={{fontSize:'1.1rem', margin:0, color:'var(--primary-color)'}}>OrthoDiag</h1>
        </div>
        <div style={{ padding: '0 1rem', marginTop: '1rem' }}>
          <div 
            onClick={() => setActiveTab('overview')}
            title="Cliquez pour revenir à l'Overview"
            style={{ padding: '0.75rem', backgroundColor: '#f1f5f9', borderRadius: '4px', borderLeft: '3px solid var(--primary-color)', cursor: 'pointer', transition: 'background-color 0.2s' }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#e2e8f0'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#f1f5f9'}
          >
            <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--text-muted)' }}>Mise à jour VDDS : Auto</p>
            <p style={{ margin: '2px 0', fontSize: '0.9rem', color: 'var(--text-main)', fontWeight: 700 }}>{viewData.nom || 'Patient'} {viewData.prenom}</p>
            <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--text-muted)' }}>Sexe: {viewData.sexe||'-'} | Âge: {ageCalcule||'-'}</p>
          </div>
        </div>
          <nav className="sidebar-nav">
          <button tabIndex={-1} className={`nav-item ${activeTab === 'info' ? 'active' : ''}`} onClick={() => setActiveTab('info')} style={{display:'flex', justifyContent:'space-between', alignItems:'center'}}>
            <span>1. Informations</span>
            <span style={{fontSize:'0.65rem', opacity:0.5}}>Ctrl+1</span>
          </button>
          <button tabIndex={-1} className={`nav-item ${activeTab === 'documents' ? 'active' : ''}`} onClick={() => setActiveTab('documents')} style={{display:'flex', justifyContent:'space-between', alignItems:'center'}}>
            <span>2. Documents</span>
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
            Réglages
          </button>
          <button tabIndex={-1} className={`nav-item ${activeTab === 'bilan' ? 'active' : ''}`} onClick={() => setActiveTab('bilan')} style={{ backgroundColor: activeTab === 'bilan' ? 'var(--primary-color)' : '#e2e8f0', color: activeTab === 'bilan' ? 'white' : 'var(--text-main)', fontWeight:700, justifyContent: 'center' }}>
            Synthèse / PDF
          </button>
        </nav>
      </aside>

      <main className="main-content">
        <div className="module-container" style={{maxWidth: '1200px'}}>
          
          {activeTab !== 'settings' && (
            <div className="no-print" style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginBottom: '1rem' }}>
               {(activeTab === 'moulages' || activeTab === 'cepha') && (
                 <label className="btn" style={{padding:'0.5rem 1rem', fontSize:'0.85rem', background:'#e2e8f0', color:'#0f172a', border:'1px solid #cbd5e1', cursor:'pointer', fontWeight:600}}>
                    <input type="file" accept=".xlsx,.xls,.csv" style={{display:'none'}} onChange={(e) => {
                      if (e.target.files && e.target.files.length > 0) {
                        const moduleName = activeTab === 'moulages' ? "Moulages (24 dents, espaces...)" : "Céphalométrique (Valeurs)";
                        alert(`📊 Fichier détecté : ${e.target.files[0].name}\n\nFonction Bientôt Disponible !\nDès que vous me fournirez votre modèle Excel (template), je coderai l'algorithme pour extraire automatiquement les données (${moduleName}) en 1 seconde.`);
                        e.target.value = ''; 
                      }
                    }}/>
                    📥 Importer Excel / CSV
                 </label>
               )}
            </div>
          )}

          {activeTab === 'settings' && (
            <div className="module-content">
              <div className="module-header"><h2 style={{color: 'var(--text-main)'}}>Réglages (Administratif)</h2></div>
              
              <div className="card">
                <h3>Praticiens du Cabinet</h3>
                <p style={{fontSize: '0.85rem', color:'var(--text-muted)', marginBottom: '1rem'}}>
                  Liste des orthodontistes travaillant sur OrthoDiag dans votre clinique.
                </p>
                <div style={{display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(150px, 1fr))', gap:'0.5rem', alignItems:'end', marginBottom: '1rem', paddingBottom: '1rem', borderBottom:'1px solid var(--border-color)'}}>
                  <div className="form-group" style={{margin:0}}><label>Nom</label><input type="text" value={newPraticien.nom} onChange={e => setNewPraticien({...newPraticien, nom: e.target.value})} placeholder="Ex: Al-Yassary" /></div>
                  <div className="form-group" style={{margin:0}}><label>Prénom (Initiale)</label><input type="text" value={newPraticien.prenom} onChange={e => setNewPraticien({...newPraticien, prenom: e.target.value})} placeholder="Ex: M." /></div>
                  <div className="form-group" style={{margin:0}}><label>Abréviation</label><input type="text" value={newPraticien.abrev} onChange={e => setNewPraticien({...newPraticien, abrev: e.target.value})} placeholder="Ex: Dr. MA" /></div>
                  <div><button className="btn btn-primary" style={{width:'100%', padding:'0.5rem'}} onClick={handleAddPraticien}>Ajouter</button></div>
                </div>
                <div style={{fontSize: '0.9rem'}}>
                  <strong>Liste Actuelle :</strong>
                  <ul style={{marginTop:'0.5rem', paddingLeft: '20px', color: 'var(--text-main)'}}>
                     {praticiens.map(p => (
                       <li key={p.id} style={{marginBottom: '4px'}}>
                         {p.nom} {p.prenom} {p.abrev && <span style={{color:'var(--text-muted)'}}>({p.abrev})</span>}
                         <button onClick={() => handleDeletePraticien(p.id)} style={{color:'red', cursor:'pointer', border:'none', background:'none', marginLeft:'10px', fontWeight:'bold'}}>×</button>
                       </li>
                     ))}
                  </ul>
                  {praticiens.length === 0 && <p style={{color:'var(--text-muted)'}}>Aucun praticien enregistré.</p>}
                </div>
              </div>

              <div className="card">
                <h3>Médecins Dentistes Correspondants</h3>
                <p style={{fontSize: '0.85rem', color:'var(--text-muted)', marginBottom: '1rem'}}>
                  Carnet d'adresses de vos confrères dentistes. (Module en arrière-plan pour le moment).
                </p>
                <div style={{display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(150px, 1fr))', gap:'0.5rem', alignItems:'end', marginBottom: '1rem', paddingBottom: '1rem', borderBottom:'1px solid var(--border-color)'}}>
                  <div className="form-group" style={{margin:0}}><label>Nom</label><input type="text" value={newDoctor.nom} onChange={e => setNewDoctor({...newDoctor, nom: e.target.value})} placeholder="Ex: Dubois" /></div>
                  <div className="form-group" style={{margin:0}}><label>Prénom</label><input type="text" value={newDoctor.prenom} onChange={e => setNewDoctor({...newDoctor, prenom: e.target.value})} placeholder="Ex: Julien" /></div>
                  <div><button className="btn btn-primary" style={{width:'100%', padding:'0.5rem'}} onClick={handleAddDoctor}>Ajouter</button></div>
                </div>

                <div style={{fontSize: '0.9rem'}}>
                  <strong>Liste Actuelle :</strong>
                  <ul style={{marginTop:'0.5rem', paddingLeft: '20px', color: 'var(--text-main)'}}>
                    {doctors.map(d => (
                       <li key={d.id} style={{marginBottom: '4px'}}>
                         {d.nom} {d.prenom}
                         <button onClick={() => handleDeleteDoctor(d.id)} style={{color:'red', cursor:'pointer', border:'none', background:'none', marginLeft:'10px', fontWeight:'bold'}}>×</button>
                       </li>
                    ))}
                  </ul>
                  {doctors.length === 0 && <p style={{color:'var(--text-muted)'}}>Aucun dentiste enregistré.</p>}
                </div>
              </div>
            </div>
          )}

          {(activeTab === 'overview' || activeTab === 'info') && (
            <div className="module-content">
              <div className="module-header"><h2>1. Informations</h2></div>
              
              <div className="card" style={{paddingBottom: '1rem'}}>
                <div className="card-header">
                  <h3>Identité & Acteurs</h3>
                  <span className={`completion-badge ${identityDone === identityFields.length ? 'complete' : ''}`}>{identityDone}/{identityFields.length}</span>
                </div>
                <div style={{display: 'grid', gridTemplateColumns: '1fr 1.5fr 1.5fr 1.5fr 0.8fr', gap: '1rem', marginBottom: '0.75rem'}}>
                  <Input label="ID" name="id" refObj={firstInputRef} />
                  <Input label="Nom" name="nom" />
                  <Input label="Prénom" name="prenom" />
                  <div className="form-group" style={{margin:0}}>
                    <label>Praticien</label>
                    <select name="praticien" value={viewData.praticien} onChange={handleChange} className={!viewData.praticien ? 'field-empty' : ''} style={{padding: '0.5rem 0.75rem', borderRadius: '3px', border: '1px solid var(--border-color)', width: '100%', fontSize: '0.9rem'}}>
                      <option value="">- Sél. -</option>
                      {praticiens.map(p => (
                        <option key={p.id} value={p.abrev}>{p.abrev}</option>
                      ))}
                    </select>
                  </div>
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
                  <Input label="Médecin Traitant" name="medecinTraitant" placeholder="Ex: Dr. Martin (Généraliste)" />
                  <div className="form-group" style={{margin:0}}>
                    <label>Médecin Dentiste</label>
                    <select name="medecinDentaire" value={viewData.medecinDentaire} onChange={handleChange} className={!viewData.medecinDentaire ? 'field-empty' : ''} style={{padding: '0.5rem 0.75rem', borderRadius: '3px', border: '1px solid var(--border-color)', width: '100%', fontSize: '0.9rem'}}>
                      <option value="">- Saisie libre ou sélection -</option>
                      {doctors.map(d => (
                        <option key={d.id} value={`${d.nom} ${d.prenom}`}>{d.nom} {d.prenom}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
              
              <div className="card" style={{paddingBottom: '1rem'}}>
                <div className="card-header">
                  <h3>Anamnèse & Plaintes</h3>
                </div>
                <div style={{marginBottom: '1rem'}}>
                  <Input label="Motif de Consultation (Plainte principale)" name="motifConsultation" width="100%" />
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
                           {viewData.hasChirurgies && (
                             <div style={{marginTop: '0.1rem', paddingLeft: '1.25rem', marginBottom:'0.25rem'}}>
                               <input type="text" name="chirurgiesAnterieures" value={viewData.chirurgiesAnterieures} onChange={handleChange} placeholder="Précisez..." style={{width:'100%', padding:'0.25rem 0.5rem', fontSize:'0.8rem', border:'1px solid var(--border-color)', borderRadius:'3px'}} />
                             </div>
                           )}
                         </div>

                         <div style={{marginBottom: '0.25rem'}}>
                           <Checkbox label="Traitements Actuels" name="hasTraitements" />
                           {viewData.hasTraitements && (
                             <div style={{marginTop: '0.1rem', paddingLeft: '1.25rem', marginBottom:'0.25rem'}}>
                               <input type="text" name="traitementsCours" value={viewData.traitementsCours} onChange={handleChange} placeholder="Précisez..." style={{width:'100%', padding:'0.25rem 0.5rem', fontSize:'0.8rem', border:'1px solid var(--border-color)', borderRadius:'3px'}} />
                             </div>
                           )}
                         </div>

                         <div style={{marginBottom: '0.25rem'}}>
                           <Checkbox label="Autre (Médical)" name="hasAutreGen" />
                           {viewData.hasAutreGen && (
                             <div style={{marginTop: '0.1rem', paddingLeft: '1.25rem', marginBottom:'0.25rem'}}>
                               <input type="text" name="autreGen" value={viewData.autreGen} onChange={handleChange} placeholder="Précisez divers médical..." style={{width:'100%', padding:'0.25rem 0.5rem', fontSize:'0.8rem', border:'1px solid var(--border-color)', borderRadius:'3px'}} />
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
                         {viewData.hasOrthoPasse && (
                           <div style={{marginTop: '0.1rem', paddingLeft: '1.25rem', marginBottom:'0.25rem'}}>
                              <input type="text" name="traitementsOrthoPasses" value={viewData.traitementsOrthoPasses} onChange={handleChange} placeholder="Précisez l'ancien traitement..." style={{width:'100%', padding:'0.25rem 0.5rem', fontSize:'0.8rem', border:'1px solid var(--border-color)', borderRadius:'3px'}} />
                           </div>
                         )}
                       </div>

                       <div style={{marginBottom: '0.25rem'}}>
                         <Checkbox label="Autre (Dentaire)" name="hasAutreDent" />
                         {viewData.hasAutreDent && (
                           <div style={{marginTop: '0.1rem', paddingLeft: '1.25rem', marginBottom:'0.25rem'}}>
                              <input type="text" name="autreDent" value={viewData.autreDent} onChange={handleChange} placeholder="Précisez divers dentaire..." style={{width:'100%', padding:'0.25rem 0.5rem', fontSize:'0.8rem', border:'1px solid var(--border-color)', borderRadius:'3px'}} />
                           </div>
                         )}
                       </div>
                     </div>
                   </div>
                </div>
              </div>

            </div>
          )}

          {(activeTab === 'overview' || activeTab === 'documents') && (
            <div className="module-content">
              <div className="module-header"><h2>2. Documents</h2></div>

              <div className="card">
                <div className="card-header">
                  <h3>Dossier Documentaire</h3>
                  <span className={`completion-badge ${docCount > 0 ? 'complete' : ''}`}>{docCount} fichier{docCount !== 1 ? 's' : ''}</span>
                </div>
                <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.75rem'}}>
                   
                   <div className={`upload-zone ${viewData.documents.idCard.length > 0 ? 'has-files' : ''}`}>
                     <span className="upload-icon">🪪</span>
                     <h4>Carte d'Identité</h4>
                     <span className="upload-hint">{viewData.documents.idCard.length > 0 ? `${viewData.documents.idCard.length} fichier(s)` : 'Cliquer pour ajouter'}</span>
                     <input type="file" multiple onChange={(e) => handleFileUpload('idCard', e)} />
                   </div>

                   <div className={`upload-zone ${viewData.documents.insurance.length > 0 ? 'has-files' : ''}`}>
                     <span className="upload-icon">🏥</span>
                     <h4>Assurance Maladie</h4>
                     <span className="upload-hint">{viewData.documents.insurance.length > 0 ? `${viewData.documents.insurance.length} fichier(s)` : 'Cliquer pour ajouter'}</span>
                     <input type="file" multiple onChange={(e) => handleFileUpload('insurance', e)} />
                   </div>

                   <div className={`upload-zone ${viewData.documents.consent.length > 0 ? 'has-files' : ''}`}>
                     <span className="upload-icon">📋</span>
                     <h4>Consentement Éclairé</h4>
                     <span className="upload-hint">{viewData.documents.consent.length > 0 ? `${viewData.documents.consent.length} fichier(s)` : 'Cliquer pour ajouter'}</span>
                     <input type="file" multiple onChange={(e) => handleFileUpload('consent', e)} />
                   </div>

                   <div className={`upload-zone ${viewData.documents.other.length > 0 ? 'has-files' : ''}`}>
                     <span className="upload-icon">📄</span>
                     <h4>Autres Documents</h4>
                     <span className="upload-hint">{viewData.documents.other.length > 0 ? `${viewData.documents.other.length} fichier(s)` : 'Cliquer pour ajouter'}</span>
                     <input type="file" multiple onChange={(e) => handleFileUpload('other', e)} />
                   </div>

                </div>

                <div style={{marginTop: '1.5rem'}}>
                  <h4 style={{fontSize: '0.85rem', color: 'var(--text-main)', marginBottom: '0.5rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.25rem'}}>Documents Enregistrés</h4>
                  <table style={{width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem', textAlign: 'left', border: '1px solid var(--border-color)'}}>
                    <thead>
                      <tr style={{backgroundColor: '#f1f5f9', borderBottom: '1px solid var(--border-color)'}}>
                        <th style={{padding: '0.5rem 0.75rem', fontWeight: 600, width: '20%'}}>Catégorie</th>
                        <th style={{padding: '0.5rem 0.75rem', fontWeight: 600}}>Nom du fichier</th>
                        <th style={{padding: '0.5rem 0.75rem', fontWeight: 600, width: '80px', textAlign: 'center'}}>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {['idCard', 'insurance', 'consent', 'other'].flatMap(cat => 
                         viewData.documents[cat as keyof typeof viewData.documents].map((doc, idx) => (
                           <tr key={`${cat}-${idx}`} style={{borderBottom: '1px solid #f8fafc'}}>
                              <td style={{padding: '0.5rem 0.75rem', color: 'var(--text-muted)', fontSize: '0.8rem'}}>{
                                 cat === 'idCard' ? "Identité" :
                                 cat === 'insurance' ? "Assurance" :
                                 cat === 'consent' ? "Consentement" : "Autre"
                              }</td>
                              <td style={{padding: '0.5rem 0.75rem'}}>
                                <a href={doc.url} target="_blank" rel="noopener noreferrer" style={{color: 'var(--primary-color)', textDecoration: 'none', fontWeight: 500}}>{doc.name}</a>
                              </td>
                              <td style={{padding: '0.5rem 0.75rem', textAlign: 'center'}}>
                                <button onClick={() => removeFile(cat as any, idx)} style={{color: 'white', backgroundColor: '#ef4444', border: 'none', borderRadius: '3px', cursor: 'pointer', padding: '0.25rem 0.5rem', fontSize: '0.75rem', fontWeight: 'bold'}}>Suppr.</button>
                              </td>
                           </tr>
                         ))
                      )}
                      {Object.values(viewData.documents).every(arr => arr.length === 0) && (
                         <tr><td colSpan={3} style={{padding: '1rem', textAlign: 'center', color: 'var(--text-muted)'}}>Aucun document n'a été téléversé pour le moment.</td></tr>
                      )}
                    </tbody>
                  </table>
                </div>

              </div>

            </div>
          )}

          {(activeTab === 'overview' || activeTab === 'clinique') && (() => {
            // Completion counters
            const extraOralFields = ['face','symetrieVisage','gummySmile','profil','angleNasolabial','angleLabiomental','troisQuarts','competenceLabiale'];
            const extraOralDone = extraOralFields.filter(f => !!(viewData as any)[f]).length;
            const intraOralFields = ['overjet','classeCanineD','classeCanineG','classeMolaireD','classeMolaireG','overbite','cdsD','cdsG','lm'];
            const intraOralDone = intraOralFields.filter(f => !!(viewData as any)[f]).length;
            return (
            <div className="module-content">
              <div className="module-header" style={{ marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
                 <h2 style={{ margin: 0 }}>3. Analyse Clinique</h2>
                 <SessionSelector />
                 <div className="no-print" style={{ fontSize: '0.75rem', color: 'var(--text-muted)', background: '#f1f5f9', padding: '0.25rem 0.5rem', borderRadius: '4px', border: '1px solid #e2e8f0' }}>
                   ⌨️ <b>Navigation Clavier :</b> [Tab] Suivant • [Shift+Tab] Précédent • [Espace] Cocher
                 </div>
              </div>
              
              {/* ═══ EXTRA-ORAL ═══ */}
              <div className="card" style={{ marginBottom: '1rem', padding: '1rem' }}>
                <div className="card-header">
                  <h3>Extra-Oral</h3>
                  <span className={`completion-badge ${extraOralDone === extraOralFields.length ? 'complete' : ''}`}>{extraOralDone}/{extraOralFields.length}</span>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1fr) auto minmax(0,1fr) auto minmax(0,1fr)', gap: '1.5rem', alignItems: 'flex-start' }}>
                  
                  {/* FACE COLUMN */}
                  <div>
                    <h4 className="section-title">Face</h4>
                    <Select name="face" options={["Mésocéphale", "Dolichocéphale", "Brachycéphales"]} ti={100} />
                    <TwoWayCheck label="Symétrie Faciale" name="symetrieVisage" options={["Symétrique", "Asymétrique"]} detailOption="Asymétrique" detailName="asymetrieDetails" ti={101} />
                    <TwoWayCheck label="Gummy Smile" name="gummySmile" options={["Absent", "Présent"]} ti={104} />
                  </div>
                  
                  <div style={{ width: '1px', backgroundColor: 'var(--border-color)', height: '100%', minHeight: '100px' }}></div>

                  {/* PROFIL COLUMN */}
                  <div>
                    <h4 className="section-title">Profil</h4>
                    <Select name="profil" options={["droit", "convexe", "concave"]} ti={110} />
                    <Select label="∠ Nasolabial" name="angleNasolabial" normValue="(85±12°)" options={["Normal", "Fermé", "Ouvert"]} ti={111} />
                    <Select label="∠ Labiomental" name="angleLabiomental" normValue="(110-130°)" options={["Normal", "Fermé", "Ouvert"]} ti={112} />
                  </div>
                  
                  <div style={{ width: '1px', backgroundColor: 'var(--border-color)', height: '100%', minHeight: '100px' }}></div>

                  {/* 3/4 & SOURIRE COLUMN */}
                  <div>
                    <div style={{ paddingBottom: '1.2rem', borderBottom: '1px solid var(--border-color)' }}>
                      <h4 className="section-title">3/4</h4>
                      <TwoWayCheck name="troisQuarts" options={["Plat", "Harmonieux"]} ti={120} />
                    </div>
                    <div style={{ marginTop: '1rem' }}>
                      <h4 className="section-title">Sourire</h4>
                      <TwoWayCheck label="Compétence Labiale" name="competenceLabiale" options={["Compétente", "Incompétente"]} ti={123} />
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                        <label style={{ margin: 0, fontWeight: 600 }}>Expo. Incisives</label>
                        <div style={{ display: 'flex', alignItems: 'center' }}>
                          <input 
                            type="number" 
                            name="expoIncisives"
                            value={viewData.expoIncisives || ''}
                            onChange={handleChange}
                            tabIndex={126}
                            min="0" max="100"
                            className={`inline-metric-input ${!viewData.expoIncisives ? 'field-empty' : ''}`}
                            style={{ width: '60px', padding: '0.3rem', fontSize: '0.9rem', textAlign: 'center', borderRadius: '4px', color: '#0f172a', background: '#ffffff', boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.05)' }}
                          />
                          <span style={{ marginLeft: '4px', color: '#94a3b8', fontSize: '0.9rem' }}>%</span>
                        </div>
                      </div>
                    </div>
                  </div>

                </div>
              </div>

              {/* ═══ INTRA-ORAL ═══ */}
              <div className="card" style={{ marginBottom: '1rem', padding: '1rem' }}>
                <div className="card-header">
                  <h3>Intra-Oral</h3>
                  <span className={`completion-badge ${intraOralDone === intraOralFields.length ? 'complete' : ''}`}>{intraOralDone}/{intraOralFields.length}</span>
                </div>
                
                <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1fr) auto minmax(0,1fr)', gap: '1.5rem', alignItems: 'flex-start' }}>
                  
                  {/* COLONNE GAUCHE : SAGITTAL */}
                  <div>
                    <h4 className="section-title">Sagittal</h4>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', marginBottom: '0.75rem' }}>
                      <InlineMetric label="Overjet" name="overjet" ti={200} />
                      <ClinicalToggle label="X-bite Ant." stateField="hasXBiteAnt" detailField="xbiteAntDent" ti={201} />
                    </div>
                    
                    <div className="classes-grid" style={{ marginTop: '0.5rem' }}>
                      <Select label="Cl. Can. D." name="classeCanineD" options={["class I", "1/4 class II", "1/2 class II", "3/4 class II", "class II", "1/4 class III", "1/2 class III", "3/4 class III", "class III"]} ti={204} />
                      <Select label="Cl. Can. G." name="classeCanineG" options={["class I", "1/4 class II", "1/2 class II", "3/4 class II", "class II", "1/4 class III", "1/2 class III", "3/4 class III", "class III"]} ti={205} />
                      <Select label="Cl. Mol. D." name="classeMolaireD" options={["class I", "1/4 class II", "1/2 class II", "3/4 class II", "class II", "1/4 class III", "1/2 class III", "3/4 class III", "class III"]} ti={206} />
                      <Select label="Cl. Mol. G." name="classeMolaireG" options={["class I", "1/4 class II", "1/2 class II", "3/4 class II", "class II", "1/4 class III", "1/2 class III", "3/4 class III", "class III"]} ti={207} />
                    </div>
                  </div>

                  <div style={{ width: '1px', backgroundColor: 'var(--border-color)', height: '100%', minHeight: '100px' }}></div>

                  {/* COLONNE DROITE : VERTICAL + TRANSVERSAL */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

                    <div style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '1rem' }}>
                      <h4 className="section-title">Vertical</h4>
                      <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '0.75rem', marginBottom: '0.6rem' }}>
                         <InlineMetric label="Overbite" name="overbite" ti={220} />
                         <InlineMetric label="CdS D." name="cdsD" ti={221} />
                         <InlineMetric label="CdS G." name="cdsG" ti={222} />
                      </div>
                      <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
                        <Checkbox label="Traumatisant" name="hasTraumatisant" ti={223} />
                        <Checkbox label="Occlusal Cant" name="hasOcclusalCant" ti={224} />
                      </div>
                    </div>

                    <div>
                      <h4 className="section-title">Transversal</h4>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                        <TwoWayCheck label="Ligne Médiane (LM)" name="lm" options={["Centré", "Dévié"]} detailOption="Dévié" detailName="lmDetails" ti={240} />
                        <ClinicalToggle label="X/S Bite post." stateField="hasXSBitePost" detailField="xsbitePostDent" ti={243} />
                      </div>
                    </div>

                  </div>

                </div>
              </div>

              {/* ═══ PARO - CARIE ═══ */}
              <div className="card" style={{ marginBottom: '1rem', padding: '1rem' }}>
                <div className="card-header">
                  <h3>Paro - Carie</h3>
                  <span className={`completion-badge ${viewData.hygieneClin && viewData.phenotype ? 'complete' : ''}`}>{(viewData.hygieneClin ? 1 : 0) + (viewData.phenotype ? 1 : 0)}/2</span>
                </div>
                
                <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1fr) auto minmax(0,1fr)', gap: '1.5rem', alignItems: 'flex-start' }}>
                  {/* COLONNE GAUCHE */}
                  <div>
                    <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap' }}>
                      <Select label="Hygiène" name="hygieneClin" options={["Bonne", "Moyenne", "Mauvaise"]} ti={300} />
                      <Select label="Phénotype" name="phenotype" options={["Normal", "Épais", "Fin"]} ti={301} />
                    </div>
                  </div>

                  <div style={{ width: '1px', backgroundColor: 'var(--border-color)', height: '100%', minHeight: '60px' }}></div>

                  {/* COLONNE DROITE */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    <ClinicalToggle label="Frein Court" stateField="hasFreins" detailField="freinsDent" ti={302} />
                    <ClinicalToggle label="Carie" stateField="hasCaries" detailField="cariesDent" ti={304} />
                    <ClinicalToggle label="Parodontite" stateField="hasParodontite" detailField="parodontiteDetails" ti={306} />
                  </div>
                </div>
              </div>

              {/* ═══ HABITUDES ═══ */}
              <div className="card" style={{ marginBottom: '1rem', padding: '1rem' }}>
                <div className="card-header">
                  <h3>Habitudes</h3>
                </div>
                
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem 2rem' }}>
                  <ClinicalToggle label="Déglutition atypique" stateField="hasDeglutitionAtypique" detailField="deglutitionAtypiqueDetails" ti={310} />
                  <ClinicalToggle label="Interpo. Labiale" stateField="hasInterpoLabial" detailField="interpoLabialDetails" ti={312} />
                  <ClinicalToggle label="Rinçage de dents" stateField="hasRincageDents" detailField="rincageDentsDetails" ti={314} />
                  <ClinicalToggle label="Désordres ATM" stateField="hasAtm" detailField="atmDetails" ti={316} />
                </div>
              </div>

            </div>
            );
          })()}



          {(activeTab === 'overview' || activeTab === 'moulages') && (() => {
            // ── Teeth arrays
            const maxTeethKeys = ['t16','t15','t14','t13','t12','t11','t21','t22','t23','t24','t25','t26'];
            const mandTeethKeys = ['t46','t45','t44','t43','t42','t41','t31','t32','t33','t34','t35','t36'];
            const maxTeethLabels = ['16','15','14','13','12','11','21','22','23','24','25','26'];
            const mandTeethLabels = ['46','45','44','43','42','41','31','32','33','34','35','36'];

            // ── Stade de dentition
            const incMax = [n('t12'),n('t11'),n('t21'),n('t22')];
            const incMand = [n('t42'),n('t41'),n('t31'),n('t32')];
            const sixs = [n('t16'),n('t26'),n('t36'),n('t46')];
            const pmCan = [n('t15'),n('t14'),n('t13'),n('t23'),n('t24'),n('t25'),n('t45'),n('t44'),n('t43'),n('t33'),n('t34'),n('t35')];
            const hasInc = [...incMax,...incMand].some(v => v > 0);
            const has6 = sixs.some(v => v > 0);
            const hasPMCan = pmCan.some(v => v > 0);
            const allFilled = maxTeethKeys.every(k => n(k) > 0) && mandTeethKeys.every(k => n(k) > 0);

            let stade = 'Non déterminé';
            let stadeColor = '#94a3b8';
            if (allFilled) { stade = 'Denture permanente'; stadeColor = '#3b82f6'; }
            else if (hasInc || has6 || hasPMCan) { stade = 'Mesures en cours'; stadeColor = '#64748b'; }
            else { stade = 'Aucune mesure'; stadeColor = '#94a3b8'; }

            const isMixte = !!(viewData as any).isDroschlActive;
            const isPermanent = allFilled;

            // ── Droschl tables (from Excel "Valeurs" sheet)
            const droschlTable = [
              {sum:19.5, maxM:21.3, mandM:20.8, maxF:20.2, mandF:20.0},
              {sum:20.0, maxM:21.5, mandM:21.0, maxF:20.5, mandF:20.3},
              {sum:20.5, maxM:21.7, mandM:21.2, maxF:20.7, mandF:20.6},
              {sum:21.0, maxM:21.9, mandM:21.4, maxF:21.0, mandF:20.8},
              {sum:21.5, maxM:22.0, mandM:21.6, maxF:21.2, mandF:21.1},
              {sum:22.0, maxM:22.2, mandM:21.8, maxF:21.5, mandF:21.4},
              {sum:22.5, maxM:22.4, mandM:22.0, maxF:21.7, mandF:21.6},
              {sum:23.0, maxM:22.6, mandM:22.3, maxF:22.0, mandF:21.9},
              {sum:23.5, maxM:22.7, mandM:22.5, maxF:22.2, mandF:22.2},
              {sum:24.0, maxM:22.9, mandM:22.7, maxF:22.5, mandF:22.4},
              {sum:24.5, maxM:23.1, mandM:22.9, maxF:22.7, mandF:22.7},
              {sum:25.0, maxM:23.2, mandM:23.1, maxF:23.0, mandF:23.0},
              {sum:25.5, maxM:23.4, mandM:23.3, maxF:23.2, mandF:23.2},
              {sum:26.0, maxM:23.6, mandM:23.5, maxF:23.5, mandF:23.5},
              {sum:26.5, maxM:23.8, mandM:23.7, maxF:23.7, mandF:23.7},
              {sum:27.0, maxM:24.0, mandM:23.9, maxF:24.0, mandF:24.0},
            ];

            const sumIncMand = n('t42') + n('t41') + n('t31') + n('t32');
            const sexe = viewData.sexe || 'M';
            const getDroschl = (arch: 'max'|'mand'): number => {
              if (sumIncMand <= 0) return 0;
              const key = arch === 'max' ? (sexe === 'F' ? 'maxF' : 'maxM') : (sexe === 'F' ? 'mandF' : 'mandM');
              if (sumIncMand <= droschlTable[0].sum) return droschlTable[0][key];
              if (sumIncMand >= droschlTable[droschlTable.length-1].sum) return droschlTable[droschlTable.length-1][key];
              for (let i = 0; i < droschlTable.length - 1; i++) {
                if (sumIncMand >= droschlTable[i].sum && sumIncMand <= droschlTable[i+1].sum) {
                  const t = (sumIncMand - droschlTable[i].sum) / (droschlTable[i+1].sum - droschlTable[i].sum);
                  return Math.round((droschlTable[i][key] + t * (droschlTable[i+1][key] - droschlTable[i][key])) * 10) / 10;
                }
              }
              return 0;
            };

            // ── Nécessaire par secteur
            const necSup1513 = isMixte ? getDroschl('max') : n('t15')+n('t14')+n('t13');
            const necSup1211 = n('t12')+n('t11');
            const necSup2122 = n('t21')+n('t22');
            const necSup2325 = isMixte ? getDroschl('max') : n('t23')+n('t24')+n('t25');
            const necInf4543 = isMixte ? getDroschl('mand') : n('t45')+n('t44')+n('t43');
            const necInf4241 = n('t42')+n('t41');
            const necInf3132 = n('t31')+n('t32');
            const necInf3335 = isMixte ? getDroschl('mand') : n('t33')+n('t34')+n('t35');

            // ── Bilan de place
            const dS1 = (viewData as any).dispSup1513; const dS2 = (viewData as any).dispSup1211; const dS3 = (viewData as any).dispSup2122; const dS4 = (viewData as any).dispSup2325;
            const dI1 = (viewData as any).dispInf4543; const dI2 = (viewData as any).dispInf4241; const dI3 = (viewData as any).dispInf3132; const dI4 = (viewData as any).dispInf3335;

            const calcBilan = (dispo: string | undefined, nec: number, reqFilled: boolean): number | null => {
              if (dispo === undefined || dispo === '') return null;
              if (reqFilled && nec > 0) return Math.round((parseFloat(dispo) - nec) * 10) / 10;
              return null;
            };

            const reqSup1513 = isMixte ? getDroschl('max') > 0 : (n('t15') > 0 && n('t14') > 0 && n('t13') > 0);
            const reqSup1211 = n('t12') > 0 && n('t11') > 0;
            const reqSup2122 = n('t21') > 0 && n('t22') > 0;
            const reqSup2325 = isMixte ? getDroschl('max') > 0 : (n('t23') > 0 && n('t24') > 0 && n('t25') > 0);
            
            const reqInf4543 = isMixte ? getDroschl('mand') > 0 : (n('t45') > 0 && n('t44') > 0 && n('t43') > 0);
            const reqInf4241 = n('t42') > 0 && n('t41') > 0;
            const reqInf3132 = n('t31') > 0 && n('t32') > 0;
            const reqInf3335 = isMixte ? getDroschl('mand') > 0 : (n('t33') > 0 && n('t34') > 0 && n('t35') > 0);

            const bilanSupD = calcBilan(dS1, necSup1513, reqSup1513);
            const bilanSupAD = calcBilan(dS2, necSup1211, reqSup1211);
            const bilanSupAG = calcBilan(dS3, necSup2122, reqSup2122);
            const bilanSupG = calcBilan(dS4, necSup2325, reqSup2325);
            
            const bilanInfD = calcBilan(dI1, necInf4543, reqInf4543);
            const bilanInfAD = calcBilan(dI2, necInf4241, reqInf4241);
            const bilanInfAG = calcBilan(dI3, necInf3132, reqInf3132);
            const bilanInfG = calcBilan(dI4, necInf3335, reqInf3335);

            const totalSup = (bilanSupD !== null && bilanSupAD !== null && bilanSupAG !== null && bilanSupG !== null) ? Math.round((bilanSupD+bilanSupAD+bilanSupAG+bilanSupG)*10)/10 : null;
            const totalInf = (bilanInfD !== null && bilanInfAD !== null && bilanInfAG !== null && bilanInfG !== null) ? Math.round((bilanInfD+bilanInfAD+bilanInfAG+bilanInfG)*10)/10 : null;

            const dSupTot = totalSup !== null ? Math.round((parseFloat(dS1||'0')+parseFloat(dS2||'0')+parseFloat(dS3||'0')+parseFloat(dS4||'0'))*10)/10 : undefined;
            const necSupTot = totalSup !== null ? Math.round((necSup1513+necSup1211+necSup2122+necSup2325)*10)/10 : undefined;
            const dInfTot = totalInf !== null ? Math.round((parseFloat(dI1||'0')+parseFloat(dI2||'0')+parseFloat(dI3||'0')+parseFloat(dI4||'0'))*10)/10 : undefined;
            const necInfTot = totalInf !== null ? Math.round((necInf4543+necInf4241+necInf3132+necInf3335)*10)/10 : undefined;

            // ── Bolton
            const sumMax6 = n('t13')+n('t12')+n('t11')+n('t21')+n('t22')+n('t23');
            const sumMand6 = n('t43')+n('t42')+n('t41')+n('t31')+n('t32')+n('t33');
            const sumMax12 = maxTeethKeys.reduce((s,k) => s+n(k), 0);
            const sumMand12 = mandTeethKeys.reduce((s,k) => s+n(k), 0);
            const ratio6 = sumMax6 > 0 ? sumMand6/sumMax6 : 0;
            const ratio12 = sumMax12 > 0 ? sumMand12/sumMax12 : 0;
            const bolton6Pct = Math.round(ratio6 * 1000) / 10;
            const bolton12Pct = Math.round(ratio12 * 1000) / 10;
            const bolton6Excess = ratio6 > 0.772 ? Math.round((sumMand6 - sumMax6*0.772)*10)/10 : Math.round((sumMax6 - sumMand6/0.772)*10)/10;
            const bolton12Excess = ratio12 > 0.913 ? Math.round((sumMand12 - sumMax12*0.913)*10)/10 : Math.round((sumMax12 - sumMand12/0.913)*10)/10;

            const BilanVal = ({v, d, nec}:{v:number|null, d?:string|number, nec?:number}) => {
              if (v === null) return <span style={{color:'#94a3b8'}}>—</span>;
              const color = v > 0 ? '#16a34a' : v < 0 ? '#dc2626' : '#0f172a';
              return (
                <div style={{display:'flex', flexDirection:'column', alignItems:'center', lineHeight:1.2}}>
                  <span style={{fontWeight:700, color}}>{v > 0 ? '+' : ''}{v} mm</span>
                  {d !== undefined && nec !== undefined && (
                    <span style={{fontSize:'0.65rem', color:'#94a3b8', marginTop:'2px', fontWeight:500}}>({d} - {nec})</span>
                  )}
                </div>
              );
            };

            const renderTeethInput = (name: string, label: string, ti: number) => (
              <div key={name} style={{display:'flex',flexDirection:'column',alignItems:'center',gap:'2px',flex:1,minWidth:0}}>
                <span style={{fontSize:'0.65rem',color:'#64748b',fontWeight:600}}>{label}</span>
                <input type="text" inputMode="decimal" name={name} value={(viewData as any)[name]||''} onChange={handleChange} tabIndex={ti}
                  className={`inline-metric-input ${!(viewData as any)[name] ? 'field-empty' : ''}`}
                  style={{width:'100%',padding:'0.25rem',fontSize:'0.8rem',textAlign:'center',borderRadius:'4px',color:'#0f172a',background:'#fff',boxShadow:'inset 0 1px 2px rgba(0,0,0,0.05)'}}
                />
              </div>
            );

            const DeltaVal = ({v}:{v:number|null}) => {
              if (v === null) return <span style={{color:'#94a3b8'}}>—</span>;
              const color = v < 0 ? '#dc2626' : '#1e40af'; // Rouge si négatif
              return <span style={{fontWeight:700, color}}>{v} mm</span>;
            };

            return (
            <div className="module-content">
              <div className="module-header" style={{ marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
                <h2 style={{ margin: 0 }}>4. Analyse Moulage</h2>
                <SessionSelector />
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <span style={{ fontSize: '0.75rem', padding: '0.2rem 0.6rem', borderRadius: '12px', fontWeight: 700, color: '#fff', background: stadeColor }}>{stade}</span>
                  {isMixte && <span style={{ fontSize: '0.7rem', color: '#f59e0b', fontWeight: 600 }}>Droschl actif ({sexe === 'F' ? '♀' : '♂'})</span>}
                </div>
              </div>

              {/* ══ CARD 1: SCHÉMA DENTAIRE ══ */}
              <div className="card" style={{ marginBottom: '1rem', padding: '1rem' }}>
                <div className="card-header">
                  <h3>Dimensions mésio-distales</h3>
                  <span className={`completion-badge ${allFilled ? 'complete' : ''}`}>{maxTeethKeys.filter(k=>n(k)>0).length + mandTeethKeys.filter(k=>n(k)>0).length}/24</span>
                </div>

                {/* Maxillaire */}
                <div style={{marginBottom:'0.75rem'}}>
                  <div style={{display:'flex', gap:'4px', flexWrap:'nowrap'}}>
                    {maxTeethKeys.slice(0,6).map((k,i) => renderTeethInput(k, maxTeethLabels[i], 400+i))}
                    <div style={{width:'1px',background:'#cbd5e1',flexShrink:0,minHeight:'40px'}}></div>
                    {maxTeethKeys.slice(6).map((k,i) => renderTeethInput(k, maxTeethLabels[6+i], 406+i))}
                  </div>
                </div>

                {/* Mandibulaire */}
                <div>
                  <div style={{display:'flex', gap:'4px', flexWrap:'nowrap'}}>
                    {mandTeethKeys.slice(0,6).map((k,i) => renderTeethInput(k, mandTeethLabels[i], 420+i))}
                    <div style={{width:'1px',background:'#cbd5e1',flexShrink:0,minHeight:'40px'}}></div>
                    {mandTeethKeys.slice(6).map((k,i) => renderTeethInput(k, mandTeethLabels[6+i], 426+i))}
                  </div>
                </div>
              </div>

              {/* ══ CARD 2: ESPACE DISPONIBLE ══ */}
              <div className="card" style={{ marginBottom: '1rem', padding: '1rem' }}>
                <div className="card-header">
                  <h3>Espace Disponible</h3>
                  <span className={`completion-badge ${['dispSup1513','dispSup1211','dispSup2122','dispSup2325','dispInf4543','dispInf4241','dispInf3132','dispInf3335'].every(k=>n(k)>0) ? 'complete' : ''}`}>{['dispSup1513','dispSup1211','dispSup2122','dispSup2325','dispInf4543','dispInf4241','dispInf3132','dispInf3335'].filter(k=>n(k)>0).length}/8</span>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: '0.5rem' }}>
                  <Input label="15–13" name="dispSup1513" />
                  <Input label="12–11" name="dispSup1211" />
                  <Input label="21–22" name="dispSup2122" />
                  <Input label="23–25" name="dispSup2325" />
                  <Input label="45–43" name="dispInf4543" />
                  <Input label="42–41" name="dispInf4241" />
                  <Input label="31–32" name="dispInf3132" />
                  <Input label="33–35" name="dispInf3335" />
                </div>
              </div>

              {/* ══ CARD 3: BILAN DE PLACE ══ */}
              <div className="card" style={{ marginBottom: '1rem', padding: '1rem' }}>
                <div className="card-header">
                  <h3>Bilan de Place</h3>
                  {isMixte && <span style={{fontSize:'0.7rem', color:'#f59e0b', fontWeight:600}}>Droschl appliqué aux secteurs C+PM</span>}
                </div>
                <table style={{width:'100%', borderCollapse:'collapse', fontSize:'0.85rem', textAlign:'center'}}>
                  <thead>
                    <tr style={{background:'#f1f5f9', borderBottom:'1px solid #e2e8f0'}}>
                      <th style={{padding:'0.4rem', textAlign:'left', fontWeight:600}}>Arcade</th>
                      <th style={{padding:'0.4rem'}} colSpan={4}>Secteurs</th>
                      <th style={{padding:'0.4rem', fontWeight:700, borderLeft:'2px solid #cbd5e1'}}>Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr style={{background:'#f8fafc'}}>
                      <td></td>
                      <td style={{padding:'0.25rem', fontSize:'0.7rem', fontWeight:600, color:'#64748b'}}>15–13</td>
                      <td style={{padding:'0.25rem', fontSize:'0.7rem', fontWeight:600, color:'#64748b'}}>12–11</td>
                      <td style={{padding:'0.25rem', fontSize:'0.7rem', fontWeight:600, color:'#64748b'}}>21–22</td>
                      <td style={{padding:'0.25rem', fontSize:'0.7rem', fontWeight:600, color:'#64748b'}}>23–25</td>
                      <td style={{borderLeft:'2px solid #cbd5e1'}}></td>
                    </tr>
                    <tr style={{borderBottom:'1px solid #e2e8f0'}}>
                      <td style={{padding:'0.4rem', textAlign:'left', fontWeight:600, color:'#1e40af'}}>Sup.</td>
                      <td><BilanVal v={bilanSupD} d={dS1} nec={Math.round(necSup1513*10)/10}/></td>
                      <td><BilanVal v={bilanSupAD} d={dS2} nec={Math.round(necSup1211*10)/10}/></td>
                      <td><BilanVal v={bilanSupAG} d={dS3} nec={Math.round(necSup2122*10)/10}/></td>
                      <td><BilanVal v={bilanSupG} d={dS4} nec={Math.round(necSup2325*10)/10}/></td>
                      <td style={{borderLeft:'2px solid #cbd5e1', fontWeight:700, background:'#f8fafc'}}><BilanVal v={totalSup} d={dSupTot} nec={necSupTot}/></td>
                    </tr>
                    <tr style={{background:'#f8fafc'}}>
                      <td></td>
                      <td style={{padding:'0.25rem', fontSize:'0.7rem', fontWeight:600, color:'#64748b'}}>45–43</td>
                      <td style={{padding:'0.25rem', fontSize:'0.7rem', fontWeight:600, color:'#64748b'}}>42–41</td>
                      <td style={{padding:'0.25rem', fontSize:'0.7rem', fontWeight:600, color:'#64748b'}}>31–32</td>
                      <td style={{padding:'0.25rem', fontSize:'0.7rem', fontWeight:600, color:'#64748b'}}>33–35</td>
                      <td style={{borderLeft:'2px solid #cbd5e1'}}></td>
                    </tr>
                    <tr>
                      <td style={{padding:'0.4rem', textAlign:'left', fontWeight:600, color:'#1e40af'}}>Inf.</td>
                      <td><BilanVal v={bilanInfD} d={dI1} nec={Math.round(necInf4543*10)/10}/></td>
                      <td><BilanVal v={bilanInfAD} d={dI2} nec={Math.round(necInf4241*10)/10}/></td>
                      <td><BilanVal v={bilanInfAG} d={dI3} nec={Math.round(necInf3132*10)/10}/></td>
                      <td><BilanVal v={bilanInfG} d={dI4} nec={Math.round(necInf3335*10)/10}/></td>
                      <td style={{borderLeft:'2px solid #cbd5e1', fontWeight:700, background:'#f8fafc'}}><BilanVal v={totalInf} d={dInfTot} nec={necInfTot}/></td>
                    </tr>
                  </tbody>
                </table>
                {(totalSup !== null || totalInf !== null) && (
                  <div style={{marginTop:'0.75rem', padding:'0.5rem 0.75rem', background:'#f8fafc', borderRadius:'6px', border:'1px solid #e2e8f0', fontSize:'0.85rem'}}>
                    {totalSup !== null && <span style={{color: totalSup >= 0 ? '#16a34a' : '#dc2626', fontWeight:600}}>
                      {totalSup >= 0 ? `Excès de ${totalSup} mm` : `Manque de ${Math.abs(totalSup)} mm`} sup
                    </span>}
                    {totalSup !== null && totalInf !== null && <span style={{color:'#94a3b8'}}> — </span>}
                    {totalInf !== null && <span style={{color: totalInf >= 0 ? '#16a34a' : '#dc2626', fontWeight:600}}>
                      {totalInf >= 0 ? `Excès de ${totalInf} mm` : `Manque de ${Math.abs(totalInf)} mm`} inf
                    </span>}
                  </div>
                )}
              </div>

              {/* ══ CARD 4: ANALYSES BOLTON + DROSCHL ══ */}
              <div className="card" style={{ marginBottom: '1rem', padding: '1rem' }}>
                <div className="card-header">
                  <h3>Analyses</h3>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1fr) auto minmax(0,1fr)', gap: '1.5rem', alignItems: 'flex-start' }}>

                  {/* BOLTON */}
                  <div style={{ opacity: isPermanent ? 1 : 0.4 }}>
                    <h4 className="section-title">Bolton</h4>
                    {!isPermanent && <div style={{fontSize:'0.75rem',color:'#94a3b8',marginBottom:'0.5rem'}}>Disponible en denture permanente</div>}
                    <table style={{width:'100%', borderCollapse:'collapse', fontSize:'0.82rem'}}>
                      <thead>
                        <tr style={{borderBottom:'1px solid #e2e8f0'}}>
                          <th style={{textAlign:'left', padding:'0.3rem'}}>Ratio</th>
                          <th style={{padding:'0.3rem'}}>Valeur</th>
                          <th style={{padding:'0.3rem'}}>Idéal</th>
                          <th style={{padding:'0.3rem'}}>Résultat</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr style={{borderBottom:'1px solid #f1f5f9'}}>
                          <td style={{padding:'0.3rem', fontWeight:600}}>Sur 6 (ant.)</td>
                          <td style={{padding:'0.3rem', textAlign:'center'}}>{isPermanent && sumMax6 > 0 ? `${bolton6Pct}%` : '—'}</td>
                          <td style={{padding:'0.3rem', textAlign:'center', color:'#64748b'}}>77.2%</td>
                          <td style={{padding:'0.3rem', textAlign:'center', fontWeight:600, color: isPermanent && sumMax6 > 0 ? (Math.abs(ratio6-0.772)<0.01 ? '#16a34a' : '#dc2626') : '#94a3b8'}}>
                            {isPermanent && sumMax6 > 0 ? (Math.abs(ratio6-0.772)<0.01 ? '✓ Bolton' : ratio6 > 0.772 ? `Excès Mand ${bolton6Excess}mm` : `Excès Max ${bolton6Excess}mm`) : '—'}
                          </td>
                        </tr>
                        <tr>
                          <td style={{padding:'0.3rem', fontWeight:600}}>Sur 12 (tot.)</td>
                          <td style={{padding:'0.3rem', textAlign:'center'}}>{isPermanent && sumMax12 > 0 ? `${bolton12Pct}%` : '—'}</td>
                          <td style={{padding:'0.3rem', textAlign:'center', color:'#64748b'}}>91.3%</td>
                          <td style={{padding:'0.3rem', textAlign:'center', fontWeight:600, color: isPermanent && sumMax12 > 0 ? (Math.abs(ratio12-0.913)<0.01 ? '#16a34a' : '#dc2626') : '#94a3b8'}}>
                            {isPermanent && sumMax12 > 0 ? (Math.abs(ratio12-0.913)<0.01 ? '✓ Bolton' : ratio12 > 0.913 ? `Excès Mand ${bolton12Excess}mm` : `Excès Max ${bolton12Excess}mm`) : '—'}
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>

                  <div style={{ width: '1px', backgroundColor: 'var(--border-color)', height: '100%', minHeight: '80px' }}></div>

                  {/* DROSCHL */}
                  <div style={{ opacity: isMixte ? 1 : 0.6 }}>
                    <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'0.5rem' }}>
                      <h4 className="section-title" style={{marginBottom:0}}>Droschl</h4>
                      <label style={{ display:'flex', alignItems:'center', gap:'0.4rem', cursor:'pointer', fontSize:'0.75rem', fontWeight:600, color:'#0f172a' }}>
                        <input type="checkbox" name="isDroschlActive" checked={!!(viewData as any).isDroschlActive} onChange={(e) => handleChange({ target: { name: 'isDroschlActive', type: 'checkbox', checked: e.target.checked } } as any)} style={{ accentColor:'#f59e0b', width:'14px', height:'14px' }} />
                        Activer
                      </label>
                    </div>
                    {!isMixte && <div style={{fontSize:'0.7rem',color:'#64748b',marginBottom:'0.5rem'}}>Cochez pour prédire l'espace C+PM (denture mixte)</div>}
                    <div style={{fontSize:'0.82rem'}}>
                      <div style={{marginBottom:'0.5rem'}}>
                        <span style={{fontWeight:600}}>Σ incisives inf (32–42) : </span>
                        <span style={{fontWeight:700, color: sumIncMand > 0 ? '#0f172a' : '#94a3b8'}}>{sumIncMand > 0 ? `${sumIncMand} mm` : '—'}</span>
                      </div>
                      {isMixte && sumIncMand > 0 && (
                        <table style={{width:'100%', borderCollapse:'collapse'}}>
                          <thead>
                            <tr style={{borderBottom:'1px solid #e2e8f0'}}>
                              <th style={{textAlign:'left', padding:'0.3rem'}}>Prédiction</th>
                              <th style={{padding:'0.3rem'}}>Max (C+PM)</th>
                              <th style={{padding:'0.3rem'}}>Mand (C+PM)</th>
                            </tr>
                          </thead>
                          <tbody>
                            <tr>
                              <td style={{padding:'0.3rem', fontWeight:600}}>{sexe === 'F' ? '♀ Fille' : '♂ Garçon'}</td>
                              <td style={{padding:'0.3rem', textAlign:'center', fontWeight:700, color:'#1e40af'}}>{getDroschl('max')} mm</td>
                              <td style={{padding:'0.3rem', textAlign:'center', fontWeight:700, color:'#1e40af'}}>{getDroschl('mand')} mm</td>
                            </tr>
                          </tbody>
                        </table>
                      )}
                    </div>
                  </div>

                </div>
              </div>

              {/* ══ CARD 5: DISTANCES TRANSVERSALES ══ */}
              <div className="card" style={{ marginBottom: '1rem', padding: '1rem' }}>
                <div className="card-header">
                  <h3>Distances</h3>
                  <span className={`completion-badge ${['distInterMolSup','distInterMolInf','distPMSup','distPMInf','distCanSup','distCanInf'].every(k=>n(k)>0) ? 'complete' : ''}`}>{['distInterMolSup','distInterMolInf','distPMSup','distPMInf','distCanSup','distCanInf'].filter(k=>n(k)>0).length}/6</span>
                </div>
                <table style={{width:'100%', borderCollapse:'collapse', fontSize:'0.85rem', textAlign:'center'}}>
                  <thead>
                    <tr style={{background:'#f1f5f9', borderBottom:'1px solid #e2e8f0'}}>
                      <th style={{padding:'0.4rem', textAlign:'left', fontWeight:600}}>Mesure</th>
                      <th style={{padding:'0.4rem'}}>Sup</th>
                      <th style={{padding:'0.4rem'}}>Inf</th>
                      <th style={{padding:'0.4rem', fontWeight:700, borderLeft:'2px solid #cbd5e1'}}>Δ</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr style={{borderBottom:'1px solid #f1f5f9'}}>
                      <td style={{padding:'0.4rem', textAlign:'left', fontWeight:600, color:'#1e40af'}}>Δ Dist. Mol.</td>
                      <td style={{padding:'0.3rem'}}><input type="text" inputMode="decimal" name="distInterMolSup" value={viewData.distInterMolSup||''} onChange={handleChange} className={`inline-metric-input ${!viewData.distInterMolSup ? 'field-empty' : ''}`} style={{width:'60px',padding:'0.25rem',fontSize:'0.82rem',textAlign:'center',borderRadius:'4px',background:'#fff'}} /></td>
                      <td style={{padding:'0.3rem'}}><input type="text" inputMode="decimal" name="distInterMolInf" value={viewData.distInterMolInf||''} onChange={handleChange} className={`inline-metric-input ${!viewData.distInterMolInf ? 'field-empty' : ''}`} style={{width:'60px',padding:'0.25rem',fontSize:'0.82rem',textAlign:'center',borderRadius:'4px',background:'#fff'}} /></td>
                      <td style={{padding:'0.3rem', borderLeft:'2px solid #cbd5e1'}}>
                        <DeltaVal v={n('distInterMolSup') > 0 && n('distInterMolInf') > 0 ? Math.round((n('distInterMolSup') - n('distInterMolInf'))*10)/10 : null} />
                      </td>
                    </tr>
                    <tr style={{borderBottom:'1px solid #f1f5f9'}}>
                      <td style={{padding:'0.4rem', textAlign:'left', fontWeight:600, color:'#1e40af'}}>Δ Dist. PM.</td>
                      <td style={{padding:'0.3rem'}}><input type="text" inputMode="decimal" name="distPMSup" value={(viewData as any).distPMSup||''} onChange={handleChange} className={`inline-metric-input ${!(viewData as any).distPMSup ? 'field-empty' : ''}`} style={{width:'60px',padding:'0.25rem',fontSize:'0.82rem',textAlign:'center',borderRadius:'4px',background:'#fff'}} /></td>
                      <td style={{padding:'0.3rem'}}><input type="text" inputMode="decimal" name="distPMInf" value={(viewData as any).distPMInf||''} onChange={handleChange} className={`inline-metric-input ${!(viewData as any).distPMInf ? 'field-empty' : ''}`} style={{width:'60px',padding:'0.25rem',fontSize:'0.82rem',textAlign:'center',borderRadius:'4px',background:'#fff'}} /></td>
                      <td style={{padding:'0.3rem', borderLeft:'2px solid #cbd5e1'}}>
                        <DeltaVal v={n('distPMSup') > 0 && n('distPMInf') > 0 ? Math.round((n('distPMSup') - n('distPMInf'))*10)/10 : null} />
                      </td>
                    </tr>
                    <tr>
                      <td style={{padding:'0.4rem', textAlign:'left', fontWeight:600, color:'#1e40af'}}>Δ Dist. Can.</td>
                      <td style={{padding:'0.3rem'}}><input type="text" inputMode="decimal" name="distCanSup" value={(viewData as any).distCanSup||''} onChange={handleChange} className={`inline-metric-input ${!(viewData as any).distCanSup ? 'field-empty' : ''}`} style={{width:'60px',padding:'0.25rem',fontSize:'0.82rem',textAlign:'center',borderRadius:'4px',background:'#fff'}} /></td>
                      <td style={{padding:'0.3rem'}}><input type="text" inputMode="decimal" name="distCanInf" value={(viewData as any).distCanInf||''} onChange={handleChange} className={`inline-metric-input ${!(viewData as any).distCanInf ? 'field-empty' : ''}`} style={{width:'60px',padding:'0.25rem',fontSize:'0.82rem',textAlign:'center',borderRadius:'4px',background:'#fff'}} /></td>
                      <td style={{padding:'0.3rem', borderLeft:'2px solid #cbd5e1'}}>
                        <DeltaVal v={n('distCanSup') > 0 && n('distCanInf') > 0 ? Math.round((n('distCanSup') - n('distCanInf'))*10)/10 : null} />
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

            </div>
            );
          })()}

          {(activeTab === 'overview' || activeTab === 'cepha') && (
            <div className="module-content">
              <div className="module-header" style={{ marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
                 <h2 style={{ margin: 0 }}>5. Analyse Radio</h2>
                 <SessionSelector />
                 <div className="no-print" style={{ fontSize: '0.75rem', color: 'var(--text-muted)', background: '#f1f5f9', padding: '0.25rem 0.5rem', borderRadius: '4px', border: '1px solid #e2e8f0' }}>
                   ⌨️ <b>Navigation Clavier :</b> [Tab] Suivant • [Shift+Tab] Précédent
                 </div>
              </div>

              <div className="card" style={{ marginBottom: '1rem', padding: '1rem', maxWidth: '500px' }}>
                <div className="card-header"><h3 style={{fontSize:'1.1rem', marginBottom:'1.5rem'}}>1. Analyse Céphalométrique</h3></div>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                  
                  {/* Sagittal Row */}
                  <div style={{ display: 'grid', gridTemplateColumns: '85px 1fr', gap: '0.5rem', paddingBottom: '0.4rem', borderBottom: '1px solid #e2e8f0' }}>
                    <div style={{ fontWeight: 800, fontSize: '1rem', color: '#0f172a', display: 'flex', alignItems: 'center', justifyContent: 'flex-start' }}>Sagittal</div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                       <CephInput label="SNA" name="sna" normStr="82 ± 2" ideal={82} dev={2} />
                       <CephInput label="SNB" name="snb" normStr="80 ± 2" ideal={80} dev={2} />
                       <CephInput label="ANB" name="anb" normStr="2 ± 2" ideal={2} dev={2} />
                       <CephInput label="Wits (mm)" name="wits" normStr="0 ± 0" ideal={0} dev={0} />
                    </div>
                  </div>

                  {/* Vertical Row */}
                  <div style={{ display: 'grid', gridTemplateColumns: '85px 1fr', gap: '0.5rem', paddingTop: '0.4rem', paddingBottom: '0.4rem', borderBottom: '1px solid #e2e8f0' }}>
                    <div style={{ fontWeight: 800, fontSize: '1rem', color: '#0f172a', display: 'flex', alignItems: 'center', justifyContent: 'flex-start' }}>Vertical</div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                       <CephInput label="SN-SpaSpp" name="snSpaspp" normStr="7 ± 3" ideal={7} dev={3} />
                       <CephInput label="SpaSpp-MeGo" name="spasppMego" normStr="25 ± 6" ideal={25} dev={6} />
                       <CephInput label="SN-MeGo" name="snMego" normStr="32 ± 2.5" ideal={32} dev={2.5} />
                    </div>
                  </div>

                  {/* Dentaire Row */}
                  <div style={{ display: 'grid', gridTemplateColumns: '85px 1fr', gap: '0.5rem', paddingTop: '0.4rem' }}>
                    <div style={{ fontWeight: 800, fontSize: '1rem', color: '#0f172a', display: 'flex', alignItems: 'center', justifyContent: 'flex-start' }}>Dentaire</div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                       <CephInput label="1/-SN" name="incisifSn" normStr="103 ± 6" ideal={103} dev={6} />
                       <CephInput label="1/-SpaSpp" name="incisifSpaspp" normStr="110 ± 6" ideal={110} dev={6} />
                       <CephInput label="/1-MeGo" name="incisifMego" normStr="93 ± 4" ideal={93} dev={4} />
                       <CephInput label="1/-/1" name="incisifIncisif" normStr="132 ± 6" ideal={132} dev={6} />
                    </div>
                  </div>

                </div>
              </div>

              <div className="card" style={{ marginBottom: '1rem', padding: '1rem' }}>
                <div className="card-header"><h3>2. Analyse OPG</h3></div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', marginTop: '0.5rem' }}>
                   <OpgToggle label="Présence" rasField="opgPresenceRas" detailField="opgPresence" />
                   <OpgToggle label="Position" rasField="opgPositionRas" detailField="opgPosition" />
                   <OpgToggle label="Proportion" rasField="opgProportionRas" detailField="opgProportion" />
                   <OpgToggle label="Pathologie" rasField="opgPathologieRas" detailField="opgPathologie" />
                </div>
              </div>
            </div>
          )}

          {activeTab === 'bilan' && (
             <div className="module-content printable-section">
               <div className="card" style={{padding:'2rem', borderTop:'8px solid var(--primary-color)'}}>
                  <h1 style={{color:'var(--primary-color)', marginBottom:'0'}}>BILAN CLINIQUE ORTHODONTIQUE</h1>
                  <p style={{fontSize:'0.9rem', color:'var(--text-muted)'}}>Rapport généré automatiquement depuis ZaWin/OrthoDiag</p>
                  
                  <div style={{display:'grid', gridTemplateColumns:'2fr 1fr', background:'#f8fafc', padding:'1rem', borderRadius:'4px', marginTop:'1.5rem'}}>
                    <div><strong>Patient:</strong> {viewData.nom} {viewData.prenom} <br/><strong>Date de naissance:</strong> {viewData.dateNaissance || '-'} ({ageCalcule} ans) <br/><strong>ID:</strong> {viewData.id}</div>
                    <div><strong>Praticien:</strong> {viewData.praticien || '-'}<br/><strong>Méd. Traitant:</strong> {viewData.medecinTraitant || '-'}<br/><strong>Dentiste:</strong> {viewData.medecinDentaire || '-'}</div>
                  </div>

                  <div style={{marginTop:'2rem'}}>
                    <h3 style={{borderBottom:'1px solid #ccc', paddingBottom:'5px', color:'var(--primary-color)'}}>1. Motif & Anamnèse</h3>
                    <p><strong>Plainte principale:</strong> {viewData.motifConsultation}</p>
                    <p><strong>Médical:</strong> {viewData.maladiesChroniques.allergies ? 'Allergies. ' : ''}{viewData.maladiesChroniques.diabete ? 'Diabète. ' : ''}{!viewData.maladiesChroniques.allergies && !viewData.maladiesChroniques.diabete ? 'RAS' : ''}</p>
                  </div>
                  
                  <div style={{marginTop:'1.5rem', display:'grid', gridTemplateColumns:'1fr 1fr', gap:'2rem', fontSize:'0.9rem'}}>
                     <div>
                       <h3 style={{borderBottom:'1px solid #ccc', paddingBottom:'5px', color:'var(--primary-color)', fontSize:'1rem'}}>2. Examen Clinique (Squelettique)</h3>
                       <p style={{margin:'0.2rem 0'}}><strong>Face / Profil:</strong> {viewData.face || '-'} / {viewData.profil || '-'}</p>
                       <p style={{margin:'0.2rem 0'}}><strong>Cl Molaires:</strong> D: {viewData.classeMolaireD || '-'} | G: {viewData.classeMolaireG || '-'}</p>
                       <p style={{margin:'0.2rem 0'}}><strong>Cl Canines:</strong> D: {viewData.classeCanineD || '-'} | G: {viewData.classeCanineG || '-'}</p>
                       <p style={{margin:'0.2rem 0'}}><strong>Overjet / Overbite:</strong> OJ = {viewData.overjet || '-'} | OB = {viewData.overbite || '-'}</p>
                     </div>
                     <div>
                       <h3 style={{borderBottom:'1px solid #ccc', paddingBottom:'5px', color:'var(--primary-color)', fontSize:'1rem'}}>3. Parodonte & Transversal</h3>
                       <p style={{margin:'0.2rem 0'}}><strong>Ligne Médiane:</strong> {viewData.lm || '-'} {viewData.lmDetails ? `(${viewData.lmDetails})` : ''}</p>
                       <p style={{margin:'0.2rem 0'}}><strong>Hygiène / Phénotype:</strong> {viewData.hygieneClin || '-'} / {viewData.phenotype || '-'}</p>
                       <p style={{margin:'0.2rem 0'}}><strong>Caries / Freins:</strong> {viewData.hasCaries ? `Oui (${viewData.cariesDent})` : 'Non'} / {viewData.hasFreins ? `Oui (${viewData.freinsDent})` : 'Non'}</p>
                       <p style={{margin:'0.2rem 0'}}><strong>Croisés:</strong> {viewData.hasXSBitePost ? `X/S Bite Post (${viewData.xsbitePostDent})` : ''} {viewData.hasXBiteAnt ? `X-Bite Ant (${viewData.xbiteAntDent})` : ''} {!viewData.hasXSBitePost && !viewData.hasXBiteAnt && 'Aucun'}</p>
                     </div>
                  </div>

                  <div style={{marginTop:'1.5rem'}}>
                    <h3 style={{borderBottom:'1px solid #ccc', paddingBottom:'5px', color:'var(--primary-color)'}}>4. Plan de Traitement</h3>
                    <ul style={{margin:'0.5rem 0 0 1.5rem'}}>
                      {viewData.appS1 && <li><strong>Étape 1:</strong> {viewData.appS1}</li>}
                      {viewData.appS2 && <li><strong>Étape 2:</strong> {viewData.appS2}</li>}
                      {viewData.appS3 && <li><strong>Étape 3:</strong> {viewData.appS3}</li>}
                      {!viewData.appS1 && !viewData.appS2 && <li><em>Aucun plan défini.</em></li>}
                    </ul>
                  </div>
               </div>
             </div>
          )}

        </div>
      </main>

      {/* SESSION MANAGER MODAL */}
      {isSessionModalOpen && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999 }}>
          <div style={{ backgroundColor: '#fff', borderRadius: '8px', padding: '1.5rem', width: '450px', maxWidth: '90%', boxShadow: '0 10px 25px rgba(0,0,0,0.2)' }}>
             <h2 style={{ marginTop: 0, color: 'var(--primary-color)', borderBottom: '1px solid #e2e8f0', paddingBottom: '0.5rem', fontSize: '1.25rem' }}>⚙️ Gestion des Sessions</h2>
             
             <ul style={{ listStyle: 'none', padding: 0, marginTop: '1rem', maxHeight: '250px', overflowY: 'auto' }}>
                {data.sessions.map((s: any) => (
                  <li key={s.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.5rem', borderBottom: '1px solid #f1f5f9', background: data.activeSessionId === s.id ? '#f8fafc' : 'transparent' }}>
                    <div>
                      <strong style={{color: '#0f172a'}}>{s.nomSession}</strong> <span style={{color: '#64748b', fontSize: '0.8rem'}}>({new Date(s.date).toLocaleDateString('fr-CH')})</span>
                    </div>
                    {sessionToDelete === s.id ? (
                       <div style={{ display: 'flex', gap: '0.4rem', alignItems: 'center' }}>
                         <span style={{ fontSize: '0.75rem', color: '#dc2626', fontWeight: 600 }}>Sûr ?</span>
                         <button onClick={() => {
                            const newSessions = data.sessions.filter(x => x.id !== s.id);
                            setData(prev => ({
                               ...prev,
                               sessions: newSessions,
                               activeSessionId: prev.activeSessionId === s.id ? (newSessions[0]?.id || '') : prev.activeSessionId
                            }));
                            setSessionToDelete(null);
                         }} style={{ background: '#dc2626', color: '#fff', border: 'none', borderRadius: '3px', cursor: 'pointer', padding: '0.2rem 0.5rem', fontSize: '0.75rem', fontWeight: 600 }}>Oui, Effacer</button>
                         <button onClick={() => setSessionToDelete(null)} style={{ background: '#e2e8f0', color: '#0f172a', border: 'none', borderRadius: '3px', cursor: 'pointer', padding: '0.2rem 0.5rem', fontSize: '0.75rem', fontWeight: 600 }}>Annuler</button>
                       </div>
                    ) : (
                       <button onClick={() => setSessionToDelete(s.id)} style={{ background: 'transparent', border: 'none', color: '#ef4444', cursor: 'pointer', fontSize: '1.1rem', opacity: data.sessions.length > 1 ? 1 : 0.3 }} disabled={data.sessions.length <= 1} title="Supprimer la session">🗑️</button>
                    )}
                  </li>
                ))}
             </ul>

             <div style={{ marginTop: '1.5rem', padding: '1rem', background: '#f8fafc', borderRadius: '4px', border: '1px solid #e2e8f0' }}>
               <h3 style={{ margin: '0 0 0.5rem 0', fontSize: '0.9rem', color: '#0f172a' }}>➕ Nouvelle Session</h3>
               <div style={{ display: 'flex', gap: '0.5rem' }}>
                 <input type="date" value={newDateValue} onChange={e => setNewDateValue(e.target.value)} style={{ flex: 1, padding: '0.4rem', borderRadius: '3px', border: '1px solid #cbd5e1' }} />
                 <button onClick={() => {
                    const newId = Math.random().toString(36).substr(2, 9);
                    const num = data.sessions.length;
                    const newSess = { ...initialSession, id: newId, date: newDateValue, nomSession: `Contrôle (T${num})` };
                    setData(prev => ({
                      ...prev,
                      sessions: [...prev.sessions, newSess],
                      activeSessionId: newId
                    }));
                 }} style={{ background: 'var(--primary-color)', color: '#fff', border: 'none', padding: '0.4rem 1rem', borderRadius: '3px', cursor: 'pointer', fontWeight: 600 }}>Céer session</button>
               </div>
             </div>

             <div style={{ marginTop: '1.25rem', textAlign: 'right', borderTop: '1px solid #e2e8f0', paddingTop: '1rem' }}>
               <button onClick={() => setIsSessionModalOpen(false)} style={{ background: '#fff', color: '#0f172a', border: '1px solid #cbd5e1', padding: '0.5rem 1.5rem', borderRadius: '4px', cursor: 'pointer', fontWeight: 600 }}>Terminer</button>
             </div>
          </div>
        </div>
      )}

    </div>
    </FormContext.Provider>
  );
}
