export interface DocFile {
  name: string;
  url: string;
}

export type DataSource = 'LOCAL' | 'ZAWIN';

export interface Doctor {
  id: number;
  nom: string;
  prenom: string;
}

export interface Praticien {
  id: number;
  nom: string;
  prenom: string;
  abrev: string;
}

export interface MaladiesChroniques {
  diabete: boolean;
  hypertension: boolean;
  allergies: boolean;
  cardio: boolean;
  respi: boolean;
  neuro: boolean;
}

export interface MaladiesChroniquesDetails {
  diabete: string;
  hypertension: string;
  allergies: string;
  cardio: string;
  respi: string;
  neuro: string;
}

export interface MauvaisesHabitudes {
  succionPouce: boolean;
  bruxisme: boolean;
  rongerOngles: boolean;
  respiBuccale: boolean;
}

export interface ClinicalSession {
  id: string;
  date: string;
  nomSession: string;
  
  // Examen Clinique
  face: string; competenceLabiale: string; expoIncisives: string; profil: string; angleNasolabial: string; angleLabiomental: string; gummySmile: string; troisQuarts: string; symetrieVisage: string; asymetrieDetails: string; symetrieSourire: string;
  hygieneClin: string; parodonte: string; phenotype: string; hasCaries: boolean; cariesDent: string; hasFreins: boolean; freinsDent: string; hasParodontite: boolean; parodontiteDetails: string;
  hasSuccionPouceClin: boolean; hasInterpoLabial: boolean; hasDeglutitionAtypique: boolean; respiClin: string; hasRincageDents: boolean; hasAtm: boolean; succionPouceDetails: string; interpoLabialDetails: string; deglutitionAtypiqueDetails: string; rincageDentsDetails: string; atmDetails: string; anamnGenClin: string; remarqueClin: string; opgRemarque: string;
  overjet: string; classeMolaireD: string; classeMolaireG: string; classeCanineD: string; classeCanineG: string; hasXBiteAnt: boolean; xbiteAntDent: string; overbite: string; cdsD: string; cdsG: string; hasOcclusalCant: boolean; hasTraumatisant: boolean; lm: string; lmDetails: string; hasXSBitePost: boolean; xsbitePostDent: string;
  
  // Moulages (Dents)
  t16:string; t15:string; t14:string; t13:string; t12:string; t11:string; t21:string; t22:string; t23:string; t24:string; t25:string; t26:string;
  t46:string; t45:string; t44:string; t43:string; t42:string; t41:string; t31:string; t32:string; t33:string; t34:string; t35:string; t36:string;
  
  dispSup1513:string; dispSup1211:string; dispSup2122:string; dispSup2325:string;
  dispInf4543:string; dispInf4241:string; dispInf3132:string; dispInf3335:string;
  distInterMolSup:string; distInterMolInf:string; distPMSup:string; distPMInf:string; distCanSup:string; distCanInf:string; isDroschlActive: boolean;
  
  // Céphalométrie
  anb: string; spasppMego: string; incisifSpaspp: string; incisifMego: string; appS1: string; appS2: string; appS3: string;
  sna: string; snb: string; wits: string; snSpaspp: string; snMego: string; incisifSn: string; incisifIncisif: string;
  
  opgPresenceRas: boolean; opgPositionRas: boolean; opgProportionRas: boolean; opgPathologieRas: boolean; 
  opgPresence: string; opgPosition: string; opgProportion: string; opgPathologie: string; radioOverview: string;
  
  stadeMaturation: string;
  formeArcadeSup: string;
  formeArcadeInf: string;

  planTraitement1: string; planTraitement2: string; planTraitement3: string;
  planTraitement4: string; planTraitement5: string; planTraitement6: string;

  // New Media Tabs for the session
  photosIntra: string[];
  photosExtra: string[];
  modelesStl: string[];
  cephaloImages: string[];
  opgImages: string[];
  radioIntraImages: string[];
}

export interface PatientRecord {
  // Identities
  id: string; // Zawin ID or Local
  nom: string;
  prenom: string;
  pratique: string;
  sexe: string;
  dateNaissance: string;
  datePremiereConsult: string;
  age: string;
  avs: string;
  compOrtho: string;
  medecinTraitant: string;
  medecinDentaire: string;
  autreInfo: string;
  motifConsultation: string;
  praticien: string;
  dention: string;
  implant: string;
  implantDent: string;

  // Medical History
  maladiesChroniques: MaladiesChroniques;
  maladiesChroniquesDetails: MaladiesChroniquesDetails;
  hasChirurgies: boolean;
  chirurgiesAnterieures: string;
  hasTraitements: boolean;
  traitementsCours: string;
  allergiesMedic: string;
  hasAutreGen: boolean;
  autreGen: string;

  // Dental History
  antecFamExtract: boolean;
  extractionDetails: string;
  carieRecurrente: boolean;
  sensibilite: boolean;
  hasOrthoPasse: boolean;
  traitementsOrthoPasses: string;
  hasAutreDent: boolean;
  autreDent: string;
  autreAntecDent: string;
  mauvaisesHabitudes: MauvaisesHabitudes;

  // Sessions
  sessions: ClinicalSession[];
  activeSessionId: string;
}

export interface AppSettings {
  dataSource: DataSource;
  doctors: Doctor[];
  praticiens: Praticien[];
}

export interface OrthoDiagState {
  // File System Access
  isHubConnected: boolean;
  setHubConnected: (connected: boolean) => void;
  patientDirectory: any | null; // using any to avoid TS FileSystemDirectoryHandle missing type error if lib isn't perfectly configured
  setPatientDirectory: (handle: any | null) => void;

  // Active App State
  activeTab: string;
  setActiveTab: (tab: string) => void;
  
  // Patient State
  patient: PatientRecord;
  
  // Settings
  settings: AppSettings;
  updateSettings: (partial: Partial<AppSettings>) => void;

  // Global Updater (Optimized for performance)
  updatePatientField: (field: keyof PatientRecord | string, value: any) => void;
  updateSessionField: (sessionId: string, field: keyof ClinicalSession | string, value: any) => void;
  
  // Sessions Management
  addSession: (session: ClinicalSession) => void;
  deleteSession: (sessionId: string) => void;
  setActiveSession: (sessionId: string) => void;
  importPatientData: (data: Partial<PatientRecord>) => void;
}
