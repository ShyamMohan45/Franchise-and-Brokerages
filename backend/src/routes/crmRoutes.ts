import { Router } from 'express';
import {
  getPipelineDeals,
  getDealById,
  createCrmDeal,
  updateDealStage,
  getCrmMetrics,
} from '../controllers/crmController';
import { getLeads, createLead, updateLead } from '../controllers/adminController';
import { requireAuth } from '../middleware/auth';
import { requireRole } from '../middleware/rbac';
import { validate } from '../middleware/validate';
import { createLeadSchema, updateLeadSchema, createDealSchema, updateDealSchema } from '../validators/crmValidators';

const router = Router();

router.use(requireAuth, requireRole('broker', 'admin', 'super_admin'));

// CRM Metrics & Overview
router.get('/metrics', getCrmMetrics);
router.get('/pipeline', getPipelineDeals);

// Deals
router.get('/deals/:id', getDealById);
router.post('/deals', validate(createDealSchema), createCrmDeal);
router.patch('/deals/:id', validate(updateDealSchema), updateDealStage);

// Leads
router.get('/leads', getLeads);
router.post('/leads', validate(createLeadSchema), createLead);
router.patch('/leads/:id', validate(updateLeadSchema), updateLead);

export default router;
