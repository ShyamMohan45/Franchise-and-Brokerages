import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import mongoose from 'mongoose';
import { app } from '../app';
import { env } from '../config/env';
import {
  sanitizeIntroductionForUser,
} from '../controllers/introductionController';
import { IntroductionRequest } from '../models/IntroductionRequest';
import { User } from '../models/User';
import { BusinessProfile } from '../models/BusinessProfile';
import { FranchiseListing } from '../models/FranchiseListing';
import { InvestorProfile } from '../models/InvestorProfile';
import { DealRoom } from '../models/DealRoom';
import { Notification } from '../models/Notification';
import { generateToken } from '../utils/jwt';

let dbAvailable = false;

beforeAll(async () => {
  if (mongoose.connection.readyState === 0) {
    try {
      await mongoose.connect(env.MONGODB_URI, { serverSelectionTimeoutMS: 2000 });
      dbAvailable = mongoose.connection.readyState === 1;
    } catch {
      dbAvailable = false;
      console.warn('[introductionRequest.test.ts] MongoDB not available locally; skipping DB integration assertions');
    }
  } else {
    dbAvailable = mongoose.connection.readyState === 1;
  }
}, 5000);

afterAll(async () => {
  if (mongoose.connection.readyState !== 0) {
    await mongoose.disconnect();
  }
});

