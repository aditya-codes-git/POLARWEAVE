import { v4 as uuidv4 } from 'uuid';
import { supabase, memoryStore } from './supabase.js';
import {
  ProcessingJob,
  Document as PolarDocument,
  Dataset,
  MediaAsset,
  Observation,
  EvidenceLink,
  KnowledgeRelationship,
  GeneratedContent,
  UserProfile
} from '@polarweave/types';

const BUCKET_NAME = 'polarweave-assets';

// -------------------------------------------------------------
// 1. SUPABASE STORAGE INTEGRATION
// -------------------------------------------------------------
export async function uploadStorageFile(
  folder: 'documents' | 'datasets' | 'images' | 'videos' | 'thumbnails' | 'generated',
  filename: string,
  buffer: Buffer,
  contentType: string
): Promise<{ storagePath: string; publicUrl: string }> {
  const sanitizedName = filename.replace(/[^a-zA-Z0-9._-]/g, '_');
  const uniqueKey = `${Date.now()}_${sanitizedName}`;
  const storagePath = `${folder}/${uniqueKey}`;

  if (supabase) {
    try {
      const { data, error } = await supabase.storage
        .from(BUCKET_NAME)
        .upload(storagePath, buffer, {
          contentType,
          upsert: true
        });

      if (!error && data) {
        const { data: publicUrlData } = supabase.storage
          .from(BUCKET_NAME)
          .getPublicUrl(storagePath);

        return {
          storagePath: data.path,
          publicUrl: publicUrlData.publicUrl
        };
      } else if (error) {
        console.warn(`[POLARWEAVE Storage] Upload warning for ${filename}:`, error.message);
      }
    } catch (err: any) {
      console.warn(`[POLARWEAVE Storage] Supabase Storage exception:`, err?.message);
    }
  }

  // Fallback storage reference
  return {
    storagePath,
    publicUrl: `/storage/${storagePath}`
  };
}

// -------------------------------------------------------------
// 2. PROCESSING JOBS PERSISTENCE
// -------------------------------------------------------------
export async function createProcessingJob(job: ProcessingJob): Promise<ProcessingJob> {
  // Always update memoryStore as cache/fallback
  memoryStore.jobs.unshift(job);

  if (supabase) {
    try {
      const summary = {
        ...(job.result_summary || {}),
        created_by: job.created_by || null,
        created_by_name: job.created_by_name || null
      };

      const { error } = await supabase.from('processing_jobs').insert({
        id: job.id,
        filename: job.filename,
        file_type: job.file_type,
        size_bytes: job.size_bytes,
        status: job.status,
        current_stage: job.current_stage,
        stages: job.stages,
        progress: job.progress,
        error_message: job.error_message || null,
        result_summary: summary,
        started_at: job.started_at,
        completed_at: job.completed_at || null
      });

      if (error) {
        console.warn('[POLARWEAVE DB] Error creating processing_job in DB:', error.message);
      }
    } catch (err: any) {
      console.warn('[POLARWEAVE DB] Exception inserting processing_job:', err?.message);
    }
  }

  return job;
}

export async function updateProcessingJob(
  id: string,
  updates: Partial<ProcessingJob>
): Promise<ProcessingJob | null> {
  const current = await getProcessingJobById(id);
  const memIdx = memoryStore.jobs.findIndex((j) => j.id === id);

  const mergedSummary = {
    ...(current?.result_summary || {}),
    ...(updates.result_summary || {}),
    ...(updates.title !== undefined ? { package_title: updates.title } : {}),
    ...(updates.original_filename !== undefined ? { original_filename: updates.original_filename } : {}),
    ...(updates.created_by !== undefined ? { created_by: updates.created_by } : {}),
    ...(updates.created_by_name !== undefined ? { created_by_name: updates.created_by_name } : {})
  };

  const updatedObj: ProcessingJob = {
    ...(current || ({} as any)),
    ...updates,
    id,
    title: updates.title !== undefined ? updates.title : current?.title,
    original_filename: updates.original_filename !== undefined ? updates.original_filename : (current?.original_filename || current?.filename),
    created_by: updates.created_by !== undefined ? updates.created_by : current?.created_by,
    created_by_name: updates.created_by_name !== undefined ? updates.created_by_name : current?.created_by_name,
    result_summary: mergedSummary
  };

  if (memIdx !== -1) {
    memoryStore.jobs[memIdx] = updatedObj;
  } else {
    memoryStore.jobs.unshift(updatedObj);
  }

  if (supabase) {
    try {
      const dbPayload: any = {};
      if (updates.status !== undefined) dbPayload.status = updates.status;
      if (updates.current_stage !== undefined) dbPayload.current_stage = updates.current_stage;
      if (updates.stages !== undefined) dbPayload.stages = updates.stages;
      if (updates.progress !== undefined) dbPayload.progress = updates.progress;
      if (updates.error_message !== undefined) dbPayload.error_message = updates.error_message;
      if (updates.completed_at !== undefined) dbPayload.completed_at = updates.completed_at;
      dbPayload.result_summary = mergedSummary;

      const { error } = await supabase.from('processing_jobs').update(dbPayload).eq('id', id);
      if (error) {
        console.warn(`[POLARWEAVE DB] Error updating job ${id}:`, error.message);
      }
    } catch (err: any) {
      console.warn(`[POLARWEAVE DB] Exception updating job ${id}:`, err?.message);
    }
  }

  return updatedObj;
}

export async function getProcessingJobs(userId?: string, role?: string): Promise<ProcessingJob[]> {
  if (supabase) {
    try {
      const { data, error } = await supabase
        .from('processing_jobs')
        .select('*')
        .order('started_at', { ascending: false });

      if (!error && data) {
        let mapped = data.map((j: any) => ({
          ...j,
          created_by: j.result_summary?.created_by || j.created_by,
          created_by_name: j.result_summary?.created_by_name || j.created_by_name,
          title: j.result_summary?.package_title || j.title || j.filename,
          original_filename: j.result_summary?.original_filename || j.original_filename || j.filename
        }));

        // If caller is a researcher, only return jobs owned by this researcher
        if (role === 'researcher' && userId) {
          mapped = mapped.filter((j: any) => j.created_by === userId);
        }

        return mapped;
      }
    } catch (err: any) {
      console.warn('[POLARWEAVE DB] Error fetching processing_jobs:', err?.message);
    }
  }

  let memJobs = memoryStore.jobs;
  if (role === 'researcher' && userId) {
    memJobs = memJobs.filter((j) => j.created_by === userId);
  }
  return memJobs;
}


export async function getProcessingJobById(id: string): Promise<ProcessingJob | null> {
  if (supabase) {
    try {
      const { data, error } = await supabase
        .from('processing_jobs')
        .select('*')
        .eq('id', id)
        .single();

      if (!error && data) {
        const job = data as ProcessingJob;
        return {
          ...job,
          title: (job.result_summary as any)?.package_title || job.title || job.filename,
          original_filename: (job.result_summary as any)?.original_filename || job.original_filename || job.filename
        };
      }
    } catch (err: any) {
      console.warn(`[POLARWEAVE DB] Error fetching job ${id}:`, err?.message);
    }
  }

  return memoryStore.jobs.find((j) => j.id === id) || null;
}

