'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Briefcase,
  Users,
  FileText,
  Clock,
  ArrowRight,
  ShieldCheck,
  Building,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';

interface DealRoomItem {
  _id: string;
  roomName: string;
  targetTerritory: string;
  stage: string;
  ndaSigned: boolean;
  franchiseListing?: {
    brandName: string;
    industry: string;
    slug: string;
    heroImageUrl: string;
  };
  franchisor?: { name: string; email: string };
  investor?: { name: string; email: string };
  broker?: { name: string; email: string };
  signatureRequest?: {
    status: string;
    documentTitle: string;
  };
  updatedAt: string;
}

export default function DealRoomsListPage() {
  const [rooms, setRooms] = useState<DealRoomItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('fb_auth_token');
    fetch('http://localhost:5000/api/deal-rooms', {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    })
      .then((r) => r.json())
      .then((data) => {
        if (data.success) {
          setRooms(data.data);
        }
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  const getStageBadge = (stage: string) => {
    switch (stage) {
      case 'deal_finalized':
        return <span className="px-2.5 py-1 text-xs font-bold rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">Deal Finalized</span>;
      case 'out_for_signature':
        return <span className="px-2.5 py-1 text-xs font-bold rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/30">Out for Signature</span>;
      case 'agreement_drafting':
        return <span className="px-2.5 py-1 text-xs font-bold rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/30">Agreement Drafting</span>;
      default:
        return <span className="px-2.5 py-1 text-xs font-bold rounded-full bg-purple-500/10 text-purple-400 border border-purple-500/30">Discovery & NDA</span>;
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 py-12 px-4 sm:px-6 lg:px-8 selection:bg-emerald-500 selection:text-white">
      <div className="max-w-6xl mx-auto space-y-10">
        {/* Header */}
        <div className="text-center space-y-4 max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-purple-500/10 border border-purple-500/30 text-purple-400 text-xs font-semibold uppercase tracking-wider">
            <Briefcase className="w-4 h-4" />
            Confidential Negotiation Hub
          </div>
          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">
            Digital Deal Rooms
          </h1>
          <p className="text-slate-400 text-base sm:text-lg">
            Secure multi-party workspace where franchisors, accredited investors, and platform brokers execute NDAs, review FDD disclosures, negotiate territory rights, and complete e-signatures.
          </p>
        </div>

        {/* List of Deal Rooms */}
        {loading ? (
          <div className="p-12 text-center text-slate-400 bg-slate-900 rounded-3xl border border-slate-800 animate-pulse">
            Loading deal rooms...
          </div>
        ) : rooms.length === 0 ? (
          <div className="p-12 text-center text-slate-400 bg-slate-900 rounded-3xl border border-slate-800 space-y-3">
            <p>No active deal rooms initiated yet.</p>
            <Link
              href="/franchises"
              className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl transition"
            >
              Browse Franchises & Request Introductions <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {rooms.map((room) => (
              <div
                key={room._id}
                className="bg-slate-900/90 border border-slate-800 hover:border-slate-700 rounded-3xl p-6 sm:p-7 space-y-5 transition shadow-xl relative overflow-hidden group flex flex-col justify-between"
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                      {room.targetTerritory}
                    </span>
                    {getStageBadge(room.stage)}
                  </div>

                  <div>
                    <h3 className="text-xl font-bold text-white group-hover:text-emerald-400 transition">
                      {room.roomName}
                    </h3>
                    <p className="text-xs text-slate-400 mt-1">
                      Brand: <span className="text-white font-medium">{room.franchiseListing?.brandName || 'Specialty Franchise'}</span> ({room.franchiseListing?.industry || 'F&B'})
                    </p>
                  </div>

                  {/* Participants snapshot */}
                  <div className="grid grid-cols-3 gap-2 pt-3 border-t border-slate-800/80 text-[11px]">
                    <div className="bg-slate-950/60 p-2.5 rounded-xl border border-slate-800">
                      <span className="text-slate-400 block text-[10px] uppercase font-bold">Franchisor</span>
                      <span className="text-white font-medium truncate block">
                        {room.franchisor?.name || 'Brand Founder'}
                      </span>
                    </div>
                    <div className="bg-slate-950/60 p-2.5 rounded-xl border border-slate-800">
                      <span className="text-slate-400 block text-[10px] uppercase font-bold">Investor</span>
                      <span className="text-white font-medium truncate block">
                        {room.investor?.name || 'Accredited Partner'}
                      </span>
                    </div>
                    <div className="bg-slate-950/60 p-2.5 rounded-xl border border-slate-800">
                      <span className="text-slate-400 block text-[10px] uppercase font-bold">Broker</span>
                      <span className="text-emerald-400 font-medium truncate block">
                        {room.broker?.name || 'Platform Broker'}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-800/80 flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-xs text-slate-400">
                    <ShieldCheck className="w-4 h-4 text-emerald-400" />
                    <span>NDA Executed</span>
                  </div>
                  <Link
                    href={`/deal-room/${room._id}`}
                    className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-xl bg-purple-600 hover:bg-purple-500 text-white transition shadow-lg shadow-purple-700/20"
                  >
                    Enter Workspace <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
