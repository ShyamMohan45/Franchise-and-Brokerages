import { Schema, model, Document, Types } from 'mongoose';

export interface IPillarScore {
  score: number; // 0 to 100
  notes: string;
  recommendations: string[];
}

export interface IFranchiseReadinessAssessment extends Document {
  business: Types.ObjectId;
  evaluatedBy?: Types.ObjectId;
  status: 'self_assessment' | 'broker_reviewed' | 'certified_ready';
  overallScore: number;
  pillars: {
    brandStrength: IPillarScore;
    unitEconomics: IPillarScore;
    sopDocumentation: IPillarScore;
    legalAndIpReadiness: IPillarScore;
    supplyChainReadiness: IPillarScore;
    trainingSystemReadiness: IPillarScore;
    unitRepeatability: IPillarScore;
    expansionCapacity: IPillarScore;
  };
  summaryRecommendation: string;
  priorityActionItems: string[];
  disclaimerNotice: string;
  reviewedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const pillarScoreSchema = new Schema(
  {
    score: { type: Number, required: true, min: 0, max: 100 },
    notes: { type: String, default: '' },
    recommendations: [{ type: String }],
  },
  { _id: false }
);

const franchiseReadinessAssessmentSchema = new Schema<IFranchiseReadinessAssessment>(
  {
    business: {
      type: Schema.Types.ObjectId,
      ref: 'BusinessProfile',
      required: true,
      index: true,
    },
    evaluatedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    status: {
      type: String,
      enum: ['self_assessment', 'broker_reviewed', 'certified_ready'],
      default: 'self_assessment',
      index: true,
    },
    overallScore: {
      type: Number,
      required: true,
      min: 0,
      max: 100,
    },
    pillars: {
      brandStrength: { type: pillarScoreSchema, required: true },
      unitEconomics: { type: pillarScoreSchema, required: true },
      sopDocumentation: { type: pillarScoreSchema, required: true },
      legalAndIpReadiness: { type: pillarScoreSchema, required: true },
      supplyChainReadiness: { type: pillarScoreSchema, required: true },
      trainingSystemReadiness: { type: pillarScoreSchema, required: true },
      unitRepeatability: { type: pillarScoreSchema, required: true },
      expansionCapacity: { type: pillarScoreSchema, required: true },
    },
    summaryRecommendation: {
      type: String,
      required: true,
    },
    priorityActionItems: [{ type: String }],
    disclaimerNotice: {
      type: String,
      default:
        'This readiness benchmark is an advisory operational evaluation and does not constitute guaranteed legal or investment certification.',
    },
    reviewedAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

export const FranchiseReadinessAssessment = model<IFranchiseReadinessAssessment>(
  'FranchiseReadinessAssessment',
  franchiseReadinessAssessmentSchema
);
