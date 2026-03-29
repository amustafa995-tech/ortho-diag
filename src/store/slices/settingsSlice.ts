import type { StateCreator } from 'zustand';
import type { OrthoDiagState, AppSettings } from '../../types';

export const initialSettings: AppSettings = {
  dataSource: 'LOCAL',
  doctors: [
    { id: 1, nom: "Martin", prenom: "Luc" },
    { id: 2, nom: "Roux", prenom: "Sophie" }
  ],
  praticiens: [
    { id: 1, nom: "Al-Yassary", prenom: "M.", abrev: "Dr. MA" },
    { id: 2, nom: "Dubois", prenom: "J.", abrev: "Dr. JD" }
  ],
  insuranceCriteria: {
    ai208_anb: 9, ai208_anb_combo: 7, ai208_snmego_combo: 37, ai208_overjet_screen: 9,
    ai209_snmego_open: 40, ai209_snmego_open_combo: 37,
    ai209_snmego_deep: 12, ai209_snmego_deep_combo: 15,
    ai210_anb: -1, ai210_anb_combo: 1,
    hg_overjet: 8, hg_overbite_open_teeth: 6, hg_encombrement: 8, hg_age_max: 18,
  },
  clinicInfo: {
    clinicName: '', clinicAddress: '', clinicNPA: '', clinicPhone: '', clinicEmail: '', clinicRCC: '', clinicGLN: '',
  }
};

export interface SettingsSlice {
  settings: AppSettings;
  updateSettings: (partial: Partial<AppSettings>) => void;
}

export const createSettingsSlice: StateCreator<OrthoDiagState, [], [], SettingsSlice> = (set) => ({
  settings: initialSettings,
  updateSettings: (partial: Partial<AppSettings>) => set((state: OrthoDiagState) => ({
    settings: { ...state.settings, ...partial }
  })),
});
