export type PaymentPurpose =
  | 'subscription'
  | 'featured_listing'
  | 'commission'
  | 'investor_premium'
  | 'advisory_service';

export type PaymentStatus = 'created' | 'pending' | 'captured' | 'failed' | 'refunded';

export interface CreateOrderParams {
  purpose: PaymentPurpose;
  planId?: string;
  packageId?: string;
  entityId?: string;
  entityType?: 'Subscription' | 'FranchiseListing' | 'CommissionAgreement';
  billingInterval?: 'monthly' | 'yearly';
  customAmountINR?: number;
  metadata?: Record<string, any>;
}

export interface RazorpayOrderResponse {
  transaction: {
    _id: string;
    transactionReference: string;
    amount: number;
    amountPaise: number;
    currency: string;
    status: PaymentStatus;
    purpose: PaymentPurpose;
    isSandbox: boolean;
  };
  orderId: string;
  keyId: string;
  amountINR: number;
  amountPaise: number;
  currency: string;
  isSandbox: boolean;
}

export interface VerifyPaymentParams {
  transactionReference: string;
  gatewayOrderId: string;
  gatewayPaymentId: string;
  gatewaySignature: string;
  billingDetails?: {
    fullName: string;
    email: string;
    phone?: string;
    companyName?: string;
    billingAddress?: string;
    city?: string;
    state?: string;
    country?: string;
    gstin?: string;
  };
}

export interface PaymentTransactionItem {
  _id: string;
  transactionReference: string;
  purpose: PaymentPurpose;
  amount: number;
  amountPaise: number;
  currency: string;
  status: PaymentStatus;
  gateway: string;
  gatewayOrderId?: string;
  gatewayPaymentId?: string;
  isSandbox: boolean;
  createdAt: string;
  metadata?: Record<string, any>;
  invoiceId?: string;
}

export interface InvoiceItem {
  _id: string;
  invoiceNumber: string;
  subtotal: number;
  gstRate: number;
  gstAmount: number;
  totalAmount: number;
  currency: string;
  status: 'draft' | 'issued' | 'paid' | 'refunded' | 'void';
  issuedDate: string;
  paidDate?: string;
  items: Array<{
    description: string;
    quantity: number;
    unitPrice: number;
    amount: number;
  }>;
  billingDetails: {
    fullName: string;
    email: string;
    phone?: string;
    companyName?: string;
    billingAddress?: string;
    city?: string;
    state?: string;
    country?: string;
    gstin?: string;
  };
}
