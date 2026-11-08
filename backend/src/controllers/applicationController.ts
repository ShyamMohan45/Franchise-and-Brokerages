import { Request, Response } from 'express';
import { FranchiseApplication, ApplicationStatus } from '../models/FranchiseApplication';
import { FranchiseListing } from '../models/FranchiseListing';
import { InvestorProfile } from '../models/InvestorProfile';
import { Notification } from '../models/Notification';
import { AuditLog } from '../models/AuditLog';
import mongoose from 'mongoose';
import { User } from '../models/User';
import { sendSuccess, sendError } from '../utils/response';

export async function submitApplication(req: Request, res: Response): Promise<any> {
  const userId = req.user!._id;
  const { franchiseId, ...data } = req.body;

  const franchise = await FranchiseListing.findById(franchiseId);
  if (!franchise || (franchise.status !== 'published' && franchise.status !== 'PUBLISHED')) {
    return sendError(res, 'This franchise opportunity is not currently available for investor enquiries', 400);
  }

  // Ensure investor profile exists or create one
  let investorProfile = await InvestorProfile.findOne({ user: userId });
  if (!investorProfile) {
    investorProfile = await InvestorProfile.create({
      user: userId,
      fullName: req.user!.fullName,
      phone: req.user!.phone || data.contactPhone || '+91 98765 00000',
      city: data.proposedLocationCity || 'Mumbai',
      country: 'India',
      investorType: 'individual',
      investmentBudgetMin: Number(data.investmentBudget) || 2500000,
      investmentBudgetMinPaise: Math.round(Number(data.investmentBudget || 2500000) * 100),
      investmentBudgetMax: Number(data.investmentBudget) * 1.5,
      investmentBudgetMaxPaise: Math.round(Number(data.investmentBudget || 2500000) * 150),
      liquidCapital: Number(data.availableLiquidCapital) || 2000000,
      liquidCapitalPaise: Math.round(Number(data.availableLiquidCapital || 2000000) * 100),
      proposedOutlets: Number(data.unitsInterested) || 1,
    });
  }

  // Check for duplicate active enquiry
  const existingActive = await FranchiseApplication.findOne({
    franchise: franchiseId,
    investorUser: userId,
    status: { $nin: ['rejected', 'REJECTED', 'CLOSED', 'withdrawn', 'deal_closed'] },
  });

  if (existingActive) {
    return sendError(res, 'You already have an active enquiry/application submitted for this franchise', 409);
  }

  // Generate Reference Number: ENQ-YYYYMMDD-XXXX
  const today = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  const rand = Math.random().toString(36).substring(2, 6).toUpperCase();
  const referenceNumber = `ENQ-${today}-${rand}`;

  const application = await FranchiseApplication.create({
    referenceNumber,
    franchise: franchiseId,
    brandName: franchise.brandName,
    opportunityTitle: franchise.opportunityTitle || franchise.tagline,
    investorUser: userId,
    investorProfile: investorProfile._id,
    businessOwnerUser: franchise.ownerUser,
    proposedLocationCity: data.proposedLocationCity,
    proposedLocationState: data.proposedLocationState || '',
    unitsInterested: Number(data.unitsInterested) || 1,
    investmentBudget: Number(data.investmentBudget),
    investmentBudgetPaise: Math.round(Number(data.investmentBudget) * 100),
    availableLiquidCapital: Number(data.availableLiquidCapital),
    availableLiquidCapitalPaise: Math.round(Number(data.availableLiquidCapital) * 100),
    timeline: data.timeline,
    businessBackgroundSummary: data.businessBackgroundSummary || 'Vetted Investor Profile',
    additionalMessage: data.additionalMessage || '',
    privacyConsentGiven: Boolean(data.privacyConsentGiven),
    status: 'NEW',
    statusHistory: [
      {
        status: 'NEW',
        changedBy: userId,
        note: 'Enquiry submitted by investor',
        timestamp: new Date(),
      },
    ],
  });

  franchise.enquiriesCount = (franchise.enquiriesCount || 0) + 1;
  franchise.inquiriesCount = (franchise.inquiriesCount || 0) + 1;
  await franchise.save();

  // Create in-app notification for brand owner
  await Notification.create({
    recipient: franchise.ownerUser,
    type: 'application_received',
    title: `New Investor Enquiry: ${franchise.brandName} (${referenceNumber})`,
    message: `A new enquiry for ${data.unitsInterested} unit(s) in ${data.proposedLocationCity} was submitted by ${req.user!.fullName}.`,
    actionUrl: `/dashboard/business`,
  });

  // Notify brokerage operations team / admins
  const admins = await User.find({ role: { $in: ['admin', 'super_admin', 'broker'] } }).limit(5);
  for (const admin of admins) {
    await Notification.create({
      recipient: admin._id,
      type: 'application',
      title: `New Franchise Enquiry: ${referenceNumber}`,
      message: `Investor ${req.user!.fullName} enquired about ${franchise.brandName}.`,
      actionUrl: `/dashboard/brokerage`,
    });
  }

  await AuditLog.create({
    actor: userId,
    actorRole: req.user!.role,
    actorEmail: req.user!.email,
    action: 'ENQUIRY_SUBMITTED',
    entityType: 'FranchiseApplication',
    entityId: application._id.toString(),
    details: { referenceNumber, brandName: franchise.brandName },
  });

  return sendSuccess(res, application, 'Enquiry submitted successfully', 201);
}

