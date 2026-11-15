export type LeadType =
  | 'brand_owner'
  | 'brand_partnership'
  | 'franchise_investor'
  | 'multi_unit_operator'
  | 'institutional'
  | 'investor';

export type LeadStatus =
  | 'new'
  | 'contacted'
  | 'qualified'
  | 'meeting_scheduled'
  | 'negotiation'
  | 'converted'
  | 'lost'
  | 'not_qualified';

export type QualificationStatus = 'NEW' | 'CONTACTED' | 'QUALIFIED' | 'NOT_QUALIFIED';

export interface Lead {
  _id: string;
  fullName: string;
  email: string;
  phone: string;
  company?: string;
  leadType: LeadType;
  status: LeadStatus;
  source: string;
  targetIndustry?: string;
  preferredIndustry?: string;
  preferredCity?: string;
  preferredState?: string;
  budgetMin?: number;
  budgetMax?: number;
  liquidCapital?: number;
  investmentTimeline?: string;
  businessExperience?: string;
  qualificationStatus: QualificationStatus;
  qualificationNotes?: string;
  assignedBroker?: {
    _id: string;
    fullName: string;
    email: string;
    phone?: string;
    avatarUrl?: string;
  };
  priority: 'low' | 'medium' | 'high' | 'urgent';
  internalNotes?: string;
  followUpDate?: string;
  activities?: Array<{
    type: string;
    summary: string;
    timestamp: string;
  }>;
  createdAt: string;
  updatedAt: string;
}

export type DealStage =
  | 'NEW_ENQUIRY'
  | 'INITIAL_CONTACT'
  | 'QUALIFICATION'
  | 'BRAND_MATCHING'
  | 'MEETING_SCHEDULED'
  | 'NEGOTIATION'
  | 'DUE_DILIGENCE'
  | 'AGREEMENT'
  | 'CLOSED_WON'
  | 'CLOSED_LOST';

export interface BrokerageDeal {
  _id: string;
  dealTitle: string;
  franchiseListing?: {
    _id: string;
    brandName: string;
    logoUrl?: string;
    industry?: string;
    totalInvestmentMin?: number;
    totalInvestmentMax?: number;
  };
  businessOwner?: {
    _id: string;
    fullName: string;
    email: string;
    phone?: string;
  };
  investor?: {
    _id: string;
    fullName: string;
    email: string;
    phone?: string;
  };
  relatedLead?: {
    _id: string;
    fullName: string;
    email: string;
    phone?: string;
    preferredCity?: string;
  };
  stage: DealStage;
  dealValue: number;
  franchiseFee: number;
  commissionType: 'percentage' | 'fixed';
  commissionRate: number;
  expectedCommission: number;
  actualCommissionEarned?: number;
  paymentStatus: 'pending' | 'invoiced' | 'partially_paid' | 'paid' | 'waived';
  assignedBroker?: {
    _id: string;
    fullName: string;
    email: string;
    phone?: string;
  };
  stageHistory?: Array<{
    stage: DealStage;
    note?: string;
    timestamp: string;
  }>;
  notes?: string;
  targetClosingDate?: string;
  closedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface DealPipelineResponse {
  deals: BrokerageDeal[];
  columns: Record<string, BrokerageDeal[]>;
  totalPipelineValue: number;
  activeDealsCount: number;
  closedWonCount: number;
  closedLostCount: number;
}

export type TaskStatus = 'pending' | 'in_progress' | 'completed' | 'cancelled';
export type TaskPriority = 'low' | 'medium' | 'high' | 'urgent';

export interface CrmTask {
  _id: string;
  title: string;
  description?: string;
  assignedTo: {
    _id: string;
    fullName: string;
    email: string;
  } | string;
  relatedDeal?: {
    _id: string;
    dealTitle: string;
    stage: string;
  };
  relatedLead?: {
    _id: string;
    fullName: string;
    company?: string;
    phone?: string;
  };
  status: TaskStatus;
  priority: TaskPriority;
  dueDate: string;
  completedAt?: string;
  tags?: string[];
  createdAt: string;
  updatedAt: string;
}

export type MeetingStatus = 'requested' | 'scheduled' | 'completed' | 'cancelled' | 'rescheduled';
export type MeetingType =
  | 'franchise_intro'
  | 'fdd_review'
  | 'sop_consultation'
  | 'negotiation'
  | 'deal_closing'
  | 'readiness_audit';

export interface CrmMeeting {
  _id: string;
  title: string;
  meetingType: MeetingType;
  organizer: {
    _id: string;
    fullName: string;
    email: string;
  };
  participants: Array<{
    _id: string;
    fullName: string;
    email: string;
    role?: string;
  }>;
  relatedFranchise?: {
    _id: string;
    brandName: string;
    logoUrl?: string;
  };
  relatedDeal?: {
    _id: string;
    dealTitle: string;
    stage: string;
  };
  relatedLead?: {
    _id: string;
    fullName: string;
    company?: string;
  };
  scheduledStartTime: string;
  scheduledEndTime: string;
  status: MeetingStatus;
  meetingUrl?: string;
  locationDetails?: string;
  agenda: string;
  notes?: string;
  actionItems?: string[];
  createdAt: string;
  updatedAt: string;
}

export interface CrmMetrics {
  totalLeads: number;
  brandLeads: number;
  investorLeads: number;
  qualifiedInvestors: number;
  newEnquiriesCount: number;
  activeDealsCount: number;
  dealsWonCount: number;
  dealsLostCount: number;
  totalWonValue: number;
  totalCommissionEarned: number;
  scheduledMeetingsCount: number;
  overdueFollowUpsCount: number;
}
