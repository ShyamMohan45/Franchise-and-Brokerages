import { Request, Response } from 'express';
import { User } from '../models/User';
import { BusinessProfile } from '../models/BusinessProfile';
import { InvestorProfile } from '../models/InvestorProfile';
import { FranchiseListing } from '../models/FranchiseListing';
import { FranchiseApplication } from '../models/FranchiseApplication';
import { Lead } from '../models/Lead';
import { BrokerageDeal } from '../models/BrokerageDeal';
import { AuditLog } from '../models/AuditLog';
import { PlatformSettings } from '../models/PlatformSettings';
import { ContactEnquiry } from '../models/ContactEnquiry';
import { sendSuccess, sendError } from '../utils/response';

export async function getDashboardMetrics(req: Request, res: Response): Promise<any> {
  const [
    totalUsers,
    totalBusinessOwners,
    totalInvestors,
    pendingBusinesses,
    publishedFranchises,
    totalApplications,
    activeDeals,
    completedDeals,
    recentEnquiries,
    recentAuditLogs,
  ] = await Promise.all([
    User.countDocuments(),
    User.countDocuments({ role: 'business_owner' }),
    User.countDocuments({ role: 'investor' }),
    BusinessProfile.countDocuments({ approvalStatus: 'under_review' }),
    FranchiseListing.countDocuments({ status: 'published' }),
    FranchiseApplication.countDocuments(),
    BrokerageDeal.find({ stage: { $nin: ['deal_closed', 'lost_cancelled'] } }),
    BrokerageDeal.find({ stage: 'deal_closed' }),
    ContactEnquiry.find().sort({ createdAt: -1 }).limit(5),
    AuditLog.find().sort({ createdAt: -1 }).limit(8),
  ]);

  const pipelineValue = activeDeals.reduce((sum, deal) => sum + (deal.dealValue || 0), 0);
  const projectedCommission = activeDeals.reduce((sum, deal) => sum + (deal.expectedCommission || 0), 0);
  const earnedCommission = completedDeals.reduce(
    (sum, deal) => sum + (deal.actualCommissionEarned || deal.expectedCommission || 0),
    0
  );

  return sendSuccess(res, {
    totalUsers,
    totalBusinessOwners,
    totalInvestors,
    pendingBusinesses,
    publishedFranchises,
    totalApplications,
    activeDealsCount: activeDeals.length,
    completedDealsCount: completedDeals.length,
    pipelineValue,
    projectedCommission,
    earnedCommission,
    recentEnquiries,
    recentAuditLogs,
  });
}

// User Management
export async function getUsers(req: Request, res: Response): Promise<any> {
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 15;
  const role = req.query.role as string;
  const search = req.query.search as string;

  const filter: any = {};
  if (role && role !== 'All') filter.role = role;
  if (search) {
    filter.$or = [
      { email: { $regex: search, $options: 'i' } },
      { fullName: { $regex: search, $options: 'i' } },
    ];
  }

  const total = await User.countDocuments(filter);
  const users = await User.find(filter)
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(limit);

  return sendSuccess(res, users, 'Users retrieved', 200, { page, limit, total, totalPages: Math.ceil(total / limit) });
}

export async function updateUserRoleAndStatus(req: Request, res: Response): Promise<any> {
  const { id } = req.params;
  const { role, status } = req.body;

  const user = await User.findById(id);
  if (!user) {
    return sendError(res, 'User not found', 404);
  }

  if (role) user.role = role;
  if (status) user.status = status;
  await user.save();

  await AuditLog.create({
    actor: req.user!._id,
    actorRole: req.user!.role,
    actorEmail: req.user!.email,
    action: 'USER_ROLE_STATUS_UPDATED',
    entityType: 'User',
    entityId: user._id.toString(),
    details: { newRole: role, newStatus: status },
  });

  return sendSuccess(res, user, 'User updated successfully');
}

