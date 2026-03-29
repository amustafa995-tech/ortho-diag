import type { StateCreator } from 'zustand';
import type { OrthoDiagState, PatientRecord, PatientDocument, ClinicalSession } from '../../types';
import { CURRENT_SCHEMA_VERSION } from '../../constants/fields';

export const initialSession: Readonly<ClinicalSession> = Object.freeze({
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
});

/** Factory that returns a fresh session with new array instances each time. */
export const createInitialSession = (): ClinicalSession => ({
  ...initialSession,
  photosIntra: [],
  photosExtra: [],
  modelesStl: [],
  cephaloImages: [],
  opgImages: [],
  radioIntraImages: [],
});

export const initialPatient: PatientRecord = {
  id: "", nom: "", prenom: "", pratique: "", sexe: "", dateNaissance: "", datePremiereConsult: "", age: "",
  avs: "", compOrtho: "", caisseMaladie: "", numGarantie: "", adresse: "", npaLocalite: "", telephone: "", email: "", representantLegal: "",
  medecinTraitant: "", medecinDentaire: "", autreInfo: "",
  maladiesChroniques: { diabete: false, hypertension: false, allergies: false, cardio: false, respi: false, neuro: false },
  maladiesChroniquesDetails: { diabete: "", hypertension: "", allergies: "", cardio: "", respi: "", neuro: "" },
  hasChirurgies: false, chirurgiesAnterieures: "", hasTraitements: false, traitementsCours: "", allergiesMedic: "", hasAutreGen: false, autreGen: "",
  antecFamExtract: false, extractionDetails: "", carieRecurrente: false, sensibilite: false, hasOrthoPasse: false, traitementsOrthoPasses: "", hasAutreDent: false, autreDent: "", autreAntecDent: "",
  mauvaisesHabitudes: { succionPouce: false, bruxisme: false, rongerOngles: false, respiBuccale: false },
  hasFente: false, hasMacroglossie: false, hasSAOS: false, hasTroublesDeglutitionGrave: false, hasAsymetrieGrave: false, has17d: false,
  motifConsultation: "", praticien: "", dention: "", implant: "", implantDent: "",
  documents: [],
  sessions: [createInitialSession()],
  activeSessionId: "T0",
  _version: CURRENT_SCHEMA_VERSION,
};

type FieldValue = string | number | boolean | string[] | Record<string, unknown>;

export interface PatientSlice {
  patient: PatientRecord;
  updatePatientField: (field: keyof PatientRecord | string, value: FieldValue) => void;
  updateSessionField: (sessionId: string, field: keyof ClinicalSession | string, value: FieldValue) => void;
  addSession: (session: ClinicalSession) => void;
  deleteSession: (sessionId: string) => void;
  setActiveSession: (sessionId: string) => void;
  importPatientData: (data: Partial<PatientRecord>) => void;
  addDocument: (doc: PatientDocument) => void;
  removeDocument: (docId: string) => void;
  updateDocument: (docId: string, partial: Partial<PatientDocument>) => void;
}

export const createPatientSlice: StateCreator<OrthoDiagState, [], [], PatientSlice> = (set) => ({
  patient: initialPatient,

  updatePatientField: (field: keyof PatientRecord | string, value: FieldValue) => set((state: OrthoDiagState) => {
    if (typeof field === 'string' && field.includes('.')) {
      const parts = field.split('.');
      const root = parts[0];
      const rootObj = (state.patient as any)[root] || {};
      if (parts.length === 2) {
        return { patient: { ...state.patient, [root]: { ...rootObj, [parts[1]]: value } } };
      }
      if (parts.length === 3) {
        const nested = rootObj[parts[1]] || {};
        return { patient: { ...state.patient, [root]: { ...rootObj, [parts[1]]: { ...nested, [parts[2]]: value } } } };
      }
    }
    return { patient: { ...state.patient, [field as string]: value } };
  }),

  updateSessionField: (sessionId: string, field: keyof ClinicalSession | string, value: FieldValue) => set((state: OrthoDiagState) => ({
    patient: {
      ...state.patient,
      sessions: state.patient.sessions.map((s: ClinicalSession) =>
        s.id === sessionId ? { ...s, [field as string]: value } : s
      )
    }
  })),

  addSession: (session: ClinicalSession) => set((state: OrthoDiagState) => {
    const MAX_SESSIONS = 20;
    if (state.patient.sessions.length >= MAX_SESSIONS) {
      console.warn(`Maximum number of sessions (${MAX_SESSIONS}) reached.`);
      return state;
    }
    return {
      patient: {
        ...state.patient,
        sessions: [...state.patient.sessions, { ...createInitialSession(), ...session }],
        activeSessionId: session.id
      }
    };
  }),

  deleteSession: (sessionId: string) => set((state: OrthoDiagState) => {
    if (state.patient.sessions.length <= 1) return state;
    const newSessions = state.patient.sessions.filter((s: ClinicalSession) => s.id !== sessionId);
    return {
      patient: {
        ...state.patient,
        sessions: newSessions,
        activeSessionId: state.patient.activeSessionId === sessionId
          ? newSessions[0].id
          : state.patient.activeSessionId
      }
    };
  }),

  importPatientData: (data: Partial<PatientRecord>) => set(() => {
    const merged: PatientRecord = { ...initialPatient, ...data, _version: CURRENT_SCHEMA_VERSION };
    merged.maladiesChroniques = { ...initialPatient.maladiesChroniques, ...(data.maladiesChroniques || {}) };
    merged.maladiesChroniquesDetails = { ...initialPatient.maladiesChroniquesDetails, ...(data.maladiesChroniquesDetails || {}) };
    merged.mauvaisesHabitudes = { ...initialPatient.mauvaisesHabitudes, ...(data.mauvaisesHabitudes || {}) };
    if (data.sessions && Array.isArray(data.sessions)) {
      merged.sessions = data.sessions.map((s: any) => ({ ...createInitialSession(), ...s }));
    }
    if (!merged.sessions.length) {
      merged.sessions = [createInitialSession()];
      merged.activeSessionId = 'T0';
    }
    if (!merged.sessions.some(s => s.id === merged.activeSessionId)) {
      merged.activeSessionId = merged.sessions[0].id;
    }
    if (!Array.isArray(merged.documents)) {
      merged.documents = [];
    }
    return { patient: merged };
  }),

  setActiveSession: (sessionId: string) => set((state: OrthoDiagState) => ({
    patient: { ...state.patient, activeSessionId: sessionId }
  })),

  addDocument: (doc: PatientDocument) => set((state: OrthoDiagState) => ({
    patient: { ...state.patient, documents: [...state.patient.documents, doc] }
  })),

  removeDocument: (docId: string) => set((state: OrthoDiagState) => ({
    patient: { ...state.patient, documents: state.patient.documents.filter((d: PatientDocument) => d.id !== docId) }
  })),

  updateDocument: (docId: string, partial: Partial<PatientDocument>) => set((state: OrthoDiagState) => ({
    patient: {
      ...state.patient,
      documents: state.patient.documents.map((d: PatientDocument) => d.id === docId ? { ...d, ...partial } : d)
    }
  })),
});
