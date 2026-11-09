import { z } from 'zod';

export const createDealDocumentSchema = z.object({
  title: z.string().min(2, 'Document title is required'),
  category: z.enum([
    'BRAND_PROFILE',
    'FRANCHISE_DISCLOSURE',
    'FINANCIAL',
    'AGREEMENT_DRAFT',
    'IDENTITY_BUSINESS',
    'PROPERTY_LOCATION',
    'DUE_DILIGENCE_EVIDENCE',
    'OTHER_SUPPORTING',
  ]),
  isInternalOnly: z.union([z.boolean(), z.string().transform((val) => val === 'true')]).optional(),
  allowedRoles: z.union([z.array(z.string()), z.string().transform((val) => val.split(',').map((s) => s.trim()))]).optional(),
  relatedDiligenceItem: z.string().optional(),
  notes: z.string().optional(),
});

export const updateDealDocumentStatusSchema = z.object({
  status: z.enum(['PENDING', 'SUBMITTED', 'UNDER_REVIEW', 'APPROVED', 'REJECTED', 'SUPERSEDED']),
  reviewerNotes: z.string().optional(),
});

export const updateDiligenceItemSchema = z.object({
  status: z.enum([
    'PENDING',
    'IN_PROGRESS',
    'SUBMITTED',
    'UNDER_REVIEW',
    'APPROVED',
    'REJECTED',
    'NEEDS_CLARIFICATION',
    // Legacy support
    'pending',
    'in_review',
    'verified',
    'flagged',
    'not_applicable',
  ]),
  notes: z.string().optional(),
  reviewerNotes: z.string().optional(),
  evidenceDocumentIds: z.array(z.string()).optional(),
  clarificationRequest: z.string().optional(),
  deadline: z.string().datetime().optional(),
});

export const createDealMessageSchema = z.object({
  text: z.string().min(1, 'Message text is required'),
  isInternal: z.boolean().optional(),
  relatedDocument: z.string().optional(),
  relatedDiligenceItem: z.string().optional(),
});
