import { Request, Response } from 'express';
import { memoryStore, supabase } from '../db/supabase.js';
import { generateAudienceOutreach } from '../ai/outreach.js';
import { OutreachGenerationRequestSchema } from '@polarweave/types';
import {
  saveGeneratedContent,
  getGeneratedContent,
  getObservations as fetchObservations,
  getEvidenceByKnowledgeId
} from '../db/repository.js';

export async function generateContent(req: Request, res: Response) {
  try {
    const validated = OutreachGenerationRequestSchema.parse(req.body);

    // Retrieve requested observations from DB / memory
    const allObs = await fetchObservations();
    const sourceObs = allObs.filter((o) =>
      validated.source_knowledge_ids.includes(o.id)
    );

    if (sourceObs.length === 0) {
      return res.status(400).json({
        success: false,
        error: { code: 'INVALID_SOURCES', message: 'No valid verified source observations found.' }
      });
    }

    // Retrieve evidence links for citations
    const allEvidence = [];
    for (const obsId of validated.source_knowledge_ids) {
      const eviResult = await getEvidenceByKnowledgeId(obsId);
      if (eviResult?.evidence_chain) {
        allEvidence.push(...eviResult.evidence_chain);
      }
    }

    const generated = await generateAudienceOutreach(validated, sourceObs, allEvidence);

    // Persist to PostgreSQL generated_content table
    await saveGeneratedContent(generated);

    return res.status(200).json({
      success: true,
      data: generated
    });
  } catch (err: any) {
    return res.status(400).json({
      success: false,
      error: { code: 'GENERATION_ERROR', message: err.message || 'Error generating outreach content' }
    });
  }
}

export async function getOutreachList(req: Request, res: Response) {
  try {
    const list = await getGeneratedContent();
    return res.status(200).json({
      success: true,
      data: list
    });
  } catch (err: any) {
    return res.status(500).json({
      success: false,
      error: { code: 'OUTREACH_LIST_ERROR', message: err.message || 'Error fetching outreach history' }
    });
  }
}

export async function getOutreachById(req: Request, res: Response) {
  const { id } = req.params;

  if (supabase) {
    try {
      const { data, error } = await supabase
        .from('generated_content')
        .select('*')
        .eq('id', id)
        .maybeSingle();

      if (!error && data) {
        return res.status(200).json({
          success: true,
          data
        });
      }
    } catch (err: any) {
      console.warn(`[POLARWEAVE DB] Error fetching outreach ${id}:`, err?.message);
    }
  }

  const item = memoryStore.outreach.find((o) => o.id === id);
  if (!item) {
    return res.status(404).json({
      success: false,
      error: { code: 'NOT_FOUND', message: `Outreach item ${id} not found.` }
    });
  }

  return res.status(200).json({
    success: true,
    data: item
  });
}

export async function updateOutreach(req: Request, res: Response) {
  const { id } = req.params;

  if (supabase) {
    try {
      const { data, error } = await supabase
        .from('generated_content')
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
      console.warn(`[POLARWEAVE DB] Error updating outreach ${id}:`, err?.message);
    }
  }

  const idx = memoryStore.outreach.findIndex((o) => o.id === id);
  if (idx === -1) {
    return res.status(404).json({
      success: false,
      error: { code: 'NOT_FOUND', message: `Outreach item ${id} not found.` }
    });
  }

  memoryStore.outreach[idx] = {
    ...memoryStore.outreach[idx],
    ...req.body
  };

  return res.status(200).json({
    success: true,
    data: memoryStore.outreach[idx]
  });
}
