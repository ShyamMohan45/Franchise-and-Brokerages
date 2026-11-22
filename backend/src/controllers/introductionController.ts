import { Request, Response } from 'express';
import mongoose from 'mongoose';
import { AuthRequest } from '../middleware/auth';
import {
  IntroductionRequest,
  IIntroductionRequest,
  IntroductionStatus,
  IntroductionInitiator,
} from '../models/IntroductionRequest';
import { FranchiseListing } from '../models/FranchiseListing';
import { BusinessProfile } from '../models/BusinessProfile';
import { InvestorProfile } from '../models/InvestorProfile';
import { User } from '../models/User';
import { DealRoom } from '../models/DealRoom';
import { NotificationService } from '../services/notificationService';
import { EmailService } from '../services/emailService';
import { sendError, sendSuccess } from '../utils/response';
import { Logger } from '../utils/logger';

/**
 * Generates a unique tracking reference code: INTRO-YYYYMM-XXXXX
 */
function generateIntroReference(): string {
  const date = new Date();
  const yearMonth = `${date.getFullYear()}${String(date.getMonth() + 1).padStart(2, '0')}`;
  const randomSuffix = Math.floor(10000 + Math.random() * 90000);
  return `INTRO-${yearMonth}-${randomSuffix}`;
}

/**
 * Sanitizes introduction payload depending on the caller's role and mutual consent status.
 * Strictly redacts direct contact details (full name, phone, email) unless mutual consent is confirmed.
 */
export function sanitizeIntroductionForUser(
  intro: any,
  currentUserId: string,
  userRole: string
): any {
  const introObj =
    typeof intro.toObject === 'function'
      ? intro.toObject()
      : JSON.parse(JSON.stringify(intro));
  const isPrivileged = userRole === 'admin' || userRole === 'super_admin' || userRole === 'broker';

  // Privileged admins and brokers can view full context for mediation
  if (isPrivileged) {
    return introObj;
  }

  const isMutual =
    introObj.status === 'MUTUALLY_ACCEPTED' || introObj.status === 'DEAL_ROOM_CREATED';

  const isFranchisor =
    (introObj.businessOwnerUser?._id || introObj.businessOwnerUser)?.toString() === currentUserId;
  const isInvestor =
    (introObj.investorUser?._id || introObj.investorUser)?.toString() === currentUserId;

  // Mask investor details for franchisor if not yet mutually accepted
  if (isFranchisor && !isMutual) {
    if (introObj.investorUser && typeof introObj.investorUser === 'object') {
      const rawId = introObj.investorUser._id?.toString() || 'USER';
      const shortId = rawId.slice(-6).toUpperCase();
      introObj.investorUser = {
        _id: rawId,
        anonymizedId: `INV-${shortId}`,
        role: 'investor',
        isMasked: true,
      };
    }
    if (introObj.investorProfile && typeof introObj.investorProfile === 'object') {
      const rawId = introObj.investorProfile._id?.toString() || 'PROF';
      const shortId = rawId.slice(-6).toUpperCase();
      delete introObj.investorProfile.fullName;
      delete introObj.investorProfile.email;
      delete introObj.investorProfile.phone;
      delete introObj.investorProfile.companyName;
      delete introObj.investorProfile.verificationNotes;
      introObj.investorProfile.anonymizedId = `INV-${shortId}`;
      introObj.investorProfile.isMasked = true;
    }
  }

  // Mask franchisor personal contact details for investor if not yet mutually accepted
  if (isInvestor && !isMutual) {
    if (introObj.businessOwnerUser && typeof introObj.businessOwnerUser === 'object') {
      delete introObj.businessOwnerUser.email;
      delete introObj.businessOwnerUser.phone;
      introObj.businessOwnerUser.isMasked = true;
    }
    if (introObj.business && typeof introObj.business === 'object') {
      delete introObj.business.contactEmail;
      delete introObj.business.contactPhone;
      introObj.business.isMasked = true;
    }
  }

  return introObj;
}

/**
 * POST /api/v1/introductions
 * Initiates an authorized introduction request.
 * Can be initiated by:
 *  - Investor applying to a franchise opportunity
 *  - Franchisor inviting an anonymized investor from the matchmaker
 *  - Admin dispatching a recommended introduction invitation
 */
