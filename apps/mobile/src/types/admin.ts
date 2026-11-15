export interface AdminDashboardMetrics {
  totalUsers: number;
  totalBusinessOwners: number;
  totalInvestors: number;
  pendingBusinesses: number;
  publishedFranchises: number;
  totalApplications: number;
  activeDealsCount: number;
  completedDealsCount: number;
  pipelineValue: number;
  projectedCommission: number;
  earnedCommission: number;
  recentEnquiries?: any[];
  recentAuditLogs?: any[];
}

export interface AdminUserItem {
  _id: string;
  fullName: string;
  email: string;
  phone?: string;
  role: 'investor' | 'business_owner' | 'brand_owner' | 'broker' | 'admin' | 'super_admin';
  status: 'active' | 'pending_verification' | 'suspended';
  emailVerified: boolean;
  avatarUrl?: string;
  createdAt: string;
}

export interface AdminBusinessItem {
  _id: string;
  companyName: string;
  brandName?: string;
  industry: string;
  approvalStatus: 'approved' | 'rejected' | 'under_review' | 'action_required';
  adminReviewNotes?: string;
  registrationNumber?: string;
  website?: string;
  user?: {
    _id: string;
    fullName: string;
    email: string;
    phone?: string;
  };
  createdAt: string;
}

export interface AuditLogItem {
  _id: string;
  actor: string;
  actorRole: string;
  actorEmail?: string;
  action: string;
  entityType: string;
  entityId?: string;
  details?: Record<string, any>;
  ipAddress?: string;
  createdAt: string;
}

export interface BusinessAnalytics {
  totalLeads: number;
  totalEnquiries: number;
  qualifiedInvestors: number;
  activeDeals: number;
  dealsWon: number;
  dealsLost: number;
  conversionRate: number;
  totalDealValue: number;
  averageDealValue: number;
  expectedCommission: number;
  earnedCommission: number;
  receivedRevenue: number;
  brokerPerformance: Array<{
    brokerId: string;
    brokerName: string;
    totalDeals: number;
    activeDeals: number;
    dealsWon: number;
    totalVolume: number;
    earnedCommission: number;
  }>;
  industryPerformance: Array<{
    industry: string;
    dealCount: number;
    totalValue: number;
    dealsWon: number;
  }>;
  cityPerformance: Array<{
    city: string;
    dealCount: number;
    volume: number;
  }>;
  monthlyPerformance?: Record<string, any>;
}