export async function getJobPackageData(jobId: string): Promise<any> {
  const job = await getProcessingJobById(jobId);
  if (!job) return null;

  // 1. Documents (Source Material)
  const documents = await getDocuments({ job_id: jobId });

  // 2. Observations (Extracted Knowledge)
  const observations = await getObservations({ job_id: jobId });
  const obsIds = observations.map((o) => o.id);

  // 3. Measurements for these observations
  let measurements: any[] = [];
  if (obsIds.length > 0) {
    if (supabase) {
      try {
        const { data: dbMsrs } = await supabase
          .from('measurements')
          .select('*')
          .in('observation_id', obsIds);
        if (dbMsrs) measurements = dbMsrs;
      } catch (err: any) {
        console.warn('[POLARWEAVE DB] Error fetching measurements for job package:', err?.message);
      }
    }
    const memMsrs = memoryStore.measurements.filter((m) => obsIds.includes(m.observation_id));
    const seenMsrIds = new Set(measurements.map((m) => m.id));
    measurements.push(...memMsrs.filter((m) => !seenMsrIds.has(m.id)));
  }

  // 4. Datasets
  const datasets = await getDatasets({ job_id: jobId });

  // 5. Media
  const media = await getMedia({ job_id: jobId });

  // 6. Evidence Links
  let evidenceLinks: EvidenceLink[] = [];
  if (supabase) {
    try {
      const { data: dbLinks } = await supabase
        .from('evidence_links')
        .select('*')
        .eq('processing_job_id', jobId);
      if (dbLinks) evidenceLinks = dbLinks as EvidenceLink[];
    } catch (err: any) {
      console.warn('[POLARWEAVE DB] Error fetching evidence links for job package:', err?.message);
    }
  }
  const memLinks = memoryStore.evidenceLinks.filter((l) => l.processing_job_id === jobId || obsIds.includes(l.knowledge_id));
  const seenLinkIds = new Set(evidenceLinks.map((l) => l.id));
  evidenceLinks.push(...memLinks.filter((l) => !seenLinkIds.has(l.id)));

  // 7. Relationships
  const allEntityIds = new Set([
    ...obsIds,
    ...documents.map((d) => d.id),
    ...datasets.map((d) => d.id),
    ...media.map((m) => m.id)
  ]);
  let relationships: KnowledgeRelationship[] = [];
  if (supabase) {
    try {
      const { data: dbRels } = await supabase.from('knowledge_relationships').select('*');
      if (dbRels) {
        relationships = dbRels.filter(
          (r: any) => allEntityIds.has(r.source_entity_id) || allEntityIds.has(r.target_entity_id)
        );
      }
    } catch (err: any) {
      console.warn('[POLARWEAVE DB] Error fetching relationships for job package:', err?.message);
    }
  }
  const memRels = memoryStore.relationships.filter(
    (r) => allEntityIds.has(r.source_entity_id) || allEntityIds.has(r.target_entity_id)
  );
  const seenRelIds = new Set(relationships.map((r) => r.id));
  relationships.push(...memRels.filter((r) => !seenRelIds.has(r.id)));

  // 8. Generated outreach content citing this job's findings
  let outreach: GeneratedContent[] = [];
  if (supabase) {
    try {
      const { data: dbOutreach } = await supabase.from('generated_content').select('*');
      if (dbOutreach) {
        outreach = dbOutreach.filter((c: any) => 
          Array.isArray(c.source_knowledge_ids) && c.source_knowledge_ids.some((kid: string) => obsIds.includes(kid))
        );
      }
    } catch (err: any) {
      console.warn('[POLARWEAVE DB] Error fetching outreach for job package:', err?.message);
    }
  }
  const memOutreach = memoryStore.outreach.filter(
    (c) => Array.isArray(c.source_knowledge_ids) && c.source_knowledge_ids.some((kid: string) => obsIds.includes(kid))
  );
  const seenOutreachIds = new Set(outreach.map((o) => o.id));
  outreach.push(...memOutreach.filter((o) => !seenOutreachIds.has(o.id)));

  // Aggregate overall review status
  const totalObs = observations.length;
  const verifiedCount = observations.filter((o) => o.verification_status === 'VERIFIED').length;
  const rejectedCount = observations.filter((o) => o.verification_status === 'REJECTED').length;
  const reviewStatus = totalObs === 0
    ? 'EMPTY'
    : verifiedCount === totalObs
    ? 'VERIFIED'
    : rejectedCount === totalObs
    ? 'REJECTED'
    : verifiedCount > 0
    ? 'PARTIALLY_VERIFIED'
    : 'NEEDS_REVIEW';

  const researcher = observations[0]?.created_by_name || 'Dr. Rajesh Sharma';

  return {
    job,
    title: job.title || job.filename,
    original_filename: job.original_filename || job.filename,
    upload_date: job.started_at,
    researcher,
    review_status: reviewStatus,
    overall_review_status: reviewStatus,
    artifact_count: documents.length + observations.length + datasets.length + media.length,
    counts: {
      documents: documents.length,
      observations: observations.length,
      measurements: measurements.length,
      datasets: datasets.length,
      media: media.length,
      evidence_links: evidenceLinks.length,
      relationships: relationships.length,
      outreach: outreach.length
    },
    documents,
    observations,
    measurements,
    datasets,
    media,
    evidence_links: evidenceLinks,
    relationships,
    outreach
  };
}

// -------------------------------------------------------------
// 3. DOCUMENT & CHUNKS PERSISTENCE
// -------------------------------------------------------------
export async function createDocument(
  doc: PolarDocument,
  chunks?: Array<{ page_number: number; section?: string; content: string; token_count?: number }>
): Promise<PolarDocument> {
  memoryStore.documents.unshift(doc);

  if (supabase) {
    try {
      const { error } = await supabase.from('documents').insert({
        id: doc.id,
        filename: doc.filename,
        storage_path: doc.storage_path,
        mime_type: doc.mime_type,
        size_bytes: doc.size_bytes,
        document_type: doc.document_type || 'expedition_report',
        processing_status: doc.processing_status || 'completed',
        processing_job_id: doc.processing_job_id || null,
        page_count: doc.page_count || null,
        metadata_json: doc.metadata_json || {},
        created_at: doc.created_at || new Date().toISOString()
      });

      if (error) {
        console.warn(`[POLARWEAVE DB] Error inserting document ${doc.id}:`, error.message);
      } else if (chunks && chunks.length > 0) {
        const chunkRecords = chunks.map((c) => ({
          id: `chk_${uuidv4().slice(0, 8)}`,
          document_id: doc.id,
          page_number: c.page_number,
          section: c.section || 'General Excerpt',
          content: c.content,
          token_count: c.token_count || Math.ceil(c.content.length / 4),
          created_at: new Date().toISOString()
        }));

        const { error: chunkErr } = await supabase.from('document_chunks').insert(chunkRecords);
        if (chunkErr) {
          console.warn(`[POLARWEAVE DB] Error inserting chunks for ${doc.id}:`, chunkErr.message);
        }
      }
    } catch (err: any) {
      console.warn(`[POLARWEAVE DB] Exception inserting document ${doc.id}:`, err?.message);
    }
  }

  return doc;
}

