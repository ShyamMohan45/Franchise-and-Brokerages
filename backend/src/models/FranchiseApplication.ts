import { Schema, model, Document, Types } from 'mongoose';

export type ApplicationStatus =
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
  franchise: Types.ObjectId;
  investorUser: Types.ObjectId;
  investorProfile: Types.ObjectId;
  businessOwnerUser: Types.ObjectId;
  proposedLocationCity: string;
  proposedLocationState?: string;
  unitsInterested: number;
  investmentBudget: number;
  availableLiquidCapital: number;
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
  assignedBroker?: Types.ObjectId;
  ownerFeedbackNotes?: string;
  privacyConsentGiven: boolean;
  ndaSigned: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const franchiseApplicationSchema = new Schema<IFranchiseApplication>(
  {
    franchise: {
      type: Schema.Types.ObjectId,
      ref: 'FranchiseListing',
      required: true,
      index: true,
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
    availableLiquidCapital: {
      type: Number,
      required: true,
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
      default: 'submitted',
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
    assignedBroker: { type: Schema.Types.ObjectId, ref: 'User' },
    ownerFeedbackNotes: { type: String },
    privacyConsentGiven: { type: Boolean, default: true },
    ndaSigned: { type: Boolean, default: false },
  },
  {
    timestamps: true,
  }
);

franchiseApplicationSchema.index({ franchise: 1, investorUser: 1 });

export const FranchiseApplication = model<IFranchiseApplication>('FranchiseApplication', franchiseApplicationSchema);
