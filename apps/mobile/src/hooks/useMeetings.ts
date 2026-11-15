import { useState, useEffect, useCallback, useMemo } from 'react';
import { CrmMeeting, MeetingStatus } from '../types/crm';
import { CrmService } from '../services/crmService';

export function useMeetings(initialStatus?: string) {
  const [meetings, setMeetings] = useState<CrmMeeting[]>([]);
  const [selectedStatus, setSelectedStatus] = useState<string>(initialStatus || 'ALL');
  const [isLoading, setIsLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchMeetings = useCallback(
    async (status: string, isRefresh = false) => {
      if (isRefresh) {
        setIsRefreshing(true);
      } else {
        setIsLoading(true);
      }
      setError(null);

      try {
        const data = await CrmService.getCrmMeetings({
          status: status === 'ALL' ? undefined : status,
        });
        setMeetings(data);
      } catch (err: any) {
        setError(err.message || 'Failed to load meetings');
      } finally {
        setIsLoading(false);
        setIsRefreshing(false);
      }
    },
    []
  );

  useEffect(() => {
    fetchMeetings(selectedStatus);
  }, [selectedStatus, fetchMeetings]);

  const updateStatus = async (id: string, status: MeetingStatus, notes?: string) => {
    try {
      const updated = await CrmService.updateMeetingStatus(id, status, notes);
      setMeetings((prev) => prev.map((m) => (m._id === id ? updated : m)));
      return updated;
    } catch (err: any) {
      throw new Error(err.message || 'Failed to update meeting status');
    }
  };

  const scheduleMeeting = async (data: {
    title: string;
    meetingType?: string;
    scheduledStartTime: string;
    scheduledEndTime: string;
    agenda: string;
    notes?: string;
  }) => {
    try {
      const created = await CrmService.scheduleMeeting(data);
      setMeetings((prev) => [created, ...prev]);
      return created;
    } catch (err: any) {
      throw new Error(err.message || 'Failed to schedule meeting');
    }
  };

  const refresh = () => fetchMeetings(selectedStatus, true);

  const scheduledCount = useMemo(
    () => meetings.filter((m) => m.status === 'scheduled').length,
    [meetings]
  );

  const completedCount = useMemo(
    () => meetings.filter((m) => m.status === 'completed').length,
    [meetings]
  );

  const cancelledCount = useMemo(
    () => meetings.filter((m) => m.status === 'cancelled').length,
    [meetings]
  );

  return {
    meetings,
    selectedStatus,
    setSelectedStatus,
    setStatusFilter: setSelectedStatus,
    isLoading,
    loading: isLoading,
    isRefreshing,
    refreshing: isRefreshing,
    error,
    updateStatus,
    updateMeetingStatus: updateStatus,
    scheduleMeeting,
    refresh,
    scheduledCount,
    completedCount,
    cancelledCount,
  };
}
