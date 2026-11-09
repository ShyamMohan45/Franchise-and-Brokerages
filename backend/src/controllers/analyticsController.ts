import { Request, Response } from 'express';
import { BrokerageDeal } from '../models/BrokerageDeal';
import { Lead } from '../models/Lead';
import { CommissionAgreement } from '../models/CommissionAgreement';
import { CommissionPayment } from '../models/CommissionPayment';
import { FranchiseListing } from '../models/FranchiseListing';
import { User } from '../models/User';

/**
 * 1. GET /api/v1/analytics/dashboard
 * Aggregated database-backed business operations analytics
 */
export const getBusinessAnalytics = async (req: Request, res: Response): Promise<void> => {
  try {
    const user = req.user!;
    if (user.role !== 'admin' && user.role !== 'super_admin' && user.role !== 'broker') {
      res.status(403).json({
        success: false,
        message: 'Access denied. Business analytics are restricted to authorized brokerage personnel.',
      });
      return;
    }

    const { startDate, endDate, brokerId, industry } = req.query;

    const dateFilter: any = {};
    if (startDate || endDate) {
      dateFilter.createdAt = {};
      if (startDate) dateFilter.createdAt.$gte = new Date(startDate as string);
      if (endDate) dateFilter.createdAt.$lte = new Date(endDate as string);
    }

    const dealFilter: any = { ...dateFilter };
    const leadFilter: any = { ...dateFilter };

    if (user.role === 'broker') {
      dealFilter.assignedBroker = user._id;
      leadFilter.assignedBroker = user._id;
    } else if (brokerId) {
      dealFilter.assignedBroker = brokerId;
      leadFilter.assignedBroker = brokerId;
    }

    // 1. Leads & Enquiries
    const [totalLeads, totalEnquiries, qualifiedInvestors] = await Promise.all([
      Lead.countDocuments(leadFilter),
      Lead.countDocuments({ ...leadFilter, leadType: 'INVESTOR_ENQUIRY' }),
      Lead.countDocuments({ ...leadFilter, qualificationStatus: 'QUALIFIED' }),
    ]);

    // 2. Deals aggregation
    const allDeals = await BrokerageDeal.find(dealFilter)
      .populate('franchiseListing', 'brandName industry city targetTerritories')
      .populate('assignedBroker', 'fullName email')
      .lean();

    const activeDeals = allDeals.filter(
      (d) => d.stage !== 'CLOSED_WON' && d.stage !== 'CLOSED_LOST'
    ).length;
    const dealsWon = allDeals.filter((d) => d.stage === 'CLOSED_WON').length;
    const dealsLost = allDeals.filter((d) => d.stage === 'CLOSED_LOST').length;

    const finishedDeals = dealsWon + dealsLost;
    const conversionRate = finishedDeals > 0 ? Math.round((dealsWon / finishedDeals) * 100) : 0;

    const totalDealValue = allDeals.reduce((sum, d) => sum + (d.dealValue || 0), 0);
    const averageDealValue = allDeals.length > 0 ? Math.round(totalDealValue / allDeals.length) : 0;

    const expectedCommission = allDeals.reduce((sum, d) => sum + (d.expectedCommission || 0), 0);
    const earnedCommission = allDeals.reduce(
      (sum, d) => sum + (d.actualCommissionEarned || 0),
      0
    );

    // 3. Verified Revenue from Commission Payments
    const agreementFilter: any = {};
    if (user.role === 'broker') {
      agreementFilter.assignedBroker = user._id;
    } else if (brokerId) {
      agreementFilter.assignedBroker = brokerId;
    }

    const payments = await CommissionPayment.find({
      ...dateFilter,
      status: 'VERIFIED',
    }).lean();

    const receivedRevenue = payments.reduce((sum, p) => sum + (p.amount || 0), 0);

    // 4. Broker-wise Performance
    const brokerMap: Record<string, any> = {};
    for (const d of allDeals) {
      const broker = d.assignedBroker as any;
      const bId = broker?._id?.toString() || 'unassigned';
      const bName = broker?.fullName || 'Unassigned';

      if (!brokerMap[bId]) {
        brokerMap[bId] = {
          brokerId: bId,
          brokerName: bName,
          totalDeals: 0,
          activeDeals: 0,
          dealsWon: 0,
          totalVolume: 0,
          earnedCommission: 0,
        };
      }
      brokerMap[bId].totalDeals++;
      if (d.stage === 'CLOSED_WON') brokerMap[bId].dealsWon++;
      else if (d.stage !== 'CLOSED_LOST') brokerMap[bId].activeDeals++;
      brokerMap[bId].totalVolume += d.dealValue || 0;
      brokerMap[bId].earnedCommission += d.actualCommissionEarned || 0;
    }
    const brokerPerformance = Object.values(brokerMap);

    // 5. Industry-wise Performance
    const industryMap: Record<string, any> = {};
    for (const d of allDeals) {
      const listing = d.franchiseListing as any;
      const ind = listing?.industry || 'General';

      if (!industryMap[ind]) {
        industryMap[ind] = {
          industry: ind,
          dealCount: 0,
          totalValue: 0,
          dealsWon: 0,
        };
      }
      industryMap[ind].dealCount++;
      industryMap[ind].totalValue += d.dealValue || 0;
      if (d.stage === 'CLOSED_WON') industryMap[ind].dealsWon++;
    }
    const industryPerformance = Object.values(industryMap);

    // 6. City / Territory Performance
    const cityMap: Record<string, any> = {};
    for (const d of allDeals) {
      const listing = d.franchiseListing as any;
      const city = listing?.targetTerritories?.[0] || listing?.city || 'Metro';

      if (!cityMap[city]) {
        cityMap[city] = {
          city,
          dealCount: 0,
          volume: 0,
        };
      }
      cityMap[city].dealCount++;
      cityMap[city].volume += d.dealValue || 0;
    }
    const cityPerformance = Object.values(cityMap).slice(0, 10);

    // 7. Monthly Performance (Last 6 months)
    const monthlyMap: Record<string, any> = {};
    for (const d of allDeals) {
      const date = new Date(d.createdAt);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      if (!monthlyMap[monthKey]) {
        monthlyMap[monthKey] = {
          month: monthKey,
          dealsCount: 0,
          volume: 0,
          revenue: 0,
        };
      }
      monthlyMap[monthKey].dealsCount++;
      monthlyMap[monthKey].volume += d.dealValue || 0;
      monthlyMap[monthKey].revenue += d.actualCommissionEarned || 0;
    }
    const monthlyPerformance = Object.values(monthlyMap).sort((a: any, b: any) =>
      a.month.localeCompare(b.month)
    );

    res.json({
      success: true,
      data: {
        summary: {
          totalLeads,
          totalEnquiries,
          qualifiedInvestors,
          totalDeals: allDeals.length,
          activeDeals,
          dealsWon,
          dealsLost,
          conversionRate,
          totalDealValue,
          totalDealValuePaise: totalDealValue * 100,
          averageDealValue,
          averageDealValuePaise: averageDealValue * 100,
          expectedCommission,
          expectedCommissionPaise: expectedCommission * 100,
          earnedCommission,
          earnedCommissionPaise: earnedCommission * 100,
          receivedRevenue,
          receivedRevenuePaise: receivedRevenue * 100,
        },
        brokerPerformance,
        industryPerformance,
        cityPerformance,
        monthlyPerformance,
      },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * 2. GET /api/v1/reports/deals/csv
 * Export deals report as downloadable CSV
 */
export const exportDealsCsv = async (req: Request, res: Response): Promise<void> => {
  try {
    const user = req.user!;
    if (user.role !== 'admin' && user.role !== 'super_admin' && user.role !== 'broker') {
      res.status(403).json({ success: false, message: 'Access denied.' });
      return;
    }

    const { startDate, endDate } = req.query;
    const filter: any = {};
    if (startDate || endDate) {
      filter.createdAt = {};
      if (startDate) filter.createdAt.$gte = new Date(startDate as string);
      if (endDate) filter.createdAt.$lte = new Date(endDate as string);
    }
    if (user.role === 'broker') {
      filter.assignedBroker = user._id;
    }

    const deals = await BrokerageDeal.find(filter)
      .populate('franchiseListing', 'brandName industry')
      .populate('businessOwner', 'fullName email')
      .populate('investor', 'fullName email')
      .populate('assignedBroker', 'fullName email')
      .sort({ createdAt: -1 });

    const headers = [
      'Deal ID',
      'Deal Title',
      'Brand Name',
      'Investor Name',
      'Assigned Broker',
      'Stage',
      'Deal Value (INR)',
      'Franchise Fee (INR)',
      'Expected Commission (INR)',
      'Payment Status',
      'Created Date',
    ];

    const rows = deals.map((d: any) => [
      `"${d._id}"`,
      `"${(d.dealTitle || '').replace(/"/g, '""')}"`,
      `"${(d.franchiseListing?.brandName || '').replace(/"/g, '""')}"`,
      `"${(d.investor?.fullName || '').replace(/"/g, '""')}"`,
      `"${(d.assignedBroker?.fullName || '').replace(/"/g, '""')}"`,
      `"${d.stage}"`,
      d.dealValue || 0,
      d.franchiseFee || 0,
      d.expectedCommission || 0,
      `"${d.paymentStatus || 'pending'}"`,
      `"${new Date(d.createdAt).toISOString().split('T')[0]}"`,
    ]);

    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="franchisebridge_deals_report_${Date.now()}.csv"`
    );
    res.status(200).send(csvContent);
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * 3. GET /api/v1/reports/commissions/csv
 * Export commission ledger report as downloadable CSV
 */
export const exportCommissionsCsv = async (req: Request, res: Response): Promise<void> => {
  try {
    const user = req.user!;
    if (user.role !== 'admin' && user.role !== 'super_admin' && user.role !== 'broker') {
      res.status(403).json({ success: false, message: 'Access denied.' });
      return;
    }

    const { startDate, endDate } = req.query;
    const filter: any = {};
    if (startDate || endDate) {
      filter.createdAt = {};
      if (startDate) filter.createdAt.$gte = new Date(startDate as string);
      if (endDate) filter.createdAt.$lte = new Date(endDate as string);
    }
    if (user.role === 'broker') {
      filter.assignedBroker = user._id;
    }

    const agreements = await CommissionAgreement.find(filter)
      .populate('deal', 'dealTitle')
      .populate('brand', 'fullName email')
      .populate('investor', 'fullName email')
      .populate('assignedBroker', 'fullName email')
      .sort({ createdAt: -1 });

    const headers = [
      'Agreement Number',
      'Deal Title',
      'Brand Payer',
      'Assigned Broker',
      'Commission Type',
      'Base Amount (INR)',
      'Expected Commission (INR)',
      'Received Revenue (INR)',
      'Pending Commission (INR)',
      'Status',
      'Created Date',
    ];

    const rows = agreements.map((a: any) => [
      `"${a.agreementNumber}"`,
      `"${(a.deal?.dealTitle || '').replace(/"/g, '""')}"`,
      `"${(a.brand?.fullName || '').replace(/"/g, '""')}"`,
      `"${(a.assignedBroker?.fullName || '').replace(/"/g, '""')}"`,
      `"${a.commissionType}"`,
      a.baseAmount || 0,
      a.expectedCommission || 0,
      a.receivedRevenue || 0,
      a.pendingCommission || 0,
      `"${a.status}"`,
      `"${new Date(a.createdAt).toISOString().split('T')[0]}"`,
    ]);

    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="franchisebridge_commission_ledger_${Date.now()}.csv"`
    );
    res.status(200).send(csvContent);
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};