export async function getDocuments(filters?: { job_id?: string }): Promise<PolarDocument[]> {
  if (supabase) {
    try {
      let query = supabase
        .from('documents')
        .select('*')
        .order('created_at', { ascending: false });

      if (filters?.job_id) {
        query = query.eq('processing_job_id', filters.job_id);
      }

      const { data, error } = await query;

      if (!error && data) {
        return data;
      }
    } catch (err: any) {
      console.warn('[POLARWEAVE DB] Error fetching documents:', err?.message);
    }
  }

  let list = memoryStore.documents;
  if (filters?.job_id) {
    list = list.filter((d) => d.processing_job_id === filters.job_id);
  }
  return list;
}

// -------------------------------------------------------------
// 4. DATASETS PERSISTENCE
// -------------------------------------------------------------
export async function createDataset(dataset: Dataset): Promise<Dataset> {
  memoryStore.datasets.unshift(dataset);

  if (supabase) {
    try {
      // Ensure expedition_id exists or set to null
      let expeditionId: string | null = dataset.expedition_id || null;
      if (expeditionId) {
        const { data: expMatch } = await supabase
          .from('expeditions')
          .select('id')
          .eq('id', expeditionId)
          .maybeSingle();
        if (!expMatch) expeditionId = null;
      }

      const { error } = await supabase.from('datasets').insert({
        id: dataset.id,
        title: dataset.title,
        filename: dataset.filename,
        file_path: dataset.file_path,
        source_document_id: null,
        processing_job_id: dataset.processing_job_id || null,
        row_count: dataset.row_count || 0,
        column_count: dataset.column_count || 0,
        schema_json: dataset.columns || [],
        preview_data: dataset.preview_data || [],
        processing_status: dataset.processing_status || 'completed',
        region: 'Antarctica',
        expedition_id: expeditionId,
        created_at: dataset.created_at || new Date().toISOString()
      });

      if (error) {
        console.warn(`[POLARWEAVE DB] Error inserting dataset ${dataset.id}:`, error.message);
      }
    } catch (err: any) {
      console.warn(`[POLARWEAVE DB] Exception inserting dataset ${dataset.id}:`, err?.message);
    }
  }

  return dataset;
}

export async function getDatasets(filters?: { job_id?: string }): Promise<Dataset[]> {
  if (supabase) {
    try {
      let query = supabase
        .from('datasets')
        .select('*')
        .order('created_at', { ascending: false });

      if (filters?.job_id) {
        query = query.eq('processing_job_id', filters.job_id);
      }

      const { data, error } = await query;

      if (!error && data) {
        const mapped = data.map((d) => ({
          id: d.id,
          title: d.title,
          filename: d.filename,
          file_path: d.file_path,
          row_count: d.row_count,
          column_count: d.column_count,
          columns: d.schema_json || [],
          preview_data: d.preview_data || [],
          processing_status: d.processing_status,
          expedition_id: d.expedition_id,
          created_at: d.created_at
        }));
        return mapped;
      }
    } catch (err: any) {
      console.warn('[POLARWEAVE DB] Error fetching datasets:', err?.message);
    }
  }

  let list = memoryStore.datasets;
  if (filters?.job_id) {
    list = list.filter((d) => d.processing_job_id === filters.job_id);
  }
  return list;
}

export async function getDatasetById(id: string): Promise<Dataset | null> {
  if (supabase) {
    try {
      const { data, error } = await supabase.from('datasets').select('*').eq('id', id).single();
      if (!error && data) {
        return {
          id: data.id,
          title: data.title,
          filename: data.filename,
          file_path: data.file_path,
          row_count: data.row_count,
          column_count: data.column_count,
          columns: data.schema_json || [],
          preview_data: data.preview_data || [],
          processing_status: data.processing_status,
          expedition_id: data.expedition_id,
          created_at: data.created_at
        };
      }
    } catch (err: any) {
      console.warn(`[POLARWEAVE DB] Error fetching dataset ${id}:`, err?.message);
    }
  }

  return memoryStore.datasets.find((d) => d.id === id) || null;
}

// -------------------------------------------------------------
// 5. MEDIA ASSETS PERSISTENCE
// -------------------------------------------------------------
export async function createMediaAsset(media: MediaAsset): Promise<MediaAsset> {
  memoryStore.media.unshift(media);

  if (supabase) {
    try {
      let expeditionId: string | null = media.expedition_id || null;
      if (expeditionId) {
        const { data: expMatch } = await supabase
          .from('expeditions')
          .select('id')
          .eq('id', expeditionId)
          .maybeSingle();
        if (!expMatch) expeditionId = null;
      }

      const { error } = await supabase.from('media_assets').insert({
        id: media.id,
        filename: media.filename,
        storage_path: media.storage_path,
        type: media.type,
        thumbnail_path: media.thumbnail_path || null,
        expedition_id: expeditionId,
        location_id: null,
        location_name: media.location_name || 'Unspecified Location',
        capture_date: media.capture_date || new Date().toISOString(),
        processing_job_id: media.processing_job_id || null,
        metadata_json: media.metadata_json || {},
        ai_analysis_json: media.ai_analysis_json || {},
        transcript: media.transcript || {},
        duration_seconds: media.duration_seconds || null,
        processing_status: media.processing_status || 'completed',
        created_at: media.created_at || new Date().toISOString()
      });

      if (error) {
        console.warn(`[POLARWEAVE DB] Error inserting media_asset ${media.id}:`, error.message);
      }
    } catch (err: any) {
      console.warn(`[POLARWEAVE DB] Exception inserting media_asset ${media.id}:`, err?.message);
    }
  }

  return media;
}

export async function getMedia(filters?: { type?: string; job_id?: string } | string): Promise<MediaAsset[]> {
  const typeFilter = typeof filters === 'string' ? filters : filters?.type;
  const jobFilter = typeof filters === 'object' ? filters?.job_id : undefined;

  if (supabase) {
    try {
      let query = supabase.from('media_assets').select('*').order('created_at', { ascending: false });
      if (typeFilter) {
        query = query.eq('type', typeFilter);
      }
      if (jobFilter) {
        query = query.eq('processing_job_id', jobFilter);
      }
      const { data, error } = await query;
      if (!error && data) {
        return data;
      }
    } catch (err: any) {
      console.warn('[POLARWEAVE DB] Error fetching media_assets:', err?.message);
    }
  }

  let list = [...memoryStore.media];
  if (typeFilter) list = list.filter((m) => m.type === typeFilter);
  if (jobFilter) list = list.filter((m) => m.processing_job_id === jobFilter);
  return list;
}

export async function getMediaById(id: string): Promise<MediaAsset | null> {
  if (supabase) {
    try {
      const { data, error } = await supabase.from('media_assets').select('*').eq('id', id).single();
      if (!error && data) {
        return data as MediaAsset;
      }
    } catch (err: any) {
      console.warn(`[POLARWEAVE DB] Error fetching media ${id}:`, err?.message);
    }
  }

  return memoryStore.media.find((m) => m.id === id) || null;
}

