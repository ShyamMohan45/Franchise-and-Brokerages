import { apiClient } from './apiClient';
import {
  UserSubscription,
  PlansResponse,
} from '../types/subscription';

export class SubscriptionService {
  /**
   * 1. Get current active subscription, plan limits, and usage counters
   */
  public static async getCurrentSubscription(): Promise<UserSubscription> {
    const response = await apiClient.get<UserSubscription>('/subscriptions/current');
    if (!response.data) {
      throw new Error(response.message || 'Failed to fetch current subscription');
    }
    return response.data;
  }

  /**
   * 2. Get all configured subscription plans and featured listing packages
   */
  public static async getSubscriptionPlans(): Promise<PlansResponse> {
    const response = await apiClient.get<PlansResponse>('/subscriptions/plans');
    if (!response.data) {
      throw new Error(response.message || 'Failed to fetch subscription plans');
    }
    return response.data;
  }

  /**
   * 3. Request cancellation at period end (preserves access until period expiry)
   */
  public static async cancelSubscription(): Promise<UserSubscription> {
    const response = await apiClient.post<UserSubscription>('/subscriptions/cancel');
    if (!response.data) {
      throw new Error(response.message || 'Failed to cancel subscription');
    }
    return response.data;
  }

  /**
   * 4. Apply an included featured listing slot to promote a listing
   */
  public static async applyFeaturedSlot(listingId: string): Promise<any> {
    const response = await apiClient.post<any>(`/payments/featured/${listingId}/apply-slot`);
    if (!response.data && !response.success) {
      throw new Error(response.message || 'Failed to apply featured listing slot');
    }
    return response.data;
  }
}
