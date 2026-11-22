import { Schema, model, Document, Types } from 'mongoose';

export interface IInvoiceItem {
  description: string;
  quantity: number;
  unitPrice: number;
  unitPricePaise: number;
  amount: number;
  amountPaise: number;
}

export interface IBillingDetails {
  fullName: string;
  email: string;
  phone?: string;
  companyName?: string;
  billingAddress?: string;
  city?: string;
  state?: string;
  country: string;
  gstin?: string;
}

export interface IInvoice extends Document {
  invoiceNumber: string; // e.g. INV-202611-0001
  user: Types.ObjectId;
  transaction: Types.ObjectId;
  subscription?: Types.ObjectId;
  commissionAgreement?: Types.ObjectId;
  billingDetails: IBillingDetails;
  items: IInvoiceItem[];
  subtotal: number;
  subtotalPaise: number;
  gstRate: number; // e.g. 0.18
  gstAmount: number;
  gstAmountPaise: number;
  totalAmount: number;
  totalAmountPaise: number;
  currency: string;
  status: 'draft' | 'issued' | 'paid' | 'void' | 'refunded';
  issuedDate: Date;
  paidDate?: Date;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const invoiceItemSchema = new Schema<IInvoiceItem>(
  {
    description: { type: String, required: true },
    quantity: { type: Number, required: true, default: 1 },
    unitPrice: { type: Number, required: true },
    unitPricePaise: { type: Number, required: true },
    amount: { type: Number, required: true },
    amountPaise: { type: Number, required: true },
  },
  { _id: false }
);

const billingDetailsSchema = new Schema<IBillingDetails>(
  {
    fullName: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String },
    companyName: { type: String },
    billingAddress: { type: String },
    city: { type: String },
    state: { type: String },
    country: { type: String, default: 'India' },
    gstin: { type: String },
  },
  { _id: false }
);

const invoiceSchema = new Schema<IInvoice>(
  {
    invoiceNumber: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      index: true,
    },
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    transaction: {
      type: Schema.Types.ObjectId,
      ref: 'PaymentTransaction',
      required: true,
      index: true,
    },
    subscription: {
      type: Schema.Types.ObjectId,
      ref: 'Subscription',
    },
    commissionAgreement: {
      type: Schema.Types.ObjectId,
      ref: 'CommissionAgreement',
    },
    billingDetails: {
      type: billingDetailsSchema,
      required: true,
    },
    items: {
      type: [invoiceItemSchema],
      required: true,
    },
    subtotal: {
      type: Number,
      required: true,
    },
    subtotalPaise: {
      type: Number,
      required: true,
    },
    gstRate: {
      type: Number,
      default: 0.18,
    },
    gstAmount: {
      type: Number,
      required: true,
    },
    gstAmountPaise: {
      type: Number,
      required: true,
    },
    totalAmount: {
      type: Number,
      required: true,
    },
    totalAmountPaise: {
      type: Number,
      required: true,
    },
    currency: {
      type: String,
      default: 'INR',
    },
    status: {
      type: String,
      enum: ['draft', 'issued', 'paid', 'void', 'refunded'],
      default: 'paid',
      index: true,
    },
    issuedDate: {
      type: Date,
      default: Date.now,
    },
    paidDate: {
      type: Date,
      default: Date.now,
    },
    notes: {
      type: String,
      default: 'Computer-generated tax invoice. No signature required under Indian GST IT Act.',
    },
  },
  {
    timestamps: true,
  }
);

export const Invoice = model<IInvoice>('Invoice', invoiceSchema);
