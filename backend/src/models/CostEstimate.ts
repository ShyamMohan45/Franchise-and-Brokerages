import { Schema, model, Document, Types } from 'mongoose';

export interface ICostEstimate extends Document {
  user?: Types.ObjectId;
  franchiseListing?: Types.ObjectId;
  brandName: string;
  industry: string;
  cityTier: 'Tier 1' | 'Tier 2' | 'Tier 3';
  storeFormat: string;
  sizeSqFt: number;
  // Cost breakdown (base / medium scenario)
  franchiseFee: number;
  securityDeposit: number;
  interiorFitout: number;
  equipmentMachinery: number;
  initialInventory: number;
  licensingAndLegal: number;
  grandOpeningMarketing: number;
  workingCapitalBuffer: number;
  totalEstimatedCapex: number;
  // Scenarios
  scenarios: {
    low: {
      totalCapex: number;
      fitoutDiscountPercent: number;
      monthlyOpex: number;
      breakEvenMonths: number;
    };
    medium: {
      totalCapex: number;
      monthlyOpex: number;
      breakEvenMonths: number;
    };
    high: {
      totalCapex: number;
      contingencyPercent: number;
      monthlyOpex: number;
      breakEvenMonths: number;
    };
  };
  projectedMonthlyRevenue: number;
  projectedNetMarginPercent: number;
  createdAt: Date;
  updatedAt: Date;
}

const costEstimateSchema = new Schema<ICostEstimate>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      index: true,
    },
    franchiseListing: {
      type: Schema.Types.ObjectId,
      ref: 'FranchiseListing',
      index: true,
    },
    brandName: { type: String, required: true },
    industry: { type: String, required: true },
    cityTier: { type: String, enum: ['Tier 1', 'Tier 2', 'Tier 3'], default: 'Tier 1' },
    storeFormat: { type: String, default: 'Standard' },
    sizeSqFt: { type: Number, required: true },
    franchiseFee: { type: Number, required: true },
    securityDeposit: { type: Number, default: 0 },
    interiorFitout: { type: Number, required: true },
    equipmentMachinery: { type: Number, required: true },
    initialInventory: { type: Number, default: 0 },
    licensingAndLegal: { type: Number, default: 0 },
    grandOpeningMarketing: { type: Number, default: 0 },
    workingCapitalBuffer: { type: Number, default: 0 },
    totalEstimatedCapex: { type: Number, required: true },
    scenarios: {
      low: {
        totalCapex: { type: Number, required: true },
        fitoutDiscountPercent: { type: Number, default: 15 },
        monthlyOpex: { type: Number, default: 0 },
        breakEvenMonths: { type: Number, default: 18 },
      },
      medium: {
        totalCapex: { type: Number, required: true },
        monthlyOpex: { type: Number, default: 0 },
        breakEvenMonths: { type: Number, default: 22 },
      },
      high: {
        totalCapex: { type: Number, required: true },
        contingencyPercent: { type: Number, default: 15 },
        monthlyOpex: { type: Number, default: 0 },
        breakEvenMonths: { type: Number, default: 26 },
      },
    },
    projectedMonthlyRevenue: { type: Number, default: 0 },
    projectedNetMarginPercent: { type: Number, default: 20 },
  },
  {
    timestamps: true,
  }
);

export const CostEstimate = model<ICostEstimate>('CostEstimate', costEstimateSchema);
