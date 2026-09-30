import { Router } from 'express';
import {
  generateContent,
  getOutreachList,
  getOutreachById,
  updateOutreach
} from '../controllers/outreachController.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();

router.use(authenticate);

router.post('/generate', generateContent);
router.get('/', getOutreachList);
router.get('/:id', getOutreachById);
router.patch('/:id', updateOutreach);

export default router;
