import { Schema, model, Document, Types } from 'mongoose';

export type MilestoneStageKey =
  | 'market_analysis'
  | 'partner_screening'
  | 'real_estate_scouting'
  | 'legal_and_fdd'
  | 'fitout_and_tech'
  | 'sop_training'
  | 'soft_launch'
  | 'grand_opening';

export interface IMilestone {
  stageKey: MilestoneStageKey;
  title: string;
  description: string;
  status: 'pending' | 'in_progress' | 'completed' | 'delayed';
  targetDays: number;
  completedAt?: Date;
  assignedTo?: string;
  deliverables: string[];
}

export interface IExpansionPlan extends Document {
  business: Types.ObjectId;
  planName: string;
  targetYear: number;
  targetTotalOutlets: number;
  targetCities: Array<{
    cityName: string;
    state: string;
    tier: 'Tier 1' | 'Tier 2' | 'Tier 3';
    plannedOutlets: number;
    priority: 'High' | 'Medium' | 'Low';
    status: 'Scouting' | 'In Deal Room' | 'Fitout' | 'Launched';
  }>;
  milestones: IMilestone[];
  overallProgressPercent: number;
  notes: string;
  createdAt: Date;
  updatedAt: Date;
}

const milestoneSchema = new Schema<IMilestone>(
  {
    stageKey: {
      type: String,
      enum: [
        'market_analysis',
        'partner_screening',
        'real_estate_scouting',
        'legal_and_fdd',
        'fitout_and_tech',
        'sop_training',
        'soft_launch',
        'grand_opening',
      ],
      required: true,
    },
    title: { type: String, required: true },
    description: { type: String, default: '' },
    status: {
      type: String,
      enum: ['pending', 'in_progress', 'completed', 'delayed'],
      default: 'pending',
    },
    targetDays: { type: Number, default: 14 },
    completedAt: { type: Date },
    assignedTo: { type: String, default: '' },
    deliverables: [{ type: String }],
  },
  { _id: false }
);

const expansionPlanSchema = new Schema<IExpansionPlan>(
  {
    business: {
      type: Schema.Types.ObjectId,
      ref: 'BusinessProfile',
      required: true,
      index: true,
    },
    planName: {
      type: String,
      required: true,
      trim: true,
    },
    targetYear: {
      type: Number,
      default: () => new Date().getFullYear(),
    },
    targetTotalOutlets: {
      type: Number,
      required: true,
      min: 1,
    },
    targetCities: [
      {
        cityName: { type: String, required: true },
        state: { type: String, required: true },
        tier: { type: String, enum: ['Tier 1', 'Tier 2', 'Tier 3'], default: 'Tier 1' },
        plannedOutlets: { type: Number, default: 1 },
        priority: { type: String, enum: ['High', 'Medium', 'Low'], default: 'High' },
        status: {
          type: String,
          enum: ['Scouting', 'In Deal Room', 'Fitout', 'Launched'],
          default: 'Scouting',
        },
      },
    ],
    milestones: [milestoneSchema],
    overallProgressPercent: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
    notes: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

export const ExpansionPlan = model<IExpansionPlan>('ExpansionPlan', expansionPlanSchema);
