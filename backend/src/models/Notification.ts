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
  | 'TASK_ASSIGNED'
  // Milestone 7 notification types
  | 'new_enquiry'
  | 'lead_assigned'
  | 'broker_followup'
  | 'upcoming_meeting'
  | 'document_submission'
  | 'due_diligence_update'
  | 'commission_due'
  | 'commission_payment_received'
  | 'task_reminder';

export interface INotification extends Document {
  recipient: Types.ObjectId;
  type: NotificationType;
  title: string;
  message: string;
  actionUrl?: string;
  isRead: boolean;
  priority?: 'low' | 'normal' | 'high';
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
        // Milestone 7 types
        'new_enquiry',
        'lead_assigned',
        'broker_followup',
        'upcoming_meeting',
        'document_submission',
        'due_diligence_update',
        'commission_due',
        'commission_payment_received',
        'task_reminder',
      ],
      default: 'system',
      required: true,
      index: true,
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
    priority: {
      type: String,
      enum: ['low', 'normal', 'high'],
      default: 'normal',
    },
    metadata: {
      type: Schema.Types.Mixed,
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
  }
);

notificationSchema.index({ recipient: 1, isRead: 1, createdAt: -1 });

export const Notification = model<INotification>('Notification', notificationSchema);
