import { Schema, model, Document, Types } from 'mongoose';

export type DealDocumentCategory =
  | 'BRAND_PROFILE'
  | 'FRANCHISE_DISCLOSURE'
  | 'FINANCIAL'
  | 'AGREEMENT_DRAFT'
  | 'IDENTITY_BUSINESS'
  | 'PROPERTY_LOCATION'
  | 'DUE_DILIGENCE_EVIDENCE'
  | 'OTHER_SUPPORTING';

export type DealDocumentStatus =
  | 'PENDING'
  | 'SUBMITTED'
  | 'UNDER_REVIEW'
  | 'APPROVED'
  | 'REJECTED'
  | 'SUPERSEDED';

export interface IDocumentVersionInfo {
  versionNumber: number;
  fileName: string;
  storageKey: string;
  fileSize: number;
  mimeType: string;
  uploadedBy: Types.ObjectId;
  uploadedAt: Date;
  changeNote?: string;
}

export interface IDocumentAccessLog {
  user: Types.ObjectId;
  action: 'view' | 'download';
  timestamp: Date;
  ipAddress?: string;
}

export interface IDealDocument extends Document {
  dealRoom: Types.ObjectId;
  deal: Types.ObjectId;
  title: string;
  fileName: string;
  storageKey: string;
  filePath: string;
  category: DealDocumentCategory;
  uploadedBy: Types.ObjectId;
  uploadedAt: Date;
  fileSize: number;
  mimeType: string;
  status: DealDocumentStatus;
  isInternalOnly: boolean;
  allowedRoles: Array<'investor' | 'business_owner' | 'brand_owner' | 'broker' | 'admin' | 'super_admin'>;
  currentVersion: number;
  versions: IDocumentVersionInfo[];
  reviewerNotes?: string;
  reviewedBy?: Types.ObjectId;
  reviewedAt?: Date;
  accessHistory: IDocumentAccessLog[];
  isLegallyCertified: boolean;
  legalDisclaimer: string;
  relatedDiligenceItem?: string;
  createdAt: Date;
  updatedAt: Date;
}

const documentVersionSchema = new Schema<IDocumentVersionInfo>(
  {
    versionNumber: { type: Number, required: true },
    fileName: { type: String, required: true },
    storageKey: { type: String, required: true },
    fileSize: { type: Number, required: true },
    mimeType: { type: String, required: true },
    uploadedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    uploadedAt: { type: Date, default: Date.now },
    changeNote: { type: String, default: '' },
  },
  { _id: false }
);

const accessLogSchema = new Schema<IDocumentAccessLog>(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    action: { type: String, enum: ['view', 'download'], required: true },
    timestamp: { type: Date, default: Date.now },
    ipAddress: { type: String, default: '' },
  },
  { _id: false }
);

const dealDocumentSchema = new Schema<IDealDocument>(
  {
    dealRoom: {
      type: Schema.Types.ObjectId,
      ref: 'DealRoom',
      required: true,
      index: true,
    },
    deal: {
      type: Schema.Types.ObjectId,
      ref: 'BrokerageDeal',
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    fileName: {
      type: String,
      required: true,
      trim: true,
    },
    storageKey: {
      type: String,
      required: true,
      unique: true,
    },
    filePath: {
      type: String,
      required: true,
    },
    category: {
      type: String,
      enum: [
        'BRAND_PROFILE',
        'FRANCHISE_DISCLOSURE',
        'FINANCIAL',
        'AGREEMENT_DRAFT',
        'IDENTITY_BUSINESS',
        'PROPERTY_LOCATION',
        'DUE_DILIGENCE_EVIDENCE',
        'OTHER_SUPPORTING',
      ],
      required: true,
      index: true,
    },
    uploadedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    uploadedAt: {
      type: Date,
      default: Date.now,
    },
    fileSize: {
      type: Number,
      required: true,
    },
    mimeType: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ['PENDING', 'SUBMITTED', 'UNDER_REVIEW', 'APPROVED', 'REJECTED', 'SUPERSEDED'],
      default: 'PENDING',
      index: true,
    },
    isInternalOnly: {
      type: Boolean,
      default: false,
      index: true,
    },
    allowedRoles: {
      type: [String],
      default: ['investor', 'business_owner', 'brand_owner', 'broker', 'admin', 'super_admin'],
    },
    currentVersion: {
      type: Number,
      default: 1,
    },
    versions: [documentVersionSchema],
    reviewerNotes: {
      type: String,
      default: '',
    },
    reviewedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    reviewedAt: {
      type: Date,
    },
    accessHistory: [accessLogSchema],
    isLegallyCertified: {
      type: Boolean,
      default: false,
    },
    legalDisclaimer: {
      type: String,
      default:
        'Uploaded document is for brokerage due diligence and deal room evaluation only. Upload does not constitute legal verification, certification, or binding enforceability until formal legal execution.',
    },
    relatedDiligenceItem: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

dealDocumentSchema.index({ deal: 1, category: 1 });
dealDocumentSchema.index({ dealRoom: 1, status: 1 });

export const DealDocument = model<IDealDocument>('DealDocument', dealDocumentSchema);
