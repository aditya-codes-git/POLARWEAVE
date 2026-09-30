import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import { env } from './config/env.js';
import ingestRoutes from './routes/ingest.routes.js';
import knowledgeRoutes from './routes/knowledge.routes.js';
import evidenceRoutes from './routes/evidence.routes.js';
import reviewRoutes from './routes/review.routes.js';
import searchRoutes from './routes/search.routes.js';
import outreachRoutes from './routes/outreach.routes.js';
import expeditionsRoutes from './routes/expeditions.routes.js';
import datasetsRoutes from './routes/datasets.routes.js';
import mediaRoutes from './routes/media.routes.js';
import authRoutes from './routes/auth.routes.js';
import { getJobs, getJobById } from './controllers/ingestController.js';

const app = express();

const ALLOWED_ORIGINS = [
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  'http://localhost:5174',
  'http://127.0.0.1:5174',
  env.CLIENT_URL
].filter(Boolean);

const corsOptions: cors.CorsOptions = {
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps, curl, server-to-server)
    if (!origin) return callback(null, true);
    if (ALLOWED_ORIGINS.includes(origin)) {
      return callback(null, true);
    }
    // Check if origin matches localhost on any port during development
    if (env.NODE_ENV === 'development' && /^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin)) {
      return callback(null, true);
    }
    return callback(new Error(`CORS blocked for origin: ${origin}`));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin'],
  exposedHeaders: ['Content-Range', 'X-Content-Range'],
  maxAge: 86400
};

// Middlewares
app.use(cors(corsOptions));
app.options('*', cors(corsOptions));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Health Check
app.get('/api/health', (req: Request, res: Response) => {
  res.status(200).json({
    success: true,
    data: {
      name: 'POLARWEAVE Knowledge API',
      status: 'healthy',
      version: '1.0.0',
      timestamp: new Date().toISOString(),
      environment: env.NODE_ENV
    }
  });
});

// Processing Jobs aliases as required by API spec
app.get('/api/processing/jobs', getJobs);
app.get('/api/processing/jobs/:id', getJobById);

// Routes
app.use('/api/ingest', ingestRoutes);
app.use('/api/knowledge', knowledgeRoutes);
app.use('/api/evidence', evidenceRoutes);
app.use('/api/review', reviewRoutes);
app.use('/api/search', searchRoutes);
app.use('/api/outreach', outreachRoutes);
app.use('/api/expeditions', expeditionsRoutes);
app.use('/api/datasets', datasetsRoutes);
app.use('/api/media', mediaRoutes);
app.use('/api/auth', authRoutes);

// 404 Handler
app.use((req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    error: {
      code: 'ROUTE_NOT_FOUND',
      message: `The endpoint ${req.method} ${req.originalUrl} does not exist.`
    }
  });
});

// Centralized Error Handling Middleware (Section 55)
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  console.error('[POLARWEAVE API ERROR]:', err);
  res.status(err.status || 500).json({
    success: false,
    error: {
      code: err.code || 'INTERNAL_SERVER_ERROR',
      message: err.message || 'An unexpected server error occurred.',
      details: env.NODE_ENV === 'development' ? err.details || undefined : undefined
    }
  });
});

const server = app.listen(env.PORT, () => {
  console.log(`===================================================`);
  console.log(`POLARWEAVE API SERVER RUNNING ON PORT ${env.PORT}`);
  console.log(`Client URL Allowed: ${env.CLIENT_URL}`);
  console.log(`Health: http://localhost:${env.PORT}/api/health`);
  console.log(`===================================================`);
});

export default app;
