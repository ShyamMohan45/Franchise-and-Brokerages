import { useState, useEffect, useCallback } from 'react';
import {
  AdminDashboardMetrics,
  AdminUserItem,
  AdminBusinessItem,
  AuditLogItem,
  BusinessAnalytics,
} from '../types/admin';
import { AdminService } from '../services/adminService';

export function useAdmin() {
  const [metrics, setMetrics] = useState<AdminDashboardMetrics | null>(null);
  const [users, setUsers] = useState<AdminUserItem[]>([]);
  const [businesses, setBusinesses] = useState<AdminBusinessItem[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLogItem[]>([]);
  const [analytics, setAnalytics] = useState<BusinessAnalytics | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchMetrics = useCallback(async (isRefresh = false) => {
    if (isRefresh) {
      setIsRefreshing(true);
    } else {
      setIsLoading(true);
    }
    setError(null);

    try {
      const data = await AdminService.getDashboardMetrics();
      setMetrics(data);
    } catch (err: any) {
      setError(err?.message || 'Failed to load admin metrics');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchMetrics();
  }, [fetchMetrics]);

  const refresh = () => fetchMetrics(true);

  const fetchUsers = async (params: { role?: string; search?: string; page?: number } = {}) => {
    try {
      setIsLoading(true);
      const res = await AdminService.getUsers(params);
      setUsers(res.users);
      return res;
    } catch (err: any) {
      setError(err?.message || 'Failed to load users');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const updateUserRoleAndStatus = async (
    id: string,
    payload: { role?: string; status?: string }
  ) => {
    try {
      const updated = await AdminService.updateUserRoleAndStatus(id, payload);
      setUsers((prev) => prev.map((u) => (u._id === id ? updated : u)));
      return updated;
    } catch (err: any) {
      throw new Error(err?.message || 'Failed to update user');
    }
  };

  const fetchBusinesses = async (params: { status?: string } = {}) => {
    try {
      setIsLoading(true);
      const data = await AdminService.getBusinesses(params);
      setBusinesses(data);
      return data;
    } catch (err: any) {
      setError(err?.message || 'Failed to load businesses');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const updateBusinessStatus = async (
    id: string,
    status: 'approved' | 'rejected' | 'under_review' | 'action_required',
    notes?: string
  ) => {
    try {
      const updated = await AdminService.updateBusinessStatus(id, status, notes);
      setBusinesses((prev) => prev.map((b) => (b._id === id ? updated : b)));
      return updated;
    } catch (err: any) {
      throw new Error(err?.message || 'Failed to update business status');
    }
  };

  const updateFranchiseStatus = async (id: string, status: string, isFeatured?: boolean) => {
    try {
      const updated = await AdminService.updateFranchiseListingStatus(id, status, isFeatured);
      return updated;
    } catch (err: any) {
      throw new Error(err?.message || 'Failed to update listing status');
    }
  };

  const fetchAuditLogs = async (params: { page?: number; limit?: number } = {}) => {
    try {
      setIsLoading(true);
      const res = await AdminService.getAuditLogs(params);
      setAuditLogs(res.logs);
      return res;
    } catch (err: any) {
      setError(err?.message || 'Failed to load audit logs');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const fetchAnalytics = async () => {
    try {
      setIsLoading(true);
      const data = await AdminService.getAnalytics();
      setAnalytics(data);
      return data;
    } catch (err: any) {
      setError(err?.message || 'Failed to load analytics');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    metrics,
    users,
    businesses,
    auditLogs,
    analytics,
    isLoading,
    loading: isLoading,
    isRefreshing,
    refreshing: isRefreshing,
    error,
    refresh,
    fetchUsers,
    updateUserRoleAndStatus,
    fetchBusinesses,
    updateBusinessStatus,
    updateFranchiseStatus,
    fetchAuditLogs,
    fetchAnalytics,
  };
}
