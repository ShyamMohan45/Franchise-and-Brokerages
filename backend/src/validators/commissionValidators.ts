import { z } from 'zod';

export const createCommissionAgreementSchema = z.object({
  dealId: z.string().min(1, 'dealId is required'),
  commissionType: z.enum(['percentage', 'fixed']),
  commissionRate: z.number().min(0).max(100).optional(),
  fixedAmount: z.number().min(0).optional(),
  payer: z.enum(['brand', 'investor', 'split']).optional().default('brand'),
  calculationBasis: z.enum(['deal_value', 'franchise_fee', 'fixed']).optional().default('deal_value'),
  baseAmount: z.number().min(0).optional(),
  milestones: z
    .array(
      z.object({
        title: z.string().min(1, 'Milestone title is required'),
        percentage: z.number().min(0).max(100),
        amount: z.number().min(0),
        triggerStage: z.string().default('CLOSED_WON'),
        dueDate: z.string().optional(),
      })
    )
    .optional(),
  termsAndConditions: z.string().optional(),
  notes: z.string().optional(),
});

export const updateCommissionAgreementStatusSchema = z.object({
  status: z.enum(['DRAFT', 'PENDING_APPROVAL', 'ACTIVE', 'COMPLETED', 'TERMINATED']),
  notes: z.string().optional(),
});

export const recordCommissionPaymentSchema = z.object({
  agreementId: z.string().min(1, 'agreementId is required'),
  paymentReference: z.string().min(3, 'Unique payment reference or UTR is required'),
  amount: z.number().min(1, 'Payment amount must be greater than 0'),
  paymentMethod: z.enum(['NEFT', 'RTGS', 'IMPS', 'UPI', 'CHEQUE', 'BANK_TRANSFER']),
  paymentDate: z.string().optional(),
  payerName: z.string().min(2, 'Payer name is required'),
  payerRole: z.enum(['brand', 'investor']).optional().default('brand'),
  milestoneTitle: z.string().optional(),
  invoiceNumber: z.string().optional(),
  notes: z.string().optional(),
});
