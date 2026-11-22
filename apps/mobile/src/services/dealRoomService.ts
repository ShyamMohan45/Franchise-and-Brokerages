import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { apiClient } from './apiClient';
import { SecureStorageService } from './secureStorage';
import {
  DealRoom,
  DealDocument,
  DueDiligenceChecklist,
  DealMessage,
  DealDocumentStatus,
  DueDiligenceItemStatus,
  DealDocumentCategory,
} from '../types/dealRoom';

export interface UploadDocumentParams {
  title: string;
  category: DealDocumentCategory;
  isInternalOnly?: boolean;
  relatedDiligenceItem?: string;
  notes?: string;
  file: {
    uri: string;
    name: string;
    mimeType?: string;
    size?: number;
  };
}

export interface UpdateDiligenceItemParams {
  status?: DueDiligenceItemStatus;
  notes?: string;
  reviewerNotes?: string;
  clarificationRequest?: string;
  evidenceDocumentIds?: string[];
  deadline?: string;
}

export class DealRoomService {
  /**
   * 1. Fetch all deal rooms accessible to current user
   */
  public static async getDealRooms(): Promise<DealRoom[]> {
    const response = await apiClient.get<DealRoom[]>('/deal-rooms');
    return response.data || [];
  }

  /**
   * 2. Fetch single deal room details with full populated data
   */
  public static async getDealRoomById(id: string): Promise<DealRoom> {
    const response = await apiClient.get<DealRoom>(`/deal-rooms/${id}`);
    if (!response.data) {
      throw new Error(response.message || 'Deal room not found');
    }
    return response.data;
  }

  /**
   * 3. Fetch documents for a deal room
   */
  public static async getDealRoomDocuments(id: string): Promise<DealDocument[]> {
    const response = await apiClient.get<DealDocument[]>(`/deal-rooms/${id}/documents`);
    return response.data || [];
  }

  /**
   * 4. Upload document to private storage
   */
  public static async uploadDocument(
    id: string,
    params: UploadDocumentParams
  ): Promise<DealDocument> {
    const formData = new FormData();

    formData.append('file', {
      uri: params.file.uri,
      name: params.file.name,
      type: params.file.mimeType || 'application/octet-stream',
    } as any);

    formData.append('title', params.title);
    formData.append('category', params.category);

    if (params.isInternalOnly !== undefined) {
      formData.append('isInternalOnly', String(params.isInternalOnly));
    }
    if (params.relatedDiligenceItem) {
      formData.append('relatedDiligenceItem', params.relatedDiligenceItem);
    }
    if (params.notes) {
      formData.append('notes', params.notes);
    }

    const response = await apiClient.post<DealDocument>(
      `/deal-rooms/${id}/documents`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );

    if (!response.data) {
      throw new Error(response.message || 'Document upload failed');
    }
    return response.data;
  }

  /**
   * 5. Upload new document version
   */
  public static async uploadDocumentVersion(
    id: string,
    docId: string,
    file: { uri: string; name: string; mimeType?: string },
    changeNote?: string
  ): Promise<DealDocument> {
    const formData = new FormData();
    formData.append('file', {
      uri: file.uri,
      name: file.name,
      type: file.mimeType || 'application/octet-stream',
    } as any);

    if (changeNote) {
      formData.append('changeNote', changeNote);
    }

    const response = await apiClient.post<DealDocument>(
      `/deal-rooms/${id}/documents/${docId}/versions`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );

    if (!response.data) {
      throw new Error(response.message || 'Failed to upload document version');
    }
    return response.data;
  }

