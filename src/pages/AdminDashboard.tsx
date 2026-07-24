import React, { useState, useEffect, useCallback } from 'react';
import { getDashboardStats, type DashboardStats } from '../services/dashboardService';
import { AddProductModal } from '../components/AddProductModal';
import { getProducts, type Product as ApiProduct } from '../services/productService';
import { useParams, useNavigate } from 'react-router-dom';
import { AdminVendors } from '../components/AdminVendors';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
} from 'chart.js';
import type { ChartData } from 'chart.js';
import { Doughnut, Bar } from 'react-chartjs-2';
import {
  DollarSign,
  ShieldAlert,
  Store,
  Users as UsersIcon,
  CheckCircle,
  Ban,
  Tag,
  Package,
  Trash2,
  LayoutDashboard,
  ClipboardList,
  BarChart3,
  Settings as SettingsIcon,
  Shield,
  X,
  UserPlus,
  TrendingUp,
  CreditCard,
  Save,
  Check,
  ToggleLeft,
  ToggleRight,
  Loader2,
  UploadCloud,
  Mail,
  AlertTriangle as AlertIcon,
  Lock,
} from 'lucide-react';

ChartJS.register(
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  Title
);

// ── Data Interfaces ────────────────────────────────────────────────────────────

interface UserItem {
  id: number;
  name: string;
  email: string;
  role: 'Admin' | 'Vendor' | 'Customer';
  joined: string;
  orders: number;
  status: 'Active' | 'Suspended';
}

interface VendorItem {
  id: number;
  storeName: string;
  owner: string;
  email: string;
  products: number;
  totalSales: number;
  status: 'Active' | 'Pending' | 'Suspended';
}

interface OrderItem {
  id: string;
  customer: string;
  email: string;
  date: string;
  amount: number;
  paymentMethod: string;
  status: 'Pending' | 'Completed' | 'Cancelled';
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

interface PermissionRule {
  id: string;
  capability: string;
  description: string;
  admin: boolean;
  vendor: boolean;
  customer: boolean;
}

// ── Mock Initial Data ──────────────────────────────────────────────────────────

const initialUsers: UserItem[] = [
  { id: 1, name: 'Mammad Aliyev', email: 'admin@vendora.store', role: 'Admin', joined: 'Jan 12, 2025', orders: 0, status: 'Active' },
  { id: 2, name: 'Leyla Hasanova', email: 'buyer@vendora.store', role: 'Customer', joined: 'Feb 3, 2025', orders: 14, status: 'Active' },
  { id: 3, name: 'Nicat Mammadov', email: 'nicat@shop.az', role: 'Vendor', joined: 'Mar 19, 2025', orders: 0, status: 'Active' },
  { id: 4, name: 'Aytac Rzayeva', email: 'aytac@domain.com', role: 'Customer', joined: 'Apr 7, 2025', orders: 3, status: 'Suspended' },
  { id: 5, name: 'Rashad Guliyev', email: 'rashad@techbaku.az', role: 'Vendor', joined: 'May 22, 2025', orders: 0, status: 'Active' },
];

const initialVendors: VendorItem[] = [
  { id: 1, storeName: 'Baku Tech Hub', owner: 'Rashad Guliyev', email: 'info@bakutech.az', products: 48, totalSales: 42150.00, status: 'Active' },
  { id: 2, storeName: 'Saray Boutique', owner: 'Nigar Musayeva', email: 'saray@boutique.com', products: 94, totalSales: 28900.50, status: 'Active' },
  { id: 3, storeName: 'Caspian Art Gallery', owner: 'Kamran Alizade', email: 'caspian@art.com', products: 22, totalSales: 9400.00, status: 'Pending' },
  { id: 4, storeName: 'SoundCore Baku', owner: 'Nicat Mammadov', email: 'soundcore@baku.az', products: 31, totalSales: 63200.00, status: 'Active' },
  { id: 5, storeName: 'Nordic Furniture', owner: 'Farid Ibrahimov', email: 'nordic@home.az', products: 15, totalSales: 0.00, status: 'Suspended' },
];

const initialOrders: OrderItem[] = [
  { id: '#ORD-9821', customer: 'Leyla Hasanova', email: 'buyer@vendora.store', date: 'Jul 22, 2026', amount: 349.99, paymentMethod: 'Credit Card', status: 'Completed' },
  { id: '#ORD-9820', customer: 'Elvin Abbasov', email: 'elvin@gmail.com', date: 'Jul 21, 2026', amount: 89.50, paymentMethod: 'PayPal', status: 'Pending' },
  { id: '#ORD-9819', customer: 'Aytac Rzayeva', email: 'aytac@domain.com', date: 'Jul 20, 2026', amount: 1250.00, paymentMethod: 'Apple Pay', status: 'Completed' },
  { id: '#ORD-9818', customer: 'Orkhan Qasimov', email: 'orkhan@tech.az', date: 'Jul 19, 2026', amount: 45.00, paymentMethod: 'Credit Card', status: 'Cancelled' },
  { id: '#ORD-9817', customer: 'Samira Aliyeva', email: 'samira@box.az', date: 'Jul 18, 2026', amount: 599.00, paymentMethod: 'Credit Card', status: 'Completed' },
];

const initialBrands: Brand[] = [
  { id: 1, name: 'SoundCore', category: 'Electronics', productCount: 48, status: 'Active', initials: 'SC', color: '#6366f1' },
  { id: 2, name: 'ArcticPro', category: 'Electronics', productCount: 31, status: 'Active', initials: 'AP', color: '#a855f7' },
  { id: 3, name: 'LuxeWear', category: 'Fashion', productCount: 94, status: 'Active', initials: 'LW', color: '#ec4899' },
  { id: 4, name: 'TerraHome', category: 'Home Decor', productCount: 22, status: 'Suspended', initials: 'TH', color: '#f59e0b' },
  { id: 5, name: 'VeloGear', category: 'Sports', productCount: 57, status: 'Active', initials: 'VG', color: '#10b981' },
];

const initialProducts: Product[] = [
  { id: 1, name: 'Aether Noise-Cancelling Headphones', price: 299.99, stock: 184, vendor: 'SoundCore', category: 'Electronics', status: 'Active' },
  { id: 2, name: 'ArcticPro Mechanical Keyboard', price: 149.00, stock: 0, vendor: 'ArcticPro', category: 'Electronics', status: 'Out of Stock' },
  { id: 3, name: 'LuxeWear Urban Hoodie - Slate Grey', price: 89.95, stock: 412, vendor: 'LuxeWear', category: 'Fashion', status: 'Active' },
  { id: 4, name: 'TerraHome Ambient Lamp Set', price: 59.50, stock: 0, vendor: 'TerraHome', category: 'Home Decor', status: 'Draft' },
  { id: 5, name: 'VeloGear Carbon Fibre Water Bottle', price: 34.99, stock: 920, vendor: 'VeloGear', category: 'Sports', status: 'Active' },
];

const initialPermissions: PermissionRule[] = [
  { id: '1', capability: 'Access Admin Dashboard', description: 'View high-level revenue metrics and platform stats', admin: true, vendor: false, customer: false },
  { id: '2', capability: 'Manage User Accounts', description: 'Create, edit, change roles, or suspend user accounts', admin: true, vendor: false, customer: false },
  { id: '3', capability: 'Vendor Store Management', description: 'Approve or suspend merchant storefronts', admin: true, vendor: false, customer: false },
  { id: '4', capability: 'Publish & Manage Products', description: 'Add products, set pricing and inventory levels', admin: true, vendor: true, customer: false },
  { id: '5', capability: 'View & Process Orders', description: 'Access order details, fulfillments, and status updates', admin: true, vendor: true, customer: false },
  { id: '6', capability: 'Place Orders & Checkout', description: 'Browse marketplace, add items to cart, and make purchases', admin: true, vendor: true, customer: true },
  { id: '7', capability: 'System Configuration', description: 'Modify marketplace parameters, commission rate, and security', admin: true, vendor: false, customer: false },
];

// ── Tab definitions ────────────────────────────────────────────────────────────

type ActiveTab = 'dashboard' | 'users' | 'brands' | 'vendors' | 'products' | 'orders' | 'analytics' | 'permissions' | 'settings';

const tabs: { id: ActiveTab; label: string; icon: React.ElementType }[] = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'users', label: 'Users', icon: UsersIcon },
  { id: 'vendors', label: 'Vendors', icon: Store },
  { id: 'orders', label: 'Orders', icon: ClipboardList },
  { id: 'products', label: 'Products', icon: Package },
  { id: 'brands', label: 'Brands', icon: Tag },
  { id: 'analytics', label: 'Analytics', icon: BarChart3 },
  { id: 'permissions', label: 'Permissions', icon: Shield },
  { id: 'settings', label: 'Settings', icon: SettingsIcon },
];

