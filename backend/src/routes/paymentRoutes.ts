import { Router } from 'express';
import {
  createPaymentOrder,
  verifyPayment,
  handleWebhook,
  getSubscriptionPlans,
  getCurrentSubscription,
  cancelSubscription,
  applyFeaturedSlot,
  getUserPaymentHistory,
  getUserInvoices,
  getInvoiceById,
  getAdminRevenueDashboard,
  processAdminRefund,
  updateRevenueSettings,
} from '../controllers/paymentController';
import { requireAuth } from '../middleware/auth';
import { requireAdmin, requireSuperAdmin } from '../middleware/rbac';

const router = Router();

// ----------------------------------------------------------------------------
// Public / Webhook Endpoints
// ----------------------------------------------------------------------------
router.post('/webhook', handleWebhook);
router.get('/plans', getSubscriptionPlans);

// ----------------------------------------------------------------------------
// Authenticated Member Endpoints
// ----------------------------------------------------------------------------
router.use(requireAuth);

router.post(['/order', '/orders'], createPaymentOrder);
router.post('/verify', verifyPayment);

router.get(['/subscription/current', '/current'], getCurrentSubscription);
router.post(['/subscription/cancel', '/cancel'], cancelSubscription);

router.post('/featured/:id/apply-slot', applyFeaturedSlot);

router.get('/history', getUserPaymentHistory);
router.get('/invoices', getUserInvoices);
router.get('/invoices/:id', getInvoiceById);

// ----------------------------------------------------------------------------
// Administrative Revenue Desk
// ----------------------------------------------------------------------------
router.get('/admin/dashboard', requireAdmin, getAdminRevenueDashboard);
router.post('/admin/refund', requireAdmin, processAdminRefund);
router.patch('/admin/settings', requireSuperAdmin, updateRevenueSettings);

export default router;
