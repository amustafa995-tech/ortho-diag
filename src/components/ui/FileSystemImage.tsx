import { useEffect, useState } from 'react';
import { useStore } from '../../store/useStore';
import { fileSystem } from '../../services/FileSystemService';

export function FileSystemImage({ fileName }: { fileName: string }) {
  const [src, setSrc] = useState<string | null>(null);
  const isHubConnected = useStore(state => state.isHubConnected);
  const patientDirectory = useStore(state => state.patientDirectory);

  useEffect(() => {
    // Si c'est déjà une URL Blob générée en POC
    if (fileName.startsWith('blob:')) {
      setSrc(fileName);
      return;
    }

    // Sinon c'est un nom de fichier sur le disque physique
    if (isHubConnected && patientDirectory) {
      let activeUrl: string | null = null;
      fileSystem.getMediaUrl(patientDirectory, fileName).then(url => {
        if (url) {
          activeUrl = url;
          setSrc(url);
        }
      });
      return () => {
        if (activeUrl) fileSystem.revokeMediaUrl(activeUrl);
      };
    }
  }, [fileName, isHubConnected, patientDirectory]);

  if (!src) return <div style={{width:'100%', height:'100%', display:'flex', alignItems:'center', justifyContent:'center', background:'#f1f5f9', color:'#94a3b8', fontSize:'0.7rem'}}>Chargement...</div>;

  return <img src={src} alt={fileName} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />;
}
