import React from 'react';
import { Bell, ShoppingBag, X, ArrowRight, AlertTriangle } from 'lucide-react';
import { useNotifications } from '../context/NotificationContext';
import { useNavigate } from 'react-router-dom';

export const AdminOrderToastContainer: React.FC = () => {
  const { liveToasts, dismissToast } = useNotifications();
  const navigate = useNavigate();

  if (liveToasts.length === 0) return null;

  return (
    <div className="fixed top-20 right-4 z-[300] flex flex-col gap-3 max-w-sm w-full pointer-events-none">
      {liveToasts.map((toast) => {
        if (toast.type === 'LowStock') {
          return (
            <div
              key={toast.id}
              className="pointer-events-auto bg-slate-900 border-2 border-rose-500/80 rounded-2xl shadow-2xl p-4 text-slate-100 flex items-start gap-3.5 animate-in slide-in-from-top-5 duration-300 backdrop-blur-md"
            >
              <div className="p-2.5 bg-gradient-to-br from-rose-500 to-rose-600 rounded-xl text-white flex-shrink-0 shadow-lg shadow-rose-500/20">
                <AlertTriangle className="w-5 h-5" />
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-1">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-rose-400 flex items-center gap-1">
                    <AlertTriangle className="w-3 h-3" /> Low Stock Alert
                  </span>
                  <button
                    onClick={() => dismissToast(toast.id)}
                    className="text-slate-400 hover:text-slate-200 p-0.5 rounded-lg transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <p className="text-sm font-semibold text-white mt-1 truncate">
                  {toast.productName}
                </p>
                <p className="text-xs text-rose-300 mt-0.5 font-medium">
                  Stock: <span className="font-extrabold text-white">{toast.stockQuantity}</span> left (Threshold: {toast.threshold})
                </p>

                <button
                  onClick={() => {
                    dismissToast(toast.id);
                    navigate('/admin/products');
                  }}
                  className="mt-2 text-xs font-semibold text-rose-400 hover:text-rose-300 flex items-center gap-1 transition-all group"
                >
                  Manage Products{' '}
                  <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                </button>
              </div>
            </div>
          );
        }

        return (
          <div
            key={toast.id}
            className="pointer-events-auto bg-slate-900 border-2 border-amber-500/80 rounded-2xl shadow-2xl p-4 text-slate-100 flex items-start gap-3.5 animate-in slide-in-from-top-5 duration-300 backdrop-blur-md"
          >
            <div className="p-2.5 bg-gradient-to-br from-amber-500 to-amber-600 rounded-xl text-slate-950 flex-shrink-0 shadow-lg shadow-amber-500/20">
              <ShoppingBag className="w-5 h-5" />
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-1">
                <span className="text-[11px] font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1">
                  <Bell className="w-3 h-3" /> Real-time Order Alert
                </span>
                <button
                  onClick={() => dismissToast(toast.id)}
                  className="text-slate-400 hover:text-slate-200 p-0.5 rounded-lg transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <p className="text-sm font-semibold text-white mt-1">
                Order #{toast.orderId} Placed
              </p>
              <p className="text-xs text-slate-300 mt-0.5">
                Customer: <span className="font-medium text-slate-100">{toast.customerName}</span>
              </p>
              <p className="text-sm font-extrabold text-emerald-400 mt-1">
                ${toast.totalPrice.toFixed(2)}
              </p>

              <button
                onClick={() => {
                  dismissToast(toast.id);
                  navigate('/admin/orders');
                }}
                className="mt-2 text-xs font-semibold text-amber-400 hover:text-amber-300 flex items-center gap-1 transition-all group"
              >
                View in Admin Panel{' '}
                <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
};
