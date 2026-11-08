import { z } from 'zod';

export const createFranchiseListingSchema = z.object({
  brandName: z.string().min(2, 'Brand name is required'),
  opportunityTitle: z.string().optional(),
  tagline: z.string().default('Franchise Opportunity'),
  industry: z.string().min(2, 'Industry is required'),
  category: z.string().optional(),
  subCategory: z.string().optional(),
  summary: z.string().min(10, 'Summary must be at least 10 characters'),
  brandStory: z.string().min(10, 'Brand story must be at least 10 characters'),
  logoUrl: z.string().optional(),
  bannerUrl: z.string().optional(),
  galleryImages: z.array(z.string()).default([]),
  businessModel: z.string().optional(),
  franchiseModelType: z.enum(['single_unit', 'multi_unit', 'both']).default('both'),
  totalInvestmentMin: z.number().min(0, 'Minimum investment is required'),
  totalInvestmentMax: z.number().min(0, 'Maximum investment is required'),
  initialFranchiseFee: z.number().min(0, 'Initial franchise fee is required'),
  setupCosts: z.number().optional(),
  equipmentCosts: z.number().optional(),
  workingCapitalEstimate: z.number().optional(),
  royaltyPercentage: z.number().min(0).max(100, 'Royalty percentage must be between 0 and 100').default(5),
  royaltyStructure: z
    .object({
      type: z.string().optional(),
      percentage: z.number().optional(),
      fixedAmountPaise: z.number().optional(),
      description: z.string().optional(),
    })
    .optional(),
  marketingFeePercentage: z.number().min(0).max(100).default(0),
  estimatedRoiMonths: z.number().min(1).default(18),
  commercialSpaceMinSqFt: z.number().min(0).default(500),
  commercialSpaceMaxSqFt: z.number().min(0).default(2000),
  spaceRequirements: z
    .object({
      minSqFt: z.number().optional(),
      maxSqFt: z.number().optional(),
      unit: z.string().default('sq ft'),
    })
    .optional(),
  staffRequiredMin: z.number().min(1).default(2),
  staffRequiredMax: z.number().min(1).default(8),
  trainingDurationWeeks: z.number().min(1).default(2),
  trainingSupportDetails: z.string().optional(),
  supportProvided: z.array(z.string()).default([]),
  idealFranchiseeProfile: z.string().min(10, 'Ideal franchisee profile is required'),
  expansionLocations: z.array(z.string()).default([]),
  targetLocations: z.array(z.string()).default([]),
  availableTerritories: z.array(z.string()).default([]),
  expectedOpeningTimelineMonths: z.number().min(1).default(3),
  documents: z
    .array(
      z.object({
        title: z.string(),
        fileUrl: z.string(),
        documentType: z.string().optional(),
      })
    )
    .optional(),
  status: z
    .enum([
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
    ])
    .default('DRAFT'),
});

export const updateFranchiseListingSchema = createFranchiseListingSchema.partial();
