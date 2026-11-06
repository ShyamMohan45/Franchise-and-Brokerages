import { z } from 'zod';

export const createApplicationSchema = z.object({
  franchiseId: z.string().min(1, 'Franchise ID is required'),
  proposedLocationCity: z.string().min(2, 'Proposed city is required'),
  proposedLocationState: z.string().optional(),
  unitsInterested: z.number().int().min(1, 'Units interested must be at least 1').default(1),
  investmentBudget: z.number().min(1000, 'Investment budget is required'),
  availableLiquidCapital: z.number().min(0, 'Available liquid capital is required'),
  timeline: z.string().min(1, 'Expected timeline is required'),
  businessBackgroundSummary: z.string().min(20, 'Background summary is required (min 20 chars)'),
  additionalMessage: z.string().optional(),
  privacyConsentGiven: z.boolean().refine((val) => val === true, {
    message: 'You must consent to privacy terms to submit your application',
  }),
});

export const updateApplicationStatusSchema = z.object({
  status: z.enum([
    'submitted',
    'under_review',
    'vetted_by_broker',
    'introduced_to_owner',
    'in_discussion',
    'documentation_review',
    'negotiation',
    'approved_for_deal',
    'deal_closed',
    'rejected',
    'withdrawn',
  ]),
  note: z.string().optional(),
  brokerNotes: z.string().optional(),
});
