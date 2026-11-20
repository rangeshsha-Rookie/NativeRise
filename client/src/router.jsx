// client/src/router.jsx
import React from 'react';
import { createBrowserRouter, Navigate, useLocation } from 'react-router-dom';
import { useAuth } from './context/AuthContext';

// Layouts
import {
  CustomerLayout,
  SellerLayout,
  PartnerLayout,
  AuthLayout
} from './components/layout/RoleLayout';

// Public Pages
import HomePage from './pages/public/HomePage';
import CatalogPage from './pages/public/CatalogPage';
import ProductDetailPage from './pages/public/ProductDetailPage';
import ShopsPage from './pages/public/ShopsPage';
import ShopDetailPage from './pages/public/ShopDetailPage';
import NotFoundPage from './pages/public/NotFoundPage';

// Auth Pages
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';

// Customer Pages
import CartPage from './pages/customer/CartPage';
import CheckoutPage from './pages/customer/CheckoutPage';
import OrdersPage from './pages/customer/OrdersPage';
import OrderDetailPage from './pages/customer/OrderDetailPage';
import AccountPage from './pages/customer/AccountPage';
import AddressesPage from './pages/customer/AddressesPage';
import SupportPage from './pages/customer/SupportPage';
import TicketDetailPage from './pages/customer/TicketDetailPage';

// Seller Pages
import SellerDashboardPage from './pages/seller/SellerDashboardPage';
import SellerOrdersPage from './pages/seller/SellerOrdersPage';
import SellerOrderDetailPage from './pages/seller/SellerOrderDetailPage';
import SellerProductsPage from './pages/seller/SellerProductsPage';
import AddEditProductPage from './pages/seller/AddEditProductPage';
import WhatToSellPage from './pages/seller/WhatToSellPage';
import GrowthCoachPage from './pages/seller/GrowthCoachPage';
import SellerEarningsPage from './pages/seller/SellerEarningsPage';
import SellerReviewsPage from './pages/seller/SellerReviewsPage';
import SellerSupportPage from './pages/seller/SellerSupportPage';
import SellerTicketDetailPage from './pages/seller/SellerTicketDetailPage';
import ShopSettingsPage from './pages/seller/ShopSettingsPage';
import SellerAssistantPage from './pages/seller/SellerAssistantPage';
import SellerAccountPage from './pages/seller/SellerAccountPage';

// Partner Pages
import PartnerHomePage from './pages/partner/PartnerHomePage';
import PartnerJobsPage from './pages/partner/PartnerJobsPage';
import PartnerActivePage from './pages/partner/PartnerActivePage';
import PartnerHistoryPage from './pages/partner/PartnerHistoryPage';
import PartnerEarningsPage from './pages/partner/PartnerEarningsPage';
import PartnerProfilePage from './pages/partner/PartnerProfilePage';

/**
 * Route protection guard per Section 19.1
 */
function RequireAuth({ allowedRole, children }) {
  const { user, loading, isAuthenticated } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-cream">
        <img src="/logo.svg" alt="NativeRise" className="h-12 w-auto animate-pulse" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to={`/login?next=${encodeURIComponent(location.pathname)}`} replace />;
  }

  if (allowedRole && user.role !== allowedRole) {
    // Redirect to user role's home page
    const roleHome = user.role === 'seller' ? '/seller' : user.role === 'partner' ? '/partner' : '/';
    return <Navigate to={roleHome} replace />;
  }

  return children;
}

/**
 * Guest-only guard for auth pages (login/register)
 */
function RedirectIfAuthenticated({ children }) {
  const { user, isAuthenticated, loading } = useAuth();

  if (loading) return null;

  if (isAuthenticated && user) {
    const roleHome = user.role === 'seller' ? '/seller' : user.role === 'partner' ? '/partner' : '/';
    return <Navigate to={roleHome} replace />;
  }

  return children;
}

