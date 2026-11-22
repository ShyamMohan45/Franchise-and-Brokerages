import { apiClient } from './apiClient';

export interface IntroductionRequestItem {
  _id: string;
  referenceNumber: string;
  brandName: string;
  franchise: any;
  business: any;
  businessOwnerUser: any;
  investorUser: any;
  investorProfile: any;
  initiatedBy: 'investor' | 'franchisor' | 'admin';
  status:
    | 'PENDING'
    | 'ADMIN_REVIEW'
    | 'ACCEPTED_BY_FRANCHISOR'
    | 'ACCEPTED_BY_INVESTOR'
    | 'MUTUALLY_ACCEPTED'
    | 'REJECTED'
    | 'CANCELLED'
    | 'DEAL_ROOM_CREATED';
  franchisorConsent: { consented: boolean; consentedAt?: string; notes?: string };
  investorConsent: { consented: boolean; consentedAt?: string; notes?: string };
  targetCity: string;
  investmentBudget: number;
  dealRoom?: string;
  createdAt: string;
  updatedAt: string;
}

export class IntroductionService {
  /**
   * Dispatches an introduction request between an investor and a franchisor
   */
  public static async createIntroduction(payload: {
    franchiseId?: string;
    investorProfileId?: string;
    targetCity?: string;
    investmentBudget?: number;
    initialMessage?: string;
    compatibilityScore?: number;
  }): Promise<IntroductionRequestItem> {
    const response = await apiClient.post<IntroductionRequestItem>('/introductions', payload);
    if (!response.data) {
      throw new Error(response.message || 'Failed to dispatch introduction request');
    }
    return response.data;
  }

  /**
   * Retrieves all introductions for the authenticated user
   */
  public static async getMyIntroductions(): Promise<IntroductionRequestItem[]> {
    const response = await apiClient.get<IntroductionRequestItem[]>('/introductions/my');
    return response.data || [];
  }

  /**
   * Responds to an introduction request (ACCEPT, REJECT, or CANCEL)
   */
  public static async respondToIntroduction(
    id: string,
    action: 'ACCEPT' | 'REJECT' | 'CANCEL',
    notes?: string
  ): Promise<IntroductionRequestItem> {
    const response = await apiClient.post<IntroductionRequestItem>(`/introductions/${id}/respond`, {
      action,
      notes,
    });
    if (!response.data) {
      throw new Error(response.message || 'Failed to update introduction response');
    }
    return response.data;
  }

  /**
   * Creates or enters an authorized Deal Room from a mutually accepted introduction
   */
  public static async createDealRoom(
    id: string
  ): Promise<{ dealRoom: any; introduction: IntroductionRequestItem }> {
    const response = await apiClient.post<{ dealRoom: any; introduction: IntroductionRequestItem }>(
      `/introductions/${id}/deal-room`,
      {}
    );
    if (!response.data) {
      throw new Error(response.message || 'Failed to initialize Deal Room');
    }
    return response.data;
  }
}
