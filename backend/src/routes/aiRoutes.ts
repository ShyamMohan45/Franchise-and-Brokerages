import { Router } from 'express';
import { analyzeReadiness, chatAssistant, getReadinessHistory } from '../controllers/aiController';
import { protect } from '../middleware/auth';

const router = Router();

router.post('/readiness-analyze', protect, analyzeReadiness);
router.get('/readiness-history', protect, getReadinessHistory);
router.post('/chat', chatAssistant);

export default router;
