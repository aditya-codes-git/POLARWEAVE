import { Router } from 'express';
import { getExpeditions, getExpeditionById } from '../controllers/knowledgeController.js';

const router = Router();

router.get('/', getExpeditions);
router.get('/:id', getExpeditionById);

export default router;
