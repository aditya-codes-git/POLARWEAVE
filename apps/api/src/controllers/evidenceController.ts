import { Request, Response } from 'express';
import { getEvidenceByKnowledgeId as fetchEvidence } from '../db/repository.js';

export async function getEvidenceByKnowledgeId(req: Request, res: Response) {
  try {
    const knowledgeId = String(req.params.knowledgeId);
    const result = await fetchEvidence(knowledgeId);

    return res.status(200).json({
      success: true,
      data: result
    });
  } catch (err: any) {
    return res.status(500).json({
      success: false,
      error: { code: 'EVIDENCE_ERROR', message: err.message || 'Error fetching evidence chain' }
    });
  }
}
