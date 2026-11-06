import { z } from 'zod';

export const createLeadSchema = z.object({
  fullName: z.string().min(2, 'Full name is required'),
  email: z.string().email('Valid email is required'),
  phone: z.string().min(5, 'Valid phone is required'),
  company: z.string().optional(),
  leadType: z.enum(['brand_owner', 'franchise_investor', 'multi_unit_operator', 'institutional']),
  source: z.string().default('website_form'),
  targetIndustry: z.string().optional(),
  budgetMin: z.number().optional(),
  budgetMax: z.number().optional(),
  priority: z.enum(['low', 'medium', 'high', 'urgent']).default('medium'),
  internalNotes: z.string().default(''),
});

export const updateLeadSchema = createLeadSchema.partial().extend({
  status: z
    .enum(['new', 'contacted', 'qualified', 'meeting_scheduled', 'negotiation', 'converted', 'lost'])
    .optional(),
  followUpDate: z.string().optional(),
});

export const createDealSchema = z.object({
  dealTitle: z.string().min(3, 'Deal title is required'),
  franchiseListingId: z.string().min(1, 'Franchise listing ID is required'),
  businessOwnerId: z.string().min(1, 'Business owner ID is required'),
  investorId: z.string().min(1, 'Investor ID is required'),
  applicationId: z.string().optional(),
  dealValue: z.number().min(0, 'Deal value is required'),
  franchiseFee: z.number().min(0, 'Franchise fee is required'),
  commissionType: z.enum(['percentage', 'fixed']).default('percentage'),
  commissionRate: z.number().default(0.05),
  expectedCommission: z.number().min(0, 'Expected commission is required'),
  notes: z.string().default(''),
});

export const updateDealSchema = z.object({
  stage: z
    .enum([
      'lead_received',
      'qualification',
      'matching',
      'initial_discussion',
      'documentation_review',
      'negotiation',
      'agreement_pending',
      'deal_closed',
      'lost_cancelled',
    ])
    .optional(),
  dealValue: z.number().optional(),
  actualCommissionEarned: z.number().optional(),
  paymentStatus: z.enum(['pending', 'invoiced', 'partially_paid', 'paid', 'waived']).optional(),
  notes: z.string().optional(),
  stageChangeNote: z.string().optional(),
});
