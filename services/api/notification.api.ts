import apiClient, { handleApiError } from './client';
import { ApiResponse, Notification } from '../../types/api';

/**
 * Get all notifications for the current user
 */
export const getNotifications = async (params?: {
  page?: number;
  limit?: number;
  isRead?: boolean;
}): Promise<{ notifications: Notification[]; pagination: any }> => {
  try {
    const response = await apiClient.get<ApiResponse<Notification[]>>('/notifications', {
      params,
    });

    return {
      notifications: response.data.data || [],
      pagination: response.data.pagination,
    };
  } catch (error) {
    throw new Error(handleApiError(error));
  }
};

/**
 * Get unread notifications count
 */
export const getUnreadCount = async (): Promise<number> => {
  try {
    const response = await apiClient.get<ApiResponse<{ count: number }>>('/notifications/unread-count');

    return response.data.data?.count || 0;
  } catch (error) {
    throw new Error(handleApiError(error));
  }
};

/**
 * Mark notification as read
 */
export const markAsRead = async (notificationId: string): Promise<void> => {
  try {
    await apiClient.patch(`/notifications/${notificationId}/read`);
  } catch (error) {
    throw new Error(handleApiError(error));
  }
};

/**
 * Mark all notifications as read
 */
export const markAllAsRead = async (): Promise<void> => {
  try {
    await apiClient.patch('/notifications/mark-all-read');
  } catch (error) {
    throw new Error(handleApiError(error));
  }
};

/**
 * Delete notification
 */
export const deleteNotification = async (notificationId: string): Promise<void> => {
  try {
    await apiClient.delete(`/notifications/${notificationId}`);
  } catch (error) {
    throw new Error(handleApiError(error));
  }
};

/**
 * Delete all notifications
 */
export const deleteAllNotifications = async (): Promise<void> => {
  try {
    await apiClient.delete('/notifications');
  } catch (error) {
    throw new Error(handleApiError(error));
  }
};
