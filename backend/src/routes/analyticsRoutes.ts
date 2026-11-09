import { Router } from 'express';
import {
  getBusinessAnalytics,
  exportDealsCsv,
  exportCommissionsCsv,
} from '../controllers/analyticsController';
import { requireAuth } from '../middleware/auth';

const router = Router();

router.use(requireAuth);

router.get('/dashboard', getBusinessAnalytics);
router.get('/reports/deals/csv', exportDealsCsv);
router.get('/reports/commissions/csv', exportCommissionsCsv);
router.get('/deals/csv', exportDealsCsv);
router.get('/commissions/csv', exportCommissionsCsv);

export default router;
