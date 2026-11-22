import { Request, Response } from 'express';
import { Types } from 'mongoose';
import { env } from '../config/env';
import { PaymentService } from '../services/paymentService';
import { EntitlementService } from '../services/entitlementService';
import { PaymentTransaction } from '../models/PaymentTransaction';
import { Invoice } from '../models/Invoice';
import { Subscription } from '../models/Subscription';
import { FranchiseListing } from '../models/FranchiseListing';
import { PlatformSettings, DEFAULT_SUBSCRIPTION_PLANS, DEFAULT_FEATURED_PACKAGES } from '../models/PlatformSettings';
import { sendSuccess, sendError } from '../utils/response';
import { AuditLog } from '../models/AuditLog';

// ----------------------------------------------------------------------------
// 1. PAYMENT ORDERS & CHECKOUT
// ----------------------------------------------------------------------------

export async function createPaymentOrder(req: Request, res: Response): Promise<any> {
  const { purpose, planId, packageId, entityId, entityType, billingInterval, customAmountINR, metadata } = req.body;

  if (!purpose) {
    return sendError(res, 'Payment purpose is required.', 400);
  }

  // Pre-checkout entitlement validation
  if (purpose === 'subscription') {
    if (!planId) return sendError(res, 'Subscription planId is required.', 400);
  } else if (purpose === 'featured_listing') {
    if (!entityId) return sendError(res, 'Franchise listing ID (entityId) is required for featured placement.', 400);
    const listing = await FranchiseListing.findById(entityId);
    if (!listing) return sendError(res, 'Franchise listing not found.', 404);
    if (listing.ownerUser.toString() !== req.user!._id.toString() && req.user!.role !== 'admin' && req.user!.role !== 'super_admin') {
      return sendError(res, 'Unauthorized: You do not own this franchise listing.', 403);
    }
  }

  try {
    const orderData = await PaymentService.createOrder({
      userId: req.user!._id,
      purpose,
      entityType,
      entityId,
      planId,
      packageId,
      billingInterval,
      customAmountINR,
      idempotencyKey: req.headers['idempotency-key'] as string,
      metadata,
    });

    return sendSuccess(res, orderData, 'Payment order created successfully.', 201);
  } catch (err: any) {
    return sendError(res, err.message || 'Failed to create payment order.', 400);
  }
}

export async function verifyPayment(req: Request, res: Response): Promise<any> {
  const { transactionReference, gatewayOrderId, gatewayPaymentId, gatewaySignature, billingDetails } = req.body;

  if (!transactionReference || !gatewayOrderId || !gatewayPaymentId || !gatewaySignature) {
    return sendError(res, 'transactionReference, gatewayOrderId, gatewayPaymentId, and gatewaySignature are required.', 400);
  }

  const isValid = PaymentService.verifySignature(gatewayOrderId, gatewayPaymentId, gatewaySignature);
  if (!isValid) {
    return sendError(res, 'Payment signature verification failed. Untrusted response.', 400);
  }

  try {
    const result = await PaymentService.captureAndFulfill({
      transactionReference,
      gatewayPaymentId,
      gatewaySignature,
      billingDetails,
    });

    return sendSuccess(res, result, 'Payment verified and fulfilled successfully.', 200);
  } catch (err: any) {
    return sendError(res, err.message || 'Payment fulfillment failed.', 400);
  }
}

export async function handleWebhook(req: Request, res: Response): Promise<any> {
  const signature = req.headers['x-razorpay-signature'] as string;
  const rawBody = (req as any).rawBody || JSON.stringify(req.body);

  if (env.isProduction || env.RAZORPAY_WEBHOOK_SECRET) {
    if (!signature) {
      return sendError(res, 'Missing required X-Razorpay-Signature header.', 401);
    }
    const isValid = PaymentService.verifyWebhookSignature(rawBody, signature);
    if (!isValid) {
      return sendError(res, 'Invalid webhook signature.', 400);
    }
  } else if (signature) {
    const isValid = PaymentService.verifyWebhookSignature(rawBody, signature);
    if (!isValid) {
      return sendError(res, 'Invalid webhook signature.', 400);
    }
  }

  const { event, payload } = req.body;
  if (!event || !payload) {
    return sendError(res, 'Invalid webhook event format.', 400);
  }

  try {
    await PaymentService.handleWebhookEvent(event, payload);
    return res.status(200).json({ status: 'ok' });
  } catch (err: any) {
    console.error('[paymentController] Webhook processing error:', err.message);
    return res.status(500).json({ status: 'error', message: err.message });
  }
}

