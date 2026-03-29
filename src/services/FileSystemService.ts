import type { PatientRecord } from '../types';
import { validatePatientData, migratePatientData } from '../schemas/patient';

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

const MAX_CACHE_SIZE = 200;

export class FileSystemService {
  private rootHandle: FileSystemDirectoryHandle | null = null;
  private urlCache = new Map<string, string>();
  private reverseUrlCache = new Map<string, string>(); // url → key
  private saveMutex: Promise<void> = Promise.resolve();

  private assertRoot(): FileSystemDirectoryHandle {
    if (!this.rootHandle) throw new Error("Root handle manquant. Veuillez reconnecter le dossier.");
    return this.rootHandle;
  }

  /**
   * Sanitize a folder name to prevent path traversal and invalid characters.
   */
  static sanitizeFolderName(name: string): string {
    return name
      .replace(/\.\./g, '')
      .replace(/[\/\\:*?"<>|]/g, '')
      .replace(/^\.+/, '')
      .trim();
  }

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
    const root = this.assertRoot();
    const patients: PatientDirectory[] = [];

    for await (const entry of (root as any).values()) {
      if (entry.kind === 'directory') {
        let lastModified = Date.now();
        try {
          const fileHandle = await entry.getFileHandle('data.json');
          const file = await fileHandle.getFile();
          lastModified = file.lastModified;
        } catch { /* no data.json yet */ }

        patients.push({
          handle: entry,
          folderName: entry.name,
          patientName: entry.name.replace(/_/g, ' '),
          lastModified,
        });
      }
    }
    return patients;
  }

  async createPatientDirectory(folderName: string): Promise<FileSystemDirectoryHandle> {
    const root = this.assertRoot();
    const safeName = FileSystemService.sanitizeFolderName(folderName);
    if (!safeName) {
      throw new Error("Nom de dossier invalide après assainissement.");
    }
    return await root.getDirectoryHandle(safeName, { create: true });
  }

  async deletePatientDirectory(folderName: string): Promise<void> {
    const root = this.assertRoot();
    const safeName = FileSystemService.sanitizeFolderName(folderName);
    if (!safeName) {
      throw new Error("Nom de dossier invalide après assainissement.");
    }
    await (root as any).removeEntry(safeName, { recursive: true });
  }

  // ── Atomic save: write to .tmp then rename ──

  async savePatientData(dirHandle: FileSystemDirectoryHandle, data: PatientRecord): Promise<void> {
    // Chain onto the mutex so concurrent saves are serialized
    const previousSave = this.saveMutex;
    let resolve!: () => void;
    this.saveMutex = new Promise<void>((r) => { resolve = r; });

    try {
      await previousSave;
      await this._savePatientDataImpl(dirHandle, data);
    } finally {
      resolve();
    }
  }

  private async _savePatientDataImpl(dirHandle: FileSystemDirectoryHandle, data: PatientRecord): Promise<void> {
    const serialized = JSON.stringify(data, null, 2);

    // 1. Create backup of current data.json → data.json.bak
    try {
      const existingHandle = await dirHandle.getFileHandle('data.json');
      const existingFile = await existingHandle.getFile();
      const backupHandle = await dirHandle.getFileHandle('data.json.bak', { create: true });
      const backupWritable = await (backupHandle as any).createWritable();
      await backupWritable.write(existingFile);
      await backupWritable.close();
    } catch { /* no existing file to backup — first save */ }

    // 2. Write to tmp file first
    const tmpHandle = await dirHandle.getFileHandle('data.json.tmp', { create: true });
    const tmpWritable = await (tmpHandle as any).createWritable();
    await tmpWritable.write(serialized);
    await tmpWritable.close();

    // 3. Read back tmp to verify integrity
    const verifyFile = await tmpHandle.getFile();
    const verifyText = await verifyFile.text();
    try {
      JSON.parse(verifyText);
    } catch {
      throw new Error("Erreur d'intégrité : le fichier temporaire est corrompu. Sauvegarde annulée.");
    }

    // 4. Overwrite data.json with the verified tmp content (not re-serialized)
    const fileHandle = await dirHandle.getFileHandle('data.json', { create: true });
    const writable = await (fileHandle as any).createWritable();
    await writable.write(verifyText);
    await writable.close();

    // 5. Clean up tmp
    try {
      await (dirHandle as any).removeEntry('data.json.tmp');
    } catch { /* non-critical */ }
  }

  async loadPatientData(dirHandle: FileSystemDirectoryHandle): Promise<{ data: PatientRecord | null; error?: string }> {
    // Try main file first
    try {
      const fileHandle = await dirHandle.getFileHandle('data.json');
      const file = await fileHandle.getFile();
      const text = await file.text();
      if (!text.trim()) {
        return { data: null, error: "Le fichier data.json est vide." };
      }
      try {
        const parsed = JSON.parse(text);
        return this.validateAndMigrate(parsed);
      } catch {
        // JSON corrupted — try backup
        console.error("data.json corrompu, tentative de restauration depuis backup...");
        return await this.loadFromBackup(dirHandle);
      }
    } catch {
      // data.json not found — try backup
      return await this.loadFromBackup(dirHandle);
    }
  }

  private validateAndMigrate(raw: unknown): { data: PatientRecord | null; error?: string } {
    if (!raw || typeof raw !== 'object') {
      return { data: null, error: "Le fichier ne contient pas un objet valide." };
    }

    // 1. Apply schema migrations
    const migrated = migratePatientData(raw as Record<string, any>);

    // 2. Validate with Zod
    const result = validatePatientData(migrated);
    if (!result.success) {
      return { data: null, error: result.error };
    }

    return { data: result.data as unknown as PatientRecord };
  }

  private async loadFromBackup(dirHandle: FileSystemDirectoryHandle): Promise<{ data: PatientRecord | null; error?: string }> {
    try {
      const bakHandle = await dirHandle.getFileHandle('data.json.bak');
      const bakFile = await bakHandle.getFile();
      const bakText = await bakFile.text();
      const parsed = JSON.parse(bakText);
      const result = this.validateAndMigrate(parsed);
      if (result.data) {
        // Restore backup as main file
        await this.savePatientData(dirHandle, result.data);
        return { data: result.data, error: "Restauré depuis la sauvegarde de secours (data.json.bak)." };
      }
      return { data: null, error: result.error || "Le backup est invalide." };
    } catch {
      return { data: null, error: "Aucun fichier data.json ou backup trouvé dans ce dossier." };
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

  // ── LRU URL Cache ──

  private addToCache(key: string, url: string): void {
    // Evict oldest if at capacity
    if (this.urlCache.size >= MAX_CACHE_SIZE) {
      const oldestKey = this.urlCache.keys().next().value!;
      const oldestUrl = this.urlCache.get(oldestKey)!;
      URL.revokeObjectURL(oldestUrl);
      this.urlCache.delete(oldestKey);
      this.reverseUrlCache.delete(oldestUrl);
    }
    this.urlCache.set(key, url);
    this.reverseUrlCache.set(url, key);
  }

  async getMediaUrl(dirHandle: FileSystemDirectoryHandle, fileName: string): Promise<string | null> {
    const cacheKey = `${(dirHandle as any).name}/${fileName}`;
    const cached = this.urlCache.get(cacheKey);
    if (cached) {
      // Move to end (most recently used)
      this.urlCache.delete(cacheKey);
      this.urlCache.set(cacheKey, cached);
      return cached;
    }

    try {
      const fileHandle = await dirHandle.getFileHandle(fileName);
      const file = await fileHandle.getFile();
      const url = URL.createObjectURL(file);
      this.addToCache(cacheKey, url);
      return url;
    } catch (err) {
      console.error(`Impossible de lire le fichier ${fileName}`, err);
      return null;
    }
  }

  revokeMediaUrl(url: string) {
    if (url.startsWith('blob:')) {
      URL.revokeObjectURL(url);
      const key = this.reverseUrlCache.get(url);
      if (key) {
        this.urlCache.delete(key);
        this.reverseUrlCache.delete(url);
      }
    }
  }

  /**
   * Revoke all cached blob URLs. Call this on patient switch to prevent memory leaks.
   */
  revokeAllUrls() {
    // Snapshot values to avoid mutation during iteration
    const urls = [...this.urlCache.values()];
    for (const url of urls) {
      URL.revokeObjectURL(url);
    }
    this.urlCache.clear();
    this.reverseUrlCache.clear();
  }

  // ── Document Management ──

  async ensureDocumentsDir(dirHandle: FileSystemDirectoryHandle): Promise<FileSystemDirectoryHandle> {
    return await dirHandle.getDirectoryHandle('documents', { create: true });
  }

  async ensureCategoryDir(dirHandle: FileSystemDirectoryHandle, category: string): Promise<FileSystemDirectoryHandle> {
    const docsDir = await this.ensureDocumentsDir(dirHandle);
    return await docsDir.getDirectoryHandle(category, { create: true });
  }

  async saveDocument(dirHandle: FileSystemDirectoryHandle, file: File, category: string, fileName: string): Promise<string> {
    const catDir = await this.ensureCategoryDir(dirHandle, category);
    const fileHandle = await catDir.getFileHandle(fileName, { create: true });
    const writable = await (fileHandle as any).createWritable();
    await writable.write(file);
    await writable.close();
    return fileName;
  }

  async deleteDocument(dirHandle: FileSystemDirectoryHandle, category: string, fileName: string): Promise<void> {
    const catDir = await this.ensureCategoryDir(dirHandle, category);
    await (catDir as any).removeEntry(fileName);
  }

  async renameDocument(dirHandle: FileSystemDirectoryHandle, category: string, oldName: string, newName: string): Promise<boolean> {
    try {
      const catDir = await this.ensureCategoryDir(dirHandle, category);
      // Read old file
      const oldHandle = await catDir.getFileHandle(oldName);
      const file = await oldHandle.getFile();
      // Write new file
      const newHandle = await catDir.getFileHandle(newName, { create: true });
      const writable = await (newHandle as any).createWritable();
      await writable.write(file);
      await writable.close();
      // Verify new file before deleting old
      const verifyHandle = await catDir.getFileHandle(newName);
      const verifyFile = await verifyHandle.getFile();
      if (verifyFile.size !== file.size) {
        // Cleanup failed rename
        await (catDir as any).removeEntry(newName);
        return false;
      }
      // Delete old only after verification
      await (catDir as any).removeEntry(oldName);
      return true;
    } catch (err) {
      console.error(`Impossible de renommer ${oldName} → ${newName}`, err);
      return false;
    }
  }

  async getDocumentUrl(dirHandle: FileSystemDirectoryHandle, category: string, fileName: string): Promise<string | null> {
    const cacheKey = `${(dirHandle as any).name}/documents/${category}/${fileName}`;
    const cached = this.urlCache.get(cacheKey);
    if (cached) {
      this.urlCache.delete(cacheKey);
      this.urlCache.set(cacheKey, cached);
      return cached;
    }

    try {
      const catDir = await this.ensureCategoryDir(dirHandle, category);
      const fileHandle = await catDir.getFileHandle(fileName);
      const file = await fileHandle.getFile();
      const url = URL.createObjectURL(file);
      this.addToCache(cacheKey, url);
      return url;
    } catch (err) {
      console.error(`Impossible de lire documents/${category}/${fileName}`, err);
      return null;
    }
  }
}

export const fileSystem = new FileSystemService();
