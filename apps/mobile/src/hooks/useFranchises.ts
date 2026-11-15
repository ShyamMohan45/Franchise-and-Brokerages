import { useState, useEffect, useCallback } from 'react';
import { FranchiseListing, FranchiseFilters } from '../types/franchise';
import { FranchiseService } from '../services/franchiseService';

export function useFranchises(initialFilters: FranchiseFilters = {}) {
  const [listings, setListings] = useState<FranchiseListing[]>([]);
  const [filters, setFilters] = useState<FranchiseFilters>(initialFilters);
  const [meta, setMeta] = useState({ page: 1, limit: 10, total: 0, totalPages: 1 });
  const [isLoading, setIsLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchListings = useCallback(
    async (currentFilters: FranchiseFilters, isRefresh = false) => {
      if (isRefresh) {
        setIsRefreshing(true);
      } else {
        setIsLoading(true);
      }
      setError(null);

      try {
        const result = await FranchiseService.getFranchises(currentFilters);
        setListings(result.listings);
        setMeta(result.meta);
      } catch (err: any) {
        setError(err.message || 'Failed to load franchise listings');
      } finally {
        setIsLoading(false);
        setIsRefreshing(false);
      }
    },
    []
  );

  useEffect(() => {
    fetchListings(filters);
  }, [filters, fetchListings]);

  const updateFilters = (newFilters: Partial<FranchiseFilters>) => {
    setFilters((prev) => ({ ...prev, ...newFilters, page: 1 }));
  };

  const refresh = () => {
    fetchListings(filters, true);
  };

  const loadMore = async () => {
    if (isLoading || isRefreshing || meta.page >= meta.totalPages) return;

    const nextPage = meta.page + 1;
    try {
      const result = await FranchiseService.getFranchises({ ...filters, page: nextPage });
      setListings((prev) => [...prev, ...result.listings]);
      setMeta(result.meta);
    } catch (err: any) {
      console.warn('[useFranchises] loadMore error:', err);
    }
  };

  return {
    listings,
    meta,
    filters,
    isLoading,
    isRefreshing,
    error,
    updateFilters,
    refresh,
    loadMore,
  };
}
