import { Router } from 'express';
import {
  getMyBusiness,
  createOrUpdateBusiness,
  submitReadinessAssessment,
  submitBusinessForReview,
} from '../controllers/businessController';
import { requireAuth } from '../middleware/auth';
import { requireRole } from '../middleware/rbac';
import { validate } from '../middleware/validate';
import { createBusinessProfileSchema, assessReadinessSchema } from '../validators/businessValidators';

const router = Router();

router.get('/my', requireAuth, getMyBusiness);
router.get('/profile', requireAuth, getMyBusiness);
router.post(
  '/',
  requireAuth,
  requireRole('business_owner', 'brand_owner', 'admin', 'super_admin'),
  validate(createBusinessProfileSchema),
  createOrUpdateBusiness
);
router.post(
  '/submit-review',
  requireAuth,
  requireRole('business_owner', 'brand_owner', 'admin', 'super_admin'),
  submitBusinessForReview
);
router.post(
  '/readiness',
  requireAuth,
  requireRole('business_owner', 'brand_owner', 'admin', 'super_admin'),
  validate(assessReadinessSchema),
  submitReadinessAssessment
);

export default router;
