import { Request, Response } from 'express';
import { FranchiseListing } from '../models/FranchiseListing';
import { BusinessProfile } from '../models/BusinessProfile';
import { SavedFranchise } from '../models/SavedFranchise';
import { User } from '../models/User';
import { NotificationService } from '../services/notificationService';
import { sendSuccess, sendError } from '../utils/response';
import { AuditLog } from '../models/AuditLog';

function generateSlug(name: string): string {
  return (
    name
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '') +
    '-' +
    Math.random().toString(36).substring(2, 6)
  );
}

export async function getFranchises(req: Request, res: Response): Promise<any> {
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 9;
  const search = (req.query.search as string)?.trim();
  const industry = req.query.industry as string;
  const location = req.query.location as string;
  const modelType = req.query.modelType as string;
  const minInvestment = parseFloat(req.query.minInvestment as string);
  const maxInvestment = parseFloat(req.query.maxInvestment as string);
  const sort = (req.query.sort as string) || 'recent';

  // Only approved and published opportunities are visible in the public/investor marketplace
  const filter: any = { status: { $in: ['published', 'PUBLISHED'] } };

  if (search) {
    filter.$or = [
      { brandName: { $regex: search, $options: 'i' } },
      { summary: { $regex: search, $options: 'i' } },
      { tagline: { $regex: search, $options: 'i' } },
      { opportunityTitle: { $regex: search, $options: 'i' } },
      { industry: { $regex: search, $options: 'i' } },
    ];
  }

  if (industry && industry !== 'All') {
    filter.industry = industry;
  }

  if (modelType && modelType !== 'All') {
    filter.franchiseModelType = { $in: [modelType, 'both'] };
  }

  if (location && location !== 'All') {
    filter.$or = [
      { expansionLocations: { $regex: location, $options: 'i' } },
      { targetLocations: { $regex: location, $options: 'i' } },
    ];
  }

  if (!isNaN(minInvestment) || !isNaN(maxInvestment)) {
    filter.totalInvestmentMin = {};
    if (!isNaN(minInvestment)) filter.totalInvestmentMin.$gte = minInvestment;
    if (!isNaN(maxInvestment)) filter.totalInvestmentMin.$lte = maxInvestment;
  }

  let sortOption: any = { createdAt: -1 };
  if (sort === 'investment_asc') sortOption = { totalInvestmentMin: 1 };
  else if (sort === 'investment_desc') sortOption = { totalInvestmentMin: -1 };
  else if (sort === 'popular') sortOption = { viewsCount: -1 };

  const total = await FranchiseListing.countDocuments(filter);
  const listings = await FranchiseListing.find(filter)
    .populate('business', 'businessName logoUrl headquarters numberOfOutlets legalBusinessName')
    .sort(sortOption)
    .skip((page - 1) * limit)
    .limit(limit);

  return sendSuccess(res, listings, 'Franchises fetched successfully', 200, {
    page,
    limit,
    total,
    totalPages: Math.ceil(total / limit),
  });
}

export async function getFranchiseBySlug(req: Request, res: Response): Promise<any> {
  const { slug } = req.params;
  const listing = await FranchiseListing.findOne({ slug }).populate(
    'business',
    'businessName legalBusinessName founderName headquarters numberOfOutlets establishedYear category logoUrl'
  );

  if (!listing) {
    return sendError(res, 'Franchise listing not found', 404);
  }

  // If not published, only owner or admin can view
  const isOwner = req.user && listing.ownerUser.toString() === req.user._id.toString();
  const isAdmin = req.user && (req.user.role === 'admin' || req.user.role === 'super_admin');
  const isPublished = listing.status === 'published' || listing.status === 'PUBLISHED';

  if (!isPublished && !isOwner && !isAdmin) {
    return sendError(res, 'This franchise opportunity is currently under review or draft', 403);
  }

  // Increment view counter
  listing.viewsCount += 1;
  await listing.save();

  let isSaved = false;
  if (req.user) {
    const saved = await SavedFranchise.findOne({ user: req.user._id, franchise: listing._id });
    if (saved) isSaved = true;
  }

  return sendSuccess(res, { listing, isSaved });
}

