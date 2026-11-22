import { Request, Response } from 'express';
import mongoose, { Types } from 'mongoose';
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
import { IntroductionRequest } from '../models/IntroductionRequest';
import { DealRoom } from '../models/DealRoom';
import { DueDiligenceChecklist } from '../models/DueDiligenceChecklist';
import { NotificationService } from '../services/notificationService';
import { EmailService } from '../services/emailService';
import { env } from '../config/env';
import { sendSuccess, sendError } from '../utils/response';
import { Logger } from '../utils/logger';

// ----------------------------------------------------------------------------
// 1. Operational Dashboard Metrics
// ----------------------------------------------------------------------------
export async function getDashboardMetrics(req: Request, res: Response): Promise<any> {
  const [
    totalUsers,
    totalBusinessOwners,
    totalInvestors,
    totalBrokers,
    totalAdmins,
    pendingBusinesses,
    pendingInvestors,
    pendingFranchises,
    publishedFranchises,
    totalIntroductions,
    pendingIntroductions,
    mutuallyAcceptedIntroductions,
    totalDealRooms,
    activeDealRooms,
    finalizedDealRooms,
    activeDeals,
    completedDeals,
    openEnquiries,
    recentEnquiries,
    recentAuditLogs,
  ] = await Promise.all([
    User.countDocuments(),
    User.countDocuments({ role: { $in: ['business_owner', 'brand_owner'] } }),
    User.countDocuments({ role: 'investor' }),
    User.countDocuments({ role: 'broker' }),
    User.countDocuments({ role: { $in: ['admin', 'super_admin'] } }),
    BusinessProfile.countDocuments({
      approvalStatus: { $in: ['under_review', 'SUBMITTED', 'revision_requested', 'DRAFT'] },
    }),
    InvestorProfile.countDocuments({ isVerified: false }),
    FranchiseListing.countDocuments({
      status: { $in: ['under_review', 'pending_approval', 'submitted', 'SUBMITTED', 'UNDER_REVIEW'] },
    }),
    FranchiseListing.countDocuments({ status: { $in: ['published', 'PUBLISHED'] } }),
    IntroductionRequest.countDocuments(),
    IntroductionRequest.countDocuments({ status: { $in: ['PENDING', 'ADMIN_REVIEW'] } }),
    IntroductionRequest.countDocuments({ status: 'MUTUALLY_ACCEPTED' }),
    DealRoom.countDocuments(),
    DealRoom.countDocuments({ stage: { $nin: ['deal_finalized', 'cancelled'] } }),
    DealRoom.countDocuments({ stage: 'deal_finalized' }),
    BrokerageDeal.find({ stage: { $nin: ['deal_closed', 'lost_cancelled'] } }),
    BrokerageDeal.find({ stage: 'deal_closed' }),
    ContactEnquiry.countDocuments({ status: { $in: ['new', 'reviewed'] } }),
    ContactEnquiry.find().sort({ createdAt: -1 }).limit(5),
    AuditLog.find()
      .populate('actor', 'fullName email role')
      .sort({ createdAt: -1 })
      .limit(8),
  ]);

  const pipelineValue = activeDeals.reduce((sum, deal) => sum + (deal.dealValue || 0), 0);
  const projectedCommission = activeDeals.reduce((sum, deal) => sum + (deal.expectedCommission || 0), 0);
  const earnedCommission = completedDeals.reduce(
    (sum, deal) => sum + (deal.actualCommissionEarned || deal.expectedCommission || 0),
    0
  );

  return sendSuccess(res, {
    users: {
      total: totalUsers,
      businessOwners: totalBusinessOwners,
      investors: totalInvestors,
      brokers: totalBrokers,
      admins: totalAdmins,
    },
    verificationQueues: {
      pendingBusinesses,
      pendingInvestors,
      pendingFranchises,
      publishedFranchises,
    },
    introductions: {
      total: totalIntroductions,
      pending: pendingIntroductions,
      mutuallyAccepted: mutuallyAcceptedIntroductions,
    },
    dealRooms: {
      total: totalDealRooms,
      active: activeDealRooms,
      finalized: finalizedDealRooms,
    },
    crmPipeline: {
      activeDealsCount: activeDeals.length,
      completedDealsCount: completedDeals.length,
      pipelineValue,
      projectedCommission,
      earnedCommission,
    },
    support: {
      openEnquiries,
      recentEnquiries,
    },
    recentAuditLogs,
  });
}

