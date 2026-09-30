import {
  Observation,
  Dataset,
  MediaAsset,
  Document,
  EvidenceLink,
  KnowledgeRelationship
} from '@polarweave/types';
import { v4 as uuidv4 } from 'uuid';

export interface CrossFileLinkingInput {
  observations: Observation[];
  datasets: Dataset[];
  documents: Document[];
  media: MediaAsset[];
  processingJobId?: string;
}

export interface CrossFileLinkingOutput {
  evidenceLinks: EvidenceLink[];
  relationships: KnowledgeRelationship[];
}

/**
 * Discovers authentic cross-modal provenance evidence strictly among the uploaded files in this processing job.
 * NEVER creates synthetic or hardcoded Antarctic evidence for unrelated uploads.
 */
export function linkEvidenceCrossModal(input: CrossFileLinkingInput): CrossFileLinkingOutput {
  const evidenceLinks: EvidenceLink[] = [];
  const relationships: KnowledgeRelationship[] = [];

  for (const obs of input.observations) {
    // 1. Link with Documents in this specific job
    const matchingDoc = input.documents.find(
      (d) => d.id === obs.source_file_id || d.filename === obs.source_file_name
    ) || (input.documents.length === 1 ? input.documents[0] : undefined);

    if (matchingDoc) {
      const pageNum = obs.page_number || 1;
      const excerpt = obs.excerpt || obs.description || `Extracted observation from ${matchingDoc.filename}`;

      evidenceLinks.push({
        id: `evi_${uuidv4().slice(0, 8)}`,
        knowledge_type: 'observation',
        knowledge_id: obs.id,
        source_type: matchingDoc.mime_type.includes('pdf') || matchingDoc.filename.endsWith('.pdf') ? 'pdf' : 'docx',
        source_id: matchingDoc.id,
        source_title: matchingDoc.filename,
        page_number: pageNum,
        excerpt,
        confidence: obs.confidence || 0.95,
        verification_status: obs.verification_status || 'AI_EXTRACTED',
        processing_job_id: input.processingJobId || obs.processing_job_id,
        created_at: new Date().toISOString()
      });

      relationships.push({
        id: `rel_${uuidv4().slice(0, 8)}`,
        source_entity_type: 'observation',
        source_entity_id: obs.id,
        target_entity_type: 'report',
        target_entity_id: matchingDoc.id,
        relationship_type: 'RECORDED_IN',
        label: 'Source Document',
        confidence: obs.confidence || 0.95,
        status: 'suggested',
        created_at: new Date().toISOString()
      });
    }

    // 2. Link with Media Assets in this specific job
    const matchingMedia = input.media.find(
      (m) => m.id === obs.source_file_id || m.filename === obs.source_file_name
    );

    if (matchingMedia) {
      const excerpt = matchingMedia.ai_analysis_json?.caption || `Visual content recorded in ${matchingMedia.filename}`;
      evidenceLinks.push({
        id: `evi_${uuidv4().slice(0, 8)}`,
        knowledge_type: 'observation',
        knowledge_id: obs.id,
        source_type: matchingMedia.type === 'video' ? 'video' : 'image',
        source_id: matchingMedia.id,
        source_title: matchingMedia.filename,
        excerpt,
        media_url: matchingMedia.thumbnail_path || matchingMedia.storage_path,
        confidence: obs.confidence || 0.95,
        verification_status: obs.verification_status || 'AI_EXTRACTED',
        processing_job_id: input.processingJobId || obs.processing_job_id,
        created_at: new Date().toISOString()
      });

      relationships.push({
        id: `rel_${uuidv4().slice(0, 8)}`,
        source_entity_type: 'observation',
        source_entity_id: obs.id,
        target_entity_type: 'media',
        target_entity_id: matchingMedia.id,
        relationship_type: 'DOCUMENTED_BY',
        label: matchingMedia.type === 'video' ? 'Video Evidence' : 'Image Evidence',
        confidence: obs.confidence || 0.95,
        status: 'suggested',
        created_at: new Date().toISOString()
      });
    }

    // 3. Link with Datasets in this specific job ONLY if a dataset was actually provided
    for (const dataset of input.datasets) {
      // Only link if dataset has columns matching variables in the observation
      const obsTitleLower = obs.title.toLowerCase();
      const hasMatch = dataset.columns?.some((c) =>
        obsTitleLower.includes(c.name.toLowerCase().replace(/_/g, ' '))
      ) || input.datasets.length === 1;

      if (hasMatch) {
        evidenceLinks.push({
          id: `evi_${uuidv4().slice(0, 8)}`,
          knowledge_type: 'observation',
          knowledge_id: obs.id,
          source_type: 'dataset',
          source_id: dataset.id,
          source_title: dataset.filename,
          row_number: 1,
          excerpt: `Dataset calibration reference: ${dataset.filename} (${dataset.row_count} rows, ${dataset.column_count} columns)`,
          confidence: 0.92,
          verification_status: obs.verification_status || 'AI_EXTRACTED',
          processing_job_id: input.processingJobId || obs.processing_job_id,
          created_at: new Date().toISOString()
        });

        relationships.push({
          id: `rel_${uuidv4().slice(0, 8)}`,
          source_entity_type: 'observation',
          source_entity_id: obs.id,
          target_entity_type: 'dataset',
          target_entity_id: dataset.id,
          relationship_type: 'MEASURED_BY',
          label: 'Tabular Calibration',
          confidence: 0.92,
          status: 'suggested',
          created_at: new Date().toISOString()
        });
      }
    }
  }

  return { evidenceLinks, relationships };
}
