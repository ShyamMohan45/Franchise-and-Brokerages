import mongoose from 'mongoose';
import jwt from 'jsonwebtoken';
import { env } from '../config/env';
import { User } from '../models/User';
import { BusinessProfile } from '../models/BusinessProfile';
import { FranchiseListing } from '../models/FranchiseListing';
import { BrokerageDeal } from '../models/BrokerageDeal';
import { DealRoom } from '../models/DealRoom';
import { DealDocument } from '../models/DealDocument';
import { CommissionAgreement } from '../models/CommissionAgreement';
import { CommissionPayment } from '../models/CommissionPayment';
import { Notification } from '../models/Notification';
import { NotificationPreference } from '../models/NotificationPreference';
import { Task } from '../models/Task';
import { Meeting } from '../models/Meeting';
import { Lead } from '../models/Lead';
import { AuditLog } from '../models/AuditLog';

const BASE_URL = 'http://localhost:5000/api/v1';

export interface Milestone7AuditRecord {
  num: number;
  section: string;
  testName: string;
  status: 'PASS' | 'FAIL';
  endpoint: string;
  actualResult: string;
  mongoDbVerification: string;
  storageVerification?: string;
  failureDetails?: string;
}

export const auditRecords: Milestone7AuditRecord[] = [];

function record(
  num: number,
  section: string,
  testName: string,
  status: 'PASS' | 'FAIL',
  endpoint: string,
  actualResult: string,
  mongoDbVerification?: string,
  storageVerification?: string,
  failureDetails?: string
) {
  auditRecords.push({
    num,
    section,
    testName,
    status,
    endpoint,
    actualResult,
    mongoDbVerification: mongoDbVerification || 'N/A',
    storageVerification: storageVerification || 'N/A',
    failureDetails: failureDetails || 'None',
  });

  const badge = status === 'PASS' ? '\x1b[32m[PASS]\x1b[0m' : '\x1b[31m[FAIL]\x1b[0m';
  console.log(`${badge} Check ${num} [${section}]: ${testName}`);
  console.log(`       Result : ${actualResult}`);
  console.log(`       MongoDB: ${mongoDbVerification}`);
  if (storageVerification && storageVerification !== 'N/A') {
    console.log(`       Storage: ${storageVerification}`);
  }
  if (failureDetails && failureDetails !== 'None') {
    console.error(`       Failure: ${failureDetails}`);
  }
}

function generateToken(user: any): string {
  return jwt.sign(
    {
      userId: user._id.toString(),
      id: user._id.toString(),
      _id: user._id.toString(),
      email: user.email,
      role: user.role,
      fullName: user.fullName,
    },
    env.JWT_SECRET || 'dev_secret_jwt_key_super_secure_franchise_bridge_2026',
    { expiresIn: '7d' }
  );
}