// -------------------------------------------------------------
// 6. OBSERVATIONS (STRUCTURED KNOWLEDGE) PERSISTENCE
// -------------------------------------------------------------
export async function createObservation(obs: Observation): Promise<Observation> {
  memoryStore.observations.unshift(obs);

  if (supabase) {
    try {
      let expeditionId: string | null = obs.expedition_id || null;
      if (expeditionId) {
        const { data: expMatch } = await supabase
          .from('expeditions')
          .select('id')
          .eq('id', expeditionId)
          .maybeSingle();
        if (!expMatch) expeditionId = null;
      }

      let locationId: string | null = obs.location_id || null;
      if (locationId) {
        const { data: locMatch } = await supabase
          .from('locations')
          .select('id')
          .eq('id', locationId)
          .maybeSingle();
        if (!locMatch) locationId = null;
      }

      const { error } = await supabase.from('observations').insert({
        id: obs.id,
        expedition_id: expeditionId,
        title: obs.title,
        description: obs.description,
        research_domain: obs.research_domain,
        observed_at: obs.observed_at || new Date().toISOString(),
        location_id: locationId,
        location_name: obs.location_name || 'Unspecified Location',
        confidence: obs.confidence || 0.9,
        confidence_level: obs.confidence_level || 'HIGH',
        verification_status: obs.verification_status || 'AI_EXTRACTED',
        processing_job_id: obs.processing_job_id || null,
        source_file_id: obs.source_file_id || null,
        created_by: obs.created_by || null,
        created_by_name: obs.created_by_name || null,
        created_at: obs.created_at || new Date().toISOString(),
        demo: obs.demo ?? false
      });

      if (error) {
        console.warn(`[POLARWEAVE DB] Error inserting observation ${obs.id}:`, error.message);
      }
    } catch (err: any) {
      console.warn(`[POLARWEAVE DB] Exception inserting observation ${obs.id}:`, err?.message);
    }
  }

  return obs;
}

export async function createMeasurements(
  msrs: Array<{
    id: string;
    observation_id: string;
    variable: string;
    value: number;
    unit: string;
    confidence?: number;
    source_dataset_id?: string;
    source_row?: number;
  }>
): Promise<void> {
  msrs.forEach((m) => {
    memoryStore.measurements.unshift({
      id: m.id,
      observation_id: m.observation_id,
      variable: m.variable,
      value: m.value,
      unit: m.unit,
      confidence: m.confidence || 0.95
    });
  });

  if (supabase) {
    try {
      const records = msrs.map((m) => ({
        id: m.id,
        observation_id: m.observation_id,
        variable: m.variable,
        value: m.value,
        unit: m.unit,
        confidence: m.confidence || 0.95,
        source_dataset_id: m.source_dataset_id || null,
        source_row: m.source_row || null
      }));

      const { error } = await supabase.from('measurements').insert(records);
      if (error) {
        console.warn('[POLARWEAVE DB] Error inserting measurements:', error.message);
      }
    } catch (err: any) {
      console.warn('[POLARWEAVE DB] Exception inserting measurements:', err?.message);
    }
  }
}

export async function getObservations(filters?: {
  domain?: string;
  status?: string;
  expedition_id?: string;
  query?: string;
  job_id?: string;
  scope?: 'real' | 'demo' | 'all';
  created_by?: string;
}): Promise<Observation[]> {
  const isRealScope = filters?.scope === 'real' || Boolean(filters?.job_id) || Boolean(filters?.created_by);

  if (supabase) {
    try {
      let query = supabase.from('observations').select('*').order('created_at', { ascending: false });

      if (filters?.job_id) {
        query = query.eq('processing_job_id', filters.job_id);
      }
      if (filters?.created_by) {
        query = query.eq('created_by', filters.created_by);
      }
      if (filters?.scope === 'real') {
        query = query.eq('demo', false);
      } else if (filters?.scope === 'demo') {
        query = query.eq('demo', true);
      }

      if (filters?.domain && filters.domain !== 'ALL') {
        query = query.ilike('research_domain', `%${filters.domain}%`);
      }
      if (filters?.status && filters.status !== 'ALL') {
        query = query.eq('verification_status', filters.status);
      }
      if (filters?.expedition_id) {
        query = query.eq('expedition_id', filters.expedition_id);
      }
      if (filters?.query) {
        query = query.or(`title.ilike.%${filters.query}%,description.ilike.%${filters.query}%`);
      }

      const { data, error } = await query;
      if (!error && data) {
        // If caller is scoped to a specific owner or real data, strictly return DB records
        if (filters?.created_by || filters?.scope !== 'demo') {
          return data;
        }

        // Only for explicit demo scope without owner filter, merge memory demo items if any exist
        const dbObsIds = new Set(data.map((o) => o.id));
        const extraMemObs = memoryStore.observations.filter((o) => {
          if (dbObsIds.has(o.id)) return false;
          if (o.demo !== true) return false;
          if (filters?.domain && filters.domain !== 'ALL' && o.research_domain.toLowerCase() !== filters.domain.toLowerCase()) return false;
          if (filters?.status && filters.status !== 'ALL' && o.verification_status !== filters.status) return false;
          if (filters?.expedition_id && o.expedition_id !== filters.expedition_id) return false;
          if (filters?.query) {
            const q = filters.query.toLowerCase();
            if (!o.title.toLowerCase().includes(q) && !o.description.toLowerCase().includes(q)) return false;
          }
          return true;
        });

        return [...data, ...extraMemObs];
      }
    } catch (err: any) {
      console.warn('[POLARWEAVE DB] Error fetching observations:', err?.message);
    }
  }

  // Fallback to memoryStore ONLY if scope is not strictly real and no created_by specified
  if (isRealScope) {
    return memoryStore.observations.filter(
      (o) => o.demo === false && (!filters?.job_id || o.processing_job_id === filters.job_id) && (!filters?.created_by || o.created_by === filters.created_by)
    );
  }

  let list = [...memoryStore.observations];
  if (filters?.created_by) {
    list = list.filter((o) => o.created_by === filters.created_by);
  }
  if (filters?.scope === 'demo') {
    list = list.filter((o) => o.demo === true);
  }
  if (filters?.domain && filters.domain !== 'ALL') {
    list = list.filter((o) => o.research_domain.toLowerCase() === filters.domain?.toLowerCase());
  }
  if (filters?.status && filters.status !== 'ALL') {
    list = list.filter((o) => o.verification_status === filters.status);
  }
  if (filters?.expedition_id) {
    list = list.filter((o) => o.expedition_id === filters.expedition_id);
  }
  if (filters?.query) {
    const q = filters.query.toLowerCase();
    list = list.filter((o) => o.title.toLowerCase().includes(q) || o.description.toLowerCase().includes(q));
  }
  return list;
}


