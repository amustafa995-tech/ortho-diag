export interface DocFile {
  name: string;
  url: string;
}

export type DataSource = 'LOCAL' | 'ZAWIN';

// ── Document Management ──
export type DocumentCategory = 'ID' | 'ASS' | 'ASS-DOC' | 'LTR' | 'DEV' | 'CONS' | 'RAD' | 'PHO' | 'RPT' | 'FAC' | 'AUT';

export interface PatientDocument {
  id: string;
  fileName: string;          // nom sur le disque
  displayName: string;       // nom affiché (renommable)
  category: DocumentCategory;
  dateAdded: string;         // ISO date
  originalName: string;      // nom original à l'upload
  mimeType: string;
  size: number;              // bytes
  notes: string;
}

export const DOCUMENT_CATEGORIES: { code: DocumentCategory; label: string; description: string }[] = [
  { code: 'ID',      label: 'Identité',              description: 'CNI, passeport, carte de séjour' },
  { code: 'ASS',     label: 'Carte Assurance',        description: 'Carte assurance maladie, complémentaire' },
  { code: 'ASS-DOC', label: 'Courrier Assurance',     description: 'Demandes de prise en charge, réponses, garanties' },
  { code: 'LTR',     label: 'Lettres',                description: 'Correspondance médecins, spécialistes' },
  { code: 'DEV',     label: 'Devis',                  description: 'Devis de traitement' },
  { code: 'CONS',    label: 'Consentement',            description: 'Formulaires de consentement signés' },
  { code: 'RAD',     label: 'Radiographies',           description: 'OPG, céphalos, CBCT, radio intra' },
  { code: 'PHO',     label: 'Photos',                  description: 'Photos cliniques extra/intra-orales' },
  { code: 'RPT',     label: 'Rapports',                description: 'Rapports de consultation, bilans' },
  { code: 'FAC',     label: 'Factures',                description: 'Factures émises, rappels' },
  { code: 'AUT',     label: 'Autre',                   description: 'Documents non catégorisés' },
];

export interface ClinicInfo {
  clinicName: string;
  clinicAddress: string;
  clinicNPA: string;
  clinicPhone: string;
  clinicEmail: string;
  clinicRCC: string;        // n° RCC du praticien
  clinicGLN: string;        // n° GLN
}

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
  // Insurance detection fields - Clinical
  hasBeanceIncisives: boolean; hasArticuleCiseaux: boolean; hasBeanceLateroPost: boolean; beanceLateroPostDent: string;
  has17b: boolean;
  
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
  // Insurance detection fields - OPG
  hasAnodontie: boolean; anodontieDents: string; hasHyperodontie: boolean; hasAgenesieImportante: boolean; agenesieImportanteDents: string;
  hasAnkyloseLait: boolean; hasRetentionDent: boolean;
  hasDysplasieDentaire: boolean; hasRetentionAnkylose: boolean; has17a: boolean; has17c: boolean; has17e: boolean; hasRhizalyse: boolean;
  
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
  caisseMaladie: string;
  numGarantie: string;
  adresse: string;
  npaLocalite: string;
  telephone: string;
  email: string;
  representantLegal: string;
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

  // Insurance detection fields - Medical (patient-level)
  hasFente: boolean; hasMacroglossie: boolean; hasSAOS: boolean; hasTroublesDeglutitionGrave: boolean; hasAsymetrieGrave: boolean; has17d: boolean;

  // Documents
  documents: PatientDocument[];

  // Sessions
  sessions: ClinicalSession[];
  activeSessionId: string;

  // Schema migration
  _version?: number;
}

export interface InsuranceCriteria {
  // AI criteria (< 20 ans)
  ai208_anb: number;          // ANB threshold for micromandibulie (default 9)
  ai208_anb_combo: number;    // ANB combined threshold (default 7)
  ai208_snmego_combo: number; // SN-MeGo combined threshold (default 37)
  ai208_overjet_screen: number; // Clinical screening OJ (default 9mm)
  ai209_snmego_open: number;  // Mordex apertus SN-MeGo (default 40)
  ai209_snmego_open_combo: number; // combined (default 37)
  ai209_snmego_deep: number;  // Mordex clausus SN-MeGo max (default 12)
  ai209_snmego_deep_combo: number; // combined (default 15)
  ai210_anb: number;          // Prognathie inf ANB (default -1)
  ai210_anb_combo: number;    // combined ANB (default 1)
  // HG criteria
  hg_overjet: number;         // OJ threshold (default 8)
  hg_overbite_open_teeth: number; // Béance > N dents (default 6)
  hg_encombrement: number;    // DDM encombrement threshold (default 8)
  hg_age_max: number;         // Age max (default 18)
}

export interface AppSettings {
  dataSource: DataSource;
  doctors: Doctor[];
  praticiens: Praticien[];
  insuranceCriteria: InsuranceCriteria;
  clinicInfo: ClinicInfo;
}

export interface OrthoDiagState {
  // File System Access
  isHubConnected: boolean;
  setHubConnected: (connected: boolean) => void;
  patientDirectory: FileSystemDirectoryHandle | null;
  setPatientDirectory: (handle: FileSystemDirectoryHandle | null) => void;

  // Active App State
  activeTab: string;
  setActiveTab: (tab: string) => void;
  
  // Patient State
  patient: PatientRecord;
  
  // Settings
  settings: AppSettings;
  updateSettings: (partial: Partial<AppSettings>) => void;

  // Global Updater (Optimized for performance)
  updatePatientField: (field: keyof PatientRecord | string, value: string | number | boolean | string[] | Record<string, unknown>) => void;
  updateSessionField: (sessionId: string, field: keyof ClinicalSession | string, value: string | number | boolean | string[] | Record<string, unknown>) => void;
  
  // Sessions Management
  addSession: (session: ClinicalSession) => void;
  deleteSession: (sessionId: string) => void;
  setActiveSession: (sessionId: string) => void;
  importPatientData: (data: Partial<PatientRecord>) => void;

  // Document Management
  addDocument: (doc: PatientDocument) => void;
  removeDocument: (docId: string) => void;
  updateDocument: (docId: string, partial: Partial<PatientDocument>) => void;
}
