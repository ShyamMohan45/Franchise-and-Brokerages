import { Router } from 'express';
import {
  submitApplication,
  getMyApplications,
  getBusinessApplications,
  getApplicationById,
  updateApplicationStatus,
} from '../controllers/applicationController';
import { requireAuth } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { createApplicationSchema, updateApplicationStatusSchema } from '../validators/applicationValidators';

const router = Router();

router.post('/', requireAuth, validate(createApplicationSchema), submitApplication);
router.get('/my', requireAuth, getMyApplications);
router.get('/business', requireAuth, getBusinessApplications);
router.get('/:id', requireAuth, getApplicationById);
router.patch('/:id/status', requireAuth, validate(updateApplicationStatusSchema), updateApplicationStatus);

export default router;
