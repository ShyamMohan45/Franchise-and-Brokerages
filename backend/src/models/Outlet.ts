import { Schema, model, Document, Types } from 'mongoose';

export type OutletStatus = 'operating' | 'under_fitout' | 'permitting' | 'site_selection' | 'closed';

export interface IOutlet extends Document {
  business: Types.ObjectId;
  franchiseListing?: Types.ObjectId;
  outletName: string;
  unitCode: string;
  storeType: 'flagship' | 'standard' | 'kiosk' | 'cloud_kitchen' | 'drive_thru';
  city: string;
  state: string;
  address: string;
  pincode: string;
  managerName: string;
  managerPhone: string;
  managerEmail: string;
  sizeSqFt: number;
  monthlyRevenue?: number;
  staffCount: number;
  status: OutletStatus;
  openingDate?: Date;
  fitoutProgressPercent: number;
  createdAt: Date;
  updatedAt: Date;
}

const outletSchema = new Schema<IOutlet>(
  {
    business: {
      type: Schema.Types.ObjectId,
      ref: 'BusinessProfile',
      required: true,
      index: true,
    },
    franchiseListing: {
      type: Schema.Types.ObjectId,
      ref: 'FranchiseListing',
      index: true,
    },
    outletName: {
      type: String,
      required: true,
      trim: true,
    },
    unitCode: {
      type: String,
      required: true,
      trim: true,
      uppercase: true,
    },
    storeType: {
      type: String,
      enum: ['flagship', 'standard', 'kiosk', 'cloud_kitchen', 'drive_thru'],
      default: 'standard',
    },
    city: {
      type: String,
      required: true,
      trim: true,
    },
    state: {
      type: String,
      required: true,
      trim: true,
    },
    address: {
      type: String,
      required: true,
      trim: true,
    },
    pincode: {
      type: String,
      default: '',
    },
    managerName: {
      type: String,
      default: '',
    },
    managerPhone: {
      type: String,
      default: '',
    },
    managerEmail: {
      type: String,
      default: '',
    },
    sizeSqFt: {
      type: Number,
      required: true,
      min: 50,
    },
    monthlyRevenue: {
      type: Number,
      default: 0,
    },
    staffCount: {
      type: Number,
      default: 4,
    },
    status: {
      type: String,
      enum: ['operating', 'under_fitout', 'permitting', 'site_selection', 'closed'],
      default: 'operating',
      index: true,
    },
    openingDate: {
      type: Date,
    },
    fitoutProgressPercent: {
      type: Number,
      default: 100,
      min: 0,
      max: 100,
    },
  },
  {
    timestamps: true,
  }
);

export const Outlet = model<IOutlet>('Outlet', outletSchema);
