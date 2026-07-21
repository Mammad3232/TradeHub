import React, { useState } from 'react';
import {
  Package,
  Search,
  Filter,
  Eye,
  Download,
  ArrowUpDown,
  CheckCircle2,
  Clock,
  Truck,
  XCircle,
  ChevronRight,
} from 'lucide-react';

export interface OrderItem {
  id: string;
  productName: string;
  productImage: string;
  customerName: string;
  customerEmail: string;
  date: string;
  amount: number;
  status: 'Delivered' | 'Pending' | 'Shipped' | 'Cancelled';
  paymentMethod: string;
}

const mockOrders: OrderItem[] = [
  {
    id: 'ORD-2041',
    productName: 'iPhone 15 Pro Max (256GB, Titanium)',
    productImage: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=120&auto=format&fit=crop&q=80',
    customerName: 'Aynur Aliyeva',
    customerEmail: 'aynur.a@example.com',
    date: '2026-07-21',
    amount: 1199.00,
    status: 'Delivered',
    paymentMethod: 'Credit Card (•••• 4242)',
  },
  {
    id: 'ORD-2042',
    productName: 'MacBook Pro M3 Max 16"',
    productImage: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=120&auto=format&fit=crop&q=80',
    customerName: 'Tural Mammadov',
    customerEmail: 'tural.m@example.com',
    date: '2026-07-20',
    amount: 2499.00,
    status: 'Pending',
    paymentMethod: 'Apple Pay',
  },
  {
    id: 'ORD-2043',
    productName: 'Aether Sound Wave Pro Headphones',
    productImage: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=120&auto=format&fit=crop&q=80',
    customerName: 'Leyla Hasanova',
    customerEmail: 'leyla.h@example.com',
    date: '2026-07-19',
    amount: 299.99,
    status: 'Shipped',
    paymentMethod: 'PayPal',
  },
  {
    id: 'ORD-2044',
    productName: 'Minimalist Leather Chronograph Watch',
    productImage: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=120&auto=format&fit=crop&q=80',
    customerName: 'Farid Qasimov',
    customerEmail: 'farid.q@example.com',
    date: '2026-07-18',
    amount: 189.00,
    status: 'Delivered',
    paymentMethod: 'Credit Card (•••• 8812)',
  },
  {
    id: 'ORD-2045',
    productName: 'Ergonomic Walnut Desk Stand',
    productImage: 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=120&auto=format&fit=crop&q=80',
    customerName: 'Elnur Sadigov',
    customerEmail: 'elnur.s@example.com',
    date: '2026-07-17',
    amount: 124.50,
    status: 'Pending',
    paymentMethod: 'Bank Transfer',
  },
];

const statusConfig = {
  Delivered: {
    badge: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/20',
    dot: 'bg-emerald-400 shadow-emerald-500/50',
    icon: CheckCircle2,
  },
  Pending: {
    badge: 'bg-amber-500/10 text-amber-400 border-amber-500/30 hover:bg-amber-500/20',
    dot: 'bg-amber-400 shadow-amber-500/50',
    icon: Clock,
  },
  Shipped: {
    badge: 'bg-blue-500/10 text-blue-400 border-blue-500/30 hover:bg-blue-500/20',
    dot: 'bg-blue-400 shadow-blue-500/50',
    icon: Truck,
  },
  Cancelled: {
    badge: 'bg-rose-500/10 text-rose-400 border-rose-500/30 hover:bg-rose-500/20',
    dot: 'bg-rose-400 shadow-rose-500/50',
    icon: XCircle,
  },
};

