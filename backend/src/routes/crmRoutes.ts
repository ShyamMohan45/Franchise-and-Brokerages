import { Router } from 'express';
import {
  getPipelineDeals,
  getDealById,
  createCrmDeal,
  convertLeadToDeal,
  updateDealStage,
  logDealActivity,
  getLeads,
  getLeadById,
  createLead,
  updateLead,
  assignLeadBroker,
  qualifyInvestorLead,
  logLeadActivity,
  getCrmTasks,
  getCrmMeetings,
  scheduleCrmMeeting,
  updateCrmMeetingStatus,
  getCrmMetrics,
} from '../controllers/crmController';
import { requireAuth } from '../middleware/auth';
import { requireRole } from '../middleware/rbac';
import { validate } from '../middleware/validate';
import {
  createLeadSchema,
  updateLeadSchema,
  assignLeadSchema,
  qualifyInvestorSchema,
  createDealSchema,
  updateDealStageSchema,
  createActivitySchema,
  scheduleCrmMeetingSchema,
} from '../validators/crmValidators';

const router = Router();

router.use(requireAuth, requireRole('broker', 'admin', 'super_admin'));

// CRM Metrics & Overview
router.get('/metrics', getCrmMetrics);
router.get('/pipeline', getPipelineDeals);

// Deals
router.get('/deals/:id', getDealById);
router.post('/deals', validate(createDealSchema), createCrmDeal);
router.patch('/deals/:id/stage', validate(updateDealStageSchema), updateDealStage);
router.patch('/deals/:id', validate(updateDealStageSchema), updateDealStage);
router.post('/deals/:id/activities', validate(createActivitySchema), logDealActivity);

// Leads
router.get('/leads', getLeads);
router.get('/leads/:id', getLeadById);
router.post('/leads', validate(createLeadSchema), createLead);
router.patch('/leads/:id', validate(updateLeadSchema), updateLead);
router.post('/leads/:id/assign', validate(assignLeadSchema), assignLeadBroker);
router.post('/leads/:id/qualify', validate(qualifyInvestorSchema), qualifyInvestorLead);
router.post('/leads/:id/convert-to-deal', convertLeadToDeal);
router.post('/leads/:id/activities', validate(createActivitySchema), logLeadActivity);

// Tasks & Follow-ups
router.get('/tasks', getCrmTasks);

// Meetings
router.get('/meetings', getCrmMeetings);
router.post('/meetings', validate(scheduleCrmMeetingSchema), scheduleCrmMeeting);
router.patch('/meetings/:id/status', updateCrmMeetingStatus);

export default router;
