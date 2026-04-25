import { create } from 'zustand';
import { Notification as ApiNotification } from '../types/api';
import * as notificationApi from '../services/api/notification.api';

export interface Notification extends Omit<ApiNotification, 'userId'> {
  type: 'order' | 'wallet' | 'system' | 'promotion';
  relatedId?: string; // Order ID, transaction ID, etc.
}

interface NotificationState {
  notifications: Notification[];
  unreadCount: number;
  isLoading: boolean;

  // Actions
  fetchNotifications: () => Promise<void>;
  markAsRead: (notificationId: string) => void;
  markAllAsRead: () => void;
  clearNotification: (notificationId: string) => void;
  clearAllNotifications: () => void;
  addNotification: (notification: Omit<Notification, 'id' | 'isRead' | 'createdAt'>) => void;
}

export const useNotificationStore = create<NotificationState>((set, get) => ({
  notifications: [],
  unreadCount: 0,
  isLoading: false,

  fetchNotifications: async () => {
    try {
      set({ isLoading: true });

      const result = await notificationApi.getNotifications({ limit: 50 });
      const unreadCount = await notificationApi.getUnreadCount();

      // Map API notifications to store format
      const mappedNotifications: Notification[] = result.notifications.map((n) => ({
        ...n,
        type: (n.type as any) || 'system',
        relatedId: n.orderId || n.data?.transactionId,
      }));

      set({
        notifications: mappedNotifications,
        unreadCount,
        isLoading: false,
      });
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
      set({ isLoading: false });
    }
  },

  markAsRead: (notificationId: string) => {
    const { notifications } = get();
    const updatedNotifications = notifications.map(notification =>
      notification.id === notificationId
        ? { ...notification, isRead: true }
        : notification
    );
    const unreadCount = updatedNotifications.filter(n => !n.isRead).length;

    set({ notifications: updatedNotifications, unreadCount });

    // Call API to mark as read on backend
    notificationApi.markAsRead(notificationId).catch((error) => {
      console.error('Failed to mark notification as read:', error);
    });
  },

  markAllAsRead: () => {
    const { notifications } = get();
    const updatedNotifications = notifications.map(notification => ({
      ...notification,
      isRead: true,
    }));

    set({ notifications: updatedNotifications, unreadCount: 0 });

    // Call API to mark all as read on backend
    notificationApi.markAllAsRead().catch((error) => {
      console.error('Failed to mark all notifications as read:', error);
    });
  },

  clearNotification: (notificationId: string) => {
    const { notifications } = get();
    const updatedNotifications = notifications.filter(n => n.id !== notificationId);
    const unreadCount = updatedNotifications.filter(n => !n.isRead).length;

    set({ notifications: updatedNotifications, unreadCount });

    // Call API to delete notification on backend
    notificationApi.deleteNotification(notificationId).catch((error) => {
      console.error('Failed to delete notification:', error);
    });
  },

  clearAllNotifications: () => {
    set({ notifications: [], unreadCount: 0 });

    // Call API to clear all notifications on backend
    notificationApi.deleteAllNotifications().catch((error) => {
      console.error('Failed to clear all notifications:', error);
    });
  },

  addNotification: (notification) => {
    const { notifications } = get();
    const newNotification: Notification = {
      ...notification,
      id: Date.now().toString(),
      isRead: false,
      createdAt: new Date().toISOString(),
    };

    set({
      notifications: [newNotification, ...notifications],
      unreadCount: get().unreadCount + 1,
    });
  },
}));
