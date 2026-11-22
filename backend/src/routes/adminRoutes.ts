import { Router } from 'express';
import {
  getDashboardMetrics,
  getUsers,
  updateUserRoleAndStatus,
  getAdminInvestors,
  updateInvestorVerification,
  getAdminBusinesses,
  updateBusinessStatus,
  getAdminFranchises,
  updateFranchiseListingStatus,
  getAdminMatchmaking,
  recommendAdminMatch,
  getAdminIntroductions,
  mediateIntroduction,
  getBrokers,
  assignBroker,
  getAdminDealRooms,
  getAdminDealRoomAudit,
  getAdminEnquiries,
  updateAdminEnquiry,
  getPlatformAnalytics,
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
import {
  createLeadSchema,
  updateLeadSchema,
  createDealSchema,
  updateDealSchema,
} from '../validators/crmValidators';

const router = Router();

// Base authorization: All admin endpoints require authenticated admin or super_admin
router.use(requireAuth, requireAdmin);

// 1. Dashboard Metrics & Platform Analytics
router.get('/dashboard', getDashboardMetrics);
router.get('/analytics', getPlatformAnalytics);

// 2. User Accounts Management (Role and status modifications restricted to Super Admin)
router.get('/users', getUsers);
router.patch('/users/:id', requireSuperAdmin, updateUserRoleAndStatus);

// 3. Investor Identity & Accreditation Verification
router.get('/investors', getAdminInvestors);
router.patch('/investors/:id/verify', updateInvestorVerification);

// 4. Franchisor Business Profiles & KYC Verification
router.get('/businesses', getAdminBusinesses);
router.patch('/businesses/:id/status', updateBusinessStatus);

// 5. Franchise Opportunities Review & Approvals
router.get('/franchises', getAdminFranchises);
router.patch('/franchises/:id/status', updateFranchiseListingStatus);

// 6. Matchmaking Desk & Cross-Criteria Recommendations
router.get('/matchmaking', getAdminMatchmaking);
router.post('/matchmaking/recommend', recommendAdminMatch);

// 7. Introduction Requests & Mediation Desk
router.get('/introductions', getAdminIntroductions);
router.patch('/introductions/:id/mediate', mediateIntroduction);

// 8. Broker Management & Entity Assignment
router.get('/brokers', getBrokers);
router.post('/assign-broker', assignBroker);

// 9. Deal Room Monitoring & Compliance Audit Snapshot
router.get('/deal-rooms', getAdminDealRooms);
router.get('/deal-rooms/:id/audit', getAdminDealRoomAudit);

// 10. Complaints & Support Request Management
router.get('/enquiries', getAdminEnquiries);
router.patch('/enquiries/:id', updateAdminEnquiry);

// 11. CRM Leads
router.get('/leads', getLeads);
router.post('/leads', validate(createLeadSchema), createLead);
router.patch('/leads/:id', validate(updateLeadSchema), updateLead);

// 12. Brokerage Deals Pipeline
router.get('/deals', getDeals);
router.post('/deals', validate(createDealSchema), createDeal);
router.patch('/deals/:id', validate(updateDealSchema), updateDeal);

// 13. Audit Trail & Platform Settings (Settings modification restricted to Super Admin)
router.get('/audit-logs', getAuditLogs);
router.get('/settings', getPlatformSettings);
router.patch('/settings', requireSuperAdmin, updatePlatformSettings);

export default router;
