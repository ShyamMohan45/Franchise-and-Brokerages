import { z } from 'zod';

export const createFranchiseListingSchema = z.object({
  brandName: z.string().min(2, 'Brand name is required'),
  tagline: z.string().min(5, 'Tagline is required'),
  industry: z.string().min(2, 'Industry is required'),
  subCategory: z.string().optional(),
  summary: z.string().min(20, 'Summary must be at least 20 characters'),
  brandStory: z.string().min(30, 'Brand story must be at least 30 characters'),
  logoUrl: z.string().optional(),
  bannerUrl: z.string().optional(),
  galleryImages: z.array(z.string()).default([]),
  franchiseModelType: z.enum(['single_unit', 'multi_unit', 'both']).default('both'),
  totalInvestmentMin: z.number().min(0, 'Minimum investment is required'),
  totalInvestmentMax: z.number().min(0, 'Maximum investment is required'),
  initialFranchiseFee: z.number().min(0, 'Initial franchise fee is required'),
  royaltyPercentage: z.number().min(0).max(100, 'Royalty percentage must be between 0 and 100'),
  marketingFeePercentage: z.number().min(0).max(100).default(0),
  estimatedRoiMonths: z.number().min(1).default(18),
  commercialSpaceMinSqFt: z.number().min(50, 'Minimum space is required'),
  commercialSpaceMaxSqFt: z.number().min(50, 'Maximum space is required'),
  staffRequiredMin: z.number().min(1).default(2),
  staffRequiredMax: z.number().min(1).default(8),
  trainingDurationWeeks: z.number().min(1).default(2),
  supportProvided: z.array(z.string()).default([]),
  idealFranchiseeProfile: z.string().min(20, 'Ideal franchisee profile is required'),
  expansionLocations: z.array(z.string()).min(1, 'At least one target expansion location is required'),
});

export const updateFranchiseListingSchema = createFranchiseListingSchema.partial();
