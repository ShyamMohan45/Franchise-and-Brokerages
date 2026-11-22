import { Schema, model, Document, Types } from 'mongoose';

export interface ISubscriptionPlanConfig {
  id: string; // 'free' | 'basic' | 'professional' | 'enterprise' | 'investor_premium'
  name: string;
  role: 'franchisor' | 'investor';
  monthlyPrice: number; // in INR
  yearlyPrice: number; // in INR
  maxBrands: number;
  maxListings: number;
  monthlyLeadsLimit: number;
  featuredListingSlots: number;
  analyticsTier: 'basic' | 'standard' | 'advanced' | 'enterprise';
  features: string[];
  isActive: boolean;
}

export interface IFeaturedListingPackageConfig {
  id: string; // '14_days' | '30_days' | '90_days'
  name: string;
  durationDays: number;
  priceINR: number;
  homepagePlacement: boolean;
  prioritySearchBoost: boolean;
  isActive: boolean;
}

export interface IPlatformSettings extends Document {
  platformName: string;
  supportEmail: string;
  defaultCommissionRate: number; // e.g. 0.05
  defaultGstRate: number; // e.g. 0.18
  defaultJurisdiction: string;
  enabledJurisdictions: string[];
  requireNdaBeforeIntro: boolean;
  minReadinessScoreForListing: number;
  maintenanceMode: boolean;
  subscriptionPlans: ISubscriptionPlanConfig[];
  featuredListingPackages: IFeaturedListingPackageConfig[];
  updatedBy?: Types.ObjectId;
  updatedAt: Date;
}

export const DEFAULT_SUBSCRIPTION_PLANS: ISubscriptionPlanConfig[] = [
  {
    id: 'free',
    name: 'Free Franchisor',
    role: 'franchisor',
    monthlyPrice: 0,
    yearlyPrice: 0,
    maxBrands: 1,
    maxListings: 1,
    monthlyLeadsLimit: 5,
    featuredListingSlots: 0,
    analyticsTier: 'basic',
    features: ['1 Brand Profile', '1 Published Listing', '5 Inquiries/Month', 'Standard Messaging'],
    isActive: true,
  },
  {
    id: 'basic',
    name: 'Basic Growth',
    role: 'franchisor',
    monthlyPrice: 9999,
    yearlyPrice: 99990,
    maxBrands: 2,
    maxListings: 3,
    monthlyLeadsLimit: 25,
    featuredListingSlots: 0,
    analyticsTier: 'standard',
    features: ['2 Brand Profiles', '3 Active Listings', '25 Inquiries/Month', 'Standard Analytics Desk', 'FDD Document Repository'],
    isActive: true,
  },
  {
    id: 'professional',
    name: 'Professional Expansion',
    role: 'franchisor',
    monthlyPrice: 24999,
    yearlyPrice: 249990,
    maxBrands: 5,
    maxListings: 10,
    monthlyLeadsLimit: 100,
    featuredListingSlots: 1,
    analyticsTier: 'advanced',
    features: ['5 Brand Profiles', '10 Active Listings', '100 Inquiries/Month', '1 Featured Directory Slot', 'Advanced Compatibility Engine', 'Priority Broker Support'],
    isActive: true,
  },
  {
    id: 'enterprise',
    name: 'Enterprise Institutional',
    role: 'franchisor',
    monthlyPrice: 49999,
    yearlyPrice: 499990,
    maxBrands: 999,
    maxListings: 999,
    monthlyLeadsLimit: 9999,
    featuredListingSlots: 3,
    analyticsTier: 'enterprise',
    features: ['Unlimited Brands', 'Unlimited Listings', 'Unlimited Inquiries', '3 Featured Homepage Slots', 'Dedicated Expansion Broker', 'Custom Legal Structuring', 'White-Glove Mediation'],
    isActive: true,
  },
  {
    id: 'investor_premium',
    name: 'Investor Pro & Intelligence',
    role: 'investor',
    monthlyPrice: 4999,
    yearlyPrice: 49990,
    maxBrands: 0,
    maxListings: 0,
    monthlyLeadsLimit: 999,
    featuredListingSlots: 0,
    analyticsTier: 'advanced',
    features: ['Advanced Proprietary Filters (ROI, CapEx, Density)', 'Unlimited Saved Searches & Alerts', 'Deep FDD Due Diligence Analytics', 'Priority Matchmaking Invitations'],
    isActive: true,
  },
];