export interface AdminDashboardProps {
  siteSettings?: {
    siteName: string;
    supportEmail?: string;
    commissionRate?: number;
    maintenanceMode?: boolean;
    requireTwoFactor?: boolean;
  };
  updateSiteSettings?: (newSettings: Partial<{
    siteName: string;
    supportEmail?: string;
    commissionRate?: number;
    maintenanceMode?: boolean;
    requireTwoFactor?: boolean;
  }>) => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ siteSettings, updateSiteSettings }) => {
  const [dashboardStats, setDashboardStats] = useState<DashboardStats | null>(null);
  const { tab: urlTab } = useParams<{ tab?: string }>();
  const navigate = useNavigate();

  // Internal tab state synchronized with URL parameter
  const [activeTab, setActiveTab] = useState<ActiveTab>(() => {
    if (urlTab && tabs.some((t) => t.id === urlTab.toLowerCase())) {
      return urlTab.toLowerCase() as ActiveTab;
    }
    return 'dashboard';
  });

  useEffect(() => {
    if (urlTab && tabs.some((t) => t.id === urlTab.toLowerCase())) {
      setActiveTab(urlTab.toLowerCase() as ActiveTab);
    }
  }, [urlTab]);

  // Fetch real dashboard stats from backend API
  useEffect(() => {
    getDashboardStats()
      .then((data) => setDashboardStats(data))
      .catch(() => { /* fall through to hardcoded fallbacks below */ });
  }, []);

  const handleTabChange = (newTab: ActiveTab) => {
    setActiveTab(newTab);
    navigate(`/admin/${newTab}`, { replace: true });
  };

  // State Management — users persisted to localStorage
  const [users, setUsers] = useState<UserItem[]>(() => {
    try {
      const saved = localStorage.getItem('vendora_admin_users');
      return saved ? (JSON.parse(saved) as UserItem[]) : initialUsers;
    } catch {
      return initialUsers;
    }
  });

  // Sync users array to localStorage on every change
  useEffect(() => {
    localStorage.setItem('vendora_admin_users', JSON.stringify(users));
  }, [users]);

  // State Management — vendors persisted to localStorage
  const [vendors, setVendors] = useState<VendorItem[]>(() => {
    try {
      const saved = localStorage.getItem('vendora_admin_vendors');
      return saved ? (JSON.parse(saved) as VendorItem[]) : initialVendors;
    } catch {
      return initialVendors;
    }
  });

  useEffect(() => {
    localStorage.setItem('vendora_admin_vendors', JSON.stringify(vendors));
  }, [vendors]);

  const [orders, setOrders] = useState<OrderItem[]>(initialOrders);
  const [brands] = useState<Brand[]>(initialBrands);

  // Products — seeded with mock data; updated from API after each successful creation
  const [products, setProducts] = useState<Product[]>(initialProducts);

  // Add Product Modal
  const [isAddProductModalOpen, setIsAddProductModalOpen] = useState(false);

  // Re-fetch the live product list and merge into local state
  const handleProductCreated = useCallback(() => {
    getProducts()
      .then((apiProducts: ApiProduct[]) => {
        // Map API shape → local Product shape used by the table
        const mapped: Product[] = apiProducts.map((p) => ({
          id: p.id,
          name: p.title,
          price: p.price,
          stock: p.stockQuantity,
          vendor: 'TradeHub',
          category: p.category,
          status: p.isActive
            ? p.stockQuantity === 0
              ? 'Out of Stock'
              : 'Active'
            : 'Draft',
        }));
        setProducts(mapped);
      })
      .catch(() => { /* keep existing list on error */ });
  }, []);
  const [permissions, setPermissions] = useState<PermissionRule[]>(initialPermissions);

  // Add User Modal State
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newUserName, setNewUserName] = useState('');
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserRole, setNewUserRole] = useState<'Admin' | 'Vendor' | 'Customer'>('Customer');
  const [newUserStatus, setNewUserStatus] = useState<'Active' | 'Suspended'>('Active');

  // Add Vendor Modal State
  const [isAddVendorModalOpen, setIsAddVendorModalOpen] = useState(false);
  const [newVendorStoreName, setNewVendorStoreName] = useState('');
  const [newVendorOwner, setNewVendorOwner] = useState('');
  const [newVendorEmail, setNewVendorEmail] = useState('');
  const [newVendorStatus, setNewVendorStatus] = useState<'Active' | 'Pending' | 'Suspended'>('Pending');

  // Platform Settings State
  const [settings, setSettings] = useState({
    siteName: siteSettings?.siteName || 'Vendora',
    supportEmail: siteSettings?.supportEmail || 'support@vendora.store',
    commissionRate: siteSettings?.commissionRate ?? 5,
    maintenanceMode: siteSettings?.maintenanceMode ?? false,
    requireTwoFactor: siteSettings?.requireTwoFactor ?? true,
  });
  type SaveStatus = 'idle' | 'saving' | 'saved';
  const [saveStatus, setSaveStatus] = useState<SaveStatus>('idle');
  const [showToast, setShowToast] = useState(false);

  useEffect(() => {
    if (siteSettings?.siteName) {
      setSettings((prev) => ({
        ...prev,
        ...siteSettings,
      }));
    }
  }, [siteSettings]);

  // ── Handlers ─────────────────────────────────────────────────────────────────

  const handleCreateUserSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUserName.trim() || !newUserEmail.trim()) return;

    const createdUser: UserItem = {
      id: Date.now(),
      name: newUserName.trim(),
      email: newUserEmail.trim(),
      role: newUserRole,
      joined: 'Just now',
      orders: 0,
      status: newUserStatus,
    };

    setUsers((prev) => [createdUser, ...prev]);
    setIsAddModalOpen(false);
    setNewUserName('');
    setNewUserEmail('');
    setNewUserRole('Customer');
    setNewUserStatus('Active');
  };

  const handleCreateVendorSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newVendorStoreName.trim() || !newVendorOwner.trim() || !newVendorEmail.trim()) return;

    const createdVendor: VendorItem = {
      id: Date.now(),
      storeName: newVendorStoreName.trim(),
      owner: newVendorOwner.trim(),
      email: newVendorEmail.trim(),
      products: 0,
      totalSales: 0,
      status: newVendorStatus,
    };

    setVendors((prev) => [createdVendor, ...prev]);
    setIsAddVendorModalOpen(false);
    setNewVendorStoreName('');
    setNewVendorOwner('');
    setNewVendorEmail('');
    setNewVendorStatus('Pending');
  };

  const handleDeleteUser = (id: number) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      setUsers((prev) => prev.filter((u) => u.id !== id));
    }
  };

  const handleRoleChange = (id: number, newRole: 'Admin' | 'Vendor' | 'Customer') => {
    setUsers((prev) => prev.map((u) => (u.id === id ? { ...u, role: newRole } : u)));
  };

  const toggleVendorStatus = (vendorId: number, newStatus: 'Active' | 'Pending' | 'Suspended') => {
    setVendors((prev) => prev.map((v) => (v.id === vendorId ? { ...v, status: newStatus } : v)));
  };

  const handleVendorStatusChange = (id: number, newStatus: 'Active' | 'Pending' | 'Suspended') => {
    toggleVendorStatus(id, newStatus);
  };

  const handleOrderStatusChange = (id: string, newStatus: 'Pending' | 'Completed' | 'Cancelled') => {
    setOrders((prev) => prev.map((o) => (o.id === id ? { ...o, status: newStatus } : o)));
  };

  const handleTogglePermission = (id: string, roleKey: 'admin' | 'vendor' | 'customer') => {
    setPermissions((prev) =>
      prev.map((p) => (p.id === id ? { ...p, [roleKey]: !p[roleKey] } : p))
    );
  };

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaveStatus('saving');
    // Simulate async API save
    await new Promise((r) => setTimeout(r, 1000));
    if (updateSiteSettings) {
      updateSiteSettings({
        siteName: settings.siteName,
        supportEmail: settings.supportEmail,
        commissionRate: settings.commissionRate,
        maintenanceMode: settings.maintenanceMode,
        requireTwoFactor: settings.requireTwoFactor,
      });
    }
    setSaveStatus('saved');
    setShowToast(true);
    setTimeout(() => {
      setSaveStatus('idle');
      setShowToast(false);
    }, 2500);
  };

  // ── Chart Configs ────────────────────────────────────────────────────────────

  // ── Live chart data from API (fallback to demo data if API not yet available)
  const doughnutData: ChartData<'doughnut'> = {
    labels: dashboardStats?.categoryStats.map((c) => c.category) ?? ['Electronics', 'Fashion', 'Home', 'Sports', 'Other'],
    datasets: [
      {
        data: dashboardStats?.categoryStats.map((c) => c.count) ?? [45, 25, 15, 10, 5],
        backgroundColor: ['#6366f1', '#ec4899', '#f59e0b', '#10b981', '#06b6d4'],
        borderWidth: 1,
        borderColor: '#0f172a',
      },
    ],
  };

  const barData: ChartData<'bar'> = {
    labels: dashboardStats?.salesByDay.map((d) => d.day) ?? ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    datasets: [
      {
        label: 'Revenue ($)',
        data: dashboardStats?.salesByDay.map((d) => d.total) ?? [0, 0, 0, 0, 0, 0, 0],
        backgroundColor: '#ef4444',
        borderRadius: 8,
      },
    ],
  };

  const thClass = 'px-5 py-4 text-left text-xs font-bold text-slate-400 uppercase tracking-wider';
  const tdClass = 'px-5 py-4 text-sm text-slate-300 align-middle';

  const badgeClass = (status: string) => {
    const map: Record<string, string> = {
      Active: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
      Completed: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
      Pending: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
      Suspended: 'bg-red-500/10 text-red-400 border-red-500/20',
      Cancelled: 'bg-red-500/10 text-red-400 border-red-500/20',
      'Out of Stock': 'bg-amber-500/10 text-amber-400 border-amber-500/20',
      Draft: 'bg-slate-700/50 text-slate-400 border-slate-700',
    };
    return `inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${map[status] || 'bg-slate-800 text-slate-300 border-slate-700'}`;
  };

  return (
    <div className="p-6 sm:p-10 space-y-8 text-left bg-[#060913] min-h-screen text-slate-100 font-sans">
      {/* ── Page Header ── */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="bg-red-500/10 p-2.5 rounded-xl border border-red-500/25">
            <ShieldAlert className="h-6 w-6 text-red-400" />
          </div>
          <div>
            <h1 className="text-3xl font-extrabold text-white tracking-tight">Admin Dashboard</h1>
            <p className="text-sm text-slate-400 mt-1">Platform operations, system permissions, and control center.</p>
          </div>
        </div>

        {/* Conditional Header Action Buttons */}

        {activeTab === 'products' && (
          <button
            type="button"
            id="open-add-product-modal"
            onClick={() => setIsAddProductModalOpen(true)}
            className="hidden sm:inline-flex items-center gap-2 px-4 py-2.5 bg-red-600 hover:bg-red-500 text-white text-xs font-bold rounded-xl transition-all shadow-lg shadow-red-600/20 cursor-pointer"
          >
            <Package className="w-4 h-4" />
            <span>+ Add Product</span>
          </button>
        )}

        {activeTab === 'brands' && (
          <button
            type="button"
            onClick={() => alert('Add Brand form / modal')}
            className="hidden sm:inline-flex items-center gap-2 px-4 py-2.5 bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold rounded-xl transition-all shadow-lg shadow-purple-600/20 cursor-pointer"
          >
            <Tag className="w-4 h-4" />
            <span>+ Add Brand</span>
          </button>
        )}
      </div>

      {/* ── Unified Pill Navigation ── */}
      <div className="flex items-center gap-1.5 bg-[#111827] border border-slate-800 rounded-2xl p-1.5 overflow-x-auto scrollbar-none">
        {tabs.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            type="button"
            onClick={() => handleTabChange(id)}
            className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
              activeTab === id
                ? 'bg-red-600 text-white shadow-md shadow-red-600/25'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <Icon className="w-3.5 h-3.5" />
            {label}
          </button>
        ))}
      </div>

      {/* ════════════════════════ 1. DASHBOARD OVERVIEW ════════════════════════ */}
      {activeTab === 'dashboard' && (
        <div className="space-y-8 animate-in fade-in duration-200">
          {/* Top Metric Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Total Revenue — live from /api/dashboard/stats */}
            <div className="bg-[#111827] border border-slate-800 p-6 rounded-2xl flex items-center justify-between shadow-xl">
              <div className="space-y-1">
                <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Total Revenue</span>
                <p className="text-2xl font-bold text-white">
                  ${dashboardStats ? dashboardStats.totalSales.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '—'}
                </p>
                <span className="text-xs text-emerald-400 font-semibold flex items-center gap-1">
                  <TrendingUp className="w-3 h-3" /> Live platform GMV
                </span>
              </div>
              <div className="bg-emerald-500/10 p-3.5 rounded-xl border border-emerald-500/20 text-emerald-400">
                <DollarSign className="h-6 w-6" />
              </div>
            </div>

            {/* Total Products — live */}
            <div className="bg-[#111827] border border-slate-800 p-6 rounded-2xl flex items-center justify-between shadow-xl">
              <div className="space-y-1">
                <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Active Products</span>
                <p className="text-2xl font-bold text-white">{dashboardStats ? dashboardStats.totalProducts : vendors.length}</p>
                <span className="text-xs text-indigo-400 font-semibold">Live Listings</span>
              </div>
              <div className="bg-indigo-500/10 p-3.5 rounded-xl border border-indigo-500/20 text-indigo-400">
                <Package className="h-6 w-6" />
              </div>
            </div>

            {/* Total Users — live */}
            <div className="bg-[#111827] border border-slate-800 p-6 rounded-2xl flex items-center justify-between shadow-xl">
              <div className="space-y-1">
                <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Total Users</span>
                <p className="text-2xl font-bold text-white">{dashboardStats ? dashboardStats.totalUsers : users.length}</p>
                <span className="text-xs text-purple-400 font-semibold">Registered Accounts</span>
              </div>
              <div className="bg-purple-500/10 p-3.5 rounded-xl border border-purple-500/20 text-purple-400">
                <UsersIcon className="h-6 w-6" />
              </div>
            </div>

            {/* Total Orders — live */}
            <div className="bg-[#111827] border border-slate-800 p-6 rounded-2xl flex items-center justify-between shadow-xl">
              <div className="space-y-1">
                <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Total Orders</span>
                <p className="text-2xl font-bold text-white">{dashboardStats ? dashboardStats.totalOrders : orders.length}</p>
                <span className="text-xs text-amber-400 font-semibold">Platform Transactions</span>
              </div>
              <div className="bg-amber-500/10 p-3.5 rounded-xl border border-amber-500/20 text-amber-400">
                <ClipboardList className="h-6 w-6" />
              </div>
            </div>
          </div>

          {/* Charts Row */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="bg-[#111827] border border-slate-800 p-6 rounded-3xl shadow-xl lg:col-span-2 space-y-4">
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-lg font-bold text-white">Monthly Revenue Growth</h2>
                  <p className="text-xs text-slate-400">Platform GMV across Q1–Q3</p>
                </div>
              </div>
              <div className="h-64 relative flex items-center justify-center">
                <Bar data={barData} options={{ responsive: true, maintainAspectRatio: false }} />
              </div>
            </div>

            <div className="bg-[#111827] border border-slate-800 p-6 rounded-3xl shadow-xl space-y-4">
              <div>
                <h2 className="text-lg font-bold text-white">Category Distribution</h2>
                <p className="text-xs text-slate-400">Marketplace sales share by vertical</p>
              </div>
              <div className="h-64 relative flex items-center justify-center">
                <Doughnut data={doughnutData} options={{ responsive: true, maintainAspectRatio: false }} />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ════════════════════════ 2. USERS TAB ════════════════════════ */}
      {activeTab === 'users' && (
        <div className="animate-in fade-in duration-200">
          <div className="bg-[#111827] border border-slate-800 rounded-3xl overflow-hidden shadow-xl">
            <div className="px-6 py-5 border-b border-slate-800 flex flex-col sm:flex-row justify-between sm:items-center gap-3">
              <div>
                <h2 className="text-lg font-bold text-white">User Account Directory</h2>
                <p className="text-xs text-slate-400 mt-0.5">{users.length} active registered users in system state.</p>
              </div>
              <button
                type="button"
                onClick={() => setIsAddModalOpen(true)}
                className="inline-flex items-center gap-2 px-4 py-2.5 bg-red-600 hover:bg-red-500 text-white text-xs font-bold rounded-xl transition-all cursor-pointer shadow-lg shadow-red-600/20"
              >
                <UserPlus className="w-4 h-4" />
                <span>+ Add User</span>
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-950/40 border-b border-slate-800">
                    <th className={thClass}>User</th>
                    <th className={thClass}>Role</th>
                    <th className={thClass}>Joined</th>
                    <th className={thClass}>Orders</th>
                    <th className={thClass}>Status</th>
                    <th className={`${thClass} text-right`}>Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {users.map((u) => (
                    <tr key={u.id} className="hover:bg-slate-950/20 transition-colors">
                      <td className={tdClass}>
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-purple-600 to-indigo-500 flex items-center justify-center text-white text-xs font-black flex-shrink-0">
                            {u.name.split(' ').map((n) => n[0]).join('').slice(0, 2)}
                          </div>
                          <div>
                            <span className="font-bold text-white text-sm block">{u.name}</span>
                            <span className="text-[11px] text-slate-400">{u.email}</span>
                          </div>
                        </div>
                      </td>
                      <td className={tdClass}>
                        <select
                          value={u.role}
                          onChange={(e) => handleRoleChange(u.id, e.target.value as 'Admin' | 'Vendor' | 'Customer')}
                          className="bg-[#0E1524] border border-slate-800 text-xs font-bold rounded-xl px-3 py-1.5 text-white focus:outline-none focus:ring-2 focus:ring-red-500/50 cursor-pointer"
                        >
                          <option value="Customer">Customer</option>
                          <option value="Vendor">Vendor</option>
                          <option value="Admin">Admin</option>
                        </select>
                      </td>
                      <td className={tdClass}><span className="text-slate-400 text-xs">{u.joined}</span></td>
                      <td className={tdClass}><span className="font-bold text-white">{u.orders}</span></td>
                      <td className={tdClass}><span className={badgeClass(u.status)}>{u.status}</span></td>
                      <td className={`${tdClass} text-right`}>
                        <button
                          type="button"
                          onClick={() => handleDeleteUser(u.id)}
                          className="inline-flex items-center gap-1.5 py-1.5 px-3 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-lg text-xs font-semibold transition-all border border-red-500/10 cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>Delete</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ════════════════════════ 3. VENDORS TAB ════════════════════════ */}
      {activeTab === 'vendors' && <AdminVendors />}

      {/* ════════════════════════ 4. ORDERS TAB ════════════════════════ */}
      {activeTab === 'orders' && (
        <div className="animate-in fade-in duration-200">
          <div className="bg-[#111827] border border-slate-800 rounded-3xl overflow-hidden shadow-xl">
            <div className="px-6 py-5 border-b border-slate-800">
              <h2 className="text-lg font-bold text-white">Platform Orders</h2>
              <p className="text-xs text-slate-400 mt-0.5">Real-time marketplace transactions and status management.</p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-950/40 border-b border-slate-800">
                    <th className={thClass}>Order ID</th>
                    <th className={thClass}>Customer</th>
                    <th className={thClass}>Date</th>
                    <th className={thClass}>Amount</th>
                    <th className={thClass}>Payment</th>
                    <th className={thClass}>Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {orders.map((o) => (
                    <tr key={o.id} className="hover:bg-slate-950/20 transition-colors">
                      <td className={tdClass}>
                        <span className="font-bold text-indigo-400 font-mono">{o.id}</span>
                      </td>
                      <td className={tdClass}>
                        <span className="font-bold text-white block text-sm">{o.customer}</span>
                        <span className="text-[11px] text-slate-400">{o.email}</span>
                      </td>
                      <td className={tdClass}><span className="text-slate-400 text-xs">{o.date}</span></td>
                      <td className={tdClass}><span className="font-bold text-white">${o.amount.toFixed(2)}</span></td>
                      <td className={tdClass}>
                        <span className="inline-flex items-center gap-1.5 text-xs text-slate-300">
                          <CreditCard className="w-3.5 h-3.5 text-slate-400" />
                          {o.paymentMethod}
                        </span>
                      </td>
                      <td className={tdClass}>
                        <select
                          value={o.status}
                          onChange={(e) => handleOrderStatusChange(o.id, e.target.value as 'Pending' | 'Completed' | 'Cancelled')}
                          className="bg-[#0E1524] border border-slate-800 text-xs font-bold rounded-xl px-3 py-1.5 text-white focus:outline-none focus:ring-2 focus:ring-red-500/50 cursor-pointer"
                        >
                          <option value="Pending">Pending</option>
                          <option value="Completed">Completed</option>
                          <option value="Cancelled">Cancelled</option>
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ════════════════════════ 5. PRODUCTS TAB ════════════════════════ */}
      {activeTab === 'products' && (
        <div className="animate-in fade-in duration-200">
          <div className="bg-[#111827] border border-slate-800 rounded-3xl overflow-hidden shadow-xl">
            <div className="px-6 py-5 border-b border-slate-800">
              <h2 className="text-lg font-bold text-white">Product Catalog</h2>
              <p className="text-xs text-slate-400 mt-0.5">{products.length} products listed across all vendor stores.</p>
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
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {products.map((p) => (
                    <tr key={p.id} className="hover:bg-slate-950/20 transition-colors">
                      <td className={tdClass}>
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center flex-shrink-0">
                            <Package className="w-4 h-4 text-slate-400" />
                          </div>
                          <div>
                            <span className="font-bold text-white text-sm block">{p.name}</span>
                            <span className="text-[11px] text-slate-400">{p.category}</span>
                          </div>
                        </div>
                      </td>
                      <td className={tdClass}><span className="font-bold text-white">${p.price.toFixed(2)}</span></td>
                      <td className={tdClass}><span className="font-bold text-white">{p.stock}</span></td>
                      <td className={tdClass}><span className="text-indigo-400 font-semibold text-xs">{p.vendor}</span></td>
                      <td className={tdClass}><span className={badgeClass(p.status)}>{p.status}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ════════════════════════ 6. BRANDS TAB ════════════════════════ */}
      {activeTab === 'brands' && (
        <div className="animate-in fade-in duration-200">
          <div className="bg-[#111827] border border-slate-800 rounded-3xl overflow-hidden shadow-xl">
            <div className="px-6 py-5 border-b border-slate-800">
              <h2 className="text-lg font-bold text-white">Brand Directory</h2>
              <p className="text-xs text-slate-400 mt-0.5">{brands.length} registered product brands.</p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-950/40 border-b border-slate-800">
                    <th className={thClass}>Brand</th>
                    <th className={thClass}>Category</th>
                    <th className={thClass}>Products</th>
                    <th className={thClass}>Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {brands.map((b) => (
                    <tr key={b.id} className="hover:bg-slate-950/20 transition-colors">
                      <td className={tdClass}>
                        <div className="flex items-center gap-3">
                          <div
                            className="w-9 h-9 rounded-xl flex items-center justify-center text-white text-[11px] font-black"
                            style={{ backgroundColor: b.color + '22', border: `1px solid ${b.color}44` }}
                          >
                            <span style={{ color: b.color }}>{b.initials}</span>
                          </div>
                          <span className="font-bold text-white text-sm">{b.name}</span>
                        </div>
                      </td>
                      <td className={tdClass}><span className="text-slate-400 text-xs">{b.category}</span></td>
                      <td className={tdClass}><span className="font-bold text-white">{b.productCount}</span></td>
                      <td className={tdClass}><span className={badgeClass(b.status)}>{b.status}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ════════════════════════ 7. ANALYTICS TAB ════════════════════════ */}
      {activeTab === 'analytics' && (
        <div className="space-y-8 animate-in fade-in duration-200">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div className="bg-[#111827] border border-slate-800 p-6 rounded-2xl space-y-2">
              <span className="text-xs text-slate-400 font-semibold uppercase">Conversion Rate</span>
              <p className="text-3xl font-extrabold text-white">4.82%</p>
              <span className="text-xs text-emerald-400 font-semibold">+0.6% vs last week</span>
            </div>
            <div className="bg-[#111827] border border-slate-800 p-6 rounded-2xl space-y-2">
              <span className="text-xs text-slate-400 font-semibold uppercase">Average Order Value</span>
              <p className="text-3xl font-extrabold text-white">$124.50</p>
              <span className="text-xs text-indigo-400 font-semibold">+$8.20 higher checkout</span>
            </div>
            <div className="bg-[#111827] border border-slate-800 p-6 rounded-2xl space-y-2">
              <span className="text-xs text-slate-400 font-semibold uppercase">Net Platform Margin</span>
              <p className="text-3xl font-extrabold text-white">8.5%</p>
              <span className="text-xs text-purple-400 font-semibold">Gross revenue fees</span>
            </div>
          </div>

          <div className="bg-[#111827] border border-slate-800 p-6 rounded-3xl shadow-xl space-y-4">
            <h2 className="text-lg font-bold text-white">Monthly Platform GMV Breakdown</h2>
            <div className="h-72 relative">
              <Bar data={barData} options={{ responsive: true, maintainAspectRatio: false }} />
            </div>
          </div>
        </div>
      )}

      {/* ════════════════════════ 8. PERMISSIONS TAB ════════════════════════ */}
      {activeTab === 'permissions' && (
        <div className="animate-in fade-in duration-200">
          <div className="bg-[#111827] border border-slate-800 rounded-3xl overflow-hidden shadow-xl">
            <div className="px-6 py-5 border-b border-slate-800">
              <h2 className="text-lg font-bold text-white">Role Access Control Matrix</h2>
              <p className="text-xs text-slate-400 mt-0.5">Toggle capability privileges across Admin, Vendor, and Customer roles.</p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-950/40 border-b border-slate-800">
                    <th className={thClass}>Capability / Feature</th>
                    <th className={`${thClass} text-center`}>Admin</th>
                    <th className={`${thClass} text-center`}>Vendor</th>
                    <th className={`${thClass} text-center`}>Customer</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {permissions.map((p) => (
                    <tr key={p.id} className="hover:bg-slate-950/20 transition-colors">
                      <td className={tdClass}>
                        <span className="font-bold text-white text-sm block">{p.capability}</span>
                        <span className="text-[11px] text-slate-400">{p.description}</span>
                      </td>
                      <td className={`${tdClass} text-center`}>
                        <button
                          type="button"
                          onClick={() => handleTogglePermission(p.id, 'admin')}
                          className="p-1 rounded cursor-pointer text-emerald-400 hover:opacity-80"
                        >
                          {p.admin ? <Check className="w-5 h-5 mx-auto" /> : <X className="w-5 h-5 mx-auto text-slate-600" />}
                        </button>
                      </td>
                      <td className={`${tdClass} text-center`}>
                        <button
                          type="button"
                          onClick={() => handleTogglePermission(p.id, 'vendor')}
                          className="p-1 rounded cursor-pointer text-indigo-400 hover:opacity-80"
                        >
                          {p.vendor ? <Check className="w-5 h-5 mx-auto" /> : <X className="w-5 h-5 mx-auto text-slate-600" />}
                        </button>
                      </td>
                      <td className={`${tdClass} text-center`}>
                        <button
                          type="button"
                          onClick={() => handleTogglePermission(p.id, 'customer')}
                          className="p-1 rounded cursor-pointer text-purple-400 hover:opacity-80"
                        >
                          {p.customer ? <Check className="w-5 h-5 mx-auto" /> : <X className="w-5 h-5 mx-auto text-slate-600" />}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ════════════════════════ 9. SETTINGS TAB ════════════════════════ */}
      {activeTab === 'settings' && (
        <div className="animate-in fade-in duration-200 max-w-3xl space-y-6">

          {/* ─── Main Settings Form ─── */}
          <form onSubmit={handleSaveSettings} className="bg-[#111827] border border-slate-800 p-8 rounded-3xl shadow-xl space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-white">Global Platform Settings</h2>
                <p className="text-xs text-slate-400 mt-1">Configure marketplace parameters and security rules.</p>
              </div>
              <div className="p-2.5 rounded-xl bg-red-500/10 border border-red-500/20">
                <SettingsIcon className="w-5 h-5 text-red-400" />
              </div>
            </div>

            {/* ─── Form Fields ─── */}
            <div className="space-y-5">

              {/* Marketplace Name */}
              <div>
                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest block mb-1.5">
                  Marketplace Name
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={settings.siteName}
                    onChange={(e) => setSettings({ ...settings, siteName: e.target.value })}
                    placeholder="e.g. Vendora"
                    className="w-full bg-[#0E1524] border border-slate-800 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:ring-2 focus:ring-red-500/50 focus:border-red-500/50 transition-all placeholder:text-slate-600"
                  />
                </div>
              </div>

              {/* Support Email */}
              <div>
                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest block mb-1.5">
                  Support Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" />
                  <input
                    type="email"
                    value={settings.supportEmail}
                    onChange={(e) => setSettings({ ...settings, supportEmail: e.target.value })}
                    placeholder="support@yourplatform.com"
                    className="w-full bg-[#0E1524] border border-slate-800 rounded-xl pl-11 pr-4 py-3 text-sm text-white focus:outline-none focus:ring-2 focus:ring-red-500/50 focus:border-red-500/50 transition-all placeholder:text-slate-600"
                  />
                </div>
              </div>

              {/* Commission Fee with % badge */}
              <div>
                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest block mb-1.5">
                  Platform Commission Fee
                </label>
                <div className="relative">
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={settings.commissionRate}
                    onChange={(e) => setSettings({ ...settings, commissionRate: Math.min(100, Math.max(0, Number(e.target.value))) })}
                    className="w-full bg-[#0E1524] border border-slate-800 rounded-xl px-4 pr-14 py-3 text-sm text-white focus:outline-none focus:ring-2 focus:ring-red-500/50 focus:border-red-500/50 transition-all"
                  />
                  <div className="absolute right-0 top-0 bottom-0 flex items-center px-4 border-l border-slate-800 rounded-r-xl bg-slate-800/50">
                    <span className="text-sm font-black text-slate-300">%</span>
                  </div>
                </div>
                <p className="text-[11px] text-slate-500 mt-1">Applied to every transaction processed on the platform. Valid range: 0–100%.</p>
              </div>

              {/* ─── Toggle Section ─── */}
              <div className="pt-4 border-t border-slate-800/80 space-y-5">
                <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Security & Operations</p>

                {/* Maintenance Mode */}
                <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-900/60 border border-slate-800/80 hover:border-slate-700 transition-colors">
                  <div className="flex items-start gap-3">
                    <div className={`p-2 rounded-lg ${settings.maintenanceMode ? 'bg-red-500/15 border border-red-500/20' : 'bg-slate-800 border border-slate-700'}`}>
                      <AlertIcon className={`w-4 h-4 ${settings.maintenanceMode ? 'text-red-400' : 'text-slate-500'}`} />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-white">Maintenance Mode</h4>
                      <p className="text-xs text-slate-400 mt-0.5">Temporarily disable storefront checkouts and display a global warning banner.</p>
                      {settings.maintenanceMode && (
                        <span className="inline-flex items-center gap-1 mt-1.5 text-[10px] font-bold text-red-400 bg-red-500/10 border border-red-500/20 px-2 py-0.5 rounded-full">
                          <span className="w-1.5 h-1.5 bg-red-400 rounded-full animate-pulse" />
                          ACTIVE – Banner shown to all users
                        </span>
                      )}
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setSettings({ ...settings, maintenanceMode: !settings.maintenanceMode })}
                    className="flex-shrink-0 cursor-pointer"
                  >
                    {settings.maintenanceMode
                      ? <ToggleRight className="w-9 h-9 text-red-500 drop-shadow-[0_0_6px_rgba(239,68,68,0.5)]" />
                      : <ToggleLeft className="w-9 h-9 text-slate-600" />}
                  </button>
                </div>

                {/* 2FA Toggle */}
                <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-900/60 border border-slate-800/80 hover:border-slate-700 transition-colors">
                  <div className="flex items-start gap-3">
                    <div className={`p-2 rounded-lg ${settings.requireTwoFactor ? 'bg-emerald-500/15 border border-emerald-500/20' : 'bg-slate-800 border border-slate-700'}`}>
                      <Lock className={`w-4 h-4 ${settings.requireTwoFactor ? 'text-emerald-400' : 'text-slate-500'}`} />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-white">Require 2FA for Admin Access</h4>
                      <p className="text-xs text-slate-400 mt-0.5">Enforce two-factor authentication on all administrator accounts.</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setSettings({ ...settings, requireTwoFactor: !settings.requireTwoFactor })}
                    className="flex-shrink-0 cursor-pointer"
                  >
                    {settings.requireTwoFactor
                      ? <ToggleRight className="w-9 h-9 text-emerald-500 drop-shadow-[0_0_6px_rgba(16,185,129,0.4)]" />
                      : <ToggleLeft className="w-9 h-9 text-slate-600" />}
                  </button>
                </div>
              </div>
            </div>

            {/* ─── Save Button ─── */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={saveStatus === 'saving'}
                className={`inline-flex items-center gap-2.5 px-7 py-3 font-bold text-sm rounded-xl transition-all cursor-pointer shadow-lg ${
                  saveStatus === 'saved'
                    ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-600/25'
                    : 'bg-red-600 hover:bg-red-500 text-white shadow-red-600/25 disabled:opacity-70 disabled:cursor-not-allowed'
                }`}
              >
                {saveStatus === 'saving' && <Loader2 className="w-4 h-4 animate-spin" />}
                {saveStatus === 'saved' && <Check className="w-4 h-4" />}
                {saveStatus === 'idle' && <Save className="w-4 h-4" />}
                <span>
                  {saveStatus === 'saving' ? 'Saving...' : saveStatus === 'saved' ? 'Saved!' : 'Save Configuration'}
                </span>
              </button>
            </div>
          </form>

          {/* ─── Site Identity Section ─── */}
          <div className="bg-[#111827] border border-slate-800 p-8 rounded-3xl shadow-xl space-y-5">
            <div>
              <h2 className="text-lg font-bold text-white">Site Identity</h2>
              <p className="text-xs text-slate-400 mt-1">Upload your platform logo and browser favicon for brand consistency.</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {/* Platform Logo Upload Zone */}
              <div
                className="group relative flex flex-col items-center justify-center gap-3 p-8 rounded-2xl border-2 border-dashed border-slate-700 bg-[#0E1524] hover:bg-slate-800/60 hover:border-slate-600 transition-all cursor-pointer"
                onClick={() => alert('Logo upload would open file picker here.')}
                role="button"
                tabIndex={0}
              >
                <div className="p-3.5 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 group-hover:bg-indigo-500/15 transition-colors">
                  <UploadCloud className="w-7 h-7 text-indigo-400" />
                </div>
                <div className="text-center">
                  <p className="text-sm font-bold text-white">Platform Logo</p>
                  <p className="text-[11px] text-slate-400 mt-0.5">PNG, SVG or WebP · Max 2MB</p>
                  <p className="text-[11px] text-slate-500 mt-1">Recommended: 240×60 px</p>
                </div>
                <span className="text-[10px] font-bold text-indigo-400 bg-indigo-500/10 border border-indigo-500/20 px-3 py-1 rounded-full">
                  Click to Upload
                </span>
              </div>

              {/* Favicon Upload Zone */}
              <div
                className="group relative flex flex-col items-center justify-center gap-3 p-8 rounded-2xl border-2 border-dashed border-slate-700 bg-[#0E1524] hover:bg-slate-800/60 hover:border-slate-600 transition-all cursor-pointer"
                onClick={() => alert('Favicon upload would open file picker here.')}
                role="button"
                tabIndex={0}
              >
                <div className="p-3.5 rounded-2xl bg-purple-500/10 border border-purple-500/20 group-hover:bg-purple-500/15 transition-colors">
                  <UploadCloud className="w-7 h-7 text-purple-400" />
                </div>
                <div className="text-center">
                  <p className="text-sm font-bold text-white">Browser Favicon</p>
                  <p className="text-[11px] text-slate-400 mt-0.5">ICO, PNG or SVG · Max 512KB</p>
                  <p className="text-[11px] text-slate-500 mt-1">Recommended: 32×32 px</p>
                </div>
                <span className="text-[10px] font-bold text-purple-400 bg-purple-500/10 border border-purple-500/20 px-3 py-1 rounded-full">
                  Click to Upload
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ════════════════════════ GLOBAL TOAST NOTIFICATION ════════════════════════ */}
      {showToast && (
        <div className="fixed bottom-6 right-6 z-[200] flex items-center gap-3 px-5 py-3.5 bg-[#111827] border border-emerald-500/30 text-emerald-400 rounded-2xl shadow-2xl shadow-black/40 text-sm font-bold animate-in slide-in-from-bottom-4 fade-in duration-300">
          <div className="p-1.5 bg-emerald-500/15 rounded-lg">
            <Check className="w-4 h-4" />
          </div>
          <span>Settings successfully updated!</span>
          <button
            type="button"
            onClick={() => setShowToast(false)}
            className="ml-2 text-slate-500 hover:text-white cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* ════════════════════════ STYLISH ADD USER MODAL ════════════════════════ */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-[#0E1524] border border-slate-800 rounded-3xl w-full max-w-md overflow-hidden shadow-2xl p-6 space-y-6">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400">
                  <UserPlus className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">Add New User</h3>
                  <p className="text-xs text-slate-400">Create a new user account with role permissions.</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="text-slate-400 hover:text-white p-2 rounded-xl hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleCreateUserSubmit} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Elvin Abbasov"
                  value={newUserName}
                  onChange={(e) => setNewUserName(e.target.value)}
                  className="w-full bg-[#111827] border border-slate-800 text-white rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-red-500/50"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  required
                  placeholder="e.g. elvin@vendora.store"
                  value={newUserEmail}
                  onChange={(e) => setNewUserEmail(e.target.value)}
                  className="w-full bg-[#111827] border border-slate-800 text-white rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-red-500/50"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">
                    Role
                  </label>
                  <select
                    value={newUserRole}
                    onChange={(e) => setNewUserRole(e.target.value as 'Admin' | 'Vendor' | 'Customer')}
                    className="w-full bg-[#111827] border border-slate-800 text-white rounded-xl px-3 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-red-500/50 cursor-pointer font-bold"
                  >
                    <option value="Customer">Customer</option>
                    <option value="Vendor">Vendor</option>
                    <option value="Admin">Admin</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">
                    Status
                  </label>
                  <select
                    value={newUserStatus}
                    onChange={(e) => setNewUserStatus(e.target.value as 'Active' | 'Suspended')}
                    className="w-full bg-[#111827] border border-slate-800 text-white rounded-xl px-3 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-red-500/50 cursor-pointer font-bold"
                  >
                    <option value="Active">Active</option>
                    <option value="Suspended">Suspended</option>
                  </select>
                </div>
              </div>

              <div className="pt-4 flex items-center justify-end gap-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold rounded-xl transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-red-600 hover:bg-red-500 text-white text-xs font-bold rounded-xl transition-all shadow-lg shadow-red-600/20 flex items-center gap-2 cursor-pointer"
                >
                  <UserPlus className="w-4 h-4" />
                  <span>Create User</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* ════════════════════════ STYLISH ADD VENDOR MODAL ════════════════════════ */}
      {isAddVendorModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-[#0E1524] border border-slate-800 rounded-3xl w-full max-w-md overflow-hidden shadow-2xl p-6 space-y-6">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">
                  <Store className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">Add New Vendor</h3>
                  <p className="text-xs text-slate-400">Register a new merchant account on TradeHub.</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsAddVendorModalOpen(false)}
                className="text-slate-400 hover:text-white p-2 rounded-xl hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleCreateVendorSubmit} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">
                  Store Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Nexus Tech Baku"
                  value={newVendorStoreName}
                  onChange={(e) => setNewVendorStoreName(e.target.value)}
                  className="w-full bg-[#111827] border border-slate-800 text-white rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">
                  Owner Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Rashad Mammadov"
                  value={newVendorOwner}
                  onChange={(e) => setNewVendorOwner(e.target.value)}
                  className="w-full bg-[#111827] border border-slate-800 text-white rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  required
                  placeholder="e.g. contact@nexustech.az"
                  value={newVendorEmail}
                  onChange={(e) => setNewVendorEmail(e.target.value)}
                  className="w-full bg-[#111827] border border-slate-800 text-white rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">
                  Initial Status
                </label>
                <select
                  value={newVendorStatus}
                  onChange={(e) => setNewVendorStatus(e.target.value as 'Active' | 'Pending' | 'Suspended')}
                  className="w-full bg-[#111827] border border-slate-800 text-white rounded-xl px-3 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 cursor-pointer font-bold"
                >
                  <option value="Pending">Pending Approval</option>
                  <option value="Active">Active</option>
                  <option value="Suspended">Suspended</option>
                </select>
              </div>

              <div className="pt-4 flex items-center justify-end gap-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsAddVendorModalOpen(false)}
                  className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold rounded-xl transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl transition-all shadow-lg shadow-indigo-600/20 flex items-center gap-2 cursor-pointer"
                >
                  <Store className="w-4 h-4" />
                  <span>Save Vendor</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ════════════ ADD PRODUCT MODAL ════════════ */}
      <AddProductModal
        isOpen={isAddProductModalOpen}
        onClose={() => setIsAddProductModalOpen(false)}
        onSuccess={handleProductCreated}
      />
    </div>
  );
};

export default AdminDashboard;
