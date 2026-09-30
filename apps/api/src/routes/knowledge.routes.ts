import { Router } from 'express';
import {
  getObservations,
  getObservationById,
  updateObservation,
  getExpeditions,
  getExpeditionById,
  getLocations,
  getDatasets,
  getDatasetById,
  getMedia,
  getMediaById,
  getKnowledgeGraph
} from '../controllers/knowledgeController.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();

// Resolve caller identity from verified Supabase JWT or demo tokens
router.use(authenticate);

// Observations
router.get('/', getObservations);
router.get('/graph', getKnowledgeGraph);
router.get('/:id', getObservationById);
router.patch('/:id', updateObservation);

export default router;
