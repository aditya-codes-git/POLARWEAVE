import { Router } from 'express';
import multer from 'multer';
import { uploadFiles, processFiles, getJobs, getJobById } from '../controllers/ingestController.js';

const router = Router();
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 100 * 1024 * 1024 } // 100 MB limit
});

router.post('/upload', upload.array('files'), uploadFiles);
router.post('/process', upload.array('files'), processFiles);
router.get('/jobs', getJobs);
router.get('/jobs/:id', getJobById);

export default router;
