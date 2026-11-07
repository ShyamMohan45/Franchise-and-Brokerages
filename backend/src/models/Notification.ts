import { Schema, model, Document, Types } from 'mongoose';

export type NotificationType =
  | 'application_received'
  | 'application_status'
  | 'document_approved'
  | 'document_review_requested'
  | 'meeting_invite'
  | 'deal_stage_changed'
  | 'system_announcement'
  | 'application'
  | 'meeting'
  | 'document'
  | 'system'
  | 'deal'
  | 'task'
  | 'TASK_ASSIGNED';

export interface INotification extends Document {
  recipient: Types.ObjectId;
  type: NotificationType;
  title: string;
  message: string;
  actionUrl?: string;
  isRead: boolean;
  metadata?: Record<string, any>;
  createdAt: Date;
}

const notificationSchema = new Schema<INotification>(
  {
    recipient: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    type: {
      type: String,
      enum: [
        'application_received',
        'application_status',
        'document_approved',
        'document_review_requested',
        'meeting_invite',
        'deal_stage_changed',
        'system_announcement',
        'application',
        'meeting',
        'document',
        'system',
        'deal',
        'task',
        'TASK_ASSIGNED',
      ],
      default: 'system',
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
    actionUrl: {
      type: String,
    },
    isRead: {
      type: Boolean,
      default: false,
      index: true,
    },
    metadata: {
      type: Schema.Types.Mixed,
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
  }
);

export const Notification = model<INotification>('Notification', notificationSchema);
