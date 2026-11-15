import { useState, useEffect, useCallback } from 'react';
import { AppNotification, NotificationPreference, RemindersResponse } from '../types/notification';
import { NotificationService } from '../services/notificationService';

export function useNotifications() {
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [preferences, setPreferences] = useState<NotificationPreference | null>(null);
  const [reminders, setReminders] = useState<RemindersResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchNotifications = useCallback(async (isRefresh = false) => {
    if (isRefresh) {
      setIsRefreshing(true);
    } else {
      setIsLoading(true);
    }
    setError(null);

    try {
      const data = await NotificationService.getMyNotifications();
      setNotifications(data.notifications);
      setUnreadCount(data.unreadCount);
    } catch (err: any) {
      setError(err?.message || 'Failed to load notifications');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  const fetchPreferences = useCallback(async () => {
    try {
      const prefs = await NotificationService.getPreferences();
      setPreferences(prefs);
    } catch (err) {
      // quiet fail for non-critical preference fetch
    }
  }, []);

  const fetchReminders = useCallback(async () => {
    try {
      const rems = await NotificationService.getReminders();
      setReminders(rems);
    } catch (err) {
      // quiet fail
    }
  }, []);

  useEffect(() => {
    fetchNotifications();
    fetchPreferences();
    fetchReminders();
  }, [fetchNotifications, fetchPreferences, fetchReminders]);

  const refresh = () => {
    fetchNotifications(true);
    fetchReminders();
  };

  const markAsRead = async (id: string) => {
    try {
      await NotificationService.markAsRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n._id === id ? { ...n, isRead: true } : n))
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (err: any) {
      throw new Error(err?.message || 'Failed to mark as read');
    }
  };

  const markAllAsRead = async () => {
    try {
      await NotificationService.markAllAsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch (err: any) {
      throw new Error(err?.message || 'Failed to mark all as read');
    }
  };

  const updatePreferences = async (newPrefs: Partial<NotificationPreference>) => {
    try {
      const updated = await NotificationService.updatePreferences(newPrefs);
      setPreferences(updated);
      return updated;
    } catch (err: any) {
      throw new Error(err?.message || 'Failed to update preferences');
    }
  };

  return {
    notifications,
    unreadCount,
    preferences,
    reminders,
    isLoading,
    loading: isLoading,
    isRefreshing,
    refreshing: isRefreshing,
    error,
    refresh,
    markAsRead,
    markAllAsRead,
    updatePreferences,
  };
}
