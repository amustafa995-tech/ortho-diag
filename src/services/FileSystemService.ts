import type { PatientRecord } from '../types';

declare global {
  interface Window {
    showDirectoryPicker(options?: { mode?: string; id?: string }): Promise<FileSystemDirectoryHandle>;
  }
}

export interface PatientDirectory {
  handle: FileSystemDirectoryHandle;
  folderName: string;
  patientName: string;
  lastModified: number;
}

export class FileSystemService {
  private rootHandle: FileSystemDirectoryHandle | null = null;
  private urlCache = new Map<string, string>();

  async requestRootAccess(): Promise<boolean> {
    try {
      this.rootHandle = await window.showDirectoryPicker({
        mode: 'readwrite',
        id: 'orthodiag_root',
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

  async loadPatientsList(): Promise<PatientDirectory[]> {
    if (!this.rootHandle) throw new Error("Root handle manquant");

    const patients: PatientDirectory[] = [];

    for await (const entry of (this.rootHandle as any).values()) {
      if (entry.kind === 'directory') {
        patients.push({
          handle: entry,
          folderName: entry.name,
          patientName: entry.name.replace(/_/g, ' '),
          lastModified: Date.now()
        });
      }
    }
    return patients;
  }

  async createPatientDirectory(folderName: string): Promise<FileSystemDirectoryHandle> {
    if (!this.rootHandle) throw new Error("Root handle manquant");
    return await this.rootHandle.getDirectoryHandle(folderName, { create: true });
  }

  async savePatientData(dirHandle: FileSystemDirectoryHandle, data: PatientRecord): Promise<void> {
    const fileHandle = await dirHandle.getFileHandle('data.json', { create: true });
    const writable = await (fileHandle as any).createWritable();
    await writable.write(JSON.stringify(data, null, 2));
    await writable.close();
  }

  async loadPatientData(dirHandle: FileSystemDirectoryHandle): Promise<PatientRecord | null> {
    try {
      const fileHandle = await dirHandle.getFileHandle('data.json');
      const file = await fileHandle.getFile();
      const text = await file.text();
      return JSON.parse(text) as PatientRecord;
    } catch {
      console.warn("Pas de fichier data.json trouvé dans ce dossier.");
      return null;
    }
  }

  async saveMediaFile(dirHandle: FileSystemDirectoryHandle, file: File, customName?: string): Promise<string> {
    const fileName = customName || file.name;
    const fileHandle = await dirHandle.getFileHandle(fileName, { create: true });
    const writable = await (fileHandle as any).createWritable();
    await writable.write(file);
    await writable.close();
    return fileName;
  }

  async getMediaUrl(dirHandle: FileSystemDirectoryHandle, fileName: string): Promise<string | null> {
    const cacheKey = `${(dirHandle as any).name}/${fileName}`;
    const cached = this.urlCache.get(cacheKey);
    if (cached) return cached;

    try {
      const fileHandle = await dirHandle.getFileHandle(fileName);
      const file = await fileHandle.getFile();
      const url = URL.createObjectURL(file);
      this.urlCache.set(cacheKey, url);
      return url;
    } catch (err) {
      console.error(`Impossible de lire le fichier ${fileName}`, err);
      return null;
    }
  }

  revokeMediaUrl(url: string) {
    if (url.startsWith('blob:')) {
      URL.revokeObjectURL(url);
      for (const [key, val] of this.urlCache) {
        if (val === url) { this.urlCache.delete(key); break; }
      }
    }
  }

  revokeAllUrls() {
    for (const url of this.urlCache.values()) {
      URL.revokeObjectURL(url);
    }
    this.urlCache.clear();
  }
}

export const fileSystem = new FileSystemService();
