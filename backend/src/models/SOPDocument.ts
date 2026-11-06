import { Schema, model, Document, Types } from 'mongoose';

export type SOPCategory =
  | 'daily_operations'
  | 'employee_training'
  | 'customer_service'
  | 'inventory_management'
  | 'quality_control'
  | 'health_and_safety'
  | 'marketing_procedures'
  | 'financial_operations'
  | 'opening_closing_procedures';

export type DocumentWorkflowStatus = 'draft' | 'under_review' | 'approved' | 'revision_requested' | 'archived';

export interface ISOPDocument extends Document {
  business: Types.ObjectId;
  title: string;
  category: SOPCategory;
  summary: string;
  version: number;
  status: DocumentWorkflowStatus;
  contentMarkdown?: string;
  fileUrl?: string;
  fileName?: string;
  fileSizeBytes?: number;
  mimeType?: string;
  author: Types.ObjectId;
  reviewedBy?: Types.ObjectId;
  reviewNotes?: string;
  checklists: Array<{
    item: string;
    isMandatory: boolean;
    completed: boolean;
  }>;
  jurisdiction: string;
  createdAt: Date;
  updatedAt: Date;
}

const sopDocumentSchema = new Schema<ISOPDocument>(
  {
    business: {
      type: Schema.Types.ObjectId,
      ref: 'BusinessProfile',
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    category: {
      type: String,
      enum: [
        'daily_operations',
        'employee_training',
        'customer_service',
        'inventory_management',
        'quality_control',
        'health_and_safety',
        'marketing_procedures',
        'financial_operations',
        'opening_closing_procedures',
      ],
      required: true,
      index: true,
    },
    summary: {
      type: String,
      required: true,
    },
    version: {
      type: Number,
      default: 1,
    },
    status: {
      type: String,
      enum: ['draft', 'under_review', 'approved', 'revision_requested', 'archived'],
      default: 'draft',
      index: true,
    },
    contentMarkdown: {
      type: String,
    },
    fileUrl: {
      type: String,
    },
    fileName: {
      type: String,
    },
    fileSizeBytes: {
      type: Number,
    },
    mimeType: {
      type: String,
    },
    author: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    reviewedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    reviewNotes: {
      type: String,
    },
    checklists: [
      {
        item: { type: String, required: true },
        isMandatory: { type: Boolean, default: true },
        completed: { type: Boolean, default: false },
      },
    ],
    jurisdiction: {
      type: String,
      default: 'GLOBAL',
    },
  },
  {
    timestamps: true,
  }
);

export const SOPDocument = model<ISOPDocument>('SOPDocument', sopDocumentSchema);
