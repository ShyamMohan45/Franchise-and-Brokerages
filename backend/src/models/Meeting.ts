import { Schema, model, Document, Types } from 'mongoose';

export type MeetingStatus = 'requested' | 'scheduled' | 'completed' | 'cancelled' | 'rescheduled';
export type MeetingType =
  | 'franchise_intro'
  | 'fdd_review'
  | 'sop_consultation'
  | 'negotiation'
  | 'deal_closing'
  | 'readiness_audit';

export interface IMeeting extends Document {
  title: string;
  meetingType: MeetingType;
  organizer: Types.ObjectId;
  participants: Types.ObjectId[];
  relatedFranchise?: Types.ObjectId;
  relatedApplication?: Types.ObjectId;
  relatedDeal?: Types.ObjectId;
  relatedLead?: Types.ObjectId;
  scheduledStartTime: Date;
  scheduledEndTime: Date;
  status: MeetingStatus;
  meetingUrl?: string;
  locationDetails?: string;
  agenda: string;
  notes?: string;
  actionItems?: string[];
  createdAt: Date;
  updatedAt: Date;
}

const meetingSchema = new Schema<IMeeting>(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    meetingType: {
      type: String,
      enum: [
        'franchise_intro',
        'fdd_review',
        'sop_consultation',
        'negotiation',
        'deal_closing',
        'readiness_audit',
      ],
      required: true,
    },
    organizer: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    participants: [
      {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true,
      },
    ],
    relatedFranchise: {
      type: Schema.Types.ObjectId,
      ref: 'FranchiseListing',
    },
    relatedApplication: {
      type: Schema.Types.ObjectId,
      ref: 'FranchiseApplication',
    },
    relatedDeal: {
      type: Schema.Types.ObjectId,
      ref: 'BrokerageDeal',
    },
    relatedLead: {
      type: Schema.Types.ObjectId,
      ref: 'Lead',
    },
    scheduledStartTime: {
      type: Date,
      required: true,
      index: true,
    },
    scheduledEndTime: {
      type: Date,
      required: true,
    },
    status: {
      type: String,
      enum: ['requested', 'scheduled', 'completed', 'cancelled', 'rescheduled'],
      default: 'requested',
      index: true,
    },
    meetingUrl: {
      type: String,
    },
    locationDetails: {
      type: String,
    },
    agenda: {
      type: String,
      required: true,
    },
    notes: {
      type: String,
    },
    actionItems: [{ type: String }],
  },
  {
    timestamps: true,
  }
);

export const Meeting = model<IMeeting>('Meeting', meetingSchema);
