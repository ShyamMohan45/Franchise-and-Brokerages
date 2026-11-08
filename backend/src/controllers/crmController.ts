import { Request, Response } from 'express';
import mongoose from 'mongoose';
import { BrokerageDeal, DealStage } from '../models/BrokerageDeal';
import { Lead, QualificationStatus } from '../models/Lead';
import { FranchiseApplication } from '../models/FranchiseApplication';
import { FranchiseListing } from '../models/FranchiseListing';
import { InvestorProfile } from '../models/InvestorProfile';
import { Task } from '../models/Task';
import { Meeting } from '../models/Meeting';
import { User } from '../models/User';
import { AuditLog } from '../models/AuditLog';
import { Notification } from '../models/Notification';
import { sendSuccess, sendError } from '../utils/response';

// -----------------------------------------------------------------------------
// 1. LEAD MANAGEMENT
// -----------------------------------------------------------------------------

export async function getLeads(req: Request, res: Response): Promise<any> {
  const user = req.user!;
  const {
    type,
    industry,
    city,
    state,
    status,
    qualificationStatus,
    assignedBroker,
    search,
    page: qPage,
    limit: qLimit,
  } = req.query;

  const page = parseInt(qPage as string) || 1;
  const limit = parseInt(qLimit as string) || 20;

  const filter: any = {};

  // Role-based visibility: brokers see their assigned leads unless querying all
  if (user.role === 'broker' && !assignedBroker) {
    filter.assignedBroker = user._id;
  } else if (assignedBroker && assignedBroker !== 'ALL' && assignedBroker !== 'all') {
    filter.assignedBroker = assignedBroker;
  }

  if (type && type !== 'ALL' && type !== 'all') {
    filter.leadType = type;
  }

  if (industry && industry !== 'ALL' && industry !== 'all') {
    filter.$or = [
      { targetIndustry: { $regex: industry, $options: 'i' } },
      { preferredIndustry: { $regex: industry, $options: 'i' } },
    ];
  }

  if (city && city !== 'ALL' && city !== 'all') {
    filter.preferredCity = { $regex: city, $options: 'i' };
  }

  if (state && state !== 'ALL' && state !== 'all') {
    filter.preferredState = { $regex: state, $options: 'i' };
  }

  if (status && status !== 'ALL' && status !== 'all') {
    filter.status = status;
  }

  if (qualificationStatus && qualificationStatus !== 'ALL' && qualificationStatus !== 'all') {
    filter.qualificationStatus = qualificationStatus;
  }

  if (search) {
    const s = String(search).trim();
    filter.$or = [
      { fullName: { $regex: s, $options: 'i' } },
      { email: { $regex: s, $options: 'i' } },
      { phone: { $regex: s, $options: 'i' } },
      { company: { $regex: s, $options: 'i' } },
    ];
  }

  const total = await Lead.countDocuments(filter);
  const leads = await Lead.find(filter)
    .populate('assignedBroker', 'fullName email phone avatarUrl')
    .populate('assignedBy', 'fullName email')
    .sort({ updatedAt: -1, createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(limit);

  return sendSuccess(res, leads, 'Leads retrieved successfully', 200, {
    page,
    limit,
    total,
    totalPages: Math.ceil(total / limit),
  });
}

export async function getLeadById(req: Request, res: Response): Promise<any> {
  const { id } = req.params;
  const user = req.user!;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return sendError(res, 'Lead not found', 404);
  }

  const lead = await Lead.findById(id)
    .populate('assignedBroker', 'fullName email phone avatarUrl')
    .populate('assignedBy', 'fullName email')
    .populate('convertedToUser', 'fullName email phone')
    .populate('convertedToDeal');

  if (!lead) {
    return sendError(res, 'Lead not found', 404);
  }

  // Access check: only assigned broker or admin/super_admin
  if (user.role === 'broker' && lead.assignedBroker && lead.assignedBroker._id.toString() !== user._id.toString()) {
    return sendError(res, 'Unauthorized to view this private lead record', 403);
  }

  // Linked tasks and meetings
  const [tasks, meetings] = await Promise.all([
    Task.find({ relatedLead: lead._id }).populate('assignedTo', 'fullName email').sort({ dueDate: 1 }),
    Meeting.find({ relatedLead: lead._id }).populate('organizer participants', 'fullName email').sort({ scheduledStartTime: 1 }),
  ]);

  return sendSuccess(res, { lead, tasks, meetings });
}

export async function createLead(req: Request, res: Response): Promise<any> {
  const user = req.user!;
  const data = req.body;

  const lead = await Lead.create({
    ...data,
    assignedBroker: data.assignedBroker || (user.role === 'broker' ? user._id : undefined),
    assignedBy: user._id,
    assignedAt: new Date(),
    activities: [
      {
        type: 'note',
        summary: `Lead created by ${user.fullName} via ${data.source || 'CRM manual entry'}`,
        performedBy: user._id,
        timestamp: new Date(),
      },
    ],
  });

  if (lead.assignedBroker) {
    lead.assignmentHistory.push({
      assignedTo: lead.assignedBroker,
      assignedBy: user._id,
      timestamp: new Date(),
      note: 'Initial assignment upon lead entry',
    });
    await lead.save();
  }

  await AuditLog.create({
    actor: user._id,
    actorRole: user.role,
    actorEmail: user.email,
    action: 'LEAD_CREATED',
    entityType: 'Lead',
    entityId: lead._id.toString(),
    details: { fullName: lead.fullName, leadType: lead.leadType },
  });

  return sendSuccess(res, lead, 'Lead created successfully', 201);
}

export async function updateLead(req: Request, res: Response): Promise<any> {
  const { id } = req.params;
  const user = req.user!;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return sendError(res, 'Lead not found', 404);
  }

  const lead = await Lead.findById(id);
  if (!lead) {
    return sendError(res, 'Lead not found', 404);
  }

  if (user.role === 'broker' && lead.assignedBroker && lead.assignedBroker.toString() !== user._id.toString()) {
    return sendError(res, 'Unauthorized to modify this lead', 403);
  }

  const { status, internalNotes, followUpDate, ...data } = req.body;

  if (status && status !== lead.status) {
    lead.activities.push({
      type: 'status_change',
      summary: `Lead status changed from ${lead.status} to ${status}`,
      performedBy: user._id,
      timestamp: new Date(),
    });
    lead.status = status;
  }

  if (internalNotes !== undefined) {
    lead.internalNotes = internalNotes;
  }

  if (followUpDate) {
    lead.followUpDate = new Date(followUpDate);
  }

  Object.assign(lead, data);
  await lead.save();

  await AuditLog.create({
    actor: user._id,
    actorRole: user.role,
    actorEmail: user.email,
    action: 'LEAD_UPDATED',
    entityType: 'Lead',
    entityId: lead._id.toString(),
  });

  return sendSuccess(res, lead, 'Lead updated successfully');
}

