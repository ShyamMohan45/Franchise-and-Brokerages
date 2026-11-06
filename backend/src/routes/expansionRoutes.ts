import { Router } from 'express';
import {
  getMyOutlets,
  createOutlet,
  updateOutlet,
  deleteOutlet,
  getMyExpansionPlan,
  updateExpansionPlan,
  updateMilestone,
} from '../controllers/expansionController';
import { protect } from '../middleware/auth';

const router = Router();

// Outlets
router.get('/outlets', protect, getMyOutlets);
router.post('/outlets', protect, createOutlet);
router.put('/outlets/:id', protect, updateOutlet);
router.delete('/outlets/:id', protect, deleteOutlet);

// Expansion Plans
router.get('/plan', protect, getMyExpansionPlan);
router.put('/plan', protect, updateExpansionPlan);
router.put('/milestone', protect, updateMilestone);

export default router;
