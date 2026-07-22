/**
 * AdminRoute.tsx
 * ─────────────────────────────────────────────────────────────────────────────
 * A protected route wrapper that guards all Admin-only pages.
 *
 * HOW IT WORKS:
 *   1. Accepts `currentUser` as a prop if provided by parent (e.g. App.tsx).
 *   2. Falls back to checking `localStorage` (`vendora_active_user`) if prop is omitted.
 *   3. If user is not logged in (!isLoggedIn) OR role !== 'Admin', strictly
 *      redirects to the Home page ('/') with `replace`.
 *   4. Otherwise, renders `children`.
 * ─────────────────────────────────────────────────────────────────────────────
 */

import React from 'react';
import { Navigate } from 'react-router-dom';

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
  const rawSession = localStorage.getItem('vendora_user') || localStorage.getItem('mockUser') || localStorage.getItem('vendora_active_user');
  const localUser: CurrentUser | null = rawSession ? JSON.parse(rawSession) : null;

  const activeUser = propUser ?? localUser;

  // Fallback debug log to trace permission evaluation
  console.log("AdminRoute Check:", activeUser);

  // Guard: If not logged in OR role is not 'Admin', redirect to '/'
  if (!activeUser?.isLoggedIn || activeUser.role !== 'Admin') {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

export default AdminRoute;