export const router = createBrowserRouter([
  // Public & Customer Routes (CustomerLayout)
  {
    path: '/',
    element: <CustomerLayout />,
    children: [
      { index: true, element: <HomePage /> },
      { path: 'products', element: <CatalogPage /> },
      { path: 'products/:id', element: <ProductDetailPage /> },
      { path: 'shops', element: <ShopsPage /> },
      { path: 'shops/:id', element: <ShopDetailPage /> },

      // Customer Protected Routes
      {
        path: 'cart',
        element: (
          <RequireAuth allowedRole="customer">
            <CartPage />
          </RequireAuth>
        )
      },
      {
        path: 'checkout',
        element: (
          <RequireAuth allowedRole="customer">
            <CheckoutPage />
          </RequireAuth>
        )
      },
      {
        path: 'orders',
        element: (
          <RequireAuth allowedRole="customer">
            <OrdersPage />
          </RequireAuth>
        )
      },
      {
        path: 'orders/:id',
        element: (
          <RequireAuth allowedRole="customer">
            <OrderDetailPage />
          </RequireAuth>
        )
      },
      {
        path: 'account',
        element: (
          <RequireAuth allowedRole="customer">
            <AccountPage />
          </RequireAuth>
        )
      },
      {
        path: 'account/addresses',
        element: (
          <RequireAuth allowedRole="customer">
            <AddressesPage />
          </RequireAuth>
        )
      },
      {
        path: 'support',
        element: (
          <RequireAuth allowedRole="customer">
            <SupportPage />
          </RequireAuth>
        )
      },
      {
        path: 'support/:id',
        element: (
          <RequireAuth allowedRole="customer">
            <TicketDetailPage />
          </RequireAuth>
        )
      }
    ]
  },

  // Auth Routes (AuthLayout)
  {
    element: <AuthLayout />,
    children: [
      {
        path: 'login',
        element: (
          <RedirectIfAuthenticated>
            <LoginPage />
          </RedirectIfAuthenticated>
        )
      },
      {
        path: 'register',
        element: (
          <RedirectIfAuthenticated>
            <RegisterPage />
          </RedirectIfAuthenticated>
        )
      }
    ]
  },

  // Seller Protected Routes (SellerLayout)
  {
    path: 'seller',
    element: (
      <RequireAuth allowedRole="seller">
        <SellerLayout />
      </RequireAuth>
    ),
    children: [
      { index: true, element: <SellerDashboardPage /> },
      { path: 'orders', element: <SellerOrdersPage /> },
      { path: 'orders/:id', element: <SellerOrderDetailPage /> },
      { path: 'products', element: <SellerProductsPage /> },
      { path: 'products/new', element: <AddEditProductPage /> },
      { path: 'products/:id/edit', element: <AddEditProductPage /> },
      { path: 'what-to-sell', element: <WhatToSellPage /> },
      { path: 'growth', element: <GrowthCoachPage /> },
      { path: 'earnings', element: <SellerEarningsPage /> },
      { path: 'reviews', element: <SellerReviewsPage /> },
      { path: 'support', element: <SellerSupportPage /> },
      { path: 'support/:id', element: <SellerTicketDetailPage /> },
      { path: 'shop', element: <ShopSettingsPage /> },
      { path: 'assistant', element: <SellerAssistantPage /> },
      { path: 'account', element: <SellerAccountPage /> }
    ]
  },

  // Partner Protected Routes (PartnerLayout)
  {
    path: 'partner',
    element: (
      <RequireAuth allowedRole="partner">
        <PartnerLayout />
      </RequireAuth>
    ),
    children: [
      { index: true, element: <PartnerHomePage /> },
      { path: 'jobs', element: <PartnerJobsPage /> },
      { path: 'active', element: <PartnerActivePage /> },
      { path: 'history', element: <PartnerHistoryPage /> },
      { path: 'earnings', element: <PartnerEarningsPage /> },
      { path: 'profile', element: <PartnerProfilePage /> }
    ]
  },

  // 404 Catch-all
  {
    path: '*',
    element: <NotFoundPage />
  }
]);

export default router;
