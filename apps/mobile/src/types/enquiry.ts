export type ApplicationStatus =
  | 'NEW'
  | 'ASSIGNED'
  | 'CONTACTED'
  | 'QUALIFIED'
  | 'IN_PROGRESS'
  | 'CONVERTED'
  | 'CLOSED'
  | 'submitted'
  | 'under_review'
  | 'vetted_by_broker'
  | 'introduced_to_owner'
  | 'in_discussion'
  | 'documentation_review'
  | 'negotiation'
  | 'approved_for_deal'
  | 'deal_closed'
  | 'rejected'
  | 'withdrawn';

export interface FranchiseApplication {
  _id: string;
  referenceNumber: string;
  franchise: {
    _id: string;
    brandName: string;
    logoUrl?: string;
    industry?: string;
    totalInvestmentMin?: number;
    totalInvestmentMax?: number;
    expansionLocations?: string[];
    slug?: string;
  };
  brandName: string;
  opportunityTitle?: string;
  investorUser: {
    _id: string;
    fullName: string;
    email: string;
    phone?: string;
  } | string;
  investorProfile?: any;
  businessOwnerUser: string;
  assignedBroker?: {
    _id: string;
    fullName: string;
    email: string;
    phone?: string;
  };
  proposedLocationCity: string;
  proposedLocationState?: string;
  unitsInterested: number;
  investmentBudget: number;
  investmentBudgetPaise?: number;
  availableLiquidCapital: number;
  availableLiquidCapitalPaise?: number;
  timeline: string;
  businessBackgroundSummary?: string;
  additionalMessage?: string;
  privacyConsentGiven: boolean;
  status: ApplicationStatus;
  statusHistory?: Array<{
    status: string;
    changedBy?: string;
    note?: string;
    timestamp: string;
  }>;
  createdAt: string;
  updatedAt: string;
}

export interface CreateEnquiryPayload {
  franchiseId: string;
  proposedLocationCity: string;
  proposedLocationState?: string;
  unitsInterested: number;
  investmentBudget: number;
  availableLiquidCapital: number;
  timeline: string;
  businessBackgroundSummary?: string;
  additionalMessage?: string;
  privacyConsentGiven: boolean;
}
