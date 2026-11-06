import { Schema, model, Document, Types } from 'mongoose';

export type InvestorType = 'individual' | 'corporate' | 'syndicate' | 'family_office';

export interface IInvestorProfile extends Document {
  user: Types.ObjectId;
  fullName: string;
  phone: string;
  city: string;
  state?: string;
  country: string;
  investorType: InvestorType;
  investmentBudgetMin: number;
  investmentBudgetMax: number;
  preferredLocations: string[];
  preferredIndustries: string[];
  businessExperienceYears: number;
  pastFranchiseExperience: boolean;
  interestType: 'single_unit' | 'multi_unit' | 'area_developer' | 'master_franchise';
  proposedOutlets: number;
  investmentTimeline: 'immediate' | '1_to_3_months' | '3_to_6_months' | '6_plus_months';
  liquidCapital: number;
  netWorthRange?: string;
  currentOccupation?: string;
  companyName?: string;
  isVerified: boolean;
  verificationNotes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const investorProfileSchema = new Schema<IInvestorProfile>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
      index: true,
    },
    fullName: {
      type: String,
      required: true,
      trim: true,
    },
    phone: {
      type: String,
      required: true,
      trim: true,
    },
    city: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    state: { type: String, trim: true },
    country: { type: String, default: 'India', trim: true },
    investorType: {
      type: String,
      enum: ['individual', 'corporate', 'syndicate', 'family_office'],
      default: 'individual',
    },
    investmentBudgetMin: {
      type: Number,
      required: true,
    },
    investmentBudgetMax: {
      type: Number,
      required: true,
    },
    preferredLocations: [{ type: String }],
    preferredIndustries: [{ type: String, index: true }],
    businessExperienceYears: {
      type: Number,
      default: 0,
    },
    pastFranchiseExperience: {
      type: Boolean,
      default: false,
    },
    interestType: {
      type: String,
      enum: ['single_unit', 'multi_unit', 'area_developer', 'master_franchise'],
      default: 'single_unit',
      index: true,
    },
    proposedOutlets: {
      type: Number,
      default: 1,
    },
    investmentTimeline: {
      type: String,
      enum: ['immediate', '1_to_3_months', '3_to_6_months', '6_plus_months'],
      default: '1_to_3_months',
    },
    liquidCapital: {
      type: Number,
      required: true,
    },
    netWorthRange: { type: String },
    currentOccupation: { type: String },
    companyName: { type: String },
    isVerified: {
      type: Boolean,
      default: false,
      index: true,
    },
    verificationNotes: { type: String },
  },
  {
    timestamps: true,
  }
);

export const InvestorProfile = model<IInvestorProfile>('InvestorProfile', investorProfileSchema);