// ----------------------------------------------------------------------------
// 2. User Management & Role Authorization (Super Admin Only for Role Changes)
// ----------------------------------------------------------------------------
export async function getUsers(req: Request, res: Response): Promise<any> {
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 15;
  const role = req.query.role as string;
  const status = req.query.status as string;
  const search = req.query.search as string;

  const filter: any = {};
  if (role && role !== 'All') filter.role = role;
  if (status && status !== 'All') filter.status = status;
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

  return sendSuccess(res, users, 'Users retrieved', 200, {
    page,
    limit,
    total,
    totalPages: Math.ceil(total / limit),
  });
}

export async function updateUserRoleAndStatus(req: Request, res: Response): Promise<any> {
  const { id } = req.params;
  const { role, status } = req.body;

  const user = await User.findById(id);
  if (!user) {
    return sendError(res, 'User not found', 404);
  }

  // Security Guard: Prevent demoting, reassigning, or suspending the primary Super Admin account
  const isTargetSuperAdmin =
    user.role === 'super_admin' || user.email === 'broker.admin@franchisebridge.com';

  if (isTargetSuperAdmin && (role !== 'super_admin' || status === 'suspended')) {
    return sendError(
      res,
      'Security violation: The primary Super Admin account cannot be demoted, modified, or suspended.',
      403
    );
  }

  // Security Guard: Prevent elevating non-super-admins to super_admin
  if (role === 'super_admin' && user.role !== 'super_admin') {
    return sendError(
      res,
      'Security violation: Creation of additional super_admin accounts is prohibited by platform security policy.',
      403
    );
  }

  const previousRole = user.role;
  const previousStatus = user.status;

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
    details: {
      targetUserId: user._id,
      targetEmail: user.email,
      previousRole,
      newRole: user.role,
      previousStatus,
      newStatus: user.status,
    },
  });

  return sendSuccess(res, user, 'User status and role updated successfully');
}

// ----------------------------------------------------------------------------
// 3. Investor Identity & Profile Verification
// ----------------------------------------------------------------------------
export async function getAdminInvestors(req: Request, res: Response): Promise<any> {
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 15;
  const verification = req.query.verification as string;
  const search = req.query.search as string;

  const filter: any = {};
  if (verification === 'verified') filter.isVerified = true;
  if (verification === 'unverified') filter.isVerified = false;
  if (verification && ['pending', 'rejected', 'needs_clarification'].includes(verification)) {
    filter.verificationStatus = verification;
  }
  if (search) {
    filter.$or = [
      { fullName: { $regex: search, $options: 'i' } },
      { city: { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } },
    ];
  }

  const total = await InvestorProfile.countDocuments(filter);
  const investors = await InvestorProfile.find(filter)
    .populate('user', 'fullName email phone status createdAt')
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(limit);

  return sendSuccess(res, investors, 'Investors retrieved', 200, {
    page,
    limit,
    total,
    totalPages: Math.ceil(total / limit),
  });
}

export async function updateInvestorVerification(req: Request, res: Response): Promise<any> {
  const { id } = req.params;
  const { isVerified, verificationStatus, verificationNotes } = req.body;

  const validVerificationStatuses = ['unverified', 'pending', 'verified', 'rejected', 'needs_clarification'];
  if (verificationStatus && !validVerificationStatuses.includes(verificationStatus)) {
    return sendError(res, `Invalid verification status. Must be one of: [${validVerificationStatuses.join(', ')}]`, 400);
  }

  const investor = await InvestorProfile.findById(id).populate('user');
  if (!investor) {
    return sendError(res, 'Investor profile not found', 404);
  }

  const previousVerified = investor.isVerified;
  investor.isVerified = Boolean(isVerified);
  investor.verificationStatus =
    verificationStatus || (isVerified ? 'verified' : 'rejected');
  if (verificationNotes !== undefined) investor.verificationNotes = verificationNotes;
  investor.verifiedBy = req.user!._id;
  investor.verifiedAt = new Date();
  await investor.save();

  // Audit Logging
  await AuditLog.create({
    actor: req.user!._id,
    actorRole: req.user!.role,
    actorEmail: req.user!.email,
    action: 'INVESTOR_VERIFICATION_UPDATED',
    entityType: 'InvestorProfile',
    entityId: investor._id.toString(),
    details: {
      investorName: investor.fullName,
      previousVerified,
      newVerified: investor.isVerified,
      verificationStatus: investor.verificationStatus,
      verificationNotes,
    },
  });

  // Notification & Email Dispatch
  const userDoc: any = investor.user;
  if (userDoc) {
    await NotificationService.createNotification({
      recipient: userDoc._id || userDoc,
      title: isVerified ? 'Investor Profile Verified' : 'Investor Verification Update',
      message: isVerified
        ? 'Your investor profile has been verified by platform administrators. You now have priority access to verified franchise opportunities.'
        : `Your investor profile verification requires review: ${verificationNotes || 'Please update your criteria.'}`,
      type: 'system',
      actionUrl: '/dashboard/investor',
    });

    if (userDoc.email) {
      EmailService.sendEmail({
        to: userDoc.email,
        subject: isVerified
          ? 'FranchiseBridge - Investor Identity Verified'
          : 'FranchiseBridge - Investor Verification Status Update',
        html: `<p>Hello ${investor.fullName || 'Investor'},</p>
               <p>${
                 isVerified
                   ? 'Congratulations! Your investor accreditation has been successfully verified.'
                   : `Your investor profile status has been updated: <strong>${investor.verificationStatus}</strong>.`
               }</p>
               ${verificationNotes ? `<p><strong>Administrator Notes:</strong> ${verificationNotes}</p>` : ''}
               <p>Log in to your investor dashboard to review your status.</p>`,
      }).catch((err) => Logger.error('[updateInvestorVerification] Email dispatch failed', err));
    }
  }

  return sendSuccess(res, investor, 'Investor verification status updated successfully');
}