// Business Management
export async function getAdminBusinesses(req: Request, res: Response): Promise<any> {
  const status = req.query.status as string;
  const filter: any = {};
  if (status && status !== 'All') filter.approvalStatus = status;

  const businesses = await BusinessProfile.find(filter)
    .populate('user', 'fullName email phone')
    .sort({ createdAt: -1 });

  return sendSuccess(res, businesses);
}

export async function updateBusinessStatus(req: Request, res: Response): Promise<any> {
  const { id } = req.params;
  const { status, adminReviewNotes } = req.body;

  const business = await BusinessProfile.findById(id);
  if (!business) {
    return sendError(res, 'Business not found', 404);
  }

  business.approvalStatus = status;
  if (adminReviewNotes) business.adminReviewNotes = adminReviewNotes;
  business.reviewedBy = req.user!._id;
  business.reviewedAt = new Date();
  await business.save();

  await AuditLog.create({
    actor: req.user!._id,
    actorRole: req.user!.role,
    actorEmail: req.user!.email,
    action: 'BUSINESS_APPROVAL_STATUS_UPDATED',
    entityType: 'BusinessProfile',
    entityId: business._id.toString(),
    details: { status, adminReviewNotes },
  });

  return sendSuccess(res, business, 'Business approval status updated');
}

// Franchise Listing Approvals
export async function updateFranchiseListingStatus(req: Request, res: Response): Promise<any> {
  const { id } = req.params;
  const { status, isFeatured } = req.body;

  const listing = await FranchiseListing.findById(id);
  if (!listing) {
    return sendError(res, 'Listing not found', 404);
  }

  if (status) {
    listing.status = status;
    if (status === 'published' && !listing.publishedAt) {
      listing.publishedAt = new Date();
      listing.approvedBy = req.user!._id;
    }
  }

  if (typeof isFeatured === 'boolean') {
    listing.isFeatured = isFeatured;
  }

  await listing.save();

  await AuditLog.create({
    actor: req.user!._id,
    actorRole: req.user!.role,
    actorEmail: req.user!.email,
    action: 'FRANCHISE_LISTING_STATUS_UPDATED',
    entityType: 'FranchiseListing',
    entityId: listing._id.toString(),
    details: { status, isFeatured },
  });

  return sendSuccess(res, listing, 'Franchise listing status updated');
}

// Leads CRM
export async function getLeads(req: Request, res: Response): Promise<any> {
  const status = req.query.status as string;
  const priority = req.query.priority as string;
  const filter: any = {};

  if (status && status !== 'All') filter.status = status;
  if (priority && priority !== 'All') filter.priority = priority;

  const leads = await Lead.find(filter)
    .populate('assignedBroker', 'fullName email')
    .sort({ createdAt: -1 });

  return sendSuccess(res, leads);
}

export async function createLead(req: Request, res: Response): Promise<any> {
  const lead = await Lead.create({
    ...req.body,
    assignedBroker: req.user!._id,
    activities: [
      {
        type: 'note',
        summary: 'Lead entered into CRM',
        performedBy: req.user!._id,
        timestamp: new Date(),
      },
    ],
  });

  await AuditLog.create({
    actor: req.user!._id,
    actorRole: req.user!.role,
    actorEmail: req.user!.email,
    action: 'LEAD_CREATED',
    entityType: 'Lead',
    entityId: lead._id.toString(),
  });

  return sendSuccess(res, lead, 'Lead created successfully', 201);
}

export async function updateLead(req: Request, res: Response): Promise<any> {
  const { id } = req.params;
  const lead = await Lead.findById(id);

  if (!lead) {
    return sendError(res, 'Lead not found', 404);
  }

  if (req.body.status && req.body.status !== lead.status) {
    lead.activities.push({
      type: 'status_change',
      summary: `Status updated from ${lead.status} to ${req.body.status}`,
      performedBy: req.user!._id,
      timestamp: new Date(),
    });
  }

  Object.assign(lead, req.body);
  await lead.save();

  return sendSuccess(res, lead, 'Lead updated successfully');
}