export async function createIntroductionRequest(req: AuthRequest, res: Response): Promise<any> {
  try {
    const userId = req.user!._id.toString();
    const userRole = req.user!.role;
    const {
      franchiseId,
      investorProfileId,
      targetCity,
      targetState,
      investmentBudget,
      unitsInterested,
      initialMessage,
      compatibilityScore,
    } = req.body;

    let targetFranchise: any = null;
    let targetBusiness: any = null;
    let targetBusinessOwnerId: any = null;
    let targetInvestorProfile: any = null;
    let targetInvestorUserId: any = null;
    let initiatedBy: IntroductionInitiator = 'investor';

    // 1. Resolve Parties Based on Initiator Role
    if (userRole === 'investor') {
      initiatedBy = 'investor';
      targetInvestorProfile = await InvestorProfile.findOne({ user: userId });
      if (!targetInvestorProfile) {
        return sendError(res, 'Please complete your investor profile first before requesting an introduction.', 400);
      }
      targetInvestorUserId = userId;

      if (!franchiseId) {
        return sendError(res, 'franchiseId is required to request an introduction.', 400);
      }
      targetFranchise = await FranchiseListing.findById(franchiseId).populate('business');
      if (!targetFranchise) {
        return sendError(res, 'Franchise opportunity listing not found.', 404);
      }
      targetBusiness = targetFranchise.business;
      targetBusinessOwnerId = targetFranchise.ownerUser || (targetBusiness as any)?.user;
    } else if (userRole === 'business_owner' || userRole === 'brand_owner') {
      initiatedBy = 'franchisor';
      targetBusiness = await BusinessProfile.findOne({ user: userId });
      if (!targetBusiness) {
        return sendError(res, 'Franchisor business profile not found.', 404);
      }
      targetBusinessOwnerId = userId;

      if (!investorProfileId) {
        return sendError(res, 'investorProfileId is required to invite an investor.', 400);
      }
      targetInvestorProfile = await InvestorProfile.findById(investorProfileId);
      if (!targetInvestorProfile) {
        return sendError(res, 'Target investor profile not found.', 404);
      }
      targetInvestorUserId = targetInvestorProfile.user;

      if (franchiseId) {
        targetFranchise = await FranchiseListing.findById(franchiseId);
        if (!targetFranchise || targetFranchise.ownerUser?.toString() !== userId) {
          return sendError(res, 'Specified franchise listing not found or unauthorized.', 403);
        }
      } else {
        const listings = await FranchiseListing.find({ ownerUser: userId });
        targetFranchise = listings.length > 0 ? listings[0] : null;
        if (!targetFranchise) {
          return sendError(res, 'Please publish or create at least one franchise listing first.', 400);
        }
      }
    } else if (userRole === 'admin' || userRole === 'super_admin' || userRole === 'broker') {
      initiatedBy = 'admin';
      if (!franchiseId || !investorProfileId) {
        return sendError(res, 'Both franchiseId and investorProfileId are required for admin dispatch.', 400);
      }
      targetFranchise = await FranchiseListing.findById(franchiseId).populate('business');
      targetInvestorProfile = await InvestorProfile.findById(investorProfileId);
      if (!targetFranchise || !targetInvestorProfile) {
        return sendError(res, 'Franchise listing or investor profile not found.', 404);
      }
      targetBusiness = targetFranchise.business;
      targetBusinessOwnerId = targetFranchise.ownerUser || (targetBusiness as any)?.user;
      targetInvestorUserId = targetInvestorProfile.user;
    } else {
      return sendError(res, 'Unauthorized role to initiate an introduction.', 403);
    }

    // 2. Prevent Duplicate Active Introductions
    const activeExisting = await IntroductionRequest.findOne({
      franchise: targetFranchise._id,
      investorUser: targetInvestorUserId,
      status: {
        $in: [
          'PENDING',
          'ADMIN_REVIEW',
          'ACCEPTED_BY_FRANCHISOR',
          'ACCEPTED_BY_INVESTOR',
          'MUTUALLY_ACCEPTED',
          'DEAL_ROOM_CREATED',
        ],
      },
    });

    if (activeExisting) {
      return sendError(
        res,
        `An active introduction request (${activeExisting.referenceNumber}) already exists for this franchise and investor. Status: ${activeExisting.status}`,
        409,
        { existingReference: activeExisting.referenceNumber, status: activeExisting.status }
      );
    }

    // 3. Determine Initial Status and Consent Flags
    let initialStatus: IntroductionStatus = 'PENDING';
    const franchisorConsent = {
      consented: initiatedBy === 'franchisor',
      consentedAt: initiatedBy === 'franchisor' ? new Date() : undefined,
      notes: initiatedBy === 'franchisor' ? 'Initiated by franchisor' : undefined,
    };
    const investorConsent = {
      consented: initiatedBy === 'investor',
      consentedAt: initiatedBy === 'investor' ? new Date() : undefined,
      notes: initiatedBy === 'investor' ? 'Initiated by investor' : undefined,
    };

    if (initiatedBy === 'franchisor') {
      initialStatus = 'ACCEPTED_BY_FRANCHISOR';
    } else if (initiatedBy === 'investor') {
      initialStatus = 'ACCEPTED_BY_INVESTOR';
    } else if (initiatedBy === 'admin') {
      initialStatus = 'ADMIN_REVIEW';
    }

    const referenceNumber = generateIntroReference();
    const resolvedCity =
      targetCity || targetInvestorProfile.city || targetFranchise.expansionLocations?.[0] || 'India';
    const resolvedBudget =
      investmentBudget || targetInvestorProfile.investmentBudgetMax || targetFranchise.totalInvestmentMin;

    // 4. Create Introduction Request Record
    const introduction = await IntroductionRequest.create({
      referenceNumber,
      franchise: targetFranchise._id,
      brandName: targetFranchise.brandName,
      business: targetBusiness?._id || targetFranchise.business,
      businessOwnerUser: targetBusinessOwnerId,
      investorUser: targetInvestorUserId,
      investorProfile: targetInvestorProfile._id,
      initiatedBy,
      status: initialStatus,
      franchisorConsent,
      investorConsent,
      targetCity: resolvedCity,
      targetState: targetState || targetInvestorProfile.state || undefined,
      investmentBudget: resolvedBudget,
      availableLiquidCapital: targetInvestorProfile.liquidCapital || 0,
      unitsInterested: unitsInterested || 1,
      initialMessage: initialMessage || undefined,
      compatibilityScore: compatibilityScore || undefined,
      isRecommendedByAdmin: initiatedBy === 'admin',
      adminDispatchedAt: initiatedBy === 'admin' ? new Date() : undefined,
      history: [
        {
          status: initialStatus,
          changedBy: req.user!._id,
          changedByRole: userRole,
          note: `Introduction request initiated by ${userRole}. Ref: ${referenceNumber}`,
          timestamp: new Date(),
        },
      ],
    });

    // 5. In-App Notifications & Transactional Email Dispatches
    const investorUserDoc = await User.findById(targetInvestorUserId);
    const franchisorUserDoc = await User.findById(targetBusinessOwnerId);

    // Notify the recipient party
    if (initiatedBy === 'investor' && franchisorUserDoc) {
      await NotificationService.createNotification({
        recipient: targetBusinessOwnerId,
        title: 'New Franchise Introduction Request',
        message: `A qualified investor has requested an introduction for ${targetFranchise.brandName} in ${resolvedCity}.`,
        type: 'introduction_request',
        actionUrl: '/dashboard/business',
      });

      if (franchisorUserDoc.email) {
        EmailService.sendEmail({
          to: franchisorUserDoc.email,
          subject: `FranchiseBridge - Introduction Request for ${targetFranchise.brandName}`,
          html: `<p>Hello ${franchisorUserDoc.fullName || 'Franchisor'},</p>
                 <p>A qualified investor has expressed interest and requested an introduction for <strong>${targetFranchise.brandName}</strong> in <strong>${resolvedCity}</strong>.</p>
                 <p>Reference: <strong>${referenceNumber}</strong></p>
                 <p>Log in to your dashboard to review the anonymized candidate profile and consent to the introduction.</p>`,
        }).catch((err) => Logger.error('[createIntroductionRequest] Email dispatch failed', err));
      }
    } else if (initiatedBy === 'franchisor' && investorUserDoc) {
      await NotificationService.createNotification({
        recipient: targetInvestorUserId,
        title: 'Franchise Expansion Introduction Invitation',
        message: `${targetFranchise.brandName} has reviewed your investment criteria and invited you to connect for expansion in ${resolvedCity}.`,
        type: 'introduction_request',
        actionUrl: '/dashboard/investor',
      });

      if (investorUserDoc.email) {
        EmailService.sendEmail({
          to: investorUserDoc.email,
          subject: `FranchiseBridge - Expansion Introduction from ${targetFranchise.brandName}`,
          html: `<p>Hello ${investorUserDoc.fullName || 'Investor'},</p>
                 <p><strong>${targetFranchise.brandName}</strong> is actively expanding in <strong>${resolvedCity}</strong> and has invited you for an authorized introduction.</p>
                 <p>Reference: <strong>${referenceNumber}</strong></p>
                 <p>Review the opportunity on your investor dashboard to accept or decline the introduction.</p>`,
        }).catch((err) => Logger.error('[createIntroductionRequest] Email dispatch failed', err));
      }
    } else if (initiatedBy === 'admin') {
      // Notify both parties of admin-curated match
      if (investorUserDoc) {
        await NotificationService.createNotification({
          recipient: targetInvestorUserId,
          title: 'Curated Franchise Match Recommendation',
          message: `FranchiseBridge advisory has curated an expansion match for you with ${targetFranchise.brandName}.`,
          type: 'introduction_request',
          actionUrl: '/dashboard/investor',
        });
      }
      if (franchisorUserDoc) {
        await NotificationService.createNotification({
          recipient: targetBusinessOwnerId,
          title: 'Curated Investor Match Recommendation',
          message: `FranchiseBridge advisory has recommended a candidate investor for ${targetFranchise.brandName}.`,
          type: 'introduction_request',
          actionUrl: '/dashboard/business',
        });
      }
    }

    const sanitized = sanitizeIntroductionForUser(introduction, userId, userRole);
    return sendSuccess(res, sanitized, 'Introduction request initiated successfully', 201);
  } catch (error: any) {
    Logger.error('[createIntroductionRequest] Error', error);
    return sendError(res, error.message || 'Failed to create introduction request', 500);
  }
}

