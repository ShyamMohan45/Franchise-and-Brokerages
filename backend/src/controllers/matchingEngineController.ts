import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { FranchiseListing, IFranchiseListing } from '../models/FranchiseListing';
import { InvestorProfile, IInvestorProfile } from '../models/InvestorProfile';
import { BusinessProfile } from '../models/BusinessProfile';
import { sendError, sendSuccess } from '../utils/response';

export interface IMatchScoreBreakdown {
  budgetScore: number; // max 30
  locationScore: number; // max 25 (investor-side was 20; 25 for franchisor expansion territories)
  industryScore: number; // max 20
  experienceScore: number; // max 10
  goalsScore?: number; // max 15 (for franchisor matching)
  unitsScore?: number; // legacy investor-side
  timelineScore?: number; // legacy investor-side
  rawScore?: number; // raw point sum before normalization
  maxScore?: number; // maximum possible points in vector
  totalScore: number; // normalized compatibility score 0 - 100%
  matchedCriteria: string[];
  unmatchedCriteria: string[];
  introductionStatus: 'Recommended' | 'Broker Verified' | 'Priority Introduction' | 'Under Review';
}

/**
 * Anonymized Investor Profile representation for franchisor discovery.
 * Strictly strips all personal contact details (fullName, email, phone, companyName, private documents).
 */
export interface IAnonymizedInvestorProfile {
  _id: string;
  anonymizedId: string;
  city: string;
  state?: string;
  country: string;
  investorType: string;
  investmentBudgetMin: number;
  investmentBudgetMax: number;
  liquidCapital: number;
  preferredStates: string[];
  preferredCities: string[];
  preferredLocations: string[];
  preferredIndustries: string[];
  businessExperienceYears: number;
  pastFranchiseExperience: boolean;
  investmentExperience?: string;
  interestType: string;
  preferredBusinessModel: string;
  operationPreference: string;
  proposedOutlets: number;
  investmentTimeline: string;
  profileCompletion: number;
  isVerified: boolean;
  netWorthRange?: string;
  currentOccupation?: string;
}

/**
 * Strips all personal identifying information (PII) from an investor profile.
 */
export function anonymizeInvestorProfile(investor: IInvestorProfile | any): IAnonymizedInvestorProfile {
  const rawId = investor._id ? investor._id.toString() : 'UNKNOWN';
  const shortId = rawId.length >= 6 ? rawId.slice(-6).toUpperCase() : rawId.toUpperCase();

  return {
    _id: rawId,
    anonymizedId: `INV-${shortId}`,
    city: investor.city || 'Undisclosed City',
    state: investor.state || undefined,
    country: investor.country || 'India',
    investorType: investor.investorType || 'individual',
    investmentBudgetMin: investor.investmentBudgetMin || 0,
    investmentBudgetMax: investor.investmentBudgetMax || 0,
    liquidCapital: investor.liquidCapital || 0,
    preferredStates: Array.isArray(investor.preferredStates) ? investor.preferredStates : [],
    preferredCities: Array.isArray(investor.preferredCities) ? investor.preferredCities : [],
    preferredLocations: Array.isArray(investor.preferredLocations) ? investor.preferredLocations : [],
    preferredIndustries: Array.isArray(investor.preferredIndustries) ? investor.preferredIndustries : [],
    businessExperienceYears: typeof investor.businessExperienceYears === 'number' ? investor.businessExperienceYears : 0,
    pastFranchiseExperience: Boolean(investor.pastFranchiseExperience),
    investmentExperience: investor.investmentExperience || undefined,
    interestType: investor.interestType || 'single_unit',
    preferredBusinessModel: investor.preferredBusinessModel || 'FOFO',
    operationPreference: investor.operationPreference || 'flexible',
    proposedOutlets: typeof investor.proposedOutlets === 'number' ? investor.proposedOutlets : 1,
    investmentTimeline: investor.investmentTimeline || '1_to_3_months',
    profileCompletion: typeof investor.profileCompletion === 'number' ? investor.profileCompletion : 0,
    isVerified: Boolean(investor.isVerified),
    netWorthRange: investor.netWorthRange || undefined,
    currentOccupation: investor.currentOccupation || undefined,
  };
}

