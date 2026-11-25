import { Schema, model, Document, Types } from 'mongoose';

export type PaymentPurpose =
  | 'subscription'
  | 'featured_listing'
  | 'commission'
  | 'investor_premium'
  | 'advisory_service';

export type PaymentStatus =
  | 'created'
  | 'pending'
  | 'captured'
  | 'failed'
  | 'refunded'
  | 'partially_refunded';

export type PaymentGatewayType = 'razorpay' | 'bank_transfer' | 'manual';

export interface IRefundDetail {
  refundId?: string;
  amount: number;
  amountPaise: number;
  reason?: string;
  refundedAt?: Date;
  refundedBy?: Types.ObjectId;
}

export interface IPaymentTransaction extends Document {
  transactionReference: string; // e.g. TXN-202611-123456
  user: Types.ObjectId;
  purpose: PaymentPurpose;
  entityType?: 'Subscription' | 'FranchiseListing' | 'CommissionAgreement';
  entityId?: Types.ObjectId;
  amount: number; // in INR
  amountPaise: number; // integer paise
  currency: string; // default INR
  status: PaymentStatus;
  gateway: PaymentGatewayType;
  gatewayOrderId?: string; // Razorpay order_id
  gatewayPaymentId?: string; // Razorpay pay_id
  gatewaySignature?: string;
  idempotencyKey: string; // prevents duplicate execution
  paymentMethod?: string; // 'upi' | 'card' | 'netbanking' | 'wallet'
  failureCode?: string;
  failureReason?: string;
  refund?: IRefundDetail;
  refunds?: IRefundDetail[];
  refundedAmount?: number;
  remainingAmount?: number;
  metadata?: Record<string, any>;
  isSandbox: boolean;
  invoiceId?: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const refundDetailSchema = new Schema<IRefundDetail>(
  {
    refundId: { type: String },
    amount: { type: Number, required: true },
    amountPaise: { type: Number, required: true },
    reason: { type: String, default: '' },
    refundedAt: { type: Date, default: Date.now },
    refundedBy: { type: Schema.Types.ObjectId, ref: 'User' },
  },
  { _id: false }
);

const paymentTransactionSchema = new Schema<IPaymentTransaction>(
  {
    transactionReference: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      index: true,
    },
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    purpose: {
      type: String,
      enum: ['subscription', 'featured_listing', 'commission', 'investor_premium', 'advisory_service'],
      required: true,
      index: true,
    },
    entityType: {
      type: String,
      enum: ['Subscription', 'FranchiseListing', 'CommissionAgreement'],
    },
    entityId: {
      type: Schema.Types.ObjectId,
      index: true,
    },
    amount: {
      type: Number,
      required: true,
      min: 0,
    },
    amountPaise: {
      type: Number,
      required: true,
      min: 0,
    },
    currency: {
      type: String,
      default: 'INR',
    },
    status: {
      type: String,
      enum: ['created', 'pending', 'captured', 'failed', 'refunded', 'partially_refunded'],
      default: 'created',
      index: true,
    },
    gateway: {
      type: String,
      enum: ['razorpay', 'bank_transfer', 'manual'],
      default: 'razorpay',
    },
    gatewayOrderId: {
      type: String,
      index: true,
    },
    gatewayPaymentId: {
      type: String,
      index: true,
    },
    gatewaySignature: {
      type: String,
    },
    idempotencyKey: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    paymentMethod: {
      type: String,
    },
    failureCode: {
      type: String,
    },
    failureReason: {
      type: String,
    },
    refund: {
      type: refundDetailSchema,
    },
    refunds: {
      type: [refundDetailSchema],
      default: [],
    },
    refundedAmount: {
      type: Number,
      default: 0,
      min: 0,
    },
    remainingAmount: {
      type: Number,
      min: 0,
    },
    metadata: {
      type: Schema.Types.Mixed,
    },
    isSandbox: {
      type: Boolean,
      default: false,
    },
    invoiceId: {
      type: Schema.Types.ObjectId,
      ref: 'Invoice',
    },
  },
  {
    timestamps: true,
  }
);

paymentTransactionSchema.index({ user: 1, createdAt: -1 });

export const PaymentTransaction = model<IPaymentTransaction>(
  'PaymentTransaction',
  paymentTransactionSchema
);
