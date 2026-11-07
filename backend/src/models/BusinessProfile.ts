import { Schema, model, Document, Types } from 'mongoose';

export type BusinessApprovalStatus = 'draft' | 'under_review' | 'approved' | 'rejected' | 'revision_requested';

export interface IBusinessProfile extends Document {
  user: Types.ObjectId;
  businessName: string;
  slug: string;
  category: string;
  founderName: string;
  contactEmail: string;
  contactPhone: string;
  websiteUrl?: string;
  establishedYear: number;
  headquarters: {
    city: string;
    state?: string;
    country: string;
  };
  currentLocations: string[];
  numberOfOutlets: number;
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
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
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
    headquarters: {
      city: { type: String, required: true },
      state: { type: String },
      country: { type: String, required: true, default: 'India' },
    },
    currentLocations: [{ type: String }],
    numberOfOutlets: {
      type: Number,
      required: true,
      default: 1,
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
      enum: ['draft', 'under_review', 'approved', 'rejected', 'revision_requested'],
      default: 'draft',
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
  },
  {
    timestamps: true,
  }
);

export const BusinessProfile = model<IBusinessProfile>('BusinessProfile', businessProfileSchema);
export const BrandProfile = BusinessProfile;
export type IBrandProfile = IBusinessProfile;
