import type { PatientRecord } from '../types';

declare global {
  interface Window {
    showDirectoryPicker(options?: any): Promise<any>;
  }
}

export interface PatientDirectory {
  handle: any;
  folderName: string;
  patientName: string;
  lastModified: number;
}

export class FileSystemService {
  private rootHandle: any | null = null;

  // Demande l'accès au dossier racine (ex: C:\ZaWin\OrthoDiag)
  async requestRootAccess(): Promise<boolean> {
    try {
      this.rootHandle = await window.showDirectoryPicker({
        mode: 'readwrite',
        id: 'orthodiag_root', // Browser remembers this ID for quick access
      });
      return true;
    } catch (err) {
      console.error("Accès au dossier refusé :", err);
      return false;
    }
  }

  isReady(): boolean {
    return this.rootHandle !== null;
  }

  // Scanne le dossier racine pour lister les patients
  async loadPatientsList(): Promise<PatientDirectory[]> {
    if (!this.rootHandle) throw new Error("Root handle manquant");
    
    const patients: PatientDirectory[] = [];
    
    for await (const entry of (this.rootHandle as any).values()) {
      if (entry.kind === 'directory') {
        const dirHandle = entry;
        patients.push({
          handle: dirHandle,
          folderName: dirHandle.name,
          patientName: dirHandle.name.replace(/_/g, ' '), // Basique, on peut lire data.json plus tard
          lastModified: Date.now() // Approximatif
        });
      }
    }
    return patients;
  }

  // Crée un nouveau dossier patient (ex: Dupont_Jean_1234)
  async createPatientDirectory(folderName: string): Promise<any> {
    if (!this.rootHandle) throw new Error("Root handle manquant");
    return await this.rootHandle.getDirectoryHandle(folderName, { create: true });
  }

  // Écrit les données JSON d'un patient dans son dossier
  async savePatientData(dirHandle: any, data: PatientRecord): Promise<void> {
    const fileHandle = await dirHandle.getFileHandle('data.json', { create: true });
    const writable = await fileHandle.createWritable();
    await writable.write(JSON.stringify(data, null, 2));
    await writable.close();
  }

  // Lit les données JSON d'un patient depuis son dossier
  async loadPatientData(dirHandle: any): Promise<PatientRecord | null> {
    try {
      const fileHandle = await dirHandle.getFileHandle('data.json');
      const file = await fileHandle.getFile();
      const text = await file.text();
      return JSON.parse(text) as PatientRecord;
    } catch (err) {
      console.warn("Pas de fichier data.json trouvé dans ce dossier.");
      return null;
    }
  }

  // Sauvegarde un fichier binaire (Image, STL) dans le dossier du patient
  async saveMediaFile(dirHandle: any, file: File, customName?: string): Promise<string> {
    const fileName = customName || file.name;
    const fileHandle = await dirHandle.getFileHandle(fileName, { create: true });
    const writable = await fileHandle.createWritable();
    await writable.write(file);
    await writable.close();
    return fileName;
  }

  // Récupère une URL temporaire (Object URL) pour lire un fichier binaire (Image) depuis le dossier
  async getMediaUrl(dirHandle: any, fileName: string): Promise<string | null> {
    try {
      const fileHandle = await dirHandle.getFileHandle(fileName);
      const file = await fileHandle.getFile();
      return URL.createObjectURL(file);
    } catch (err) {
      console.error(`Impossible de lire le fichier ${fileName}`, err);
      return null;
    }
  }

  // Permet de nettoyer les URL temporaires (OBLIGATOIRE sur les SPA pour éviter les fuites mémoire)
  revokeMediaUrl(url: string) {
    if (url.startsWith('blob:')) {
      URL.revokeObjectURL(url);
    }
  }
}

export const fileSystem = new FileSystemService();
