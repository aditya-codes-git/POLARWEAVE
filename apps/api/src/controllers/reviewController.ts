import { Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { memoryStore } from '../db/supabase.js';
import { ReviewActionSchema } from '@polarweave/types';

export async function reviewEntity(req: Request, res: Response) {
  try {
    const { entityType, id } = req.params;
    const body = ReviewActionSchema.parse(req.body);

    if (entityType === 'observation') {
      const obsIdx = memoryStore.observations.findIndex((o) => o.id === id);
      if (obsIdx === -1) {
        return res.status(404).json({
          success: false,
          error: { code: 'NOT_FOUND', message: `Observation ${id} not found.` }
        });
      }

      const previousValue = { ...memoryStore.observations[obsIdx] };

      if (body.action === 'approve') {
        memoryStore.observations[obsIdx].verification_status = 'VERIFIED';
        // Also verify linked evidence
        memoryStore.evidenceLinks
          .filter((e) => e.knowledge_id === id)
          .forEach((e) => { e.verification_status = 'VERIFIED'; });
      } else if (body.action === 'reject') {
        memoryStore.observations[obsIdx].verification_status = 'REJECTED';
        memoryStore.evidenceLinks
          .filter((e) => e.knowledge_id === id)
          .forEach((e) => { e.verification_status = 'REJECTED'; });
      } else if (body.action === 'edit' && body.edited_data) {
        memoryStore.observations[obsIdx] = {
          ...memoryStore.observations[obsIdx],
          ...body.edited_data,
          verification_status: 'VERIFIED'
        };
      }

      // Record in verification audit trail
      const auditRecord = {
        id: `ver_${uuidv4().slice(0, 8)}`,
        entity_type: 'observation' as const,
        entity_id: id,
        reviewer_id: body.reviewer_id || 'usr_researcher_sharma',
        reviewer_name: body.reviewer_name || 'Dr. Rajesh Sharma',
        status: body.action === 'approve' ? 'approved' as const : body.action === 'reject' ? 'rejected' as const : 'edited' as const,
        notes: body.notes || 'Reviewed via POLARWEAVE verification workflow',
        previous_value: previousValue as any,
        new_value: memoryStore.observations[obsIdx] as any,
        reviewed_at: new Date().toISOString()
      };

      return res.status(200).json({
        success: true,
        data: {
          updated_entity: memoryStore.observations[obsIdx],
          audit_record: auditRecord
        }
      });
    }

    return res.status(400).json({
      success: false,
      error: { code: 'UNSUPPORTED_ENTITY', message: `Review for ${entityType} not yet supported.` }
    });
  } catch (err: any) {
    return res.status(400).json({
      success: false,
      error: { code: 'VALIDATION_ERROR', message: err.message || 'Invalid review payload' }
    });
  }
}
