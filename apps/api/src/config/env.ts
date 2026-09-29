import dotenv from 'dotenv';
import { z } from 'zod';

// Load .env if present
dotenv.config();

const envSchema = z.object({
  PORT: z.string().default('5000').transform((v) => parseInt(v, 10)),
  CLIENT_URL: z.string().default('http://localhost:5173'),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  
  // Supabase (optional for demo mode)
  SUPABASE_URL: z.string().optional().default(''),
  SUPABASE_SERVICE_ROLE_KEY: z.string().optional().default(''),
  
  // Gemini AI (optional for demo mode)
  GEMINI_API_KEY: z.string().optional().default(''),
  
  // Processing limits
  MAX_UPLOAD_SIZE_MB: z.string().default('100').transform((v) => parseInt(v, 10)),
  FFMPEG_PATH: z.string().optional(),
});

export const env = envSchema.parse(process.env);

export const hasSupabase = Boolean(env.SUPABASE_URL && env.SUPABASE_SERVICE_ROLE_KEY);
export const hasGemini = Boolean(env.GEMINI_API_KEY);
