import { z } from 'zod';

export const createLeadSchema = z.object({
  fullName: z.string().min(2, 'Full name is required'),
  email: z.string().email('Valid email is required'),
  phone: z.string().min(5, 'Valid phone is required'),
  company: z.string().optional(),
  leadType: z.enum([
    'brand_owner',
    'brand_partnership',
    'franchise_investor',
    'multi_unit_operator',
    'institutional',
    'investor',
  ]).default('franchise_investor'),
  source: z.string().default('website_form'),
  targetIndustry: z.string().optional(),
  preferredIndustry: z.string().optional(),
  preferredCity: z.string().optional(),
  preferredState: z.string().optional(),
  budgetMin: z.number().optional(),
  budgetMax: z.number().optional(),
  liquidCapital: z.number().optional(),
  investmentTimeline: z.string().optional(),
  businessExperience: z.string().optional(),
  investmentReadiness: z.enum(['high', 'medium', 'low', 'ready_to_invest', 'exploring']).default('exploring'),
  priority: z.enum(['low', 'medium', 'high', 'urgent']).default('medium'),
  internalNotes: z.string().default(''),
});

export const updateLeadSchema = createLeadSchema.partial().extend({
  status: z
    .enum(['new', 'contacted', 'qualified', 'meeting_scheduled', 'negotiation', 'converted', 'lost', 'not_qualified'])
    .optional(),
  qualificationStatus: z.enum(['NEW', 'CONTACTED', 'QUALIFIED', 'NOT_QUALIFIED']).optional(),
  qualificationNotes: z.string().optional(),
  followUpDate: z.string().optional(),
  lastContactDate: z.string().optional(),
  assignedBroker: z.string().optional(),
});

export const assignLeadSchema = z.object({
  brokerId: z.string().min(1, 'Broker ID is required'),
  note: z.string().optional(),
});

export const qualifyInvestorSchema = z.object({
  budgetMin: z.number().optional(),
  budgetMax: z.number().optional(),
  liquidCapital: z.number().optional(),
  preferredIndustry: z.string().optional(),
  preferredCity: z.string().optional(),
  preferredState: z.string().optional(),
  investmentTimeline: z.string().optional(),
  businessExperience: z.string().optional(),
  investmentReadiness: z.enum(['high', 'medium', 'low', 'ready_to_invest', 'exploring']).optional(),
  qualificationStatus: z.enum(['NEW', 'CONTACTED', 'QUALIFIED', 'NOT_QUALIFIED']),
  qualificationNotes: z.string().optional(),
});

export const createDealSchema = z.object({
  dealTitle: z.string().min(3, 'Deal title is required'),
  franchiseListingId: z.string().min(1, 'Franchise listing ID is required'),
  businessOwnerId: z.string().min(1, 'Business owner ID is required'),
  investorId: z.string().min(1, 'Investor ID is required'),
  applicationId: z.string().optional(),
  relatedLeadId: z.string().optional(),
  dealValue: z.number().min(0, 'Deal value is required'),
  franchiseFee: z.number().min(0, 'Franchise fee is required'),
  commissionType: z.enum(['percentage', 'fixed']).default('percentage'),
  commissionRate: z.number().default(0.05),
  expectedCommission: z.number().min(0, 'Expected commission is required'),
  notes: z.string().default(''),
  targetClosingDate: z.string().optional(),
  initialStage: z
    .enum([
      'NEW_ENQUIRY',
      'INITIAL_CONTACT',
      'QUALIFICATION',
      'BRAND_MATCHING',
      'MEETING_SCHEDULED',
      'NEGOTIATION',
      'DUE_DILIGENCE',
      'AGREEMENT',
      'CLOSED_WON',
      'CLOSED_LOST',
    ])
    .optional(),
});

export const updateDealStageSchema = z.object({
  stage: z.enum([
    'NEW_ENQUIRY',
    'INITIAL_CONTACT',
    'QUALIFICATION',
    'BRAND_MATCHING',
    'MEETING_SCHEDULED',
    'NEGOTIATION',
    'DUE_DILIGENCE',
    'AGREEMENT',
    'CLOSED_WON',
    'CLOSED_LOST',
    // Compatibility aliases
    'NEW_LEAD',
    'CONTACTED',
    'QUALIFIED',
    'OPPORTUNITY_PRESENTED',
    'lead_received',
    'qualification',
    'matching',
    'initial_discussion',
    'documentation_review',
    'agreement_pending',
    'deal_closed',
    'lost_cancelled',
  ]),
  stageChangeNote: z.string().optional(),
  notes: z.string().optional(),
  dealValue: z.number().optional(),
  actualCommissionEarned: z.number().optional(),
  paymentStatus: z.enum(['pending', 'invoiced', 'partially_paid', 'paid', 'waived']).optional(),
});

export const updateDealSchema = updateDealStageSchema;

export const createActivitySchema = z.object({
  type: z.enum(['note', 'call', 'email', 'meeting', 'status_change', 'qualification', 'assignment']),
  summary: z.string().min(2, 'Activity summary is required'),
  details: z.record(z.any()).optional(),
});

export const scheduleCrmMeetingSchema = z.object({
  title: z.string().min(3, 'Meeting title is required'),
  meetingType: z.enum([
    'franchise_intro',
    'fdd_review',
    'sop_consultation',
    'negotiation',
    'deal_closing',
    'readiness_audit',
  ]).default('franchise_intro'),
  participantIds: z.array(z.string()).min(1, 'At least one participant is required'),
  scheduledStartTime: z.string().min(1, 'Start time is required'),
  scheduledEndTime: z.string().min(1, 'End time is required'),
  relatedDeal: z.string().optional(),
  relatedLead: z.string().optional(),
  relatedFranchise: z.string().optional(),
  agenda: z.string().min(3, 'Meeting agenda is required'),
  notes: z.string().optional(),
  meetingUrl: z.string().optional(),
  locationDetails: z.string().optional(),
});
