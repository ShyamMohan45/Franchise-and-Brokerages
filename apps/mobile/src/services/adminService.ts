import { apiClient } from './apiClient';
import {
  AdminDashboardMetrics,
  AdminUserItem,
  AdminBusinessItem,
  AuditLogItem,
  BusinessAnalytics,
} from '../types/admin';

export class AdminService {
  /**
   * 1. Fetch live admin dashboard metrics
   */
  public static async getDashboardMetrics(): Promise<AdminDashboardMetrics> {
    const response = await apiClient.get<AdminDashboardMetrics>('/admin/dashboard');
    if (!response.data) {
      throw new Error(response.message || 'Failed to load admin metrics');
    }
    return response.data;
  }

  /**
   * 2. Fetch paginated users list
   */
  public static async getUsers(params: {
    page?: number;
    limit?: number;
    role?: string;
    search?: string;
  } = {}): Promise<{
    users: AdminUserItem[];
    meta: { page: number; limit: number; total: number; totalPages: number };
  }> {
    const query = new URLSearchParams();
    if (params.page) query.append('page', String(params.page));
    if (params.limit) query.append('limit', String(params.limit));
    if (params.role && params.role !== 'All') query.append('role', params.role);
    if (params.search) query.append('search', params.search);

    const qs = query.toString();
    const response = await apiClient.get<AdminUserItem[]>(`/admin/users${qs ? `?${qs}` : ''}`);

    return {
      users: response.data || [],
      meta: {
        page: response.meta?.page || 1,
        limit: response.meta?.limit || 15,
        total: response.meta?.total || 0,
        totalPages: response.meta?.totalPages || 1,
      },
    };
  }

  /**
   * 3. Update user role and account status (Super Admin only)
   */
  public static async updateUserRoleAndStatus(
    id: string,
    payload: { role?: string; status?: string }
  ): Promise<AdminUserItem> {
    const response = await apiClient.patch<AdminUserItem>(`/admin/users/${id}`, payload);
    if (!response.data) {
      throw new Error(response.message || 'Failed to update user');
    }
    return response.data;
  }

  /**
   * 4. Fetch business profiles for approval review
   */
  public static async getBusinesses(params: { status?: string } = {}): Promise<AdminBusinessItem[]> {
    const query = new URLSearchParams();
    if (params.status && params.status !== 'All') query.append('status', params.status);

    const qs = query.toString();
    const response = await apiClient.get<AdminBusinessItem[]>(
      `/admin/businesses${qs ? `?${qs}` : ''}`
    );
    return response.data || [];
  }

  /**
   * 5. Approve or reject business profile
   */
  public static async updateBusinessStatus(
    id: string,
    status: 'approved' | 'rejected' | 'under_review' | 'action_required',
    adminReviewNotes?: string
  ): Promise<AdminBusinessItem> {
    const response = await apiClient.patch<AdminBusinessItem>(
      `/admin/businesses/${id}/status`,
      { status, adminReviewNotes }
    );
    if (!response.data) {
      throw new Error(response.message || 'Failed to update business status');
    }
    return response.data;
  }

  /**
   * 6. Update franchise listing status (publish, draft, under_review, reject)
   */
  public static async updateFranchiseListingStatus(
    id: string,
    status: string,
    isFeatured?: boolean
  ): Promise<any> {
    const response = await apiClient.patch<any>(`/admin/franchises/${id}/status`, {
      status,
      isFeatured,
    });
    if (!response.data) {
      throw new Error(response.message || 'Failed to update franchise listing status');
    }
    return response.data;
  }

  /**
   * 7. Fetch system audit logs
   */
  public static async getAuditLogs(params: { page?: number; limit?: number } = {}): Promise<{
    logs: AuditLogItem[];
    meta: { page: number; limit: number; total: number; totalPages: number };
  }> {
    const query = new URLSearchParams();
    if (params.page) query.append('page', String(params.page));
    if (params.limit) query.append('limit', String(params.limit));

    const qs = query.toString();
    const response = await apiClient.get<AuditLogItem[]>(`/admin/audit-logs${qs ? `?${qs}` : ''}`);

    return {
      logs: response.data || [],
      meta: {
        page: response.meta?.page || 1,
        limit: response.meta?.limit || 20,
        total: response.meta?.total || 0,
        totalPages: response.meta?.totalPages || 1,
      },
    };
  }

  /**
   * 8. Fetch platform business operations analytics
   */
  public static async getAnalytics(): Promise<BusinessAnalytics> {
    const response = await apiClient.get<BusinessAnalytics>('/analytics/dashboard');
    if (!response.data) {
      throw new Error(response.message || 'Failed to load business analytics');
    }
    return response.data;
  }
}
