import { Router } from 'express';
import { searchKnowledge, askTheEvidence } from '../controllers/searchController.js';

const router = Router();

router.get('/', searchKnowledge);
router.post('/ask-the-evidence', askTheEvidence);
router.post('/semantic', askTheEvidence);

export default router;