export async function getMyFranchises(req: Request, res: Response): Promise<any> {
  const listings = await FranchiseListing.find({ ownerUser: req.user!._id })
    .populate('business', 'businessName legalBusinessName logoUrl')
    .sort({ createdAt: -1 });
  return sendSuccess(res, listings);
}

export async function createFranchiseListing(req: Request, res: Response): Promise<any> {
  let business = await BusinessProfile.findOne({ user: req.user!._id });
  if (!business) {
    // If brand owner hasn't created a formal business profile yet, create a baseline profile
    business = await BusinessProfile.create({
      user: req.user!._id,
      businessName: req.body.brandName || 'My Brand',
      legalBusinessName: req.body.legalBusinessName || req.body.brandName || 'My Brand Inc.',
      brandName: req.body.brandName || 'My Brand',
      slug: generateSlug(req.body.brandName || 'brand'),
      category: req.body.category || req.body.industry || 'General',
      founderName: req.user!.fullName || 'Founder',
      contactEmail: req.user!.email,
      contactPhone: req.user!.phone || '+91 99999 00000',
      establishedYear: new Date().getFullYear(),
      headquarters: { city: 'Mumbai', country: 'India' },
      numberOfOutlets: 1,
      description: req.body.summary || 'Brand company profile',
      businessModel: req.body.businessModel || 'FOCO',
      expansionGoals: 'National expansion',
      estimatedInvestmentMin: req.body.totalInvestmentMin || 1000000,
      estimatedInvestmentMax: req.body.totalInvestmentMax || 3000000,
      approvalStatus: 'DRAFT',
    });
  }

  const slug = generateSlug(req.body.opportunityTitle || req.body.brandName);
  const status = req.body.status || 'DRAFT';

  const listing = await FranchiseListing.create({
    ...req.body,
    opportunityTitle: req.body.opportunityTitle || req.body.tagline || `${req.body.brandName} Franchise Opportunity`,
    tagline: req.body.tagline || req.body.opportunityTitle || 'Premier Franchise Opportunity',
    business: business._id,
    ownerUser: req.user!._id,
    slug,
    status,
    totalInvestmentMinPaise: Math.round(Number(req.body.totalInvestmentMin || 0) * 100),
    totalInvestmentMaxPaise: Math.round(Number(req.body.totalInvestmentMax || 0) * 100),
    initialFranchiseFeePaise: Math.round(Number(req.body.initialFranchiseFee || 0) * 100),
    setupCostsPaise: Math.round(Number(req.body.setupCosts || 0) * 100),
    equipmentCostsPaise: Math.round(Number(req.body.equipmentCosts || 0) * 100),
    workingCapitalEstimatePaise: Math.round(Number(req.body.workingCapitalEstimate || 0) * 100),
  });

  if (status === 'SUBMITTED' || status === 'UNDER_REVIEW') {
    // Notify administrators
    const admins = await User.find({ role: { $in: ['admin', 'super_admin'] } });
    for (const adm of admins) {
      await NotificationService.createNotification({
        recipient: adm._id,
        title: 'New Franchise Opportunity Submitted',
        message: `Brand "${listing.brandName}" submitted a new opportunity "${listing.opportunityTitle || listing.tagline}" for review.`,
        type: 'document_review_requested',
        actionUrl: `/dashboard/admin`,
      });
    }
  }

  await AuditLog.create({
    actor: req.user!._id,
    actorRole: req.user!.role,
    actorEmail: req.user!.email,
    action: 'FRANCHISE_OPPORTUNITY_CREATED',
    entityType: 'FranchiseListing',
    entityId: listing._id.toString(),
    details: { status: listing.status, brandName: listing.brandName },
  });

  return sendSuccess(res, listing, 'Franchise opportunity created successfully', 201);
}

