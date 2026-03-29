import { useRef, useState } from 'react';
import { useStore } from '../../store/useStore';
import { fileSystem } from '../../services/FileSystemService';
import { FileSystemImage } from '../ui/FileSystemImage';

const CATEGORIES = [
  { id: 'photosExtra', label: 'Photographies Extra-orales', icon: '👤' },
  { id: 'photosIntra', label: 'Photographies Intra-orales', icon: '👄' },
  { id: 'modelesStl', label: 'Modèles 3D (STL)', icon: '🦷' },
  { id: 'radioIntraImages', label: 'Radiographies Intra-orales', icon: '📸' },
  { id: 'opgImages', label: 'Panoramique (OPG)', icon: '🖼️' },
  { id: 'cephaloImages', label: 'Téléradiographie (Céphalo)', icon: '📏' },
];

export default function DocumentationTab() {
  const patient = useStore(state => state.patient);
  const isHubConnected = useStore(state => state.isHubConnected);
  const patientDirectory = useStore(state => state.patientDirectory);
  const activeSessionId = patient.activeSessionId;
  const activeSession = patient.sessions.find(s => s.id === activeSessionId) || patient.sessions[0];
  const updateSessionField = useStore(state => state.updateSessionField);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  const handleFileUpload = async (categoryId: string, e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.length) return;
    const files = Array.from(e.target.files);
    
    let newMedia: string[] = [];
    
    if (isHubConnected && patientDirectory) {
      for (const file of files) {
        const customName = `${activeSessionId}_${categoryId}_${Date.now()}_${file.name.replace(/[^a-zA-Z0-9.\-_]/g, '')}`;
        const savedName = await fileSystem.saveMediaFile(patientDirectory, file, customName);
        newMedia.push(savedName);
      }
    } else {
      newMedia = files.map(file => URL.createObjectURL(file));
    }
    
    const existing = (activeSession as any)[categoryId] || [];
    updateSessionField(activeSessionId, categoryId, [...existing, ...newMedia]);
    
    if (fileInputRef.current) fileInputRef.current.value = '';
    setActiveCategory(null);
  };

  const removeMedia = (categoryId: string, index: number) => {
    const existing = [...((activeSession as any)[categoryId] || [])];
    existing.splice(index, 1);
    updateSessionField(activeSessionId, categoryId, existing);
  };

  const triggerFileInput = (categoryId: string) => {
    setActiveCategory(categoryId);
    if (fileInputRef.current) fileInputRef.current.click();
  };

  return (
    <div className="module-content tab-docs">
      <div className="module-header mh-docs" style={{ marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
         <h2 style={{ margin: 0 }}>2. Documentation Clinique</h2>
      </div>

      <input 
        type="file" 
        multiple 
        ref={fileInputRef} 
        style={{ display: 'none' }} 
        onChange={(e) => activeCategory && handleFileUpload(activeCategory, e)}
        accept="image/*,.stl"
      />

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1rem' }}>
        {CATEGORIES.map(cat => {
          const mediaList = (activeSession as any)[cat.id] || [];
          return (
            <div key={cat.id} className="card" style={{ padding: '1rem', display: 'flex', flexDirection: 'column' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <h3 style={{ margin: 0, fontSize: '1rem', color: '#0f172a' }}>{/* stripped emoji */}{cat.label}</h3>
                <span style={{ fontSize: '0.8rem', background: mediaList.length > 0 ? '#dbeafe' : '#f1f5f9', color: mediaList.length > 0 ? '#1e40af' : '#64748b', padding: '0.2rem 0.5rem', borderRadius: '12px', fontWeight: 600 }}>
                  {mediaList.length} f.
                </span>
              </div>
              
              <div style={{ flex: 1, minHeight: '120px', background: '#f8fafc', border: '1px dashed #cbd5e1', borderRadius: '4px', padding: '0.5rem', display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(60px, 1fr))', gap: '0.5rem', alignContent: 'start' }}>
                {mediaList.map((url: string, idx: number) => (
                  <div key={idx} style={{ position: 'relative', width: '100%', aspectRatio: '1', borderRadius: '4px', overflow: 'hidden', border: '1px solid #e2e8f0', background: '#fff' }}>
                    <FileSystemImage fileName={url} />
                    <button 
                      onClick={() => removeMedia(cat.id, idx)}
                      style={{ position: 'absolute', top: 2, right: 2, background: 'rgba(239, 68, 68, 0.9)', color: 'white', border: 'none', borderRadius: '50%', width: '20px', height: '20px', fontSize: '10px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                    >
                      ×
                    </button>
                  </div>
                ))}
                
                <div 
                  onClick={() => triggerFileInput(cat.id)}
                  style={{ width: '100%', aspectRatio: '1', borderRadius: '4px', border: '1px dashed #94a3b8', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', background: 'transparent', transition: 'all 0.2s', color: '#64748b', fontSize: '1.5rem' }}
                >
                  +
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