export async function getObservationById(id: string): Promise<any> {
  if (supabase) {
    try {
      const { data: obs, error: obsErr } = await supabase
        .from('observations')
        .select('*')
        .eq('id', id)
        .maybeSingle();

      if (!obsErr && obs) {
        const { data: msrs } = await supabase
          .from('measurements')
          .select('*')
          .eq('observation_id', id);

        const { data: evidence } = await supabase
          .from('evidence_links')
          .select('*')
          .eq('knowledge_id', id);

        const { data: rels } = await supabase
          .from('knowledge_relationships')
          .select('*')
          .or(`source_entity_id.eq.${id},target_entity_id.eq.${id}`);

        return {
          ...obs,
          measurements: msrs || [],
          evidence: evidence || [],
          relationships: rels || []
        };
      }
    } catch (err: any) {
      console.warn(`[POLARWEAVE DB] Error fetching observation ${id}:`, err?.message);
    }
  }

  const observation = memoryStore.observations.find((o) => o.id === id);
  if (!observation) return null;

  const measurements = memoryStore.measurements.filter((m) => m.observation_id === id);
  const evidence = memoryStore.evidenceLinks.filter((e) => e.knowledge_id === id);
  const relationships = memoryStore.relationships.filter(
    (r) => r.source_entity_id === id || r.target_entity_id === id
  );

  return {
    ...observation,
    measurements,
    evidence,
    relationships
  };
}

// -------------------------------------------------------------
// 7. EVIDENCE LINKS PERSISTENCE
// -------------------------------------------------------------
export async function createEvidenceLinks(links: EvidenceLink[]): Promise<void> {
  for (const link of links) {
    memoryStore.evidenceLinks.unshift(link);
  }

  if (supabase) {
    try {
      const records = links.map((l) => ({
        id: l.id,
        knowledge_type: l.knowledge_type || 'observation',
        knowledge_id: l.knowledge_id,
        source_type: l.source_type,
        source_id: l.source_id,
        source_title: l.source_title,
        page_number: l.page_number || null,
        row_number: l.row_number || null,
        timestamp_start: l.timestamp_start || null,
        timestamp_end: l.timestamp_end || null,
        excerpt: l.excerpt || 'Source evidence excerpt',
        media_url: l.media_url || null,
        confidence: l.confidence || 0.9,
        verification_status: l.verification_status || 'AI_EXTRACTED',
        processing_job_id: l.processing_job_id || null,
        created_at: l.created_at || new Date().toISOString()
      }));

      const { error } = await supabase.from('evidence_links').insert(records);
      if (error) {
        console.warn('[POLARWEAVE DB] Error inserting evidence_links:', error.message);
      }
    } catch (err: any) {
      console.warn('[POLARWEAVE DB] Exception inserting evidence_links:', err?.message);
    }
  }
}

export async function getEvidenceByKnowledgeId(knowledgeId: string): Promise<any> {
  let links: EvidenceLink[] = [];
  let observation: any = null;

  if (supabase) {
    try {
      const { data: dbLinks, error: linkErr } = await supabase
        .from('evidence_links')
        .select('*')
        .eq('knowledge_id', knowledgeId);

      if (!linkErr && dbLinks && dbLinks.length > 0) {
        links = dbLinks as EvidenceLink[];
      }

      const { data: dbObs } = await supabase
        .from('observations')
        .select('*')
        .eq('id', knowledgeId)
        .maybeSingle();

      if (dbObs) observation = dbObs;
    } catch (err: any) {
      console.warn(`[POLARWEAVE DB] Error fetching evidence for ${knowledgeId}:`, err?.message);
    }
  }

  // Fallback to memoryStore strictly for this knowledgeId
  if (links.length === 0) {
    links = memoryStore.evidenceLinks.filter((e) => e.knowledge_id === knowledgeId);
  }
  if (!observation) {
    observation = memoryStore.observations.find((o) => o.id === knowledgeId);
  }

  const grouped = {
    reports: links.filter((l) => l.source_type === 'pdf' || l.source_type === 'docx'),
    datasets: links.filter((l) => l.source_type === 'dataset'),
    videos: links.filter((l) => l.source_type === 'video'),
    images: links.filter((l) => l.source_type === 'image'),
    field_notes: links.filter((l) => l.source_type === 'field_note')
  };

  return {
    knowledge_id: knowledgeId,
    knowledge_title: observation?.title || 'Scientific Knowledge Finding',
    confidence: observation?.confidence || 0.94,
    verification_status: observation?.verification_status || 'AI_EXTRACTED',
    total_sources: links.length,
    evidence_chain: links,
    grouped_sources: grouped
  };
}

// -------------------------------------------------------------
// 8. KNOWLEDGE RELATIONSHIPS PERSISTENCE
// -------------------------------------------------------------
export async function createKnowledgeRelationships(
  relationships: KnowledgeRelationship[]
): Promise<void> {
  for (const rel of relationships) {
    memoryStore.relationships.unshift(rel);
  }

  if (supabase) {
    try {
      const records = relationships.map((r) => ({
        id: r.id,
        source_entity_type: r.source_entity_type,
        source_entity_id: r.source_entity_id,
        target_entity_type: r.target_entity_type,
        target_entity_id: r.target_entity_id,
        relationship_type: r.relationship_type,
        label: r.label || null,
        confidence: r.confidence || 0.9,
        status: r.status || 'suggested',
        created_at: r.created_at || new Date().toISOString()
      }));

      const { error } = await supabase.from('knowledge_relationships').insert(records);
      if (error) {
        console.warn('[POLARWEAVE DB] Error inserting knowledge_relationships:', error.message);
      }
    } catch (err: any) {
      console.warn('[POLARWEAVE DB] Exception inserting knowledge_relationships:', err?.message);
    }
  }
}

