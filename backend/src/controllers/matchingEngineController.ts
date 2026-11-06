import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { FranchiseListing } from '../models/FranchiseListing';
import { InvestorProfile } from '../models/InvestorProfile';

export interface IMatchScoreBreakdown {
  budgetScore: number; // max 30
  locationScore: number; // max 20
  industryScore: number; // max 20
  experienceScore: number; // max 10
  unitsScore: number; // max 10
  timelineScore: number; // max 10
  totalScore: number; // max 100
  matchedCriteria: string[];
  unmatchedCriteria: string[];
  introductionStatus: 'Recommended' | 'Broker Verified' | 'Priority Introduction' | 'Under Review';
}

export const getSmartMatchesForInvestor = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const investor = await InvestorProfile.findOne({ user: req.user?.id });
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

      const totalScore = budgetScore + locationScore + industryScore + experienceScore + unitsScore + timelineScore;

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
          totalScore,
          matchedCriteria,
          unmatchedCriteria,
          introductionStatus,
        },
      };
    });

    // Sort descending by total score
    matches.sort((a, b) => b.matchAnalysis.totalScore - a.matchAnalysis.totalScore);

    res.json({ success: true, count: matches.length, data: matches });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};
