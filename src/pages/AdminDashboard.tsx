import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
} from 'chart.js';
import type { ChartOptions, ChartData } from 'chart.js';
import { Doughnut } from 'react-chartjs-2';
import {
  DollarSign,
  ShieldAlert,
  Store,
  Users as UsersIcon,
  CheckCircle,
  Ban,
  Tag,
  Package,
  Pencil,
  Trash2,
  Plus,
  LayoutDashboard,
  ClipboardList,
  BarChart3,
  Settings as SettingsIcon,
  Shield,
} from 'lucide-react';

ChartJS.register(ArcElement, Tooltip, Legend);

// ── Types ──────────────────────────────────────────────────────────────────────

interface PendingVendor {
  id: number;
  name: string;
  email: string;
  category: string;
}

interface UserItem {
  id: number;
  name: string;
  email: string;
  role: 'Admin' | 'Vendor' | 'Customer';
  joined: string;
  orders: number;
  status: 'Active' | 'Suspended';
}

interface Brand {
  id: number;
  name: string;
  category: string;
  productCount: number;
  status: 'Active' | 'Suspended';
  initials: string;
  color: string;
}

interface Product {
  id: number;
  name: string;
  price: number;
  stock: number;
  vendor: string;
  category: string;
  status: 'Active' | 'Out of Stock' | 'Draft';
}

// ── Initial Mock Data ──────────────────────────────────────────────────────────

const initialPending: PendingVendor[] = [
  { id: 1, name: 'Baku Tech Hub',       email: 'info@bakutech.az',   category: 'Electronics' },
  { id: 2, name: 'Saray Boutique',      email: 'saray@boutique.com', category: 'Fashion' },
  { id: 3, name: 'Caspian Art Gallery', email: 'caspian@art.com',    category: 'Home Decor' },
];

const initialMockUsers: UserItem[] = [
  { id: 1, name: 'Mammad Aliyev',  email: 'admin@vendora.store',  role: 'Admin',    joined: 'Jan 12, 2025', orders: 0,  status: 'Active' },
  { id: 2, name: 'Leyla Hasanova',  email: 'buyer@vendora.store',  role: 'Customer', joined: 'Feb 3, 2025',  orders: 14, status: 'Active' },
  { id: 3, name: 'Nicat Mammadov',  email: 'nicat@shop.az',        role: 'Vendor',   joined: 'Mar 19, 2025', orders: 0,  status: 'Active' },
  { id: 4, name: 'Aytac Rzayeva',   email: 'aytac@domain.com',     role: 'Customer', joined: 'Apr 7, 2025',  orders: 3,  status: 'Suspended' },
  { id: 5, name: 'Rashad Guliyev',  email: 'rashad@techbaku.az',   role: 'Vendor',   joined: 'May 22, 2025', orders: 0,  status: 'Active' },
];

const initialBrands: Brand[] = [
  { id: 1, name: 'SoundCore',    category: 'Electronics', productCount: 48, status: 'Active',    initials: 'SC', color: '#6366f1' },
  { id: 2, name: 'ArcticPro',   category: 'Electronics', productCount: 31, status: 'Active',    initials: 'AP', color: '#a855f7' },
  { id: 3, name: 'LuxeWear',    category: 'Fashion',     productCount: 94, status: 'Active',    initials: 'LW', color: '#ec4899' },
  { id: 4, name: 'TerraHome',   category: 'Home Decor',  productCount: 22, status: 'Suspended', initials: 'TH', color: '#f59e0b' },
  { id: 5, name: 'VeloGear',    category: 'Sports',      productCount: 57, status: 'Active',    initials: 'VG', color: '#10b981' },
];

