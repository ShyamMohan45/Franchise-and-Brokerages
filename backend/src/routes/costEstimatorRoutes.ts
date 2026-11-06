import { Router } from 'express';
import {
  calculateCost,
  saveCostEstimate,
  getSavedEstimates,
} from '../controllers/costEstimatorController';
import { protect, optionalAuth } from '../middleware/auth';

const router = Router();

router.post('/calculate', optionalAuth, calculateCost);
router.post('/save', protect, saveCostEstimate);
router.get('/saved', protect, getSavedEstimates);

export default router;
