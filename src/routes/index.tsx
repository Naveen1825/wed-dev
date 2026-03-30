import React, { lazy, Suspense } from 'react';
import { createBrowserRouter, RouterProvider, Navigate } from 'react-router-dom';
import { Loading } from '@/components/common/Loading';
import { ProtectedRoute } from '@/routes/ProtectedRoute';
import { ROUTES } from '@/constants/routes';

// --- Specialized Route Configs ---
import { adminRoutes } from './admin.routes';
import { sellerRoutes } from './seller.routes';
import { userRoutes } from './user.routes';
import { publicRoutes } from './public.routes';

// --- Portal Layouts ---
const RootLayout = lazy(() => import('@/layouts/RootLayout'));
const AdminLayout = lazy(() => import('@/layouts/AdminLayout'));
const SellerLayout = lazy(() => import('@/layouts/SellerLayout'));
const SellerOnboarding = lazy(() => import('@/features/seller/SellerOnboarding'));
const BuyerOnboarding = lazy(() => import('@/features/user/BuyerOnboarding'));
const UserLayout = lazy(() => import('@/layouts/UserLayout'));
const Checkout = lazy(() => import('@/features/user/Checkout'));

/**
 * Platform routing engine.
 * Orchestrates Role-Based Access Control (RBAC) and performance-optimized code splitting 
 * across distinct Admin, Seller, and Customer portals through specialized route modules.
 */
const router = createBrowserRouter([
  // 1. --- Public Marketplace Portal ---
  {
    path: '/',
    element: (
      <Suspense fallback={<Loading fullScreen={true} />}>
        <RootLayout />
      </Suspense>
    ),
    children: publicRoutes,
  },
  
  // 2. --- Admin Experience (Strict Access) ---
  {
    path: '/admin',
    element: (
      <ProtectedRoute allowedRoles={['admin']}>
        <Suspense fallback={<Loading />}>
          <AdminLayout />
        </Suspense>
      </ProtectedRoute>
    ),
    children: adminRoutes,
  },

  // 3. --- Seller Experience (Merchant Dashboard) ---
  {
    path: '/seller-profile',
    element: (
      <ProtectedRoute allowedRoles={['seller']}>
        <Suspense fallback={<Loading />}>
          <SellerLayout />
        </Suspense>
      </ProtectedRoute>
    ),
    children: sellerRoutes,
  },

  // 4. --- Seller Onboarding Identity (Strict Restriction intercept) ---
  {
    path: '/seller-onboarding',
    element: (
      <ProtectedRoute allowedRoles={['seller']}>
        <Suspense fallback={<Loading />}>
          <RootLayout />
        </Suspense>
      </ProtectedRoute>
    ),
    children: [
      { index: true, element: <SellerOnboarding /> }
    ]
  },

  // 4a. --- Buyer Onboarding Identity (Strict Restriction intercept) ---
  {
    path: '/buyer-onboarding',
    element: (
      <ProtectedRoute allowedRoles={['buyer']}>
        <Suspense fallback={<Loading />}>
          <RootLayout />
        </Suspense>
      </ProtectedRoute>
    ),
    children: [
      { index: true, element: <BuyerOnboarding /> }
    ]
  },

  // 5. --- Customer Experience (Account Management) ---
  {
    path: '/profile',
    element: (
      <ProtectedRoute allowedRoles={['buyer']}>
        <Suspense fallback={<Loading />}>
          <UserLayout />
        </Suspense>
      </ProtectedRoute>
    ),
    children: userRoutes,
  },

  // 5. --- Checkout Portal (Secure Acquisition) ---
  {
    path: ROUTES.CHECKOUT,
    element: (
      <ProtectedRoute allowedRoles={['buyer', 'seller', 'admin']}>
        <Suspense fallback={<Loading fullScreen={true} />}>
          <Checkout />
        </Suspense>
      </ProtectedRoute>
    ),
  },

  // --- Fallback System ---
  {
    path: '*',
    element: <Navigate to="/" replace />,
  },
]);

export const AppRouter: React.FC = () => {
  return <RouterProvider router={router} />;
};
