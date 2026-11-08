import { Router } from 'express';
import {
  getInvestorProfile,
  updateInvestorProfile,
  getRecommendations,
} from '../controllers/investorController';
import { requireAuth } from '../middleware/auth';
import { requireRole } from '../middleware/rbac';
import { validate } from '../middleware/validate';
import { updateInvestorProfileSchema } from '../validators/investorValidators';

const router = Router();

router.get('/profile', requireAuth, requireRole('investor', 'admin', 'super_admin'), getInvestorProfile);
router.patch('/profile', requireAuth, requireRole('investor', 'admin', 'super_admin'), validate(updateInvestorProfileSchema), updateInvestorProfile);
router.post('/profile', requireAuth, requireRole('investor', 'admin', 'super_admin'), validate(updateInvestorProfileSchema), updateInvestorProfile);
router.get('/recommendations', requireAuth, requireRole('investor', 'admin', 'super_admin'), getRecommendations);

export default router;