export async function getKnowledgeGraphData(filters?: { jobId?: string; scope?: 'real' | 'demo' | 'all' }): Promise<{ nodes: any[]; edges: any[] }> {
  const nodes: Array<{
    id: string;
    type: string;
    data: Record<string, unknown>;
    position: { x: number; y: number };
  }> = [];

  const edges: Array<{
    id: string;
    source: string;
    target: string;
    label?: string;
    animated?: boolean;
    style?: Record<string, unknown>;
  }> = [];

  const isJobScoped = Boolean(filters?.jobId);
  const isRealOnly = filters?.scope === 'real' || isJobScoped;

  // Only include global demo expeditions & locations if NOT strictly scoped to a real processing job
  if (!isJobScoped && !isRealOnly) {
    memoryStore.expeditions.forEach((exp, idx) => {
      nodes.push({
        id: exp.id,
        type: 'expedition',
        data: { title: exp.title, code: exp.code, region: exp.region, status: exp.status },
        position: { x: 350 + idx * 300, y: 50 }
      });
    });

    memoryStore.locations.forEach((loc, idx) => {
      nodes.push({
        id: loc.id,
        type: 'location',
        data: {
          title: loc.name,
          region: loc.region,
          station: loc.station,
          coordinates: `${loc.latitude}, ${loc.longitude}`
        },
        position: { x: 100 + idx * 220, y: 220 }
      });
    });
  }

  // Fetch persisted observations strictly according to scope
  const observations = await getObservations({
    job_id: filters?.jobId,
    scope: filters?.scope || (isJobScoped ? 'real' : undefined)
  });

  observations.forEach((obs, idx) => {
    nodes.push({
      id: obs.id,
      type: 'observation',
      data: {
        title: obs.title,
        domain: obs.research_domain,
        confidence: obs.confidence,
        status: obs.verification_status
      },
      position: { x: 150 + idx * 240, y: isJobScoped ? 100 : 380 }
    });
  });

  // Fetch relevant documents, datasets & media
  let docs: PolarDocument[] = [];
  let datasets: Dataset[] = [];
  let media: MediaAsset[] = [];

  if (isJobScoped && supabase) {
    try {
      const { data: dbDocs } = await supabase.from('documents').select('*').eq('processing_job_id', filters?.jobId);
      if (dbDocs) docs = dbDocs;
      const { data: dbDts } = await supabase.from('datasets').select('*').eq('processing_job_id', filters?.jobId);
      if (dbDts) datasets = dbDts;
      const { data: dbMed } = await supabase.from('media_assets').select('*').eq('processing_job_id', filters?.jobId);
      if (dbMed) media = dbMed;
    } catch (e: any) {
      console.warn('[POLARWEAVE DB] Error fetching job assets for graph:', e?.message);
    }
  } else if (!isJobScoped) {
    datasets = await getDatasets();
    media = await getMedia();
    docs = await getDocuments();
  }

  docs.forEach((doc, idx) => {
    nodes.push({
      id: doc.id,
      type: 'report',
      data: { title: doc.filename, mime: doc.mime_type },
      position: { x: 100 + idx * 260, y: isJobScoped ? 300 : 540 }
    });
  });

  datasets.forEach((dts, idx) => {
    nodes.push({
      id: dts.id,
      type: 'dataset',
      data: { title: dts.title, filename: dts.filename, rows: dts.row_count },
      position: { x: 200 + idx * 280, y: isJobScoped ? 300 : 540 }
    });
  });

  media.forEach((med, idx) => {
    nodes.push({
      id: med.id,
      type: 'media',
      data: { title: med.filename, type: med.type, caption: med.ai_analysis_json?.caption },
      position: { x: 450 + idx * 260, y: isJobScoped ? 300 : 540 }
    });
  });

  // Fetch relationships for these specific nodes
  const nodeIds = new Set(nodes.map((n) => n.id));
  let rels = isRealOnly ? [] : [...memoryStore.relationships];
  if (supabase) {
    try {
      const { data: dbRels, error } = await supabase.from('knowledge_relationships').select('*');
      if (!error && dbRels && dbRels.length > 0) {
        rels = [...rels, ...dbRels];
      }
    } catch (err: any) {
      console.warn('[POLARWEAVE DB] Error fetching relationships:', err?.message);
    }
  }

  const seenEdgeIds = new Set<string>();
  rels.filter((r) => nodeIds.has(r.source_entity_id) && nodeIds.has(r.target_entity_id)).forEach((rel) => {
    if (!seenEdgeIds.has(rel.id)) {
      seenEdgeIds.add(rel.id);
      edges.push({
        id: rel.id,
        source: rel.source_entity_id,
        target: rel.target_entity_id,
        label: rel.label || rel.relationship_type,
        style: { stroke: '#94A3B8', strokeWidth: 1.5 },
        animated: rel.status === 'suggested'
      });
    }
  });

  return { nodes, edges };
}

// -------------------------------------------------------------
// 9. HUMAN REVIEW & VERIFICATION AUDIT TRAIL PERSISTENCE
// -------------------------------------------------------------
// VERIFICATION WORKFLOW & AUDIT
// -------------------------------------------------------------
export async function reviewKnowledgeEntity(
  entityType: string,
  id: string,
  action: 'approve' | 'reject' | 'edit',
  payload: {
    reviewer_id?: string;
    reviewer_name?: string;
    notes?: string;
    edited_data?: any;
    caller_role?: 'admin' | 'researcher' | 'public';
  }
): Promise<{ updated_entity: any; audit_record: any | null }> {
  if (entityType !== 'observation') {
    throw new Error(`Review for ${entityType} is not currently supported.`);
  }

  // 1. Fetch previous state
  let previousValue: any = null;
  const memObsIdx = memoryStore.observations.findIndex((o) => o.id === id);
  if (memObsIdx !== -1) {
    previousValue = { ...memoryStore.observations[memObsIdx] };
  }

  if (supabase && !previousValue) {
    const { data: dbPrev } = await supabase
      .from('observations')
      .select('*')
      .eq('id', id)
      .maybeSingle();
    if (dbPrev) previousValue = dbPrev;
  }

  // Determine target verification status based on state machine
  let newStatus: string;
  if (action === 'approve') {
    newStatus = 'VERIFIED';
  } else if (action === 'reject') {
    newStatus = 'REJECTED';
  } else {
    // action === 'edit':
    // If an unverified record is edited, it remains in review (PENDING_ADMIN_REVIEW).
    // If a verified record was edited, require it to return to PENDING_ADMIN_REVIEW.
    newStatus = 'PENDING_ADMIN_REVIEW';
  }

  let updatedEntity: any = null;

  // 2. Update PostgreSQL observations table
  if (supabase) {
    try {
      const updateData: any = {
        verification_status: newStatus
      };

      if (action === 'edit' && payload.edited_data) {
        if (payload.edited_data.title) updateData.title = payload.edited_data.title;
        if (payload.edited_data.description) updateData.description = payload.edited_data.description;
        if (payload.edited_data.research_domain) updateData.research_domain = payload.edited_data.research_domain;
        if (payload.edited_data.location_name) updateData.location_name = payload.edited_data.location_name;
      }

      const { data: dbUpdated, error: updateErr } = await supabase
        .from('observations')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (!updateErr && dbUpdated) {
        updatedEntity = dbUpdated;
      }

      // Also update linked evidence status in DB for verification decisions
      if (action === 'approve' || action === 'reject') {
        await supabase
          .from('evidence_links')
          .update({ verification_status: newStatus })
          .eq('knowledge_id', id);
      }

      // 3. Create verification_records row in PostgreSQL ONLY for Admin verification decisions (approve/reject)
      if (action === 'approve' || action === 'reject') {
        const auditId = `ver_${uuidv4().slice(0, 8)}`;
        const { error: verErr } = await supabase.from('verification_records').insert({
          id: auditId,
          entity_type: 'observation',
          entity_id: id,
          reviewer_id: null, // Set null to respect profiles(id) foreign key constraint
          reviewer_name: payload.reviewer_name || 'Dr. Sunita Bose',
          status: action === 'approve' ? 'approved' : 'rejected',
          notes: payload.notes || 'Institutional review decision by Knowledge Admin',
          previous_value: previousValue || {},
          new_value: updatedEntity || previousValue || {},
          reviewed_at: new Date().toISOString()
        });

        if (verErr) {
          console.warn(`[POLARWEAVE DB] Error inserting verification_record:`, verErr.message);
        }
      }
    } catch (err: any) {
      console.warn(`[POLARWEAVE DB] Exception updating review state:`, err?.message);
    }
  }

  // 4. Update memoryStore in tandem
  if (memObsIdx !== -1) {
    if (action === 'approve') {
      memoryStore.observations[memObsIdx].verification_status = 'VERIFIED';
    } else if (action === 'reject') {
      memoryStore.observations[memObsIdx].verification_status = 'REJECTED';
    } else if (action === 'edit' && payload.edited_data) {
      memoryStore.observations[memObsIdx] = {
        ...memoryStore.observations[memObsIdx],
        ...payload.edited_data,
        verification_status: 'PENDING_ADMIN_REVIEW'
      };
    }
    updatedEntity = memoryStore.observations[memObsIdx];

    if (action === 'approve' || action === 'reject') {
      memoryStore.evidenceLinks
        .filter((e) => e.knowledge_id === id)
        .forEach((e) => {
          e.verification_status = newStatus as any;
        });
    }
  }

  // Audit record return (only created for approve/reject)
  let auditRecord: any = null;
  if (action === 'approve' || action === 'reject') {
    auditRecord = {
      id: `ver_${uuidv4().slice(0, 8)}`,
      entity_type: 'observation' as const,
      entity_id: id,
      reviewer_id: payload.reviewer_id || 'usr_admin_bose',
      reviewer_name: payload.reviewer_name || 'Dr. Sunita Bose',
      status: action === 'approve' ? ('approved' as const) : ('rejected' as const),
      notes: payload.notes || 'Institutional review decision by Knowledge Admin',
      previous_value: previousValue,
      new_value: updatedEntity,
      reviewed_at: new Date().toISOString()
    };
  }

  return {
    updated_entity: updatedEntity,
    audit_record: auditRecord
  };
}

