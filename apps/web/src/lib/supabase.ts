import { createClient, SupabaseClient } from '@supabase/supabase-js';

const envObj = (typeof import.meta !== 'undefined' && (import.meta as any).env) ? (import.meta as any).env : (typeof process !== 'undefined' && process.env) ? process.env : {};
const supabaseUrl = envObj.VITE_SUPABASE_URL || '';
const supabaseAnonKey = envObj.VITE_SUPABASE_PUBLISHABLE_KEY || '';

export const isSupabaseConfigured = Boolean(
  supabaseUrl &&
  supabaseAnonKey &&
  !supabaseUrl.includes('YOUR_PROJECT')
);

export const supabase: SupabaseClient | null = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: true
      }
    })
  : null;

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'researcher' | 'public';
  institution: string;
  avatar_url?: string;
}

export const DEMO_USERS: Record<string, AuthUser> = {
  researcher: {
    id: 'usr_researcher_sharma',
    email: 'rsharma@ncpor.res.in',
    name: 'Dr. Rajesh Sharma',
    role: 'researcher',
    institution: 'National Centre for Polar and Ocean Research (NCPOR)'
  },
  admin: {
    id: 'usr_admin_bose',
    email: 'sbose@ncpor.res.in',
    name: 'Dr. Sunita Bose',
    role: 'admin',
    institution: 'Ministry of Earth Sciences (MoES)'
  },
  public: {
    id: 'usr_public_guest',
    email: 'guest@polarscience.org',
    name: 'Polar Science Explorer',
    role: 'public',
    institution: 'Public Science Community'
  }
};

export function getActiveUser(): AuthUser {
  const saved = localStorage.getItem('polarweave_user');
  if (saved) {
    try {
      return JSON.parse(saved);
    } catch {
      // fallback
    }
  }
  return DEMO_USERS.researcher;
}

export function setActiveUser(user: AuthUser) {
  localStorage.setItem('polarweave_user', JSON.stringify(user));
  localStorage.setItem('polarweave_demo_role', user.role);
}

/**
 * Initiates Google OAuth Sign-In flow with Supabase
 */
export async function signInWithGoogle(redirectTo?: string) {
  if (!supabase) {
    throw new Error('Supabase client is not configured. Please check VITE_SUPABASE_URL.');
  }

  const destination = redirectTo || `${window.location.origin}/workspace`;

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: destination,
      queryParams: {
        access_type: 'offline',
        prompt: 'select_account'
      }
    }
  });

  if (error) {
    throw error;
  }

  return data;
}

/**
 * Signs out the current user from Supabase and clears local identity
 */
export async function signOut() {
  if (supabase) {
    try {
      await supabase.auth.signOut();
    } catch (e) {
      console.warn('[POLARWEAVE] Supabase sign out exception:', e);
    }
  }
  localStorage.removeItem('polarweave_user');
  localStorage.removeItem('polarweave_demo_role');
}
