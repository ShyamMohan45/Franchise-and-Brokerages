import { apiClient } from './apiClient';
import { FranchiseApplication, CreateEnquiryPayload } from '../types/enquiry';

export class EnquiryService {
  /**
   * Submit a new investor enquiry / application for a franchise listing
   */
  public static async submitEnquiry(payload: CreateEnquiryPayload): Promise<FranchiseApplication> {
    const response = await apiClient.post<FranchiseApplication>('/applications', payload);
    if (!response.data) {
      throw new Error(response.message || 'Failed to submit franchise enquiry');
    }
    return response.data;
  }

  /**
   * Get all enquiries submitted by the authenticated investor
   */
  public static async getMyEnquiries(): Promise<FranchiseApplication[]> {
    const response = await apiClient.get<FranchiseApplication[]>('/applications/my');
    return response.data || [];
  }

  /**
   * Get all enquiries received by the authenticated brand owner
   */
  public static async getBrandEnquiries(): Promise<FranchiseApplication[]> {
    const response = await apiClient.get<FranchiseApplication[]>('/applications/business');
    return response.data || [];
  }

  /**
   * Get single application details by ID
   */
  public static async getEnquiryById(id: string): Promise<FranchiseApplication> {
    const response = await apiClient.get<FranchiseApplication>(`/applications/${id}`);
    if (!response.data) {
      throw new Error(response.message || 'Enquiry record not found');
    }
    return response.data;
  }
}
