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

export interface BusinessPopulated {
  _id: string;
  businessName: string;
  legalBusinessName?: string;
  logoUrl?: string;
  headquarters?: any;
  numberOfOutlets?: number;
  establishedYear?: number;
  category?: string;
  description?: string;
}

export interface FranchiseListing {
  _id: string;
  business?: BusinessPopulated | string;
  ownerUser: string;
  brandName: string;
  opportunityTitle?: string;
  slug: string;
  tagline: string;
  industry: string;
  category?: string;
  subCategory?: string;
  summary: string;
  brandStory?: string;
  logoUrl?: string;
  bannerUrl?: string;
  galleryImages?: string[];
  businessModel?: string;
  franchiseModelType?: 'single_unit' | 'multi_unit' | 'both';
  totalInvestmentMin: number;
  totalInvestmentMax: number;
  totalInvestmentMinPaise?: number;
  totalInvestmentMaxPaise?: number;
  initialFranchiseFee: number;
  initialFranchiseFeePaise?: number;
  setupCosts?: number;
  equipmentCosts?: number;
  workingCapitalEstimate?: number;
  royaltyPercentage?: number;
  royaltyStructure?: {
    type?: string;
    percentage?: number;
    fixedAmountPaise?: number;
    description?: string;
  };
  marketingFeePercentage?: number;
  estimatedRoiMonths?: number;
  commercialSpaceMinSqFt?: number;
  commercialSpaceMaxSqFt?: number;
  spaceRequirements?: {
    minSqFt: number;
    maxSqFt: number;
    unit?: string;
  };
  staffRequiredMin?: number;
  staffRequiredMax?: number;
  trainingDurationWeeks?: number;
  trainingSupportDetails?: string;
  supportProvided?: string[];
  idealFranchiseeProfile?: string;
  expansionLocations?: string[];
  targetLocations?: string[];
  availableTerritories?: string[];
  expectedOpeningTimelineMonths?: number;
  documents?: Array<{
    title: string;
    fileUrl: string;
    documentType?: string;
  }>;
  status: FranchiseListingStatus;
  isFeatured?: boolean;
  featuredUntil?: string | Date;
  featuredPackageId?: string;
  featuredPaymentId?: string;
  viewsCount?: number;
  enquiriesCount?: number;
  inquiriesCount?: number;
  rejectionReason?: string;
  correctionNotes?: string;
  publishedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface FranchiseFilters {
  search?: string;
  industry?: string;
  location?: string;
  modelType?: string;
  minInvestment?: number;
  maxInvestment?: number;
  sort?: 'recent' | 'investment_asc' | 'investment_desc' | 'popular';
  page?: number;
  limit?: number;
}

export interface SavedFranchiseItem {
  _id: string;
  user: string;
  franchise: FranchiseListing;
  createdAt: string;
}

export interface CreateFranchisePayload {
  brandName: string;
  opportunityTitle?: string;
  tagline?: string;
  industry: string;
  category?: string;
  summary: string;
  brandStory: string;
  businessModel?: string;
  franchiseModelType?: 'single_unit' | 'multi_unit' | 'both';
  totalInvestmentMin: number;
  totalInvestmentMax: number;
  initialFranchiseFee: number;
  royaltyPercentage?: number;
  marketingFeePercentage?: number;
  estimatedRoiMonths?: number;
  commercialSpaceMinSqFt?: number;
  commercialSpaceMaxSqFt?: number;
  staffRequiredMin?: number;
  staffRequiredMax?: number;
  trainingDurationWeeks?: number;
  idealFranchiseeProfile: string;
  expansionLocations?: string[];
  status?: string;
}