/**
 * Transparent two-way matching algorithm calculating compatibility between
 * a franchisor opportunity / brand requirements and an investor's profile.
 *
 * Scoring breakdown (Max 100):
 * 1. Budget & Capital Capacity: Max 30 points
 * 2. Expansion Territory & Location: Max 25 points
 * 3. Industry & Category Alignment: Max 20 points
 * 4. Investment Goals & Business Model: Max 15 points
 * 5. Business Experience & Track Record: Max 10 points
 */
export function calculateFranchisorInvestorMatch(
  listing: IFranchiseListing | any,
  investor: IInvestorProfile | any
): {
  budgetScore: number;
  locationScore: number;
  industryScore: number;
  goalsScore: number;
  experienceScore: number;
  totalScore: number;
  matchedCriteria: string[];
  unmatchedCriteria: string[];
  introductionStatus: 'Recommended' | 'Broker Verified' | 'Priority Introduction' | 'Under Review';
} {
  let budgetScore = 0;
  let locationScore = 0;
  let industryScore = 0;
  let goalsScore = 0;
  let experienceScore = 0;

  const matchedCriteria: string[] = [];
  const unmatchedCriteria: string[] = [];

  // ----------------------------------------------------
  // 1. Budget & Capital Capacity (Max 30 Points)
  // ----------------------------------------------------
  const listMin = Number(listing.totalInvestmentMin) || 2000000;
  const listMax = Number(listing.totalInvestmentMax) || 5000000;
  const invMin = Number(investor.investmentBudgetMin) || 0;
  const invMax = Number(investor.investmentBudgetMax) || 0;
  const invLiquid = Number(investor.liquidCapital) || 0;

  const minLakhs = (listMin / 100000).toFixed(0);
  const maxLakhs = (listMax / 100000).toFixed(0);
  const invMaxLakhs = (invMax / 100000).toFixed(0);

  if (invMax >= listMin && (invMin <= listMax || invMax <= listMax * 1.5)) {
    // Complete overlap with listing budget requirement
    budgetScore = 30;
    matchedCriteria.push(
      `Investor budget cap (₹${invMaxLakhs}L) meets franchise capital requirements (₹${minLakhs}L - ₹${maxLakhs}L)`
    );
  } else if (invLiquid >= listMin) {
    // Liquid capital alone covers initial investment
    budgetScore = 28;
    matchedCriteria.push(`Liquid capital (₹${(invLiquid / 100000).toFixed(0)}L) independently covers minimum franchise capital`);
  } else if (invMax >= listMin * 0.8) {
    // Within 20% tolerance range
    budgetScore = 20;
    matchedCriteria.push(`Budget cap (₹${invMaxLakhs}L) within 20% tolerance of minimum investment (₹${minLakhs}L)`);
  } else if (invMax >= listMin * 0.6) {
    // Within 40% - requires debt / syndication
    budgetScore = 12;
    unmatchedCriteria.push(
      `Budget cap (₹${invMaxLakhs}L) below full initial requirement (₹${minLakhs}L), requires co-investment or debt`
    );
  } else {
    budgetScore = 5;
    unmatchedCriteria.push(`Capital budget (₹${invMaxLakhs}L) is significantly below minimum investment (₹${minLakhs}L)`);
  }

  // ----------------------------------------------------
  // 2. Expansion Territory & Location (Max 25 Points)
  // ----------------------------------------------------
  const targetLocations: string[] = [
    ...(Array.isArray(listing.expansionLocations) ? listing.expansionLocations : []),
    ...(Array.isArray(listing.targetLocations) ? listing.targetLocations : []),
    ...(Array.isArray(listing.availableTerritories) ? listing.availableTerritories : []),
  ];

  const investorLocations: string[] = [
    investor.city || '',
    investor.state || '',
    ...(Array.isArray(investor.preferredCities) ? investor.preferredCities : []),
    ...(Array.isArray(investor.preferredLocations) ? investor.preferredLocations : []),
    ...(Array.isArray(investor.preferredStates) ? investor.preferredStates : []),
  ].filter((loc) => Boolean(loc && loc.trim()));

  const hasPanIndia = investorLocations.some(
    (loc) => loc.toLowerCase().includes('pan india') || loc.toLowerCase().includes('pan-india')
  );

  let locationMatched = false;
  let matchedLocationName = '';

  if (hasPanIndia) {
    locationMatched = true;
    matchedLocationName = 'Pan-India';
  } else if (targetLocations.length > 0) {
    for (const target of targetLocations) {
      const match = investorLocations.find(
        (invLoc) =>
          invLoc.toLowerCase().includes(target.toLowerCase()) || target.toLowerCase().includes(invLoc.toLowerCase())
      );
      if (match) {
        locationMatched = true;
        matchedLocationName = target;
        break;
      }
    }
  }

  if (locationMatched) {
    locationScore = 25;
    matchedCriteria.push(`Target territory [${matchedLocationName}] directly aligns with investor location preference`);
  } else if (targetLocations.length === 0) {
    // Brand is open to nationwide expansion
    locationScore = 18;
    matchedCriteria.push(`Brand offers open geographic expansion; compatible with investor location (${investor.city || 'India'})`);
  } else {
    locationScore = 8;
    unmatchedCriteria.push(
      `Investor target areas (${investorLocations.slice(0, 3).join(', ') || 'Undisclosed'}) differ from active brand expansion cities (${targetLocations.slice(0, 3).join(', ')})`
    );
  }

  // ----------------------------------------------------
  // 3. Industry & Category Alignment (Max 20 Points)
  // ----------------------------------------------------
  const listingIndustry = (listing.industry || listing.category || '').toLowerCase();
  const investorIndustries: string[] = Array.isArray(investor.preferredIndustries)
    ? investor.preferredIndustries.map((ind: string) => ind.toLowerCase())
    : [];

  const hasIndustryMatch = investorIndustries.some(
    (ind) => ind.includes(listingIndustry) || listingIndustry.includes(ind)
  );

  if (hasIndustryMatch && listingIndustry) {
    industryScore = 20;
    matchedCriteria.push(`Investor focus aligns with brand industry [${listing.industry || listing.category}]`);
  } else if (investorIndustries.length === 0 || investorIndustries.includes('all') || investorIndustries.includes('flexible')) {
    industryScore = 15;
    matchedCriteria.push(`Investor has flexible multi-sector investment preferences`);
  } else {
    industryScore = 8;
    unmatchedCriteria.push(
      `Brand sector [${listing.industry || 'General'}] is not among investor's preferred sectors (${investor.preferredIndustries?.slice(0, 3).join(', ') || 'None specified'})`
    );
  }

  // ----------------------------------------------------
  // 4. Investment Goals & Business Model (Max 15 Points)
  // ----------------------------------------------------
  let modelScore = 0;
  const listingModel = (listing.businessModel || 'FOFO').toUpperCase();
  const investorModel = (investor.preferredBusinessModel || 'FOFO').toUpperCase();

  if (investorModel === 'FLEXIBLE' || investorModel === listingModel) {
    modelScore += 7;
    matchedCriteria.push(`Operating model (${investor.preferredBusinessModel || 'FOFO'}) matches franchise format (${listing.businessModel || 'FOFO'})`);
  } else {
    modelScore += 3;
    unmatchedCriteria.push(`Model format (${investor.preferredBusinessModel}) differs from brand standard (${listing.businessModel || 'FOFO'})`);
  }

  // Unit Scale & Expansion Ambition
  const listingType = listing.franchiseModelType || 'single_unit';
  const investorInterest = investor.interestType || 'single_unit';

  if (listingType === 'both' || investorInterest === listingType) {
    modelScore += 5;
    matchedCriteria.push(`Target scale (${investorInterest.replace(/_/g, ' ')}) aligns with franchise offering`);
  } else if (investorInterest === 'multi_unit' || investorInterest === 'area_developer') {
    modelScore += 4;
    matchedCriteria.push(`Multi-unit investor ambition matches brand growth trajectory`);
  } else {
    modelScore += 2;
  }

  // Timeline readiness
  const timeline = investor.investmentTimeline || '1_to_3_months';
  if (timeline === 'immediate' || timeline === '1_to_3_months') {
    modelScore += 3;
    matchedCriteria.push(`Immediate/Near-term investment readiness (${timeline.replace(/_/g, ' ')})`);
  } else {
    modelScore += 1;
    unmatchedCriteria.push(`Target deployment timeline is longer term (${timeline.replace(/_/g, ' ')})`);
  }

  goalsScore = Math.min(15, modelScore);

  // ----------------------------------------------------
  // 5. Business Experience & Operator Profile (Max 10 Points)
  // ----------------------------------------------------
  const experienceYears = Number(investor.businessExperienceYears) || 0;
  const hasFranchiseExp = Boolean(investor.pastFranchiseExperience);

  if (hasFranchiseExp && experienceYears >= 3) {
    experienceScore = 10;
    matchedCriteria.push(`Experienced operator with ${experienceYears}+ years in business and prior franchise ownership`);
  } else if (hasFranchiseExp || experienceYears >= 5) {
    experienceScore = 8;
    matchedCriteria.push(`Strong commercial background (${experienceYears} years business experience)`);
  } else if (experienceYears >= 1) {
    experienceScore = 6;
    matchedCriteria.push(`Moderate business experience (${experienceYears} year${experienceYears > 1 ? 's' : ''})`);
  } else {
    experienceScore = 3;
    unmatchedCriteria.push(`First-time franchisee investor (standard brand training & onboarding required)`);
  }

  const totalScore = Math.min(100, Math.round(budgetScore + locationScore + industryScore + goalsScore + experienceScore));

  let introductionStatus: 'Recommended' | 'Broker Verified' | 'Priority Introduction' | 'Under Review' = 'Under Review';
  if (totalScore >= 85) {
    introductionStatus = 'Priority Introduction';
  } else if (totalScore >= 70) {
    introductionStatus = 'Broker Verified';
  } else if (totalScore >= 50) {
    introductionStatus = 'Recommended';
  }

  return {
    budgetScore,
    locationScore,
    industryScore,
    goalsScore,
    experienceScore,
    totalScore,
    matchedCriteria,
    unmatchedCriteria,
    introductionStatus,
  };
}

