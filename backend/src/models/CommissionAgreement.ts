import { Schema, model, Document, Types } from 'mongoose';

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

export interface ICommissionMilestone {
  title: string;
  percentage: number; // e.g. 25 for 25%
  amount: number; // in INR
  amountPaise: number; // integer paise
  triggerStage: string; // e.g. BRAND_MATCHING, DUE_DILIGENCE, AGREEMENT, CLOSED_WON
  dueDate?: Date;
  status: MilestonePaymentStatus;
  paidAmount: number;
  paidAmountPaise: number;
}

export interface IApprovalHistory {
  status: string;
  actionBy: Types.ObjectId;
  actionAt: Date;
  notes?: string;
}

export interface ICommissionAgreement extends Document {
  agreementNumber: string;
  deal: Types.ObjectId;
  brand: Types.ObjectId;
  brandProfile?: Types.ObjectId;
  franchiseListing?: Types.ObjectId;
  investor?: Types.ObjectId;
  assignedBroker: Types.ObjectId;
  commissionType: CommissionType;
  commissionRate?: number; // e.g. 5 for 5%
  fixedAmount?: number;
  fixedAmountPaise?: number;
  payer: CommissionPayer;
  calculationBasis: CommissionCalculationBasis;
  baseAmount: number; // The amount on which percentage is applied (INR)
  baseAmountPaise: number;
  expectedCommission: number; // Total expected commission in INR
  expectedCommissionPaise: number;
  earnedCommission: number; // Commission earned upon stage transitions
  earnedCommissionPaise: number;
  receivedRevenue: number; // Actually verified collected revenue
  receivedRevenuePaise: number;
  pendingCommission: number; // expectedCommission - receivedRevenue
  pendingCommissionPaise: number;
  milestones: ICommissionMilestone[];
  status: CommissionAgreementStatus;
  approvalHistory: IApprovalHistory[];
  termsAndConditions?: string;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const milestoneSchema = new Schema<ICommissionMilestone>(
  {
    title: { type: String, required: true, trim: true },
    percentage: { type: Number, required: true, min: 0, max: 100 },
    amount: { type: Number, required: true, min: 0 },
    amountPaise: { type: Number, required: true, default: 0 },
    triggerStage: { type: String, required: true, default: 'CLOSED_WON' },
    dueDate: { type: Date },
    status: {
      type: String,
      enum: ['PENDING', 'DUE', 'OVERDUE', 'PARTIALLY_PAID', 'PAID'],
      default: 'PENDING',
    },
    paidAmount: { type: Number, default: 0 },
    paidAmountPaise: { type: Number, default: 0 },
  },
  { _id: false }
);

const approvalHistorySchema = new Schema<IApprovalHistory>(
  {
    status: { type: String, required: true },
    actionBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    actionAt: { type: Date, default: Date.now },
    notes: { type: String, default: '' },
  },
  { _id: false }
);

const commissionAgreementSchema = new Schema<ICommissionAgreement>(
  {
    agreementNumber: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      index: true,
    },
    deal: {
      type: Schema.Types.ObjectId,
      ref: 'BrokerageDeal',
      required: true,
      index: true,
    },
    brand: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    brandProfile: {
      type: Schema.Types.ObjectId,
      ref: 'BusinessProfile',
    },
    franchiseListing: {
      type: Schema.Types.ObjectId,
      ref: 'FranchiseListing',
    },
    investor: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    assignedBroker: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    commissionType: {
      type: String,
      enum: ['percentage', 'fixed'],
      required: true,
      default: 'percentage',
    },
    commissionRate: {
      type: Number,
      default: 0,
    },
    fixedAmount: {
      type: Number,
      default: 0,
    },
    fixedAmountPaise: {
      type: Number,
      default: 0,
    },
    payer: {
      type: String,
      enum: ['brand', 'investor', 'split'],
      default: 'brand',
    },
    calculationBasis: {
      type: String,
      enum: ['deal_value', 'franchise_fee', 'fixed'],
      default: 'deal_value',
    },
    baseAmount: {
      type: Number,
      required: true,
      default: 0,
    },
    baseAmountPaise: {
      type: Number,
      default: 0,
    },
    expectedCommission: {
      type: Number,
      required: true,
      default: 0,
    },
    expectedCommissionPaise: {
      type: Number,
      default: 0,
    },
    earnedCommission: {
      type: Number,
      default: 0,
    },
    earnedCommissionPaise: {
      type: Number,
      default: 0,
    },
    receivedRevenue: {
      type: Number,
      default: 0,
    },
    receivedRevenuePaise: {
      type: Number,
      default: 0,
    },
    pendingCommission: {
      type: Number,
      default: 0,
    },
    pendingCommissionPaise: {
      type: Number,
      default: 0,
    },
    milestones: [milestoneSchema],
    status: {
      type: String,
      enum: ['DRAFT', 'PENDING_APPROVAL', 'ACTIVE', 'COMPLETED', 'TERMINATED'],
      default: 'DRAFT',
      index: true,
    },
    approvalHistory: [approvalHistorySchema],
    termsAndConditions: {
      type: String,
      default:
        'Standard brokerage commission payable in INR as per milestone triggers upon receipt of corresponding capital investment or franchise fee.',
    },
    notes: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

// Pre-save hook to synchronize integer paise fields strictly
commissionAgreementSchema.pre('save', function (next) {
  if (this.baseAmount !== undefined && this.baseAmount !== null) {
    this.baseAmountPaise = Math.round(this.baseAmount * 100);
  }
  if (this.fixedAmount !== undefined && this.fixedAmount !== null) {
    this.fixedAmountPaise = Math.round(this.fixedAmount * 100);
  }
  if (this.expectedCommission !== undefined && this.expectedCommission !== null) {
    this.expectedCommissionPaise = Math.round(this.expectedCommission * 100);
  }
  if (this.earnedCommission !== undefined && this.earnedCommission !== null) {
    this.earnedCommissionPaise = Math.round(this.earnedCommission * 100);
  }
  if (this.receivedRevenue !== undefined && this.receivedRevenue !== null) {
    this.receivedRevenuePaise = Math.round(this.receivedRevenue * 100);
  }

  // Pending = expected - received
  this.pendingCommission = Math.max(0, this.expectedCommission - this.receivedRevenue);
  this.pendingCommissionPaise = Math.round(this.pendingCommission * 100);

  // Sync milestones integer paise
  if (this.milestones && this.milestones.length > 0) {
    for (const m of this.milestones) {
      if (m.amount !== undefined && m.amount !== null) {
        m.amountPaise = Math.round(m.amount * 100);
      }
      if (m.paidAmount !== undefined && m.paidAmount !== null) {
        m.paidAmountPaise = Math.round(m.paidAmount * 100);
      }
    }
  }

  next();
});

commissionAgreementSchema.index({ assignedBroker: 1, status: 1 });
commissionAgreementSchema.index({ brand: 1, deal: 1 });

export const CommissionAgreement = model<ICommissionAgreement>(
  'CommissionAgreement',
  commissionAgreementSchema
);
