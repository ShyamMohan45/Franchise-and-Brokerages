import { Request, Response } from 'express';
import { BusinessProfile } from '../models/BusinessProfile';
import { FranchiseReadinessAssessment } from '../models/FranchiseReadinessAssessment';
import { sendSuccess, sendError } from '../utils/response';
import { AuditLog } from '../models/AuditLog';

function generateSlug(name: string): string {
  return (
    name
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '') +
    '-' +
    Math.random().toString(36).substring(2, 6)
  );
}

export async function getMyBusiness(req: Request, res: Response): Promise<any> {
  const profile = await BusinessProfile.findOne({ user: req.user!._id });
  if (!profile) {
    return sendSuccess(res, null, 'No business profile created yet');
  }

  const assessment = await FranchiseReadinessAssessment.findOne({ business: profile._id }).sort({
    createdAt: -1,
  });

  return sendSuccess(res, {
    business: profile,
    assessment,
  });
}

export async function createOrUpdateBusiness(req: Request, res: Response): Promise<any> {
  const userId = req.user!._id;
  let profile = await BusinessProfile.findOne({ user: userId });

  if (!profile) {
    const slug = generateSlug(req.body.businessName);
    profile = await BusinessProfile.create({
      ...req.body,
      user: userId,
      slug,
      approvalStatus: 'under_review',
    });

    await AuditLog.create({
      actor: userId,
      actorRole: req.user!.role,
      actorEmail: req.user!.email,
      action: 'BUSINESS_CREATED',
      entityType: 'BusinessProfile',
      entityId: profile._id.toString(),
      details: { businessName: profile.businessName },
    });

    return sendSuccess(res, profile, 'Business profile submitted for review', 201);
  } else {
    Object.assign(profile, req.body);
    // If it was rejected or draft, put back under review upon resubmission
    if (profile.approvalStatus === 'draft' || profile.approvalStatus === 'revision_requested') {
      profile.approvalStatus = 'under_review';
    }
    await profile.save();

    await AuditLog.create({
      actor: userId,
      actorRole: req.user!.role,
      actorEmail: req.user!.email,
      action: 'BUSINESS_UPDATED',
      entityType: 'BusinessProfile',
      entityId: profile._id.toString(),
    });

    return sendSuccess(res, profile, 'Business profile updated successfully');
  }
}

export async function submitReadinessAssessment(req: Request, res: Response): Promise<any> {
  const userId = req.user!._id;
  const profile = await BusinessProfile.findOne({ user: userId });
  if (!profile) {
    return sendError(res, 'Please create your business profile first', 400);
  }

  const a = req.body.answers;
  const scores = [
    a.brandStrengthScore,
    a.unitEconomicsScore,
    a.sopDocumentationScore,
    a.legalScore,
    a.supplyChainScore,
    a.trainingScore,
    a.repeatabilityScore,
    a.expansionCapacityScore,
  ];
  const overallScore = Math.round(scores.reduce((acc: number, curr: number) => acc + curr, 0) / scores.length);

  const priorityActionItems: string[] = [];
  if (a.sopDocumentationScore < 60) priorityActionItems.push('Document daily SOPs and quality guidelines');
  if (a.legalScore < 60) priorityActionItems.push('Prepare legal FDD disclosures and trademark registrations');
  if (a.trainingScore < 60) priorityActionItems.push('Standardize 2-week onboarding and manager training curricula');
  if (a.unitEconomicsScore < 60) priorityActionItems.push('Refine outlet unit economics and gross margins for franchisees');

  let recommendation = 'Your business shows strong potential for franchise scale.';
  if (overallScore < 50) {
    recommendation =
      'Preliminary readiness stage. Focus on unit economics and operational systematization before recruiting franchisees.';
  } else if (overallScore < 75) {
    recommendation =
      'Promising franchise foundation. Complete SOP documentation and legal disclosures with our brokerage advisory.';
  } else {
    recommendation =
      'Highly franchise-ready. Approved to package FDD/FIM documentation and recruit multi-unit investors.';
  }

  const assessment = await FranchiseReadinessAssessment.create({
    business: profile._id,
    evaluatedBy: userId,
    status: 'self_assessment',
    overallScore,
    pillars: {
      brandStrength: { score: a.brandStrengthScore, notes: a.brandNotes, recommendations: [] },
      unitEconomics: { score: a.unitEconomicsScore, notes: a.unitEconomicsNotes, recommendations: [] },
      sopDocumentation: { score: a.sopDocumentationScore, notes: a.sopNotes, recommendations: [] },
      legalAndIpReadiness: { score: a.legalScore, notes: a.legalNotes, recommendations: [] },
      supplyChainReadiness: { score: a.supplyChainScore, notes: a.supplyChainNotes, recommendations: [] },
      trainingSystemReadiness: { score: a.trainingScore, notes: a.trainingNotes, recommendations: [] },
      unitRepeatability: { score: a.repeatabilityScore, notes: a.repeatabilityNotes, recommendations: [] },
      expansionCapacity: { score: a.expansionCapacityScore, notes: a.expansionNotes, recommendations: [] },
    },
    summaryRecommendation: recommendation,
    priorityActionItems,
  });

  profile.readinessScore = overallScore;
  await profile.save();

  return sendSuccess(res, assessment, 'Franchise readiness assessment calculated successfully', 201);
}