export async function getMyApplications(req: Request, res: Response): Promise<any> {
  // Investors must NEVER be able to read internal brokerage notes!
  const applications = await FranchiseApplication.find({ investorUser: req.user!._id })
    .select('-internalNotes')
    .populate('franchise', 'brandName logoUrl industry totalInvestmentMin totalInvestmentMax expansionLocations slug')
    .populate('assignedBroker', 'fullName email phone')
    .sort({ createdAt: -1 });

  return sendSuccess(res, applications);
}

export async function getBrokerApplications(req: Request, res: Response): Promise<any> {
  const { status, search } = req.query;
  const filter: any = {};

  if (status && status !== 'ALL' && status !== 'all') {
    filter.status = status;
  }

  if (search) {
    filter.$or = [
      { referenceNumber: { $regex: search, $options: 'i' } },
      { brandName: { $regex: search, $options: 'i' } },
      { proposedLocationCity: { $regex: search, $options: 'i' } },
    ];
  }

  const applications = await FranchiseApplication.find(filter)
    .populate('franchise', 'brandName logoUrl category industry totalInvestmentMin totalInvestmentMax')
    .populate('investorProfile')
    .populate('investorUser', 'fullName email phone')
    .populate('assignedBroker', 'fullName email phone')
    .sort({ createdAt: -1 });

  return sendSuccess(res, applications);
}

export async function getBusinessApplications(req: Request, res: Response): Promise<any> {
  const applications = await FranchiseApplication.find({ businessOwnerUser: req.user!._id })
    .select('-internalNotes')
    .populate('franchise', 'brandName logoUrl')
    .populate({
      path: 'investorProfile',
      select: 'fullName city investmentBudgetMin investmentBudgetMax interestType proposedOutlets businessExperienceYears liquidCapital',
    })
    .sort({ createdAt: -1 });

  return sendSuccess(res, applications);
}

export async function getApplicationById(req: Request, res: Response): Promise<any> {
  const { id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return sendError(res, 'Enquiry/Application not found', 404);
  }

  const application = await FranchiseApplication.findById(id)
    .populate('franchise')
    .populate('investorProfile')
    .populate('investorUser', 'fullName email phone')
    .populate('assignedBroker', 'fullName email phone');

  if (!application) {
    return sendError(res, 'Enquiry/Application not found', 404);
  }

  // Access check
  const investorId = (application.investorUser?._id || application.investorUser)?.toString();
  const ownerId = (application.businessOwnerUser?._id || application.businessOwnerUser)?.toString();
  const isInvestor = investorId === req.user!._id.toString();
  const isOwner = ownerId === req.user!._id.toString();
  const isBrokerOrAdmin = req.user!.role === 'broker' || req.user!.role === 'admin' || req.user!.role === 'super_admin';

  if (!isInvestor && !isOwner && !isBrokerOrAdmin) {
    return sendError(res, 'Unauthorized to view this enquiry', 403);
  }

  // Strict Security Check: Strip internalNotes if user is an investor or unauthorized
  const appObj = application.toObject();
  if (!isBrokerOrAdmin) {
    delete appObj.internalNotes;
  }

  return sendSuccess(res, appObj);
}

