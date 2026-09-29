import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { env, hasSupabase } from '../config/env.js';
import {
  DEMO_EXPEDITIONS,
  DEMO_LOCATIONS,
  DEMO_DOCUMENTS,
  DEMO_DATASETS,
  DEMO_OBSERVATIONS,
  DEMO_MEASUREMENTS,
  DEMO_MEDIA,
  DEMO_EVIDENCE_LINKS,
  DEMO_RELATIONSHIPS,
  DEMO_OUTREACH,
  DEMO_JOBS
} from '../data/demoSeed.js';

export let supabase: SupabaseClient | null = null;

if (hasSupabase) {
  try {
    supabase = createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
      auth: { persistSession: false }
    });
    console.log('[POLARWEAVE] Connected to Supabase infrastructure at', env.SUPABASE_URL);
  } catch (err) {
    console.warn('[POLARWEAVE] Supabase client initialization warning:', err);
    supabase = null;
  }
} else {
  console.log('[POLARWEAVE] Supabase credentials not provided. Operating in high-fidelity In-Memory Demo Store.');
}

// In-Memory fallback store for rock-solid demo and resilience
export class MemoryStore {
  expeditions = [...DEMO_EXPEDITIONS];
  locations = [...DEMO_LOCATIONS];
  documents = [...DEMO_DOCUMENTS];
  datasets = [...DEMO_DATASETS];
  observations = [...DEMO_OBSERVATIONS];
  measurements = [...DEMO_MEASUREMENTS];
  media = [...DEMO_MEDIA];
  evidenceLinks = [...DEMO_EVIDENCE_LINKS];
  relationships = [...DEMO_RELATIONSHIPS];
  outreach = [...DEMO_OUTREACH];
  jobs = [...DEMO_JOBS];
}

export const memoryStore = new MemoryStore();
