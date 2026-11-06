"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Building2,
  TrendingUp,
  FileCheck2,
  Users2,
  ShieldCheck,
  Award,
  ChevronRight,
  ArrowRight,
  BookOpen,
  DollarSign,
  Briefcase,
  MapPin,
  CheckCircle2,
  Layers,
  HelpCircle,
  Mail,
  Scale,
  Sparkles,
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
    <div className="space-y-24 pb-16">
      {/* 3. Hero Section */}
      <section className="relative overflow-hidden bg-[#0B1220] text-white pt-20 pb-28 border-b border-slate-800">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-900/30 via-slate-950/60 to-transparent pointer-events-none" />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-3xl mx-auto space-y-6">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-950/80 border border-blue-700/50 text-blue-300 text-xs font-semibold uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              Enterprise Franchise Development & Brokerage
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-tight">
              Turn Local Success Into <br />
              <span className="gold-gradient-text">National Growth.</span>
            </h1>

            <p className="text-lg sm:text-xl text-slate-300 leading-relaxed font-normal">
              Empowering ambitious brands to scale through structured franchise development, standard operating
              procedure (SOP) packaging, legal disclosure compliance, and strategic multi-unit investor recruitment.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
              <Link
                href="/franchises"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 text-white font-semibold px-8 py-3.5 rounded-xl shadow-lg transition-all hover:scale-105"
              >
                Explore Franchise Opportunities
                <ArrowRight className="w-4 h-4 text-amber-300" />
              </Link>
              <Link
                href="/for-businesses"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-slate-800/90 hover:bg-slate-700 text-white font-semibold px-8 py-3.5 rounded-xl border border-slate-700 shadow-md transition-all"
              >
                Expand Your Business
                <ChevronRight className="w-4 h-4 text-slate-400" />
              </Link>
            </div>

            {/* Quick Metrics */}
            <div className="grid grid-cols-3 gap-6 pt-12 border-t border-slate-800/80 max-w-2xl mx-auto">
              <div>
                <div className="text-2xl sm:text-3xl font-extrabold text-white">₹45+ Cr</div>
                <div className="text-xs text-slate-400 mt-1 uppercase tracking-wider">Active Pipeline Value</div>
              </div>
              <div>
                <div className="text-2xl sm:text-3xl font-extrabold text-amber-400">8 Pillars</div>
                <div className="text-xs text-slate-400 mt-1 uppercase tracking-wider">Readiness Benchmark</div>
              </div>
              <div>
                <div className="text-2xl sm:text-3xl font-extrabold text-white">{stats.activeExpansionCities}+ Cities</div>
                <div className="text-xs text-slate-400 mt-1 uppercase tracking-wider">Expansion Corridors</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Trusted Brand / Partner Banner */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center space-y-4">
          <p className="text-xs uppercase tracking-widest text-slate-500 font-semibold">
            Trusted by Ambitious Multi-Outlet Brands and High-Net-Worth Operator Syndicates
          </p>
          <div className="flex flex-wrap items-center justify-center gap-8 sm:gap-14 opacity-75 grayscale hover:grayscale-0 transition-all text-slate-600 font-bold text-lg">
            <span>ROASTCRAFT COFFEE</span>
            <span>FITPULSE 24/7</span>
            <span>CURRY LEAF EXPRESS</span>
            <span>METRO HEALTHCARE</span>
            <span>CODEBLOOM ACADEMY</span>
          </div>
        </div>
      </section>

      {/* 5 & 6. Core Franchise Development Services */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
          <span className="text-blue-600 font-semibold text-sm uppercase tracking-wider">Comprehensive Ecosystem</span>
          <h2 className="text-3xl sm:text-4xl font-bold text-navy-900 tracking-tight">
            How We Take Your Brand from Local Hero to National Chain
          </h2>
          <p className="text-slate-600 text-base">
            Franchising isn’t merely copying your logo. It demands rigorous financial engineering, standardized
            checklists, jurisdiction-proof legal contracts, and targeted multi-unit investor recruitment.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          <div className="bg-white p-7 rounded-2xl border border-slate-200/90 shadow-sm hover:shadow-md transition-shadow space-y-4">
            <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
              <TrendingUp className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-navy-900">1. Franchise Readiness</h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              Diagnostic audit evaluating unit economics, gross margins, supply chains, and replication feasibility.
            </p>
            <Link
              href="/services/franchise-development"
              className="inline-flex items-center text-xs font-semibold text-blue-600 hover:text-blue-800 gap-1"
            >
              Learn More &rarr;
            </Link>
          </div>

          <div className="bg-white p-7 rounded-2xl border border-slate-200/90 shadow-sm hover:shadow-md transition-shadow space-y-4">
            <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
              <FileCheck2 className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-navy-900">2. SOP Codification</h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              Standardizing daily routines, recipes, quality benchmarks, POS protocols, and staff onboarding modules.
            </p>
            <Link
              href="/services/sop-development"
              className="inline-flex items-center text-xs font-semibold text-amber-600 hover:text-amber-800 gap-1"
            >
              Learn More &rarr;
            </Link>
          </div>

          <div className="bg-white p-7 rounded-2xl border border-slate-200/90 shadow-sm hover:shadow-md transition-shadow space-y-4">
            <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
              <Scale className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-navy-900">3. Legal FDD & FIM</h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              Jurisdiction-aligned disclosure structuring, trademark licensing covenants, and territory exclusivity rules.
            </p>
            <Link
              href="/services/legal-documentation"
              className="inline-flex items-center text-xs font-semibold text-indigo-600 hover:text-indigo-800 gap-1"
            >
              Learn More &rarr;
            </Link>
          </div>

          <div className="bg-white p-7 rounded-2xl border border-slate-200/90 shadow-sm hover:shadow-md transition-shadow space-y-4">
            <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
              <Users2 className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-navy-900">4. Multi-Unit Brokerage</h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              Vetting qualified high-net-worth franchise investors, managing CRM deal pipelines, and closing expansions.
            </p>
            <Link
              href="/services/investor-recruitment"
              className="inline-flex items-center text-xs font-semibold text-emerald-600 hover:text-emerald-800 gap-1"
            >
              Learn More &rarr;
            </Link>
          </div>
        </div>
      </section>

      {/* 7. Featured Franchise Opportunities */}
      <section className="bg-slate-100/70 py-20 border-y border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-start md:items-end justify-between mb-12 gap-4">
            <div>
              <span className="text-blue-600 font-semibold text-sm uppercase tracking-wider">Curated Portfolio</span>
              <h2 className="text-3xl font-bold text-navy-900 tracking-tight">Featured Franchise Opportunities</h2>
              <p className="text-slate-600 text-sm mt-1">
                Verified businesses with approved SOPs, disclosed unit economics, and active expansion mandates.
              </p>
            </div>
            <Link
              href="/franchises"
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-blue-600 hover:text-blue-800 bg-white px-4 py-2 rounded-lg border border-slate-200 shadow-sm"
            >
              View All {stats.totalFranchises} Franchises &rarr;
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {featuredListings.map((listing) => (
              <div
                key={listing._id}
                className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-lg transition-all flex flex-col justify-between"
              >
                <div className="p-6 space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider px-2.5 py-1 rounded-md bg-blue-50 text-blue-700">
                      {listing.industry}
                    </span>
                    <StatusBadge status={listing.status} />
                  </div>

                  <div>
                    <h3 className="text-xl font-bold text-navy-900 hover:text-blue-600 transition-colors">
                      <Link href={`/franchises/${listing.slug}`}>{listing.brandName}</Link>
                    </h3>
                    <p className="text-xs text-amber-700 font-medium mt-0.5">{listing.tagline}</p>
                  </div>

                  <p className="text-sm text-slate-600 line-clamp-2 leading-relaxed">{listing.summary}</p>

                  <div className="pt-4 border-t border-slate-100 grid grid-cols-2 gap-4 text-xs">
                    <div>
                      <div className="text-slate-400 uppercase font-medium">Est. Investment</div>
                      <div className="font-bold text-navy-900 text-sm mt-0.5">
                        {formatCurrency(listing.totalInvestmentMin)} - {formatCurrency(listing.totalInvestmentMax)}
                      </div>
                    </div>
                    <div>
                      <div className="text-slate-400 uppercase font-medium">Model Format</div>
                      <div className="font-bold text-navy-900 text-sm mt-0.5 capitalize">
                        {listing.franchiseModelType.replace("_", " ")}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 text-xs text-slate-500 pt-2">
                    <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span className="truncate">Expansion: {listing.expansionLocations?.slice(0, 3).join(", ")}</span>
                  </div>
                </div>

                <div className="bg-slate-50 px-6 py-3 border-t border-slate-100 flex items-center justify-between">
                  <Link
                    href={`/franchises/${listing.slug}`}
                    className="text-xs font-semibold text-blue-600 hover:text-blue-800 flex items-center gap-1"
                  >
                    View Comprehensive Dossier &rarr;
                  </Link>
                  <span className="text-[11px] text-slate-400">ROI: ~{listing.estimatedRoiMonths} mo</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 8 & 9. How Franchising & The Platform Works */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-navy-900 text-white rounded-3xl p-8 sm:p-14 border border-slate-800 shadow-2xl">
          <div className="max-w-3xl mb-12">
            <span className="text-amber-400 font-semibold text-xs uppercase tracking-wider">Methodology</span>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight mt-1 text-white">
              The 4-Stage Franchise Brokerage Journey
            </h2>
            <p className="text-slate-400 text-sm sm:text-base mt-2">
              From operational codification to legally vetted introduction and deal execution.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="space-y-3 relative">
              <div className="w-10 h-10 rounded-full bg-blue-600 text-white font-bold flex items-center justify-center text-sm shadow-md">
                01
              </div>
              <h4 className="text-base font-bold text-white">Diagnostic & Score</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Brand undergoes our 8-Pillar evaluation to identify documentation gaps and franchise feasibility.
              </p>
            </div>

            <div className="space-y-3 relative">
              <div className="w-10 h-10 rounded-full bg-amber-500 text-slate-950 font-bold flex items-center justify-center text-sm shadow-md">
                02
              </div>
              <h4 className="text-base font-bold text-white">SOP & Legal Packaging</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Operations are codified into checklists, and legal disclosure memorandums are drafted by advisors.
              </p>
            </div>

            <div className="space-y-3 relative">
              <div className="w-10 h-10 rounded-full bg-blue-600 text-white font-bold flex items-center justify-center text-sm shadow-md">
                03
              </div>
              <h4 className="text-base font-bold text-white">Marketplace & Matching</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Approved listings are published, and multi-unit investors are vetted against capital and territory requirements.
              </p>
            </div>

            <div className="space-y-3 relative">
              <div className="w-10 h-10 rounded-full bg-emerald-500 text-slate-950 font-bold flex items-center justify-center text-sm shadow-md">
                04
              </div>
              <h4 className="text-base font-bold text-white">Introduction & Closing</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Brokers schedule meetings, facilitate negotiations, oversee final agreements, and track rollout milestones.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 10 & 11. Dual Stakeholder Benefits */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* For Business Owners */}
          <div className="bg-white p-8 sm:p-10 rounded-3xl border border-slate-200/90 shadow-sm space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-semibold">
              <Building2 className="w-4 h-4" />
              For Business Owners & Franchisors
            </div>
            <h3 className="text-2xl font-bold text-navy-900">
              Scale without exhausting your personal debt or daily management capacity.
            </h3>
            <ul className="space-y-3.5 text-sm text-slate-600">
              <li className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
                <span>
                  <strong>Codified SOP Infrastructure:</strong> Keep control over product quality and recipes without
                  physically being in every location.
                </span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
                <span>
                  <strong>Pre-Qualified Capital:</strong> No time wasted fielding calls from casual inquiries with
                  insufficient capital.
                </span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
                <span>
                  <strong>Full Legal Transparency:</strong> Professional disclosure packages protect your proprietary IP and
                  trade secrets.
                </span>
              </li>
            </ul>
            <div className="pt-2">
              <Link
                href="/for-businesses"
                className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm px-6 py-3 rounded-xl transition-all"
              >
                Apply for Franchise Packaging
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>

          {/* For Investors */}
          <div className="bg-white p-8 sm:p-10 rounded-3xl border border-slate-200/90 shadow-sm space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-50 text-amber-700 text-xs font-semibold">
              <Briefcase className="w-4 h-4" />
              For Franchise Investors & Syndicates
            </div>
            <h3 className="text-2xl font-bold text-navy-900">
              Access vetted, proven business models with real numbers and operational blueprints.
            </h3>
            <ul className="space-y-3.5 text-sm text-slate-600">
              <li className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                <span>
                  <strong>Zero Invented Numbers:</strong> Real historic unit revenue ranges and clear capital requirement
                  schedules.
                </span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                <span>
                  <strong>Multi-Unit Compatibility:</strong> Algorithms that match your preferred territory and investment
                  budget directly with receptive franchisors.
                </span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                <span>
                  <strong>Structured Advisory Support:</strong> Direct brokerage assistance through term sheets, FDD
                  review, and territorial leases.
                </span>
              </li>
            </ul>
            <div className="pt-2">
              <Link
                href="/for-investors"
                className="inline-flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white font-semibold text-sm px-6 py-3 rounded-xl transition-all"
              >
                Register as an Investor
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 15. FAQ Section */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12 space-y-2">
          <span className="text-blue-600 font-semibold text-xs uppercase tracking-wider">Frequently Asked Questions</span>
          <h2 className="text-3xl font-bold text-navy-900 tracking-tight">Everything You Need to Know</h2>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, idx) => (
            <div
              key={idx}
              className="bg-white rounded-2xl border border-slate-200/90 overflow-hidden transition-all shadow-sm"
            >
              <button
                onClick={() => setActiveFaq(activeFaq === idx ? null : idx)}
                className="w-full px-6 py-4 text-left flex items-center justify-between font-bold text-navy-900 hover:text-blue-600 transition-colors"
              >
                <span>{faq.q}</span>
                <ChevronRight
                  className={`w-5 h-5 text-slate-400 transition-transform ${
                    activeFaq === idx ? "rotate-90 text-blue-600" : ""
                  }`}
                />
              </button>
              {activeFaq === idx && (
                <div className="px-6 pb-5 text-sm text-slate-600 leading-relaxed border-t border-slate-100 pt-3">
                  {faq.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* 16 & 17. CTA & Newsletter */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-r from-navy-900 via-navy-800 to-blue-950 rounded-3xl p-8 sm:p-14 text-white text-center space-y-8 border border-slate-800 shadow-xl">
          <div className="max-w-2xl mx-auto space-y-3">
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white">
              Ready to Expand or Invest in a High-Yield Franchise?
            </h2>
            <p className="text-slate-300 text-sm sm:text-base">
              Join hundreds of successful brands and certified multi-unit operators scaling together.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/register?role=business_owner"
              className="w-full sm:w-auto bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold px-8 py-3.5 rounded-xl shadow-lg transition-all"
            >
              Franchise My Brand
            </Link>
            <Link
              href="/register?role=investor"
              className="w-full sm:w-auto bg-blue-600 hover:bg-blue-500 text-white font-bold px-8 py-3.5 rounded-xl shadow-lg transition-all"
            >
              Register as Investor
            </Link>
          </div>

          {/* Newsletter */}
          <div className="pt-8 border-t border-slate-800 max-w-md mx-auto">
            <p className="text-xs uppercase tracking-wider text-slate-400 font-semibold mb-3">
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
                  className="bg-slate-900/90 border border-slate-700 text-white placeholder-slate-500 text-sm rounded-xl px-4 py-2.5 flex-1 focus:outline-none focus:border-amber-400"
                />
                <button
                  type="submit"
                  className="bg-slate-800 hover:bg-slate-700 text-white text-sm font-semibold px-4 py-2.5 rounded-xl border border-slate-600 transition-colors"
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
