import { useState, useEffect, useCallback } from 'react';
import { FranchiseApplication, CreateEnquiryPayload } from '../types/enquiry';
import { EnquiryService } from '../services/enquiryService';

export function useEnquiries(mode: 'investor' | 'brand' = 'investor') {
  const [enquiries, setEnquiries] = useState<FranchiseApplication[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchEnquiries = useCallback(
    async (isRefresh = false) => {
      if (isRefresh) {
        setIsRefreshing(true);
      } else {
        setIsLoading(true);
      }
      setError(null);

      try {
        const data =
          mode === 'investor'
            ? await EnquiryService.getMyEnquiries()
            : await EnquiryService.getBrandEnquiries();
        setEnquiries(data);
      } catch (err: any) {
        setError(err.message || 'Failed to load enquiries');
      } finally {
        setIsLoading(false);
        setIsRefreshing(false);
      }
    },
    [mode]
  );

  useEffect(() => {
    fetchEnquiries();
  }, [fetchEnquiries]);

  const submitEnquiry = async (payload: CreateEnquiryPayload): Promise<FranchiseApplication> => {
    try {
      const created = await EnquiryService.submitEnquiry(payload);
      setEnquiries((prev) => [created, ...prev]);
      return created;
    } catch (err: any) {
      throw new Error(err.message || 'Failed to submit enquiry');
    }
  };

  const refresh = () => fetchEnquiries(true);

  return {
    enquiries,
    isLoading,
    isRefreshing,
    error,
    submitEnquiry,
    refresh,
  };
}
