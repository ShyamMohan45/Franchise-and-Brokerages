import { Router } from 'express';
import {
  getFranchises,
  getFranchiseBySlug,
  getMyFranchises,
  createFranchiseListing,
  updateFranchiseListing,
  submitFranchiseOpportunity,
  reviewFranchiseOpportunity,
  publishFranchiseOpportunity,
  toggleSaveFranchise,
  getSavedFranchises,
} from '../controllers/franchiseController';
import { requireAuth, optionalAuth } from '../middleware/auth';
import { requireRole } from '../middleware/rbac';
import { validate } from '../middleware/validate';
import { createFranchiseListingSchema, updateFranchiseListingSchema } from '../validators/franchiseValidators';

const router = Router();

router.get('/', optionalAuth, getFranchises);
router.get('/my', requireAuth, getMyFranchises);
router.get('/saved', requireAuth, getSavedFranchises);
router.get('/:slug', optionalAuth, getFranchiseBySlug);

// Brand Owner / Franchisor Creation and Editing
router.post(
  '/',
  requireAuth,
  requireRole('business_owner', 'brand_owner', 'admin', 'super_admin'),
  validate(createFranchiseListingSchema),
  createFranchiseListing
);
router.patch(
  '/:id',
  requireAuth,
  requireRole('business_owner', 'brand_owner', 'admin', 'super_admin'),
  validate(updateFranchiseListingSchema),
  updateFranchiseListing
);

// Workflow: Submit opportunity for review
router.post(
  '/:id/submit',
  requireAuth,
  requireRole('business_owner', 'brand_owner', 'admin', 'super_admin'),
  submitFranchiseOpportunity
);

// Workflow: Admin review (Approve, Reject with reason, or Request corrections)
router.post(
  '/:id/review',
  requireAuth,
  requireRole('admin', 'super_admin'),
  reviewFranchiseOpportunity
);

// Workflow: Publish approved opportunity
router.post(
  '/:id/publish',
  requireAuth,
  requireRole('business_owner', 'brand_owner', 'admin', 'super_admin'),
  publishFranchiseOpportunity
);

router.post('/:id/save', requireAuth, toggleSaveFranchise);

export default router;