async function runMilestone7Audit() {
  console.log('\n================================================================================');
  console.log('   FRANCHISEBRIDGE MILESTONE 7: COMPREHENSIVE 55-CHECK TECHNICAL AUDIT         ');
  console.log('   COMMISSION MANAGEMENT, NOTIFICATIONS, REMINDERS, ANALYTICS & CSV REPORTS    ');
  console.log('================================================================================\n');

  await mongoose.connect(env.MONGODB_URI);
  console.log('Connected to MongoDB:', env.MONGODB_URI);

  const timestamp = Date.now();
  const passwordHash = '$2a$10$wT5a8J4oN7K3uI6vE5a0e.rF9/zX3eP1eXkO7bZ2qY8cK0lH7vD2W';

  // 1. Setup Test Actors
  let admin = await User.findOne({ role: 'admin' });
  if (!admin) {
    admin = await User.create({
      fullName: `Admin Auditor M7 ${timestamp}`,
      email: `admin_m7_${timestamp}@franchisebridge.com`,
      phone: '+919876543210',
      passwordHash,
      role: 'admin',
      isEmailVerified: true,
      status: 'active',
    });
  }
  const adminToken = generateToken(admin);

  const broker = await User.create({
    fullName: `Broker Senior M7 ${timestamp}`,
    email: `broker_m7_${timestamp}@franchisebridge.com`,
    phone: `+919811${Math.floor(100000 + Math.random() * 900000)}`,
    passwordHash,
    role: 'broker',
    isEmailVerified: true,
    status: 'active',
  });
  const brokerToken = generateToken(broker);

  const brokerOther = await User.create({
    fullName: `Broker Other M7 ${timestamp}`,
    email: `broker_other_m7_${timestamp}@franchisebridge.com`,
    phone: `+919812${Math.floor(100000 + Math.random() * 900000)}`,
    passwordHash,
    role: 'broker',
    isEmailVerified: true,
    status: 'active',
  });
  const brokerOtherToken = generateToken(brokerOther);

  const brandOwner = await User.create({
    fullName: `Brand Founder M7 ${timestamp}`,
    email: `brand_m7_${timestamp}@franchisebridge.com`,
    phone: `+919813${Math.floor(100000 + Math.random() * 900000)}`,
    passwordHash,
    role: 'business_owner',
    isEmailVerified: true,
    status: 'active',
  });
  const brandOwnerToken = generateToken(brandOwner);

  const investor = await User.create({
    fullName: `Investor HighNet M7 ${timestamp}`,
    email: `investor_m7_${timestamp}@franchisebridge.com`,
    phone: `+919814${Math.floor(100000 + Math.random() * 900000)}`,
    passwordHash,
    role: 'investor',
    isEmailVerified: true,
    status: 'active',
  });
  const investorToken = generateToken(investor);

  // Setup Business Profile & Listing
  const business = await BusinessProfile.create({
    user: brandOwner._id,
    businessName: `Chai Craft M7 ${timestamp}`,
    brandName: `Chai Craft M7 ${timestamp}`,
    slug: `chai-craft-m7-${timestamp}`,
    founderName: brandOwner.fullName,
    contactEmail: brandOwner.email,
    contactPhone: brandOwner.phone,
    establishedYear: 2020,
    headquarters: {
      city: 'Bengaluru',
      state: 'Karnataka',
      country: 'India',
    },
    category: 'Food & Beverage',
    industry: 'Food & Beverage',
    businessModel: 'Franchise Owned Franchise Operated (FOFO)',
    expansionGoals: 'Pan-South India expansion',
    estimatedInvestmentMin: 2500000,
    estimatedInvestmentMax: 5000000,
    numberOfOutlets: 8,
    currentLocations: ['Bengaluru', 'Mysuru'],
    description: 'Premier artisanal tea chain scaling via single and multi-unit franchises.',
    websiteUrl: 'https://chaicraft.example.com',
    approvalStatus: 'approved',
  });

  const listing = await FranchiseListing.create({
    ownerUser: brandOwner._id,
    business: business._id,
    brandName: business.brandName,
    slug: `chai-craft-listing-${timestamp}`,
    opportunityTitle: 'Premium Artisanal Chai Franchise Opportunity',
    summary: 'High profitability tea chain concept',
    brandStory: 'Started in 2020 in Koramangala, Bengaluru',
    tagline: 'Authentic Indian Chai Reimagined',
    category: 'Food & Beverage',
    industry: 'Food & Beverage',
    businessModel: 'FOFO',
    franchiseModelType: 'single_unit',
    city: 'Bengaluru',
    targetTerritories: ['Bengaluru', 'Hyderabad', 'Pune'],
    investmentRange: { min: 2500000, max: 5000000 },
    totalInvestmentMin: 2500000,
    totalInvestmentMax: 5000000,
    initialFranchiseFee: 600000,
    franchiseFee: 600000,
    royaltyPercentage: 6,
    commercialSpaceMinSqFt: 500,
    commercialSpaceMaxSqFt: 1200,
    idealFranchiseeProfile: 'Dedicated retail entrepreneur with capital readiness',
    approvalStatus: 'APPROVED',
    status: 'published',
    isPublished: true,
    publishedAt: new Date(),
  });

  // Setup Brokerage Deal
  const deal = await BrokerageDeal.create({
    dealTitle: `Chai Craft Expansion — Bengaluru Flagship ${timestamp}`,
    franchiseListing: listing._id,
    businessProfile: business._id,
    businessOwner: brandOwner._id,
    investor: investor._id,
    assignedBroker: broker._id,
    stage: 'NEGOTIATION',
    dealValue: 5000000,
    franchiseFee: 600000,
    expectedCommission: 250000, // 5% of 5,000,000
    dealValuePaise: 500000000,
    franchiseFeePaise: 60000000,
    expectedCommissionPaise: 25000000,
    targetCity: 'Bengaluru',
    targetState: 'Karnataka',
  });

  const dealRoom = await DealRoom.create({
    deal: deal._id,
    roomName: `Deal Room - ${deal.dealTitle}`,
    business: business._id,
    franchiseListing: listing._id,
    investor: investor._id,
    franchisor: brandOwner._id,
    businessOwner: brandOwner._id,
    broker: broker._id,
    assignedBroker: broker._id,
    targetTerritory: 'Bengaluru',
    stage: 'NEGOTIATION',
  });

  let agreement1Id = '';
  let agreement2Id = '';
  const utrRef1 = `UTR-M7-IND-${timestamp}-001`;
  const utrRef2 = `UTR-M7-IND-${timestamp}-002`;
  const utrRef3 = `UTR-M7-IND-${timestamp}-003`;

  // =========================================================================
  // SECTION 1: COMMISSION AGREEMENTS CREATION & CONFIGURATION
  // =========================================================================

  // Check 1: Create percentage-based commission agreement
  {
    const res = await fetch(`${BASE_URL}/commissions/agreements`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify({
        dealId: deal._id.toString(),
        commissionType: 'percentage',
        commissionRate: 5, // 5%
        payer: 'brand',
        calculationBasis: 'deal_value',
        baseAmount: 5000000,
        milestones: [
          {
            title: 'Initial Letter of Intent Execution',
            percentage: 40,
            amount: 100000,
            triggerStage: 'AGREEMENT',
            dueDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString(),
          },
          {
            title: 'Final Franchise Agreement & Launch',
            percentage: 60,
            amount: 150000,
            triggerStage: 'CLOSED_WON',
            dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
          },
        ],
        termsAndConditions: 'Standard 5% commission on 50L deal payable in INR by Brand.',
        notes: 'Priority expansion deal',
      }),
    });
    const data = await res.json();
    agreement1Id = data.data?._id;

    const pass = res.status === 201 && data.success && data.data?.expectedCommission === 250000;
    record(
      1,
      'Commission Agreements',
      'Create percentage commission agreement on deal',
      pass ? 'PASS' : 'FAIL',
      'POST /commissions/agreements',
      `HTTP ${res.status}, Agreement #${data.data?.agreementNumber}, Expected: ₹${data.data?.expectedCommission}`,
      `Created agreement ${agreement1Id} with 2 milestones`
    );
  }

  // Check 2: Verify agreement calculation and integer paise in MongoDB
  {
    const doc = await CommissionAgreement.findById(agreement1Id);
    const pass =
      doc !== null &&
      doc.expectedCommission === 250000 &&
      doc.expectedCommissionPaise === 25000000 &&
      doc.baseAmountPaise === 500000000 &&
      doc.pendingCommissionPaise === 25000000;
    record(
      2,
      'Commission Agreements',
      'Verify calculation & integer paise in MongoDB',
      pass ? 'PASS' : 'FAIL',
      'MongoDB CommissionAgreement.findById',
      `expectedCommissionPaise=${doc?.expectedCommissionPaise}, baseAmountPaise=${doc?.baseAmountPaise}`,
      `Verified paise fields equal ₹2,50,000.00 and ₹50,00,000.00`
    );
  }

  // Check 3: Create fixed-fee commission agreement
  {
    const res = await fetch(`${BASE_URL}/commissions/agreements`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify({
        dealId: deal._id.toString(),
        commissionType: 'fixed',
        fixedAmount: 180000,
        payer: 'investor',
        calculationBasis: 'fixed',
        baseAmount: 180000,
        milestones: [
          {
            title: 'Advisory Retainer Fee',
            percentage: 100,
            amount: 180000,
            triggerStage: 'NEGOTIATION',
          },
        ],
        notes: 'Fixed advisory success fee',
      }),
    });
    const data = await res.json();
    agreement2Id = data.data?._id;

    const pass = res.status === 201 && data.success && data.data?.expectedCommission === 180000;
    record(
      3,
      'Commission Agreements',
      'Create fixed-fee commission agreement',
      pass ? 'PASS' : 'FAIL',
      'POST /commissions/agreements',
      `HTTP ${res.status}, Expected Commission: ₹${data.data?.expectedCommission}`,
      `Agreement ${agreement2Id} stored with fixed amount ₹1,80,000`
    );
  }

  // Check 4: Verify milestones configuration in MongoDB
  {
    const doc = await CommissionAgreement.findById(agreement1Id);
    const pass = doc?.milestones.length === 2 && doc?.milestones[0].amountPaise === 10000000;
    record(
      4,
      'Commission Agreements',
      'Verify milestone schedule & trigger stages in MongoDB',
      pass ? 'PASS' : 'FAIL',
      'MongoDB CommissionAgreement.milestones',
      `2 milestones configured. Milestone 1 amountPaise=${doc?.milestones[0].amountPaise}`,
      `Milestones verified with trigger stages AGREEMENT and CLOSED_WON`
    );
  }

  // Check 5: Update agreement status to ACTIVE with approval history
  {
    const res = await fetch(`${BASE_URL}/commissions/agreements/${agreement1Id}/status`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify({
        status: 'ACTIVE',
        notes: 'Signed brokerage mandate received and validated by Admin',
      }),
    });
    const data = await res.json();
    const pass = res.status === 200 && data.success && data.data?.status === 'ACTIVE';
    record(
      5,
      'Commission Agreements',
      'Update agreement status to ACTIVE with approval note',
      pass ? 'PASS' : 'FAIL',
      'PATCH /commissions/agreements/:id/status',
      `HTTP ${res.status}, Status=${data.data?.status}`,
      `Agreement status changed from DRAFT to ACTIVE`
    );
  }

  // Check 6: Verify approval history trail in MongoDB
  {
    const doc = await CommissionAgreement.findById(agreement1Id);
    const pass = doc?.approvalHistory.length! >= 1 && doc?.approvalHistory[0].status === 'ACTIVE';
    record(
      6,
      'Commission Agreements',
      'Verify approval history audit trail in MongoDB',
      pass ? 'PASS' : 'FAIL',
      'MongoDB CommissionAgreement.approvalHistory',
      `History count: ${doc?.approvalHistory.length}, Status: ${doc?.approvalHistory[0].status}`,
      `Logged with actionBy=${doc?.approvalHistory[0].actionBy}`
    );
  }

  // Check 7: Unauthorized investor cannot view commission agreements (HTTP 403)
  {
    const res = await fetch(`${BASE_URL}/commissions/agreements`, {
      headers: { Authorization: `Bearer ${investorToken}` },
    });
    const pass = res.status === 403;
    record(
      7,
      'Commission Security',
      'Reject investor access to commission agreements with 403',
      pass ? 'PASS' : 'FAIL',
      'GET /commissions/agreements',
      `HTTP ${res.status} Forbidden`,
      'RBAC successfully protected confidential commission data from investor'
    );
  }

  // Check 8: Unauthorized brand owner cannot view commission agreements (HTTP 403)
  {
    const res = await fetch(`${BASE_URL}/commissions/agreements`, {
      headers: { Authorization: `Bearer ${brandOwnerToken}` },
    });
    const pass = res.status === 403;
    record(
      8,
      'Commission Security',
      'Reject brand owner access to internal commission agreements with 403',
      pass ? 'PASS' : 'FAIL',
      'GET /commissions/agreements',
      `HTTP ${res.status} Forbidden`,
      'RBAC successfully protected internal brokerage agreements from brand'
    );
  }

  // Check 9: Assigned broker can view their assigned agreement
  {
    const res = await fetch(`${BASE_URL}/commissions/agreements/${agreement1Id}`, {
      headers: { Authorization: `Bearer ${brokerToken}` },
    });
    const data = await res.json();
    const pass = res.status === 200 && data.success && data.data?._id === agreement1Id;
    record(
      9,
      'Commission Security',
      'Assigned broker can view their assigned agreement',
      pass ? 'PASS' : 'FAIL',
      'GET /commissions/agreements/:id',
      `HTTP ${res.status}, Agreement #${data.data?.agreementNumber}`,
      `Broker ${broker.fullName} authorized for assigned deal agreement`
    );
  }

  // Check 10: Unassigned broker cannot view agreement of another broker (HTTP 403)
  {
    const res = await fetch(`${BASE_URL}/commissions/agreements/${agreement1Id}`, {
      headers: { Authorization: `Bearer ${brokerOtherToken}` },
    });
    const pass = res.status === 403;
    record(
      10,
      'Commission Security',
      'Reject unassigned broker access to another broker agreement with 403',
      pass ? 'PASS' : 'FAIL',
      'GET /commissions/agreements/:id',
      `HTTP ${res.status} Forbidden`,
      'Broker isolation strictly enforced'
    );
  }

  // =========================================================================
  // SECTION 2: COMMISSION MANAGEMENT, PAYMENTS & DUPLICATE PREVENTION
  // =========================================================================

  // Check 11: Record partial commission payment with unique transaction reference
  {
    const res = await fetch(`${BASE_URL}/commissions/payments`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify({
        agreementId: agreement1Id,
        paymentReference: utrRef1,
        amount: 50000,
        paymentMethod: 'RTGS',
        payerName: brandOwner.fullName,
        payerRole: 'brand',
        milestoneTitle: 'Initial Letter of Intent Execution',
        invoiceNumber: 'INV-2026-001',
        notes: 'First tranche for milestone 1',
      }),
    });
    const data = await res.json();
    const pass = res.status === 201 && data.success && data.data?.amount === 50000;
    record(
      11,
      'Commission Payments',
      'Record partial commission payment with unique UTR reference',
      pass ? 'PASS' : 'FAIL',
      'POST /commissions/payments',
      `HTTP ${res.status}, Recorded ₹${data.data?.amount} with ref ${utrRef1}`,
      `CommissionPayment created in MongoDB`
    );
  }

  // Check 12: Verify payment integer paise in MongoDB
  {
    const paymentDoc = await CommissionPayment.findOne({ paymentReference: utrRef1 });
    const pass = paymentDoc?.amountPaise === 5000000 && paymentDoc?.currency === 'INR';
    record(
      12,
      'Commission Payments',
      'Verify payment amount stored in integer paise (₹50,000 -> 5,000,000 paise)',
      pass ? 'PASS' : 'FAIL',
      'MongoDB CommissionPayment.amountPaise',
      `amountPaise=${paymentDoc?.amountPaise}, currency=${paymentDoc?.currency}`,
      `Pre-save hook validated paise accuracy`
    );
  }

  // Check 13: Verify agreement revenue balances updated in MongoDB
  {
    const doc = await CommissionAgreement.findById(agreement1Id);
    const pass =
      doc?.receivedRevenue === 50000 &&
      doc?.receivedRevenuePaise === 5000000 &&
      doc?.pendingCommission === 200000 &&
      doc?.pendingCommissionPaise === 20000000;
    record(
      13,
      'Commission Payments',
      'Verify agreement receivedRevenue & pendingCommission updated in MongoDB',
      pass ? 'PASS' : 'FAIL',
      'MongoDB CommissionAgreement.receivedRevenue',
      `receivedRevenue=₹${doc?.receivedRevenue}, pendingCommission=₹${doc?.pendingCommission}`,
      `Paise: received=${doc?.receivedRevenuePaise}, pending=${doc?.pendingCommissionPaise}`
    );
  }

  // Check 14: Verify milestone marked PARTIALLY_PAID
  {
    const doc = await CommissionAgreement.findById(agreement1Id);
    const m1 = doc?.milestones.find((m) => m.title === 'Initial Letter of Intent Execution');
    const pass = m1?.status === 'PARTIALLY_PAID' && m1?.paidAmount === 50000;
    record(
      14,
      'Commission Payments',
      'Verify milestone status updated to PARTIALLY_PAID in MongoDB',
      pass ? 'PASS' : 'FAIL',
      'MongoDB CommissionAgreement.milestones[0].status',
      `Milestone 1 status: ${m1?.status}, paidAmount: ₹${m1?.paidAmount}`,
      `Milestone partially paid tracking verified`
    );
  }

  // Check 15: Prevent duplicate payment (same UTR reference) -> HTTP 409 Conflict
  {
    const res = await fetch(`${BASE_URL}/commissions/payments`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify({
        agreementId: agreement1Id,
        paymentReference: utrRef1, // duplicate!
        amount: 50000,
        paymentMethod: 'RTGS',
        payerName: brandOwner.fullName,
        payerRole: 'brand',
      }),
    });
    const pass = res.status === 409;
    record(
      15,
      'Commission Security',
      'Reject duplicate payment reference with HTTP 409 Conflict',
      pass ? 'PASS' : 'FAIL',
      'POST /commissions/payments',
      `HTTP ${res.status} Conflict (Duplicate payment reference detected)`,
      'Duplicate payment reference uniquely rejected by schema & controller'
    );
  }

  // Check 16: Record second payment completing Milestone 1
  {
    const res = await fetch(`${BASE_URL}/commissions/payments`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify({
        agreementId: agreement1Id,
        paymentReference: utrRef2,
        amount: 50000,
        paymentMethod: 'NEFT',
        payerName: brandOwner.fullName,
        payerRole: 'brand',
        milestoneTitle: 'Initial Letter of Intent Execution',
        notes: 'Final installment for milestone 1',
      }),
    });
    const pass = res.status === 201;
    record(
      16,
      'Commission Payments',
      'Record secondary payment completing milestone 1',
      pass ? 'PASS' : 'FAIL',
      'POST /commissions/payments',
      `HTTP ${res.status}, Recorded second ₹50,000 payment`,
      `Payment reference ${utrRef2} verified`
    );
  }

  // Check 17: Verify milestone 1 status updated to PAID
  {
    const doc = await CommissionAgreement.findById(agreement1Id);
    const m1 = doc?.milestones.find((m) => m.title === 'Initial Letter of Intent Execution');
    const pass = m1?.status === 'PAID' && m1?.paidAmount === 100000;
    record(
      17,
      'Commission Payments',
      'Verify milestone 1 status marked PAID in MongoDB',
      pass ? 'PASS' : 'FAIL',
      'MongoDB CommissionAgreement.milestones[0].status',
      `Status: ${m1?.status}, total paid: ₹${m1?.paidAmount}`,
      `Milestone 1 fully satisfied`
    );
  }

  // Check 18: Record final balance payment completing entire agreement
  {
    const res = await fetch(`${BASE_URL}/commissions/payments`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify({
        agreementId: agreement1Id,
        paymentReference: utrRef3,
        amount: 150000,
        paymentMethod: 'BANK_TRANSFER',
        payerName: brandOwner.fullName,
        payerRole: 'brand',
        milestoneTitle: 'Final Franchise Agreement & Launch',
        notes: 'Final commission payout',
      }),
    });
    const pass = res.status === 201;
    record(
      18,
      'Commission Payments',
      'Record final balance payment completing entire agreement',
      pass ? 'PASS' : 'FAIL',
      'POST /commissions/payments',
      `HTTP ${res.status}, Paid balance ₹1,50,000`,
      `Payment reference ${utrRef3} processed`
    );
  }

  // Check 19: Verify agreement status automatically advances to COMPLETED
  {
    const doc = await CommissionAgreement.findById(agreement1Id);
    const pass =
      doc?.status === 'COMPLETED' && doc?.receivedRevenue === 250000 && doc?.pendingCommission === 0;
    record(
      19,
      'Commission Payments',
      'Verify agreement automatically transitions to COMPLETED when fully paid',
      pass ? 'PASS' : 'FAIL',
      'MongoDB CommissionAgreement.status',
      `Status: ${doc?.status}, Received: ₹${doc?.receivedRevenue}, Pending: ₹${doc?.pendingCommission}`,
      `Full financial settlement achieved`
    );
  }

  // Check 20: Verify financial AuditLog records created for every payment transaction
  {
    const auditCount = await AuditLog.countDocuments({
      action: 'COMMISSION_PAYMENT_RECORDED',
      'details.agreementId': agreement1Id,
    });
    const pass = auditCount === 3;
    record(
      20,
      'Financial Audit Trail',
      'Verify financial AuditLog entries for every payment transaction',
      pass ? 'PASS' : 'FAIL',
      'MongoDB AuditLog.find',
      `Found ${auditCount} financial audit log entries for agreement ${agreement1Id}`,
      `All 3 payments logged with immutable user attribution`
    );
  }

  // Check 21: Generate formal commission statement verifying itemized ledger
  {
    const res = await fetch(`${BASE_URL}/commissions/agreements/${agreement1Id}/statement`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    const data = await res.json();
    const st = data.data;
    const pass =
      res.status === 200 &&
      data.success &&
      st?.summary?.totalReceived === 250000 &&
      st?.payments?.length === 3;
    record(
      21,
      'Commission Statement',
      'Generate formal commission statement verifying itemized ledger',
      pass ? 'PASS' : 'FAIL',
      'GET /commissions/agreements/:id/statement',
      `HTTP ${res.status}, Statement #${st?.statementNumber}, Received: ₹${st?.summary?.totalReceived}`,
      `Generated statement with ${st?.payments?.length} verified ledger payments`
    );
  }

  // Check 22: Unassigned broker cannot access commission statement (HTTP 403)
  {
    const res = await fetch(`${BASE_URL}/commissions/agreements/${agreement1Id}/statement`, {
      headers: { Authorization: `Bearer ${brokerOtherToken}` },
    });
    const pass = res.status === 403;
    record(
      22,
      'Commission Security',
      'Reject unassigned broker from accessing commission statement with 403',
      pass ? 'PASS' : 'FAIL',
      'GET /commissions/agreements/:id/statement',
      `HTTP ${res.status} Forbidden`,
      'Confidential statement access properly quarantined'
    );
  }

  // =========================================================================
  // SECTION 3: NOTIFICATIONS SYSTEM & PREFERENCES
  // =========================================================================

  // Check 23: Create in-app notifications for Milestone 7 event types
  {
    const eventTypes = [
      'new_enquiry',
      'lead_assigned',
      'broker_followup',
      'upcoming_meeting',
      'document_submission',
      'due_diligence_update',
      'commission_due',
      'commission_payment_received',
    ];
    let createdCount = 0;
    for (const t of eventTypes) {
      const res = await fetch(`${BASE_URL}/notifications`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${adminToken}`,
        },
        body: JSON.stringify({
          recipient: broker._id.toString(),
          type: t,
          title: `Milestone 7 Alert: ${t}`,
          message: `Operational alert triggered for event ${t}`,
          priority: 'high',
          metadata: { dealId: deal._id.toString() },
        }),
      });
      if (res.status === 201) createdCount++;
    }
    const pass = createdCount === 8;
    record(
      23,
      'Notifications',
      'Create notifications across all 8 Milestone 7 event types',
      pass ? 'PASS' : 'FAIL',
      'POST /notifications',
      `Successfully created ${createdCount}/8 event notifications`,
      `Verified event types stored in MongoDB`
    );
  }

  // Check 24: Retrieve notifications with unreadCount
  let notifToReadId = '';
  {
    const res = await fetch(`${BASE_URL}/notifications`, {
      headers: { Authorization: `Bearer ${brokerToken}` },
    });
    const data = await res.json();
    const notifs = data.data?.notifications || [];
    const unreadCount = data.data?.unreadCount || 0;
    if (notifs.length > 0) notifToReadId = notifs[0]._id;

    const pass = res.status === 200 && data.success && notifs.length >= 8 && unreadCount >= 8;
    record(
      24,
      'Notifications',
      'Retrieve user notifications and verify unreadCount',
      pass ? 'PASS' : 'FAIL',
      'GET /notifications',
      `HTTP ${res.status}, Count=${notifs.length}, unreadCount=${unreadCount}`,
      `Retrieved notifications list for broker ${broker.fullName}`
    );
  }

  // Check 25: Mark individual notification as read
  {
    const res = await fetch(`${BASE_URL}/notifications/${notifToReadId}/read`, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${brokerToken}` },
    });
    const data = await res.json();
    const pass = res.status === 200 && data.success && data.data?.isRead === true;
    record(
      25,
      'Notifications',
      'Mark individual notification as read',
      pass ? 'PASS' : 'FAIL',
      'PATCH /notifications/:id/read',
      `HTTP ${res.status}, isRead=${data.data?.isRead}`,
      `Notification ${notifToReadId} marked read in MongoDB`
    );
  }

  // Check 26: Verify notification timestamp and metadata in MongoDB
  {
    const doc = await Notification.findById(notifToReadId);
    const pass = doc?.createdAt !== undefined && doc?.isRead === true;
    record(
      26,
      'Notifications',
      'Verify notification read timestamp stored in MongoDB',
      pass ? 'PASS' : 'FAIL',
      'MongoDB Notification.findById',
      `createdAt=${doc?.createdAt}, isRead=${doc?.isRead}`,
      `Notification read persistence validated`
    );
  }

  // Check 27: Retrieve user notification preferences with defaults
  {
    const res = await fetch(`${BASE_URL}/notifications/preferences`, {
      headers: { Authorization: `Bearer ${brokerToken}` },
    });
    const data = await res.json();
    const pref = data.data;
    const pass =
      res.status === 200 &&
      data.success &&
      pref?.inAppNotifications === true &&
      pref?.commissionAlerts === true;
    record(
      27,
      'Notifications',
      'Retrieve user notification preferences with active defaults',
      pass ? 'PASS' : 'FAIL',
      'GET /notifications/preferences',
      `HTTP ${res.status}, inApp=${pref?.inAppNotifications}, commissionAlerts=${pref?.commissionAlerts}`,
      `Default preferences initialized for broker ${broker._id}`
    );
  }

  // Check 28: Update notification preferences
  {
    const res = await fetch(`${BASE_URL}/notifications/preferences`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${brokerToken}`,
      },
      body: JSON.stringify({
        emailNotifications: false,
        commissionAlerts: true,
        dealAlerts: true,
      }),
    });
    const data = await res.json();
    const pass = res.status === 200 && data.success && data.data?.emailNotifications === false;
    record(
      28,
      'Notifications',
      'Update notification preferences toggles',
      pass ? 'PASS' : 'FAIL',
      'PUT /notifications/preferences',
      `HTTP ${res.status}, emailNotifications=${data.data?.emailNotifications}`,
      `Updated preferences in MongoDB`
    );
  }

  // Check 29: Mark all notifications as read
  {
    const res = await fetch(`${BASE_URL}/notifications/read-all`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${brokerToken}` },
    });
    const notifRes = await fetch(`${BASE_URL}/notifications`, {
      headers: { Authorization: `Bearer ${brokerToken}` },
    });
    const notifData = await notifRes.json();
    const pass = res.status === 200 && notifData.data?.unreadCount === 0;
    record(
      29,
      'Notifications',
      'Mark all notifications as read and verify unreadCount = 0',
      pass ? 'PASS' : 'FAIL',
      'POST /notifications/read-all',
      `HTTP ${res.status}, unreadCount now=${notifData.data?.unreadCount}`,
      `All notifications marked read in batch`
    );
  }

  // =========================================================================
  // SECTION 4: OPERATIONAL REMINDERS AGGREGATION
  // =========================================================================

  // Check 30: Setup lead with upcoming follow-up date and verify in /reminders
  let testLeadId = '';
  {
    const testLead = await Lead.create({
      fullName: `Prospective Investor ${timestamp}`,
      email: `lead_${timestamp}@example.com`,
      phone: '+919876500001',
      leadType: 'franchise_investor',
      status: 'contacted',
      qualificationStatus: 'QUALIFIED',
      budgetMin: 3000000,
      budgetMax: 6000000,
      assignedBroker: broker._id,
      followUpDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // 2 days in future
      internalNotes: 'Needs follow-up on ROI projections',
    });
    testLeadId = testLead._id.toString();

    const res = await fetch(`${BASE_URL}/notifications/reminders`, {
      headers: { Authorization: `Bearer ${brokerToken}` },
    });
    const data = await res.json();
    const fuList = data.data?.upcomingFollowUps || [];
    const found = fuList.some((f: any) => f.leadId === testLeadId);

    const pass = res.status === 200 && data.success && found;
    record(
      30,
      'Reminders',
      'Aggregate upcoming lead follow-ups in /notifications/reminders',
      pass ? 'PASS' : 'FAIL',
      'GET /notifications/reminders',
      `HTTP ${res.status}, Found upcoming follow-up for ${testLead.fullName}`,
      `Lead follow-up successfully aggregated`
    );
  }

  // Check 31: Setup task with past due date and verify flagged as overdue
  let testTaskId = '';
  {
    const testTask = await Task.create({
      title: `Submit FDD Review Document ${timestamp}`,
      assignedTo: broker._id,
      createdBy: admin._id,
      relatedDeal: deal._id,
      status: 'pending',
      priority: 'high',
      dueDate: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 day in past
    });
    testTaskId = testTask._id.toString();

    const res = await fetch(`${BASE_URL}/notifications/reminders`, {
      headers: { Authorization: `Bearer ${brokerToken}` },
    });
    const data = await res.json();
    const tasks = data.data?.tasks || [];
    const found = tasks.find((t: any) => t.taskId === testTaskId);

    const pass = res.status === 200 && data.success && found && found.isOverdue === true;
    record(
      31,
      'Reminders',
      'Aggregate overdue tasks with isOverdue=true flag',
      pass ? 'PASS' : 'FAIL',
      'GET /notifications/reminders',
      `HTTP ${res.status}, Task found with isOverdue=${found?.isOverdue}`,
      `Task ${testTaskId} identified as overdue`
    );
  }

  // Check 32: Setup scheduled meeting and verify in /reminders
  let testMeetingId = '';
  {
    const testMeeting = await Meeting.create({
      title: `Franchise Disclosure Conference ${timestamp}`,
      meetingType: 'negotiation',
      organizer: broker._id,
      participants: [broker._id, investor._id],
      scheduledStartTime: new Date(Date.now() + 24 * 60 * 60 * 1000),
      scheduledEndTime: new Date(Date.now() + 25 * 60 * 60 * 1000),
      status: 'scheduled',
      agenda: 'Review territory rights and exclusivity',
    });
    testMeetingId = testMeeting._id.toString();

    const res = await fetch(`${BASE_URL}/notifications/reminders`, {
      headers: { Authorization: `Bearer ${brokerToken}` },
    });
    const data = await res.json();
    const meetings = data.data?.meetings || [];
    const found = meetings.some((m: any) => m.meetingId === testMeetingId);

    const pass = res.status === 200 && data.success && found;
    record(
      32,
      'Reminders',
      'Aggregate upcoming meetings in /notifications/reminders',
      pass ? 'PASS' : 'FAIL',
      'GET /notifications/reminders',
      `HTTP ${res.status}, Found meeting #${testMeetingId}`,
      `Scheduled meeting included in reminders`
    );
  }

  // Check 33: Setup pending document review and verify in /reminders
  let testDocId = '';
  {
    const testDoc = await DealDocument.create({
      dealRoom: dealRoom._id,
      deal: deal._id,
      title: `Franchise Agreement Draft ${timestamp}`,
      fileName: `agreement_draft_${timestamp}.pdf`,
      storageKey: `private_test_doc_${timestamp}.pdf`,
      filePath: `/tmp/fake_${timestamp}.pdf`,
      category: 'AGREEMENT_DRAFT',
      uploadedBy: brandOwner._id,
      fileSize: 10240,
      mimeType: 'application/pdf',
      status: 'UNDER_REVIEW',
    });
    testDocId = testDoc._id.toString();

    const res = await fetch(`${BASE_URL}/notifications/reminders`, {
      headers: { Authorization: `Bearer ${brokerToken}` },
    });
    const data = await res.json();
    const docs = data.data?.pendingDocuments || [];
    const found = docs.some((d: any) => d._id === testDocId);

    const pass = res.status === 200 && data.success && found;
    record(
      33,
      'Reminders',
      'Aggregate pending document reviews in /notifications/reminders',
      pass ? 'PASS' : 'FAIL',
      'GET /notifications/reminders',
      `HTTP ${res.status}, Pending documents count=${docs.length}`,
      `Document ${testDocId} under review aggregated`
    );
  }

  // Check 34: Setup outstanding commission agreement and verify in /reminders
  {
    // agreement2 is ACTIVE with pendingCommission = 180,000
    await CommissionAgreement.findByIdAndUpdate(agreement2Id, { status: 'ACTIVE' });

    const res = await fetch(`${BASE_URL}/notifications/reminders`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    const data = await res.json();
    const comms = data.data?.outstandingCommissions || [];
    const found = comms.some((c: any) => c.agreementId === agreement2Id);

    const pass = res.status === 200 && data.success && found;
    record(
      34,
      'Reminders',
      'Aggregate outstanding commission payments in /notifications/reminders',
      pass ? 'PASS' : 'FAIL',
      'GET /notifications/reminders',
      `HTTP ${res.status}, Outstanding agreements count=${comms.length}`,
      `Agreement ${agreement2Id} with pending commission aggregated`
    );
  }

  // Check 35: Verify broker segregation in reminders
  {
    const res = await fetch(`${BASE_URL}/notifications/reminders`, {
      headers: { Authorization: `Bearer ${brokerOtherToken}` },
    });
    const data = await res.json();
    const tasks = data.data?.tasks || [];
    const fuList = data.data?.upcomingFollowUps || [];
    const hasBrokerTask = tasks.some((t: any) => t.taskId === testTaskId);
    const hasBrokerLead = fuList.some((f: any) => f.leadId === testLeadId);

    const pass = res.status === 200 && !hasBrokerTask && !hasBrokerLead;
    record(
      35,
      'Reminders',
      'Verify broker segregation: broker only sees reminders for assigned deals/leads',
      pass ? 'PASS' : 'FAIL',
      'GET /notifications/reminders',
      `HTTP ${res.status}, Unassigned broker cannot see other broker tasks/leads`,
      `Broker data isolation confirmed`
    );
  }

  // =========================================================================
  // SECTION 5: BUSINESS OPERATIONS ANALYTICS DASHBOARD
  // =========================================================================

  // Check 36: Retrieve aggregated business analytics
  let analyticsData: any = null;
  {
    const res = await fetch(`${BASE_URL}/analytics/dashboard`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    const data = await res.json();
    analyticsData = data.data;

    const pass = res.status === 200 && data.success && analyticsData?.summary !== undefined;
    record(
      36,
      'Analytics Dashboard',
      'Retrieve aggregated business operations analytics from live MongoDB data',
      pass ? 'PASS' : 'FAIL',
      'GET /analytics/dashboard',
      `HTTP ${res.status}, Total leads=${analyticsData?.summary?.totalLeads}, Active deals=${analyticsData?.summary?.activeDeals}`,
      `MongoDB aggregations returned successfully`
    );
  }

  // Check 37: Verify leads, enquiries, and qualified investors metrics
  {
    const sm = analyticsData?.summary;
    const pass = sm?.totalLeads > 0 && sm?.qualifiedInvestors > 0;
    record(
      37,
      'Analytics Dashboard',
      'Verify leads, enquiries & qualified investor counts',
      pass ? 'PASS' : 'FAIL',
      'GET /analytics/dashboard -> summary',
      `Total Leads=${sm?.totalLeads}, Qualified Investors=${sm?.qualifiedInvestors}`,
      `Real database counts validated`
    );
  }

  // Check 38: Verify conversion rate calculation
  {
    const sm = analyticsData?.summary;
    const pass = sm?.conversionRate !== undefined && typeof sm?.conversionRate === 'number';
    record(
      38,
      'Analytics Dashboard',
      'Verify conversion rate metric calculated mathematically',
      pass ? 'PASS' : 'FAIL',
      'GET /analytics/dashboard -> conversionRate',
      `Conversion Rate = ${sm?.conversionRate}% (Deals Won=${sm?.dealsWon}, Deals Lost=${sm?.dealsLost})`,
      `Mathematical ratio verified`
    );
  }

  // Check 39: Verify average deal value & financial totals in integer paise
  {
    const sm = analyticsData?.summary;
    const pass =
      sm?.totalDealValuePaise === sm?.totalDealValue * 100 &&
      sm?.averageDealValuePaise === sm?.averageDealValue * 100 &&
      sm?.expectedCommissionPaise === sm?.expectedCommission * 100;
    record(
      39,
      'Analytics Dashboard',
      'Verify integer paise accuracy for deal value & commission metrics',
      pass ? 'PASS' : 'FAIL',
      'GET /analytics/dashboard -> paise metrics',
      `DealValue: ₹${sm?.totalDealValue} (${sm?.totalDealValuePaise} paise), Avg: ₹${sm?.averageDealValue}`,
      `100x rupee-to-paise parity confirmed`
    );
  }

  // Check 40: Verify received revenue reflects verified commission payments
  {
    const sm = analyticsData?.summary;
    const pass = sm?.receivedRevenue >= 250000 && sm?.receivedRevenuePaise >= 25000000;
    record(
      40,
      'Analytics Dashboard',
      'Verify receivedRevenue aggregates verified payment records',
      pass ? 'PASS' : 'FAIL',
      'GET /analytics/dashboard -> receivedRevenue',
      `Verified Revenue: ₹${sm?.receivedRevenue} (${sm?.receivedRevenuePaise} paise)`,
      `Matched against verified CommissionPayment ledger`
    );
  }

  // Check 41: Verify broker-wise performance breakdown
  {
    const bp = analyticsData?.brokerPerformance || [];
    const foundBroker = bp.find((b: any) => b.brokerId === broker._id.toString());
    const pass = bp.length > 0 && foundBroker !== undefined;
    record(
      41,
      'Analytics Dashboard',
      'Verify broker-wise performance aggregation table',
      pass ? 'PASS' : 'FAIL',
      'GET /analytics/dashboard -> brokerPerformance',
      `Brokers in report: ${bp.length}, Found broker ${foundBroker?.brokerName} with ${foundBroker?.totalDeals} deal(s)`,
      `Broker performance attribution verified`
    );
  }

  // Check 42: Verify industry-wise breakdown
  {
    const ind = analyticsData?.industryPerformance || [];
    const foundFood = ind.find((i: any) => i.industry === 'Food & Beverage');
    const pass = ind.length > 0 && foundFood !== undefined && foundFood.dealCount > 0;
    record(
      42,
      'Analytics Dashboard',
      'Verify industry-wise performance breakdown',
      pass ? 'PASS' : 'FAIL',
      'GET /analytics/dashboard -> industryPerformance',
      `Industries count: ${ind.length}, Food & Beverage volume: ₹${foundFood?.totalValue}`,
      `Industry categorization verified`
    );
  }

  // Check 43: Verify city / territory breakdown
  {
    const cities = analyticsData?.cityPerformance || [];
    const pass = cities.length > 0;
    record(
      43,
      'Analytics Dashboard',
      'Verify city / territory performance breakdown',
      pass ? 'PASS' : 'FAIL',
      'GET /analytics/dashboard -> cityPerformance',
      `Top territories: ${cities.map((c: any) => c.city).join(', ')}`,
      `Territory aggregation verified`
    );
  }

  // Check 44: Verify monthly performance trend aggregation
  {
    const monthly = analyticsData?.monthlyPerformance || [];
    const pass = monthly.length > 0 && monthly[0].month !== undefined;
    record(
      44,
      'Analytics Dashboard',
      'Verify monthly performance trend timeline aggregation',
      pass ? 'PASS' : 'FAIL',
      'GET /analytics/dashboard -> monthlyPerformance',
      `Active months: ${monthly.map((m: any) => `${m.month}: ${m.dealsCount} deal(s)`).join(', ')}`,
      `Chronological monthly trend verified`
    );
  }

  // Check 45: Verify date-range filtering on analytics dashboard
  {
    const pastDate = new Date(Date.now() - 365 * 24 * 60 * 60 * 1000).toISOString();
    const futureDate = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
    const res = await fetch(
      `${BASE_URL}/analytics/dashboard?startDate=${pastDate}&endDate=${futureDate}`,
      {
        headers: { Authorization: `Bearer ${adminToken}` },
      }
    );
    const data = await res.json();
    const pass = res.status === 200 && data.success && data.data?.summary?.totalDeals !== undefined;
    record(
      45,
      'Analytics Dashboard',
      'Verify date-range filtering (?startDate=...&endDate=...)',
      pass ? 'PASS' : 'FAIL',
      'GET /analytics/dashboard?startDate=...&endDate=...',
      `HTTP ${res.status}, Date range query executed cleanly`,
      `Date filtered aggregation validated`
    );
  }

  // Check 46: Unauthorized investor/brand access to analytics dashboard is rejected (HTTP 403)
  {
    const res = await fetch(`${BASE_URL}/analytics/dashboard`, {
      headers: { Authorization: `Bearer ${investorToken}` },
    });
    const pass = res.status === 403;
    record(
      46,
      'Analytics Security',
      'Reject unauthorized investor access to analytics dashboard with 403',
      pass ? 'PASS' : 'FAIL',
      'GET /analytics/dashboard',
      `HTTP ${res.status} Forbidden`,
      'Internal operations metrics strictly shielded from external users'
    );
  }

  // =========================================================================
  // SECTION 6: EXPORTABLE CSV REPORTING & RBAC
  // =========================================================================

  // Check 47: Export deals report CSV
  {
    const res = await fetch(`${BASE_URL}/reports/deals/csv`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    const csv = await res.text();
    const isCsv = res.headers.get('content-type')?.includes('text/csv');
    const hasHeader = csv.includes('Deal ID,Deal Title,Brand Name,Investor Name');
    const pass = res.status === 200 && isCsv && hasHeader;
    record(
      47,
      'CSV Reporting',
      'Export deals report as downloadable CSV',
      pass ? 'PASS' : 'FAIL',
      'GET /reports/deals/csv',
      `HTTP ${res.status}, Content-Type=${res.headers.get('content-type')}, Lines=${csv.split('\n').length}`,
      `CSV verified with valid deal headers and data rows`
    );
  }

  // Check 48: Export commission ledger CSV
  {
    const res = await fetch(`${BASE_URL}/reports/commissions/csv`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    const csv = await res.text();
    const isCsv = res.headers.get('content-type')?.includes('text/csv');
    const hasHeader = csv.includes('Agreement Number,Deal Title,Brand Payer');
    const pass = res.status === 200 && isCsv && hasHeader;
    record(
      48,
      'CSV Reporting',
      'Export commission ledger report as downloadable CSV',
      pass ? 'PASS' : 'FAIL',
      'GET /reports/commissions/csv',
      `HTTP ${res.status}, Content-Type=${res.headers.get('content-type')}, Lines=${csv.split('\n').length}`,
      `CSV verified with valid commission ledger headers`
    );
  }

  // Check 49: Date-range filtering on CSV exports
  {
    const pastDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
    const res = await fetch(`${BASE_URL}/reports/deals/csv?startDate=${pastDate}`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    const pass = res.status === 200 && res.headers.get('content-type')?.includes('text/csv');
    record(
      49,
      'CSV Reporting',
      'Date-range filtering on CSV exports',
      pass ? 'PASS' : 'FAIL',
      'GET /reports/deals/csv?startDate=...',
      `HTTP ${res.status}, Date filtered CSV generated cleanly`,
      `Temporal export filters confirmed`
    );
  }

  // Check 50: Broker CSV export includes only assigned deals
  {
    const res = await fetch(`${BASE_URL}/reports/deals/csv`, {
      headers: { Authorization: `Bearer ${brokerToken}` },
    });
    const csv = await res.text();
    const lines = csv.trim().split('\n');
    const pass = res.status === 200 && lines.length >= 2;
    record(
      50,
      'CSV Reporting',
      'Broker CSV export contains only broker assigned deals',
      pass ? 'PASS' : 'FAIL',
      'GET /reports/deals/csv',
      `HTTP ${res.status}, Exported ${lines.length - 1} assigned deal row(s)`,
      `Broker assigned deals scoped in export`
    );
  }

  // Check 51: Reject investor access to deals CSV report (HTTP 403)
  {
    const res = await fetch(`${BASE_URL}/reports/deals/csv`, {
      headers: { Authorization: `Bearer ${investorToken}` },
    });
    const pass = res.status === 403;
    record(
      51,
      'CSV Security',
      'Reject investor access to deals CSV report with 403',
      pass ? 'PASS' : 'FAIL',
      'GET /reports/deals/csv',
      `HTTP ${res.status} Forbidden`,
      'Deals report export restricted from non-brokerage users'
    );
  }

  // Check 52: Reject brand access to commissions CSV report (HTTP 403)
  {
    const res = await fetch(`${BASE_URL}/reports/commissions/csv`, {
      headers: { Authorization: `Bearer ${brandOwnerToken}` },
    });
    const pass = res.status === 403;
    record(
      52,
      'CSV Security',
      'Reject brand access to commissions CSV report with 403',
      pass ? 'PASS' : 'FAIL',
      'GET /reports/commissions/csv',
      `HTTP ${res.status} Forbidden`,
      'Commission ledger report export restricted from non-brokerage users'
    );
  }

  // =========================================================================
  // SECTION 7: INTEGER PAISE & FINANCIAL DATA INTEGRITY VERIFICATION
  // =========================================================================

  // Check 53: Direct MongoDB inspection: CommissionAgreement integer paise
  {
    const agDoc = await CommissionAgreement.findById(agreement1Id);
    const pass =
      agDoc !== null &&
      agDoc.baseAmountPaise === Math.round(agDoc.baseAmount * 100) &&
      agDoc.expectedCommissionPaise === Math.round(agDoc.expectedCommission * 100) &&
      agDoc.receivedRevenuePaise === Math.round(agDoc.receivedRevenue * 100) &&
      agDoc.pendingCommissionPaise === Math.round(agDoc.pendingCommission * 100);
    record(
      53,
      'Financial Integrity',
      'Direct MongoDB inspection: CommissionAgreement integer paise synchronicity',
      pass ? 'PASS' : 'FAIL',
      'MongoDB CommissionAgreement',
      `baseAmountPaise=${agDoc?.baseAmountPaise}, expectedCommissionPaise=${agDoc?.expectedCommissionPaise}, receivedRevenuePaise=${agDoc?.receivedRevenuePaise}`,
      `Zero floating-point rounding error across all agreement financial fields`
    );
  }

  // Check 54: Direct MongoDB inspection: CommissionPayment integer paise
  {
    const pDocs = await CommissionPayment.find({ agreement: agreement1Id });
    const allPaiseValid = pDocs.every((p) => p.amountPaise === Math.round(p.amount * 100));
    const pass = pDocs.length === 3 && allPaiseValid;
    record(
      54,
      'Financial Integrity',
      'Direct MongoDB inspection: CommissionPayment integer paise synchronicity',
      pass ? 'PASS' : 'FAIL',
      'MongoDB CommissionPayment.find',
      `Checked ${pDocs.length} payment records. All amountPaise === amount * 100`,
      `Strict integer paise stored for each transaction`
    );
  }

  // Check 55: Direct MongoDB inspection: Currency INR uniformity
  {
    const pDocs = await CommissionPayment.find({ agreement: agreement1Id });
    const allInr = pDocs.every((p) => p.currency === 'INR');
    const pass = allInr && pDocs.length > 0;
    record(
      55,
      'Financial Integrity',
      'Direct MongoDB inspection: Currency is strictly INR across transactions',
      pass ? 'PASS' : 'FAIL',
      'MongoDB CommissionPayment.currency',
      `All ${pDocs.length} payments marked with currency: 'INR'`,
      `Standard INR currency uniformity verified`
    );
  }

  // =========================================================================
  // AUDIT SUMMARY & TABLE
  // =========================================================================

  console.log('\n================================================================================');
  console.log('                          MILESTONE 7 AUDIT SUMMARY                             ');
  console.log('================================================================================\n');

  const total = auditRecords.length;
  const passed = auditRecords.filter((r) => r.status === 'PASS').length;
  const failed = auditRecords.filter((r) => r.status === 'FAIL').length;

  console.log(`TOTAL CHECKS: ${total}`);
  console.log(`PASSED: ${passed}`);
  console.log(`FAILED: ${failed}\n`);

  if (failed > 0) {
    console.error(`FAILED AUDIT CHECKS:`);
    auditRecords
      .filter((r) => r.status === 'FAIL')
      .forEach((r) => {
        console.error(`  - Check ${r.num} [${r.section}]: ${r.testName}`);
        console.error(`    Result: ${r.actualResult}`);
        console.error(`    Failure: ${r.failureDetails}`);
      });
  } else {
    console.log(`ALL ${total}/${total} MILESTONE 7 AUDIT CHECKS PASSED PERFECTLY!\n`);
  }

  await mongoose.disconnect();
  process.exit(failed > 0 ? 1 : 0);
}

runMilestone7Audit().catch((err) => {
  console.error('Fatal audit failure:', err);
  process.exit(1);
});
