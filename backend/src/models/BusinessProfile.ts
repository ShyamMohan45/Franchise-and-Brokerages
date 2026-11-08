import { Schema, model, Document, Types } from 'mongoose';

export type BusinessApprovalStatus =
  | 'DRAFT'
  | 'SUBMITTED'
  | 'UNDER_REVIEW'
  | 'APPROVED'
  | 'REJECTED'
  | 'PUBLISHED'
  | 'draft'
  | 'under_review'
  | 'approved'
  | 'rejected'
  | 'revision_requested';

export interface IBusinessProfile extends Document {
  user: Types.ObjectId;
  businessName: string;
  legalBusinessName?: string;
  brandName?: string;
  slug: string;
  industry?: string;
  category: string;
  founderName: string;
  contactPerson?: string;
  contactEmail: string;
  contactPhone: string;
  websiteUrl?: string;
  establishedYear: number;
  registeredAddress?: {
    street?: string;
    city: string;
    state?: string;
    postalCode?: string;
    country: string;
  };
  headquarters: {
    city: string;
    state?: string;
    country: string;
  };
  currentLocations: string[];
  operatingLocations?: string[];
  numberOfOutlets: number;
  outletsSummary?: string;
  description: string;
  businessModel: string;
  expansionGoals: string;
  desiredExpansionCities: string[];
  estimatedInvestmentMin: number;
  estimatedInvestmentMax: number;
  existingFranchiseExperience: boolean;
  annualRevenueRange?: string;
  logoUrl?: string;
  images: string[];
  approvalStatus: BusinessApprovalStatus;
  adminReviewNotes?: string;
  reviewedBy?: Types.ObjectId;
  reviewedAt?: Date;
  readinessScore?: number;
  profileCompletion?: number;
  createdAt: Date;
  updatedAt: Date;
}

const businessProfileSchema = new Schema<IBusinessProfile>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
      index: true,
    },
    businessName: {
      type: String,
      required: true,
      trim: true,
    },
    legalBusinessName: {
      type: String,
      trim: true,
    },
    brandName: {
      type: String,
      trim: true,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    industry: {
      type: String,
      trim: true,
    },
    category: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    founderName: {
      type: String,
      required: true,
      trim: true,
    },
    contactPerson: {
      type: String,
      trim: true,
    },
    contactEmail: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },
    contactPhone: {
      type: String,
      required: true,
      trim: true,
    },
    websiteUrl: {
      type: String,
      trim: true,
    },
    establishedYear: {
      type: Number,
      required: true,
    },
    registeredAddress: {
      street: { type: String },
      city: { type: String },
      state: { type: String },
      postalCode: { type: String },
      country: { type: String, default: 'India' },
    },
    headquarters: {
      city: { type: String, required: true },
      state: { type: String },
      country: { type: String, required: true, default: 'India' },
    },
    currentLocations: [{ type: String }],
    operatingLocations: [{ type: String }],
    numberOfOutlets: {
      type: Number,
      required: true,
      default: 1,
    },
    outletsSummary: {
      type: String,
    },
    description: {
      type: String,
      required: true,
    },
    businessModel: {
      type: String,
      required: true,
    },
    expansionGoals: {
      type: String,
      required: true,
    },
    desiredExpansionCities: [{ type: String }],
    estimatedInvestmentMin: {
      type: Number,
      required: true,
    },
    estimatedInvestmentMax: {
      type: Number,
      required: true,
    },
    existingFranchiseExperience: {
      type: Boolean,
      default: false,
    },
    annualRevenueRange: {
      type: String,
    },
    logoUrl: {
      type: String,
    },
    images: [{ type: String }],
    approvalStatus: {
      type: String,
      enum: [
        'DRAFT',
        'SUBMITTED',
        'UNDER_REVIEW',
        'APPROVED',
        'REJECTED',
        'PUBLISHED',
        'draft',
        'under_review',
        'approved',
        'rejected',
        'revision_requested',
      ],
      default: 'DRAFT',
      index: true,
    },
    adminReviewNotes: {
      type: String,
    },
    reviewedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    reviewedAt: {
      type: Date,
    },
    readinessScore: {
      type: Number,
      default: 0,
    },
    profileCompletion: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

export const BusinessProfile = model<IBusinessProfile>('BusinessProfile', businessProfileSchema);
export const BrandProfile = BusinessProfile;
export type IBrandProfile = IBusinessProfile;
