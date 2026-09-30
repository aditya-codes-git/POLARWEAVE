import {
  Observation,
  Expedition,
  Dataset,
  MediaAsset,
  ProcessingJob,
  EvidenceLink,
  GeneratedContent,
  OutreachGenerationRequest,
  ReviewAction,
  ApiResponse,
  UserProfile
} from '@polarweave/types';

const envObj = (typeof import.meta !== 'undefined' && (import.meta as any).env) ? (import.meta as any).env : (typeof process !== 'undefined' && process.env) ? process.env : {};
const rawApiBase = envObj.VITE_API_URL || 'http://localhost:5000';
const API_BASE = rawApiBase.replace(/\/+$/, '');

export function getAuthHeader(): Record<string, string> {
  try {
    // 1. If a real Supabase session exists, always use its live Bearer JWT token
    const sbAuthKey = Object.keys(localStorage).find((k) => k.startsWith('sb-') && k.endsWith('-auth-token'));
    if (sbAuthKey) {
      const raw = localStorage.getItem(sbAuthKey);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed?.access_token) {
          return { Authorization: `Bearer ${parsed.access_token}` };
        }
      }
    }

    // 2. Otherwise use the demo role tokens
    const activeRole = localStorage.getItem('polarweave_demo_role') || 'researcher';
    if (activeRole === 'admin') {
      return { Authorization: 'Bearer demo-admin-token' };
    }
    if (activeRole === 'public') {
      return { Authorization: 'Bearer demo-public-token' };
    }
    return { Authorization: 'Bearer demo-researcher-token' };
  } catch (e) {
    console.warn('[POLARWEAVE API] Failed to extract auth token:', e);
  }
  return { Authorization: 'Bearer demo-researcher-token' };
}