const initialProducts: Product[] = [
  { id: 1, name: 'Aether Noise-Cancelling Headphones', price: 299.99, stock: 184, vendor: 'SoundCore',  category: 'Electronics', status: 'Active'       },
  { id: 2, name: 'ArcticPro Mechanical Keyboard',      price: 149.00, stock: 0,   vendor: 'ArcticPro',  category: 'Electronics', status: 'Out of Stock'  },
  { id: 3, name: 'LuxeWear Urban Hoodie - Slate Grey', price: 89.95,  stock: 412, vendor: 'LuxeWear',   category: 'Fashion',     status: 'Active'       },
  { id: 4, name: 'TerraHome Ambient Lamp Set',          price: 59.50,  stock: 0,   vendor: 'TerraHome',  category: 'Home Decor',  status: 'Draft'        },
  { id: 5, name: 'VeloGear Carbon Fibre Water Bottle',  price: 34.99,  stock: 920, vendor: 'VeloGear',   category: 'Sports',      status: 'Active'       },
];

type StatusVariant = 'Active' | 'Suspended' | 'Out of Stock' | 'Draft';

const statusBadge = (status: StatusVariant) => {
  const map: Record<StatusVariant, string> = {
    'Active':       'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    'Suspended':    'bg-red-500/10     text-red-400     border-red-500/20',
    'Out of Stock': 'bg-amber-500/10   text-amber-400   border-amber-500/20',
    'Draft':        'bg-slate-700/50   text-slate-400   border-slate-700',
  };
  return `inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${map[status]}`;
};

// ── Tab definitions ────────────────────────────────────────────────────────────

type ActiveTab = 'dashboard' | 'users' | 'brands' | 'vendors' | 'products' | 'orders' | 'analytics' | 'permissions' | 'settings';

const tabs: { id: ActiveTab; label: string; icon: React.ElementType }[] = [
  { id: 'dashboard',   label: 'Dashboard',   icon: LayoutDashboard },
  { id: 'users',       label: 'Users',       icon: UsersIcon       },
  { id: 'brands',      label: 'Brands',      icon: Tag             },
  { id: 'vendors',     label: 'Vendors',     icon: Store           },
  { id: 'products',    label: 'Products',    icon: Package         },
  { id: 'orders',      label: 'Orders',      icon: ClipboardList   },
  { id: 'analytics',   label: 'Analytics',   icon: BarChart3       },
  { id: 'permissions', label: 'Permissions', icon: Shield          },
  { id: 'settings',    label: 'Settings',    icon: SettingsIcon    },
];

