"use client";

import React from "react";
import Link from "next/link";
import {
  Briefcase,
  TrendingUp,
  ShieldCheck,
  CheckCircle2,
  ArrowRight,
  Scale,
  Sparkles,
  Users,
  Search,
  SlidersHorizontal,
  Bookmark,
  FileText,
  BadgeCheck,
  Clock,
  Layers,
} from "lucide-react";

export default function ForInvestorsPage() {
  return (
    <div className="bg-[#F8FAFC] min-h-screen">
      {/* Hero Header */}
      <section className="bg-white border-b border-[#E7ECF2] pt-16 pb-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left Column */}
            <div className="lg:col-span-7 space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#E6F7F5] border border-[#C2EDE7] text-[#159D8B] text-xs font-semibold">
                <ShieldCheck className="w-3.5 h-3.5" />
                For Accredited Franchise Investors & Multi-Unit Operators
              </div>
              <h1 className="text-4xl sm:text-5xl font-extrabold text-[#14243A] tracking-tight leading-[1.15]">
                Invest in High-Yield,{" "}
                <span className="text-[#315EFB]">Audited Franchise Brands.</span>
              </h1>
              <p className="text-base sm:text-lg text-[#64748B] leading-relaxed max-w-xl">
                Skip risky early-stage business bets. Acquire exclusive multi-unit territory rights to proven regional brands with audited unit economics, codified recipes, and complete statutory FDD disclosures.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 pt-2">
                <Link
                  href="/register?role=investor"
                  className="btn-primary py-3 px-6 text-sm font-semibold shadow-md"
                >
                  Register as an Investor
                  <ArrowRight className="w-4 h-4 ml-1" />
                </Link>
                <Link
                  href="/franchises"
                  className="btn-secondary py-3 px-6 text-sm font-semibold"
                >
                  Browse Verified Directory
                </Link>
              </div>

              {/* Credibility metrics */}
              <div className="grid grid-cols-3 gap-4 pt-4 border-t border-[#E7ECF2] text-xs">
                <div>
                  <span className="font-bold text-[#14243A] block text-sm">Audited P&Ls</span>
                  <span className="text-[#64748B]">Zero fabricated ROI claims</span>
                </div>
                <div>
                  <span className="font-bold text-[#14243A] block text-sm">3.5 km Radius</span>
                  <span className="text-[#64748B]">Contractual territory exclusivity</span>
                </div>
                <div>
                  <span className="font-bold text-[#14243A] block text-sm">256-Bit Deal Rooms</span>
                  <span className="text-[#64748B]">NDA-protected disclosures</span>
                </div>
              </div>
            </div>

            {/* Right Column: Split Investor Console Preview */}
            <div className="lg:col-span-5">
              <div className="surface-card p-6 bg-white border border-[#E7ECF2] shadow-elevated space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-[#E7ECF2]">
                  <span className="text-xs font-bold text-[#14243A]">Investor Portfolio Vetting</span>
                  <span className="text-[11px] font-semibold text-[#315EFB] bg-[#EFF4FF] px-2 py-0.5 rounded">
                    Match Confidence 98%
                  </span>
                </div>

                <div className="p-4 rounded-xl bg-[#F8FAFC] border border-[#E7ECF2] space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-sm text-[#14243A]">RoastCraft Specialty Coffee</span>
                    <span className="text-xs font-bold text-[#315EFB]">₹35L - 55L</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-[11px] text-[#64748B]">
                    <div>
                      <span>Historical EBITDA:</span> <strong className="text-[#14243A]">22.4%</strong>
                    </div>
                    <div>
                      <span>Est. Payback:</span> <strong className="text-[#14243A]">18 Months</strong>
                    </div>
                  </div>
                </div>

                <div className="space-y-2 text-xs">
                  <div className="flex items-center justify-between p-2.5 rounded-lg bg-[#EFF4FF] text-[#315EFB] font-semibold">
                    <span>13-Pillar Due Diligence Checklist</span>
                    <span>100% Cleared</span>
                  </div>
                  <div className="flex items-center justify-between p-2.5 rounded-lg bg-[#F8FAFC] border border-[#E7ECF2] text-[#64748B]">
                    <span>Franchise Disclosure Document (Item 19)</span>
                    <span className="font-semibold text-[#159D8B]">Audited</span>
                  </div>
                  <div className="flex items-center justify-between p-2.5 rounded-lg bg-[#F8FAFC] border border-[#E7ECF2] text-[#64748B]">
                    <span>Exclusive Territory Allocation</span>
                    <span className="font-semibold text-[#14243A]">Locked</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 5 Investor Capabilities */}
      <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <span className="text-xs font-bold uppercase tracking-wider text-[#159D8B]">
            Investor Infrastructure
          </span>
          <h2 className="text-3xl font-bold text-[#14243A] tracking-tight">
            How FranchiseBridge Protects Your Capital
          </h2>
          <p className="text-sm text-[#64748B] leading-relaxed">
            Eliminating guesswork with transparent disclosures, side-by-side brand comparisons, and digital deal rooms.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="surface-card p-6 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-[#EFF4FF] flex items-center justify-center text-[#315EFB]">
              <Search className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-[#14243A]">1. Discover & Filter By Budget</h3>
            <p className="text-xs text-[#64748B] leading-relaxed">
              Filter hundreds of verified concepts by liquid capital requirements, desired territory, store footprint, and target payback period.
            </p>
          </div>

          <div className="surface-card p-6 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-[#E6F7F5] flex items-center justify-center text-[#159D8B]">
              <SlidersHorizontal className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-[#14243A]">2. Compare Side-by-Side</h3>
            <p className="text-xs text-[#64748B] leading-relaxed">
              Evaluate EBITDA margins, royalty percentages, training periods, and equipment costs side-by-side across competing brands.
            </p>
          </div>

          <div className="surface-card p-6 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-purple-50 flex items-center justify-center text-purple-600">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-[#14243A]">3. Complete 13-Pillar Diligence</h3>
            <p className="text-xs text-[#64748B] leading-relaxed">
              Access the legal FDD, verify supply chain stability, review territory boundaries, and sign mutual NDAs within secure virtual rooms.
            </p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-[#14243A] text-white text-center">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
            Ready to Build a Multi-Unit Franchise Portfolio?
          </h2>
          <p className="text-sm sm:text-base text-slate-300 max-w-xl mx-auto">
            Join vetted high-net-worth operators securing premier territory mandates in Tier-1, Tier-2, and Tier-3 growth markets.
          </p>
          <div className="pt-2 flex flex-col sm:flex-row justify-center gap-3">
            <Link href="/register?role=investor" className="btn-primary py-3 px-8 text-sm font-semibold">
              Create Investor Account
            </Link>
            <Link href="/franchises" className="btn-secondary py-3 px-8 text-sm font-semibold bg-transparent text-white border-slate-700 hover:bg-slate-800">
              Explore Franchise Portfolio
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
