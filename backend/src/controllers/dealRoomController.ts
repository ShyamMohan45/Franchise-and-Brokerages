import path from 'path';
import fs from 'fs';
import { Request, Response } from 'express';
import { DealRoom, IDealRoom } from '../models/DealRoom';
import { BrokerageDeal } from '../models/BrokerageDeal';
import { FranchiseListing } from '../models/FranchiseListing';
import { DueDiligenceChecklist, IDueDiligenceCategoryItem } from '../models/DueDiligenceChecklist';
import { DealDocument } from '../models/DealDocument';
import { DealMessage } from '../models/DealMessage';
import { Task } from '../models/Task';
import { Meeting } from '../models/Meeting';
import { AuditLog } from '../models/AuditLog';
import { Notification } from '../models/Notification';
import { User } from '../models/User';
import { PRIVATE_STORAGE_DIR } from '../middleware/privateUpload';

export const DEFAULT_11_DILIGENCE_ITEMS: IDueDiligenceCategoryItem[] = [
  {
    itemId: 'dd-brand-legal',
    category: 'Brand Legal Documents',
    title: 'Brand Legal Documents & Corporate Incorporation',
    description:
      'Verify Certificate of Incorporation, Memorandum and Articles of Association (MOA/AOA), active Director Identification Numbers (DIN), and MCA corporate compliance filings.',
    status: 'PENDING',
    notes: 'Awaiting corporate charter documents and board resolution.',
  },
  {
    itemId: 'dd-trademark',
    category: 'Trademark Information',
    title: 'Trademark Registration & Proprietary Rights',
    description:
      'Scrutinize registered trademark certificates in India under Class 35 (Retail/Franchise Management) and Class 43 (Hospitality/Food Services) with territorial protection.',
    status: 'PENDING',
    notes: 'Verify trademark application number, registration certificate, and validity.',
  },
  {
    itemId: 'dd-franchise-agreement',
    category: 'Franchise Agreement Review',
    title: 'Franchise Agreement & Master Terms Review',
    description:
      'Review unit and master franchise agreement drafts, non-compete clauses, default remediation terms, and renewal covenants.',
    status: 'PENDING',
    notes: 'Agreement draft pending legal and brokerage counsel review.',
  },
  {
    itemId: 'dd-fees-royalties',
    category: 'Franchise Fee and Royalty Details',
    title: 'Franchise Fee, Royalty Escrow & Marketing Levies',
    description:
      'Verify one-time franchise fee structure, monthly royalty percentages, national marketing fund utilization, and escrow mechanics.',
    status: 'PENDING',
    notes: 'Disclose net billing schedules and royalty computation formulas.',
  },
  {
    itemId: 'dd-financials',
    category: 'Financial Information',
    title: 'Audited Financial Statements & Tax Filings',
    description:
      'Scrutinize past 3 years of audited balance sheets, profit and loss statements, GST returns, and outstanding debt obligations.',
    status: 'PENDING',
    notes: 'Audited financial statements and CA certification required.',
  },
  {
    itemId: 'dd-outlet-performance',
    category: 'Existing Outlet Performance Evidence',
    title: 'Existing Outlet Performance & Unit Economics',
    description:
      'Analyze average gross sales, food/raw material costs (COGS), labor cost ratios, and net payback period across company-owned and operational franchised outlets.',
    status: 'PENDING',
    notes: 'Unit economics and itemized P&L statements for sample operating units.',
  },
  {
    itemId: 'dd-location-feasibility',
    category: 'Location Feasibility',
    title: 'Location Feasibility & Territory Catchment Analysis',
    description:
      'Analyze exclusive territory radius, catchment demographics, pedestrian footfall, competitor density, and catchment spend potential.',
    status: 'PENDING',
    notes: 'Site viability study and catchment demographics evaluation.',
  },
  {
    itemId: 'dd-property-lease',
    category: 'Property and Lease Documents',
    title: 'Property and Commercial Lease Guidelines',
    description:
      'Review minimum carpet area parameters, power/water specifications, lease tenure (lock-in period), and lessor NOC guidelines.',
    status: 'PENDING',
    notes: 'Commercial lease terms draft and site technical checklist.',
  },
  {
    itemId: 'dd-licenses-approvals',
    category: 'Required Licenses and Approvals',
    title: 'Statutory Licenses & Municipal Approvals',
    description:
      'Verify mandatory business licenses including FSSAI, health trade license, fire safety NOC, shop establishment, and environmental clearances.',
    status: 'PENDING',
    notes: 'Statutory regulatory checklist and municipal operating permissions.',
  },
  {
    itemId: 'dd-training-operations',
    category: 'Training and Operational Support',
    title: 'Training Curriculum & Standard Operating Procedures (SOP)',
    description:
      'Assess comprehensive operations manuals, initial promoter and staff training modules, supply chain SLAs, and POS/ERP integration.',
    status: 'PENDING',
    notes: 'Operations manual and corporate training schedule review.',
  },
  {
    itemId: 'dd-investor-readiness',
    category: 'Investor Financial Readiness',
    title: 'Investor Financial Proof & Background Verification',
    description:
      'Confirm investor liquid capital availability, net worth proof, credit history declaration, and executive background review.',
    status: 'PENDING',
    notes: 'Investor net worth declaration and liquid solvency documentation.',
  },
];

