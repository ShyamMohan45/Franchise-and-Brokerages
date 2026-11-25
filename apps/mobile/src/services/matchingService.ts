import { apiClient } from './apiClient';
import {
  InvestorSmartMatch,
  FranchisorSmartMatch,
  FranchisorMatchListing,
  InvestorMatch,
} from '../types/matching';

export class MatchingService {
  /**
   * 1. Franchisor-side discovery: Find anonymized investors matching franchise requirements
   * Role: business_owner, brand_owner, broker, admin
   */
  public static async getFranchisorMatches(franchiseId?: string): Promise<{
    matches: FranchisorSmartMatch[];
    totalMatches: number;
    criteriaSummary?: any;
  }> {
    const params = franchiseId ? { franchiseId } : undefined;
    const response = await apiClient.get<any>('/matching/franchisor', { params });

    if (!response) {
      return { matches: [], totalMatches: 0 };
    }

    // Backend may return:
    // { success: true, data: matches, meta: { count: number } }
    // or { matches: [], totalMatches: 0 }
    if (Array.isArray(response.data)) {
      return {
        matches: response.data,
        totalMatches: response.data.length,
      };
    }

    if (response.data && Array.isArray((response.data as any).matches)) {
      return {
        matches: (response.data as any).matches,
        totalMatches: (response.data as any).totalMatches || (response.data as any).matches.length,
        criteriaSummary: (response.data as any).criteriaSummary,
      };
    }

    return { matches: [], totalMatches: 0 };
  }

  /**
   * 2. Investor-side discovery: Find verified franchise opportunities matching investor budget & criteria
   * Role: investor
   */
  public static async getInvestorMatches(): Promise<{
    matches: InvestorSmartMatch[];
    totalMatches: number;
  }> {
    const response = await apiClient.get<any>('/matching/investor');

    if (!response) {
      return { matches: [], totalMatches: 0 };
    }

    // Backend may return:
    // { success: true, count: number, data: matches }
    // where matches is Array<{ listing, matchAnalysis }>
    if (Array.isArray(response.data)) {
      return {
        matches: response.data,
        totalMatches: response.data.length,
      };
    }

    if (response.data && Array.isArray((response.data as any).matches)) {
      return {
        matches: (response.data as any).matches,
        totalMatches: (response.data as any).totalMatches || (response.data as any).matches.length,
      };
    }

    return { matches: [], totalMatches: 0 };
  }
}
