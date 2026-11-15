export type CommissionType = 'percentage' | 'fixed';
export type CommissionPayer = 'brand' | 'investor' | 'split';
export type CommissionCalculationBasis = 'deal_value' | 'franchise_fee' | 'fixed';
export type CommissionAgreementStatus =
  | 'DRAFT'
  | 'PENDING_APPROVAL'
  | 'ACTIVE'
  | 'COMPLETED'
  | 'TERMINATED';

export type MilestonePaymentStatus =
  | 'PENDING'
  | 'DUE'
  | 'OVERDUE'
  | 'PARTIALLY_PAID'
  | 'PAID';

export interface CommissionMilestone {
  title: string;
  percentage: number;
  amount: number;
  amountPaise: number;
  triggerStage: string;
  dueDate?: string;
  status: MilestonePaymentStatus;
  paidAmount: number;
  paidAmountPaise: number;
}

export interface CommissionPayment {
  _id: string;
  paymentReference: string;
  agreement: string;
  deal?: string;
  milestoneTitle?: string;
  amount: number;
  amountPaise: number;
  currency: string;
  paymentMethod: string;
  paymentDate: string;
  payerName: string;
  payerRole: string;
  receivedBy?: {
    _id: string;
    fullName: string;
    email: string;
  };
  status: 'PENDING' | 'VERIFIED' | 'REJECTED';
  notes?: string;
  invoiceNumber?: string;
  createdAt: string;
}

export interface CommissionAgreement {
  _id: string;
  agreementNumber: string;
  deal?: {
    _id: string;
    dealTitle: string;
    stage: string;
    dealValue: number;
    franchiseFee?: number;
  };
  brand?: {
    _id: string;
    fullName: string;
    email: string;
    phone?: string;
  };
  investor?: {
    _id: string;
    fullName: string;
    email: string;
    phone?: string;
  };
  assignedBroker?: {
    _id: string;
    fullName: string;
    email: string;
    phone?: string;
  };
  franchiseListing?: {
    _id: string;
    brandName: string;
    slug?: string;
    logoUrl?: string;
  };
  commissionType: CommissionType;
  commissionRate?: number;
  fixedAmount?: number;
  fixedAmountPaise?: number;
  payer: CommissionPayer;
  calculationBasis: CommissionCalculationBasis;
  baseAmount: number;
  baseAmountPaise: number;
  expectedCommission: number;
  expectedCommissionPaise: number;
  earnedCommission: number;
  earnedCommissionPaise: number;
  receivedRevenue: number;
  receivedRevenuePaise: number;
  pendingCommission: number;
  pendingCommissionPaise: number;
  milestones: CommissionMilestone[];
  payments?: CommissionPayment[];
  status: CommissionAgreementStatus;
  termsAndConditions?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CommissionStatement {
  statementNumber: string;
  generatedAt: string;
  agreementNumber: string;
  currency: string;
  dealTitle?: string;
  broker?: string;
  payer: string;
  summary: {
    totalExpected: number;
    totalReceived: number;
    pendingBalance: number;
  };
  financialSummary: {
    baseAmount: number;
    calculationBasis: string;
    commissionType: string;
    commissionRate?: number;
    expectedCommission: number;
    receivedRevenue: number;
    pendingCommission: number;
    paymentStatus: string;
  };
  milestones: CommissionMilestone[];
  payments: Array<{
    paymentReference: string;
    paymentDate: string;
    paymentMethod: string;
    amount: number;
    payerName: string;
    status: string;
    notes?: string;
  }>;
}
