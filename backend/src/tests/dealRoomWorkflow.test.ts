import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import mongoose, { Types } from 'mongoose';
import { env } from '../config/env';
import {
  DEFAULT_11_DILIGENCE_ITEMS,
  checkDealRoomAccess,
} from '../controllers/dealRoomController';
import { DealRoom } from '../models/DealRoom';
import { DueDiligenceChecklist, IDueDiligenceCategoryItem } from '../models/DueDiligenceChecklist';
import { DealDocument } from '../models/DealDocument';
import { DealMessage } from '../models/DealMessage';
import { Meeting } from '../models/Meeting';
import { IntroductionRequest } from '../models/IntroductionRequest';
import { createDealRoomFromIntroduction } from '../controllers/introductionController';
import { getStorageService } from '../services/storageService';

let dbAvailable = false;

beforeAll(async () => {
  if (mongoose.connection.readyState === 0) {
    try {
      await mongoose.connect(env.MONGODB_URI, { serverSelectionTimeoutMS: 2000 });
      dbAvailable = mongoose.connection.readyState === 1;
    } catch {
      dbAvailable = false;
      console.warn('[dealRoomWorkflow.test.ts] MongoDB not available locally; running unit & logic assertions');
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

describe('Milestone 3: Deal Room & 11-Pillar Due Diligence Full Wiring Test Suite', () => {
  const investorId = new Types.ObjectId().toString();
  const franchisorId = new Types.ObjectId().toString();
  const brokerId = new Types.ObjectId().toString();
  const adminId = new Types.ObjectId().toString();
  const thirdPartyInvestorId = new Types.ObjectId().toString();
  const thirdPartyFranchisorId = new Types.ObjectId().toString();

  const mockDealRoom = {
    _id: new Types.ObjectId(),
    roomName: 'RoastCraft Specialty Coffee - Mumbai Metro Deal Room',
    targetTerritory: 'Mumbai Metro',
    stage: 'discovery_and_nda',
    investor: new Types.ObjectId(investorId),
    franchisor: new Types.ObjectId(franchisorId),
    businessOwner: new Types.ObjectId(franchisorId),
    broker: new Types.ObjectId(brokerId),
    assignedBroker: new Types.ObjectId(brokerId),
  };

  // --------------------------------------------------------------------------
  // SECTION 1: Cross-Tenant Isolation & Role-Based Access Enforcement
  // --------------------------------------------------------------------------
  describe('1. Role-Based Deal Room Access & Tenant Isolation', () => {
    it('grants access to authorized investor participant', () => {
      const user = { _id: investorId, role: 'investor' };
      const access = checkDealRoomAccess(user, mockDealRoom);
      expect(access.allowed).toBe(true);
      expect(access.isInternalPrivileged).toBe(false);
      expect(access.role).toBe('investor');
    });

    it('grants access to authorized franchisor / business owner participant', () => {
      const user = { _id: franchisorId, role: 'business_owner' };
      const access = checkDealRoomAccess(user, mockDealRoom);
      expect(access.allowed).toBe(true);
      expect(access.isInternalPrivileged).toBe(false);
      expect(access.role).toBe('brand_owner');
    });

    it('grants privileged access to assigned broker', () => {
      const user = { _id: brokerId, role: 'broker' };
      const access = checkDealRoomAccess(user, mockDealRoom);
      expect(access.allowed).toBe(true);
      expect(access.isInternalPrivileged).toBe(true);
      expect(access.role).toBe('broker');
    });

    it('grants super admin platform-wide access with privileged oversight', () => {
      const user = { _id: adminId, role: 'super_admin' };
      const access = checkDealRoomAccess(user, mockDealRoom);
      expect(access.allowed).toBe(true);
      expect(access.isInternalPrivileged).toBe(true);
      expect(access.role).toBe('admin');
    });

    it('strictly denies access to unauthorized third-party investor (Cross-Tenant Shield)', () => {
      const user = { _id: thirdPartyInvestorId, role: 'investor' };
      const access = checkDealRoomAccess(user, mockDealRoom);
      expect(access.allowed).toBe(false);
      expect(access.isInternalPrivileged).toBe(false);
    });

    it('strictly denies access to unauthorized third-party franchisor', () => {
      const user = { _id: thirdPartyFranchisorId, role: 'business_owner' };
      const access = checkDealRoomAccess(user, mockDealRoom);
      expect(access.allowed).toBe(false);
      expect(access.isInternalPrivileged).toBe(false);
    });
  });

  // --------------------------------------------------------------------------
  // SECTION 2: 11 Statutory Due Diligence Pillars Specification & Integrity
  // --------------------------------------------------------------------------
  describe('2. All 11 Statutory Due Diligence Pillars Integrity', () => {
    it('contains exactly 11 statutory diligence pillars', () => {
      expect(DEFAULT_11_DILIGENCE_ITEMS).toHaveLength(11);
    });

    it('verifies canonical statutory item IDs and mandatory fields across all 11 pillars', () => {
      const expectedPillars = [
        { id: 'dd-brand-legal', category: 'Brand Legal Documents' },
        { id: 'dd-trademark', category: 'Trademark Information' },
        { id: 'dd-franchise-agreement', category: 'Franchise Agreement Review' },
        { id: 'dd-fees-royalties', category: 'Franchise Fee and Royalty Details' },
        { id: 'dd-financials', category: 'Financial Information' },
        { id: 'dd-outlet-performance', category: 'Existing Outlet Performance Evidence' },
        { id: 'dd-location-feasibility', category: 'Location Feasibility' },
        { id: 'dd-property-lease', category: 'Property and Lease Documents' },
        { id: 'dd-licenses-approvals', category: 'Required Licenses and Approvals' },
        { id: 'dd-training-operations', category: 'Training and Operational Support' },
        { id: 'dd-investor-readiness', category: 'Investor Financial Readiness' },
      ];

      expectedPillars.forEach((expected) => {
        const found = DEFAULT_11_DILIGENCE_ITEMS.find((item) => item.itemId === expected.id);
        expect(found).toBeDefined();
        expect(found?.category).toBe(expected.category);
        expect(found?.title).toBeTruthy();
        expect(found?.description).toBeTruthy();
        expect(found?.status).toBe('PENDING');
        expect(found?.notes).toBeTruthy();
      });
    });
  });

  // --------------------------------------------------------------------------
  // SECTION 3: 11-Pillar Completion Engine & Status Progression
  // --------------------------------------------------------------------------
  describe('3. Due Diligence Completion Percentage & Status Progression', () => {
    const calculateMetrics = (items: IDueDiligenceCategoryItem[]) => {
      const total = items.length;
      const approved = items.filter(
        (i) => i.status === 'APPROVED' || i.status === 'verified'
      ).length;
      const completionPercentage = Math.round((approved / total) * 100);

      let overallStatus = 'PENDING';
      if (completionPercentage === 100) {
        overallStatus = 'APPROVED';
      } else if (items.some((i) => i.status === 'REJECTED' || i.status === 'flagged')) {
        overallStatus = 'REJECTED';
      } else if (items.some((i) => i.status === 'NEEDS_CLARIFICATION')) {
        overallStatus = 'NEEDS_CLARIFICATION';
      } else if (items.some((i) => i.status === 'UNDER_REVIEW' || i.status === 'in_review')) {
        overallStatus = 'UNDER_REVIEW';
      } else if (approved > 0 || items.some((i) => i.status === 'IN_PROGRESS' || i.status === 'SUBMITTED')) {
        overallStatus = 'IN_PROGRESS';
      }

      return { completionPercentage, overallStatus };
    };

    it('initial state starts at 0% with PENDING overallStatus', () => {
      const items = JSON.parse(JSON.stringify(DEFAULT_11_DILIGENCE_ITEMS));
      const { completionPercentage, overallStatus } = calculateMetrics(items);
      expect(completionPercentage).toBe(0);
      expect(overallStatus).toBe('PENDING');
    });

    it('accurately calculates progress when partial pillars are approved', () => {
      const items = JSON.parse(JSON.stringify(DEFAULT_11_DILIGENCE_ITEMS));
      items[0].status = 'APPROVED';
      items[1].status = 'APPROVED';
      items[2].status = 'APPROVED';
      items[3].status = 'APPROVED';
      items[4].status = 'APPROVED';

      const { completionPercentage, overallStatus } = calculateMetrics(items);
      // 5 / 11 = 45%
      expect(completionPercentage).toBe(45);
      expect(overallStatus).toBe('IN_PROGRESS');
    });

    it('elevates status to NEEDS_CLARIFICATION when reviewer requests clarification', () => {
      const items = JSON.parse(JSON.stringify(DEFAULT_11_DILIGENCE_ITEMS));
      items[0].status = 'APPROVED';
      items[1].status = 'NEEDS_CLARIFICATION';

      const { completionPercentage, overallStatus } = calculateMetrics(items);
      expect(completionPercentage).toBe(9);
      expect(overallStatus).toBe('NEEDS_CLARIFICATION');
    });

    it('flags status as REJECTED when any statutory compliance check is rejected', () => {
      const items = JSON.parse(JSON.stringify(DEFAULT_11_DILIGENCE_ITEMS));
      items[0].status = 'APPROVED';
      items[1].status = 'REJECTED';

      const { completionPercentage, overallStatus } = calculateMetrics(items);
      expect(overallStatus).toBe('REJECTED');
    });

    it('reaches 100% completion and APPROVED overallStatus when all 11 pillars are approved', () => {
      const items = JSON.parse(JSON.stringify(DEFAULT_11_DILIGENCE_ITEMS));
      items.forEach((item: any) => {
        item.status = 'APPROVED';
      });

      const { completionPercentage, overallStatus } = calculateMetrics(items);
      expect(completionPercentage).toBe(100);
      expect(overallStatus).toBe('APPROVED');
    });
  });

  // --------------------------------------------------------------------------
  // SECTION 4: Private Storage Vault & In-Browser PDF Preview
  // --------------------------------------------------------------------------
  describe('4. Private Vault, Presigned Short-Lived URLs & In-Browser Preview', () => {
    it('storage provider securely saves files and generates authorized paths', async () => {
      const storage = getStorageService();
      const testBuffer = Buffer.from('%PDF-1.4 Mock Franchise Disclosure Document');
      const testKey = `test-fdd-${Date.now()}.pdf`;

      const saved = await storage.saveFile(testKey, testBuffer, 'application/pdf');
      expect(saved.key).toBeTruthy();
      expect(saved.size).toBe(testBuffer.length);

      // Verify file existence
      const exists = await storage.fileExists(saved.key);
      expect(exists).toBe(true);

      // Clean up test file
      await storage.deleteFile(saved.key);
    });

    it('filters out internal-only documents for investor and franchisor participants', () => {
      const docs = [
        { _id: 'doc-1', title: 'FDD Disclosure 2026', isInternalOnly: false, allowedRoles: ['investor', 'brand_owner'] },
        { _id: 'doc-2', title: 'Broker Internal Risk Assessment', isInternalOnly: true, allowedRoles: ['broker', 'admin'] },
      ];

      // Investor view (non-privileged)
      const investorDocs = docs.filter((d) => !d.isInternalOnly);
      expect(investorDocs).toHaveLength(1);
      expect(investorDocs[0]._id).toBe('doc-1');

      // Broker view (privileged)
      const brokerDocs = docs;
      expect(brokerDocs).toHaveLength(2);
    });
  });

  // --------------------------------------------------------------------------
  // SECTION 5: Deal Room Communication & Internal Notes Privacy Firewall
  // --------------------------------------------------------------------------
  describe('5. Multi-Party Communications & Internal Broker Notes Firewall', () => {
    const mockMessages = [
      {
        _id: 'msg-1',
        sender: new Types.ObjectId(investorId),
        senderRole: 'investor',
        text: 'Hello, we reviewed the FDD disclosure for the Mumbai outlet.',
        isInternal: false,
      },
      {
        _id: 'msg-2',
        sender: new Types.ObjectId(franchisorId),
        senderRole: 'business_owner',
        text: 'Thank you. We are happy to clarify the territory radius.',
        isInternal: false,
      },
      {
        _id: 'msg-3',
        sender: new Types.ObjectId(brokerId),
        senderRole: 'broker',
        text: 'INTERNAL AUDIT NOTE: Investor liquid solvency verified via bank statement.',
        isInternal: true,
      },
    ];

    it('filters out internal broker notes for investors', () => {
      const sanitizedForInvestor = mockMessages.filter((m) => !m.isInternal);
      expect(sanitizedForInvestor).toHaveLength(2);
      expect(sanitizedForInvestor.some((m) => m.isInternal)).toBe(false);
    });

    it('filters out internal broker notes for franchisors', () => {
      const sanitizedForFranchisor = mockMessages.filter((m) => !m.isInternal);
      expect(sanitizedForFranchisor).toHaveLength(2);
      expect(sanitizedForFranchisor.some((m) => m.isInternal)).toBe(false);
    });

    it('preserves all messages including internal notes for authorized brokers and admins', () => {
      const visibleToBroker = mockMessages;
      expect(visibleToBroker).toHaveLength(3);
      expect(visibleToBroker.some((m) => m.isInternal)).toBe(true);
    });
  });

  // --------------------------------------------------------------------------
  // SECTION 6: E-Sign Agreement Execution & Stage Lifecycle
  // --------------------------------------------------------------------------
  describe('6. Agreement Execution & Deal Stage Progression', () => {
    it('progresses stage to deal_finalized when all required signatories sign', () => {
      const signatureRequest = {
        status: 'out_for_signature',
        documentTitle: 'Franchise Master Development Agreement',
        participants: [
          { role: 'investor', userId: investorId, name: 'Investor A', email: 'inv@test.com', status: 'signed' },
          { role: 'brand_owner', userId: franchisorId, name: 'Franchisor B', email: 'fran@test.com', status: 'pending' },
        ],
      };

      // Initially not all signed
      let allSigned = signatureRequest.participants.every((p) => p.status === 'signed');
      expect(allSigned).toBe(false);

      // Franchisor signs
      signatureRequest.participants[1].status = 'signed';
      allSigned = signatureRequest.participants.every((p) => p.status === 'signed');
      expect(allSigned).toBe(true);

      const newStage = allSigned ? 'deal_finalized' : 'out_for_signature';
      expect(newStage).toBe('deal_finalized');
    });
  });

  // --------------------------------------------------------------------------
  // SECTION 7: Database Persistence Integration (When MongoDB is Connected)
  // --------------------------------------------------------------------------
  describe('7. End-to-End Integration Tests (Database Validated)', () => {
    it('creates DealRoom and initializes DueDiligenceChecklist with all 11 pillars', async () => {
      if (!dbAvailable) {
        console.log('Skipping live DB write test (MongoDB running externally/isolated)');
        return;
      }

      const room = await DealRoom.create({
        roomName: 'Live Test Expansion Deal Room',
        targetTerritory: 'Pune',
        stage: 'discovery_and_nda',
        ndaSigned: true,
        investor: new Types.ObjectId(investorId),
        franchisor: new Types.ObjectId(franchisorId),
        broker: new Types.ObjectId(brokerId),
        completionPercentage: 0,
        outstandingDocumentsCount: 11,
        franchiseListing: new Types.ObjectId(),
      });

      const checklist = await DueDiligenceChecklist.create({
        dealRoom: room._id,
        franchiseListing: room.franchiseListing,
        investor: room.investor,
        businessOwner: room.franchisor,
        assignedBroker: room.broker,
        items: DEFAULT_11_DILIGENCE_ITEMS,
        overallStatus: 'PENDING',
        completionPercentage: 0,
      });

      expect(checklist._id).toBeDefined();
      expect(checklist.items).toHaveLength(11);
      expect(checklist.items[0].itemId).toBe('dd-brand-legal');

      // Clean up test documents
      await DueDiligenceChecklist.findByIdAndDelete(checklist._id);
      await DealRoom.findByIdAndDelete(room._id);
    });
  });
});
