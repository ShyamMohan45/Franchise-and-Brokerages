import { z } from 'zod';

export const createSopDocumentSchema = z.object({
  businessId: z.string().min(1, 'Business ID is required'),
  title: z.string().min(3, 'Title is required'),
  category: z.enum([
    'daily_operations',
    'employee_training',
    'customer_service',
    'inventory_management',
    'quality_control',
    'health_and_safety',
    'marketing_procedures',
    'financial_operations',
    'opening_closing_procedures',
  ]),
  summary: z.string().min(10, 'Summary is required'),
  contentMarkdown: z.string().optional(),
  fileUrl: z.string().optional(),
  fileName: z.string().optional(),
  checklists: z
    .array(
      z.object({
        item: z.string().min(1),
        isMandatory: z.boolean().default(true),
        completed: z.boolean().default(false),
      })
    )
    .default([]),
  jurisdiction: z.string().default('GLOBAL'),
});

export const updateSopStatusSchema = z.object({
  status: z.enum(['draft', 'under_review', 'approved', 'revision_requested', 'archived']),
  reviewNotes: z.string().optional(),
});

export const createLegalDocumentSchema = z.object({
  businessId: z.string().min(1, 'Business ID is required'),
  documentType: z.enum([
    'fdd_master',
    'fdd_item_disclosure',
    'franchise_agreement',
    'ip_trademark_license',
    'non_disclosure_agreement',
    'territory_addendum',
    'financial_audit_disclosure',
    'franchise_information_memorandum',
  ]),
  title: z.string().min(3, 'Title is required'),
  fddItemNumber: z.number().int().min(1).max(23).optional(),
  jurisdiction: z.enum(['US', 'IN', 'UK', 'GLOBAL']).default('GLOBAL'),
  storageKey: z.string().min(1, 'Storage key / file is required'),
  originalFileName: z.string().min(1, 'Original file name is required'),
  fileSizeBytes: z.number().min(1).default(1024),
  mimeType: z.string().default('application/pdf'),
  complianceChecklist: z
    .array(
      z.object({
        clause: z.string(),
        isCompliant: z.boolean().default(false),
        attorneyComment: z.string().optional(),
      })
    )
    .default([]),
});

export const updateLegalDocStatusSchema = z.object({
  status: z.enum(['draft', 'legal_review', 'approved', 'action_required', 'archived']),
  legalReviewNotes: z.string().optional(),
});
