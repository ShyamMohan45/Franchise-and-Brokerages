import { Schema, model, Document, Types } from 'mongoose';

export type IntroductionStatus =
  | 'PENDING'
  | 'ADMIN_REVIEW'
  | 'ACCEPTED_BY_FRANCHISOR'
  | 'ACCEPTED_BY_INVESTOR'
  | 'MUTUALLY_ACCEPTED'
  | 'REJECTED'
  | 'CANCELLED'
  | 'DEAL_ROOM_CREATED';

export type IntroductionInitiator = 'investor' | 'franchisor' | 'admin';

export interface IIntroductionPartyConsent {
  consented: boolean;
  consentedAt?: Date;
  notes?: string;
  ipAddress?: string;
}

export interface IIntroductionAuditEntry {
  status: IntroductionStatus;
  changedBy: Types.ObjectId;
  changedByRole: string;
  note?: string;
  timestamp: Date;
}

export interface IIntroductionRequest extends Document {
  referenceNumber: string;
  franchise: Types.ObjectId;
  brandName: string;
  business: Types.ObjectId;
  businessOwnerUser: Types.ObjectId;
  investorUser: Types.ObjectId;
  investorProfile: Types.ObjectId;
  initiatedBy: IntroductionInitiator;
  status: IntroductionStatus;
  
  // Mutual Consent Tracking
  franchisorConsent: IIntroductionPartyConsent;
  investorConsent: IIntroductionPartyConsent;
  mutuallyAcceptedAt?: Date;

  // Introduction Target Economics & Parameters
  targetCity: string;
  targetState?: string;
  investmentBudget: number;
  availableLiquidCapital?: number;
  unitsInterested: number;
  initialMessage?: string;
  compatibilityScore?: number;

  // Admin Mediation & Oversight
  assignedBroker?: Types.ObjectId;
  adminMediationNotes?: string;
  isRecommendedByAdmin: boolean;
  adminDispatchedAt?: Date;

  // Linked Deal Room
  dealRoom?: Types.ObjectId;
  dealRoomCreatedAt?: Date;

  // Full Audit Trail
  history: IIntroductionAuditEntry[];

  createdAt: Date;
  updatedAt: Date;
}

const partyConsentSchema = new Schema<IIntroductionPartyConsent>(
  {
    consented: { type: Boolean, default: false },
    consentedAt: { type: Date },
    notes: { type: String, trim: true },
    ipAddress: { type: String, trim: true },
  },
  { _id: false }
);

const auditEntrySchema = new Schema<IIntroductionAuditEntry>(
  {
    status: {
      type: String,
      required: true,
      enum: [
        'PENDING',
        'ADMIN_REVIEW',
        'ACCEPTED_BY_FRANCHISOR',
        'ACCEPTED_BY_INVESTOR',
        'MUTUALLY_ACCEPTED',
        'REJECTED',
        'CANCELLED',
        'DEAL_ROOM_CREATED',
      ],
    },
    changedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    changedByRole: { type: String, required: true },
    note: { type: String, trim: true },
    timestamp: { type: Date, default: Date.now },
  },
  { _id: false }
);

const introductionRequestSchema = new Schema<IIntroductionRequest>(
  {
    referenceNumber: {
      type: String,
      required: true,
      unique: true,
      trim: true,
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
      required: true,
      trim: true,
    },
    business: {
      type: Schema.Types.ObjectId,
      ref: 'BusinessProfile',
      required: true,
      index: true,
    },
    businessOwnerUser: {
      type: Schema.Types.ObjectId,
      ref: 'User',
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
      index: true,
    },
    initiatedBy: {
      type: String,
      enum: ['investor', 'franchisor', 'admin'],
      required: true,
      index: true,
    },
    status: {
      type: String,
      enum: [
        'PENDING',
        'ADMIN_REVIEW',
        'ACCEPTED_BY_FRANCHISOR',
        'ACCEPTED_BY_INVESTOR',
        'MUTUALLY_ACCEPTED',
        'REJECTED',
        'CANCELLED',
        'DEAL_ROOM_CREATED',
      ],
      default: 'PENDING',
      required: true,
      index: true,
    },
    franchisorConsent: {
      type: partyConsentSchema,
      default: () => ({ consented: false }),
    },
    investorConsent: {
      type: partyConsentSchema,
      default: () => ({ consented: false }),
    },
    mutuallyAcceptedAt: {
      type: Date,
    },
    targetCity: {
      type: String,
      required: true,
      trim: true,
    },
    targetState: {
      type: String,
      trim: true,
    },
    investmentBudget: {
      type: Number,
      required: true,
    },
    availableLiquidCapital: {
      type: Number,
      default: 0,
    },
    unitsInterested: {
      type: Number,
      default: 1,
      min: 1,
    },
    initialMessage: {
      type: String,
      trim: true,
    },
    compatibilityScore: {
      type: Number,
      min: 0,
      max: 100,
    },
    assignedBroker: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    adminMediationNotes: {
      type: String,
      trim: true,
    },
    isRecommendedByAdmin: {
      type: Boolean,
      default: false,
    },
    adminDispatchedAt: {
      type: Date,
    },
    dealRoom: {
      type: Schema.Types.ObjectId,
      ref: 'DealRoom',
      index: true,
    },
    dealRoomCreatedAt: {
      type: Date,
    },
    history: [auditEntrySchema],
  },
  {
    timestamps: true,
  }
);

// Compound index to prevent duplicate active requests for the exact same investor and franchise opportunity
introductionRequestSchema.index(
  { franchise: 1, investorUser: 1, status: 1 },
  { name: 'idx_unique_active_intro' }
);

export const IntroductionRequest = model<IIntroductionRequest>(
  'IntroductionRequest',
  introductionRequestSchema
);