// ----------------------------------------------------------------------------
// 4. Franchisor Business Profile Verification
// ----------------------------------------------------------------------------
export async function getAdminBusinesses(req: Request, res: Response): Promise<any> {
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 15;
  const status = req.query.status as string;
  const search = req.query.search as string;

  const filter: any = {};
  if (status && status !== 'All') filter.approvalStatus = status;
  if (search) {
    filter.$or = [
      { businessName: { $regex: search, $options: 'i' } },
      { legalBusinessName: { $regex: search, $options: 'i' } },
      { founderName: { $regex: search, $options: 'i' } },
    ];
  }

  const total = await BusinessProfile.countDocuments(filter);
  const businesses = await BusinessProfile.find(filter)
    .populate('user', 'fullName email phone status')
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(limit);

  return sendSuccess(res, businesses, 'Businesses retrieved', 200, {
    page,
    limit,
    total,
    totalPages: Math.ceil(total / limit),
  });
}

export async function updateBusinessStatus(req: Request, res: Response): Promise<any> {
  const { id } = req.params;
  const { status, adminReviewNotes } = req.body;

  const validStatuses = ['pending', 'approved', 'rejected', 'more_info_needed'];
  if (status && !validStatuses.includes(status)) {
    return sendError(res, `Invalid approval status. Must be one of: [${validStatuses.join(', ')}]`, 400);
  }

  const business = await BusinessProfile.findById(id).populate('user');
  if (!business) {
    return sendError(res, 'Business not found', 404);
  }

  const previousStatus = business.approvalStatus;
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
    details: {
      businessName: business.businessName,
      previousStatus,
      newStatus: status,
      adminReviewNotes,
    },
  });

  // Notify Business Owner
  const userDoc: any = business.user;
  if (userDoc) {
    await NotificationService.createNotification({
      recipient: userDoc._id || userDoc,
      title: 'Business Profile Review Update',
      message: `Your business profile for ${business.businessName} has been updated to ${status}.`,
      type: 'system',
      actionUrl: '/dashboard/business',
    });
  }

  return sendSuccess(res, business, 'Business approval status updated successfully');
}

// ----------------------------------------------------------------------------
// 5. Franchise Listing Approvals, Rejections & Review
// ----------------------------------------------------------------------------
export async function getAdminFranchises(req: Request, res: Response): Promise<any> {
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 15;
  const status = req.query.status as string;
  const industry = req.query.industry as string;
  const search = req.query.search as string;

  const filter: any = {};
  if (status && status !== 'All') filter.status = status;
  if (industry && industry !== 'All') filter.industry = industry;
  if (search) {
    filter.$or = [
      { brandName: { $regex: search, $options: 'i' } },
      { opportunityTitle: { $regex: search, $options: 'i' } },
      { summary: { $regex: search, $options: 'i' } },
    ];
  }

  const total = await FranchiseListing.countDocuments(filter);
  const listings = await FranchiseListing.find(filter)
    .populate('business', 'businessName legalBusinessName numberOfOutlets')
    .populate('ownerUser', 'fullName email phone')
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(limit);

  return sendSuccess(res, listings, 'Franchise listings retrieved', 200, {
    page,
    limit,
    total,
    totalPages: Math.ceil(total / limit),
  });
}

