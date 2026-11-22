export interface MatchingBreakdown {
  budgetScore: number;
  industryScore: number;
  locationScore: number;
  modelScore: number;
  experienceScore: number;
  matchingCriteria: string[];
  incompatibleCriteria: string[];
}

export interface InvestorMatch {
  investorId: string;
  investorType: string;
  targetIndustries: string[];
  investmentBudgetMin: number;
  investmentBudgetMax: number;
  liquidCapital?: number;
  preferredLocations: string[];
  businessExperienceYears?: number;
  investmentTimeline?: string;
  compatibilityScore: number;
  breakdown: MatchingBreakdown;
  anonymizedIdentifier: string;
}

export interface FranchisorMatchListing {
  franchiseId: string;
  listingSlug: string;
  brandName: string;
  opportunityTitle: string;
  industry: string;
  businessModel: string;
  totalInvestmentMin: number;
  totalInvestmentMax: number;
  targetLocations: string[];
  compatibilityScore: number;
  breakdown: MatchingBreakdown;
}
