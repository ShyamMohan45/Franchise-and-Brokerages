import { useState, useEffect, useCallback } from 'react';
import { SavedFranchiseItem } from '../types/franchise';
import { FranchiseService } from '../services/franchiseService';

export function useSavedFranchises() {
  const [savedItems, setSavedItems] = useState<SavedFranchiseItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchSaved = useCallback(async (isRefresh = false) => {
    if (isRefresh) {
      setIsRefreshing(true);
    } else {
      setIsLoading(true);
    }
    setError(null);

    try {
      const data = await FranchiseService.getSavedFranchises();
      setSavedItems(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load saved franchises');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchSaved();
  }, [fetchSaved]);

  const toggleSave = async (franchiseId: string): Promise<boolean> => {
    try {
      const isSaved = await FranchiseService.toggleSaveFranchise(franchiseId);
      if (!isSaved) {
        // Remove locally from state
        setSavedItems((prev) => prev.filter((item) => (item.franchise?._id || item.franchise) !== franchiseId));
      } else {
        // Refresh to fetch populated item
        fetchSaved(true);
      }
      return isSaved;
    } catch (err: any) {
      throw new Error(err.message || 'Failed to update saved status');
    }
  };

  const refresh = () => fetchSaved(true);

  return {
    savedItems,
    isLoading,
    isRefreshing,
    error,
    toggleSave,
    refresh,
  };
}
