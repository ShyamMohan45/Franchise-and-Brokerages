import { Schema, model, Document, Types } from 'mongoose';

export type LeadType =
  | 'brand_owner'
  | 'brand_partnership'
  | 'franchise_investor'
  | 'multi_unit_operator'
  | 'institutional'
  | 'investor';

export type LeadStatus =
  | 'new'
  | 'contacted'
  | 'qualified'
  | 'meeting_scheduled'
  | 'negotiation'
  | 'converted'
  | 'lost'
  | 'not_qualified';

export type QualificationStatus = 'NEW' | 'CONTACTED' | 'QUALIFIED' | 'NOT_QUALIFIED';
export type InvestmentReadiness = 'high' | 'medium' | 'low' | 'ready_to_invest' | 'exploring';

export interface ILeadAssignmentRecord {
  assignedTo: Types.ObjectId;
  assignedBy: Types.ObjectId;
  timestamp: Date;
  note?: string;
}

export interface ILeadActivityRecord {
  type: 'note' | 'call' | 'email' | 'meeting' | 'status_change' | 'qualification' | 'assignment';
  summary: string;
  performedBy: Types.ObjectId;
  timestamp: Date;
  details?: Record<string, any>;
}

export interface ILead extends Document {
  fullName: string;
  email: string;
  phone: string;
  company?: string;
  leadType: LeadType;
  status: LeadStatus;
  source: string; // 'website_form', 'marketplace_enquiry', 'referral', 'linkedin', 'direct', 'brand_partnership'
  targetIndustry?: string;
  preferredIndustry?: string;
  preferredCity?: string;
  preferredState?: string;
  budgetMin?: number;
  budgetMax?: number;
  budgetMinPaise?: number;
  budgetMaxPaise?: number;
  liquidCapital?: number;
  liquidCapitalPaise?: number;
  investmentTimeline?: string;
  businessExperience?: string;
  investmentReadiness?: InvestmentReadiness;
  qualificationStatus: QualificationStatus;
  qualificationNotes?: string;
  lastContactDate?: Date;
  assignedBroker?: Types.ObjectId;
  assignedBy?: Types.ObjectId;
  assignedAt?: Date;
  assignmentHistory: ILeadAssignmentRecord[];
  priority: 'low' | 'medium' | 'high' | 'urgent';
  internalNotes: string;
  followUpDate?: Date;
  convertedToUser?: Types.ObjectId;
  convertedToDeal?: Types.ObjectId;
  activities: ILeadActivityRecord[];
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
      enum: ['brand_owner', 'brand_partnership', 'franchise_investor', 'multi_unit_operator', 'institutional', 'investor'],
      default: 'franchise_investor',
      index: true,
    },
    status: {
      type: String,
      enum: ['new', 'contacted', 'qualified', 'meeting_scheduled', 'negotiation', 'converted', 'lost', 'not_qualified'],
      default: 'new',
      index: true,
    },
    source: {
      type: String,
      default: 'website_form',
    },
    targetIndustry: {
      type: String,
      trim: true,
    },
    preferredIndustry: {
      type: String,
      trim: true,
    },
    preferredCity: {
      type: String,
      trim: true,
    },
    preferredState: {
      type: String,
      trim: true,
    },
    budgetMin: {
      type: Number,
      default: 0,
    },
    budgetMax: {
      type: Number,
      default: 0,
    },
    budgetMinPaise: {
      type: Number,
      default: 0,
    },
    budgetMaxPaise: {
      type: Number,
      default: 0,
    },
    liquidCapital: {
      type: Number,
      default: 0,
    },
    liquidCapitalPaise: {
      type: Number,
      default: 0,
    },
    investmentTimeline: {
      type: String,
      default: '1_to_3_months',
    },
    businessExperience: {
      type: String,
      default: '',
    },
    investmentReadiness: {
      type: String,
      enum: ['high', 'medium', 'low', 'ready_to_invest', 'exploring'],
      default: 'exploring',
    },
    qualificationStatus: {
      type: String,
      enum: ['NEW', 'CONTACTED', 'QUALIFIED', 'NOT_QUALIFIED'],
      default: 'NEW',
      index: true,
    },
    qualificationNotes: {
      type: String,
      default: '',
    },
    lastContactDate: {
      type: Date,
    },
    assignedBroker: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      index: true,
    },
    assignedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    assignedAt: {
      type: Date,
    },
    assignmentHistory: [
      {
        assignedTo: { type: Schema.Types.ObjectId, ref: 'User', required: true },
        assignedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
        timestamp: { type: Date, default: Date.now },
        note: { type: String, default: '' },
      },
    ],
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
    convertedToDeal: {
      type: Schema.Types.ObjectId,
      ref: 'BrokerageDeal',
    },
    activities: [
      {
        type: {
          type: String,
          enum: ['note', 'call', 'email', 'meeting', 'status_change', 'qualification', 'assignment'],
          required: true,
        },
        summary: { type: String, required: true },
        performedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
        timestamp: { type: Date, default: Date.now },
        details: { type: Schema.Types.Mixed },
      },
    ],
  },
  {
    timestamps: true,
  }
);

// Pre-save hook to synchronize integer paise
leadSchema.pre('save', function (next) {
  if (this.budgetMin !== undefined && this.budgetMin !== null) {
    this.budgetMinPaise = Math.round(this.budgetMin * 100);
  }
  if (this.budgetMax !== undefined && this.budgetMax !== null) {
    this.budgetMaxPaise = Math.round(this.budgetMax * 100);
  }
  if (this.liquidCapital !== undefined && this.liquidCapital !== null) {
    this.liquidCapitalPaise = Math.round(this.liquidCapital * 100);
  }
  next();
});

leadSchema.index({ assignedBroker: 1, qualificationStatus: 1 });
leadSchema.index({ preferredCity: 1, targetIndustry: 1 });

export const Lead = model<ILead>('Lead', leadSchema);
