import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  User,
  MapPin,
  Package,
  Settings as SettingsIcon,
  Download,
  ArrowRight,
  CheckCircle2,
  Truck,
  RotateCcw,
  Bell,
  Lock,
  Globe,
  ShieldAlert,
  Eye,
  EyeOff,
  Trash2,
  KeyRound,
} from 'lucide-react';

interface OrderItem {
  id: string;
  title: string;
  price: number;
  image: string;
  category: string;
}

interface Order {
  id: string;
  placedDate: string;
  total: number;
  shipTo: string;
  status: 'Delivered' | 'In Transit' | 'Returned';
  statusDetails: string;
  items: OrderItem[];
}

const mockOrders: Order[] = [
  {
    id: 'ORD-8742819',
    placedDate: 'July 12, 2026',
    total: 348.98,
    shipTo: 'John Doe',
    status: 'Delivered',
    statusDetails: 'Delivered July 14, 2026',
    items: [
      {
        id: 'p1',
        title: 'Aether Sound Wave Pro - Noise Cancelling Headphones',
        price: 299.99,
        image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=200&auto=format&fit=crop&q=60',
        category: 'Electronics',
      },
      {
        id: 'p2',
        title: 'Ergonomic Memory Foam Travel Pillow',
        price: 48.99,
        image: 'https://images.unsplash.com/photo-1520038410233-7141be7e6f97?w=200&auto=format&fit=crop&q=60',
        category: 'Home & Travel',
      },
    ],
  },
  {
    id: 'ORD-0238104',
    placedDate: 'July 18, 2026',
    total: 129.50,
    shipTo: 'John Doe',
    status: 'In Transit',
    statusDetails: 'Estimated delivery: Tomorrow by 8 PM',
    items: [
      {
        id: 'p3',
        title: 'Vanguard Hybrid Smartwatch with Tracker',
        price: 129.50,
        image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=200&auto=format&fit=crop&q=60',
        category: 'Wearables',
      },
    ],
  },
  {
    id: 'ORD-9982481',
    placedDate: 'June 28, 2026',
    total: 89.00,
    shipTo: 'John Doe',
    status: 'Returned',
    statusDetails: 'Return complete on July 2, 2026',
    items: [
      {
        id: 'p4',
        title: 'StudioOne USB Microphone with Stand',
        price: 89.00,
        image: 'https://images.unsplash.com/photo-1590608897129-79da98d15969?w=200&auto=format&fit=crop&q=60',
        category: 'Audio',
      },
    ],
  },
];

const statusStyles = {
  Delivered: {
    badge: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    dot: 'bg-emerald-400 shadow-emerald-500/50',
    icon: CheckCircle2,
  },
  'In Transit': {
    badge: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
    dot: 'bg-blue-400 shadow-blue-500/50',
    icon: Truck,
  },
  Returned: {
    badge: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    dot: 'bg-amber-400 shadow-amber-500/50',
    icon: RotateCcw,
  },
};

