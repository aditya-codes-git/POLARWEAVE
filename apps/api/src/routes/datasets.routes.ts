import { Router } from 'express';
import { getDatasets, getDatasetById } from '../controllers/knowledgeController.js';

const router = Router();

router.get('/', getDatasets);
router.get('/:id', getDatasetById);

export default router;
