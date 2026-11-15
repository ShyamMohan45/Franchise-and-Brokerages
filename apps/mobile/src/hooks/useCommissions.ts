import { useState, useEffect, useCallback, useMemo } from 'react';
import { CommissionAgreement, CommissionAgreementStatus } from '../types/commission';
import { CommissionService, RecordPaymentPayload } from '../services/commissionService';

export function useCommissions(initialStatus = 'ALL') {
  const [agreements, setAgreements] = useState<CommissionAgreement[]>([]);
  const [selectedStatus, setSelectedStatus] = useState<string>(initialStatus);
  const [isLoading, setIsLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchAgreements = useCallback(
    async (status: string, isRefresh = false) => {
      if (isRefresh) {
        setIsRefreshing(true);
      } else {
        setIsLoading(true);
      }
      setError(null);

      try {
        const data = await CommissionService.getAgreements({
          status: status === 'ALL' ? undefined : status,
        });
        setAgreements(data);
      } catch (err: any) {
        setError(err?.message || 'Failed to load commission agreements');
      } finally {
        setIsLoading(false);
        setIsRefreshing(false);
      }
    },
    []
  );

  useEffect(() => {
    fetchAgreements(selectedStatus);
  }, [selectedStatus, fetchAgreements]);

  const refresh = () => fetchAgreements(selectedStatus, true);

  const totalExpected = useMemo(
    () => agreements.reduce((sum, a) => sum + (a.expectedCommission || 0), 0),
    [agreements]
  );

  const totalReceived = useMemo(
    () => agreements.reduce((sum, a) => sum + (a.receivedRevenue || 0), 0),
    [agreements]
  );

  const totalPending = useMemo(
    () => agreements.reduce((sum, a) => sum + (a.pendingCommission || 0), 0),
    [agreements]
  );

  const recordPayment = async (payload: RecordPaymentPayload) => {
    try {
      const payment = await CommissionService.recordPayment(payload);
      fetchAgreements(selectedStatus, true);
      return payment;
    } catch (err: any) {
      throw new Error(err?.message || 'Failed to record payment');
    }
  };

  const updateStatus = async (
    id: string,
    status: CommissionAgreementStatus,
    notes?: string
  ) => {
    try {
      const updated = await CommissionService.updateAgreementStatus(id, status, notes);
      setAgreements((prev) => prev.map((a) => (a._id === id ? updated : a)));
      return updated;
    } catch (err: any) {
      throw new Error(err?.message || 'Failed to update agreement status');
    }
  };

  return {
    agreements,
    selectedStatus,
    setSelectedStatus,
    totalExpected,
    totalReceived,
    totalPending,
    isLoading,
    loading: isLoading,
    isRefreshing,
    refreshing: isRefreshing,
    error,
    refresh,
    recordPayment,
    updateStatus,
  };
}