/**
 * Helper to check role-based access for a deal room
 */
export function checkDealRoomAccess(
  user: any,
  room: any
): { allowed: boolean; isInternalPrivileged: boolean; role: string } {
  const role = user.role;
  const userId = (user._id || user.id)?.toString();

  if (role === 'admin' || role === 'super_admin') {
    return { allowed: true, isInternalPrivileged: true, role: 'admin' };
  }

  const brokerId = (
    room.assignedBroker?._id ||
    room.assignedBroker ||
    room.broker?._id ||
    room.broker
  )?.toString();
  if (role === 'broker' && brokerId === userId) {
    return { allowed: true, isInternalPrivileged: true, role: 'broker' };
  }

  const investorId = (room.investor?._id || room.investor)?.toString();
  if (role === 'investor' && investorId === userId) {
    return { allowed: true, isInternalPrivileged: false, role: 'investor' };
  }

  const franchisorId = (
    room.franchisor?._id ||
    room.franchisor ||
    room.businessOwner?._id ||
    room.businessOwner
  )?.toString();
  if ((role === 'business_owner' || role === 'brand_owner') && franchisorId === userId) {
    return { allowed: true, isInternalPrivileged: false, role: 'brand_owner' };
  }

  return { allowed: false, isInternalPrivileged: false, role };
}

/**
 * Ensure DealRoom and DueDiligenceChecklist exist for a given BrokerageDeal
 */
export async function getOrCreateDealRoomForDeal(dealId: string): Promise<any> {
  let room = await DealRoom.findOne({ $or: [{ deal: dealId }, { dealRef: dealId }] });

  const deal = await BrokerageDeal.findById(dealId)
    .populate('franchiseListing')
    .populate('investor')
    .populate('businessOwner')
    .populate('assignedBroker');

  if (!deal) return null;

  const listing: any = deal.franchiseListing;

  if (!room) {
    // Create new DealRoom
    room = await DealRoom.create({
      deal: deal._id,
      dealRef: deal._id,
      franchiseListing: listing._id,
      franchisor: deal.businessOwner,
      businessOwner: deal.businessOwner,
      investor: deal.investor,
      broker: deal.assignedBroker,
      assignedBroker: deal.assignedBroker,
      roomName: `${listing?.brandName || 'Brand'} - ${deal.dealTitle || 'Franchise Deal Room'}`,
      targetTerritory: listing?.targetTerritories?.[0] || 'Primary Metro Territory',
      stage: (deal.stage as any) || 'discovery_and_nda',
      ndaSigned: true,
      ndaSignedAt: new Date(),
      completionPercentage: 0,
      outstandingDocumentsCount: 11,
      rejectedOrClarificationCount: 0,
      dealMilestones: [
        { title: 'Deal Room Initialized & NDA Executed', completed: true, completedAt: new Date() },
        { title: 'Due Diligence & Audit Checklist Review', completed: false },
        { title: 'Territory Exclusivity & Commercial Terms', completed: false },
        { title: 'Franchise Agreement Drafting & E-Sign', completed: false },
        { title: 'Closing Escrow & Franchisee Onboarding', completed: false },
      ],
    });
  }

  // Ensure Due Diligence Checklist exists
  let checklist = await DueDiligenceChecklist.findOne({
    $or: [{ deal: deal._id }, { dealRoom: room._id }, { brokerageDeal: deal._id }],
  });

  if (!checklist) {
    checklist = await DueDiligenceChecklist.create({
      deal: deal._id,
      dealRoom: room._id,
      brokerageDeal: deal._id,
      franchiseListing: listing._id,
      investor: deal.investor,
      businessOwner: deal.businessOwner,
      assignedBroker: deal.assignedBroker,
      items: DEFAULT_11_DILIGENCE_ITEMS,
      overallStatus: 'PENDING',
      completionPercentage: 0,
      riskSummary: 'Due diligence initialized. 11 core statutory, commercial, and operational checks pending review.',
    });
  }

  if (!room.dueDiligenceChecklist || room.dueDiligenceChecklist.toString() !== checklist._id.toString()) {
    room.dueDiligenceChecklist = checklist._id as any;
    await room.save();
  }

  return room;
}

/**
 * 1. GET /api/v1/deal-rooms
 * Retrieve deal rooms authorized for the current user
 */
