import { apiClient } from './apiClient';
import {
  IntroductionRequestItem,
  CreateIntroductionPayload,
  RespondIntroductionPayload,
} from '../types/introduction';

export { IntroductionRequestItem } from '../types/introduction';

export class IntroductionService {
  /**
   * Dispatches an introduction request between an investor and a franchisor
   */
  public static async createIntroduction(
    payload: CreateIntroductionPayload
  ): Promise<IntroductionRequestItem> {
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
    const response = await apiClient.get<any>('/introductions/my');
    if (!response) {
      return [];
    }
    if (Array.isArray(response.data)) {
      return response.data;
    }
    if (response.data && Array.isArray((response.data as any).introductions)) {
      return (response.data as any).introductions;
    }
    return [];
  }

  /**
   * Responds to an introduction request (ACCEPT, REJECT, or CANCEL)
   */
  public static async respondToIntroduction(
    id: string,
    action: 'ACCEPT' | 'REJECT' | 'CANCEL',
    notes?: string,
    asParty?: 'franchisor' | 'investor'
  ): Promise<IntroductionRequestItem> {
    const payload: RespondIntroductionPayload = { action, notes, asParty };
    const response = await apiClient.post<IntroductionRequestItem>(
      `/introductions/${id}/respond`,
      payload
    );
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
