import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useRole, UserRole } from '../context/RoleContext';

interface ProtectedRouteProps {
  allowedRoles: UserRole[];
  redirectPath?: string;
  children?: React.ReactNode;
}

export function ProtectedRoute({ allowedRoles, redirectPath, children }: ProtectedRouteProps) {
  const { role } = useRole();
  const location = useLocation();

  if (!allowedRoles.includes(role)) {
    // Safe intelligent redirect based on role
    let target = redirectPath;
    if (!target) {
      if (role === 'public') {
        target = '/explore';
      } else {
        target = '/workspace';
      }
    }

    console.warn(`[POLARWEAVE RBAC] Access denied for role "${role}" at "${location.pathname}". Redirecting to "${target}".`);
    return <Navigate to={target} replace state={{ from: location }} />;
  }

  return children ? <>{children}</> : <Outlet />;
}
