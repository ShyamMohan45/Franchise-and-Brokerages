'use client';

import React, { useState, useEffect, use } from 'react';
import Link from 'next/link';
import {
  Briefcase,
  FileText,
  MessageSquare,
  Send,
  CheckCircle2,
  Clock,
  ArrowLeft,
  Download,
  ShieldCheck,
  PenTool,
  Lock,
  UserCheck,
  Building,
  AlertCircle,
  Upload,
  Filter,
  CheckSquare,
  Eye,
  Plus,
  RefreshCw,
  AlertTriangle,
  FileCheck,
} from 'lucide-react';

interface DealDoc {
  _id: string;
  title: string;
  fileName: string;
  category: string;
  fileSize: number;
  mimeType: string;
  status: string;
  isInternalOnly: boolean;
  currentVersion: number;
  uploadedAt: string;
  reviewerNotes?: string;
  uploadedBy?: { fullName: string; role: string };
}

interface DiligenceItem {
  itemId: string;
  category: string;
  title: string;
  description: string;
  status: string;
  notes: string;
  reviewerNotes?: string;
  clarificationRequest?: string;
  evidenceDocuments?: any[];
}

interface Message {
  _id?: string;
  sender: { fullName?: string; email?: string; role?: string } | string;
  senderRole?: string;
  text: string;
  isInternal?: boolean;
  createdAt: string;
  relatedDiligenceItem?: string;
}

interface Signatory {
  role: string;
  userId: string;
  name: string;
  email: string;
  status: 'pending' | 'signed' | 'declined';
  signedAt?: string;
}

interface Milestone {
  title: string;
  completed: boolean;
  completedAt?: string;
}

interface DealRoomDetail {
  _id: string;
  roomName: string;
  targetTerritory: string;
  stage: string;
  ndaSigned: boolean;
  completionPercentage?: number;
  outstandingCount?: number;
  rejectedOrClarificationCount?: number;
  legalDisclaimer?: string;
  userRoleInRoom?: string;
  isInternalPrivileged?: boolean;
  dealMilestones: Milestone[];
  signatureRequest: {
    status: 'draft' | 'out_for_signature' | 'completed';
    documentTitle: string;
    documentUrl: string;
    participants: Signatory[];
    completedAt?: string;
  };
  franchiseListing?: {
    brandName: string;
    industry: string;
    slug: string;
    investmentRange?: { min: number; max: number };
  };
  franchisor?: { fullName: string; email: string };
  businessOwner?: { fullName: string; email: string };
  investor?: { fullName: string; email: string };
  broker?: { fullName: string; email: string };
  assignedBroker?: { fullName: string; email: string };
}

