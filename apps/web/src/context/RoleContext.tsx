import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { supabase, signOut as supabaseSignOut } from '../lib/supabase';

export type UserRole = 'researcher' | 'admin' | 'public';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  roleLabel: string;
  roleTitle: string;
  institution: string;
  badgeLabel: string;
  avatar_url?: string;
}

export const DEMO_PROFILES: Record<UserRole, UserProfile> = {
  researcher: {
    id: 'usr_researcher_sharma',
    name: 'Dr. Rajesh Sharma',
    email: 'rsharma@ncpor.res.in',
    role: 'researcher',
    roleLabel: 'Researcher',
    roleTitle: 'Scientific Contributor',
    institution: 'National Centre for Polar and Ocean Research (NCPOR)',
    badgeLabel: 'RESEARCHER'
  },
  admin: {
    id: 'usr_admin_bose',
    name: 'Dr. Sunita Bose',
    email: 'admin@ncpor.res.in',
    role: 'admin',
    roleLabel: 'Knowledge Admin',
    roleTitle: 'NCPOR Knowledge Management',
    institution: 'Ministry of Earth Sciences (MoES)',
    badgeLabel: 'KNOWLEDGE ADMIN'
  },
  public: {
    id: 'usr_public_explorer',
    name: 'Public Explorer',
    email: 'explorer@demo.local',
    role: 'public',
    roleLabel: 'Public Explorer',
    roleTitle: 'Student / Educator',
    institution: 'Public Science Community',
    badgeLabel: 'PUBLIC EXPLORER'
  }
};

const STORAGE_KEY = 'polarweave_demo_role';

interface RoleContextType {
  role: UserRole;
  user: UserProfile;
  switchRole: (newRole: UserRole) => void;
  canAccess: (allowedRoles: UserRole[]) => boolean;
  signOutUser: () => Promise<void>;
}

const RoleContext = createContext<RoleContextType | undefined>(undefined);

function getInitialRole(): UserRole {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved === 'researcher' || saved === 'admin' || saved === 'public') {
      return saved;
    }
  } catch (e) {
    console.warn('[POLARWEAVE] Failed to read role from localStorage:', e);
  }
  return 'researcher';
}

function getInitialCustomUser(): UserProfile | null {
  try {
    const saved = localStorage.getItem('polarweave_user');
    if (saved) {
      const parsed = JSON.parse(saved);
      if (parsed?.avatar_url || parsed?.email?.includes('@gmail.com') || parsed?.id?.length > 25) {
        return parsed;
      }
    }
  } catch (e) {
    console.warn('[POLARWEAVE] Failed to read custom user from localStorage:', e);
  }
  return null;
}

export function RoleProvider({ children }: { children: ReactNode }) {
  const [role, setRoleState] = useState<UserRole>(getInitialRole);
  const [customUser, setCustomUser] = useState<UserProfile | null>(getInitialCustomUser);
  const location = useLocation();
  const navigate = useNavigate();

  // Listen for Supabase Authentication (including Google OAuth redirect callbacks)
  useEffect(() => {
    if (!supabase) return;

    // Check existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        applySupabaseSessionUser(session.user);
      }
    });

    // Listen for OAuth callbacks and state changes
    const {
      data: { subscription }
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        applySupabaseSessionUser(session.user);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const applySupabaseSessionUser = (sbUser: any) => {
    const meta = sbUser.user_metadata || {};
    const fullName =
      meta.full_name ||
      meta.name ||
      (sbUser.email ? sbUser.email.split('@')[0] : 'Polar Researcher');
    const email = sbUser.email || '';
    const avatar = meta.avatar_url || meta.picture;
    const isAdm = email.toLowerCase().includes('admin') || meta.role === 'admin';
    const assignedRole: UserRole = isAdm ? 'admin' : 'researcher';

    const profile: UserProfile = {
      id: sbUser.id,
      name: fullName,
      email,
      role: assignedRole,
      roleLabel: assignedRole === 'admin' ? 'Knowledge Admin' : 'Researcher',
      roleTitle: assignedRole === 'admin' ? 'NCPOR Knowledge Management' : 'Scientific Contributor (Google Verified)',
      institution: meta.institution || 'National Centre for Polar and Ocean Research (NCPOR)',
      badgeLabel: assignedRole === 'admin' ? 'KNOWLEDGE ADMIN' : 'RESEARCHER',
      avatar_url: avatar
    };

    setCustomUser(profile);
    setRoleState(assignedRole);
    try {
      localStorage.setItem(STORAGE_KEY, assignedRole);
      localStorage.setItem('polarweave_user', JSON.stringify(profile));
    } catch (e) {
      console.warn('[POLARWEAVE] Storage sync exception:', e);
    }
  };

  const user = customUser && customUser.role === role
    ? customUser
    : DEMO_PROFILES[role];

  const switchRole = (newRole: UserRole) => {
    if (newRole === role) return;

    setRoleState(newRole);
    setCustomUser(null);

    try {
      localStorage.setItem(STORAGE_KEY, newRole);
      localStorage.setItem('polarweave_user', JSON.stringify(DEMO_PROFILES[newRole]));
    } catch (e) {
      console.warn('[POLARWEAVE] Failed to save role to localStorage:', e);
    }

    const currentPath = location.pathname;

    if (newRole === 'public') {
      if (currentPath.startsWith('/workspace')) {
        navigate('/explore', { replace: true });
      }
    } else if (newRole === 'researcher') {
      if (currentPath.startsWith('/workspace/admin')) {
        navigate('/workspace', { replace: true });
      } else if (currentPath === '/explore' || currentPath === '/') {
        navigate('/workspace', { replace: true });
      }
    } else if (newRole === 'admin') {
      if (currentPath === '/explore' || currentPath === '/') {
        navigate('/workspace', { replace: true });
      }
    }
  };

  const signOutUser = async () => {
    await supabaseSignOut();
    setCustomUser(null);
    setRoleState('researcher');
    navigate('/login');
  };

  const canAccess = (allowedRoles: UserRole[]) => {
    return allowedRoles.includes(role);
  };

  return (
    <RoleContext.Provider value={{ role, user, switchRole, canAccess, signOutUser }}>
      {children}
    </RoleContext.Provider>
  );
}

export function useRole() {
  const context = useContext(RoleContext);
  if (!context) {
    throw new Error('useRole must be used within a RoleProvider');
  }
  return context;
}
