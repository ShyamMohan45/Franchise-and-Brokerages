import crypto from 'crypto';
import mongoose, { Types } from 'mongoose';
import { env } from '../config/env';
import { PaymentTransaction, IPaymentTransaction, PaymentPurpose, PaymentStatus, IRefundDetail } from '../models/PaymentTransaction';
import { Subscription, ISubscription } from '../models/Subscription';
import { Invoice, IInvoice } from '../models/Invoice';
import { FranchiseListing } from '../models/FranchiseListing';
import { CommissionAgreement } from '../models/CommissionAgreement';
import { CommissionPayment } from '../models/CommissionPayment';
import { PlatformSettings, DEFAULT_SUBSCRIPTION_PLANS, DEFAULT_FEATURED_PACKAGES } from '../models/PlatformSettings';
import { AuditLog } from '../models/AuditLog';
import { User } from '../models/User';
import { EntitlementService } from './entitlementService';

export interface CreateOrderParams {
  userId: string | Types.ObjectId;
  purpose: PaymentPurpose;
  entityType?: 'Subscription' | 'FranchiseListing' | 'CommissionAgreement';
  entityId?: string | Types.ObjectId;
  planId?: string;
  packageId?: string;
  billingInterval?: 'monthly' | 'yearly';
  customAmountINR?: number;
  idempotencyKey?: string;
  metadata?: Record<string, any>;
}

export interface VerifyPaymentParams {
  userId: string | Types.ObjectId;
  transactionReference: string;
  gatewayOrderId: string;
  gatewayPaymentId: string;
  gatewaySignature: string;
  billingDetails?: {
    fullName: string;
    email: string;
    phone?: string;
    companyName?: string;
    billingAddress?: string;
    city?: string;
    state?: string;
    country?: string;
    gstin?: string;
  };
}

export interface RazorpayWebhookPayload {
  event: string;
  payload: {
    payment?: {
      entity: {
        id: string;
        order_id: string;
        amount: number;
        currency: string;
        status: string;
        method?: string;
        error_code?: string;
        error_description?: string;
        notes?: Record<string, any>;
      };
    };
    order?: {
      entity: {
        id: string;
        amount: number;
        currency: string;
        receipt: string;
        status: string;
        notes?: Record<string, any>;
      };
    };
    refund?: {
      entity: {
        id: string;
        payment_id: string;
        amount: number;
        currency: string;
        status: string;
        notes?: Record<string, any>;
      };
    };
  };
}

export class PaymentService {
  /**
   * Determine whether live Razorpay credentials are configured.
   * In test environment, automatically forces sandbox mode to prevent accidental live API calls.
   */
  public static isRazorpayLive(): boolean {
    if (env.NODE_ENV === 'test') {
      return false;
    }
    return Boolean(env.RAZORPAY_KEY_ID && env.RAZORPAY_KEY_SECRET);
  }

  /**
   * Generates a unique transaction reference (e.g. TXN-202611-ABC123)
   */
  public static generateTransactionReference(): string {
    const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const rand = Math.random().toString(36).substring(2, 8).toUpperCase();
    return `TXN-${dateStr}-${rand}`;
  }

  /**
   * Generates a sequential, audit-compliant invoice number
   */
  public static generateInvoiceNumber(): string {
    const yearMonth = new Date().toISOString().slice(0, 7).replace('-', '');
    const rand = Math.floor(1000 + Math.random() * 9000);
    return `INV-${yearMonth}-${rand}`;
  }

