import { Request, Response } from 'express';
import { SOPDocument } from '../models/SOPDocument';
import { LegalDocument } from '../models/LegalDocument';
import { DocumentVersion } from '../models/DocumentVersion';
import { BusinessProfile } from '../models/BusinessProfile';
import { AuditLog } from '../models/AuditLog';
import { sendSuccess, sendError } from '../utils/response';

// SOP Operations
export async function getSopDocuments(req: Request, res: Response): Promise<any> {
  let businessId = req.query.businessId as string;

  if (!businessId) {
    const business = await BusinessProfile.findOne({ user: req.user!._id });
    if (!business && req.user!.role !== 'admin' && req.user!.role !== 'super_admin') {
      return sendError(res, 'Business profile not found', 404);
    }
    if (business) businessId = business._id.toString();
  }

  const filter: any = {};
  if (businessId) filter.business = businessId;

  const sops = await SOPDocument.find(filter)
    .populate('author', 'fullName email')
    .populate('reviewedBy', 'fullName email')
    .sort({ createdAt: -1 });

  return sendSuccess(res, sops);
}

export async function createSopDocument(req: Request, res: Response): Promise<any> {
  const { businessId, ...data } = req.body;
  const business = await BusinessProfile.findById(businessId);

  if (!business) {
    return sendError(res, 'Business not found', 404);
  }

  const isOwner = business.user.toString() === req.user!._id.toString();
  const isAdmin = req.user!.role === 'admin' || req.user!.role === 'super_admin';

  if (!isOwner && !isAdmin) {
    return sendError(res, 'Unauthorized to add SOP for this business', 403);
  }

  const sop = await SOPDocument.create({
    ...data,
    business: business._id,
    author: req.user!._id,
    version: 1,
    status: isAdmin ? 'approved' : 'under_review',
  });

  await DocumentVersion.create({
    documentRef: sop._id,
    documentType: 'SOP',
    versionNumber: 1,
    changeSummary: 'Initial document draft created',
    changedBy: req.user!._id,
  });

  await AuditLog.create({
    actor: req.user!._id,
    actorRole: req.user!.role,
    actorEmail: req.user!.email,
    action: 'SOP_CREATED',
    entityType: 'SOPDocument',
    entityId: sop._id.toString(),
  });

  return sendSuccess(res, sop, 'SOP document created successfully', 201);
}

export async function updateSopStatus(req: Request, res: Response): Promise<any> {
  const { id } = req.params;
  const { status, reviewNotes } = req.body;

  const sop = await SOPDocument.findById(id);
  if (!sop) {
    return sendError(res, 'SOP document not found', 404);
  }

  sop.status = status;
  if (reviewNotes) sop.reviewNotes = reviewNotes;
  sop.reviewedBy = req.user!._id;
  await sop.save();

  await AuditLog.create({
    actor: req.user!._id,
    actorRole: req.user!.role,
    actorEmail: req.user!.email,
    action: 'SOP_STATUS_UPDATED',
    entityType: 'SOPDocument',
    entityId: sop._id.toString(),
    details: { status, reviewNotes },
  });

  return sendSuccess(res, sop, 'SOP review status updated');
}

// Legal FDD Operations
export async function getLegalDocuments(req: Request, res: Response): Promise<any> {
  let businessId = req.query.businessId as string;

  if (!businessId) {
    const business = await BusinessProfile.findOne({ user: req.user!._id });
    if (!business && req.user!.role !== 'admin' && req.user!.role !== 'super_admin') {
      return sendError(res, 'Business profile not found', 404);
    }
    if (business) businessId = business._id.toString();
  }

  const filter: any = {};
  if (businessId) filter.business = businessId;

  const docs = await LegalDocument.find(filter)
    .populate('uploadedBy', 'fullName email')
    .populate('legalReviewer', 'fullName email')
    .sort({ fddItemNumber: 1, createdAt: -1 });

  return sendSuccess(res, docs);
}

export async function createLegalDocument(req: Request, res: Response): Promise<any> {
  const { businessId, ...data } = req.body;
  const business = await BusinessProfile.findById(businessId);

  if (!business) {
    return sendError(res, 'Business not found', 404);
  }

  const isOwner = business.user.toString() === req.user!._id.toString();
  const isAdmin = req.user!.role === 'admin' || req.user!.role === 'super_admin';

  if (!isOwner && !isAdmin) {
    return sendError(res, 'Unauthorized to add legal document for this business', 403);
  }

  const doc = await LegalDocument.create({
    ...data,
    business: business._id,
    uploadedBy: req.user!._id,
    version: 1,
    status: 'legal_review',
  });

  await DocumentVersion.create({
    documentRef: doc._id,
    documentType: 'Legal',
    versionNumber: 1,
    changeSummary: 'Document uploaded for legal review',
    storageKey: data.storageKey,
    changedBy: req.user!._id,
  });

  await AuditLog.create({
    actor: req.user!._id,
    actorRole: req.user!.role,
    actorEmail: req.user!.email,
    action: 'LEGAL_DOC_UPLOADED',
    entityType: 'LegalDocument',
    entityId: doc._id.toString(),
  });

  return sendSuccess(res, doc, 'Legal document uploaded and queued for legal counsel review', 201);
}

export async function updateLegalDocStatus(req: Request, res: Response): Promise<any> {
  const { id } = req.params;
  const { status, legalReviewNotes } = req.body;

  const doc = await LegalDocument.findById(id);
  if (!doc) {
    return sendError(res, 'Legal document not found', 404);
  }

  doc.status = status;
  if (legalReviewNotes) doc.legalReviewNotes = legalReviewNotes;
  doc.legalReviewer = req.user!._id;
  await doc.save();

  await AuditLog.create({
    actor: req.user!._id,
    actorRole: req.user!.role,
    actorEmail: req.user!.email,
    action: 'LEGAL_DOC_STATUS_UPDATED',
    entityType: 'LegalDocument',
    entityId: doc._id.toString(),
    details: { status, legalReviewNotes },
  });

  return sendSuccess(res, doc, 'Legal document review status updated');
}

// Upload endpoint for SOP PDFs and Legal Documents
export async function uploadDocumentFile(req: Request, res: Response): Promise<any> {
  if (!req.file) {
    return sendError(res, 'No file was uploaded or file type is not supported.', 400);
  }

  const fileUrl = `/uploads/${req.file.filename}`;
  const responseData = {
    fileUrl,
    fileName: req.file.originalname,
    fileSizeBytes: req.file.size,
    mimeType: req.file.mimetype,
    storageKey: req.file.filename,
  };

  return sendSuccess(res, responseData, 'File uploaded successfully', 201);
}

// Investor FDD Facility: Get all available FDD disclosure packages
export async function getInvestorFddPackages(req: Request, res: Response): Promise<any> {
  const { businessId, jurisdiction } = req.query;

  const filter: any = {
    status: { $in: ['approved', 'legal_review'] },
  };

  if (businessId) {
    filter.business = businessId;
  }
  if (jurisdiction) {
    filter.jurisdiction = jurisdiction;
  }

  const legalDocs = await LegalDocument.find(filter)
    .populate('business', 'businessName slug category headquarters logoUrl estimatedInvestmentMin estimatedInvestmentMax')
    .sort({ fddItemNumber: 1, createdAt: -1 });

  return sendSuccess(res, legalDocs, 'Investor FDD packages retrieved successfully');
}
