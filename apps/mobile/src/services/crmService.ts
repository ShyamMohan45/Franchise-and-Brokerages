import { apiClient } from './apiClient';
import {
  Lead,
  BrokerageDeal,
  DealPipelineResponse,
  CrmTask,
  CrmMeeting,
  CrmMetrics,
  DealStage,
  LeadStatus,
  MeetingStatus,
  TaskStatus,
} from '../types/crm';

export class CrmService {
  /**
   * Fetch aggregate broker/admin CRM metrics
   */
  public static async getCrmMetrics(): Promise<CrmMetrics> {
    const response = await apiClient.get<CrmMetrics>('/crm/metrics');
    if (!response.data) {
      throw new Error(response.message || 'Failed to fetch CRM metrics');
    }
    return response.data;
  }

  /**
   * Fetch leads assigned to broker or all leads for admin
   */
  public static async getLeads(params: {
    search?: string;
    status?: string;
    qualificationStatus?: string;
    type?: string;
    page?: number;
    limit?: number;
  } = {}): Promise<{ leads: Lead[]; meta: { page: number; limit: number; total: number; totalPages: number } }> {
    const query = new URLSearchParams();
    if (params.search) query.append('search', params.search);
    if (params.status && params.status !== 'ALL') query.append('status', params.status);
    if (params.qualificationStatus && params.qualificationStatus !== 'ALL')
      query.append('qualificationStatus', params.qualificationStatus);
    if (params.type && params.type !== 'ALL') query.append('type', params.type);
    if (params.page) query.append('page', String(params.page));
    if (params.limit) query.append('limit', String(params.limit));

    const qs = query.toString();
    const endpoint = `/crm/leads${qs ? `?${qs}` : ''}`;
    const response = await apiClient.get<Lead[]>(endpoint);

    return {
      leads: response.data || [],
      meta: {
        page: response.meta?.page || 1,
        limit: response.meta?.limit || 20,
        total: response.meta?.total || 0,
        totalPages: response.meta?.totalPages || 1,
      },
    };
  }

  /**
   * Fetch single lead details including linked tasks and meetings
   */
  public static async getLeadById(id: string): Promise<{
    lead: Lead;
    tasks: CrmTask[];
    meetings: CrmMeeting[];
  }> {
    const response = await apiClient.get<{
      lead: Lead;
      tasks: CrmTask[];
      meetings: CrmMeeting[];
    }>(`/crm/leads/${id}`);

    if (!response.data?.lead) {
      throw new Error(response.message || 'Lead details not found');
    }
    return response.data;
  }

  /**
   * Update lead details (status, notes, follow-up date)
   */
  public static async updateLead(
    id: string,
    data: { status?: LeadStatus; internalNotes?: string; followUpDate?: string }
  ): Promise<Lead> {
    const response = await apiClient.patch<Lead>(`/crm/leads/${id}`, data);
    if (!response.data) {
      throw new Error(response.message || 'Failed to update lead');
    }
    return response.data;
  }

  /**
   * Fetch 10-stage deals pipeline
   */
  public static async getPipelineDeals(params: {
    stage?: string;
    search?: string;
  } = {}): Promise<DealPipelineResponse> {
    const query = new URLSearchParams();
    if (params.stage && params.stage !== 'ALL') query.append('stage', params.stage);
    if (params.search) query.append('search', params.search);

    const qs = query.toString();
    const endpoint = `/crm/pipeline${qs ? `?${qs}` : ''}`;
    const response = await apiClient.get<DealPipelineResponse>(endpoint);

    if (!response.data) {
      throw new Error(response.message || 'Failed to load deal pipeline');
    }
    return response.data;
  }

  /**
   * Fetch single deal details
   */
  public static async getDealById(id: string): Promise<BrokerageDeal> {
    const response = await apiClient.get<BrokerageDeal>(`/crm/deals/${id}`);
    if (!response.data) {
      throw new Error(response.message || 'Deal record not found');
    }
    return response.data;
  }

  /**
   * Update deal pipeline stage
   */
  public static async updateDealStage(
    id: string,
    stage: DealStage,
    note?: string
  ): Promise<BrokerageDeal> {
    const response = await apiClient.patch<BrokerageDeal>(`/crm/deals/${id}/stage`, {
      stage,
      note,
    });
    if (!response.data) {
      throw new Error(response.message || 'Failed to update deal stage');
    }
    return response.data;
  }

  /**
   * Fetch CRM tasks
   */
  public static async getCrmTasks(params: {
    status?: string;
    priority?: string;
    filterType?: 'today' | 'upcoming' | 'overdue';
  } = {}): Promise<CrmTask[]> {
    const query = new URLSearchParams();
    if (params.status && params.status !== 'ALL') query.append('status', params.status);
    if (params.priority && params.priority !== 'ALL') query.append('priority', params.priority);
    if (params.filterType) query.append('filterType', params.filterType);

    const qs = query.toString();
    const endpoint = `/crm/tasks${qs ? `?${qs}` : ''}`;
    const response = await apiClient.get<CrmTask[]>(endpoint);
    return response.data || [];
  }

  /**
   * Create task
   */
  public static async createTask(data: {
    title: string;
    description?: string;
    dueDate: string;
    priority?: 'low' | 'medium' | 'high' | 'urgent';
    relatedDeal?: string;
    relatedLead?: string;
  }): Promise<CrmTask> {
    const response = await apiClient.post<CrmTask>('/tasks', data);
    if (!response.data) {
      throw new Error(response.message || 'Failed to create task');
    }
    return response.data;
  }

  /**
   * Update task status (e.g. mark completed)
   */
  public static async updateTaskStatus(id: string, status: TaskStatus): Promise<CrmTask> {
    const response = await apiClient.patch<CrmTask>(`/tasks/${id}`, { status });
    if (!response.data) {
      throw new Error(response.message || 'Failed to update task');
    }
    return response.data;
  }

  /**
   * Fetch CRM meetings
   */
  public static async getCrmMeetings(params: {
    status?: string;
    dealId?: string;
    leadId?: string;
  } = {}): Promise<CrmMeeting[]> {
    const query = new URLSearchParams();
    if (params.status && params.status !== 'ALL') query.append('status', params.status);
    if (params.dealId) query.append('dealId', params.dealId);
    if (params.leadId) query.append('leadId', params.leadId);

    const qs = query.toString();
    const endpoint = `/crm/meetings${qs ? `?${qs}` : ''}`;
    const response = await apiClient.get<CrmMeeting[]>(endpoint);
    return response.data || [];
  }

  /**
   * Schedule meeting
   */
  public static async scheduleMeeting(data: {
    title: string;
    meetingType?: string;
    scheduledStartTime: string;
    scheduledEndTime: string;
    agenda: string;
    relatedDeal?: string;
    relatedLead?: string;
    notes?: string;
  }): Promise<CrmMeeting> {
    const response = await apiClient.post<CrmMeeting>('/crm/meetings', data);
    if (!response.data) {
      throw new Error(response.message || 'Failed to schedule meeting');
    }
    return response.data;
  }

  /**
   * Update meeting status (scheduled, completed, cancelled)
   */
  public static async updateMeetingStatus(
    id: string,
    status: MeetingStatus,
    notes?: string
  ): Promise<CrmMeeting> {
    const response = await apiClient.patch<CrmMeeting>(`/crm/meetings/${id}/status`, {
      status,
      notes,
    });
    if (!response.data) {
      throw new Error(response.message || 'Failed to update meeting status');
    }
    return response.data;
  }
}
