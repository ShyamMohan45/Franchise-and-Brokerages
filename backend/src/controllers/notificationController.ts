import { Request, Response } from 'express';
import { Notification } from '../models/Notification';
import { NotificationService } from '../services/notificationService';
import { sendSuccess, sendError } from '../utils/response';

export async function getMyNotifications(req: Request, res: Response): Promise<any> {
  const user = req.user!;
  const limit = parseInt(req.query.limit as string) || 30;

  const notifications = await NotificationService.getUserNotifications(user._id, limit);
  const unreadCount = await Notification.countDocuments({
    recipient: user._id,
    isRead: false,
  });

  return sendSuccess(res, {
    notifications,
    unreadCount,
  });
}

export async function markNotificationAsRead(req: Request, res: Response): Promise<any> {
  const { id } = req.params;
  const user = req.user!;

  const notification = await NotificationService.markAsRead(id, user._id);
  if (!notification) {
    return sendError(res, 'Notification not found', 404);
  }

  return sendSuccess(res, notification, 'Notification marked as read');
}

export async function markAllNotificationsAsRead(req: Request, res: Response): Promise<any> {
  const user = req.user!;

  await NotificationService.markAllAsRead(user._id);

  return sendSuccess(res, null, 'All notifications marked as read');
}
