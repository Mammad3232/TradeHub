import React, { useState } from 'react';
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  TrendingUp,
  Settings,
  LogOut,
  DollarSign,
  Users,
  ArrowUpRight,
} from 'lucide-react';
import { Link } from 'react-router-dom';

import { RecentOrdersTable } from '../components/RecentOrdersTable';
import { AddProductForm } from '../components/AddProductForm';

export const VendorDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState('Dashboard');

  return (
    <div className="flex h-screen w-full bg-[#060913] text-white overflow-hidden font-sans">
      
      {/* ─── 1. Left Sidebar Navigation */}
      <aside className="w-64 bg-[#0B1120] border-r border-slate-800/80 flex flex-col flex-shrink-0 hidden lg:flex text-left">
        {/* Sidebar Brand Header */}
        <div className="h-20 flex items-center px-6 border-b border-slate-800/80">
          <div className="w-8 h-8 bg-purple-600 rounded-lg flex items-center justify-center mr-3 shadow-lg shadow-purple-600/25">
            <Package className="w-5 h-5 text-white" />
          </div>
          <span className="text-lg font-bold tracking-tight text-white">Vendora Panel</span>
        </div>

        {/* Sidebar Links */}
        <nav className="flex-grow px-4 py-6 space-y-1">
          <button
            type="button"
            onClick={() => setActiveTab('Dashboard')}
            className={`w-full flex items-center px-4 py-3 rounded-xl font-semibold text-sm transition-all cursor-pointer ${
              activeTab === 'Dashboard'
                ? 'bg-purple-600 text-white shadow-md shadow-purple-650/15'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/40'
            }`}
          >
            <LayoutDashboard className="w-4.5 h-4.5 mr-3 flex-shrink-0" />
            <span>Dashboard</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('Products')}
            className={`w-full flex items-center px-4 py-3 rounded-xl font-semibold text-sm transition-all cursor-pointer ${
              activeTab === 'Products'
                ? 'bg-purple-600 text-white shadow-md shadow-purple-650/15'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/40'
            }`}
          >
            <Package className="w-4.5 h-4.5 mr-3 flex-shrink-0" />
            <span>Products</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('Orders')}
            className={`w-full flex items-center px-4 py-3 rounded-xl font-semibold text-sm transition-all cursor-pointer ${
              activeTab === 'Orders'
                ? 'bg-purple-600 text-white shadow-md shadow-purple-650/15'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/40'
            }`}
          >
            <ShoppingCart className="w-4.5 h-4.5 mr-3 flex-shrink-0" />
            <span className="flex-grow text-left">Orders</span>
            <span className="bg-purple-500/25 text-purple-400 text-xs px-2.5 py-0.5 rounded-full border border-purple-500/20">
              5
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('Analytics')}
            className={`w-full flex items-center px-4 py-3 rounded-xl font-semibold text-sm transition-all cursor-pointer ${
              activeTab === 'Analytics'
                ? 'bg-purple-600 text-white shadow-md shadow-purple-650/15'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/40'
            }`}
          >
            <TrendingUp className="w-4.5 h-4.5 mr-3 flex-shrink-0" />
            <span>Analytics</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('Settings')}
            className={`w-full flex items-center px-4 py-3 rounded-xl font-semibold text-sm transition-all cursor-pointer ${
              activeTab === 'Settings'
                ? 'bg-purple-600 text-white shadow-md shadow-purple-650/15'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/40'
            }`}
          >
            <Settings className="w-4.5 h-4.5 mr-3 flex-shrink-0" />
            <span>Settings</span>
          </button>
        </nav>

        {/* Sidebar Sign Out Footer */}
        <div className="p-4 border-t border-slate-800/80">
          <Link
            to="/"
            className="flex items-center w-full px-4 py-3 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-xl transition-colors font-semibold text-sm"
          >
            <LogOut className="w-4.5 h-4.5 mr-3 flex-shrink-0" />
            <span>Exit Dashboard</span>
          </Link>
        </div>
      </aside>

      {/* ─── 2. Main Scrollable Content Area */}
      <main className="flex-grow flex flex-col overflow-y-auto">
        {/* Top bar header */}
        <header className="h-20 bg-[#0B1120]/40 backdrop-blur-md border-b border-slate-800/80 flex items-center justify-between px-6 sm:px-8 sticky top-0 z-10 text-left">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">Welcome back, TechStore!</h1>
            <p className="text-xs sm:text-sm text-slate-400">Here's what's happening with your Vendora shop today.</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-purple-600/15 text-purple-400 border border-purple-500/20 flex items-center justify-center font-bold text-xs select-none">
              TS
            </div>
            <span className="hidden sm:inline text-xs font-semibold text-slate-300">TechStore Co.</span>
          </div>
        </header>

        {/* Dashboard space wrapper */}
        <div className="p-6 sm:p-8 space-y-10 max-w-7xl w-full mx-auto">
          
          {/* ─── 3. Top Stats Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            
            {/* Stat: Total Revenue */}
            <div className="bg-[#111827] p-6 rounded-2xl border border-slate-800/80 hover:border-slate-700 transition-colors shadow-xl text-left relative group">
              <div className="flex justify-between items-start mb-4">
                <div className="w-12 h-12 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center shadow-lg shadow-emerald-500/5">
                  <DollarSign className="w-6 h-6" />
                </div>
                <span className="flex items-center text-emerald-400 text-xs font-bold gap-0.5 bg-emerald-500/5 px-2 py-0.5 rounded-md border border-emerald-500/10">
                  +12.5% <ArrowUpRight className="w-3.5 h-3.5" />
                </span>
              </div>
              <h3 className="text-slate-400 text-xs font-semibold uppercase tracking-wider">Total Revenue</h3>
              <p className="text-2xl sm:text-3xl font-extrabold text-white mt-1.5">$24,592.00</p>
              <div className="absolute inset-0 bg-emerald-500/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
            </div>

            {/* Stat: Active Orders */}
            <div className="bg-[#111827] p-6 rounded-2xl border border-slate-800/80 hover:border-slate-700 transition-colors shadow-xl text-left relative group">
              <div className="flex justify-between items-start mb-4">
                <div className="w-12 h-12 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center shadow-lg shadow-purple-500/5">
                  <ShoppingCart className="w-6 h-6" />
                </div>
                <span className="flex items-center text-purple-400 text-xs font-bold gap-0.5 bg-purple-500/5 px-2 py-0.5 rounded-md border border-purple-500/10">
                  +8.2% <ArrowUpRight className="w-3.5 h-3.5" />
                </span>
              </div>
              <h3 className="text-slate-400 text-xs font-semibold uppercase tracking-wider">Active Orders</h3>
              <p className="text-2xl sm:text-3xl font-extrabold text-white mt-1.5">142</p>
              <div className="absolute inset-0 bg-purple-500/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
            </div>

            {/* Stat: Total Products */}
            <div className="bg-[#111827] p-6 rounded-2xl border border-slate-800/80 hover:border-slate-700 transition-colors shadow-xl text-left relative group">
              <div className="flex justify-between items-start mb-4">
                <div className="w-12 h-12 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center shadow-lg shadow-blue-500/5">
                  <Package className="w-6 h-6" />
                </div>
                <span className="text-[10px] text-slate-400 bg-slate-800 border border-slate-700 px-2 py-0.5 rounded-md font-bold uppercase tracking-wider">
                  Stable
                </span>
              </div>
              <h3 className="text-slate-400 text-xs font-semibold uppercase tracking-wider">Total Products</h3>
              <p className="text-2xl sm:text-3xl font-extrabold text-white mt-1.5">856</p>
              <div className="absolute inset-0 bg-blue-500/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
            </div>

            {/* Stat: Store Views */}
            <div className="bg-[#111827] p-6 rounded-2xl border border-slate-800/80 hover:border-slate-700 transition-colors shadow-xl text-left relative group">
              <div className="flex justify-between items-start mb-4">
                <div className="w-12 h-12 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center shadow-lg shadow-amber-500/5">
                  <Users className="w-6 h-6" />
                </div>
                <span className="flex items-center text-amber-400 text-xs font-bold gap-0.5 bg-amber-500/5 px-2 py-0.5 rounded-md border border-amber-500/10">
                  +24.8% <ArrowUpRight className="w-3.5 h-3.5" />
                </span>
              </div>
              <h3 className="text-slate-400 text-xs font-semibold uppercase tracking-wider">Store Views</h3>
              <p className="text-2xl sm:text-3xl font-extrabold text-white mt-1.5">12.4K</p>
              <div className="absolute inset-0 bg-amber-500/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
            </div>

          </div>

          {/* ─── 4. Recent Orders Table */}
          <RecentOrdersTable />

          {/* ─── 5. Add Product Form Section */}
          <div className="pt-4 border-t border-slate-800/60">
            <div className="mb-6 text-left">
              <h2 className="text-xl font-extrabold text-white tracking-tight">Add New Product</h2>
              <p className="text-xs text-slate-400 mt-1">Publish a new catalog item directly into your Vendora storefront.</p>
            </div>
            
            <AddProductForm />
          </div>

        </div>
      </main>
    </div>
  );
};

export default VendorDashboard;
