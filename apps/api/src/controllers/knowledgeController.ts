import { Request, Response } from 'express';
import { memoryStore } from '../db/supabase.js';

export async function getObservations(req: Request, res: Response) {
  const { domain, status, expedition_id, query } = req.query;

  let list = [...memoryStore.observations];

  if (domain && typeof domain === 'string') {
    list = list.filter((o) => o.research_domain.toLowerCase() === domain.toLowerCase());
  }

  if (status && typeof status === 'string') {
    list = list.filter((o) => o.verification_status === status);
  }

  if (expedition_id && typeof expedition_id === 'string') {
    list = list.filter((o) => o.expedition_id === expedition_id);
  }

  if (query && typeof query === 'string') {
    const q = query.toLowerCase();
    list = list.filter((o) => o.title.toLowerCase().includes(q) || o.description.toLowerCase().includes(q));
  }

  return res.status(200).json({
    success: true,
    data: list
  });
}

export async function getObservationById(req: Request, res: Response) {
  const { id } = req.params;
  const observation = memoryStore.observations.find((o) => o.id === id);

  if (!observation) {
    return res.status(404).json({
      success: false,
      error: { code: 'NOT_FOUND', message: `Observation ${id} not found.` }
    });
  }

  const measurements = memoryStore.measurements.filter((m) => m.observation_id === id);
  const evidence = memoryStore.evidenceLinks.filter((e) => e.knowledge_id === id);
  const relationships = memoryStore.relationships.filter(
    (r) => r.source_entity_id === id || r.target_entity_id === id
  );

  return res.status(200).json({
    success: true,
    data: {
      ...observation,
      measurements,
      evidence,
      relationships
    }
  });
}

export async function updateObservation(req: Request, res: Response) {
  const { id } = req.params;
  const idx = memoryStore.observations.findIndex((o) => o.id === id);

  if (idx === -1) {
    return res.status(404).json({
      success: false,
      error: { code: 'NOT_FOUND', message: `Observation ${id} not found.` }
    });
  }

  memoryStore.observations[idx] = {
    ...memoryStore.observations[idx],
    ...req.body
  };

  return res.status(200).json({
    success: true,
    data: memoryStore.observations[idx]
  });
}

export async function getExpeditions(req: Request, res: Response) {
  return res.status(200).json({
    success: true,
    data: memoryStore.expeditions
  });
}

export async function getExpeditionById(req: Request, res: Response) {
  const { id } = req.params;
  const idStr = String(id || '');
  const expedition = memoryStore.expeditions.find(
    (e) => e.id === idStr || e.code.toLowerCase() === idStr.toLowerCase()
  );

  if (!expedition) {
    return res.status(404).json({
      success: false,
      error: { code: 'NOT_FOUND', message: `Expedition ${id} not found.` }
    });
  }

  const relatedObs = memoryStore.observations.filter((o) => o.expedition_id === expedition.id);
  const relatedDocs = memoryStore.documents;
  const relatedDatasets = memoryStore.datasets.filter((d) => d.expedition_id === expedition.id);
  const relatedMedia = memoryStore.media.filter((m) => m.expedition_id === expedition.id);

  return res.status(200).json({
    success: true,
    data: {
      ...expedition,
      observations: relatedObs,
      documents: relatedDocs,
      datasets: relatedDatasets,
      media: relatedMedia
    }
  });
}

export async function getLocations(req: Request, res: Response) {
  return res.status(200).json({
    success: true,
    data: memoryStore.locations
  });
}

export async function getDatasets(req: Request, res: Response) {
  return res.status(200).json({
    success: true,
    data: memoryStore.datasets
  });
}

export async function getDatasetById(req: Request, res: Response) {
  const { id } = req.params;
  const dataset = memoryStore.datasets.find((d) => d.id === id);

  if (!dataset) {
    return res.status(404).json({
      success: false,
      error: { code: 'NOT_FOUND', message: `Dataset ${id} not found.` }
    });
  }

  return res.status(200).json({
    success: true,
    data: dataset
  });
}

export async function getMedia(req: Request, res: Response) {
  const { type } = req.query;
  let list = [...memoryStore.media];
  if (type && typeof type === 'string') {
    list = list.filter((m) => m.type === type);
  }
  return res.status(200).json({
    success: true,
    data: list
  });
}

export async function getMediaById(req: Request, res: Response) {
  const { id } = req.params;
  const item = memoryStore.media.find((m) => m.id === id);
  if (!item) {
    return res.status(404).json({
      success: false,
      error: { code: 'NOT_FOUND', message: `Media ${id} not found.` }
    });
  }
  return res.status(200).json({
    success: true,
    data: item
  });
}

export async function getKnowledgeGraph(req: Request, res: Response) {
  // Returns nodes and edges formatted for React Flow
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

  // Expeditions
  memoryStore.expeditions.forEach((exp, idx) => {
    nodes.push({
      id: exp.id,
      type: 'expedition',
      data: { title: exp.title, code: exp.code, region: exp.region, status: exp.status },
      position: { x: 350 + idx * 300, y: 50 }
    });
  });

  // Locations
  memoryStore.locations.forEach((loc, idx) => {
    nodes.push({
      id: loc.id,
      type: 'location',
      data: { title: loc.name, region: loc.region, station: loc.station, coordinates: `${loc.latitude}, ${loc.longitude}` },
      position: { x: 100 + idx * 220, y: 220 }
    });
  });

  // Observations
  memoryStore.observations.forEach((obs, idx) => {
    nodes.push({
      id: obs.id,
      type: 'observation',
      data: {
        title: obs.title,
        domain: obs.research_domain,
        confidence: obs.confidence,
        status: obs.verification_status
      },
      position: { x: 150 + idx * 240, y: 380 }
    });
  });

  // Datasets
  memoryStore.datasets.forEach((dts, idx) => {
    nodes.push({
      id: dts.id,
      type: 'dataset',
      data: { title: dts.title, filename: dts.filename, rows: dts.row_count },
      position: { x: 200 + idx * 280, y: 540 }
    });
  });

  // Media
  memoryStore.media.forEach((med, idx) => {
    nodes.push({
      id: med.id,
      type: 'media',
      data: { title: med.filename, type: med.type, caption: med.ai_analysis_json?.caption },
      position: { x: 500 + idx * 260, y: 540 }
    });
  });

  // Add relationships as edges
  memoryStore.relationships.forEach((rel) => {
    edges.push({
      id: rel.id,
      source: rel.source_entity_id,
      target: rel.target_entity_id,
      label: rel.label || rel.relationship_type,
      style: { stroke: '#94A3B8', strokeWidth: 1.5 },
      animated: rel.status === 'suggested'
    });
  });

  return res.status(200).json({
    success: true,
    data: { nodes, edges }
  });
}
