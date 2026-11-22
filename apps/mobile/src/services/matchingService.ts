import { apiClient } from './apiClient';
import { InvestorMatch, FranchisorMatchListing } from '../types/matching';

export class MatchingService {
  /**
   * 1. Franchisor-side discovery: Find anonymized investors matching franchise requirements
   * Role: business_owner, brand_owner, broker, admin
   */
  public static async getFranchisorMatches(franchiseId?: string): Promise<{
    matches: InvestorMatch[];
    totalMatches: number;
    criteriaSummary?: any;
  }> {
    const params = franchiseId ? { franchiseId } : undefined;
    const response = await apiClient.get<{
      matches: InvestorMatch[];
      totalMatches: number;
      criteriaSummary?: any;
    }>('/matching/franchisor', { params });

    if (!response.data) {
      return { matches: [], totalMatches: 0 };
    }
    return response.data;
  }

  /**
   * 2. Investor-side discovery: Find verified franchise opportunities matching investor budget & criteria
   * Role: investor
   */
  public static async getInvestorMatches(): Promise<{
    matches: FranchisorMatchListing[];
    totalMatches: number;
  }> {
    const response = await apiClient.get<{
      matches: FranchisorMatchListing[];
      totalMatches: number;
    }>('/matching/investor');

    if (!response.data) {
      return { matches: [], totalMatches: 0 };
    }
    return response.data;
  }
}