// -----------------------------------------------------------------------------
// 2. BROKER ASSIGNMENT
// -----------------------------------------------------------------------------

export async function assignLeadBroker(req: Request, res: Response): Promise<any> {
  const { id } = req.params;
  const { brokerId, note } = req.body;
  const user = req.user!;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return sendError(res, 'Lead not found', 404);
  }

  const lead = await Lead.findById(id);
  if (!lead) {
    return sendError(res, 'Lead not found', 404);
  }

  const broker = await User.findById(brokerId);
  if (!broker || (broker.role !== 'broker' && broker.role !== 'admin' && broker.role !== 'super_admin')) {
    return sendError(res, 'Selected user is not an active broker', 400);
  }

  const previousBrokerId = lead.assignedBroker;
  lead.assignedBroker = broker._id;
  lead.assignedBy = user._id;
  lead.assignedAt = new Date();

  lead.assignmentHistory.push({
    assignedTo: broker._id,
    assignedBy: user._id,
    timestamp: new Date(),
    note: note || `Assigned to ${broker.fullName}`,
  });

  lead.activities.push({
    type: 'assignment',
    summary: `Lead assigned to ${broker.fullName} by ${user.fullName}. ${note || ''}`,
    performedBy: user._id,
    timestamp: new Date(),
  });

  await lead.save();

  // Notify assigned broker
  await Notification.create({
    recipient: broker._id,
    type: 'task',
    title: `New Lead Assigned: ${lead.fullName}`,
    message: `${user.fullName} assigned lead "${lead.fullName}" (${lead.company || lead.leadType}) to your desk.`,
    actionUrl: `/dashboard/brokerage`,
  });

  await AuditLog.create({
    actor: user._id,
    actorRole: user.role,
    actorEmail: user.email,
    action: 'LEAD_ASSIGNED',
    entityType: 'Lead',
    entityId: lead._id.toString(),
    details: { assignedTo: broker._id, previousBroker: previousBrokerId, note },
  });

  return sendSuccess(res, lead, 'Lead assigned to broker successfully');
}

