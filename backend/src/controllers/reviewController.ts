import { Request, Response } from 'express';
import { Review } from '../models/Review';
import { FranchiseListing } from '../models/FranchiseListing';
import { AuditLog } from '../models/AuditLog';
import { sendSuccess, sendError } from '../utils/response';

export async function getListingReviews(req: Request, res: Response): Promise<any> {
  const { listingId } = req.params;

  const reviews = await Review.find({
    franchiseListing: listingId,
    status: 'approved',
  })
    .populate('reviewerUser', 'fullName avatarUrl')
    .sort({ createdAt: -1 });

  const totalReviews = reviews.length;
  const averageRating =
    totalReviews > 0
      ? reviews.reduce((sum, r) => sum + r.rating, 0) / totalReviews
      : 0;

  return sendSuccess(res, {
    reviews,
    totalReviews,
    averageRating: Math.round(averageRating * 10) / 10,
  });
}

export async function createReview(req: Request, res: Response): Promise<any> {
  const user = req.user!;
  const { franchiseListingId, rating, title, reviewText, storeLocation, isVerifiedFranchisee } = req.body;

  if (!franchiseListingId || !rating || !title || !reviewText) {
    return sendError(res, 'franchiseListingId, rating, title, and reviewText are required', 400);
  }

  const listing = await FranchiseListing.findById(franchiseListingId);
  if (!listing) {
    return sendError(res, 'Franchise listing not found', 404);
  }

  const existingReview = await Review.findOne({
    reviewerUser: user._id,
    franchiseListing: franchiseListingId,
  });

  if (existingReview) {
    return sendError(res, 'You have already submitted a review for this franchise listing', 409);
  }

  const review = await Review.create({
    franchiseListing: franchiseListingId,
    reviewerUser: user._id,
    rating: Number(rating),
    title,
    reviewText,
    storeLocation,
    isVerifiedFranchisee: !!isVerifiedFranchisee,
    status: 'approved',
  });

  await AuditLog.create({
    actor: user._id,
    actorRole: user.role,
    actorEmail: user.email,
    action: 'REVIEW_CREATED',
    entityType: 'Review',
    entityId: review._id.toString(),
  });

  return sendSuccess(res, review, 'Review submitted successfully', 201);
}

export async function moderateReview(req: Request, res: Response): Promise<any> {
  const { id } = req.params;
  const { status, adminFeedback } = req.body;
  const user = req.user!;

  const review = await Review.findById(id);
  if (!review) {
    return sendError(res, 'Review not found', 404);
  }

  if (status) review.status = status;
  if (adminFeedback !== undefined) review.adminFeedback = adminFeedback;

  await review.save();

  await AuditLog.create({
    actor: user._id,
    actorRole: user.role,
    actorEmail: user.email,
    action: 'REVIEW_MODERATED',
    entityType: 'Review',
    entityId: review._id.toString(),
    details: { status, adminFeedback },
  });

  return sendSuccess(res, review, 'Review moderation updated');
}

export async function voteReviewHelpful(req: Request, res: Response): Promise<any> {
  const { id } = req.params;

  const review = await Review.findByIdAndUpdate(
    id,
    { $inc: { helpfulVotes: 1 } },
    { new: true }
  );

  if (!review) {
    return sendError(res, 'Review not found', 404);
  }

  return sendSuccess(res, { helpfulVotes: review.helpfulVotes }, 'Voted helpful');
}
