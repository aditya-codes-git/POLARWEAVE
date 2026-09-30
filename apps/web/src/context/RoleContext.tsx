import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { supabase, signOut as supabaseSignOut } from '../lib/supabase';
import { getCurrentUserProfile } from '../lib/api';

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
  organization?: string;
  designation?: string;
  country?: string;
  research_domain?: string;
  affiliation?: string;
  explorer_interest?: string;
  onboarding_completed?: boolean;
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
    badgeLabel: 'RESEARCHER',
    onboarding_completed: true
  },
  admin: {
    id: 'usr_admin_bose',
    name: 'Dr. Sunita Bose',
    email: 'admin@ncpor.res.in',
    role: 'admin',
    roleLabel: 'Knowledge Admin',
    roleTitle: 'NCPOR Knowledge Management',
    institution: 'Ministry of Earth Sciences (MoES)',
    badgeLabel: 'KNOWLEDGE ADMIN',
    onboarding_completed: true
  },
  public: {
    id: 'usr_public_explorer',
    name: 'Public Explorer',
    email: 'explorer@demo.local',
    role: 'public',
    roleLabel: 'Public Explorer',
    roleTitle: 'Student / Educator',
    institution: 'Public Science Community',
    badgeLabel: 'PUBLIC EXPLORER',
    onboarding_completed: true
  }
};

const STORAGE_KEY = 'polarweave_demo_role';

interface RoleContextType {
  role: UserRole;
  user: UserProfile;
  switchRole: (newRole: UserRole) => void;
  canAccess: (allowedRoles: UserRole[]) => boolean;
  signOutUser: () => Promise<void>;
  completeOnboarding: (savedProfile: any, role: 'researcher' | 'public') => Promise<void>;
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

  const applySupabaseSessionUser = async (sbUser: any) => {
    const meta = sbUser.user_metadata || {};
    const fullName =
      meta.full_name ||
      meta.name ||
      (sbUser.email ? sbUser.email.split('@')[0] : 'Polar Researcher');
    const email = sbUser.email || '';
    const avatar = meta.avatar_url || meta.picture;
    const isAdm = email.toLowerCase().includes('admin') || meta.role === 'admin';
    const initialRole: UserRole = isAdm ? 'admin' : 'researcher';

    let onboardingCompleted = isAdm; // Admin accounts skip onboarding by default
    let resolvedRole: UserRole = initialRole;
    let institution = meta.institution || 'National Centre for Polar and Ocean Research (NCPOR)';
    let designation = '';
    let country = '';

    // Check if onboarding is already completed from local customUser or stored polarweave_user
    const localUser = customUser || getInitialCustomUser();
    if (localUser?.onboarding_completed) {
      onboardingCompleted = true;
      if (localUser.role && localUser.role !== 'admin') {
        resolvedRole = localUser.role;
      }
      if (localUser.institution || localUser.organization) {
        institution = localUser.organization || localUser.institution;
      }
      if (localUser.designation) designation = localUser.designation;
      if (localUser.country) country = localUser.country;
    }

    // Check backend persisted profile
    try {
      const backendProfile = await getCurrentUserProfile();
      if (backendProfile) {
        if (backendProfile.onboarding_completed) {
          onboardingCompleted = true;
        }
        if (backendProfile.role && backendProfile.role !== 'admin') {
          resolvedRole = backendProfile.role as UserRole;
        }
        if (backendProfile.organization || backendProfile.institution) {
          institution = backendProfile.organization || backendProfile.institution;
        }
        if (backendProfile.designation) {
          designation = backendProfile.designation;
        }
        if (backendProfile.country) {
          country = backendProfile.country;
        }
      }
    } catch (e) {
      console.warn('[POLARWEAVE] Failed to fetch backend profile during session hydration:', e);
    }

    const profile: UserProfile = {
      id: sbUser.id,
      name: fullName,
      email,
      role: resolvedRole,
      roleLabel:
        resolvedRole === 'admin'
          ? 'Knowledge Admin'
          : resolvedRole === 'public'
          ? 'Public Explorer'
          : 'Researcher',
      roleTitle:
        resolvedRole === 'admin'
          ? 'NCPOR Knowledge Management'
          : resolvedRole === 'public'
          ? 'Public Discovery'
          : 'Scientific Contributor',
      institution,
      designation,
      country,
      badgeLabel:
        resolvedRole === 'admin'
          ? 'KNOWLEDGE ADMIN'
          : resolvedRole === 'public'
          ? 'PUBLIC EXPLORER'
          : 'RESEARCHER',
      avatar_url: avatar,
      onboarding_completed: onboardingCompleted
    };

    setCustomUser(profile);
    setRoleState(resolvedRole);

    try {
      localStorage.setItem(STORAGE_KEY, resolvedRole);
      localStorage.setItem('polarweave_user', JSON.stringify(profile));
      localStorage.setItem('polarweave_demo_role', resolvedRole);
    } catch (e) {
      console.warn('[POLARWEAVE] Storage sync exception:', e);
    }

    // Routing check:
    // Only route if not currently on /auth/callback (which performs dedicated resolution)
    if (window.location.pathname !== '/auth/callback') {
      if (!onboardingCompleted && !isAdm) {
        if (window.location.pathname !== '/onboarding') {
          navigate('/onboarding', { replace: true });
        }
      } else if (onboardingCompleted && window.location.pathname === '/onboarding') {
        const target = resolvedRole === 'public' ? '/explore' : '/workspace';
        navigate(target, { replace: true });
      }
    }
  };

