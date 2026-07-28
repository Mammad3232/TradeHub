import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import * as signalR from '@microsoft/signalr';
import {
  type NotificationItem,
  getNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
} from '../services/notificationService';

export interface NewOrderEventData {
  orderId: number;
  customerName: string;
  totalPrice: number;
  createdAt: string;
}

export interface LowStockEventData {
  notificationId: number;
  productId: number;
  productName: string;
  stockQuantity: number;
  threshold: number;
  message: string;
  createdAt: string;
}

// YENİ: İstifadəçi hərəkəti üçün interface
export interface UserActivityEventData {
  userId: string;
  userName: string;
  pageUrl: string;
  message: string;
  createdAt: string;
}

export interface LiveOrderToast {
  id: string;
  type?: 'NewOrder';
  orderId: number;
  customerName: string;
  totalPrice: number;
  createdAt: string;
}

export interface LiveLowStockToast {
  id: string;
  type: 'LowStock';
  productId: number;
  productName: string;
  stockQuantity: number;
  threshold: number;
  message: string;
  createdAt: string;
}

// YENİ: Ekrana çıxacaq anlıq bildiriş (Toast) üçün tip
export interface LiveUserActivityToast {
  id: string;
  type: 'UserActivity';
  userName: string;
  pageUrl: string;
  message: string;
  createdAt: string;
}

export type LiveToastItem = LiveOrderToast | LiveLowStockToast | LiveUserActivityToast;

export interface RoleUpdatedEventData {
  userId: number;
  newRole: string;
  message: string;
}

interface NotificationContextValue {
  notifications: NotificationItem[];
  unreadCount: number;
  liveToasts: LiveToastItem[];
  roleUpdateToast: string | null;
  dismissToast: (id: string) => void;
  markAsRead: (id: number) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  refreshNotifications: () => Promise<void>;
  isConnected: boolean;
}

const NotificationContext = createContext<NotificationContextValue | null>(null);

const HUB_URL = 'http://localhost:5229/hubs/orders';

const STORAGE_KEY = 'vendora_admin_notifications';
const MAX_PERSISTED_NOTIFICATIONS = 50;

/**
 * Loads and parses initial admin notifications from localStorage.
 */
const getInitialNotifications = (): NotificationItem[] => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed)) {
        return parsed
          .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
          .slice(0, MAX_PERSISTED_NOTIFICATIONS);
      }
    }
  } catch (e) {
    console.error('Failed to load notifications from localStorage:', e);
  }
  return [];
};

