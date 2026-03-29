import { lazy } from 'react';
import type { RouteObject } from 'react-router-dom';

const SellerDashboard = lazy(() => import('@/features/seller/SellerDashboard'));

/**
 * Merchant Portal Route Configuration.
 */
export const sellerRoutes: RouteObject[] = [
  {
    index: true,
    element: <SellerDashboard />,
  },
];