/**
 * GET /api/v1/matching/investor
 * Existing investor matching engine (preserved untouched for backwards compatibility)
 */
export const getSmartMatchesForInvestor = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const investor = await InvestorProfile.findOne({ user: req.user?.id || (req.user as any)?._id });
    const listings = await FranchiseListing.find({ status: 'published' });

    const investorBudgetMin = investor?.investmentBudgetMin || 1500000;
    const investorBudgetMax = investor?.investmentBudgetMax || 5000000;
    const preferredLocations = investor?.preferredLocations || ['Bangalore', 'Mumbai', 'Delhi NCR', 'Pan India'];
    const preferredIndustries = investor?.preferredIndustries || ['Food & Beverage', 'Health & Fitness', 'Education'];

    const matches = listings.map((listing) => {
      let budgetScore = 0;
      let locationScore = 0;
      let industryScore = 0;
      let experienceScore = 10;
      let unitsScore = 8;
      let timelineScore = 8;
      const matchedCriteria: string[] = [];
      const unmatchedCriteria: string[] = [];

      // 1. Budget (30 points)
      const listMin = listing.totalInvestmentMin || 2000000;
      const listMax = listing.totalInvestmentMax || 4500000;

      if (investorBudgetMax >= listMin && investorBudgetMin <= listMax) {
        budgetScore = 30;
        matchedCriteria.push(`Budget aligns within ₹${(listMin / 100000).toFixed(0)}L - ₹${(listMax / 100000).toFixed(0)}L range`);
      } else if (investorBudgetMax >= listMin * 0.8) {
        budgetScore = 20;
        matchedCriteria.push('Budget within 20% tolerance range');
      } else {
        budgetScore = 5;
        unmatchedCriteria.push('Capital requirement exceeds current profile budget');
      }

      // 2. Location (20 points)
      const expansionCities: string[] = listing.expansionLocations || [];
      const hasLocationMatch =
        preferredLocations.includes('Pan India') ||
        expansionCities.some((c: string) =>
          preferredLocations.some((pl) => pl.toLowerCase().includes(c.toLowerCase()) || c.toLowerCase().includes(pl.toLowerCase()))
        );

      if (hasLocationMatch) {
        locationScore = 20;
        matchedCriteria.push('Target expansion territory matches preferred investment geography');
      } else {
        locationScore = 10;
        unmatchedCriteria.push('Territory targets outside primary location preference');
      }

      // 3. Industry (20 points)
      const hasIndustryMatch = preferredIndustries.some(
        (ind) =>
          ind.toLowerCase().includes(listing.industry.toLowerCase()) ||
          listing.industry.toLowerCase().includes(ind.toLowerCase())
      );

      if (hasIndustryMatch) {
        industryScore = 20;
        matchedCriteria.push(`Industry category [${listing.industry}] matches portfolio focus`);
      } else {
        industryScore = 8;
        unmatchedCriteria.push(`Sector [${listing.industry}] differs from target sectors`);
      }

      const rawScore = budgetScore + locationScore + industryScore + experienceScore + unitsScore + timelineScore;
      const maxScore = 96; // Maximum possible points in 6-vector investor discovery rubric
      const totalScore = Math.min(100, Math.round((rawScore / maxScore) * 100));

      let introductionStatus: IMatchScoreBreakdown['introductionStatus'] = 'Under Review';
      if (totalScore >= 85) introductionStatus = 'Priority Introduction';
      else if (totalScore >= 70) introductionStatus = 'Broker Verified';
      else introductionStatus = 'Recommended';

      return {
        listing,
        matchAnalysis: {
          budgetScore,
          locationScore,
          industryScore,
          experienceScore,
          unitsScore,
          timelineScore,
          rawScore,
          maxScore,
          totalScore,
          matchedCriteria,
          unmatchedCriteria,
          introductionStatus,
        },
      };
    });

    matches.sort((a, b) => b.matchAnalysis.totalScore - a.matchAnalysis.totalScore);

    res.json({ success: true, count: matches.length, data: matches });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * GET /api/v1/matching/franchisor
 * Franchisor-side Discovery Engine: Finds genuine registered investors matching
 * the franchisor's active listings, target expansion cities, budget, and business model.
 *
 * Privacy: All returned investor profiles are strictly anonymized. PII is scrubbed.
 * Authorization: Only permitted franchisor/brand owner or admin users.
 */
