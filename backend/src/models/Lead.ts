import { Schema, model, Document, Types } from 'mongoose';

export type LeadType = 'brand_owner' | 'franchise_investor' | 'multi_unit_operator' | 'institutional';
export type LeadStatus =
  | 'new'
  | 'contacted'
  | 'qualified'
  | 'meeting_scheduled'
  | 'negotiation'
  | 'converted'
  | 'lost';

export interface ILead extends Document {
  fullName: string;
  email: string;
  phone: string;
  company?: string;
  leadType: LeadType;
  status: LeadStatus;
  source: string; // 'website_form', 'marketplace_enquiry', 'referral', 'linkedin', 'direct'
  targetIndustry?: string;
  budgetMin?: number;
  budgetMax?: number;
  assignedBroker?: Types.ObjectId;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  internalNotes: string;
  followUpDate?: Date;
  convertedToUser?: Types.ObjectId;
  activities: Array<{
    type: 'note' | 'call' | 'email' | 'meeting' | 'status_change';
    summary: string;
    performedBy: Types.ObjectId;
    timestamp: Date;
  }>;
  createdAt: Date;
  updatedAt: Date;
}

const leadSchema = new Schema<ILead>(
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
    company: {
      type: String,
      trim: true,
    },
    leadType: {
      type: String,
      enum: ['brand_owner', 'franchise_investor', 'multi_unit_operator', 'institutional'],
      required: true,
      index: true,
    },
    status: {
      type: String,
      enum: ['new', 'contacted', 'qualified', 'meeting_scheduled', 'negotiation', 'converted', 'lost'],
      default: 'new',
      index: true,
    },
    source: {
      type: String,
      default: 'website_form',
    },
    targetIndustry: {
      type: String,
    },
    budgetMin: {
      type: Number,
    },
    budgetMax: {
      type: Number,
    },
    assignedBroker: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      index: true,
    },
    priority: {
      type: String,
      enum: ['low', 'medium', 'high', 'urgent'],
      default: 'medium',
    },
    internalNotes: {
      type: String,
      default: '',
    },
    followUpDate: {
      type: Date,
    },
    convertedToUser: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    activities: [
      {
        type: {
          type: String,
          enum: ['note', 'call', 'email', 'meeting', 'status_change'],
          required: true,
        },
        summary: { type: String, required: true },
        performedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
        timestamp: { type: Date, default: Date.now },
      },
    ],
  },
  {
    timestamps: true,
  }
);

export const Lead = model<ILead>('Lead', leadSchema);
