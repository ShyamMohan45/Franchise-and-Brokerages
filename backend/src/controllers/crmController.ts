import { Request, Response } from 'express';
import { BrokerageDeal } from '../models/BrokerageDeal';
import { Lead } from '../models/Lead';
import { Task } from '../models/Task';
import { AuditLog } from '../models/AuditLog';
import { NotificationService } from '../services/notificationService';
import { sendSuccess, sendError } from '../utils/response';

export async function getPipelineDeals(req: Request, res: Response): Promise<any> {
  const user = req.user!;
  const filter: any = {};

  if (user.role === 'broker') {
    filter.assignedBroker = user._id;
  }

  const deals = await BrokerageDeal.find(filter)
    .populate('franchiseListing', 'brandName logoUrl industry investmentRange')
    .populate('businessOwner', 'fullName email phone')
    .populate('investor', 'fullName email phone')
    .populate('assignedBroker', 'fullName email')
    .sort({ updatedAt: -1 });

  // Standard 9 stages
  const standardStages = [
    'NEW_LEAD',
    'CONTACTED',
    'QUALIFIED',
    'MEETING_SCHEDULED',
    'OPPORTUNITY_PRESENTED',
    'DUE_DILIGENCE',
    'NEGOTIATION',
    'CLOSED_WON',
    'CLOSED_LOST',
  ];

  const columns: Record<string, any[]> = {};
  for (const st of standardStages) {
    columns[st] = [];
  }

  for (const deal of deals) {
    // Map legacy snake_case stages to standard uppercase if necessary
    let stageKey = deal.stage;
    if (stageKey === 'lead_received') stageKey = 'NEW_LEAD';
    else if (stageKey === 'qualification') stageKey = 'QUALIFIED';
    else if (stageKey === 'initial_discussion') stageKey = 'CONTACTED';
    else if (stageKey === 'documentation_review') stageKey = 'DUE_DILIGENCE';
    else if (stageKey === 'deal_closed') stageKey = 'CLOSED_WON';
    else if (stageKey === 'lost_cancelled') stageKey = 'CLOSED_LOST';

    if (!columns[stageKey]) {
      columns[stageKey] = [];
    }
    columns[stageKey].push(deal);
  }

  return sendSuccess(res, {
    deals,
    columns,
    totalDeals: deals.length,
    totalPipelineValue: deals.reduce((sum, d) => sum + (d.dealValue || 0), 0),
    totalExpectedCommission: deals.reduce((sum, d) => sum + (d.expectedCommission || 0), 0),
  });
}

export async function getDealById(req: Request, res: Response): Promise<any> {
  const { id } = req.params;
  const deal = await BrokerageDeal.findById(id)
    .populate('franchiseListing')
    .populate('businessOwner', 'fullName email phone')
    .populate('investor', 'fullName email phone')
    .populate('assignedBroker', 'fullName email phone');

  if (!deal) {
    return sendError(res, 'Deal not found', 404);
  }

  const tasks = await Task.find({ relatedDeal: deal._id }).sort({ dueDate: 1 });

  return sendSuccess(res, { deal, tasks });
}

export async function createCrmDeal(req: Request, res: Response): Promise<any> {
  const user = req.user!;
  const {
    dealTitle,
    franchiseListingId,
    businessOwnerId,
    investorId,
    applicationId,
    dealValue,
    franchiseFee,
    commissionType,
    commissionRate,
    expectedCommission,
    notes,
    targetClosingDate,
  } = req.body;

  const deal = await BrokerageDeal.create({
    dealTitle,
    franchiseListing: franchiseListingId,
    businessOwner: businessOwnerId,
    investor: investorId,
    applicationRef: applicationId,
    dealValue,
    franchiseFee,
    commissionType: commissionType || 'percentage',
    commissionRate: commissionRate || 0.05,
    expectedCommission,
    assignedBroker: user._id,
    stage: 'NEW_LEAD',
    notes: notes || '',
    targetClosingDate,
    stageHistory: [
      {
        stage: 'NEW_LEAD',
        changedBy: user._id,
        note: 'Deal opened in Brokerage CRM pipeline',
        timestamp: new Date(),
      },
    ],
  });

  await AuditLog.create({
    actor: user._id,
    actorRole: user.role,
    actorEmail: user.email,
    action: 'BROKERAGE_DEAL_CREATED',
    entityType: 'BrokerageDeal',
    entityId: deal._id.toString(),
  });

  return sendSuccess(res, deal, 'Deal opened successfully in pipeline', 201);
}

