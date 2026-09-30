import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { env, hasSupabase, supabaseKey } from '../config/env.js';
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

if (hasSupabase && supabaseKey) {
  try {
    supabase = createClient(env.SUPABASE_URL, supabaseKey, {
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
  expeditions: any[] = [];
  locations: any[] = [];
  documents: any[] = [];
  datasets: any[] = [];
  observations: any[] = [];
  measurements: any[] = [];
  media: any[] = [];
  evidenceLinks: any[] = [];
  relationships: any[] = [];
  outreach: any[] = [];
  jobs: any[] = [];
  profiles: any[] = [];
}

export const memoryStore = new MemoryStore();
