import { Schema, model, Document, Types } from 'mongoose';

export type DealRoomStage =
  | 'discovery_and_nda'
  | 'fdd_and_sop_disclosure'
  | 'territory_and_financials'
  | 'agreement_drafting'
  | 'out_for_signature'
  | 'deal_finalized'
  | 'cancelled'
  // CRM Deal stages compatibility
  | 'NEW_ENQUIRY'
  | 'INITIAL_CONTACT'
  | 'QUALIFICATION'
  | 'BRAND_MATCHING'
  | 'MEETING_SCHEDULED'
  | 'NEGOTIATION'
  | 'DUE_DILIGENCE'
  | 'AGREEMENT'
  | 'CLOSED_WON'
  | 'CLOSED_LOST';

export interface ISharedDocument {
  docId: string;
  title: string;
  docType: 'NDA' | 'FDD' | 'SOP' | 'Franchise_Agreement' | 'Financial_Model' | 'Site_Evaluation' | string;
  fileUrl: string;
  uploadedBy: Types.ObjectId;
  accessRoles: Array<string>;
  uploadedAt: Date;
}

export interface IDealRoomMessage {
  sender: Types.ObjectId;
  senderRole: string;
  text: string;
  isInternal?: boolean;
  attachmentUrl?: string;
  createdAt: Date;
}

export interface ISignatureParticipant {
  role: 'franchisor' | 'investor' | 'broker' | 'business_owner' | string;
  userId: Types.ObjectId;
  name: string;
  email: string;
  status: 'pending' | 'signed' | 'declined';
  signedAt?: Date;
  ipAddress?: string;
}

export interface IDealRoom extends Document {
  deal?: Types.ObjectId;
  dealRef?: Types.ObjectId;
  franchiseListing: Types.ObjectId;
  franchisor: Types.ObjectId;
  businessOwner?: Types.ObjectId;
  investor: Types.ObjectId;
  broker: Types.ObjectId;
  assignedBroker?: Types.ObjectId;
  roomName: string;
  targetTerritory: string;
  stage: DealRoomStage;
  ndaSigned: boolean;
  ndaSignedAt?: Date;
  dueDiligenceChecklist?: Types.ObjectId;
  completionPercentage: number;
  outstandingDocumentsCount: number;
  rejectedOrClarificationCount: number;
  legalDisclaimer: string;
  sharedDocuments: ISharedDocument[];
  messages: IDealRoomMessage[];
  signatureRequest: {
    status: 'draft' | 'out_for_signature' | 'completed' | 'cancelled';
    documentTitle: string;
    documentUrl: string;
    participants: ISignatureParticipant[];
    completedAt?: Date;
  };
  dealMilestones: Array<{
    title: string;
    completed: boolean;
    completedAt?: Date;
    deadline?: Date;
  }>;
  createdAt: Date;
  updatedAt: Date;
}

const sharedDocSchema = new Schema<ISharedDocument>(
  {
    docId: { type: String, required: true },
    title: { type: String, required: true },
    docType: {
      type: String,
      required: true,
    },
    fileUrl: { type: String, required: true },
    uploadedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    accessRoles: [{ type: String }],
    uploadedAt: { type: Date, default: Date.now },
  },
  { _id: false }
);

const messageSchema = new Schema<IDealRoomMessage>(
  {
    sender: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    senderRole: {
      type: String,
      required: true,
    },
    text: { type: String, required: true },
    isInternal: { type: Boolean, default: false },
    attachmentUrl: { type: String },
    createdAt: { type: Date, default: Date.now },
  },
  { _id: false }
);

const participantSchema = new Schema<ISignatureParticipant>(
  {
    role: { type: String, required: true },
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    name: { type: String, required: true },
    email: { type: String, required: true },
    status: { type: String, enum: ['pending', 'signed', 'declined'], default: 'pending' },
    signedAt: { type: Date },
    ipAddress: { type: String },
  },
  { _id: false }
);

const dealRoomSchema = new Schema<IDealRoom>(
  {
    deal: {
      type: Schema.Types.ObjectId,
      ref: 'BrokerageDeal',
      index: true,
    },
    dealRef: {
      type: Schema.Types.ObjectId,
      ref: 'BrokerageDeal',
      index: true,
    },
    franchiseListing: {
      type: Schema.Types.ObjectId,
      ref: 'FranchiseListing',
      required: true,
      index: true,
    },
    franchisor: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    businessOwner: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      index: true,
    },
    investor: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    broker: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    assignedBroker: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      index: true,
    },
    roomName: {
      type: String,
      required: true,
      trim: true,
    },
    targetTerritory: {
      type: String,
      required: true,
      trim: true,
    },
    stage: {
      type: String,
      default: 'discovery_and_nda',
      index: true,
    },
    ndaSigned: {
      type: Boolean,
      default: false,
    },
    ndaSignedAt: {
      type: Date,
    },
    dueDiligenceChecklist: {
      type: Schema.Types.ObjectId,
      ref: 'DueDiligenceChecklist',
    },
    completionPercentage: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
    outstandingDocumentsCount: {
      type: Number,
      default: 0,
    },
    rejectedOrClarificationCount: {
      type: Number,
      default: 0,
    },
    legalDisclaimer: {
      type: String,
      default:
        'All deal room files, checklist statuses, and communication items are provided solely for brokerage due diligence facilitation. Nothing within this deal room constitutes legally certified approval, regulatory compliance warranty, or binding statutory execution until executed in writing by legal counsel.',
    },
    sharedDocuments: [sharedDocSchema],
    messages: [messageSchema],
    signatureRequest: {
      status: {
        type: String,
        enum: ['draft', 'out_for_signature', 'completed', 'cancelled'],
        default: 'draft',
      },
      documentTitle: { type: String, default: 'Franchise Master Development Agreement' },
      documentUrl: { type: String, default: '' },
      participants: [participantSchema],
      completedAt: { type: Date },
    },
    dealMilestones: [
      {
        title: { type: String, required: true },
        completed: { type: Boolean, default: false },
        completedAt: { type: Date },
        deadline: { type: Date },
      },
    ],
  },
  {
    timestamps: true,
  }
);

dealRoomSchema.index({ investor: 1, franchisor: 1 });
dealRoomSchema.index({ broker: 1, stage: 1 });

export const DealRoom = model<IDealRoom>('DealRoom', dealRoomSchema);
