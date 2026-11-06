import { Request, Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { evaluateFranchiseReadiness, handleChatAssistant } from '../services/aiService';
import { FranchiseReadinessAssessment } from '../models/FranchiseReadinessAssessment';
import { BusinessProfile } from '../models/BusinessProfile';

export const analyzeReadiness = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const {
      brandName = 'My Business',
      industry = 'Food & Beverage',
      operatingYears = 3,
      existingOutlets = 2,
      annualRevenueInLakhs = 120,
      ebitdaMarginPercent = 18,
      hasRegisteredTrademark = true,
      hasDocumentedSOPs = true,
      hasFDDOrDisclosureReady = false,
      hasDedicatedTrainingProgram = true,
      centralizedSupplyChain = true,
      targetExpansionFormat = 'Standard Franchise',
    } = req.body;

    const evaluation = evaluateFranchiseReadiness({
      brandName,
      industry,
      operatingYears: Number(operatingYears),
      existingOutlets: Number(existingOutlets),
      annualRevenueInLakhs: Number(annualRevenueInLakhs),
      ebitdaMarginPercent: Number(ebitdaMarginPercent),
      hasRegisteredTrademark: Boolean(hasRegisteredTrademark),
      hasDocumentedSOPs: Boolean(hasDocumentedSOPs),
      hasFDDOrDisclosureReady: Boolean(hasFDDOrDisclosureReady),
      hasDedicatedTrainingProgram: Boolean(hasDedicatedTrainingProgram),
      centralizedSupplyChain: Boolean(centralizedSupplyChain),
      targetExpansionFormat,
    });

    // Save to database if user is a business
    if (req.user?.id) {
      const business = await BusinessProfile.findOne({ user: req.user.id });
      if (business) {
        await FranchiseReadinessAssessment.create({
          business: business._id,
          evaluatedBy: req.user.id,
          status: evaluation.overallScore >= 80 ? 'certified_ready' : 'self_assessment',
          overallScore: evaluation.overallScore,
          pillars: {
            brandStrength: evaluation.pillars.brandStrength,
            unitEconomics: evaluation.pillars.unitEconomics,
            sopDocumentation: evaluation.pillars.sopDocumentation,
            legalAndIpReadiness: evaluation.pillars.legalAndIpReadiness,
            supplyChainReadiness: evaluation.pillars.supplyChainReadiness,
            trainingSystemReadiness: evaluation.pillars.trainingSystemReadiness,
            unitRepeatability: evaluation.pillars.unitRepeatability,
            expansionCapacity: evaluation.pillars.expansionCapacity,
          },
          summaryRecommendation: evaluation.executiveSummary,
          priorityActionItems: [
            ...evaluation.actionPlan30Days.slice(0, 2),
            ...evaluation.actionPlan60Days.slice(0, 1),
          ],
          disclaimerNotice: evaluation.disclaimer,
        });
      }
    }

    res.json({ success: true, data: evaluation });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const chatAssistant = async (req: Request, res: Response): Promise<void> => {
  try {
    const { message, role } = req.body;
    if (!message || typeof message !== 'string') {
      res.status(400).json({ success: false, message: 'Message is required' });
      return;
    }

    const reply = handleChatAssistant(message, role);
    res.json({ success: true, reply });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getReadinessHistory = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const business = await BusinessProfile.findOne({ user: req.user?.id });
    if (!business) {
      res.json({ success: true, count: 0, data: [] });
      return;
    }

    const history = await FranchiseReadinessAssessment.find({ business: business._id }).sort({
      createdAt: -1,
    });
    res.json({ success: true, count: history.length, data: history });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};