export async function updateFranchiseListingStatus(req: Request, res: Response): Promise<any> {
  const { id } = req.params;
  const { status, isFeatured, rejectionReason, correctionNotes } = req.body;

  const validStatuses = ['draft', 'under_review', 'changes_requested', 'published', 'rejected', 'archived'];
  if (status && !validStatuses.includes(status.toLowerCase())) {
    return sendError(res, `Invalid listing status. Must be one of: [${validStatuses.join(', ')}]`, 400);
  }

  const listing = await FranchiseListing.findById(id).populate('ownerUser');
  if (!listing) {
    return sendError(res, 'Franchise listing not found', 404);
  }

  const previousStatus = listing.status;

  if (status) {
    listing.status = status;
    listing.reviewedBy = req.user!._id;
    listing.reviewedAt = new Date();

    if ((status === 'published' || status === 'PUBLISHED') && !listing.publishedAt) {
      listing.publishedAt = new Date();
      listing.approvedBy = req.user!._id;
    }
  }

  if (rejectionReason !== undefined) listing.rejectionReason = rejectionReason;
  if (correctionNotes !== undefined) listing.correctionNotes = correctionNotes;
  if (typeof isFeatured === 'boolean') listing.isFeatured = isFeatured;

  await listing.save();

  await AuditLog.create({
    actor: req.user!._id,
    actorRole: req.user!.role,
    actorEmail: req.user!.email,
    action: 'FRANCHISE_LISTING_STATUS_UPDATED',
    entityType: 'FranchiseListing',
    entityId: listing._id.toString(),
    details: {
      brandName: listing.brandName,
      previousStatus,
      newStatus: status,
      isFeatured,
      rejectionReason,
      correctionNotes,
    },
  });

  // Notify Brand Owner
  const owner: any = listing.ownerUser;
  if (owner) {
    await NotificationService.createNotification({
      recipient: owner._id || owner,
      title: `Franchise Listing Update: ${listing.brandName}`,
      message: `Your opportunity listing for ${listing.brandName} is now ${status}.${
        rejectionReason ? ' Notes: ' + rejectionReason : ''
      }`,
      type: 'system',
      actionUrl: '/dashboard/business',
    });
  }

  return sendSuccess(res, listing, 'Franchise listing status updated successfully');
}

// ----------------------------------------------------------------------------
// 6. Admin Matchmaking Desk & Cross-Criteria Recommendation
// ----------------------------------------------------------------------------
export async function getAdminMatchmaking(req: Request, res: Response): Promise<any> {
  const { franchiseId, investorId } = req.query;

  // Case A: Specific Franchise -> Rank Compatible Investors
  if (franchiseId && mongoose.Types.ObjectId.isValid(franchiseId as string)) {
    const franchise = await FranchiseListing.findById(franchiseId);
    if (!franchise) return sendError(res, 'Franchise listing not found', 404);

    const investors = await InvestorProfile.find()
      .populate('user', 'status createdAt')
      .limit(50);

    const scored = investors
      .map((inv) => {
        let score = 0;
        const matches: string[] = [];
        const gaps: string[] = [];

        // 1. Capital (35%)
        const minReq = franchise.totalInvestmentMin || 0;
        const maxBudget = inv.investmentBudgetMax || 0;
        const liquid = inv.liquidCapital || 0;
        if (liquid >= minReq) {
          score += 35;
          matches.push('Liquid capital meets minimum total investment requirement');
        } else if (maxBudget >= minReq) {
          score += 25;
          matches.push('Investment budget encompasses franchise minimum');
        } else {
          gaps.push(`Investor capital (₹${(liquid / 100000).toFixed(1)}L) below minimum (₹${(minReq / 100000).toFixed(1)}L)`);
        }

        // 2. Geography (25%)
        const franchiseLocs = (franchise.expansionLocations || []).map((l) => l.toLowerCase());
        const invCities = (inv.preferredCities || []).map((c) => c.toLowerCase());
        const cityOverlap = invCities.filter((c) => franchiseLocs.some((fl) => fl.includes(c) || c.includes(fl)));
        if (cityOverlap.length > 0) {
          score += 25;
          matches.push(`Territory overlap in: ${cityOverlap.join(', ')}`);
        } else {
          gaps.push('No immediate city territory overlap declared');
        }

        // 3. Industry (20%)
        const franchiseInd = (franchise.industry || '').toLowerCase();
        const invInds = (inv.preferredIndustries || []).map((i) => i.toLowerCase());
        if (invInds.some((i) => franchiseInd.includes(i) || i.includes(franchiseInd))) {
          score += 20;
          matches.push(`Preferred industry matches: ${franchise.industry}`);
        } else {
          gaps.push('Industry not in investor primary preference list');
        }

        // 4. Model (10%)
        const invModel = inv.preferredBusinessModel;
        if (invModel === 'flexible' || invModel === franchise.businessModel) {
          score += 10;
          matches.push(`Business model alignment: ${invModel}`);
        }

        // 5. Verification (10%)
        if (inv.isVerified) {
          score += 10;
          matches.push('Verified accredited investor');
        }

        return {
          investor: {
            _id: inv._id,
            city: inv.city,
            state: inv.state,
            investorType: inv.investorType,
            investmentBudgetMax: inv.investmentBudgetMax,
            liquidCapital: inv.liquidCapital,
            preferredIndustries: inv.preferredIndustries,
            preferredCities: inv.preferredCities,
            isVerified: inv.isVerified,
            profileCompletion: inv.profileCompletion,
          },
          compatibilityScore: score,
          matchingCriteria: matches,
          incompatibleCriteria: gaps,
        };
      })
      .filter((m) => m.compatibilityScore >= 30)
      .sort((a, b) => b.compatibilityScore - a.compatibilityScore);

    return sendSuccess(res, { franchise, matches: scored });
  }

  // Case B: General Platform Match Matrix
  const activeFranchises = await FranchiseListing.find({
    status: { $in: ['published', 'PUBLISHED'] },
  }).limit(10);
  const activeInvestors = await InvestorProfile.find().limit(10);

  return sendSuccess(res, {
    totalFranchisesForMatching: activeFranchises.length,
    totalInvestorsForMatching: activeInvestors.length,
    activeFranchises,
    activeInvestors: activeInvestors.map((i) => ({
      _id: i._id,
      city: i.city,
      investmentBudgetMax: i.investmentBudgetMax,
      liquidCapital: i.liquidCapital,
      preferredIndustries: i.preferredIndustries,
      isVerified: i.isVerified,
    })),
  });
}

