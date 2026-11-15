import { useState, useEffect, useCallback } from 'react';
import { Lead } from '../types/crm';
import { CrmService } from '../services/crmService';

export function useLeads(
  initialFiltersOrStatus?: { search?: string; status?: string; initialStatus?: string } | string
) {
  const normalizedInitial =
    typeof initialFiltersOrStatus === 'string'
      ? { status: initialFiltersOrStatus }
      : {
          search: initialFiltersOrStatus?.search,
          status: initialFiltersOrStatus?.initialStatus || initialFiltersOrStatus?.status,
        };

  const [leads, setListings] = useState<Lead[]>([]);
  const [filters, setFilters] = useState(normalizedInitial);
  const [meta, setMeta] = useState({ page: 1, limit: 20, total: 0, totalPages: 1 });
  const [isLoading, setIsLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchLeads = useCallback(
    async (currentFilters: typeof filters, isRefresh = false) => {
      if (isRefresh) {
        setIsRefreshing(true);
      } else {
        setIsLoading(true);
      }
      setError(null);

      try {
        const result = await CrmService.getLeads(currentFilters);
        setListings(result.leads);
        setMeta(result.meta);
      } catch (err: any) {
        setError(err.message || 'Failed to load leads');
      } finally {
        setIsLoading(false);
        setIsRefreshing(false);
      }
    },
    []
  );

  useEffect(() => {
    fetchLeads(filters);
  }, [filters, fetchLeads]);

  const updateFilters = (newFilters: Partial<typeof filters>) => {
    setFilters((prev) => ({ ...prev, ...newFilters }));
  };

  const setSearch = (search: string) => updateFilters({ search });
  const setStatus = (status: string) => updateFilters({ status });
  const refresh = () => fetchLeads(filters, true);

  return {
    leads,
    meta,
    filters,
    isLoading,
    loading: isLoading,
    isRefreshing,
    refreshing: isRefreshing,
    error,
    updateFilters,
    setSearch,
    setStatus,
    refresh,
  };
}
