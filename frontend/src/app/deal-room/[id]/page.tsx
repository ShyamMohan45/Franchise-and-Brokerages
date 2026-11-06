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
    const token = localStorage.getItem('fb_auth_token');
    try {
      const response = await fetch(`http://localhost:5000/api/deal-rooms/${roomId}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      const data = await response.json();
      if (data.success) {
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

    const token = localStorage.getItem('fb_auth_token');
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
      if (data.success) {
        setRoom(data.data);
        setChatInput('');
      }
    } catch (err) {
      console.error('Failed to post message', err);
    }
  };

  const handleSignDocument = async () => {
    setSigning(true);
    const token = localStorage.getItem('fb_auth_token');
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
        setRoom(data.data);
        setSignSuccess(true);
      }
    } catch (err) {
      console.error('Failed to sign document', err);
    } finally {
      setSigning(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center">
        <div className="text-center space-y-3">
          <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-sm text-slate-400">Loading secure digital deal room...</p>
        </div>
      </div>
    );
  }

  if (!room) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center">
        <div className="text-center space-y-4">
          <h2 className="text-2xl font-bold">Deal Room Not Found</h2>
          <Link href="/deal-room" className="text-emerald-400 text-sm hover:underline">
            ← Back to Deal Rooms
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 py-8 px-4 sm:px-6 lg:px-8 selection:bg-emerald-500 selection:text-white">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Navigation & Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
          <div className="space-y-1">
            <Link
              href="/deal-room"
              className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-white mb-2 transition"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Back to Deal Rooms
            </Link>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white">{room.roomName}</h1>
              <span className="px-3 py-1 text-xs font-bold rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 uppercase tracking-wider">
                {room.stage.replace('_', ' ')}
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Territory: <span className="text-white font-medium">{room.targetTerritory}</span> • Brand: <span className="text-white font-medium">{room.franchiseListing?.brandName}</span>
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-xs flex items-center gap-2">
              <Lock className="w-3.5 h-3.5 text-emerald-400" />
              <span className="text-slate-300">256-Bit Encrypted Data Room</span>
            </div>
          </div>
        </div>

        {/* Milestone Tracker Bar */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-xl">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-4">
            Deal Closing Milestones
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-5 gap-3">
            {room.dealMilestones.map((m, idx) => (
              <div
                key={idx}
                className={`p-3 rounded-2xl border transition ${
                  m.completed
                    ? 'bg-emerald-950/40 border-emerald-500/50 text-emerald-300'
                    : 'bg-slate-950/60 border-slate-800 text-slate-400'
                }`}
              >
                <div className="flex items-center gap-2 mb-1">
                  {m.completed ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                  ) : (
                    <Clock className="w-4 h-4 text-slate-500 flex-shrink-0" />
                  )}
                  <span className="text-xs font-bold leading-tight line-clamp-1">{m.title}</span>
                </div>
                <span className="text-[10px] text-slate-400">
                  {m.completed ? 'Completed' : 'Pending'}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Main 2-Column Split: Shared Documents + E-Sign VS Negotiation Chat */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column (7 cols): Document Vault & E-Signature */}
          <div className="lg:col-span-7 space-y-6">
            {/* E-Signature Box */}
            <div className="bg-gradient-to-br from-indigo-950/50 via-slate-900 to-slate-900 border border-indigo-500/40 rounded-3xl p-6 sm:p-7 space-y-5 shadow-2xl">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <PenTool className="w-5 h-5 text-indigo-400" />
                  <h3 className="text-lg font-bold text-white">E-Signature Center</h3>
                </div>
                <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 uppercase tracking-wider">
                  {room.signatureRequest.status.replace('_', ' ')}
                </span>
              </div>

              <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-2">
                <div className="text-xs font-semibold text-slate-400">Document Out for Execution:</div>
                <div className="text-sm font-bold text-white flex items-center justify-between">
                  <span>{room.signatureRequest.documentTitle}</span>
                  <a
                    href="http://localhost:5000/uploads/roastcraft_master_fdd_2026.pdf"
                    target="_blank"
                    rel="noreferrer"
                    className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1 font-normal"
                  >
                    View Draft <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>

              {/* Signatories Status */}
              <div className="space-y-2">
                <div className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Authorized Signatories
                </div>
                <div className="space-y-2">
                  {room.signatureRequest.participants.map((p, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between p-3 rounded-xl bg-slate-800/80 border border-slate-700/80 text-xs"
                    >
                      <div className="flex items-center gap-2.5">
                        <UserCheck
                          className={`w-4 h-4 ${p.status === 'signed' ? 'text-emerald-400' : 'text-slate-500'}`}
                        />
                        <div>
                          <span className="font-bold text-white block">{p.name}</span>
                          <span className="text-slate-400 text-[11px] capitalize">{p.role} • {p.email}</span>
                        </div>
                      </div>
                      <span
                        className={`px-2 py-0.5 rounded-full font-bold text-[10px] uppercase tracking-wider ${
                          p.status === 'signed'
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                            : 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                        }`}
                      >
                        {p.status}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Sign Action Button */}
              <div className="pt-2">
                {room.signatureRequest.status === 'completed' ? (
                  <div className="p-3 rounded-xl bg-emerald-950/50 border border-emerald-500/40 text-xs text-emerald-300 flex items-center gap-2 font-semibold">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    Agreement fully executed by all parties! Stored in immutable audit vault.
                  </div>
                ) : (
                  <button
                    onClick={handleSignDocument}
                    disabled={signing}
                    className="w-full py-3 px-4 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white rounded-xl text-xs font-bold transition shadow-lg shadow-emerald-700/30 flex items-center justify-center gap-2"
                  >
                    <PenTool className="w-4 h-4" />
                    {signing ? 'Recording Digital Signature...' : 'Digitally Execute Agreement (1-Click Sign)'}
                  </button>
                )}
              </div>
            </div>

            {/* Shared Documents Vault */}
            <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-7 space-y-4 shadow-xl">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <FileText className="w-5 h-5 text-emerald-400" />
                  <h3 className="text-lg font-bold text-white">Confidential Deal Vault</h3>
                </div>
                <span className="text-xs text-slate-400">
                  {room.sharedDocuments.length} Documents Shared
                </span>
              </div>

              <div className="divide-y divide-slate-800/80">
                {room.sharedDocuments.map((doc) => (
                  <div key={doc.docId} className="py-3.5 flex items-center justify-between gap-4">
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-slate-800 text-slate-300 border border-slate-700">
                          {doc.docType}
                        </span>
                        <h4 className="text-sm font-bold text-white">{doc.title}</h4>
                      </div>
                      <p className="text-[11px] text-slate-400">
                        Uploaded on {new Date(doc.uploadedAt).toLocaleDateString()} • Verified by Brokerage
                      </p>
                    </div>

                    <a
                      href={`http://localhost:5000${doc.fileUrl}`}
                      target="_blank"
                      rel="noreferrer"
                      className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-200 text-xs font-semibold flex items-center gap-1.5 transition border border-slate-700"
                    >
                      <Download className="w-3.5 h-3.5" />
                      Download PDF
                    </a>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column (5 cols): Live Deal Negotiation Chat */}
          <div className="lg:col-span-5 bg-slate-900/90 border border-slate-800 rounded-3xl p-6 space-y-4 shadow-2xl flex flex-col h-[650px]">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-purple-400" />
                <h3 className="text-base font-bold text-white">Deal Negotiation Chat</h3>
              </div>
              <span className="text-[11px] text-emerald-400 flex items-center gap-1 font-semibold">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                Encrypted
              </span>
            </div>

            {/* Chat Messages */}
            <div className="flex-1 overflow-y-auto space-y-3.5 pr-2 scrollbar-thin scrollbar-thumb-slate-800">
              {room.messages.map((m, idx) => (
                <div key={idx} className="space-y-1">
                  <div className="flex items-center justify-between text-[11px]">
                    <span
                      className={`font-bold capitalize ${
                        m.senderRole === 'franchisor'
                          ? 'text-amber-400'
                          : m.senderRole === 'investor'
                          ? 'text-teal-400'
                          : 'text-purple-400'
                      }`}
                    >
                      {m.senderRole}
                    </span>
                    <span className="text-slate-400">
                      {new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <div className="p-3 rounded-2xl bg-slate-950/80 border border-slate-800/80 text-xs text-slate-200 leading-relaxed">
                    {m.text}
                  </div>
                </div>
              ))}
            </div>

            {/* Chat Input */}
            <form onSubmit={handleSendMessage} className="pt-2 border-t border-slate-800 flex items-center gap-2">
              <input
                type="text"
                placeholder="Post question or negotiation point..."
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                className="flex-1 bg-slate-800/90 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
              <button
                type="submit"
                disabled={!chatInput.trim()}
                className="p-2.5 bg-purple-600 hover:bg-purple-500 text-white rounded-xl transition disabled:opacity-40"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
