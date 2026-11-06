import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { DealRoom, IDealRoom } from '../models/DealRoom';
import { FranchiseListing } from '../models/FranchiseListing';
import { User } from '../models/User';

export const getDealRooms = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    const role = req.user?.role;

    let filter = {};
    if (role === 'business_owner') {
      filter = { franchisor: userId };
    } else if (role === 'investor') {
      filter = { investor: userId };
    } else if ((role as string) === 'broker') {
      filter = { broker: userId };
    }

    let rooms = await DealRoom.find(filter)
      .populate('franchiseListing', 'brandName industry slug logoUrl bannerUrl')
      .populate('franchisor', 'fullName email phone')
      .populate('investor', 'fullName email phone')
      .populate('broker', 'fullName email phone')
      .sort({ updatedAt: -1 });

    // If empty for this user, seed an active demo room with RoastCraft
    if (rooms.length === 0) {
      const sampleListing = await FranchiseListing.findOne({ slug: 'roastcraft-specialty-coffee' });
      const adminUser = await User.findOne({ role: 'admin' });

      if (sampleListing && adminUser) {
        const franchisorUser = sampleListing.ownerUser || adminUser._id;
        const newRoom = await DealRoom.create({
          franchiseListing: sampleListing._id,
          franchisor: franchisorUser,
          investor: userId,
          broker: adminUser._id,
          roomName: `${sampleListing.brandName} - Koramangala Bangalore Territory`,
          targetTerritory: 'Koramangala 4th Block, Bangalore',
          stage: 'agreement_drafting',
          ndaSigned: true,
          ndaSignedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
          sharedDocuments: [
            {
              docId: 'doc-nda',
              title: 'Mutual Non-Disclosure Agreement (Executed)',
              docType: 'NDA',
              fileUrl: '/uploads/roastcraft_master_fdd_2026.pdf',
              uploadedBy: adminUser._id,
              accessRoles: ['franchisor', 'investor', 'broker', 'admin'],
              uploadedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
            },
            {
              docId: 'doc-fdd',
              title: '2026 Certified Franchise Disclosure Document (FDD)',
              docType: 'FDD',
              fileUrl: '/uploads/roastcraft_master_fdd_2026.pdf',
              uploadedBy: franchisorUser,
              accessRoles: ['franchisor', 'investor', 'broker', 'admin'],
              uploadedAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000),
            },
            {
              docId: 'doc-sop',
              title: 'Master Espresso & Roastery Operations SOP',
              docType: 'SOP',
              fileUrl: '/uploads/roastcraft_espresso_sop_manual.pdf',
              uploadedBy: franchisorUser,
              accessRoles: ['franchisor', 'investor', 'broker', 'admin'],
              uploadedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
            },
          ],
          messages: [
            {
              sender: adminUser._id,
              senderRole: 'broker',
              text: 'Welcome both parties to the official digital deal room for RoastCraft Specialty Coffee! Mutual NDA has been countersigned.',
              createdAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000),
            },
            {
              sender: franchisorUser,
              senderRole: 'franchisor',
              text: 'Thanks! We have attached the complete Item 19 FPR disclosures and 85-page Espresso Operations SOP for your legal review.',
              createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
            },
            {
              sender: userId,
              senderRole: 'investor',
              text: 'Reviewed the unit economics. We are ready to review the territory exclusivity clause for South Bangalore.',
              createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
            },
          ],
          signatureRequest: {
            status: 'out_for_signature',
            documentTitle: 'Franchise Master Development Agreement - South Bangalore',
            documentUrl: '/uploads/roastcraft_master_fdd_2026.pdf',
            participants: [
              {
                role: 'franchisor',
                userId: franchisorUser,
                name: 'Ananya Sharma',
                email: 'ananya@roastcraft.com',
                status: 'signed',
                signedAt: new Date(Date.now() - 12 * 60 * 60 * 1000),
              },
              {
                role: 'investor',
                userId: userId,
                name: req.user?.fullName || 'Investor Partner',
                email: req.user?.email || 'investor@example.com',
                status: 'pending',
              },
              {
                role: 'broker',
                userId: adminUser._id,
                name: 'Aditya Oberoi',
                email: 'aditya@franchisebridge.com',
                status: 'pending',
              },
            ],
          },
          dealMilestones: [
            { title: 'Discovery & Intro Call', completed: true, completedAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000) },
            { title: 'NDA Signed & FDD Shared', completed: true, completedAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000) },
            { title: 'Territory Evaluation & LOI', completed: true, completedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000) },
            { title: 'Franchise Agreement Out for Signature', completed: false },
            { title: 'Franchise Fee Escrow & Onboarding', completed: false },
          ],
        });

        rooms = [
          await DealRoom.findById(newRoom._id)
            .populate('franchiseListing', 'brandName industry slug logoUrl bannerUrl')
            .populate('franchisor', 'fullName email phone')
            .populate('investor', 'fullName email phone')
            .populate('broker', 'fullName email phone') as any,
        ];
      }
    }

    res.json({ success: true, count: rooms.length, data: rooms });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getDealRoomById = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const room = await DealRoom.findById(id)
      .populate('franchiseListing', 'brandName industry slug logoUrl bannerUrl initialFranchiseFee royaltyPercentage')
      .populate('franchisor', 'fullName email phone')
      .populate('investor', 'fullName email phone')
      .populate('broker', 'fullName email phone');

    if (!room) {
      res.status(404).json({ success: false, message: 'Deal room not found' });
      return;
    }

    res.json({ success: true, data: room });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const postDealRoomMessage = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { text, attachmentUrl } = req.body;

    const room = await DealRoom.findById(id);
    if (!room) {
      res.status(404).json({ success: false, message: 'Deal room not found' });
      return;
    }

    const senderRole = req.user?.role === 'business_owner' ? 'franchisor' : req.user?.role === 'investor' ? 'investor' : 'broker';

    room.messages.push({
      sender: req.user?.id as any,
      senderRole,
      text,
      attachmentUrl,
      createdAt: new Date(),
    });

    await room.save();
    res.json({ success: true, data: room });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const signDealRoomDocument = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;

    const room = await DealRoom.findById(id);
    if (!room) {
      res.status(404).json({ success: false, message: 'Deal room not found' });
      return;
    }

    const participant = room.signatureRequest.participants.find(
      (p) => p.userId.toString() === userId?.toString()
    );

    if (participant) {
      participant.status = 'signed';
      participant.signedAt = new Date();
      participant.ipAddress = req.ip || '127.0.0.1';
    }

    const allSigned = room.signatureRequest.participants.every((p) => p.status === 'signed');
    if (allSigned) {
      room.signatureRequest.status = 'completed';
      room.signatureRequest.completedAt = new Date();
      room.stage = 'deal_finalized';

      const sigMilestone = room.dealMilestones.find((m) => m.title.includes('Signature'));
      if (sigMilestone) {
        sigMilestone.completed = true;
        sigMilestone.completedAt = new Date();
      }
    }

    await room.save();
    res.json({ success: true, data: room });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
};
