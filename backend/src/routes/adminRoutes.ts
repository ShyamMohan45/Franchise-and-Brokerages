import { Router } from 'express';
import {
  getDashboardMetrics,
  getUsers,
  updateUserRoleAndStatus,
  getAdminBusinesses,
  updateBusinessStatus,
  updateFranchiseListingStatus,
  getLeads,
  createLead,
  updateLead,
  getDeals,
  createDeal,
  updateDeal,
  getAuditLogs,
  getPlatformSettings,
  updatePlatformSettings,
} from '../controllers/adminController';
import { requireAuth } from '../middleware/auth';
import { requireAdmin, requireSuperAdmin } from '../middleware/rbac';
import { validate } from '../middleware/validate';
import { createLeadSchema, updateLeadSchema, createDealSchema, updateDealSchema } from '../validators/crmValidators';

const router = Router();

router.use(requireAuth, requireAdmin);

router.get('/dashboard', getDashboardMetrics);
router.get('/users', getUsers);
router.patch('/users/:id', requireSuperAdmin, updateUserRoleAndStatus);

router.get('/businesses', getAdminBusinesses);
router.patch('/businesses/:id/status', updateBusinessStatus);
router.patch('/franchises/:id/status', updateFranchiseListingStatus);

// CRM Leads
router.get('/leads', getLeads);
router.post('/leads', validate(createLeadSchema), createLead);
router.patch('/leads/:id', validate(updateLeadSchema), updateLead);

// Brokerage Deals
router.get('/deals', getDeals);
router.post('/deals', validate(createDealSchema), createDeal);
router.patch('/deals/:id', validate(updateDealSchema), updateDeal);

// Audit & Settings
router.get('/audit-logs', getAuditLogs);
router.get('/settings', getPlatformSettings);
router.patch('/settings', requireSuperAdmin, updatePlatformSettings);

export default router;