async function safeFetch<T>(endpoint: string, options?: RequestInit): Promise<T> {
  try {
    const res = await fetch(`${API_BASE}${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeader(),
        ...(options?.headers || {})
      }
    });
    if (!res.ok) {
      const errBody = await res.json().catch(() => ({}));
      const message = errBody?.error?.message || `HTTP ${res.status} ${res.statusText}`;
      const error = new Error(message);
      (error as any).status = res.status;
      (error as any).code = errBody?.error?.code || 'FETCH_ERROR';
      throw error;
    }
    const json: ApiResponse<T> = await res.json();
    if (json.success && json.data !== undefined) {
      return json.data;
    }
    throw new Error(json.error?.message || 'API request failed');
  } catch (err) {
    console.error(`[POLARWEAVE Client] API request failed for ${endpoint}:`, err);
    throw err;
  }
}

// ---------------------------------------------
// OBSERVATIONS
// ---------------------------------------------
export async function getObservations(filters?: {
  domain?: string;
  status?: string;
  expedition_id?: string;
  query?: string;
  job_id?: string;
  scope?: 'real' | 'demo' | 'all';
}): Promise<Observation[]> {
  try {
    const params = new URLSearchParams();
    if (filters?.domain) params.append('domain', filters.domain);
    if (filters?.status) params.append('status', filters.status);
    if (filters?.expedition_id) params.append('expedition_id', filters.expedition_id);
    if (filters?.query) params.append('query', filters.query);
    if (filters?.job_id) params.append('job_id', filters.job_id);
    if (filters?.scope) params.append('scope', filters.scope);

    return await safeFetch<Observation[]>(`/api/knowledge?${params.toString()}`);
  } catch (err) {
    return [];
  }
}

export async function getObservationById(id: string): Promise<Observation & { measurements?: any[]; evidence?: EvidenceLink[] }> {
  return await safeFetch<Observation & { measurements?: any[]; evidence?: EvidenceLink[] }>(`/api/knowledge/${id}`);
}

// ---------------------------------------------
// EVIDENCE TRACE (HERO DIFFERENTIATOR)
// ---------------------------------------------
export interface EvidenceTracePayload {
  knowledge_id: string;
  knowledge_title: string;
  confidence: number;
  verification_status: string;
  total_sources: number;
  evidence_chain: EvidenceLink[];
  grouped_sources: {
    reports: EvidenceLink[];
    datasets: EvidenceLink[];
    videos: EvidenceLink[];
    images: EvidenceLink[];
    field_notes: EvidenceLink[];
  };
}

export async function getEvidenceTrace(knowledgeId: string): Promise<EvidenceTracePayload> {
  try {
    return await safeFetch<EvidenceTracePayload>(`/api/evidence/${knowledgeId}`);
  } catch {
    return {
      knowledge_id: knowledgeId,
      knowledge_title: 'Evidence Trace',
      confidence: 0,
      verification_status: 'UNVERIFIED',
      total_sources: 0,
      evidence_chain: [],
      grouped_sources: {
        reports: [],
        datasets: [],
        videos: [],
        images: [],
        field_notes: []
      }
    };
  }
}

// ---------------------------------------------
// VERIFICATION WORKFLOW
// ---------------------------------------------
export async function submitReview(entityType: string, id: string, action: ReviewAction): Promise<any> {
  const headers = {
    'Content-Type': 'application/json',
    ...getAuthHeader()
  };

  const res = await fetch(`${API_BASE}/api/review/${entityType}/${id}`, {
    method: 'POST',
    headers,
    body: JSON.stringify(action)
  });

  const json = await res.json().catch(() => ({}));
  if (!res.ok || json.success === false) {
    const errorMsg = json.error?.message || `Review action failed with status ${res.status}`;
    const err = new Error(errorMsg);
    (err as any).code = json.error?.code || 'FORBIDDEN';
    (err as any).status = res.status;
    throw err;
  }
  return json.data;
}

// ---------------------------------------------
// EXPEDITIONS
// ---------------------------------------------
export async function getExpeditions(): Promise<Expedition[]> {
  try {
    return await safeFetch<Expedition[]>('/api/expeditions');
  } catch {
    return [];
  }
}

export async function getExpeditionById(id: string): Promise<Expedition & { observations?: Observation[]; datasets?: Dataset[]; media?: MediaAsset[] }> {
  return await safeFetch<Expedition & { observations?: Observation[]; datasets?: Dataset[]; media?: MediaAsset[] }>(`/api/expeditions/${id}`);
}

// ---------------------------------------------
// DATASETS & MEDIA
// ---------------------------------------------
export async function getDatasets(): Promise<Dataset[]> {
  try {
    return await safeFetch<Dataset[]>('/api/datasets');
  } catch {
    return [];
  }
}

export async function getMedia(type?: string): Promise<MediaAsset[]> {
  try {
    const query = type ? `?type=${type}` : '';
    return await safeFetch<MediaAsset[]>(`/api/media${query}`);
  } catch {
    return [];
  }
}

// ---------------------------------------------
// INGESTION & PROCESSING
// ---------------------------------------------
export async function processPackage(formData?: FormData): Promise<{ job: ProcessingJob; extracted_observations: Observation[]; evidence_links_count: number }> {
  const authHeaders = getAuthHeader();
  const options: RequestInit = {
    method: 'POST',
    headers: {
      ...authHeaders
    }
  };

  if (formData) {
    options.body = formData;
  } else {
    options.headers = {
      'Content-Type': 'application/json',
      ...authHeaders
    };
    options.body = JSON.stringify({ expedition_id: 'exp_45_ant' });
  }


  const res = await fetch(`${API_BASE}/api/ingest/process`, options);
  if (!res.ok) {
    const errorJson = await res.json().catch(() => ({}));
    throw new Error(errorJson?.error?.message || `Processing failed with status ${res.status}`);
  }
  const json = await res.json();
  if (json.success && json.data) {
    return json.data;
  }
  throw new Error(json.error?.message || 'Processing failed');
}

export async function getProcessingJobs(): Promise<ProcessingJob[]> {
  try {
    return await safeFetch<ProcessingJob[]>('/api/ingest/jobs');
  } catch {
    return [];
  }
}

export async function getJobById(id: string): Promise<ProcessingJob> {
  return await safeFetch<ProcessingJob>(`/api/ingest/jobs/${id}`);
}

export interface ResearchPackagePayload {
  job: ProcessingJob;
  title: string;
  original_filename?: string;
  upload_date: string;
  researcher: string;
  review_status: 'VERIFIED' | 'NEEDS_REVIEW' | 'PARTIALLY_VERIFIED' | 'REJECTED' | 'EMPTY';
  artifact_count: number;
  counts: {
    documents: number;
    observations: number;
    measurements: number;
    datasets: number;
    media: number;
    evidence_links: number;
    relationships: number;
    outreach: number;
  };
  documents: any[];
  observations: Observation[];
  measurements: any[];
  datasets: Dataset[];
  media: MediaAsset[];
  evidence_links: EvidenceLink[];
  relationships: any[];
  outreach: GeneratedContent[];
}

export async function getJobPackage(id: string): Promise<ResearchPackagePayload> {
  return await safeFetch<ResearchPackagePayload>(`/api/ingest/jobs/${id}/package`);
}

export async function renameProcessingJob(id: string, title: string): Promise<ProcessingJob> {
  const res = await fetch(`${API_BASE}/api/ingest/jobs/${id}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeader()
    },
    body: JSON.stringify({ title })
  });

  if (!res.ok) {
    const errJson = await res.json().catch(() => ({}));
    throw new Error(errJson?.error?.message || `Failed to rename package (status ${res.status})`);
  }

  const json = await res.json();
  if (json.success && json.data) {
    return json.data;
  }
  throw new Error(json.error?.message || 'Failed to rename package');
}


