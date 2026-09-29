import { Router } from 'express';
import { getMedia, getMediaById } from '../controllers/knowledgeController.js';

const router = Router();

router.get('/', getMedia);
router.get('/:id', getMediaById);

export default router;
