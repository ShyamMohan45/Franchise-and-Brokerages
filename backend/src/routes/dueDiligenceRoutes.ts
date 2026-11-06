import { Router } from 'express';
import {
  getDueDiligenceChecklist,
  updateDueDiligenceItem,
} from '../controllers/dueDiligenceController';
import { protect } from '../middleware/auth';

const router = Router();

router.get('/:franchiseId', protect, getDueDiligenceChecklist);
router.put('/:checklistId/items/:itemId', protect, updateDueDiligenceItem);

export default router;
