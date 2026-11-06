import { Schema, model, Document, Types } from 'mongoose';

export interface IContactEnquiry extends Document {
  fullName: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
  interestType: 'expand_business' | 'invest_in_franchise' | 'brokerage_partnership' | 'general';
  status: 'new' | 'reviewed' | 'responded' | 'archived';
  internalNotes?: string;
  handledBy?: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const contactEnquirySchema = new Schema<IContactEnquiry>(
  {
    fullName: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    phone: {
      type: String,
      required: true,
      trim: true,
    },
    subject: {
      type: String,
      required: true,
      trim: true,
    },
    message: {
      type: String,
      required: true,
    },
    interestType: {
      type: String,
      enum: ['expand_business', 'invest_in_franchise', 'brokerage_partnership', 'general'],
      default: 'general',
    },
    status: {
      type: String,
      enum: ['new', 'reviewed', 'responded', 'archived'],
      default: 'new',
      index: true,
    },
    internalNotes: {
      type: String,
    },
    handledBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  {
    timestamps: true,
  }
);

export const ContactEnquiry = model<IContactEnquiry>('ContactEnquiry', contactEnquirySchema);
