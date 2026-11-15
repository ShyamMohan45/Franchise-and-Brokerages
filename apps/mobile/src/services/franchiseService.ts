import { apiClient } from './apiClient';
import {
  FranchiseListing,
  FranchiseFilters,
  SavedFranchiseItem,
  CreateFranchisePayload,
} from '../types/franchise';

export class FranchiseService {
  /**
   * Fetch published franchise listings with backend filtering & pagination
   */
  public static async getFranchises(filters: FranchiseFilters = {}): Promise<{
    listings: FranchiseListing[];
    meta: { page: number; limit: number; total: number; totalPages: number };
  }> {
    const params: Record<string, any> = {};

    if (filters.page) params.page = filters.page;
    if (filters.limit) params.limit = filters.limit;
    if (filters.search) params.search = filters.search;
    if (filters.industry && filters.industry !== 'All') params.industry = filters.industry;
    if (filters.location && filters.location !== 'All') params.location = filters.location;
    if (filters.modelType && filters.modelType !== 'All') params.modelType = filters.modelType;
    if (filters.minInvestment) params.minInvestment = filters.minInvestment;
    if (filters.maxInvestment) params.maxInvestment = filters.maxInvestment;
    if (filters.sort) params.sort = filters.sort;

    const queryString = new URLSearchParams(params).toString();
    const endpoint = `/franchises${queryString ? `?${queryString}` : ''}`;

    const response = await apiClient.get<FranchiseListing[]>(endpoint);

    return {
      listings: response.data || [],
      meta: {
        page: response.meta?.page || 1,
        limit: response.meta?.limit || 10,
        total: response.meta?.total || 0,
        totalPages: response.meta?.totalPages || 1,
      },
    };
  }

  /**
   * Fetch single franchise listing details by slug or ObjectId
   */
  public static async getFranchiseBySlugOrId(slugOrId: string): Promise<{
    listing: FranchiseListing;
    isSaved: boolean;
  }> {
    const response = await apiClient.get<{
      listing: FranchiseListing;
      isSaved: boolean;
    }>(`/franchises/${slugOrId}`);

    if (!response.data?.listing) {
      throw new Error(response.message || 'Franchise opportunity not found');
    }

    return response.data;
  }

  /**
   * Toggle save/unsave state for a franchise opportunity
   */
  public static async toggleSaveFranchise(id: string): Promise<boolean> {
    const response = await apiClient.post<{ isSaved: boolean }>(`/franchises/${id}/save`);
    return Boolean(response.data?.isSaved);
  }

  /**
   * Fetch all saved franchises for the authenticated investor
   */
  public static async getSavedFranchises(): Promise<SavedFranchiseItem[]> {
    const response = await apiClient.get<SavedFranchiseItem[]>('/franchises/saved');
    return response.data || [];
  }

  /**
   * Fetch brand owner's own franchise listings
   */
  public static async getMyFranchises(): Promise<FranchiseListing[]> {
    const response = await apiClient.get<FranchiseListing[]>('/franchises/my');
    return response.data || [];
  }

  /**
   * Create a new franchise opportunity listing (Brand Owner)
   */
  public static async createFranchise(payload: CreateFranchisePayload): Promise<FranchiseListing> {
    const response = await apiClient.post<FranchiseListing>('/franchises', payload);
    if (!response.data) {
      throw new Error(response.message || 'Failed to create franchise listing');
    }
    return response.data;
  }

  /**
   * Update an existing franchise listing
   */
  public static async updateFranchise(
    id: string,
    payload: Partial<CreateFranchisePayload>
  ): Promise<FranchiseListing> {
    const response = await apiClient.patch<FranchiseListing>(`/franchises/${id}`, payload);
    if (!response.data) {
      throw new Error(response.message || 'Failed to update franchise listing');
    }
    return response.data;
  }

  /**
   * Submit franchise opportunity for review
   */
  public static async submitFranchise(id: string): Promise<FranchiseListing> {
    const response = await apiClient.post<FranchiseListing>(`/franchises/${id}/submit`);
    if (!response.data) {
      throw new Error(response.message || 'Failed to submit franchise listing for review');
    }
    return response.data;
  }

  /**
   * Publish approved franchise opportunity
   */
  public static async publishFranchise(id: string): Promise<FranchiseListing> {
    const response = await apiClient.post<FranchiseListing>(`/franchises/${id}/publish`);
    if (!response.data) {
      throw new Error(response.message || 'Failed to publish franchise opportunity');
    }
    return response.data;
  }
}