export const AdminDashboard: React.FC = () => {
  const { tab: urlTab } = useParams<{ tab?: string }>();
  const navigate = useNavigate();

  // Internal tab state, initialized from URL parameter or default to 'users'
  const [activeTab, setActiveTab] = useState<ActiveTab>(() => {
    if (urlTab && tabs.some((t) => t.id === urlTab)) {
      return urlTab as ActiveTab;
    }
    return 'users';
  });

  // Sync internal state when URL changes
  useEffect(() => {
    if (urlTab && tabs.some((t) => t.id === urlTab)) {
      setActiveTab(urlTab as ActiveTab);
    }
  }, [urlTab]);

  // Tab switch handler that updates both state and URL gracefully
  const handleTabChange = (newTab: ActiveTab) => {
    setActiveTab(newTab);
    navigate(`/admin/${newTab}`, { replace: true });
  };

  // Interactive States
  const [pendingVendors, setPendingVendors] = useState<PendingVendor[]>(initialPending);
  const [users, setUsers]                   = useState<UserItem[]>(initialMockUsers);
  const [brands, setBrands]                 = useState<Brand[]>(initialBrands);
  const [products, setProducts]             = useState<Product[]>(initialProducts);

  // ── Action Handlers ──────────────────────────────────────────────────────────

  const handleVendorAction = (id: number, _action: 'approve' | 'reject') => {
    setPendingVendors((prev) => prev.filter((v) => v.id !== id));
  };

  // Interactive User Actions
  const handleDeleteUser = (id: number) => {
    if (window.confirm('Are you sure you want to delete/suspend this user?')) {
      setUsers((prev) => prev.filter((u) => u.id !== id));
    }
  };

  const handleRoleChange = (id: number, newRole: 'Admin' | 'Vendor' | 'Customer') => {
    setUsers((prev) =>
      prev.map((u) => (u.id === id ? { ...u, role: newRole } : u))
    );
  };

  const handleDeleteBrand = (id: number) => {
    if (window.confirm('Delete this brand?')) {
      setBrands((prev) => prev.filter((b) => b.id !== id));
    }
  };

  const handleDeleteProduct = (id: number) => {
    if (window.confirm('Delete this product?')) {
      setProducts((prev) => prev.filter((p) => p.id !== id));
    }
  };

  // ── Chart Configs ────────────────────────────────────────────────────────────

  const chartData: ChartData<'doughnut'> = {
    labels: ['Electronics', 'Accessories', 'Bags', 'Home Decor', 'Beverages'],
    datasets: [
      {
        data: [45, 20, 15, 12, 8],
        backgroundColor: ['#6366f1', '#a855f7', '#10b981', '#f59e0b', '#06b6d4'],
        borderWidth: 1,
        borderColor: '#0f172a',
      },
    ],
  };

  const chartOptions: ChartOptions<'doughnut'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'right',
        labels: { color: '#94a3b8', boxWidth: 12, font: { size: 11 } },
      },
      tooltip: {
        backgroundColor: '#0f172a',
        titleColor: '#94a3b8',
        bodyColor: '#f8fafc',
        borderColor: '#334155',
        borderWidth: 1,
        padding: 10,
      },
    },
  };

  const thClass = 'px-5 py-4 text-left text-xs font-bold text-slate-400 uppercase tracking-wider';
  const tdClass = 'px-5 py-4 text-sm text-slate-300 align-middle';

  return (
    <div className="p-6 sm:p-10 space-y-8 text-left">

      {/* ── Page Header ── */}
      <div className="flex items-center space-x-3">
        <div className="bg-red-500/10 p-2.5 rounded-xl border border-red-500/25">
          <ShieldAlert className="h-6 w-6 text-red-400" />
        </div>
        <div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">Admin Panel</h1>
          <p className="text-sm text-slate-400 mt-1">Platform monitoring, user permissions, and store control.</p>
        </div>
      </div>

      {/* ── Internal Tab Navigation ── */}
      <div className="flex items-center gap-1.5 bg-slate-900 border border-slate-800 rounded-2xl p-1.5 overflow-x-auto scrollbar-none">
        {tabs.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            type="button"
            onClick={() => handleTabChange(id)}
            className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
              activeTab === id
                ? 'bg-red-600 text-white shadow-md shadow-red-600/20'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Icon className="w-3.5 h-3.5" />
            {label}
          </button>
        ))}
      </div>

      {/* ════════════════════════ DASHBOARD / OVERVIEW TAB ════════════════════════ */}
      {(activeTab === 'dashboard' || activeTab === ('overview' as ActiveTab)) && (
        <div className="space-y-8 animate-in fade-in duration-200">
          {/* KPI Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl flex items-center justify-between shadow-lg">
              <div className="space-y-1.5">
                <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Total Revenue</span>
                <p className="text-2xl font-bold text-white">$142,850.00</p>
                <span className="text-xs text-emerald-400 font-semibold">+18.2% Platform Fees</span>
              </div>
              <div className="bg-emerald-500/10 p-3.5 rounded-xl border border-emerald-500/20 text-emerald-400">
                <DollarSign className="h-6 w-6" />
              </div>
            </div>

            <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl flex items-center justify-between shadow-lg">
              <div className="space-y-1.5">
                <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Active Vendors</span>
                <p className="text-2xl font-bold text-white">342</p>
                <span className="text-xs text-indigo-400 font-semibold">+5 approved today</span>
              </div>
              <div className="bg-indigo-500/10 p-3.5 rounded-xl border border-indigo-500/20 text-indigo-400">
                <Store className="h-6 w-6" />
              </div>
            </div>

            <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl flex items-center justify-between shadow-lg">
              <div className="space-y-1.5">
                <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Active Customers</span>
                <p className="text-2xl font-bold text-white">12,480</p>
                <span className="text-xs text-slate-500">2,410 active sessions</span>
              </div>
              <div className="bg-purple-500/10 p-3.5 rounded-xl border border-purple-500/20 text-purple-400">
                <UsersIcon className="h-6 w-6" />
              </div>
            </div>

            <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl flex items-center justify-between shadow-lg">
              <div className="space-y-1.5">
                <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Pending Approvals</span>
                <p className="text-2xl font-bold text-white">{pendingVendors.length}</p>
                <span className="text-xs text-amber-400 font-semibold">Requires review actions</span>
              </div>
              <div className="bg-amber-500/10 p-3.5 rounded-xl border border-amber-500/20 text-amber-400">
                <ShieldAlert className="h-6 w-6" />
              </div>
            </div>
          </div>

          {/* Chart + Pending Vendors */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="bg-slate-900 border border-slate-800 p-6 rounded-3xl shadow-xl space-y-4 lg:col-span-1">
              <div>
                <h2 className="text-lg font-bold text-white">Category Share</h2>
                <p className="text-xs text-slate-500 mt-0.5">Platform sales percentage by department.</p>
              </div>
              <div className="h-64 relative flex items-center justify-center">
                <Doughnut data={chartData} options={chartOptions} />
              </div>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-xl lg:col-span-2">
              <div className="px-6 py-5 border-b border-slate-800 flex justify-between items-center">
                <h2 className="text-lg font-bold text-white">Pending Vendor Applications</h2>
                <span className="text-xs text-slate-400 font-semibold">{pendingVendors.length} applications</span>
              </div>

              {pendingVendors.length === 0 ? (
                <div className="p-12 text-center text-slate-500">
                  <p className="text-sm">No pending applications at this time.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-950/40 text-xs text-slate-400 uppercase tracking-wider border-b border-slate-800">
                        <th className="px-6 py-4">Vendor Info</th>
                        <th className="px-6 py-4">Category</th>
                        <th className="px-6 py-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800 text-sm text-slate-300">
                      {pendingVendors.map((vendor) => (
                        <tr key={vendor.id} className="hover:bg-slate-950/20 transition-colors">
                          <td className="px-6 py-4">
                            <span className="font-bold text-white block">{vendor.name}</span>
                            <span className="text-xs text-slate-500">{vendor.email}</span>
                          </td>
                          <td className="px-6 py-4">
                            <span className="bg-indigo-500/10 text-indigo-400 text-xs px-2.5 py-1 rounded-full border border-indigo-500/10">
                              {vendor.category}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-right">
                            <div className="flex items-center justify-end space-x-2">
                              <button
                                onClick={() => handleVendorAction(vendor.id, 'approve')}
                                className="inline-flex items-center space-x-1 py-1.5 px-3 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 rounded-lg text-xs font-semibold transition-all border border-emerald-500/10 cursor-pointer"
                              >
                                <CheckCircle className="h-3.5 w-3.5" />
                                <span>Approve</span>
                              </button>
                              <button
                                onClick={() => handleVendorAction(vendor.id, 'reject')}
                                className="inline-flex items-center space-x-1 py-1.5 px-3 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-lg text-xs font-semibold transition-all border border-red-500/10 cursor-pointer"
                              >
                                <Ban className="h-3.5 w-3.5" />
                                <span>Reject</span>
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ════════════════════════ USERS TAB (INTERACTIVE) ════════════════════════ */}
      {activeTab === 'users' && (
        <div className="animate-in fade-in duration-200">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-xl">
            <div className="px-6 py-5 border-b border-slate-800 flex flex-col sm:flex-row justify-between sm:items-center gap-3">
              <div>
                <h2 className="text-lg font-bold text-white">Platform Users Management</h2>
                <p className="text-xs text-slate-500 mt-0.5">{users.length} active registered users in system state.</p>
              </div>
              <button
                type="button"
                onClick={() => {
                  const name = prompt('Enter user name:');
                  const email = prompt('Enter user email:');
                  if (name && email) {
                    setUsers([
                      ...users,
                      {
                        id: Date.now(),
                        name,
                        email,
                        role: 'Customer',
                        joined: 'Just now',
                        orders: 0,
                        status: 'Active',
                      },
                    ]);
                  }
                }}
                className="inline-flex items-center gap-2 px-4 py-2.5 bg-red-600 hover:bg-red-500 text-white text-xs font-bold rounded-xl transition-all cursor-pointer shadow"
              >
                <Plus className="w-3.5 h-3.5" />
                Add User
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-950/40 border-b border-slate-800">
                    <th className={thClass}>User</th>
                    <th className={thClass}>Role (Editable)</th>
                    <th className={thClass}>Joined</th>
                    <th className={thClass}>Orders</th>
                    <th className={thClass}>Status</th>
                    <th className={`${thClass} text-right`}>Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {users.map((u) => (
                    <tr key={u.id} className="hover:bg-slate-950/20 transition-colors">
                      {/* User Info */}
                      <td className={tdClass}>
                        <div className="flex items-center gap-3">
                          <div
                            className="w-8 h-8 rounded-full flex items-center justify-center text-white text-[11px] font-black flex-shrink-0"
                            style={{ background: 'linear-gradient(135deg, #6366f1, #a855f7)' }}
                          >
                            {u.name.split(' ').map((n) => n[0]).join('')}
                          </div>
                          <div>
                            <span className="font-bold text-white text-sm block">{u.name}</span>
                            <span className="text-[11px] text-slate-500">{u.email}</span>
                          </div>
                        </div>
                      </td>

                      {/* Interactive Role Dropdown */}
                      <td className={tdClass}>
                        <select
                          value={u.role}
                          onChange={(e) => handleRoleChange(u.id, e.target.value as 'Admin' | 'Vendor' | 'Customer')}
                          className="bg-[#0E1524] border border-slate-800 text-xs font-bold rounded-xl px-3 py-1.5 text-white focus:outline-none focus:ring-2 focus:ring-red-500/50 focus:border-red-500 transition-all cursor-pointer"
                        >
                          <option value="Customer">Customer</option>
                          <option value="Vendor">Vendor</option>
                          <option value="Admin">Admin</option>
                        </select>
                      </td>

                      <td className={tdClass}><span className="text-slate-400 text-xs">{u.joined}</span></td>
                      <td className={tdClass}><span className="font-bold text-white">{u.orders}</span></td>
                      <td className={tdClass}><span className={statusBadge(u.status)}>{u.status}</span></td>
                      
                      {/* Delete Action */}
                      <td className={`${tdClass} text-right`}>
                        <button
                          type="button"
                          onClick={() => handleDeleteUser(u.id)}
                          className="inline-flex items-center gap-1.5 py-1.5 px-3 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-lg text-xs font-semibold transition-all border border-red-500/10 cursor-pointer"
                          title="Suspend/Delete User"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>Delete</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {users.length === 0 && (
                <div className="p-12 text-center text-slate-500">
                  <UsersIcon className="w-8 h-8 mx-auto mb-3 text-slate-700" />
                  <p className="text-sm">No registered users in system state.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ════════════════════════ BRANDS TAB ════════════════════════ */}
      {activeTab === 'brands' && (
        <div className="animate-in fade-in duration-200">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-xl">
            <div className="px-6 py-5 border-b border-slate-800 flex flex-col sm:flex-row justify-between sm:items-center gap-3">
              <div>
                <h2 className="text-lg font-bold text-white">Brand Management</h2>
                <p className="text-xs text-slate-500 mt-0.5">{brands.length} registered brands on the platform.</p>
              </div>
              <button
                type="button"
                onClick={() => alert('Add Brand modal coming soon')}
                className="inline-flex items-center gap-2 px-4 py-2.5 bg-red-600 hover:bg-red-500 text-white text-xs font-bold rounded-xl transition-all cursor-pointer shadow"
              >
                <Plus className="w-3.5 h-3.5" />
                Add Brand
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-950/40 border-b border-slate-800">
                    <th className={thClass}>Brand</th>
                    <th className={thClass}>Category</th>
                    <th className={thClass}>Products</th>
                    <th className={thClass}>Status</th>
                    <th className={`${thClass} text-right`}>Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {brands.map((brand) => (
                    <tr key={brand.id} className="hover:bg-slate-950/20 transition-colors">
                      <td className={tdClass}>
                        <div className="flex items-center gap-3">
                          <div
                            className="w-9 h-9 rounded-xl flex items-center justify-center text-white text-[11px] font-black flex-shrink-0 shadow"
                            style={{ backgroundColor: brand.color + '22', border: `1px solid ${brand.color}44` }}
                          >
                            <span style={{ color: brand.color }}>{brand.initials}</span>
                          </div>
                          <span className="font-bold text-white text-sm">{brand.name}</span>
                        </div>
                      </td>
                      <td className={tdClass}>
                        <span className="bg-indigo-500/10 text-indigo-400 text-xs px-2.5 py-1 rounded-full border border-indigo-500/10">
                          {brand.category}
                        </span>
                      </td>
                      <td className={tdClass}>
                        <span className="font-bold text-white">{brand.productCount}</span>
                        <span className="text-slate-500 text-xs ml-1">products</span>
                      </td>
                      <td className={tdClass}>
                        <span className={statusBadge(brand.status)}>{brand.status}</span>
                      </td>
                      <td className={`${tdClass} text-right`}>
                        <div className="inline-flex items-center gap-2">
                          <button
                            type="button"
                            className="inline-flex items-center gap-1.5 py-1.5 px-3 bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-400 rounded-lg text-xs font-semibold transition-all border border-indigo-500/10 cursor-pointer"
                          >
                            <Pencil className="w-3 h-3" />
                            Edit
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteBrand(brand.id)}
                            className="inline-flex items-center gap-1.5 py-1.5 px-3 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-lg text-xs font-semibold transition-all border border-red-500/10 cursor-pointer"
                          >
                            <Trash2 className="w-3 h-3" />
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ════════════════════════ PRODUCTS TAB ════════════════════════ */}
      {activeTab === 'products' && (
        <div className="animate-in fade-in duration-200">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-xl">
            <div className="px-6 py-5 border-b border-slate-800 flex flex-col sm:flex-row justify-between sm:items-center gap-3">
              <div>
                <h2 className="text-lg font-bold text-white">Product Catalogue</h2>
                <p className="text-xs text-slate-500 mt-0.5">{products.length} products across all vendors.</p>
              </div>
              <button
                type="button"
                onClick={() => alert('Add Product modal coming soon')}
                className="inline-flex items-center gap-2 px-4 py-2.5 bg-red-600 hover:bg-red-500 text-white text-xs font-bold rounded-xl transition-all cursor-pointer shadow"
              >
                <Plus className="w-3.5 h-3.5" />
                Add Product
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-950/40 border-b border-slate-800">
                    <th className={thClass}>Product</th>
                    <th className={thClass}>Price</th>
                    <th className={thClass}>Stock</th>
                    <th className={thClass}>Vendor</th>
                    <th className={thClass}>Status</th>
                    <th className={`${thClass} text-right`}>Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {products.map((product) => (
                    <tr key={product.id} className="hover:bg-slate-950/20 transition-colors">
                      <td className={tdClass}>
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center flex-shrink-0">
                            <Package className="w-4 h-4 text-slate-500" />
                          </div>
                          <div>
                            <span className="font-bold text-white text-sm block leading-snug max-w-[200px] truncate" title={product.name}>
                              {product.name}
                            </span>
                            <span className="text-[11px] text-slate-500">{product.category}</span>
                          </div>
                        </div>
                      </td>
                      <td className={tdClass}>
                        <span className="font-bold text-white">${product.price.toFixed(2)}</span>
                      </td>
                      <td className={tdClass}>
                        <span className={`font-bold ${product.stock === 0 ? 'text-red-400' : 'text-white'}`}>
                          {product.stock === 0 ? '—' : product.stock}
                        </span>
                        {product.stock > 0 && <span className="text-slate-500 text-xs ml-1">units</span>}
                      </td>
                      <td className={tdClass}>
                        <span className="text-indigo-400 font-semibold text-xs">{product.vendor}</span>
                      </td>
                      <td className={tdClass}>
                        <span className={statusBadge(product.status as StatusVariant)}>{product.status}</span>
                      </td>
                      <td className={`${tdClass} text-right`}>
                        <div className="inline-flex items-center gap-2">
                          <button
                            type="button"
                            className="inline-flex items-center gap-1.5 py-1.5 px-3 bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-400 rounded-lg text-xs font-semibold transition-all border border-indigo-500/10 cursor-pointer"
                          >
                            <Pencil className="w-3 h-3" />
                            Edit
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteProduct(product.id)}
                            className="inline-flex items-center gap-1.5 py-1.5 px-3 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-lg text-xs font-semibold transition-all border border-red-500/10 cursor-pointer"
                          >
                            <Trash2 className="w-3 h-3" />
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ════════════════════════ PLACEHOLDER TABS ════════════════════════ */}

      {/* VENDORS PLACEHOLDER */}
      {activeTab === 'vendors' && (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-12 text-center animate-in fade-in duration-200 space-y-3">
          <Store className="w-10 h-10 text-red-400 mx-auto" />
          <h2 className="text-xl font-bold text-white">Vendors Directory</h2>
          <p className="text-xs text-slate-400 max-w-md mx-auto">
            Manage vendor merchant accounts, store verification status, and commission rates.
          </p>
        </div>
      )}

      {/* ORDERS PLACEHOLDER */}
      {activeTab === 'orders' && (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-12 text-center animate-in fade-in duration-200 space-y-3">
          <ClipboardList className="w-10 h-10 text-red-400 mx-auto" />
          <h2 className="text-xl font-bold text-white">Platform Orders</h2>
          <p className="text-xs text-slate-400 max-w-md mx-auto">
            View all marketplace customer transactions, dispute resolution logs, and fulfillment tracking.
          </p>
        </div>
      )}

      {/* ANALYTICS PLACEHOLDER */}
      {activeTab === 'analytics' && (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-12 text-center animate-in fade-in duration-200 space-y-3">
          <BarChart3 className="w-10 h-10 text-red-400 mx-auto" />
          <h2 className="text-xl font-bold text-white">Platform Analytics</h2>
          <p className="text-xs text-slate-400 max-w-md mx-auto">
            Deep dive into gross merchandise volume (GMV), conversion metrics, and regional revenue growth.
          </p>
        </div>
      )}

      {/* PERMISSIONS PLACEHOLDER */}
      {activeTab === 'permissions' && (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-12 text-center animate-in fade-in duration-200 space-y-3">
          <Shield className="w-10 h-10 text-red-400 mx-auto" />
          <h2 className="text-xl font-bold text-white">Role & Access Control</h2>
          <p className="text-xs text-slate-400 max-w-md mx-auto">
            Configure granular administrative role privileges and API access keys.
          </p>
        </div>
      )}

      {/* SETTINGS PLACEHOLDER */}
      {activeTab === 'settings' && (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-12 text-center animate-in fade-in duration-200 space-y-3">
          <SettingsIcon className="w-10 h-10 text-red-400 mx-auto" />
          <h2 className="text-xl font-bold text-white">Admin System Settings</h2>
          <p className="text-xs text-slate-400 max-w-md mx-auto">
            Configure platform fee rates, payment gateway credentials, and global marketplace parameters.
          </p>
        </div>
      )}

    </div>
  );
};

export default AdminDashboard;
