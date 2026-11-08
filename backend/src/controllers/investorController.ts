import { Request, Response } from 'express';
import { InvestorProfile } from '../models/InvestorProfile';
import { FranchiseListing } from '../models/FranchiseListing';
import { sendSuccess, sendError } from '../utils/response';
import { AuditLog } from '../models/AuditLog';

export async function getInvestorProfile(req: Request, res: Response): Promise<any> {
  const profile = await InvestorProfile.findOne({ user: req.user!._id });
  return sendSuccess(res, profile);
}

export async function updateInvestorProfile(req: Request, res: Response): Promise<any> {
  const userId = req.user!._id;
  const {
    fullName,
    email,
    phone,
    city,
    state,
    country,
    investmentBudgetMin,
    investmentBudgetMax,
    liquidCapital,
    preferredIndustries,
    preferredStates,
    preferredCities,
    preferredLocations,
    investmentExperience,
    businessExperienceYears,
    pastFranchiseExperience,
    interestType,
    preferredBusinessModel,
    operationPreference,
    proposedOutlets,
    investmentTimeline,
    additionalRequirements,
    currentOccupation,
    companyName,
  } = req.body;

  if (investmentBudgetMin !== undefined && investmentBudgetMax !== undefined) {
    if (Number(investmentBudgetMin) > Number(investmentBudgetMax)) {
      return sendError(res, 'Minimum investment budget cannot exceed maximum investment budget', 400);
    }
  }

  let profile = await InvestorProfile.findOne({ user: userId });

  const profileData: any = {
    user: userId,
    fullName: fullName || req.user!.fullName,
    email: email || req.user!.email,
    phone: phone || req.user!.phone || '',
    city: city || 'Mumbai',
    state: state || '',
    country: country || 'India',
    investmentBudgetMin: investmentBudgetMin !== undefined ? Number(investmentBudgetMin) : 2500000,
    investmentBudgetMinPaise: Math.round(Number(investmentBudgetMin || 2500000) * 100),
    investmentBudgetMax: investmentBudgetMax !== undefined ? Number(investmentBudgetMax) : 5000000,
    investmentBudgetMaxPaise: Math.round(Number(investmentBudgetMax || 5000000) * 100),
    liquidCapital: liquidCapital !== undefined ? Number(liquidCapital) : 3500000,
    liquidCapitalPaise: Math.round(Number(liquidCapital || 3500000) * 100),
    preferredIndustries: Array.isArray(preferredIndustries)
      ? preferredIndustries
      : typeof preferredIndustries === 'string'
      ? preferredIndustries.split(',').map((s) => s.trim()).filter(Boolean)
      : ['Food & Beverage'],
    preferredStates: Array.isArray(preferredStates)
      ? preferredStates
      : typeof preferredStates === 'string'
      ? preferredStates.split(',').map((s) => s.trim()).filter(Boolean)
      : [],
    preferredCities: Array.isArray(preferredCities)
      ? preferredCities
      : typeof preferredCities === 'string'
      ? preferredCities.split(',').map((s) => s.trim()).filter(Boolean)
      : [],
    preferredLocations: Array.isArray(preferredLocations)
      ? preferredLocations
      : typeof preferredLocations === 'string'
      ? preferredLocations.split(',').map((s) => s.trim()).filter(Boolean)
      : ['Mumbai', 'Pune', 'Bengaluru'],
    investmentExperience: investmentExperience || 'Intermediate investor with multi-unit expansion goals',
    businessExperienceYears: businessExperienceYears !== undefined ? Number(businessExperienceYears) : 3,
    pastFranchiseExperience: Boolean(pastFranchiseExperience),
    interestType: interestType || 'multi_unit',
    preferredBusinessModel: preferredBusinessModel || 'FOFO',
    operationPreference: operationPreference || 'flexible',
    proposedOutlets: proposedOutlets !== undefined ? Number(proposedOutlets) : 2,
    investmentTimeline: investmentTimeline || '1_to_3_months',
    additionalRequirements: additionalRequirements || '',
    currentOccupation: currentOccupation || '',
    companyName: companyName || '',
  };

  if (!profile) {
    profile = await InvestorProfile.create(profileData);
  } else {
    Object.assign(profile, profileData);
    await profile.save();
  }

  await AuditLog.create({
    actor: userId,
    actorRole: req.user!.role,
    actorEmail: req.user!.email,
    action: 'INVESTOR_PROFILE_UPDATED',
    entityType: 'InvestorProfile',
    entityId: profile._id.toString(),
  });

  return sendSuccess(res, profile, 'Investor profile saved successfully');
}