export async function recommendAdminMatch(req: Request, res: Response): Promise<any> {
  const { franchiseId, investorId, initialMessage } = req.body;

  if (!franchiseId || !investorId) {
    return sendError(res, 'franchiseId and investorId are required.', 400);
  }

  const franchise = await FranchiseListing.findById(franchiseId);
  const investor = await InvestorProfile.findById(investorId).populate('user');

  if (!franchise || !investor) {
    return sendError(res, 'Franchise or investor profile not found.', 404);
  }

  // Check if introduction already exists
  const existingIntro = await IntroductionRequest.findOne({
    franchise: franchise._id,
    investorProfile: investor._id,
  });

  if (existingIntro) {
    return sendSuccess(
      res,
      existingIntro,
      'An introduction request already exists between this franchisor and investor.',
      200
    );
  }

  const refNumber = `INTRO-${new Date().getFullYear()}${String(new Date().getMonth() + 1).padStart(2, '0')}-${Math.floor(10000 + Math.random() * 90000)}`;

  const intro = await IntroductionRequest.create({
    referenceNumber: refNumber,
    franchise: franchise._id,
    brandName: franchise.brandName,
    business: franchise.business,
    businessOwnerUser: franchise.ownerUser,
    investorUser: investor.user?._id || investor.user,
    investorProfile: investor._id,
    initiatedBy: 'admin',
    status: 'ADMIN_REVIEW',
    targetCity: investor.city || franchise.expansionLocations?.[0] || 'Pan-India',
    investmentBudget: investor.investmentBudgetMax || franchise.totalInvestmentMin,
    availableLiquidCapital: investor.liquidCapital || 0,
    initialMessage: initialMessage || 'FranchiseBridge Administrative Desk recommended strategic expansion match.',
    isRecommendedByAdmin: true,
    adminDispatchedAt: new Date(),
    history: [
      {
        status: 'ADMIN_REVIEW',
        changedBy: req.user!._id,
        changedByRole: req.user!.role,
        note: `Match facilitated by platform admin desk. Ref: ${refNumber}`,
        timestamp: new Date(),
      },
    ],
  });

  await AuditLog.create({
    actor: req.user!._id,
    actorRole: req.user!.role,
    actorEmail: req.user!.email,
    action: 'ADMIN_MATCHMAKING_RECOMMENDED',
    entityType: 'IntroductionRequest',
    entityId: intro._id.toString(),
    details: {
      referenceNumber: refNumber,
      franchiseId: franchise._id,
      brandName: franchise.brandName,
      investorProfileId: investor._id,
    },
  });

  // Notify both parties
  await NotificationService.createNotification({
    recipient: franchise.ownerUser,
    title: 'New Admin Recommended Expansion Match',
    message: `FranchiseBridge administrators recommended an investor match for ${franchise.brandName} in ${intro.targetCity}.`,
    type: 'introduction_request',
    actionUrl: '/dashboard/business',
  });

  await NotificationService.createNotification({
    recipient: investor.user?._id || investor.user,
    title: 'Curated Franchise Opportunity Recommendation',
    message: `Platform administrators recommended ${franchise.brandName} matching your investment parameters in ${intro.targetCity}.`,
    type: 'introduction_request',
    actionUrl: '/dashboard/investor',
  });

  return sendSuccess(res, intro, 'Administrative introduction recommendation dispatched successfully', 201);
}

