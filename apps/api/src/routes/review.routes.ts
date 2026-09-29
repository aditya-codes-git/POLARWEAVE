import { Router } from 'express';
import { reviewEntity } from '../controllers/reviewController.js';

const router = Router();

router.post('/:entityType/:id', reviewEntity);
router.patch('/:entityType/:id', reviewEntity);

export default router;
