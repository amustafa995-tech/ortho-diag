import { z } from 'zod';
import { CURRENT_SCHEMA_VERSION } from '../constants/fields';

// ── Session Schema ──
const clinicalSessionSchema = z.object({
  id: z.string(),
  date: z.string(),
  nomSession: z.string(),
}).passthrough(); // Allow all clinical fields without enumerating 100+ keys

// ── Nested Objects ──
const maladiesChroniquesSchema = z.object({
  diabete: z.boolean(),
  hypertension: z.boolean(),
  allergies: z.boolean(),
  cardio: z.boolean(),
  respi: z.boolean(),
  neuro: z.boolean(),
}).partial();

const mauvaisesHabitudesSchema = z.object({
  succionPouce: z.boolean(),
  bruxisme: z.boolean(),
  rongerOngles: z.boolean(),
  respiBuccale: z.boolean(),
}).partial();

const documentSchema = z.object({
  id: z.string(),
  fileName: z.string(),
  displayName: z.string(),
  category: z.string(),
  dateAdded: z.string(),
  originalName: z.string(),
  mimeType: z.string(),
  size: z.number(),
  notes: z.string(),
}).passthrough();

// ── Patient Record Schema ──
// Validates structural integrity — does NOT enforce every field's presence
// (most fields have sensible defaults via initialPatient merge)
export const patientRecordSchema = z.object({
  id: z.string().default(''),
  nom: z.string().default(''),
  prenom: z.string().default(''),
  sessions: z.array(clinicalSessionSchema).min(1, 'Au moins une session est requise'),
  activeSessionId: z.string(),
  documents: z.array(documentSchema).default([]),
  maladiesChroniques: maladiesChroniquesSchema.default({}),
  maladiesChroniquesDetails: z.record(z.string(), z.string()).default({}),
  mauvaisesHabitudes: mauvaisesHabitudesSchema.default({}),
  _version: z.number().optional(),
}).passthrough(); // Allow all other patient fields

export type PatientParseResult =
  | { success: true; data: z.infer<typeof patientRecordSchema> }
  | { success: false; error: string };

/**
 * Validate and coerce raw JSON data into a valid PatientRecord shape.
 * Returns a typed result — never throws.
 */
export function validatePatientData(raw: unknown): PatientParseResult {
  const result = patientRecordSchema.safeParse(raw);
  if (result.success) {
    return { success: true, data: result.data };
  }
  const issues = result.error.issues
    .slice(0, 5) // limit to first 5 for readability
    .map(i => `${i.path.join('.')}: ${i.message}`)
    .join('; ');
  return { success: false, error: `Données patient invalides — ${issues}` };
}

// ── Schema Migrations ──
// Each migration transforms data from version N to N+1

type Migration = (data: Record<string, any>) => Record<string, any>;

const migrations: Record<number, Migration> = {
  // Version 0 → 1: Add _version field, ensure documents array, normalize sessions
  0: (data) => {
    // Ensure documents array exists
    if (!Array.isArray(data.documents)) {
      data.documents = [];
    }
    // Ensure each session has an id
    if (Array.isArray(data.sessions)) {
      data.sessions = data.sessions.map((s: any, i: number) => ({
        ...s,
        id: s.id || `T${i}`,
        date: s.date || new Date().toISOString().split('T')[0],
        nomSession: s.nomSession || `Session ${i}`,
      }));
    }
    // Ensure activeSessionId
    if (!data.activeSessionId && Array.isArray(data.sessions) && data.sessions.length > 0) {
      data.activeSessionId = data.sessions[0].id;
    }
    data._version = 1;
    return data;
  },
  // Future migrations go here:
  // 1: (data) => { /* v1 → v2 */ data._version = 2; return data; },
};

/**
 * Apply all necessary migrations to bring data to the current schema version.
 * Mutates and returns the data object.
 */
export function migratePatientData(data: Record<string, any>): Record<string, any> {
  let version = typeof data._version === 'number' ? data._version : 0;

  while (version < CURRENT_SCHEMA_VERSION) {
    const migrate = migrations[version];
    if (!migrate) {
      console.warn(`Aucune migration trouvée pour la version ${version}. Saut au schema actuel.`);
      data._version = CURRENT_SCHEMA_VERSION;
      break;
    }
    data = migrate(data);
    version = data._version as number;
  }

  return data;
}
