import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { OrthoDiagState, PatientRecord, AppSettings, ClinicalSession, ClinicInfo } from '../types';

export const initialSession: ClinicalSession = {
  id: "T0",
  date: new Date().toISOString().split('T')[0],
  nomSession: "Bilan Initial (T0)",
  face: "", competenceLabiale: "", expoIncisives: "", profil: "", angleNasolabial: "", angleLabiomental: "", gummySmile: "", troisQuarts: "", symetrieVisage: "", asymetrieDetails: "", symetrieSourire: "",
  hygieneClin: "", parodonte: "", phenotype: "", hasCaries: false, cariesDent: "", hasFreins: false, freinsDent: "", hasParodontite: false, parodontiteDetails: "",
  hasSuccionPouceClin: false, hasInterpoLabial: false, hasDeglutitionAtypique: false, respiClin: "", hasRincageDents: false, hasAtm: false, succionPouceDetails: "", interpoLabialDetails: "", deglutitionAtypiqueDetails: "", rincageDentsDetails: "", atmDetails: "", anamnGenClin: "", remarqueClin: "", opgRemarque: "",
  overjet: "", classeMolaireD: "", classeMolaireG: "", classeCanineD: "", classeCanineG: "", hasXBiteAnt: false, xbiteAntDent: "", overbite: "", cdsD: "", cdsG: "", hasOcclusalCant: false, hasTraumatisant: false, lm: "", lmDetails: "", hasXSBitePost: false, xsbitePostDent: "",
  hasBeanceIncisives: false, hasArticuleCiseaux: false, hasBeanceLateroPost: false, beanceLateroPostDent: "",
  has17b: false,
  t16:'',t15:'',t14:'',t13:'',t12:'',t11:'',t21:'',t22:'',t23:'',t24:'',t25:'',t26:'',
  t46:'',t45:'',t44:'',t43:'',t42:'',t41:'',t31:'',t32:'',t33:'',t34:'',t35:'',t36:'',
  dispSup1513:'',dispSup1211:'',dispSup2122:'',dispSup2325:'',
  dispInf4543:'',dispInf4241:'',dispInf3132:'',dispInf3335:'',
  distInterMolSup:'',distInterMolInf:'', distPMSup:'',distPMInf:'', distCanSup:'',distCanInf:'', isDroschlActive: false,
  anb: "", spasppMego: "", incisifSpaspp: "", incisifMego: "", appS1: "", appS2: "", appS3: "",
  sna: "", snb: "", wits: "", snSpaspp: "", snMego: "", incisifSn: "", incisifIncisif: "",
  opgPresenceRas: true, opgPositionRas: true, opgProportionRas: true, opgPathologieRas: true,
  opgPresence: "", opgPosition: "", opgProportion: "", opgPathologie: "", radioOverview: "",
  hasAnodontie: false, anodontieDents: "", hasHyperodontie: false, hasAgenesieImportante: false, agenesieImportanteDents: "",
  hasAnkyloseLait: false, hasRetentionDent: false,
  hasDysplasieDentaire: false, hasRetentionAnkylose: false, has17a: false, has17c: false, has17e: false, hasRhizalyse: false,
  stadeMaturation: "",
  formeArcadeSup: "",
  formeArcadeInf: "",
  planTraitement1: "", planTraitement2: "", planTraitement3: "",
  planTraitement4: "", planTraitement5: "", planTraitement6: "",
  photosIntra: [],
  photosExtra: [],
  modelesStl: [],
  cephaloImages: [],
  opgImages: [],
  radioIntraImages: []
};

const initialPatient: PatientRecord = {
    id: "VDDS-001", nom: "Dupont", prenom: "Jean", pratique: "", sexe: "M", dateNaissance: "", datePremiereConsult: "", age: "",
    avs: "", compOrtho: "", caisseMaladie: "", numGarantie: "", adresse: "", npaLocalite: "", telephone: "", email: "", representantLegal: "",
    medecinTraitant: "", medecinDentaire: "", autreInfo: "",
    maladiesChroniques: { diabete: false, hypertension: false, allergies: false, cardio: false, respi: false, neuro: false },
    maladiesChroniquesDetails: { diabete: "", hypertension: "", allergies: "", cardio: "", respi: "", neuro: "" },
    hasChirurgies: false, chirurgiesAnterieures: "", hasTraitements: false, traitementsCours: "", allergiesMedic: "", hasAutreGen: false, autreGen: "",
    antecFamExtract: false, extractionDetails: "", carieRecurrente: false, sensibilite: false, hasOrthoPasse: false, traitementsOrthoPasses: "", hasAutreDent: false, autreDent: "", autreAntecDent: "",
    mauvaisesHabitudes: { succionPouce: false, bruxisme: false, rongerOngles: false, respiBuccale: false },
    hasFente: false, hasMacroglossie: false, hasSAOS: false, hasTroublesDeglutitionGrave: false, hasAsymetrieGrave: false, has17d: false,
    motifConsultation: "Dents en avant", praticien: "Dr. MA", dention: "", implant: "", implantDent: "",
    documents: [],
    sessions: [initialSession],
    activeSessionId: "T0"
};

