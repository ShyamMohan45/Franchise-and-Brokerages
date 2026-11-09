import { Request, Response } from 'express';
import { Notification } from '../models/Notification';
import { NotificationPreference } from '../models/NotificationPreference';
import { Task } from '../models/Task';
import { Meeting } from '../models/Meeting';
import { DealDocument } from '../models/DealDocument';
import { CommissionAgreement } from '../models/CommissionAgreement';
import { Lead } from '../models/Lead';
import { BrokerageDeal } from '../models/BrokerageDeal';
import { NotificationService } from '../services/notificationService';
import { sendSuccess, sendError } from '../utils/response';

export async function getMyNotifications(req: Request, res: Response): Promise<any> {
  try {
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
  } catch (error: any) {
    return sendError(res, error.message, 500);
  }
}

export async function markNotificationAsRead(req: Request, res: Response): Promise<any> {
  try {
    const { id } = req.params;
    const user = req.user!;

    const notification = await NotificationService.markAsRead(id, user._id);
    if (!notification) {
      return sendError(res, 'Notification not found', 404);
    }

    return sendSuccess(res, notification, 'Notification marked as read');
  } catch (error: any) {
    return sendError(res, error.message, 500);
  }
}

export async function markAllNotificationsAsRead(req: Request, res: Response): Promise<any> {
  try {
    const user = req.user!;
    await NotificationService.markAllAsRead(user._id);
    return sendSuccess(res, null, 'All notifications marked as read');
  } catch (error: any) {
    return sendError(res, error.message, 500);
  }
}

/**
 * GET /api/v1/notifications/preferences
 * Retrieve user's notification preferences or create default if not exists
 */
export async function getNotificationPreferences(req: Request, res: Response): Promise<any> {
  try {
    const user = req.user!;
    let pref = await NotificationPreference.findOne({ user: user._id });
    if (!pref) {
      pref = await NotificationPreference.create({
        user: user._id,
        emailNotifications: true,
        inAppNotifications: true,
        leadAlerts: true,
        dealAlerts: true,
        commissionAlerts: true,
        meetingReminders: true,
        documentAlerts: true,
        diligenceAlerts: true,
      });
    }

    return sendSuccess(res, pref, 'Notification preferences retrieved');
  } catch (error: any) {
    return sendError(res, error.message, 500);
  }
}

/**
 * PUT /api/v1/notifications/preferences
 * Update user's notification preferences
 */
export async function updateNotificationPreferences(req: Request, res: Response): Promise<any> {
  try {
    const user = req.user!;
    const {
      emailNotifications,
      inAppNotifications,
      leadAlerts,
      dealAlerts,
      commissionAlerts,
      meetingReminders,
      documentAlerts,
      diligenceAlerts,
    } = req.body;

    const pref = await NotificationPreference.findOneAndUpdate(
      { user: user._id },
      {
        $set: {
          ...(emailNotifications !== undefined && { emailNotifications }),
          ...(inAppNotifications !== undefined && { inAppNotifications }),
          ...(leadAlerts !== undefined && { leadAlerts }),
          ...(dealAlerts !== undefined && { dealAlerts }),
          ...(commissionAlerts !== undefined && { commissionAlerts }),
          ...(meetingReminders !== undefined && { meetingReminders }),
          ...(documentAlerts !== undefined && { documentAlerts }),
          ...(diligenceAlerts !== undefined && { diligenceAlerts }),
        },
      },
      { new: true, upsert: true }
    );

    return sendSuccess(res, pref, 'Notification preferences updated');
  } catch (error: any) {
    return sendError(res, error.message, 500);
  }
}

/**
 * GET /api/v1/notifications/reminders
 * Aggregates operational reminders:
 * - Upcoming follow-ups
 * - Overdue tasks
 * - Meeting reminders
 * - Pending document reviews
 * - Outstanding commission payments
 */
