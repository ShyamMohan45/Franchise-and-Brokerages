import { Schema, model, Document, Types } from 'mongoose';

export interface ISavedFranchise extends Document {
  user: Types.ObjectId;
  franchise: Types.ObjectId;
  createdAt: Date;
}

const savedFranchiseSchema = new Schema<ISavedFranchise>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    franchise: {
      type: Schema.Types.ObjectId,
      ref: 'FranchiseListing',
      required: true,
      index: true,
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
  }
);

savedFranchiseSchema.index({ user: 1, franchise: 1 }, { unique: true });

export const SavedFranchise = model<ISavedFranchise>('SavedFranchise', savedFranchiseSchema);