export const RecentOrdersTable: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('All');
  const [selectedOrder, setSelectedOrder] = useState<OrderItem | null>(null);

  const filteredOrders = mockOrders.filter((order) => {
    const matchesSearch =
      order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.customerName.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = selectedStatus === 'All' || order.status === selectedStatus;

    return matchesSearch && matchesStatus;
  });

  const handleDownloadInvoice = (orderId: string) => {
    alert(`Downloading PDF Invoice for ${orderId}...`);
  };

  return (
    <div className="bg-[#111827] border border-slate-800 rounded-2xl shadow-2xl overflow-hidden text-left relative transition-all">
      {/* ─── Table Header & Controls */}
      <div className="p-5 sm:p-6 border-b border-slate-800/80 bg-[#111827]/80 backdrop-blur-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-3">
              <h2 className="text-lg sm:text-xl font-bold text-white tracking-tight">Recent Orders</h2>
              <span className="bg-purple-500/15 text-purple-400 border border-purple-500/25 px-2.5 py-0.5 rounded-full text-xs font-semibold">
                {filteredOrders.length} orders
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Manage and track latest customer purchases and order fulfillments.
            </p>
          </div>

          {/* Search & Filter Bar */}
          <div className="flex flex-wrap items-center gap-3">
            {/* Search Input */}
            <div className="relative flex-1 sm:w-64">
              <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search orders, customers..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-[#0E1524] border border-slate-800 rounded-xl pl-9 pr-4 py-2 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500 transition-all"
              />
            </div>

            {/* Status Filter Buttons */}
            <div className="flex items-center bg-[#0E1524] p-1 rounded-xl border border-slate-800 text-xs">
              {['All', 'Delivered', 'Pending', 'Shipped'].map((status) => (
                <button
                  key={status}
                  type="button"
                  onClick={() => setSelectedStatus(status)}
                  className={`px-3 py-1.5 rounded-lg font-medium transition-all cursor-pointer ${
                    selectedStatus === status
                      ? 'bg-purple-600 text-white shadow-md shadow-purple-600/20 font-semibold'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {status}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ─── Table Content */}
      <div className="overflow-x-auto w-full">
        <table className="w-full text-left min-w-[850px] border-collapse">
          <thead>
            <tr className="bg-[#0B1120] text-[11px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-800/80 select-none">
              <th className="px-6 py-4">
                <div className="flex items-center gap-1.5 cursor-pointer hover:text-slate-200 transition-colors">
                  <span>Order ID</span>
                  <ArrowUpDown className="w-3 h-3 text-slate-500" />
                </div>
              </th>
              <th className="px-6 py-4">Product Details</th>
              <th className="px-6 py-4">Customer</th>
              <th className="px-6 py-4">Date</th>
              <th className="px-6 py-4">Amount</th>
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4 text-right">Actions</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-800/60 text-sm text-slate-300">
            {filteredOrders.length > 0 ? (
              filteredOrders.map((order) => {
                const StatusIcon = statusConfig[order.status].icon;
                return (
                  <tr
                    key={order.id}
                    className="hover:bg-[#1A2333] transition-colors duration-200 group cursor-pointer"
                    onClick={() => setSelectedOrder(order)}
                  >
                    {/* Order ID */}
                    <td className="px-6 py-4 font-mono font-bold text-white group-hover:text-purple-400 transition-colors">
                      <span className="inline-flex items-center gap-1.5">
                        {order.id}
                      </span>
                    </td>

                    {/* Product */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-11 h-11 rounded-xl overflow-hidden bg-slate-800 flex-shrink-0 border border-slate-700/60 flex items-center justify-center relative shadow-inner">
                          {order.productImage ? (
                            <img
                              src={order.productImage}
                              alt={order.productName}
                              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                              loading="lazy"
                            />
                          ) : (
                            <Package className="w-5 h-5 text-slate-500" />
                          )}
                        </div>
                        <div className="flex flex-col min-w-0">
                          <span className="font-semibold text-slate-100 truncate max-w-[220px] group-hover:text-white transition-colors" title={order.productName}>
                            {order.productName}
                          </span>
                          <span className="text-[11px] text-slate-500 font-mono mt-0.5">
                            {order.paymentMethod}
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* Customer */}
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="font-semibold text-slate-200 group-hover:text-white transition-colors">
                          {order.customerName}
                        </span>
                        <span className="text-xs text-slate-500 truncate max-w-[150px]">
                          {order.customerEmail}
                        </span>
                      </div>
                    </td>

                    {/* Date */}
                    <td className="px-6 py-4 text-xs font-mono text-slate-400 whitespace-nowrap">
                      {order.date}
                    </td>

                    {/* Amount */}
                    <td className="px-6 py-4">
                      <span className="font-extrabold text-white text-base">
                        ${order.amount.toFixed(2)}
                      </span>
                    </td>

                    {/* Status Pill Badge */}
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center gap-1.5 px-3 py-1 text-xs rounded-full font-bold border transition-all shadow-sm ${
                          statusConfig[order.status].badge
                        }`}
                      >
                        <span className={`w-1.5 h-1.5 rounded-full ${statusConfig[order.status].dot} shadow-sm`} />
                        <StatusIcon className="w-3.5 h-3.5" />
                        <span>{order.status}</span>
                      </span>
                    </td>

                    {/* Action Menu */}
                    <td className="px-6 py-4 text-right" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-end gap-1">
                        <button
                          type="button"
                          onClick={() => setSelectedOrder(order)}
                          title="View Order Details"
                          className="p-2 text-slate-400 hover:text-purple-400 hover:bg-purple-500/10 rounded-lg transition-colors cursor-pointer"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDownloadInvoice(order.id)}
                          title="Download Invoice"
                          className="p-2 text-slate-400 hover:text-blue-400 hover:bg-blue-500/10 rounded-lg transition-colors cursor-pointer"
                        >
                          <Download className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={7} className="px-6 py-12 text-center text-slate-500">
                  <div className="flex flex-col items-center justify-center gap-2">
                    <Filter className="w-8 h-8 text-slate-600" />
                    <span className="text-sm font-semibold text-slate-400">No orders found matching your search.</span>
                    <button
                      type="button"
                      onClick={() => {
                        setSearchTerm('');
                        setSelectedStatus('All');
                      }}
                      className="mt-2 text-xs font-bold text-purple-400 hover:underline cursor-pointer"
                    >
                      Clear Filters
                    </button>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* ─── Table Footer */}
      <div className="px-6 py-4 border-t border-slate-800/80 bg-[#0B1120]/50 flex items-center justify-between text-xs text-slate-400">
        <span>Showing {filteredOrders.length} of {mockOrders.length} recent transactions</span>
        <button
          type="button"
          onClick={() => alert('Redirecting to full Orders list...')}
          className="flex items-center gap-1 font-semibold text-purple-400 hover:text-purple-300 transition-colors cursor-pointer"
        >
          <span>View All Orders</span>
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      {/* ─── Order Detail Modal Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#111827] border border-slate-800 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-200">
            <div className="p-6 border-b border-slate-800 flex justify-between items-center">
              <div>
                <h3 className="text-lg font-bold text-white">Order Details #{selectedOrder.id}</h3>
                <p className="text-xs text-slate-400 mt-0.5">Placed on {selectedOrder.date}</p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedOrder(null)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="p-6 space-y-5 text-sm text-left">
              {/* Product Info */}
              <div className="flex items-center gap-4 bg-[#0E1524] p-4 rounded-xl border border-slate-800">
                <img
                  src={selectedOrder.productImage}
                  alt={selectedOrder.productName}
                  className="w-14 h-14 rounded-lg object-cover border border-slate-700"
                />
                <div>
                  <h4 className="font-bold text-white">{selectedOrder.productName}</h4>
                  <p className="text-xs text-slate-400 mt-1">Amount Paid: <span className="text-white font-extrabold">${selectedOrder.amount.toFixed(2)}</span></p>
                </div>
              </div>

              {/* Customer & Payment Info */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-[#0E1524] p-3.5 rounded-xl border border-slate-800">
                  <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Customer</span>
                  <p className="font-semibold text-white mt-1">{selectedOrder.customerName}</p>
                  <p className="text-xs text-slate-400">{selectedOrder.customerEmail}</p>
                </div>
                <div className="bg-[#0E1524] p-3.5 rounded-xl border border-slate-800">
                  <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Payment Method</span>
                  <p className="font-semibold text-white mt-1">{selectedOrder.paymentMethod}</p>
                </div>
              </div>

              {/* Status */}
              <div className="flex items-center justify-between bg-[#0E1524] p-3.5 rounded-xl border border-slate-800">
                <span className="text-xs font-semibold text-slate-400">Current Status</span>
                <span className={`inline-flex items-center gap-1.5 px-3 py-1 text-xs rounded-full font-bold border ${statusConfig[selectedOrder.status].badge}`}>
                  <span>{selectedOrder.status}</span>
                </span>
              </div>
            </div>

            <div className="p-4 border-t border-slate-800 bg-[#0B1120] flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setSelectedOrder(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white cursor-pointer"
              >
                Close
              </button>
              <button
                type="button"
                onClick={() => {
                  handleDownloadInvoice(selectedOrder.id);
                  setSelectedOrder(null);
                }}
                className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-xl text-xs font-bold shadow-lg shadow-purple-600/20 cursor-pointer"
              >
                Download Receipt
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
