import { Router } from 'express';
import { reviewEntity } from '../controllers/reviewController.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();

// Mandatory authentication layer to resolve trusted server-side identity
router.use(authenticate);

router.post('/:entityType/:id', reviewEntity);
router.patch('/:entityType/:id', reviewEntity);

export default router;
