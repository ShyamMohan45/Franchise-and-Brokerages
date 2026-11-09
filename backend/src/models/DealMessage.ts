import { Schema, model, Document, Types } from 'mongoose';

export interface IDealMessage extends Document {
  dealRoom: Types.ObjectId;
  deal: Types.ObjectId;
  sender: Types.ObjectId;
  senderRole: 'investor' | 'business_owner' | 'brand_owner' | 'broker' | 'admin' | 'super_admin';
  text: string;
  isInternal: boolean; // Internal broker notes - hidden from investor & brand owner
  relatedDocument?: Types.ObjectId;
  relatedDiligenceItem?: string;
  attachmentName?: string;
  attachmentStorageKey?: string;
  createdAt: Date;
  updatedAt: Date;
}

const dealMessageSchema = new Schema<IDealMessage>(
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
    sender: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    senderRole: {
      type: String,
      enum: ['investor', 'business_owner', 'brand_owner', 'broker', 'admin', 'super_admin'],
      required: true,
    },
    text: {
      type: String,
      required: true,
      trim: true,
    },
    isInternal: {
      type: Boolean,
      default: false,
      index: true,
    },
    relatedDocument: {
      type: Schema.Types.ObjectId,
      ref: 'DealDocument',
    },
    relatedDiligenceItem: {
      type: String,
    },
    attachmentName: {
      type: String,
    },
    attachmentStorageKey: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

dealMessageSchema.index({ dealRoom: 1, createdAt: 1 });
dealMessageSchema.index({ deal: 1, isInternal: 1 });

export const DealMessage = model<IDealMessage>('DealMessage', dealMessageSchema);
