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
  ApiResponse
} from '@polarweave/types';
import {
  DEMO_OBSERVATIONS,
  DEMO_EXPEDITIONS,
  DEMO_DATASETS,
  DEMO_MEDIA,
  DEMO_EVIDENCE_LINKS,
  DEMO_OUTREACH,
  DEMO_JOBS
} from '../data/demoData';

const envObj = (typeof import.meta !== 'undefined' && (import.meta as any).env) ? (import.meta as any).env : (typeof process !== 'undefined' && process.env) ? process.env : {};
const API_BASE = envObj.VITE_API_URL || 'http://localhost:5000';

export function getAuthHeader(): Record<string, string> {
  try {
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
    const activeRole = localStorage.getItem('polarweave_demo_role') || 'researcher';
    if (activeRole === 'admin') {
      return { Authorization: 'Bearer demo-admin-token' };
    } else if (activeRole === 'public') {
      return { Authorization: 'Bearer demo-public-token' };
    }
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
    if (!res.ok) throw new Error(`HTTP error ${res.status}`);
    const json: ApiResponse<T> = await res.json();
    if (json.success && json.data !== undefined) {
      return json.data;
    }
    throw new Error(json.error?.message || 'API request failed');
  } catch (err) {
    console.warn(`[POLARWEAVE Client] Endpoint ${endpoint} unreachable or error; utilizing resilient demo state.`, err);
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
    if (filters?.scope === 'real' || filters?.job_id) {
      // Do NOT fallback to demo data if real uploads or specific jobs are requested
      return [];
    }

    let list = [...DEMO_OBSERVATIONS];
    if (filters?.domain && filters.domain !== 'ALL') {
      list = list.filter((o) => o.research_domain.toLowerCase() === filters.domain?.toLowerCase());
    }
    if (filters?.status && filters.status !== 'ALL') {
      list = list.filter((o) => o.verification_status === filters.status);
    }
    if (filters?.query) {
      const q = filters.query.toLowerCase();
      list = list.filter((o) => o.title.toLowerCase().includes(q) || o.description.toLowerCase().includes(q));
    }
    return list;
  }
}

export async function getObservationById(id: string): Promise<Observation & { measurements?: any[]; evidence?: EvidenceLink[] }> {
  try {
    return await safeFetch<Observation & { measurements?: any[]; evidence?: EvidenceLink[] }>(`/api/knowledge/${id}`);
  } catch (err) {
    // Only return seeded observation for explicitly seeded demo IDs
    const demoObs = DEMO_OBSERVATIONS.find((o) => o.id === id);
    if (demoObs) {
      const evidence = DEMO_EVIDENCE_LINKS.filter((e) => e.knowledge_id === demoObs.id);
      return {
        ...demoObs,
        measurements: [
          { variable: 'ice_thickness', value: 1.80, unit: 'm', confidence: 0.98 },
          { variable: 'temperature', value: -14.8, unit: '°C', confidence: 0.96 }
        ],
        evidence
      };
    }
    throw err;
  }
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
    // Only return demo links if the requested ID is explicitly a demo observation
    if (knowledgeId === 'obs_ice_thickness' || knowledgeId.startsWith('demo_')) {
      const links = DEMO_EVIDENCE_LINKS.filter((e) => e.knowledge_id === knowledgeId);
      const obs = DEMO_OBSERVATIONS.find((o) => o.id === knowledgeId);
      return {
        knowledge_id: knowledgeId,
        knowledge_title: obs?.title || 'Surface ice measurement recorded at 1.8 m',
        confidence: obs?.confidence || 0.94,
        verification_status: obs?.verification_status || 'VERIFIED',
        total_sources: links.length,
        evidence_chain: links,
        grouped_sources: {
          reports: links.filter((l) => l.source_type === 'pdf' || l.source_type === 'docx'),
          datasets: links.filter((l) => l.source_type === 'dataset'),
          videos: links.filter((l) => l.source_type === 'video'),
          images: links.filter((l) => l.source_type === 'image'),
          field_notes: links.filter((l) => l.source_type === 'field_note')
        }
      };
    }

    // For any real uploaded observation, NEVER fabricate demo links
    return {
      knowledge_id: knowledgeId,
      knowledge_title: 'Evidence Trace',
      confidence: 0.9,
      verification_status: 'AI_EXTRACTED',
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
    return DEMO_EXPEDITIONS;
  }
}

export async function getExpeditionById(id: string): Promise<Expedition & { observations?: Observation[]; datasets?: Dataset[]; media?: MediaAsset[] }> {
  try {
    return await safeFetch<Expedition & { observations?: Observation[]; datasets?: Dataset[]; media?: MediaAsset[] }>(`/api/expeditions/${id}`);
  } catch {
    const exp = DEMO_EXPEDITIONS.find((e) => e.id === id || e.code.toLowerCase() === id.toLowerCase()) || DEMO_EXPEDITIONS[0];
    return {
      ...exp,
      observations: DEMO_OBSERVATIONS.filter((o) => o.expedition_id === exp.id),
      datasets: DEMO_DATASETS.filter((d) => d.expedition_id === exp.id),
      media: DEMO_MEDIA.filter((m) => m.expedition_id === exp.id)
    };
  }
}

// ---------------------------------------------
// DATASETS & MEDIA
// ---------------------------------------------
export async function getDatasets(): Promise<Dataset[]> {
  try {
    return await safeFetch<Dataset[]>('/api/datasets');
  } catch {
    return DEMO_DATASETS;
  }
}

