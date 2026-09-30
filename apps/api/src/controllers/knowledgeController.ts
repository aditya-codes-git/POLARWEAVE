import { Request, Response } from 'express';
import { memoryStore, supabase } from '../db/supabase.js';
import {
  getObservations as fetchObservations,
  getObservationById as fetchObservationById,
  getDatasets as fetchDatasets,
  getDatasetById as fetchDatasetById,
  getMedia as fetchMedia,
  getMediaById as fetchMediaById,
  getKnowledgeGraphData
} from '../db/repository.js';

export async function getObservations(req: Request, res: Response) {
  try {
    const { domain, status, expedition_id, query, job_id, scope } = req.query;
    const list = await fetchObservations({
      domain: typeof domain === 'string' ? domain : undefined,
      status: typeof status === 'string' ? status : undefined,
      expedition_id: typeof expedition_id === 'string' ? expedition_id : undefined,
      query: typeof query === 'string' ? query : undefined,
      job_id: typeof job_id === 'string' ? job_id : undefined,
      scope: typeof scope === 'string' ? (scope as 'real' | 'demo' | 'all') : undefined
    });

    return res.status(200).json({
      success: true,
      data: list
    });
  } catch (err: any) {
    return res.status(500).json({
      success: false,
      error: { code: 'OBSERVATIONS_ERROR', message: err.message || 'Error fetching observations' }
    });
  }
}

export async function getObservationById(req: Request, res: Response) {
  try {
    const id = String(req.params.id);
    const data = await fetchObservationById(id);

    if (!data) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: `Observation ${id} not found.` }
      });
    }

    return res.status(200).json({
      success: true,
      data
    });
  } catch (err: any) {
    return res.status(500).json({
      success: false,
      error: { code: 'OBSERVATION_ERROR', message: err.message || 'Error fetching observation' }
    });
  }
}

export async function updateObservation(req: Request, res: Response) {
  const { id } = req.params;

  if (supabase) {
    try {
      const { data, error } = await supabase
        .from('observations')
        .update(req.body)
        .eq('id', id)
        .select()
        .single();

      if (!error && data) {
        return res.status(200).json({
          success: true,
          data
        });
      }
    } catch (err: any) {
      console.warn(`[POLARWEAVE DB] Error updating observation ${id}:`, err?.message);
    }
  }

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
  if (supabase) {
    try {
      const { data, error } = await supabase.from('expeditions').select('*');
      if (!error && data && data.length > 0) {
        return res.status(200).json({
          success: true,
          data
        });
      }
    } catch (err: any) {
      console.warn('[POLARWEAVE DB] Error fetching expeditions from DB:', err?.message);
    }
  }

  return res.status(200).json({
    success: true,
    data: memoryStore.expeditions
  });
}

export async function getExpeditionById(req: Request, res: Response) {
  const { id } = req.params;
  const idStr = String(id || '');

  let expedition: any = null;
  if (supabase) {
    try {
      const { data, error } = await supabase
        .from('expeditions')
        .select('*')
        .or(`id.eq.${idStr},code.ilike.${idStr}`)
        .maybeSingle();

      if (!error && data) {
        expedition = data;
      }
    } catch (err: any) {
      console.warn(`[POLARWEAVE DB] Error fetching expedition ${idStr}:`, err?.message);
    }
  }

  if (!expedition) {
    expedition = memoryStore.expeditions.find(
      (e) => e.id === idStr || e.code.toLowerCase() === idStr.toLowerCase()
    );
  }

  if (!expedition) {
    return res.status(404).json({
      success: false,
      error: { code: 'NOT_FOUND', message: `Expedition ${id} not found.` }
    });
  }

  const relatedObs = await fetchObservations({ expedition_id: expedition.id });
  const relatedDatasets = (await fetchDatasets()).filter((d) => d.expedition_id === expedition.id);
  const relatedMedia = (await fetchMedia()).filter((m) => m.expedition_id === expedition.id);

  return res.status(200).json({
    success: true,
    data: {
      ...expedition,
      observations: relatedObs,
      documents: memoryStore.documents,
      datasets: relatedDatasets,
      media: relatedMedia
    }
  });
}

export async function getLocations(req: Request, res: Response) {
  if (supabase) {
    try {
      const { data, error } = await supabase.from('locations').select('*');
      if (!error && data && data.length > 0) {
        return res.status(200).json({
          success: true,
          data
        });
      }
    } catch (err: any) {
      console.warn('[POLARWEAVE DB] Error fetching locations:', err?.message);
    }
  }

  return res.status(200).json({
    success: true,
    data: memoryStore.locations
  });
}

export async function getDatasets(req: Request, res: Response) {
  const list = await fetchDatasets();
  return res.status(200).json({
    success: true,
    data: list
  });
}

export async function getDatasetById(req: Request, res: Response) {
  const id = String(req.params.id);
  const dataset = await fetchDatasetById(id);

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
  const list = await fetchMedia(typeof type === 'string' ? type : undefined);
  return res.status(200).json({
    success: true,
    data: list
  });
}

export async function getMediaById(req: Request, res: Response) {
  const id = String(req.params.id);
  const item = await fetchMediaById(id);
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
  try {
    const { job_id, scope } = req.query;
    const graphData = await getKnowledgeGraphData({
      jobId: typeof job_id === 'string' ? job_id : undefined,
      scope: typeof scope === 'string' ? (scope as 'real' | 'demo' | 'all') : undefined
    });
    return res.status(200).json({
      success: true,
      data: graphData
    });
  } catch (err: any) {
    return res.status(500).json({
      success: false,
      error: { code: 'GRAPH_ERROR', message: err.message || 'Error generating knowledge graph' }
    });
  }
}
