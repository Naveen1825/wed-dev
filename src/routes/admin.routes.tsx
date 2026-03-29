import { lazy } from 'react';
import type { RouteObject } from 'react-router-dom';

const AdminDashboard = lazy(() => import('@/features/admin/AdminDashboard'));

/**
 * Admin Portal Route Configuration.
 */
export const adminRoutes: RouteObject[] = [
  {
    index: true,
    element: <AdminDashboard />,
  },
];