/**
 * POST /api/v1/introductions/:id/respond
 * Responds to an introduction request (ACCEPT | REJECT | CANCEL).
 * Enforces mutual consent: Contact information is strictly held back until BOTH parties accept.
 */
export async function respondToIntroduction(req: AuthRequest, res: Response): Promise<any> {
  try {
    const { id } = req.params;
    const { action, notes } = req.body; // action: 'ACCEPT' | 'REJECT' | 'CANCEL'
    const userId = req.user!._id.toString();
    const userRole = req.user!.role;

    if (!['ACCEPT', 'REJECT', 'CANCEL'].includes(action)) {
      return sendError(res, 'Valid action required: ACCEPT, REJECT, or CANCEL.', 400);
    }

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return sendError(res, 'Invalid introduction request ID.', 400);
    }

    const intro = await IntroductionRequest.findById(id)
      .populate('businessOwnerUser', 'fullName email phone')
      .populate('investorUser', 'fullName email phone')
      .populate('investorProfile', 'fullName email phone city state country isVerified');

    if (!intro) {
      return sendError(res, 'Introduction request not found.', 404);
    }

    const isFranchisor =
      (intro.businessOwnerUser?._id || intro.businessOwnerUser)?.toString() === userId;
    const isInvestor =
      (intro.investorUser?._id || intro.investorUser)?.toString() === userId;
    const isPrivileged = userRole === 'admin' || userRole === 'super_admin' || userRole === 'broker';

    if (!isFranchisor && !isInvestor && !isPrivileged) {
      return sendError(res, 'Unauthorized to respond to this introduction request.', 403);
    }

    // Terminal state protection
    if (['REJECTED', 'CANCELLED', 'DEAL_ROOM_CREATED'].includes(intro.status)) {
      return sendError(res, `Cannot respond to an introduction request in ${intro.status} state.`, 400);
    }

    const now = new Date();
    let newStatus: IntroductionStatus = intro.status;

    if (action === 'CANCEL') {
      const isInitiator =
        (intro.initiatedBy === 'investor' && isInvestor) ||
        (intro.initiatedBy === 'franchisor' && isFranchisor) ||
        isPrivileged;

      if (!isInitiator) {
        return sendError(res, 'Only the party that initiated the introduction request can cancel it.', 403);
      }
      newStatus = 'CANCELLED';
      intro.history.push({
        status: 'CANCELLED',
        changedBy: req.user!._id,
        changedByRole: userRole,
        note: notes || 'Introduction request cancelled by initiator.',
        timestamp: now,
      });
    } else if (action === 'REJECT') {
      newStatus = 'REJECTED';
      intro.history.push({
        status: 'REJECTED',
        changedBy: req.user!._id,
        changedByRole: userRole,
        note: notes || 'Introduction request declined.',
        timestamp: now,
      });
    } else if (action === 'ACCEPT') {
      // Record Party Consent
      if (isFranchisor || (isPrivileged && req.body.asParty === 'franchisor')) {
        intro.franchisorConsent = {
          consented: true,
          consentedAt: now,
          notes: notes || undefined,
        };
      }
      if (isInvestor || (isPrivileged && req.body.asParty === 'investor')) {
        intro.investorConsent = {
          consented: true,
          consentedAt: now,
          notes: notes || undefined,
        };
      }

      // Check if Mutual Consent is Reached
      if (intro.franchisorConsent?.consented && intro.investorConsent?.consented) {
        newStatus = 'MUTUALLY_ACCEPTED';
        intro.mutuallyAcceptedAt = now;
        intro.history.push({
          status: 'MUTUALLY_ACCEPTED',
          changedBy: req.user!._id,
          changedByRole: userRole,
          note: 'Mutual consent established. Direct contact details and deal progression unlocked.',
          timestamp: now,
        });

        // Notify both parties of mutual consent
        const investorId = (intro.investorUser?._id || intro.investorUser)?.toString();
        const franchisorId = (intro.businessOwnerUser?._id || intro.businessOwnerUser)?.toString();

        await NotificationService.createNotification({
          recipient: investorId,
          title: 'Mutual Introduction Confirmed!',
          message: `Both you and ${intro.brandName} have consented to connect. Direct contact details are now unlocked.`,
          type: 'introduction_mutually_accepted',
          actionUrl: '/dashboard/investor',
        });

        await NotificationService.createNotification({
          recipient: franchisorId,
          title: 'Mutual Introduction Confirmed!',
          message: `Mutual introduction established for ${intro.brandName} in ${intro.targetCity}. Direct contact details are now unlocked.`,
          type: 'introduction_mutually_accepted',
          actionUrl: '/dashboard/business',
        });

        const investorEmail = (intro.investorUser as any)?.email;
        const franchisorEmail = (intro.businessOwnerUser as any)?.email;

        if (investorEmail) {
          EmailService.sendEmail({
            to: investorEmail,
            subject: `FranchiseBridge - Introduction Confirmed with ${intro.brandName}`,
            html: `<p>Great news! Both you and <strong>${intro.brandName}</strong> have confirmed your introduction.</p>
                   <p>Direct contact details are now unlocked in your FranchiseBridge dashboard. Our advisory team will assist with scheduling your introductory session.</p>`,
          }).catch((e) => Logger.error('[respondToIntroduction] Email error', e));
        }
        if (franchisorEmail) {
          EmailService.sendEmail({
            to: franchisorEmail,
            subject: `FranchiseBridge - Mutual Introduction Confirmed (${intro.brandName})`,
            html: `<p>Mutual consent established! You are now connected with the prospective partner for <strong>${intro.brandName}</strong>.</p>
                   <p>Review the partner profile and initialize a Deal Room to exchange disclosure documents.</p>`,
          }).catch((e) => Logger.error('[respondToIntroduction] Email error', e));
        }
      } else if (intro.franchisorConsent?.consented) {
        newStatus = 'ACCEPTED_BY_FRANCHISOR';
        intro.history.push({
          status: 'ACCEPTED_BY_FRANCHISOR',
          changedBy: req.user!._id,
          changedByRole: userRole,
          note: notes || 'Franchisor confirmed introduction consent. Awaiting investor consent.',
          timestamp: now,
        });
      } else if (intro.investorConsent?.consented) {
        newStatus = 'ACCEPTED_BY_INVESTOR';
        intro.history.push({
          status: 'ACCEPTED_BY_INVESTOR',
          changedBy: req.user!._id,
          changedByRole: userRole,
          note: notes || 'Investor confirmed introduction consent. Awaiting franchisor consent.',
          timestamp: now,
        });
      }
    }

    intro.status = newStatus;
    await intro.save();

    const sanitized = sanitizeIntroductionForUser(intro, userId, userRole);
    return sendSuccess(res, sanitized, `Introduction request status updated to ${newStatus}`);
  } catch (error: any) {
    Logger.error('[respondToIntroduction] Error', error);
    return sendError(res, error.message || 'Failed to update introduction request', 500);
  }
}

