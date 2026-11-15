import { useState, useEffect, useCallback, useMemo } from 'react';
import {
  DueDiligenceChecklist,
  DueDiligenceCategoryItem,
  DueDiligenceItemStatus,
} from '../types/dealRoom';
import { DealRoomService, UpdateDiligenceItemParams } from '../services/dealRoomService';

export function useDueDiligence(dealRoomId: string) {
  const [checklist, setChecklist] = useState<DueDiligenceChecklist | null>(null);
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');
  const [isLoading, setIsLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchChecklist = useCallback(
    async (isRefresh = false) => {
      if (!dealRoomId) return;
      if (isRefresh) {
        setIsRefreshing(true);
      } else {
        setIsLoading(true);
      }
      setError(null);

      try {
        const data = await DealRoomService.getDueDiligence(dealRoomId);
        setChecklist(data);
      } catch (err: any) {
        setError(err?.message || 'Failed to load due diligence checklist');
      } finally {
        setIsLoading(false);
        setIsRefreshing(false);
      }
    },
    [dealRoomId]
  );

  useEffect(() => {
    fetchChecklist();
  }, [fetchChecklist]);

  const refresh = () => fetchChecklist(true);

  const updateItem = async (itemId: string, params: UpdateDiligenceItemParams) => {
    try {
      setIsUpdating(true);
      const updated = await DealRoomService.updateDueDiligenceItem(
        dealRoomId,
        itemId,
        params
      );
      setChecklist(updated);
      return updated;
    } catch (err: any) {
      throw new Error(err?.message || 'Failed to update diligence item');
    } finally {
      setIsUpdating(false);
    }
  };

  const items = useMemo(() => checklist?.items || [], [checklist]);

  const filteredItems = useMemo(() => {
    if (selectedStatus === 'ALL') return items;
    return items.filter((i) => i.status.toUpperCase() === selectedStatus.toUpperCase());
  }, [items, selectedStatus]);

  const approvedCount = useMemo(
    () =>
      items.filter(
        (i) =>
          i.status === 'APPROVED' || i.status === 'verified'
      ).length,
    [items]
  );

  const pendingCount = useMemo(
    () =>
      items.filter(
        (i) =>
          i.status === 'PENDING' ||
          i.status === 'IN_PROGRESS' ||
          i.status === 'SUBMITTED' ||
          i.status === 'UNDER_REVIEW' ||
          i.status === 'pending' ||
          i.status === 'in_review'
      ).length,
    [items]
  );

  const flaggedCount = useMemo(
    () =>
      items.filter(
        (i) =>
          i.status === 'REJECTED' ||
          i.status === 'NEEDS_CLARIFICATION' ||
          i.status === 'flagged'
      ).length,
    [items]
  );

  const completionPercentage = useMemo(() => {
    if (!items.length) return 0;
    return Math.round((approvedCount / items.length) * 100);
  }, [items, approvedCount]);

  return {
    checklist,
    items: filteredItems,
    allItems: items,
    selectedStatus,
    setSelectedStatus,
    isLoading,
    loading: isLoading,
    isRefreshing,
    refreshing: isRefreshing,
    isUpdating,
    error,
    refresh,
    updateItem,
    approvedCount,
    pendingCount,
    flaggedCount,
    completionPercentage,
  };
}
