import type { StateCreator } from 'zustand';
import type { OrthoDiagState } from '../../types';

export interface AppSlice {
  isHubConnected: boolean;
  setHubConnected: (connected: boolean) => void;
  patientDirectory: FileSystemDirectoryHandle | null;
  setPatientDirectory: (handle: FileSystemDirectoryHandle | null) => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export const createAppSlice: StateCreator<OrthoDiagState, [], [], AppSlice> = (set) => ({
  isHubConnected: false,
  setHubConnected: (connected: boolean) => set({ isHubConnected: connected }),
  patientDirectory: null,
  setPatientDirectory: (handle: FileSystemDirectoryHandle | null) => set({ patientDirectory: handle }),
  activeTab: 'overview',
  setActiveTab: (tab: string) => set({ activeTab: tab }),
});