// -----------------------------------------------------------------------------
// 3. INVESTOR QUALIFICATION WORKFLOW
// -----------------------------------------------------------------------------

export async function qualifyInvestorLead(req: Request, res: Response): Promise<any> {
  const { id } = req.params;
  const user = req.user!;
  const {
    budgetMin,
    budgetMax,
    liquidCapital,
    preferredIndustry,
    preferredCity,
    preferredState,
    investmentTimeline,
    businessExperience,
    investmentReadiness,
    qualificationStatus,
    qualificationNotes,
  } = req.body;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return sendError(res, 'Lead not found', 404);
  }

  const lead = await Lead.findById(id);
  if (!lead) {
    return sendError(res, 'Lead not found', 404);
  }

  if (budgetMin !== undefined) lead.budgetMin = budgetMin;
  if (budgetMax !== undefined) lead.budgetMax = budgetMax;
  if (liquidCapital !== undefined) lead.liquidCapital = liquidCapital;
  if (preferredIndustry) {
    lead.preferredIndustry = preferredIndustry;
    lead.targetIndustry = preferredIndustry;
  }
  if (preferredCity) lead.preferredCity = preferredCity;
  if (preferredState) lead.preferredState = preferredState;
  if (investmentTimeline) lead.investmentTimeline = investmentTimeline;
  if (businessExperience) lead.businessExperience = businessExperience;
  if (investmentReadiness) lead.investmentReadiness = investmentReadiness;
  if (qualificationStatus) lead.qualificationStatus = qualificationStatus;
  if (qualificationNotes !== undefined) lead.qualificationNotes = qualificationNotes;

  // Set general status accordingly
  if (qualificationStatus === 'QUALIFIED') {
    lead.status = 'qualified';
  } else if (qualificationStatus === 'NOT_QUALIFIED') {
    lead.status = 'not_qualified';
  } else if (qualificationStatus === 'CONTACTED') {
    lead.status = 'contacted';
  }

  lead.lastContactDate = new Date();

  lead.activities.push({
    type: 'qualification',
    summary: `Investor qualification completed by ${user.fullName}. Status: ${qualificationStatus}. Readiness: ${lead.investmentReadiness}`,
    performedBy: user._id,
    timestamp: new Date(),
    details: { qualificationStatus, investmentReadiness, qualificationNotes },
  });

  await lead.save();

  // If this lead is already converted to a user with an InvestorProfile, sync it
  if (lead.convertedToUser) {
    const invProfile = await InvestorProfile.findOne({ user: lead.convertedToUser });
    if (invProfile) {
      if (budgetMin) invProfile.investmentBudgetMin = budgetMin;
      if (budgetMax) invProfile.investmentBudgetMax = budgetMax;
      if (liquidCapital) invProfile.liquidCapital = liquidCapital;
      if (preferredCity) invProfile.city = preferredCity;
      if (preferredState) invProfile.state = preferredState;
      if (investmentTimeline) invProfile.investmentTimeline = investmentTimeline;
      if (businessExperience) invProfile.investmentExperience = businessExperience;
      await invProfile.save();
    }
  }

  await AuditLog.create({
    actor: user._id,
    actorRole: user.role,
    actorEmail: user.email,
    action: 'LEAD_QUALIFIED',
    entityType: 'Lead',
    entityId: lead._id.toString(),
    details: { qualificationStatus, readiness: lead.investmentReadiness },
  });

  return sendSuccess(res, lead, 'Investor qualification saved successfully');
}

// -----------------------------------------------------------------------------
// 4. DEAL PIPELINE
// -----------------------------------------------------------------------------

export const MILESTONE5_STAGES: DealStage[] = [
  'NEW_ENQUIRY',
  'INITIAL_CONTACT',
  'QUALIFICATION',
  'BRAND_MATCHING',
  'MEETING_SCHEDULED',
  'NEGOTIATION',
  'DUE_DILIGENCE',
  'AGREEMENT',
  'CLOSED_WON',
  'CLOSED_LOST',
];

