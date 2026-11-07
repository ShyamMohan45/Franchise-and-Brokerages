import { Router } from 'express';
import {
  getListingReviews,
  createReview,
  moderateReview,
  voteReviewHelpful,
} from '../controllers/reviewController';
import { requireAuth, optionalAuth } from '../middleware/auth';
import { requireRole } from '../middleware/rbac';

const router = Router();

// Public: View approved reviews for a franchise listing
router.get('/listing/:listingId', optionalAuth, getListingReviews);

// Protected: Submit review
router.post('/', requireAuth, createReview);

// Protected: Vote helpful
router.post('/:id/helpful', optionalAuth, voteReviewHelpful);

// Protected: Moderate review (Admin only)
router.patch('/:id/moderate', requireAuth, requireRole('admin', 'super_admin'), moderateReview);

export default router;
