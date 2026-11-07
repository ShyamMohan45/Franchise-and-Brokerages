import { Schema, model, Document, Types } from 'mongoose';

export type FranchiseListingStatus = 'draft' | 'pending_approval' | 'published' | 'rejected' | 'archived';

export interface IFranchiseListing extends Document {
  business: Types.ObjectId;
  ownerUser: Types.ObjectId;
  brandName: string;
  slug: string;
  tagline: string;
  industry: string;
  subCategory?: string;
  summary: string;
  brandStory: string;
  logoUrl?: string;
  bannerUrl?: string;
  galleryImages: string[];
  franchiseModelType: 'single_unit' | 'multi_unit' | 'both';
  totalInvestmentMin: number;
  totalInvestmentMax: number;
  initialFranchiseFee: number;
  royaltyPercentage: number;
  marketingFeePercentage: number;
  estimatedRoiMonths: number;
  commercialSpaceMinSqFt: number;
  commercialSpaceMaxSqFt: number;
  staffRequiredMin: number;
  staffRequiredMax: number;
  trainingDurationWeeks: number;
  supportProvided: string[];
  idealFranchiseeProfile: string;
  expansionLocations: string[];
  status: FranchiseListingStatus;
  isFeatured: boolean;
  viewsCount: number;
  enquiriesCount: number;
  publishedAt?: Date;
  approvedBy?: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const franchiseListingSchema = new Schema<IFranchiseListing>(
  {
    business: {
      type: Schema.Types.ObjectId,
      ref: 'BusinessProfile',
      required: true,
      index: true,
    },
    ownerUser: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    brandName: {
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
    tagline: {
      type: String,
      required: true,
    },
    industry: {
      type: String,
      required: true,
      index: true,
    },
    subCategory: {
      type: String,
    },
    summary: {
      type: String,
      required: true,
    },
    brandStory: {
      type: String,
      required: true,
    },
    logoUrl: { type: String },
    bannerUrl: { type: String },
    galleryImages: [{ type: String }],
    franchiseModelType: {
      type: String,
      enum: ['single_unit', 'multi_unit', 'both'],
      default: 'both',
      index: true,
    },
    totalInvestmentMin: {
      type: Number,
      required: true,
      index: true,
    },
    totalInvestmentMax: {
      type: Number,
      required: true,
      index: true,
    },
    initialFranchiseFee: {
      type: Number,
      required: true,
    },
    royaltyPercentage: {
      type: Number,
      required: true,
    },
    marketingFeePercentage: {
      type: Number,
      default: 0,
    },
    estimatedRoiMonths: {
      type: Number,
      default: 18,
    },
    commercialSpaceMinSqFt: {
      type: Number,
      required: true,
    },
    commercialSpaceMaxSqFt: {
      type: Number,
      required: true,
    },
    staffRequiredMin: {
      type: Number,
      default: 2,
    },
    staffRequiredMax: {
      type: Number,
      default: 8,
    },
    trainingDurationWeeks: {
      type: Number,
      default: 2,
    },
    supportProvided: [{ type: String }],
    idealFranchiseeProfile: {
      type: String,
      required: true,
    },
    expansionLocations: [{ type: String, index: true }],
    status: {
      type: String,
      enum: ['draft', 'pending_approval', 'published', 'rejected', 'archived'],
      default: 'draft',
      index: true,
    },
    isFeatured: {
      type: Boolean,
      default: false,
      index: true,
    },
    viewsCount: {
      type: Number,
      default: 0,
    },
    enquiriesCount: {
      type: Number,
      default: 0,
    },
    publishedAt: {
      type: Date,
    },
    approvedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  {
    timestamps: true,
  }
);

franchiseListingSchema.index({ brandName: 'text', summary: 'text', industry: 'text', expansionLocations: 'text' });

export const FranchiseListing = model<IFranchiseListing>('FranchiseListing', franchiseListingSchema);
export const FranchiseOpportunity = FranchiseListing;
export type IFranchiseOpportunity = IFranchiseListing;
