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

const router = Router();

// Observations
router.get('/', getObservations);
router.get('/graph', getKnowledgeGraph);
router.get('/:id', getObservationById);
router.patch('/:id', updateObservation);

export default router;
