import React, { useState, useRef, useEffect } from 'react';
import { Bell, Check, CheckCheck, ShoppingBag, Radio, AlertTriangle, Eye } from 'lucide-react';
import { useNotifications } from '../context/NotificationContext';
import { useNavigate } from 'react-router-dom';

export const AdminNotificationBell: React.FC = () => {
  // Əgər context-dən dəyərlər undefined gələrsə, default dəyərlər təyin edirik
  const {
    notifications = [],
    unreadCount = 0,
    markAsRead,
    markAllAsRead,
    isConnected = false
  } = useNotifications() || {};

  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  // Təhlükəsiz massiv və say yoxlanışı
  const safeNotifications = Array.isArray(notifications) ? notifications : [];
  const safeUnreadCount = Number(unreadCount) || 0;

  // Çöldə klikləndikdə dropdown-u bağlamaq
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const formatTime = (dateStr: string) => {
    if (!dateStr) return '';
    try {
      const date = new Date(dateStr);
      if (isNaN(date.getTime())) return ''; // "Invalid Date" xətasının qarşısını alır

      const now = new Date();
      const diffSec = Math.floor((now.getTime() - date.getTime()) / 1000);

      if (diffSec < 60) return 'Just now';
      if (diffSec < 3600) return `${Math.floor(diffSec / 60)}m ago`;
      if (diffSec < 86400) return `${Math.floor(diffSec / 3600)}h ago`;
      return date.toLocaleDateString();
    } catch {
      return '';
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Zınqrov Düyməsi */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-xl text-slate-300 hover:text-white hover:bg-slate-800 transition-colors focus:outline-none focus:ring-2 focus:ring-amber-500/50"
        title="Admin Notifications"
      >
        <Bell className="w-5 h-5" />

        {/* Live SignalR Bağlantı Nöqtəsi */}
        <span
          className={`absolute top-1.5 right-1.5 w-2 h-2 rounded-full ${isConnected ? 'bg-emerald-500 animate-pulse' : 'bg-slate-500'
            }`}
          title={isConnected ? 'SignalR Connected (Live)' : 'SignalR Connecting...'}
        />

        {/* Oxunmamış Bildiriş Sayı */}
        {safeUnreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-amber-500 text-slate-950 font-bold text-[10px] w-5 h-5 rounded-full flex items-center justify-center border-2 border-slate-900 animate-in zoom-in-50 duration-200">
            {safeUnreadCount > 99 ? '99+' : safeUnreadCount}
          </span>
        )}
      </button>

      {/* Açılan Menyu (Dropdown) */}
      {isOpen && (
        <div className="absolute right-0 mt-3 w-80 sm:w-96 bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl z-[150] overflow-hidden animate-in fade-in-50 slide-in-from-top-2 duration-200">
          {/* Başlıq */}
          <div className="px-4 py-3 bg-slate-850 border-b border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-slate-100 text-sm">Notifications</span>
              <span className="flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                <Radio className="w-3 h-3 animate-pulse" /> Live SignalR
              </span>
            </div>

            {safeUnreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                className="text-xs text-amber-400 hover:text-amber-300 font-medium flex items-center gap-1 hover:underline transition-all"
              >
                <CheckCheck className="w-3.5 h-3.5" />
                Mark all read
              </button>
            )}
          </div>

          {/* Bildirişlər Siyahısı */}
          <div className="max-h-80 overflow-y-auto divide-y divide-slate-800/60">
            {safeNotifications.length === 0 ? (
              <div className="p-8 text-center text-slate-400">
                <Bell className="w-8 h-8 mx-auto mb-2 opacity-30 text-slate-400" />
                <p className="text-sm font-medium">No notifications yet</p>
                <p className="text-xs text-slate-500 mt-1">
                  New orders, stock alerts, and user activity will pop up here in real time.
                </p>
              </div>
            ) : (
              safeNotifications.map((item) => {
                if (!item) return null; // Zədələnmiş item-lərdən qorunma
                const isLowStock = item.type === 'LowStock';
                const isUserActivity = item.type === 'UserActivity';

                return (
                  <div
                    key={item.id}
                    className={`p-3.5 flex items-start gap-3 transition-colors ${item.isRead
                        ? 'bg-slate-900/60 text-slate-400'
                        : isLowStock
                          ? 'bg-rose-500/10 text-slate-100 font-medium border-l-2 border-rose-500'
                          : isUserActivity
                            ? 'bg-sky-500/10 text-slate-100 font-medium border-l-2 border-sky-500'
                            : 'bg-amber-500/5 text-slate-100 font-medium'
                      } hover:bg-slate-800/80`}
                  >
                    {isLowStock ? (
                      <div className="p-2 rounded-xl bg-rose-500/20 text-rose-400 border border-rose-500/30 flex-shrink-0 mt-0.5">
                        <AlertTriangle className="w-4 h-4" />
                      </div>
                    ) : isUserActivity ? (
                      <div className="p-2 rounded-xl bg-sky-500/20 text-sky-400 border border-sky-500/30 flex-shrink-0 mt-0.5">
                        <Eye className="w-4 h-4" />
                      </div>
                    ) : (
                      <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400 flex-shrink-0 mt-0.5">
                        <ShoppingBag className="w-4 h-4" />
                      </div>
                    )}

                    <div className="flex-1 min-w-0">
                      <p className="text-xs leading-relaxed text-slate-200">{item.message}</p>
                      <div className="flex items-center justify-between mt-1">
                        <span className="text-[10px] text-slate-400">{formatTime(item.createdAt)}</span>
                        {isLowStock ? (
                          <button
                            onClick={() => {
                              setIsOpen(false);
                              navigate('/admin/products');
                            }}
                            className="text-[11px] text-rose-400 hover:underline font-medium"
                          >
                            View Products
                          </button>
                        ) : (item.type === 'NewOrder' || item.relatedOrderId || item.message?.toLowerCase().includes('order')) ? (
                          <button
                            onClick={() => {
                              if (!item.isRead && typeof markAsRead === 'function') markAsRead(item.id);
                              setIsOpen(false);
                              navigate('/admin/orders', { replace: true });
                            }}
                            className="text-[11px] text-amber-400 hover:underline font-medium"
                          >
                            View Orders
                          </button>
                        ) : null}
                      </div>
                    </div>

                    {!item.isRead && typeof markAsRead === 'function' && (
                      <button
                        onClick={() => markAsRead(item.id)}
                        className="text-slate-500 hover:text-amber-400 p-1 transition-colors"
                        title="Mark as read"
                      >
                        <Check className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                );
              })
            )}
          </div>

          {/* Alt Hissə (Footer) */}
          <div className="p-2.5 bg-slate-900 border-t border-slate-800 text-center">
            <button
              onClick={() => {
                setIsOpen(false);
                navigate('/admin/orders', { replace: true });
              }}
              className="text-xs text-slate-400 hover:text-amber-400 transition-colors font-medium"
            >
              Go to Admin Orders Panel →
            </button>
          </div>
        </div>
      )}
    </div>
  );
};