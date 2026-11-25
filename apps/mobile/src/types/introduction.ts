export type IntroductionStatus =
  | 'PENDING'
  | 'ADMIN_REVIEW'
  | 'ACCEPTED_BY_FRANCHISOR'
  | 'ACCEPTED_BY_INVESTOR'
  | 'MUTUALLY_ACCEPTED'
  | 'REJECTED'
  | 'CANCELLED'
  | 'DEAL_ROOM_CREATED';

export type IntroductionInitiator = 'investor' | 'franchisor' | 'admin';

export interface IntroductionConsent {
  consented: boolean;
  consentedAt?: string;
  notes?: string;
}

export interface IntroductionPartyUser {
  _id: string;
  fullName?: string;
  email?: string;
  phone?: string;
  role?: string;
  isMasked?: boolean;
  anonymizedId?: string;
}

export interface IntroductionInvestorProfile {
  _id: string;
  fullName?: string;
  email?: string;
  phone?: string;
  city?: string;
  state?: string;
  country?: string;
  isVerified?: boolean;
  isMasked?: boolean;
  anonymizedId?: string;
}

export interface IntroductionHistoryEntry {
  status: IntroductionStatus;
  changedBy: string;
  changedByRole: string;
  note?: string;
  timestamp: string;
}

export interface IntroductionRequestItem {
  _id: string;
  referenceNumber: string;
  brandName: string;
  franchise?: {
    _id: string;
    brandName: string;
    brandLogo?: string;
    coverImage?: string;
    category?: string;
    industry?: string;
    totalInvestmentMin?: number;
    totalInvestmentMax?: number;
  } | string;
  business?: any;
  businessOwnerUser?: IntroductionPartyUser;
  investorUser?: IntroductionPartyUser;
  investorProfile?: IntroductionInvestorProfile;
  initiatedBy: IntroductionInitiator;
  status: IntroductionStatus;
  franchisorConsent: IntroductionConsent;
  investorConsent: IntroductionConsent;
  targetCity: string;
  targetState?: string;
  investmentBudget: number;
  unitsInterested?: number;
  initialMessage?: string;
  compatibilityScore?: number;
  dealRoom?: string;
  mutuallyAcceptedAt?: string;
  history?: IntroductionHistoryEntry[];
  createdAt: string;
  updatedAt: string;
}

export interface CreateIntroductionPayload {
  franchiseId?: string;
  investorProfileId?: string;
  targetCity: string;
  targetState?: string;
  investmentBudget: number;
  unitsInterested?: number;
  initialMessage?: string;
  compatibilityScore?: number;
}

export interface RespondIntroductionPayload {
  action: 'ACCEPT' | 'REJECT' | 'CANCEL';
  notes?: string;
  asParty?: 'franchisor' | 'investor';
}