export async function getReminders(req: Request, res: Response): Promise<any> {
  try {
    const user = req.user!;
    const now = new Date();
    const next7Days = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    const next30Days = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

    const isBroker = user.role === 'broker';
    const isAdmin = user.role === 'admin' || user.role === 'super_admin';

    // 1. Follow-ups from Leads
    const leadQuery: any = {
      followUpDate: { $exists: true, $ne: null },
      status: { $nin: ['converted', 'lost', 'not_qualified'] },
    };
    if (isBroker) {
      leadQuery.assignedBroker = user._id;
    } else if (!isAdmin) {
      // Investors and brand owners don't have lead follow-ups
      leadQuery._id = null;
    }

    const leadsWithFollowUps = await Lead.find(leadQuery)
      .select('fullName email company followUpDate status priority assignedBroker')
      .populate('assignedBroker', 'fullName email')
      .sort({ followUpDate: 1 })
      .limit(20)
      .lean();

    const upcomingFollowUps = leadsWithFollowUps.map((l: any) => ({
      leadId: l._id,
      leadName: l.fullName,
      email: l.email,
      followUpDate: l.followUpDate,
      isOverdue: new Date(l.followUpDate) < now,
      status: l.status,
      priority: l.priority,
    }));

    // 2. Overdue and Upcoming Tasks
    const taskQuery: any = {
      status: { $in: ['pending', 'in_progress'] },
    };
    if (isBroker || (!isAdmin && user.role !== 'admin')) {
      taskQuery.assignedTo = user._id;
    }

    const tasks = await Task.find(taskQuery)
      .select('title description status priority dueDate assignedTo relatedDeal relatedLead')
      .sort({ dueDate: 1 })
      .limit(25)
      .lean();

    const taskReminders = tasks.map((t: any) => ({
      taskId: t._id,
      title: t.title,
      dueDate: t.dueDate,
      priority: t.priority,
      status: t.status,
      isOverdue: new Date(t.dueDate) < now,
      relatedDeal: t.relatedDeal,
      relatedLead: t.relatedLead,
    }));

    // 3. Meeting Reminders
    const meetingQuery: any = {
      status: { $in: ['scheduled', 'requested'] },
      scheduledStartTime: { $gte: new Date(now.getTime() - 2 * 60 * 60 * 1000), $lte: next7Days },
    };
    if (!isAdmin) {
      meetingQuery.$or = [{ organizer: user._id }, { participants: user._id }];
    }

    const meetings = await Meeting.find(meetingQuery)
      .select('title meetingType scheduledStartTime scheduledEndTime status meetingUrl')
      .sort({ scheduledStartTime: 1 })
      .limit(15)
      .lean();

    const meetingReminders = meetings.map((m: any) => ({
      meetingId: m._id,
      title: m.title,
      meetingType: m.meetingType,
      scheduledStartTime: m.scheduledStartTime,
      scheduledEndTime: m.scheduledEndTime,
      status: m.status,
      meetingUrl: m.meetingUrl,
    }));

    // 4. Pending Document Reviews
    let docFilter: any = {
      status: { $in: ['PENDING', 'SUBMITTED', 'UNDER_REVIEW'] },
    };
    if (isBroker) {
      // Find deals assigned to this broker
      const brokerDeals = await BrokerageDeal.find({ assignedBroker: user._id }).select('_id');
      const dealIds = brokerDeals.map((d) => d._id);
      docFilter.deal = { $in: dealIds };
    } else if (!isAdmin) {
      // Investors and Brand owners: find their documents
      const userDeals = await BrokerageDeal.find({
        $or: [{ investor: user._id }, { businessOwner: user._id }],
      }).select('_id');
      docFilter.deal = { $in: userDeals.map((d) => d._id) };
    }

    const pendingDocs = await DealDocument.find(docFilter)
      .select('title fileName category status deal dealRoom uploadedAt currentVersion')
      .sort({ uploadedAt: -1 })
      .limit(20)
      .lean();

    // 5. Outstanding Commission Payments
    let commissionQuery: any = {
      status: 'ACTIVE',
      pendingCommission: { $gt: 0 },
    };
    if (isBroker) {
      commissionQuery.assignedBroker = user._id;
    } else if (!isAdmin) {
      commissionQuery._id = null; // Private from other roles
    }

    const agreements = await CommissionAgreement.find(commissionQuery)
      .select('agreementNumber deal brand investor expectedCommission pendingCommission milestones status')
      .populate('deal', 'dealTitle')
      .populate('brand', 'fullName email')
      .limit(20)
      .lean();

    const outstandingCommissions = agreements.map((a: any) => ({
      agreementId: a._id,
      agreementNumber: a.agreementNumber,
      dealTitle: a.deal?.dealTitle || 'Franchise Deal',
      brandName: a.brand?.fullName || 'Brand',
      expectedCommission: a.expectedCommission,
      pendingCommission: a.pendingCommission,
      dueMilestones: (a.milestones || []).filter((m: any) => m.status === 'PENDING' || m.status === 'DUE'),
    }));

    return sendSuccess(res, {
      summary: {
        totalUpcomingFollowUps: upcomingFollowUps.length,
        totalTasks: taskReminders.length,
        totalOverdueTasks: taskReminders.filter((t) => t.isOverdue).length,
        totalUpcomingMeetings: meetingReminders.length,
        totalPendingDocuments: pendingDocs.length,
        totalOutstandingAgreements: outstandingCommissions.length,
      },
      upcomingFollowUps,
      tasks: taskReminders,
      meetings: meetingReminders,
      pendingDocuments: pendingDocs,
      outstandingCommissions,
    }, 'Reminders aggregated successfully');
  } catch (error: any) {
    return sendError(res, error.message, 500);
  }
}

/**
 * POST /api/v1/notifications
 * Create custom notification (for testing or system events)
 */
export async function createInAppNotification(req: Request, res: Response): Promise<any> {
  try {
    const { recipient, type, title, message, priority, metadata } = req.body;
    if (!recipient || !title || !message) {
      return sendError(res, 'Recipient, title, and message are required', 400);
    }

    const notification = await Notification.create({
      recipient,
      type: type || 'system_announcement',
      title,
      message,
      priority: priority || 'medium',
      metadata: metadata || {},
    });

    return sendSuccess(res, notification, 'Notification created successfully', 201);
  } catch (error: any) {
    return sendError(res, error.message, 500);
  }
}
