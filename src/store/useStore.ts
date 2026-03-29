import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { OrthoDiagState } from '../types';
import { createAppSlice } from './slices/appSlice';
import { createSettingsSlice, initialSettings } from './slices/settingsSlice';
import { createPatientSlice, initialSession, createInitialSession, initialPatient } from './slices/patientSlice';

// UUID generator (no external dependency)
const generateId = (): string =>
  `${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;

export { generateId, initialSession, createInitialSession, initialPatient };

export const useStore = create<OrthoDiagState>()(
  persist(
    (...a) => ({
      ...createAppSlice(...a),
      ...createSettingsSlice(...a),
      ...createPatientSlice(...a),
    }),
    {
      name: 'orthodiag-storage',
      merge: (persisted: any, current: any) => {
        const merged = { ...current, ...persisted };
        // Deep-merge settings
        merged.settings = { ...initialSettings, ...(persisted?.settings || {}) };
        merged.settings.insuranceCriteria = {
          ...initialSettings.insuranceCriteria,
          ...(persisted?.settings?.insuranceCriteria || {}),
        };
        merged.settings.clinicInfo = {
          ...initialSettings.clinicInfo,
          ...(persisted?.settings?.clinicInfo || {}),
        };
        // Deep-merge patient
        merged.patient = { ...current.patient, ...(persisted?.patient || {}) };
        // Deep-merge each session with initialSession defaults
        if (persisted?.patient?.sessions) {
          merged.patient.sessions = persisted.patient.sessions.map((s: any) => ({
            ...createInitialSession(),
            ...s,
          }));
        }
        // Ensure documents array
        if (!Array.isArray(merged.patient.documents)) {
          merged.patient.documents = [];
        }
        return merged;
      },
    }
  )
);
