import { useState, useEffect, useCallback } from 'react';
import { BrokerageDeal, DealPipelineResponse, DealStage } from '../types/crm';
import { CrmService } from '../services/crmService';

export function useDeals(initialStageOrConfig?: string | { initialStage?: string }) {
  const initialStage =
    typeof initialStageOrConfig === 'string'
      ? initialStageOrConfig
      : initialStageOrConfig?.initialStage || 'ALL';

  const [pipelineData, setPipelineData] = useState<DealPipelineResponse | null>(null);
  const [selectedStage, setSelectedStage] = useState<string>(initialStage);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchDeals = useCallback(
    async (stage: string, search = '', isRefresh = false) => {
      if (isRefresh) {
        setIsRefreshing(true);
      } else {
        setIsLoading(true);
      }
      setError(null);

      try {
        const data = await CrmService.getPipelineDeals({
          stage: stage === 'ALL' ? undefined : stage,
          search: search || undefined,
        });
        setPipelineData(data);
      } catch (err: any) {
        setError(err.message || 'Failed to load deal pipeline');
      } finally {
        setIsLoading(false);
        setIsRefreshing(false);
      }
    },
    []
  );

  useEffect(() => {
    fetchDeals(selectedStage, searchQuery);
  }, [selectedStage, searchQuery, fetchDeals]);

  const updateStage = async (dealId: string, newStage: DealStage, note?: string) => {
    try {
      await CrmService.updateDealStage(dealId, newStage, note);
      fetchDeals(selectedStage, searchQuery, true);
    } catch (err: any) {
      throw new Error(err.message || 'Failed to update deal stage');
    }
  };

  const refresh = () => fetchDeals(selectedStage, searchQuery, true);

  return {
    pipelineData,
    deals: pipelineData?.deals || [],
    columns: pipelineData?.columns || {},
    totalPipelineValue: pipelineData?.totalPipelineValue || 0,
    activeDealsCount: pipelineData?.activeDealsCount || 0,
    closedWonCount: pipelineData?.closedWonCount || 0,
    selectedStage,
    setSelectedStage,
    setStage: setSelectedStage,
    searchQuery,
    setSearch: setSearchQuery,
    isLoading,
    loading: isLoading,
    isRefreshing,
    refreshing: isRefreshing,
    error,
    updateStage,
    refresh,
  };
}
