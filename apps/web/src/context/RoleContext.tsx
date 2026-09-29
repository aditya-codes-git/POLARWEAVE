import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

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

export function RoleProvider({ children }: { children: ReactNode }) {
  const [role, setRoleState] = useState<UserRole>(getInitialRole);
  const location = useLocation();
  const navigate = useNavigate();

  const user = DEMO_PROFILES[role];

  const switchRole = (newRole: UserRole) => {
    if (newRole === role) return;

    setRoleState(newRole);
    try {
      localStorage.setItem(STORAGE_KEY, newRole);
      // Synchronize legacy key for backwards compatibility
      localStorage.setItem('polarweave_user', JSON.stringify(DEMO_PROFILES[newRole]));
    } catch (e) {
      console.warn('[POLARWEAVE] Failed to save role to localStorage:', e);
    }

    // Role-based route redirection safety check (Section 11)
    const currentPath = location.pathname;

    if (newRole === 'public') {
      // Public cannot access any /workspace routes
      if (currentPath.startsWith('/workspace')) {
        navigate('/explore', { replace: true });
      }
    } else if (newRole === 'researcher') {
      // Researcher cannot access /workspace/admin/*
      if (currentPath.startsWith('/workspace/admin')) {
        navigate('/workspace', { replace: true });
      } else if (currentPath === '/explore' || currentPath === '/') {
        // Smoothly offer workspace when switching from public
        navigate('/workspace', { replace: true });
      }
    } else if (newRole === 'admin') {
      if (currentPath === '/explore' || currentPath === '/') {
        navigate('/workspace', { replace: true });
      }
    }
  };

  const canAccess = (allowedRoles: UserRole[]) => {
    return allowedRoles.includes(role);
  };

  return (
    <RoleContext.Provider value={{ role, user, switchRole, canAccess }}>
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