export async function updateFranchiseListing(req: Request, res: Response): Promise<any> {
  const { id } = req.params;
  const listing = await FranchiseListing.findById(id);

  if (!listing) {
    return sendError(res, 'Franchise opportunity not found', 404);
  }

  // Security Check: Only the owner or an administrator can modify this opportunity
  const isOwner = listing.ownerUser.toString() === req.user!._id.toString();
  const isAdmin = req.user!.role === 'admin' || req.user!.role === 'super_admin';

  if (!isOwner && !isAdmin) {
    return sendError(res, "Access denied. You cannot modify another brand's franchise opportunity.", 403);
  }

  // If brand owner tries to set status to PUBLISHED directly without admin approval, prevent it
  if (!isAdmin && req.body.status && (req.body.status === 'PUBLISHED' || req.body.status === 'published')) {
    if (listing.status !== 'APPROVED' && listing.status !== 'approved') {
      return sendError(res, 'Opportunities must be approved by an administrator before publishing.', 400);
    }
  }

  Object.assign(listing, req.body);
  await listing.save();

  await AuditLog.create({
    actor: req.user!._id,
    actorRole: req.user!.role,
    actorEmail: req.user!.email,
    action: 'FRANCHISE_OPPORTUNITY_UPDATED',
    entityType: 'FranchiseListing',
    entityId: listing._id.toString(),
  });

  return sendSuccess(res, listing, 'Franchise opportunity updated successfully');
}

export async function submitFranchiseOpportunity(req: Request, res: Response): Promise<any> {
  const { id } = req.params;
  const listing = await FranchiseListing.findById(id);

  if (!listing) {
    return sendError(res, 'Franchise opportunity not found', 404);
  }

  // Security Check: Only the owner can submit
  if (listing.ownerUser.toString() !== req.user!._id.toString() && req.user!.role !== 'admin') {
    return sendError(res, "Access denied. You cannot submit another brand's opportunity.", 403);
  }

  listing.status = 'SUBMITTED';
  await listing.save();

  // Notify admins
  const admins = await User.find({ role: { $in: ['admin', 'super_admin'] } });
  for (const adm of admins) {
    await NotificationService.createNotification({
      recipient: adm._id,
      title: 'Franchise Opportunity Awaiting Review',
      message: `"${listing.brandName}" submitted opportunity "${listing.opportunityTitle || listing.tagline}" for review.`,
      type: 'document_review_requested',
      actionUrl: `/dashboard/admin`,
    });
  }

  await AuditLog.create({
    actor: req.user!._id,
    actorRole: req.user!.role,
    actorEmail: req.user!.email,
    action: 'FRANCHISE_OPPORTUNITY_SUBMITTED',
    entityType: 'FranchiseListing',
    entityId: listing._id.toString(),
  });

  return sendSuccess(res, listing, 'Franchise opportunity submitted for review');
}

