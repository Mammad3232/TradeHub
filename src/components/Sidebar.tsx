import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard, Package, ShoppingCart, Users, Settings,
  BarChart3, Store, ClipboardList, Shield, ChevronRight,
} from 'lucide-react';

// ─── Types ───────────────────────────────────────────────────────────────────

type Role = 'vendor' | 'admin';

interface SidebarLink {
  label: string;
  to: string;
  icon: React.ElementType;
}

interface SidebarProps {
  role: Role;
  storeName?: string;
  onSignOut?: () => void;
}

// ─── Link Definitions ────────────────────────────────────────────────────────

const vendorLinks: SidebarLink[] = [
  { label: 'Dashboard',   to: '/vendor/dashboard',  icon: LayoutDashboard },
  { label: 'My Products', to: '/vendor/products',   icon: Package },
  { label: 'Orders',      to: '/vendor/orders',     icon: ShoppingCart },
  { label: 'Analytics',   to: '/vendor/analytics',  icon: BarChart3 },
  { label: 'Store',       to: '/vendor/store',      icon: Store },
  { label: 'Settings',    to: '/vendor/settings',   icon: Settings },
];

const adminLinks: SidebarLink[] = [
  { label: 'Dashboard',  to: '/admin/dashboard',  icon: LayoutDashboard },
  { label: 'Users',      to: '/admin/users',       icon: Users },
  { label: 'Vendors',    to: '/admin/vendors',     icon: Store },
  { label: 'Orders',     to: '/admin/orders',      icon: ClipboardList },
  { label: 'Analytics',  to: '/admin/analytics',   icon: BarChart3 },
  { label: 'Permissions',to: '/admin/permissions', icon: Shield },
  { label: 'Settings',   to: '/admin/settings',    icon: Settings },
];

const roleConfig: Record<Role, { links: SidebarLink[]; label: string; color: string; accentBg: string }> = {
  vendor: {
    links: vendorLinks,
    label: 'Vendor Portal',
    color: 'text-indigo-400',
    accentBg: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20',
  },
  admin: {
    links: adminLinks,
    label: 'Admin Panel',
    color: 'text-red-400',
    accentBg: 'bg-red-500/10 text-red-400 border-red-500/20',
  },
};

// ─── Component ───────────────────────────────────────────────────────────────

export const Sidebar: React.FC<SidebarProps> = ({ role, storeName, onSignOut }) => {
  const { links, label, accentBg } = roleConfig[role];

  return (
    <aside className="w-64 flex-shrink-0 bg-slate-950 border-r border-slate-800 flex flex-col min-h-full">

      {/* ── Header ─────────────────────────────────────────────────── */}
      <div className="px-5 py-5 border-b border-slate-800/80">
        <span className={`inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest px-2.5 py-1 rounded-full border ${accentBg}`}>
          {role === 'admin' ? <Shield className="h-3 w-3" /> : <Store className="h-3 w-3" />}
          {label}
        </span>
        {storeName && (
          <p className="mt-2 text-sm font-semibold text-slate-200 truncate">{storeName}</p>
        )}
      </div>

      {/* ── Navigation ─────────────────────────────────────────────── */}
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        {links.map(({ label: linkLabel, to, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            end
            className={({ isActive }) =>
              `flex items-center justify-between gap-3 text-sm font-medium px-3.5 py-2.5 rounded-xl transition-all group ${
                isActive
                  ? role === 'admin'
                    ? 'bg-red-500/10 text-red-400 border border-red-500/15'
                    : 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/15'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60 border border-transparent'
              }`
            }
          >
            <span className="flex items-center gap-3">
              <Icon className="h-4.5 w-4.5 flex-shrink-0" />
              {linkLabel}
            </span>
            <ChevronRight className="h-3.5 w-3.5 opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
          </NavLink>
        ))}
      </nav>

      {/* ── Footer ─────────────────────────────────────────────────── */}
      <div className="px-5 py-4 border-t border-slate-800/80 flex items-center justify-between">
        <NavLink
          to={role === 'admin' ? '/admin/settings' : '/vendor/settings'}
          className="flex items-center gap-3 text-sm text-slate-500 hover:text-white transition-colors"
        >
          <Settings className="h-4 w-4" />
          <span>Settings</span>
        </NavLink>
        <button
          type="button"
          onClick={() => {
            localStorage.removeItem('vendora_user');
            localStorage.removeItem('mockUser');
            localStorage.removeItem('vendora_active_user');
            if (onSignOut) onSignOut();
            window.location.href = '/';
          }}
          className="text-xs text-rose-400 hover:text-rose-300 font-semibold cursor-pointer"
        >
          Sign Out
        </button>
      </div>
    </aside>
  );
};