// ----------------------------------------------------------------------------
// 2. USER SUBSCRIPTIONS & ENTITLEMENTS
// ----------------------------------------------------------------------------

export async function getSubscriptionPlans(req: Request, res: Response): Promise<any> {
  const settings = await PlatformSettings.findOne();
  const plans = settings?.subscriptionPlans?.length ? settings.subscriptionPlans : DEFAULT_SUBSCRIPTION_PLANS;
  const featuredPackages = settings?.featuredListingPackages?.length
    ? settings.featuredListingPackages
    : DEFAULT_FEATURED_PACKAGES;

  return sendSuccess(res, { plans, featuredPackages }, 'Subscription plans and packages retrieved', 200);
}

export async function getCurrentSubscription(req: Request, res: Response): Promise<any> {
  const isInvestor = req.user!.role === 'investor';
  const sub = isInvestor
    ? await EntitlementService.getOrCreateInvestorSubscription(req.user!._id)
    : await EntitlementService.getOrCreateFranchisorSubscription(req.user!._id);

  if (!isInvestor) {
    await EntitlementService.refreshFranchisorUsage(req.user!._id);
  }

  return sendSuccess(res, sub, 'Current subscription retrieved', 200);
}

export async function cancelSubscription(req: Request, res: Response): Promise<any> {
  const sub = await Subscription.findOne({
    user: req.user!._id,
    status: 'active',
  });

  if (!sub) {
    return sendError(res, 'No active subscription found to cancel.', 404);
  }

  if (sub.planId === 'free') {
    return sendError(res, 'Cannot cancel default free tier.', 400);
  }

  sub.cancelAtPeriodEnd = true;
  sub.canceledAt = new Date();
  await sub.save();

  await AuditLog.create({
    actor: req.user!._id,
    actorRole: req.user!.role,
    actorEmail: req.user!.email,
    action: 'SUBSCRIPTION_CANCELED',
    entityType: 'Subscription',
    entityId: sub._id.toString(),
    details: {
      planId: sub.planId,
      expiresAt: sub.currentPeriodEnd,
    },
  });

  return sendSuccess(res, sub, 'Subscription will be canceled at the end of the billing period.', 200);
}

// ----------------------------------------------------------------------------
// 3. FEATURED LISTINGS
// ----------------------------------------------------------------------------

export async function applyFeaturedSlot(req: Request, res: Response): Promise<any> {
  const { id } = req.params; // franchise listing ID
  const listing = await FranchiseListing.findById(id);
  if (!listing) return sendError(res, 'Franchise listing not found', 404);

  if (listing.ownerUser.toString() !== req.user!._id.toString() && req.user!.role !== 'admin' && req.user!.role !== 'super_admin') {
    return sendError(res, 'Unauthorized: You do not own this listing', 403);
  }

  // Check subscription entitlement
  const check = await EntitlementService.canApplyFeaturedSlotFromSubscription(req.user!._id);
  if (!check.allowed) {
    return sendError(res, check.reason || 'No available featured slots in your subscription.', 403);
  }

  // Set featured for 30 days or billing period
  const sub = await EntitlementService.getOrCreateFranchisorSubscription(req.user!._id);
  listing.isFeatured = true;
  listing.featuredPackageId = 'subscription_slot';
  listing.featuredUntil = sub.currentPeriodEnd;
  listing.featuredApprovedBy = req.user!._id;
  await listing.save();

  await EntitlementService.refreshFranchisorUsage(req.user!._id);

  return sendSuccess(res, listing, 'Featured listing slot applied successfully from subscription.', 200);
}

// ----------------------------------------------------------------------------
// 4. USER PAYMENT HISTORY & INVOICES
// ----------------------------------------------------------------------------