/**
 * POST /api/v1/introductions/:id/deal-room
 * Creates an authorized Deal Room from a mutually accepted introduction request.
 * Strictly prevents duplicate deal rooms for the same introduction.
 */
export async function createDealRoomFromIntroduction(req: AuthRequest, res: Response): Promise<any> {
  try {
    const { id } = req.params;
    const userId = req.user!._id.toString();
    const userRole = req.user!.role;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return sendError(res, 'Invalid introduction request ID.', 400);
    }

    const intro = await IntroductionRequest.findById(id)
      .populate('franchise')
      .populate('business')
      .populate('businessOwnerUser', 'fullName email')
      .populate('investorUser', 'fullName email');

    if (!intro) {
      return sendError(res, 'Introduction request not found.', 404);
    }

    const isFranchisor =
      (intro.businessOwnerUser?._id || intro.businessOwnerUser)?.toString() === userId;
    const isInvestor =
      (intro.investorUser?._id || intro.investorUser)?.toString() === userId;
    const isPrivileged = userRole === 'admin' || userRole === 'super_admin' || userRole === 'broker';

    if (!isFranchisor && !isInvestor && !isPrivileged) {
      return sendError(res, 'Unauthorized to open a Deal Room for this introduction.', 403);
    }

    // Must be MUTUALLY_ACCEPTED or already DEAL_ROOM_CREATED
    if (intro.status !== 'MUTUALLY_ACCEPTED' && intro.status !== 'DEAL_ROOM_CREATED') {
      return sendError(
        res,
        `Deal Room creation requires mutual consent from both parties. Current status: ${intro.status}`,
        400
      );
    }

    // Duplicate Prevention Check: If a deal room already exists, return existing
    if (intro.dealRoom) {
      const existingRoom = await DealRoom.findById(intro.dealRoom);
      if (existingRoom) {
        return sendSuccess(
          res,
          { dealRoom: existingRoom, introduction: intro },
          'Deal Room already exists for this introduction.',
          200
        );
      }
    }

    const franchisorId = (intro.businessOwnerUser?._id || intro.businessOwnerUser);
    const investorId = (intro.investorUser?._id || intro.investorUser);

    // Default 5 expansion milestones for statutory compliance
    const initialMilestones = [
      { title: 'Mutual Introduction & Confidentiality NDA', completed: false },
      { title: 'Franchise Disclosure Document (FDD) & Unit Economics Review', completed: false },
      { title: 'Territory Demarcation & Site Evaluation', completed: false },
      { title: 'Commercial Agreement Negotiation & Legal Review', completed: false },
      { title: 'Franchise Agreement Final Signing & Territory Allocation', completed: false },
    ];

    const roomName = `${intro.brandName} - ${intro.targetCity} Expansion Deal Room`;

    const newDealRoom = await DealRoom.create({
      franchiseListing: intro.franchise?._id || intro.franchise,
      franchisor: franchisorId,
      businessOwner: franchisorId,
      investor: investorId,
      broker: intro.assignedBroker || req.user!._id,
      assignedBroker: intro.assignedBroker || req.user!._id,
      roomName,
      targetTerritory: intro.targetCity,
      stage: 'discovery_and_nda',
      ndaSigned: false,
      completionPercentage: 0,
      outstandingDocumentsCount: 4,
      rejectedOrClarificationCount: 0,
      legalDisclaimer:
        'This Deal Room contains privileged proprietary commercial disclosures. All materials are protected under statutory confidentiality agreements.',
      sharedDocuments: [],
      messages: [
        {
          sender: req.user!._id,
          senderRole: userRole,
          text: `Welcome to the official Deal Room for ${intro.brandName} (${intro.targetCity}). This room serves as the secure vault for due diligence disclosures, territory review, and franchise agreement execution.`,
          createdAt: new Date(),
        },
      ],
      dealMilestones: initialMilestones,
    });

    // Link Deal Room to Introduction and update status
    intro.dealRoom = newDealRoom._id as any;
    intro.dealRoomCreatedAt = new Date();
    intro.status = 'DEAL_ROOM_CREATED';
    intro.history.push({
      status: 'DEAL_ROOM_CREATED',
      changedBy: req.user!._id,
      changedByRole: userRole,
      note: `Deal Room opened: ${roomName} (ID: ${newDealRoom._id})`,
      timestamp: new Date(),
    });
    await intro.save();

    // In-App Notification to both parties
    await NotificationService.createNotification({
      recipient: investorId,
      title: 'Expansion Deal Room Initialized',
      message: `Your secure Deal Room for ${intro.brandName} is now active. Access due diligence documents and begin territory review.`,
      type: 'deal_stage_changed',
      actionUrl: `/deal-room/${newDealRoom._id}`,
    });

    await NotificationService.createNotification({
      recipient: franchisorId,
      title: 'Expansion Deal Room Initialized',
      message: `Deal Room active for ${intro.brandName} in ${intro.targetCity}. Start uploading disclosure manuals.`,
      type: 'deal_stage_changed',
      actionUrl: `/deal-room/${newDealRoom._id}`,
    });

    return sendSuccess(
      res,
      { dealRoom: newDealRoom, introduction: intro },
      'Deal Room successfully established from authorized introduction.',
      201
    );
  } catch (error: any) {
    Logger.error('[createDealRoomFromIntroduction] Error', error);
    return sendError(res, error.message || 'Failed to initialize Deal Room', 500);
  }
}