// ---------------------------------------------
// KNOWLEDGE GRAPH
// ---------------------------------------------
export async function getKnowledgeGraph(params?: { jobId?: string; scope?: string }): Promise<{ nodes: any[]; edges: any[] }> {
  try {
    const q = new URLSearchParams();
    if (params?.jobId) q.append('job_id', params.jobId);
    if (params?.scope) q.append('scope', params.scope);
    const queryStr = q.toString() ? `?${q.toString()}` : '';
    return await safeFetch<{ nodes: any[]; edges: any[] }>(`/api/knowledge/graph${queryStr}`);
  } catch {
    return { nodes: [], edges: [] };
  }
}

// ---------------------------------------------
// OUTREACH STUDIO
// ---------------------------------------------
export async function generateOutreach(req: OutreachGenerationRequest): Promise<GeneratedContent> {
  const res = await fetch(`${API_BASE}/api/outreach/generate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(req)
  });
  const json = await res.json();
  if (json.success && json.data) {
    return json.data;
  }
  throw new Error(json.error?.message || 'Outreach generation failed');
}

export async function getOutreachList(): Promise<GeneratedContent[]> {
  try {
    return await safeFetch<GeneratedContent[]>('/api/outreach');
  } catch {
    return [];
  }
}

// ---------------------------------------------
// SEARCH & "ASK THE EVIDENCE"
// ---------------------------------------------
export async function searchRepository(q: string, filters?: Record<string, string>): Promise<any> {
  try {
    const params = new URLSearchParams({ q, ...filters });
    return await safeFetch<any>(`/api/search?${params.toString()}`);
  } catch {
    return {
      total: 0,
      query: q,
      results: []
    };
  }
}

export async function askTheEvidenceQuery(query: string): Promise<{ answer: string; evidence: EvidenceLink[]; found: boolean }> {
  try {
    const res = await fetch(`${API_BASE}/api/search/ask-the-evidence`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query })
    });
    const json = await res.json();
    return json.data;
  } catch {
    return {
      answer: 'Unable to reach knowledge search service.',
      evidence: [],
      found: false
    };
  }
}

// ---------------------------------------------
// USER PROFILE & ONBOARDING
// ---------------------------------------------
export async function getCurrentUserProfile(): Promise<UserProfile | null> {
  try {
    return await safeFetch<UserProfile>('/api/auth/me');
  } catch {
    return null;
  }
}

