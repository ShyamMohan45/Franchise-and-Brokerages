import { Schema, model, Document, Types } from 'mongoose';

export interface INotificationPreference extends Document {
  user: Types.ObjectId;
  emailNotifications: boolean;
  inAppNotifications: boolean;
  leadAlerts: boolean;
  dealAlerts: boolean;
  commissionAlerts: boolean;
  meetingReminders: boolean;
  documentAlerts: boolean;
  diligenceAlerts: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const notificationPreferenceSchema = new Schema<INotificationPreference>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
      index: true,
    },
    emailNotifications: {
      type: Boolean,
      default: true,
    },
    inAppNotifications: {
      type: Boolean,
      default: true,
    },
    leadAlerts: {
      type: Boolean,
      default: true,
    },
    dealAlerts: {
      type: Boolean,
      default: true,
    },
    commissionAlerts: {
      type: Boolean,
      default: true,
    },
    meetingReminders: {
      type: Boolean,
      default: true,
    },
    documentAlerts: {
      type: Boolean,
      default: true,
    },
    diligenceAlerts: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

export const NotificationPreference = model<INotificationPreference>(
  'NotificationPreference',
  notificationPreferenceSchema
);
