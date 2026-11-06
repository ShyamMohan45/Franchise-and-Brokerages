import { Schema, model, Document, Types } from 'mongoose';

export type LegalDocType =
  | 'fdd_master'
  | 'fdd_item_disclosure'
  | 'franchise_agreement'
  | 'ip_trademark_license'
  | 'non_disclosure_agreement'
  | 'territory_addendum'
  | 'financial_audit_disclosure'
  | 'franchise_information_memorandum';

export interface ILegalDocument extends Document {
  business: Types.ObjectId;
  documentType: LegalDocType;
  title: string;
  fddItemNumber?: number; // 1 to 23 for US FDD items
  jurisdiction: 'US' | 'IN' | 'UK' | 'GLOBAL';
  status: 'draft' | 'legal_review' | 'approved' | 'action_required' | 'archived';
  version: number;
  storageKey: string;
  originalFileName: string;
  fileSizeBytes: number;
  mimeType: string;
  legalReviewer?: Types.ObjectId;
  legalReviewNotes?: string;
  complianceChecklist: Array<{
    clause: string;
    isCompliant: boolean;
    attorneyComment?: string;
  }>;
  disclaimerAccepted: boolean;
  uploadedBy: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const legalDocumentSchema = new Schema<ILegalDocument>(
  {
    business: {
      type: Schema.Types.ObjectId,
      ref: 'BusinessProfile',
      required: true,
      index: true,
    },
    documentType: {
      type: String,
      enum: [
        'fdd_master',
        'fdd_item_disclosure',
        'franchise_agreement',
        'ip_trademark_license',
        'non_disclosure_agreement',
        'territory_addendum',
        'financial_audit_disclosure',
        'franchise_information_memorandum',
      ],
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    fddItemNumber: {
      type: Number,
      min: 1,
      max: 23,
    },
    jurisdiction: {
      type: String,
      enum: ['US', 'IN', 'UK', 'GLOBAL'],
      default: 'GLOBAL',
      index: true,
    },
    status: {
      type: String,
      enum: ['draft', 'legal_review', 'approved', 'action_required', 'archived'],
      default: 'draft',
      index: true,
    },
    version: {
      type: Number,
      default: 1,
    },
    storageKey: {
      type: String,
      required: true,
    },
    originalFileName: {
      type: String,
      required: true,
    },
    fileSizeBytes: {
      type: Number,
      required: true,
    },
    mimeType: {
      type: String,
      required: true,
    },
    legalReviewer: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    legalReviewNotes: {
      type: String,
    },
    complianceChecklist: [
      {
        clause: { type: String, required: true },
        isCompliant: { type: Boolean, default: false },
        attorneyComment: { type: String },
      },
    ],
    disclaimerAccepted: {
      type: Boolean,
      default: true,
    },
    uploadedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

export const LegalDocument = model<ILegalDocument>('LegalDocument', legalDocumentSchema);
