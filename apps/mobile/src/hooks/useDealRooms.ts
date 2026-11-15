import { useState, useEffect, useCallback, useMemo } from 'react';
import { DealRoom } from '../types/dealRoom';
import { DealRoomService } from '../services/dealRoomService';

export function useDealRooms() {
  const [dealRooms, setDealRooms] = useState<DealRoom[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchRooms = useCallback(async (isRefresh = false) => {
    if (isRefresh) {
      setIsRefreshing(true);
    } else {
      setIsLoading(true);
    }
    setError(null);

    try {
      const data = await DealRoomService.getDealRooms();
      setDealRooms(data);
    } catch (err: any) {
      setError(err?.message || 'Failed to load deal rooms');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchRooms();
  }, [fetchRooms]);

  const refresh = () => fetchRooms(true);

  const filteredRooms = useMemo(() => {
    if (!searchQuery.trim()) return dealRooms;
    const q = searchQuery.toLowerCase();
    return dealRooms.filter(
      (r) =>
        r.roomName?.toLowerCase().includes(q) ||
        r.franchiseListing?.brandName?.toLowerCase().includes(q) ||
        r.targetTerritory?.toLowerCase().includes(q) ||
        r.investor?.fullName?.toLowerCase().includes(q) ||
        r.businessOwner?.fullName?.toLowerCase().includes(q)
    );
  }, [dealRooms, searchQuery]);

  return {
    dealRooms: filteredRooms,
    allDealRooms: dealRooms,
    searchQuery,
    setSearchQuery,
    isLoading,
    loading: isLoading,
    isRefreshing,
    refreshing: isRefreshing,
    error,
    refresh,
  };
}
