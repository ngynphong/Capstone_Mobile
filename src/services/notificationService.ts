import axiosInstance from "../configs/axios";
import type { NotificationResponse, GetNotificationsParams } from '../types/notification';

export const notificationService = {
  /**
   * Get all notifications for the current user
   * GET /notifications
   * @param params - Optional query parameters (unreadOnly)
   */
  async getNotifications(params?: GetNotificationsParams): Promise<NotificationResponse[]> {
    const response = await axiosInstance.get<NotificationResponse[]>('/notifications', {
      params
    });
    // API returns array directly, not wrapped in data object
    return response.data || [];
  },

  /**
   * Mark a specific notification as read
   * POST /notifications/{id}
   * @param notificationId - The ID of the notification to mark as read
   */
  async markAsRead(notificationId: string): Promise<NotificationResponse> {
    const response = await axiosInstance.post<NotificationResponse>(
      `/notifications/${notificationId}`
    );
    return response.data;
  },

  /**
   * Mark all notifications as read
   * POST /notifications/readAll
   */
  async markAllAsRead(): Promise<void> {
    await axiosInstance.post('/notifications/readAll');
  }
};