/**
 * GET /api/v1/introductions/my
 * Retrieves all introductions for the current user (investor or franchisor).
 * Enforces strict PII masking until mutual consent is achieved.
 */
export async function getMyIntroductions(req: AuthRequest, res: Response): Promise<any> {
  try {
    const userId = req.user!._id.toString();
    const userRole = req.user!.role;

    const query: any = {
      $or: [{ investorUser: req.user!._id }, { businessOwnerUser: req.user!._id }],
    };

    if (req.query.status) {
      query.status = req.query.status;
    }

    const intros = await IntroductionRequest.find(query)
      .populate('franchise', 'brandName logoUrl bannerUrl industry totalInvestmentMin totalInvestmentMax businessModel expansionLocations')
      .populate('business', 'businessName brandName logoUrl category headquarters currentLocations')
      .populate('businessOwnerUser', 'fullName email phone')
      .populate('investorUser', 'fullName email phone')
      .populate('investorProfile', 'fullName email phone city state country investmentBudgetMin investmentBudgetMax liquidCapital preferredLocations preferredIndustries businessExperienceYears pastFranchiseExperience investmentTimeline isVerified')
      .sort({ updatedAt: -1 });

    const sanitizedList = intros.map((intro) =>
      sanitizeIntroductionForUser(intro, userId, userRole)
    );

    return sendSuccess(res, sanitizedList, 'Introductions fetched successfully', 200, {
      count: sanitizedList.length,
    });
  } catch (error: any) {
    Logger.error('[getMyIntroductions] Error', error);
    return sendError(res, error.message || 'Failed to fetch introductions', 500);
  }
}

