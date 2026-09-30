import { Request, Response } from 'express';
import { ReviewActionSchema } from '@polarweave/types';
import { reviewKnowledgeEntity, getObservationById } from '../db/repository.js';

export async function reviewEntity(req: Request, res: Response) {
  try {
    const entityType = String(req.params.entityType);
    const id = String(req.params.id);
    const body = ReviewActionSchema.parse(req.body);
    const user = req.user;

    // 1. Mandatory Authorization for Verification Decisions (Approve / Reject)
    // Only Knowledge Admin is permitted to approve or reject submissions.
    if (body.action === 'approve' || body.action === 'reject') {
      if (!user || user.role !== 'admin') {
        return res.status(403).json({
          success: false,
          error: {
            code: 'FORBIDDEN',
            message: user?.role === 'researcher'
              ? 'Self-approval is prohibited. A researcher cannot verify their own submission.'
              : 'Only Knowledge Admins can approve or reject knowledge.'
          }
        });
      }

      // 2. Self-Approval Safeguard (Section 8)
      // Separation of duties: Even an admin cannot approve their own submitted research observations
      const currentObs = await getObservationById(id);
      if (currentObs) {
        const isAuthor = 
          (currentObs.created_by && currentObs.created_by === user.id) ||
          (currentObs.created_by_name && currentObs.created_by_name === user.name);

        if (isAuthor && currentObs.created_by === user.id) {
          return res.status(403).json({
            success: false,
            error: {
              code: 'FORBIDDEN',
              message: 'Self-approval is prohibited. Authors cannot verify their own submissions.'
            }
          });
        }
      }
    } else if (body.action === 'edit') {
      // 3. Metadata Editing Authorization
      // Public users cannot edit repository knowledge
      if (!user || user.role === 'public') {
        return res.status(403).json({
          success: false,
          error: {
            code: 'FORBIDDEN',
            message: 'Public users cannot edit scientific metadata.'
          }
        });
      }

      // Researchers cannot edit already-verified institutional facts directly
      const currentObs = await getObservationById(id);
      if (currentObs && currentObs.verification_status === 'VERIFIED' && user.role !== 'admin') {
        return res.status(403).json({
          success: false,
          error: {
            code: 'FORBIDDEN',
            message: 'Researchers cannot edit verified knowledge directly. Submit a change request for Knowledge Admin review.'
          }
        });
      }
    }

    // 4. Execute Review via Repository using trusted server-side user credentials
    const result = await reviewKnowledgeEntity(entityType, id, body.action, {
      reviewer_id: user?.id,
      reviewer_name: user?.name,
      notes: body.notes,
      edited_data: body.edited_data,
      caller_role: user?.role
    });

    return res.status(200).json({
      success: true,
      data: result
    });
  } catch (err: any) {
    console.error('[POLARWEAVE REVIEW] Review execution error:', err);
    return res.status(400).json({
      success: false,
      error: { code: 'REVIEW_ERROR', message: err.message || 'Error processing review action' }
    });
  }
}
