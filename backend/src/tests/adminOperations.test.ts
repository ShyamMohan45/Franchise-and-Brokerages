import { describe, it, expect } from 'vitest';
import { Request, Response } from 'express';
import mongoose, { Types } from 'mongoose';
import { requireAdmin, requireSuperAdmin, requireRole } from '../middleware/rbac';
import {
  updateUserRoleAndStatus,
  updateInvestorVerification,
  updateBusinessStatus,
  updateFranchiseListingStatus,
  assignBroker,
  recommendAdminMatch,
} from '../controllers/adminController';
import { InvestorProfile } from '../models/InvestorProfile';
import { BusinessProfile } from '../models/BusinessProfile';
import { FranchiseListing } from '../models/FranchiseListing';
import { User } from '../models/User';

function createMockReqRes(options: {
  user?: any;
  params?: any;
  body?: any;
  query?: any;
}) {
  const req = {
    user: options.user,
    params: options.params || {},
    body: options.body || {},
    query: options.query || {},
    headers: {},
  } as unknown as Request;

  let statusCode = 200;
  let responseData: any = null;

  const res = {
    status(code: number) {
      statusCode = code;
      return this;
    },
    json(data: any) {
      responseData = data;
      return this;
    },
  } as unknown as Response;

  return {
    req,
    res,
    getStatusCode: () => statusCode,
    getResponseData: () => responseData,
  };
}

