import { Request, Response } from 'express';
import { memoryStore } from '../db/supabase.js';
import { generateAudienceOutreach } from '../ai/outreach.js';
import { OutreachGenerationRequestSchema } from '@polarweave/types';

export async function generateContent(req: Request, res: Response) {
  try {
    const validated = OutreachGenerationRequestSchema.parse(req.body);

    // Retrieve requested observations
    const sourceObs = memoryStore.observations.filter((o) =>
      validated.source_knowledge_ids.includes(o.id)
    );

    if (sourceObs.length === 0) {
      return res.status(400).json({
        success: false,
        error: { code: 'INVALID_SOURCES', message: 'No valid verified source observations found.' }
      });
    }

    // Retrieve evidence links for citations
    const evidence = memoryStore.evidenceLinks.filter((e) =>
      validated.source_knowledge_ids.includes(e.knowledge_id)
    );

    const generated = await generateAudienceOutreach(validated, sourceObs, evidence);
    memoryStore.outreach.unshift(generated);

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
  return res.status(200).json({
    success: true,
    data: memoryStore.outreach
  });
}

export async function getOutreachById(req: Request, res: Response) {
  const { id } = req.params;
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