export async function getUserPaymentHistory(req: Request, res: Response): Promise<any> {
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 10;

  const total = await PaymentTransaction.countDocuments({ user: req.user!._id });
  const transactions = await PaymentTransaction.find({ user: req.user!._id })
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(limit);

  return sendSuccess(res, transactions, 'Payment history retrieved', 200, {
    page,
    limit,
    total,
    totalPages: Math.ceil(total / limit),
  });
}

export async function getUserInvoices(req: Request, res: Response): Promise<any> {
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 10;

  const total = await Invoice.countDocuments({ user: req.user!._id });
  const invoices = await Invoice.find({ user: req.user!._id })
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(limit);

  return sendSuccess(res, invoices, 'Invoices retrieved', 200, {
    page,
    limit,
    total,
    totalPages: Math.ceil(total / limit),
  });
}

export async function getInvoiceById(req: Request, res: Response): Promise<any> {
  const { id } = req.params;
  const isObjectId = /^[0-9a-fA-F]{24}$/.test(id);
  const query = isObjectId ? { _id: id } : { invoiceNumber: id };

  const invoice = await Invoice.findOne(query);
  if (!invoice) return sendError(res, 'Invoice not found', 404);

  // Authorization: user owns invoice or is admin
  if (
    invoice.user.toString() !== req.user!._id.toString() &&
    req.user!.role !== 'admin' &&
    req.user!.role !== 'super_admin'
  ) {
    return sendError(res, 'Access denied', 403);
  }

  return sendSuccess(res, invoice, 'Invoice retrieved successfully', 200);
}

// ----------------------------------------------------------------------------
// 5. ADMIN REVENUE DASHBOARD & OPERATIONS
// ----------------------------------------------------------------------------

export async function getAdminRevenueDashboard(req: Request, res: Response): Promise<any> {
  const metrics = await PaymentService.getRevenueDashboardMetrics();
  return sendSuccess(res, metrics, 'Admin revenue metrics retrieved', 200);
}

export async function processAdminRefund(req: Request, res: Response): Promise<any> {
  const { transactionId, reason, amountINR } = req.body;

  if (!transactionId || !reason) {
    return sendError(res, 'transactionId and reason are required.', 400);
  }

  try {
    const transaction = await PaymentService.processRefund(
      transactionId,
      reason,
      req.user!._id,
      amountINR
    );
    return sendSuccess(res, transaction, 'Refund processed and recorded successfully.', 200);
  } catch (err: any) {
    return sendError(res, err.message || 'Refund processing failed.', 400);
  }
}

export async function updateRevenueSettings(req: Request, res: Response): Promise<any> {
  const { subscriptionPlans, featuredListingPackages, defaultCommissionRate, defaultGstRate } = req.body;

  let settings = await PlatformSettings.findOne();
  if (!settings) {
    settings = new PlatformSettings();
  }

  if (subscriptionPlans && Array.isArray(subscriptionPlans)) {
    settings.subscriptionPlans = subscriptionPlans;
  }
  if (featuredListingPackages && Array.isArray(featuredListingPackages)) {
    settings.featuredListingPackages = featuredListingPackages;
  }
  if (typeof defaultCommissionRate === 'number') {
    settings.defaultCommissionRate = defaultCommissionRate;
  }
  if (typeof defaultGstRate === 'number') {
    settings.defaultGstRate = defaultGstRate;
  }

  settings.updatedBy = req.user!._id;
  await settings.save();

  await AuditLog.create({
    actor: req.user!._id,
    actorRole: req.user!.role,
    actorEmail: req.user!.email,
    action: 'REVENUE_SETTINGS_UPDATED',
    entityType: 'PlatformSettings',
    entityId: settings._id.toString(),
    details: {
      defaultCommissionRate: settings.defaultCommissionRate,
      defaultGstRate: settings.defaultGstRate,
      plansCount: settings.subscriptionPlans.length,
      packagesCount: settings.featuredListingPackages.length,
    },
  });

  return sendSuccess(res, settings, 'Platform revenue settings updated successfully.', 200);
}