export async function getPipelineDeals(req: Request, res: Response): Promise<any> {
  const user = req.user!;
  const { stage, assignedBroker, search } = req.query;

  const filter: any = {};

  if (user.role === 'broker' && !assignedBroker) {
    filter.assignedBroker = user._id;
  } else if (assignedBroker && assignedBroker !== 'ALL' && assignedBroker !== 'all') {
    filter.assignedBroker = assignedBroker;
  }

  if (stage && stage !== 'ALL' && stage !== 'all') {
    filter.stage = stage;
  }

  if (search) {
    filter.dealTitle = { $regex: search, $options: 'i' };
  }

  const deals = await BrokerageDeal.find(filter)
    .populate('franchiseListing', 'brandName logoUrl industry totalInvestmentMin totalInvestmentMax')
    .populate('businessOwner', 'fullName email phone')
    .populate('investor', 'fullName email phone')
    .populate('assignedBroker', 'fullName email phone')
    .populate('relatedLead', 'fullName email phone preferredCity')
    .sort({ updatedAt: -1 });

  // Map into exact 10 Milestone 5 columns
  const columns: Record<string, any[]> = {};
  for (const st of MILESTONE5_STAGES) {
    columns[st] = [];
  }

  for (const deal of deals) {
    let st: string = deal.stage;
    // Map legacy stages to 10 milestone stages
    if (st === 'NEW_LEAD' || st === 'lead_received') st = 'NEW_ENQUIRY';
    else if (st === 'CONTACTED' || st === 'initial_discussion') st = 'INITIAL_CONTACT';
    else if (st === 'qualification') st = 'QUALIFICATION';
    else if (st === 'matching' || st === 'OPPORTUNITY_PRESENTED') st = 'BRAND_MATCHING';
    else if (st === 'documentation_review') st = 'DUE_DILIGENCE';
    else if (st === 'agreement_pending') st = 'AGREEMENT';
    else if (st === 'deal_closed') st = 'CLOSED_WON';
    else if (st === 'lost_cancelled') st = 'CLOSED_LOST';

    if (!columns[st]) {
      columns[st] = [];
    }
    columns[st].push(deal);
  }

  const activeDeals = deals.filter((d) => d.stage !== 'CLOSED_WON' && d.stage !== 'CLOSED_LOST' && d.stage !== 'deal_closed' && d.stage !== 'lost_cancelled');
  const closedWon = deals.filter((d) => d.stage === 'CLOSED_WON' || d.stage === 'deal_closed');
  const closedLost = deals.filter((d) => d.stage === 'CLOSED_LOST' || d.stage === 'lost_cancelled');

  return sendSuccess(res, {
    deals,
    columns,
    stages: MILESTONE5_STAGES,
    totalDeals: deals.length,
    activeDealsCount: activeDeals.length,
    closedWonCount: closedWon.length,
    closedLostCount: closedLost.length,
    totalPipelineValue: activeDeals.reduce((sum, d) => sum + (d.dealValue || 0), 0),
    totalWonValue: closedWon.reduce((sum, d) => sum + (d.dealValue || 0), 0),
    totalCommissionEarned: closedWon.reduce((sum, d) => sum + (d.actualCommissionEarned || d.expectedCommission || 0), 0),
  });
}

export async function getDealById(req: Request, res: Response): Promise<any> {
  const { id } = req.params;
  const user = req.user!;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return sendError(res, 'Deal not found', 404);
  }

  const deal = await BrokerageDeal.findById(id)
    .populate('franchiseListing')
    .populate('businessOwner', 'fullName email phone')
    .populate('investor', 'fullName email phone')
    .populate('assignedBroker', 'fullName email phone')
    .populate('relatedLead');

  if (!deal) {
    return sendError(res, 'Deal not found', 404);
  }

  if (
    user.role === 'broker' &&
    deal.assignedBroker &&
    deal.assignedBroker._id?.toString() !== user._id.toString()
  ) {
    return sendError(res, 'Unauthorized to view this deal', 403);
  }

  const [tasks, meetings] = await Promise.all([
    Task.find({ relatedDeal: deal._id }).populate('assignedTo', 'fullName email').sort({ dueDate: 1 }),
    Meeting.find({ relatedDeal: deal._id }).populate('organizer participants', 'fullName email').sort({ scheduledStartTime: 1 }),
  ]);

  return sendSuccess(res, { deal, tasks, meetings });
}

