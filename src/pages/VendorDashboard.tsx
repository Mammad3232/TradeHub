import React, { useState, useRef } from 'react';
import {
  LayoutDashboard, Package, ShoppingCart, TrendingUp, Settings, LogOut,
  DollarSign, Users, ArrowUpRight, ArrowDownRight, Pencil, Trash2, Plus,
  X, Check, CreditCard, Building2, Mail, Store, Eye, AlertCircle,
  CheckCircle2, Activity, Percent, Save, UploadCloud, AtSign, Share2,
  Globe, Loader2, Calendar, MapPin, Clock, ChevronRight, Truck,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { RecentOrdersTable } from '../components/RecentOrdersTable';

// ─── Types ─────────────────────────────────────────────────────────────────────

type OrderStatus = 'Pending' | 'Processing' | 'Shipped' | 'Delivered' | 'Cancelled';
type ProductStatus = 'Active' | 'Draft' | 'Out of Stock';

interface Product {
  id: number;
  name: string;
  category: string;
  price: number;
  stock: number;
  status: ProductStatus;
  image: string;
  description: string;
}

interface OrderItem { emoji: string; name: string; qty: number; price: number; }
interface Order {
  id: string; customer: string; email: string; date: string;
  total: number; payment: string; status: OrderStatus;
  address: string; items: OrderItem[];
}

// ─── Mock Data ──────────────────────────────────────────────────────────────────

const INITIAL_PRODUCTS: Product[] = [
  { id: 1, name: 'Wireless ANC Headphones',    category: 'Electronics', price: 149.99, stock: 42,  status: 'Active',        image: '🎧', description: 'Premium noise-cancelling wireless headphones with 30h battery.' },
  { id: 2, name: 'Mechanical Gaming Keyboard',  category: 'Electronics', price: 89.99,  stock: 18,  status: 'Active',        image: '⌨️', description: 'Tactile RGB mechanical keyboard with Cherry MX switches.' },
  { id: 3, name: 'Ergonomic Office Chair',      category: 'Furniture',   price: 329.00, stock: 7,   status: 'Active',        image: '🪑', description: 'Lumbar-support mesh chair for all-day comfort.' },
  { id: 4, name: '4K Ultra-Wide Monitor',       category: 'Electronics', price: 549.99, stock: 0,   status: 'Out of Stock',  image: '🖥️', description: '34-inch curved 4K ultrawide, 165Hz gaming monitor.' },
  { id: 5, name: 'Leather Minimalist Wallet',   category: 'Fashion',     price: 34.99,  stock: 120, status: 'Active',        image: '👛', description: 'Slim genuine leather bifold wallet, RFID protected.' },
  { id: 6, name: 'Smart Fitness Tracker',       category: 'Fitness',     price: 79.99,  stock: 55,  status: 'Draft',         image: '⌚', description: 'Heart-rate, SpO2 and sleep tracking smartband.' },
];

const INITIAL_ORDERS: Order[] = [
  { id: '#VND-8821', customer: 'Sarah Johnson',  email: 'sarah@email.com',  date: '2025-07-18', total: 239.98, payment: 'Card',          status: 'Delivered',
    address: '42 Maple Avenue, New York, NY 10001, USA',
    items: [{ emoji:'🎧', name:'Wireless ANC Headphones', qty:1, price:149.99 }, { emoji:'👛', name:'Leather Minimalist Wallet', qty:2, price:44.99 }] },
  { id: '#VND-8820', customer: 'Marcus Lee',     email: 'marcus@email.com', date: '2025-07-17', total: 549.99, payment: 'PayPal',        status: 'Shipped',
    address: '17 Oak Street, San Francisco, CA 94102, USA',
    items: [{ emoji:'🖥️', name:'4K Ultra-Wide Monitor', qty:1, price:549.99 }] },
  { id: '#VND-8819', customer: 'Aisha Patel',    email: 'aisha@email.com',  date: '2025-07-16', total: 89.99,  payment: 'Card',          status: 'Processing',
    address: '8 Elm Close, London, E1 6RF, United Kingdom',
    items: [{ emoji:'⌨️', name:'Mechanical Gaming Keyboard', qty:1, price:89.99 }] },
  { id: '#VND-8818', customer: 'Tom Ritter',     email: 'tom@email.com',    date: '2025-07-15', total: 364.99, payment: 'Bank Transfer', status: 'Pending',
    address: 'Bahnhofstr. 12, 80335 München, Germany',
    items: [{ emoji:'🪑', name:'Ergonomic Office Chair', qty:1, price:329.00 }, { emoji:'⌚', name:'Smart Fitness Tracker', qty:1, price:35.99 }] },
  { id: '#VND-8817', customer: 'Lena Müller',    email: 'lena@email.com',   date: '2025-07-14', total: 34.99,  payment: 'Card',          status: 'Delivered',
    address: 'Kurfürstendamm 23, 10719 Berlin, Germany',
    items: [{ emoji:'👛', name:'Leather Minimalist Wallet', qty:1, price:34.99 }] },
  { id: '#VND-8816', customer: 'Carlos Mendez',  email: 'carlos@email.com', date: '2025-07-12', total: 79.99,  payment: 'PayPal',        status: 'Cancelled',
    address: 'Av. Insurgentes Sur 1234, Ciudad de México, CDMX 03920, México',
    items: [{ emoji:'⌚', name:'Smart Fitness Tracker', qty:1, price:79.99 }] },
];

const MONTHLY_DATA = [
  { month: 'Jan', value: 3200, pct: 38 }, { month: 'Feb', value: 4100, pct: 49 },
  { month: 'Mar', value: 3750, pct: 44 }, { month: 'Apr', value: 5200, pct: 62 },
  { month: 'May', value: 4800, pct: 57 }, { month: 'Jun', value: 6300, pct: 75 },
  { month: 'Jul', value: 7100, pct: 84 }, { month: 'Aug', value: 5900, pct: 70 },
  { month: 'Sep', value: 8400, pct: 100 },{ month: 'Oct', value: 7600, pct: 90 },
  { month: 'Nov', value: 6200, pct: 74 }, { month: 'Dec', value: 7800, pct: 93 },
];

const ANALYTICS_BY_RANGE: Record<string, typeof MONTHLY_DATA> = {
  'Last 7 Days':  MONTHLY_DATA.slice(9),
  'Last 30 Days': MONTHLY_DATA.slice(6),
  'This Year':    MONTHLY_DATA,
};

// ─── Helpers ───────────────────────────────────────────────────────────────────

const stockBadge = (stock: number) => {
  if (stock === 0) return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold border bg-red-500/10 text-red-400 border-red-500/20">Out of Stock</span>;
  if (stock < 10)  return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold border bg-amber-500/10 text-amber-400 border-amber-500/20">Low Stock · {stock}</span>;
  return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold border bg-emerald-500/10 text-emerald-400 border-emerald-500/20">In Stock · {stock}</span>;
};

const orderTimelineSteps: Record<OrderStatus, number> = {
  Pending: 0, Processing: 1, Shipped: 2, Delivered: 3, Cancelled: -1,
};

const inputCls = 'w-full bg-[#0B1120] border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500/40 focus:border-purple-500/60 transition-all';

// ─── Main Component ─────────────────────────────────────────────────────────────

export const VendorDashboard: React.FC = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const logoInputRef = useRef<HTMLInputElement>(null);

  // ── Navigation
  const [activeTab, setActiveTab] = useState('Dashboard');

  // ── Products
  const [products, setProducts] = useState<Product[]>(INITIAL_PRODUCTS);
  const [showProductModal, setShowProductModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [productForm, setProductForm] = useState({
    name: '', category: 'Electronics', price: '', stock: '',
    status: 'Active' as ProductStatus, image: '📦', description: '',
  });
  const [deleteConfirmId, setDeleteConfirmId] = useState<number | null>(null);
  const [dragOver, setDragOver] = useState(false);

  // ── Orders
  const [orders, setOrders] = useState<Order[]>(INITIAL_ORDERS);
  const [viewOrderId, setViewOrderId] = useState<string | null>(null);

  // ── Analytics
  const [dateRange, setDateRange] = useState('This Year');

  // ── Settings
  const [settings, setSettings] = useState({
    storeName: 'TechStore Co.',
    description: 'Premium electronics and lifestyle products for the modern buyer.',
    email: 'support@techstore.com',
    phoneCode: '+1',
    phoneNumber: '(555) 204-9900',
    payoutMethod: 'Bank Transfer',
    iban: 'DE89 3704 0044 0532 0130 00',
    instagram: 'techstore.co',
    facebook: 'TechStoreCo',
    website: 'https://techstore.co',
    logoUrl: '',
  });
  const [saveState, setSaveState] = useState<'idle' | 'saving' | 'saved'>('idle');

  // ─── Handlers ──────────────────────────────────────────────────────────────

  const openAddModal = () => {
    setEditingProduct(null);
    setProductForm({ name: '', category: 'Electronics', price: '', stock: '', status: 'Active', image: '📦', description: '' });
    setShowProductModal(true);
  };

  const openEditModal = (p: Product) => {
    setEditingProduct(p);
    setProductForm({ name: p.name, category: p.category, price: String(p.price), stock: String(p.stock), status: p.status, image: p.image, description: p.description });
    setShowProductModal(true);
  };

  const handleProductSave = () => {
    if (!productForm.name.trim() || !productForm.price) return;
    const parsed: Product = {
      id: editingProduct?.id ?? Date.now(),
      name: productForm.name, category: productForm.category,
      price: parseFloat(productForm.price), stock: parseInt(productForm.stock) || 0,
      status: productForm.status, image: productForm.image, description: productForm.description,
    };
    setProducts(ps => editingProduct ? ps.map(p => p.id === editingProduct.id ? parsed : p) : [parsed, ...ps]);
    setShowProductModal(false);
  };

  const handleDeleteProduct = (id: number) => {
    setProducts(ps => ps.filter(p => p.id !== id));
    setDeleteConfirmId(null);
  };

  const handleOrderStatusChange = (orderId: string, status: OrderStatus) =>
    setOrders(os => os.map(o => o.id === orderId ? { ...o, status } : o));

  const handleSettingsSave = () => {
    setSaveState('saving');
    setTimeout(() => {
      setSaveState('saved');
      setTimeout(() => setSaveState('idle'), 2000);
    }, 1000);
  };

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setSettings(s => ({ ...s, logoUrl: url }));
    }
  };

  const viewOrder = orders.find(o => o.id === viewOrderId) ?? null;
  const chartData = ANALYTICS_BY_RANGE[dateRange] ?? MONTHLY_DATA;

  const navItems = [
    { id: 'Dashboard', icon: <LayoutDashboard className="w-4 h-4" />, label: 'Dashboard' },
    { id: 'Products',  icon: <Package className="w-4 h-4" />,         label: 'Products', badge: products.length },
    { id: 'Orders',    icon: <ShoppingCart className="w-4 h-4" />,    label: 'Orders',   badge: orders.filter(o => o.status === 'Pending').length },
    { id: 'Analytics', icon: <TrendingUp className="w-4 h-4" />,      label: 'Analytics' },
    { id: 'Settings',  icon: <Settings className="w-4 h-4" />,        label: 'Settings' },
  ];

  // ─── Render ─────────────────────────────────────────────────────────────────

  return (
    <div className="flex h-screen w-full bg-[#060913] text-white overflow-hidden font-sans">

      {/* ══════════════ SIDEBAR ══════════════ */}
      <aside className="w-64 bg-[#0B1120] border-r border-slate-800/80 flex flex-col flex-shrink-0 hidden lg:flex text-left">
        <div className="h-20 flex items-center px-6 border-b border-slate-800/80 flex-shrink-0">
          <div className="w-8 h-8 bg-purple-600 rounded-lg flex items-center justify-center mr-3 shadow-lg shadow-purple-600/25">
            <Package className="w-5 h-5 text-white" />
          </div>
          <span className="text-lg font-bold tracking-tight text-white">Vendora Panel</span>
        </div>

        <nav className="flex-grow px-4 py-6 space-y-1 overflow-y-auto">
          {navItems.map(item => (
            <button key={item.id} type="button" onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center px-4 py-3 rounded-xl font-semibold text-sm transition-all cursor-pointer gap-3 ${
                activeTab === item.id ? 'bg-purple-600 text-white shadow-md shadow-purple-600/20' : 'text-slate-400 hover:text-white hover:bg-slate-800/40'}`}>
              {item.icon}
              <span className="flex-grow text-left">{item.label}</span>
              {item.badge !== undefined && item.badge > 0 && (
                <span className={`text-xs px-2 py-0.5 rounded-full font-bold ${activeTab === item.id ? 'bg-white/20 text-white' : 'bg-purple-500/20 text-purple-400 border border-purple-500/20'}`}>
                  {item.badge}
                </span>
              )}
            </button>
          ))}
        </nav>

        <div className="mx-4 mb-3 p-3 bg-purple-600/10 border border-purple-500/15 rounded-xl">
          <p className="text-xs text-purple-300 font-semibold">{settings.storeName}</p>
          <p className="text-[10px] text-slate-500 mt-0.5 truncate">{settings.email}</p>
        </div>

        <div className="p-4 border-t border-slate-800/80">
          <button type="button" onClick={() => navigate('/')}
            className="flex items-center w-full px-4 py-3 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-xl transition-colors font-semibold text-sm cursor-pointer gap-3">
            <LogOut className="w-4 h-4 flex-shrink-0" />
            <span>Exit Dashboard</span>
          </button>
        </div>
      </aside>

      {/* ══════════════ MAIN ══════════════ */}
      <main className="flex-grow flex flex-col overflow-y-auto">

        {/* Top Bar */}
        <header className="h-20 bg-[#0B1120]/60 backdrop-blur-md border-b border-slate-800/80 flex items-center justify-between px-6 sm:px-8 sticky top-0 z-10 flex-shrink-0">
          <div>
            <h1 className="text-xl font-bold text-white tracking-tight">{navItems.find(n => n.id === activeTab)?.label ?? 'Dashboard'}</h1>
            <p className="text-xs text-slate-400">Vendora Vendor Portal · {settings.storeName}</p>
          </div>
          <div className="flex items-center gap-3">
            {activeTab === 'Products' && (
              <button type="button" onClick={openAddModal}
                className="hidden sm:inline-flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white text-sm font-semibold rounded-xl transition-colors shadow-lg shadow-purple-600/20 cursor-pointer">
                <Plus className="w-4 h-4" /> Add Product
              </button>
            )}
            <div className="w-9 h-9 rounded-full bg-purple-600/15 text-purple-400 border border-purple-500/20 flex items-center justify-center font-bold text-xs select-none">TS</div>
          </div>
        </header>

        <div className="p-6 sm:p-8 max-w-7xl w-full mx-auto flex-grow">

          {/* ══════════ DASHBOARD ══════════ */}
          {activeTab === 'Dashboard' && (
            <div className="space-y-8">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                {[
                  { label: 'Total Revenue',  value: '$24,592', sub: '+12.5%', icon: <DollarSign className="w-5 h-5" />,   color: 'emerald', up: true },
                  { label: 'Active Orders',  value: '142',     sub: '+8.2%',  icon: <ShoppingCart className="w-5 h-5" />, color: 'purple',  up: true },
                  { label: 'Total Products', value: String(products.length), sub: 'In catalog', icon: <Package className="w-5 h-5" />, color: 'blue', up: true },
                  { label: 'Store Views',    value: '12.4K',   sub: '+24.8%', icon: <Users className="w-5 h-5" />,        color: 'amber',   up: true },
                ].map(card => (
                  <div key={card.label} className="bg-[#111827] p-5 rounded-2xl border border-slate-800/80 hover:border-slate-700 transition-all shadow-xl text-left relative group">
                    <div className="flex justify-between items-start mb-3">
                      <div className={`w-10 h-10 rounded-xl bg-${card.color}-500/10 text-${card.color}-400 flex items-center justify-center`}>{card.icon}</div>
                      <span className={`flex items-center text-${card.color}-400 text-xs font-bold gap-0.5 bg-${card.color}-500/5 px-2 py-0.5 rounded-md border border-${card.color}-500/10`}>
                        {card.sub} {card.up ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                      </span>
                    </div>
                    <p className="text-slate-400 text-[11px] font-semibold uppercase tracking-wider">{card.label}</p>
                    <p className="text-2xl font-extrabold text-white mt-1">{card.value}</p>
                  </div>
                ))}
              </div>
              <div className="bg-[#111827] rounded-2xl border border-slate-800/80 overflow-hidden">
                <div className="px-6 py-4 border-b border-slate-800/60 flex items-center justify-between">
                  <h2 className="text-base font-bold text-white">Recent Orders</h2>
                  <button onClick={() => setActiveTab('Orders')} className="text-xs text-purple-400 hover:text-purple-300 font-semibold cursor-pointer">View all →</button>
                </div>
                <RecentOrdersTable />
              </div>
            </div>
          )}

          {/* ══════════ PRODUCTS ══════════ */}
          {activeTab === 'Products' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-bold text-white">Product Catalog</h2>
                  <p className="text-xs text-slate-400 mt-0.5">{products.length} items · {products.filter(p => p.stock === 0).length} out of stock</p>
                </div>
                <button type="button" onClick={openAddModal}
                  className="inline-flex items-center gap-2 px-4 py-2.5 bg-purple-600 hover:bg-purple-500 text-white text-sm font-semibold rounded-xl transition-colors shadow-lg shadow-purple-600/20 cursor-pointer">
                  <Plus className="w-4 h-4" /> Add Product
                </button>
              </div>

              <div className="bg-[#111827] rounded-2xl border border-slate-800/80 overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-slate-800/60">
                      {['Product', 'Category', 'Price', 'Stock Status', 'Actions'].map(h => (
                        <th key={h} className="text-left px-5 py-3.5 text-[11px] font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {products.map((p, i) => (
                      <tr key={p.id} className={`border-b border-slate-800/40 hover:bg-slate-800/20 transition-colors ${i === products.length - 1 ? 'border-b-0' : ''}`}>
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-3">
                            <span className="text-2xl">{p.image}</span>
                            <div>
                              <p className="font-semibold text-white text-sm">{p.name}</p>
                              <p className="text-[11px] text-slate-500 line-clamp-1 max-w-[200px]">{p.description}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-5 py-4 text-slate-400 text-sm">{p.category}</td>
                        <td className="px-5 py-4 text-white font-bold">${p.price.toFixed(2)}</td>
                        <td className="px-5 py-4">{stockBadge(p.stock)}</td>
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-2">
                            <button type="button" onClick={() => openEditModal(p)}
                              className="p-2 rounded-lg text-slate-400 hover:text-blue-400 hover:bg-blue-500/10 transition-colors cursor-pointer" title="Edit">
                              <Pencil className="w-3.5 h-3.5" />
                            </button>
                            {deleteConfirmId === p.id ? (
                              <div className="flex items-center gap-1.5 bg-red-500/10 border border-red-500/20 rounded-xl px-2 py-1">
                                <AlertCircle className="w-3.5 h-3.5 text-red-400 flex-shrink-0" />
                                <span className="text-[11px] text-red-300 font-semibold">Delete?</span>
                                <button type="button" onClick={() => handleDeleteProduct(p.id)}
                                  className="px-2 py-0.5 bg-red-600 hover:bg-red-500 text-white text-[11px] rounded-lg font-bold cursor-pointer transition-colors">Yes</button>
                                <button type="button" onClick={() => setDeleteConfirmId(null)}
                                  className="px-2 py-0.5 bg-slate-700 hover:bg-slate-600 text-slate-300 text-[11px] rounded-lg cursor-pointer transition-colors">No</button>
                              </div>
                            ) : (
                              <button type="button" onClick={() => setDeleteConfirmId(p.id)}
                                className="p-2 rounded-lg text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-colors cursor-pointer" title="Delete">
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ══════════ ORDERS ══════════ */}
          {activeTab === 'Orders' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-lg font-bold text-white">Order Management</h2>
                <p className="text-xs text-slate-400 mt-0.5">{orders.length} total · {orders.filter(o => o.status === 'Pending').length} pending</p>
              </div>

              <div className="flex flex-wrap gap-3">
                {(['Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled'] as OrderStatus[]).map(s => {
                  const count = orders.filter(o => o.status === s).length;
                  const cls: Record<OrderStatus, string> = {
                    Pending: 'bg-amber-500/10 text-amber-400 border-amber-500/20', Processing: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
                    Shipped: 'bg-purple-500/10 text-purple-400 border-purple-500/20', Delivered: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
                    Cancelled: 'bg-red-500/10 text-red-400 border-red-500/20',
                  };
                  return (
                    <span key={s} className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-bold ${cls[s]}`}>
                      {s} <span className="opacity-70">{count}</span>
                    </span>
                  );
                })}
              </div>

              <div className="bg-[#111827] rounded-2xl border border-slate-800/80 overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-slate-800/60">
                      {['Order ID', 'Customer', 'Date', 'Total', 'Payment', 'Status', 'Actions'].map(h => (
                        <th key={h} className="text-left px-5 py-3.5 text-[11px] font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {orders.map((o, i) => (
                      <tr key={o.id} className={`border-b border-slate-800/40 hover:bg-slate-800/20 transition-colors ${i === orders.length - 1 ? 'border-b-0' : ''}`}>
                        <td className="px-5 py-4 font-mono text-purple-400 text-xs font-bold">{o.id}</td>
                        <td className="px-5 py-4">
                          <p className="font-semibold text-white text-sm">{o.customer}</p>
                          <p className="text-[11px] text-slate-500">{o.email}</p>
                        </td>
                        <td className="px-5 py-4 text-slate-400 text-sm whitespace-nowrap">{o.date}</td>
                        <td className="px-5 py-4 text-white font-bold">${o.total.toFixed(2)}</td>
                        <td className="px-5 py-4 text-slate-400 text-sm">{o.payment}</td>
                        <td className="px-5 py-4">
                          <select value={o.status} onChange={e => handleOrderStatusChange(o.id, e.target.value as OrderStatus)}
                            className="bg-[#0B1120] border border-slate-700 text-xs font-bold text-slate-200 rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-purple-500 cursor-pointer transition-colors hover:border-slate-600">
                            {(['Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled'] as OrderStatus[]).map(s => (
                              <option key={s} value={s}>{s}</option>
                            ))}
                          </select>
                        </td>
                        <td className="px-5 py-4">
                          <button type="button" onClick={() => setViewOrderId(o.id)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-300 hover:text-white bg-slate-800/60 hover:bg-slate-700 transition-colors cursor-pointer border border-slate-700/60">
                            <Eye className="w-3.5 h-3.5" /> Details
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ══════════ ANALYTICS ══════════ */}
          {activeTab === 'Analytics' && (
            <div className="space-y-8">
              <div className="flex items-center justify-between flex-wrap gap-3">
                <div>
                  <h2 className="text-lg font-bold text-white">Analytics & Insights</h2>
                  <p className="text-xs text-slate-400 mt-0.5">Performance metrics for your store</p>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-slate-400" />
                  <select value={dateRange} onChange={e => setDateRange(e.target.value)}
                    className="bg-[#111827] border border-slate-700 text-sm font-semibold text-slate-200 rounded-xl px-3 py-2 focus:outline-none focus:ring-1 focus:ring-purple-500 cursor-pointer hover:border-slate-600 transition-colors">
                    {['Last 7 Days', 'Last 30 Days', 'This Year'].map(r => <option key={r}>{r}</option>)}
                  </select>
                </div>
              </div>

              {/* KPI cards */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
                {[
                  { label: 'Total Revenue',    value: '$24,592', sub: '+12.5% vs last year',   icon: <DollarSign className="w-5 h-5" />,  color: 'emerald', up: true  },
                  { label: 'Conversion Rate',  value: '3.84%',   sub: '+0.6% vs last month',   icon: <Percent className="w-5 h-5" />,    color: 'purple',  up: true  },
                  { label: 'Total Page Views', value: '148.2K',  sub: '+31% vs last quarter',  icon: <Eye className="w-5 h-5" />,        color: 'blue',    up: true  },
                  { label: 'Avg Bounce Rate',  value: '41.3%',   sub: '-5.2% improved',        icon: <Activity className="w-5 h-5" />,   color: 'amber',   up: false },
                ].map(card => (
                  <div key={card.label} className="bg-[#111827] p-5 rounded-2xl border border-slate-800/80 text-left">
                    <div className={`w-10 h-10 rounded-xl bg-${card.color}-500/10 text-${card.color}-400 flex items-center justify-center mb-3`}>{card.icon}</div>
                    <p className="text-slate-500 text-[11px] font-semibold uppercase tracking-wider">{card.label}</p>
                    <p className="text-2xl font-extrabold text-white mt-1 mb-1">{card.value}</p>
                    <p className={`text-xs font-semibold flex items-center gap-0.5 ${card.up ? 'text-emerald-400' : 'text-red-400'}`}>
                      {card.up ? <ArrowUpRight className="w-3.5 h-3.5" /> : <ArrowDownRight className="w-3.5 h-3.5" />}{card.sub}
                    </p>
                  </div>
                ))}
              </div>

              {/* Bar Chart */}
              <div className="bg-[#111827] rounded-2xl border border-slate-800/80 p-6">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h3 className="text-base font-bold text-white">Monthly Revenue</h3>
                    <p className="text-xs text-slate-500 mt-0.5">{dateRange}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-sm bg-purple-500 inline-block" />
                    <span className="text-xs text-slate-400">Revenue ($)</span>
                  </div>
                </div>
                <div className="flex items-end gap-2 h-48">
                  {chartData.map(m => (
                    <div key={m.month} className="flex-1 flex flex-col items-center gap-1.5 group min-w-0">
                      <div className="w-full relative rounded-t-lg overflow-hidden transition-all duration-500" style={{ height: `${m.pct}%` }}>
                        <div className="absolute inset-0 bg-gradient-to-t from-purple-700 to-purple-400 opacity-80 group-hover:opacity-100 transition-opacity" />
                        <div className="absolute top-0 left-0 right-0 h-0.5 bg-purple-300/60" />
                        <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-slate-700 text-white text-[10px] font-bold px-2 py-0.5 rounded-md opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                          ${(m.value / 1000).toFixed(1)}K
                        </div>
                      </div>
                      <span className="text-[10px] text-slate-500 font-semibold truncate w-full text-center">{m.month}</span>
                    </div>
                  ))}
                </div>
                <div className="flex justify-between mt-4 border-t border-slate-800/60 pt-3">
                  <span className="text-[10px] text-slate-600">$0</span>
                  <span className="text-[10px] text-slate-600">$4K</span>
                  <span className="text-[10px] text-slate-600">$8K</span>
                </div>
              </div>

              {/* Top Selling Products */}
              <div className="bg-[#111827] rounded-2xl border border-slate-800/80 overflow-hidden">
                <div className="px-6 py-4 border-b border-slate-800/60 flex items-center justify-between">
                  <h3 className="text-base font-bold text-white">Top Selling Products</h3>
                  <span className="text-xs text-slate-500">{dateRange}</span>
                </div>
                <div className="divide-y divide-slate-800/40">
                  {[
                    { name: '4K Ultra-Wide Monitor',       emoji: '🖥️', units: 98,  revenue: 53899, pct: 34 },
                    { name: 'Wireless ANC Headphones',     emoji: '🎧', units: 210, revenue: 31497, pct: 20 },
                    { name: 'Ergonomic Office Chair',      emoji: '🪑', units: 67,  revenue: 22043, pct: 14 },
                    { name: 'Mechanical Gaming Keyboard',  emoji: '⌨️', units: 145, revenue: 13048, pct: 8  },
                    { name: 'Smart Fitness Tracker',       emoji: '⌚', units: 88,  revenue: 7039,  pct: 5  },
                  ].map((row, i) => (
                    <div key={i} className="flex items-center gap-4 px-6 py-4 hover:bg-slate-800/20 transition-colors">
                      <span className="text-2xl w-10 text-center flex-shrink-0">{row.emoji}</span>
                      <div className="flex-grow min-w-0">
                        <p className="font-semibold text-white text-sm truncate">{row.name}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <div className="flex-1 bg-slate-800 rounded-full h-1.5 max-w-[140px] overflow-hidden">
                            <div className="h-full bg-purple-500 rounded-full transition-all duration-700" style={{ width: `${row.pct * 2.5}%` }} />
                          </div>
                          <span className="text-[11px] text-slate-500">{row.units} units</span>
                        </div>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <p className="text-white font-bold text-sm">${row.revenue.toLocaleString()}</p>
                        <p className="text-[11px] text-purple-400 font-semibold">{row.pct}% share</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ══════════ SETTINGS ══════════ */}
          {activeTab === 'Settings' && (
            <div className="space-y-6 max-w-2xl">
              <div>
                <h2 className="text-lg font-bold text-white">Store Settings</h2>
                <p className="text-xs text-slate-400 mt-0.5">Manage your public profile and payout details</p>
              </div>

              {/* Save banner */}
              {saveState === 'saved' && (
                <div className="flex items-center gap-3 bg-emerald-500/10 border border-emerald-500/25 text-emerald-400 rounded-xl px-4 py-3 text-sm font-semibold">
                  <CheckCircle2 className="w-4 h-4 flex-shrink-0" /> Settings saved successfully!
                </div>
              )}

              {/* ── Store Profile ── */}
              <div className="bg-[#111827] rounded-2xl border border-slate-800/80 p-6 space-y-5">
                <div className="flex items-center gap-3 mb-1">
                  <div className="w-8 h-8 rounded-lg bg-purple-600/15 text-purple-400 flex items-center justify-center"><Store className="w-4 h-4" /></div>
                  <h3 className="text-base font-bold text-white">Store Profile</h3>
                </div>

                {/* Logo Upload */}
                <div className="flex items-center gap-5">
                  <div className="w-20 h-20 rounded-2xl bg-[#0B1120] border-2 border-dashed border-slate-700 flex items-center justify-center overflow-hidden flex-shrink-0 group hover:border-purple-500/50 transition-colors cursor-pointer"
                    onClick={() => logoInputRef.current?.click()}>
                    {settings.logoUrl
                      ? <img src={settings.logoUrl} alt="logo" className="w-full h-full object-cover" />
                      : <span className="text-3xl">{settings.storeName[0]}</span>}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-white mb-1">Store Logo</p>
                    <p className="text-xs text-slate-500 mb-2">PNG, JPG or WEBP. Recommended 256×256px.</p>
                    <button type="button" onClick={() => logoInputRef.current?.click()}
                      className="inline-flex items-center gap-2 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg text-xs font-semibold text-slate-300 hover:text-white transition-colors cursor-pointer">
                      <UploadCloud className="w-3.5 h-3.5" /> Upload Image
                    </button>
                    <input ref={logoInputRef} type="file" accept="image/*" className="hidden" onChange={handleLogoChange} />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 mb-1.5">Store Name</label>
                    <input type="text" value={settings.storeName} onChange={e => setSettings(s => ({ ...s, storeName: e.target.value }))} className={inputCls} />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 mb-1.5">Contact Email</label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" />
                      <input type="email" value={settings.email} onChange={e => setSettings(s => ({ ...s, email: e.target.value }))} className={`${inputCls} pl-9`} />
                    </div>
                  </div>
                  {/* Advanced Phone Input */}
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-semibold text-slate-400 mb-1.5">Phone Number</label>
                    <div className="flex rounded-xl overflow-hidden border border-slate-700 focus-within:ring-2 focus-within:ring-purple-500/40 focus-within:border-purple-500/60 transition-all">
                      <select value={settings.phoneCode} onChange={e => setSettings(s => ({ ...s, phoneCode: e.target.value }))}
                        className="bg-[#1A2333] border-r border-slate-700 text-sm text-slate-300 px-3 py-2.5 focus:outline-none cursor-pointer flex-shrink-0">
                        {['+994 🇦🇿', '+1 🇺🇸', '+90 🇹🇷', '+44 🇬🇧', '+49 🇩🇪', '+33 🇫🇷', '+7 🇷🇺', '+86 🇨🇳'].map(c => {
                          const code = c.split(' ')[0];
                          return <option key={code} value={code}>{c}</option>;
                        })}
                      </select>
                      <input type="tel" value={settings.phoneNumber} onChange={e => setSettings(s => ({ ...s, phoneNumber: e.target.value }))}
                        placeholder="(555) 000-0000"
                        className="flex-1 bg-[#0B1120] px-4 py-2.5 text-sm text-white placeholder:text-slate-500 focus:outline-none" />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1.5">Store Description</label>
                  <textarea rows={3} value={settings.description} onChange={e => setSettings(s => ({ ...s, description: e.target.value }))} className={`${inputCls} resize-none`} />
                </div>

                {/* Social Links */}
                <div className="pt-2 border-t border-slate-800/60">
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Social Links</p>
                  <div className="space-y-3">
                    <div className="relative">
                      <AtSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-pink-400 pointer-events-none" />
                      <input type="text" value={settings.instagram} onChange={e => setSettings(s => ({ ...s, instagram: e.target.value }))}
                        placeholder="Instagram handle" className={`${inputCls} pl-9`} />
                    </div>
                    <div className="relative">
                      <Share2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-blue-400 pointer-events-none" />
                      <input type="text" value={settings.facebook} onChange={e => setSettings(s => ({ ...s, facebook: e.target.value }))}
                        placeholder="Facebook page name" className={`${inputCls} pl-9`} />
                    </div>
                    <div className="relative">
                      <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                      <input type="url" value={settings.website} onChange={e => setSettings(s => ({ ...s, website: e.target.value }))}
                        placeholder="https://yourstore.com" className={`${inputCls} pl-9`} />
                    </div>
                  </div>
                </div>
              </div>

              {/* ── Payout Methods ── */}
              <div className="bg-[#111827] rounded-2xl border border-slate-800/80 p-6 space-y-5">
                <div className="flex items-center gap-3 mb-1">
                  <div className="w-8 h-8 rounded-lg bg-emerald-600/15 text-emerald-400 flex items-center justify-center"><CreditCard className="w-4 h-4" /></div>
                  <h3 className="text-base font-bold text-white">Payout Methods</h3>
                </div>
                <div className="flex items-start gap-3 bg-amber-500/5 border border-amber-500/15 rounded-xl p-3">
                  <AlertCircle className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
                  <p className="text-xs text-amber-300/80">Payout details are encrypted and stored securely. Changes take 1–2 business days to reflect.</p>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 mb-1.5">Payout Method</label>
                    <div className="relative">
                      <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" />
                      <select value={settings.payoutMethod} onChange={e => setSettings(s => ({ ...s, payoutMethod: e.target.value }))}
                        className={`${inputCls} pl-9 appearance-none cursor-pointer`}>
                        {['Bank Transfer', 'Debit Card', 'PayPal', 'Stripe'].map(m => <option key={m}>{m}</option>)}
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 mb-1.5">
                      {settings.payoutMethod === 'Bank Transfer' ? 'IBAN' : 'Account / Email'}
                    </label>
                    <input type="text" value={settings.iban} onChange={e => setSettings(s => ({ ...s, iban: e.target.value }))}
                      className={inputCls}
                      placeholder={settings.payoutMethod === 'Bank Transfer' ? 'DE89 3704 0044 ...' : 'account@email.com'} />
                  </div>
                </div>
              </div>

              {/* Save button — 3-state */}
              <button type="button" onClick={handleSettingsSave} disabled={saveState !== 'idle'}
                className={`inline-flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-sm transition-all cursor-pointer shadow-lg ${
                  saveState === 'saved'   ? 'bg-emerald-600 text-white shadow-emerald-600/20' :
                  saveState === 'saving'  ? 'bg-purple-600/70 text-white shadow-purple-600/10 cursor-not-allowed' :
                                           'bg-purple-600 hover:bg-purple-500 text-white shadow-purple-600/20'}`}>
                {saveState === 'saving' && <Loader2 className="w-4 h-4 animate-spin" />}
                {saveState === 'saved'  && <Check className="w-4 h-4" />}
                {saveState === 'idle'   && <Save className="w-4 h-4" />}
                {saveState === 'saving' ? 'Saving...' : saveState === 'saved' ? 'Saved!' : 'Save Changes'}
              </button>
            </div>
          )}

        </div>
      </main>

      {/* ══════════ PRODUCT MODAL ══════════ */}
      {showProductModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/75 backdrop-blur-sm" onClick={() => setShowProductModal(false)} />
          <div className="relative bg-[#0E1524] border border-slate-700/80 rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden">
            {/* Modal header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800/60">
              <h2 className="text-lg font-bold text-white">{editingProduct ? 'Edit Product' : 'Add New Product'}</h2>
              <button type="button" onClick={() => setShowProductModal(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-700 transition-colors cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 space-y-5 max-h-[80vh] overflow-y-auto">
              {/* Image Upload zone */}
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-2">Product Image</label>
                <div
                  onDragOver={e => { e.preventDefault(); setDragOver(true); }}
                  onDragLeave={() => setDragOver(false)}
                  onDrop={e => { e.preventDefault(); setDragOver(false); }}
                  onClick={() => fileInputRef.current?.click()}
                  className={`flex flex-col items-center justify-center gap-2 h-28 rounded-xl border-2 border-dashed cursor-pointer transition-all ${
                    dragOver ? 'border-purple-500 bg-purple-500/10' : 'border-slate-700 bg-[#0B1120] hover:border-slate-600 hover:bg-slate-800/30'}`}>
                  <span className="text-4xl">{productForm.image}</span>
                  <div className="flex items-center gap-1.5 text-slate-400">
                    <UploadCloud className="w-3.5 h-3.5" />
                    <span className="text-xs">Drag & drop or click to upload</span>
                  </div>
                  <span className="text-[10px] text-slate-600">PNG, JPG, WEBP up to 5 MB</span>
                </div>
                <input ref={fileInputRef} type="file" accept="image/*" className="hidden" />
                {/* Emoji quick-pick for demo */}
                <div className="flex gap-2 mt-2 flex-wrap">
                  {['📦','🎧','⌨️','🖥️','🪑','👛','⌚','📱','🎮','🖱️'].map(em => (
                    <button key={em} type="button" onClick={() => setProductForm(f => ({ ...f, image: em }))}
                      className={`text-lg p-1 rounded-lg transition-colors cursor-pointer ${productForm.image === em ? 'bg-purple-600/30 ring-1 ring-purple-500' : 'hover:bg-slate-800'}`}>
                      {em}
                    </button>
                  ))}
                </div>
              </div>

              {/* Form fields */}
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-xs font-semibold text-slate-400 mb-1.5">Product Name *</label>
                  <input type="text" placeholder="e.g. Premium Wireless Earbuds" value={productForm.name}
                    onChange={e => setProductForm(f => ({ ...f, name: e.target.value }))} className={inputCls} />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1.5">Price ($) *</label>
                  <input type="number" min="0" step="0.01" placeholder="0.00" value={productForm.price}
                    onChange={e => setProductForm(f => ({ ...f, price: e.target.value }))} className={inputCls} />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1.5">Stock Quantity</label>
                  <input type="number" min="0" placeholder="0" value={productForm.stock}
                    onChange={e => setProductForm(f => ({ ...f, stock: e.target.value }))} className={inputCls} />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1.5">Category</label>
                  <select value={productForm.category} onChange={e => setProductForm(f => ({ ...f, category: e.target.value }))} className={`${inputCls} cursor-pointer`}>
                    {['Electronics', 'Fashion', 'Home Decor', 'Furniture', 'Fitness', 'Books', 'Beverages'].map(c => <option key={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1.5">Status</label>
                  <select value={productForm.status} onChange={e => setProductForm(f => ({ ...f, status: e.target.value as ProductStatus }))} className={`${inputCls} cursor-pointer`}>
                    <option>Active</option><option>Draft</option><option>Out of Stock</option>
                  </select>
                </div>
                <div className="col-span-2">
                  <label className="block text-xs font-semibold text-slate-400 mb-1.5">Description</label>
                  <textarea rows={2} placeholder="Short product description..." value={productForm.description}
                    onChange={e => setProductForm(f => ({ ...f, description: e.target.value }))} className={`${inputCls} resize-none`} />
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 px-6 py-4 border-t border-slate-800/60">
              <button type="button" onClick={() => setShowProductModal(false)}
                className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-sm font-semibold transition-colors cursor-pointer">Cancel</button>
              <button type="button" onClick={handleProductSave}
                className="px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-sm font-bold transition-colors shadow-lg shadow-purple-600/20 cursor-pointer">
                {editingProduct ? 'Save Changes' : 'Add Product'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ══════════ ORDER DETAILS MODAL ══════════ */}
      {viewOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/75 backdrop-blur-sm" onClick={() => setViewOrderId(null)} />
          <div className="relative bg-[#0E1524] border border-slate-700/80 rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800/60">
              <div>
                <h2 className="text-lg font-bold text-white">Order Details</h2>
                <p className="text-xs text-purple-400 font-mono font-bold">{viewOrder.id}</p>
              </div>
              <button type="button" onClick={() => setViewOrderId(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-700 transition-colors cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 space-y-6 max-h-[78vh] overflow-y-auto">
              {/* Customer & Address */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-[#111827] rounded-xl p-4 border border-slate-800/60">
                  <div className="flex items-center gap-2 mb-2">
                    <Users className="w-3.5 h-3.5 text-slate-400" />
                    <p className="text-[11px] text-slate-500 font-semibold uppercase tracking-wider">Customer</p>
                  </div>
                  <p className="text-sm font-bold text-white">{viewOrder.customer}</p>
                  <p className="text-xs text-slate-400 mt-0.5">{viewOrder.email}</p>
                </div>
                <div className="bg-[#111827] rounded-xl p-4 border border-slate-800/60">
                  <div className="flex items-center gap-2 mb-2">
                    <Calendar className="w-3.5 h-3.5 text-slate-400" />
                    <p className="text-[11px] text-slate-500 font-semibold uppercase tracking-wider">Order Date</p>
                  </div>
                  <p className="text-sm font-bold text-white">{viewOrder.date}</p>
                  <p className="text-xs text-slate-400 mt-0.5">{viewOrder.payment}</p>
                </div>
              </div>

              {/* Shipping Address */}
              <div className="bg-[#111827] rounded-xl p-4 border border-slate-800/60">
                <div className="flex items-center gap-2 mb-2">
                  <MapPin className="w-3.5 h-3.5 text-slate-400" />
                  <p className="text-[11px] text-slate-500 font-semibold uppercase tracking-wider">Shipping Address</p>
                </div>
                <p className="text-sm text-slate-300 leading-relaxed">{viewOrder.address}</p>
              </div>

              {/* Items */}
              <div>
                <p className="text-[11px] text-slate-500 font-semibold uppercase tracking-wider mb-3">Items Ordered</p>
                <div className="space-y-2">
                  {viewOrder.items.map((item, i) => (
                    <div key={i} className="flex items-center gap-3 bg-[#111827] rounded-xl p-3 border border-slate-800/60">
                      <span className="text-2xl w-10 text-center">{item.emoji}</span>
                      <div className="flex-grow min-w-0">
                        <p className="text-sm font-semibold text-white truncate">{item.name}</p>
                        <p className="text-xs text-slate-500">Qty: {item.qty}</p>
                      </div>
                      <p className="text-sm font-bold text-white flex-shrink-0">${(item.price * item.qty).toFixed(2)}</p>
                    </div>
                  ))}
                </div>
                <div className="flex justify-between items-center mt-3 pt-3 border-t border-slate-800/60">
                  <span className="text-sm text-slate-400 font-semibold">Total</span>
                  <span className="text-lg font-extrabold text-white">${viewOrder.total.toFixed(2)}</span>
                </div>
              </div>

              {/* Order Timeline */}
              <div>
                <p className="text-[11px] text-slate-500 font-semibold uppercase tracking-wider mb-4">Order Timeline</p>
                {viewOrder.status === 'Cancelled' ? (
                  <div className="flex items-center gap-3 bg-red-500/10 border border-red-500/20 rounded-xl p-3">
                    <X className="w-4 h-4 text-red-400 flex-shrink-0" />
                    <p className="text-sm text-red-400 font-semibold">Order was cancelled</p>
                  </div>
                ) : (
                  <div className="flex items-center gap-0">
                    {(['Pending', 'Processing', 'Shipped', 'Delivered'] as const).map((step, idx) => {
                      const currentStep = orderTimelineSteps[viewOrder.status];
                      const isComplete = idx <= currentStep;
                      const isCurrent = idx === currentStep;
                      const stepIcons = [<Clock className="w-3.5 h-3.5" />, <Package className="w-3.5 h-3.5" />, <Truck className="w-3.5 h-3.5" />, <CheckCircle2 className="w-3.5 h-3.5" />];
                      return (
                        <React.Fragment key={step}>
                          <div className="flex flex-col items-center gap-1.5">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 transition-all ${
                              isCurrent ? 'bg-purple-600 border-purple-400 shadow-lg shadow-purple-600/30' :
                              isComplete ? 'bg-emerald-600/30 border-emerald-500 text-emerald-400' :
                              'bg-slate-800 border-slate-700 text-slate-600'}`}>
                              {stepIcons[idx]}
                            </div>
                            <span className={`text-[10px] font-bold whitespace-nowrap ${isCurrent ? 'text-purple-400' : isComplete ? 'text-emerald-400' : 'text-slate-600'}`}>
                              {step}
                            </span>
                          </div>
                          {idx < 3 && (
                            <div className={`flex-1 h-0.5 mx-1 mb-4 rounded-full transition-all ${idx < currentStep ? 'bg-emerald-500/50' : 'bg-slate-800'}`} />
                          )}
                        </React.Fragment>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

            <div className="flex justify-end gap-3 px-6 py-4 border-t border-slate-800/60">
              <button type="button" onClick={() => setViewOrderId(null)}
                className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-sm font-semibold transition-colors cursor-pointer">Close</button>
              <button type="button"
                className="px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-sm font-bold transition-colors cursor-pointer flex items-center gap-2">
                <ChevronRight className="w-4 h-4" /> Go to Order
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default VendorDashboard;
