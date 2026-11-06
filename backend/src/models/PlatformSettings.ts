import { Schema, model, Document, Types } from 'mongoose';

export interface IPlatformSettings extends Document {
  platformName: string;
  supportEmail: string;
  defaultCommissionRate: number; // e.g. 0.05
  defaultJurisdiction: string;
  enabledJurisdictions: string[];
  requireNdaBeforeIntro: boolean;
  minReadinessScoreForListing: number;
  maintenanceMode: boolean;
  updatedBy?: Types.ObjectId;
  updatedAt: Date;
}

const platformSettingsSchema = new Schema<IPlatformSettings>(
  {
    platformName: {
      type: String,
      default: 'FranchiseBridge',
    },
    supportEmail: {
      type: String,
      default: 'support@franchisebridge.com',
    },
    defaultCommissionRate: {
      type: Number,
      default: 0.05,
    },
    defaultJurisdiction: {
      type: String,
      default: 'GLOBAL',
    },
    enabledJurisdictions: {
      type: [String],
      default: ['IN', 'US', 'UK', 'GLOBAL'],
    },
    requireNdaBeforeIntro: {
      type: Boolean,
      default: true,
    },
    minReadinessScoreForListing: {
      type: Number,
      default: 65,
    },
    maintenanceMode: {
      type: Boolean,
      default: false,
    },
    updatedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  {
    timestamps: true,
  }
);

export const PlatformSettings = model<IPlatformSettings>('PlatformSettings', platformSettingsSchema);
