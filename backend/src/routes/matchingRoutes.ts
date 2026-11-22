import { Router } from 'express';
import {
  getSmartMatchesForInvestor,
  getSmartMatchesForFranchisor,
} from '../controllers/matchingEngineController';
import { requireAuth } from '../middleware/auth';
import { requireRole } from '../middleware/rbac';

const router = Router();

// Investor-side matching: discover compatible franchise listings
router.get('/investor', requireAuth, getSmartMatchesForInvestor);

// Franchisor-side matching: discover compatible anonymized investors
router.get(
  '/franchisor',
  requireAuth,
  requireRole('business_owner', 'brand_owner', 'admin', 'super_admin', 'broker'),
  getSmartMatchesForFranchisor
);

export default router;
