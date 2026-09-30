import { Router } from 'express';
import { getCurrentUserProfile, completeOnboarding } from '../controllers/authController.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();

router.use(authenticate);

router.get('/me', getCurrentUserProfile);
router.post('/onboarding', completeOnboarding);

export default router;