// Administrator Review Endpoint
export async function reviewFranchiseOpportunity(req: Request, res: Response): Promise<any> {
  const { id } = req.params;
  const { action, rejectionReason, correctionNotes, publishImmediately } = req.body;

  const listing = await FranchiseListing.findById(id);
  if (!listing) {
    return sendError(res, 'Franchise opportunity not found', 404);
  }

  listing.reviewedBy = req.user!._id;
  listing.reviewedAt = new Date();

  if (action === 'APPROVE') {
    listing.status = publishImmediately ? 'PUBLISHED' : 'APPROVED';
    listing.approvedBy = req.user!._id;
    if (publishImmediately) {
      listing.publishedAt = new Date();
    }
    listing.rejectionReason = undefined;

    await NotificationService.createNotification({
      recipient: listing.ownerUser,
      title: 'Franchise Opportunity Approved',
      message: `Congratulations! Your franchise opportunity "${listing.opportunityTitle || listing.tagline}" has been approved${publishImmediately ? ' and published to the investor marketplace' : ''}.`,
      type: 'document_approved',
      actionUrl: `/dashboard/business`,
    });
  } else if (action === 'REJECT') {
    listing.status = 'REJECTED';
    listing.rejectionReason = rejectionReason || 'Does not meet current platform criteria.';

    await NotificationService.createNotification({
      recipient: listing.ownerUser,
      title: 'Franchise Opportunity Review Notice',
      message: `Your franchise opportunity was not approved. Reason: ${listing.rejectionReason}`,
      type: 'application_status',
      actionUrl: `/dashboard/business`,
    });
  } else if (action === 'REQUEST_CORRECTIONS') {
    listing.status = 'UNDER_REVIEW';
    listing.correctionNotes = correctionNotes || 'Please update the requested details.';

    await NotificationService.createNotification({
      recipient: listing.ownerUser,
      title: 'Corrections Requested on Franchise Opportunity',
      message: `Admin review requested updates: ${listing.correctionNotes}`,
      type: 'application_status',
      actionUrl: `/dashboard/business`,
    });
  } else {
    return sendError(res, 'Invalid action. Must be APPROVE, REJECT, or REQUEST_CORRECTIONS', 400);
  }

  await listing.save();

  await AuditLog.create({
    actor: req.user!._id,
    actorRole: req.user!.role,
    actorEmail: req.user!.email,
    action: `FRANCHISE_OPPORTUNITY_${action}`,
    entityType: 'FranchiseListing',
    entityId: listing._id.toString(),
    details: { action, rejectionReason, correctionNotes, status: listing.status },
  });

  return sendSuccess(res, listing, `Opportunity review complete: ${listing.status}`);
}

export async function publishFranchiseOpportunity(req: Request, res: Response): Promise<any> {
  const { id } = req.params;
  const listing = await FranchiseListing.findById(id);

  if (!listing) {
    return sendError(res, 'Franchise opportunity not found', 404);
  }

  const isOwner = listing.ownerUser.toString() === req.user!._id.toString();
  const isAdmin = req.user!.role === 'admin' || req.user!.role === 'super_admin';

  if (!isOwner && !isAdmin) {
    return sendError(res, 'Unauthorized to publish this opportunity', 403);
  }

  const isApproved = listing.status === 'APPROVED' || listing.status === 'approved';
  if (!isApproved && !isAdmin) {
    return sendError(res, 'Opportunity must be approved by an administrator before it can be published.', 400);
  }

  listing.status = 'PUBLISHED';
  listing.publishedAt = new Date();
  await listing.save();

  await AuditLog.create({
    actor: req.user!._id,
    actorRole: req.user!.role,
    actorEmail: req.user!.email,
    action: 'FRANCHISE_OPPORTUNITY_PUBLISHED',
    entityType: 'FranchiseListing',
    entityId: listing._id.toString(),
  });

  return sendSuccess(res, listing, 'Opportunity published to investor marketplace successfully');
}

export async function toggleSaveFranchise(req: Request, res: Response): Promise<any> {
  const { id } = req.params;
  const existing = await SavedFranchise.findOne({ user: req.user!._id, franchise: id });

  if (existing) {
    await SavedFranchise.deleteOne({ _id: existing._id });
    return sendSuccess(res, { isSaved: false }, 'Franchise removed from saved list');
  } else {
    await SavedFranchise.create({ user: req.user!._id, franchise: id });
    return sendSuccess(res, { isSaved: true }, 'Franchise saved to your portfolio');
  }
}

export async function getSavedFranchises(req: Request, res: Response): Promise<any> {
  const saved = await SavedFranchise.find({ user: req.user!._id })
    .populate('franchise')
    .sort({ createdAt: -1 });

  return sendSuccess(res, saved);
}

