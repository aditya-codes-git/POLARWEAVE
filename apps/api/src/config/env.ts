import dotenv from 'dotenv';
import { z } from 'zod';

// Load .env if present
dotenv.config();

const envSchema = z.object({
  PORT: z.string().default('5000').transform((v) => parseInt(v, 10)),
  CLIENT_URL: z.string().default('http://localhost:5173'),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  
  // Supabase (supports service role, publishable key, or legacy anon key)
  SUPABASE_URL: z.string().optional().default(''),
  SUPABASE_SERVICE_ROLE_KEY: z.string().optional().default(''),
  SUPABASE_ANON_KEY: z.string().optional().default(''),
  SUPABASE_PUBLISHABLE_KEY: z.string().optional().default(''),
  
  // AI Engines (Gemini, Groq, and OpenRouter)
  GEMINI_API_KEY: z.string().optional().default(''),
  GROQ_API_KEY: z.string().optional().default(''),
  OPENROUTER_API_KEY: z.string().optional().default(''),
  OPENROUTER_VISION_MODEL: z.string().optional().default('openrouter/free'),
  
  // Processing limits
  MAX_UPLOAD_SIZE_MB: z.string().default('100').transform((v) => parseInt(v, 10)),
  FFMPEG_PATH: z.string().optional(),
});

export const env = envSchema.parse(process.env);

export const supabaseKey = env.SUPABASE_SERVICE_ROLE_KEY || env.SUPABASE_ANON_KEY || env.SUPABASE_PUBLISHABLE_KEY;
export const hasSupabase = Boolean(env.SUPABASE_URL && supabaseKey);
export const hasGemini = Boolean(env.GEMINI_API_KEY);
export const hasGroq = Boolean(env.GROQ_API_KEY);
export const hasOpenRouter = Boolean(env.OPENROUTER_API_KEY);
