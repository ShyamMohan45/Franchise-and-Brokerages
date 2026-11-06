import { Request, Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { CostEstimate } from '../models/CostEstimate';
import { FranchiseListing } from '../models/FranchiseListing';

export const calculateCost = async (req: Request, res: Response): Promise<void> => {
  try {
    const {
      brandName = 'Franchise Opportunity',
      industry = 'Food & Beverage',
      cityTier = 'Tier 1',
      storeFormat = 'Standard Inline',
      sizeSqFt = 1200,
      customFranchiseFee,
      customInteriorPerSqFt,
      customEquipment,
      customInventory,
      customSecurityDepositMonths = 6,
    } = req.body;

    const sqft = Number(sizeSqFt) || 1200;

    // Industry defaults (in INR)
    let baseFranchiseFee = customFranchiseFee ? Number(customFranchiseFee) : 800000;
    let interiorRatePerSqFt = customInteriorPerSqFt ? Number(customInteriorPerSqFt) : 1800;
    let baseEquipment = customEquipment ? Number(customEquipment) : 1200000;
    let baseInventory = customInventory ? Number(customInventory) : 400000;
    let rentRatePerSqFt = 140; // Tier 1

    if (cityTier === 'Tier 2') {
      rentRatePerSqFt = 90;
      interiorRatePerSqFt *= 0.88;
    } else if (cityTier === 'Tier 3') {
      rentRatePerSqFt = 60;
      interiorRatePerSqFt *= 0.78;
    }

    const interiorFitout = Math.round(sqft * interiorRatePerSqFt);
    const securityDeposit = Math.round(sqft * rentRatePerSqFt * customSecurityDepositMonths);
    const equipmentMachinery = Math.round(baseEquipment);
    const initialInventory = Math.round(baseInventory);
    const licensingAndLegal = 150000;
    const grandOpeningMarketing = 200000;
    const workingCapitalBuffer = Math.round((interiorFitout + equipmentMachinery) * 0.1);

    const totalEstimatedCapex =
      baseFranchiseFee +
      securityDeposit +
      interiorFitout +
      equipmentMachinery +
      initialInventory +
      licensingAndLegal +
      grandOpeningMarketing +
      workingCapitalBuffer;

    // Projected economics
    const estimatedDailyCustomers = Math.round(sqft * 0.15);
    const averageOrderValue = industry.toLowerCase().includes('fitness') ? 2500 : 350;
    const projectedMonthlyRevenue =
      industry.toLowerCase().includes('fitness')
        ? Math.round(estimatedDailyCustomers * 4 * 1800)
        : Math.round(estimatedDailyCustomers * averageOrderValue * 30);
    const projectedNetMarginPercent = 22;
    const projectedMonthlyNetProfit = Math.round(projectedMonthlyRevenue * (projectedNetMarginPercent / 100));

    // Scenarios
    const lowCapex = Math.round(totalEstimatedCapex * 0.88);
    const highCapex = Math.round(totalEstimatedCapex * 1.18);

    const lowBreakEven = projectedMonthlyNetProfit > 0 ? Math.ceil(lowCapex / (projectedMonthlyNetProfit * 0.85)) : 24;
    const medBreakEven = projectedMonthlyNetProfit > 0 ? Math.ceil(totalEstimatedCapex / projectedMonthlyNetProfit) : 20;
    const highBreakEven = projectedMonthlyNetProfit > 0 ? Math.ceil(highCapex / (projectedMonthlyNetProfit * 1.1)) : 28;

    const breakdown = {
      brandName,
      industry,
      cityTier,
      storeFormat,
      sizeSqFt: sqft,
      franchiseFee: baseFranchiseFee,
      securityDeposit,
      interiorFitout,
      equipmentMachinery,
      initialInventory,
      licensingAndLegal,
      grandOpeningMarketing,
      workingCapitalBuffer,
      totalEstimatedCapex,
      projectedMonthlyRevenue,
      projectedMonthlyNetProfit,
      projectedNetMarginPercent,
      scenarios: {
        low: {
          totalCapex: lowCapex,
          fitoutDiscountPercent: 12,
          monthlyOpex: Math.round(projectedMonthlyRevenue * 0.65),
          breakEvenMonths: lowBreakEven,
        },
        medium: {
          totalCapex: totalEstimatedCapex,
          monthlyOpex: Math.round(projectedMonthlyRevenue * 0.72),
          breakEvenMonths: medBreakEven,
        },
        high: {
          totalCapex: highCapex,
          contingencyPercent: 18,
          monthlyOpex: Math.round(projectedMonthlyRevenue * 0.78),
          breakEvenMonths: highBreakEven,
        },
      },
    };

    res.json({ success: true, data: breakdown });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const saveCostEstimate = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const estimate = await CostEstimate.create({
      ...req.body,
      user: req.user?.id,
    });
    res.status(201).json({ success: true, data: estimate });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const getSavedEstimates = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const estimates = await CostEstimate.find({ user: req.user?.id }).sort({ createdAt: -1 });
    res.json({ success: true, count: estimates.length, data: estimates });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};
