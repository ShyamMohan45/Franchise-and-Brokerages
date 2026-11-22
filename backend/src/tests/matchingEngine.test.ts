import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import mongoose from 'mongoose';
import { app } from '../app';
import { env } from '../config/env';
import {
  calculateFranchisorInvestorMatch,
  anonymizeInvestorProfile,
} from '../controllers/matchingEngineController';
import { User } from '../models/User';
import { BusinessProfile } from '../models/BusinessProfile';
import { FranchiseListing } from '../models/FranchiseListing';
import { InvestorProfile } from '../models/InvestorProfile';
import { generateToken } from '../utils/jwt';

let dbAvailable = false;

beforeAll(async () => {
  if (mongoose.connection.readyState === 0) {
    try {
      await mongoose.connect(env.MONGODB_URI, { serverSelectionTimeoutMS: 2000 });
      dbAvailable = mongoose.connection.readyState === 1;
    } catch {
      dbAvailable = false;
      console.warn('[matchingEngine.test.ts] MongoDB not available locally; skipping DB integration assertions');
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

describe('Milestone 1: Matching Engine & Two-Way Discovery Test Suite', () => {
  // --------------------------------------------------------------------------
  // SECTION 1: Pure Algorithm Matching Accuracy & Transparent Scoring
  // --------------------------------------------------------------------------
  describe('Matching Algorithm Accuracy & Scoring Logic', () => {
    const mockListing = {
      _id: 'listing-001',
      brandName: 'RoastCraft Specialty Coffee',
      industry: 'Food & Beverage',
      category: 'Specialty Cafe & Roastery',
      totalInvestmentMin: 3500000, // 35 Lakhs
      totalInvestmentMax: 5500000, // 55 Lakhs
      expansionLocations: ['Jaipur', 'Delhi NCR', 'Mumbai', 'Pune'],
      businessModel: 'FOFO',
      franchiseModelType: 'single_unit',
    };

    it('Scenario 1: High Compatibility (Budget, Location, Sector, Experience align) -> Priority Introduction (>= 85)', () => {
      const highMatchInvestor = {
        _id: 'inv-high-1',
        fullName: 'Vikram Malhotra',
        email: 'vikram.m@test.com',
        phone: '+91 98765 43210',
        city: 'Jaipur',
        state: 'Rajasthan',
        country: 'India',
        investorType: 'individual',
        investmentBudgetMin: 3000000,
        investmentBudgetMax: 6000000, // Meets 35L-55L range
        liquidCapital: 4000000,
        preferredLocations: ['Jaipur', 'Rajasthan'],
        preferredIndustries: ['Food & Beverage', 'Retail'],
        businessExperienceYears: 6,
        pastFranchiseExperience: true,
        interestType: 'single_unit',
        preferredBusinessModel: 'FOFO',
        investmentTimeline: 'immediate',
      };

      const result = calculateFranchisorInvestorMatch(mockListing, highMatchInvestor);

      expect(result.budgetScore).toBe(30);
      expect(result.locationScore).toBe(25);
      expect(result.industryScore).toBe(20);
      expect(result.goalsScore).toBeGreaterThanOrEqual(13);
      expect(result.experienceScore).toBe(10);
      expect(result.totalScore).toBeGreaterThanOrEqual(85);
      expect(result.introductionStatus).toBe('Priority Introduction');

      // Verify transparent explanations
      expect(result.matchedCriteria.some((c) => c.includes('Investor budget cap'))).toBe(true);
      expect(result.matchedCriteria.some((c) => c.includes('Jaipur'))).toBe(true);
      expect(result.matchedCriteria.some((c) => c.includes('Food & Beverage'))).toBe(true);
    });

    it('Scenario 2: Tolerance Range Matching (Budget within 20% tolerance, Pan-India geography)', () => {
      const toleranceInvestor = {
        _id: 'inv-tol-2',
        city: 'Bengaluru',
        investmentBudgetMin: 2000000,
        investmentBudgetMax: 3000000, // 30L is > 80% of 35L (28L)
        liquidCapital: 1500000,
        preferredLocations: ['Pan India'],
        preferredIndustries: ['Food & Beverage'],
        businessExperienceYears: 1,
        pastFranchiseExperience: false,
        preferredBusinessModel: 'FOFO',
        investmentTimeline: '3_to_6_months', // 1 point for goals timeline
      };

      const result = calculateFranchisorInvestorMatch(mockListing, toleranceInvestor);

      expect(result.budgetScore).toBe(20);
      expect(result.locationScore).toBe(25); // Pan-India gives 25
      expect(result.industryScore).toBe(20);
      expect(result.totalScore).toBeGreaterThanOrEqual(70);
      expect(result.totalScore).toBeLessThan(85);
      expect(result.introductionStatus).toBe('Broker Verified');
      expect(result.matchedCriteria.some((c) => c.includes('20% tolerance'))).toBe(true);
    });

    it('Scenario 3: Capital Shortfall (< 60% minimum requirement) -> Flags co-investment requirement in unmatched criteria', () => {
      const lowBudgetInvestor = {
        _id: 'inv-low-3',
        city: 'Jaipur',
        investmentBudgetMin: 500000,
        investmentBudgetMax: 1500000, // 15L vs 35L requirement (< 60%)
        liquidCapital: 500000,
        preferredLocations: ['Jaipur'],
        preferredIndustries: ['Food & Beverage'],
        businessExperienceYears: 1,
        pastFranchiseExperience: false,
        preferredBusinessModel: 'FOFO',
        investmentTimeline: '3_to_6_months',
      };

      const result = calculateFranchisorInvestorMatch(mockListing, lowBudgetInvestor);

      expect(result.budgetScore).toBe(5);
      expect(result.unmatchedCriteria.some((c) => c.includes('significantly below minimum investment'))).toBe(true);
      expect(result.totalScore).toBeLessThan(70);
    });

    it('Scenario 4: Geographical Mismatch -> Territory mismatch recorded in unmatched criteria', () => {
      const wrongLocationInvestor = {
        _id: 'inv-loc-4',
        city: 'Kochi',
        state: 'Kerala',
        investmentBudgetMin: 4000000,
        investmentBudgetMax: 6000000,
        liquidCapital: 5000000,
        preferredCities: ['Kochi', 'Thiruvananthapuram'],
        preferredLocations: ['Kerala'],
        preferredIndustries: ['Food & Beverage'],
        businessExperienceYears: 4,
        pastFranchiseExperience: true,
        preferredBusinessModel: 'FOFO',
        investmentTimeline: 'immediate',
      };

      const result = calculateFranchisorInvestorMatch(mockListing, wrongLocationInvestor);

      expect(result.locationScore).toBe(8);
      expect(result.unmatchedCriteria.some((c) => c.includes('differ from active brand expansion cities'))).toBe(true);
    });

    it('Scenario 5: First-Time Investor (0 years experience, no past franchise) receives appropriate baseline score and training note', () => {
      const noviceInvestor = {
        _id: 'inv-nov-5',
        city: 'Jaipur',
        investmentBudgetMin: 3500000,
        investmentBudgetMax: 5000000,
        liquidCapital: 4000000,
        preferredLocations: ['Jaipur'],
        preferredIndustries: ['Food & Beverage'],
        businessExperienceYears: 0,
        pastFranchiseExperience: false,
        preferredBusinessModel: 'FOFO',
        investmentTimeline: 'immediate',
      };

      const result = calculateFranchisorInvestorMatch(mockListing, noviceInvestor);

      expect(result.experienceScore).toBe(3);
      expect(result.unmatchedCriteria.some((c) => c.includes('First-time franchisee investor'))).toBe(true);
    });
  });

  // --------------------------------------------------------------------------
  // SECTION 2: Strict Investor Privacy & Anonymization Engine
  // --------------------------------------------------------------------------
  describe('Investor Privacy & Anonymization Enforcement', () => {
    it('anonymizeInvestorProfile must strictly strip all PII (fullName, email, phone, companyName)', () => {
      const fullInvestorRecord = {
        _id: '507f1f77bcf86cd799439011',
        user: { _id: 'user-123', email: 'confidential@investor.com', passwordHash: 'hash' },
        fullName: 'Rajesh Sharma',
        email: 'rajesh.sharma@investor.com',
        phone: '+91 99887 76655',
        companyName: 'Sharma Capital Private Limited',
        verificationNotes: 'Internal confidential broker notes',
        city: 'Jaipur',
        state: 'Rajasthan',
        country: 'India',
        investorType: 'individual',
        investmentBudgetMin: 2500000,
        investmentBudgetMax: 5000000,
        liquidCapital: 3000000,
        preferredCities: ['Jaipur', 'Udaipur'],
        preferredIndustries: ['Food & Beverage', 'Retail'],
        businessExperienceYears: 8,
        pastFranchiseExperience: true,
        interestType: 'single_unit',
        preferredBusinessModel: 'FOFO',
        operationPreference: 'self_operated',
        proposedOutlets: 2,
        investmentTimeline: 'immediate',
        profileCompletion: 95,
        isVerified: true,
      };

      const anonymized = anonymizeInvestorProfile(fullInvestorRecord);

      // Verify PII is completely stripped
      expect((anonymized as any).fullName).toBeUndefined();
      expect((anonymized as any).email).toBeUndefined();
      expect((anonymized as any).phone).toBeUndefined();
      expect((anonymized as any).companyName).toBeUndefined();
      expect((anonymized as any).user).toBeUndefined();
      expect((anonymized as any).verificationNotes).toBeUndefined();

      // Verify anonymized identifier format
      expect(anonymized.anonymizedId).toBe('INV-439011');
      expect(anonymized.city).toBe('Jaipur');
      expect(anonymized.state).toBe('Rajasthan');
      expect(anonymized.investmentBudgetMax).toBe(5000000);
      expect(anonymized.isVerified).toBe(true);
    });
  });

  // --------------------------------------------------------------------------
  // SECTION 3: HTTP API Authentication & Role-Based Authorization
  // --------------------------------------------------------------------------
  describe('HTTP API Endpoints & Role Authorization (GET /api/v1/matching/franchisor)', () => {
    it('GET /api/v1/matching/franchisor without authentication token should return 401 Unauthorized', async () => {
      const res = await request(app).get('/api/v1/matching/franchisor');
      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });

    it('GET /api/v1/matching/franchisor with investor role token should return 403 Forbidden', async () => {
      if (!dbAvailable) return;

      const randomInvestorId = new mongoose.Types.ObjectId();
      const tempInvestor = await User.create({
        _id: randomInvestorId,
        email: `investor.${Date.now()}@test.com`,
        passwordHash: 'dummy_hash_for_test',
        fullName: 'Test Unauthorized Investor',
        role: 'investor',
        status: 'active',
        emailVerified: true,
      });

      const investorToken = generateToken({
        userId: tempInvestor._id.toString(),
        email: tempInvestor.email,
        role: 'investor',
      });

      const res = await request(app)
        .get('/api/v1/matching/franchisor')
        .set('Authorization', `Bearer ${investorToken}`);

      // Clean up temp user
      await User.deleteOne({ _id: tempInvestor._id });

      expect(res.status).toBe(403);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain('Access denied');
    });

    it('GET /api/v1/matching/franchisor with business_owner role but no business profile should return 404 with guidance', async () => {
      if (!dbAvailable) return;

      const randomUserId = new mongoose.Types.ObjectId();
      // Ensure user exists in DB so auth middleware passes
      const tempUser = await User.create({
        _id: randomUserId,
        email: `brand.${Date.now()}@test.com`,
        passwordHash: 'dummy_hash_for_test',
        fullName: 'Test Brand Owner',
        role: 'business_owner',
        status: 'active',
        emailVerified: true,
      });

      const franchisorToken = generateToken({
        userId: tempUser._id.toString(),
        email: tempUser.email,
        role: 'business_owner',
      });

      const res = await request(app)
        .get('/api/v1/matching/franchisor')
        .set('Authorization', `Bearer ${franchisorToken}`);

      // Clean up temp user
      await User.deleteOne({ _id: tempUser._id });

      expect(res.status).toBe(404);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain('Franchisor business profile not found');
    });

    it('GET /api/v1/matching/investor (existing endpoint) remains protected and intact', async () => {
      const res = await request(app).get('/api/v1/matching/investor');
      expect(res.status).toBe(401);
    });
  });
});
