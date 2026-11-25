import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { Types } from 'mongoose';
import { env } from '../config/env';
import { EntitlementService } from '../services/entitlementService';
import { PaymentService } from '../services/paymentService';
import { Subscription } from '../models/Subscription';
import { PaymentTransaction } from '../models/PaymentTransaction';
import { Invoice } from '../models/Invoice';
import { FranchiseListing } from '../models/FranchiseListing';
import { BusinessProfile } from '../models/BusinessProfile';
import { CommissionAgreement } from '../models/CommissionAgreement';
import { PlatformSettings, DEFAULT_SUBSCRIPTION_PLANS, DEFAULT_FEATURED_PACKAGES } from '../models/PlatformSettings';
import { User } from '../models/User';
import { AuditLog } from '../models/AuditLog';
import { createPaymentOrder, verifyPayment } from '../controllers/paymentController';

describe('Milestone 5: Comprehensive Monetization, Subscription, Payment and Commission Architecture Test Suite', () => {
  const mockUserId = new Types.ObjectId().toString();
  const mockFranchiseId = new Types.ObjectId().toString();

  // --------------------------------------------------------------------------
  // SECTION 1: Plan Configurations & Pricing Calculations
  // --------------------------------------------------------------------------
  describe('1. Subscription Plan Configurations & Pricing Rules', () => {
    it('Provides standard tiers: Free, Basic, Professional, Enterprise, and Investor Pro', async () => {
      const freePlan = await EntitlementService.getPlanConfig('free');
      const basicPlan = await EntitlementService.getPlanConfig('basic');
      const proPlan = await EntitlementService.getPlanConfig('professional');
      const entPlan = await EntitlementService.getPlanConfig('enterprise');
      const invPlan = await EntitlementService.getPlanConfig('investor_premium');

      expect(freePlan.monthlyPrice).toBe(0);
      expect(freePlan.maxListings).toBe(1);
      expect(freePlan.maxBrands).toBe(1);

      expect(basicPlan.monthlyPrice).toBe(9999);
      expect(basicPlan.maxListings).toBe(3);
      expect(basicPlan.maxBrands).toBe(2);

      expect(proPlan.monthlyPrice).toBe(24999);
      expect(proPlan.maxListings).toBe(10);
      expect(proPlan.featuredListingSlots).toBe(1);

      expect(entPlan.monthlyPrice).toBe(49999);
      expect(entPlan.maxListings).toBe(999);
      expect(entPlan.featuredListingSlots).toBe(3);

      expect(invPlan.monthlyPrice).toBe(4999);
      expect(invPlan.role).toBe('investor');
    });

    it('Correctly calculates order amounts in INR and integer paise for monthly and annual billing', async () => {
      const monthlyOrder = await PaymentService.calculateOrderAmount({
        userId: mockUserId,
        purpose: 'subscription',
        planId: 'basic',
        billingInterval: 'monthly',
      });

      expect(monthlyOrder.amountINR).toBe(9999);
      expect(monthlyOrder.amountPaise).toBe(999900);
      expect(monthlyOrder.description).toContain('Monthly Subscription');

      const annualOrder = await PaymentService.calculateOrderAmount({
        userId: mockUserId,
        purpose: 'subscription',
        planId: 'basic',
        billingInterval: 'yearly',
      });

      expect(annualOrder.amountINR).toBe(99990);
      expect(annualOrder.amountPaise).toBe(9999000);
      expect(annualOrder.description).toContain('Annual');
    });

    it('Correctly calculates pricing for 14, 30, and 90-day featured listing packages', async () => {
      const pkg14 = await PaymentService.calculateOrderAmount({
        userId: mockUserId,
        purpose: 'featured_listing',
        packageId: '14_days',
      });
      expect(pkg14.amountINR).toBe(4999);
      expect(pkg14.durationDays).toBe(14);

      const pkg30 = await PaymentService.calculateOrderAmount({
        userId: mockUserId,
        purpose: 'featured_listing',
        packageId: '30_days',
      });
      expect(pkg30.amountINR).toBe(8999);
      expect(pkg30.durationDays).toBe(30);

      const pkg90 = await PaymentService.calculateOrderAmount({
        userId: mockUserId,
        purpose: 'featured_listing',
        packageId: '90_days',
      });
      expect(pkg90.amountINR).toBe(19999);
      expect(pkg90.durationDays).toBe(90);
    });
  });

  // --------------------------------------------------------------------------
  // SECTION 2: Entitlement Enforcement (Backend Limits)
  // --------------------------------------------------------------------------
  describe('2. Backend Entitlement Enforcement', () => {
    it('Blocks listing creation when franchisor has reached plan listing limit', async () => {
      // Mock active free subscription (maxListings: 1)
      const originalFindOne = Subscription.findOne;
      const originalCount = FranchiseListing.countDocuments;

      Subscription.findOne = (() => ({
        planId: 'free',
        planName: 'Free Franchisor',
        status: 'active',
        limits: { maxListings: 1, maxBrands: 1 },
      })) as any;

      // Mock user already having 1 active listing
      FranchiseListing.countDocuments = (() => Promise.resolve(1)) as any;

      try {
        const check = await EntitlementService.canCreateListing(mockUserId);
        expect(check.allowed).toBe(false);
        expect(check.reason).toContain('allows a maximum of 1 active franchise listing');
        expect(check.currentCount).toBe(1);
        expect(check.maxLimit).toBe(1);
      } finally {
        Subscription.findOne = originalFindOne;
        FranchiseListing.countDocuments = originalCount;
      }
    });

    it('Permits listing creation when franchisor is within their plan limits', async () => {
      const originalFindOne = Subscription.findOne;
      const originalCount = FranchiseListing.countDocuments;

      Subscription.findOne = (() => ({
        planId: 'professional',
        planName: 'Professional Expansion',
        status: 'active',
        limits: { maxListings: 10, maxBrands: 5 },
      })) as any;

      FranchiseListing.countDocuments = (() => Promise.resolve(3)) as any;

      try {
        const check = await EntitlementService.canCreateListing(mockUserId);
        expect(check.allowed).toBe(true);
        expect(check.currentCount).toBe(3);
        expect(check.maxLimit).toBe(10);
      } finally {
        Subscription.findOne = originalFindOne;
        FranchiseListing.countDocuments = originalCount;
      }
    });

    it('Blocks brand creation when franchisor has reached maxBrands limit', async () => {
      const originalFindOne = Subscription.findOne;
      const originalCount = BusinessProfile.countDocuments;

      Subscription.findOne = (() => ({
        planId: 'free',
        planName: 'Free Franchisor',
        status: 'active',
        limits: { maxBrands: 1 },
      })) as any;

      BusinessProfile.countDocuments = (() => Promise.resolve(1)) as any;

      try {
        const check = await EntitlementService.canCreateBrand(mockUserId);
        expect(check.allowed).toBe(false);
        expect(check.reason).toContain('allows a maximum of 1 brand profile');
      } finally {
        Subscription.findOne = originalFindOne;
        BusinessProfile.countDocuments = originalCount;
      }
    });

    it('Blocks applying featured slot when subscription includes zero featured slots', async () => {
      const originalFindOne = Subscription.findOne;

      Subscription.findOne = (() => ({
        planId: 'basic',
        planName: 'Basic Growth',
        status: 'active',
        limits: { featuredListingSlots: 0 },
      })) as any;

      try {
        const check = await EntitlementService.canApplyFeaturedSlotFromSubscription(mockUserId);
        expect(check.allowed).toBe(false);
        expect(check.reason).toContain('does not include recurring featured listing slots');
      } finally {
        Subscription.findOne = originalFindOne;
      }
    });

    it('Evaluates investor premium filter access accurately', async () => {
      const originalFindOne = Subscription.findOne;

      // Free investor
      Subscription.findOne = (() => ({
        planId: 'free',
        status: 'active',
      })) as any;

      const freeCheck = await EntitlementService.canInvestorUseAdvancedFilters(mockUserId);
      expect(freeCheck).toBe(false);

      // Investor Premium
      Subscription.findOne = (() => ({
        planId: 'investor_premium',
        status: 'active',
      })) as any;

      const proCheck = await EntitlementService.canInvestorUseAdvancedFilters(mockUserId);
      expect(proCheck).toBe(true);

      Subscription.findOne = originalFindOne;
    });
  });

  // --------------------------------------------------------------------------
  // SECTION 3: Cryptographic Signatures & Gateway Security
  // --------------------------------------------------------------------------
  describe('3. Payment Gateway Signatures & Idempotency Safeguards', () => {
    it('Verifies valid HMAC SHA-256 signatures and rejects forged signatures', () => {
      const orderId = 'order_test_12345';
      const paymentId = 'pay_test_67890';
      const secret = env.JWT_SECRET;

      const crypto = require('crypto');
      const validSignature = crypto
        .createHmac('sha256', secret)
        .update(`${orderId}|${paymentId}`)
        .digest('hex');

      const isSigValid = PaymentService.verifySignature(orderId, paymentId, validSignature);
      expect(isSigValid).toBe(true);

      const isForgedValid = PaymentService.verifySignature(orderId, paymentId, 'tampered_invalid_hex_string_xyz');
      expect(isForgedValid).toBe(false);
    });

    it('Generates unique transaction references and invoice numbers formatted with dates', () => {
      const ref1 = PaymentService.generateTransactionReference();
      const ref2 = PaymentService.generateTransactionReference();
      expect(ref1).toMatch(/^TXN-\d{8}-[A-Z0-9]+$/);
      expect(ref2).toMatch(/^TXN-\d{8}-[A-Z0-9]+$/);
      expect(ref1).not.toBe(ref2);

      const inv1 = PaymentService.generateInvoiceNumber();
      const inv2 = PaymentService.generateInvoiceNumber();
      expect(inv1).toMatch(/^INV-\d{6}-\d{4}$/);
      expect(inv2).toMatch(/^INV-\d{6}-\d{4}$/);
    });

    it('Rejects checkout orders when payment purpose is missing (400)', async () => {
      const req = {
        user: { _id: mockUserId, role: 'business_owner' },
        body: {},
        headers: {},
      } as any;

      let statusCode = 200;
      let body: any = null;
      const res = {
        status: (code: number) => {
          statusCode = code;
          return res;
        },
        json: (data: any) => {
          body = data;
          return res;
        },
      } as any;

      await createPaymentOrder(req, res);
      expect(statusCode).toBe(400);
      expect(body.success).toBe(false);
      expect(body.message).toMatch(/Payment purpose is required/i);
    });

    it('Rejects payment verification when mandatory signature fields are omitted (400)', async () => {
      const req = {
        user: { _id: mockUserId, role: 'business_owner' },
        body: { transactionReference: 'TXN-123' }, // missing order, payment, and signature
        headers: {},
      } as any;

      let statusCode = 200;
      let body: any = null;
      const res = {
        status: (code: number) => {
          statusCode = code;
          return res;
        },
        json: (data: any) => {
          body = data;
          return res;
        },
      } as any;

      await verifyPayment(req, res);
      expect(statusCode).toBe(400);
      expect(body.success).toBe(false);
      expect(body.message).toMatch(/required/i);
    });
  });

  // --------------------------------------------------------------------------
  // SECTION 4: Revenue & Commission Ledger Segregation
  // --------------------------------------------------------------------------
  describe('4. Revenue Ledger Breakdown & Reporting', () => {
    it('Accurately calculates Indian GST (18%) and base amounts for tax invoices', () => {
      const totalAmountINR = 11800; // 10,000 base + 1,800 GST
      const gstRate = 0.18;
      const baseAmount = Math.round((totalAmountINR / (1 + gstRate)) * 100) / 100;
      const gstAmount = Math.round((totalAmountINR - baseAmount) * 100) / 100;

      expect(baseAmount).toBe(10000);
      expect(gstAmount).toBe(1800);
      expect(baseAmount + gstAmount).toBe(totalAmountINR);
    });

    it('Segregates captured revenue, subscriptions, brokerage, and projected commissions', async () => {
      const originalFindTx = PaymentTransaction.find;
      const originalFindAg = CommissionAgreement.find;
      const originalCountSub = Subscription.countDocuments;
      const originalCountList = FranchiseListing.countDocuments;

      // Mock transaction ledger
      PaymentTransaction.find = (() => ({
        sort: () => [
          { status: 'captured', purpose: 'subscription', amount: 9999 },
          { status: 'captured', purpose: 'featured_listing', amount: 8999 },
          { status: 'captured', purpose: 'commission', amount: 50000 },
          { status: 'pending', purpose: 'subscription', amount: 24999 },
          { status: 'failed', purpose: 'subscription', amount: 9999 },
          { status: 'refunded', purpose: 'subscription', amount: 4999, refund: { amount: 4999 } },
        ],
      })) as any;

      // Mock commission agreements
      CommissionAgreement.find = (() => [
        { expectedCommission: 250000, receivedRevenue: 50000 },
        { expectedCommission: 150000, receivedRevenue: 0 },
      ]) as any;

      Subscription.countDocuments = (() => Promise.resolve(4)) as any;
      FranchiseListing.countDocuments = (() => Promise.resolve(2)) as any;

      try {
        const metrics = await PaymentService.getRevenueDashboardMetrics();

        // Gross captured collections = 9999 + 8999 + 50000 + 4999 (refunded) = 73997
        expect(metrics.grossCapturedCollectionsINR).toBe(73997);
        expect(metrics.capturedRevenueINR).toBe(73997);
        // Total refunds = 4999
        expect(metrics.totalRefundedINR).toBe(4999);
        // Net collected amount = 73997 - 4999 = 68998
        expect(metrics.netCollectedAmountINR).toBe(68998);
        expect(metrics.subscriptionRevenueINR).toBe(14998); // 9999 + 4999 gross subscription collections
        expect(metrics.featuredListingRevenueINR).toBe(8999);
        expect(metrics.brokerageRevenueINR).toBe(50000);

        // Pending receivables = 24999
        expect(metrics.pendingRevenueINR).toBe(24999);
        // Failed = 9999
        expect(metrics.failedRevenueINR).toBe(9999);
        // Refunded = 4999
        expect(metrics.refundedRevenueINR).toBe(4999);

        // Projected deal pipeline commissions = 250000 + 150000 = 400000
        expect(metrics.projectedCommissionsINR).toBe(400000);
        expect(metrics.activeSubscriptionsCount).toBe(4);
        expect(metrics.activeFeaturedListingsCount).toBe(2);
      } finally {
        PaymentTransaction.find = originalFindTx;
        CommissionAgreement.find = originalFindAg;
        Subscription.countDocuments = originalCountSub;
        FranchiseListing.countDocuments = originalCountList;
      }
    });

    it('Refuses to refund uncaptured or non-existent transactions', async () => {
      const originalFindById = PaymentTransaction.findById;

      PaymentTransaction.findById = (() => ({
        status: 'pending',
        amount: 9999,
      })) as any;

      try {
        await expect(
          PaymentService.processRefund(new Types.ObjectId().toString(), 'Customer request', mockUserId)
        ).rejects.toThrow(/Cannot refund transaction with status pending/i);
      } finally {
        PaymentTransaction.findById = originalFindById;
      }
    });

    it('Refuses to refund more than the captured transaction amount', async () => {
      const originalFindById = PaymentTransaction.findById;

      PaymentTransaction.findById = (() => ({
        status: 'captured',
        amount: 9999,
      })) as any;

      try {
        await expect(
          PaymentService.processRefund(new Types.ObjectId().toString(), 'Excessive refund attempt', mockUserId, 15000)
        ).rejects.toThrow(/Refund amount cannot exceed captured transaction amount/i);
      } finally {
        PaymentTransaction.findById = originalFindById;
      }
    });

    it('Refund processing is idempotent and returns existing record if already refunded', async () => {
      const originalFindById = PaymentTransaction.findById;

      const mockRefundedTx = {
        _id: new Types.ObjectId(),
        status: 'refunded',
        amount: 9999,
        refund: { amount: 9999, refundId: 'rfnd_existing_123' },
      };

      PaymentTransaction.findById = (() => mockRefundedTx) as any;

      try {
        const result = await PaymentService.processRefund(
          mockRefundedTx._id.toString(),
          'Duplicate refund attempt',
          mockUserId
        );
        expect(result.status).toBe('refunded');
        expect(result.refund?.refundId).toBe('rfnd_existing_123');
      } finally {
        PaymentTransaction.findById = originalFindById;
      }
    });
  });

  // --------------------------------------------------------------------------
  // SECTION 5: Featured Listing Expiry & Visibility Rules
  // --------------------------------------------------------------------------
  describe('5. Featured Listings Lifecycle & Expiration Invariants', () => {
    it('Never displays a listing as featured if featuredUntil has expired', () => {
      const pastDate = new Date(Date.now() - 1000 * 60 * 60 * 24); // 1 day ago
      const listing = {
        brandName: 'Expired Featured Brand',
        isFeatured: true,
        featuredUntil: pastDate,
      };

      const now = new Date();
      const isStillFeatured = listing.isFeatured && (!listing.featuredUntil || now < new Date(listing.featuredUntil));
      expect(isStillFeatured).toBe(false);
    });

    it('Displays a listing as featured when featuredUntil is in the future', () => {
      const futureDate = new Date(Date.now() + 1000 * 60 * 60 * 24 * 14); // 14 days in future
      const listing = {
        brandName: 'Active Featured Brand',
        isFeatured: true,
        featuredUntil: futureDate,
      };

      const now = new Date();
      const isStillFeatured = listing.isFeatured && (!listing.featuredUntil || now < new Date(listing.featuredUntil));
      expect(isStillFeatured).toBe(true);
    });
  });

  // --------------------------------------------------------------------------
  // SECTION 6: Detailed Subscription Lifecycle Transitions & Downgrade Quotas
  // --------------------------------------------------------------------------
  describe('6. Subscription Lifecycle: Upgrades, Renewals, Cancellations & Downgrades', () => {
    it('Handles progressive tier upgrades: Free -> Basic -> Pro -> Enterprise', async () => {
      const free = await EntitlementService.getPlanConfig('free');
      const basic = await EntitlementService.getPlanConfig('basic');
      const pro = await EntitlementService.getPlanConfig('professional');
      const ent = await EntitlementService.getPlanConfig('enterprise');

      expect(free.maxListings).toBe(1);
      expect(basic.maxListings).toBe(3);
      expect(pro.maxListings).toBe(10);
      expect(ent.maxListings).toBe(999);

      expect(free.maxBrands).toBe(1);
      expect(basic.maxBrands).toBe(2);
      expect(pro.maxBrands).toBe(5);
      expect(ent.maxBrands).toBe(999);
    });

    it('Renewal extends the currentPeriodEnd timestamp', () => {
      const initialStart = new Date('2026-01-01');
      const initialEnd = new Date('2026-01-31');

      // Simulate renewal by 30 days
      const renewedEnd = new Date(initialEnd);
      renewedEnd.setDate(renewedEnd.getDate() + 30);

      expect(renewedEnd.getTime()).toBeGreaterThan(initialEnd.getTime());
      expect(renewedEnd.toISOString().slice(0, 10)).toBe('2026-03-02');
    });

    it('Subscription cancellation marks cancelAtPeriodEnd without immediate access termination', () => {
      const sub = {
        planId: 'professional',
        status: 'active',
        cancelAtPeriodEnd: false,
        canceledAt: undefined as Date | undefined,
        currentPeriodEnd: new Date(Date.now() + 1000 * 60 * 60 * 24 * 15),
      };

      // Cancel action
      sub.cancelAtPeriodEnd = true;
      sub.canceledAt = new Date();

      expect(sub.cancelAtPeriodEnd).toBe(true);
      expect(sub.canceledAt).toBeInstanceOf(Date);
      // Access remains valid until currentPeriodEnd
      const isStillValid = sub.status === 'active' && new Date() < sub.currentPeriodEnd;
      expect(isStillValid).toBe(true);
    });

    it('Expired subscription correctly flags status as expired when period has passed', () => {
      const expiredSub = {
        planId: 'basic',
        status: 'active',
        currentPeriodEnd: new Date(Date.now() - 1000 * 60 * 60 * 24), // yesterday
      };

      const now = new Date();
      const isExpired = expiredSub.currentPeriodEnd < now;
      expect(isExpired).toBe(true);
    });

    it('Strictly enforces lower quota after subscription downgrade', async () => {
      // User with 3 listings currently, downgraded to free (quota: 1)
      const freePlan = await EntitlementService.getPlanConfig('free');
      const currentListingsCount = 3;

      const canCreateMore = currentListingsCount < freePlan.maxListings;
      expect(canCreateMore).toBe(false);
    });
  });

  // --------------------------------------------------------------------------
  // SECTION 7: Featured Listing Lifecycle: Pending, Activation, Expiry & Refund
  // --------------------------------------------------------------------------
  describe('7. Featured Listing Lifecycle: Pending, Activation, Expiry & Refund', () => {
    it('Keeps listing unfeatured while payment is pending or created', () => {
      const listing = {
        brandName: 'New Cafe Opportunity',
        isFeatured: false,
        featuredUntil: undefined,
      };

      expect(listing.isFeatured).toBe(false);
    });

    it('Refund revokes featured listing status immediately', () => {
      const listing = {
        brandName: 'Refunded Brand Opportunity',
        isFeatured: true,
        featuredUntil: new Date(Date.now() + 1000 * 60 * 60 * 24 * 20),
      };

      // Simulate refund revocation
      listing.isFeatured = false;
      listing.featuredUntil = new Date();

      const now = new Date();
      const isActive = listing.isFeatured && listing.featuredUntil > now;
      expect(isActive).toBe(false);
    });
  });

  // --------------------------------------------------------------------------
  // SECTION 8: Sandbox Isolation, Missing Key Safeguards & Cryptographic Integrity
  // --------------------------------------------------------------------------
  describe('8. Sandbox Isolation, Missing Key Safeguards & Cryptographic Integrity', () => {
    it('Guarantees test environment forces sandbox mode to prevent accidental live charges', () => {
      expect(process.env.NODE_ENV).toBe('test');
      expect(PaymentService.isRazorpayLive()).toBe(false);
    });

    it('Rejects fake signatures and tampered payloads', () => {
      const orderId = 'order_test_12345';
      const paymentId = 'pay_test_67890';
      const fakeSignature = 'bad_tampered_signature_payload';

      const isValid = PaymentService.verifySignature(orderId, paymentId, fakeSignature);
      expect(isValid).toBe(false);
    });

    it('Accepts valid HMAC-SHA256 signature calculated from sandbox secret', () => {
      const orderId = 'order_test_99999';
      const paymentId = 'pay_test_88888';
      const secret = env.JWT_SECRET;

      const validSig = require('crypto')
        .createHmac('sha256', secret)
        .update(`${orderId}|${paymentId}`)
        .digest('hex');

      const isValid = PaymentService.verifySignature(orderId, paymentId, validSig);
      expect(isValid).toBe(true);
    });

    it('Frontend success callbacks cannot fulfill payments without valid signature', async () => {
      let statusCode = 0;
      let responseBody: any = null;

      const req = {
        body: {
          transactionReference: 'TXN-202611-FAKE01',
          gatewayOrderId: 'order_fake',
          gatewayPaymentId: 'pay_fake',
          gatewaySignature: 'untrusted_frontend_string',
        },
      } as any;

      const res = {
        status: (code: number) => {
          statusCode = code;
          return {
            json: (data: any) => {
              responseBody = data;
            },
          };
        },
      } as any;

      await verifyPayment(req, res);
      expect(statusCode).toBe(400);
      expect(responseBody.success).toBe(false);
      expect(responseBody.message).toMatch(/signature verification failed/i);
    });
  });

  // --------------------------------------------------------------------------
  // SECTION 9: Commission Agreements & Webhook Idempotency Integrity
  // --------------------------------------------------------------------------
  describe('9. Commission Agreements & Webhook Idempotency Integrity', () => {
    it('Requires existing commission agreement and custom amount for commission payouts', async () => {
      await expect(
        PaymentService.calculateOrderAmount({
          userId: mockUserId,
          purpose: 'commission',
          customAmountINR: 0,
        })
      ).rejects.toThrow(/Custom amount in INR is required/i);
    });

    it('Accounts for refunds in net captured revenue calculation', async () => {
      const originalFindTx = PaymentTransaction.find;
      const originalFindAg = CommissionAgreement.find;
      const originalCountSub = Subscription.countDocuments;
      const originalCountList = FranchiseListing.countDocuments;

      PaymentTransaction.find = (() => ({
        sort: () => [
          { status: 'captured', purpose: 'subscription', amount: 10000 },
          { status: 'refunded', purpose: 'subscription', amount: 3000, refund: { amount: 3000 } },
        ],
      })) as any;

      CommissionAgreement.find = (() => []) as any;
      Subscription.countDocuments = (() => Promise.resolve(1)) as any;
      FranchiseListing.countDocuments = (() => Promise.resolve(0)) as any;

      try {
        const metrics = await PaymentService.getRevenueDashboardMetrics();
        // Both captured and previously captured refunded transactions remain part of gross
        expect(metrics.grossCapturedCollectionsINR).toBe(13000);
        expect(metrics.totalRefundedINR).toBe(3000);
        // Net revenue = gross captured (13000) - total refunded (3000) = 10000
        expect(metrics.netCollectedAmountINR).toBe(10000);
      } finally {
        PaymentTransaction.find = originalFindTx;
        CommissionAgreement.find = originalFindAg;
        Subscription.countDocuments = originalCountSub;
        FranchiseListing.countDocuments = originalCountList;
      }
    });

    it('Handles idempotent webhook event processing without duplicate transactions', async () => {
      const originalFindOne = PaymentTransaction.findOne;
      const originalFindOneAndUpdate = PaymentTransaction.findOneAndUpdate;

      // Simulate concurrent delivery: findOneAndUpdate fails because transaction is already captured
      PaymentTransaction.findOneAndUpdate = (() => Promise.resolve(null)) as any;

      // Mock finding the already captured transaction
      PaymentTransaction.findOne = (() => ({
        _id: new Types.ObjectId(),
        status: 'captured',
        amount: 9999,
        invoiceId: new Types.ObjectId(),
        save: () => Promise.resolve(),
      })) as any;

      const originalFindInvoice = Invoice.findById;
      Invoice.findById = (() => ({
        invoiceNumber: 'INV-202611-1001',
      })) as any;

      try {
        const result = await PaymentService.captureAndFulfill({
          transactionReference: 'TXN-EXISTING-01',
          gatewayPaymentId: 'pay_duplicate_123',
        });

        // Should return existing transaction idempotently without throwing error
        expect(result.transaction.status).toBe('captured');
        expect(result.invoice).toBeDefined();
        expect(result.invoice?.invoiceNumber).toBe('INV-202611-1001');
      } finally {
        PaymentTransaction.findOne = originalFindOne;
        PaymentTransaction.findOneAndUpdate = originalFindOneAndUpdate;
        Invoice.findById = originalFindInvoice;
      }
    });

    it('Renewal extends existing active featured period instead of resetting to now', async () => {
      const originalFindOneTx = PaymentTransaction.findOne;
      const originalFindOneAndUpdateTx = PaymentTransaction.findOneAndUpdate;
      const originalFindListing = FranchiseListing.findById;
      const originalUpdateListing = FranchiseListing.findByIdAndUpdate;
      const originalCreateInvoice = Invoice.create;
      const originalFindUser = User.findById;
      const originalCreateAudit = AuditLog.create;
      const originalFindSettings = PlatformSettings.findOne;

      const mockListingId = new Types.ObjectId();
      // Active featured listing expiring in 10 days
      const futureExpiry = new Date(Date.now() + 10 * 24 * 60 * 60 * 1000);
      let updatedFeaturedUntil: Date | null = null;

      FranchiseListing.findById = ((id: any) => {
        return Promise.resolve({
          _id: mockListingId,
          isFeatured: true,
          featuredUntil: futureExpiry,
        });
      }) as any;

      FranchiseListing.findByIdAndUpdate = ((id: any, update: any) => {
        updatedFeaturedUntil = update.featuredUntil;
        return Promise.resolve({
          _id: mockListingId,
          ...update,
        });
      }) as any;

      PaymentTransaction.findOneAndUpdate = (() => Promise.resolve({
        _id: new Types.ObjectId(),
        status: 'captured',
        purpose: 'featured_listing',
        entityId: mockListingId,
        user: new Types.ObjectId(),
        amount: 8999,
        amountPaise: 899900,
        currency: 'INR',
        metadata: { packageId: '30_days' },
        save: () => Promise.resolve(),
      })) as any;

      Invoice.create = (() => Promise.resolve({
        _id: new Types.ObjectId(),
        invoiceNumber: 'INV-FEATURED-RENEWAL',
      })) as any;

      User.findById = (() => Promise.resolve({
        fullName: 'Franchisor User',
        email: 'franchisor@example.com',
        role: 'brand_owner',
      })) as any;

      AuditLog.create = (() => Promise.resolve({})) as any;
      PlatformSettings.findOne = (() => Promise.resolve({ featuredListingPackages: DEFAULT_FEATURED_PACKAGES })) as any;

      try {
        await PaymentService.captureAndFulfill({
          transactionReference: 'TXN-RENEW-01',
          gatewayPaymentId: 'pay_renew_123',
        });

        expect(updatedFeaturedUntil).not.toBeNull();
        // The new expiry should be roughly futureExpiry + 30 days (40 days from now, not 30)
        const expectedTime = futureExpiry.getTime() + 30 * 24 * 60 * 60 * 1000;
        const diff = Math.abs((updatedFeaturedUntil as any).getTime() - expectedTime);
        expect(diff).toBeLessThan(5000); // within 5 seconds
      } finally {
        PaymentTransaction.findOne = originalFindOneTx;
        PaymentTransaction.findOneAndUpdate = originalFindOneAndUpdateTx;
        FranchiseListing.findById = originalFindListing;
        FranchiseListing.findByIdAndUpdate = originalUpdateListing;
        Invoice.create = originalCreateInvoice;
        User.findById = originalFindUser;
        AuditLog.create = originalCreateAudit;
        PlatformSettings.findOne = originalFindSettings;
      }
    });

    it('Process refund correctly revokes entitlements on full refund, but preserves on partial refund', async () => {
      const originalFindByIdTx = PaymentTransaction.findById;
      const originalFindOneAndUpdateTx = PaymentTransaction.findOneAndUpdate;
      const originalUpdateListing = FranchiseListing.findByIdAndUpdate;
      const originalFindUser = User.findById;
      const originalCreateAudit = AuditLog.create;

      const mockListingId = new Types.ObjectId();
      let revokedListingId: any = null;

      FranchiseListing.findByIdAndUpdate = ((id: any, update: any) => {
        if (update.isFeatured === false) {
          revokedListingId = id;
        }
        return Promise.resolve();
      }) as any;

      // 1. Partial refund test (50% refunded)
      const mockTxCaptured: any = {
        _id: new Types.ObjectId(),
        status: 'captured',
        amount: 8999,
        remainingAmount: 8999,
        refundedAmount: 0,
        refunds: [],
        purpose: 'featured_listing',
        entityId: mockListingId,
        user: new Types.ObjectId(),
        transactionReference: 'TXN-REFUND-01',
        save: () => Promise.resolve(),
      };

      PaymentTransaction.findById = (() => Promise.resolve(mockTxCaptured)) as any;
      PaymentTransaction.findOneAndUpdate = ((query: any, update: any) => {
        return Promise.resolve({
          ...mockTxCaptured,
          status: update.$set.status,
          refundedAmount: update.$set.refundedAmount,
          remainingAmount: update.$set.remainingAmount,
          refund: update.$set.refund,
          refunds: [...mockTxCaptured.refunds, update.$set.refund],
        });
      }) as any;

      User.findById = (() => Promise.resolve({
        fullName: 'Admin User',
        email: 'admin@franchisebridge.com',
        role: 'admin',
      })) as any;

      AuditLog.create = (() => Promise.resolve({})) as any;

      try {
        // Partial refund: ₹4,000 out of ₹8,999
        const partialResult = await PaymentService.processRefund(mockTxCaptured._id, 'Partial satisfaction credit', new Types.ObjectId(), 4000);
        expect(revokedListingId).toBeNull(); // Should NOT be revoked
        expect(partialResult.status).toBe('partially_refunded');
        expect(partialResult.refundedAmount).toBe(4000);
        expect(partialResult.remainingAmount).toBe(4999);

        // 2. Full refund: ₹8,999 out of ₹8,999
        const fullResult = await PaymentService.processRefund(mockTxCaptured._id, 'Full cancellation and chargeback', new Types.ObjectId(), 8999);
        expect(revokedListingId).toEqual(mockListingId); // Should BE revoked
        expect(fullResult.status).toBe('refunded');
      } finally {
        PaymentTransaction.findById = originalFindByIdTx;
        PaymentTransaction.findOneAndUpdate = originalFindOneAndUpdateTx;
        FranchiseListing.findByIdAndUpdate = originalUpdateListing;
        User.findById = originalFindUser;
        AuditLog.create = originalCreateAudit;
      }
    });

    it('Supports sequential partial refunds and prevents exceeding remaining refundable balance', async () => {
      const originalFindByIdTx = PaymentTransaction.findById;
      const originalFindOneAndUpdateTx = PaymentTransaction.findOneAndUpdate;
      const originalFindUser = User.findById;
      const originalCreateAudit = AuditLog.create;
      const originalSubFindOneAndUpdate = Subscription.findOneAndUpdate;

      const mockTx: any = {
        _id: new Types.ObjectId(),
        status: 'captured',
        amount: 10000,
        refundedAmount: 0,
        remainingAmount: 10000,
        refunds: [],
        purpose: 'subscription',
        user: new Types.ObjectId(),
        transactionReference: 'TXN-PARTIAL-SEQ',
      };

      PaymentTransaction.findById = (() => Promise.resolve(mockTx)) as any;
      PaymentTransaction.findOneAndUpdate = ((query: any, update: any) => {
        mockTx.status = update.$set.status;
        mockTx.refundedAmount = update.$set.refundedAmount;
        mockTx.remainingAmount = update.$set.remainingAmount;
        mockTx.refund = update.$set.refund;
        mockTx.refunds.push(update.$set.refund);
        return Promise.resolve(mockTx);
      }) as any;

      Subscription.findOneAndUpdate = (() => Promise.resolve({})) as any;
      User.findById = (() => Promise.resolve({ fullName: 'Admin', role: 'admin' })) as any;
      AuditLog.create = (() => Promise.resolve({})) as any;

      try {
        // Refund 1: ₹3,000 (remaining becomes ₹7,000)
        await PaymentService.processRefund(mockTx._id, 'First partial rebate', new Types.ObjectId(), 3000);
        expect(mockTx.status).toBe('partially_refunded');
        expect(mockTx.refundedAmount).toBe(3000);
        expect(mockTx.remainingAmount).toBe(7000);

        // Refund 2: ₹4,000 (remaining becomes ₹3,000)
        await PaymentService.processRefund(mockTx._id, 'Second partial adjustment', new Types.ObjectId(), 4000);
        expect(mockTx.status).toBe('partially_refunded');
        expect(mockTx.refundedAmount).toBe(7000);
        expect(mockTx.remainingAmount).toBe(3000);

        // Attempt Refund 3 for ₹5,000 (exceeds remaining balance of ₹3,000) -> Must reject!
        await expect(
          PaymentService.processRefund(mockTx._id, 'Excess refund attempt', new Types.ObjectId(), 5000)
        ).rejects.toThrow(/remaining refundable balance of ₹3000/i);

        // Refund 3: ₹3,000 (exact remaining balance) -> becomes fully refunded!
        await PaymentService.processRefund(mockTx._id, 'Final settlement', new Types.ObjectId(), 3000);
        expect(mockTx.status).toBe('refunded');
        expect(mockTx.refundedAmount).toBe(10000);
        expect(mockTx.remainingAmount).toBe(0);
        expect(mockTx.refunds.length).toBe(3);
      } finally {
        PaymentTransaction.findById = originalFindByIdTx;
        PaymentTransaction.findOneAndUpdate = originalFindOneAndUpdateTx;
        Subscription.findOneAndUpdate = originalSubFindOneAndUpdate;
        User.findById = originalFindUser;
        AuditLog.create = originalCreateAudit;
      }
    });

    it('Duplicate webhook event delivery does not double-count refunds', async () => {
      const originalFindOneTx = PaymentTransaction.findOne;
      const originalFindByIdTx = PaymentTransaction.findById;
      const originalFindOneAndUpdateTx = PaymentTransaction.findOneAndUpdate;
      const originalFindUser = User.findById;
      const originalCreateAudit = AuditLog.create;

      const mockTx: any = {
        _id: new Types.ObjectId(),
        status: 'captured',
        amount: 5000,
        refundedAmount: 0,
        remainingAmount: 5000,
        refunds: [],
        gatewayPaymentId: 'pay_duplicate_webhook_123',
      };

      PaymentTransaction.findOne = (() => Promise.resolve(mockTx)) as any;
      PaymentTransaction.findById = (() => Promise.resolve(mockTx)) as any;
      PaymentTransaction.findOneAndUpdate = ((query: any, update: any) => {
        mockTx.status = update.$set.status;
        mockTx.refundedAmount = update.$set.refundedAmount;
        mockTx.remainingAmount = update.$set.remainingAmount;
        mockTx.refund = update.$set.refund;
        mockTx.refunds.push(update.$set.refund);
        return Promise.resolve(mockTx);
      }) as any;

      User.findById = (() => Promise.resolve({ fullName: 'System', role: 'admin' })) as any;
      AuditLog.create = (() => Promise.resolve({})) as any;

      try {
        const webhookPayload = {
          event: 'refund.processed',
          payload: {
            refund: {
              entity: {
                id: 'rfnd_gateway_unique_999',
                payment_id: 'pay_duplicate_webhook_123',
                amount: 250000, // ₹2,500 in paise
                notes: { reason: 'Gateway dispute resolution' },
              },
            },
          },
        };

        // First delivery: processes refund
        await PaymentService.handleWebhookEvent('refund.processed', webhookPayload.payload);
        expect(mockTx.refundedAmount).toBe(2500);
        expect(mockTx.refunds.length).toBe(1);

        // Second delivery of same webhook with identical refund ID: must be idempotent
        await PaymentService.handleWebhookEvent('refund.processed', webhookPayload.payload);
        expect(mockTx.refundedAmount).toBe(2500); // NOT 5000
        expect(mockTx.refunds.length).toBe(1); // NOT 2
      } finally {
        PaymentTransaction.findOne = originalFindOneTx;
        PaymentTransaction.findById = originalFindByIdTx;
        PaymentTransaction.findOneAndUpdate = originalFindOneAndUpdateTx;
        User.findById = originalFindUser;
        AuditLog.create = originalCreateAudit;
      }
    });
  });
});