export const getSmartMatchesForFranchisor = async (req: AuthRequest, res: Response): Promise<any> => {
  try {
    const userId = req.user?.id || (req.user as any)?._id;
    const userRole = req.user?.role;

    if (!userId) {
      return sendError(res, 'Authentication required.', 401);
    }

    const isPrivileged = userRole === 'admin' || userRole === 'super_admin' || userRole === 'broker';

    // 1. Locate the Franchisor's Business Profile
    let business = null;
    const requestedBusinessId = req.query.businessId as string;

    if (isPrivileged && requestedBusinessId) {
      business = await BusinessProfile.findById(requestedBusinessId);
    } else {
      business = await BusinessProfile.findOne({ user: userId });
    }

    if (!business) {
      return sendError(
        res,
        'Franchisor business profile not found. Please complete your brand profile first before accessing investor discovery.',
        404
      );
    }

    // 2. Fetch the Franchisor's Listings
    const requestedListingId = req.query.listingId as string;
    let listings: IFranchiseListing[] = [];

    if (requestedListingId) {
      const listing = await FranchiseListing.findById(requestedListingId);
      if (!listing) {
        return sendError(res, 'Specified franchise opportunity listing not found.', 404);
      }

      // Security check: Verify that this listing belongs to the user's business
      const listingBusinessId = (listing.business as any)?._id || listing.business;
      const listingOwnerId = (listing.ownerUser as any)?._id || listing.ownerUser;

      if (
        !isPrivileged &&
        listingBusinessId?.toString() !== business._id.toString() &&
        listingOwnerId?.toString() !== userId.toString()
      ) {
        return sendError(res, 'Unauthorized to view matches for this franchise listing.', 403);
      }
      listings = [listing];
    } else {
      // Find all listings for this business
      listings = await FranchiseListing.find({
        $or: [{ business: business._id }, { ownerUser: userId }],
      });
    }

    // If franchisor has no specific listings created yet, synthesize a baseline listing from the BusinessProfile
    let primaryListing: any = listings.length > 0 ? listings[0] : null;

    if (!primaryListing) {
      primaryListing = {
        _id: business._id,
        brandName: business.brandName || business.businessName,
        industry: business.category || business.industry || 'General',
        category: business.category,
        totalInvestmentMin: business.estimatedInvestmentMin || 2000000,
        totalInvestmentMax: business.estimatedInvestmentMax || 5000000,
        expansionLocations: business.desiredExpansionCities || business.currentLocations || [],
        businessModel: business.businessModel || 'FOFO',
        franchiseModelType: 'single_unit',
      };
    }

    // 3. Query Real Registered Investor Profiles from Database
    const investors = await InvestorProfile.find({});

    if (!investors || investors.length === 0) {
      return sendSuccess(
        res,
        [],
        'No registered investor profiles are currently active in the platform database.',
        200,
        {
          count: 0,
          totalInvestorsAudited: 0,
        }
      );
    }

    // 4. Calculate Transparent Two-Way Matches for Each Investor
    const matches = investors.map((investor) => {
      const matchAnalysis = calculateFranchisorInvestorMatch(primaryListing, investor);
      const anonymizedProfile = anonymizeInvestorProfile(investor);

      return {
        investor: anonymizedProfile,
        listingSummary: {
          _id: primaryListing._id,
          brandName: primaryListing.brandName,
          industry: primaryListing.industry || primaryListing.category,
          totalInvestmentMin: primaryListing.totalInvestmentMin,
          totalInvestmentMax: primaryListing.totalInvestmentMax,
          expansionLocations: primaryListing.expansionLocations || [],
        },
        matchAnalysis,
      };
    });

    // 5. Rank Descending by Total Match Score
    matches.sort((a, b) => b.matchAnalysis.totalScore - a.matchAnalysis.totalScore);

    // Optional query filter by minimum score (e.g. ?minScore=60)
    const minScore = parseInt(req.query.minScore as string, 10);
    const filteredMatches = !isNaN(minScore)
      ? matches.filter((m) => m.matchAnalysis.totalScore >= minScore)
      : matches;

    return sendSuccess(
      res,
      filteredMatches,
      'Franchisor investor matches calculated successfully',
      200,
      {
        count: filteredMatches.length,
        totalInvestorsAudited: investors.length,
        listingEvaluated: primaryListing.brandName,
        availableListingsCount: listings.length,
      }
    );
  } catch (error: any) {
    return sendError(res, error.message || 'Failed to calculate franchisor investor matches', 500);
  }
};
