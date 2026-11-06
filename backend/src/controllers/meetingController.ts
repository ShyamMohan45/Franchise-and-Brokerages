import { Request, Response } from 'express';
import { Meeting } from '../models/Meeting';
import { Notification } from '../models/Notification';
import { sendSuccess, sendError } from '../utils/response';
import { AuditLog } from '../models/AuditLog';

export async function scheduleMeeting(req: Request, res: Response): Promise<any> {
  const userId = req.user!._id;
  const { participantIds, ...data } = req.body;

  const participants = Array.from(new Set([...(participantIds || []), userId]));

  const meeting = await Meeting.create({
    ...data,
    organizer: userId,
    participants,
    status: 'scheduled',
  });

  // Notify other participants
  for (const pid of participants) {
    if (pid.toString() !== userId.toString()) {
      await Notification.create({
        recipient: pid,
        type: 'meeting_invite',
        title: `Meeting Scheduled: ${meeting.title}`,
        message: `A meeting has been scheduled for ${new Date(meeting.scheduledStartTime).toLocaleString()}.`,
        actionUrl: `/dashboard/meetings`,
      });
    }
  }

  await AuditLog.create({
    actor: userId,
    actorRole: req.user!.role,
    actorEmail: req.user!.email,
    action: 'MEETING_SCHEDULED',
    entityType: 'Meeting',
    entityId: meeting._id.toString(),
  });

  return sendSuccess(res, meeting, 'Meeting scheduled successfully', 201);
}

export async function getMyMeetings(req: Request, res: Response): Promise<any> {
  const userId = req.user!._id;
  const meetings = await Meeting.find({ participants: userId })
    .populate('organizer', 'fullName email')
    .populate('participants', 'fullName email')
    .populate('relatedFranchise', 'brandName logoUrl')
    .sort({ scheduledStartTime: 1 });

  return sendSuccess(res, meetings);
}

export async function updateMeetingStatus(req: Request, res: Response): Promise<any> {
  const { id } = req.params;
  const { status, notes, actionItems } = req.body;

  const meeting = await Meeting.findOne({ _id: id, participants: req.user!._id });
  if (!meeting) {
    return sendError(res, 'Meeting not found or unauthorized', 404);
  }

  if (status) meeting.status = status;
  if (notes) meeting.notes = notes;
  if (actionItems) meeting.actionItems = actionItems;

  await meeting.save();
  return sendSuccess(res, meeting, 'Meeting details updated');
}
