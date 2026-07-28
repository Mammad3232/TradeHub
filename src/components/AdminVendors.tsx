import React, { useState, useEffect } from 'react';
import { Store, CheckCircle, Ban, X, Loader2, Layers } from 'lucide-react';
import apiClient from '../services/apiClient';

export interface VendorItem {
  id: number;
  storeName: string;
  owner: string;
  email: string;
  products: number;
  totalSales: number;
  status: 'Active' | 'Pending' | 'Suspended';
  phone?: string;
  taxId?: string;
}

export const AdminVendors: React.FC = () => {
  const [vendors, setVendors] = useState<VendorItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [filterStatus, setFilterStatus] = useState<'All' | 'Pending' | 'Active' | 'Suspended'>('All');

  // ── Dynamic API Fetch & State Management ────────────────────────────────────
  useEffect(() => {
    let isMounted = true;
    setLoading(true);

    const fetchVendors = async () => {
      try {
        // GET request to backend API endpoint
        const response = await apiClient.get<any, any>('/vendors');
        const apiData = Array.isArray(response) ? response : response?.data || [];

        const apiVendors: VendorItem[] = apiData.map((v: any) => ({
          id: v.id || v.Id || Date.now() + Math.floor(Math.random() * 1000),
          storeName: v.storeName || v.StoreName || v.businessName || v.BusinessName || v.name || v.FullName || 'Store Merchant',
          owner: v.owner || v.Owner || v.legalName || v.LegalName || v.fullName || v.FullName || 'Store Owner',
          email: v.email || v.Email || 'vendor@vendora.store',
          products: v.products ?? v.Products ?? v.productsCount ?? 0,
          totalSales: v.totalSales ?? v.TotalSales ?? 0,
          status: (v.status || v.Status || (v.role === 'Vendor' ? 'Active' : 'Pending')) as 'Active' | 'Pending' | 'Suspended',
          phone: v.phone || v.Phone,
          taxId: v.taxId || v.TaxId,
        }));

        // Retrieve merchant applications submitted via Become a Vendor form stored in localStorage
        const saved = localStorage.getItem('vendora_admin_vendors');
        const localVendors: VendorItem[] = saved ? JSON.parse(saved) : [];

        // Merge local submissions and API data (prevent duplicates by ID or email)
        const combined = [...localVendors];
        apiVendors.forEach((av) => {
          if (!combined.some((lv) => lv.id === av.id || (av.email && lv.email?.toLowerCase() === av.email?.toLowerCase()))) {
            combined.push(av);
          }
        });

        console.log('Fetched vendors in Admin:', combined);

        if (isMounted) {
          setVendors(combined.length > 0 ? combined : localVendors);
        }
      } catch (error) {
        console.warn('API fetch for vendors failed, displaying stored applications:', error);
        const saved = localStorage.getItem('vendora_admin_vendors');
        if (saved && isMounted) {
          try {
            setVendors(JSON.parse(saved));
          } catch {
            setVendors([]);
          }
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchVendors();

    return () => {
      isMounted = false;
    };
  }, []);

  // Sync state changes to localStorage
  useEffect(() => {
    if (vendors.length > 0) {
      localStorage.setItem('vendora_admin_vendors', JSON.stringify(vendors));
    }
  }, [vendors]);

  // ── Modal State & Form Control ──────────────────────────────────────────────
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [storeName, setStoreName] = useState('');
  const [owner, setOwner] = useState('');
  const [email, setEmail] = useState('');
  const [taxId, setTaxId] = useState('');
  const [phone, setPhone] = useState('');
  const [status, setStatus] = useState<'Active' | 'Pending' | 'Suspended'>('Pending');

  // ── Toggle Vendor Status Handler (Approve / Suspend) ────────────────────────
  const toggleVendorStatus = async (vendorId: number, newStatus: 'Active' | 'Pending' | 'Suspended') => {
    setVendors((prev) =>
      prev.map((v) => (v.id === vendorId ? { ...v, status: newStatus } : v))
    );
    try {
      await apiClient.put(`/vendors/${vendorId}/status`, { status: newStatus });
    } catch (err) {
      console.log('Backend status update failed, updated in state:', err);
    }
  };

  // ── Add New Vendor Form Submit ───────────────────────────────────────────────
  const handleAddVendorSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!storeName.trim() || !owner.trim() || !email.trim()) return;

    const newVendor: VendorItem = {
      id: Date.now(),
      storeName: storeName.trim(),
      owner: owner.trim(),
      email: email.trim(),
      taxId: taxId.trim() || undefined,
      phone: phone.trim() || undefined,
      products: 0,
      totalSales: 0,
      status,
    };

    setVendors((prev) => [newVendor, ...prev]);
    setIsModalOpen(false);
    setStoreName('');
    setOwner('');
    setEmail('');
    setTaxId('');
    setPhone('');
    setStatus('Pending');
  };

  // ── Filter & Sort vendors by status and newest first (descending ID/date) ────
  const filteredVendors = vendors
    .filter((v) => {
      if (filterStatus === 'All') return true;
      return (v.status || '').toLowerCase() === filterStatus.toLowerCase();
    })
    .sort((a, b) => (Number(b.id) || 0) - (Number(a.id) || 0));

  // ── Dynamic Badge Styling Helper ───────────────────────────────────────────
  const getStatusBadge = (vendorStatus: string) => {
    const badgeMap: Record<string, string> = {
      Active: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
      Pending: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
      Suspended: 'bg-red-500/10 text-red-400 border-red-500/20',
    };
    return `inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${
      badgeMap[vendorStatus] || 'bg-slate-800 text-slate-300 border-slate-700'
    }`;
  };

  const thClass = 'px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider';
  const tdClass = 'px-6 py-4 text-sm text-slate-300';

  return (
    <div className="animate-in fade-in duration-200 space-y-4">
      
      {/* ── Status Filter Tab Controls (All / Pending / Active / Suspended) ── */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        <div className="flex items-center gap-1.5 text-xs font-bold text-slate-500 uppercase tracking-widest mr-2 flex-shrink-0">
          <Layers className="w-3.5 h-3.5 text-indigo-400" />
          <span>Status Filter:</span>
        </div>
        {(['All', 'Pending', 'Active', 'Suspended'] as const).map((st) => {
          const count = st === 'All'
            ? vendors.length
            : vendors.filter((v) => (v.status || '').toLowerCase() === st.toLowerCase()).length;
          const isActive = filterStatus === st;

          return (
            <button
              key={st}
              type="button"
              onClick={() => setFilterStatus(st)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 flex-shrink-0 ${
                isActive
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20'
                  : 'bg-[#111827] text-slate-400 hover:text-white border border-slate-800 hover:border-slate-700'
              }`}
            >
              <span>{st}</span>
              <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-black ${
                isActive ? 'bg-white/20 text-white' : 'bg-slate-800 text-slate-400'
              }`}>
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* ── Main Vendors Card Directory ── */}
      <div className="bg-[#111827] border border-slate-800 rounded-3xl overflow-hidden shadow-xl">
        {/* Card Header */}
        <div className="px-6 py-5 border-b border-slate-800 flex flex-col sm:flex-row justify-between sm:items-center gap-3">
          <div>
            <h2 className="text-lg font-bold text-white">Merchant & Vendor Directory</h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Showing {filteredVendors.length} of {vendors.length} store owners registered on TradeHub.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setIsModalOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl transition-all cursor-pointer shadow-lg shadow-indigo-600/20"
          >
            <Store className="w-4 h-4" />
            <span>+ Add Vendor</span>
          </button>
        </div>

        {/* Vendors Directory Table */}
        <div className="overflow-x-auto">
          {loading ? (
            <div className="flex items-center justify-center py-16 text-indigo-400">
              <Loader2 className="w-8 h-8 animate-spin" />
            </div>
          ) : filteredVendors.length === 0 ? (
            <div className="text-center py-16 text-slate-500 text-sm font-semibold">
              No vendors found for status "{filterStatus}".
            </div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-950/40 border-b border-slate-800">
                  <th className={thClass}>Store & Owner</th>
                  <th className={thClass}>Products</th>
                  <th className={thClass}>Total Sales</th>
                  <th className={thClass}>Status</th>
                  <th className={`${thClass} text-right`}>Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {filteredVendors.map((v) => (
                  <tr key={v.id} className="hover:bg-slate-950/20 transition-colors">
                    <td className={tdClass}>
                      <div>
                        <span className="font-bold text-white text-sm block">
                          {v.storeName || (v as any).businessName || (v as any).name || 'Store Merchant'}
                        </span>
                        <span className="text-[11px] text-slate-400">
                          {v.owner || (v as any).legalName || (v as any).fullName || 'Owner'} ({v.email})
                        </span>
                        <span className="text-[10px] text-slate-500 block font-mono">
                          VÖEN: {v.taxId || (v as any).voen || 'N/A'}
                        </span>
                        <span className="text-[10px] text-slate-500 block">
                          Phone: {v.phone || 'N/A'}
                        </span>
                      </div>
                    </td>
                    <td className={tdClass}>
                      <span className="font-bold text-white">{v.products ?? 0}</span> items
                    </td>
                    <td className={tdClass}>
                      <span className="font-bold text-emerald-400">${(v.totalSales || 0).toLocaleString()}</span>
                    </td>
                    <td className={tdClass}>
                      <span className={getStatusBadge(v.status)}>{v.status}</span>
                    </td>
                    <td className={`${tdClass} text-right`}>
                      <div className="inline-flex items-center justify-end gap-2">
                        {v.status === 'Active' ? (
                          <button
                            type="button"
                            onClick={() => toggleVendorStatus(v.id, 'Suspended')}
                            className="inline-flex items-center gap-1 py-1.5 px-3 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-lg text-xs font-semibold transition-all border border-red-500/20 cursor-pointer"
                          >
                            <Ban className="w-3.5 h-3.5" />
                            <span>Suspend</span>
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={() => toggleVendorStatus(v.id, 'Active')}
                            className="inline-flex items-center gap-1 py-1.5 px-3 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 rounded-lg text-xs font-semibold transition-all border border-emerald-500/20 cursor-pointer"
                          >
                            <CheckCircle className="w-3.5 h-3.5" />
                            <span>Approve</span>
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* ── Add Vendor Modal Overlay ── */}
      {isModalOpen && (
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
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-white p-2 rounded-xl hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleAddVendorSubmit} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">
                  Store Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Nexus Tech Baku"
                  value={storeName}
                  onChange={(e) => setStoreName(e.target.value)}
                  className="w-full bg-[#111827] border border-slate-800 text-white rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">
                  Owner / Legal Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Rashad Mammadov"
                  value={owner}
                  onChange={(e) => setOwner(e.target.value)}
                  className="w-full bg-[#111827] border border-slate-800 text-white rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">
                    Email Address
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="e.g. contact@store.az"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-[#111827] border border-slate-800 text-white rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    placeholder="e.g. +994 55 000 00 00"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full bg-[#111827] border border-slate-800 text-white rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">
                  VÖEN / Tax ID
                </label>
                <input
                  type="text"
                  placeholder="e.g. 1234567890"
                  value={taxId}
                  onChange={(e) => setTaxId(e.target.value)}
                  className="w-full bg-[#111827] border border-slate-800 text-white rounded-xl px-4 py-3 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">
                  Initial Status
                </label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as 'Active' | 'Pending' | 'Suspended')}
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
                  onClick={() => setIsModalOpen(false)}
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
    </div>
  );
};

export default AdminVendors;
