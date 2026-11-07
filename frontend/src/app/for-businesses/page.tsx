"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Building2,
  TrendingUp,
  FileCheck2,
  CheckCircle2,
  ArrowRight,
  ShieldCheck,
  Scale,
  Sparkles,
  Users2,
  BarChart3,
  Layers,
  ChevronRight,
  Lock,
  ArrowUpRight,
} from "lucide-react";

export default function ForBusinessesPage() {
  const [activeTab, setActiveTab] = useState<"readiness" | "sops" | "investors" | "crm">("readiness");

  return (
    <div className="bg-[#F8FAFC] min-h-screen">
      {/* Hero Header */}
      <section className="bg-white border-b border-[#E7ECF2] pt-16 pb-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left Column */}
            <div className="lg:col-span-7 space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#EFF4FF] border border-[#BFD3FE] text-[#315EFB] text-xs font-semibold">
                <Building2 className="w-3.5 h-3.5" />
                For Brand Founders & Franchisors
              </div>
              <h1 className="text-4xl sm:text-5xl font-extrabold text-[#14243A] tracking-tight leading-[1.15]">
                Scale Your Brand Nationally With{" "}
                <span className="text-[#315EFB]">Franchisee Capital.</span>
              </h1>
              <p className="text-base sm:text-lg text-[#64748B] leading-relaxed max-w-xl">
                Transform a successful store or multi-outlet concept into an institutional franchise network. We codify your operating SOPs, package your statutory FDD, and recruit vetted multi-unit operators.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 pt-2">
                <Link
                  href="/register?role=business_owner"
                  className="btn-primary py-3 px-6 text-sm font-semibold shadow-md"
                >
                  Apply to Franchise Your Brand
                  <ArrowRight className="w-4 h-4 ml-1" />
                </Link>
                <Link
                  href="/calculator"
                  className="btn-secondary py-3 px-6 text-sm font-semibold"
                >
                  Estimate Expansion Capex
                </Link>
              </div>

              {/* Quick Pillars */}
              <div className="grid grid-cols-3 gap-4 pt-4 border-t border-[#E7ECF2] text-xs">
                <div>
                  <span className="font-bold text-[#14243A] block text-sm">4% - 8%</span>
                  <span className="text-[#64748B]">Top-line monthly royalties</span>
                </div>
                <div>
                  <span className="font-bold text-[#14243A] block text-sm">₹0 Balance Sheet</span>
                  <span className="text-[#64748B]">Zero outlet lease liabilities</span>
                </div>
                <div>
                  <span className="font-bold text-[#14243A] block text-sm">5 - 20 Units/Yr</span>
                  <span className="text-[#64748B]">Predictable expansion speed</span>
                </div>
              </div>
            </div>

            {/* Right Column: Split Interface Preview */}
            <div className="lg:col-span-5">
              <div className="surface-card p-6 bg-white border border-[#E7ECF2] shadow-elevated space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-[#E7ECF2]">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-[#315EFB]" />
                    <span className="text-xs font-bold text-[#14243A]">Franchisor Readiness Engine</span>
                  </div>
                  <span className="text-[11px] font-semibold text-[#159D8B] bg-[#E6F7F5] px-2 py-0.5 rounded">
                    Audit Certified
                  </span>
                </div>

                <div className="space-y-3">
                  <div className="p-3 rounded-xl bg-[#F8FAFC] border border-[#E7ECF2] flex items-center justify-between">
                    <div>
                      <span className="text-xs font-bold text-[#14243A]">Unit Financial Viability</span>
                      <span className="block text-[11px] text-[#64748B]">Store EBITDA &gt; 20% Verified</span>
                    </div>
                    <span className="text-xs font-extrabold text-[#315EFB]">92%</span>
                  </div>

                  <div className="p-3 rounded-xl bg-[#F8FAFC] border border-[#E7ECF2] flex items-center justify-between">
                    <div>
                      <span className="text-xs font-bold text-[#14243A]">Operating Manuals & SOPs</span>
                      <span className="block text-[11px] text-[#64748B]">Digital checklists codified</span>
                    </div>
                    <span className="text-xs font-extrabold text-[#315EFB]">88%</span>
                  </div>

                  <div className="p-3 rounded-xl bg-[#F8FAFC] border border-[#E7ECF2] flex items-center justify-between">
                    <div>
                      <span className="text-xs font-bold text-[#14243A]">FTC FDD Legal Package</span>
                      <span className="block text-[11px] text-[#64748B]">23-Item disclosure drafted</span>
                    </div>
                    <span className="text-xs font-extrabold text-[#315EFB]">85%</span>
                  </div>
                </div>

                <div className="pt-2 text-center">
                  <span className="text-xs text-[#64748B]">Ready for multi-unit investor recruitment</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 5 Core Steps for Franchise Brands */}
      <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <span className="text-xs font-bold uppercase tracking-wider text-[#315EFB]">
            End-To-End Growth Architecture
          </span>
          <h2 className="text-3xl font-bold text-[#14243A] tracking-tight">
            How FranchiseBridge Accelerates Your Brand
          </h2>
          <p className="text-sm text-[#64748B] leading-relaxed">
            From uncodified founder knowledge to institutional legal agreements and vetted franchisee deal closing.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            {
              step: "01",
              title: "Build Franchise Profile",
              desc: "Digitalize store footprints, capex schedules, royalty rates, and approved territory boundaries in one structured profile.",
              icon: Building2,
            },
            {
              step: "02",
              title: "Assess Expansion Readiness",
              desc: "Benchmark your brand across 8 dimensions: unit economics, supply chain resilience, training scalability, and defensibility.",
              icon: Sparkles,
            },
            {
              step: "03",
              title: "Codify Operations & SOPs",
              desc: "Convert recipe books, hygiene routines, POS workflows, and opening/closing checklists into cloud-accessible manuals.",
              icon: FileCheck2,
            },
            {
              step: "04",
              title: "Recruit Multi-Unit Investors",
              desc: "Connect with accredited high-net-worth investors and experienced multi-unit operators pre-filtered by capital and territory.",
              icon: Users2,
            },
          ].map((item, idx) => (
            <div key={idx} className="surface-card p-6 space-y-3 flex flex-col justify-between">
              <div className="space-y-3">
                <div className="w-10 h-10 rounded-xl bg-[#EFF4FF] flex items-center justify-center text-[#315EFB] font-bold text-xs">
                  {item.step}
                </div>
                <h3 className="text-base font-bold text-[#14243A]">{item.title}</h3>
                <p className="text-xs text-[#64748B] leading-relaxed">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Split Feature Preview */}
      <section className="py-20 bg-white border-y border-[#E7ECF2]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            <div className="lg:col-span-6 space-y-6">
              <span className="text-xs font-bold uppercase tracking-wider text-[#315EFB]">
                Investor Inquiries & Pipeline Management
              </span>
              <h2 className="text-3xl font-bold text-[#14243A] tracking-tight">
                Manage All Expansion Enquiries in a Centralized CRM
              </h2>
              <p className="text-sm text-[#64748B] leading-relaxed">
                Never lose an investor lead in WhatsApp or fragmented email threads. Every application arrives with certified liquid capital statements, territory preferences, and operational background.
              </p>

              <div className="space-y-3 text-xs text-[#14243A]">
                <div className="flex items-center gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-[#159D8B]" />
                  <span>Verified net worth and available liquid capital confirmation</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-[#159D8B]" />
                  <span>Territory conflict detection against existing franchisee radius</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-[#159D8B]" />
                  <span>Automated mutual Non-Disclosure Agreement (NDA) e-signatures</span>
                </div>
              </div>

              <div className="pt-2">
                <Link href="/register?role=business_owner" className="btn-primary py-2.5 px-6 text-xs font-semibold">
                  Start Onboarding Your Brand
                </Link>
              </div>
            </div>

            <div className="lg:col-span-6">
              <div className="surface-card p-6 bg-[#F8FAFC] border border-[#E7ECF2] space-y-3">
                <div className="flex items-center justify-between pb-3 border-b border-[#E7ECF2]">
                  <span className="text-xs font-bold text-[#14243A]">Incoming Operator Applications</span>
                  <span className="text-xs font-semibold text-[#315EFB]">3 New Today</span>
                </div>

                {[
                  { name: "Sunil Mehra", territory: "Bengaluru East (Indiranagar)", budget: "₹1.2 Cr", units: "2 Units" },
                  { name: "Pooja Hegde", territory: "Mumbai Suburban (Bandra/Juhu)", budget: "₹85 Lakh", units: "1 Unit" },
                  { name: "Aman Kapoor", territory: "Delhi NCR (Gurugram Sec 29)", budget: "₹1.5 Cr", units: "3 Units" },
                ].map((app, idx) => (
                  <div key={idx} className="bg-white p-3.5 rounded-xl border border-[#E7ECF2] flex items-center justify-between text-xs">
                    <div>
                      <div className="font-bold text-[#14243A]">{app.name}</div>
                      <div className="text-[11px] text-[#64748B]">{app.territory}</div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-[#315EFB]">{app.budget}</div>
                      <div className="text-[11px] text-[#159D8B] font-semibold">{app.units}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-[#14243A] text-white text-center">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
            Ready to Take Your Brand to 20+ Cities?
          </h2>
          <p className="text-sm sm:text-base text-slate-300 max-w-xl mx-auto">
            Book a confidential franchise readiness diagnostic session with our senior expansion directors.
          </p>
          <div className="pt-2 flex flex-col sm:flex-row justify-center gap-3">
            <Link href="/register?role=business_owner" className="btn-primary py-3 px-8 text-sm font-semibold">
              Get Started Now
            </Link>
            <Link href="/contact" className="btn-secondary py-3 px-8 text-sm font-semibold bg-transparent text-white border-slate-700 hover:bg-slate-800">
              Speak With an Advisor
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
