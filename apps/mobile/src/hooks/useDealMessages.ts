import { useState, useEffect, useCallback } from 'react';
import { DealMessage } from '../types/dealRoom';
import { DealRoomService } from '../services/dealRoomService';

export function useDealMessages(dealRoomId: string) {
  const [messages, setMessages] = useState<DealMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchMessages = useCallback(
    async (isRefresh = false) => {
      if (!dealRoomId) return;
      if (isRefresh) {
        setIsRefreshing(true);
      } else {
        setIsLoading(true);
      }
      setError(null);

      try {
        const data = await DealRoomService.getMessages(dealRoomId);
        setMessages(data);
      } catch (err: any) {
        setError(err?.message || 'Failed to load messages');
      } finally {
        setIsLoading(false);
        setIsRefreshing(false);
      }
    },
    [dealRoomId]
  );

  useEffect(() => {
    fetchMessages();
  }, [fetchMessages]);

  const refresh = () => fetchMessages(true);

  const sendMessage = async (params: {
    text: string;
    isInternal?: boolean;
    relatedDocument?: string;
    relatedDiligenceItem?: string;
  }) => {
    try {
      setIsSending(true);
      const created = await DealRoomService.postMessage(dealRoomId, params);
      setMessages((prev) => [...prev, created]);
      return created;
    } catch (err: any) {
      throw new Error(err?.message || 'Failed to send message');
    } finally {
      setIsSending(false);
    }
  };

  return {
    messages,
    isLoading,
    loading: isLoading,
    isRefreshing,
    refreshing: isRefreshing,
    isSending,
    error,
    refresh,
    sendMessage,
  };
}
