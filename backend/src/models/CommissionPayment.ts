import { Schema, model, Document, Types } from 'mongoose';

export type PaymentMethod = 'NEFT' | 'RTGS' | 'IMPS' | 'UPI' | 'CHEQUE' | 'BANK_TRANSFER';
export type PaymentVerificationStatus = 'RECORDED' | 'VERIFIED' | 'REJECTED';

export interface ICommissionPayment extends Document {
  paymentReference: string; // Unique Transaction UTR or Bank Reference to prevent duplicate payments
  agreement: Types.ObjectId;
  deal: Types.ObjectId;
  milestoneTitle?: string;
  amount: number; // in INR
  amountPaise: number; // integer paise
  currency: string; // default INR
  paymentMethod: PaymentMethod;
  paymentDate: Date;
  payerName: string;
  payerRole: 'brand' | 'investor';
  receivedBy: Types.ObjectId;
  status: PaymentVerificationStatus;
  notes?: string;
  invoiceNumber?: string;
  verifiedBy?: Types.ObjectId;
  verifiedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const commissionPaymentSchema = new Schema<ICommissionPayment>(
  {
    paymentReference: {
      type: String,
      required: true,
      unique: true, // Prevents duplicate payment entries
      trim: true,
      index: true,
    },
    agreement: {
      type: Schema.Types.ObjectId,
      ref: 'CommissionAgreement',
      required: true,
      index: true,
    },
    deal: {
      type: Schema.Types.ObjectId,
      ref: 'BrokerageDeal',
      required: true,
      index: true,
    },
    milestoneTitle: {
      type: String,
      trim: true,
    },
    amount: {
      type: Number,
      required: true,
      min: 1,
    },
    amountPaise: {
      type: Number,
      default: 0,
    },
    currency: {
      type: String,
      default: 'INR',
    },
    paymentMethod: {
      type: String,
      enum: ['NEFT', 'RTGS', 'IMPS', 'UPI', 'CHEQUE', 'BANK_TRANSFER'],
      default: 'BANK_TRANSFER',
      required: true,
    },
    paymentDate: {
      type: Date,
      default: Date.now,
      required: true,
    },
    payerName: {
      type: String,
      required: true,
      trim: true,
    },
    payerRole: {
      type: String,
      enum: ['brand', 'investor'],
      default: 'brand',
    },
    receivedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    status: {
      type: String,
      enum: ['RECORDED', 'VERIFIED', 'REJECTED'],
      default: 'VERIFIED',
      index: true,
    },
    notes: {
      type: String,
      default: '',
    },
    invoiceNumber: {
      type: String,
      trim: true,
    },
    verifiedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    verifiedAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

commissionPaymentSchema.pre('save', function (next) {
  if (this.amount !== undefined && this.amount !== null) {
    this.amountPaise = Math.round(this.amount * 100);
  }
  next();
});

commissionPaymentSchema.index({ agreement: 1, paymentDate: -1 });

export const CommissionPayment = model<ICommissionPayment>(
  'CommissionPayment',
  commissionPaymentSchema
);
