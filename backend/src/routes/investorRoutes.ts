import { Router } from 'express';
import {
  getInvestorProfile,
  updateInvestorProfile,
  getRecommendations,
} from '../controllers/investorController';
import { requireAuth } from '../middleware/auth';

const router = Router();

router.get('/profile', requireAuth, getInvestorProfile);
router.patch('/profile', requireAuth, updateInvestorProfile);
router.get('/recommendations', requireAuth, getRecommendations);

export default router;
