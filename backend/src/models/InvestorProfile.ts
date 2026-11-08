import { Schema, model, Document, Types } from 'mongoose';

export type InvestorType = 'individual' | 'corporate' | 'syndicate' | 'family_office';
export type OperationPreference = 'self_operated' | 'manager_operated' | 'flexible';
export type PreferredBusinessModel = 'FOFO' | 'FOCO' | 'COCO' | 'Master Franchise' | 'flexible';

export interface IInvestorProfile extends Document {
  user: Types.ObjectId;
  fullName: string;
  email?: string;
  phone: string;
  city: string;
  state?: string;
  country: string;
  investorType: InvestorType;
  investmentBudgetMin: number;
  investmentBudgetMinPaise: number;
  investmentBudgetMax: number;
  investmentBudgetMaxPaise: number;
  liquidCapital: number;
  liquidCapitalPaise: number;
  preferredStates: string[];
  preferredCities: string[];
  preferredLocations: string[];
  preferredIndustries: string[];
  investmentExperience: string;
  businessExperienceYears: number;
  pastFranchiseExperience: boolean;
  interestType: 'single_unit' | 'multi_unit' | 'area_developer' | 'master_franchise';
  preferredBusinessModel: PreferredBusinessModel;
  operationPreference: OperationPreference;
  proposedOutlets: number;
  investmentTimeline: 'immediate' | '1_to_3_months' | '3_to_6_months' | '6_plus_months';
  additionalRequirements?: string;
  profileCompletion: number;
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
    email: {
      type: String,
      trim: true,
      lowercase: true,
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
    investmentBudgetMinPaise: {
      type: Number,
      default: 0,
    },
    investmentBudgetMax: {
      type: Number,
      required: true,
    },
    investmentBudgetMaxPaise: {
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
    preferredStates: [{ type: String, trim: true }],
    preferredCities: [{ type: String, trim: true }],
    preferredLocations: [{ type: String, trim: true }],
    preferredIndustries: [{ type: String, index: true }],
    investmentExperience: {
      type: String,
      default: 'Intermediate investor with entrepreneurial background',
    },
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
    preferredBusinessModel: {
      type: String,
      enum: ['FOFO', 'FOCO', 'COCO', 'Master Franchise', 'flexible'],
      default: 'FOFO',
    },
    operationPreference: {
      type: String,
      enum: ['self_operated', 'manager_operated', 'flexible'],
      default: 'flexible',
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
    additionalRequirements: {
      type: String,
      trim: true,
    },
    profileCompletion: {
      type: Number,
      default: 60,
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

// Pre-save hook to ensure integer paise and profile completion synchronization
investorProfileSchema.pre('save', function (next) {
  if (this.investmentBudgetMin !== undefined) {
    this.investmentBudgetMinPaise = Math.round(Number(this.investmentBudgetMin) * 100);
  }
  if (this.investmentBudgetMax !== undefined) {
    this.investmentBudgetMaxPaise = Math.round(Number(this.investmentBudgetMax) * 100);
  }
  if (this.liquidCapital !== undefined) {
    this.liquidCapitalPaise = Math.round(Number(this.liquidCapital) * 100);
  }

  // Calculate profile completion score (0-100%)
  let score = 0;
  if (this.fullName) score += 10;
  if (this.phone) score += 10;
  if (this.city) score += 10;
  if (this.investmentBudgetMin > 0 && this.investmentBudgetMax > 0) score += 20;
  if (Array.isArray(this.preferredIndustries) && this.preferredIndustries.length > 0) score += 15;
  if (Array.isArray(this.preferredLocations) && this.preferredLocations.length > 0) score += 15;
  if (this.investmentTimeline) score += 10;
  if (this.operationPreference) score += 5;
  if (this.preferredBusinessModel) score += 5;
  this.profileCompletion = Math.min(100, score);

  next();
});

export const InvestorProfile = model<IInvestorProfile>('InvestorProfile', investorProfileSchema);
