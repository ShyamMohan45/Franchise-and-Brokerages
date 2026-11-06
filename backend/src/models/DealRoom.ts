import { Schema, model, Document, Types } from 'mongoose';

export type DealRoomStage =
  | 'discovery_and_nda'
  | 'fdd_and_sop_disclosure'
  | 'territory_and_financials'
  | 'agreement_drafting'
  | 'out_for_signature'
  | 'deal_finalized'
  | 'cancelled';

export interface ISharedDocument {
  docId: string;
  title: string;
  docType: 'NDA' | 'FDD' | 'SOP' | 'Franchise_Agreement' | 'Financial_Model' | 'Site_Evaluation';
  fileUrl: string;
  uploadedBy: Types.ObjectId;
  accessRoles: Array<'franchisor' | 'investor' | 'broker' | 'admin'>;
  uploadedAt: Date;
}

export interface IDealRoomMessage {
  sender: Types.ObjectId;
  senderRole: 'franchisor' | 'investor' | 'broker' | 'admin';
  text: string;
  attachmentUrl?: string;
  createdAt: Date;
}

export interface ISignatureParticipant {
  role: 'franchisor' | 'investor' | 'broker';
  userId: Types.ObjectId;
  name: string;
  email: string;
  status: 'pending' | 'signed' | 'declined';
  signedAt?: Date;
  ipAddress?: string;
}

export interface IDealRoom extends Document {
  dealRef?: Types.ObjectId;
  franchiseListing: Types.ObjectId;
  franchisor: Types.ObjectId;
  investor: Types.ObjectId;
  broker: Types.ObjectId;
  roomName: string;
  targetTerritory: string;
  stage: DealRoomStage;
  ndaSigned: boolean;
  ndaSignedAt?: Date;
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
      enum: ['NDA', 'FDD', 'SOP', 'Franchise_Agreement', 'Financial_Model', 'Site_Evaluation'],
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
      enum: ['franchisor', 'investor', 'broker', 'admin'],
      required: true,
    },
    text: { type: String, required: true },
    attachmentUrl: { type: String },
    createdAt: { type: Date, default: Date.now },
  },
  { _id: false }
);

const participantSchema = new Schema<ISignatureParticipant>(
  {
    role: { type: String, enum: ['franchisor', 'investor', 'broker'], required: true },
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
    roomName: {
      type: String,
      required: true,
    },
    targetTerritory: {
      type: String,
      required: true,
    },
    stage: {
      type: String,
      enum: [
        'discovery_and_nda',
        'fdd_and_sop_disclosure',
        'territory_and_financials',
        'agreement_drafting',
        'out_for_signature',
        'deal_finalized',
        'cancelled',
      ],
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
      },
    ],
  },
  {
    timestamps: true,
  }
);

export const DealRoom = model<IDealRoom>('DealRoom', dealRoomSchema);
