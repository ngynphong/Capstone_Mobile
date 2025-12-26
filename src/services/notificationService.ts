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
  },

  /**
   * Get public notification for home screen display (single notification)
   * GET /notifications/public
   */
  async getPublicNotification(): Promise<NotificationResponse | null> {
    try {
      const response = await axiosInstance.get<NotificationResponse>('/notifications/public');
      console.log(response.data);
      return response.data || null;
    } catch (error) {
      console.log('[notificationService] No public notification available');
      return null;
    }
  },

  /**
   * Get list of public notifications
   * GET /notifications/public/list
   */
  async getPublicNotificationList(): Promise<NotificationResponse[]> {
    const response = await axiosInstance.get<NotificationResponse[]>('/notifications/public/list');
    return response.data || [];
  }
};
