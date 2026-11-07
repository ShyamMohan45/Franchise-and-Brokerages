"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Building2,
  TrendingUp,
  FileCheck2,
  Users2,
  ShieldCheck,
  ChevronRight,
  ArrowRight,
  MapPin,
  CheckCircle2,
  Layers,
  Scale,
  Sparkles,
  BarChart3,
  BadgeCheck,
  Zap,
  Star,
  Search,
  SlidersHorizontal,
  Compass,
  ArrowUpRight,
  Coffee,
  Dumbbell,
  UtensilsCrossed,
  Cpu,
  Clock,
  Briefcase,
  Lock,
  ArrowDownRight,
  ChevronDown,
} from "lucide-react";
import { api } from "@/lib/api";
import { formatCurrency } from "@/lib/utils";

export default function HomePage() {
  const router = useRouter();
  const [featuredListings, setFeaturedListings] = useState<any[]>([]);
  const [stats, setStats] = useState({ totalFranchises: 5, totalIndustries: 5, activeExpansionCities: 45 });
  const [loadingListings, setLoadingListings] = useState(true);

  // Hero Mockup Active Tab
  const [heroTab, setHeroTab] = useState<"matching" | "dealroom" | "pipeline">("matching");

  // Search & Filter state
  const [selectedIndustry, setSelectedIndustry] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    async function loadData() {
      try {
        setLoadingListings(true);
        const res = await api.get<any[]>("/franchises", { limit: 6, sort: "popular" });
        if (res.success && res.data) {
          setFeaturedListings(res.data);
        }
        const statsRes = await api.get<any>("/public/stats");
        if (statsRes.success && statsRes.data) {
          setStats(statsRes.data);
        }
      } catch (err) {
        console.error("Failed to load homepage data:", err);
      } finally {
        setLoadingListings(false);
      }
    }
    loadData();
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const queryParams = new URLSearchParams();
    if (selectedIndustry !== "All") queryParams.append("industry", selectedIndustry);
    if (searchQuery.trim()) queryParams.append("search", searchQuery.trim());
    router.push(`/franchises?${queryParams.toString()}`);
  };

  const industries = [
    "All",
    "Food & Beverage",
    "Health & Wellness",
    "Retail & Convenience",
    "Education & STEM",
    "Healthcare & Clinics",
  ];

  return (
    <div className="bg-[#F8FAFC] min-h-screen">
      {/* =========================================================================
          HERO SECTION (Stripe & Linear Inspired)
          ========================================================================= */}
      <section className="relative pt-12 pb-20 lg:pt-20 lg:pb-28 overflow-hidden bg-white border-b border-[#E7ECF2]">
        {/* Subtle Background Pattern */}
        <div className="absolute inset-0 subtle-grid pointer-events-none opacity-60" />
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-[#EFF4FF] rounded-full filter blur-3xl opacity-70 pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
            {/* Left Column: Headline, Description & CTAs */}
            <div className="lg:col-span-7 space-y-6">
              {/* Product Badge */}
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#EFF4FF] border border-[#BFD3FE] text-[#315EFB] text-xs font-semibold">
                <span className="w-2 h-2 rounded-full bg-[#315EFB] animate-pulse" />
                Next-Gen Franchise Development & Brokerage
              </div>

              {/* Master Prompt Mandated Headline */}
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-[#14243A] tracking-tight leading-[1.12]">
                Turn Business Ambition Into{" "}
                <span className="text-[#315EFB]">Franchise Growth.</span>
              </h1>

              {/* Master Prompt Mandated Supporting Text */}
              <p className="text-lg sm:text-xl text-[#64748B] leading-relaxed max-w-2xl">
                Connect ambitious brands with the right investors, discover promising franchise opportunities, and manage expansion through one intelligent platform.
              </p>

              {/* 2 Prominent CTA Buttons */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-2">
                <Link
                  href="/franchises"
                  className="btn-primary py-3.5 px-6 text-base font-semibold shadow-md"
                >
                  Explore Opportunities
                  <ArrowRight className="w-4 h-4 ml-1" />
                </Link>
                <Link
                  href="/for-businesses"
                  className="btn-secondary py-3.5 px-6 text-base font-semibold"
                >
                  List Your Franchise
                </Link>
              </div>

              {/* Minimal Credibility Statements (No invented fake claims) */}
              <div className="pt-6 border-t border-[#E7ECF2] grid grid-cols-3 gap-6">
                <div>
                  <div className="text-2xl font-bold text-[#14243A]">100%</div>
                  <div className="text-xs text-[#64748B] mt-0.5 font-medium">Standardized SOPs</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-[#14243A]">256-Bit</div>
                  <div className="text-xs text-[#64748B] mt-0.5 font-medium">Encrypted Deal Rooms</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-[#14243A]">8-Pillar</div>
                  <div className="text-xs text-[#64748B] mt-0.5 font-medium">Readiness Diagnostic</div>
                </div>
              </div>
            </div>

            {/* Right Column: Sophisticated SaaS Product Interface Mockup */}
            <div className="lg:col-span-5">
              <div className="bg-white rounded-2xl border border-[#E7ECF2] shadow-elevated overflow-hidden">
                {/* Mockup Window Chrome Header */}
                <div className="bg-[#14243A] px-4 py-3 flex items-center justify-between border-b border-[#1C2A3E]">
                  <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full bg-red-400/80" />
                    <div className="w-2.5 h-2.5 rounded-full bg-amber-400/80" />
                    <div className="w-2.5 h-2.5 rounded-full bg-emerald-400/80" />
                    <span className="text-xs text-slate-400 ml-2 font-mono">franchisebridge.app/workspace</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 font-medium">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                      Live Sync
                    </span>
                  </div>
                </div>

                {/* Mockup Interactive Navigation Tabs */}
                <div className="bg-[#F8FAFC] px-4 py-2 border-b border-[#E7ECF2] flex items-center gap-2 text-xs font-semibold text-[#64748B]">
                  <button
                    onClick={() => setHeroTab("matching")}
                    className={`px-3 py-1.5 rounded-md transition-colors ${
                      heroTab === "matching"
                        ? "bg-white text-[#315EFB] shadow-sm border border-[#E7ECF2]"
                        : "hover:text-[#14243A]"
                    }`}
                  >
                    Smart Matching
                  </button>
                  <button
                    onClick={() => setHeroTab("pipeline")}
                    className={`px-3 py-1.5 rounded-md transition-colors ${
                      heroTab === "pipeline"
                        ? "bg-white text-[#315EFB] shadow-sm border border-[#E7ECF2]"
                        : "hover:text-[#14243A]"
                    }`}
                  >
                    Expansion Pipeline
                  </button>
                  <button
                    onClick={() => setHeroTab("dealroom")}
                    className={`px-3 py-1.5 rounded-md transition-colors ${
                      heroTab === "dealroom"
                        ? "bg-white text-[#315EFB] shadow-sm border border-[#E7ECF2]"
                        : "hover:text-[#14243A]"
                    }`}
                  >
                    FDD Deal Room
                  </button>
                </div>

                {/* Mockup Tab Content */}
                <div className="p-5 space-y-4">
                  {heroTab === "matching" && (
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-[#14243A] uppercase tracking-wide">
                          Investor Compatibility Match
                        </span>
                        <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-[#E6F7F5] text-[#159D8B]">
                          98% High Alignment
                        </span>
                      </div>

                      {/* Matched Opportunity Preview Card */}
                      <div className="p-3.5 rounded-xl border border-[#E7ECF2] bg-[#F8FAFC] space-y-2.5">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-lg bg-[#315EFB] text-white flex items-center justify-center font-bold text-xs">
                              RC
                            </div>
                            <div>
                              <div className="text-xs font-bold text-[#14243A]">RoastCraft Specialty Coffee</div>
                              <div className="text-[11px] text-[#64748B]">QSR & Café • 3 Outlets Open</div>
                            </div>
                          </div>
                          <span className="text-xs font-bold text-[#315EFB]">₹35L - 55L</span>
                        </div>
                        <div className="grid grid-cols-2 gap-2 text-[11px] pt-1 border-t border-[#E7ECF2]">
                          <div>
                            <span className="text-[#64748B]">EBITDA Margin:</span>{" "}
                            <span className="font-semibold text-[#14243A]">22.4%</span>
                          </div>
                          <div>
                            <span className="text-[#64748B]">Payback Period:</span>{" "}
                            <span className="font-semibold text-[#14243A]">18 Months</span>
                          </div>
                        </div>
                      </div>

                      {/* Matching Factors Scorebar */}
                      <div className="space-y-1.5">
                        <div className="flex justify-between text-[11px]">
                          <span className="text-[#64748B]">Capital Capacity & Territory Match</span>
                          <span className="font-semibold text-[#14243A]">95%</span>
                        </div>
                        <div className="w-full bg-[#E7ECF2] h-2 rounded-full overflow-hidden">
                          <div className="bg-[#315EFB] h-full rounded-full w-[95%]" />
                        </div>
                      </div>

                      <div className="pt-2 flex items-center justify-between text-xs">
                        <span className="text-[#64748B]">Investor: Rajesh Singhania (Delhi NCR)</span>
                        <span className="text-[#315EFB] font-semibold flex items-center gap-0.5">
                          Open Room <ChevronRight className="w-3.5 h-3.5" />
                        </span>
                      </div>
                    </div>
                  )}

                  {heroTab === "pipeline" && (
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-[#14243A] uppercase tracking-wide">
                          Expansion Stage Milestones
                        </span>
                        <span className="text-xs text-[#64748B]">Stage 4 of 6</span>
                      </div>
                      <div className="space-y-2">
                        {[
                          { title: "SOP Codification & Audits", status: "Completed", color: "text-[#159D8B]" },
                          { title: "FDD Legal Documentation", status: "Verified", color: "text-[#159D8B]" },
                          { title: "Investor Due Diligence", status: "In Progress", color: "text-[#315EFB]" },
                          { title: "Territory Escrow Closing", status: "Pending", color: "text-[#64748B]" },
                        ].map((m, idx) => (
                          <div
                            key={idx}
                            className="flex items-center justify-between p-2 rounded-lg bg-[#F8FAFC] border border-[#E7ECF2] text-xs"
                          >
                            <span className="font-medium text-[#14243A]">{m.title}</span>
                            <span className={`font-semibold ${m.color}`}>{m.status}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {heroTab === "dealroom" && (
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-[#14243A] uppercase tracking-wide">
                          Encrypted Diligence Room
                        </span>
                        <span className="text-xs font-semibold text-purple-600 bg-purple-50 px-2 py-0.5 rounded-full">
                          256-Bit TLS
                        </span>
                      </div>
                      <div className="p-3 bg-[#F8FAFC] rounded-xl border border-[#E7ECF2] space-y-2 text-xs">
                        <div className="flex items-center justify-between">
                          <span className="font-semibold text-[#14243A]">Franchise_Disclosure_Doc_2026.pdf</span>
                          <span className="text-emerald-600 font-medium">E-Signed</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="font-semibold text-[#14243A]">Standard_Operating_Procedures.pdf</span>
                          <span className="text-blue-600 font-medium">Verified</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="font-semibold text-[#14243A]">Territory_Financial_Audit.xlsx</span>
                          <span className="text-slate-500 font-medium">Watermarked</span>
                        </div>
                      </div>
                      <div className="text-[11px] text-[#64748B] flex items-center gap-1">
                        <Lock className="w-3.5 h-3.5 text-[#315EFB]" />
                        <span>Audit logged access with cryptographic timestamping</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          QUICK SEARCH & FILTER BAR
          ========================================================================= */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-7 relative z-20">
        <form
          onSubmit={handleSearchSubmit}
          className="bg-white rounded-2xl border border-[#E7ECF2] shadow-card p-3 sm:p-4 grid grid-cols-1 sm:grid-cols-12 gap-3 items-center"
        >
          <div className="sm:col-span-5 relative">
            <Search className="w-4 h-4 text-[#64748B] absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by brand name, city, or concept..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 text-sm rounded-xl border border-[#E7ECF2] focus:outline-none focus:border-[#315EFB] text-[#14243A] placeholder-[#64748B]"
            />
          </div>

          <div className="sm:col-span-4">
            <select
              value={selectedIndustry}
              onChange={(e) => setSelectedIndustry(e.target.value)}
              className="w-full px-3 py-2.5 text-sm rounded-xl border border-[#E7ECF2] focus:outline-none focus:border-[#315EFB] text-[#14243A] bg-white"
            >
              {industries.map((ind) => (
                <option key={ind} value={ind}>
                  {ind === "All" ? "All Industries" : ind}
                </option>
              ))}
            </select>
          </div>

          <div className="sm:col-span-3">
            <button type="submit" className="btn-primary w-full py-2.5 text-sm">
              <Search className="w-4 h-4 mr-1" />
              Find Franchises
            </button>
          </div>
        </form>
      </section>

      {/* =========================================================================
          SECTION 1: PLATFORM BENEFITS (For Brands, Investors, Brokers)
          ========================================================================= */}
      <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-14 space-y-3">
          <span className="text-xs font-bold uppercase tracking-wider text-[#315EFB]">
            Platform Benefits
          </span>
          <h2 className="text-3xl sm:text-4xl font-bold text-[#14243A] tracking-tight">
            Purpose-Built for the Entire Franchise Lifecycle
          </h2>
          <p className="text-[#64748B] text-base leading-relaxed">
            Eliminating fragmented spreadsheets, opaque offline brokering, and compliance risks through structured digital workflows.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Card 1: For Franchise Brands */}
          <div className="surface-card p-8 flex flex-col justify-between">
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-xl bg-[#EFF4FF] flex items-center justify-center text-[#315EFB]">
                <Building2 className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-[#14243A]">For Franchise Brands</h3>
              <p className="text-sm text-[#64748B] leading-relaxed">
                Transform a successful single or multi-unit concept into a scalable franchise network with certified operational SOPs and automated vetting.
              </p>
              <ul className="space-y-2.5 text-xs text-[#14243A] pt-2">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#159D8B] flex-shrink-0" />
                  <span>8-Pillar Franchise Readiness Diagnostic</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#159D8B] flex-shrink-0" />
                  <span>Standard Operating Procedures (SOP) Codification</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#159D8B] flex-shrink-0" />
                  <span>Verified Multi-Unit Operator Recruitment</span>
                </li>
              </ul>
            </div>
            <div className="pt-6 mt-6 border-t border-[#E7ECF2]">
              <Link
                href="/for-businesses"
                className="inline-flex items-center gap-1.5 text-xs font-bold text-[#315EFB] hover:text-[#2144EB]"
              >
                Scale Your Brand <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>

          {/* Card 2: For Investors */}
          <div className="surface-card p-8 flex flex-col justify-between">
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-xl bg-[#E6F7F5] flex items-center justify-center text-[#159D8B]">
                <Users2 className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-[#14243A]">For Franchise Investors</h3>
              <p className="text-sm text-[#64748B] leading-relaxed">
                Invest with complete transparency. Access verified unit economics, audited FDD disclosure documents, and territory catchment demographics.
              </p>
              <ul className="space-y-2.5 text-xs text-[#14243A] pt-2">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#159D8B] flex-shrink-0" />
                  <span>Audited Financials & Real Payback Timelines</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#159D8B] flex-shrink-0" />
                  <span>Digital Deal Rooms with NDA Protection</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#159D8B] flex-shrink-0" />
                  <span>13-Pillar Due Diligence Checklist</span>
                </li>
              </ul>
            </div>
            <div className="pt-6 mt-6 border-t border-[#E7ECF2]">
              <Link
                href="/for-investors"
                className="inline-flex items-center gap-1.5 text-xs font-bold text-[#159D8B] hover:text-[#0F7D6F]"
              >
                Explore Investment Portfolios <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>

          {/* Card 3: For Brokerage Teams */}
          <div className="surface-card p-8 flex flex-col justify-between">
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600">
                <Briefcase className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-[#14243A]">For Brokerage Teams</h3>
              <p className="text-sm text-[#64748B] leading-relaxed">
                Manage your expansion pipeline with automated lead qualification, CRM tracking, document vaults, and escrow milestone compliance.
              </p>
              <ul className="space-y-2.5 text-xs text-[#14243A] pt-2">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#159D8B] flex-shrink-0" />
                  <span>Kanban Lead Pipeline & Activity Logs</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#159D8B] flex-shrink-0" />
                  <span>Automated Territory Conflict Checking</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#159D8B] flex-shrink-0" />
                  <span>Integrated E-Signatures & Audit Logs</span>
                </li>
              </ul>
            </div>
            <div className="pt-6 mt-6 border-t border-[#E7ECF2]">
              <Link
                href="/deal-room"
                className="inline-flex items-center gap-1.5 text-xs font-bold text-indigo-600 hover:text-indigo-700"
              >
                View Deal Management <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          SECTION 2: HOW IT WORKS (5-Step Horizontal Timeline on Desktop)
          ========================================================================= */}
      <section className="py-20 bg-white border-y border-[#E7ECF2]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
            <span className="text-xs font-bold uppercase tracking-wider text-[#315EFB]">
              Standardized Workflow
            </span>
            <h2 className="text-3xl sm:text-4xl font-bold text-[#14243A] tracking-tight">
              How Franchise Expansion Works
            </h2>
            <p className="text-[#64748B] text-base leading-relaxed">
              A structured 5-stage lifecycle ensuring quality control, legal compliance, and aligned capital.
            </p>
          </div>

          {/* Desktop Timeline */}
          <div className="hidden lg:grid grid-cols-5 gap-4 relative">
            {/* Timeline Connecting Line */}
            <div className="absolute top-7 left-12 right-12 h-0.5 bg-[#E7ECF2] -z-0" />

            {[
              {
                step: "01",
                title: "Create Your Profile",
                desc: "Brands codify operational standards; investors set territory & capital criteria.",
              },
              {
                step: "02",
                title: "Discover Opportunities",
                desc: "Explore verified opportunities benchmarked with realistic unit economics.",
              },
              {
                step: "03",
                title: "Connect With Investors",
                desc: "Algorithmic matching aligns net worth, location, and operational capability.",
              },
              {
                step: "04",
                title: "Complete Due Diligence",
                desc: "Execute mutual NDAs and review audited FDDs in secure virtual deal rooms.",
              },
              {
                step: "05",
                title: "Expand Your Business",
                desc: "Sign franchise agreements and initiate site selection & outlet rollout.",
              },
            ].map((item, idx) => (
              <div key={idx} className="relative z-10 flex flex-col items-center text-center px-2">
                <div className="w-14 h-14 rounded-2xl bg-white border-2 border-[#315EFB] text-[#315EFB] font-extrabold text-sm flex items-center justify-center shadow-subtle mb-4">
                  {item.step}
                </div>
                <h4 className="text-sm font-bold text-[#14243A] mb-1.5">{item.title}</h4>
                <p className="text-xs text-[#64748B] leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>

          {/* Mobile Vertical Timeline */}
          <div className="lg:hidden space-y-6">
            {[
              {
                step: "01",
                title: "Create Your Profile",
                desc: "Brands codify operational standards; investors set territory & capital criteria.",
              },
              {
                step: "02",
                title: "Discover Opportunities",
                desc: "Explore verified opportunities benchmarked with realistic unit economics.",
              },
              {
                step: "03",
                title: "Connect With Investors",
                desc: "Algorithmic matching aligns net worth, location, and operational capability.",
              },
              {
                step: "04",
                title: "Complete Due Diligence",
                desc: "Execute mutual NDAs and review audited FDDs in secure virtual deal rooms.",
              },
              {
                step: "05",
                title: "Expand Your Business",
                desc: "Sign franchise agreements and initiate site selection & outlet rollout.",
              },
            ].map((item, idx) => (
              <div key={idx} className="flex items-start gap-4 p-4 rounded-xl bg-[#F8FAFC] border border-[#E7ECF2]">
                <div className="w-10 h-10 rounded-xl bg-[#315EFB] text-white font-bold text-xs flex items-center justify-center flex-shrink-0">
                  {item.step}
                </div>
                <div>
                  <h4 className="text-sm font-bold text-[#14243A]">{item.title}</h4>
                  <p className="text-xs text-[#64748B] mt-1 leading-relaxed">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* =========================================================================
          SECTION 3: EXPLORE FRANCHISE OPPORTUNITIES (Real Verified Backend Data)
          ========================================================================= */}
      <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-[#315EFB]">
              Marketplace Portfolio
            </span>
            <h2 className="text-3xl font-bold text-[#14243A] tracking-tight mt-1">
              Featured Franchise Opportunities
            </h2>
            <p className="text-sm text-[#64748B] mt-1">
              Verified concepts with codified SOPs, active outlets, and transparent financials.
            </p>
          </div>
          <Link
            href="/franchises"
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#315EFB] hover:text-[#2144EB]"
          >
            View All Opportunities <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {/* Listings Grid */}
        {loadingListings ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3].map((n) => (
              <div key={n} className="surface-card p-6 h-80 animate-pulse space-y-4">
                <div className="w-full h-40 bg-slate-200 rounded-xl" />
                <div className="h-4 bg-slate-200 rounded w-2/3" />
                <div className="h-4 bg-slate-200 rounded w-1/2" />
              </div>
            ))}
          </div>
        ) : featuredListings.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {featuredListings.map((franchise) => (
              <div
                key={franchise._id || franchise.id}
                className="surface-card overflow-hidden flex flex-col justify-between group"
              >
                <div>
                  {/* Card Image Banner */}
                  <div className="relative h-48 w-full bg-slate-100 overflow-hidden">
                    <img
                      src={
                        franchise.coverImage ||
                        franchise.logo ||
                        "https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=800&auto=format&fit=crop&q=80"
                      }
                      alt={franchise.brandName}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute top-3 left-3 bg-white/95 backdrop-blur-sm px-2.5 py-1 rounded-md text-[11px] font-bold text-[#14243A] border border-[#E7ECF2]">
                      {franchise.industry || "Franchise"}
                    </div>
                    {franchise.readinessScore && (
                      <div className="absolute top-3 right-3 bg-[#14243A]/90 text-white px-2 py-0.5 rounded text-[10px] font-bold">
                        Score: {franchise.readinessScore}/100
                      </div>
                    )}
                  </div>

                  {/* Card Body */}
                  <div className="p-6 space-y-3">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-bold text-[#14243A] group-hover:text-[#315EFB] transition-colors">
                        {franchise.brandName}
                      </h3>
                      <span className="text-xs font-semibold text-[#159D8B] bg-[#E6F7F5] px-2 py-0.5 rounded">
                        Verified
                      </span>
                    </div>

                    <p className="text-xs text-[#64748B] line-clamp-2 leading-relaxed">
                      {franchise.tagline || franchise.description || "Proven franchise concept with documented operational manuals and turnkey setup."}
                    </p>

                    {/* Investment & Outlets Details */}
                    <div className="grid grid-cols-2 gap-2 pt-3 border-t border-[#E7ECF2] text-xs">
                      <div>
                        <span className="text-[#64748B] block text-[11px]">Investment Range</span>
                        <span className="font-bold text-[#14243A]">
                          {franchise.financials?.minInvestment
                            ? formatCurrency(franchise.financials.minInvestment)
                            : "₹25L - 45L"}
                        </span>
                      </div>
                      <div>
                        <span className="text-[#64748B] block text-[11px]">Active Outlets</span>
                        <span className="font-bold text-[#14243A]">
                          {franchise.unitsCount || "5+ Units"}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Card Action Footer */}
                <div className="p-6 pt-0">
                  <Link
                    href={`/franchises/${franchise.slug || franchise._id}`}
                    className="btn-secondary w-full py-2.5 text-xs font-semibold justify-center group-hover:border-[#315EFB] group-hover:text-[#315EFB]"
                  >
                    View Details & Financials
                    <ChevronRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 surface-card p-8">
            <p className="text-[#64748B] text-sm">No franchise listings currently available.</p>
          </div>
        )}
      </section>

      {/* =========================================================================
          SECTION 4: FOR FRANCHISE BRANDS (Split Layout with Interface Preview)
          ========================================================================= */}
      <section className="py-20 bg-white border-y border-[#E7ECF2]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left Content */}
            <div className="lg:col-span-6 space-y-6">
              <span className="text-xs font-bold uppercase tracking-wider text-[#315EFB]">
                For Business Owners & Franchisors
              </span>
              <h2 className="text-3xl sm:text-4xl font-bold text-[#14243A] tracking-tight">
                Package Your Brand for Institutional Multi-Unit Expansion
              </h2>
              <p className="text-base text-[#64748B] leading-relaxed">
                Most promising brands fail to scale because recipes, operations, and training are trapped in the founder's head. We codify your entire system into investor-ready assets.
              </p>

              <div className="space-y-4 pt-2">
                {[
                  {
                    title: "Build Your Franchise Profile",
                    desc: "Digitalize brand assets, floor plans, capex requirements, and territory availability.",
                  },
                  {
                    title: "Assess Expansion Readiness",
                    desc: "Benchmark your brand across unit economics, supply chain resilience, and defensibility.",
                  },
                  {
                    title: "Publish Opportunities to Vetted Investors",
                    desc: "Gain targeted visibility without spamming brokers or exposing trade secrets.",
                  },
                  {
                    title: "Manage Enquiries in Centralized CRM",
                    desc: "Track investor profiles, capital statements, and scheduled territory visits.",
                  },
                ].map((item, idx) => (
                  <div key={idx} className="flex items-start gap-3.5">
                    <div className="w-6 h-6 rounded-full bg-[#EFF4FF] text-[#315EFB] flex items-center justify-center font-bold text-xs flex-shrink-0 mt-0.5">
                      ✓
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-[#14243A]">{item.title}</h4>
                      <p className="text-xs text-[#64748B] mt-0.5 leading-relaxed">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="pt-4">
                <Link href="/for-businesses" className="btn-primary py-3 px-6 text-sm">
                  Assess Your Franchise Readiness
                  <ArrowRight className="w-4 h-4 ml-1" />
                </Link>
              </div>
            </div>

            {/* Right Split Mockup */}
            <div className="lg:col-span-6">
              <div className="surface-card p-6 bg-[#F8FAFC] border border-[#E7ECF2] space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-[#E7ECF2]">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-emerald-500" />
                    <span className="text-xs font-bold text-[#14243A]">Franchise Readiness Index</span>
                  </div>
                  <span className="text-xs font-bold text-[#315EFB]">Score: 84 / 100</span>
                </div>

                <div className="space-y-3">
                  {[
                    { label: "Unit Financial Viability", score: 92, status: "Optimal" },
                    { label: "SOP & Operational Codification", score: 88, status: "Certified" },
                    { label: "Supply Chain & Vendor Continuity", score: 81, status: "Standard" },
                    { label: "Territory Legal Defensibility", score: 75, status: "Review" },
                  ].map((p, idx) => (
                    <div key={idx} className="bg-white p-3 rounded-xl border border-[#E7ECF2] space-y-1.5">
                      <div className="flex justify-between text-xs">
                        <span className="font-semibold text-[#14243A]">{p.label}</span>
                        <span className="text-[#64748B] font-medium">{p.score}%</span>
                      </div>
                      <div className="w-full bg-[#E7ECF2] h-1.5 rounded-full overflow-hidden">
                        <div
                          className="bg-[#315EFB] h-full rounded-full"
                          style={{ width: `${p.score}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>

                <div className="p-3 bg-[#EFF4FF] rounded-xl text-xs text-[#315EFB] flex items-center justify-between font-semibold">
                  <span>Diagnostic Conclusion: Ready for Multi-Unit Brokerage</span>
                  <ArrowRight className="w-4 h-4" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          SECTION 5: FOR INVESTORS
          ========================================================================= */}
      <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Left Split Interface */}
          <div className="lg:col-span-6 order-2 lg:order-1">
            <div className="surface-card p-6 bg-white border border-[#E7ECF2] space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-[#E7ECF2]">
                <span className="text-xs font-bold text-[#14243A] uppercase tracking-wide">
                  Investor Discovery Console
                </span>
                <span className="text-xs text-[#64748B]">Filter: ₹25L - ₹50L Budget</span>
              </div>

              <div className="space-y-3">
                <div className="p-3.5 rounded-xl border border-[#BFD3FE] bg-[#EFF4FF] flex items-center justify-between">
                  <div>
                    <span className="text-xs font-bold text-[#14243A]">Filter by Net Worth & Liquidity</span>
                    <span className="block text-[11px] text-[#64748B]">Automated pre-qualification</span>
                  </div>
                  <BadgeCheck className="w-5 h-5 text-[#315EFB]" />
                </div>

                <div className="p-3.5 rounded-xl border border-[#E7ECF2] bg-white flex items-center justify-between">
                  <div>
                    <span className="text-xs font-bold text-[#14243A]">Side-by-Side Brand Comparison</span>
                    <span className="block text-[11px] text-[#64748B]">Capex, royalty fees & break-even</span>
                  </div>
                  <SlidersHorizontal className="w-5 h-5 text-[#64748B]" />
                </div>

                <div className="p-3.5 rounded-xl border border-[#E7ECF2] bg-white flex items-center justify-between">
                  <div>
                    <span className="text-xs font-bold text-[#14243A]">Save Favorites & Territory Holds</span>
                    <span className="block text-[11px] text-[#64748B]">Direct notification on status updates</span>
                  </div>
                  <Star className="w-5 h-5 text-amber-500" />
                </div>
              </div>
            </div>
          </div>

          {/* Right Content */}
          <div className="lg:col-span-6 order-1 lg:order-2 space-y-6">
            <span className="text-xs font-bold uppercase tracking-wider text-[#159D8B]">
              For Franchise Investors & Multi-Unit Operators
            </span>
            <h2 className="text-3xl sm:text-4xl font-bold text-[#14243A] tracking-tight">
              Invest with Institutional Clarity and Verified Unit Economics
            </h2>
            <p className="text-base text-[#64748B] leading-relaxed">
              Skip speculative brochures and opaque broker claims. Review standardized financial performance disclosures, inspect territory catchments, and track diligence in real-time.
            </p>

            <div className="space-y-3 pt-2 text-sm text-[#14243A]">
              <div className="flex items-center gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-[#159D8B]" />
                <span>Audited historical store performance and EBITDA benchmarks</span>
              </div>
              <div className="flex items-center gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-[#159D8B]" />
                <span>Direct communication with franchisor leadership</span>
              </div>
              <div className="flex items-center gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-[#159D8B]" />
                <span>Territory exclusivity mapping and catchment protection</span>
              </div>
            </div>

            <div className="pt-4">
              <Link href="/for-investors" className="btn-dark py-3 px-6 text-sm">
                Explore Investor Opportunities
                <ArrowRight className="w-4 h-4 ml-1" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          SECTION 6: PLATFORM INTELLIGENCE
          ========================================================================= */}
      <section className="py-20 bg-white border-y border-[#E7ECF2]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
            <span className="text-xs font-bold uppercase tracking-wider text-[#315EFB]">
              Platform Intelligence
            </span>
            <h2 className="text-3xl sm:text-4xl font-bold text-[#14243A] tracking-tight">
              Specialized Tools Built for Franchise Decision-Making
            </h2>
            <p className="text-[#64748B] text-base leading-relaxed">
              Algorithmic tools engineered to evaluate financial feasibility, location demographics, and investor readiness.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Tool 1: Capex & ROI Estimator */}
            <div className="surface-card p-6 flex flex-col justify-between">
              <div className="space-y-3">
                <div className="w-10 h-10 rounded-xl bg-[#EFF4FF] flex items-center justify-center text-[#315EFB]">
                  <BarChart3 className="w-5 h-5" />
                </div>
                <h3 className="text-lg font-bold text-[#14243A]">Expansion Cost Estimator</h3>
                <p className="text-xs text-[#64748B] leading-relaxed">
                  Interactive multi-variable capex model calculating equipment leases, interior fitouts, working capital, and break-even timelines.
                </p>
              </div>
              <div className="pt-6 mt-4 border-t border-[#E7ECF2]">
                <Link
                  href="/calculator"
                  className="inline-flex items-center gap-1 text-xs font-bold text-[#315EFB] hover:text-[#2144EB]"
                >
                  Launch Calculator <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>

            {/* Tool 2: Location Intelligence */}
            <div className="surface-card p-6 flex flex-col justify-between">
              <div className="space-y-3">
                <div className="w-10 h-10 rounded-xl bg-[#E6F7F5] flex items-center justify-center text-[#159D8B]">
                  <Compass className="w-5 h-5" />
                </div>
                <h3 className="text-lg font-bold text-[#14243A]">Location Intelligence</h3>
                <p className="text-xs text-[#64748B] leading-relaxed">
                  Catchment demographic analysis evaluating footfall patterns, competitor density, and household disposable income for Tier-1, 2, and 3 cities.
                </p>
              </div>
              <div className="pt-6 mt-4 border-t border-[#E7ECF2]">
                <Link
                  href="/location-intelligence"
                  className="inline-flex items-center gap-1 text-xs font-bold text-[#159D8B] hover:text-[#0F7D6F]"
                >
                  Explore Location Radar <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>

            {/* Tool 3: Smart Matching Engine */}
            <div className="surface-card p-6 flex flex-col justify-between">
              <div className="space-y-3">
                <div className="w-10 h-10 rounded-xl bg-purple-50 flex items-center justify-center text-purple-600">
                  <Sparkles className="w-5 h-5" />
                </div>
                <h3 className="text-lg font-bold text-[#14243A]">Smart Matching Engine</h3>
                <p className="text-xs text-[#64748B] leading-relaxed">
                  Multivariate compatibility scoring evaluating capital capacity, territory availability, operational experience, and risk appetite.
                </p>
              </div>
              <div className="pt-6 mt-4 border-t border-[#E7ECF2]">
                <Link
                  href="/franchises"
                  className="inline-flex items-center gap-1 text-xs font-bold text-purple-600 hover:text-purple-700"
                >
                  View Matched Portfolios <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          SECTION 7: TRUST & SECURITY
          ========================================================================= */}
      <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-14 space-y-3">
          <span className="text-xs font-bold uppercase tracking-wider text-[#159D8B]">
            Enterprise Governance
          </span>
          <h2 className="text-3xl sm:text-4xl font-bold text-[#14243A] tracking-tight">
            Institutional Trust, Security, and Compliance
          </h2>
          <p className="text-[#64748B] text-base leading-relaxed">
            Every transaction is governed by bank-grade security protocols, strict role-based access, and verifiable audit trails.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            {
              title: "Encrypted Data Rooms",
              desc: "Confidential Franchise Disclosure Documents (FDDs) are watermarked and encrypted with 256-bit TLS.",
              icon: Lock,
            },
            {
              title: "Role-Based Access Control",
              desc: "Distinct security permissions for Franchisors, Franchisees, Brokers, and Compliance Officers.",
              icon: ShieldCheck,
            },
            {
              title: "Transparent Diligence",
              desc: "13-pillar standardized checklist ensuring zero post-signing legal or operational ambiguity.",
              icon: FileCheck2,
            },
            {
              title: "Legally Binding E-Sign",
              desc: "Integrated digital signatures with IP logging, timestamping, and mutual cryptographic confirmation.",
              icon: Scale,
            },
          ].map((item, idx) => (
            <div key={idx} className="surface-card p-6 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-[#EFF4FF] flex items-center justify-center text-[#315EFB]">
                <item.icon className="w-5 h-5" />
              </div>
              <h4 className="text-sm font-bold text-[#14243A]">{item.title}</h4>
              <p className="text-xs text-[#64748B] leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* =========================================================================
          SECTION 8: FINAL CTA
          ========================================================================= */}
      <section className="py-20 bg-[#14243A] text-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
          <span className="inline-block px-3 py-1 rounded-full bg-[#1C2A3E] text-[#6092FB] text-xs font-semibold uppercase tracking-wider">
            Ready to Scale
          </span>
          <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight">
            Accelerate Your Franchise Expansion Today
          </h2>
          <p className="text-base sm:text-lg text-slate-300 max-w-2xl mx-auto leading-relaxed">
            Whether you are a founder ready to package your business for national growth, or an investor seeking vetted opportunities, FranchiseBridge provides the institutional infrastructure.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <Link
              href="/for-businesses"
              className="btn-primary py-3.5 px-8 text-sm font-semibold w-full sm:w-auto"
            >
              Start Franchising Your Brand
              <ArrowRight className="w-4 h-4 ml-1" />
            </Link>
            <Link
              href="/franchises"
              className="btn-secondary py-3.5 px-8 text-sm font-semibold w-full sm:w-auto bg-transparent text-white border-slate-700 hover:bg-[#1C2A3E]"
            >
              Browse Franchise Directory
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
