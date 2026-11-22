import { Schema, model, Document, Types } from 'mongoose';

export type SubscriptionPlanId = 'free' | 'basic' | 'professional' | 'enterprise' | 'investor_premium';
export type SubscriptionPlanType = 'franchisor' | 'investor';
export type SubscriptionStatus = 'active' | 'past_due' | 'canceled' | 'expired' | 'trial';
export type BillingInterval = 'monthly' | 'yearly';

export interface ISubscriptionLimits {
  maxBrands: number;
  maxListings: number;
  monthlyLeadsLimit: number;
  featuredListingSlots: number;
  analyticsTier: 'basic' | 'standard' | 'advanced' | 'enterprise';
  hasAdvancedFilters: boolean;
  hasSavedSearches: boolean;
  hasFddInsights: boolean;
}

export interface ISubscriptionUsage {
  activeBrands: number;
  activeListings: number;
  leadsThisMonth: number;
  featuredListingsUsed: number;
}

export interface ISubscription extends Document {
  user: Types.ObjectId;
  planId: SubscriptionPlanId;
  planName: string;
  planType: SubscriptionPlanType;
  status: SubscriptionStatus;
  billingInterval: BillingInterval;
  price: number; // in INR
  pricePaise: number;
  currency: string;
  currentPeriodStart: Date;
  currentPeriodEnd: Date;
  cancelAtPeriodEnd: boolean;
  canceledAt?: Date;
  trialEndsAt?: Date;
  limits: ISubscriptionLimits;
  usage: ISubscriptionUsage;
  paymentMethod: 'razorpay' | 'manual' | 'bank_transfer' | 'none';
  latestPaymentId?: Types.ObjectId;
  razorpaySubscriptionId?: string;
  razorpayCustomerId?: string;
  createdAt: Date;
  updatedAt: Date;
}

const subscriptionSchema = new Schema<ISubscription>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    planId: {
      type: String,
      enum: ['free', 'basic', 'professional', 'enterprise', 'investor_premium'],
      default: 'free',
      required: true,
      index: true,
    },
    planName: {
      type: String,
      required: true,
      default: 'Free Plan',
    },
    planType: {
      type: String,
      enum: ['franchisor', 'investor'],
      required: true,
      index: true,
    },
    status: {
      type: String,
      enum: ['active', 'past_due', 'canceled', 'expired', 'trial'],
      default: 'active',
      index: true,
    },
    billingInterval: {
      type: String,
      enum: ['monthly', 'yearly'],
      default: 'monthly',
    },
    price: {
      type: Number,
      default: 0,
      min: 0,
    },
    pricePaise: {
      type: Number,
      default: 0,
      min: 0,
    },
    currency: {
      type: String,
      default: 'INR',
    },
    currentPeriodStart: {
      type: Date,
      default: Date.now,
    },
    currentPeriodEnd: {
      type: Date,
      required: true,
      index: true,
    },
    cancelAtPeriodEnd: {
      type: Boolean,
      default: false,
    },
    canceledAt: {
      type: Date,
    },
    trialEndsAt: {
      type: Date,
    },
    limits: {
      maxBrands: { type: Number, default: 1 },
      maxListings: { type: Number, default: 1 },
      monthlyLeadsLimit: { type: Number, default: 5 },
      featuredListingSlots: { type: Number, default: 0 },
      analyticsTier: {
        type: String,
        enum: ['basic', 'standard', 'advanced', 'enterprise'],
        default: 'basic',
      },
      hasAdvancedFilters: { type: Boolean, default: false },
      hasSavedSearches: { type: Boolean, default: false },
      hasFddInsights: { type: Boolean, default: false },
    },
    usage: {
      activeBrands: { type: Number, default: 0 },
      activeListings: { type: Number, default: 0 },
      leadsThisMonth: { type: Number, default: 0 },
      featuredListingsUsed: { type: Number, default: 0 },
    },
    paymentMethod: {
      type: String,
      enum: ['razorpay', 'manual', 'bank_transfer', 'none'],
      default: 'none',
    },
    latestPaymentId: {
      type: Schema.Types.ObjectId,
      ref: 'PaymentTransaction',
    },
    razorpaySubscriptionId: {
      type: String,
    },
    razorpayCustomerId: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

subscriptionSchema.index({ user: 1, planType: 1 }, { unique: true });

export const Subscription = model<ISubscription>('Subscription', subscriptionSchema);