// -------------------------------------------------------------
// 10. GENERATED OUTREACH PERSISTENCE
// -------------------------------------------------------------
export async function saveGeneratedContent(content: GeneratedContent): Promise<GeneratedContent> {
  memoryStore.outreach.unshift(content);

  if (supabase) {
    try {
      const { error } = await supabase.from('generated_content').insert({
        id: content.id,
        source_knowledge_ids: content.source_knowledge_ids || [],
        content_type: content.content_type,
        audience: content.audience,
        tone: content.tone,
        title: content.title,
        content: content.content,
        summary: content.summary,
        citations: content.citations || [],
        status: content.status || 'draft',
        created_at: content.created_at || new Date().toISOString()
      });

      if (error) {
        console.warn(`[POLARWEAVE DB] Error inserting generated_content:`, error.message);
      }
    } catch (err: any) {
      console.warn(`[POLARWEAVE DB] Exception inserting generated_content:`, err?.message);
    }
  }

  return content;
}

export async function getGeneratedContent(): Promise<GeneratedContent[]> {
  if (supabase) {
    try {
      const { data, error } = await supabase
        .from('generated_content')
        .select('*')
        .order('created_at', { ascending: false });

      if (!error && data) {
        const dbIds = new Set(data.map((c) => c.id));
        const extraMem = memoryStore.outreach.filter((c) => !dbIds.has(c.id));
        return [...data, ...extraMem];
      }
    } catch (err: any) {
      console.warn('[POLARWEAVE DB] Error fetching generated_content:', err?.message);
    }
  }

  return memoryStore.outreach;
}

// -------------------------------------------------------------
// 11. USER PROFILES & ONBOARDING PERSISTENCE
// -------------------------------------------------------------
export async function getUserProfileByUserId(userId: string): Promise<UserProfile | null> {
  // Check memory store first
  const mem = memoryStore.profiles.find((p: any) => p.user_id === userId || p.id === userId);
  if (mem) return mem;

  if (supabase) {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .or(`id.eq.${userId},user_id.eq.${userId}`)
        .maybeSingle();

      if (!error && data) {
        return {
          id: data.id,
          user_id: data.user_id || data.id,
          full_name: data.full_name || '',
          email: data.email || '',
          role: data.role || 'researcher',
          institution: data.institution || data.organization || '',
          organization: data.organization || data.institution || '',
          designation: data.designation || '',
          country: data.country || '',
          research_domain: data.research_domain || '',
          affiliation: data.affiliation || '',
          explorer_interest: data.explorer_interest || '',
          onboarding_completed: Boolean(data.onboarding_completed),
          avatar_url: data.avatar_url || '',
          created_at: data.created_at || new Date().toISOString(),
          updated_at: data.updated_at || new Date().toISOString()
        };
      }
    } catch (err: any) {
      console.warn('[POLARWEAVE DB] Error fetching profile:', err?.message);
    }
  }

  return null;
}

export async function upsertUserProfile(profileData: Partial<UserProfile> & { user_id: string; email: string }): Promise<UserProfile> {
  const existing = await getUserProfileByUserId(profileData.user_id);
  const now = new Date().toISOString();

  const merged: UserProfile = {
    id: existing?.id || profileData.id || profileData.user_id,
    user_id: profileData.user_id,
    full_name: profileData.full_name || existing?.full_name || '',
    email: profileData.email,
    role: profileData.role || existing?.role || 'researcher',
    institution: profileData.organization || profileData.institution || existing?.institution || '',
    organization: profileData.organization || existing?.organization || '',
    designation: profileData.designation || existing?.designation || '',
    country: profileData.country || existing?.country || '',
    research_domain: profileData.research_domain || existing?.research_domain || '',
    affiliation: profileData.affiliation || existing?.affiliation || '',
    explorer_interest: profileData.explorer_interest || existing?.explorer_interest || '',
    onboarding_completed: profileData.onboarding_completed !== undefined ? profileData.onboarding_completed : (existing?.onboarding_completed ?? true),
    avatar_url: profileData.avatar_url || existing?.avatar_url || '',
    created_at: existing?.created_at || now,
    updated_at: now
  };

  // Update memory store
  const memIdx = memoryStore.profiles.findIndex((p: any) => p.user_id === profileData.user_id || p.id === profileData.user_id);
  if (memIdx !== -1) {
    memoryStore.profiles[memIdx] = merged;
  } else {
    memoryStore.profiles.unshift(merged);
  }

  // Persist to Supabase if available
  if (supabase) {
    try {
      const dbRow: any = {
        id: merged.id,
        user_id: merged.user_id,
        full_name: merged.full_name,
        email: merged.email,
        role: merged.role,
        organization: merged.organization,
        institution: merged.institution,
        designation: merged.designation,
        country: merged.country,
        research_domain: merged.research_domain,
        affiliation: merged.affiliation,
        explorer_interest: merged.explorer_interest,
        onboarding_completed: merged.onboarding_completed,
        avatar_url: merged.avatar_url,
        updated_at: now
      };

      const { error } = await supabase.from('profiles').upsert(dbRow, { onConflict: 'id' });
      if (error) {
        console.warn('[POLARWEAVE DB] Profiles table upsert warning (falling back to memory):', error.message);
      }
    } catch (err: any) {
      console.warn('[POLARWEAVE DB] Exception upserting profile:', err?.message);
    }
  }

  return merged;
}

