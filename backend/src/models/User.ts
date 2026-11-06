import { Schema, model, Document, Types } from 'mongoose';

export type UserRole = 'guest' | 'business_owner' | 'investor' | 'admin' | 'super_admin';
export type UserStatus = 'active' | 'pending_verification' | 'suspended';

export interface IUser extends Document {
  email: string;
  passwordHash: string;
  fullName: string;
  phone?: string;
  role: UserRole;
  status: UserStatus;
  avatarUrl?: string;
  emailVerified: boolean;
  businessProfile?: Types.ObjectId;
  investorProfile?: Types.ObjectId;
  lastLoginAt?: Date;
  refreshTokenHash?: string;
  createdAt: Date;
  updatedAt: Date;
}

const userSchema = new Schema<IUser>(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    passwordHash: {
      type: String,
      required: true,
      select: false,
    },
    fullName: {
      type: String,
      required: true,
      trim: true,
    },
    phone: {
      type: String,
      trim: true,
    },
    role: {
      type: String,
      enum: ['guest', 'business_owner', 'investor', 'admin', 'super_admin'],
      default: 'business_owner',
      index: true,
    },
    status: {
      type: String,
      enum: ['active', 'pending_verification', 'suspended'],
      default: 'active',
      index: true,
    },
    avatarUrl: {
      type: String,
    },
    emailVerified: {
      type: Boolean,
      default: true,
    },
    businessProfile: {
      type: Schema.Types.ObjectId,
      ref: 'BusinessProfile',
    },
    investorProfile: {
      type: Schema.Types.ObjectId,
      ref: 'InvestorProfile',
    },
    lastLoginAt: {
      type: Date,
    },
    refreshTokenHash: {
      type: String,
      select: false,
    },
  },
  {
    timestamps: true,
  }
);

export const User = model<IUser>('User', userSchema);