export const MyOrders: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'personal' | 'orders' | 'addresses' | 'settings'>('settings');
  const [trackingOrder, setTrackingOrder] = useState<Order | null>(null);

  // User profile state
  const [userProfile, setUserProfile] = useState({
    name: 'John Doe',
    email: 'buyer@vendora.store',
    phone: '+1 (555) 019-2834',
    location: 'Baku, Azerbaijan',
  });

  // Settings State Management
  const [passwords, setPasswords] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [showCurrentPass, setShowCurrentPass] = useState(false);
  const [showNewPass, setShowNewPass] = useState(false);
  const [showConfirmPass, setShowConfirmPass] = useState(false);

  const [notifications, setNotifications] = useState({
    orderUpdates: true,
    promotionalEmails: false,
    smsAlerts: true,
  });

  const [regional, setRegional] = useState({
    language: 'English',
    currency: 'USD ($)',
  });

  const [securityMessage, setSecurityMessage] = useState('');

  useEffect(() => {
    const rawUser = localStorage.getItem('vendora_active_user');
    if (rawUser) {
      const parsed = JSON.parse(rawUser);
      setUserProfile({
        name: parsed.name || 'John Doe',
        email: parsed.email || 'buyer@vendora.store',
        phone: parsed.phone || '+1 (555) 019-2834',
        location: parsed.location || 'Baku, Azerbaijan',
      });
    }
  }, []);

  const handleDownloadInvoice = (orderId: string) => {
    alert(`Downloading PDF Invoice receipt for ${orderId}...`);
  };

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    alert('Personal information updated successfully!');
  };

  const handlePasswordUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!passwords.currentPassword) {
      setSecurityMessage('Please enter your current password.');
      return;
    }
    if (passwords.newPassword.length < 6) {
      setSecurityMessage('New password must be at least 6 characters.');
      return;
    }
    if (passwords.newPassword !== passwords.confirmPassword) {
      setSecurityMessage('New passwords do not match.');
      return;
    }
    setSecurityMessage('Password updated successfully!');
    setPasswords({ currentPassword: '', newPassword: '', confirmPassword: '' });
    setTimeout(() => setSecurityMessage(''), 4000);
  };

  const handleDeleteAccount = () => {
    if (window.confirm('CRITICAL WARNING: Are you sure you want to permanently delete your Vendora account? This action cannot be undone.')) {
      localStorage.removeItem('vendora_active_user');
      alert('Account deleted. Redirecting to home...');
      window.location.href = '/';
    }
  };

  return (
    <div className="bg-[#060913] min-h-screen text-slate-200 pb-20 font-sans">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 space-y-8">
        
        {/* Navigation Breadcrumbs */}
        <div className="text-left">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-xs sm:text-sm font-semibold text-slate-400 hover:text-white hover:translate-x-[-2px] transition-all"
          >
            <ArrowRight className="h-4 w-4 text-purple-400 rotate-180" />
            <span>Back to Marketplace</span>
          </Link>
        </div>

        {/* ─── Page Grid Layout ─── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* 1. LEFT SIDEBAR: Navigation Menu (3 Columns) */}
          <aside className="lg:col-span-3 bg-[#111827] border border-slate-800 rounded-2xl p-6 shadow-xl relative overflow-hidden flex flex-col items-center text-center">
            
            {/* Background design glow */}
            <div className="absolute top-0 right-0 w-24 h-24 bg-purple-600/5 rounded-full blur-2xl pointer-events-none" />

            {/* Avatar & User meta (with ring and green active dot) */}
            <div className="space-y-4 w-full pb-6 border-b border-slate-800/80">
              <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-purple-600 to-indigo-600 p-1 shadow-xl shadow-purple-600/20 mx-auto flex items-center justify-center relative group ring-4 ring-purple-500/20">
                <span className="w-full h-full bg-[#111827] rounded-full flex items-center justify-center font-extrabold text-2xl text-white group-hover:bg-purple-900/20 transition-colors">
                  {userProfile.name.split(' ').map((n) => n[0]).join('')}
                </span>
                <span className="absolute bottom-0 right-0 w-4.5 h-4.5 bg-emerald-500 border-2 border-[#111827] rounded-full ring-2 ring-emerald-500/30" />
              </div>

              <div>
                <h3 className="text-base font-extrabold text-white leading-tight">{userProfile.name}</h3>
                <p className="text-xs text-slate-400 truncate mt-1">{userProfile.email}</p>
              </div>
            </div>

            {/* Navigation links menu */}
            <nav className="w-full pt-6 flex flex-row lg:flex-col overflow-x-auto lg:overflow-x-visible gap-2 lg:gap-1.5 select-none text-xs sm:text-sm font-semibold scrollbar-none">
              
              <button
                type="button"
                onClick={() => setActiveTab('personal')}
                className={`w-full flex items-center justify-center lg:justify-start px-4.5 py-3 rounded-xl transition-all cursor-pointer whitespace-nowrap gap-3 ${
                  activeTab === 'personal'
                    ? 'bg-purple-600 text-white shadow-md shadow-purple-600/20'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/40'
                }`}
              >
                <User className="w-4.5 h-4.5 flex-shrink-0" />
                <span>Personal Info</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('orders')}
                className={`w-full flex items-center justify-center lg:justify-start px-4.5 py-3 rounded-xl transition-all cursor-pointer whitespace-nowrap gap-3 ${
                  activeTab === 'orders'
                    ? 'bg-purple-600 text-white shadow-md shadow-purple-600/20'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/40'
                }`}
              >
                <Package className="w-4.5 h-4.5 flex-shrink-0" />
                <span className="flex-grow text-left">My Orders</span>
                <span className={`text-[10px] px-2 py-0.5 rounded-full border ${
                  activeTab === 'orders' ? 'bg-purple-500 border-purple-400 text-white' : 'bg-[#0E1524] border-slate-800 text-slate-400'
                }`}>
                  3
                </span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('addresses')}
                className={`w-full flex items-center justify-center lg:justify-start px-4.5 py-3 rounded-xl transition-all cursor-pointer whitespace-nowrap gap-3 ${
                  activeTab === 'addresses'
                    ? 'bg-purple-600 text-white shadow-md shadow-purple-600/20'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/40'
                }`}
              >
                <MapPin className="w-4.5 h-4.5 flex-shrink-0" />
                <span>Addresses</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('settings')}
                className={`w-full flex items-center justify-center lg:justify-start px-4.5 py-3 rounded-xl transition-all cursor-pointer whitespace-nowrap gap-3 ${
                  activeTab === 'settings'
                    ? 'bg-purple-600 text-white shadow-md shadow-purple-600/20'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/40'
                }`}
              >
                <SettingsIcon className="w-4.5 h-4.5 flex-shrink-0" />
                <span>Settings</span>
              </button>

            </nav>
          </aside>

          {/* 2. RIGHT CONTENT VIEW AREA (9 Columns) */}
          <main className="lg:col-span-9 w-full space-y-6">
            
            {/* VIEW A: ORDER HISTORY */}
            {activeTab === 'orders' && (
              <div className="space-y-6 animate-in fade-in duration-200 text-left">
                <div className="flex justify-between items-center">
                  <div>
                    <h2 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">Order History</h2>
                    <p className="text-xs text-slate-400 mt-1">Review shipping coordinates and transaction details of purchases.</p>
                  </div>
                </div>

                {/* Orders Cards Grid */}
                <div className="space-y-5">
                  {mockOrders.map((order) => {
                    const StatusIcon = statusStyles[order.status].icon;
                    return (
                      <div
                        key={order.id}
                        className="bg-[#111827] border border-slate-800 rounded-2xl p-5 sm:p-6 shadow-xl relative overflow-hidden group hover:border-slate-700 transition-colors"
                      >
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-800 pb-4 mb-4 gap-4">
                          <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-xs text-slate-400">
                            <div>
                              <span className="block font-bold text-slate-500 uppercase tracking-wider text-[10px]">Order ID</span>
                              <span className="font-mono text-white font-bold text-sm mt-0.5 block">{order.id}</span>
                            </div>
                            <div>
                              <span className="block font-bold text-slate-500 uppercase tracking-wider text-[10px]">Placed Date</span>
                              <span className="font-semibold text-slate-200 mt-0.5 block">{order.placedDate}</span>
                            </div>
                            <div>
                              <span className="block font-bold text-slate-500 uppercase tracking-wider text-[10px]">Total Amount</span>
                              <span className="font-extrabold text-white text-sm mt-0.5 block">${order.total.toFixed(2)}</span>
                            </div>
                          </div>

                          <div className="flex-shrink-0">
                            <span className={`inline-flex items-center gap-1.5 px-3 py-1 text-xs rounded-full font-bold border ${statusStyles[order.status].badge}`}>
                              <span className={`w-1.5 h-1.5 rounded-full ${statusStyles[order.status].dot}`} />
                              <StatusIcon className="w-3.5 h-3.5" />
                              <span>{order.status}</span>
                            </span>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pb-4 border-b border-slate-800">
                          {order.items.map((item) => (
                            <div key={item.id} className="flex items-center gap-3 bg-[#0E1524]/60 p-3 rounded-xl border border-slate-800">
                              <img
                                src={item.image}
                                alt={item.title}
                                className="w-12 h-12 rounded-lg object-cover border border-slate-800"
                              />
                              <div className="min-w-0">
                                <h4 className="text-xs sm:text-sm font-bold text-white truncate max-w-[200px]" title={item.title}>
                                  {item.title}
                                </h4>
                                <div className="flex items-center gap-2 mt-1">
                                  <span className="text-[10px] text-slate-500 font-semibold bg-slate-900 border border-slate-800 px-1.5 py-0.5 rounded">
                                    {item.category}
                                  </span>
                                  <span className="text-xs text-slate-400 font-semibold font-mono">${item.price.toFixed(2)}</span>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>

                        <div className="flex items-center justify-between pt-4 text-xs font-bold">
                          <span className="text-slate-500 text-[11px] font-semibold">{order.statusDetails}</span>
                          
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => setTrackingOrder(order)}
                              className="px-4.5 py-2.5 bg-purple-600 hover:bg-purple-500 text-white rounded-xl shadow transition-all active:scale-[.98] cursor-pointer"
                            >
                              Track Order
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDownloadInvoice(order.id)}
                              title="Download Invoice"
                              className="p-2.5 text-slate-400 hover:text-white bg-[#0E1524] border border-slate-800 hover:border-slate-700 rounded-xl transition-all cursor-pointer"
                            >
                              <Download className="w-4 h-4" />
                            </button>
                          </div>
                        </div>

                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* VIEW B: PERSONAL INFO */}
            {activeTab === 'personal' && (
              <div className="bg-[#111827] border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-xl text-left animate-in fade-in duration-200 space-y-6">
                <div>
                  <h2 className="text-lg sm:text-xl font-bold text-white">Personal Information</h2>
                  <p className="text-xs text-slate-400 mt-1">Update your basic profile identifiers and display location settings.</p>
                </div>

                <form onSubmit={handleSaveProfile} className="space-y-5">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div className="flex flex-col gap-2">
                      <label htmlFor="p-name" className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                        Full Name
                      </label>
                      <input
                        id="p-name"
                        type="text"
                        required
                        value={userProfile.name}
                        onChange={(e) => setUserProfile({ ...userProfile, name: e.target.value })}
                        className="w-full bg-[#0E1524] border border-slate-800 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500 transition-all font-semibold"
                      />
                    </div>

                    <div className="flex flex-col gap-2">
                      <label htmlFor="p-email" className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                        Email Address
                      </label>
                      <input
                        id="p-email"
                        type="email"
                        required
                        value={userProfile.email}
                        onChange={(e) => setUserProfile({ ...userProfile, email: e.target.value })}
                        className="w-full bg-[#0E1524] border border-slate-800 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500 transition-all font-semibold"
                      />
                    </div>

                    <div className="flex flex-col gap-2">
                      <label htmlFor="p-phone" className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                        Phone Number
                      </label>
                      <input
                        id="p-phone"
                        type="text"
                        value={userProfile.phone}
                        onChange={(e) => setUserProfile({ ...userProfile, phone: e.target.value })}
                        className="w-full bg-[#0E1524] border border-slate-800 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500 transition-all font-semibold"
                      />
                    </div>

                    <div className="flex flex-col gap-2">
                      <label htmlFor="p-loc" className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                        Location / City
                      </label>
                      <input
                        id="p-loc"
                        type="text"
                        value={userProfile.location}
                        onChange={(e) => setUserProfile({ ...userProfile, location: e.target.value })}
                        className="w-full bg-[#0E1524] border border-slate-800 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500 transition-all font-semibold"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs px-6 py-3 rounded-xl transition-all shadow-md hover:shadow-purple-600/20 active:scale-[.98] cursor-pointer"
                  >
                    Save Alterations
                  </button>
                </form>
              </div>
            )}

            {/* VIEW C: ADDRESSES */}
            {activeTab === 'addresses' && (
              <div className="space-y-6 text-left animate-in fade-in duration-200">
                <div>
                  <h2 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">Saved Addresses</h2>
                  <p className="text-xs text-slate-400 mt-1">Manage billing and delivery address destinations.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-[#111827] border border-slate-800 rounded-2xl p-5 shadow-xl relative overflow-hidden group hover:border-slate-700 transition-all flex flex-col justify-between">
                    <div className="space-y-3">
                      <div className="flex justify-between items-start">
                        <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center">
                          <MapPin className="w-5 h-5" />
                        </div>
                        <span className="bg-purple-500/10 text-purple-400 border border-purple-500/25 px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider">
                          Primary
                        </span>
                      </div>
                      <div>
                        <h4 className="font-extrabold text-white text-sm">Headquarters (Office)</h4>
                        <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">
                          12 Nizami Street, Suite 400<br />
                          Baku, AZ1000, Azerbaijan
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 text-xs font-semibold text-slate-500 pt-5 border-t border-slate-800 mt-5">
                      <button type="button" className="hover:text-purple-400 transition-colors cursor-pointer">Modify</button>
                      <span className="text-slate-800">|</span>
                      <button type="button" className="hover:text-rose-400 transition-colors cursor-pointer">Remove</button>
                    </div>
                  </div>

                  <div className="bg-[#111827] border border-slate-800 rounded-2xl p-5 shadow-xl relative overflow-hidden group hover:border-slate-700 transition-all flex flex-col justify-between">
                    <div className="space-y-3">
                      <div className="flex justify-between items-start">
                        <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center">
                          <MapPin className="w-5 h-5" />
                        </div>
                        <span className="bg-slate-800 text-slate-400 border border-slate-700 px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider">
                          Secondary
                        </span>
                      </div>
                      <div>
                        <h4 className="font-extrabold text-white text-sm">Residential (Home)</h4>
                        <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">
                          94 Inshaatchilar Avenue, Apt 4B<br />
                          Baku, AZ1015, Azerbaijan
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 text-xs font-semibold text-slate-500 pt-5 border-t border-slate-800 mt-5">
                      <button type="button" className="hover:text-purple-400 transition-colors cursor-pointer">Modify</button>
                      <span className="text-slate-800">|</span>
                      <button type="button" className="hover:text-rose-400 transition-colors cursor-pointer">Remove</button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* VIEW D: EXPANDED SETTINGS */}
            {activeTab === 'settings' && (
              <div className="space-y-6 text-left animate-in fade-in duration-200">
                <div>
                  <h2 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">Account Settings</h2>
                  <p className="text-xs text-slate-400 mt-1">Manage credentials, notifications, regional preferences, and security.</p>
                </div>

                {/* 1. Account Security Card */}
                <div className="bg-[#111827] border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-xl space-y-6">
                  <div className="flex items-center gap-3 pb-4 border-b border-slate-800">
                    <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400 flex items-center justify-center flex-shrink-0">
                      <Lock className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-base font-extrabold text-white">Account Security</h3>
                      <p className="text-xs text-slate-400 mt-0.5">Update your password to keep your account safe.</p>
                    </div>
                  </div>

                  {securityMessage && (
                    <div className={`p-3 rounded-xl text-xs font-semibold border ${
                      securityMessage.includes('successfully')
                        ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                        : 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                    }`}>
                      {securityMessage}
                    </div>
                  )}

                  <form onSubmit={handlePasswordUpdate} className="space-y-5">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                      
                      {/* Current Password */}
                      <div className="flex flex-col gap-2">
                        <label htmlFor="curr-pass" className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                          Current Password
                        </label>
                        <div className="relative">
                          <input
                            id="curr-pass"
                            type={showCurrentPass ? 'text' : 'password'}
                            value={passwords.currentPassword}
                            onChange={(e) => setPasswords({ ...passwords, currentPassword: e.target.value })}
                            placeholder="••••••••"
                            className="w-full bg-[#0E1524] border border-slate-800 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500 transition-all font-medium pr-10"
                          />
                          <button
                            type="button"
                            onClick={() => setShowCurrentPass(!showCurrentPass)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
                          >
                            {showCurrentPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </button>
                        </div>
                      </div>

                      {/* New Password */}
                      <div className="flex flex-col gap-2">
                        <label htmlFor="new-pass" className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                          New Password
                        </label>
                        <div className="relative">
                          <input
                            id="new-pass"
                            type={showNewPass ? 'text' : 'password'}
                            value={passwords.newPassword}
                            onChange={(e) => setPasswords({ ...passwords, newPassword: e.target.value })}
                            placeholder="••••••••"
                            className="w-full bg-[#0E1524] border border-slate-800 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500 transition-all font-medium pr-10"
                          />
                          <button
                            type="button"
                            onClick={() => setShowNewPass(!showNewPass)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
                          >
                            {showNewPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </button>
                        </div>
                      </div>

                      {/* Confirm Password */}
                      <div className="flex flex-col gap-2">
                        <label htmlFor="conf-pass" className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                          Confirm Password
                        </label>
                        <div className="relative">
                          <input
                            id="conf-pass"
                            type={showConfirmPass ? 'text' : 'password'}
                            value={passwords.confirmPassword}
                            onChange={(e) => setPasswords({ ...passwords, confirmPassword: e.target.value })}
                            placeholder="••••••••"
                            className="w-full bg-[#0E1524] border border-slate-800 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500 transition-all font-medium pr-10"
                          />
                          <button
                            type="button"
                            onClick={() => setShowConfirmPass(!showConfirmPass)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
                          >
                            {showConfirmPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </button>
                        </div>
                      </div>

                    </div>

                    <div className="flex justify-end">
                      <button
                        type="submit"
                        className="inline-flex items-center gap-2 bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs px-6 py-3 rounded-xl transition-all shadow-md shadow-purple-600/20 active:scale-[.98] cursor-pointer"
                      >
                        <KeyRound className="w-4 h-4" />
                        <span>Update Password</span>
                      </button>
                    </div>
                  </form>
                </div>

                {/* 2. Notification Preferences Card */}
                <div className="bg-[#111827] border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-xl space-y-6">
                  <div className="flex items-center gap-3 pb-4 border-b border-slate-800">
                    <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400 flex items-center justify-center flex-shrink-0">
                      <Bell className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-base font-extrabold text-white">Notification Preferences</h3>
                      <p className="text-xs text-slate-400 mt-0.5">Control how and when you receive automated updates.</p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    {/* Toggle 1: Order Delivery Updates */}
                    <div className="flex items-center justify-between p-4 bg-[#0E1524] rounded-xl border border-slate-800">
                      <div>
                        <h4 className="text-xs font-bold text-white">Order Delivery Updates</h4>
                        <p className="text-[11px] text-slate-400 mt-0.5">Receive real-time notifications on order status changes and tracking checkpoints.</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => setNotifications({ ...notifications, orderUpdates: !notifications.orderUpdates })}
                        className={`w-12 h-6 flex items-center rounded-full p-1 transition-colors cursor-pointer ${
                          notifications.orderUpdates ? 'bg-purple-600' : 'bg-slate-800'
                        }`}
                      >
                        <div
                          className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                            notifications.orderUpdates ? 'translate-x-6' : 'translate-x-0'
                          }`}
                        />
                      </button>
                    </div>

                    {/* Toggle 2: Promotional Emails */}
                    <div className="flex items-center justify-between p-4 bg-[#0E1524] rounded-xl border border-slate-800">
                      <div>
                        <h4 className="text-xs font-bold text-white">Promotional Emails</h4>
                        <p className="text-[11px] text-slate-400 mt-0.5">Get exclusive discounts, seasonal sales alerts, and tailored recommendations.</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => setNotifications({ ...notifications, promotionalEmails: !notifications.promotionalEmails })}
                        className={`w-12 h-6 flex items-center rounded-full p-1 transition-colors cursor-pointer ${
                          notifications.promotionalEmails ? 'bg-purple-600' : 'bg-slate-800'
                        }`}
                      >
                        <div
                          className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                            notifications.promotionalEmails ? 'translate-x-6' : 'translate-x-0'
                          }`}
                        />
                      </button>
                    </div>

                    {/* Toggle 3: SMS Alerts */}
                    <div className="flex items-center justify-between p-4 bg-[#0E1524] rounded-xl border border-slate-800">
                      <div>
                        <h4 className="text-xs font-bold text-white">SMS Alerts</h4>
                        <p className="text-[11px] text-slate-400 mt-0.5">Receive urgent delivery SMS text messages on your mobile number.</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => setNotifications({ ...notifications, smsAlerts: !notifications.smsAlerts })}
                        className={`w-12 h-6 flex items-center rounded-full p-1 transition-colors cursor-pointer ${
                          notifications.smsAlerts ? 'bg-purple-600' : 'bg-slate-800'
                        }`}
                      >
                        <div
                          className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                            notifications.smsAlerts ? 'translate-x-6' : 'translate-x-0'
                          }`}
                        />
                      </button>
                    </div>
                  </div>
                </div>

                {/* 3. Regional Settings Card */}
                <div className="bg-[#111827] border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-xl space-y-6">
                  <div className="flex items-center gap-3 pb-4 border-b border-slate-800">
                    <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400 flex items-center justify-center flex-shrink-0">
                      <Globe className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-base font-extrabold text-white">Regional Settings</h3>
                      <p className="text-xs text-slate-400 mt-0.5">Configure your preferred display language and currency.</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    {/* Language Dropdown */}
                    <div className="flex flex-col gap-2">
                      <label htmlFor="reg-lang" className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                        Language
                      </label>
                      <select
                        id="reg-lang"
                        value={regional.language}
                        onChange={(e) => setRegional({ ...regional, language: e.target.value })}
                        className="w-full bg-[#0E1524] border border-slate-800 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500 transition-all font-medium cursor-pointer"
                      >
                        <option value="English">English (US)</option>
                        <option value="Azerbaijani">Azərbaycan (AZ)</option>
                        <option value="Turkish">Türkçe (TR)</option>
                        <option value="Russian">Русский (RU)</option>
                      </select>
                    </div>

                    {/* Currency Dropdown */}
                    <div className="flex flex-col gap-2">
                      <label htmlFor="reg-curr" className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                        Currency
                      </label>
                      <select
                        id="reg-curr"
                        value={regional.currency}
                        onChange={(e) => setRegional({ ...regional, currency: e.target.value })}
                        className="w-full bg-[#0E1524] border border-slate-800 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500 transition-all font-medium cursor-pointer"
                      >
                        <option value="USD ($)">USD ($) - US Dollar</option>
                        <option value="AZN (₼)">AZN (₼) - Azerbaijan Manat</option>
                        <option value="EUR (€)">EUR (€) - Euro</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* 4. Danger Zone Card */}
                <div className="bg-rose-500/5 border border-rose-500/20 rounded-2xl p-6 sm:p-8 shadow-xl space-y-6">
                  <div className="flex items-center gap-3 pb-4 border-b border-rose-500/20">
                    <div className="w-10 h-10 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 flex items-center justify-center flex-shrink-0">
                      <ShieldAlert className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-base font-extrabold text-white">Danger Zone</h3>
                      <p className="text-xs text-rose-300/70 mt-0.5">Irreversible and destructive account operations.</p>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <h4 className="text-xs font-bold text-white">Delete Account</h4>
                      <p className="text-xs text-slate-400 mt-1 max-w-md">
                        Once you delete your account, there is no going back. All saved addresses, order history, and personal data will be permanently removed.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={handleDeleteAccount}
                      className="inline-flex items-center justify-center gap-2 bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs px-6 py-3 rounded-xl transition-all shadow-md shadow-rose-600/20 active:scale-[.98] cursor-pointer whitespace-nowrap"
                    >
                      <Trash2 className="w-4 h-4" />
                      <span>Delete Account</span>
                    </button>
                  </div>
                </div>

              </div>
            )}

          </main>
        </div>
      </div>

      {/* ─── MODAL DIALOG: ORDER TRACKING TIMELINE ─── */}
      {trackingOrder && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#111827] border border-slate-800 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-200 text-left">
            <div className="p-6 border-b border-slate-800 flex justify-between items-center">
              <div>
                <h3 className="text-lg font-bold text-white">Track Order #{trackingOrder.id}</h3>
                <p className="text-xs text-slate-400 mt-0.5">{trackingOrder.statusDetails}</p>
              </div>
              <button
                type="button"
                onClick={() => setTrackingOrder(null)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="p-6 space-y-6 text-sm">
              <div className="flex items-center gap-3 bg-[#0E1524] p-3 rounded-xl border border-slate-800">
                {trackingOrder.items.map((item) => (
                  <img
                    key={item.id}
                    src={item.image}
                    alt={item.title}
                    className="w-10 h-10 rounded object-cover border border-slate-800"
                  />
                ))}
                <div>
                  <p className="text-xs font-bold text-white">{trackingOrder.items.map((i) => i.title).join(', ')}</p>
                  <p className="text-[10px] text-slate-500 mt-0.5">Destined to {trackingOrder.shipTo}</p>
                </div>
              </div>

              <div className="space-y-5 relative pl-6">
                <div className="absolute left-2.5 top-2.5 bottom-2.5 w-0.5 bg-slate-800" />

                <div className="relative">
                  <span className="absolute -left-5 top-1 w-3.5 h-3.5 rounded-full bg-purple-500 ring-4 ring-purple-500/10 flex items-center justify-center text-[8px]" />
                  <div>
                    <h4 className="font-bold text-slate-200 text-xs">Order Received</h4>
                    <p className="text-[10px] text-slate-500 mt-0.5">Validated and queued under seller system. July 12, 2026</p>
                  </div>
                </div>

                <div className="relative">
                  <span className="absolute -left-5 top-1 w-3.5 h-3.5 rounded-full bg-purple-500 ring-4 ring-purple-500/10 flex items-center justify-center text-[8px]" />
                  <div>
                    <h4 className="font-bold text-slate-200 text-xs">Order Packaged</h4>
                    <p className="text-[10px] text-slate-500 mt-0.5">Packaged and picked up by Vendora cargo partners. July 13, 2026</p>
                  </div>
                </div>

                <div className="relative">
                  <span className={`absolute -left-5 top-1 w-3.5 h-3.5 rounded-full ring-4 flex items-center justify-center ${
                    trackingOrder.status === 'Delivered' || trackingOrder.status === 'In Transit'
                      ? 'bg-purple-500 ring-purple-500/10'
                      : 'bg-slate-800 ring-transparent'
                  }`} />
                  <div>
                    <h4 className="font-bold text-slate-200 text-xs">In Transit</h4>
                    <p className="text-[10px] text-slate-500 mt-0.5">Parcel passing custom checkpoints. July 14, 2026</p>
                  </div>
                </div>

                <div className="relative">
                  <span className={`absolute -left-5 top-1 w-3.5 h-3.5 rounded-full ring-4 flex items-center justify-center ${
                    trackingOrder.status === 'Delivered'
                      ? 'bg-emerald-500 ring-emerald-500/10'
                      : 'bg-slate-800 ring-transparent'
                  }`} />
                  <div>
                    <h4 className="font-bold text-slate-200 text-xs">Delivered</h4>
                    <p className="text-[10px] text-slate-500 mt-0.5">
                      {trackingOrder.status === 'Delivered'
                        ? 'Successfully received by buyer. July 14, 2026'
                        : 'Awaiting shipping milestone completion.'}
                    </p>
                  </div>
                </div>

              </div>
            </div>

            <div className="p-4 border-t border-slate-800 bg-[#0B1120] flex justify-end">
              <button
                type="button"
                onClick={() => setTrackingOrder(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white cursor-pointer"
              >
                Close Tracking
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
export default MyOrders;