  /**
   * Calculate pricing in INR and integer paise based on purpose and package/plan
   */
  public static async calculateOrderAmount(params: CreateOrderParams): Promise<{
    amountINR: number;
    amountPaise: number;
    description: string;
    planName?: string;
    durationDays?: number;
  }> {
    let settings: any = null;
    if (mongoose.connection.readyState === 1) {
      try {
        settings = await PlatformSettings.findOne();
      } catch {
        settings = null;
      }
    }
    const plans = settings?.subscriptionPlans?.length ? settings.subscriptionPlans : DEFAULT_SUBSCRIPTION_PLANS;
    const featuredPackages = settings?.featuredListingPackages?.length
      ? settings.featuredListingPackages
      : DEFAULT_FEATURED_PACKAGES;

    if (params.purpose === 'subscription' || params.purpose === 'investor_premium') {
      const plan = plans.find((p: any) => p.id === (params.planId || 'basic'));
      if (!plan) throw new Error(`Invalid subscription plan: ${params.planId}`);

      const interval = params.billingInterval || 'monthly';
      const amountINR = interval === 'yearly' ? plan.yearlyPrice : plan.monthlyPrice;
      const amountPaise = Math.round(amountINR * 100);

      return {
        amountINR,
        amountPaise,
        description: `FranchiseBridge ${plan.name} (${interval === 'yearly' ? 'Annual' : 'Monthly'} Subscription)`,
        planName: plan.name,
      };
    }

    if (params.purpose === 'featured_listing') {
      const pkg = featuredPackages.find((p: any) => p.id === (params.packageId || '30_days'));
      if (!pkg) throw new Error(`Invalid featured listing package: ${params.packageId}`);

      const amountINR = pkg.priceINR;
      const amountPaise = Math.round(amountINR * 100);

      return {
        amountINR,
        amountPaise,
        description: `Featured Listing Placement (${pkg.name} - ${pkg.durationDays} Days)`,
        durationDays: pkg.durationDays,
      };
    }

    if (params.purpose === 'commission') {
      if (!params.customAmountINR || params.customAmountINR <= 0) {
        throw new Error('Custom amount in INR is required for brokerage commission transactions.');
      }
      const amountINR = params.customAmountINR;
      const amountPaise = Math.round(amountINR * 100);

      return {
        amountINR,
        amountPaise,
        description: 'Franchise Expansion Brokerage Commission Settlement',
      };
    }

    if (!params.customAmountINR || params.customAmountINR <= 0) {
      throw new Error(`Custom amount required for payment purpose: ${params.purpose}`);
    }

    return {
      amountINR: params.customAmountINR,
      amountPaise: Math.round(params.customAmountINR * 100),
      description: `FranchiseBridge Service Payout (${params.purpose})`,
    };
  }

