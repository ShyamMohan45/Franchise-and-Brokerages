import { useState, useEffect, useCallback, useMemo } from 'react';
import { DealDocument, DealDocumentCategory, DealDocumentStatus } from '../types/dealRoom';
import { DealRoomService, UploadDocumentParams } from '../services/dealRoomService';

export function useDocuments(dealRoomId: string) {
  const [documents, setDocuments] = useState<DealDocument[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [downloadingDocId, setDownloadingDocId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchDocuments = useCallback(
    async (isRefresh = false) => {
      if (!dealRoomId) return;
      if (isRefresh) {
        setIsRefreshing(true);
      } else {
        setIsLoading(true);
      }
      setError(null);

      try {
        const data = await DealRoomService.getDealRoomDocuments(dealRoomId);
        setDocuments(data);
      } catch (err: any) {
        setError(err?.message || 'Failed to load documents');
      } finally {
        setIsLoading(false);
        setIsRefreshing(false);
      }
    },
    [dealRoomId]
  );

  useEffect(() => {
    fetchDocuments();
  }, [fetchDocuments]);

  const refresh = () => fetchDocuments(true);

  const uploadDocument = async (params: UploadDocumentParams) => {
    try {
      setIsUploading(true);
      const created = await DealRoomService.uploadDocument(dealRoomId, params);
      setDocuments((prev) => [created, ...prev]);
      return created;
    } catch (err: any) {
      throw new Error(err?.message || 'Failed to upload document');
    } finally {
      setIsUploading(false);
    }
  };

  const uploadVersion = async (
    docId: string,
    file: { uri: string; name: string; mimeType?: string },
    changeNote?: string
  ) => {
    try {
      setIsUploading(true);
      const updated = await DealRoomService.uploadDocumentVersion(
        dealRoomId,
        docId,
        file,
        changeNote
      );
      setDocuments((prev) => prev.map((d) => (d._id === docId ? updated : d)));
      return updated;
    } catch (err: any) {
      throw new Error(err?.message || 'Failed to upload new version');
    } finally {
      setIsUploading(false);
    }
  };

  const downloadDocument = async (docId: string, fileName: string) => {
    try {
      setDownloadingDocId(docId);
      const uri = await DealRoomService.downloadDocument(dealRoomId, docId, fileName);
      return uri;
    } catch (err: any) {
      throw new Error(err?.message || 'Download failed');
    } finally {
      setDownloadingDocId(null);
    }
  };

  const updateStatus = async (
    docId: string,
    status: DealDocumentStatus,
    reviewerNotes?: string
  ) => {
    try {
      const updated = await DealRoomService.updateDocumentStatus(
        dealRoomId,
        docId,
        status,
        reviewerNotes
      );
      setDocuments((prev) => prev.map((d) => (d._id === docId ? updated : d)));
      return updated;
    } catch (err: any) {
      throw new Error(err?.message || 'Failed to update document status');
    }
  };

  const deleteDocument = async (docId: string) => {
    try {
      await DealRoomService.deleteDocument(dealRoomId, docId);
      setDocuments((prev) => prev.filter((d) => d._id !== docId));
    } catch (err: any) {
      throw new Error(err?.message || 'Failed to delete document');
    }
  };

  const filteredDocuments = useMemo(() => {
    return documents.filter((d) => {
      const matchesCategory =
        selectedCategory === 'ALL' || d.category === selectedCategory;
      const matchesSearch =
        !searchQuery.trim() ||
        d.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        d.fileName.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [documents, selectedCategory, searchQuery]);

  return {
    documents: filteredDocuments,
    allDocuments: documents,
    selectedCategory,
    setSelectedCategory,
    searchQuery,
    setSearchQuery,
    isLoading,
    loading: isLoading,
    isRefreshing,
    refreshing: isRefreshing,
    isUploading,
    downloadingDocId,
    error,
    refresh,
    uploadDocument,
    uploadVersion,
    downloadDocument,
    updateStatus,
    deleteDocument,
  };
}
