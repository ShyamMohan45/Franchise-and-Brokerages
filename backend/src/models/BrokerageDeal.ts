import { Schema, model, Document, Types } from 'mongoose';

export type DealStage =
  | 'NEW_LEAD'
  | 'CONTACTED'
  | 'QUALIFIED'
  | 'MEETING_SCHEDULED'
  | 'OPPORTUNITY_PRESENTED'
  | 'DUE_DILIGENCE'
  | 'NEGOTIATION'
  | 'CLOSED_WON'
  | 'CLOSED_LOST'
  | 'lead_received'
  | 'qualification'
  | 'matching'
  | 'initial_discussion'
  | 'documentation_review'
  | 'negotiation'
  | 'agreement_pending'
  | 'deal_closed'
  | 'lost_cancelled';

export interface IBrokerageDeal extends Document {
  dealTitle: string;
  franchiseListing: Types.ObjectId;
  businessOwner: Types.ObjectId;
  investor: Types.ObjectId;
  applicationRef?: Types.ObjectId;
  stage: DealStage;
  dealValue: number; // total expected capital investment
  franchiseFee: number;
  commissionType: 'percentage' | 'fixed';
  commissionRate: number; // e.g., 0.05 for 5%
  expectedCommission: number;
  actualCommissionEarned?: number;
  paymentStatus: 'pending' | 'invoiced' | 'partially_paid' | 'paid' | 'waived';
  assignedBroker: Types.ObjectId;
  stageHistory: Array<{
    stage: DealStage;
    changedBy: Types.ObjectId;
    note?: string;
    timestamp: Date;
  }>;
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
    stage: {
      type: String,
      enum: [
        'NEW_LEAD',
        'CONTACTED',
        'QUALIFIED',
        'MEETING_SCHEDULED',
        'OPPORTUNITY_PRESENTED',
        'DUE_DILIGENCE',
        'NEGOTIATION',
        'negotiation',
        'CLOSED_WON',
        'CLOSED_LOST',
        'lead_received',
        'qualification',
        'matching',
        'initial_discussion',
        'documentation_review',
        'agreement_pending',
        'deal_closed',
        'lost_cancelled',
      ],
      default: 'NEW_LEAD',
      index: true,
    },
    dealValue: {
      type: Number,
      required: true,
    },
    franchiseFee: {
      type: Number,
      required: true,
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
      required: true,
    },
    actualCommissionEarned: {
      type: Number,
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
        changedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
        note: { type: String },
        timestamp: { type: Date, default: Date.now },
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

export const BrokerageDeal = model<IBrokerageDeal>('BrokerageDeal', brokerageDealSchema);
export const Deal = BrokerageDeal;
export type IDeal = IBrokerageDeal;