describe('Milestone 2: Authorized Introduction Workflow & Mutual Privacy Consent Gate Test Suite', () => {
  // --------------------------------------------------------------------------
  // SECTION 1: Privacy Firewall & Sanitization Logic
  // --------------------------------------------------------------------------
  describe('Privacy Firewall & Masking Enforcement', () => {
    const mockIntro = {
      _id: 'intro-mock-123',
      referenceNumber: 'INTRO-202611-12345',
      brandName: 'RoastCraft Specialty Coffee',
      status: 'PENDING',
      businessOwnerUser: {
        _id: 'owner-user-1',
        fullName: 'Amitabh Sen',
        email: 'amitabh@roastcraft.com',
        phone: '+91 98765 11111',
      },
      business: {
        _id: 'biz-1',
        businessName: 'RoastCraft Roasters Pvt Ltd',
        contactEmail: 'corp@roastcraft.com',
        contactPhone: '+91 98765 11111',
      },
      investorUser: {
        _id: 'investor-user-1',
        fullName: 'Pooja Agarwal',
        email: 'pooja@capitalpartners.in',
        phone: '+91 99887 22222',
      },
      investorProfile: {
        _id: 'inv-prof-1',
        fullName: 'Pooja Agarwal',
        email: 'pooja@capitalpartners.in',
        phone: '+91 99887 22222',
        companyName: 'Agarwal Capital Ventures',
        city: 'Jaipur',
        state: 'Rajasthan',
        investmentBudgetMax: 5000000,
        isVerified: true,
      },
      targetCity: 'Jaipur',
      investmentBudget: 4000000,
    };

    it('Before mutual consent: Franchisor CANNOT see investor fullName, phone, email, or companyName', () => {
      const sanitized = sanitizeIntroductionForUser(mockIntro, 'owner-user-1', 'business_owner');

      expect(sanitized.investorUser.fullName).toBeUndefined();
      expect(sanitized.investorUser.email).toBeUndefined();
      expect(sanitized.investorUser.phone).toBeUndefined();
      expect(sanitized.investorProfile.fullName).toBeUndefined();
      expect(sanitized.investorProfile.email).toBeUndefined();
      expect(sanitized.investorProfile.phone).toBeUndefined();
      expect(sanitized.investorProfile.companyName).toBeUndefined();

      // Anonymized identifier should be present
      expect(sanitized.investorProfile.anonymizedId).toBeDefined();
      expect(sanitized.investorProfile.city).toBe('Jaipur');
      expect(sanitized.investorProfile.isMasked).toBe(true);
    });

    it('Before mutual consent: Investor CANNOT see franchisor personal email or direct phone', () => {
      const sanitized = sanitizeIntroductionForUser(mockIntro, 'investor-user-1', 'investor');

      expect(sanitized.businessOwnerUser.email).toBeUndefined();
      expect(sanitized.businessOwnerUser.phone).toBeUndefined();
      expect(sanitized.business.contactEmail).toBeUndefined();
      expect(sanitized.business.contactPhone).toBeUndefined();
      expect(sanitized.businessOwnerUser.isMasked).toBe(true);
    });

    it('After mutual consent (MUTUALLY_ACCEPTED): Direct contact details are unlocked for both parties', () => {
      const mutuallyAcceptedIntro = {
        ...mockIntro,
        status: 'MUTUALLY_ACCEPTED',
      };

      const franchisorSanitized = sanitizeIntroductionForUser(
        mutuallyAcceptedIntro,
        'owner-user-1',
        'business_owner'
      );
      expect(franchisorSanitized.investorProfile.fullName).toBe('Pooja Agarwal');
      expect(franchisorSanitized.investorProfile.email).toBe('pooja@capitalpartners.in');
      expect(franchisorSanitized.investorProfile.phone).toBe('+91 99887 22222');

      const investorSanitized = sanitizeIntroductionForUser(
        mutuallyAcceptedIntro,
        'investor-user-1',
        'investor'
      );
      expect(investorSanitized.businessOwnerUser.email).toBe('amitabh@roastcraft.com');
      expect(investorSanitized.businessOwnerUser.phone).toBe('+91 98765 11111');
    });

    it('Privileged Admin/Broker role can view complete contact data for mediation', () => {
      const adminSanitized = sanitizeIntroductionForUser(mockIntro, 'admin-user-9', 'admin');
      expect(adminSanitized.investorProfile.fullName).toBe('Pooja Agarwal');
      expect(adminSanitized.businessOwnerUser.email).toBe('amitabh@roastcraft.com');
    });
  });

  // --------------------------------------------------------------------------
  // SECTION 2: HTTP Integration & Lifecycle State Machine
  // --------------------------------------------------------------------------
  describe('Introduction Lifecycle & Workflow Endpoints', () => {
    let testInvestorUser: any;
    let testInvestorProfile: any;
    let testFranchisorUser: any;
    let testBusiness: any;
    let testListing: any;
    let testAdminUser: any;

    let investorToken: string;
    let franchisorToken: string;
    let adminToken: string;

    let createdIntroId: string;

    beforeAll(async () => {
      if (!dbAvailable) return;

      const timestamp = Date.now();

      // Create Test Investor
      testInvestorUser = await User.create({
        email: `test.inv.${timestamp}@franchisebridge.com`,
        passwordHash: 'dummy_hash',
        fullName: 'Pooja Agarwal',
        phone: '+91 99887 22222',
        role: 'investor',
        status: 'active',
        emailVerified: true,
      });

      testInvestorProfile = await InvestorProfile.create({
        user: testInvestorUser._id,
        fullName: 'Pooja Agarwal',
        email: testInvestorUser.email,
        phone: testInvestorUser.phone,
        city: 'Jaipur',
        state: 'Rajasthan',
        country: 'India',
        investmentBudgetMin: 3000000,
        investmentBudgetMax: 6000000,
        liquidCapital: 4000000,
        preferredLocations: ['Jaipur'],
        preferredIndustries: ['Food & Beverage'],
        businessExperienceYears: 5,
        pastFranchiseExperience: true,
        isVerified: true,
      });

      // Create Test Franchisor
      testFranchisorUser = await User.create({
        email: `test.brand.${timestamp}@franchisebridge.com`,
        passwordHash: 'dummy_hash',
        fullName: 'Amitabh Sen',
        phone: '+91 98765 11111',
        role: 'business_owner',
        status: 'active',
        emailVerified: true,
      });

      testBusiness = await BusinessProfile.create({
        user: testFranchisorUser._id,
        businessName: 'RoastCraft Specialty Roasters',
        brandName: 'RoastCraft Specialty Coffee',
        slug: `roastcraft-${timestamp}`,
        category: 'Food & Beverage',
        founderName: 'Amitabh Sen',
        contactEmail: testFranchisorUser.email,
        contactPhone: testFranchisorUser.phone,
        establishedYear: 2020,
        headquarters: { city: 'Mumbai', country: 'India' },
        currentLocations: ['Mumbai', 'Pune'],
        numberOfOutlets: 4,
        description: 'Specialty cafe and roastery franchise',
        businessModel: 'FOFO',
        expansionGoals: 'Expanding to Jaipur and Delhi',
        estimatedInvestmentMin: 3500000,
        estimatedInvestmentMax: 5500000,
        existingFranchiseExperience: true,
        approvalStatus: 'APPROVED',
      });

      testListing = await FranchiseListing.create({
        business: testBusiness._id,
        ownerUser: testFranchisorUser._id,
        brandName: 'RoastCraft Specialty Coffee',
        slug: `roastcraft-cafe-${timestamp}`,
        tagline: 'Artisanal coffee experience',
        industry: 'Food & Beverage',
        summary: 'Turnkey specialty cafe franchise',
        brandStory: 'Started in 2020',
        franchiseModelType: 'single_unit',
        totalInvestmentMin: 3500000,
        totalInvestmentMax: 5500000,
        initialFranchiseFee: 800000,
        royaltyPercentage: 6,
        marketingFeePercentage: 2,
        estimatedRoiMonths: 18,
        commercialSpaceMinSqFt: 600,
        commercialSpaceMaxSqFt: 1200,
        staffRequiredMin: 4,
        staffRequiredMax: 8,
        trainingDurationWeeks: 2,
        idealFranchiseeProfile: 'Passionate coffee entrepreneur',
        expansionLocations: ['Jaipur', 'Delhi NCR', 'Pune'],
        status: 'PUBLISHED',
      });

      // Create Test Admin
      testAdminUser = await User.create({
        email: `test.admin.${timestamp}@franchisebridge.com`,
        passwordHash: 'dummy_hash',
        fullName: 'Platform Super Broker',
        role: 'admin',
        status: 'active',
        emailVerified: true,
      });

      investorToken = generateToken({
        userId: testInvestorUser._id.toString(),
        email: testInvestorUser.email,
        role: 'investor',
      });

      franchisorToken = generateToken({
        userId: testFranchisorUser._id.toString(),
        email: testFranchisorUser.email,
        role: 'business_owner',
      });

      adminToken = generateToken({
        userId: testAdminUser._id.toString(),
        email: testAdminUser.email,
        role: 'admin',
      });
    });

    afterAll(async () => {
      if (!dbAvailable) return;
      // Clean up test documents
      if (testInvestorUser) await User.deleteOne({ _id: testInvestorUser._id });
      if (testInvestorProfile) await InvestorProfile.deleteOne({ _id: testInvestorProfile._id });
      if (testFranchisorUser) await User.deleteOne({ _id: testFranchisorUser._id });
      if (testBusiness) await BusinessProfile.deleteOne({ _id: testBusiness._id });
      if (testListing) await FranchiseListing.deleteOne({ _id: testListing._id });
      if (testAdminUser) await User.deleteOne({ _id: testAdminUser._id });
      if (createdIntroId) {
        const intro = await IntroductionRequest.findById(createdIntroId);
        if (intro?.dealRoom) await DealRoom.deleteOne({ _id: intro.dealRoom });
        await IntroductionRequest.deleteOne({ _id: createdIntroId });
      }
    });

    it('1. Investor Initiation: Investor requests introduction to franchise listing', async () => {
      if (!dbAvailable) return;

      const res = await request(app)
        .post('/api/v1/introductions')
        .set('Authorization', `Bearer ${investorToken}`)
        .send({
          franchiseId: testListing._id.toString(),
          targetCity: 'Jaipur',
          investmentBudget: 4500000,
          unitsInterested: 1,
          initialMessage: 'I have secured prime high street retail space in C-Scheme, Jaipur.',
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.referenceNumber).toMatch(/^INTRO-\d{6}-\d{5}$/);
      expect(res.body.data.status).toBe('ACCEPTED_BY_INVESTOR');
      expect(res.body.data.investorConsent.consented).toBe(true);
      expect(res.body.data.franchisorConsent.consented).toBe(false);

      createdIntroId = res.body.data._id;

      // Verify in-app notification was dispatched to franchisor
      const notif = await Notification.findOne({
        recipient: testFranchisorUser._id,
        type: 'introduction_request',
      });
      expect(notif).toBeDefined();
      expect(notif?.title).toContain('New Franchise Introduction Request');
    });

    it('2. Duplicate Protection: Reject duplicate request for active pair', async () => {
      if (!dbAvailable) return;

      const res = await request(app)
        .post('/api/v1/introductions')
        .set('Authorization', `Bearer ${investorToken}`)
        .send({
          franchiseId: testListing._id.toString(),
          targetCity: 'Jaipur',
          investmentBudget: 4500000,
        });

      expect(res.status).toBe(409);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain('active introduction request');
    });

    it('3. Unauthorized Contact Access Guard: Franchisor cannot view investor email before accepting', async () => {
      if (!dbAvailable) return;

      const res = await request(app)
        .get(`/api/v1/introductions/${createdIntroId}`)
        .set('Authorization', `Bearer ${franchisorToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data.investorProfile.email).toBeUndefined();
      expect(res.body.data.investorProfile.phone).toBeUndefined();
      expect(res.body.data.investorProfile.anonymizedId).toBeDefined();
    });

    it('4. Franchisor Acceptance -> Mutual Consent Triggered: Status transitions to MUTUALLY_ACCEPTED', async () => {
      if (!dbAvailable) return;

      const res = await request(app)
        .post(`/api/v1/introductions/${createdIntroId}/respond`)
        .set('Authorization', `Bearer ${franchisorToken}`)
        .send({
          action: 'ACCEPT',
          notes: 'Territory in C-Scheme Jaipur is available and fits our target demographic.',
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.status).toBe('MUTUALLY_ACCEPTED');
      expect(res.body.data.franchisorConsent.consented).toBe(true);
      expect(res.body.data.investorConsent.consented).toBe(true);
      expect(res.body.data.mutuallyAcceptedAt).toBeDefined();

      // Verify direct contact details are now unlocked for franchisor
      expect(res.body.data.investorProfile.fullName).toBe('Pooja Agarwal');
      expect(res.body.data.investorProfile.phone).toBe('+91 99887 22222');

      // Verify mutual acceptance notifications dispatched
      const investorNotif = await Notification.findOne({
        recipient: testInvestorUser._id,
        type: 'introduction_mutually_accepted',
      });
      expect(investorNotif).toBeDefined();
    });

    it('5. Deal Room Creation: Mutually accepted introduction opens Deal Room', async () => {
      if (!dbAvailable) return;

      const res = await request(app)
        .post(`/api/v1/introductions/${createdIntroId}/deal-room`)
        .set('Authorization', `Bearer ${franchisorToken}`)
        .send();

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.dealRoom).toBeDefined();
      expect(res.body.data.dealRoom.roomName).toContain('RoastCraft Specialty Coffee');
      expect(res.body.data.dealRoom.targetTerritory).toBe('Jaipur');
      expect(res.body.data.dealRoom.stage).toBe('discovery_and_nda');

      // Introduction state transitions to DEAL_ROOM_CREATED
      expect(res.body.data.introduction.status).toBe('DEAL_ROOM_CREATED');
      expect(res.body.data.introduction.dealRoom).toBe(res.body.data.dealRoom._id);
    });

    it('6. Duplicate Deal Room Prevention: Repeated request returns existing Deal Room', async () => {
      if (!dbAvailable) return;

      const res = await request(app)
        .post(`/api/v1/introductions/${createdIntroId}/deal-room`)
        .set('Authorization', `Bearer ${investorToken}`)
        .send();

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.message).toContain('Deal Room already exists');
    });

    it('7. Admin Mediation Desk: Admin can review, add notes, and mediate introductions', async () => {
      if (!dbAvailable) return;

      // Admin list all introductions
      const listRes = await request(app)
        .get('/api/v1/introductions/admin/all')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(listRes.status).toBe(200);
      expect(listRes.body.data.length).toBeGreaterThan(0);

      // Admin adds mediation notes
      const medRes = await request(app)
        .patch(`/api/v1/introductions/admin/${createdIntroId}/mediate`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          adminMediationNotes: 'Broker spoke with both parties. High commitment confirmed.',
          isRecommendedByAdmin: true,
        });

      expect(medRes.status).toBe(200);
      expect(medRes.body.data.adminMediationNotes).toContain('Broker spoke with both parties');
      expect(medRes.body.data.isRecommendedByAdmin).toBe(true);
    });

    it('8. Franchisor Initiation Flow: Franchisor invites an anonymized investor', async () => {
      if (!dbAvailable) return;

      // Create a temporary secondary listing for franchisor
      const secondListing = await FranchiseListing.create({
        business: testBusiness._id,
        ownerUser: testFranchisorUser._id,
        brandName: 'RoastCraft Express Kiosk',
        slug: `roastcraft-kiosk-${Date.now()}`,
        tagline: 'Compact automated kiosk',
        industry: 'Food & Beverage',
        summary: 'Compact footprint model',
        brandStory: 'Fast expansion concept',
        franchiseModelType: 'single_unit',
        totalInvestmentMin: 1500000,
        totalInvestmentMax: 2500000,
        initialFranchiseFee: 400000,
        royaltyPercentage: 5,
        marketingFeePercentage: 2,
        estimatedRoiMonths: 12,
        commercialSpaceMinSqFt: 150,
        commercialSpaceMaxSqFt: 300,
        staffRequiredMin: 2,
        staffRequiredMax: 3,
        trainingDurationWeeks: 1,
        idealFranchiseeProfile: 'Transit operator',
        status: 'PUBLISHED',
      });

      const res = await request(app)
        .post('/api/v1/introductions')
        .set('Authorization', `Bearer ${franchisorToken}`)
        .send({
          franchiseId: secondListing._id.toString(),
          investorProfileId: testInvestorProfile._id.toString(),
          targetCity: 'Jaipur',
          initialMessage: 'We would love to partner with you for our compact kiosk format in Jaipur.',
        });

      expect(res.status).toBe(201);
      expect(res.body.data.status).toBe('ACCEPTED_BY_FRANCHISOR');
      expect(res.body.data.franchisorConsent.consented).toBe(true);
      expect(res.body.data.investorConsent.consented).toBe(false);

      const secondIntroId = res.body.data._id;

      // Investor Rejection Flow
      const rejectRes = await request(app)
        .post(`/api/v1/introductions/${secondIntroId}/respond`)
        .set('Authorization', `Bearer ${investorToken}`)
        .send({
          action: 'REJECT',
          notes: 'Seeking full cafe format rather than kiosk model at this time.',
        });

      expect(rejectRes.status).toBe(200);
      expect(rejectRes.body.data.status).toBe('REJECTED');

      // Cleanup
      await FranchiseListing.deleteOne({ _id: secondListing._id });
      await IntroductionRequest.deleteOne({ _id: secondIntroId });
    });
  });
});