  /**
   * 6. Download private document securely using Bearer authorization
   */
  public static async downloadDocument(
    id: string,
    docId: string,
    fileName: string
  ): Promise<string> {
    const downloadUrl = `${apiClient.getBaseUrl()}/deal-rooms/${id}/documents/${docId}/download`;
    const token = await SecureStorageService.getAccessToken();

    const safeFileName = fileName.replace(/[^a-zA-Z0-9._-]/g, '_');
    const localUri = `${FileSystem.cacheDirectory}${Date.now()}_${safeFileName}`;

    const downloadResult = await FileSystem.downloadAsync(downloadUrl, localUri, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (downloadResult.status !== 200) {
      throw new Error(`Download failed with status ${downloadResult.status}. Access may be restricted.`);
    }

    if (await Sharing.isAvailableAsync()) {
      await Sharing.shareAsync(downloadResult.uri, {
        dialogTitle: `View ${fileName}`,
        mimeType: 'application/pdf',
      });
    }

    return downloadResult.uri;
  }

  /**
   * 7. Update document status (for brokers & admins)
   */
  public static async updateDocumentStatus(
    id: string,
    docId: string,
    status: DealDocumentStatus,
    reviewerNotes?: string
  ): Promise<DealDocument> {
    const response = await apiClient.patch<DealDocument>(
      `/deal-rooms/${id}/documents/${docId}/status`,
      { status, reviewerNotes }
    );
    if (!response.data) {
      throw new Error(response.message || 'Failed to update document status');
    }
    return response.data;
  }

  /**
   * 8. Delete document (authorized uploader or broker/admin)
   */
  public static async deleteDocument(id: string, docId: string): Promise<void> {
    await apiClient.delete(`/deal-rooms/${id}/documents/${docId}`);
  }

  /**
   * 9. Fetch Due Diligence Checklist
   */
  public static async getDueDiligence(id: string): Promise<DueDiligenceChecklist> {
    const response = await apiClient.get<DueDiligenceChecklist>(`/deal-rooms/${id}/due-diligence`);
    if (!response.data) {
      throw new Error(response.message || 'Failed to fetch due diligence checklist');
    }
    return response.data;
  }

  /**
   * 10. Update Due Diligence item status & review notes
   */
  public static async updateDueDiligenceItem(
    id: string,
    itemId: string,
    params: UpdateDiligenceItemParams
  ): Promise<DueDiligenceChecklist> {
    const response = await apiClient.patch<DueDiligenceChecklist>(
      `/deal-rooms/${id}/due-diligence/${itemId}`,
      params
    );
    if (!response.data) {
      throw new Error(response.message || 'Failed to update diligence item');
    }
    return response.data;
  }

  /**
   * 11. Fetch Deal Room messages
   */
  public static async getMessages(id: string): Promise<DealMessage[]> {
    const response = await apiClient.get<DealMessage[]>(`/deal-rooms/${id}/messages`);
    return response.data || [];
  }

  /**
   * 12. Post message to Deal Room
   */
  public static async postMessage(
    id: string,
    params: {
      text: string;
      isInternal?: boolean;
      relatedDocument?: string;
      relatedDiligenceItem?: string;
    }
  ): Promise<DealMessage> {
    const response = await apiClient.post<DealMessage>(`/deal-rooms/${id}/messages`, params);
    if (!response.data) {
      throw new Error(response.message || 'Failed to send message');
    }
    return response.data;
  }

  /**
   * 13. Sign Deal Room agreement
   */
  public static async signAgreement(id: string): Promise<DealRoom> {
    const response = await apiClient.post<DealRoom>(`/deal-rooms/${id}/sign`, {});
    if (!response.data) {
      throw new Error(response.message || 'Failed to sign agreement');
    }
    return response.data;
  }

  /**
   * 14. Fetch deal room negotiation & diligence meetings
   */
  public static async getMeetings(id: string): Promise<any[]> {
    const response = await apiClient.get<any[]>(`/deal-rooms/${id}/meetings`);
    return response.data || [];
  }

  /**
   * 15. Schedule negotiation meeting
   */
  public static async scheduleMeeting(
    id: string,
    params: {
      title: string;
      meetingType?: string;
      scheduledStartTime: string;
      scheduledEndTime: string;
      meetingUrl?: string;
      locationDetails?: string;
      agenda: string;
    }
  ): Promise<any> {
    const response = await apiClient.post<any>(`/deal-rooms/${id}/meetings`, params);
    if (!response.data) {
      throw new Error(response.message || 'Failed to schedule meeting');
    }
    return response.data;
  }
}
