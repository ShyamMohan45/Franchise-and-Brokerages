"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
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
  Lock,
  Search,
  ExternalLink,
} from "lucide-react";

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
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const token = typeof window !== "undefined" ? localStorage.getItem("fb_auth_token") : null;
    fetch("http://localhost:5000/api/deal-rooms", {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    })
      .then((r) => r.json())
      .then((data) => {
        if (data.success && data.data) {
          setRooms(data.data);
        }
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  const getStageBadge = (stage: string) => {
    switch (stage) {
      case "deal_finalized":
        return (
          <span className="px-2.5 py-0.5 text-xs font-semibold rounded-full bg-[#E6F7F5] text-[#159D8B] border border-[#C2EDE7]">
            Deal Finalized
          </span>
        );
      case "out_for_signature":
        return (
          <span className="px-2.5 py-0.5 text-xs font-semibold rounded-full bg-amber-50 text-amber-700 border border-amber-200">
            Out for Signature
          </span>
        );
      case "agreement_drafting":
        return (
          <span className="px-2.5 py-0.5 text-xs font-semibold rounded-full bg-[#EFF4FF] text-[#315EFB] border border-[#BFD3FE]">
            Agreement Drafting
          </span>
        );
      default:
        return (
          <span className="px-2.5 py-0.5 text-xs font-semibold rounded-full bg-purple-50 text-purple-700 border border-purple-200">
            Discovery & NDA
          </span>
        );
    }
  };

  const filteredRooms = rooms.filter(
    (r) =>
      r.roomName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.targetTerritory?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.franchiseListing?.brandName?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="bg-[#F8FAFC] min-h-screen py-12">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        {/* Header Section */}
        <div className="text-center space-y-4 max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#EFF4FF] border border-[#BFD3FE] text-[#315EFB] text-xs font-semibold">
            <Lock className="w-3.5 h-3.5" />
            Confidential Diligence & E-Signature Hub
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-[#14243A] tracking-tight">
            Digital Deal Rooms
          </h1>
          <p className="text-sm sm:text-base text-[#64748B] leading-relaxed">
            Secure multi-party workspace where franchisors, accredited investors, and platform brokers execute NDAs, review FDD disclosures, negotiate territory rights, and complete legally binding e-signatures.
          </p>
        </div>

        {/* Search & Filter Bar */}
        <div className="surface-card p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="relative w-full sm:w-96">
            <Search className="w-4 h-4 text-[#64748B] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Filter by deal room name, brand, or territory..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-xs rounded-xl border border-[#E7ECF2] focus:outline-none focus:border-[#315EFB] text-[#14243A] placeholder-[#64748B]"
            />
          </div>
          <div className="text-xs text-[#64748B] font-medium">
            Active Rooms: <strong className="text-[#14243A]">{filteredRooms.length}</strong>
          </div>
        </div>

        {/* List of Deal Rooms */}
        {loading ? (
          <div className="surface-card p-12 text-center text-[#64748B] space-y-3">
            <div className="w-8 h-8 border-4 border-[#315EFB] border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-xs font-medium">Loading secure deal rooms...</p>
          </div>
        ) : filteredRooms.length === 0 ? (
          <div className="surface-card p-12 text-center space-y-4">
            <Briefcase className="w-12 h-12 text-[#64748B] mx-auto" />
            <h3 className="text-base font-bold text-[#14243A]">No Active Deal Rooms Found</h3>
            <p className="text-xs text-[#64748B] max-w-md mx-auto">
              Deal rooms are automatically created when an investor submits a formal application for a franchise opportunity.
            </p>
            <div className="pt-2">
              <Link href="/franchises" className="btn-primary py-2.5 px-6 text-xs font-semibold">
                Browse Franchises & Apply
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredRooms.map((r) => (
              <div
                key={r._id}
                className="surface-card p-6 flex flex-col justify-between space-y-5 group"
              >
                <div className="space-y-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="text-xs text-[#64748B] font-medium">
                        {r.franchiseListing?.brandName || "Franchise Deal"}
                      </div>
                      <h3 className="text-base font-bold text-[#14243A] group-hover:text-[#315EFB] transition-colors mt-0.5">
                        {r.roomName}
                      </h3>
                    </div>
                    {getStageBadge(r.stage)}
                  </div>

                  {/* Territory & NDA Security Status */}
                  <div className="grid grid-cols-2 gap-3 text-xs pt-1">
                    <div className="bg-[#F8FAFC] p-3 rounded-xl border border-[#E7ECF2]">
                      <span className="text-[10px] text-[#64748B] uppercase font-semibold block">
                        Target Territory
                      </span>
                      <span className="font-bold text-[#14243A] mt-0.5 block truncate">
                        {r.targetTerritory}
                      </span>
                    </div>
                    <div className="bg-[#F8FAFC] p-3 rounded-xl border border-[#E7ECF2]">
                      <span className="text-[10px] text-[#64748B] uppercase font-semibold block">
                        NDA Protection
                      </span>
                      <span
                        className={`font-bold mt-0.5 block text-xs ${
                          r.ndaSigned ? "text-[#159D8B]" : "text-amber-600"
                        }`}
                      >
                        {r.ndaSigned ? "✓ NDA Executed" : "Pending Signature"}
                      </span>
                    </div>
                  </div>

                  {/* Participants Bar */}
                  <div className="space-y-1.5 text-xs text-[#64748B] pt-2 border-t border-[#E7ECF2]">
                    <div className="flex items-center justify-between">
                      <span>Franchisor:</span>
                      <strong className="text-[#14243A]">{r.franchisor?.name || "Brand Lead"}</strong>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Investor:</span>
                      <strong className="text-[#14243A]">{r.investor?.name || "Accredited Investor"}</strong>
                    </div>
                  </div>
                </div>

                <div className="pt-2">
                  <Link
                    href={`/deal-room/${r._id}`}
                    className="btn-primary w-full py-2.5 text-xs font-semibold justify-center"
                  >
                    Enter Deal Room
                    <ArrowRight className="w-3.5 h-3.5 ml-1" />
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
