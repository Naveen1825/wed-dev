import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Loading } from '@/components/common/Loading';
import { ROUTES } from '@/constants/routes';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: ('buyer' | 'seller' | 'admin')[];
}

/**
 * Higher-Order Component for Role-Based Access Control (RBAC).
 * Handles authentication checks and role-specific redirection logic.
 */
export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, allowedRoles }) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return <Loading fullScreen={true} />;
  }

  // 1. Not Authenticated
  if (!user) {
    return <Navigate to={ROUTES.LOGIN} state={{ from: location }} replace />;
  }

  // 2. Role Check
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    // Redirect to their respective dashboards if they have their own but trying to access unauthorized one
    const redirectPath = user.role === 'admin' 
      ? ROUTES.ADMIN_DASHBOARD 
      : (user.role === 'seller' ? ROUTES.SELLER_DASHBOARD : ROUTES.USER_PROFILE);
      
    return <Navigate to={redirectPath} replace />;
  }

  // 3. Authenticated and Authorized
  return <>{children}</>;
};
