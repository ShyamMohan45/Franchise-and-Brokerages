import { Request, Response } from 'express';
import { Task } from '../models/Task';
import { AuditLog } from '../models/AuditLog';
import { NotificationService } from '../services/notificationService';
import { sendSuccess, sendError } from '../utils/response';

export async function getTasks(req: Request, res: Response): Promise<any> {
  const user = req.user!;
  const { status, priority, dealId, leadId, assignedTo } = req.query;

  const filter: any = {};

  // Role based filtering
  if (user.role !== 'admin' && user.role !== 'super_admin') {
    filter.$or = [{ assignedTo: user._id }, { createdBy: user._id }];
  } else if (assignedTo) {
    filter.assignedTo = assignedTo;
  }

  if (status) filter.status = status;
  if (priority) filter.priority = priority;
  if (dealId) filter.relatedDeal = dealId;
  if (leadId) filter.relatedLead = leadId;

  const tasks = await Task.find(filter)
    .populate('assignedTo', 'fullName email role')
    .populate('createdBy', 'fullName email role')
    .populate('relatedDeal', 'dealTitle stage dealValue')
    .populate('relatedLead', 'fullName email company status')
    .sort({ dueDate: 1, createdAt: -1 });

  return sendSuccess(res, tasks, 'Tasks retrieved successfully');
}

export async function createTask(req: Request, res: Response): Promise<any> {
  const user = req.user!;
  const {
    title,
    description,
    assignedTo,
    relatedDeal,
    relatedLead,
    relatedBusiness,
    priority,
    dueDate,
    tags,
  } = req.body;

  if (!title || !dueDate) {
    return sendError(res, 'Title and dueDate are required fields', 400);
  }

  const assigneeId = assignedTo || user._id;

  const task = await Task.create({
    title,
    description,
    assignedTo: assigneeId,
    createdBy: user._id,
    relatedDeal: relatedDeal || undefined,
    relatedLead: relatedLead || undefined,
    relatedBusiness: relatedBusiness || undefined,
    priority: priority || 'medium',
    dueDate,
    tags: tags || [],
  });

  // Notify assignee if someone else created it
  if (assigneeId.toString() !== user._id.toString()) {
    await NotificationService.createNotification({
      recipient: assigneeId,
      title: 'New Task Assigned',
      message: `You have been assigned a new task: "${title}". Due date: ${new Date(dueDate).toLocaleDateString()}.`,
      type: 'TASK_ASSIGNED',
      actionUrl: '/dashboard/brokerage',
    });
  }

  await AuditLog.create({
    actor: user._id,
    actorRole: user.role,
    actorEmail: user.email,
    action: 'TASK_CREATED',
    entityType: 'Task',
    entityId: task._id.toString(),
    details: { title, priority, dueDate },
  });

  return sendSuccess(res, task, 'Task created successfully', 201);
}

export async function updateTask(req: Request, res: Response): Promise<any> {
  const { id } = req.params;
  const user = req.user!;
  const { status, priority, dueDate, description, tags, title } = req.body;

  const task = await Task.findById(id);
  if (!task) {
    return sendError(res, 'Task not found', 404);
  }

  const isAdmin = user.role === 'admin' || user.role === 'super_admin';
  const isAssignee = task.assignedTo.toString() === user._id.toString();
  const isCreator = task.createdBy.toString() === user._id.toString();

  if (!isAdmin && !isAssignee && !isCreator) {
    return sendError(res, 'Unauthorized to update this task', 403);
  }

  if (status) {
    task.status = status;
    if (status === 'completed' && !task.completedAt) {
      task.completedAt = new Date();
    } else if (status !== 'completed') {
      task.completedAt = undefined;
    }
  }

  if (priority) task.priority = priority;
  if (dueDate) task.dueDate = dueDate;
  if (description !== undefined) task.description = description;
  if (title) task.title = title;
  if (tags) task.tags = tags;

  await task.save();

  return sendSuccess(res, task, 'Task updated successfully');
}

export async function deleteTask(req: Request, res: Response): Promise<any> {
  const { id } = req.params;
  const user = req.user!;

  const task = await Task.findById(id);
  if (!task) {
    return sendError(res, 'Task not found', 404);
  }

  const isAdmin = user.role === 'admin' || user.role === 'super_admin';
  const isCreator = task.createdBy.toString() === user._id.toString();

  if (!isAdmin && !isCreator) {
    return sendError(res, 'Unauthorized to delete this task', 403);
  }

  await Task.findByIdAndDelete(id);

  return sendSuccess(res, null, 'Task deleted successfully');
}
