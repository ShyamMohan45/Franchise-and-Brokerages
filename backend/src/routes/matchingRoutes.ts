import { Router } from 'express';
import { getSmartMatchesForInvestor } from '../controllers/matchingEngineController';
import { protect } from '../middleware/auth';

const router = Router();

router.get('/investor', protect, getSmartMatchesForInvestor);

export default router;
