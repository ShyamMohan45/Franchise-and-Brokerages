"use client";

import React from "react";
import Link from "next/link";
import {
  Building2,
  ShieldCheck,
  Award,
  Users,
  Target,
  ArrowRight,
  Sparkles,
  Globe,
  Lock,
} from "lucide-react";

export default function AboutPage() {
  return (
    <div className="bg-[#F8FAFC] min-h-screen py-16">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
        {/* Mission Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#EFF4FF] border border-[#BFD3FE] text-[#315EFB] text-xs font-semibold">
            <Building2 className="w-3.5 h-3.5" />
            Our Mission & Governance
          </div>
          <h1 className="text-4xl sm:text-5xl font-extrabold text-[#14243A] tracking-tight">
            Bridging Local Excellence With Institutional Scale
          </h1>
          <p className="text-base sm:text-lg text-[#64748B] leading-relaxed">
            FranchiseBridge was created to solve the biggest challenge in modern business expansion: brilliant regional brands often fail to expand because packaging standard operating procedures and recruiting multi-unit investors has traditionally been fragmented, opaque, and manual.
          </p>
        </div>

        {/* 3 Core Values Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="surface-card p-8 space-y-3 text-center">
            <div className="w-12 h-12 rounded-xl bg-[#EFF4FF] flex items-center justify-center text-[#315EFB] mx-auto">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-[#14243A]">Governance & Trust</h3>
            <p className="text-xs text-[#64748B] leading-relaxed">
              Strict investor capital verification, encrypted deal rooms, and zero tolerance for unsubstantiated financial claims.
            </p>
          </div>

          <div className="surface-card p-8 space-y-3 text-center">
            <div className="w-12 h-12 rounded-xl bg-[#E6F7F5] flex items-center justify-center text-[#159D8B] mx-auto">
              <Award className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-[#14243A]">Operational Precision</h3>
            <p className="text-xs text-[#64748B] leading-relaxed">
              Codifying founder instincts into structured digital SOPs that ensure brand consistency across 100+ locations.
            </p>
          </div>

          <div className="surface-card p-8 space-y-3 text-center">
            <div className="w-12 h-12 rounded-xl bg-purple-50 flex items-center justify-center text-purple-600 mx-auto">
              <Users className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-[#14243A]">Aligned Economic Moats</h3>
            <p className="text-xs text-[#64748B] leading-relaxed">
              Structuring sustainable royalty frameworks and protected geographic catchments that reward both franchisor and franchisee.
            </p>
          </div>
        </div>

        {/* Advisory & Standards Section */}
        <div className="surface-card p-8 sm:p-10 bg-white border border-[#E7ECF2] space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E7ECF2] pb-6">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-[#315EFB]">
                Institutional Architecture
              </span>
              <h2 className="text-2xl font-bold text-[#14243A] mt-1">
                The FranchiseBridge Standard
              </h2>
            </div>
            <span className="text-xs font-semibold px-3 py-1 rounded-full bg-[#EFF4FF] text-[#315EFB] border border-[#BFD3FE] w-fit">
              2026 Expansion Standard
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-xs text-[#64748B] leading-relaxed">
            <div className="space-y-2">
              <h4 className="font-bold text-[#14243A] text-sm">For Franchise Brands:</h4>
              <p>
                We do not simply publish listings. We take founders through our 8-Pillar Diagnostic, audit unit-level store P&Ls, structure the legal Franchise Disclosure Document (FDD), and protect trade secrets behind watermarked data rooms.
              </p>
            </div>
            <div className="space-y-2">
              <h4 className="font-bold text-[#14243A] text-sm">For Franchise Investors:</h4>
              <p>
                Every franchise featured on our platform must meet minimum verifiable EBITDA criteria and operational codification. Investors gain complete transparency into equipment costs, staff requirements, and territory exclusivity.
              </p>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="text-center pt-4">
          <Link href="/franchises" className="btn-primary py-3 px-8 text-sm font-semibold">
            Explore Opportunities Portfolio
            <ArrowRight className="w-4 h-4 ml-1" />
          </Link>
        </div>
      </div>
    </div>
  );
}
