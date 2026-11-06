import { Request, Response } from 'express';
import { FranchiseListing } from '../models/FranchiseListing';
import { BusinessProfile } from '../models/BusinessProfile';
import { SavedFranchise } from '../models/SavedFranchise';
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

  const filter: any = { status: 'published' };

  if (search) {
    filter.$or = [
      { brandName: { $regex: search, $options: 'i' } },
      { summary: { $regex: search, $options: 'i' } },
      { tagline: { $regex: search, $options: 'i' } },
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
    filter.expansionLocations = { $regex: location, $options: 'i' };
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
    .populate('business', 'businessName logoUrl headquarters numberOfOutlets')
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
    'businessName founderName headquarters numberOfOutlets establishedYear category logoUrl'
  );

  if (!listing) {
    return sendError(res, 'Franchise listing not found', 404);
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
  const listings = await FranchiseListing.find({ ownerUser: req.user!._id }).sort({
    createdAt: -1,
  });
  return sendSuccess(res, listings);
}

export async function createFranchiseListing(req: Request, res: Response): Promise<any> {
  const business = await BusinessProfile.findOne({ user: req.user!._id });
  if (!business) {
    return sendError(res, 'Please create your business profile before submitting a franchise listing', 400);
  }

  const slug = generateSlug(req.body.brandName);
  const listing = await FranchiseListing.create({
    ...req.body,
    business: business._id,
    ownerUser: req.user!._id,
    slug,
    status: 'pending_approval',
  });

  await AuditLog.create({
    actor: req.user!._id,
    actorRole: req.user!.role,
    actorEmail: req.user!.email,
    action: 'FRANCHISE_LISTING_SUBMITTED',
    entityType: 'FranchiseListing',
    entityId: listing._id.toString(),
  });

  return sendSuccess(res, listing, 'Franchise listing submitted for broker approval', 201);
}

export async function updateFranchiseListing(req: Request, res: Response): Promise<any> {
  const { id } = req.params;
  const listing = await FranchiseListing.findOne({
    _id: id,
    ...(req.user!.role !== 'admin' && req.user!.role !== 'super_admin' ? { ownerUser: req.user!._id } : {}),
  });

  if (!listing) {
    return sendError(res, 'Franchise listing not found or unauthorized', 404);
  }

  Object.assign(listing, req.body);
  await listing.save();

  return sendSuccess(res, listing, 'Franchise listing updated successfully');
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