export async function createCrmDeal(req: Request, res: Response): Promise<any> {
  const user = req.user!;
  const {
    dealTitle,
    franchiseListingId,
    businessOwnerId,
    investorId,
    applicationId,
    relatedLeadId,
    dealValue,
    franchiseFee,
    commissionType,
    commissionRate,
    expectedCommission,
    notes,
    targetClosingDate,
    initialStage,
  } = req.body;

  const stage = initialStage || 'NEW_ENQUIRY';

  const deal = await BrokerageDeal.create({
    dealTitle,
    franchiseListing: franchiseListingId,
    businessOwner: businessOwnerId,
    investor: investorId,
    applicationRef: applicationId || undefined,
    relatedLead: relatedLeadId || undefined,
    dealValue,
    franchiseFee,
    commissionType: commissionType || 'percentage',
    commissionRate: commissionRate || 0.05,
    expectedCommission: expectedCommission || Math.round(dealValue * (commissionRate || 0.05)),
    assignedBroker: user._id,
    stage,
    notes: notes || '',
    targetClosingDate,
    stageHistory: [
      {
        stage,
        changedBy: user._id,
        note: `Deal created in pipeline at stage ${stage}`,
        timestamp: new Date(),
      },
    ],
    activities: [
      {
        type: 'stage_change',
        summary: `Deal initialized in stage ${stage}`,
        performedBy: user._id,
        timestamp: new Date(),
      },
    ],
  });

  // Link lead if specified
  if (relatedLeadId) {
    await Lead.findByIdAndUpdate(relatedLeadId, {
      convertedToDeal: deal._id,
      status: 'converted',
      $push: {
        activities: {
          type: 'status_change',
          summary: `Lead converted to active Deal: "${dealTitle}"`,
          performedBy: user._id,
          timestamp: new Date(),
        },
      },
    });
  }

  await AuditLog.create({
    actor: user._id,
    actorRole: user.role,
    actorEmail: user.email,
    action: 'BROKERAGE_DEAL_CREATED',
    entityType: 'BrokerageDeal',
    entityId: deal._id.toString(),
  });

  return sendSuccess(res, deal, 'Deal created successfully in pipeline', 201);
}

export async function convertLeadToDeal(req: Request, res: Response): Promise<any> {
  const { id } = req.params;
  const user = req.user!;
  const { franchiseListingId, dealTitle, dealValue, franchiseFee, notes } = req.body;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return sendError(res, 'Lead not found', 404);
  }

  const lead = await Lead.findById(id);
  if (!lead) {
    return sendError(res, 'Lead not found', 404);
  }

  if (lead.convertedToDeal) {
    return sendError(res, 'This lead has already been converted into an active deal', 400);
  }

  const franchise = await FranchiseListing.findById(franchiseListingId);
  if (!franchise) {
    return sendError(res, 'Franchise listing not found', 404);
  }

  // Ensure investor User exists or resolve
  let investorUserId = lead.convertedToUser;
  if (!investorUserId) {
    const existingUser = await User.findOne({ email: lead.email });
    if (existingUser) {
      investorUserId = existingUser._id;
    } else {
      // Create user record for candidate
      const newUser = await User.create({
        email: lead.email,
        passwordHash: '$2a$10$DummyHashForUnregisteredLeadConversion1234567890',
        fullName: lead.fullName,
        phone: lead.phone,
        role: 'investor',
        status: 'active',
      });
      investorUserId = newUser._id;
      lead.convertedToUser = newUser._id;
    }
  }

  const calculatedValue = dealValue || franchise.totalInvestmentMin || lead.budgetMin || 3000000;
  const calculatedFee = franchiseFee || franchise.initialFranchiseFee || 500000;
  const expectedCommission = Math.round(calculatedValue * 0.05);

  const deal = await BrokerageDeal.create({
    dealTitle: dealTitle || `${franchise.brandName} - ${lead.fullName} (${lead.preferredCity || 'Expansion'})`,
    franchiseListing: franchise._id,
    businessOwner: franchise.ownerUser,
    investor: investorUserId,
    relatedLead: lead._id,
    dealValue: calculatedValue,
    franchiseFee: calculatedFee,
    commissionType: 'percentage',
    commissionRate: 0.05,
    expectedCommission,
    assignedBroker: lead.assignedBroker || user._id,
    stage: 'BRAND_MATCHING',
    notes: notes || `Converted from CRM Lead: ${lead.fullName}`,
    stageHistory: [
      {
        stage: 'BRAND_MATCHING',
        changedBy: user._id,
        note: `Deal created via lead conversion from Lead #${lead._id}`,
        timestamp: new Date(),
      },
    ],
    activities: [
      {
        type: 'stage_change',
        summary: `Deal spawned from qualified lead: ${lead.fullName}`,
        performedBy: user._id,
        timestamp: new Date(),
      },
    ],
  });

  lead.convertedToDeal = deal._id;
  lead.status = 'converted';
  lead.activities.push({
    type: 'status_change',
    summary: `Converted to deal "${deal.dealTitle}"`,
    performedBy: user._id,
    timestamp: new Date(),
  });
  await lead.save();

  await AuditLog.create({
    actor: user._id,
    actorRole: user.role,
    actorEmail: user.email,
    action: 'LEAD_CONVERTED_TO_DEAL',
    entityType: 'BrokerageDeal',
    entityId: deal._id.toString(),
  });

  return sendSuccess(res, deal, 'Lead successfully converted to pipeline deal', 201);
}

