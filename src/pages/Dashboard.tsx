import React from 'react';
import { DollarSign, Package, ShoppingCart, TrendingUp, Plus, Edit, Trash } from 'lucide-react';
import { useProductContext } from '../context/ProductContext';

export const Dashboard: React.FC = () => {
  const { products } = useProductContext();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      {/* Header section */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">Vendor Dashboard</h1>
          <p className="text-sm text-slate-400">Welcome back, manage your storefront operations and check sales performance.</p>
        </div>
        <button className="bg-indigo-600 hover:bg-indigo-500 text-white font-medium py-2.5 px-5 rounded-xl transition-all shadow-lg shadow-indigo-600/20 flex items-center space-x-2">
          <Plus className="h-4.5 w-4.5" />
          <span>Add New Product</span>
        </button>
      </div>

      {/* Analytics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs text-slate-400 font-medium">Monthly Revenue</span>
            <p className="text-2xl font-bold text-white">$14,248.50</p>
            <span className="text-xs text-emerald-400 font-semibold flex items-center gap-0.5">
              <TrendingUp className="h-3 w-3" /> +12.4% this month
            </span>
          </div>
          <div className="bg-emerald-500/10 p-3 rounded-xl">
            <DollarSign className="h-6 w-6 text-emerald-400" />
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs text-slate-400 font-medium">Total Orders</span>
            <p className="text-2xl font-bold text-white">412</p>
            <span className="text-xs text-indigo-400 font-semibold flex items-center gap-0.5">
              <TrendingUp className="h-3 w-3" /> +8.2% this month
            </span>
          </div>
          <div className="bg-indigo-500/10 p-3 rounded-xl">
            <ShoppingCart className="h-6 w-6 text-indigo-400" />
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs text-slate-400 font-medium">Active Products</span>
            <p className="text-2xl font-bold text-white">{products.length}</p>
            <span className="text-xs text-slate-500">Live in Marketplace</span>
          </div>
          <div className="bg-purple-500/10 p-3 rounded-xl">
            <Package className="h-6 w-6 text-purple-400" />
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs text-slate-400 font-medium">Store Rating</span>
            <p className="text-2xl font-bold text-white">4.7 / 5.0</p>
            <span className="text-xs text-slate-500">Based on 213 reviews</span>
          </div>
          <div className="bg-amber-500/10 p-3 rounded-xl">
            <TrendingUp className="h-6 w-6 text-amber-400" />
          </div>
        </div>
      </div>

      {/* Products list table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
        <div className="px-6 py-5 border-b border-slate-800 flex justify-between items-center">
          <h2 className="text-lg font-bold text-white">Inventory Management</h2>
          <span className="text-xs text-indigo-400 hover:underline cursor-pointer">View All Products</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-950/40 text-xs text-slate-400 uppercase tracking-wider border-b border-slate-800">
                <th className="px-6 py-4">Product Info</th>
                <th className="px-6 py-4">Category</th>
                <th className="px-6 py-4">Vendor</th>
                <th className="px-6 py-4">Price</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 text-sm text-slate-300">
              {products.map((product) => (
                <tr key={product.id} className="hover:bg-slate-950/20 transition-colors">
                  <td className="px-6 py-4 flex items-center space-x-3">
                    <img
                      src={product.image || product.imageUrl || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&auto=format&fit=crop&q=80'}
                      alt={product.title || product.name}
                      className="h-10 w-10 rounded-lg object-cover bg-slate-950 border border-slate-800"
                    />
                    <div>
                      <span className="font-semibold text-white block">{product.title || product.name}</span>
                      <span className="text-xs text-slate-500">ID: {product.id}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="bg-indigo-500/10 text-indigo-400 text-xs px-2.5 py-1 rounded-full border border-indigo-500/10">
                      {product.category}
                    </span>
                  </td>
                  <td className="px-6 py-4 font-medium">{product.vendorName || product.brand || 'TradeHub Vendor'}</td>
                  <td className="px-6 py-4 font-bold text-white">${(typeof product.price === 'number' ? product.price : parseFloat(product.price) || 0).toFixed(2)}</td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end space-x-2">
                      <button className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-lg transition-colors">
                        <Edit className="h-4.5 w-4.5" />
                      </button>
                      <button className="p-1.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-lg transition-colors">
                        <Trash className="h-4.5 w-4.5" />
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
  );
};
