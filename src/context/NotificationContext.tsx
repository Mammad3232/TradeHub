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

export type LiveToastItem = LiveOrderToast | LiveLowStockToast;

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

export const NotificationProvider: React.FC<{
  children: React.ReactNode;
  userRole?: string;
  isLoggedIn?: boolean;
}> = ({ children, userRole, isLoggedIn }) => {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [liveToasts, setLiveToasts] = useState<LiveToastItem[]>([]);
  const [roleUpdateToast, setRoleUpdateToast] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState<boolean>(false);

  const connectionRef = useRef<signalR.HubConnection | null>(null);
  const navigate = useNavigate();

  // Fetch initial notifications from API (for "was offline" case)
  const fetchNotifications = useCallback(async () => {
    if (userRole !== 'Admin' || !isLoggedIn) return;
    try {
      const data = await getNotifications();
      if (data && Array.isArray(data.notifications)) {
        setNotifications(data.notifications);
        setUnreadCount(data.unreadCount ?? 0);
      }
    } catch {
      // Ignore auth/network errors when fetching initial notifications
    }
  }, [userRole, isLoggedIn]);

  const dismissToast = useCallback((id: string) => {
    setLiveToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  // Mark single as read
  const markAsReadHandler = useCallback(async (id: number) => {
    try {
      await markNotificationAsRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (err) {
      console.error('Failed to mark notification as read:', err);
    }
  }, []);

  // Mark all as read
  const markAllAsReadHandler = useCallback(async () => {
    try {
      await markAllNotificationsAsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch (err) {
      console.error('Failed to mark all as read:', err);
    }
  }, []);

  // Set up SignalR connection for ALL logged-in users
  // Admins: receive NewOrderReceived & LowStockAlert
  // All users: receive RoleUpdated targeted specifically to their user ID
  useEffect(() => {
    if (!isLoggedIn) {
      if (connectionRef.current) {
        connectionRef.current.stop();
        connectionRef.current = null;
        setIsConnected(false);
      }
      setNotifications([]);
      setUnreadCount(0);
      return;
    }

    const token = localStorage.getItem('tradehub_token');
    if (!token) return;

    // Load initial offline notifications (Admins only)
    if (userRole === 'Admin') {
      fetchNotifications();
    }

    const connection = new signalR.HubConnectionBuilder()
      .withUrl(`${HUB_URL}?access_token=${encodeURIComponent(token)}`)
      .withAutomaticReconnect([0, 2000, 5000, 10000, 30000])
      .configureLogging(signalR.LogLevel.Warning)
      .build();

    connectionRef.current = connection;

    // ── Admin only: real-time order & low-stock alerts ────────────────────────
    if (userRole === 'Admin') {
      connection.on('NewOrderReceived', (data: NewOrderEventData) => {
        const toastId = `order-${data.orderId}-${Date.now()}`;
        const newNotification: NotificationItem = {
          id: Date.now(),
          message: `New order #${data.orderId} from ${data.customerName} — $${data.totalPrice.toFixed(2)}`,
          type: 'NewOrder',
          isRead: false,
          createdAt: data.createdAt || new Date().toISOString(),
          relatedOrderId: data.orderId,
        };

        setNotifications((prev) => [newNotification, ...prev]);
        setUnreadCount((prev) => prev + 1);

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
          setLiveToasts((prev) => prev.filter((t) => t.id !== toastId));
        }, 6000);
      });

      connection.on('LowStockAlert', (data: LowStockEventData) => {
        const toastId = `lowstock-${data.productId}-${Date.now()}`;
        const newNotification: NotificationItem = {
          id: data.notificationId || Date.now(),
          message: data.message || `Low stock: "${data.productName}" has only ${data.stockQuantity} unit(s) left`,
          type: 'LowStock',
          isRead: false,
          isResolved: false,
          createdAt: data.createdAt || new Date().toISOString(),
          relatedProductId: data.productId,
        };

        setNotifications((prev) => [newNotification, ...prev]);
        setUnreadCount((prev) => prev + 1);

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
          setLiveToasts((prev) => prev.filter((t) => t.id !== toastId));
        }, 7000);
      });
    }

    // ── All users: role update session invalidation ───────────────────────────
    connection.on('RoleUpdated', (data: RoleUpdatedEventData) => {
      const msg = data.message || 'Your account permissions have been updated. Please log in again to apply changes.';

      // Show toast so the user sees the notification before being redirected
      setRoleUpdateToast(msg);

      // Give user 3 seconds to read the message, then log out & redirect
      setTimeout(() => {
        // Clear all session data
        localStorage.removeItem('tradehub_token');
        localStorage.removeItem('vendora_user');
        localStorage.removeItem('mockUser');
        localStorage.removeItem('vendora_active_user');

        // Stop the hub connection before navigation
        if (connectionRef.current) {
          connectionRef.current.stop().catch(() => {});
          connectionRef.current = null;
        }
        setIsConnected(false);
        setRoleUpdateToast(null);

        // Redirect to login
        navigate('/login');
      }, 3000);
    });

    connection.onreconnecting(() => setIsConnected(false));
    connection.onreconnected(() => setIsConnected(true));

    connection
      .start()
      .then(() => setIsConnected(true))
      .catch((err) => {
        console.warn('SignalR connection failed:', err);
        setIsConnected(false);
      });

    return () => {
      if (connectionRef.current) {
        connectionRef.current.stop();
        connectionRef.current = null;
        setIsConnected(false);
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