/**
 * GET /api/v1/introductions/:id
 * Retrieves a single introduction by ID with privacy enforcement.
 */
export async function getIntroductionById(req: AuthRequest, res: Response): Promise<any> {
  try {
    const { id } = req.params;
    const userId = req.user!._id.toString();
    const userRole = req.user!.role;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return sendError(res, 'Invalid introduction ID.', 400);
    }

    const intro = await IntroductionRequest.findById(id)
      .populate('franchise')
      .populate('business')
      .populate('businessOwnerUser', 'fullName email phone')
      .populate('investorUser', 'fullName email phone')
      .populate('investorProfile')
      .populate('assignedBroker', 'fullName email phone');

    if (!intro) {
      return sendError(res, 'Introduction request not found.', 404);
    }

    const isFranchisor =
      (intro.businessOwnerUser?._id || intro.businessOwnerUser)?.toString() === userId;
    const isInvestor =
      (intro.investorUser?._id || intro.investorUser)?.toString() === userId;
    const isPrivileged = userRole === 'admin' || userRole === 'super_admin' || userRole === 'broker';

    if (!isFranchisor && !isInvestor && !isPrivileged) {
      return sendError(res, 'Unauthorized to view this introduction request.', 403);
    }

    const sanitized = sanitizeIntroductionForUser(intro, userId, userRole);
    return sendSuccess(res, sanitized, 'Introduction request retrieved successfully');
  } catch (error: any) {
    Logger.error('[getIntroductionById] Error', error);
    return sendError(res, error.message || 'Failed to retrieve introduction request', 500);
  }
}

