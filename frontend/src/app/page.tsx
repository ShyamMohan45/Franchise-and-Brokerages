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
  Sparkle,
  Clock,
  Briefcase,
  Lock,
} from "lucide-react";
import { api } from "@/lib/api";
import { formatCurrency } from "@/lib/utils";
import { StatusBadge } from "@/components/StatusBadge";

export default function HomePage() {
  const router = useRouter();
  const [featuredListings, setFeaturedListings] = useState<any[]>([]);
  const [stats, setStats] = useState({ totalFranchises: 5, totalIndustries: 5, activeExpansionCities: 45 });
  const [newsletterEmail, setNewsletterEmail] = useState("");
  const [newsletterSubscribed, setNewsletterSubscribed] = useState(false);
  const [activeFaq, setActiveFaq] = useState<number | null>(0);
  const [selectedPillar, setSelectedPillar] = useState(0);

  // Quick Finder state
  const [finderIndustry, setFinderIndustry] = useState("All");
  const [finderBudget, setFinderBudget] = useState("All");
  const [finderCity, setFinderCity] = useState("All");

  useEffect(() => {
    async function loadData() {
      try {
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
      }
    }
    loadData();
  }, []);

  const handleFinderSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const queryParams = new URLSearchParams();
    if (finderIndustry !== "All") queryParams.append("industry", finderIndustry);
    if (finderBudget !== "All") queryParams.append("budget", finderBudget);
    if (finderCity !== "All") queryParams.append("search", finderCity);
    router.push(`/franchises?${queryParams.toString()}`);
  };

  const handleNewsletterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newsletterEmail) {
      setNewsletterSubscribed(true);
      setNewsletterEmail("");
    }
  };

  const categories = [
    { label: "Specialty Coffee", icon: Coffee, count: "12+ Hubs", industry: "Food & Beverage" },
    { label: "Smart 24/7 Gyms", icon: Dumbbell, count: "8+ Clusters", industry: "Health & Wellness" },
    { label: "Fast Casual QSR", icon: UtensilsCrossed, count: "18+ Units", industry: "Fast Casual Dining" },
    { label: "AI & STEM Labs", icon: Cpu, count: "6+ Centers", industry: "Education & EdTech" },
    { label: "Luxury MedSpa", icon: Sparkles, count: "5+ Clinics", industry: "Health & Beauty" },
  ];

  const readinessPillars = [
    {
      id: "brand",
      title: "1. Brand Equity & Defensibility",
      score: 94,
      summary: "Customer net promoter score (NPS > 65), registered Class 43/44 IP trademarks, and distinctive proprietary recipes.",
      metrics: "NPS > 65 • Registered Class 43 IP • Distinct Market Voice",
      deliverable: "Comprehensive Trademark Portfolio & Brand Identity Standards Manual",
    },
    {
      id: "economics",
      title: "2. Unit-Level Economics",
      score: 92,
      summary: "Healthy store EBITDA absorbing 5-7% ongoing royalties while maintaining 18-24% annual net franchisee return on capital.",
      metrics: "Store EBITDA > 20% • Payback < 22 Months • Labor < 18%",
      deliverable: "Audited 3-Year P&L Model & Store Capital Sensitivity Calculator",
    },
    {
      id: "sops",
      title: "3. Codified SOP Manuals",
      score: 88,
      summary: "Digital operating playbooks covering daily prep, recipe grammage, machinery calibration, POS cashiering, and quality audits.",
      metrics: "Opening/Closing Checklists • Grammage Recipes • Cloud ERP Integration",
      deliverable: "Interactive Cloud SOP Academy with Video Checklists & Staff Quizzes",
    },
    {
      id: "legal",
      title: "4. FDD & Regulatory Compliance",
      score: 90,
      summary: "US FTC 23-Item Franchise Disclosure Document (FDD) or India Franchise Information Memorandum (FIM) governing all legal covenants.",
      metrics: "Audited Financials Disclosed • Item 19 FPR Structured • Exclusivity Radii",
      deliverable: "State/National Legal Disclosure Packet + Master Franchise Agreement",
    },
    {
      id: "supply",
      title: "5. Supply Chain Scalability",
      score: 87,
      summary: "Direct roaster contracts, centralized commissary sauces, and cold-chain logistics guaranteeing unit consistency.",
      metrics: "Direct Vendor SLAs • Central Commissary Logistics • Guaranteed Shelf-Life",
      deliverable: "Approved Supplier Master List with Volume-Discount Rebate Schedules",
    },
    {
      id: "training",
      title: "6. Certified Training Academy",
      score: 86,
      summary: "Structured 2-to-4 week curriculum certifying head baristas, store managers, shift supervisors, and franchisee owners.",
      metrics: "14-28 Day Field Training • Practical Shadowing • Annual Recertification",
      deliverable: "Franchisee Onboarding LMS Portal & Store Manager Certification Kit",
    },
    {
      id: "repeat",
      title: "7. Geographic Repeatability",
      score: 91,
      summary: "Empirical proof of store profitability across distinct demographic clusters without the founder's daily oversight.",
      metrics: "Multi-Outlet Verification • High-Street & Mall Formats • Suburban Viability",
      deliverable: "Demographic Catchment Study & Foot-Traffic Correlation Reports",
    },
    {
      id: "expansion",
      title: "8. Expansion Support Capacity",
      score: 89,
      summary: "Dedicated corporate field operations managers, site selection lease negotiators, and national marketing co-op teams.",
      metrics: "Lease Advisory • Launch Field Team • Marketing Co-op Support",
      deliverable: "90-Day New Store Opening Countdown Schedule & Local Launch Playbook",
    },
  ];

  const faqs = [
    {
      q: "How does FranchiseBridge prepare local businesses for national franchising?",
      a: "We deploy an institutional 4-phase development engine: first benchmarking your unit economics across our 8-Pillar Readiness Index, codifying daily workflows into digital SOP manuals, drafting regulatory disclosure packets (US FTC 23 Items or India FIM), and placing your opportunity in front of vetted multi-unit investors.",
    },
    {
      q: "What is the difference between an FDD and standard franchise agreements?",
      a: "A Franchise Disclosure Document (FDD), mandated by the US FTC and adopted internationally as a Franchise Information Memorandum (FIM), requires disclosing 23 statutory items including litigation history, audited store financials (Item 19), fee breakdowns, and supplier rebates before an investor can sign a binding agreement.",
    },
    {
      q: "How do you screen and qualify prospective franchise investors?",
      a: "Every candidate submits proof of unencumbered liquid capital, verified net worth, multi-unit operating experience, and targeted geographic territory. Direct contact details remain encrypted until mutual non-disclosure agreements (NDAs) and approval are confirmed.",
    },
    {
      q: "How does the brokerage commission and advisory fee structure work?",
      a: "FranchiseBridge operates with complete transparency. Packaging advisory fees are milestone-based, covering legal drafting and SOP creation, while brokerage commissions are success-based and payable only upon successfully closing executed franchise contracts.",
    },
  ];

  return (
    <div className="space-y-28 pb-20 overflow-x-hidden">
      {/* HERO SECTION */}
      <section className="relative overflow-hidden bg-[#070B14] text-white pt-20 pb-28 border-b border-white/[0.08]">
        {/* Ambient glow backgrounds */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[550px] bg-gradient-to-tr from-blue-600/20 via-indigo-500/15 to-amber-500/10 blur-[130px] pointer-events-none" />
        <div className="absolute top-1/3 -left-48 w-96 h-96 bg-blue-600/15 rounded-full blur-[100px] pointer-events-none" />
        <div className="absolute bottom-0 -right-48 w-96 h-96 bg-amber-500/10 rounded-full blur-[120px] pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
            
            {/* Left Column: Headline & Quick Match Finder */}
            <div className="lg:col-span-7 space-y-7 text-left">
              {/* Badge */}
              <div className="inline-flex items-center gap-2.5 px-3.5 py-1.5 rounded-full bg-gradient-to-r from-blue-500/20 to-indigo-500/10 border border-blue-400/30 text-blue-300 text-xs font-semibold backdrop-blur-md shadow-inner">
                <span className="flex h-2 w-2 rounded-full bg-amber-400 animate-pulse" />
                <span className="text-white font-bold tracking-wide">Premier Platform:</span>
                <span>Packaging SOPs, FDD Legal Packets & Multi-Unit Capital</span>
              </div>

              {/* Main Headline */}
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-[1.08]">
                Turn Proven Local Brands Into{" "}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-amber-400 to-yellow-500">
                  National Franchise Empires.
                </span>
              </h1>

              {/* Subtitle */}
              <p className="text-base sm:text-lg text-slate-300 leading-relaxed max-w-2xl font-normal">
                FranchiseBridge assists high-performing regional businesses with full-suite franchise development:
                codified SOP manuals, regulatory legal disclosure (FDD/FIM) compliance, and targeted multi-unit investor recruitment.
              </p>

              {/* Quick Match Finder Bar */}
              <div className="bg-white/[0.05] border border-white/[0.12] p-4 sm:p-5 rounded-2xl backdrop-blur-xl shadow-2xl max-w-2xl">
                <div className="text-xs font-bold uppercase tracking-wider text-amber-400 mb-3 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                  Quick Opportunity Match Finder
                </div>
                <form onSubmit={handleFinderSubmit} className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-300 mb-1">Industry Vertical</label>
                    <select
                      value={finderIndustry}
                      onChange={(e) => setFinderIndustry(e.target.value)}
                      className="w-full bg-[#0F172A] border border-white/[0.15] text-white text-xs rounded-xl px-3 py-2.5 focus:outline-none focus:border-amber-400"
                    >
                      <option value="All">All Verticals</option>
                      <option value="Food & Beverage">Food & Beverage</option>
                      <option value="Health & Wellness">Health & Wellness</option>
                      <option value="Fast Casual Dining">Fast Casual Dining</option>
                      <option value="Education & EdTech">Education & EdTech</option>
                      <option value="Health & Beauty">Health & Beauty</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-300 mb-1">Target Capital</label>
                    <select
                      value={finderBudget}
                      onChange={(e) => setFinderBudget(e.target.value)}
                      className="w-full bg-[#0F172A] border border-white/[0.15] text-white text-xs rounded-xl px-3 py-2.5 focus:outline-none focus:border-amber-400"
                    >
                      <option value="All">Any Capital Range</option>
                      <option value="under_30l">Under ₹30 Lakh</option>
                      <option value="30l_to_60l">₹30L - ₹60 Lakh</option>
                      <option value="60l_to_1cr">₹60L - ₹1 Crore</option>
                      <option value="above_1cr">₹1 Crore+</option>
                    </select>
                  </div>

                  <div className="flex flex-col justify-end">
                    <button
                      type="submit"
                      className="w-full bg-gradient-to-r from-amber-400 via-amber-500 to-yellow-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 font-black text-xs py-2.5 px-4 rounded-xl shadow-lg transition-all flex items-center justify-center gap-1.5 h-[38px]"
                    >
                      <Search className="w-3.5 h-3.5" />
                      Find Franchises
                    </button>
                  </div>
                </form>
              </div>

              {/* Trust Metric Strip */}
              <div className="pt-4 border-t border-white/[0.08] grid grid-cols-3 gap-6 max-w-lg">
                <div>
                  <div className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">₹45+ Cr</div>
                  <div className="text-[11px] text-slate-400 font-semibold uppercase tracking-wider mt-0.5">
                    Pipeline Volume
                  </div>
                </div>
                <div>
                  <div className="text-2xl sm:text-3xl font-extrabold text-amber-400 tracking-tight">8 Pillars</div>
                  <div className="text-[11px] text-slate-400 font-semibold uppercase tracking-wider mt-0.5">
                    Readiness Index
                  </div>
                </div>
                <div>
                  <div className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">{stats.activeExpansionCities}+ Cities</div>
                  <div className="text-[11px] text-slate-400 font-semibold uppercase tracking-wider mt-0.5">
                    Active Corridors
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column: Live High-Impact Showcase Card */}
            <div className="lg:col-span-5 relative">
              <div className="relative mx-auto max-w-md bg-gradient-to-b from-white/[0.15] via-white/[0.06] to-white/[0.02] p-[1.5px] rounded-3xl shadow-[0_20px_60px_rgba(0,0,0,0.6)] backdrop-blur-2xl">
                <div className="bg-[#0B1220]/95 rounded-[22px] overflow-hidden text-white">
                  
                  {/* Photo Banner with Badges */}
                  <div className="relative h-44 sm:h-48 overflow-hidden group">
                    <img
                      src="https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=1200&auto=format&fit=crop&q=80"
                      alt="RoastCraft Specialty Coffee"
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#0B1220] via-black/30 to-black/40" />
                    
                    <div className="absolute top-3 left-3">
                      <span className="px-2.5 py-1 rounded-lg bg-black/60 backdrop-blur-md text-[11px] font-bold text-amber-300 border border-white/[0.1]">
                        ☕ Food & Beverage
                      </span>
                    </div>

                    <div className="absolute top-3 right-3">
                      <span className="px-2.5 py-1 rounded-full bg-emerald-500/90 text-white text-[11px] font-bold shadow-md flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" /> Certified Ready
                      </span>
                    </div>

                    {/* Logo Avatar overlapping */}
                    <div className="absolute -bottom-4 left-5 flex items-center gap-3">
                      <div className="w-12 h-12 rounded-xl border-2 border-white/20 bg-slate-900 shadow-xl overflow-hidden">
                        <img
                          src="https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=200&auto=format&fit=crop&q=80"
                          alt="RoastCraft Logo"
                          className="w-full h-full object-cover"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="p-5 sm:p-6 pt-6 space-y-4">
                    {/* Title & Tagline */}
                    <div>
                      <div className="flex items-center gap-1.5">
                        <h3 className="text-lg font-bold text-white">RoastCraft Specialty Coffee</h3>
                        <BadgeCheck className="w-4 h-4 text-blue-400" />
                      </div>
                      <p className="text-xs text-amber-400 font-semibold mt-0.5">
                        Artisan Micro-Roastery & Premium Café Chain
                      </p>
                    </div>

                    {/* Readiness Bar */}
                    <div className="space-y-1.5 bg-white/[0.03] p-3 rounded-xl border border-white/[0.06]">
                      <div className="flex justify-between text-xs">
                        <span className="text-slate-300 font-medium flex items-center gap-1">
                          <Sparkles className="w-3 h-3 text-amber-400" />
                          Franchise Readiness Index
                        </span>
                        <span className="font-bold text-amber-400">88 / 100</span>
                      </div>
                      <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                        <div className="bg-gradient-to-r from-blue-500 via-indigo-400 to-amber-400 h-full rounded-full" style={{ width: "88%" }} />
                      </div>
                      <div className="flex justify-between text-[10px] text-slate-400 pt-0.5 font-medium">
                        <span>4 Active Outlets</span>
                        <span className="text-emerald-400 font-semibold">Store EBITDA: 22.4%</span>
                      </div>
                    </div>

                    {/* Financial Specs */}
                    <div className="grid grid-cols-2 gap-2.5 text-xs">
                      <div className="bg-white/[0.04] p-2.5 rounded-xl border border-white/[0.06]">
                        <span className="text-[10px] text-slate-400 uppercase font-semibold">Est. Investment</span>
                        <p className="text-sm font-black text-white mt-0.5">₹35L - ₹55 Lakh</p>
                      </div>
                      <div className="bg-white/[0.04] p-2.5 rounded-xl border border-white/[0.06]">
                        <span className="text-[10px] text-slate-400 uppercase font-semibold">Payback Period</span>
                        <p className="text-sm font-black text-emerald-400 mt-0.5">~18 Months</p>
                      </div>
                    </div>

                    {/* Operational Highlights */}
                    <div className="space-y-1 text-xs text-slate-300">
                      <div className="flex items-center gap-2 text-[11px]">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                        <span>SOP Manuals Codified (Extraction, Barista & POS)</span>
                      </div>
                      <div className="flex items-center gap-2 text-[11px]">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                        <span>Legal FDD Master & Territory Protection (3.5 km)</span>
                      </div>
                    </div>

                    {/* Action */}
                    <Link
                      href="/franchises/roastcraft-specialty-coffee"
                      className="block text-center w-full py-2.5 rounded-xl bg-gradient-to-r from-blue-600 via-blue-500 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-xs shadow-md transition-all"
                    >
                      View Verified Franchise Dossier &rarr;
                    </Link>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* CATEGORY EXPLORER PILLS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-xs uppercase tracking-widest text-slate-400 font-extrabold">
              Explore High-Growth Franchise Verticals
            </p>
            <Link href="/franchises" className="text-xs font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1">
              Browse All Categories <ChevronRight className="w-3 h-3" />
            </Link>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5">
            {categories.map((cat) => {
              const Icon = cat.icon;
              return (
                <Link
                  key={cat.label}
                  href={`/franchises?industry=${encodeURIComponent(cat.industry)}`}
                  className="bg-white p-4 rounded-2xl border border-slate-200/90 hover:border-blue-400 hover:shadow-lg transition-all group flex items-center gap-3.5"
                >
                  <div className="w-10 h-10 rounded-xl bg-slate-50 group-hover:bg-blue-50 text-slate-700 group-hover:text-blue-600 flex items-center justify-center shrink-0 transition-colors">
                    <Icon className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-navy-900 group-hover:text-blue-600 transition-colors">
                      {cat.label}
                    </h4>
                    <span className="text-[10px] text-slate-400 font-medium">{cat.count}</span>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* FEATURED FRANCHISE OPPORTUNITIES (STUNNING PHOTOGRAPHY CARDS) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row items-start md:items-end justify-between mb-10 gap-4">
          <div className="space-y-2">
            <span className="text-blue-600 font-bold text-xs uppercase tracking-wider px-3 py-1 rounded-full bg-blue-50 border border-blue-200">
              Verified Marketplace
            </span>
            <h2 className="text-3xl font-extrabold text-navy-900 tracking-tight">
              Featured Franchise Opportunities
            </h2>
            <p className="text-slate-600 text-xs sm:text-sm max-w-xl">
              Pre-vetted regional brand models with codified operating manuals, audited EBITDA margins, and active multi-unit expansion mandates.
            </p>
          </div>
          <Link
            href="/franchises"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-600 hover:text-blue-800 bg-white px-4 py-2.5 rounded-xl border border-slate-200 shadow-sm transition-all"
          >
            View All {stats.totalFranchises} Opportunities &rarr;
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {featuredListings.slice(0, 6).map((listing) => (
            <div
              key={listing._id}
              className="bg-white rounded-3xl border border-slate-200/90 overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between group"
            >
              <div>
                {/* Photo Banner with Logo Avatar */}
                <div className="relative h-48 overflow-hidden bg-slate-900">
                  <img
                    src={listing.bannerUrl || "https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=1200&auto=format&fit=crop&q=80"}
                    alt={listing.brandName}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                  
                  {/* Category Pill */}
                  <div className="absolute top-3 left-3">
                    <span className="px-2.5 py-1 rounded-lg bg-black/60 backdrop-blur-md text-[11px] font-bold text-white border border-white/[0.15]">
                      {listing.industry}
                    </span>
                  </div>

                  {/* Status Badge */}
                  <div className="absolute top-3 right-3">
                    <StatusBadge status={listing.status} />
                  </div>

                  {/* Logo Avatar & ROI Chip */}
                  <div className="absolute bottom-3 left-4 right-4 flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="w-10 h-10 rounded-xl bg-white p-0.5 shadow-lg overflow-hidden shrink-0">
                        <img
                          src={listing.logoUrl || "https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=200&auto=format&fit=crop&q=80"}
                          alt={listing.brandName}
                          className="w-full h-full object-cover rounded-lg"
                        />
                      </div>
                      <span className="text-white font-extrabold text-sm drop-shadow-md truncate">
                        {listing.brandName}
                      </span>
                    </div>
                    {listing.estimatedRoiMonths && (
                      <span className="px-2 py-0.5 rounded-full bg-emerald-500/90 text-white font-bold text-[10px] shadow-sm">
                        ROI: ~{listing.estimatedRoiMonths} Mo
                      </span>
                    )}
                  </div>
                </div>

                {/* Card Content */}
                <div className="p-6 space-y-4">
                  <div>
                    <p className="text-xs text-amber-700 font-semibold line-clamp-1">{listing.tagline}</p>
                    <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed mt-1">{listing.summary}</p>
                  </div>

                  {/* Key Metrics Grid */}
                  <div className="pt-3 border-t border-slate-100 grid grid-cols-2 gap-3 text-xs">
                    <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                      <span className="text-slate-400 uppercase font-medium text-[10px]">Est. Capital Required</span>
                      <div className="font-extrabold text-navy-900 text-xs sm:text-sm mt-0.5">
                        {formatCurrency(listing.totalInvestmentMin)} - {formatCurrency(listing.totalInvestmentMax)}
                      </div>
                    </div>
                    <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                      <span className="text-slate-400 uppercase font-medium text-[10px]">Franchise Fee</span>
                      <div className="font-extrabold text-navy-900 text-xs sm:text-sm mt-0.5">
                        {formatCurrency(listing.initialFranchiseFee)}
                      </div>
                    </div>
                  </div>

                  {/* Operational Tags */}
                  <div className="space-y-1.5 text-xs text-slate-500 pt-1">
                    <div className="flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="truncate">Expansion: {listing.expansionLocations?.slice(0, 3).join(", ")}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span>Space: {listing.commercialSpaceMinSqFt} - {listing.commercialSpaceMaxSqFt} Sq Ft</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Bottom Footer CTA */}
              <div className="bg-slate-50/80 px-6 py-3.5 border-t border-slate-100 flex items-center justify-between">
                <Link
                  href={`/franchises/${listing.slug}`}
                  className="text-xs font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1 group-hover:translate-x-0.5 transition-transform"
                >
                  View Full Dossier &rarr;
                </Link>
                <Link
                  href={`/franchises/${listing.slug}`}
                  className="text-[11px] font-bold text-slate-700 hover:text-blue-600 bg-white px-2.5 py-1 rounded-lg border border-slate-200 shadow-xs"
                >
                  Request Terms
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 4-PHASE DEVELOPMENT ROADMAP */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
          <span className="text-blue-600 font-bold text-xs uppercase tracking-wider px-3 py-1 rounded-full bg-blue-50 border border-blue-200">
            End-To-End Development Engine
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-navy-900 tracking-tight">
            How We Transform Proven Brands Into National Chains
          </h2>
          <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
            Franchising is not merely selling a brand license. It requires financial engineering, codified operations,
            statutory legal disclosures, and targeted recruitment of qualified multi-unit franchisees.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white p-7 rounded-3xl border border-slate-200/90 shadow-sm hover:shadow-lg transition-all space-y-4 flex flex-col justify-between">
            <div className="space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold shadow-inner">
                <TrendingUp className="w-6 h-6" />
              </div>
              <span className="text-[10px] font-extrabold text-blue-600 uppercase tracking-wider">Phase 1</span>
              <h3 className="text-lg font-bold text-navy-900">Franchise Readiness Audit</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Diagnostic review evaluating EBITDA margins, geographic repeatability, gross profits, and 8-pillar benchmark scores.
              </p>
            </div>
            <Link
              href="/services/franchise-development"
              className="inline-flex items-center text-xs font-bold text-blue-600 hover:text-blue-800 gap-1 pt-3 border-t border-slate-100"
            >
              Explore Diagnostic &rarr;
            </Link>
          </div>

          <div className="bg-white p-7 rounded-3xl border border-slate-200/90 shadow-sm hover:shadow-lg transition-all space-y-4 flex flex-col justify-between">
            <div className="space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold shadow-inner">
                <FileCheck2 className="w-6 h-6" />
              </div>
              <span className="text-[10px] font-extrabold text-amber-600 uppercase tracking-wider">Phase 2</span>
              <h3 className="text-lg font-bold text-navy-900">Codified SOP Manuals</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Standardizing recipes, daily shift opening/closing checklists, register balancing, POS flows, and staff training academies.
              </p>
            </div>
            <Link
              href="/services/sop-development"
              className="inline-flex items-center text-xs font-bold text-amber-600 hover:text-amber-800 gap-1 pt-3 border-t border-slate-100"
            >
              Explore SOP Modules &rarr;
            </Link>
          </div>

          <div className="bg-white p-7 rounded-3xl border border-slate-200/90 shadow-sm hover:shadow-lg transition-all space-y-4 flex flex-col justify-between">
            <div className="space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold shadow-inner">
                <Scale className="w-6 h-6" />
              </div>
              <span className="text-[10px] font-extrabold text-indigo-600 uppercase tracking-wider">Phase 3</span>
              <h3 className="text-lg font-bold text-navy-900">Legal FDD & FIM Disclosure</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                US FTC 23-Item compliance or India/Commonwealth FIM packages, territory protection radii, and trademark licensing.
              </p>
            </div>
            <Link
              href="/services/legal-documentation"
              className="inline-flex items-center text-xs font-bold text-indigo-600 hover:text-indigo-800 gap-1 pt-3 border-t border-slate-100"
            >
              Explore Legal Packaging &rarr;
            </Link>
          </div>

          <div className="bg-white p-7 rounded-3xl border border-slate-200/90 shadow-sm hover:shadow-lg transition-all space-y-4 flex flex-col justify-between">
            <div className="space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold shadow-inner">
                <Users2 className="w-6 h-6" />
              </div>
              <span className="text-[10px] font-extrabold text-emerald-600 uppercase tracking-wider">Phase 4</span>
              <h3 className="text-lg font-bold text-navy-900">Multi-Unit Brokerage</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Connecting franchisors with qualified high-net-worth operators, managing CRM deal pipelines, and closing area contracts.
              </p>
            </div>
            <Link
              href="/services/investor-recruitment"
              className="inline-flex items-center text-xs font-bold text-emerald-600 hover:text-emerald-800 gap-1 pt-3 border-t border-slate-100"
            >
              Explore Recruitment &rarr;
            </Link>
          </div>
        </div>
      </section>

      {/* INTERACTIVE 8 PILLARS BENCHMARK EXPLORER */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-[#0B1220] rounded-3xl p-8 sm:p-12 text-white border border-slate-800 shadow-2xl space-y-10">
          <div className="max-w-3xl space-y-2">
            <span className="text-xs font-extrabold text-amber-400 uppercase tracking-wider">
              Proprietary Diagnostic Benchmark
            </span>
            <h2 className="text-3xl font-extrabold tracking-tight text-white">
              The 8 Pillars of Franchise Readiness
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
              Every brand on FranchiseBridge is benchmarked across 8 rigorous pillars to ensure unit repeatability,
              documentation integrity, and mutual franchisee profitability.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Left: Pillar Selectors */}
            <div className="lg:col-span-5 space-y-2">
              {readinessPillars.map((p, idx) => (
                <button
                  key={p.id}
                  onClick={() => setSelectedPillar(idx)}
                  className={`w-full text-left px-4 py-3 rounded-xl text-xs font-bold transition-all flex items-center justify-between border ${
                    selectedPillar === idx
                      ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white border-blue-500 shadow-lg"
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

            {/* Right: Selected Pillar Details */}
            <div className="lg:col-span-7 bg-white/[0.04] border border-white/[0.1] rounded-2xl p-6 sm:p-8 space-y-6">
              <div className="flex items-center justify-between pb-4 border-b border-white/[0.08]">
                <div>
                  <span className="text-[11px] text-amber-400 uppercase font-semibold">Diagnostic Specification</span>
                  <h3 className="text-xl font-bold text-white mt-0.5">{readinessPillars[selectedPillar].title}</h3>
                </div>
                <div className="text-right">
                  <div className="text-3xl font-black text-amber-400">{readinessPillars[selectedPillar].score}%</div>
                  <span className="text-[10px] text-slate-400 uppercase font-bold">Readiness Score</span>
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

              <div className="bg-blue-950/40 p-4 rounded-xl border border-blue-500/20 space-y-1 text-xs">
                <span className="text-[10px] uppercase font-bold tracking-wider text-blue-300 block">
                  FranchiseBridge Deliverable:
                </span>
                <p className="font-semibold text-white">
                  {readinessPillars[selectedPillar].deliverable}
                </p>
              </div>

              <div className="pt-2 flex items-center justify-between text-xs">
                <span className="text-slate-400">Want to test your business against this benchmark?</span>
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

      {/* DUAL FDD & FIM LEGAL DISCLOSURE PACKET COMPARISON */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-br from-slate-50 to-blue-50/50 rounded-3xl border border-slate-200 p-8 sm:p-12 space-y-8">
          <div className="max-w-3xl space-y-2">
            <span className="text-blue-600 font-bold text-xs uppercase tracking-wider px-3 py-1 rounded-full bg-blue-100/70 border border-blue-200">
              Institutional Compliance
            </span>
            <h2 className="text-3xl font-extrabold text-navy-900 tracking-tight">
              Dual Legal Disclosure: US FTC 23-Item FDD & India FIM
            </h2>
            <p className="text-slate-600 text-xs sm:text-sm leading-relaxed">
              We eliminate regulatory exposure for franchisors and protect investors through jurisdiction-tailored legal disclosure packaging.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white p-7 rounded-2xl border border-slate-200/90 shadow-sm space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <h3 className="text-lg font-bold text-navy-900">US FTC 23-Item FDD Standard</h3>
                <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                  United States FTC 16 CFR Part 436
                </span>
              </div>
              <ul className="space-y-2.5 text-xs text-slate-600">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                  <span><strong>Items 1-4:</strong> Franchisor history, executive litigation, and bankruptcy disclosures.</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                  <span><strong>Items 5-7:</strong> Initial franchise fees, continuing royalties, and total estimated startup capital.</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                  <span><strong>Item 19:</strong> Financial Performance Representations (FPR) with verified historic store sales.</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                  <span><strong>Items 20-23:</strong> Outlets status, audited financial statements, contracts, and receipt confirmation.</span>
                </li>
              </ul>
            </div>

            <div className="bg-white p-7 rounded-2xl border border-slate-200/90 shadow-sm space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <h3 className="text-lg font-bold text-navy-900">India & Commonwealth FIM Standard</h3>
                <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200">
                  Indian Contract Act 1872 & Trademarks Act 1999
                </span>
              </div>
              <ul className="space-y-2.5 text-xs text-slate-600">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                  <span><strong>Trademark Licensing:</strong> Registered Class 35/43/44 IP covenants preventing brand infringement.</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                  <span><strong>Territory Protection:</strong> Explicit radius covenants (e.g. 3.5 km non-compete buffers in metro corridors).</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                  <span><strong>Supply Chain Mandate:</strong> Proprietary ingredient purchase agreements and commissary quality standards.</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                  <span><strong>Arbitration & Dispute Resolution:</strong> Neutral institutional seat clauses ensuring speedy mediation.</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* MULTI-UNIT INVESTOR PRIVACY SHIELD */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-[#070B14] rounded-3xl p-8 sm:p-12 text-white border border-white/[0.08] shadow-2xl">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-7 space-y-5">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold">
                <Lock className="w-3.5 h-3.5" /> Privacy-by-Default Architecture
              </div>
              <h2 className="text-3xl font-extrabold tracking-tight text-white">
                Protecting High-Net-Worth Investor Identity and Financials
              </h2>
              <p className="text-sm text-slate-300 leading-relaxed font-normal">
                Unlike uncurated listing directories where your contact info is immediately sold to telemarketers,
                FranchiseBridge encrypts your net worth, available liquid capital, and personal identifiers.
                Contact is only revealed after mutual review and an executed Non-Disclosure Agreement (NDA).
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2 text-xs">
                <div className="bg-white/[0.04] p-3 rounded-xl border border-white/[0.06]">
                  <span className="text-emerald-400 font-bold block mb-1">1. Encrypted Screening</span>
                  <span className="text-slate-400">Suitability assessed without leaking personal data.</span>
                </div>
                <div className="bg-white/[0.04] p-3 rounded-xl border border-white/[0.06]">
                  <span className="text-emerald-400 font-bold block mb-1">2. Mutual NDA Gate</span>
                  <span className="text-slate-400">Strict legal confidentiality signed before term disclosure.</span>
                </div>
                <div className="bg-white/[0.04] p-3 rounded-xl border border-white/[0.06]">
                  <span className="text-emerald-400 font-bold block mb-1">3. Direct Deal Room</span>
                  <span className="text-slate-400">Direct founder dialogue managed via our brokerage team.</span>
                </div>
              </div>
            </div>

            <div className="lg:col-span-5 bg-white/[0.04] p-6 rounded-2xl border border-white/[0.08] space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-white/[0.08]">
                <span className="text-xs font-bold text-amber-400">Protected Investor Profile</span>
                <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-full font-bold">
                  Verified Candidate
                </span>
              </div>
              <div className="space-y-2.5 text-xs text-slate-300">
                <div className="flex justify-between py-1 border-b border-white/[0.04]">
                  <span className="text-slate-400">Investor Mask:</span>
                  <span className="font-mono text-white">INV-KA-BLR-0498</span>
                </div>
                <div className="flex justify-between py-1 border-b border-white/[0.04]">
                  <span className="text-slate-400">Liquid Capital Band:</span>
                  <span className="font-semibold text-emerald-400">₹60 Lakh - ₹1 Crore</span>
                </div>
                <div className="flex justify-between py-1 border-b border-white/[0.04]">
                  <span className="text-slate-400">Expansion Interest:</span>
                  <span className="font-semibold text-white">Multi-Unit (3 Outlets)</span>
                </div>
                <div className="flex justify-between py-1 border-b border-white/[0.04]">
                  <span className="text-slate-400">Preferred Territory:</span>
                  <span className="text-white">Bengaluru / Hyderabad</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-slate-400">Mutual NDA Status:</span>
                  <span className="text-emerald-400 font-bold">Counter-Signed & Active</span>
                </div>
              </div>
              <Link
                href="/for-investors"
                className="block text-center w-full py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-xs shadow-md transition-all mt-2"
              >
                Join Investor Syndicate &rarr;
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
              Ready to Expand Your Brand or Deploy Growth Capital?
            </h2>
            <p className="text-slate-300 text-xs sm:text-sm">
              Join hundreds of successful brand founders and certified multi-unit operators scaling together.
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
