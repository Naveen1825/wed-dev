import { lazy } from 'react';
import type { RouteObject } from 'react-router-dom';

const UserProfile = lazy(() => import('@/features/user/Profile'));
const OrderDetail = lazy(() => import('@/features/user/OrderDetail'));

/**
 * Customer Portal Route Configuration.
 */
export const userRoutes: RouteObject[] = [
  {
    index: true,
    element: <UserProfile />,
  },
  {
    path: 'order/:id',
    element: <OrderDetail />,
  },
];
