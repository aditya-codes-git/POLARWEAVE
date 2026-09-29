import { Router } from 'express';
import { getEvidenceByKnowledgeId } from '../controllers/evidenceController.js';

const router = Router();

router.get('/:knowledgeId', getEvidenceByKnowledgeId);

export default router;
