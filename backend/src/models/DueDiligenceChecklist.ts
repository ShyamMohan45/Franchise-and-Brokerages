import { Schema, model, Document, Types } from 'mongoose';

export type DueDiligenceItemStatus =
  | 'PENDING'
  | 'IN_PROGRESS'
  | 'SUBMITTED'
  | 'UNDER_REVIEW'
  | 'APPROVED'
  | 'REJECTED'
  | 'NEEDS_CLARIFICATION'
  // Legacy aliases for backward compatibility
  | 'pending'
  | 'in_review'
  | 'verified'
  | 'flagged'
  | 'not_applicable';

export interface IDueDiligenceCategoryItem {
  itemId: string;
  category: string;
  title: string;
  description: string;
  status: DueDiligenceItemStatus;
  notes: string;
  reviewerNotes?: string;
  reviewedBy?: Types.ObjectId;
  reviewedAt?: Date;
  verifiedAt?: Date;
  verifiedBy?: Types.ObjectId;
  documentRef?: string;
  evidenceDocuments?: Types.ObjectId[];
  clarificationRequest?: string;
  deadline?: Date;
}

export interface IDueDiligenceChecklist extends Document {
  deal?: Types.ObjectId;
  dealRoom?: Types.ObjectId;
  brokerageDeal?: Types.ObjectId; // Backwards compatibility
  franchiseListing: Types.ObjectId;
  investor: Types.ObjectId;
  businessOwner?: Types.ObjectId;
  assignedBroker?: Types.ObjectId;
  reviewedByBroker?: Types.ObjectId;
  overallStatus: 'PENDING' | 'IN_PROGRESS' | 'UNDER_REVIEW' | 'APPROVED' | 'NEEDS_CLARIFICATION' | 'REJECTED' | 'in_progress' | 'completed' | 'flagged_issues';
  completionPercentage: number;
  items: IDueDiligenceCategoryItem[];
  riskSummary: string;
  disclaimer: string;
  createdAt: Date;
  updatedAt: Date;
}

const itemSchema = new Schema<IDueDiligenceCategoryItem>(
  {
    itemId: { type: String, required: true },
    category: { type: String, required: true },
    title: { type: String, required: true },
    description: { type: String, default: '' },
    status: {
      type: String,
      enum: [
        'PENDING',
        'IN_PROGRESS',
        'SUBMITTED',
        'UNDER_REVIEW',
        'APPROVED',
        'REJECTED',
        'NEEDS_CLARIFICATION',
        // Legacy aliases
        'pending',
        'in_review',
        'verified',
        'flagged',
        'not_applicable',
      ],
      default: 'PENDING',
    },
    notes: { type: String, default: '' },
    reviewerNotes: { type: String, default: '' },
    reviewedBy: { type: Schema.Types.ObjectId, ref: 'User' },
    reviewedAt: { type: Date },
    verifiedAt: { type: Date },
    verifiedBy: { type: Schema.Types.ObjectId, ref: 'User' },
    documentRef: { type: String, default: '' },
    evidenceDocuments: [{ type: Schema.Types.ObjectId, ref: 'DealDocument' }],
    clarificationRequest: { type: String, default: '' },
    deadline: { type: Date },
  },
  { _id: false }
);

const dueDiligenceChecklistSchema = new Schema<IDueDiligenceChecklist>(
  {
    deal: {
      type: Schema.Types.ObjectId,
      ref: 'BrokerageDeal',
      index: true,
    },
    dealRoom: {
      type: Schema.Types.ObjectId,
      ref: 'DealRoom',
      index: true,
    },
    brokerageDeal: {
      type: Schema.Types.ObjectId,
      ref: 'BrokerageDeal',
      index: true,
    },
    franchiseListing: {
      type: Schema.Types.ObjectId,
      ref: 'FranchiseListing',
      required: true,
      index: true,
    },
    investor: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    businessOwner: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      index: true,
    },
    assignedBroker: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      index: true,
    },
    reviewedByBroker: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    overallStatus: {
      type: String,
      default: 'PENDING',
    },
    completionPercentage: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
    items: [itemSchema],
    riskSummary: {
      type: String,
      default: 'Due diligence initialized. 11 core statutory, commercial, and operational checks pending review.',
    },
    disclaimer: {
      type: String,
      default:
        'Due diligence checklist items and status marks reflect brokerage administrative diligence review. They do not constitute formal legal guarantees, statutory warranties, or binding investment advice.',
    },
  },
  {
    timestamps: true,
  }
);

dueDiligenceChecklistSchema.index({ deal: 1, investor: 1 });

export const DueDiligenceChecklist = model<IDueDiligenceChecklist>(
  'DueDiligenceChecklist',
  dueDiligenceChecklistSchema
);