export async function getRecommendations(req: Request, res: Response): Promise<any> {
  const profile = await InvestorProfile.findOne({ user: req.user!._id });
  const franchises = await FranchiseListing.find({ status: 'published' }).populate(
    'business',
    'businessName logoUrl numberOfOutlets'
  );

  if (!profile) {
    // If no profile, return published listings with default match score
    const fallbackResults = franchises.slice(0, 6).map((f) => ({
      franchise: f,
      matchScore: 70,
      matchDetails: {
        budgetMatch: true,
        locationMatch: false,
        industryMatch: false,
        modelTypeMatch: true,
      },
      matchReason: 'Complete your investor profile for personalized multi-unit compatibility scoring.',
    }));
    return sendSuccess(res, fallbackResults);
  }

  const scoredFranchises = franchises.map((f) => {
    let score = 0;
    const matchDetails = {
      budgetMatch: false,
      locationMatch: false,
      industryMatch: false,
      modelTypeMatch: false,
    };
    const explanations: string[] = [];

    // 1. Budget Compatibility (40 points)
    const investorMax = profile.investmentBudgetMax || profile.liquidCapital;
    if (investorMax >= f.totalInvestmentMin) {
      matchDetails.budgetMatch = true;
      score += 40;
      explanations.push('Budget satisfies initial franchise capital requirement.');
    } else {
      explanations.push(`Budget is below minimum estimated investment (₹${f.totalInvestmentMin.toLocaleString()}).`);
    }

    // 2. Industry Preference (25 points)
    if (
      profile.preferredIndustries &&
      profile.preferredIndustries.some((ind) => ind.toLowerCase() === f.industry.toLowerCase())
    ) {
      matchDetails.industryMatch = true;
      score += 25;
      explanations.push(`Industry matches your preferred sector: ${f.industry}.`);
    }

    // 3. Geographic / Location Alignment (20 points)
    const matchesLocation =
      profile.preferredLocations &&
      profile.preferredLocations.some((loc) =>
        f.expansionLocations.some((exp) => exp.toLowerCase().includes(loc.toLowerCase()) || loc.toLowerCase().includes(exp.toLowerCase()))
      );

    if (matchesLocation || (profile.city && f.expansionLocations.some((exp) => exp.toLowerCase().includes(profile.city.toLowerCase())))) {
      matchDetails.locationMatch = true;
      score += 20;
      explanations.push('Brand is actively seeking expansion in your target territory.');
    }

    // 4. Franchise Model / Unit Intent (15 points)
    if (
      f.franchiseModelType === 'both' ||
      (profile.interestType === 'single_unit' && f.franchiseModelType === 'single_unit') ||
      (profile.interestType === 'multi_unit' && f.franchiseModelType === 'multi_unit')
    ) {
      matchDetails.modelTypeMatch = true;
      score += 15;
      explanations.push(`Supports your ${profile.interestType.replace('_', ' ')} expansion goals.`);
    }

    return {
      franchise: f,
      matchScore: Math.min(100, score),
      matchDetails,
      explanations,
      matchReason: explanations.join(' '),
    };
  });

  scoredFranchises.sort((a, b) => b.matchScore - a.matchScore);

  return sendSuccess(res, scoredFranchises);
}
