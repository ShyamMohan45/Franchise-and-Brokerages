"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
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
  Compass,
} from "lucide-react";
import { api } from "@/lib/api";
import { formatCurrency } from "@/lib/utils";
import { StatusBadge } from "@/components/StatusBadge";

export default function HomePage() {
  const [featuredListings, setFeaturedListings] = useState<any[]>([]);
  const [stats, setStats] = useState({ totalFranchises: 3, totalIndustries: 4, activeExpansionCities: 45 });
  const [newsletterEmail, setNewsletterEmail] = useState("");
  const [newsletterSubscribed, setNewsletterSubscribed] = useState(false);
  const [activeFaq, setActiveFaq] = useState<number | null>(0);
  const [selectedPillar, setSelectedPillar] = useState(0);

  useEffect(() => {
    async function loadData() {
      try {
        const res = await api.get<any[]>("/franchises", { limit: 3, sort: "popular" });
        if (res.success && res.data) {
          setFeaturedListings(res.data);
        }
        const statsRes = await api.get<any>("/public/stats");
        if (statsRes.success && statsRes.data) {
          setStats(statsRes.data);
        }
      } catch (err) {
        console.error("Failed to load homepage data:", err);
      }
    }
    loadData();
  }, []);

  const handleNewsletterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newsletterEmail) {
      setNewsletterSubscribed(true);
      setNewsletterEmail("");
    }
  };

  const readinessPillars = [
    {
      id: "brand",
      title: "1. Brand Equity & Defensibility",
      score: 92,
      summary: "Customer net promoter score (NPS), trademark registration, and proprietary menu/offering defense.",
      metrics: "NPS > 65 • Registered Class 43 IP • Distinct Market Voice",
    },
    {
      id: "economics",
      title: "2. Unit-Level Economics",
      score: 90,
      summary: "Store EBITDA must be healthy enough to absorb 5-7% ongoing royalties while yielding 18-24% franchisee ROI.",
      metrics: "Store EBITDA > 20% • Payback < 22 Months • Labor < 18%",
    },
    {
      id: "sops",
      title: "3. Codified SOP Manuals",
      score: 85,
      summary: "Standardized digital workflows for daily prep, quality calibration, register balancing, and inventory.",
      metrics: "Opening/Closing Checklists • Recipe Yield Grammage • Digital POS ERP",
    },
    {
      id: "legal",
      title: "4. FDD & Regulatory Compliance",
      score: 88,
      summary: "US FTC 23-Item disclosure packages or India FIM/Contract Framework governing franchise covenants.",
      metrics: "Audited Financials Disclosed • Territory Radii Defined • Non-Compete IP",
    },
    {
      id: "supply",
      title: "5. Supply Chain Scalability",
      score: 86,
      summary: "Consistent delivery of proprietary ingredients, roasted beans, or IoT hardware across secondary cities.",
      metrics: "Direct Roaster/Vendor Contracts • Cold-Chain Logistics • Reorder SLAs",
    },
    {
      id: "training",
      title: "6. Certified Training Academy",
      score: 84,
      summary: "14-to-21 day onboarding program certifying head baristas, store managers, and quality supervisors.",
      metrics: "Curriculum Testing • Shadowing Protocol • Continuous Recertification",
    },
    {
      id: "repeat",
      title: "7. Geographic Repeatability",
      score: 89,
      summary: "Proof of profitability across distinct demographic catchments without founder's personal oversight.",
      metrics: "Multi-Outlet Verification • Urban & Suburban Viability • High Street/Mall Formats",
    },
    {
      id: "expansion",
      title: "8. Expansion Support Capacity",
      score: 90,
      summary: "Dedicated corporate field managers and real estate advisory teams supporting site launches.",
      metrics: "Lease Advisory • Launch Field Team • Marketing Co-op Support",
    },
  ];

  const faqs = [
    {
      q: "How does FranchiseBridge prepare local businesses for franchising?",
      a: "We deploy an end-to-end development methodology: first benchmarking your unit economics and repeatability across our 8-Pillar Readiness Index, codifying all standard operating procedures (SOPs) into digital manuals, drafting regulatory legal disclosures (FDD/FIM), and positioning your brand for qualified multi-unit operators.",
    },
    {
      q: "What is the difference between an FDD and standard franchise contracts?",
      a: "A Franchise Disclosure Document (FDD), mandatory in the US and mirrored in standard Franchise Information Memorandums (FIM) internationally, contains strictly regulated disclosure items (initial fees, litigation history, unit economics, audited financials) designed to give investors comprehensive transparency before signing binding contracts.",
    },
    {
      q: "How do you screen and qualify franchise investors?",
      a: "Every prospective franchisee undergoes a verifiable suitability assessment, verifying unencumbered liquid capital, target territory alignment, operating background, and single vs. multi-unit capacity before mutual non-disclosure agreements (NDAs) and introductions are approved.",
    },
    {
      q: "What does the brokerage fee structure look like?",
      a: "FranchiseBridge operates transparently. Platform development advisory packages are structured based on the brand's documentation stage, while brokerage success fees are strictly tied to successfully closed multi-unit franchise agreements.",
    },
  ];

  return (
    <div className="space-y-28 pb-20">
      {/* HERO SECTION */}
      <section className="relative overflow-hidden bg-[#070B14] text-white pt-24 pb-32 border-b border-white/[0.08] hero-mesh">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
            
            {/* Left Column: Headline & Value Proposition */}
            <div className="lg:col-span-7 space-y-7 text-left">
              {/* Badge */}
              <div className="inline-flex items-center gap-2.5 px-3.5 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/30 text-blue-300 text-xs font-semibold backdrop-blur-md">
                <span className="flex h-2 w-2 rounded-full bg-amber-400 animate-ping" />
                <span className="text-white font-bold">New:</span> 2026 Multi-Unit Brokerage Pipeline
                <ArrowRight className="w-3 h-3 text-amber-300" />
              </div>

              {/* Main Headline */}
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-[1.1]">
                Turn Local Success Into <br />
                <span className="gold-gradient-text">National Growth.</span>
              </h1>

              {/* Subtitle */}
              <p className="text-base sm:text-lg text-slate-300 leading-relaxed max-w-xl font-normal">
                Empowering proven regional brands to scale through structured franchise packaging, codified SOP manuals,
                regulatory legal disclosure (FDD) compliance, and pre-vetted multi-unit investor recruitment.
              </p>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3.5 pt-2">
                <Link
                  href="/franchises"
                  className="inline-flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 via-blue-500 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold px-7 py-3.5 rounded-xl shadow-[0_4px_20px_rgba(37,99,235,0.4)] transition-all hover:scale-[1.02] text-sm"
                >
                  Explore Franchise Opportunities
                  <ArrowRight className="w-4 h-4 text-amber-300" />
                </Link>
                <Link
                  href="/for-businesses"
                  className="inline-flex items-center justify-center gap-2 bg-white/[0.06] hover:bg-white/[0.1] text-white font-semibold px-6 py-3.5 rounded-xl border border-white/[0.12] backdrop-blur-md transition-all text-sm"
                >
                  Expand Your Business
                  <ChevronRight className="w-4 h-4 text-slate-400" />
                </Link>
              </div>

              {/* High-Impact Stat Strip */}
              <div className="pt-8 border-t border-white/[0.08] grid grid-cols-3 gap-6 max-w-lg">
                <div>
                  <div className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">₹45+ Cr</div>
                  <div className="text-[11px] text-slate-400 font-medium uppercase tracking-wider mt-0.5">
                    Pipeline Volume
                  </div>
                </div>
                <div>
                  <div className="text-2xl sm:text-3xl font-extrabold text-amber-400 tracking-tight">8 Pillars</div>
                  <div className="text-[11px] text-slate-400 font-medium uppercase tracking-wider mt-0.5">
                    Readiness Index
                  </div>
                </div>
                <div>
                  <div className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">{stats.activeExpansionCities}+ Cities</div>
                  <div className="text-[11px] text-slate-400 font-medium uppercase tracking-wider mt-0.5">
                    Expansion Corridors
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column: Live Interactive Dossier Card */}
            <div className="lg:col-span-5 relative">
              <div className="relative mx-auto max-w-md bg-gradient-to-b from-white/[0.12] to-white/[0.03] p-[1.5px] rounded-3xl shadow-2xl backdrop-blur-2xl">
                <div className="bg-[#0B1220]/95 rounded-[22px] p-6 sm:p-7 space-y-5 text-white">
                  
                  {/* Card Header */}
                  <div className="flex items-center justify-between pb-4 border-b border-white/[0.08]">
                    <div className="flex items-center gap-3">
                      <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-slate-950 font-black text-lg shadow-md">
                        ☕
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <h3 className="text-base font-bold text-white">RoastCraft Coffee</h3>
                          <BadgeCheck className="w-4 h-4 text-blue-400" />
                        </div>
                        <span className="text-[11px] text-amber-400 font-semibold">Specialty Roastery & Café</span>
                      </div>
                    </div>
                    <StatusBadge status="certified_ready" />
                  </div>

                  {/* Readiness Progress Bar */}
                  <div className="space-y-2 bg-white/[0.03] p-3.5 rounded-xl border border-white/[0.06]">
                    <div className="flex justify-between text-xs">
                      <span className="text-slate-300 font-medium flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                        Franchise Readiness Index
                      </span>
                      <span className="font-bold text-amber-400">88 / 100</span>
                    </div>
                    <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                      <div className="bg-gradient-to-r from-blue-500 to-amber-400 h-full rounded-full" style={{ width: "88%" }} />
                    </div>
                    <div className="flex justify-between text-[10px] text-slate-400 pt-0.5">
                      <span>4 Outlets Operating</span>
                      <span className="text-emerald-400 font-semibold">EBITDA: 22.4%</span>
                    </div>
                  </div>

                  {/* Economics Grid */}
                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div className="bg-white/[0.04] p-3 rounded-xl border border-white/[0.06]">
                      <span className="text-[10px] text-slate-400 uppercase font-semibold">Est. Capital Required</span>
                      <p className="text-sm font-bold text-white mt-0.5">₹35L - ₹55 Lakh</p>
                    </div>
                    <div className="bg-white/[0.04] p-3 rounded-xl border border-white/[0.06]">
                      <span className="text-[10px] text-slate-400 uppercase font-semibold">Franchise Fee</span>
                      <p className="text-sm font-bold text-white mt-0.5">₹8,00,000</p>
                    </div>
                  </div>

                  {/* Operational Tags */}
                  <div className="space-y-1.5 text-xs text-slate-300">
                    <div className="flex items-center gap-2 text-[11px]">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                      <span>SOP Manuals Codified (Barista extraction & daily POS)</span>
                    </div>
                    <div className="flex items-center gap-2 text-[11px]">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                      <span>Legal FDD Master & Trademark Licensing Audited</span>
                    </div>
                    <div className="flex items-center gap-2 text-[11px]">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                      <span>Multi-Unit Territory Protection (3.5 km Exclusivity)</span>
                    </div>
                  </div>

                  {/* Card Action */}
                  <Link
                    href="/franchises/roastcraft-specialty-coffee"
                    className="block text-center w-full py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-xs shadow-md transition-all"
                  >
                    View Verified Franchise Dossier &rarr;
                  </Link>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* BRAND TRUST MARQUEE */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center space-y-4">
          <p className="text-[11px] uppercase tracking-widest text-slate-400 font-extrabold">
            Standardized Across High-Growth Retail & Hospitality Verticals
          </p>
          <div className="flex flex-wrap items-center justify-center gap-8 sm:gap-14 text-slate-400 font-extrabold text-sm sm:text-base tracking-wider opacity-80">
            <span className="hover:text-navy-900 transition-colors">ROASTCRAFT SPECIALTY COFFEE</span>
            <span className="hover:text-navy-900 transition-colors">FITPULSE 24/7 SMART GYMS</span>
            <span className="hover:text-navy-900 transition-colors">CURRY LEAF EXPRESS</span>
            <span className="hover:text-navy-900 transition-colors">METRO WELLNESS CLINICS</span>
            <span className="hover:text-navy-900 transition-colors">CODEBLOOM STEM ACADEMY</span>
          </div>
        </div>
      </section>

      {/* COMPREHENSIVE 4-PILLAR ECOSYSTEM */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
          <span className="text-blue-600 font-bold text-xs uppercase tracking-wider px-3 py-1 rounded-full bg-blue-50 border border-blue-200">
            Structured Packaging Engine
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-navy-900 tracking-tight">
            How We Take Your Brand from Local Hero to National Chain
          </h2>
          <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
            Franchising isn’t just selling a license. It requires financial engineering, operational manual codification,
            jurisdiction-proof legal agreements, and targeted multi-unit investor recruitment.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-7">
          <div className="bg-white p-7 rounded-3xl border border-slate-200 shadow-sm card-hover-lift space-y-4 flex flex-col justify-between">
            <div className="space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold shadow-inner">
                <TrendingUp className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-navy-900">1. Franchise Readiness</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Diagnostic audit evaluating unit economics, gross margins, supply chains, and replication feasibility across markets.
              </p>
            </div>
            <Link
              href="/services/franchise-development"
              className="inline-flex items-center text-xs font-bold text-blue-600 hover:text-blue-800 gap-1 pt-2 border-t border-slate-100"
            >
              Explore Diagnostic &rarr;
            </Link>
          </div>

          <div className="bg-white p-7 rounded-3xl border border-slate-200 shadow-sm card-hover-lift space-y-4 flex flex-col justify-between">
            <div className="space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold shadow-inner">
                <FileCheck2 className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-navy-900">2. SOP Codification</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Standardizing daily routines, recipes, quality benchmarks, POS protocols, and staff onboarding modules into digital manuals.
              </p>
            </div>
            <Link
              href="/services/sop-development"
              className="inline-flex items-center text-xs font-bold text-amber-600 hover:text-amber-800 gap-1 pt-2 border-t border-slate-100"
            >
              Explore SOP Modules &rarr;
            </Link>
          </div>

          <div className="bg-white p-7 rounded-3xl border border-slate-200 shadow-sm card-hover-lift space-y-4 flex flex-col justify-between">
            <div className="space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold shadow-inner">
                <Scale className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-navy-900">3. Legal FDD & FIM</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Jurisdiction-aligned disclosure structuring, trademark licensing covenants, territory protection, and compliance filings.
              </p>
            </div>
            <Link
              href="/services/legal-documentation"
              className="inline-flex items-center text-xs font-bold text-indigo-600 hover:text-indigo-800 gap-1 pt-2 border-t border-slate-100"
            >
              Explore Legal Packaging &rarr;
            </Link>
          </div>

          <div className="bg-white p-7 rounded-3xl border border-slate-200 shadow-sm card-hover-lift space-y-4 flex flex-col justify-between">
            <div className="space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold shadow-inner">
                <Users2 className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-navy-900">4. Multi-Unit Brokerage</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Vetting qualified high-net-worth franchise investors, managing CRM deal pipelines, and closing expansion agreements.
              </p>
            </div>
            <Link
              href="/services/investor-recruitment"
              className="inline-flex items-center text-xs font-bold text-emerald-600 hover:text-emerald-800 gap-1 pt-2 border-t border-slate-100"
            >
              Explore Recruitment &rarr;
            </Link>
          </div>
        </div>
      </section>

      {/* INTERACTIVE 8 PILLARS DIAGNOSTIC EXPLORER */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-[#0B1220] rounded-3xl p-8 sm:p-12 text-white border border-slate-800 shadow-2xl space-y-10">
          <div className="max-w-3xl space-y-2">
            <span className="text-xs font-extrabold text-amber-400 uppercase tracking-wider">Interactive Benchmark</span>
            <h2 className="text-3xl font-extrabold tracking-tight text-white">The 8 Pillars of Franchise Readiness</h2>
            <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
              Click through each pillar below to see how our proprietary evaluation benchmarks unit economics, documentation integrity, and legal protections.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Left: Interactive Pillar Buttons */}
            <div className="lg:col-span-5 space-y-2">
              {readinessPillars.map((p, idx) => (
                <button
                  key={p.id}
                  onClick={() => setSelectedPillar(idx)}
                  className={`w-full text-left px-4 py-3 rounded-xl text-xs font-bold transition-all flex items-center justify-between border ${
                    selectedPillar === idx
                      ? "bg-blue-600 text-white border-blue-500 shadow-lg"
                      : "bg-white/[0.03] text-slate-300 border-white/[0.06] hover:bg-white/[0.06]"
                  }`}
                >
                  <span>{p.title}</span>
                  <span className={`text-[11px] font-extrabold px-2 py-0.5 rounded-full ${
                    selectedPillar === idx ? "bg-white text-blue-900" : "bg-slate-800 text-amber-400"
                  }`}>
                    {p.score}%
                  </span>
                </button>
              ))}
            </div>

            {/* Right: Detailed Selected Pillar Inspection Box */}
            <div className="lg:col-span-7 bg-white/[0.04] border border-white/[0.1] rounded-2xl p-6 sm:p-8 space-y-6">
              <div className="flex items-center justify-between pb-4 border-b border-white/[0.08]">
                <div>
                  <span className="text-[11px] text-amber-400 uppercase font-semibold">Active Benchmark Inspection</span>
                  <h3 className="text-xl font-bold text-white mt-0.5">{readinessPillars[selectedPillar].title}</h3>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-black text-amber-400">{readinessPillars[selectedPillar].score}%</div>
                  <span className="text-[10px] text-slate-400 uppercase">Target Readiness</span>
                </div>
              </div>

              <p className="text-sm text-slate-300 leading-relaxed">
                {readinessPillars[selectedPillar].summary}
              </p>

              <div className="bg-black/40 p-4 rounded-xl border border-white/[0.06] space-y-1.5 text-xs">
                <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block">
                  Mandatory Validation Checkpoints:
                </span>
                <p className="font-semibold text-emerald-400">
                  {readinessPillars[selectedPillar].metrics}
                </p>
              </div>

              <div className="pt-2 flex items-center justify-between text-xs">
                <span className="text-slate-400">Want to test your own business against this pillar?</span>
                <Link
                  href="/register?role=business_owner"
                  className="bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold px-4 py-2 rounded-xl transition-all"
                >
                  Start Diagnostic &rarr;
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FEATURED FRANCHISE OPPORTUNITIES */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row items-start md:items-end justify-between mb-12 gap-4">
          <div className="space-y-2">
            <span className="text-blue-600 font-bold text-xs uppercase tracking-wider px-3 py-1 rounded-full bg-blue-50 border border-blue-200">
              Verified Marketplace
            </span>
            <h2 className="text-3xl font-extrabold text-navy-900 tracking-tight">Featured Franchise Opportunities</h2>
            <p className="text-slate-600 text-xs sm:text-sm">
              Live opportunities with audited unit economics, codified operating SOPs, and active expansion mandates.
            </p>
          </div>
          <Link
            href="/franchises"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-600 hover:text-blue-800 bg-white px-4 py-2.5 rounded-xl border border-slate-200 shadow-sm"
          >
            View All {stats.totalFranchises} Franchises &rarr;
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {featuredListings.map((listing) => (
            <div
              key={listing._id}
              className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm card-hover-lift flex flex-col justify-between"
            >
              <div className="p-7 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider px-2.5 py-1 rounded-lg bg-blue-50 text-blue-700">
                    {listing.industry}
                  </span>
                  <StatusBadge status={listing.status} />
                </div>

                <div>
                  <h3 className="text-xl font-bold text-navy-900 hover:text-blue-600 transition-colors">
                    <Link href={`/franchises/${listing.slug}`}>{listing.brandName}</Link>
                  </h3>
                  <p className="text-xs text-amber-700 font-semibold mt-0.5">{listing.tagline}</p>
                </div>

                <p className="text-xs text-slate-600 line-clamp-3 leading-relaxed">{listing.summary}</p>

                <div className="pt-4 border-t border-slate-100 grid grid-cols-2 gap-4 text-xs">
                  <div>
                    <div className="text-slate-400 uppercase font-medium text-[10px]">Est. Capital Required</div>
                    <div className="font-extrabold text-navy-900 text-sm mt-0.5">
                      {formatCurrency(listing.totalInvestmentMin)} - {formatCurrency(listing.totalInvestmentMax)}
                    </div>
                  </div>
                  <div>
                    <div className="text-slate-400 uppercase font-medium text-[10px]">Model Format</div>
                    <div className="font-extrabold text-navy-900 text-sm mt-0.5 capitalize">
                      {listing.franchiseModelType?.replace("_", " ")}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 text-xs text-slate-500 pt-2">
                  <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span className="truncate">Expansion: {listing.expansionLocations?.slice(0, 3).join(", ")}</span>
                </div>
              </div>

              <div className="bg-slate-50 px-7 py-4 border-t border-slate-100 flex items-center justify-between">
                <Link
                  href={`/franchises/${listing.slug}`}
                  className="text-xs font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1"
                >
                  View Full Dossier &rarr;
                </Link>
                <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                  ROI: ~{listing.estimatedRoiMonths} Months
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* DUAL VALUE PROPOSITIONS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
          
          {/* Brand Founders */}
          <div className="bg-gradient-to-br from-white to-blue-50/40 p-8 sm:p-10 rounded-3xl border border-slate-200 shadow-sm space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-100 text-blue-800 text-xs font-bold">
              <Building2 className="w-4 h-4 text-blue-600" />
              For Business Owners & Brand Founders
            </div>
            <h3 className="text-2xl font-bold text-navy-900 tracking-tight">
              Scale nationally without exhausting your personal debt or executive bandwidth.
            </h3>
            <ul className="space-y-3.5 text-xs sm:text-sm text-slate-600">
              <li className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
                <span>
                  <strong>Codified Operations Infrastructure:</strong> Ensure consistent quality, recipes, and guest service across every location.
                </span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
                <span>
                  <strong>Pre-Vetted Operator Capital:</strong> No time wasted answering casual calls from unqualified candidates.
                </span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
                <span>
                  <strong>Full Legal Disclosure Protection:</strong> Professional FDD packaging protects your proprietary recipes and trademarks.
                </span>
              </li>
            </ul>
            <div className="pt-2">
              <Link
                href="/for-businesses"
                className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs px-6 py-3 rounded-xl shadow-md transition-all"
              >
                Apply for Franchise Packaging <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>

          {/* Franchise Investors */}
          <div className="bg-gradient-to-br from-white to-amber-50/40 p-8 sm:p-10 rounded-3xl border border-slate-200 shadow-sm space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-100 text-amber-900 text-xs font-bold">
              <Users2 className="w-4 h-4 text-amber-600" />
              For Multi-Unit Franchise Investors
            </div>
            <h3 className="text-2xl font-bold text-navy-900 tracking-tight">
              Access pre-vetted brand models with real unit economics and operational blueprints.
            </h3>
            <ul className="space-y-3.5 text-xs sm:text-sm text-slate-600">
              <li className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                <span>
                  <strong>Audited Financials:</strong> Verified historic store revenue ranges and clear capital schedules with zero fabricated claims.
                </span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                <span>
                  <strong>Multi-Unit Territory Matching:</strong> Algorithmic matching against your preferred territory, budget, and industry focus.
                </span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                <span>
                  <strong>Direct Advisory Oversight:</strong> Dedicated broker assistance through term sheets, FDD review, and developer leases.
                </span>
              </li>
            </ul>
            <div className="pt-2">
              <Link
                href="/for-investors"
                className="inline-flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs px-6 py-3 rounded-xl shadow-md transition-all"
              >
                Register as an Investor <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>

        </div>
      </section>

      {/* FREQUENTLY ASKED QUESTIONS */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12 space-y-2">
          <span className="text-blue-600 font-bold text-xs uppercase tracking-wider">Frequently Asked Questions</span>
          <h2 className="text-3xl font-extrabold text-navy-900 tracking-tight">Everything You Need to Know</h2>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, idx) => (
            <div
              key={idx}
              className="bg-white rounded-2xl border border-slate-200 overflow-hidden transition-all shadow-sm"
            >
              <button
                onClick={() => setActiveFaq(activeFaq === idx ? null : idx)}
                className="w-full px-6 py-4.5 text-left flex items-center justify-between font-bold text-navy-900 text-sm hover:text-blue-600 transition-colors"
              >
                <span>{faq.q}</span>
                <ChevronRight
                  className={`w-5 h-5 text-slate-400 transition-transform ${
                    activeFaq === idx ? "rotate-90 text-blue-600" : ""
                  }`}
                />
              </button>
              {activeFaq === idx && (
                <div className="px-6 pb-6 text-xs text-slate-600 leading-relaxed border-t border-slate-100 pt-3.5">
                  {faq.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* LUXURY CTA BLOCK */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-r from-navy-950 via-[#0B1220] to-blue-950 rounded-3xl p-8 sm:p-16 text-white text-center space-y-8 border border-white/[0.08] shadow-2xl relative overflow-hidden">
          <div className="max-w-2xl mx-auto space-y-3 relative z-10">
            <span className="text-amber-400 text-xs font-bold uppercase tracking-wider">The National Expansion Portal</span>
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white">
              Ready to Expand or Invest in a Proven Franchise?
            </h2>
            <p className="text-slate-300 text-xs sm:text-sm">
              Join hundreds of successful brands and certified multi-unit operators scaling together.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 relative z-10">
            <Link
              href="/register?role=business_owner"
              className="w-full sm:w-auto bg-amber-400 hover:bg-amber-300 text-slate-950 font-black px-8 py-3.5 rounded-xl shadow-lg transition-all text-xs"
            >
              Franchise My Brand
            </Link>
            <Link
              href="/register?role=investor"
              className="w-full sm:w-auto bg-blue-600 hover:bg-blue-500 text-white font-bold px-8 py-3.5 rounded-xl shadow-lg transition-all text-xs"
            >
              Register as Investor
            </Link>
          </div>

          {/* Newsletter Box */}
          <div className="pt-8 border-t border-white/[0.08] max-w-md mx-auto relative z-10">
            <p className="text-[11px] uppercase tracking-wider text-slate-400 font-bold mb-3">
              Subscribe to the Monthly Franchise Expansion Report
            </p>
            {newsletterSubscribed ? (
              <div className="bg-emerald-950/80 border border-emerald-500 text-emerald-300 text-xs py-2.5 px-4 rounded-xl flex items-center justify-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                Thank you! You are subscribed to our monthly expansion report.
              </div>
            ) : (
              <form onSubmit={handleNewsletterSubmit} className="flex gap-2">
                <input
                  type="email"
                  value={newsletterEmail}
                  onChange={(e) => setNewsletterEmail(e.target.value)}
                  placeholder="Enter your corporate email..."
                  required
                  className="bg-black/50 border border-white/[0.15] text-white placeholder-slate-500 text-xs rounded-xl px-4 py-2.5 flex-1 focus:outline-none focus:border-amber-400"
                />
                <button
                  type="submit"
                  className="bg-white/[0.1] hover:bg-white/[0.18] text-white text-xs font-bold px-4 py-2.5 rounded-xl border border-white/[0.2] transition-colors"
                >
                  Subscribe
                </button>
              </form>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
