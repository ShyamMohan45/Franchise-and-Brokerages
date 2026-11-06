import { Schema, model, Document, Types } from 'mongoose';

export interface IDocumentVersion extends Document {
  documentRef: Types.ObjectId;
  documentType: 'SOP' | 'Legal';
  versionNumber: number;
  changeSummary: string;
  fileUrl?: string;
  storageKey?: string;
  changedBy: Types.ObjectId;
  createdAt: Date;
}

const documentVersionSchema = new Schema<IDocumentVersion>(
  {
    documentRef: {
      type: Schema.Types.ObjectId,
      required: true,
      index: true,
    },
    documentType: {
      type: String,
      enum: ['SOP', 'Legal'],
      required: true,
    },
    versionNumber: {
      type: Number,
      required: true,
    },
    changeSummary: {
      type: String,
      required: true,
    },
    fileUrl: { type: String },
    storageKey: { type: String },
    changedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
  }
);

export const DocumentVersion = model<IDocumentVersion>('DocumentVersion', documentVersionSchema);
