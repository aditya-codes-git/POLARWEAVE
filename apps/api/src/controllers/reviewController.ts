import { Request, Response } from 'express';
import { ReviewActionSchema } from '@polarweave/types';
import { reviewKnowledgeEntity } from '../db/repository.js';

export async function reviewEntity(req: Request, res: Response) {
  try {
    const entityType = String(req.params.entityType);
    const id = String(req.params.id);
    const body = ReviewActionSchema.parse(req.body);

    const result = await reviewKnowledgeEntity(entityType, id, body.action, {
      reviewer_id: body.reviewer_id,
      reviewer_name: body.reviewer_name,
      notes: body.notes,
      edited_data: body.edited_data
    });

    return res.status(200).json({
      success: true,
      data: result
    });
  } catch (err: any) {
    return res.status(400).json({
      success: false,
      error: { code: 'REVIEW_ERROR', message: err.message || 'Error processing review action' }
    });
  }
}
