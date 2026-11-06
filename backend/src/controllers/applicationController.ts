import { Request, Response } from 'express';
import { FranchiseApplication, ApplicationStatus } from '../models/FranchiseApplication';
import { FranchiseListing } from '../models/FranchiseListing';
import { InvestorProfile } from '../models/InvestorProfile';
import { Notification } from '../models/Notification';
import { AuditLog } from '../models/AuditLog';
import { sendSuccess, sendError } from '../utils/response';

export async function submitApplication(req: Request, res: Response): Promise<any> {
  const userId = req.user!._id;
  const { franchiseId, ...data } = req.body;

  const franchise = await FranchiseListing.findById(franchiseId);
  if (!franchise || franchise.status !== 'published') {
    return sendError(res, 'Franchise listing is not available for applications', 400);
  }

  // Ensure investor profile exists or create minimal one
  let investorProfile = await InvestorProfile.findOne({ user: userId });
  if (!investorProfile) {
    investorProfile = await InvestorProfile.create({
      user: userId,
      fullName: req.user!.fullName,
      phone: req.user!.phone || data.contactPhone || 'Not provided',
      city: data.proposedLocationCity,
      country: 'India',
      investorType: 'individual',
      investmentBudgetMin: data.investmentBudget,
      investmentBudgetMax: data.investmentBudget * 1.5,
      liquidCapital: data.availableLiquidCapital,
      proposedOutlets: data.unitsInterested,
    });
  }

  // Check for duplicate active application
  const existingActive = await FranchiseApplication.findOne({
    franchise: franchiseId,
    investorUser: userId,
    status: { $nin: ['rejected', 'withdrawn', 'deal_closed'] },
  });

  if (existingActive) {
    return sendError(res, 'You already have an active application submitted for this franchise', 409);
  }

  const application = await FranchiseApplication.create({
    franchise: franchiseId,
    investorUser: userId,
    investorProfile: investorProfile._id,
    businessOwnerUser: franchise.ownerUser,
    proposedLocationCity: data.proposedLocationCity,
    proposedLocationState: data.proposedLocationState,
    unitsInterested: data.unitsInterested,
    investmentBudget: data.investmentBudget,
    availableLiquidCapital: data.availableLiquidCapital,
    timeline: data.timeline,
    businessBackgroundSummary: data.businessBackgroundSummary,
    additionalMessage: data.additionalMessage,
    privacyConsentGiven: data.privacyConsentGiven,
    status: 'submitted',
    statusHistory: [
      {
        status: 'submitted',
        changedBy: userId,
        note: 'Application submitted by investor',
        timestamp: new Date(),
      },
    ],
  });

  franchise.enquiriesCount += 1;
  await franchise.save();

  // Create in-app notification for business owner and admins
  await Notification.create({
    recipient: franchise.ownerUser,
    type: 'application_received',
    title: `New Investor Application: ${franchise.brandName}`,
    message: `A new application for ${data.unitsInterested} unit(s) in ${data.proposedLocationCity} was submitted.`,
    actionUrl: `/dashboard/business/applications`,
  });

  await AuditLog.create({
    actor: userId,
    actorRole: req.user!.role,
    actorEmail: req.user!.email,
    action: 'APPLICATION_SUBMITTED',
    entityType: 'FranchiseApplication',
    entityId: application._id.toString(),
  });

  return sendSuccess(res, application, 'Application submitted successfully', 201);
}

export async function getMyApplications(req: Request, res: Response): Promise<any> {
  const applications = await FranchiseApplication.find({ investorUser: req.user!._id })
    .populate('franchise', 'brandName logoUrl industry totalInvestmentMin totalInvestmentMax expansionLocations')
    .sort({ createdAt: -1 });

  return sendSuccess(res, applications);
}

export async function getBusinessApplications(req: Request, res: Response): Promise<any> {
  const applications = await FranchiseApplication.find({ businessOwnerUser: req.user!._id })
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
  const application = await FranchiseApplication.findById(id)
    .populate('franchise')
    .populate('investorProfile')
    .populate('investorUser', 'fullName email phone');

  if (!application) {
    return sendError(res, 'Application not found', 404);
  }

  // Access check
  const isInvestor = application.investorUser._id.toString() === req.user!._id.toString();
  const isOwner = application.businessOwnerUser.toString() === req.user!._id.toString();
  const isAdmin = req.user!.role === 'admin' || req.user!.role === 'super_admin';

  if (!isInvestor && !isOwner && !isAdmin) {
    return sendError(res, 'Unauthorized to view this application', 403);
  }

  return sendSuccess(res, application);
}

export async function updateApplicationStatus(req: Request, res: Response): Promise<any> {
  const { id } = req.params;
  const { status, note, brokerNotes } = req.body;

  const application = await FranchiseApplication.findById(id).populate('franchise', 'brandName');
  if (!application) {
    return sendError(res, 'Application not found', 404);
  }

  const isAdmin = req.user!.role === 'admin' || req.user!.role === 'super_admin';
  const isOwner = application.businessOwnerUser.toString() === req.user!._id.toString();

  if (!isAdmin && !isOwner) {
    return sendError(res, 'Unauthorized to update application status', 403);
  }

  application.status = status as ApplicationStatus;
  if (brokerNotes && isAdmin) {
    application.brokerNotes = brokerNotes;
  }

  application.statusHistory.push({
    status: status as ApplicationStatus,
    changedBy: req.user!._id,
    note: note || `Status updated to ${status}`,
    timestamp: new Date(),
  });

  await application.save();

  // Notify investor
  await Notification.create({
    recipient: application.investorUser,
    type: 'application_status',
    title: `Application Status Updated: ${(application.franchise as any)?.brandName || 'Franchise'}`,
    message: `Your application status changed to "${status}". ${note ? `Note: ${note}` : ''}`,
    actionUrl: `/dashboard/investor/applications`,
  });

  await AuditLog.create({
    actor: req.user!._id,
    actorRole: req.user!.role,
    actorEmail: req.user!.email,
    action: 'APPLICATION_STATUS_UPDATED',
    entityType: 'FranchiseApplication',
    entityId: application._id.toString(),
    details: { newStatus: status, note },
  });

  return sendSuccess(res, application, 'Application status updated');
}