const initialSettings: AppSettings = {
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

export const useStore = create<OrthoDiagState>()(
  persist(
    (set) => ({
      // File System App State
      isHubConnected: false,
      setHubConnected: (connected) => set({ isHubConnected: connected }),
      patientDirectory: null,
      setPatientDirectory: (handle) => set({ patientDirectory: handle }),

      activeTab: 'overview',
      setActiveTab: (tab) => set({ activeTab: tab }),

      patient: initialPatient,
      settings: initialSettings,

      updateSettings: (partial) => set((state) => ({ 
        settings: { ...state.settings, ...partial } 
      })),

      updatePatientField: (field, value) => set((state) => {
        if (typeof field === 'string' && field.includes('.')) {
          const parts = field.split('.');
          const root = parts[0];
          const rootObj = (state.patient as any)[root];
          if (parts.length === 2) {
            return { patient: { ...state.patient, [root]: { ...rootObj, [parts[1]]: value } } };
          }
          if (parts.length === 3) {
            const nested = rootObj?.[parts[1]];
            return { patient: { ...state.patient, [root]: { ...rootObj, [parts[1]]: { ...nested, [parts[2]]: value } } } };
          }
        }
        return {
          patient: { ...state.patient, [field as string]: value }
        };
      }),

      updateSessionField: (sessionId, field, value) => set((state) => ({
        patient: {
          ...state.patient,
          sessions: state.patient.sessions.map((s) => 
            s.id === sessionId ? { ...s, [field as string]: value } : s
          )
        }
      })),

      addSession: (session) => set((state) => ({
        patient: {
          ...state.patient,
          sessions: [...state.patient.sessions, session],
          activeSessionId: session.id
        }
      })),

      deleteSession: (sessionId) => set((state) => {
        const newSessions = state.patient.sessions.filter(s => s.id !== sessionId);
        return {
          patient: {
            ...state.patient,
            sessions: newSessions,
            activeSessionId: state.patient.activeSessionId === sessionId ? (newSessions[0]?.id || '') : state.patient.activeSessionId
          }
        };
      }),

      importPatientData: (data) => set(() => {
        // Full reset to initialPatient defaults, then overlay loaded data
        const merged: PatientRecord = { ...initialPatient, ...data };
        // Deep-merge nested objects
        merged.maladiesChroniques = { ...initialPatient.maladiesChroniques, ...(data.maladiesChroniques || {}) };
        merged.maladiesChroniquesDetails = { ...initialPatient.maladiesChroniquesDetails, ...(data.maladiesChroniquesDetails || {}) };
        merged.mauvaisesHabitudes = { ...initialPatient.mauvaisesHabitudes, ...(data.mauvaisesHabitudes || {}) };
        // Deep-merge each session with initialSession defaults
        if (data.sessions && Array.isArray(data.sessions)) {
          merged.sessions = data.sessions.map((s: any) => ({ ...initialSession, ...s }));
        }
        // Ensure documents array exists
        if (!Array.isArray(merged.documents)) {
          merged.documents = [];
        }
        return { patient: merged };
      }),

      setActiveSession: (sessionId) => set((state) => ({
        patient: { ...state.patient, activeSessionId: sessionId }
      })),

      addDocument: (doc) => set((state) => ({
        patient: { ...state.patient, documents: [...state.patient.documents, doc] }
      })),

      removeDocument: (docId) => set((state) => ({
        patient: { ...state.patient, documents: state.patient.documents.filter(d => d.id !== docId) }
      })),

      updateDocument: (docId, partial) => set((state) => ({
        patient: {
          ...state.patient,
          documents: state.patient.documents.map(d => d.id === docId ? { ...d, ...partial } : d)
        }
      }))
    }),
    {
      name: 'orthodiag-storage',
      merge: (persisted: any, current: any) => {
        const merged = { ...current, ...persisted };
        // Deep-merge settings so new keys (like insuranceCriteria) are preserved
        merged.settings = { ...current.settings, ...(persisted?.settings || {}) };
        merged.settings.insuranceCriteria = {
          ...current.settings.insuranceCriteria,
          ...(persisted?.settings?.insuranceCriteria || {}),
        };
        merged.settings.clinicInfo = {
          ...current.settings.clinicInfo,
          ...(persisted?.settings?.clinicInfo || {}),
        };
        // Deep-merge patient so new patient-level fields get defaults
        merged.patient = { ...current.patient, ...(persisted?.patient || {}) };
        // Deep-merge each session so new session fields get defaults from initialSession
        if (persisted?.patient?.sessions) {
          merged.patient.sessions = persisted.patient.sessions.map((s: any) => ({
            ...current.patient.sessions[0], // initialSession defaults
            ...s,
          }));
        }
        return merged;
      },
    }
  )
);
