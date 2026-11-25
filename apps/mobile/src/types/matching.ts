export interface MatchScoreBreakdown {
  budgetScore: number;
  locationScore: number;
  industryScore: number;
  experienceScore: number;
  goalsScore?: number;
  unitsScore?: number;
  timelineScore?: number;
  totalScore: number;
  matchedCriteria: string[];
  unmatchedCriteria: string[];
  introductionStatus: 'Recommended' | 'Broker Verified' | 'Priority Introduction' | 'Under Review';
}

export interface InvestorSmartMatch {
  listing: {
    _id: string;
    brandName: string;
    brandLogo?: string;
    coverImage?: string;
    headline?: string;
    category?: string;
    industry?: string;
    businessModel?: string;
    totalInvestmentMin: number;
    totalInvestmentMax: number;
    franchiseFee?: number;
    royaltyPercentage?: number;
    spaceRequiredMin?: number;
    spaceRequiredMax?: number;
    spaceUnit?: string;
    expansionLocations?: string[];
    isFeatured?: boolean;
    slug?: string;
    status?: string;
    description?: string;
  };
  matchAnalysis: MatchScoreBreakdown;
}

export interface AnonymizedInvestorProfile {
  _id: string;
  anonymizedId: string;
  city: string;
  state?: string;
  country?: string;
  investorType: string;
  investmentBudgetMin: number;
  investmentBudgetMax: number;
  liquidCapital?: number;
  preferredLocations?: string[];
  preferredIndustries?: string[];
  businessExperienceYears?: number;
  investmentTimeline?: string;
  isVerified?: boolean;
}

export interface FranchisorSmartMatch {
  investor: AnonymizedInvestorProfile;
  listingSummary: {
    _id: string;
    brandName: string;
    industry: string;
    totalInvestmentMin: number;
    totalInvestmentMax: number;
    expansionLocations: string[];
  };
  matchAnalysis: MatchScoreBreakdown;
}

// Backward-compatible type aliases
export type MatchingBreakdown = MatchScoreBreakdown;
export type FranchisorMatchListing = InvestorSmartMatch;
export type InvestorMatch = FranchisorSmartMatch;
