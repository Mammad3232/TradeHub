/**
 * VendorRoute.tsx
 * ─────────────────────────────────────────────────────────────────────────────
 * A protected route wrapper that guards all Vendor-only pages.
 *
 * ALLOWED ROLES:  'Vendor' | 'Admin' | 'Seller'  (Admin can access anything)
 * ON DENY:        Pushes a toast notification and redirects to '/' with replace.
 * ─────────────────────────────────────────────────────────────────────────────
 */

import React, { useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { useShop } from '../context/ShopContext';

export interface VendorRouteUser {
  isLoggedIn: boolean;
  role: string;
  email?: string;
  name?: string;
}

interface VendorRouteProps {
  children: React.ReactNode;
  currentUser?: VendorRouteUser;
}

/** Roles that are permitted to access vendor-scoped routes */
const VENDOR_ROLES = new Set(['Vendor', 'Admin', 'Seller']);

export const VendorRoute: React.FC<VendorRouteProps> = ({ children, currentUser: propUser }) => {
  const { pushToast } = useShop();

  // Prefer the prop value (passed from App); fall back to localStorage
  const rawSession =
    localStorage.getItem('vendora_user') ||
    localStorage.getItem('mockUser') ||
    localStorage.getItem('vendora_active_user');
  const localUser: VendorRouteUser | null = rawSession ? JSON.parse(rawSession) : null;
  const activeUser = propUser ?? localUser;

  const hasAccess =
    !!activeUser?.isLoggedIn && VENDOR_ROLES.has(activeUser.role ?? '');

  // Fire the toast exactly once when access is denied — must be in a useEffect
  // because we cannot call hooks conditionally, and we must not push during render.
  useEffect(() => {
    if (!hasAccess) {
      pushToast(
        '🔒 Access Restricted: You do not have permission to view this page.',
        'info',
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // run once on mount (deny path only renders once before redirect)

  if (!hasAccess) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

export default VendorRoute;
