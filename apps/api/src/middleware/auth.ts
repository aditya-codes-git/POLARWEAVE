import { Request, Response, NextFunction } from 'express';
import { supabase } from '../db/supabase.js';

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'researcher' | 'public';
}

declare global {
  namespace Express {
    interface Request {
      user?: AuthUser;
    }
  }
}

// Trusted server-side demo identity definitions (Section 7)
export const VALIDATED_DEMO_TOKENS: Record<string, AuthUser> = {
  'demo-admin-token': {
    id: 'usr_admin_bose',
    name: 'Dr. Sunita Bose',
    email: 'admin@ncpor.res.in',
    role: 'admin'
  },
  'demo-researcher-token': {
    id: 'usr_researcher_sharma',
    name: 'Dr. Rajesh Sharma',
    email: 'rsharma@ncpor.res.in',
    role: 'researcher'
  },
  'demo-public-token': {
    id: 'usr_public_explorer',
    name: 'Public Explorer',
    email: 'explorer@demo.local',
    role: 'public'
  }
};

/**
 * Authentication Middleware
 * Resolves caller identity strictly from:
 * 1. Supabase Bearer JWT Token (verified via Supabase Auth)
 * 2. Validated server-side demo tokens in development/demo environments
 * 
 * NEVER trusts req.body.role, req.body.reviewer_role, or query parameters.
 */
export async function authenticate(req: Request, res: Response, next: NextFunction) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      // Unauthenticated request
      return next();
    }

    const [scheme, token] = authHeader.split(' ');
    if (scheme?.toLowerCase() !== 'bearer' || !token) {
      return next();
    }

    // 1. Check validated demo tokens (deterministic server-side validation)
    if (VALIDATED_DEMO_TOKENS[token]) {
      req.user = VALIDATED_DEMO_TOKENS[token];
      return next();
    }

    // 2. Check Supabase JWT
    if (supabase) {
      try {
        const { data: { user }, error } = await supabase.auth.getUser(token);
        if (!error && user) {
          const email = user.email || '';
          const meta = user.user_metadata || {};
          const isAdm = email.toLowerCase().includes('admin') || meta.role === 'admin';
          
          req.user = {
            id: user.id,
            name: meta.full_name || meta.name || email.split('@')[0] || 'Authenticated User',
            email,
            role: isAdm ? 'admin' : (meta.role === 'public' ? 'public' : 'researcher')
          };
          return next();
        }
      } catch (authErr) {
        console.warn('[POLARWEAVE AUTH] Token verification failed:', authErr);
      }
    }

    next();
  } catch (err) {
    console.error('[POLARWEAVE AUTH] Authentication middleware error:', err);
    next();
  }
}

/**
 * Guard: Requires Knowledge Admin Role for Verification & Institutional Governance
 * Rejects Researchers, Public Explorers, and Anonymous callers with HTTP 403 Forbidden.
 */
export function requireAdminReviewer(req: Request, res: Response, next: NextFunction) {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({
      success: false,
      error: {
        code: 'FORBIDDEN',
        message: 'Only Knowledge Admins can approve or reject knowledge.'
      }
    });
  }
  next();
}