  const completeOnboarding = async (savedProfile: any, newRole: 'researcher' | 'public') => {
    const updatedProfile: UserProfile = {
      id: savedProfile.id || savedProfile.user_id || customUser?.id || 'usr_google_user',
      name: savedProfile.full_name || customUser?.name || 'Researcher',
      email: savedProfile.email || customUser?.email || '',
      role: newRole,
      roleLabel: newRole === 'researcher' ? 'Researcher' : 'Public Explorer',
      roleTitle: newRole === 'researcher' ? 'Scientific Contributor' : 'Public Discovery',
      institution: savedProfile.organization || customUser?.institution || '',
      designation: savedProfile.designation || '',
      country: savedProfile.country || '',
      badgeLabel: newRole === 'researcher' ? 'RESEARCHER' : 'PUBLIC EXPLORER',
      avatar_url: customUser?.avatar_url,
      organization: savedProfile.organization,
      research_domain: savedProfile.research_domain,
      affiliation: savedProfile.affiliation,
      explorer_interest: savedProfile.explorer_interest,
      onboarding_completed: true
    };

    setCustomUser(updatedProfile);
    setRoleState(newRole);

    try {
      localStorage.setItem(STORAGE_KEY, newRole);
      localStorage.setItem('polarweave_user', JSON.stringify(updatedProfile));
      localStorage.setItem('polarweave_demo_role', newRole);
    } catch (e) {
      console.warn('[POLARWEAVE] Failed to save updated profile to localStorage:', e);
    }
  };

  const user = customUser && customUser.role === role
    ? customUser
    : DEMO_PROFILES[role];

  const switchRole = (newRole: UserRole) => {
    if (newRole === role) return;

    setRoleState(newRole);
    setCustomUser(null);

    const token = newRole === 'admin'
      ? 'demo-admin-token'
      : newRole === 'public'
      ? 'demo-public-token'
      : 'demo-researcher-token';

    try {
      localStorage.setItem(STORAGE_KEY, newRole);
      localStorage.setItem('polarweave_user', JSON.stringify(DEMO_PROFILES[newRole]));
      localStorage.setItem('polarweave_auth_token', token);
      localStorage.setItem('polarweave_session', JSON.stringify({
        role: newRole,
        user: DEMO_PROFILES[newRole],
        token
      }));
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
      } else if (currentPath.startsWith('/explore') || currentPath === '/') {
        navigate('/workspace', { replace: true });
      }
    } else if (newRole === 'admin') {
      if (currentPath.startsWith('/explore') || currentPath === '/') {
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
    <RoleContext.Provider value={{ role, user, switchRole, canAccess, signOutUser, completeOnboarding }}>
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
