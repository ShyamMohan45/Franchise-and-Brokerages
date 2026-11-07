import { Schema, model, Document, Types } from 'mongoose';

export type ReviewStatus = 'pending' | 'approved' | 'rejected';

export interface IReview extends Document {
  franchiseListing: Types.ObjectId;
  reviewerUser: Types.ObjectId;
  rating: number; // 1 to 5
  title: string;
  reviewText: string;
  storeLocation?: string;
  isVerifiedFranchisee: boolean;
  status: ReviewStatus;
  adminFeedback?: string;
  helpfulVotes: number;
  createdAt: Date;
  updatedAt: Date;
}

const reviewSchema = new Schema<IReview>(
  {
    franchiseListing: {
      type: Schema.Types.ObjectId,
      ref: 'FranchiseListing',
      required: true,
      index: true,
    },
    reviewerUser: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
      index: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 120,
    },
    reviewText: {
      type: String,
      required: true,
      trim: true,
      maxlength: 2000,
    },
    storeLocation: {
      type: String,
      trim: true,
    },
    isVerifiedFranchisee: {
      type: Boolean,
      default: false,
    },
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'approved', // Auto-approved in dev, moderated in prod
      index: true,
    },
    adminFeedback: {
      type: String,
    },
    helpfulVotes: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

reviewSchema.index({ franchiseListing: 1, status: 1 });
reviewSchema.index({ reviewerUser: 1, franchiseListing: 1 }, { unique: true });

export const Review = model<IReview>('Review', reviewSchema);