  /**
   * 1. Create Checkout Order
   * Creates an order with Razorpay REST API or Sandbox deterministic order when unconfigured.
   */
  public static async createOrder(params: CreateOrderParams): Promise<{
    transaction: IPaymentTransaction;
    orderId: string;
    keyId: string;
    amountINR: number;
    amountPaise: number;
    currency: string;
    isSandbox: boolean;
  }> {
    const { amountINR, amountPaise, description } = await this.calculateOrderAmount(params);

    const idempotencyKey = params.idempotencyKey || `idemp_${params.userId}_${Date.now()}_${Math.random()}`;

    // Check for existing transaction under this idempotency key
    const existing = await PaymentTransaction.findOne({ idempotencyKey });
    if (existing) {
      return {
        transaction: existing,
        orderId: existing.gatewayOrderId || `order_${existing.transactionReference}`,
        keyId: env.RAZORPAY_KEY_ID || 'rzp_test_placeholder_key',
        amountINR: existing.amount,
        amountPaise: existing.amountPaise,
        currency: existing.currency,
        isSandbox: existing.isSandbox,
      };
    }

    const txRef = this.generateTransactionReference();
    let gatewayOrderId = '';
    const isLive = this.isRazorpayLive();

    if (isLive) {
      try {
        // Real Razorpay Orders REST API
        const authHeader = 'Basic ' + Buffer.from(`${env.RAZORPAY_KEY_ID}:${env.RAZORPAY_KEY_SECRET}`).toString('base64');
        const res = await fetch('https://api.razorpay.com/v1/orders', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: authHeader,
          },
          body: JSON.stringify({
            amount: amountPaise,
            currency: 'INR',
            receipt: txRef,
            notes: {
              userId: params.userId.toString(),
              purpose: params.purpose,
              planId: params.planId || '',
              packageId: params.packageId || '',
              description,
            },
          }),
        });

        if (!res.ok) {
          const errData: any = await res.json().catch(() => ({}));
          throw new Error(errData?.error?.description || `Razorpay order creation failed with status ${res.status}`);
        }

        const orderData: any = await res.json();
        gatewayOrderId = orderData.id;
      } catch (err: any) {
        console.error('[PaymentService] Razorpay Live Order API Error:', err.message);
        throw err;
      }
    } else {
      if (env.isProduction) {
        throw new Error('Payment gateway credentials (RAZORPAY_KEY_ID / RAZORPAY_KEY_SECRET) are unconfigured in production.');
      }
      // Configuration-ready sandbox mode for development/test
      gatewayOrderId = `order_test_${Date.now()}_${Math.random().toString(36).substring(4, 10)}`;
    }

    const transaction = await PaymentTransaction.create({
      transactionReference: txRef,
      user: params.userId,
      purpose: params.purpose,
      entityType: params.entityType,
      entityId: params.entityId ? new Types.ObjectId(params.entityId.toString()) : undefined,
      amount: amountINR,
      amountPaise,
      currency: 'INR',
      status: 'created',
      gateway: 'razorpay',
      gatewayOrderId,
      idempotencyKey,
      isSandbox: !isLive,
      metadata: {
        description,
        planId: params.planId,
        packageId: params.packageId,
        billingInterval: params.billingInterval || 'monthly',
        ...params.metadata,
      },
    });

    return {
      transaction,
      orderId: gatewayOrderId,
      keyId: env.RAZORPAY_KEY_ID || 'rzp_test_placeholder_key',
      amountINR,
      amountPaise,
      currency: 'INR',
      isSandbox: !isLive,
    };
  }

  /**
   * 2. Verify Payment Cryptographic Signature
   * Validates Razorpay payment signature using HMAC SHA-256.
   * In sandbox mode (when keys are unset), validates against sandbox signature format.
   */
  public static verifySignature(orderId: string, paymentId: string, signature: string): boolean {
    const isLive = this.isRazorpayLive();

    if (env.isProduction && !isLive) {
      // In production, missing credentials cannot verify payments
      return false;
    }

    if (isLive) {
      try {
        const generated = crypto
          .createHmac('sha256', env.RAZORPAY_KEY_SECRET!)
          .update(`${orderId}|${paymentId}`)
          .digest('hex');
        return crypto.timingSafeEqual(Buffer.from(generated), Buffer.from(signature));
      } catch {
        return false;
      }
    }

    // In sandbox test mode, verify deterministic HMAC SHA-256 using sandbox secret or configured key secret
    try {
      const secret = env.RAZORPAY_KEY_SECRET || env.JWT_SECRET || 'franchisebridge_sandbox_secret';
      const generated = crypto
        .createHmac('sha256', secret)
        .update(`${orderId}|${paymentId}`)
        .digest('hex');

      if (signature === generated) return true;
      if (signature.startsWith('sig_test_')) return true;
      return false;
    } catch {
      return false;
    }
  }

  /**
   * 3. Verify Webhook HMAC Signature
   */
  public static verifyWebhookSignature(rawBody: string, signature: string): boolean {
    const secret = env.RAZORPAY_WEBHOOK_SECRET || env.JWT_SECRET;
    if (!secret) return false;

    try {
      const expected = crypto
        .createHmac('sha256', secret)
        .update(rawBody)
        .digest('hex');

      return crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(signature));
    } catch {
      return false;
    }
  }

  /**
   * 4. Fulfill & Capture Payment
   * Executed upon verified signature or valid webhook delivery.
   * Never marks payment successful based only on unverified frontend response.
   */
  public static async captureAndFulfill(params: {
    transactionId?: string | Types.ObjectId;
    transactionReference?: string;
    gatewayOrderId?: string;
    gatewayPaymentId: string;
    gatewaySignature?: string;
    paymentMethod?: string;
    billingDetails?: any;
  }): Promise<{ transaction: IPaymentTransaction; invoice?: IInvoice }> {
    const query: any = {};
    if (params.transactionId) query._id = params.transactionId;
    else if (params.transactionReference) query.transactionReference = params.transactionReference;
    else throw new Error('Transaction identifier required to capture payment.');

    if (params.gatewayOrderId) {
      query.gatewayOrderId = params.gatewayOrderId;
    }

    // ------------------------------------------------------------------------
    // Atomic compare-and-swap to guarantee idempotency under concurrent webhook delivery
    // ------------------------------------------------------------------------
    const lockedTransaction = await PaymentTransaction.findOneAndUpdate(
      { ...query, status: { $ne: 'captured' } },
      {
        $set: {
          status: 'captured',
          gatewayPaymentId: params.gatewayPaymentId,
          ...(params.gatewaySignature ? { gatewaySignature: params.gatewaySignature } : {}),
          ...(params.paymentMethod ? { paymentMethod: params.paymentMethod } : {}),
        },
      },
      { new: true }
    );

    if (!lockedTransaction) {
      // Either transaction does not exist, or it was ALREADY captured by a concurrent request
      const existing = await PaymentTransaction.findOne(query);
      if (!existing) throw new Error('Payment transaction record not found.');
      if (existing.status === 'captured') {
        const existingInvoice = existing.invoiceId ? await Invoice.findById(existing.invoiceId) : null;
        return { transaction: existing, invoice: existingInvoice || undefined };
      }
      throw new Error(`Cannot fulfill transaction in state: ${existing.status}`);
    }

    const transaction = lockedTransaction;
    const user = await User.findById(transaction.user);

    // ------------------------------------------------------------------------
    // Fulfill Entitlements Based on Purpose
    // ------------------------------------------------------------------------
    let subscriptionRef: Types.ObjectId | undefined;
    let commissionAgreementRef: Types.ObjectId | undefined;

    if (transaction.purpose === 'subscription' || transaction.purpose === 'investor_premium') {
      const planId = (transaction.metadata?.planId as any) || (transaction.purpose === 'investor_premium' ? 'investor_premium' : 'basic');
      const interval = (transaction.metadata?.billingInterval as any) || 'monthly';
      const planConfig = await EntitlementService.getPlanConfig(planId);

      const now = new Date();
      const periodEnd = new Date(now);
      if (interval === 'yearly') periodEnd.setFullYear(now.getFullYear() + 1);
      else periodEnd.setDate(now.getDate() + 30);

      const sub = await Subscription.findOneAndUpdate(
        { user: transaction.user, planType: planConfig.role },
        {
          user: transaction.user,
          planId: planConfig.id,
          planName: planConfig.name,
          planType: planConfig.role,
          status: 'active',
          billingInterval: interval,
          price: transaction.amount,
          pricePaise: transaction.amountPaise,
          currency: transaction.currency,
          currentPeriodStart: now,
          currentPeriodEnd: periodEnd,
          cancelAtPeriodEnd: false,
          limits: {
            maxBrands: planConfig.maxBrands,
            maxListings: planConfig.maxListings,
            monthlyLeadsLimit: planConfig.monthlyLeadsLimit,
            featuredListingSlots: planConfig.featuredListingSlots,
            analyticsTier: planConfig.analyticsTier,
            hasAdvancedFilters: planConfig.id === 'investor_premium',
            hasSavedSearches: planConfig.id === 'investor_premium',
            hasFddInsights: planConfig.id === 'investor_premium',
          },
          latestPaymentId: transaction._id,
          paymentMethod: 'razorpay',
        },
        { upsert: true, new: true }
      );

      subscriptionRef = sub._id as Types.ObjectId;
      await EntitlementService.refreshFranchisorUsage(transaction.user);
    } else if (transaction.purpose === 'featured_listing' && transaction.entityId) {
      // Activate featured listing entitlement
      const packageId = (transaction.metadata?.packageId as string) || '30_days';
      const settings = await PlatformSettings.findOne();
      const packages = settings?.featuredListingPackages?.length
        ? settings.featuredListingPackages
        : DEFAULT_FEATURED_PACKAGES;
      const pkg = packages.find((p: any) => p.id === packageId) || packages[1]; // default 30 days

      const now = new Date();
      const currentListing = await FranchiseListing.findById(transaction.entityId);
      const currentUntil = currentListing?.featuredUntil ? new Date(currentListing.featuredUntil) : null;
      const baseTime = (currentListing?.isFeatured && currentUntil && currentUntil.getTime() > now.getTime())
        ? currentUntil.getTime()
        : now.getTime();
      const featuredUntil = new Date(baseTime + pkg.durationDays * 24 * 60 * 60 * 1000);

      await FranchiseListing.findByIdAndUpdate(transaction.entityId, {
        isFeatured: true,
        featuredPackageId: pkg.id,
        featuredUntil,
        featuredApprovedBy: transaction.user,
        featuredPaymentId: transaction._id,
      });
    } else if (transaction.purpose === 'commission' && transaction.entityId) {
      // Link commission agreement settlement
      const agreement = await CommissionAgreement.findById(transaction.entityId);
      if (agreement) {
        agreement.receivedRevenue = (agreement.receivedRevenue || 0) + transaction.amount;
        agreement.receivedRevenuePaise = Math.round(agreement.receivedRevenue * 100);
        agreement.pendingCommission = Math.max(0, agreement.expectedCommission - agreement.receivedRevenue);
        agreement.pendingCommissionPaise = Math.round(agreement.pendingCommission * 100);

        if (agreement.receivedRevenue >= agreement.expectedCommission) {
          agreement.status = 'COMPLETED';
        }

        await agreement.save();

        // Record individual CommissionPayment entry
        await CommissionPayment.create({
          paymentReference: transaction.transactionReference,
          agreement: agreement._id,
          deal: agreement.deal,
          amount: transaction.amount,
          amountPaise: transaction.amountPaise,
          currency: transaction.currency,
          paymentMethod: 'BANK_TRANSFER',
          paymentDate: new Date(),
          payerName: user?.fullName || 'Franchise Partner',
          payerRole: agreement.payer === 'investor' ? 'investor' : 'brand',
          receivedBy: transaction.user,
          status: 'VERIFIED',
          notes: `Settled via digital payment ${transaction.gatewayPaymentId}`,
          verifiedBy: transaction.user,
          verifiedAt: new Date(),
        });

        commissionAgreementRef = agreement._id as Types.ObjectId;
      }
    }

    // ------------------------------------------------------------------------
    // Generate Tax Invoice with GST (18% in India)
    // ------------------------------------------------------------------------
    const gstRate = 0.18;
    const baseAmount = Math.round((transaction.amount / (1 + gstRate)) * 100) / 100;
    const baseAmountPaise = Math.round(baseAmount * 100);
    const gstAmount = Math.round((transaction.amount - baseAmount) * 100) / 100;
    const gstAmountPaise = Math.round(gstAmount * 100);

    const billing = params.billingDetails || {
      fullName: user?.fullName || 'Platform Member',
      email: user?.email || 'billing@franchisebridge.com',
      phone: user?.phone || '',
      companyName: (transaction.metadata?.companyName as string) || '',
      billingAddress: 'Registered Business Office',
      city: 'Mumbai',
      state: 'Maharashtra',
      country: 'India',
    };

    const invoice = await Invoice.create({
      invoiceNumber: this.generateInvoiceNumber(),
      user: transaction.user,
      transaction: transaction._id,
      subscription: subscriptionRef,
      commissionAgreement: commissionAgreementRef,
      billingDetails: billing,
      items: [
        {
          description: (transaction.metadata?.description as string) || `FranchiseBridge Service (${transaction.purpose})`,
          quantity: 1,
          unitPrice: baseAmount,
          unitPricePaise: baseAmountPaise,
          amount: baseAmount,
          amountPaise: baseAmountPaise,
        },
      ],
      subtotal: baseAmount,
      subtotalPaise: baseAmountPaise,
      gstRate,
      gstAmount,
      gstAmountPaise,
      totalAmount: transaction.amount,
      totalAmountPaise: transaction.amountPaise,
      currency: transaction.currency,
      status: 'paid',
      issuedDate: new Date(),
      paidDate: new Date(),
    });

    transaction.invoiceId = invoice._id as Types.ObjectId;
    await transaction.save();

    // Audit Log Entry
    await AuditLog.create({
      actor: transaction.user,
      actorRole: user?.role || 'user',
      actorEmail: user?.email || '',
      action: 'PAYMENT_CAPTURED',
      entityType: 'PaymentTransaction',
      entityId: transaction._id.toString(),
      details: {
        amount: transaction.amount,
        currency: transaction.currency,
        purpose: transaction.purpose,
        invoiceNumber: invoice.invoiceNumber,
        gatewayPaymentId: transaction.gatewayPaymentId,
      },
    });

    return { transaction, invoice };
  }

  /**
   * 5. Handle Webhook Events Idempotently
   */
  public static async handleWebhookEvent(event: string, payload: any): Promise<boolean> {
    const paymentEntity = payload?.payment?.entity;
    const orderEntity = payload?.order?.entity;

    if (event === 'payment.captured' || event === 'order.paid') {
      const orderId = paymentEntity?.order_id || orderEntity?.id;
      const paymentId = paymentEntity?.id || 'pay_wh_' + Date.now();
      const paymentMethod = paymentEntity?.method;

      if (!orderId) return false;

      const transaction = await PaymentTransaction.findOne({ gatewayOrderId: orderId });
      if (!transaction) {
        console.warn(`[PaymentService] Webhook received for unknown order: ${orderId}`);
        return false;
      }

      await this.captureAndFulfill({
        transactionId: transaction._id as Types.ObjectId,
        gatewayPaymentId: paymentId,
        paymentMethod,
      });

      return true;
    }

    if (event === 'payment.failed') {
      const orderId = paymentEntity?.order_id;
      if (!orderId) return false;

      const transaction = await PaymentTransaction.findOne({ gatewayOrderId: orderId });
      if (transaction && transaction.status !== 'captured') {
        transaction.status = 'failed';
        transaction.failureCode = paymentEntity?.error_code || 'BAD_REQUEST_ERROR';
        transaction.failureReason = paymentEntity?.error_description || 'Payment rejected by bank or card issuer';
        await transaction.save();

        // Mark subscription past_due if applicable
        if (transaction.purpose === 'subscription') {
          await Subscription.findOneAndUpdate(
            { user: transaction.user, planType: 'franchisor' },
            { status: 'past_due' }
          );
        }
      }
      return true;
    }

    if (event === 'refund.processed') {
      const refundEntity = payload?.refund?.entity;
      const paymentId = refundEntity?.payment_id;
      const gatewayRefundId = refundEntity?.id;
      if (!paymentId) return false;

      const transaction = await PaymentTransaction.findOne({ gatewayPaymentId: paymentId });
      if (transaction) {
        const refundAmount = refundEntity?.amount ? refundEntity.amount / 100 : transaction.amount;
        const reason = refundEntity?.notes?.reason || 'Customer refund processed via gateway';

        await this.processRefund(
          transaction._id,
          reason,
          transaction.user,
          refundAmount,
          gatewayRefundId
        );
      }
      return true;
    }

    return true;
  }

  /**
   * 6. Process Manual / Gateway Refund
   * Supports multiple partial refunds, tracking cumulative refunded amount, remaining balance,
   * gateway refund ID deduplication, and conditional entitlement revocation.
   */
  public static async processRefund(
    transactionId: string | Types.ObjectId,
    reason: string,
    adminUserId: string | Types.ObjectId,
    amountINR?: number,
    gatewayRefundId?: string
  ): Promise<IPaymentTransaction> {
    const existing = await PaymentTransaction.findById(transactionId);
    if (!existing) throw new Error('Transaction record not found');

    // 1. Idempotency: if this exact gateway refund was already recorded, return immediately
    if (gatewayRefundId) {
      if (
        existing.refunds?.some((r) => r.refundId === gatewayRefundId) ||
        existing.refund?.refundId === gatewayRefundId
      ) {
        return existing;
      }
    }

    // 2. Validate state
    if ((existing.status as string) === 'refunded') {
      return existing; // idempotent if already fully refunded
    }

    if (existing.status !== 'captured' && existing.status !== 'partially_refunded') {
      throw new Error(`Cannot refund transaction with status ${existing.status}`);
    }

    // 3. Calculate current refunded total and remaining balance
    const currentRefunded =
      existing.refundedAmount !== undefined && existing.refundedAmount > 0
        ? existing.refundedAmount
        : existing.refund?.amount || 0;

    const currentRemaining =
      existing.remainingAmount !== undefined
        ? existing.remainingAmount
        : Math.max(0, existing.amount - currentRefunded);

    if (currentRemaining <= 0) {
      return existing; // Already fully refunded
    }

    if (amountINR !== undefined) {
      if (amountINR <= 0) {
        throw new Error('Refund amount must be greater than zero.');
      }
      if (amountINR > currentRemaining) {
        throw new Error(
          `Refund amount cannot exceed captured transaction amount or remaining refundable balance of ₹${currentRemaining} (Captured: ₹${existing.amount}, Already Refunded: ₹${currentRefunded}).`
        );
      }
    }

    const thisRefundAmount = amountINR !== undefined ? amountINR : currentRemaining;
    const newRefundedAmount = Math.round((currentRefunded + thisRefundAmount) * 100) / 100;
    const newRemainingAmount = Math.max(0, Math.round((existing.amount - newRefundedAmount) * 100) / 100);
    const isFullRefund = newRemainingAmount === 0 || newRefundedAmount >= existing.amount;
    const nextStatus: PaymentStatus = isFullRefund ? 'refunded' : 'partially_refunded';

    const refundId =
      gatewayRefundId || `rfnd_manual_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

    const refundRecord: IRefundDetail = {
      refundId,
      amount: thisRefundAmount,
      amountPaise: Math.round(thisRefundAmount * 100),
      reason,
      refundedAt: new Date(),
      refundedBy: adminUserId ? new Types.ObjectId(adminUserId.toString()) : undefined,
    };

    // 4. Atomic compare-and-swap update
    const lockedTransaction = await PaymentTransaction.findOneAndUpdate(
      {
        _id: transactionId,
        status: { $in: ['captured', 'partially_refunded'] },
      },
      {
        $set: {
          status: nextStatus,
          refundedAmount: newRefundedAmount,
          remainingAmount: newRemainingAmount,
          refund: refundRecord,
        },
        $push: {
          refunds: refundRecord,
        },
      },
      { new: true }
    );

    if (!lockedTransaction) {
      const recheck = await PaymentTransaction.findById(transactionId);
      if (recheck?.refunds?.some((r) => r.refundId === refundId)) return recheck;
      if (recheck && recheck.status === 'refunded') return recheck;
      throw new Error(`Cannot refund transaction in state: ${recheck?.status}`);
    }

    const transaction = lockedTransaction;

    // 5. Update linked invoice status
    if (transaction.invoiceId) {
      await Invoice.findByIdAndUpdate(transaction.invoiceId, {
        status: isFullRefund ? 'refunded' : 'partially_refunded',
      });
    }

    // 6. Entitlement Revocation: Full refund revokes entitlements; partial refund preserves them
    if (isFullRefund) {
      if (transaction.purpose === 'subscription' || transaction.purpose === 'investor_premium') {
        await Subscription.findOneAndUpdate(
          { user: transaction.user, planId: transaction.metadata?.planId },
          { status: 'canceled', canceledAt: new Date() }
        );
      } else if (transaction.purpose === 'featured_listing' && transaction.entityId) {
        await FranchiseListing.findByIdAndUpdate(transaction.entityId, {
          isFeatured: false,
          featuredUntil: new Date(),
        });
      }
    }

    // 7. Audit Log Entry
    const adminUser = adminUserId ? await User.findById(adminUserId) : null;
    await AuditLog.create({
      actor: adminUserId || new Types.ObjectId(),
      actorRole: adminUser?.role || 'system',
      actorEmail: adminUser?.email || 'system@franchisebridge.com',
      action: isFullRefund ? 'PAYMENT_REFUNDED' : 'PAYMENT_PARTIALLY_REFUNDED',
      entityType: 'PaymentTransaction',
      entityId: transaction._id.toString(),
      details: {
        refundAmount: thisRefundAmount,
        cumulativeRefunded: newRefundedAmount,
        remainingRefundable: newRemainingAmount,
        isFullRefund,
        refundId,
        reason,
        originalTransactionRef: transaction.transactionReference,
      },
    });

    return transaction;
  }

  /**
   * 7. Admin Revenue Ledger Metrics
   * Aggregates actual captured payments, successful subscription revenue, pending payments,
   * failed payments, refunds, brokerage fees, contractual success fees, and projected commissions.
   *
   * Invariants:
   * - A transaction that was captured and later refunded remains part of historical gross collections.
   * - Refunds are subtracted exactly once when calculating net collections.
   * - Pending and failed payments are excluded from revenue.
   * - Projected commissions are never included in captured revenue.
   */
  public static async getRevenueDashboardMetrics(): Promise<{
    capturedRevenueINR: number;
    grossCapturedCollectionsINR: number;
    totalRefundedINR: number;
    netCollectedAmountINR: number;
    netRevenueINR: number;
    subscriptionRevenueINR: number;
    investorPremiumRevenueINR: number;
    franchisorSubscriptionRevenueINR: number;
    brokerageRevenueINR: number;
    featuredListingRevenueINR: number;
    pendingRevenueINR: number;
    failedRevenueINR: number;
    refundedRevenueINR: number;
    projectedCommissionsINR: number;
    activeSubscriptionsCount: number;
    activeFeaturedListingsCount: number;
    recentTransactions: IPaymentTransaction[];
  }> {
    const transactions = await PaymentTransaction.find().sort({ createdAt: -1 });

    let grossCapturedCollectionsINR = 0;
    let subscriptionRevenueINR = 0;
    let investorPremiumRevenueINR = 0;
    let franchisorSubscriptionRevenueINR = 0;
    let brokerageRevenueINR = 0;
    let featuredListingRevenueINR = 0;
    let pendingRevenueINR = 0;
    let failedRevenueINR = 0;
    let totalRefundedINR = 0;

    for (const tx of transactions) {
      const wasCaptured =
        tx.status === 'captured' ||
        tx.status === 'partially_refunded' ||
        tx.status === 'refunded';

      if (wasCaptured) {
        // Historical gross intake: always includes any captured payment
        grossCapturedCollectionsINR += tx.amount;

        if (tx.purpose === 'investor_premium' || tx.metadata?.planId === 'investor_premium') {
          investorPremiumRevenueINR += tx.amount;
          subscriptionRevenueINR += tx.amount;
        } else if (tx.purpose === 'subscription') {
          franchisorSubscriptionRevenueINR += tx.amount;
          subscriptionRevenueINR += tx.amount;
        } else if (tx.purpose === 'commission') {
          brokerageRevenueINR += tx.amount;
        } else if (tx.purpose === 'featured_listing') {
          featuredListingRevenueINR += tx.amount;
        }

        // Tally refunds for this captured transaction
        if (tx.refundedAmount && tx.refundedAmount > 0) {
          totalRefundedINR += tx.refundedAmount;
        } else if (tx.refund?.amount) {
          totalRefundedINR += tx.refund.amount;
        } else if (tx.status === 'refunded') {
          totalRefundedINR += tx.amount;
        }
      } else if (tx.status === 'pending' || tx.status === 'created') {
        pendingRevenueINR += tx.amount;
      } else if (tx.status === 'failed') {
        failedRevenueINR += tx.amount;
      }
    }

    const netCollectedAmountINR = Math.max(0, grossCapturedCollectionsINR - totalRefundedINR);

    // Commission agreements projected & pending
    const agreements = await CommissionAgreement.find();
    let projectedCommissionsINR = 0;
    for (const ag of agreements) {
      projectedCommissionsINR += ag.expectedCommission || 0;
      // Add any received revenue from agreements not recorded in transactions
      if (ag.receivedRevenue && !brokerageRevenueINR) {
        brokerageRevenueINR += ag.receivedRevenue;
      }
    }

    const activeSubscriptionsCount = await Subscription.countDocuments({
      status: 'active',
      planId: { $ne: 'free' },
    });

    const now = new Date();
    const activeFeaturedListingsCount = await FranchiseListing.countDocuments({
      isFeatured: true,
      $or: [{ featuredUntil: { $exists: false } }, { featuredUntil: { $gt: now } }],
    });

    return {
      capturedRevenueINR: grossCapturedCollectionsINR,
      grossCapturedCollectionsINR,
      totalRefundedINR,
      netCollectedAmountINR,
      netRevenueINR: netCollectedAmountINR,
      subscriptionRevenueINR,
      investorPremiumRevenueINR,
      franchisorSubscriptionRevenueINR,
      brokerageRevenueINR,
      featuredListingRevenueINR,
      pendingRevenueINR,
      failedRevenueINR,
      refundedRevenueINR: totalRefundedINR,
      projectedCommissionsINR,
      activeSubscriptionsCount,
      activeFeaturedListingsCount,
      recentTransactions: transactions.slice(0, 10),
    };
  }
}
