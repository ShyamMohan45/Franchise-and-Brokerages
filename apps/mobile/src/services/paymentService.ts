import { apiClient } from './apiClient';
import {
  CreateOrderParams,
  RazorpayOrderResponse,
  VerifyPaymentParams,
  PaymentTransactionItem,
  InvoiceItem,
} from '../types/payment';

export class PaymentService {
  /**
   * 1. Create a server-side payment checkout order
   * Reuses the existing backend PaymentService.createOrder endpoint.
   */
  public static async createOrder(params: CreateOrderParams): Promise<RazorpayOrderResponse> {
    const response = await apiClient.post<RazorpayOrderResponse>('/payments/order', params);
    if (!response.data) {
      throw new Error(response.message || 'Failed to create payment checkout order');
    }
    return response.data;
  }

  /**
   * 2. Submit cryptographic payment signature to backend for verification
   * Only the backend verification endpoint can fulfill entitlements.
   * Client success callbacks without signature verification are never accepted.
   */
  public static async verifyPayment(params: VerifyPaymentParams): Promise<{
    transaction: PaymentTransactionItem;
    invoice?: InvoiceItem;
  }> {
    const response = await apiClient.post<{
      transaction: PaymentTransactionItem;
      invoice?: InvoiceItem;
    }>('/payments/verify', params);

    if (!response.data || !response.success) {
      throw new Error(response.message || 'Payment cryptographic signature verification failed');
    }
    return response.data;
  }

  /**
   * 3. Fetch user's payment transaction history
   */
  public static async getPaymentHistory(): Promise<PaymentTransactionItem[]> {
    const response = await apiClient.get<PaymentTransactionItem[]>('/payments/history');
    return response.data || [];
  }

  /**
   * 4. Fetch user's statutory GST tax invoices
   */
  public static async getInvoices(): Promise<InvoiceItem[]> {
    const response = await apiClient.get<InvoiceItem[]>('/payments/invoices');
    return response.data || [];
  }

  /**
   * 5. Fetch a single invoice with full items and tax details
   */
  public static async getInvoiceById(id: string): Promise<InvoiceItem> {
    const response = await apiClient.get<InvoiceItem>(`/payments/invoices/${id}`);
    if (!response.data) {
      throw new Error(response.message || 'Invoice record not found');
    }
    return response.data;
  }
}
