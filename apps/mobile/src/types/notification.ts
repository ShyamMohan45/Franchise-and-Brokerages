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
  | 'new_enquiry'
  | 'lead_assigned'
  | 'broker_followup'
  | 'upcoming_meeting'
  | 'document_submission'
  | 'due_diligence_update'
  | 'commission_due'
  | 'commission_payment_received'
  | 'task_reminder';

export interface AppNotification {
  _id: string;
  recipient: string;
  type: NotificationType;
  title: string;
  message: string;
  actionUrl?: string;
  isRead: boolean;
  priority?: 'low' | 'normal' | 'high';
  metadata?: Record<string, any>;
  createdAt: string;
}

export interface NotificationPreference {
  _id?: string;
  user: string;
  emailNotifications: boolean;
  inAppNotifications: boolean;
  leadAlerts: boolean;
  dealAlerts: boolean;
  commissionAlerts: boolean;
  meetingReminders: boolean;
  documentAlerts: boolean;
  diligenceAlerts: boolean;
}

export interface RemindersResponse {
  reminders: Array<{
    type: string;
    title: string;
    description: string;
    dueDate?: string;
    scheduledAt?: string;
    priority?: string;
    dealId?: string;
    leadId?: string;
  }>;
  summary: {
    total: number;
    overdueTasks: number;
    upcomingFollowUps: number;
    upcomingMeetings: number;
    pendingReviews: number;
    dueCommissions: number;
  };
}
