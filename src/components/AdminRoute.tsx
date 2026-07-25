/**
 * AdminRoute.tsx
 * ─────────────────────────────────────────────────────────────────────────────
 * A protected route wrapper that guards all Admin-only pages.
 *
 * HOW IT WORKS:
 *   1. Accepts `currentUser` as a prop if provided by parent (e.g. App.tsx).
 *   2. Falls back to checking `localStorage` (`vendora_user`) if prop is omitted.
 *   3. If user is not logged in (!isLoggedIn) OR role !== 'Admin', pushes an
 *      "Access Restricted" toast and strictly redirects to the Home page ('/').
 *   4. Otherwise, renders `children`.
 * ─────────────────────────────────────────────────────────────────────────────
 */

import React, { useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { useShop } from '../context/ShopContext';

export interface CurrentUser {
  isLoggedIn: boolean;
  role: string;
  email?: string;
  name?: string;
}

interface AdminRouteProps {
  children: React.ReactNode;
  currentUser?: CurrentUser;
}

export const AdminRoute: React.FC<AdminRouteProps> = ({ children, currentUser: propUser }) => {
  const { pushToast } = useShop();

  const rawSession =
    localStorage.getItem('vendora_user') ||
    localStorage.getItem('mockUser') ||
    localStorage.getItem('vendora_active_user');
  const localUser: CurrentUser | null = rawSession ? JSON.parse(rawSession) : null;

  const activeUser = propUser ?? localUser;
  const hasAccess = !!activeUser?.isLoggedIn && activeUser.role === 'Admin';

  // Fire the toast once on mount when access is denied
  useEffect(() => {
    if (!hasAccess) {
      pushToast(
        '🔒 Access Restricted: You do not have permission to view this page.',
        'info',
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!hasAccess) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

export default AdminRoute;
