import { apiClient } from './apiClient';
import {
  CommissionAgreement,
  CommissionPayment,
  CommissionStatement,
  CommissionAgreementStatus,
} from '../types/commission';

export interface RecordPaymentPayload {
  agreementId: string;
  paymentReference: string;
  amount: number;
  paymentMethod: string;
  paymentDate?: string;
  payerName: string;
  payerRole?: string;
  milestoneTitle?: string;
  invoiceNumber?: string;
  notes?: string;
}

export interface CreateCommissionAgreementPayload {
  dealId: string;
  commissionType: 'percentage' | 'fixed';
  commissionRate?: number;
  fixedAmount?: number;
  payer?: 'brand' | 'investor' | 'split';
  calculationBasis?: 'deal_value' | 'franchise_fee' | 'fixed';
  baseAmount?: number;
  milestones?: Array<{
    title: string;
    percentage: number;
    amount: number;
    triggerStage: string;
    dueDate?: string;
  }>;
  termsAndConditions?: string;
  notes?: string;
}

export class CommissionService {
  /**
   * 1. Fetch commission agreements list
   */
  public static async getAgreements(params: {
    status?: string;
    payer?: string;
    dealId?: string;
  } = {}): Promise<CommissionAgreement[]> {
    const query = new URLSearchParams();
    if (params.status && params.status !== 'ALL') query.append('status', params.status);
    if (params.payer && params.payer !== 'ALL') query.append('payer', params.payer);
    if (params.dealId) query.append('dealId', params.dealId);

    const qs = query.toString();
    const response = await apiClient.get<CommissionAgreement[]>(
      `/commissions/agreements${qs ? `?${qs}` : ''}`
    );
    return response.data || [];
  }

  /**
   * 2. Fetch single commission agreement with payments
   */
  public static async getAgreementById(id: string): Promise<CommissionAgreement> {
    const response = await apiClient.get<CommissionAgreement>(`/commissions/agreements/${id}`);
    if (!response.data) {
      throw new Error(response.message || 'Commission agreement not found');
    }
    return response.data;
  }

  /**
   * 3. Create commission agreement
   */
  public static async createAgreement(
    payload: CreateCommissionAgreementPayload
  ): Promise<CommissionAgreement> {
    const response = await apiClient.post<CommissionAgreement>(
      '/commissions/agreements',
      payload
    );
    if (!response.data) {
      throw new Error(response.message || 'Failed to create commission agreement');
    }
    return response.data;
  }

  /**
   * 4. Update commission agreement status
   */
  public static async updateAgreementStatus(
    id: string,
    status: CommissionAgreementStatus,
    notes?: string
  ): Promise<CommissionAgreement> {
    const response = await apiClient.patch<CommissionAgreement>(
      `/commissions/agreements/${id}/status`,
      { status, notes }
    );
    if (!response.data) {
      throw new Error(response.message || 'Failed to update agreement status');
    }
    return response.data;
  }

  /**
   * 5. Record verified commission payment
   */
  public static async recordPayment(
    payload: RecordPaymentPayload
  ): Promise<CommissionPayment> {
    const response = await apiClient.post<CommissionPayment>(
      '/commissions/payments',
      payload
    );
    if (!response.data) {
      throw new Error(response.message || 'Failed to record commission payment');
    }
    return response.data;
  }

  /**
   * 6. Generate official commission statement
   */
  public static async getStatement(id: string): Promise<CommissionStatement> {
    const response = await apiClient.get<CommissionStatement>(
      `/commissions/agreements/${id}/statement`
    );
    if (!response.data) {
      throw new Error(response.message || 'Failed to retrieve commission statement');
    }
    return response.data;
  }
}
