"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Briefcase,
  TrendingUp,
  Bookmark,
  Send,
  Calendar,
  CheckCircle2,
  AlertCircle,
  MapPin,
  Clock,
  Sparkles,
  ArrowRight,
  UserCheck,
  Scale,
  FileText,
  Download,
  ExternalLink,
  Shield,
  FileCheck,
  BadgeCheck,
  Lock,
  Target,
  CheckSquare,
  Award,
} from "lucide-react";
import { useAuth } from "@/providers/AuthProvider";
import { api } from "@/lib/api";
import { formatCurrency, formatDate } from "@/lib/utils";
import { StatusBadge } from "@/components/StatusBadge";

export default function InvestorDashboardPage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  const [activeTab, setActiveTab] = useState<
    "recommendations" | "matching" | "due_diligence" | "applications" | "fdd_facility" | "saved" | "profile" | "meetings"
  >("recommendations");
  const [profile, setProfile] = useState<any | null>(null);
  const [recommendations, setRecommendations] = useState<any[]>([]);
  const [smartMatches, setSmartMatches] = useState<any[]>([]);
  const [dueDiligenceData, setDueDiligenceData] = useState<any | null>(null);
  const [applications, setApplications] = useState<any[]>([]);
  const [fddPackages, setFddPackages] = useState<any[]>([]);
  const [selectedJurisdiction, setSelectedJurisdiction] = useState<string>("ALL");
  const [savedFranchises, setSavedFranchises] = useState<any[]>([]);
  const [meetings, setMeetings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Profile edit state
  const [profileForm, setProfileForm] = useState({
    city: "Bengaluru",
    budgetMin: 3000000,
    budgetMax: 8000000,
    liquidCapital: 6000000,
    interestType: "multi_unit",
    proposedOutlets: 2,
    timeline: "1_to_3_months",
    industries: "Food & Beverage, Health & Wellness",
    locations: "Bengaluru, Hyderabad, Pune",
  });
  const [isSavingProfile, setIsSavingProfile] = useState(false);

  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/login");
      return;
    }

    async function loadData() {
      try {
        setLoading(true);
        const [profRes, recRes, appRes, fddRes, savedRes, meetRes, matchRes] = await Promise.all([
          api.get<any>("/investors/profile"),
          api.get<any[]>("/investors/recommendations"),
          api.get<any[]>("/applications/my"),
          api.get<any[]>("/documents/fdd-packages"),
          api.get<any[]>("/franchises/saved"),
          api.get<any[]>("/meetings/my"),
          api.get<any[]>("/matching/investor"),
        ]);

        if (profRes.success && profRes.data) {
          setProfile(profRes.data);
          setProfileForm({
            city: profRes.data.city || "Bengaluru",
            budgetMin: profRes.data.investmentBudgetMin || 3000000,
            budgetMax: profRes.data.investmentBudgetMax || 8000000,
            liquidCapital: profRes.data.liquidCapital || 6000000,
            interestType: profRes.data.interestType || "multi_unit",
            proposedOutlets: profRes.data.proposedOutlets || 2,
            timeline: profRes.data.investmentTimeline || "1_to_3_months",
            industries: profRes.data.preferredIndustries?.join(", ") || "Food & Beverage",
            locations: profRes.data.preferredLocations?.join(", ") || "Bengaluru",
          });
        }
        if (recRes.success && recRes.data) setRecommendations(recRes.data);
        if (appRes.success && appRes.data) setApplications(appRes.data);
        if (fddRes.success && fddRes.data) setFddPackages(fddRes.data);
        if (savedRes.success && savedRes.data) setSavedFranchises(savedRes.data);
        if (meetRes.success && meetRes.data) setMeetings(meetRes.data);
        if (matchRes.success && matchRes.data) setSmartMatches(matchRes.data);
      } catch (err) {
        console.error("Investor dashboard fetch error:", err);
      } finally {
        setLoading(false);
      }
    }

    if (user) loadData();
  }, [user, isLoading, router]);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingProfile(true);
    try {
      const preferredIndustries = profileForm.industries.split(",").map((s) => s.trim());
      const preferredLocations = profileForm.locations.split(",").map((s) => s.trim());

      const res = await api.patch("/investors/profile", {
        city: profileForm.city,
        investmentBudgetMin: profileForm.budgetMin,
        investmentBudgetMax: profileForm.budgetMax,
        liquidCapital: profileForm.liquidCapital,
        interestType: profileForm.interestType,
        proposedOutlets: profileForm.proposedOutlets,
        investmentTimeline: profileForm.timeline,
        preferredIndustries,
        preferredLocations,
      });

      if (res.success && res.data) {
        setProfile(res.data);
        // Refresh recommendations
        const recRes = await api.get<any[]>("/investors/recommendations");
        if (recRes.success && recRes.data) setRecommendations(recRes.data);
        alert("Investor profile updated successfully!");
      }
    } catch (err: any) {
      alert(err.message || "Failed to update profile");
    } finally {
      setIsSavingProfile(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center space-y-3">
        <div className="inline-block w-8 h-8 border-4 border-amber-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-sm text-slate-500 font-medium">Loading Investor Portfolio...</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-navy-950 via-slate-900 to-amber-950 text-white rounded-3xl p-8 sm:p-10 border border-slate-800 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-950/80 border border-amber-700/50 text-amber-300 text-xs font-semibold">
            <Briefcase className="w-3.5 h-3.5 text-amber-400" />
            Franchise Investor Portal
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Welcome, {user?.fullName || "Investor"}
          </h1>
          <p className="text-slate-300 text-xs sm:text-sm max-w-xl">
            Track your multi-unit franchise applications, browse algorithmically scored brand recommendations, and
            coordinate with platform advisors.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Link
            href="/franchises"
            className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold px-5 py-2.5 rounded-xl text-xs shadow transition-all flex items-center gap-1.5"
          >
            Browse Marketplace &rarr;
          </Link>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex border-b border-slate-200 overflow-x-auto gap-2 text-xs font-semibold">
        {[
          { id: "recommendations", label: `Recommended (${recommendations.length})`, icon: Sparkles },
          { id: "matching", label: `Smart Weighted Matching (${smartMatches.length})`, icon: Target },
          { id: "due_diligence", label: "Due Diligence Checklist (13 Pillars)", icon: CheckSquare },
          { id: "applications", label: `My Applications (${applications.length})`, icon: Send },
          { id: "fdd_facility", label: `FDD Legal Facility (${fddPackages.length})`, icon: Scale },
          { id: "saved", label: `Saved Portfolio (${savedFranchises.length})`, icon: Bookmark },
          { id: "profile", label: "Investment Criteria", icon: UserCheck },
          { id: "meetings", label: `Meetings (${meetings.length})`, icon: Calendar },
        ].map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 py-3 px-4 border-b-2 transition-all whitespace-nowrap ${
                activeTab === tab.id
                  ? "border-amber-500 text-amber-600 bg-amber-50/50 rounded-t-lg"
                  : "border-transparent text-slate-500 hover:text-slate-800"
              }`}
            >
              <Icon className="w-4 h-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* TAB 1: RECOMMENDATIONS & MULTI-UNIT MATCHER */}
      {activeTab === "recommendations" && (
        <div className="space-y-6">
          <div className="border-b border-slate-100 pb-3">
            <h3 className="text-lg font-bold text-navy-900">Algorithmically Matched Franchises</h3>
            <p className="text-xs text-slate-500">
              Ranked according to your liquid capital, target territories, industry focus, and multi-unit capacity.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {recommendations.map((item, idx) => {
              const f = item.franchise;
              return (
                <div
                  key={f._id || idx}
                  className="bg-white rounded-2xl border border-slate-200 p-6 flex flex-col justify-between shadow-sm hover:shadow-md transition-shadow"
                >
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-blue-700 bg-blue-50 px-2.5 py-1 rounded-md">
                        {f.industry}
                      </span>
                      <div className="flex items-center gap-1 text-xs font-extrabold text-amber-600 bg-amber-50 px-2.5 py-1 rounded-full border border-amber-200">
                        <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                        <span>{item.matchScore}% Match</span>
                      </div>
                    </div>

                    <div>
                      <h4 className="text-lg font-bold text-navy-900">
                        <Link href={`/franchises/${f.slug}`} className="hover:text-blue-600">
                          {f.brandName}
                        </Link>
                      </h4>
                      <p className="text-xs text-slate-500 mt-0.5">{f.tagline}</p>
                    </div>

                    <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 text-xs space-y-1.5">
                      <span className="font-semibold text-slate-700 block">Matching Criteria Breakdown:</span>
                      <div className="grid grid-cols-2 gap-1 text-[11px]">
                        <span className={item.matchDetails?.budgetMatch ? "text-emerald-700" : "text-slate-400"}>
                          ✓ Budget Capacity
                        </span>
                        <span className={item.matchDetails?.locationMatch ? "text-emerald-700" : "text-slate-400"}>
                          ✓ Territory Alignment
                        </span>
                        <span className={item.matchDetails?.industryMatch ? "text-emerald-700" : "text-slate-400"}>
                          ✓ Industry Match
                        </span>
                        <span className={item.matchDetails?.modelTypeMatch ? "text-emerald-700" : "text-slate-400"}>
                          ✓ Unit Format
                        </span>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-xs pt-1">
                      <div>
                        <span className="text-slate-400 block font-medium">Est. Capital</span>
                        <span className="font-bold text-navy-900 mt-0.5 block">
                          {formatCurrency(f.totalInvestmentMin)}
                        </span>
                      </div>
                      <div>
                        <span className="text-slate-400 block font-medium">Royalty</span>
                        <span className="font-bold text-navy-900 mt-0.5 block">{f.royaltyPercentage}%</span>
                      </div>
                    </div>
                  </div>

                  <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between">
                    <Link
                      href={`/franchises/${f.slug}`}
                      className="text-xs font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1"
                    >
                      View Dossier & Apply &rarr;
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB: SMART WEIGHTED INVESTOR MATCHING */}
      {activeTab === "matching" && (
        <div className="space-y-6">
          <div className="bg-gradient-to-r from-navy-950 to-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 text-white space-y-4 shadow-xl">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-amber-400">
                  Algorithmic Compatibility Engine
                </span>
                <h3 className="text-2xl font-bold mt-1">Multi-Factor Investor Fit Scorer</h3>
                <p className="text-xs text-slate-300 mt-1 max-w-2xl">
                  Evaluates 6 weighted criteria: Budget Range (30%), Expansion Geography (20%), Sector Alignment (20%), Operating Experience (10%), Target Units (10%), and Launch Timeline (10%).
                </p>
              </div>
              <div className="flex items-center gap-2 self-start sm:self-auto">
                <span className="px-3 py-1.5 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/30 text-xs font-bold">
                  {smartMatches.length} Opportunities Analyzed
                </span>
              </div>
            </div>

            {/* Criteria Weights Bar */}
            <div className="grid grid-cols-2 sm:grid-cols-6 gap-2 pt-2 border-t border-slate-800 text-[11px]">
              <div className="bg-slate-900/80 p-2 rounded-xl text-center border border-slate-800">
                <span className="text-slate-400 block text-[10px]">Budget</span>
                <span className="text-white font-bold font-mono">30%</span>
              </div>
              <div className="bg-slate-900/80 p-2 rounded-xl text-center border border-slate-800">
                <span className="text-slate-400 block text-[10px]">Territory</span>
                <span className="text-white font-bold font-mono">20%</span>
              </div>
              <div className="bg-slate-900/80 p-2 rounded-xl text-center border border-slate-800">
                <span className="text-slate-400 block text-[10px]">Sector</span>
                <span className="text-white font-bold font-mono">20%</span>
              </div>
              <div className="bg-slate-900/80 p-2 rounded-xl text-center border border-slate-800">
                <span className="text-slate-400 block text-[10px]">Experience</span>
                <span className="text-white font-bold font-mono">10%</span>
              </div>
              <div className="bg-slate-900/80 p-2 rounded-xl text-center border border-slate-800">
                <span className="text-slate-400 block text-[10px]">Units</span>
                <span className="text-white font-bold font-mono">10%</span>
              </div>
              <div className="bg-slate-900/80 p-2 rounded-xl text-center border border-slate-800">
                <span className="text-slate-400 block text-[10px]">Timeline</span>
                <span className="text-white font-bold font-mono">10%</span>
              </div>
            </div>
          </div>

          {/* Matches List */}
          <div className="space-y-4">
            {smartMatches.map((item, idx) => {
              const f = item.listing;
              const analysis = item.matchAnalysis;
              return (
                <div
                  key={idx}
                  className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-7 space-y-5 shadow-sm hover:shadow-md transition"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
                    <div className="flex items-center gap-4">
                      <img
                        src={f?.heroImageUrl || "https://images.unsplash.com/photo-1554118811-1e0d58224f24"}
                        alt={f?.brandName}
                        className="w-16 h-16 rounded-2xl object-cover border border-slate-200 shadow-sm"
                      />
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="text-lg font-bold text-navy-900">{f?.brandName}</h4>
                          <span className="text-xs px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 font-semibold">
                            {f?.industry}
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 mt-0.5">
                          Investment: <span className="font-semibold text-slate-800">{formatCurrency(f?.investmentRange?.min)} - {formatCurrency(f?.investmentRange?.max)}</span> • Space: {f?.spaceRequiredSqFt?.min}-{f?.spaceRequiredSqFt?.max} sq.ft
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 self-start sm:self-auto">
                      <div className="text-right">
                        <span className="text-[10px] text-slate-400 uppercase font-bold block">Compatibility</span>
                        <div className="text-2xl font-black text-emerald-600 font-mono">
                          {analysis?.totalScore}%
                        </div>
                      </div>
                      <span
                        className={`px-3 py-1 text-xs font-bold rounded-full ${
                          analysis?.introductionStatus === "Priority Introduction"
                            ? "bg-amber-100 text-amber-800 border border-amber-300"
                            : "bg-emerald-100 text-emerald-800 border border-emerald-300"
                        }`}
                      >
                        {analysis?.introductionStatus}
                      </span>
                    </div>
                  </div>

                  {/* Matched Criteria vs Unmatched */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                    <div className="space-y-1.5">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-700 flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Matched Criteria:
                      </span>
                      <ul className="space-y-1 pl-4">
                        {(analysis?.matchedCriteria || []).map((m: string, mIdx: number) => (
                          <li key={mIdx} className="text-slate-600 list-disc">{m}</li>
                        ))}
                      </ul>
                    </div>

                    {analysis?.unmatchedCriteria && analysis.unmatchedCriteria.length > 0 && (
                      <div className="space-y-1.5">
                        <span className="text-[11px] font-bold uppercase tracking-wider text-amber-700 flex items-center gap-1">
                          <AlertCircle className="w-3.5 h-3.5 text-amber-600" /> Review Notes:
                        </span>
                        <ul className="space-y-1 pl-4">
                          {analysis.unmatchedCriteria.map((u: string, uIdx: number) => (
                            <li key={uIdx} className="text-slate-500 list-disc">{u}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                    <div className="flex items-center gap-2 text-xs text-slate-400">
                      <Shield className="w-4 h-4 text-emerald-600" />
                      <span>FDD disclosure ready • Verified audited financials</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Link
                        href={`/franchises/${f?.slug}`}
                        className="px-4 py-2 rounded-xl text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 transition"
                      >
                        Brand Details
                      </Link>
                      <Link
                        href="/deal-room"
                        className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-blue-600 hover:bg-blue-500 transition shadow-sm flex items-center gap-1.5"
                      >
                        Enter Deal Room <ArrowRight className="w-3.5 h-3.5" />
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB: 13-PILLAR DUE DILIGENCE CHECKLIST */}
      {activeTab === "due_diligence" && (
        <div className="space-y-6">
          <div className="bg-white rounded-3xl border border-slate-200 p-8 shadow-sm space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-6">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-blue-600">
                  Investor Risk Assurance
                </span>
                <h3 className="text-2xl font-bold text-navy-900 mt-1">
                  13-Category Franchise Due Diligence Checklist
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  Comprehensive legal, financial, operational, and intellectual property audits verified prior to capital commitment.
                </p>
              </div>
              <div className="text-right">
                <span className="text-xs text-slate-400 block font-medium">Audit Verification Rate</span>
                <div className="text-3xl font-extrabold text-emerald-600 font-mono">
                  100% Verified
                </div>
              </div>
            </div>

            {/* Checklist Items */}
            <div className="divide-y divide-slate-100">
              {[
                { title: "1. Corporate Incorporation & MOA/AOA", cat: "Corporate Entity", status: "Verified", note: "MCA registry checked. Clean director master records." },
                { title: "2. Trademark Registration & Class 43/35 Protection", cat: "Intellectual Property", status: "Verified", note: "Registered under Class 43 (Services) & Class 30 (Packaged). Valid until 2033." },
                { title: "3. Audited Financial Statements (Last 3 Years)", cat: "Financial Audits", status: "Verified", note: "Independent CA audited P&L confirms positive operational EBITDA." },
                { title: "4. Litigation & Dispute Disclosures", cat: "Litigation", status: "Verified", note: "Zero pending commercial court or arbitration claims." },
                { title: "5. Unit Economics & Item 19 FPR Breakdown", cat: "Unit Economics", status: "Verified", note: "Certified historical sales and food/labor costs per unit disclosed." },
                { title: "6. Franchise Disclosure Document (23 Items)", cat: "FDD Compliance", status: "Verified", note: "2026 Master FDD packet certified by legal counsel." },
                { title: "7. Centralized Vendor & Supply Chain SLAs", cat: "Supply Chain", status: "Verified", note: "Active procurement contracts guaranteeing wholesale margin consistency." },
                { title: "8. Standard Operating Procedures (SOP Manuals)", cat: "Operations", status: "Verified", note: "85-page comprehensive SOP manual uploaded with video training modules." },
                { title: "9. Master & Unit Franchise Agreement Structure", cat: "Legal Agreement", status: "Verified", note: "Clear 5-year renewable territory exclusivity provisions." },
                { title: "10. Real Estate & Site Selection Guidelines", cat: "Real Estate", status: "Verified", note: "Footfall benchmarks and carpet area specifications established." },
                { title: "11. Public Liability & Asset Insurance Standards", cat: "Insurance", status: "Verified", note: "Commercial general liability policy requirements appended." },
                { title: "12. Royalty Escrow & Marketing Fund Accountability", cat: "Escrow & Royalties", status: "Verified", note: "Brand marketing fund utilization audited annually." },
                { title: "13. Resale, Transfer Rights & Buyback Clauses", cat: "Exit Strategy", status: "Verified", note: "Structured 30-day franchisor right of first refusal." },
              ].map((item, idx) => (
                <div key={idx} className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                      <h4 className="text-sm font-bold text-navy-900">{item.title}</h4>
                      <span className="text-[10px] font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                        {item.cat}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 pl-6">{item.note}</p>
                  </div>

                  <div className="pl-6 sm:pl-0">
                    <span className="px-2.5 py-1 text-xs font-bold rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                      {item.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: MY APPLICATIONS */}
      {activeTab === "applications" && (
        <div className="space-y-6">
          <div className="border-b border-slate-100 pb-3">
            <h3 className="text-lg font-bold text-navy-900">Submitted Franchise Applications</h3>
            <p className="text-xs text-slate-500">Track real-time brokerage deal progression and founder reviews</p>
          </div>

          <div className="space-y-4">
            {applications.length === 0 ? (
              <div className="bg-white p-8 rounded-2xl border border-slate-200 text-center text-sm text-slate-500">
                You haven't submitted any franchise applications yet. Explore the marketplace to begin.
              </div>
            ) : (
              applications.map((app) => (
                <div key={app._id} className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4 shadow-sm">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                    <div>
                      <h4 className="text-base font-bold text-navy-900">
                        Brand: {app.franchise?.brandName || "Franchise Opportunity"}
                      </h4>
                      <span className="text-xs text-slate-500">
                        Target: {app.proposedLocationCity} • {app.unitsInterested} Unit(s)
                      </span>
                    </div>
                    <StatusBadge status={app.status} />
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
                    <div>
                      <span className="text-slate-400 block font-medium">Pledged Budget</span>
                      <span className="font-bold text-navy-900 mt-0.5 block">
                        {formatCurrency(app.investmentBudget)}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-400 block font-medium">Liquid Reserve</span>
                      <span className="font-bold text-navy-900 mt-0.5 block">
                        {formatCurrency(app.availableLiquidCapital)}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-400 block font-medium">Expected Timeline</span>
                      <span className="font-bold text-navy-900 mt-0.5 block capitalize">
                        {app.timeline?.replace(/_/g, " ")}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-400 block font-medium">Submitted Date</span>
                      <span className="font-bold text-navy-900 mt-0.5 block">{formatDate(app.createdAt)}</span>
                    </div>
                  </div>

                  {/* Status Timeline */}
                  <div className="bg-slate-50 p-4 rounded-xl space-y-2 border border-slate-100 text-xs">
                    <span className="font-bold text-slate-700 block uppercase tracking-wider text-[11px]">
                      Deal Progress History:
                    </span>
                    <div className="space-y-1.5">
                      {app.statusHistory?.map((step: any, idx: number) => (
                        <div key={idx} className="flex items-center gap-2 text-slate-600">
                          <CheckCircle2 className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                          <span className="font-semibold capitalize">{step.status?.replace(/_/g, " ")}</span>
                          <span className="text-slate-400 text-[11px]">— {step.note || "Updated"}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* TAB: FDD LEGAL DISCLOSURE FACILITY */}
      {activeTab === "fdd_facility" && (
        <div className="space-y-6">
          {/* Header Banner */}
          <div className="bg-gradient-to-r from-[#070B14] to-blue-950 p-6 sm:p-8 rounded-3xl border border-slate-800 text-white shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-2 max-w-2xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 border border-blue-400/30 text-[11px] font-bold">
                <Shield className="w-3.5 h-3.5 text-blue-400" />
                Institutional Regulatory Compliance
              </div>
              <h2 className="text-2xl font-extrabold tracking-tight text-white">
                Franchise Disclosure Document (FDD & FIM) Facility
              </h2>
              <p className="text-xs text-slate-300 leading-relaxed font-normal">
                Access statutory US FTC 23-Item disclosure packages, audited Item 19 Financial Performance Representations (FPR),
                territorial exclusivity covenants, and formal franchise agreements verified by platform legal counsel.
              </p>
            </div>

            {/* Jurisdiction Filter */}
            <div className="flex flex-wrap items-center gap-2 shrink-0">
              {["ALL", "GLOBAL", "US", "IN"].map((jur) => (
                <button
                  key={jur}
                  onClick={() => setSelectedJurisdiction(jur)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all border ${
                    selectedJurisdiction === jur
                      ? "bg-amber-400 text-slate-950 border-amber-300 shadow-md"
                      : "bg-white/10 text-slate-300 border-white/10 hover:bg-white/20"
                  }`}
                >
                  {jur === "ALL" ? "All Standards" : jur === "US" ? "US FTC (23 Items)" : jur === "IN" ? "India FIM" : jur}
                </button>
              ))}
            </div>
          </div>

          {/* FDD Documents Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {fddPackages
              .filter((doc) => selectedJurisdiction === "ALL" || doc.jurisdiction === selectedJurisdiction)
              .map((doc) => (
                <div
                  key={doc._id}
                  className="bg-white rounded-3xl border border-slate-200/90 p-6 space-y-5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
                >
                  <div className="space-y-4">
                    {/* Brand & Document Type Header */}
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-2xl bg-slate-900 border border-slate-100 shadow-sm overflow-hidden shrink-0">
                          <img
                            src={doc.business?.logoUrl || "https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=200&auto=format&fit=crop&q=80"}
                            alt={doc.business?.businessName}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div>
                          <div className="flex items-center gap-1.5">
                            <h4 className="text-base font-bold text-navy-900">{doc.business?.businessName}</h4>
                            <BadgeCheck className="w-4 h-4 text-blue-500" />
                          </div>
                          <span className="text-xs text-amber-700 font-semibold">{doc.business?.category}</span>
                        </div>
                      </div>

                      <div className="text-right">
                        <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-md bg-blue-50 text-blue-800 border border-blue-200 block">
                          {doc.jurisdiction === "US" ? "FTC 23 Items" : doc.jurisdiction === "IN" ? "India FIM" : "Global Master FDD"}
                        </span>
                        <span className="text-[10px] text-slate-400 mt-0.5 block">Version {doc.version}.0</span>
                      </div>
                    </div>

                    {/* Document Title */}
                    <div>
                      <h5 className="text-sm font-bold text-navy-900 flex items-center gap-1.5">
                        <FileText className="w-4 h-4 text-rose-500" />
                        {doc.title}
                      </h5>
                      <p className="text-xs text-slate-500 mt-0.5">
                        Original Document: {doc.originalFileName || "franchise_disclosure_document.pdf"}
                      </p>
                    </div>

                    {/* Statutory Disclosures Checked */}
                    {doc.complianceChecklist?.length > 0 && (
                      <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-100 space-y-2 text-xs">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                          Verified Legal Covenants:
                        </span>
                        <div className="space-y-1.5">
                          {doc.complianceChecklist.map((c: any, idx: number) => (
                            <div key={idx} className="flex items-start gap-2 text-slate-700 text-xs">
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                              <span>{c.clause}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Legal Review Notes */}
                    {doc.legalReviewNotes && (
                      <div className="bg-emerald-50/70 p-3 rounded-xl border border-emerald-200 text-xs text-emerald-800 flex items-start gap-2">
                        <Shield className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                        <span>
                          <strong>Legal Counsel Audit:</strong> {doc.legalReviewNotes}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Actions & Download */}
                  <div className="pt-4 border-t border-slate-100 space-y-3">
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-1.5 text-emerald-600 font-semibold text-[11px]">
                        <Lock className="w-3.5 h-3.5" /> Mutual NDA On File
                      </div>
                      <Link
                        href={`/franchises/${doc.business?.slug}`}
                        className="text-xs font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1"
                      >
                        View Brand Dossier &rarr;
                      </Link>
                    </div>

                    <a
                      href={doc.storageKey?.startsWith("http") ? doc.storageKey : `http://localhost:5000${doc.storageKey}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-xs py-2.5 px-4 rounded-xl shadow-md transition-all flex items-center justify-center gap-2"
                    >
                      <Download className="w-4 h-4" />
                      Download Official FDD Document (PDF)
                    </a>
                  </div>
                </div>
              ))}
          </div>

          {fddPackages.length === 0 && (
            <div className="bg-white p-12 rounded-3xl border border-slate-200 text-center space-y-3">
              <Scale className="w-10 h-10 text-slate-300 mx-auto" />
              <h4 className="text-base font-bold text-navy-900">No FDD Packages Found</h4>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                No legal disclosure packets are currently published under the selected jurisdiction filter.
              </p>
            </div>
          )}
        </div>
      )}

      {/* TAB 3: SAVED FRANCHISES */}
      {activeTab === "saved" && (
        <div className="space-y-6">
          <div className="border-b border-slate-100 pb-3">
            <h3 className="text-lg font-bold text-navy-900">Saved Franchise Opportunities</h3>
            <p className="text-xs text-slate-500">Franchises bookmarked for review and capital allocation</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {savedFranchises.map((s) => {
              const f = s.franchise;
              if (!f) return null;
              return (
                <div key={s._id} className="bg-white rounded-2xl border border-slate-200 p-6 space-y-3 shadow-sm">
                  <span className="text-xs font-bold text-blue-700 bg-blue-50 px-2.5 py-0.5 rounded">
                    {f.industry}
                  </span>
                  <h4 className="text-base font-bold text-navy-900">{f.brandName}</h4>
                  <p className="text-xs text-slate-500 line-clamp-2">{f.summary}</p>
                  <div className="pt-2 flex justify-between items-center text-xs">
                    <span className="font-bold text-navy-900">{formatCurrency(f.totalInvestmentMin)}</span>
                    <Link href={`/franchises/${f.slug}`} className="text-blue-600 font-bold hover:underline">
                      View Details &rarr;
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 4: INVESTMENT CRITERIA PROFILE */}
      {activeTab === "profile" && (
        <div className="bg-white rounded-2xl border border-slate-200 p-8 space-y-6 shadow-sm max-w-2xl">
          <div className="border-b border-slate-100 pb-3">
            <h3 className="text-lg font-bold text-navy-900">Your Investment Criteria Profile</h3>
            <p className="text-xs text-slate-500">
              Update parameters to calibrate our multi-unit matching algorithms
            </p>
          </div>

          <form onSubmit={handleSaveProfile} className="space-y-4 text-xs">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Primary Base City *</label>
                <input
                  type="text"
                  required
                  value={profileForm.city}
                  onChange={(e) => setProfileForm({ ...profileForm, city: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg"
                />
              </div>
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Single or Multi-Unit Intent *</label>
                <select
                  value={profileForm.interestType}
                  onChange={(e) => setProfileForm({ ...profileForm, interestType: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg"
                >
                  <option value="single_unit">Single-Unit Franchise</option>
                  <option value="multi_unit">Multi-Unit Development</option>
                  <option value="area_developer">Area Developer</option>
                  <option value="master_franchise">Master Franchisee</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Investment Budget Max (₹) *</label>
                <input
                  type="number"
                  required
                  value={profileForm.budgetMax}
                  onChange={(e) => setProfileForm({ ...profileForm, budgetMax: parseFloat(e.target.value) || 0 })}
                  className="w-full px-3 py-2 border rounded-lg"
                />
              </div>
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Liquid Capital (₹) *</label>
                <input
                  type="number"
                  required
                  value={profileForm.liquidCapital}
                  onChange={(e) =>
                    setProfileForm({ ...profileForm, liquidCapital: parseFloat(e.target.value) || 0 })
                  }
                  className="w-full px-3 py-2 border rounded-lg"
                />
              </div>
            </div>

            <div>
              <label className="block text-slate-700 font-semibold mb-1">Target Industries (comma separated) *</label>
              <input
                type="text"
                required
                value={profileForm.industries}
                onChange={(e) => setProfileForm({ ...profileForm, industries: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg"
              />
            </div>

            <div>
              <label className="block text-slate-700 font-semibold mb-1">Preferred Locations (comma separated) *</label>
              <input
                type="text"
                required
                value={profileForm.locations}
                onChange={(e) => setProfileForm({ ...profileForm, locations: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg"
              />
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={isSavingProfile}
                className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold px-6 py-2.5 rounded-xl shadow transition-all disabled:opacity-50"
              >
                {isSavingProfile ? "Saving..." : "Save Investment Criteria"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* TAB 5: MEETINGS */}
      {activeTab === "meetings" && (
        <div className="space-y-6">
          <div className="border-b border-slate-100 pb-3">
            <h3 className="text-lg font-bold text-navy-900">Scheduled Brand Discussions</h3>
            <p className="text-xs text-slate-500">Meetings arranged with brand founders and brokerage consultants</p>
          </div>

          <div className="space-y-4">
            {meetings.length === 0 ? (
              <div className="bg-white p-8 rounded-2xl border border-slate-200 text-center text-sm text-slate-500">
                No meetings scheduled at this time.
              </div>
            ) : (
              meetings.map((m) => (
                <div key={m._id} className="bg-white rounded-2xl border border-slate-200 p-6 space-y-3 shadow-sm">
                  <div className="flex items-center justify-between">
                    <h4 className="text-base font-bold text-navy-900">{m.title}</h4>
                    <StatusBadge status={m.status} />
                  </div>
                  <div className="text-xs text-slate-600">📅 {new Date(m.scheduledStartTime).toLocaleString()}</div>
                  <p className="text-xs text-slate-700 bg-slate-50 p-3 rounded-xl border border-slate-100">
                    Agenda: {m.agenda}
                  </p>
                  {m.meetingUrl && (
                    <a
                      href={m.meetingUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-block bg-blue-600 text-white text-xs font-semibold px-4 py-2 rounded-lg"
                    >
                      Join Meeting
                    </a>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
