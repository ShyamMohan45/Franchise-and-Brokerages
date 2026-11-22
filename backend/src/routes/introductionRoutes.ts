import { Router } from 'express';
import {
  createIntroductionRequest,
  respondToIntroduction,
  createDealRoomFromIntroduction,
  getMyIntroductions,
  getIntroductionById,
  getAdminIntroductions,
  mediateIntroduction,
} from '../controllers/introductionController';
import { requireAuth } from '../middleware/auth';
import { requireRole } from '../middleware/rbac';

const router = Router();

// User introduction endpoints
router.post('/', requireAuth, createIntroductionRequest);
router.get('/my', requireAuth, getMyIntroductions);
router.get('/:id', requireAuth, getIntroductionById);
router.post('/:id/respond', requireAuth, respondToIntroduction);
router.post('/:id/deal-room', requireAuth, createDealRoomFromIntroduction);

// Admin & Broker Mediation Desk
router.get(
  '/admin/all',
  requireAuth,
  requireRole('admin', 'super_admin', 'broker'),
  getAdminIntroductions
);
router.patch(
  '/admin/:id/mediate',
  requireAuth,
  requireRole('admin', 'super_admin', 'broker'),
  mediateIntroduction
);

export default router;