// ----------------------------------------------------------------------------
// 7. Introduction Request Mediation Desk
// ----------------------------------------------------------------------------
export async function getAdminIntroductions(req: Request, res: Response): Promise<any> {
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 15;
  const status = req.query.status as string;

  const filter: any = {};
  if (status && status !== 'All') filter.status = status;

  const total = await IntroductionRequest.countDocuments(filter);
  const introductions = await IntroductionRequest.find(filter)
    .populate('franchise', 'brandName logoUrl industry slug')
    .populate('businessOwnerUser', 'fullName email phone')
    .populate('investorUser', 'fullName email phone')
    .populate('assignedBroker', 'fullName email phone')
    .populate('dealRoom', 'roomName stage completionPercentage')
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(limit);

  return sendSuccess(res, introductions, 'Introductions retrieved', 200, {
    page,
    limit,
    total,
    totalPages: Math.ceil(total / limit),
  });
}

export async function mediateIntroduction(req: Request, res: Response): Promise<any> {
  const { id } = req.params;
  const { action, notes, brokerId } = req.body;

  const intro = await IntroductionRequest.findById(id);
  if (!intro) {
    return sendError(res, 'Introduction request not found', 404);
  }

  const previousStatus = intro.status;

  if (action === 'assign_broker' && brokerId) {
    intro.assignedBroker = brokerId;
    intro.history.push({
      status: intro.status,
      changedBy: req.user!._id,
      changedByRole: req.user!.role,
      note: `Mediation broker assigned: ${brokerId}. ${notes || ''}`,
      timestamp: new Date(),
    });
  } else if (action === 'cancel') {
    intro.status = 'CANCELLED';
    intro.history.push({
      status: 'CANCELLED',
      changedBy: req.user!._id,
      changedByRole: req.user!.role,
      note: notes || 'Introduction cancelled by administrative mediation desk.',
      timestamp: new Date(),
    });
  } else if (action === 'approve_mediation') {
    intro.history.push({
      status: intro.status,
      changedBy: req.user!._id,
      changedByRole: req.user!.role,
      note: notes || 'Administrative mediation approved. Consent invitations dispatched.',
      timestamp: new Date(),
    });
  }

  await intro.save();

  await AuditLog.create({
    actor: req.user!._id,
    actorRole: req.user!.role,
    actorEmail: req.user!.email,
    action: 'INTRODUCTION_MEDIATION_UPDATED',
    entityType: 'IntroductionRequest',
    entityId: intro._id.toString(),
    details: { action, previousStatus, newStatus: intro.status, brokerId, notes },
  });

  return sendSuccess(res, intro, 'Introduction mediation updated successfully');
}

// ----------------------------------------------------------------------------
// 8. Broker Assignment & Mediation Workflow
// ----------------------------------------------------------------------------
export async function getBrokers(req: Request, res: Response): Promise<any> {
  const brokers = await User.find({ role: 'broker', status: 'active' })
    .select('fullName email phone role status createdAt')
    .sort({ fullName: 1 });

  return sendSuccess(res, brokers);
}