export async function updateDealStage(req: Request, res: Response): Promise<any> {
  const { id } = req.params;
  const user = req.user!;
  const { stage, stageChangeNote, notes, dealValue, actualCommissionEarned, paymentStatus } = req.body;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return sendError(res, 'Deal not found', 404);
  }

  const deal = await BrokerageDeal.findById(id);
  if (!deal) {
    return sendError(res, 'Deal not found', 404);
  }

  if (user.role === 'broker' && deal.assignedBroker && deal.assignedBroker.toString() !== user._id.toString()) {
    return sendError(res, 'Unauthorized to modify this deal record', 403);
  }

  const oldStage = deal.stage;
  if (stage && stage !== deal.stage) {
    deal.stage = stage;
    deal.stageHistory.push({
      stage,
      previousStage: oldStage,
      changedBy: user._id,
      note: stageChangeNote || `Transitioned pipeline from ${oldStage} to ${stage}`,
      timestamp: new Date(),
    });

    deal.activities.push({
      type: 'stage_change',
      summary: `Stage updated from ${oldStage} to ${stage}. ${stageChangeNote || ''}`,
      performedBy: user._id,
      timestamp: new Date(),
    });

    if (stage === 'CLOSED_WON') {
      deal.closedAt = new Date();
      if (!deal.actualCommissionEarned) {
        deal.actualCommissionEarned = deal.expectedCommission;
      }
    } else if (stage === 'CLOSED_LOST') {
      deal.closedAt = new Date();
    }
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
    action: 'DEAL_STAGE_UPDATED',
    entityType: 'BrokerageDeal',
    entityId: deal._id.toString(),
    details: { oldStage, newStage: stage, note: stageChangeNote },
  });

  return sendSuccess(res, deal, 'Deal stage updated successfully');
}

// -----------------------------------------------------------------------------
// 5. FOLLOW-UPS & ACTIVITIES
// -----------------------------------------------------------------------------

export async function logLeadActivity(req: Request, res: Response): Promise<any> {
  const { id } = req.params;
  const user = req.user!;
  const { type, summary, details } = req.body;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return sendError(res, 'Lead not found', 404);
  }

  const lead = await Lead.findById(id);
  if (!lead) {
    return sendError(res, 'Lead not found', 404);
  }

  lead.activities.push({
    type,
    summary,
    performedBy: user._id,
    timestamp: new Date(),
    details,
  });
  lead.lastContactDate = new Date();
  await lead.save();

  return sendSuccess(res, lead.activities, 'Activity logged successfully', 201);
}

export async function logDealActivity(req: Request, res: Response): Promise<any> {
  const { id } = req.params;
  const user = req.user!;
  const { type, summary, details } = req.body;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return sendError(res, 'Deal not found', 404);
  }

  const deal = await BrokerageDeal.findById(id);
  if (!deal) {
    return sendError(res, 'Deal not found', 404);
  }

  deal.activities.push({
    type,
    summary,
    performedBy: user._id,
    timestamp: new Date(),
    details,
  });
  await deal.save();

  return sendSuccess(res, deal.activities, 'Deal activity logged successfully', 201);
}

export async function getCrmTasks(req: Request, res: Response): Promise<any> {
  const user = req.user!;
  const { filterType, status, priority, brokerId } = req.query;

  const filter: any = {};

  if (user.role === 'broker' && !brokerId) {
    filter.assignedTo = user._id;
  } else if (brokerId && brokerId !== 'ALL' && brokerId !== 'all') {
    filter.assignedTo = brokerId;
  }

  if (status && status !== 'ALL' && status !== 'all') {
    filter.status = status;
  }

  if (priority && priority !== 'ALL' && priority !== 'all') {
    filter.priority = priority;
  }

  const now = new Date();
  const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const endOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);

  if (filterType === 'overdue') {
    filter.dueDate = { $lt: startOfDay };
    filter.status = { $ne: 'completed' };
  } else if (filterType === 'today') {
    filter.dueDate = { $gte: startOfDay, $lte: endOfDay };
  } else if (filterType === 'upcoming') {
    filter.dueDate = { $gt: endOfDay };
  }

  const tasks = await Task.find(filter)
    .populate('assignedTo', 'fullName email')
    .populate('relatedDeal', 'dealTitle stage')
    .populate('relatedLead', 'fullName company phone')
    .sort({ dueDate: 1 });

  return sendSuccess(res, tasks);
}