export const getDealRooms = async (req: Request, res: Response): Promise<void> => {
  try {
    const user = req.user!;
    const userId = user._id.toString();
    const role = user.role;

    let filter: any = {};
    if (role === 'business_owner' || role === 'brand_owner') {
      filter = { $or: [{ franchisor: userId }, { businessOwner: userId }] };
    } else if (role === 'investor') {
      filter = { investor: userId };
    } else if (role === 'broker') {
      filter = { $or: [{ broker: userId }, { assignedBroker: userId }] };
    }
    // Admin / Super Admin get all

    const rooms = await DealRoom.find(filter)
      .populate('franchiseListing', 'brandName industry slug logoUrl bannerUrl investmentRange')
      .populate('franchisor', 'fullName email phone role')
      .populate('businessOwner', 'fullName email phone role')
      .populate('investor', 'fullName email phone role')
      .populate('broker', 'fullName email phone role')
      .populate('assignedBroker', 'fullName email phone role')
      .populate('deal')
      .populate('dueDiligenceChecklist')
      .sort({ updatedAt: -1 });

    res.json({
      success: true,
      count: rooms.length,
      data: rooms,
      disclaimer:
        'All deal room files and statuses are for brokerage evaluation and transaction due diligence. Uploads do not constitute statutory certification or legal validity without executed counsel agreements.',
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * 2. GET /api/v1/deal-rooms/:id
 * Retrieve single deal room with full details, role access verification, tasks, meetings, and activities
 */
export const getDealRoomById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const user = req.user!;

    // Find by room _id or deal _id
    let room = await DealRoom.findOne({
      $or: [{ _id: id.match(/^[0-9a-fA-F]{24}$/) ? id : null }, { deal: id }, { dealRef: id }],
    })
      .populate('franchiseListing')
      .populate('franchisor', 'fullName email phone role')
      .populate('businessOwner', 'fullName email phone role')
      .populate('investor', 'fullName email phone role')
      .populate('broker', 'fullName email phone role')
      .populate('assignedBroker', 'fullName email phone role')
      .populate('deal')
      .populate('dueDiligenceChecklist');

    // If deal exists but room not yet created, auto-init
    if (!room && id.match(/^[0-9a-fA-F]{24}$/)) {
      const deal = await BrokerageDeal.findById(id);
      if (deal) {
        room = await getOrCreateDealRoomForDeal(deal._id.toString());
        if (room) {
          room = await DealRoom.findById(room._id)
            .populate('franchiseListing')
            .populate('franchisor', 'fullName email phone role')
            .populate('businessOwner', 'fullName email phone role')
            .populate('investor', 'fullName email phone role')
            .populate('broker', 'fullName email phone role')
            .populate('assignedBroker', 'fullName email phone role')
            .populate('deal')
            .populate('dueDiligenceChecklist');
        }
      }
    }

    if (!room) {
      res.status(404).json({ success: false, message: 'Deal room not found' });
      return;
    }

    // Role-based access check
    const access = checkDealRoomAccess(user, room);
    if (!access.allowed) {
      res.status(403).json({
        success: false,
        message: 'Forbidden. You do not have permission to access this private Deal Room.',
      });
      return;
    }

    // Fetch related activities, tasks, meetings
    const dealId = room.deal?._id || room.deal || room.dealRef;
    const [tasks, meetings, documentsCount] = await Promise.all([
      dealId ? Task.find({ relatedDeal: dealId }).sort({ dueDate: 1 }).limit(10) : [],
      dealId
        ? Meeting.find({
            $or: [{ relatedDeal: dealId }, { investor: room.investor?._id || room.investor }],
          })
            .sort({ scheduledAt: -1 })
            .limit(10)
        : [],
      DealDocument.countDocuments({ dealRoom: room._id }),
    ]);

    // Calculate live progress metrics from DueDiligenceChecklist if available
    let completionPercentage = room.completionPercentage || 0;
    let outstandingCount = 0;
    let rejectedOrClarificationCount = 0;

    const checklist: any = room.dueDiligenceChecklist;
    if (checklist && checklist.items && checklist.items.length > 0) {
      const total = checklist.items.length;
      const approved = checklist.items.filter(
        (i: any) => i.status === 'APPROVED' || i.status === 'verified'
      ).length;
      completionPercentage = Math.round((approved / total) * 100);
      outstandingCount = checklist.items.filter(
        (i: any) =>
          i.status === 'PENDING' ||
          i.status === 'IN_PROGRESS' ||
          i.status === 'SUBMITTED' ||
          i.status === 'UNDER_REVIEW' ||
          i.status === 'pending' ||
          i.status === 'in_review'
      ).length;
      rejectedOrClarificationCount = checklist.items.filter(
        (i: any) =>
          i.status === 'REJECTED' ||
          i.status === 'NEEDS_CLARIFICATION' ||
          i.status === 'flagged'
      ).length;
    }

    res.json({
      success: true,
      data: {
        ...room.toObject(),
        completionPercentage,
        outstandingCount,
        rejectedOrClarificationCount,
        documentsCount,
        recentTasks: tasks,
        recentMeetings: meetings,
        userRoleInRoom: access.role,
        isInternalPrivileged: access.isInternalPrivileged,
        legalDisclaimer:
          'Private deal workspace for authorized participants. Uploaded files, checklists, and notes do not represent statutory compliance guarantees or legal certifications until formal legal counsel execution.',
      },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * 3. GET /api/v1/deal-rooms/:id/documents
 * List all documents for this deal room, filtered by user permissions
 */
export const getDealRoomDocuments = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const user = req.user!;

    const room = await DealRoom.findById(id);
    if (!room) {
      res.status(404).json({ success: false, message: 'Deal room not found' });
      return;
    }

    const access = checkDealRoomAccess(user, room);
    if (!access.allowed) {
      res.status(403).json({ success: false, message: 'Access denied to this deal room.' });
      return;
    }

    const filter: any = { dealRoom: room._id };

    // Investors and brand owners cannot see internal documents
    if (!access.isInternalPrivileged) {
      filter.isInternalOnly = false;
      const roleKey = user.role === 'business_owner' ? 'business_owner' : user.role;
      filter.allowedRoles = { $in: [roleKey, 'investor', 'brand_owner', 'business_owner'] };
    }

    const documents = await DealDocument.find(filter)
      .populate('uploadedBy', 'fullName email role')
      .populate('reviewedBy', 'fullName email role')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: documents.length,
      data: documents,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * 4. POST /api/v1/deal-rooms/:id/documents
 * Upload document into private storage with metadata and role permissions
 */
export const uploadDealRoomDocument = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const user = req.user!;
    const file = req.file;

    if (!file) {
      res.status(400).json({ success: false, message: 'No file provided or unsupported file format.' });
      return;
    }

    const room = await DealRoom.findById(id);
    if (!room) {
      res.status(404).json({ success: false, message: 'Deal room not found' });
      return;
    }

    const access = checkDealRoomAccess(user, room);
    if (!access.allowed) {
      // Remove uploaded file from private storage on unauthorized attempt
      if (fs.existsSync(file.path)) fs.unlinkSync(file.path);
      res.status(403).json({ success: false, message: 'You are not an authorized participant of this deal room.' });
      return;
    }

    const {
      title,
      category,
      isInternalOnly,
      allowedRoles,
      relatedDiligenceItem,
      notes,
    } = req.body;

    const parsedInternalOnly =
      access.isInternalPrivileged && (isInternalOnly === true || isInternalOnly === 'true');

    let parsedRoles = ['investor', 'business_owner', 'brand_owner', 'broker', 'admin', 'super_admin'];
    if (allowedRoles) {
      parsedRoles = Array.isArray(allowedRoles)
        ? allowedRoles
        : allowedRoles.split(',').map((r: string) => r.trim());
    }

    const doc = await DealDocument.create({
      dealRoom: room._id,
      deal: room.deal || room.dealRef,
      title: title || file.originalname,
      fileName: file.originalname,
      storageKey: file.filename,
      filePath: path.relative(process.cwd(), file.path),
      category: category || 'OTHER_SUPPORTING',
      uploadedBy: user._id,
      uploadedAt: new Date(),
      fileSize: file.size,
      mimeType: file.mimetype,
      status: 'SUBMITTED',
      isInternalOnly: parsedInternalOnly,
      allowedRoles: parsedRoles,
      currentVersion: 1,
      versions: [
        {
          versionNumber: 1,
          fileName: file.originalname,
          storageKey: file.filename,
          fileSize: file.size,
          mimeType: file.mimetype,
          uploadedBy: user._id,
          uploadedAt: new Date(),
          changeNote: notes || 'Initial document upload',
        },
      ],
      reviewerNotes: notes || '',
      relatedDiligenceItem: relatedDiligenceItem || '',
      isLegallyCertified: false,
    });

    // If related to a diligence item, attach to checklist
    if (relatedDiligenceItem && room.dueDiligenceChecklist) {
      await DueDiligenceChecklist.updateOne(
        { _id: room.dueDiligenceChecklist, 'items.itemId': relatedDiligenceItem },
        {
          $addToSet: { 'items.$.evidenceDocuments': doc._id },
          $set: { 'items.$.status': 'SUBMITTED' },
        }
      );
    }

    // Append to DealRoom legacy sharedDocuments for backwards compatibility
    room.sharedDocuments.push({
      docId: doc._id.toString(),
      title: doc.title,
      docType: doc.category,
      fileUrl: `/api/v1/deal-rooms/${room._id}/documents/${doc._id}/download`,
      uploadedBy: user._id,
      accessRoles: parsedRoles,
      uploadedAt: new Date(),
    });
    await room.save();

    // Log in AuditLog
    await AuditLog.create({
      actor: user._id,
      actorRole: user.role,
      actorEmail: user.email,
      action: 'DEAL_DOCUMENT_UPLOADED',
      entityType: 'DealDocument',
      entityId: doc._id.toString(),
      details: {
        dealRoomId: room._id.toString(),
        category: doc.category,
        fileName: doc.fileName,
        fileSize: doc.fileSize,
      },
    });

    // Record activity in BrokerageDeal
    if (room.deal) {
      await BrokerageDeal.findByIdAndUpdate(room.deal, {
        $push: {
          activities: {
            type: 'note',
            summary: `Document uploaded: ${doc.title} (${doc.category})`,
            performedBy: user._id,
            timestamp: new Date(),
          },
        },
      });
    }

    // Generate notification for deal participants
    const notifyRecipient =
      user.role === 'investor' || user.role === 'business_owner'
        ? (room.assignedBroker || room.broker)
        : room.investor;

    if (notifyRecipient) {
      await Notification.create({
        recipient: notifyRecipient,
        type: 'document',
        title: 'New Deal Room Document Uploaded',
        message: `${doc.title} (${doc.category}) was uploaded to ${room.roomName}.`,
        actionUrl: `/deal-room/${room._id}`,
        metadata: { dealRoomId: room._id, docId: doc._id },
      });
    }

    res.status(201).json({
      success: true,
      message: 'Document uploaded securely to private storage',
      data: doc,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * 5. POST /api/v1/deal-rooms/:id/documents/:docId/versions
 * Upload a new version for an existing document
 */
export const uploadDealDocumentVersion = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id, docId } = req.params;
    const user = req.user!;
    const file = req.file;

    if (!file) {
      res.status(400).json({ success: false, message: 'No file provided for new version.' });
      return;
    }

    const room = await DealRoom.findById(id);
    if (!room) {
      res.status(404).json({ success: false, message: 'Deal room not found' });
      return;
    }

    const access = checkDealRoomAccess(user, room);
    if (!access.allowed) {
      if (fs.existsSync(file.path)) fs.unlinkSync(file.path);
      res.status(403).json({ success: false, message: 'Unauthorized to upload new version.' });
      return;
    }

    const doc = await DealDocument.findOne({ _id: docId, dealRoom: room._id });
    if (!doc) {
      if (fs.existsSync(file.path)) fs.unlinkSync(file.path);
      res.status(404).json({ success: false, message: 'Document not found' });
      return;
    }

    const newVersionNumber = doc.currentVersion + 1;
    const changeNote = req.body.changeNote || `Version ${newVersionNumber} revision`;

    // Append to versions array
    doc.versions.push({
      versionNumber: newVersionNumber,
      fileName: file.originalname,
      storageKey: file.filename,
      fileSize: file.size,
      mimeType: file.mimetype,
      uploadedBy: user._id,
      uploadedAt: new Date(),
      changeNote,
    });

    // Update current active pointers
    doc.currentVersion = newVersionNumber;
    doc.fileName = file.originalname;
    doc.storageKey = file.filename;
    doc.filePath = path.relative(process.cwd(), file.path);
    doc.fileSize = file.size;
    doc.mimeType = file.mimetype;
    doc.status = 'UNDER_REVIEW';

    await doc.save();

    await AuditLog.create({
      actor: user._id,
      actorRole: user.role,
      actorEmail: user.email,
      action: 'DEAL_DOCUMENT_VERSION_UPLOADED',
      entityType: 'DealDocument',
      entityId: doc._id.toString(),
      details: {
        versionNumber: newVersionNumber,
        fileName: file.originalname,
      },
    });

    res.json({
      success: true,
      message: `Document version ${newVersionNumber} uploaded successfully`,
      data: doc,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * 6. GET /api/v1/deal-rooms/:id/documents/:docId/download
 * Secure document download from private storage with role verification and audit logging
 */
export const downloadDealDocument = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id, docId } = req.params;
    const user = req.user!;

    const room = await DealRoom.findById(id);
    if (!room) {
      res.status(404).json({ success: false, message: 'Deal room not found' });
      return;
    }

    const access = checkDealRoomAccess(user, room);
    if (!access.allowed) {
      res.status(403).json({ success: false, message: 'Forbidden. You do not have permission to download deal files.' });
      return;
    }

    const doc = await DealDocument.findOne({ _id: docId, dealRoom: room._id });
    if (!doc) {
      res.status(404).json({ success: false, message: 'Document not found' });
      return;
    }

    // Confidentiality check for internal only docs
    if (doc.isInternalOnly && !access.isInternalPrivileged) {
      res.status(403).json({
        success: false,
        message: 'Access denied. This document is designated for internal brokerage review only.',
      });
      return;
    }

    // Role permission check
    const userRoleKey = user.role === 'business_owner' ? 'business_owner' : user.role;
    if (
      !access.isInternalPrivileged &&
      !doc.allowedRoles.includes(userRoleKey as any) &&
      !doc.allowedRoles.includes('brand_owner')
    ) {
      res.status(403).json({
        success: false,
        message: 'Access denied. Your role is not authorized to download this file.',
      });
      return;
    }

    // Check physical file in private storage
    const absolutePath = path.isAbsolute(doc.filePath)
      ? doc.filePath
      : path.join(process.cwd(), doc.filePath);

    if (!fs.existsSync(absolutePath)) {
      res.status(404).json({ success: false, message: 'File is not present on physical storage.' });
      return;
    }

    // Record access history
    doc.accessHistory.push({
      user: user._id,
      action: 'download',
      timestamp: new Date(),
      ipAddress: req.ip || '',
    });
    await doc.save();

    await AuditLog.create({
      actor: user._id,
      actorRole: user.role,
      actorEmail: user.email,
      action: 'DEAL_DOCUMENT_DOWNLOADED',
      entityType: 'DealDocument',
      entityId: doc._id.toString(),
      details: {
        fileName: doc.fileName,
        storageKey: doc.storageKey,
      },
    });

    res.download(absolutePath, doc.fileName);
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * 7. PATCH /api/v1/deal-rooms/:id/documents/:docId/status
 * Update document review status
 */
export const updateDealDocumentStatus = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id, docId } = req.params;
    const { status, reviewerNotes } = req.body;
    const user = req.user!;

    const room = await DealRoom.findById(id);
    if (!room) {
      res.status(404).json({ success: false, message: 'Deal room not found' });
      return;
    }

    const access = checkDealRoomAccess(user, room);
    if (!access.isInternalPrivileged) {
      res.status(403).json({ success: false, message: 'Only brokers and admins can approve or reject documents.' });
      return;
    }

    const doc = await DealDocument.findOne({ _id: docId, dealRoom: room._id });
    if (!doc) {
      res.status(404).json({ success: false, message: 'Document not found' });
      return;
    }

    doc.status = status;
    if (reviewerNotes !== undefined) doc.reviewerNotes = reviewerNotes;
    doc.reviewedBy = user._id;
    doc.reviewedAt = new Date();
    await doc.save();

    await AuditLog.create({
      actor: user._id,
      actorRole: user.role,
      actorEmail: user.email,
      action: 'DEAL_DOCUMENT_STATUS_UPDATED',
      entityType: 'DealDocument',
      entityId: doc._id.toString(),
      details: { status, reviewerNotes },
    });

    res.json({ success: true, message: 'Document status updated', data: doc });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * 8. DELETE /api/v1/deal-rooms/:id/documents/:docId
 * Delete document or supersede
 */
export const deleteDealDocument = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id, docId } = req.params;
    const user = req.user!;

    const room = await DealRoom.findById(id);
    if (!room) {
      res.status(404).json({ success: false, message: 'Deal room not found' });
      return;
    }

    const doc = await DealDocument.findOne({ _id: docId, dealRoom: room._id });
    if (!doc) {
      res.status(404).json({ success: false, message: 'Document not found' });
      return;
    }

    const isUploader = doc.uploadedBy.toString() === user._id.toString();
    const isAdmin = user.role === 'admin' || user.role === 'super_admin';
    const isAssignedBroker =
      user.role === 'broker' &&
      (room.assignedBroker?._id || room.assignedBroker || room.broker)?.toString() === user._id.toString();

    if (!isUploader && !isAdmin && !isAssignedBroker) {
      res.status(403).json({ success: false, message: 'Unauthorized to delete this document.' });
      return;
    }

    // Remove physical file from private storage
    const absolutePath = path.isAbsolute(doc.filePath)
      ? doc.filePath
      : path.join(process.cwd(), doc.filePath);
    if (fs.existsSync(absolutePath)) {
      try {
        fs.unlinkSync(absolutePath);
      } catch (err) {
        console.error('Failed to unlink private file:', err);
      }
    }

    await DealDocument.deleteOne({ _id: doc._id });

    // Also remove from room.sharedDocuments
    room.sharedDocuments = room.sharedDocuments.filter((sd) => sd.docId !== docId);
    await room.save();

    await AuditLog.create({
      actor: user._id,
      actorRole: user.role,
      actorEmail: user.email,
      action: 'DEAL_DOCUMENT_DELETED',
      entityType: 'DealDocument',
      entityId: docId,
    });

    res.json({ success: true, message: 'Document deleted successfully' });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * 9. GET /api/v1/deal-rooms/:id/due-diligence
 * Get Due Diligence Checklist with all 11 categories and completion percentage
 */
export const getDealRoomDueDiligence = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const user = req.user!;

    const room = await DealRoom.findById(id);
    if (!room) {
      res.status(404).json({ success: false, message: 'Deal room not found' });
      return;
    }

    const access = checkDealRoomAccess(user, room);
    if (!access.allowed) {
      res.status(403).json({ success: false, message: 'Access denied to this deal room.' });
      return;
    }

    let checklist = await DueDiligenceChecklist.findOne({
      $or: [{ dealRoom: room._id }, { deal: room.deal || room.dealRef }],
    }).populate({
      path: 'items.evidenceDocuments',
      select: 'title fileName fileSize category status isInternalOnly createdAt',
    });

    if (!checklist) {
      checklist = await DueDiligenceChecklist.create({
        deal: room.deal || room.dealRef,
        dealRoom: room._id,
        brokerageDeal: room.deal || room.dealRef,
        franchiseListing: room.franchiseListing,
        investor: room.investor,
        businessOwner: room.franchisor || room.businessOwner,
        assignedBroker: room.assignedBroker || room.broker,
        items: DEFAULT_11_DILIGENCE_ITEMS,
        overallStatus: 'PENDING',
        completionPercentage: 0,
      });
      room.dueDiligenceChecklist = checklist._id as any;
      await room.save();
    }

    // Filter evidence documents for non-privileged users
    const sanitizedItems = checklist.items.map((item) => {
      const itemObj = (item as any).toObject ? (item as any).toObject() : { ...item };
      if (!access.isInternalPrivileged && itemObj.evidenceDocuments) {
        itemObj.evidenceDocuments = itemObj.evidenceDocuments.filter(
          (doc: any) => !doc.isInternalOnly
        );
      }
      return itemObj;
    });

    res.json({
      success: true,
      data: {
        ...checklist.toObject(),
        items: sanitizedItems,
        disclaimer:
          'Due diligence checklist marks administrative brokerage reviews. Uploads and approved checks do not constitute statutory legal certifications or investment warranties.',
      },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * 10. PATCH /api/v1/deal-rooms/:id/due-diligence/:itemId
 * Update due diligence item status, reviewer notes, evidence documents, and clarification request
 */
export const updateDealRoomDueDiligenceItem = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id, itemId } = req.params;
    const { status, notes, reviewerNotes, evidenceDocumentIds, clarificationRequest, deadline } =
      req.body;
    const user = req.user!;

    const room = await DealRoom.findById(id);
    if (!room) {
      res.status(404).json({ success: false, message: 'Deal room not found' });
      return;
    }

    const access = checkDealRoomAccess(user, room);
    if (!access.allowed) {
      res.status(403).json({ success: false, message: 'Unauthorized to update due diligence checklist.' });
      return;
    }

    let checklist = await DueDiligenceChecklist.findOne({
      $or: [{ dealRoom: room._id }, { deal: room.deal || room.dealRef }],
    });

    if (!checklist) {
      res.status(404).json({ success: false, message: 'Due diligence checklist not initialized.' });
      return;
    }

    const item = checklist.items.find((i) => i.itemId === itemId);
    if (!item) {
      res.status(404).json({ success: false, message: `Checklist item ${itemId} not found.` });
      return;
    }

    // Role restrictions: only brokers and admins can mark APPROVED or REJECTED
    if ((status === 'APPROVED' || status === 'REJECTED') && !access.isInternalPrivileged) {
      res.status(403).json({
        success: false,
        message: 'Only authorized brokers or admins can approve or reject diligence items.',
      });
      return;
    }

    if (status) item.status = status;
    if (notes !== undefined) item.notes = notes;
    if (reviewerNotes !== undefined && access.isInternalPrivileged) {
      item.reviewerNotes = reviewerNotes;
    }
    if (clarificationRequest !== undefined) {
      item.clarificationRequest = clarificationRequest;
    }
    if (deadline) {
      item.deadline = new Date(deadline);
    }
    if (evidenceDocumentIds && Array.isArray(evidenceDocumentIds)) {
      item.evidenceDocuments = evidenceDocumentIds as any;
    }

    if (status === 'APPROVED' || status === 'verified') {
      item.verifiedAt = new Date();
      item.verifiedBy = user._id;
      item.reviewedAt = new Date();
      item.reviewedBy = user._id;
    }

    // Recalculate completion percentage
    const totalCount = checklist.items.length;
    const approvedCount = checklist.items.filter(
      (i) => i.status === 'APPROVED' || i.status === 'verified'
    ).length;
    checklist.completionPercentage = Math.round((approvedCount / totalCount) * 100);

    // Update overallStatus
    if (checklist.completionPercentage === 100) {
      checklist.overallStatus = 'APPROVED';
    } else if (checklist.items.some((i) => i.status === 'REJECTED' || i.status === 'flagged')) {
      checklist.overallStatus = 'REJECTED';
    } else if (checklist.items.some((i) => i.status === 'NEEDS_CLARIFICATION')) {
      checklist.overallStatus = 'NEEDS_CLARIFICATION';
    } else if (checklist.items.some((i) => i.status === 'UNDER_REVIEW' || i.status === 'in_review')) {
      checklist.overallStatus = 'UNDER_REVIEW';
    } else {
      checklist.overallStatus = 'IN_PROGRESS';
    }

    checklist.reviewedByBroker = user._id;
    await checklist.save();

    // Sync with DealRoom
    room.completionPercentage = checklist.completionPercentage;
    room.outstandingDocumentsCount = checklist.items.filter(
      (i) =>
        i.status === 'PENDING' ||
        i.status === 'IN_PROGRESS' ||
        i.status === 'SUBMITTED' ||
        i.status === 'UNDER_REVIEW'
    ).length;
    room.rejectedOrClarificationCount = checklist.items.filter(
      (i) => i.status === 'REJECTED' || i.status === 'NEEDS_CLARIFICATION'
    ).length;
    await room.save();

    // Log in AuditLog
    await AuditLog.create({
      actor: user._id,
      actorRole: user.role,
      actorEmail: user.email,
      action: 'DUE_DILIGENCE_ITEM_UPDATED',
      entityType: 'DueDiligenceChecklist',
      entityId: checklist._id.toString(),
      details: {
        itemId,
        newStatus: status,
        completionPercentage: checklist.completionPercentage,
      },
    });

    // Generate notification for diligence update
    if (status === 'NEEDS_CLARIFICATION' || status === 'REJECTED' || status === 'APPROVED') {
      const recipient = room.investor || room.franchisor;
      if (recipient) {
        await Notification.create({
          recipient,
          type: 'deal',
          title: `Due Diligence Update: ${item.title}`,
          message: `Checklist item ${item.title} has been updated to ${status}.${clarificationRequest ? ' Action required: ' + clarificationRequest : ''}`,
          actionUrl: `/deal-room/${room._id}`,
          metadata: { dealRoomId: room._id, itemId },
        });
      }
    }

    res.json({
      success: true,
      message: `Due diligence item ${itemId} updated successfully`,
      data: checklist,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * 11. GET /api/v1/deal-rooms/:id/messages
 * Retrieve deal messages with strict privacy for internal broker notes
 */
export const getDealRoomMessages = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const user = req.user!;

    const room = await DealRoom.findById(id);
    if (!room) {
      res.status(404).json({ success: false, message: 'Deal room not found' });
      return;
    }

    const access = checkDealRoomAccess(user, room);
    if (!access.allowed) {
      res.status(403).json({ success: false, message: 'Access denied.' });
      return;
    }

    const filter: any = { dealRoom: room._id };

    // Strict internal note privacy: investors and brand owners NEVER receive isInternal: true messages
    if (!access.isInternalPrivileged) {
      filter.isInternal = false;
    }

    const messages = await DealMessage.find(filter)
      .populate('sender', 'fullName email role')
      .populate('relatedDocument', 'title fileName category')
      .sort({ createdAt: 1 });

    res.json({
      success: true,
      count: messages.length,
      data: messages,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * 12. POST /api/v1/deal-rooms/:id/messages
 * Post message or internal broker note with role validation
 */
export const postDealRoomMessage = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { text, isInternal, relatedDocument, relatedDiligenceItem } = req.body;
    const user = req.user!;

    if (!text || !text.trim()) {
      res.status(400).json({ success: false, message: 'Message text is required.' });
      return;
    }

    const room = await DealRoom.findById(id);
    if (!room) {
      res.status(404).json({ success: false, message: 'Deal room not found' });
      return;
    }

    const access = checkDealRoomAccess(user, room);
    if (!access.allowed) {
      res.status(403).json({ success: false, message: 'Access denied to post in this deal room.' });
      return;
    }

    // Only broker and admin can mark a message as internal
    const isInternalNote = access.isInternalPrivileged && Boolean(isInternal);

    const message = await DealMessage.create({
      dealRoom: room._id,
      deal: room.deal || room.dealRef,
      sender: user._id,
      senderRole: user.role,
      text: text.trim(),
      isInternal: isInternalNote,
      relatedDocument: relatedDocument || undefined,
      relatedDiligenceItem: relatedDiligenceItem || undefined,
    });

    // Populate sender before returning
    await message.populate('sender', 'fullName email role');

    // Also sync to DealRoom embedded messages for legacy UI compatibility if not internal
    if (!isInternalNote) {
      const senderRoleKey =
        user.role === 'business_owner'
          ? 'franchisor'
          : user.role === 'investor'
          ? 'investor'
          : 'broker';
      room.messages.push({
        sender: user._id,
        senderRole: senderRoleKey,
        text: text.trim(),
        isInternal: false,
        createdAt: new Date(),
      });
      await room.save();
    }

    res.status(201).json({
      success: true,
      data: message,
    });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
};

/**
 * 13. POST /api/v1/deal-rooms/:id/sign
 * Sign deal room agreement (e-signature simulation)
 */
export const signDealRoomDocument = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const user = req.user!;
    const userId = user._id.toString();

    const room = await DealRoom.findById(id);
    if (!room) {
      res.status(404).json({ success: false, message: 'Deal room not found' });
      return;
    }

    const access = checkDealRoomAccess(user, room);
    if (!access.allowed) {
      res.status(403).json({ success: false, message: 'Access denied to sign this agreement.' });
      return;
    }

    let participant = room.signatureRequest.participants.find(
      (p) => p.userId.toString() === userId
    );

    if (!participant) {
      // Add participant if not listed
      room.signatureRequest.participants.push({
        role: access.role,
        userId: user._id,
        name: user.fullName || 'Signatory Partner',
        email: user.email,
        status: 'signed',
        signedAt: new Date(),
        ipAddress: req.ip || '127.0.0.1',
      });
    } else {
      participant.status = 'signed';
      participant.signedAt = new Date();
      participant.ipAddress = req.ip || '127.0.0.1';
    }

    const allSigned =
      room.signatureRequest.participants.length > 0 &&
      room.signatureRequest.participants.every((p) => p.status === 'signed');

    if (allSigned) {
      room.signatureRequest.status = 'completed';
      room.signatureRequest.completedAt = new Date();
      room.stage = 'deal_finalized';

      const sigMilestone = room.dealMilestones.find((m) => m.title.includes('Signature') || m.title.includes('Agreement'));
      if (sigMilestone) {
        sigMilestone.completed = true;
        sigMilestone.completedAt = new Date();
      }
    }

    await room.save();

    await AuditLog.create({
      actor: user._id,
      actorRole: user.role,
      actorEmail: user.email,
      action: 'DEAL_ROOM_DOCUMENT_SIGNED',
      entityType: 'DealRoom',
      entityId: room._id.toString(),
      details: {
        allSigned,
      },
    });

    res.json({
      success: true,
      message: 'Agreement signed successfully',
      data: room,
    });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
};