export async function assignBroker(req: Request, res: Response): Promise<any> {
  const { entityType, entityId, brokerId, note } = req.body;

  if (!entityType || !entityId || !brokerId) {
    return sendError(res, 'entityType, entityId, and brokerId are required.', 400);
  }

  const broker = await User.findOne({ _id: brokerId, role: 'broker' });
  if (!broker) {
    return sendError(res, 'Authorized broker not found.', 404);
  }

  let entityTitle = '';

  if (entityType === 'introduction') {
    const intro = await IntroductionRequest.findById(entityId);
    if (!intro) return sendError(res, 'Introduction request not found', 404);
    intro.assignedBroker = broker._id;
    intro.history.push({
      status: intro.status,
      changedBy: req.user!._id,
      changedByRole: req.user!.role,
      note: `Assigned to broker ${broker.fullName}. ${note || ''}`,
      timestamp: new Date(),
    });
    await intro.save();
    entityTitle = `Introduction ${intro.referenceNumber}`;
  } else if (entityType === 'deal_room') {
    const room = await DealRoom.findById(entityId);
    if (!room) return sendError(res, 'Deal room not found', 404);
    room.assignedBroker = broker._id;
    room.broker = broker._id;
    await room.save();
    entityTitle = `Deal Room: ${room.roomName}`;
  } else if (entityType === 'deal') {
    const deal = await BrokerageDeal.findById(entityId);
    if (!deal) return sendError(res, 'Deal not found', 404);
    deal.assignedBroker = broker._id;
    await deal.save();
    entityTitle = `Deal: ${deal.dealTitle}`;
  } else if (entityType === 'lead') {
    const lead = await Lead.findById(entityId);
    if (!lead) return sendError(res, 'Lead not found', 404);
    lead.assignedBroker = broker._id;
    await lead.save();
    entityTitle = `Lead: ${lead.fullName}`;
  } else {
    return sendError(res, `Unsupported entityType: ${entityType}`, 400);
  }

  // Notify Broker
  await NotificationService.createNotification({
    recipient: broker._id,
    title: 'New Brokerage Assignment',
    message: `You have been assigned to mediate ${entityTitle}. ${note || ''}`,
    type: 'lead_assigned',
    actionUrl: '/dashboard/brokerage',
  });

  await AuditLog.create({
    actor: req.user!._id,
    actorRole: req.user!.role,
    actorEmail: req.user!.email,
    action: 'BROKER_ASSIGNED',
    entityType,
    entityId,
    details: {
      brokerId: broker._id,
      brokerName: broker.fullName,
      brokerEmail: broker.email,
      note,
    },
  });

  return sendSuccess(res, { entityType, entityId, brokerId, brokerName: broker.fullName }, 'Broker assigned successfully');
}

// ----------------------------------------------------------------------------
// 9. Deal Room Oversight & Audit Snapshot
// ----------------------------------------------------------------------------
export async function getAdminDealRooms(req: Request, res: Response): Promise<any> {
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 15;
  const stage = req.query.stage as string;

  const filter: any = {};
  if (stage && stage !== 'All') filter.stage = stage;

  const total = await DealRoom.countDocuments(filter);
  const rooms = await DealRoom.find(filter)
    .populate('franchiseListing', 'brandName logoUrl industry slug')
    .populate('franchisor', 'fullName email phone')
    .populate('investor', 'fullName email phone')
    .populate('assignedBroker', 'fullName email phone')
    .populate('dueDiligenceChecklist', 'overallStatus completionPercentage')
    .sort({ updatedAt: -1 })
    .skip((page - 1) * limit)
    .limit(limit);

  return sendSuccess(res, rooms, 'Deal rooms retrieved', 200, {
    page,
    limit,
    total,
    totalPages: Math.ceil(total / limit),
  });
}

export async function getAdminDealRoomAudit(req: Request, res: Response): Promise<any> {
  const { id } = req.params;

  const room = await DealRoom.findById(id)
    .populate('franchiseListing')
    .populate('franchisor', 'fullName email phone role')
    .populate('investor', 'fullName email phone role')
    .populate('assignedBroker', 'fullName email phone role')
    .populate('dueDiligenceChecklist');

  if (!room) {
    return sendError(res, 'Deal room not found', 404);
  }

  const checklist: any = room.dueDiligenceChecklist;

  const auditLogs = await AuditLog.find({
    $or: [{ entityId: room._id.toString() }, { 'details.dealRoomId': room._id.toString() }],
  })
    .populate('actor', 'fullName email role')
    .sort({ createdAt: -1 })
    .limit(20);

  return sendSuccess(res, {
    dealRoom: room,
    checklistSummary: checklist
      ? {
          overallStatus: checklist.overallStatus,
          completionPercentage: checklist.completionPercentage,
          totalPillars: checklist.items?.length || 0,
          approvedCount: checklist.items?.filter((i: any) => i.status === 'APPROVED' || i.status === 'verified').length || 0,
          items: checklist.items,
        }
      : null,
    auditHistory: auditLogs,
  });
}