// -----------------------------------------------------------------------------
// 6. MEETING MANAGEMENT
// -----------------------------------------------------------------------------

export async function getCrmMeetings(req: Request, res: Response): Promise<any> {
  const user = req.user!;
  const { status, dealId, leadId, brokerId } = req.query;

  const filter: any = {};

  if (status && status !== 'ALL' && status !== 'all') {
    filter.status = status;
  }

  if (dealId) filter.relatedDeal = dealId;
  if (leadId) filter.relatedLead = leadId;

  if (user.role === 'broker' && !brokerId) {
    filter.participants = user._id;
  } else if (brokerId && brokerId !== 'ALL' && brokerId !== 'all') {
    filter.participants = brokerId;
  }

  const meetings = await Meeting.find(filter)
    .populate('organizer', 'fullName email')
    .populate('participants', 'fullName email phone role')
    .populate('relatedFranchise', 'brandName logoUrl')
    .populate('relatedDeal', 'dealTitle stage')
    .populate('relatedLead', 'fullName company')
    .sort({ scheduledStartTime: -1 });

  return sendSuccess(res, meetings);
}

export async function scheduleCrmMeeting(req: Request, res: Response): Promise<any> {
  const user = req.user!;
  const {
    title,
    meetingType,
    participantIds,
    scheduledStartTime,
    scheduledEndTime,
    relatedDeal,
    relatedLead,
    relatedFranchise,
    agenda,
    notes,
    meetingUrl,
    locationDetails,
  } = req.body;

  const participants = Array.from(new Set([...(participantIds || []), user._id.toString()]));

  const meeting = await Meeting.create({
    title,
    meetingType: meetingType || 'franchise_intro',
    organizer: user._id,
    participants,
    scheduledStartTime: new Date(scheduledStartTime),
    scheduledEndTime: new Date(scheduledEndTime),
    relatedDeal: relatedDeal || undefined,
    relatedLead: relatedLead || undefined,
    relatedFranchise: relatedFranchise || undefined,
    agenda,
    notes: notes || '',
    meetingUrl,
    locationDetails,
    status: 'scheduled',
  });

  // Log activity on linked Lead or Deal
  if (relatedLead) {
    await Lead.findByIdAndUpdate(relatedLead, {
      $push: {
        activities: {
          type: 'meeting',
          summary: `Meeting scheduled: "${title}" for ${new Date(scheduledStartTime).toLocaleString()}`,
          performedBy: user._id,
          timestamp: new Date(),
        },
      },
    });
  }

  if (relatedDeal) {
    await BrokerageDeal.findByIdAndUpdate(relatedDeal, {
      $push: {
        activities: {
          type: 'meeting',
          summary: `Meeting scheduled: "${title}"`,
          performedBy: user._id,
          timestamp: new Date(),
        },
      },
    });
  }

  // Notify participants
  for (const pid of participants) {
    if (pid.toString() !== user._id.toString()) {
      await Notification.create({
        recipient: pid,
        type: 'meeting',
        title: `Meeting Scheduled: ${title}`,
        message: `Meeting on ${new Date(scheduledStartTime).toLocaleString()} with ${user.fullName}`,
        actionUrl: `/dashboard/meetings`,
      });
    }
  }

  await AuditLog.create({
    actor: user._id,
    actorRole: user.role,
    actorEmail: user.email,
    action: 'MEETING_SCHEDULED',
    entityType: 'Meeting',
    entityId: meeting._id.toString(),
  });

  return sendSuccess(res, meeting, 'Meeting scheduled successfully', 201);
}

export async function updateCrmMeetingStatus(req: Request, res: Response): Promise<any> {
  const { id } = req.params;
  const { status, notes, actionItems } = req.body;
  const user = req.user!;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return sendError(res, 'Meeting not found', 404);
  }

  const meeting = await Meeting.findById(id);
  if (!meeting) {
    return sendError(res, 'Meeting not found', 404);
  }

  meeting.status = status;
  if (notes) meeting.notes = notes;
  if (actionItems) meeting.actionItems = actionItems;
  await meeting.save();

  await AuditLog.create({
    actor: user._id,
    actorRole: user.role,
    actorEmail: user.email,
    action: 'MEETING_STATUS_UPDATED',
    entityType: 'Meeting',
    entityId: meeting._id.toString(),
    details: { status, notes },
  });

  return sendSuccess(res, meeting, 'Meeting status updated successfully');
}