describe('Milestone 4: Super Admin Verification & Operational Mediation Desk Test Suite', () => {
  // --------------------------------------------------------------------------
  // SECTION 1: Role-Based Access Control (RBAC) & Middleware Boundaries
  // --------------------------------------------------------------------------
  describe('RBAC Security Matrix & Role Hierarchy', () => {
    it('Denies unauthenticated access to protected admin middleware (401)', () => {
      const { req, res, getStatusCode, getResponseData } = createMockReqRes({ user: undefined });
      let nextCalled = false;

      requireAdmin(req, res, () => {
        nextCalled = true;
      });

      expect(nextCalled).toBe(false);
      expect(getStatusCode()).toBe(401);
      expect(getResponseData().success).toBe(false);
      expect(getResponseData().message).toMatch(/Authentication required/i);
    });

    it('Denies investor role from accessing admin routes (403)', () => {
      const { req, res, getStatusCode, getResponseData } = createMockReqRes({
        user: { _id: 'inv-1', role: 'investor' },
      });
      let nextCalled = false;

      requireAdmin(req, res, () => {
        nextCalled = true;
      });

      expect(nextCalled).toBe(false);
      expect(getStatusCode()).toBe(403);
      expect(getResponseData().success).toBe(false);
      expect(getResponseData().message).toMatch(/Access denied/i);
    });

    it('Denies business_owner role from accessing admin routes (403)', () => {
      const { req, res, getStatusCode, getResponseData } = createMockReqRes({
        user: { _id: 'biz-1', role: 'business_owner' },
      });
      let nextCalled = false;

      requireAdmin(req, res, () => {
        nextCalled = true;
      });

      expect(nextCalled).toBe(false);
      expect(getStatusCode()).toBe(403);
      expect(getResponseData().success).toBe(false);
    });

    it('Denies broker role from accessing global admin management routes (403)', () => {
      const { req, res, getStatusCode, getResponseData } = createMockReqRes({
        user: { _id: 'broker-1', role: 'broker' },
      });
      let nextCalled = false;

      requireAdmin(req, res, () => {
        nextCalled = true;
      });

      expect(nextCalled).toBe(false);
      expect(getStatusCode()).toBe(403);
      expect(getResponseData().success).toBe(false);
    });

    it('Permits admin and super_admin roles to pass requireAdmin middleware', () => {
      const { req: reqAdmin, res: resAdmin } = createMockReqRes({
        user: { _id: 'admin-1', role: 'admin' },
      });
      let nextAdminCalled = false;
      requireAdmin(reqAdmin, resAdmin, () => {
        nextAdminCalled = true;
      });
      expect(nextAdminCalled).toBe(true);

      const { req: reqSuper, res: resSuper } = createMockReqRes({
        user: { _id: 'super-1', role: 'super_admin' },
      });
      let nextSuperCalled = false;
      requireAdmin(reqSuper, resSuper, () => {
        nextSuperCalled = true;
      });
      expect(nextSuperCalled).toBe(true);
    });

    it('Strictly denies standard admin from Super-Admin-Only routes (403)', () => {
      const { req, res, getStatusCode, getResponseData } = createMockReqRes({
        user: { _id: 'admin-1', role: 'admin' },
      });
      let nextCalled = false;

      requireSuperAdmin(req, res, () => {
        nextCalled = true;
      });

      expect(nextCalled).toBe(false);
      expect(getStatusCode()).toBe(403);
      expect(getResponseData().success).toBe(false);
      expect(getResponseData().message).toMatch(/Requires one of roles: \[super_admin\]/i);
    });

    it('Permits super_admin on requireSuperAdmin routes', () => {
      const { req, res } = createMockReqRes({
        user: { _id: 'super-1', role: 'super_admin' },
      });
      let nextCalled = false;

      requireSuperAdmin(req, res, () => {
        nextCalled = true;
      });

      expect(nextCalled).toBe(true);
    });
  });

  // --------------------------------------------------------------------------
  // SECTION 2: Super Admin Immutability & Security Invariants
  // --------------------------------------------------------------------------
  describe('Primary Super Admin Protection & Invariants', () => {
    it('Blocks attempts to promote any user to super_admin (returns 403)', async () => {
      const targetId = new Types.ObjectId().toString();
      const { req, res, getStatusCode, getResponseData } = createMockReqRes({
        user: { _id: 'super-1', email: 'broker.admin@franchisebridge.com', role: 'super_admin' },
        params: { id: targetId },
        body: { role: 'super_admin' },
      });

      const originalFindById = User.findById;
      User.findById = (() => ({
        _id: targetId,
        email: 'regular.user@example.com',
        role: 'business_owner',
        status: 'active',
      })) as any;

      try {
        await updateUserRoleAndStatus(req, res);
        expect(getStatusCode()).toBe(403);
        expect(getResponseData().success).toBe(false);
        expect(getResponseData().message).toMatch(/Creation of additional super_admin accounts is prohibited/i);
      } finally {
        User.findById = originalFindById;
      }
    });

    it('Blocks attempts to demote or alter the role of the primary Super Admin (returns 403)', async () => {
      const superAdminTargetId = new Types.ObjectId().toString();
      const { req, res, getStatusCode, getResponseData } = createMockReqRes({
        user: { _id: 'super-1', email: 'broker.admin@franchisebridge.com', role: 'super_admin' },
        params: { id: superAdminTargetId },
        body: { role: 'admin' },
      });

      const originalFindById = User.findById;
      User.findById = (() => ({
        _id: superAdminTargetId,
        email: 'broker.admin@franchisebridge.com',
        role: 'super_admin',
        status: 'active',
      })) as any;

      try {
        await updateUserRoleAndStatus(req, res);
        expect(getStatusCode()).toBe(403);
        expect(getResponseData().success).toBe(false);
        expect(getResponseData().message).toMatch(/The primary Super Admin account cannot be demoted/i);
      } finally {
        User.findById = originalFindById;
      }
    });

    it('Blocks attempts to suspend or deactivate the primary Super Admin (returns 403)', async () => {
      const superAdminTargetId = new Types.ObjectId().toString();
      const { req, res, getStatusCode, getResponseData } = createMockReqRes({
        user: { _id: 'super-1', email: 'broker.admin@franchisebridge.com', role: 'super_admin' },
        params: { id: superAdminTargetId },
        body: { status: 'suspended' },
      });

      const originalFindById = User.findById;
      User.findById = (() => ({
        _id: superAdminTargetId,
        email: 'broker.admin@franchisebridge.com',
        role: 'super_admin',
        status: 'active',
      })) as any;

      try {
        await updateUserRoleAndStatus(req, res);
        expect(getStatusCode()).toBe(403);
        expect(getResponseData().success).toBe(false);
        expect(getResponseData().message).toMatch(/The primary Super Admin account cannot be demoted/i);
      } finally {
        User.findById = originalFindById;
      }
    });
  });

  // --------------------------------------------------------------------------
  // SECTION 3: Input Validation on Admin Operational Endpoints
  // --------------------------------------------------------------------------
  describe('Input Validation on Admin Verification & Desk Endpoints', () => {
    it('Rejects invalid verificationStatus on investor accreditation (400)', async () => {
      const profileId = new Types.ObjectId().toString();
      const { req, res, getStatusCode, getResponseData } = createMockReqRes({
        user: { _id: 'admin-1', role: 'admin' },
        params: { id: profileId },
        body: { verificationStatus: 'invalid_status_enum' },
      });

      const originalFindById = InvestorProfile.findById;
      InvestorProfile.findById = (() => ({
        _id: profileId,
        fullName: 'Jane Doe',
        user: new Types.ObjectId(),
      })) as any;

      try {
        await updateInvestorVerification(req, res);
        expect(getStatusCode()).toBe(400);
        expect(getResponseData().success).toBe(false);
        expect(getResponseData().message).toMatch(/Invalid verification status/i);
      } finally {
        InvestorProfile.findById = originalFindById;
      }
    });

    it('Rejects invalid status on business KYC verification (400)', async () => {
      const bizId = new Types.ObjectId().toString();
      const { req, res, getStatusCode, getResponseData } = createMockReqRes({
        user: { _id: 'admin-1', role: 'admin' },
        params: { id: bizId },
        body: { status: 'non_existent_status' },
      });

      const originalFindById = BusinessProfile.findById;
      BusinessProfile.findById = (() => ({
        populate: () => ({
          _id: bizId,
          businessName: 'RoastCraft',
          user: new Types.ObjectId(),
        }),
      })) as any;

      try {
        await updateBusinessStatus(req, res);
        expect(getStatusCode()).toBe(400);
        expect(getResponseData().success).toBe(false);
        expect(getResponseData().message).toMatch(/Invalid approval status/i);
      } finally {
        BusinessProfile.findById = originalFindById;
      }
    });

    it('Rejects invalid listing status on franchise review (400)', async () => {
      const listingId = new Types.ObjectId().toString();
      const { req, res, getStatusCode, getResponseData } = createMockReqRes({
        user: { _id: 'admin-1', role: 'admin' },
        params: { id: listingId },
        body: { status: 'unauthorized_status' },
      });

      const originalFindById = FranchiseListing.findById;
      FranchiseListing.findById = (() => ({
        populate: () => ({
          _id: listingId,
          brandName: 'RoastCraft Cafe',
          ownerUser: new Types.ObjectId(),
        }),
      })) as any;

      try {
        await updateFranchiseListingStatus(req, res);
        expect(getStatusCode()).toBe(400);
        expect(getResponseData().success).toBe(false);
        expect(getResponseData().message).toMatch(/Invalid listing status/i);
      } finally {
        FranchiseListing.findById = originalFindById;
      }
    });

    it('Rejects broker assignment missing mandatory fields (400)', async () => {
      const { req, res, getStatusCode, getResponseData } = createMockReqRes({
        user: { _id: 'admin-1', role: 'admin' },
        body: { entityType: 'deal_room' }, // missing brokerId and entityId
      });

      await assignBroker(req, res);
      expect(getStatusCode()).toBe(400);
      expect(getResponseData().success).toBe(false);
      expect(getResponseData().message).toMatch(/entityType, entityId, and brokerId are required/i);
    });

    it('Rejects administrative matchmaking recommendation missing IDs (400)', async () => {
      const { req, res, getStatusCode, getResponseData } = createMockReqRes({
        user: { _id: 'admin-1', role: 'admin' },
        body: { recommendationNotes: 'High affinity prospect' }, // missing investorId and franchiseId
      });

      await recommendAdminMatch(req, res);
      expect(getStatusCode()).toBe(400);
      expect(getResponseData().success).toBe(false);
      expect(getResponseData().message).toMatch(/franchiseId and investorId are required/i);
    });
  });
});
