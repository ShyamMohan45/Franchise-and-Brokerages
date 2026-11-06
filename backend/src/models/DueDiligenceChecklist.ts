import { Schema, model, Document, Types } from 'mongoose';

export type DueDiligenceItemStatus = 'pending' | 'in_review' | 'verified' | 'flagged' | 'not_applicable';

export interface IDueDiligenceCategoryItem {
  itemId: string;
  category: string;
  title: string;
  description: string;
  status: DueDiligenceItemStatus;
  notes: string;
  verifiedAt?: Date;
  verifiedBy?: Types.ObjectId;
  documentRef?: string;
}

export interface IDueDiligenceChecklist extends Document {
  franchiseListing: Types.ObjectId;
  investor: Types.ObjectId;
  brokerageDeal?: Types.ObjectId;
  overallStatus: 'in_progress' | 'completed' | 'flagged_issues';
  completionPercentage: number;
  items: IDueDiligenceCategoryItem[];
  riskSummary: string;
  reviewedByBroker?: Types.ObjectId;
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
      enum: ['pending', 'in_review', 'verified', 'flagged', 'not_applicable'],
      default: 'pending',
    },
    notes: { type: String, default: '' },
    verifiedAt: { type: Date },
    verifiedBy: { type: Schema.Types.ObjectId, ref: 'User' },
    documentRef: { type: String, default: '' },
  },
  { _id: false }
);

const dueDiligenceChecklistSchema = new Schema<IDueDiligenceChecklist>(
  {
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
    brokerageDeal: {
      type: Schema.Types.ObjectId,
      ref: 'BrokerageDeal',
      index: true,
    },
    overallStatus: {
      type: String,
      enum: ['in_progress', 'completed', 'flagged_issues'],
      default: 'in_progress',
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
      default: 'Initial review pending. Verify core intellectual property and audited unit P&L.',
    },
    reviewedByBroker: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  {
    timestamps: true,
  }
);

export const DueDiligenceChecklist = model<IDueDiligenceChecklist>(
  'DueDiligenceChecklist',
  dueDiligenceChecklistSchema
);
