import apiClient from './apiClient';

export interface NotificationItem {
  id: number;
  message: string;
  type?: 'NewOrder' | 'LowStock' | string;
  isRead: boolean;
  isResolved?: boolean;
  createdAt: string;
  relatedOrderId?: number | null;
  relatedProductId?: number | null;
}

export interface NotificationsResponse {
  notifications: NotificationItem[];
  unreadCount: number;
}

export const getNotifications = async (unreadOnly = false): Promise<NotificationsResponse> => {
  return await apiClient.get<never, NotificationsResponse>(`/notifications?unreadOnly=${unreadOnly}`);
};

export const markNotificationAsRead = async (id: number): Promise<void> => {
  await apiClient.put(`/notifications/${id}/read`);
};

export const markAllNotificationsAsRead = async (): Promise<void> => {
  await apiClient.put('/notifications/read-all');
};