export const DEFAULT_FEATURED_PACKAGES: IFeaturedListingPackageConfig[] = [
  {
    id: '14_days',
    name: '14-Day Priority Showcase',
    durationDays: 14,
    priceINR: 4999,
    homepagePlacement: true,
    prioritySearchBoost: true,
    isActive: true,
  },
  {
    id: '30_days',
    name: '30-Day Growth Acceleration',
    durationDays: 30,
    priceINR: 8999,
    homepagePlacement: true,
    prioritySearchBoost: true,
    isActive: true,
  },
  {
    id: '90_days',
    name: 'Quarterly Expansion Spotlight',
    durationDays: 90,
    priceINR: 19999,
    homepagePlacement: true,
    prioritySearchBoost: true,
    isActive: true,
  },
];

const subscriptionPlanSchema = new Schema<ISubscriptionPlanConfig>(
  {
    id: { type: String, required: true },
    name: { type: String, required: true },
    role: { type: String, enum: ['franchisor', 'investor'], required: true },
    monthlyPrice: { type: Number, required: true, min: 0 },
    yearlyPrice: { type: Number, required: true, min: 0 },
    maxBrands: { type: Number, required: true, min: 0 },
    maxListings: { type: Number, required: true, min: 0 },
    monthlyLeadsLimit: { type: Number, required: true, min: 0 },
    featuredListingSlots: { type: Number, required: true, min: 0 },
    analyticsTier: {
      type: String,
      enum: ['basic', 'standard', 'advanced', 'enterprise'],
      default: 'basic',
    },
    features: [{ type: String }],
    isActive: { type: Boolean, default: true },
  },
  { _id: false }
);

const featuredListingPackageSchema = new Schema<IFeaturedListingPackageConfig>(
  {
    id: { type: String, required: true },
    name: { type: String, required: true },
    durationDays: { type: Number, required: true, min: 1 },
    priceINR: { type: Number, required: true, min: 0 },
    homepagePlacement: { type: Boolean, default: true },
    prioritySearchBoost: { type: Boolean, default: true },
    isActive: { type: Boolean, default: true },
  },
  { _id: false }
);

const platformSettingsSchema = new Schema<IPlatformSettings>(
  {
    platformName: {
      type: String,
      default: 'FranchiseBridge',
    },
    supportEmail: {
      type: String,
      default: 'support@franchisebridge.com',
    },
    defaultCommissionRate: {
      type: Number,
      default: 0.05,
    },
    defaultGstRate: {
      type: Number,
      default: 0.18,
    },
    defaultJurisdiction: {
      type: String,
      default: 'GLOBAL',
    },
    enabledJurisdictions: {
      type: [String],
      default: ['IN', 'US', 'UK', 'GLOBAL'],
    },
    requireNdaBeforeIntro: {
      type: Boolean,
      default: true,
    },
    minReadinessScoreForListing: {
      type: Number,
      default: 65,
    },
    maintenanceMode: {
      type: Boolean,
      default: false,
    },
    subscriptionPlans: {
      type: [subscriptionPlanSchema],
      default: DEFAULT_SUBSCRIPTION_PLANS,
    },
    featuredListingPackages: {
      type: [featuredListingPackageSchema],
      default: DEFAULT_FEATURED_PACKAGES,
    },
    updatedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  {
    timestamps: true,
  }
);

export const PlatformSettings = model<IPlatformSettings>('PlatformSettings', platformSettingsSchema);
