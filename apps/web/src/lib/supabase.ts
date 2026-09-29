import { createClient, SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || '';

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey && !supabaseUrl.includes('YOUR_PROJECT'));

export const supabase: SupabaseClient | null = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

// Mock user session helper for demo mode
export interface AuthUser {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'researcher' | 'public';
  institution: string;
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
}
