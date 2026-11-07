import { Notification, INotification, NotificationType } from '../models/Notification';
import { Types } from 'mongoose';

export class NotificationService {
  public static async createNotification(params: {
    recipient: Types.ObjectId | string;
    title: string;
    message: string;
    type?: NotificationType;
    actionUrl?: string;
  }): Promise<INotification> {
    return await Notification.create({
      recipient: params.recipient,
      title: params.title,
      message: params.message,
      type: params.type || 'system',
      actionUrl: params.actionUrl,
      isRead: false,
    });
  }

  public static async getUserNotifications(userId: Types.ObjectId | string, limit = 20) {
    return await Notification.find({ recipient: userId })
      .sort({ createdAt: -1 })
      .limit(limit);
  }

  public static async markAsRead(notificationId: string, userId: Types.ObjectId | string) {
    return await Notification.findOneAndUpdate(
      { _id: notificationId, recipient: userId },
      { isRead: true },
      { new: true }
    );
  }

  public static async markAllAsRead(userId: Types.ObjectId | string) {
    return await Notification.updateMany({ recipient: userId, isRead: false }, { isRead: true });
  }
}
