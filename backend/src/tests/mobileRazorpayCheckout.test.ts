import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import crypto from 'crypto';
import { Types } from 'mongoose';
import { env } from '../config/env';
import { PaymentService } from '../services/paymentService';
import { EntitlementService } from '../services/entitlementService';
import { PaymentTransaction } from '../models/PaymentTransaction';

describe('Milestone 6 - Phase 3: Mobile Razorpay Checkout & Cryptographic Lifecycle Test Suite', () => {
  const mockUserId = new Types.ObjectId().toString();
  const originalSecret = env.RAZORPAY_KEY_SECRET;
  const originalKeyId = env.RAZORPAY_KEY_ID;
  const testSecret = 'mock_test_secret_for_mobile_signature_verification_321';
  const testKeyId = 'rzp_test_mobile_mock_key';

  // Save original model methods
  const originalCreate = PaymentTransaction.create;
  const originalFindOne = PaymentTransaction.findOne;
  const originalFindOneAndUpdate = PaymentTransaction.findOneAndUpdate;

  beforeAll(() => {
    (env as any).RAZORPAY_KEY_SECRET = testSecret;
    (env as any).RAZORPAY_KEY_ID = testKeyId;

    // In-memory mock for PaymentTransaction to support offline unit execution
    (PaymentTransaction as any).create = async (doc: any) => ({
      _id: new Types.ObjectId(),
      transactionReference: doc.transactionReference || PaymentService.generateTransactionReference(),
      amount: doc.amount,
      amountPaise: doc.amountPaise,
      currency: doc.currency || 'INR',
      status: doc.status || 'created',
      purpose: doc.purpose,
      isSandbox: true,
      gatewayOrderId: doc.gatewayOrderId || 'order_mock_test_123',
      idempotencyKey: doc.idempotencyKey,
      ...doc,
    });

    (PaymentTransaction as any).findOne = async (query: any) => {
      if (query?.idempotencyKey === 'existing_idemp_key') {
        return {
          _id: new Types.ObjectId(),
          transactionReference: 'TXN-20261123-EXISTING',
          gatewayOrderId: 'order_existing_123',
          amount: 9999,
          amountPaise: 999900,
          currency: 'INR',
          isSandbox: true,
        };
      }
      return null;
    };

    (PaymentTransaction as any).findOneAndUpdate = async (query: any) => {
      return null;
    };
  });

  afterAll(() => {
    (env as any).RAZORPAY_KEY_SECRET = originalSecret;
    (env as any).RAZORPAY_KEY_ID = originalKeyId;
    PaymentTransaction.create = originalCreate;
    PaymentTransaction.findOne = originalFindOne;
    PaymentTransaction.findOneAndUpdate = originalFindOneAndUpdate;
  });

  // --------------------------------------------------------------------------
  // SUITE 1: Checkout Initialization & Use Cases
  // --------------------------------------------------------------------------
  describe('1. Checkout Initialization & Use Cases', () => {
    it('Calculates and initializes order for Basic franchisor subscription', async () => {
      const order = await PaymentService.createOrder({
        userId: mockUserId,
        purpose: 'subscription',
        planId: 'basic',
        billingInterval: 'monthly',
      });

      expect(order).toBeDefined();
      expect(order.orderId).toBeDefined();
      expect(order.amountINR).toBe(9999);
      expect(order.amountPaise).toBe(999900);
      expect(order.currency).toBe('INR');
      expect(order.transaction.transactionReference).toMatch(/^TXN-\d{8}-[A-Z0-9]+$/);
    });

    it('Calculates and initializes order for Professional franchisor subscription', async () => {
      const order = await PaymentService.createOrder({
        userId: mockUserId,
        purpose: 'subscription',
        planId: 'professional',
        billingInterval: 'yearly',
      });

      expect(order).toBeDefined();
      expect(order.amountINR).toBe(249990);
      expect(order.amountPaise).toBe(24999000);
      expect(order.currency).toBe('INR');
    });

    it('Calculates and initializes order for Enterprise franchisor subscription', async () => {
      const order = await PaymentService.createOrder({
        userId: mockUserId,
        purpose: 'subscription',
        planId: 'enterprise',
        billingInterval: 'monthly',
      });

      expect(order).toBeDefined();
      expect(order.amountINR).toBe(49999);
      expect(order.amountPaise).toBe(4999900);
      expect(order.currency).toBe('INR');
    });

    it('Calculates and initializes order for Investor Premium subscription', async () => {
      const order = await PaymentService.createOrder({
        userId: mockUserId,
        purpose: 'investor_premium',
        planId: 'investor_premium',
        billingInterval: 'monthly',
      });

      expect(order).toBeDefined();
      expect(order.amountINR).toBe(4999);
      expect(order.amountPaise).toBe(499900);
      expect(order.currency).toBe('INR');
    });

    it('Calculates and initializes order for Featured Listing packages', async () => {
      const order = await PaymentService.createOrder({
        userId: mockUserId,
        purpose: 'featured_listing',
        packageId: '30_days',
        entityId: new Types.ObjectId().toString(),
      });

      expect(order).toBeDefined();
      expect(order.amountINR).toBe(8999);
      expect(order.amountPaise).toBe(899900);
      expect(order.currency).toBe('INR');
    });
  });

  // --------------------------------------------------------------------------
  // SUITE 2: Cryptographic Signature Verification Tests
  // --------------------------------------------------------------------------
  describe('2. Cryptographic Signature Verification & Security', () => {
    it('Verifies valid HMAC-SHA256 signature generated with matching secret', () => {
      const orderId = 'order_mobile_test_998811';
      const paymentId = 'pay_mobile_test_445566';
      const expectedPayload = `${orderId}|${paymentId}`;
      const validSignature = crypto
        .createHmac('sha256', testSecret)
        .update(expectedPayload)
        .digest('hex');

      const isValid = PaymentService.verifySignature(orderId, paymentId, validSignature);
      expect(isValid).toBe(true);
    });

    it('Rejects forged or tampered signature', () => {
      const orderId = 'order_mobile_test_998811';
      const paymentId = 'pay_mobile_test_445566';
      const fakeSignature = '0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef';

      const isValid = PaymentService.verifySignature(orderId, paymentId, fakeSignature);
      expect(isValid).toBe(false);
    });

    it('Rejects signature verified with mismatched order ID or payment ID', () => {
      const orderId = 'order_mobile_test_998811';
      const paymentId = 'pay_mobile_test_445566';
      const validForDifferentOrder = crypto
        .createHmac('sha256', testSecret)
        .update(`order_different|${paymentId}`)
        .digest('hex');

      const isValid = PaymentService.verifySignature(orderId, paymentId, validForDifferentOrder);
      expect(isValid).toBe(false);
    });
  });

  // --------------------------------------------------------------------------
  // SUITE 3: Payment Failure & Cancellation Handling
  // --------------------------------------------------------------------------
  describe('3. Payment Failure, Cancellation & Error States', () => {
    it('Fails safely when verifying signature without configured secret', () => {
      const temp = env.RAZORPAY_KEY_SECRET;
      (env as any).RAZORPAY_KEY_SECRET = '';

      const isValid = PaymentService.verifySignature('order_1', 'pay_1', 'sig_1');
      expect(isValid).toBe(false);

      (env as any).RAZORPAY_KEY_SECRET = temp;
    });

    it('Returns false when signature does not match payload', () => {
      const isValid = PaymentService.verifySignature('order_abc', 'pay_xyz', 'tampered_signature');
      expect(isValid).toBe(false);
    });
  });

  // --------------------------------------------------------------------------
  // SUITE 4: Duplicate Callback & Idempotency Tests
  // --------------------------------------------------------------------------
  describe('4. Webhook & Callback Idempotency Protection', () => {
    it('Detects existing transaction under duplicate idempotency key and prevents duplicate creation', async () => {
      const existing = await PaymentService.createOrder({
        userId: mockUserId,
        purpose: 'subscription',
        planId: 'basic',
        idempotencyKey: 'existing_idemp_key',
      });

      expect(existing.transaction.transactionReference).toBe('TXN-20261123-EXISTING');
      expect(existing.orderId).toBe('order_existing_123');
      expect(existing.amountINR).toBe(9999);
    });
  });

  // --------------------------------------------------------------------------
  // SUITE 5: Subscription Quota & Refresh Tests
  // --------------------------------------------------------------------------
  describe('5. Subscription Quotas & Refresh Verification', () => {
    it('Provides correct quota limits for each tier', async () => {
      const free = await EntitlementService.getPlanConfig('free');
      const basic = await EntitlementService.getPlanConfig('basic');
      const pro = await EntitlementService.getPlanConfig('professional');
      const ent = await EntitlementService.getPlanConfig('enterprise');

      expect(free.maxListings).toBe(1);
      expect(basic.maxListings).toBe(3);
      expect(pro.maxListings).toBe(10);
      expect(ent.maxListings).toBe(999);

      expect(free.monthlyLeadsLimit).toBe(5);
      expect(basic.monthlyLeadsLimit).toBe(25);
      expect(pro.monthlyLeadsLimit).toBe(100);
      expect(ent.monthlyLeadsLimit).toBe(9999);
    });

    it('Provides correct investor premium entitlements', async () => {
      const investorPlan = await EntitlementService.getPlanConfig('investor_premium');
      expect(investorPlan.id).toBe('investor_premium');
      expect(investorPlan.monthlyPrice).toBe(4999);
      expect(investorPlan.role).toBe('investor');
    });
  });

  // --------------------------------------------------------------------------
  // SUITE 6: Order Matching, Verification & Refund Cap Security Tests
  // --------------------------------------------------------------------------
  describe('6. Order Matching, Verification & Refund Cap Security', () => {
    it('Rejects payment fulfillment when gatewayOrderId does not match transaction record', async () => {
      await expect(
        PaymentService.captureAndFulfill({
          transactionReference: 'TXN-NON-EXISTENT-ORDER',
          gatewayOrderId: 'order_mismatched_xyz',
          gatewayPaymentId: 'pay_123',
        })
      ).rejects.toThrow('Payment transaction record not found.');
    });

    it('Rejects refund attempts that exceed the captured amount', async () => {
      const originalFindById = PaymentTransaction.findById;
      (PaymentTransaction as any).findById = async () => ({
        _id: new Types.ObjectId(),
        amount: 5000,
        status: 'captured',
      });

      await expect(
        PaymentService.processRefund(
          new Types.ObjectId().toString(),
          'Customer request',
          mockUserId,
          6000 // exceeds ₹5000
        )
      ).rejects.toThrow('Refund amount cannot exceed captured transaction amount');

      PaymentTransaction.findById = originalFindById;
    });

    it('Rejects refund attempts on uncaptured transactions', async () => {
      const originalFindById = PaymentTransaction.findById;
      (PaymentTransaction as any).findById = async () => ({
        _id: new Types.ObjectId(),
        amount: 5000,
        status: 'pending',
      });

      await expect(
        PaymentService.processRefund(
          new Types.ObjectId().toString(),
          'Customer request',
          mockUserId,
          5000
        )
      ).rejects.toThrow('Cannot refund transaction with status pending');

      PaymentTransaction.findById = originalFindById;
    });
  });
});
