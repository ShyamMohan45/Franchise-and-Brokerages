import { Schema, model, Document, Types } from 'mongoose';

export type DealStage =
  | 'NEW_ENQUIRY'
  | 'INITIAL_CONTACT'
  | 'QUALIFICATION'
  | 'BRAND_MATCHING'
  | 'MEETING_SCHEDULED'
  | 'NEGOTIATION'
  | 'DUE_DILIGENCE'
  | 'AGREEMENT'
  | 'CLOSED_WON'
  | 'CLOSED_LOST'
  // Legacy compatibility aliases
  | 'NEW_LEAD'
  | 'CONTACTED'
  | 'QUALIFIED'
  | 'OPPORTUNITY_PRESENTED'
  | 'lead_received'
  | 'qualification'
  | 'matching'
  | 'initial_discussion'
  | 'documentation_review'
  | 'negotiation'
  | 'agreement_pending'
  | 'deal_closed'
  | 'lost_cancelled';

export interface IDealStageHistory {
  stage: DealStage;
  previousStage?: DealStage;
  changedBy: Types.ObjectId;
  note?: string;
  timestamp: Date;
}

export interface IDealActivity {
  type: 'note' | 'call' | 'email' | 'meeting' | 'stage_change' | 'task';
  summary: string;
  performedBy: Types.ObjectId;
  timestamp: Date;
  details?: Record<string, any>;
}

export interface IBrokerageDeal extends Document {
  dealTitle: string;
  franchiseListing: Types.ObjectId;
  businessOwner: Types.ObjectId;
  investor: Types.ObjectId;
  applicationRef?: Types.ObjectId;
  relatedLead?: Types.ObjectId;
  stage: DealStage;
  dealValue: number; // total expected capital investment in INR
  dealValuePaise?: number;
  franchiseFee: number;
  franchiseFeePaise?: number;
  commissionType: 'percentage' | 'fixed';
  commissionRate: number; // e.g., 0.05 for 5%
  expectedCommission: number;
  expectedCommissionPaise?: number;
  actualCommissionEarned?: number;
  actualCommissionEarnedPaise?: number;
  paymentStatus: 'pending' | 'invoiced' | 'partially_paid' | 'paid' | 'waived';
  assignedBroker: Types.ObjectId;
  stageHistory: IDealStageHistory[];
  activities: IDealActivity[];
  targetClosingDate?: Date;
  closedAt?: Date;
  notes: string;
  createdAt: Date;
  updatedAt: Date;
}

const brokerageDealSchema = new Schema<IBrokerageDeal>(
  {
    dealTitle: {
      type: String,
      required: true,
      trim: true,
    },
    franchiseListing: {
      type: Schema.Types.ObjectId,
      ref: 'FranchiseListing',
      required: true,
      index: true,
    },
    businessOwner: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    investor: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    applicationRef: {
      type: Schema.Types.ObjectId,
      ref: 'FranchiseApplication',
    },
    relatedLead: {
      type: Schema.Types.ObjectId,
      ref: 'Lead',
    },
    stage: {
      type: String,
      enum: [
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
        // Legacy compatibility aliases
        'NEW_LEAD',
        'CONTACTED',
        'QUALIFIED',
        'OPPORTUNITY_PRESENTED',
        'lead_received',
        'qualification',
        'matching',
        'initial_discussion',
        'documentation_review',
        'negotiation',
        'agreement_pending',
        'deal_closed',
        'lost_cancelled',
      ],
      default: 'NEW_ENQUIRY',
      index: true,
    },
    dealValue: {
      type: Number,
      required: true,
      default: 0,
    },
    dealValuePaise: {
      type: Number,
      default: 0,
    },
    franchiseFee: {
      type: Number,
      required: true,
      default: 0,
    },
    franchiseFeePaise: {
      type: Number,
      default: 0,
    },
    commissionType: {
      type: String,
      enum: ['percentage', 'fixed'],
      default: 'percentage',
    },
    commissionRate: {
      type: Number,
      default: 0.05,
    },
    expectedCommission: {
      type: Number,
      default: 0,
    },
    expectedCommissionPaise: {
      type: Number,
      default: 0,
    },
    actualCommissionEarned: {
      type: Number,
      default: 0,
    },
    actualCommissionEarnedPaise: {
      type: Number,
      default: 0,
    },
    paymentStatus: {
      type: String,
      enum: ['pending', 'invoiced', 'partially_paid', 'paid', 'waived'],
      default: 'pending',
    },
    assignedBroker: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    stageHistory: [
      {
        stage: { type: String, required: true },
        previousStage: { type: String },
        changedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
        note: { type: String, default: '' },
        timestamp: { type: Date, default: Date.now },
      },
    ],
    activities: [
      {
        type: {
          type: String,
          enum: ['note', 'call', 'email', 'meeting', 'stage_change', 'task'],
          required: true,
        },
        summary: { type: String, required: true },
        performedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
        timestamp: { type: Date, default: Date.now },
        details: { type: Schema.Types.Mixed },
      },
    ],
    targetClosingDate: {
      type: Date,
    },
    closedAt: {
      type: Date,
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

// Pre-save hook to calculate integer paise
brokerageDealSchema.pre('save', function (next) {
  if (this.dealValue !== undefined && this.dealValue !== null) {
    this.dealValuePaise = Math.round(this.dealValue * 100);
  }
  if (this.franchiseFee !== undefined && this.franchiseFee !== null) {
    this.franchiseFeePaise = Math.round(this.franchiseFee * 100);
  }
  if (this.expectedCommission !== undefined && this.expectedCommission !== null) {
    this.expectedCommissionPaise = Math.round(this.expectedCommission * 100);
  }
  if (this.actualCommissionEarned !== undefined && this.actualCommissionEarned !== null) {
    this.actualCommissionEarnedPaise = Math.round(this.actualCommissionEarned * 100);
  }
  next();
});

brokerageDealSchema.index({ assignedBroker: 1, stage: 1 });

export const BrokerageDeal = model<IBrokerageDeal>('BrokerageDeal', brokerageDealSchema);
