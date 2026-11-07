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
  ExternalLink,
} from 'lucide-react';

interface SharedDoc {
  docId: string;
  title: string;
  docType: string;
  fileUrl: string;
  uploadedAt: string;
}

interface Message {
  sender: string;
  senderRole: 'franchisor' | 'investor' | 'broker' | 'admin';
  text: string;
  createdAt: string;
}

interface Signatory {
  role: 'franchisor' | 'investor' | 'broker';
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
  sharedDocuments: SharedDoc[];
  messages: Message[];
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
    investmentRange: { min: number; max: number };
    franchiseFee: number;
    royaltyFee: number;
    slug: string;
  };
  franchisor?: { name: string; email: string };
  investor?: { name: string; email: string };
  broker?: { name: string; email: string };
}

export default function DealRoomDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const roomId = resolvedParams.id;

  const [room, setRoom] = useState<DealRoomDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [chatInput, setChatInput] = useState('');
  const [signing, setSigning] = useState(false);
  const [signSuccess, setSignSuccess] = useState(false);

  const fetchRoom = async () => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('fb_auth_token') : null;
    try {
      const response = await fetch(`http://localhost:5000/api/deal-rooms/${roomId}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      const data = await response.json();
      if (data.success && data.data) {
        setRoom(data.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRoom();
  }, [roomId]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;

    const token = typeof window !== 'undefined' ? localStorage.getItem('fb_auth_token') : null;
    try {
      const response = await fetch(`http://localhost:5000/api/deal-rooms/${roomId}/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ text: chatInput }),
      });
      const data = await response.json();
      if (data.success && data.data) {
        setRoom(data.data);
        setChatInput('');
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleSignDocument = async () => {
    setSigning(true);
    const token = typeof window !== 'undefined' ? localStorage.getItem('fb_auth_token') : null;
    try {
      const response = await fetch(`http://localhost:5000/api/deal-rooms/${roomId}/sign`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });
      const data = await response.json();
      if (data.success) {
        setSignSuccess(true);
        fetchRoom();
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
        <p className="text-xs text-[#64748B] font-medium">Decrypting Deal Room Environment...</p>
      </div>
    );
  }

  if (!room) {
    return (
      <div className="bg-[#F8FAFC] min-h-screen py-24 text-center space-y-4">
        <AlertCircle className="w-12 h-12 text-rose-500 mx-auto" />
        <h2 className="text-xl font-bold text-[#14243A]">Deal Room Not Found</h2>
        <Link href="/deal-room" className="btn-primary py-2 px-6 text-xs inline-flex">
          Return to Deal Rooms
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-[#F8FAFC] min-h-screen py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        {/* Navigation Breadcrumb */}
        <div className="flex items-center gap-2 text-xs text-[#64748B]">
          <Link href="/deal-room" className="hover:text-[#315EFB] flex items-center gap-1 transition-colors">
            <ArrowLeft className="w-3.5 h-3.5" />
            All Deal Rooms
          </Link>
          <span>/</span>
          <span className="text-[#14243A] font-semibold">{room.roomName}</span>
        </div>

        {/* Room Header Card */}
        <div className="surface-card p-6 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full bg-[#EFF4FF] border border-[#BFD3FE] text-[#315EFB] text-[11px] font-semibold flex items-center gap-1">
                <Lock className="w-3 h-3" />
                256-Bit Encrypted Data Room
              </span>
              <span className="px-2.5 py-0.5 rounded-full bg-[#E6F7F5] border border-[#C2EDE7] text-[#159D8B] text-[11px] font-semibold">
                Territory: {room.targetTerritory}
              </span>
            </div>
            <h1 className="text-2xl font-bold text-[#14243A]">{room.roomName}</h1>
            <p className="text-xs text-[#64748B]">
              Brand:{' '}
              <strong className="text-[#14243A]">{room.franchiseListing?.brandName || 'Brand'}</strong> |
              Franchisor: {room.franchisor?.name || 'Franchisor'} | Investor:{' '}
              {room.investor?.name || 'Investor'}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="bg-[#F8FAFC] p-3 rounded-xl border border-[#E7ECF2] text-xs">
              <span className="text-[#64748B] block text-[10px] uppercase font-semibold">Deal Stage</span>
              <span className="font-bold text-[#315EFB] capitalize mt-0.5 block">
                {room.stage.replace('_', ' ')}
              </span>
            </div>
          </div>
        </div>

        {/* Main Grid: 2 Columns */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: Documents & E-Signatures (7 cols) */}
          <div className="lg:col-span-7 space-y-6">
            {/* E-Signature & Agreement Execution */}
            <div className="surface-card p-6 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-[#E7ECF2]">
                <h3 className="text-sm font-bold text-[#14243A] flex items-center gap-2">
                  <PenTool className="w-4 h-4 text-[#315EFB]" />
                  Franchise Legal Agreement & E-Sign
                </h3>
                <span className="text-[11px] font-semibold text-[#159D8B] bg-[#E6F7F5] px-2 py-0.5 rounded">
                  Legal Binding Status
                </span>
              </div>

              <div className="bg-[#F8FAFC] p-4 rounded-xl border border-[#E7ECF2] space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <div>
                    <span className="font-bold text-[#14243A] block">
                      {room.signatureRequest?.documentTitle || 'Master Franchise Agreement 2026.pdf'}
                    </span>
                    <span className="text-[11px] text-[#64748B]">
                      Includes exclusive 3.5 km territory schedule & fee covenants
                    </span>
                  </div>
                  <span className="text-xs font-bold text-[#315EFB] capitalize">
                    {room.signatureRequest?.status.replace('_', ' ') || 'Out for Signature'}
                  </span>
                </div>

                {/* Signatories Status */}
                <div className="space-y-2 pt-2 border-t border-[#E7ECF2]">
                  {room.signatureRequest?.participants?.map((sig, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between text-xs p-2 rounded-lg bg-white border border-[#E7ECF2]"
                    >
                      <div className="flex items-center gap-2">
                        <UserCheck className="w-4 h-4 text-[#64748B]" />
                        <div>
                          <strong className="text-[#14243A]">{sig.name}</strong>
                          <span className="text-[10px] text-[#64748B] ml-1 capitalize">({sig.role})</span>
                        </div>
                      </div>
                      <span
                        className={`font-semibold text-[11px] ${
                          sig.status === 'signed' ? 'text-[#159D8B]' : 'text-amber-600'
                        }`}
                      >
                        {sig.status === 'signed' ? '✓ Signed' : 'Pending Signature'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Action Button to E-Sign */}
              <div className="pt-2 flex items-center justify-between">
                <span className="text-xs text-[#64748B]">
                  {signSuccess ? 'Signature recorded on audit ledger' : 'Click to execute digital signature'}
                </span>
                <button
                  onClick={handleSignDocument}
                  disabled={signing || signSuccess}
                  className="btn-primary py-2.5 px-6 text-xs font-semibold"
                >
                  <PenTool className="w-3.5 h-3.5 mr-1" />
                  {signing ? 'Processing E-Sign...' : signSuccess ? '✓ Successfully Signed' : 'E-Sign Agreement'}
                </button>
              </div>
            </div>

            {/* Shared Document Vault */}
            <div className="surface-card p-6 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-[#E7ECF2]">
                <h3 className="text-sm font-bold text-[#14243A] flex items-center gap-2">
                  <FileText className="w-4 h-4 text-[#315EFB]" />
                  Confidential Document Vault ({room.sharedDocuments?.length || 0})
                </h3>
                <span className="text-xs text-[#64748B]">Watermarked with viewer ID</span>
              </div>

              {room.sharedDocuments && room.sharedDocuments.length > 0 ? (
                <div className="space-y-2.5">
                  {room.sharedDocuments.map((doc, idx) => (
                    <div
                      key={idx}
                      className="p-3.5 rounded-xl bg-[#F8FAFC] border border-[#E7ECF2] flex items-center justify-between text-xs hover:border-[#315EFB] transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-[#EFF4FF] text-[#315EFB]">
                          <FileText className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="font-bold text-[#14243A]">{doc.title}</div>
                          <div className="text-[11px] text-[#64748B] capitalize">{doc.docType.replace('_', ' ')}</div>
                        </div>
                      </div>
                      <a
                        href={doc.fileUrl || '#'}
                        target="_blank"
                        rel="noreferrer"
                        className="btn-secondary py-1.5 px-3 text-[11px] font-semibold"
                      >
                        <Download className="w-3 h-3 mr-1" /> Download
                      </a>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-6 text-center text-xs text-[#64748B] bg-[#F8FAFC] rounded-xl border border-[#E7ECF2]">
                  Standard FDD Item 1-23 disclosures are being loaded into this room.
                </div>
              )}
            </div>

            {/* Deal Milestones */}
            <div className="surface-card p-6 space-y-4">
              <h3 className="text-sm font-bold text-[#14243A]">Closing Milestones</h3>
              <div className="space-y-2">
                {room.dealMilestones?.map((m, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between p-2.5 rounded-lg bg-[#F8FAFC] border border-[#E7ECF2] text-xs"
                  >
                    <div className="flex items-center gap-2">
                      <CheckCircle2
                        className={`w-4 h-4 ${m.completed ? 'text-[#159D8B]' : 'text-[#64748B]'}`}
                      />
                      <span className={`font-medium ${m.completed ? 'text-[#14243A]' : 'text-[#64748B]'}`}>
                        {m.title}
                      </span>
                    </div>
                    <span
                      className={`text-[11px] font-semibold ${
                        m.completed ? 'text-[#159D8B]' : 'text-[#64748B]'
                      }`}
                    >
                      {m.completed ? 'Completed' : 'Pending'}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column: Multi-Party Secure Chat (5 cols) */}
          <div className="lg:col-span-5">
            <div className="surface-card p-6 flex flex-col h-[600px] justify-between">
              <div>
                <div className="flex items-center justify-between pb-3 border-b border-[#E7ECF2]">
                  <h3 className="text-sm font-bold text-[#14243A] flex items-center gap-2">
                    <MessageSquare className="w-4 h-4 text-[#315EFB]" />
                    Encrypted Multi-Party Channel
                  </h3>
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                </div>
                <div className="text-[11px] text-[#64748B] py-2">
                  All messages are permanently logged for contractual audit defense.
                </div>
              </div>

              {/* Chat Message Scroll */}
              <div className="flex-1 overflow-y-auto space-y-3 py-3 pr-1">
                {room.messages && room.messages.length > 0 ? (
                  room.messages.map((msg, idx) => (
                    <div
                      key={idx}
                      className={`p-3 rounded-xl text-xs space-y-1 ${
                        msg.senderRole === 'broker'
                          ? 'bg-[#EFF4FF] border border-[#BFD3FE]'
                          : 'bg-[#F8FAFC] border border-[#E7ECF2]'
                      }`}
                    >
                      <div className="flex items-center justify-between text-[10px]">
                        <strong className="text-[#14243A]">{msg.sender}</strong>
                        <span className="text-[#64748B] uppercase font-semibold text-[9px]">
                          {msg.senderRole}
                        </span>
                      </div>
                      <p className="text-[#14243A] leading-relaxed">{msg.text}</p>
                    </div>
                  ))
                ) : (
                  <div className="p-8 text-center text-xs text-[#64748B]">
                    No messages yet. Initiate discussion regarding franchise terms or territory requirements.
                  </div>
                )}
              </div>

              {/* Message Input Box */}
              <form onSubmit={handleSendMessage} className="pt-3 border-t border-[#E7ECF2] flex gap-2">
                <input
                  type="text"
                  placeholder="Type a secure message..."
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  className="flex-1 px-3 py-2 text-xs rounded-xl border border-[#E7ECF2] focus:outline-none focus:border-[#315EFB] text-[#14243A]"
                />
                <button type="submit" className="btn-primary py-2 px-4 text-xs font-semibold">
                  <Send className="w-3.5 h-3.5" />
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
