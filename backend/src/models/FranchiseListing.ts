import { Schema, model, Document, Types } from 'mongoose';

export type FranchiseListingStatus =
  | 'DRAFT'
  | 'SUBMITTED'
  | 'UNDER_REVIEW'
  | 'APPROVED'
  | 'REJECTED'
  | 'PUBLISHED'
  | 'draft'
  | 'pending_approval'
  | 'submitted'
  | 'under_review'
  | 'approved'
  | 'rejected'
  | 'published'
  | 'archived';

export interface IFranchiseListing extends Document {
  business: Types.ObjectId;
  ownerUser: Types.ObjectId;
  brandName: string;
  opportunityTitle?: string;
  slug: string;
  tagline: string;
  industry: string;
  category?: string;
  subCategory?: string;
  summary: string;
  brandStory: string;
  logoUrl?: string;
  bannerUrl?: string;
  galleryImages: string[];
  businessModel?: string;
  franchiseModelType: 'single_unit' | 'multi_unit' | 'both';
  totalInvestmentMin: number;
  totalInvestmentMax: number;
  totalInvestmentMinPaise?: number;
  totalInvestmentMaxPaise?: number;
  initialFranchiseFee: number;
  initialFranchiseFeePaise?: number;
  setupCosts?: number;
  setupCostsPaise?: number;
  equipmentCosts?: number;
  equipmentCostsPaise?: number;
  workingCapitalEstimate?: number;
  workingCapitalEstimatePaise?: number;
  royaltyPercentage: number;
  royaltyStructure?: {
    type?: string;
    percentage?: number;
    fixedAmountPaise?: number;
    description?: string;
  };
  marketingFeePercentage: number;
  estimatedRoiMonths: number;
  commercialSpaceMinSqFt: number;
  commercialSpaceMaxSqFt: number;
  spaceRequirements?: {
    minSqFt: number;
    maxSqFt: number;
    unit?: string;
  };
  staffRequiredMin: number;
  staffRequiredMax: number;
  trainingDurationWeeks: number;
  trainingSupportDetails?: string;
  supportProvided: string[];
  idealFranchiseeProfile: string;
  franchiseRequirements?: {
    minNetWorth?: number;
    minNetWorthPaise?: number;
    experienceYears?: number;
    criteria?: string;
  };
  expansionLocations: string[];
  targetLocations?: string[];
  availableTerritories?: string[];
  expectedOpeningTimelineMonths?: number;
  documents?: Array<{
    title: string;
    fileUrl: string;
    documentType?: string;
  }>;
  status: FranchiseListingStatus;
  isFeatured: boolean;
  viewsCount: number;
  enquiriesCount: number;
  inquiriesCount?: number;
  rejectionReason?: string;
  correctionNotes?: string;
  reviewedBy?: Types.ObjectId;
  reviewedAt?: Date;
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
    opportunityTitle: {
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
    tagline: {
      type: String,
      required: true,
    },
    industry: {
      type: String,
      required: true,
      index: true,
    },
    category: {
      type: String,
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
    businessModel: { type: String },
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
    totalInvestmentMinPaise: {
      type: Number,
      index: true,
    },
    totalInvestmentMaxPaise: {
      type: Number,
      index: true,
    },
    initialFranchiseFee: {
      type: Number,
      required: true,
    },
    initialFranchiseFeePaise: {
      type: Number,
    },
    setupCosts: {
      type: Number,
      default: 0,
    },
    setupCostsPaise: {
      type: Number,
      default: 0,
    },
    equipmentCosts: {
      type: Number,
      default: 0,
    },
    equipmentCostsPaise: {
      type: Number,
      default: 0,
    },
    workingCapitalEstimate: {
      type: Number,
      default: 0,
    },
    workingCapitalEstimatePaise: {
      type: Number,
      default: 0,
    },
    royaltyPercentage: {
      type: Number,
      required: true,
    },
    royaltyStructure: {
      type: { type: String, default: 'percentage' },
      percentage: { type: Number },
      fixedAmountPaise: { type: Number },
      description: { type: String },
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
    spaceRequirements: {
      minSqFt: { type: Number },
      maxSqFt: { type: Number },
      unit: { type: String, default: 'sq ft' },
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
    trainingSupportDetails: { type: String },
    supportProvided: [{ type: String }],
    idealFranchiseeProfile: {
      type: String,
      required: true,
    },
    franchiseRequirements: {
      minNetWorth: { type: Number },
      minNetWorthPaise: { type: Number },
      experienceYears: { type: Number },
      criteria: { type: String },
    },
    expansionLocations: [{ type: String, index: true }],
    targetLocations: [{ type: String }],
    availableTerritories: [{ type: String }],
    expectedOpeningTimelineMonths: { type: Number, default: 3 },
    documents: [
      {
        title: { type: String },
        fileUrl: { type: String },
        documentType: { type: String },
      },
    ],
    status: {
      type: String,
      enum: [
        'DRAFT',
        'SUBMITTED',
        'UNDER_REVIEW',
        'APPROVED',
        'REJECTED',
        'PUBLISHED',
        'draft',
        'pending_approval',
        'submitted',
        'under_review',
        'approved',
        'rejected',
        'published',
        'archived',
      ],
      default: 'DRAFT',
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
    inquiriesCount: {
      type: Number,
      default: 0,
    },
    rejectionReason: { type: String },
    correctionNotes: { type: String },
    reviewedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    reviewedAt: {
      type: Date,
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

franchiseListingSchema.pre('save', function (next) {
  // Sync opportunity title & tagline
  if (this.opportunityTitle && !this.tagline) {
    this.tagline = this.opportunityTitle;
  } else if (this.tagline && !this.opportunityTitle) {
    this.opportunityTitle = this.tagline;
  }

  // Sync category & industry
  if (this.category && !this.industry) {
    this.industry = this.category;
  } else if (this.industry && !this.category) {
    this.category = this.industry;
  }

  // Sync target locations & expansion locations
  if (this.targetLocations && this.targetLocations.length > 0 && (!this.expansionLocations || this.expansionLocations.length === 0)) {
    this.expansionLocations = this.targetLocations;
  } else if (this.expansionLocations && this.expansionLocations.length > 0 && (!this.targetLocations || this.targetLocations.length === 0)) {
    this.targetLocations = this.expansionLocations;
  }

  // Convert INR rupees to integer paise consistently (1 INR = 100 paise)
  if (this.totalInvestmentMin !== undefined) {
    this.totalInvestmentMinPaise = Math.round(this.totalInvestmentMin * 100);
  }
  if (this.totalInvestmentMax !== undefined) {
    this.totalInvestmentMaxPaise = Math.round(this.totalInvestmentMax * 100);
  }
  if (this.initialFranchiseFee !== undefined) {
    this.initialFranchiseFeePaise = Math.round(this.initialFranchiseFee * 100);
  }
  if (this.setupCosts !== undefined) {
    this.setupCostsPaise = Math.round(this.setupCosts * 100);
  }
  if (this.equipmentCosts !== undefined) {
    this.equipmentCostsPaise = Math.round(this.equipmentCosts * 100);
  }
  if (this.workingCapitalEstimate !== undefined) {
    this.workingCapitalEstimatePaise = Math.round(this.workingCapitalEstimate * 100);
  }

  // Space requirements sync
  if (this.commercialSpaceMinSqFt !== undefined || this.commercialSpaceMaxSqFt !== undefined) {
    this.spaceRequirements = {
      minSqFt: this.commercialSpaceMinSqFt || 0,
      maxSqFt: this.commercialSpaceMaxSqFt || 0,
      unit: 'sq ft',
    };
  }

  next();
});

franchiseListingSchema.index({ brandName: 'text', summary: 'text', industry: 'text', expansionLocations: 'text' });

export const FranchiseListing = model<IFranchiseListing>('FranchiseListing', franchiseListingSchema);
export const FranchiseOpportunity = FranchiseListing;
export type IFranchiseOpportunity = IFranchiseListing;
