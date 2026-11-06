import { Router } from 'express';
import {
  getFranchises,
  getFranchiseBySlug,
  getMyFranchises,
  createFranchiseListing,
  updateFranchiseListing,
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
router.post(
  '/',
  requireAuth,
  requireRole('business_owner', 'admin', 'super_admin'),
  validate(createFranchiseListingSchema),
  createFranchiseListing
);
router.patch(
  '/:id',
  requireAuth,
  requireRole('business_owner', 'admin', 'super_admin'),
  validate(updateFranchiseListingSchema),
  updateFranchiseListing
);
router.post('/:id/save', requireAuth, toggleSaveFranchise);

export default router;
