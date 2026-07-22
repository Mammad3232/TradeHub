import React, { useState, useEffect } from 'react';
import { Store, CheckCircle, Ban, X } from 'lucide-react';

export interface VendorItem {
  id: number;
  storeName: string;
  owner: string;
  email: string;
  products: number;
  totalSales: number;
  status: 'Active' | 'Pending' | 'Suspended';
}

const initialVendors: VendorItem[] = [
  { id: 1, storeName: 'Baku Tech Hub', owner: 'Rashad Guliyev', email: 'info@bakutech.az', products: 48, totalSales: 42150.00, status: 'Active' },
  { id: 2, storeName: 'Saray Boutique', owner: 'Nigar Musayeva', email: 'saray@boutique.com', products: 94, totalSales: 28900.50, status: 'Active' },
  { id: 3, storeName: 'Caspian Art Gallery', owner: 'Kamran Alizade', email: 'caspian@art.com', products: 22, totalSales: 9400.00, status: 'Pending' },
  { id: 4, storeName: 'SoundCore Baku', owner: 'Nicat Mammadov', email: 'soundcore@baku.az', products: 31, totalSales: 63200.00, status: 'Active' },
  { id: 5, storeName: 'Nordic Furniture', owner: 'Farid Ibrahimov', email: 'nordic@home.az', products: 15, totalSales: 0.00, status: 'Suspended' },
];

export const AdminVendors: React.FC = () => {
  // ── State persistence with localStorage ─────────────────────────────────────
  const [vendors, setVendors] = useState<VendorItem[]>(() => {
    try {
      const saved = localStorage.getItem('vendora_admin_vendors');
      return saved ? (JSON.parse(saved) as VendorItem[]) : initialVendors;
    } catch {
      return initialVendors;
    }
  });

  // Sync state changes to localStorage
  useEffect(() => {
    localStorage.setItem('vendora_admin_vendors', JSON.stringify(vendors));
  }, [vendors]);

  // ── Modal State & Form Control ──────────────────────────────────────────────
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [storeName, setStoreName] = useState('');
  const [owner, setOwner] = useState('');
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'Active' | 'Pending' | 'Suspended'>('Pending');

  // ── Toggle Vendor Status Handler ────────────────────────────────────────────
  const toggleVendorStatus = (vendorId: number, newStatus: 'Active' | 'Pending' | 'Suspended') => {
    setVendors((prev) =>
      prev.map((v) => (v.id === vendorId ? { ...v, status: newStatus } : v))
    );
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
      products: 0,
      totalSales: 0,
      status,
    };

    setVendors((prev) => [newVendor, ...prev]);
    setIsModalOpen(false);
    setStoreName('');
    setOwner('');
    setEmail('');
    setStatus('Pending');
  };

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
    <div className="animate-in fade-in duration-200">
      {/* ── Main Vendors Card Directory ── */}
      <div className="bg-[#111827] border border-slate-800 rounded-3xl overflow-hidden shadow-xl">
        {/* Card Header */}
        <div className="px-6 py-5 border-b border-slate-800 flex flex-col sm:flex-row justify-between sm:items-center gap-3">
          <div>
            <h2 className="text-lg font-bold text-white">Merchant & Vendor Directory</h2>
            <p className="text-xs text-slate-400 mt-0.5">{vendors.length} store owners registered on TradeHub.</p>
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
              {vendors.map((v) => (
                <tr key={v.id} className="hover:bg-slate-950/20 transition-colors">
                  <td className={tdClass}>
                    <div>
                      <span className="font-bold text-white text-sm block">{v.storeName}</span>
                      <span className="text-[11px] text-slate-400">{v.owner} ({v.email})</span>
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
                  Owner Name
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

              <div>
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  required
                  placeholder="e.g. contact@nexustech.az"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-[#111827] border border-slate-800 text-white rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
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