/**
 * GET /api/v1/introductions/admin/all
 * Admin & Broker Introduction Desk: View all active and completed introductions across the platform.
 */
export async function getAdminIntroductions(req: AuthRequest, res: Response): Promise<any> {
  try {
    const query: any = {};
    if (req.query.status) {
      query.status = req.query.status;
    }
    if (req.query.search) {
      query.brandName = { $regex: req.query.search as string, $options: 'i' };
    }

    const page = parseInt(req.query.page as string, 10) || 1;
    const limit = parseInt(req.query.limit as string, 10) || 20;
    const skip = (page - 1) * limit;

    const [intros, total] = await Promise.all([
      IntroductionRequest.find(query)
        .populate('franchise', 'brandName industry totalInvestmentMin totalInvestmentMax')
        .populate('businessOwnerUser', 'fullName email phone')
        .populate('investorUser', 'fullName email phone')
        .populate('investorProfile', 'city state investmentBudgetMax liquidCapital isVerified')
        .populate('assignedBroker', 'fullName email')
        .sort({ updatedAt: -1 })
        .skip(skip)
        .limit(limit),
      IntroductionRequest.countDocuments(query),
    ]);

    return sendSuccess(res, intros, 'Admin introductions fetched successfully', 200, {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error: any) {
    Logger.error('[getAdminIntroductions] Error', error);
    return sendError(res, error.message || 'Failed to fetch admin introductions', 500);
  }
}

/**
 * PATCH /api/v1/introductions/admin/:id/mediate
 * Admin Mediation Desk: Record notes, assign brokers, or update recommendations.
 */
export async function mediateIntroduction(req: AuthRequest, res: Response): Promise<any> {
  try {
    const { id } = req.params;
    const { assignedBrokerId, adminMediationNotes, isRecommendedByAdmin, status } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return sendError(res, 'Invalid introduction ID.', 400);
    }

    const intro = await IntroductionRequest.findById(id);
    if (!intro) {
      return sendError(res, 'Introduction request not found.', 404);
    }

    if (assignedBrokerId) {
      intro.assignedBroker = assignedBrokerId;
    }
    if (adminMediationNotes !== undefined) {
      intro.adminMediationNotes = adminMediationNotes;
    }
    if (isRecommendedByAdmin !== undefined) {
      intro.isRecommendedByAdmin = Boolean(isRecommendedByAdmin);
    }
    if (status && status !== intro.status) {
      intro.status = status;
      intro.history.push({
        status,
        changedBy: req.user!._id,
        changedByRole: req.user!.role,
        note: `Status adjusted by admin mediator: ${adminMediationNotes || 'No notes provided'}`,
        timestamp: new Date(),
      });
    }

    await intro.save();
    return sendSuccess(res, intro, 'Introduction mediation recorded successfully');
  } catch (error: any) {
    Logger.error('[mediateIntroduction] Error', error);
    return sendError(res, error.message || 'Failed to record mediation', 500);
  }
}