// -------------------------------------------------------------
// DELETE PROCESSING JOB & ALL RELATED PACKAGE ENTITIES CASCADE
// -------------------------------------------------------------
export async function deleteProcessingJobCascade(jobId: string): Promise<{
  deleted_job_id: string;
  counts: {
    observations: number;
    documents: number;
    datasets: number;
    media: number;
    measurements: number;
    evidence_links: number;
    relationships: number;
    outreach: number;
    verification_records: number;
    storage_files: number;
  };
}> {
  // 1. Gather all entity IDs associated with this job
  const docs = await getDocuments({ job_id: jobId });
  const docIds = docs.map((d) => d.id);
  const docStoragePaths = docs.map((d) => d.storage_path).filter(Boolean) as string[];

  const datasets = await getDatasets({ job_id: jobId });
  const datasetIds = datasets.map((d) => d.id);
  const datasetStoragePaths = datasets.map((d) => d.file_path).filter(Boolean) as string[];

  const mediaList = await getMedia({ job_id: jobId });
  const mediaIds = mediaList.map((m) => m.id);
  const mediaStoragePaths = [
    ...mediaList.map((m) => m.storage_path).filter(Boolean),
    ...mediaList.map((m) => m.thumbnail_path).filter(Boolean)
  ] as string[];

  const obsList = await getObservations({ job_id: jobId });
  const obsIds = obsList.map((o) => o.id);

  const allEntityIds = new Set([...docIds, ...datasetIds, ...mediaIds, ...obsIds]);

  // 2. Identify storage paths to purge
  const storagePathsToDelete = Array.from(new Set([...docStoragePaths, ...datasetStoragePaths, ...mediaStoragePaths]));

  let measurementCount = 0;
  let evidenceLinkCount = 0;
  let relationshipCount = 0;
  let outreachCount = 0;
  let verificationCount = 0;

  // 3. PostgreSQL cleanup if Supabase is active
  if (supabase) {
    try {
      // Delete measurements
      if (obsIds.length > 0) {
        const { error: msrErr, count: msrC } = await supabase
          .from('measurements')
          .delete({ count: 'exact' })
          .in('observation_id', obsIds);
        if (!msrErr && typeof msrC === 'number') measurementCount = msrC;
      }

      // Delete evidence links
      const { error: evErr1, count: evC1 } = await supabase
        .from('evidence_links')
        .delete({ count: 'exact' })
        .eq('processing_job_id', jobId);
      if (!evErr1 && typeof evC1 === 'number') evidenceLinkCount += evC1;

      if (obsIds.length > 0) {
        const { error: evErr2, count: evC2 } = await supabase
          .from('evidence_links')
          .delete({ count: 'exact' })
          .in('knowledge_id', obsIds);
        if (!evErr2 && typeof evC2 === 'number') evidenceLinkCount += evC2;
      }

      // Delete verification records
      if (obsIds.length > 0) {
        const { error: verErr, count: verC } = await supabase
          .from('verification_records')
          .delete({ count: 'exact' })
          .in('entity_id', obsIds);
        if (!verErr && typeof verC === 'number') verificationCount = verC;
      }

      // Delete knowledge relationships
      if (allEntityIds.size > 0) {
        const idArr = Array.from(allEntityIds);
        const { error: relErr1 } = await supabase
          .from('knowledge_relationships')
          .delete()
          .in('source_entity_id', idArr);
        const { error: relErr2 } = await supabase
          .from('knowledge_relationships')
          .delete()
          .in('target_entity_id', idArr);
        if (relErr1) console.warn('[POLARWEAVE DB] Error deleting relationships:', relErr1.message);
        if (relErr2) console.warn('[POLARWEAVE DB] Error deleting relationships:', relErr2.message);
      }

      // Delete document chunks & documents
      if (docIds.length > 0) {
        await supabase.from('document_chunks').delete().in('document_id', docIds);
        await supabase.from('documents').delete().in('id', docIds);
      } else {
        await supabase.from('documents').delete().eq('processing_job_id', jobId);
      }

      // Delete datasets
      await supabase.from('datasets').delete().eq('processing_job_id', jobId);

      // Delete media
      await supabase.from('media_assets').delete().eq('processing_job_id', jobId);

      // Delete observations
      await supabase.from('observations').delete().eq('processing_job_id', jobId);

      // Delete outreach content citing these observations
      if (obsIds.length > 0) {
        const { data: outreachRows } = await supabase.from('generated_content').select('id, source_knowledge_ids');
        if (outreachRows) {
          const deleteOutreachIds = outreachRows
            .filter((row: any) => Array.isArray(row.source_knowledge_ids) && row.source_knowledge_ids.some((kid: string) => obsIds.includes(kid)))
            .map((row: any) => row.id);
          if (deleteOutreachIds.length > 0) {
            await supabase.from('generated_content').delete().in('id', deleteOutreachIds);
            outreachCount = deleteOutreachIds.length;
          }
        }
      }

      // Delete the processing job container itself
      await supabase.from('processing_jobs').delete().eq('id', jobId);

      // Delete storage files
      if (storagePathsToDelete.length > 0) {
        const { error: storageErr } = await supabase.storage
          .from(BUCKET_NAME)
          .remove(storagePathsToDelete);
        if (storageErr) {
          console.warn('[POLARWEAVE Storage] Error deleting files:', storageErr.message);
        }
      }
    } catch (err: any) {
      console.warn(`[POLARWEAVE DB] Exception deleting job package ${jobId}:`, err?.message);
    }
  }

  // 4. Memory store cleanup
  if (obsIds.length > 0) {
    memoryStore.measurements = memoryStore.measurements.filter((m) => !obsIds.includes(m.observation_id));
  }
  memoryStore.evidenceLinks = memoryStore.evidenceLinks.filter((l) => l.processing_job_id !== jobId && !obsIds.includes(l.knowledge_id));
  memoryStore.relationships = memoryStore.relationships.filter(
    (r) => !allEntityIds.has(r.source_entity_id) && !allEntityIds.has(r.target_entity_id)
  );
  memoryStore.documents = memoryStore.documents.filter((d) => d.processing_job_id !== jobId && !docIds.includes(d.id));
  memoryStore.datasets = memoryStore.datasets.filter((d) => d.processing_job_id !== jobId && !datasetIds.includes(d.id));
  memoryStore.media = memoryStore.media.filter((m) => m.processing_job_id !== jobId && !mediaIds.includes(m.id));
  memoryStore.observations = memoryStore.observations.filter((o) => o.processing_job_id !== jobId && !obsIds.includes(o.id));
  memoryStore.outreach = memoryStore.outreach.filter(
    (c) => !(Array.isArray(c.source_knowledge_ids) && c.source_knowledge_ids.some((kid: string) => obsIds.includes(kid)))
  );
  memoryStore.jobs = memoryStore.jobs.filter((j) => j.id !== jobId);

  return {
    deleted_job_id: jobId,
    counts: {
      observations: obsIds.length,
      documents: docIds.length,
      datasets: datasetIds.length,
      media: mediaIds.length,
      measurements: measurementCount,
      evidence_links: evidenceLinkCount,
      relationships: relationshipCount,
      outreach: outreachCount,
      verification_records: verificationCount,
      storage_files: storagePathsToDelete.length
    }
  };
}