// ----------------------------------------------------------------------------
// 10. Complaints & Support Request Management
// ----------------------------------------------------------------------------
export async function getAdminEnquiries(req: Request, res: Response): Promise<any> {
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 15;
  const status = req.query.status as string;
  const interestType = req.query.interestType as string;

  const filter: any = {};
  if (status && status !== 'All') filter.status = status;
  if (interestType && interestType !== 'All') filter.interestType = interestType;

  const total = await ContactEnquiry.countDocuments(filter);
  const enquiries = await ContactEnquiry.find(filter)
    .populate('handledBy', 'fullName email')
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(limit);

  return sendSuccess(res, enquiries, 'Support enquiries retrieved', 200, {
    page,
    limit,
    total,
    totalPages: Math.ceil(total / limit),
  });
}

export async function updateAdminEnquiry(req: Request, res: Response): Promise<any> {
  const { id } = req.params;
  const { status, internalNotes } = req.body;

  const enquiry = await ContactEnquiry.findById(id);
  if (!enquiry) {
    return sendError(res, 'Enquiry not found', 404);
  }

  if (status) enquiry.status = status;
  if (internalNotes !== undefined) enquiry.internalNotes = internalNotes;
  enquiry.handledBy = req.user!._id;
  await enquiry.save();

  await AuditLog.create({
    actor: req.user!._id,
    actorRole: req.user!.role,
    actorEmail: req.user!.email,
    action: 'SUPPORT_ENQUIRY_UPDATED',
    entityType: 'ContactEnquiry',
    entityId: enquiry._id.toString(),
    details: { newStatus: status, internalNotes },
  });

  return sendSuccess(res, enquiry, 'Enquiry status updated successfully');
}

// ----------------------------------------------------------------------------
// 11. Genuine Platform Analytics Engine
// ----------------------------------------------------------------------------
export async function getPlatformAnalytics(req: Request, res: Response): Promise<any> {
  const [
    usersByRole,
    listingsByIndustry,
    listingsByModel,
    dealRoomsByStage,
    introFunnel,
    activeDeals,
  ] = await Promise.all([
    User.aggregate([{ $group: { _id: '$role', count: { $sum: 1 } } }]),
    FranchiseListing.aggregate([
      { $match: { status: { $in: ['published', 'PUBLISHED'] } } },
      { $group: { _id: '$industry', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]),
    FranchiseListing.aggregate([
      { $match: { status: { $in: ['published', 'PUBLISHED'] } } },
      { $group: { _id: '$businessModel', count: { $sum: 1 } } },
    ]),
    DealRoom.aggregate([{ $group: { _id: '$stage', count: { $sum: 1 } } }]),
    IntroductionRequest.aggregate([{ $group: { _id: '$status', count: { $sum: 1 } } }]),
    BrokerageDeal.find({ stage: { $nin: ['deal_closed', 'lost_cancelled'] } }),
  ]);

  const totalGrossPipeline = activeDeals.reduce((sum, d) => sum + (d.dealValue || 0), 0);
  const totalProjectedCommissions = activeDeals.reduce((sum, d) => sum + (d.expectedCommission || 0), 0);

  return sendSuccess(res, {
    usersByRole: usersByRole.reduce((acc: any, item: any) => {
      acc[item._id] = item.count;
      return acc;
    }, {}),
    listingsByIndustry,
    listingsByModel,
    dealRoomsByStage,
    introductionConversionFunnel: introFunnel.reduce((acc: any, item: any) => {
      acc[item._id] = item.count;
      return acc;
    }, {}),
    financialMetrics: {
      totalGrossPipeline,
      totalProjectedCommissions,
      activeDealsCount: activeDeals.length,
    },
  });
}

// ----------------------------------------------------------------------------
// 12. CRM Leads & Brokerage Deals
// ----------------------------------------------------------------------------
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

// ----------------------------------------------------------------------------
// 13. Audit Logs & Platform Settings
// ----------------------------------------------------------------------------
export async function getAuditLogs(req: Request, res: Response): Promise<any> {
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 20;
  const action = req.query.action as string;
  const entityType = req.query.entityType as string;
  const actorRole = req.query.actorRole as string;

  const filter: any = {};
  if (action && action !== 'All') filter.action = action;
  if (entityType && entityType !== 'All') filter.entityType = entityType;
  if (actorRole && actorRole !== 'All') filter.actorRole = actorRole;

  const total = await AuditLog.countDocuments(filter);
  const logs = await AuditLog.find(filter)
    .populate('actor', 'fullName email role')
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