export async function updateDealStage(req: Request, res: Response): Promise<any> {
  const { id } = req.params;
  const user = req.user!;
  const { stage, stageChangeNote, notes, dealValue, actualCommissionEarned, paymentStatus } = req.body;

  const deal = await BrokerageDeal.findById(id);
  if (!deal) {
    return sendError(res, 'Deal not found', 404);
  }

  const oldStage = deal.stage;
  if (stage && stage !== deal.stage) {
    deal.stage = stage;
    deal.stageHistory.push({
      stage,
      changedBy: user._id,
      note: stageChangeNote || `Pipeline transition from ${oldStage} to ${stage}`,
      timestamp: new Date(),
    });

    if (stage === 'CLOSED_WON' || stage === 'deal_closed') {
      deal.closedAt = new Date();
      if (!deal.actualCommissionEarned) {
        deal.actualCommissionEarned = deal.expectedCommission;
      }
    }

    // Dispatch notifications to investor and brand owner
    await NotificationService.createNotification({
      recipient: deal.investor,
      title: 'Deal Pipeline Status Update',
      message: `Your franchise deal "${deal.dealTitle}" has advanced to stage: ${stage.replace('_', ' ')}.`,
      type: 'deal_stage_changed',
      actionUrl: `/deal-room/${deal._id}`,
    });

    await NotificationService.createNotification({
      recipient: deal.businessOwner,
      title: 'Deal Pipeline Status Update',
      message: `Deal "${deal.dealTitle}" has advanced to stage: ${stage.replace('_', ' ')}.`,
      type: 'deal_stage_changed',
      actionUrl: `/deal-room/${deal._id}`,
    });
  }

  if (notes !== undefined) deal.notes = notes;
  if (dealValue !== undefined) deal.dealValue = dealValue;
  if (actualCommissionEarned !== undefined) deal.actualCommissionEarned = actualCommissionEarned;
  if (paymentStatus) deal.paymentStatus = paymentStatus;

  await deal.save();

  await AuditLog.create({
    actor: user._id,
    actorRole: user.role,
    actorEmail: user.email,
    action: 'BROKERAGE_DEAL_UPDATED',
    entityType: 'BrokerageDeal',
    entityId: deal._id.toString(),
    details: { stage, stageChangeNote },
  });

  return sendSuccess(res, deal, 'Deal updated successfully');
}

export async function getCrmMetrics(req: Request, res: Response): Promise<any> {
  const user = req.user!;
  const filter: any = {};
  if (user.role === 'broker') {
    filter.assignedBroker = user._id;
  }

  const [totalLeads, openLeads, allDeals, pendingTasks] = await Promise.all([
    Lead.countDocuments(user.role === 'broker' ? { assignedBroker: user._id } : {}),
    Lead.countDocuments(
      user.role === 'broker'
        ? { assignedBroker: user._id, status: { $in: ['new', 'contacted', 'qualified'] } }
        : { status: { $in: ['new', 'contacted', 'qualified'] } }
    ),
    BrokerageDeal.find(filter),
    Task.countDocuments(
      user.role === 'broker'
        ? { assignedTo: user._id, status: { $ne: 'completed' } }
        : { status: { $ne: 'completed' } }
    ),
  ]);

  const closedWon = allDeals.filter((d) => d.stage === 'CLOSED_WON' || d.stage === 'deal_closed');
  const pipelineValue = allDeals
    .filter((d) => d.stage !== 'CLOSED_LOST' && d.stage !== 'lost_cancelled')
    .reduce((sum, d) => sum + (d.dealValue || 0), 0);
  const earnedCommission = closedWon.reduce((sum, d) => sum + (d.actualCommissionEarned || d.expectedCommission || 0), 0);

  return sendSuccess(res, {
    totalLeads,
    openLeads,
    activeDeals: allDeals.length - closedWon.length,
    closedWonDeals: closedWon.length,
    pipelineValue,
    earnedCommission,
    pendingTasks,
    conversionRate: allDeals.length > 0 ? Math.round((closedWon.length / allDeals.length) * 100) : 0,
  });
}
