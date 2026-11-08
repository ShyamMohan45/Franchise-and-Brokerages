import { Router } from 'express';
import {
  submitApplication,
  getMyApplications,
  getBusinessApplications,
  getBrokerApplications,
  getApplicationById,
  updateApplicationStatus,
  assignEnquiryBroker,
} from '../controllers/applicationController';
import { requireAuth } from '../middleware/auth';
import { requireRole } from '../middleware/rbac';
import { validate } from '../middleware/validate';
import { createApplicationSchema, updateApplicationStatusSchema } from '../validators/applicationValidators';

const router = Router();

router.post('/', requireAuth, validate(createApplicationSchema), submitApplication);
router.get('/my', requireAuth, getMyApplications);
router.get('/business', requireAuth, getBusinessApplications);
router.get('/broker', requireAuth, requireRole('broker', 'admin', 'super_admin'), getBrokerApplications);
router.get('/admin/all', requireAuth, requireRole('admin', 'super_admin', 'broker'), getBrokerApplications);
router.get('/:id', requireAuth, getApplicationById);
router.patch('/:id/status', requireAuth, validate(updateApplicationStatusSchema), updateApplicationStatus);
router.post('/:id/assign', requireAuth, requireRole('admin', 'super_admin', 'broker'), assignEnquiryBroker);

export default router;
