import { Request, Response } from 'express';
import { memoryStore } from '../db/supabase.js';
import { queryAskTheEvidence } from '../ai/search.js';

export async function searchKnowledge(req: Request, res: Response) {
  const { q, type, domain, region, status } = req.query;
  const queryStr = typeof q === 'string' ? q.toLowerCase().trim() : '';

  const results: Array<{
    id: string;
    type: string;
    title: string;
    subtitle?: string;
    summary: string;
    domain?: string;
    region?: string;
    confidence?: number;
    verification_status?: string;
    evidence_count?: number;
  }> = [];

  // Filter Observations
  if (!type || type === 'observation') {
    memoryStore.observations.forEach((obs) => {
      const matchQ = !queryStr || obs.title.toLowerCase().includes(queryStr) || obs.description.toLowerCase().includes(queryStr);
      const matchDomain = !domain || obs.research_domain.toLowerCase() === (domain as string).toLowerCase();
      const matchStatus = !status || obs.verification_status === status;

      if (matchQ && matchDomain && matchStatus) {
        const evidenceCount = memoryStore.evidenceLinks.filter((e) => e.knowledge_id === obs.id).length;
        results.push({
          id: obs.id,
          type: 'observation',
          title: obs.title,
          subtitle: obs.location_name,
          summary: obs.description,
          domain: obs.research_domain,
          confidence: obs.confidence,
          verification_status: obs.verification_status,
          evidence_count: evidenceCount
        });
      }
    });
  }

  // Filter Expeditions
  if (!type || type === 'expedition') {
    memoryStore.expeditions.forEach((exp) => {
      const matchQ = !queryStr || exp.title.toLowerCase().includes(queryStr) || exp.description.toLowerCase().includes(queryStr);
      const matchRegion = !region || exp.region.toLowerCase() === (region as string).toLowerCase();

      if (matchQ && matchRegion) {
        results.push({
          id: exp.id,
          type: 'expedition',
          title: exp.title,
          subtitle: `${exp.code} • ${exp.region}`,
          summary: exp.description,
          region: exp.region
        });
      }
    });
  }

  // Filter Datasets
  if (!type || type === 'dataset') {
    memoryStore.datasets.forEach((dts) => {
      const matchQ = !queryStr || dts.title.toLowerCase().includes(queryStr) || dts.filename.toLowerCase().includes(queryStr);
      if (matchQ) {
        results.push({
          id: dts.id,
          type: 'dataset',
          title: dts.title,
          subtitle: `${dts.filename} • ${dts.row_count} records`,
          summary: `Scientific dataset containing columns: ${dts.columns?.map(c => c.name).join(', ') || 'N/A'}`
        });
      }
    });
  }

  // Filter Media
  if (!type || type === 'media') {
    memoryStore.media.forEach((med) => {
      const caption = med.ai_analysis_json?.caption || '';
      const matchQ = !queryStr || med.filename.toLowerCase().includes(queryStr) || caption.toLowerCase().includes(queryStr);
      if (matchQ) {
        results.push({
          id: med.id,
          type: 'media',
          title: med.filename,
          subtitle: `${med.type.toUpperCase()} • ${med.location_name || 'Polar Region'}`,
          summary: caption
        });
      }
    });
  }

  return res.status(200).json({
    success: true,
    data: {
      total: results.length,
      query: queryStr,
      results
    }
  });
}

export async function askTheEvidence(req: Request, res: Response) {
  const { query } = req.body;
  if (!query || typeof query !== 'string') {
    return res.status(400).json({
      success: false,
      error: { code: 'INVALID_QUERY', message: 'Query string is required.' }
    });
  }

  const result = queryAskTheEvidence(query);
  return res.status(200).json({
    success: true,
    data: result
  });
}