export async function updateApplicationStatus(req: Request, res: Response): Promise<any> {
  const { id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return sendError(res, 'Enquiry not found', 404);
  }

  const { status, note, brokerNotes, internalNotes, assignedBrokerId } = req.body;

  const application = await FranchiseApplication.findById(id).populate('franchise', 'brandName');
  if (!application) {
    return sendError(res, 'Enquiry not found', 404);
  }

  const isBrokerOrAdmin = req.user!.role === 'broker' || req.user!.role === 'admin' || req.user!.role === 'super_admin';
  const ownerId = (application.businessOwnerUser?._id || application.businessOwnerUser)?.toString();
  const isOwner = ownerId === req.user!._id.toString();

  if (!isBrokerOrAdmin && !isOwner) {
    return sendError(res, 'Unauthorized to update enquiry status', 403);
  }

  // Handle broker assignment
  if (assignedBrokerId && isBrokerOrAdmin) {
    application.assignedBroker = assignedBrokerId;
    if (application.status === 'NEW' || application.status === 'submitted') {
      application.status = 'ASSIGNED';
    }
  }

  // Validate status transition if status is being updated
  if (status) {
    application.status = status as ApplicationStatus;
  }

  if (brokerNotes && isBrokerOrAdmin) {
    application.brokerNotes = brokerNotes;
  }

  if (internalNotes !== undefined && isBrokerOrAdmin) {
    application.internalNotes = internalNotes;
  }

  application.statusHistory.push({
    status: application.status,
    changedBy: req.user!._id,
    note: note || (internalNotes ? `Internal note added: ${internalNotes}` : `Status updated to ${application.status}`),
    timestamp: new Date(),
  });

  await application.save();

  // Notify investor with updated public status
  await Notification.create({
    recipient: application.investorUser,
    type: 'application_status',
    title: `Enquiry Update: ${(application.franchise as any)?.brandName || 'Franchise'} (${application.referenceNumber})`,
    message: `Your enquiry status is now "${application.status}". ${note ? `Note: ${note}` : ''}`,
    actionUrl: `/dashboard/investor`,
  });

  await AuditLog.create({
    actor: req.user!._id,
    actorRole: req.user!.role,
    actorEmail: req.user!.email,
    action: 'ENQUIRY_STATUS_UPDATED',
    entityType: 'FranchiseApplication',
    entityId: application._id.toString(),
    details: { newStatus: application.status, note },
  });

  // Return sanitized object so investor never sees internalNotes
  const appObj = application.toObject();
  if (!isBrokerOrAdmin) {
    delete appObj.internalNotes;
  }

  return sendSuccess(res, appObj, 'Enquiry updated successfully');
}

export async function assignEnquiryBroker(req: Request, res: Response): Promise<any> {
  const { id } = req.params;
  const { brokerId, internalNotes } = req.body;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return sendError(res, 'Enquiry not found', 404);
  }

  const application = await FranchiseApplication.findById(id);
  if (!application) {
    return sendError(res, 'Enquiry not found', 404);
  }

  application.assignedBroker = brokerId;
  application.status = 'ASSIGNED';
  if (internalNotes) {
    application.internalNotes = internalNotes;
  }

  application.statusHistory.push({
    status: 'ASSIGNED',
    changedBy: req.user!._id,
    note: `Assigned to broker. ${internalNotes || ''}`,
    timestamp: new Date(),
  });

  await application.save();

  return sendSuccess(res, application, 'Broker assigned to enquiry successfully');
}