export const NotificationProvider: React.FC<{
  children: React.ReactNode;
  userRole?: string;
  isLoggedIn?: boolean;
}> = ({ children, userRole, isLoggedIn }) => {
  const [notifications, setNotifications] = useState<NotificationItem[]>(getInitialNotifications);
  const [unreadCount, setUnreadCount] = useState<number>(() => {
    return getInitialNotifications().filter((n) => !n.isRead).length;
  });
  const [liveToasts, setLiveToasts] = useState<LiveToastItem[]>([]);
  const [roleUpdateToast, setRoleUpdateToast] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState<boolean>(false);

  const connectionRef = useRef<signalR.HubConnection | null>(null);
  const navigate = useNavigate();

  // Sync notifications to localStorage & recalculate unreadCount whenever notifications state changes
  useEffect(() => {
    try {
      if (notifications.length > 0) {
        const capped = notifications
          .slice(0, MAX_PERSISTED_NOTIFICATIONS);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(capped));
      } else {
        localStorage.removeItem(STORAGE_KEY);
      }
    } catch (e) {
      console.error('Failed to save notifications to localStorage:', e);
    }
    setUnreadCount(notifications.filter((n) => !n.isRead).length);
  }, [notifications]);

  const fetchNotifications = useCallback(async () => {
    if (userRole !== 'Admin' || !isLoggedIn) return;
    try {
      const data = await getNotifications();
      if (data && Array.isArray(data.notifications)) {
        setNotifications((prev) => {
          const map = new Map<number, NotificationItem>();
          // Put existing local items first (including UserActivity items)
          prev.forEach((item) => map.set(item.id, item));
          // Merge server notifications
          data.notifications.forEach((item) => {
            const existing = map.get(item.id);
            if (existing) {
              map.set(item.id, { ...item, isRead: existing.isRead || item.isRead });
            } else {
              map.set(item.id, item);
            }
          });

          return Array.from(map.values())
            .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
            .slice(0, MAX_PERSISTED_NOTIFICATIONS);
        });
      }
    } catch {
    }
  }, [userRole, isLoggedIn]);

  const dismissToast = useCallback((id: string) => {
    setLiveToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const markAsReadHandler = useCallback(async (id: number) => {
    // Optimistically update UI first
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
    );
    // Only call the backend for real DB notifications (positive IDs).
    // Negative IDs are ephemeral SignalR notifications with no DB row.
    if (id > 0) {
      try {
        await markNotificationAsRead(id);
      } catch (err) {
        console.error('Failed to mark notification as read on backend:', err);
      }
    }
  }, []);

  const markAllAsReadHandler = useCallback(async () => {
    try {
      await markAllNotificationsAsRead();
    } catch (err) {
      console.error('Failed to mark all as read:', err);
    } finally {
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    }
  }, []);

  useEffect(() => {
    let isMounted = true;

    if (!isLoggedIn) {
      if (connectionRef.current) {
        if (connectionRef.current.state !== signalR.HubConnectionState.Disconnected) {
          connectionRef.current.stop().catch(() => { });
        }
        connectionRef.current = null;
        setIsConnected(false);
      }
      setNotifications([]);
      setUnreadCount(0);
      localStorage.removeItem(STORAGE_KEY);
      return;
    }

    const token = localStorage.getItem('token') || localStorage.getItem('tradehub_token');
    if (!token) return;

    const isAdminRole = String(userRole || '').toLowerCase() === 'admin';

    if (isAdminRole) {
      fetchNotifications();
    }

    const connection = new signalR.HubConnectionBuilder()
      .withUrl(`${HUB_URL}?access_token=${encodeURIComponent(token)}`)
      .withAutomaticReconnect([0, 2000, 5000, 10000, 30000])
      .configureLogging(signalR.LogLevel.None)
      .build();

    connectionRef.current = connection;

    if (isAdminRole) {
      connection.on('NewOrderReceived', (data: NewOrderEventData) => {
        if (!isMounted) return;
        const toastId = `order-${data.orderId}-${Date.now()}`;
        // Use a negative ephemeral ID so it never collides with real DB int IDs
        // and so markAsRead knows to skip the backend API call for it.
        const ephemeralId = -(data.orderId * 1000 + Date.now() % 1000);
        const newNotification: NotificationItem = {
          id: ephemeralId,
          message: `New order #${data.orderId} from ${data.customerName} — $${data.totalPrice.toFixed(2)}`,
          type: 'NewOrder',
          isRead: false,
          createdAt: data.createdAt || new Date().toISOString(),
          relatedOrderId: data.orderId,
        };

        setNotifications((prev) =>
          [newNotification, ...prev]
            .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
            .slice(0, MAX_PERSISTED_NOTIFICATIONS)
        );

        setLiveToasts((prev) => [
          {
            id: toastId,
            type: 'NewOrder',
            orderId: data.orderId,
            customerName: data.customerName,
            totalPrice: data.totalPrice,
            createdAt: data.createdAt,
          },
          ...prev,
        ]);

        setTimeout(() => {
          if (isMounted) setLiveToasts((prev) => prev.filter((t) => t.id !== toastId));
        }, 6000);
      });

      connection.on('LowStockAlert', (data: LowStockEventData) => {
        if (!isMounted) return;
        const toastId = `lowstock-${data.productId}-${Date.now()}`;
        // Use real DB notificationId if provided, otherwise use a negative ephemeral ID
        const notifId = (data.notificationId && data.notificationId > 0)
          ? data.notificationId
          : -(data.productId * 1000 + Date.now() % 1000);
        const newNotification: NotificationItem = {
          id: notifId,
          message: data.message || `Low stock: "${data.productName}" has only ${data.stockQuantity} unit(s) left`,
          type: 'LowStock',
          isRead: false,
          isResolved: false,
          createdAt: data.createdAt || new Date().toISOString(),
          relatedProductId: data.productId,
        };

        setNotifications((prev) =>
          [newNotification, ...prev]
            .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
            .slice(0, MAX_PERSISTED_NOTIFICATIONS)
        );

        setLiveToasts((prev) => [
          {
            id: toastId,
            type: 'LowStock',
            productId: data.productId,
            productName: data.productName,
            stockQuantity: data.stockQuantity,
            threshold: data.threshold,
            message: data.message,
            createdAt: data.createdAt,
          },
          ...prev,
        ]);

        setTimeout(() => {
          if (isMounted) setLiveToasts((prev) => prev.filter((t) => t.id !== toastId));
        }, 7000);
      });

      // Admin üçün İstifadəçi Hərəkəti (Səhifə dəyişməsi) dinləyicisi
      connection.on('UserPageActivity', (data: UserActivityEventData) => {
        console.log("Received UserPageActivity:", data);
        if (!isMounted) return;
        const toastId = `activity-${data.userId}-${Date.now()}`;

        // Ephemeral activity notification — negative ID so markAsRead skips the backend call
        const activityId = -(parseInt(data.userId, 10) || 0) * 10000 - (Date.now() % 10000);
        const newNotification: NotificationItem = {
          id: activityId,
          message: data.message || `${data.userName} viewed page: ${data.pageUrl}`,
          type: 'UserActivity',
          isRead: false,
          createdAt: data.createdAt || new Date().toISOString(),
        };

        setNotifications((prev) =>
          [newNotification, ...prev]
            .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
            .slice(0, MAX_PERSISTED_NOTIFICATIONS)
        );

        // Ekranda popup (toast) kimi göstəririk
        setLiveToasts((prev) => [
          {
            id: toastId,
            type: 'UserActivity',
            userName: data.userName,
            pageUrl: data.pageUrl,
            message: data.message,
            createdAt: data.createdAt,
          },
          ...prev,
        ]);

        setTimeout(() => {
          if (isMounted) setLiveToasts((prev) => prev.filter((t) => t.id !== toastId));
        }, 5000); // 5 saniyə sonra ekrandan silinsin
      });
    }

    connection.on('RoleUpdated', (data: RoleUpdatedEventData) => {
      if (!isMounted) return;
      const msg = data.message || 'Your account permissions have been updated. Please log in again to apply changes.';
      setRoleUpdateToast(msg);
      setTimeout(() => {
        localStorage.removeItem('token');
        localStorage.removeItem('tradehub_token');
        localStorage.removeItem('vendora_user');
        localStorage.removeItem('mockUser');
        localStorage.removeItem('vendora_active_user');
        localStorage.removeItem(STORAGE_KEY);

        if (connectionRef.current) {
          if (connectionRef.current.state !== signalR.HubConnectionState.Disconnected) {
            connectionRef.current.stop().catch(() => { });
          }
          connectionRef.current = null;
        }
        setIsConnected(false);
        setRoleUpdateToast(null);
        navigate('/login');
      }, 3000);
    });

    connection.onreconnecting(() => {
      if (isMounted) setIsConnected(false);
    });
    connection.onreconnected(() => {
      if (isMounted) setIsConnected(true);
    });

    if (connection.state === signalR.HubConnectionState.Disconnected) {
      connection
        .start()
        .then(() => {
          if (isMounted) setIsConnected(true);
        })
        .catch((err: any) => {
          const errMsg = String(err?.message || err || '');
          const errName = String(err?.name || '');
          if (
            errName === 'AbortError' ||
            errMsg.includes('negotiation') ||
            errMsg.includes('stopped')
          ) {
            return;
          }
          console.warn('SignalR connection failed:', err);
          if (isMounted) setIsConnected(false);
        });
    }

    return () => {
      isMounted = false;
      if (connectionRef.current) {
        if (connectionRef.current.state !== signalR.HubConnectionState.Disconnected) {
          connectionRef.current.stop().catch(() => { });
        }
        connectionRef.current = null;
        if (isMounted) setIsConnected(false);
      }
    };
  }, [isLoggedIn, userRole, fetchNotifications, navigate]);

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        liveToasts,
        roleUpdateToast,
        dismissToast,
        markAsRead: markAsReadHandler,
        markAllAsRead: markAllAsReadHandler,
        refreshNotifications: fetchNotifications,
        isConnected,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => {
  const ctx = useContext(NotificationContext);
  if (!ctx) {
    throw new Error('useNotifications must be used inside <NotificationProvider>');
  }
  return ctx;
};