export default function DealRoomDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const roomId = resolvedParams.id;

  const [room, setRoom] = useState<DealRoomDetail | null>(null);
  const [documents, setDocuments] = useState<DealDoc[]>([]);
  const [diligenceItems, setDiligenceItems] = useState<DiligenceItem[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'checklist' | 'documents' | 'chat' | 'esign'>('checklist');

  // Chat input
  const [chatInput, setChatInput] = useState('');
  const [isInternalNote, setIsInternalNote] = useState(false);

  // Document upload state
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [docTitle, setDocTitle] = useState('');
  const [docCategory, setDocCategory] = useState('BRAND_PROFILE');
  const [docInternal, setDocInternal] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');

  // Category filter
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');

  // E-Sign
  const [signing, setSigning] = useState(false);
  const [signSuccess, setSignSuccess] = useState(false);

  // Diligence update modal
  const [editingItem, setEditingItem] = useState<DiligenceItem | null>(null);
  const [newStatus, setNewStatus] = useState('');
  const [newReviewerNotes, setNewReviewerNotes] = useState('');
  const [updatingItem, setUpdatingItem] = useState(false);

  const fetchRoomData = async () => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('fb_auth_token') : null;
    const authHeaders: HeadersInit = token ? { Authorization: `Bearer ${token}` } : {};

    try {
      // 1. Fetch Room Details
      const roomRes = await fetch(`http://localhost:5000/api/v1/deal-rooms/${roomId}`, {
        headers: authHeaders,
      });
      const roomData = await roomRes.json();
      if (roomData.success && roomData.data) {
        setRoom(roomData.data);
      }

      // 2. Fetch Documents
      const docsRes = await fetch(`http://localhost:5000/api/v1/deal-rooms/${roomId}/documents`, {
        headers: authHeaders,
      });
      const docsData = await docsRes.json();
      if (docsData.success && docsData.data) {
        setDocuments(docsData.data);
      }

      // 3. Fetch Due Diligence
      const ddRes = await fetch(`http://localhost:5000/api/v1/deal-rooms/${roomId}/due-diligence`, {
        headers: authHeaders,
      });
      const ddData = await ddRes.json();
      if (ddData.success && ddData.data?.items) {
        setDiligenceItems(ddData.data.items);
      }

      // 4. Fetch Messages
      const msgRes = await fetch(`http://localhost:5000/api/v1/deal-rooms/${roomId}/messages`, {
        headers: authHeaders,
      });
      const msgData = await msgRes.json();
      if (msgData.success && msgData.data) {
        setMessages(msgData.data);
      }
    } catch (err) {
      console.error('Error fetching deal room data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRoomData();
  }, [roomId]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;

    const token = typeof window !== 'undefined' ? localStorage.getItem('fb_auth_token') : null;
    try {
      const response = await fetch(`http://localhost:5000/api/v1/deal-rooms/${roomId}/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          text: chatInput,
          isInternal: isInternalNote,
        }),
      });
      const data = await response.json();
      if (data.success && data.data) {
        setMessages((prev) => [...prev, data.data]);
        setChatInput('');
        setIsInternalNote(false);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleUploadDocument = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!uploadFile) {
      setUploadError('Please select a file to upload');
      return;
    }

    setUploading(true);
    setUploadError('');

    const token = typeof window !== 'undefined' ? localStorage.getItem('fb_auth_token') : null;
    const formData = new FormData();
    formData.append('file', uploadFile);
    formData.append('title', docTitle || uploadFile.name);
    formData.append('category', docCategory);
    if (docInternal) {
      formData.append('isInternalOnly', 'true');
    }

    try {
      const response = await fetch(`http://localhost:5000/api/v1/deal-rooms/${roomId}/documents`, {
        method: 'POST',
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        body: formData,
      });
      const data = await response.json();
      if (data.success) {
        setShowUploadModal(false);
        setUploadFile(null);
        setDocTitle('');
        setDocInternal(false);
        fetchRoomData();
      } else {
        setUploadError(data.message || 'Upload failed');
      }
    } catch (err: any) {
      setUploadError(err.message || 'Network error');
    } finally {
      setUploading(false);
    }
  };

  const handleDownload = async (docId: string, fileName: string) => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('fb_auth_token') : null;
    try {
      const res = await fetch(
        `http://localhost:5000/api/v1/deal-rooms/${roomId}/documents/${docId}/download`,
        {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        }
      );
      if (!res.ok) {
        const err = await res.json();
        alert(err.message || 'Download forbidden or unavailable.');
        return;
      }
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (e: any) {
      alert(e.message || 'Download error');
    }
  };

  const handleUpdateDiligenceItem = async () => {
    if (!editingItem) return;
    setUpdatingItem(true);
    const token = typeof window !== 'undefined' ? localStorage.getItem('fb_auth_token') : null;

    try {
      const response = await fetch(
        `http://localhost:5000/api/v1/deal-rooms/${roomId}/due-diligence/${editingItem.itemId}`,
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
          body: JSON.stringify({
            status: newStatus || editingItem.status,
            reviewerNotes: newReviewerNotes,
          }),
        }
      );
      const data = await response.json();
      if (data.success) {
        setEditingItem(null);
        fetchRoomData();
      } else {
        alert(data.message || 'Failed to update item');
      }
    } catch (e: any) {
      alert(e.message || 'Network error');
    } finally {
      setUpdatingItem(false);
    }
  };

  const handleSignDocument = async () => {
    setSigning(true);
    const token = typeof window !== 'undefined' ? localStorage.getItem('fb_auth_token') : null;
    try {
      const response = await fetch(`http://localhost:5000/api/v1/deal-rooms/${roomId}/sign`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });
      const data = await response.json();
      if (data.success) {
        setSignSuccess(true);
        fetchRoomData();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSigning(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-[#F8FAFC] min-h-screen py-24 text-center space-y-4">
        <div className="w-8 h-8 border-4 border-[#315EFB] border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-xs text-[#64748B] font-medium">Accessing Authenticated Deal Room Vault...</p>
      </div>
    );
  }

  if (!room) {
    return (
      <div className="bg-[#F8FAFC] min-h-screen py-24 text-center space-y-4">
        <AlertCircle className="w-12 h-12 text-rose-500 mx-auto" />
        <h2 className="text-xl font-bold text-[#14243A]">Deal Room Not Found</h2>
        <p className="text-xs text-[#64748B]">
          You may not be an authorized participant for this deal room, or it has not been initialized.
        </p>
        <Link href="/deal-room" className="btn-primary py-2 px-6 text-xs inline-flex">
          Return to Deal Rooms
        </Link>
      </div>
    );
  }

  const completionPct = room.completionPercentage || 0;
  const filteredDocs =
    selectedCategory === 'ALL'
      ? documents
      : documents.filter((d) => d.category === selectedCategory);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'APPROVED':
      case 'verified':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'UNDER_REVIEW':
      case 'in_review':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'SUBMITTED':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'IN_PROGRESS':
        return 'bg-indigo-50 text-indigo-700 border-indigo-200';
      case 'REJECTED':
      case 'flagged':
        return 'bg-rose-50 text-rose-700 border-rose-200';
      case 'NEEDS_CLARIFICATION':
        return 'bg-purple-50 text-purple-700 border-purple-200';
      default:
        return 'bg-slate-100 text-slate-600 border-slate-200';
    }
  };

  return (
    <div className="bg-[#F8FAFC] min-h-screen py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        {/* Navigation Breadcrumb */}
        <div className="flex items-center justify-between text-xs text-[#64748B]">
          <div className="flex items-center gap-2">
            <Link href="/deal-room" className="hover:text-[#315EFB] flex items-center gap-1 transition-colors">
              <ArrowLeft className="w-3.5 h-3.5" />
              All Deal Rooms
            </Link>
            <span>/</span>
            <span className="text-[#14243A] font-semibold">{room.roomName}</span>
          </div>
          <span className="px-2.5 py-1 rounded-full bg-slate-100 border border-slate-200 text-slate-700 font-mono text-[11px]">
            Your Access Role: <strong className="capitalize">{room.userRoleInRoom || 'Authorized'}</strong>
          </span>
        </div>

        {/* Mandatory Brokerage Legal Disclaimer Banner */}
        <div className="bg-amber-50 border border-amber-200 p-3.5 rounded-xl flex items-start gap-3 text-xs text-amber-800">
          <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <p className="leading-relaxed">
            <strong>Diligence & Disclaimer Notice:</strong> All documents, checklist statuses, and communication
            items within this deal room are provided solely for brokerage due diligence facilitation and commercial
            evaluation. Document uploads and administrative reviews do not constitute formal legal verification,
            statutory compliance certification, or binding contractual warranties.
          </p>
        </div>

        {/* Room Header Card */}
        <div className="surface-card p-6 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full bg-[#EFF4FF] border border-[#BFD3FE] text-[#315EFB] text-[11px] font-semibold flex items-center gap-1">
                <Lock className="w-3 h-3" />
                Private Deal Room
              </span>
              <span className="px-2.5 py-0.5 rounded-full bg-[#E6F7F5] border border-[#C2EDE7] text-[#159D8B] text-[11px] font-semibold">
                Territory: {room.targetTerritory}
              </span>
              <span className="px-2.5 py-0.5 rounded-full bg-purple-50 border border-purple-200 text-purple-700 text-[11px] font-semibold">
                Stage: {room.stage.replace('_', ' ')}
              </span>
            </div>
            <h1 className="text-2xl font-bold text-[#14243A]">{room.roomName}</h1>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-[#64748B]">
              <span>Brand: <strong className="text-[#14243A]">{room.franchiseListing?.brandName || 'Brand'}</strong></span>
              <span>•</span>
              <span>Franchisor: <strong className="text-[#14243A]">{room.businessOwner?.fullName || room.franchisor?.fullName || 'Brand Owner'}</strong></span>
              <span>•</span>
              <span>Investor: <strong className="text-[#14243A]">{room.investor?.fullName || 'Investor'}</strong></span>
              <span>•</span>
              <span>Broker: <strong className="text-[#14243A]">{room.assignedBroker?.fullName || room.broker?.fullName || 'Assigned Broker'}</strong></span>
            </div>
          </div>

          {/* Diligence Completion Gauge */}
          <div className="flex items-center gap-4 bg-[#F8FAFC] p-4 rounded-xl border border-[#E7ECF2]">
            <div className="text-right">
              <span className="text-[10px] text-[#64748B] uppercase font-bold block">Due Diligence</span>
              <span className="text-2xl font-black text-[#315EFB]">{completionPct}%</span>
              <span className="text-[10px] text-[#64748B] block mt-0.5">Approved Items</span>
            </div>
            <div className="w-16 h-16 relative flex items-center justify-center">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                <path
                  className="text-slate-200"
                  strokeWidth="3.5"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
                <path
                  className="text-[#315EFB]"
                  strokeDasharray={`${completionPct}, 100`}
                  strokeWidth="3.5"
                  strokeLinecap="round"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
              </svg>
            </div>
          </div>
        </div>

        {/* Main Tab Navigation */}
        <div className="flex border-b border-[#E7ECF2] gap-8 text-xs font-semibold">
          <button
            onClick={() => setActiveTab('checklist')}
            className={`pb-3 flex items-center gap-2 border-b-2 transition-colors ${
              activeTab === 'checklist'
                ? 'border-[#315EFB] text-[#315EFB]'
                : 'border-transparent text-[#64748B] hover:text-[#14243A]'
            }`}
          >
            <CheckSquare className="w-4 h-4" />
            Due Diligence Checklist (11 Items)
          </button>
          <button
            onClick={() => setActiveTab('documents')}
            className={`pb-3 flex items-center gap-2 border-b-2 transition-colors ${
              activeTab === 'documents'
                ? 'border-[#315EFB] text-[#315EFB]'
                : 'border-transparent text-[#64748B] hover:text-[#14243A]'
            }`}
          >
            <FileText className="w-4 h-4" />
            Confidential Document Vault ({documents.length})
          </button>
          <button
            onClick={() => setActiveTab('chat')}
            className={`pb-3 flex items-center gap-2 border-b-2 transition-colors ${
              activeTab === 'chat'
                ? 'border-[#315EFB] text-[#315EFB]'
                : 'border-transparent text-[#64748B] hover:text-[#14243A]'
            }`}
          >
            <MessageSquare className="w-4 h-4" />
            Deal Room Communication & Notes ({messages.length})
          </button>
          <button
            onClick={() => setActiveTab('esign')}
            className={`pb-3 flex items-center gap-2 border-b-2 transition-colors ${
              activeTab === 'esign'
                ? 'border-[#315EFB] text-[#315EFB]'
                : 'border-transparent text-[#64748B] hover:text-[#14243A]'
            }`}
          >
            <PenTool className="w-4 h-4" />
            Franchise Agreement E-Sign
          </button>
        </div>

        {/* TAB 1: Due Diligence Checklist */}
        {activeTab === 'checklist' && (
          <div className="space-y-6">
            <div className="surface-card p-6 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-[#E7ECF2]">
                <div>
                  <h3 className="text-sm font-bold text-[#14243A]">11-Item Due Diligence Verification Checklist</h3>
                  <p className="text-xs text-[#64748B]">
                    Covers statutory brand compliance, trademark rights, unit economics, and operational feasibility.
                  </p>
                </div>
                <div className="flex items-center gap-2 text-xs">
                  <span className="px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-700 font-semibold border border-emerald-200">
                    {diligenceItems.filter((i) => i.status === 'APPROVED' || i.status === 'verified').length} Approved
                  </span>
                  <span className="px-2.5 py-1 rounded-lg bg-amber-50 text-amber-700 font-semibold border border-amber-200">
                    {diligenceItems.filter((i) => i.status === 'PENDING' || i.status === 'IN_PROGRESS' || i.status === 'SUBMITTED' || i.status === 'UNDER_REVIEW').length} Pending Review
                  </span>
                </div>
              </div>

              <div className="space-y-3">
                {diligenceItems.map((item, idx) => (
                  <div
                    key={item.itemId || idx}
                    className="p-4 rounded-xl bg-white border border-[#E7ECF2] hover:border-[#315EFB] transition-all space-y-2 text-xs"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] uppercase font-bold text-[#64748B] bg-slate-100 px-2 py-0.5 rounded">
                            {item.category}
                          </span>
                          <strong className="text-[#14243A] text-sm">{item.title}</strong>
                        </div>
                        <p className="text-[#64748B] leading-relaxed">{item.description}</p>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <span
                          className={`px-2.5 py-1 rounded-full text-[11px] font-bold border uppercase ${getStatusColor(
                            item.status
                          )}`}
                        >
                          {item.status.replace('_', ' ')}
                        </span>
                        {room.isInternalPrivileged && (
                          <button
                            onClick={() => {
                              setEditingItem(item);
                              setNewStatus(item.status);
                              setNewReviewerNotes(item.reviewerNotes || item.notes || '');
                            }}
                            className="btn-secondary py-1 px-2.5 text-[11px]"
                          >
                            Review Item
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Notes & Evidence */}
                    {(item.reviewerNotes || item.notes) && (
                      <div className="bg-[#F8FAFC] p-2.5 rounded-lg border border-[#E7ECF2] text-[11px] text-[#64748B] flex items-start gap-2">
                        <FileCheck className="w-3.5 h-3.5 text-[#315EFB] shrink-0 mt-0.5" />
                        <span><strong>Reviewer Notes:</strong> {item.reviewerNotes || item.notes}</span>
                      </div>
                    )}

                    {item.clarificationRequest && (
                      <div className="bg-purple-50 p-2.5 rounded-lg border border-purple-200 text-[11px] text-purple-800">
                        <strong>Clarification Required:</strong> {item.clarificationRequest}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: Document Management */}
        {activeTab === 'documents' && (
          <div className="space-y-6">
            <div className="surface-card p-6 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3 border-b border-[#E7ECF2]">
                <div>
                  <h3 className="text-sm font-bold text-[#14243A]">Confidential Deal Documents</h3>
                  <p className="text-xs text-[#64748B]">
                    Stored securely in private object storage. Unauthenticated downloads are strictly rejected.
                  </p>
                </div>
                <button
                  onClick={() => setShowUploadModal(true)}
                  className="btn-primary py-2 px-4 text-xs font-semibold inline-flex items-center gap-1.5"
                >
                  <Upload className="w-3.5 h-3.5" />
                  Upload Document
                </button>
              </div>

              {/* Category Filter Pills */}
              <div className="flex flex-wrap gap-2 text-xs">
                {[
                  'ALL',
                  'BRAND_PROFILE',
                  'FRANCHISE_DISCLOSURE',
                  'FINANCIAL',
                  'AGREEMENT_DRAFT',
                  'IDENTITY_BUSINESS',
                  'PROPERTY_LOCATION',
                  'DUE_DILIGENCE_EVIDENCE',
                  'OTHER_SUPPORTING',
                ].map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-3 py-1 rounded-lg font-medium transition-colors ${
                      selectedCategory === cat
                        ? 'bg-[#315EFB] text-white'
                        : 'bg-slate-100 text-[#64748B] hover:bg-slate-200'
                    }`}
                  >
                    {cat.replace('_', ' ')}
                  </button>
                ))}
              </div>

              {/* Document List */}
              {filteredDocs.length === 0 ? (
                <div className="p-12 text-center text-xs text-[#64748B] bg-[#F8FAFC] rounded-xl border border-[#E7ECF2] space-y-2">
                  <FileText className="w-8 h-8 text-[#64748B] mx-auto opacity-50" />
                  <p>No documents found in this category.</p>
                </div>
              ) : (
                <div className="space-y-2.5">
                  {filteredDocs.map((doc) => (
                    <div
                      key={doc._id}
                      className="p-4 rounded-xl bg-white border border-[#E7ECF2] flex items-center justify-between text-xs hover:border-[#315EFB] transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className="p-2.5 rounded-lg bg-[#EFF4FF] text-[#315EFB]">
                          <FileText className="w-5 h-5" />
                        </div>
                        <div className="space-y-0.5">
                          <div className="flex items-center gap-2">
                            <strong className="text-[#14243A] text-sm">{doc.title}</strong>
                            <span className="text-[10px] font-semibold text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded">
                              v{doc.currentVersion}
                            </span>
                            {doc.isInternalOnly && (
                              <span className="text-[10px] font-bold text-amber-700 bg-amber-50 border border-amber-200 px-1.5 py-0.5 rounded flex items-center gap-1">
                                <Lock className="w-2.5 h-2.5" />
                                Internal Broker Only
                              </span>
                            )}
                          </div>
                          <div className="text-[11px] text-[#64748B] flex items-center gap-2">
                            <span>{doc.fileName}</span>
                            <span>•</span>
                            <span>{(doc.fileSize / 1024).toFixed(1)} KB</span>
                            <span>•</span>
                            <span className="uppercase font-medium">{doc.category.replace('_', ' ')}</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <span
                          className={`px-2.5 py-1 rounded-full text-[10px] font-bold border ${getStatusColor(
                            doc.status
                          )}`}
                        >
                          {doc.status}
                        </span>
                        <button
                          onClick={() => handleDownload(doc._id, doc.fileName)}
                          className="btn-secondary py-1.5 px-3 text-xs font-semibold inline-flex items-center gap-1.5"
                        >
                          <Download className="w-3.5 h-3.5" /> Download
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 3: Deal Room Communication */}
        {activeTab === 'chat' && (
          <div className="surface-card p-6 flex flex-col h-[650px] justify-between space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#E7ECF2]">
              <div>
                <h3 className="text-sm font-bold text-[#14243A] flex items-center gap-2">
                  <MessageSquare className="w-4 h-4 text-[#315EFB]" />
                  Secure Multi-Party Channel & Internal Notes
                </h3>
                <p className="text-[11px] text-[#64748B]">
                  Encrypted negotiation history. Internal notes marked by brokers are strictly hidden from investors
                  and brand owners.
                </p>
              </div>
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            </div>

            {/* Scrollable Chat Area */}
            <div className="flex-1 overflow-y-auto space-y-3 pr-2">
              {messages.length === 0 ? (
                <div className="p-8 text-center text-xs text-[#64748B]">
                  No messages recorded in this deal room yet.
                </div>
              ) : (
                messages.map((msg, idx) => {
                  const senderName =
                    typeof msg.sender === 'object' && msg.sender?.fullName
                      ? msg.sender.fullName
                      : 'Participant';
                  const senderRole =
                    typeof msg.sender === 'object' && msg.sender?.role
                      ? msg.sender.role
                      : msg.senderRole || 'broker';

                  return (
                    <div
                      key={msg._id || idx}
                      className={`p-3.5 rounded-xl text-xs space-y-1.5 ${
                        msg.isInternal
                          ? 'bg-amber-50 border border-amber-300 text-amber-900'
                          : senderRole === 'broker' || senderRole === 'admin'
                          ? 'bg-[#EFF4FF] border border-[#BFD3FE]'
                          : 'bg-[#F8FAFC] border border-[#E7ECF2]'
                      }`}
                    >
                      <div className="flex items-center justify-between text-[11px]">
                        <div className="flex items-center gap-1.5">
                          <strong className="text-[#14243A]">{senderName}</strong>
                          <span className="text-[#64748B] uppercase font-semibold text-[9px] bg-white px-1.5 py-0.5 rounded border border-slate-200">
                            {senderRole}
                          </span>
                          {msg.isInternal && (
                            <span className="text-[9px] font-bold text-amber-800 bg-amber-200 px-1.5 py-0.5 rounded flex items-center gap-1">
                              <Lock className="w-2.5 h-2.5" />
                              Internal Broker Note
                            </span>
                          )}
                        </div>
                        <span className="text-[10px] text-[#64748B]">
                          {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      <p className="text-[#14243A] leading-relaxed">{msg.text}</p>
                    </div>
                  );
                })
              )}
            </div>

            {/* Message Input */}
            <form onSubmit={handleSendMessage} className="pt-3 border-t border-[#E7ECF2] space-y-2">
              {room.isInternalPrivileged && (
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="internalToggle"
                    checked={isInternalNote}
                    onChange={(e) => setIsInternalNote(e.target.checked)}
                    className="rounded border-[#E7ECF2] text-[#315EFB] focus:ring-0"
                  />
                  <label htmlFor="internalToggle" className="text-xs text-amber-800 font-semibold flex items-center gap-1">
                    <Lock className="w-3 h-3 text-amber-600" />
                    Internal Broker Note (Hidden from Investor & Brand Owner)
                  </label>
                </div>
              )}
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder={
                    isInternalNote
                      ? 'Type confidential internal broker observation...'
                      : 'Type secure message to all deal participants...'
                  }
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  className={`flex-1 px-3.5 py-2 text-xs rounded-xl border focus:outline-none ${
                    isInternalNote
                      ? 'border-amber-300 focus:border-amber-500 bg-amber-50 text-amber-900'
                      : 'border-[#E7ECF2] focus:border-[#315EFB] text-[#14243A]'
                  }`}
                />
                <button type="submit" className="btn-primary py-2 px-5 text-xs font-semibold">
                  <Send className="w-3.5 h-3.5 mr-1" />
                  Send
                </button>
              </div>
            </form>
          </div>
        )}

        {/* TAB 4: E-Sign Agreement */}
        {activeTab === 'esign' && (
          <div className="surface-card p-6 space-y-6">
            <div className="flex items-center justify-between pb-3 border-b border-[#E7ECF2]">
              <h3 className="text-sm font-bold text-[#14243A] flex items-center gap-2">
                <PenTool className="w-4 h-4 text-[#315EFB]" />
                Franchise Agreement Digital E-Signature
              </h3>
              <span className="text-[11px] font-semibold text-[#159D8B] bg-[#E6F7F5] px-2 py-0.5 rounded">
                Multi-Party Execution Status
              </span>
            </div>

            <div className="bg-[#F8FAFC] p-4 rounded-xl border border-[#E7ECF2] space-y-4 text-xs">
              <div className="flex items-center justify-between">
                <div>
                  <strong className="text-sm text-[#14243A] block">
                    {room.signatureRequest?.documentTitle || 'Master Franchise Development Agreement'}
                  </strong>
                  <span className="text-[#64748B]">Includes territory covenant, fee schedule, and audit covenants</span>
                </div>
                <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200 capitalize">
                  {room.signatureRequest?.status.replace('_', ' ') || 'Out for Signature'}
                </span>
              </div>

              {/* Signatories */}
              <div className="space-y-2 pt-2 border-t border-[#E7ECF2]">
                {room.signatureRequest?.participants?.map((sig, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between p-3 rounded-lg bg-white border border-[#E7ECF2]"
                  >
                    <div className="flex items-center gap-2">
                      <UserCheck className="w-4 h-4 text-[#64748B]" />
                      <div>
                        <strong className="text-[#14243A]">{sig.name}</strong>
                        <span className="text-[10px] text-[#64748B] ml-1 capitalize">({sig.role})</span>
                      </div>
                    </div>
                    <span
                      className={`font-semibold text-xs ${
                        sig.status === 'signed' ? 'text-[#159D8B]' : 'text-amber-600'
                      }`}
                    >
                      {sig.status === 'signed' ? '✓ Signed' : 'Pending Signature'}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-between pt-2">
              <span className="text-xs text-[#64748B]">
                {signSuccess ? 'Your digital signature has been recorded' : 'Click below to execute signature'}
              </span>
              <button
                onClick={handleSignDocument}
                disabled={signing || signSuccess}
                className="btn-primary py-2.5 px-6 text-xs font-semibold"
              >
                <PenTool className="w-3.5 h-3.5 mr-1" />
                {signing ? 'Signing...' : signSuccess ? '✓ Executed Successfully' : 'Execute Digital Signature'}
              </button>
            </div>
          </div>
        )}

        {/* Modal: Upload Document */}
        {showUploadModal && (
          <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-xl">
              <div className="flex items-center justify-between pb-3 border-b border-[#E7ECF2]">
                <h3 className="text-sm font-bold text-[#14243A]">Upload Confidential Document</h3>
                <button
                  onClick={() => setShowUploadModal(false)}
                  className="text-[#64748B] hover:text-[#14243A] text-lg font-bold"
                >
                  ✕
                </button>
              </div>

              {uploadError && (
                <div className="bg-rose-50 text-rose-700 p-2.5 rounded-lg text-xs border border-rose-200">
                  {uploadError}
                </div>
              )}

              <form onSubmit={handleUploadDocument} className="space-y-3 text-xs">
                <div>
                  <label className="block text-[#64748B] font-semibold mb-1">Document Title</label>
                  <input
                    type="text"
                    placeholder="e.g. 2026 Audited Balance Sheet"
                    value={docTitle}
                    onChange={(e) => setDocTitle(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-[#E7ECF2] text-[#14243A]"
                    required
                  />
                </div>

                <div>
                  <label className="block text-[#64748B] font-semibold mb-1">Category</label>
                  <select
                    value={docCategory}
                    onChange={(e) => setDocCategory(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-[#E7ECF2] text-[#14243A]"
                  >
                    <option value="BRAND_PROFILE">Brand profile documents</option>
                    <option value="FRANCHISE_DISCLOSURE">Franchise disclosure & business information</option>
                    <option value="FINANCIAL">Financial documents</option>
                    <option value="AGREEMENT_DRAFT">Franchise agreement drafts</option>
                    <option value="IDENTITY_BUSINESS">Identity & business documents</option>
                    <option value="PROPERTY_LOCATION">Property & location documents</option>
                    <option value="DUE_DILIGENCE_EVIDENCE">Due diligence evidence</option>
                    <option value="OTHER_SUPPORTING">Other supporting documents</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[#64748B] font-semibold mb-1">Select File (Max 25MB)</label>
                  <input
                    type="file"
                    onChange={(e) => setUploadFile(e.target.files?.[0] || null)}
                    className="w-full text-xs text-[#64748B]"
                    required
                  />
                </div>

                {room.isInternalPrivileged && (
                  <div className="flex items-center gap-2 pt-2">
                    <input
                      type="checkbox"
                      id="docInternalToggle"
                      checked={docInternal}
                      onChange={(e) => setDocInternal(e.target.checked)}
                      className="rounded border-[#E7ECF2] text-[#315EFB]"
                    />
                    <label htmlFor="docInternalToggle" className="text-xs text-amber-800 font-semibold flex items-center gap-1">
                      <Lock className="w-3 h-3 text-amber-600" />
                      Internal Broker Document (Hidden from Investor & Brand Owner)
                    </label>
                  </div>
                )}

                <div className="pt-4 flex justify-end gap-2 border-t border-[#E7ECF2]">
                  <button
                    type="button"
                    onClick={() => setShowUploadModal(false)}
                    className="btn-secondary py-2 px-4 text-xs"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={uploading}
                    className="btn-primary py-2 px-5 text-xs font-semibold"
                  >
                    {uploading ? 'Uploading...' : 'Save to Vault'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Modal: Edit Diligence Item */}
        {editingItem && (
          <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-xl text-xs">
              <div className="flex items-center justify-between pb-3 border-b border-[#E7ECF2]">
                <h3 className="text-sm font-bold text-[#14243A]">Review Diligence Item</h3>
                <button
                  onClick={() => setEditingItem(null)}
                  className="text-[#64748B] hover:text-[#14243A] text-lg font-bold"
                >
                  ✕
                </button>
              </div>

              <div>
                <strong className="text-sm text-[#14243A] block">{editingItem.title}</strong>
                <span className="text-[#64748B] text-[11px]">{editingItem.description}</span>
              </div>

              <div className="space-y-3">
                <div>
                  <label className="block text-[#64748B] font-semibold mb-1">Status</label>
                  <select
                    value={newStatus}
                    onChange={(e) => setNewStatus(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-[#E7ECF2] text-[#14243A]"
                  >
                    <option value="PENDING">PENDING</option>
                    <option value="IN_PROGRESS">IN_PROGRESS</option>
                    <option value="SUBMITTED">SUBMITTED</option>
                    <option value="UNDER_REVIEW">UNDER_REVIEW</option>
                    <option value="APPROVED">APPROVED</option>
                    <option value="REJECTED">REJECTED</option>
                    <option value="NEEDS_CLARIFICATION">NEEDS_CLARIFICATION</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[#64748B] font-semibold mb-1">Reviewer Notes</label>
                  <textarea
                    rows={3}
                    value={newReviewerNotes}
                    onChange={(e) => setNewReviewerNotes(e.target.value)}
                    placeholder="Enter statutory verification findings or required changes..."
                    className="w-full px-3 py-2 rounded-xl border border-[#E7ECF2] text-[#14243A]"
                  />
                </div>
              </div>

              <div className="pt-4 flex justify-end gap-2 border-t border-[#E7ECF2]">
                <button
                  type="button"
                  onClick={() => setEditingItem(null)}
                  className="btn-secondary py-2 px-4 text-xs"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleUpdateDiligenceItem}
                  disabled={updatingItem}
                  className="btn-primary py-2 px-5 text-xs font-semibold"
                >
                  {updatingItem ? 'Saving...' : 'Update Status'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
