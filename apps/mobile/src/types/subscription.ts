export type SubscriptionPlanId = 'free' | 'basic' | 'professional' | 'enterprise' | 'investor_premium';

export type BillingInterval = 'monthly' | 'yearly';

export type SubscriptionStatus = 'active' | 'canceled' | 'past_due' | 'expired';

export interface SubscriptionLimits {
  maxBrands: number;
  maxListings: number;
  monthlyLeadsLimit: number;
  featuredListingSlots: number;
  analyticsTier: 'basic' | 'standard' | 'advanced' | 'enterprise';
  hasAdvancedFilters: boolean;
  hasSavedSearches: boolean;
  hasFddInsights: boolean;
}

export interface SubscriptionUsage {
  activeBrandsCount: number;
  activeListingsCount: number;
  leadsThisMonth: number;
  featuredSlotsUsed: number;
  lastUsageReset: string;
}

export interface SubscriptionPlanConfig {
  id: SubscriptionPlanId;
  name: string;
  role: 'franchisor' | 'investor';
  monthlyPrice: number;
  yearlyPrice: number;
  currency: string;
  maxBrands: number;
  maxListings: number;
  monthlyLeadsLimit: number;
  featuredListingSlots: number;
  analyticsTier: 'basic' | 'standard' | 'advanced' | 'enterprise';
  features: string[];
}

export interface FeaturedListingPackage {
  id: string;
  name: string;
  durationDays: number;
  priceINR: number;
  currency: string;
  description: string;
}

export interface UserSubscription {
  _id: string;
  user: string;
  planId: SubscriptionPlanId;
  planName: string;
  planType: 'franchisor' | 'investor';
  status: SubscriptionStatus;
  billingInterval: BillingInterval;
  price: number;
  pricePaise: number;
  currency: string;
  currentPeriodStart: string;
  currentPeriodEnd: string;
  cancelAtPeriodEnd: boolean;
  canceledAt?: string;
  limits: SubscriptionLimits;
  usage: SubscriptionUsage;
  latestPaymentId?: string;
  paymentMethod?: string;
}

export interface PlansResponse {
  plans: SubscriptionPlanConfig[];
  featuredPackages: FeaturedListingPackage[];
}
