import { Request, Response } from 'express';
import { CommissionAgreement, ICommissionAgreement } from '../models/CommissionAgreement';
import { CommissionPayment } from '../models/CommissionPayment';
import { BrokerageDeal } from '../models/BrokerageDeal';
import { AuditLog } from '../models/AuditLog';
import { Notification } from '../models/Notification';
import { User } from '../models/User';

/**
 * Helper to check role permission for commission records
 */
function checkCommissionPrivilege(user: any): boolean {
  return user.role === 'admin' || user.role === 'super_admin' || user.role === 'broker';
}

/**
 * 1. GET /api/v1/commissions/agreements
 * List commission agreements (restricted to Admin, Super Admin, and permitted Brokers)
 */
export const getCommissionAgreements = async (req: Request, res: Response): Promise<void> => {
  try {
    const user = req.user!;

    if (!checkCommissionPrivilege(user)) {
      res.status(403).json({
        success: false,
        message: 'Access denied. Internal commission agreements are confidential financial records.',
      });
      return;
    }

    const { status, payer, dealId } = req.query;
    const filter: any = {};

    if (user.role === 'broker') {
      filter.assignedBroker = user._id;
    }

    if (status) filter.status = status;
    if (payer) filter.payer = payer;
    if (dealId) filter.deal = dealId;

    const agreements = await CommissionAgreement.find(filter)
      .populate('deal', 'dealTitle stage dealValue franchiseFee')
      .populate('brand', 'fullName email')
      .populate('investor', 'fullName email')
      .populate('assignedBroker', 'fullName email')
      .populate('franchiseListing', 'brandName slug logoUrl')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: agreements.length,
      data: agreements,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * 2. GET /api/v1/commissions/agreements/:id
 * Retrieve single agreement with full milestone and payment breakdown
 */
export const getCommissionAgreementById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const user = req.user!;

    if (!checkCommissionPrivilege(user)) {
      res.status(403).json({
        success: false,
        message: 'Access denied. Commission records are confidential.',
      });
      return;
    }

    const agreement = await CommissionAgreement.findById(id)
      .populate('deal')
      .populate('brand', 'fullName email phone')
      .populate('investor', 'fullName email phone')
      .populate('assignedBroker', 'fullName email phone')
      .populate('franchiseListing');

    if (!agreement) {
      res.status(404).json({ success: false, message: 'Commission agreement not found' });
      return;
    }

    const brokerIdStr = (agreement.assignedBroker as any)?._id
      ? (agreement.assignedBroker as any)._id.toString()
      : (agreement.assignedBroker as any)?.toString();

    // Broker authorization check: broker can only access their assigned agreements
    if (user.role === 'broker' && brokerIdStr !== user._id.toString()) {
      res.status(403).json({
        success: false,
        message: 'Forbidden. You do not have permission to view commission details for this deal.',
      });
      return;
    }

    const payments = await CommissionPayment.find({ agreement: agreement._id })
      .populate('receivedBy', 'fullName email')
      .sort({ paymentDate: -1 });

    res.json({
      success: true,
      data: {
        ...agreement.toObject(),
        payments,
      },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * 3. POST /api/v1/commissions/agreements
 * Create commission agreement with fixed or percentage calculations and integer paise validation
 */
export const createCommissionAgreement = async (req: Request, res: Response): Promise<void> => {
  try {
    const user = req.user!;

    if (!checkCommissionPrivilege(user)) {
      res.status(403).json({
        success: false,
        message: 'Access denied. You do not have permission to create commission agreements.',
      });
      return;
    }

    const {
      dealId,
      commissionType,
      commissionRate,
      fixedAmount,
      payer,
      calculationBasis,
      baseAmount: customBaseAmount,
      milestones: customMilestones,
      termsAndConditions,
      notes,
    } = req.body;

    const deal = await BrokerageDeal.findById(dealId);
    if (!deal) {
      res.status(404).json({ success: false, message: 'Referenced deal not found' });
      return;
    }

    // Broker can only create agreements for their assigned deals
    if (user.role === 'broker' && deal.assignedBroker.toString() !== user._id.toString()) {
      res.status(403).json({
        success: false,
        message: 'Forbidden. You can only create commission agreements for deals assigned to you.',
      });
      return;
    }

    // Determine calculation base
    let baseAmount = customBaseAmount;
    if (baseAmount === undefined || baseAmount === null) {
      if (calculationBasis === 'franchise_fee') {
        baseAmount = deal.franchiseFee || 0;
      } else if (calculationBasis === 'fixed') {
        baseAmount = fixedAmount || 0;
      } else {
        baseAmount = deal.dealValue || 0;
      }
    }

    // Compute expected commission in INR
    let expectedCommission = 0;
    if (commissionType === 'percentage') {
      const rate = commissionRate !== undefined ? commissionRate : deal.commissionRate * 100;
      expectedCommission = Math.round((baseAmount * rate) / 100);
    } else {
      expectedCommission = fixedAmount || 0;
    }

    // Configure milestones
    let milestones = customMilestones;
    if (!milestones || milestones.length === 0) {
      milestones = [
        {
          title: 'LOI & Brand Matching Milestone',
          percentage: 25,
          amount: Math.round(expectedCommission * 0.25),
          amountPaise: Math.round(expectedCommission * 0.25 * 100),
          triggerStage: 'BRAND_MATCHING',
          status: 'PENDING',
          paidAmount: 0,
          paidAmountPaise: 0,
        },
        {
          title: 'Due Diligence & FDD Disclosure Milestone',
          percentage: 25,
          amount: Math.round(expectedCommission * 0.25),
          amountPaise: Math.round(expectedCommission * 0.25 * 100),
          triggerStage: 'DUE_DILIGENCE',
          status: 'PENDING',
          paidAmount: 0,
          paidAmountPaise: 0,
        },
        {
          title: 'Final Franchise Agreement Execution & Closing',
          percentage: 50,
          amount: Math.round(expectedCommission * 0.5),
          amountPaise: Math.round(expectedCommission * 0.5 * 100),
          triggerStage: 'CLOSED_WON',
          status: 'PENDING',
          paidAmount: 0,
          paidAmountPaise: 0,
        },
      ];
    } else {
      milestones = milestones.map((m: any) => ({
        ...m,
        amountPaise: Math.round(m.amount * 100),
        paidAmount: m.paidAmount || 0,
        paidAmountPaise: Math.round((m.paidAmount || 0) * 100),
        status: m.status || 'PENDING',
      }));
    }

    const uniqueAgreementNum = `CA-${Date.now().toString().slice(-6)}-${Math.floor(Math.random() * 900 + 100)}`;

    const agreement = await CommissionAgreement.create({
      agreementNumber: uniqueAgreementNum,
      deal: deal._id,
      brand: deal.businessOwner,
      franchiseListing: deal.franchiseListing,
      investor: deal.investor,
      assignedBroker: deal.assignedBroker,
      commissionType,
      commissionRate: commissionType === 'percentage' ? commissionRate : undefined,
      fixedAmount: commissionType === 'fixed' ? fixedAmount : undefined,
      fixedAmountPaise: commissionType === 'fixed' ? Math.round((fixedAmount || 0) * 100) : 0,
      payer: payer || 'brand',
      calculationBasis: calculationBasis || 'deal_value',
      baseAmount,
      baseAmountPaise: Math.round(baseAmount * 100),
      expectedCommission,
      expectedCommissionPaise: Math.round(expectedCommission * 100),
      earnedCommission: 0,
      earnedCommissionPaise: 0,
      receivedRevenue: 0,
      receivedRevenuePaise: 0,
      pendingCommission: expectedCommission,
      pendingCommissionPaise: Math.round(expectedCommission * 100),
      milestones,
      status: 'ACTIVE',
      approvalHistory: [
        {
          status: 'ACTIVE',
          actionBy: user._id,
          actionAt: new Date(),
          notes: 'Agreement initialized and activated upon deal onboarding',
        },
      ],
      termsAndConditions,
      notes,
    });

    // Update deal expectedCommission
    deal.expectedCommission = expectedCommission;
    deal.expectedCommissionPaise = Math.round(expectedCommission * 100);
    await deal.save();

    await AuditLog.create({
      actor: user._id,
      actorRole: user.role,
      actorEmail: user.email,
      action: 'COMMISSION_AGREEMENT_CREATED',
      entityType: 'CommissionAgreement',
      entityId: agreement._id.toString(),
      details: {
        agreementNumber: agreement.agreementNumber,
        dealId: deal._id.toString(),
        expectedCommission,
        commissionType,
      },
    });

    res.status(201).json({
      success: true,
      message: 'Commission agreement created successfully',
      data: agreement,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * 4. PATCH /api/v1/commissions/agreements/:id/status
 * Update commission agreement status with approval history
 */
export const updateCommissionAgreementStatus = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;
    const { status, notes } = req.body;
    const user = req.user!;

    if (!checkCommissionPrivilege(user)) {
      res.status(403).json({ success: false, message: 'Access denied.' });
      return;
    }

    const agreement = await CommissionAgreement.findById(id);
    if (!agreement) {
      res.status(404).json({ success: false, message: 'Commission agreement not found' });
      return;
    }

    agreement.status = status;
    agreement.approvalHistory.push({
      status,
      actionBy: user._id,
      actionAt: new Date(),
      notes: notes || `Agreement status updated to ${status}`,
    });

    await agreement.save();

    await AuditLog.create({
      actor: user._id,
      actorRole: user.role,
      actorEmail: user.email,
      action: 'COMMISSION_AGREEMENT_STATUS_UPDATED',
      entityType: 'CommissionAgreement',
      entityId: agreement._id.toString(),
      details: { status, notes },
    });

    res.json({
      success: true,
      message: `Commission agreement status updated to ${status}`,
      data: agreement,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * 5. POST /api/v1/commissions/payments
 * Record commission payment with duplicate payment prevention (unique UTR/Reference)
 */
export const recordCommissionPayment = async (req: Request, res: Response): Promise<void> => {
  try {
    const user = req.user!;

    if (!checkCommissionPrivilege(user)) {
      res.status(403).json({
        success: false,
        message: 'Access denied. You do not have permission to record commission payments.',
      });
      return;
    }

    const {
      agreementId,
      paymentReference,
      amount,
      paymentMethod,
      paymentDate,
      payerName,
      payerRole,
      milestoneTitle,
      invoiceNumber,
      notes,
    } = req.body;

    // Check duplicate payment reference
    const existingPayment = await CommissionPayment.findOne({ paymentReference: paymentReference.trim() });
    if (existingPayment) {
      res.status(409).json({
        success: false,
        message: `Duplicate payment error: A transaction with reference '${paymentReference}' has already been recorded on ${existingPayment.paymentDate.toISOString().split('T')[0]}.`,
      });
      return;
    }

    const agreement = await CommissionAgreement.findById(agreementId);
    if (!agreement) {
      res.status(404).json({ success: false, message: 'Commission agreement not found' });
      return;
    }

    const paymentAmount = Number(amount);
    const amountPaise = Math.round(paymentAmount * 100);

    const payment = await CommissionPayment.create({
      paymentReference: paymentReference.trim(),
      agreement: agreement._id,
      deal: agreement.deal,
      milestoneTitle: milestoneTitle || undefined,
      amount: paymentAmount,
      amountPaise,
      currency: 'INR',
      paymentMethod,
      paymentDate: paymentDate ? new Date(paymentDate) : new Date(),
      payerName: payerName.trim(),
      payerRole: payerRole || 'brand',
      receivedBy: user._id,
      status: 'VERIFIED',
      notes,
      invoiceNumber,
      verifiedBy: user._id,
      verifiedAt: new Date(),
    });

    // Update agreement financial ledger
    agreement.receivedRevenue += paymentAmount;
    agreement.receivedRevenuePaise += amountPaise;
    agreement.pendingCommission = Math.max(0, agreement.expectedCommission - agreement.receivedRevenue);
    agreement.pendingCommissionPaise = Math.round(agreement.pendingCommission * 100);

    // Update milestones paid amounts
    if (milestoneTitle && agreement.milestones.length > 0) {
      const milestone = agreement.milestones.find((m) => m.title === milestoneTitle);
      if (milestone) {
        milestone.paidAmount += paymentAmount;
        milestone.paidAmountPaise += amountPaise;
        if (milestone.paidAmount >= milestone.amount) {
          milestone.status = 'PAID';
        } else {
          milestone.status = 'PARTIALLY_PAID';
        }
      }
    }

    // Auto-complete agreement if full expected revenue collected
    if (agreement.receivedRevenue >= agreement.expectedCommission) {
      agreement.status = 'COMPLETED';
    }

    await agreement.save();

    // Update Deal actualCommissionEarned and paymentStatus
    const deal = await BrokerageDeal.findById(agreement.deal);
    if (deal) {
      deal.actualCommissionEarned = (deal.actualCommissionEarned || 0) + paymentAmount;
      deal.actualCommissionEarnedPaise = Math.round(deal.actualCommissionEarned * 100);
      deal.paymentStatus =
        deal.actualCommissionEarned >= deal.expectedCommission ? 'paid' : 'partially_paid';
      await deal.save();
    }

    // Generate Notification for broker and admin
    await Notification.create({
      recipient: agreement.assignedBroker,
      type: 'commission_payment_received',
      title: 'Commission Payment Verified',
      message: `Verified payment of ₹${paymentAmount.toLocaleString('en-IN')} received for agreement ${agreement.agreementNumber} (Ref: ${payment.paymentReference}).`,
      actionUrl: `/dashboard/brokerage`,
      metadata: { agreementId: agreement._id, paymentId: payment._id, amount: paymentAmount },
    });

    await AuditLog.create({
      actor: user._id,
      actorRole: user.role,
      actorEmail: user.email,
      action: 'COMMISSION_PAYMENT_RECORDED',
      entityType: 'CommissionPayment',
      entityId: payment._id.toString(),
      details: {
        agreementId: agreement._id.toString(),
        paymentReference: payment.paymentReference,
        agreementNumber: agreement.agreementNumber,
        amount: paymentAmount,
        amountPaise,
      },
    });

    res.status(201).json({
      success: true,
      message: 'Commission payment recorded and verified successfully',
      data: payment,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * 6. GET /api/v1/commissions/agreements/:id/statement
 * Generate official commission statement
 */
export const getCommissionStatement = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const user = req.user!;

    if (!checkCommissionPrivilege(user)) {
      res.status(403).json({ success: false, message: 'Access denied.' });
      return;
    }

    const agreement = await CommissionAgreement.findById(id)
      .populate('deal')
      .populate('brand', 'fullName email phone')
      .populate('investor', 'fullName email phone')
      .populate('assignedBroker', 'fullName email phone')
      .populate('franchiseListing', 'brandName slug logoUrl');

    if (!agreement) {
      res.status(404).json({ success: false, message: 'Commission agreement not found' });
      return;
    }

    const brokerIdStr = (agreement.assignedBroker as any)?._id
      ? (agreement.assignedBroker as any)._id.toString()
      : (agreement.assignedBroker as any)?.toString();

    if (user.role === 'broker' && brokerIdStr !== user._id.toString()) {
      res.status(403).json({ success: false, message: 'Forbidden. Access restricted to assigned broker.' });
      return;
    }

    const payments = await CommissionPayment.find({ agreement: agreement._id }).sort({ paymentDate: 1 });

    const statement = {
      statementNumber: `STMT-${agreement.agreementNumber}`,
      generatedAt: new Date().toISOString(),
      agreementNumber: agreement.agreementNumber,
      currency: 'INR',
      dealTitle: (agreement.deal as any)?.dealTitle,
      broker: (agreement.assignedBroker as any)?.fullName,
      payer: agreement.payer,
      summary: {
        totalExpected: agreement.expectedCommission,
        totalReceived: agreement.receivedRevenue,
        pendingBalance: agreement.pendingCommission,
        totalExpectedPaise: agreement.expectedCommissionPaise,
        totalReceivedPaise: agreement.receivedRevenuePaise,
        pendingBalancePaise: agreement.pendingCommissionPaise,
      },
      financialSummary: {
        baseAmount: agreement.baseAmount,
        baseAmountPaise: agreement.baseAmountPaise,
        calculationBasis: agreement.calculationBasis,
        commissionType: agreement.commissionType,
        commissionRate: agreement.commissionRate,
        expectedCommission: agreement.expectedCommission,
        expectedCommissionPaise: agreement.expectedCommissionPaise,
        receivedRevenue: agreement.receivedRevenue,
        receivedRevenuePaise: agreement.receivedRevenuePaise,
        pendingCommission: agreement.pendingCommission,
        pendingCommissionPaise: agreement.pendingCommissionPaise,
        paymentStatus: agreement.status,
      },
      milestones: agreement.milestones,
      payments: payments.map((p) => ({
        paymentReference: p.paymentReference,
        paymentDate: p.paymentDate,
        paymentMethod: p.paymentMethod,
        amount: p.amount,
        amountPaise: p.amountPaise,
        payerName: p.payerName,
        status: p.status,
        notes: p.notes,
      })),
      verifiedPayments: payments.map((p) => ({
        paymentReference: p.paymentReference,
        paymentDate: p.paymentDate,
        paymentMethod: p.paymentMethod,
        amount: p.amount,
        amountPaise: p.amountPaise,
        payerName: p.payerName,
        status: p.status,
        notes: p.notes,
      })),
    };

    res.json({
      success: true,
      data: statement,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};
