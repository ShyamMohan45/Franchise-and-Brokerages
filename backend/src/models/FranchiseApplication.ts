import { Schema, model, Document, Types } from 'mongoose';

export type ApplicationStatus =
  | 'NEW'
  | 'ASSIGNED'
  | 'CONTACTED'
  | 'QUALIFIED'
  | 'IN_PROGRESS'
  | 'CONVERTED'
  | 'CLOSED'
  | 'submitted'
  | 'under_review'
  | 'vetted_by_broker'
  | 'introduced_to_owner'
  | 'in_discussion'
  | 'documentation_review'
  | 'negotiation'
  | 'approved_for_deal'
  | 'deal_closed'
  | 'rejected'
  | 'withdrawn';

export interface IFranchiseApplication extends Document {
  referenceNumber: string;
  franchise: Types.ObjectId;
  brandName?: string;
  opportunityTitle?: string;
  investorUser: Types.ObjectId;
  investorProfile: Types.ObjectId;
  businessOwnerUser: Types.ObjectId;
  proposedLocationCity: string;
  proposedLocationState?: string;
  unitsInterested: number;
  investmentBudget: number;
  investmentBudgetPaise: number;
  availableLiquidCapital: number;
  availableLiquidCapitalPaise: number;
  timeline: string;
  businessBackgroundSummary: string;
  additionalMessage?: string;
  status: ApplicationStatus;
  statusHistory: Array<{
    status: ApplicationStatus;
    changedBy: Types.ObjectId;
    note?: string;
    timestamp: Date;
  }>;
  brokerNotes?: string;
  internalNotes?: string;
  assignedBroker?: Types.ObjectId;
  ownerFeedbackNotes?: string;
  privacyConsentGiven: boolean;
  ndaSigned: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const franchiseApplicationSchema = new Schema<IFranchiseApplication>(
  {
    referenceNumber: {
      type: String,
      unique: true,
      index: true,
    },
    franchise: {
      type: Schema.Types.ObjectId,
      ref: 'FranchiseListing',
      required: true,
      index: true,
    },
    brandName: {
      type: String,
      trim: true,
    },
    opportunityTitle: {
      type: String,
      trim: true,
    },
    investorUser: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    investorProfile: {
      type: Schema.Types.ObjectId,
      ref: 'InvestorProfile',
      required: true,
    },
    businessOwnerUser: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    proposedLocationCity: {
      type: String,
      required: true,
      trim: true,
    },
    proposedLocationState: {
      type: String,
      trim: true,
    },
    unitsInterested: {
      type: Number,
      required: true,
      default: 1,
    },
    investmentBudget: {
      type: Number,
      required: true,
    },
    investmentBudgetPaise: {
      type: Number,
      default: 0,
    },
    availableLiquidCapital: {
      type: Number,
      required: true,
    },
    availableLiquidCapitalPaise: {
      type: Number,
      default: 0,
    },
    timeline: {
      type: String,
      required: true,
    },
    businessBackgroundSummary: {
      type: String,
      required: true,
    },
    additionalMessage: {
      type: String,
    },
    status: {
      type: String,
      enum: [
        'NEW',
        'ASSIGNED',
        'CONTACTED',
        'QUALIFIED',
        'IN_PROGRESS',
        'CONVERTED',
        'CLOSED',
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
      ],
      default: 'NEW',
      index: true,
    },
    statusHistory: [
      {
        status: { type: String, required: true },
        changedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
        note: { type: String },
        timestamp: { type: Date, default: Date.now },
      },
    ],
    brokerNotes: { type: String },
    internalNotes: { type: String },
    assignedBroker: { type: Schema.Types.ObjectId, ref: 'User', index: true },
    ownerFeedbackNotes: { type: String },
    privacyConsentGiven: { type: Boolean, default: true },
    ndaSigned: { type: Boolean, default: false },
  },
  {
    timestamps: true,
  }
);

franchiseApplicationSchema.index({ franchise: 1, investorUser: 1 });

franchiseApplicationSchema.pre('save', function (next) {
  if (!this.referenceNumber) {
    const today = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const rand = Math.random().toString(36).substring(2, 6).toUpperCase();
    this.referenceNumber = `ENQ-${today}-${rand}`;
  }
  if (this.investmentBudget !== undefined) {
    this.investmentBudgetPaise = Math.round(Number(this.investmentBudget) * 100);
  }
  if (this.availableLiquidCapital !== undefined) {
    this.availableLiquidCapitalPaise = Math.round(Number(this.availableLiquidCapital) * 100);
  }
  next();
});

export const FranchiseApplication = model<IFranchiseApplication>('FranchiseApplication', franchiseApplicationSchema);
export const Enquiry = FranchiseApplication;
export type IEnquiry = IFranchiseApplication;
