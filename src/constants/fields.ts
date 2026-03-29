// Centralized field definitions for completion tracking.
// Single source of truth — used by App.tsx badges, OverviewTab, and completion calculations.

export const INFO_FIELDS = ['nom', 'prenom', 'sexe', 'dateNaissance', 'avs', 'medecinTraitant'] as const;

export const CLIN_FIELDS = [
  'face', 'symetrieVisage', 'profil', 'angleNasolabial', 'angleLabiomental',
  'troisQuarts', 'gummySmile', 'symetrieSourire', 'competenceLabiale', 'expoIncisives',
  'overjet', 'classeCanineD', 'classeCanineG', 'classeMolaireD', 'classeMolaireG',
  'overbite', 'cdsD', 'cdsG', 'lm', 'hygieneClin', 'phenotype',
] as const;

export const EXTRA_ORAL_FIELDS = [
  'face', 'symetrieVisage', 'profil', 'angleNasolabial', 'angleLabiomental',
  'troisQuarts', 'gummySmile', 'symetrieSourire', 'competenceLabiale', 'expoIncisives',
] as const;

export const INTRA_ORAL_FIELDS = [
  'overjet', 'classeCanineD', 'classeCanineG', 'classeMolaireD', 'classeMolaireG',
  'overbite', 'cdsD', 'cdsG', 'lm',
] as const;

export const MAX_TEETH_KEYS = ['t16','t15','t14','t13','t12','t11','t21','t22','t23','t24','t25','t26'] as const;
export const MAX_TEETH_LABELS = ['16','15','14','13','12','11','21','22','23','24','25','26'] as const;
export const MAND_TEETH_KEYS = ['t46','t45','t44','t43','t42','t41','t31','t32','t33','t34','t35','t36'] as const;
export const MAND_TEETH_LABELS = ['46','45','44','43','42','41','31','32','33','34','35','36'] as const;

export const MOUL_FIELDS = [...MAX_TEETH_KEYS, ...MAND_TEETH_KEYS] as const;

export const RADIO_FIELDS = [
  'sna', 'snb', 'anb', 'wits', 'snSpaspp', 'spasppMego', 'snMego',
  'incisifSn', 'incisifSpaspp', 'incisifMego', 'incisifIncisif', 'stadeMaturation',
] as const;

export const TRAIT_FIELDS = ['planTraitement1', 'planTraitement2', 'planTraitement3', 'planTraitement4', 'planTraitement5'] as const;

export const DISP_FIELDS = ['dispSup1513', 'dispSup1211', 'dispSup2122', 'dispSup2325', 'dispInf4543', 'dispInf4241', 'dispInf3132', 'dispInf3335'] as const;

export const DIST_FIELDS = ['distInterMolSup', 'distInterMolInf', 'distPMSup', 'distPMInf', 'distCanSup', 'distCanInf'] as const;

// Helper: count filled fields on any object
export const countFilled = (fields: readonly string[], obj: any): number =>
  fields.filter(f => !!obj?.[f]).length;

// Schema version for migration support
export const CURRENT_SCHEMA_VERSION = 1;
