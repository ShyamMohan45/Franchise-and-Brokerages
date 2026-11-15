export type DealRoomStage =
  | 'discovery_and_nda'
  | 'fdd_and_sop_disclosure'
  | 'territory_and_financials'
  | 'agreement_drafting'
  | 'out_for_signature'
  | 'deal_finalized'
  | 'cancelled'
  | 'NEW_ENQUIRY'
  | 'INITIAL_CONTACT'
  | 'QUALIFICATION'
  | 'BRAND_MATCHING'
  | 'MEETING_SCHEDULED'
  | 'NEGOTIATION'
  | 'DUE_DILIGENCE'
  | 'AGREEMENT'
  | 'CLOSED_WON'
  | 'CLOSED_LOST';

export type DealDocumentCategory =
  | 'BRAND_PROFILE'
  | 'FRANCHISE_DISCLOSURE'
  | 'FINANCIAL'
  | 'AGREEMENT_DRAFT'
  | 'IDENTITY_BUSINESS'
  | 'PROPERTY_LOCATION'
  | 'DUE_DILIGENCE_EVIDENCE'
  | 'OTHER_SUPPORTING';

export type DealDocumentStatus =
  | 'PENDING'
  | 'SUBMITTED'
  | 'UNDER_REVIEW'
  | 'APPROVED'
  | 'REJECTED'
  | 'SUPERSEDED';

export interface DocumentVersionInfo {
  versionNumber: number;
  fileName: string;
  storageKey: string;
  fileSize: number;
  mimeType: string;
  uploadedBy: {
    _id: string;
    fullName: string;
    email: string;
    role: string;
  } | string;
  uploadedAt: string;
  changeNote?: string;
}

export interface DealDocument {
  _id: string;
  dealRoom: string;
  deal: string;
  title: string;
  fileName: string;
  storageKey: string;
  filePath: string;
  category: DealDocumentCategory;
  uploadedBy: {
    _id: string;
    fullName: string;
    email: string;
    role: string;
  };
  uploadedAt: string;
  fileSize: number;
  mimeType: string;
  status: DealDocumentStatus;
  isInternalOnly: boolean;
  allowedRoles: Array<'investor' | 'business_owner' | 'brand_owner' | 'broker' | 'admin' | 'super_admin'>;
  currentVersion: number;
  versions: DocumentVersionInfo[];
  reviewerNotes?: string;
  reviewedBy?: {
    _id: string;
    fullName: string;
    email: string;
    role: string;
  };
  reviewedAt?: string;
  isLegallyCertified?: boolean;
  relatedDiligenceItem?: string;
  createdAt: string;
  updatedAt: string;
}

export type DueDiligenceItemStatus =
  | 'PENDING'
  | 'IN_PROGRESS'
  | 'SUBMITTED'
  | 'UNDER_REVIEW'
  | 'APPROVED'
  | 'REJECTED'
  | 'NEEDS_CLARIFICATION'
  | 'pending'
  | 'in_review'
  | 'verified'
  | 'flagged'
  | 'not_applicable';

export interface DueDiligenceCategoryItem {
  itemId: string;
  category: string;
  title: string;
  description: string;
  status: DueDiligenceItemStatus;
  notes: string;
  reviewerNotes?: string;
  reviewedBy?: string;
  reviewedAt?: string;
  verifiedAt?: string;
  verifiedBy?: string;
  documentRef?: string;
  evidenceDocuments?: Array<{
    _id: string;
    title: string;
    fileName: string;
    fileSize: number;
    category: string;
    status: string;
    isInternalOnly: boolean;
    createdAt: string;
  }>;
  clarificationRequest?: string;
  deadline?: string;
}

export interface DueDiligenceChecklist {
  _id: string;
  deal?: string;
  dealRoom?: string;
  brokerageDeal?: string;
  franchiseListing: string;
  investor: string;
  businessOwner?: string;
  assignedBroker?: string;
  overallStatus: 'PENDING' | 'IN_PROGRESS' | 'UNDER_REVIEW' | 'APPROVED' | 'NEEDS_CLARIFICATION' | 'REJECTED';
  completionPercentage: number;
  items: DueDiligenceCategoryItem[];
  riskSummary?: string;
  disclaimer?: string;
  createdAt: string;
  updatedAt: string;
}

export interface DealMessage {
  _id: string;
  dealRoom: string;
  deal: string;
  sender: {
    _id: string;
    fullName: string;
    email: string;
    role: string;
  };
  senderRole: 'investor' | 'business_owner' | 'brand_owner' | 'broker' | 'admin' | 'super_admin';
  text: string;
  isInternal: boolean;
  relatedDocument?: {
    _id: string;
    title: string;
    fileName: string;
    category: string;
  };
  relatedDiligenceItem?: string;
  createdAt: string;
  updatedAt: string;
}

export interface SignatureParticipant {
  role: string;
  userId: string;
  name: string;
  email: string;
  status: 'pending' | 'signed' | 'declined';
  signedAt?: string;
  ipAddress?: string;
}

export interface SignatureRequest {
  status: 'draft' | 'out_for_signature' | 'completed' | 'cancelled';
  documentTitle: string;
  documentUrl: string;
  participants: SignatureParticipant[];
  completedAt?: string;
}

export interface DealMilestone {
  title: string;
  completed: boolean;
  completedAt?: string;
  deadline?: string;
}

export interface DealRoom {
  _id: string;
  deal?: any;
  dealRef?: string;
  franchiseListing?: {
    _id: string;
    brandName: string;
    industry?: string;
    slug?: string;
    logoUrl?: string;
    bannerUrl?: string;
    investmentRange?: {
      min: number;
      max: number;
    };
  };
  franchisor?: {
    _id: string;
    fullName: string;
    email: string;
    phone?: string;
    role: string;
  };
  businessOwner?: {
    _id: string;
    fullName: string;
    email: string;
    phone?: string;
    role: string;
  };
  investor?: {
    _id: string;
    fullName: string;
    email: string;
    phone?: string;
    role: string;
  };
  broker?: {
    _id: string;
    fullName: string;
    email: string;
    phone?: string;
    role: string;
  };
  assignedBroker?: {
    _id: string;
    fullName: string;
    email: string;
    phone?: string;
    role: string;
  };
  roomName: string;
  targetTerritory: string;
  stage: DealRoomStage;
  ndaSigned: boolean;
  ndaSignedAt?: string;
  dueDiligenceChecklist?: DueDiligenceChecklist;
  completionPercentage: number;
  outstandingDocumentsCount: number;
  rejectedOrClarificationCount: number;
  documentsCount?: number;
  outstandingCount?: number;
  userRoleInRoom?: string;
  isInternalPrivileged?: boolean;
  legalDisclaimer?: string;
  dealMilestones: DealMilestone[];
  signatureRequest: SignatureRequest;
  sharedDocuments?: Array<{
    docId: string;
    title: string;
    docType: string;
    fileUrl: string;
    uploadedBy: string;
    accessRoles: string[];
    uploadedAt: string;
  }>;
  recentTasks?: any[];
  recentMeetings?: any[];
  createdAt: string;
  updatedAt: string;
}
