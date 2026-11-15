import { apiClient } from './apiClient';
import {
  AppNotification,
  NotificationPreference,
  RemindersResponse,
} from '../types/notification';

export class NotificationService {
  /**
   * 1. Fetch user notifications with unread count
   */
  public static async getMyNotifications(limit = 30): Promise<{
    notifications: AppNotification[];
    unreadCount: number;
  }> {
    const response = await apiClient.get<{
      notifications: AppNotification[];
      unreadCount: number;
    }>(`/notifications?limit=${limit}`);

    return {
      notifications: response.data?.notifications || [],
      unreadCount: response.data?.unreadCount || 0,
    };
  }

  /**
   * 2. Mark single notification as read
   */
  public static async markAsRead(id: string): Promise<AppNotification> {
    const response = await apiClient.patch<AppNotification>(`/notifications/${id}/read`, {});
    if (!response.data) {
      throw new Error(response.message || 'Failed to mark notification as read');
    }
    return response.data;
  }

  /**
   * 3. Mark all notifications as read
   */
  public static async markAllAsRead(): Promise<void> {
    await apiClient.post('/notifications/read-all', {});
  }

  /**
   * 4. Fetch notification preferences
   */
  public static async getPreferences(): Promise<NotificationPreference> {
    const response = await apiClient.get<NotificationPreference>('/notifications/preferences');
    if (!response.data) {
      throw new Error(response.message || 'Failed to fetch preferences');
    }
    return response.data;
  }

  /**
   * 5. Update notification preferences
   */
  public static async updatePreferences(
    payload: Partial<NotificationPreference>
  ): Promise<NotificationPreference> {
    const response = await apiClient.put<NotificationPreference>(
      '/notifications/preferences',
      payload
    );
    if (!response.data) {
      throw new Error(response.message || 'Failed to update preferences');
    }
    return response.data;
  }

  /**
   * 6. Fetch operational reminders
   */
  public static async getReminders(): Promise<RemindersResponse> {
    const response = await apiClient.get<RemindersResponse>('/notifications/reminders');
    return (
      response.data || {
        reminders: [],
        summary: {
          total: 0,
          overdueTasks: 0,
          upcomingFollowUps: 0,
          upcomingMeetings: 0,
          pendingReviews: 0,
          dueCommissions: 0,
        },
      }
    );
  }
}