// Brokerage Deals
export async function getDeals(req: Request, res: Response): Promise<any> {
  const stage = req.query.stage as string;
  const filter: any = {};
  if (stage && stage !== 'All') filter.stage = stage;

  const deals = await BrokerageDeal.find(filter)
    .populate('franchiseListing', 'brandName logoUrl industry')
    .populate('businessOwner', 'fullName email phone')
    .populate('investor', 'fullName email phone')
    .populate('assignedBroker', 'fullName email')
    .sort({ createdAt: -1 });

  return sendSuccess(res, deals);
}

export async function createDeal(req: Request, res: Response): Promise<any> {
  const deal = await BrokerageDeal.create({
    ...req.body,
    assignedBroker: req.user!._id,
    stage: 'lead_received',
    stageHistory: [
      {
        stage: 'lead_received',
        changedBy: req.user!._id,
        note: 'Brokerage deal pipeline initiated',
        timestamp: new Date(),
      },
    ],
  });

  await AuditLog.create({
    actor: req.user!._id,
    actorRole: req.user!.role,
    actorEmail: req.user!.email,
    action: 'BROKERAGE_DEAL_CREATED',
    entityType: 'BrokerageDeal',
    entityId: deal._id.toString(),
  });

  return sendSuccess(res, deal, 'Deal initiated in pipeline', 201);
}

export async function updateDeal(req: Request, res: Response): Promise<any> {
  const { id } = req.params;
  const { stage, stageChangeNote, ...data } = req.body;

  const deal = await BrokerageDeal.findById(id);
  if (!deal) {
    return sendError(res, 'Deal not found', 404);
  }

  if (stage && stage !== deal.stage) {
    deal.stage = stage;
    deal.stageHistory.push({
      stage,
      changedBy: req.user!._id,
      note: stageChangeNote || `Moved to ${stage.replace('_', ' ')}`,
      timestamp: new Date(),
    });

    if (stage === 'deal_closed') {
      deal.closedAt = new Date();
      if (!deal.actualCommissionEarned) {
        deal.actualCommissionEarned = deal.expectedCommission;
      }
    }
  }

  Object.assign(deal, data);
  await deal.save();

  await AuditLog.create({
    actor: req.user!._id,
    actorRole: req.user!.role,
    actorEmail: req.user!.email,
    action: 'BROKERAGE_DEAL_UPDATED',
    entityType: 'BrokerageDeal',
    entityId: deal._id.toString(),
    details: { newStage: stage },
  });

  return sendSuccess(res, deal, 'Deal updated successfully');
}

// Audit Logs
export async function getAuditLogs(req: Request, res: Response): Promise<any> {
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 20;

  const total = await AuditLog.countDocuments();
  const logs = await AuditLog.find()
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(limit);

  return sendSuccess(res, logs, 'Audit logs retrieved', 200, {
    page,
    limit,
    total,
    totalPages: Math.ceil(total / limit),
  });
}

// Platform Settings
export async function getPlatformSettings(req: Request, res: Response): Promise<any> {
  let settings = await PlatformSettings.findOne();
  if (!settings) {
    settings = await PlatformSettings.create({});
  }
  return sendSuccess(res, settings);
}

export async function updatePlatformSettings(req: Request, res: Response): Promise<any> {
  let settings = await PlatformSettings.findOne();
  if (!settings) {
    settings = await PlatformSettings.create({ ...req.body, updatedBy: req.user!._id });
  } else {
    Object.assign(settings, req.body);
    settings.updatedBy = req.user!._id;
    await settings.save();
  }

  await AuditLog.create({
    actor: req.user!._id,
    actorRole: req.user!.role,
    actorEmail: req.user!.email,
    action: 'PLATFORM_SETTINGS_UPDATED',
    entityType: 'PlatformSettings',
    entityId: settings._id.toString(),
  });

  return sendSuccess(res, settings, 'Platform settings saved successfully');
}