// -----------------------------------------------------------------------------
// 7. CRM DASHBOARD & METRICS
// -----------------------------------------------------------------------------

export async function getCrmMetrics(req: Request, res: Response): Promise<any> {
  const user = req.user!;
  const filter: any = {};

  if (user.role === 'broker') {
    filter.assignedBroker = user._id;
  }

  const now = new Date();
  const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  const [
    totalLeads,
    brandLeads,
    investorLeads,
    qualifiedInvestors,
    newEnquiriesCount,
    deals,
    scheduledMeetingsCount,
    overdueFollowUpsCount,
    brokers,
  ] = await Promise.all([
    Lead.countDocuments(filter),
    Lead.countDocuments({ ...filter, leadType: { $in: ['brand_owner', 'brand_partnership'] } }),
    Lead.countDocuments({ ...filter, leadType: { $in: ['franchise_investor', 'multi_unit_operator', 'investor'] } }),
    Lead.countDocuments({ ...filter, qualificationStatus: 'QUALIFIED' }),
    FranchiseApplication.countDocuments({ status: 'NEW' }),
    BrokerageDeal.find(filter),
    Meeting.countDocuments(user.role === 'broker' ? { participants: user._id, status: 'scheduled' } : { status: 'scheduled' }),
    Task.countDocuments({
      ...(user.role === 'broker' ? { assignedTo: user._id } : {}),
      dueDate: { $lt: startOfDay },
      status: { $ne: 'completed' },
    }),
    User.find({ role: { $in: ['broker', 'admin'] } }).select('fullName email phone role avatarUrl'),
  ]);

  const activeDeals = deals.filter(
    (d) => d.stage !== 'CLOSED_WON' && d.stage !== 'CLOSED_LOST' && d.stage !== 'deal_closed' && d.stage !== 'lost_cancelled'
  );
  const dealsWon = deals.filter((d) => d.stage === 'CLOSED_WON' || d.stage === 'deal_closed');
  const dealsLost = deals.filter((d) => d.stage === 'CLOSED_LOST' || d.stage === 'lost_cancelled');

  const totalWonValue = dealsWon.reduce((sum, d) => sum + (d.dealValue || 0), 0);
  const totalCommissionEarned = dealsWon.reduce((sum, d) => sum + (d.actualCommissionEarned || d.expectedCommission || 0), 0);

  // Broker-wise performance
  const brokerPerformance = await Promise.all(
    brokers.map(async (b) => {
      const [assignedLeads, qualifiedLeads, brokerDeals] = await Promise.all([
        Lead.countDocuments({ assignedBroker: b._id }),
        Lead.countDocuments({ assignedBroker: b._id, qualificationStatus: 'QUALIFIED' }),
        BrokerageDeal.find({ assignedBroker: b._id }),
      ]);
      const won = brokerDeals.filter((d) => d.stage === 'CLOSED_WON' || d.stage === 'deal_closed');
      const active = brokerDeals.filter(
        (d) => d.stage !== 'CLOSED_WON' && d.stage !== 'CLOSED_LOST' && d.stage !== 'deal_closed' && d.stage !== 'lost_cancelled'
      );
      return {
        brokerId: b._id,
        name: b.fullName,
        email: b.email,
        assignedLeads,
        qualifiedLeads,
        activeDeals: active.length,
        dealsWon: won.length,
        volumeWon: won.reduce((sum, d) => sum + (d.dealValue || 0), 0),
        commissionEarned: won.reduce((sum, d) => sum + (d.actualCommissionEarned || d.expectedCommission || 0), 0),
      };
    })
  );

  return sendSuccess(res, {
    totalLeads,
    brandLeads,
    investorLeads,
    qualifiedInvestors,
    newEnquiries: newEnquiriesCount,
    activeDeals: activeDeals.length,
    meetingsScheduled: scheduledMeetingsCount,
    dealsWon: dealsWon.length,
    dealsLost: dealsLost.length,
    totalWonValue,
    totalCommissionEarned,
    overdueFollowUps: overdueFollowUpsCount,
    overdueFollowups: overdueFollowUpsCount,
    brokerPerformance,
  });
}
