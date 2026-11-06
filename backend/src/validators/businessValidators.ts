import { z } from 'zod';

export const createBusinessProfileSchema = z.object({
  businessName: z.string().min(2, 'Business name is required'),
  category: z.string().min(2, 'Category is required'),
  founderName: z.string().min(2, 'Founder name is required'),
  contactEmail: z.string().email('Valid contact email is required'),
  contactPhone: z.string().min(5, 'Valid contact phone is required'),
  websiteUrl: z.string().url().optional().or(z.literal('')),
  establishedYear: z.number().int().min(1900).max(new Date().getFullYear()),
  headquarters: z.object({
    city: z.string().min(2, 'City is required'),
    state: z.string().optional(),
    country: z.string().default('India'),
  }),
  currentLocations: z.array(z.string()).default([]),
  numberOfOutlets: z.number().int().min(1, 'Number of outlets must be at least 1'),
  description: z.string().min(20, 'Description must be at least 20 characters'),
  businessModel: z.string().min(10, 'Business model summary is required'),
  expansionGoals: z.string().min(10, 'Expansion goals summary is required'),
  desiredExpansionCities: z.array(z.string()).default([]),
  estimatedInvestmentMin: z.number().min(0, 'Minimum investment is required'),
  estimatedInvestmentMax: z.number().min(0, 'Maximum investment is required'),
  existingFranchiseExperience: z.boolean().default(false),
  annualRevenueRange: z.string().optional(),
  logoUrl: z.string().optional(),
  images: z.array(z.string()).default([]),
});

export const updateBusinessProfileSchema = createBusinessProfileSchema.partial();

export const assessReadinessSchema = z.object({
  answers: z.object({
    brandStrengthScore: z.number().min(0).max(100),
    brandNotes: z.string().default(''),
    unitEconomicsScore: z.number().min(0).max(100),
    unitEconomicsNotes: z.string().default(''),
    sopDocumentationScore: z.number().min(0).max(100),
    sopNotes: z.string().default(''),
    legalScore: z.number().min(0).max(100),
    legalNotes: z.string().default(''),
    supplyChainScore: z.number().min(0).max(100),
    supplyChainNotes: z.string().default(''),
    trainingScore: z.number().min(0).max(100),
    trainingNotes: z.string().default(''),
    repeatabilityScore: z.number().min(0).max(100),
    repeatabilityNotes: z.string().default(''),
    expansionCapacityScore: z.number().min(0).max(100),
    expansionNotes: z.string().default(''),
  }),
});