export async function getMedia(type?: string): Promise<MediaAsset[]> {
  try {
    const query = type ? `?type=${type}` : '';
    return await safeFetch<MediaAsset[]>(`/api/media${query}`);
  } catch {
    return type ? DEMO_MEDIA.filter((m) => m.type === type) : DEMO_MEDIA;
  }
}

// ---------------------------------------------
// INGESTION & PROCESSING
// ---------------------------------------------
export async function processPackage(formData?: FormData): Promise<{ job: ProcessingJob; extracted_observations: Observation[]; evidence_links_count: number }> {
  const options: RequestInit = {
    method: 'POST'
  };

  if (formData) {
    options.body = formData;
  } else {
    options.headers = { 'Content-Type': 'application/json' };
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
    return DEMO_JOBS;
  }
}

export async function getJobById(id: string): Promise<ProcessingJob> {
  return await safeFetch<ProcessingJob>(`/api/ingest/jobs/${id}`);
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
    if (params?.jobId || params?.scope === 'real') {
      return { nodes: [], edges: [] };
    }
    // Generate default nodes & edges for graph visualization in demo mode only
    const nodes = [
      { id: 'exp_45_ant', type: 'expedition', data: { title: 'Expedition 45 (Antarctica)', code: 'EXP-45-ANT' }, position: { x: 300, y: 30 } },
      { id: 'loc_bharati', type: 'location', data: { title: 'Bharati Station', station: 'Bharati' }, position: { x: 120, y: 150 } },
      { id: 'loc_larsemann', type: 'location', data: { title: 'Larsemann Hills', region: 'Antarctica' }, position: { x: 480, y: 150 } },
      { id: 'obs_ice_thickness', type: 'observation', data: { title: 'Surface Ice at 1.8m', domain: 'Glaciology', confidence: 0.94 }, position: { x: 300, y: 270 } },
      { id: 'dts_ice_measurements', type: 'dataset', data: { title: 'Fast-Ice Borehole CSV', rows: 1420 }, position: { x: 100, y: 410 } },
      { id: 'doc_exp45_report', type: 'report', data: { title: 'Expedition 45 Report (p.17)' }, position: { x: 300, y: 410 } },
      { id: 'med_vid_interview', type: 'media', data: { title: 'Interview Video (12:43)' }, position: { x: 500, y: 410 } }
    ];
    const edges = [
      { id: 'e1', source: 'exp_45_ant', target: 'loc_bharati', label: 'Operating Base', style: { stroke: '#94A3B8' } },
      { id: 'e2', source: 'exp_45_ant', target: 'loc_larsemann', label: 'Field Sector', style: { stroke: '#94A3B8' } },
      { id: 'e3', source: 'exp_45_ant', target: 'obs_ice_thickness', label: 'Produced Observation', style: { stroke: '#0284C7', strokeWidth: 2 } },
      { id: 'e4', source: 'obs_ice_thickness', target: 'dts_ice_measurements', label: 'Calibrated In (Row 42)', style: { stroke: '#94A3B8' } },
      { id: 'e5', source: 'obs_ice_thickness', target: 'doc_exp45_report', label: 'Documented In (p.17)', style: { stroke: '#94A3B8' } },
      { id: 'e6', source: 'obs_ice_thickness', target: 'med_vid_interview', label: 'Explained At (12:43)', style: { stroke: '#94A3B8' } }
    ];
    return { nodes, edges };
  }
}

// ---------------------------------------------
// OUTREACH STUDIO
// ---------------------------------------------
export async function generateOutreach(req: OutreachGenerationRequest): Promise<GeneratedContent> {
  try {
    const res = await fetch(`${API_BASE}/api/outreach/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(req)
    });
    const json = await res.json();
    return json.data;
  } catch {
    return DEMO_OUTREACH[0];
  }
}

export async function getOutreachList(): Promise<GeneratedContent[]> {
  try {
    return await safeFetch<GeneratedContent[]>('/api/outreach');
  } catch {
    return DEMO_OUTREACH;
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
    const qLower = q.toLowerCase();
    const matchedObs = DEMO_OBSERVATIONS.filter((o) => o.title.toLowerCase().includes(qLower) || o.description.toLowerCase().includes(qLower));
    return {
      total: matchedObs.length,
      query: q,
      results: matchedObs.map((o) => ({
        id: o.id,
        type: 'observation',
        title: o.title,
        subtitle: o.location_name,
        summary: o.description,
        domain: o.research_domain,
        confidence: o.confidence,
        verification_status: o.verification_status,
        evidence_count: DEMO_EVIDENCE_LINKS.filter((e) => e.knowledge_id === o.id).length
      }))
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
    const obs = DEMO_OBSERVATIONS[0];
    const evidence = DEMO_EVIDENCE_LINKS.filter((e) => e.knowledge_id === obs.id);
    return {
      answer: `The repository contains a verified ${obs.research_domain} observation recorded during the 45th Indian Scientific Expedition to Antarctica: "${obs.title}".\n\nThis observation is corroborated by ${evidence.length} multimodal source records: report_expedition_45_final.pdf (page 17), ice_measurements_larsemann.csv (row 42), and scientist_interview.mp4 (12:43).`,
      evidence,
      found: true
    };
  }
}
