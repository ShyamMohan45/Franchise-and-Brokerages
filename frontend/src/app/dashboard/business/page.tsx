"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Building2,
  TrendingUp,
  FileText,
  Users,
  Calendar,
  Plus,
  CheckCircle2,
  Clock,
  AlertCircle,
  FileCheck2,
  Scale,
  Sparkles,
  ChevronRight,
  ShieldCheck,
} from "lucide-react";
import { useAuth } from "@/providers/AuthProvider";
import { api } from "@/lib/api";
import { formatCurrency, formatDate } from "@/lib/utils";
import { StatusBadge } from "@/components/StatusBadge";

export default function BusinessDashboardPage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  const [activeTab, setActiveTab] = useState<"overview" | "readiness" | "sops" | "legal" | "applications" | "meetings">("overview");
  const [businessData, setBusinessData] = useState<any | null>(null);
  const [assessment, setAssessment] = useState<any | null>(null);
  const [applications, setApplications] = useState<any[]>([]);
  const [sops, setSops] = useState<any[]>([]);
  const [legalDocs, setLegalDocs] = useState<any[]>([]);
  const [meetings, setMeetings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // New SOP Modal state
  const [isSopModalOpen, setIsSopModalOpen] = useState(false);
  const [sopForm, setSopForm] = useState({
    title: "",
    category: "daily_operations",
    summary: "",
    checklist1: "",
    checklist2: "",
    checklist3: "",
  });

  // New Profile Form state
  const [profileForm, setProfileForm] = useState({
    businessName: "",
    category: "Food & Beverage",
    founderName: "",
    contactEmail: "",
    contactPhone: "",
    establishedYear: 2022,
    city: "",
    numberOfOutlets: 2,
    description: "",
    businessModel: "",
    expansionGoals: "",
    estimatedInvestmentMin: 3000000,
    estimatedInvestmentMax: 5000000,
  });
  const [isEditingProfile, setIsEditingProfile] = useState(false);

  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/login");
      return;
    }

    async function loadDashboardData() {
      try {
        setLoading(true);
        const [bizRes, appRes, sopRes, legalRes, meetRes] = await Promise.all([
          api.get<{ business: any; assessment: any }>("/businesses/my"),
          api.get<any[]>("/applications/business"),
          api.get<any[]>("/documents/sop"),
          api.get<any[]>("/documents/legal"),
          api.get<any[]>("/meetings/my"),
        ]);

        if (bizRes.success && bizRes.data) {
          setBusinessData(bizRes.data.business);
          setAssessment(bizRes.data.assessment);
          if (bizRes.data.business) {
            setProfileForm({
              businessName: bizRes.data.business.businessName,
              category: bizRes.data.business.category,
              founderName: bizRes.data.business.founderName,
              contactEmail: bizRes.data.business.contactEmail,
              contactPhone: bizRes.data.business.contactPhone,
              establishedYear: bizRes.data.business.establishedYear,
              city: bizRes.data.business.headquarters?.city || "",
              numberOfOutlets: bizRes.data.business.numberOfOutlets,
              description: bizRes.data.business.description,
              businessModel: bizRes.data.business.businessModel,
              expansionGoals: bizRes.data.business.expansionGoals,
              estimatedInvestmentMin: bizRes.data.business.estimatedInvestmentMin,
              estimatedInvestmentMax: bizRes.data.business.estimatedInvestmentMax,
            });
          }
        }
        if (appRes.success && appRes.data) setApplications(appRes.data);
        if (sopRes.success && sopRes.data) setSops(sopRes.data);
        if (legalRes.success && legalRes.data) setLegalDocs(legalRes.data);
        if (meetRes.success && meetRes.data) setMeetings(meetRes.data);
      } catch (err) {
        console.error("Dashboard fetch error:", err);
      } finally {
        setLoading(false);
      }
    }

    if (user) loadDashboardData();
  }, [user, isLoading, router]);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = {
        ...profileForm,
        headquarters: { city: profileForm.city, country: "India" },
        desiredExpansionCities: [profileForm.city, "Bengaluru", "Mumbai"],
      };
      const res = await api.post("/businesses", payload);
      if (res.success && res.data) {
        setBusinessData(res.data);
        setIsEditingProfile(false);
      }
    } catch (err: any) {
      alert(err.message || "Failed to update profile");
    }
  };

  const handleCreateSop = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!businessData) {
      alert("Please complete business profile first");
      return;
    }

    const checklists = [
      { item: sopForm.checklist1, isMandatory: true, completed: true },
      { item: sopForm.checklist2, isMandatory: true, completed: true },
      { item: sopForm.checklist3, isMandatory: false, completed: false },
    ].filter((c) => c.item.trim() !== "");

    try {
      const res = await api.post("/documents/sop", {
        businessId: businessData._id,
        title: sopForm.title,
        category: sopForm.category,
        summary: sopForm.summary,
        checklists,
      });

      if (res.success && res.data) {
        setSops([res.data, ...sops]);
        setIsSopModalOpen(false);
        setSopForm({
          title: "",
          category: "daily_operations",
          summary: "",
          checklist1: "",
          checklist2: "",
          checklist3: "",
        });
      }
    } catch (err: any) {
      alert(err.message || "Failed to save SOP");
    }
  };

  const handleRunDiagnostic = async () => {
    if (!businessData) return;
    try {
      const res = await api.post("/businesses/readiness", {
        answers: {
          brandStrengthScore: 88,
          brandNotes: "Strong local following and consistent repeat traffic",
          unitEconomicsScore: 84,
          unitEconomicsNotes: "EBITDA margins exceeding 20%",
          sopDocumentationScore: sops.length > 0 ? 82 : 45,
          sopNotes: "Core operational checklists codified",
          legalScore: legalDocs.length > 0 ? 85 : 40,
          legalNotes: "Trademark & disclosure preparation in progress",
          supplyChainScore: 80,
          supplyChainNotes: "Direct vendor supply contracts active",
          trainingScore: 78,
          trainingNotes: "2-week initial onboarding curriculum",
          repeatabilityScore: 86,
          repeatabilityNotes: "Proven across multiple locations",
          expansionCapacityScore: 82,
          expansionNotes: "Advisory team aligned for expansion",
        },
      });

      if (res.success && res.data) {
        setAssessment(res.data);
        setActiveTab("readiness");
      }
    } catch (err: any) {
      alert(err.message || "Failed to run readiness benchmark");
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center space-y-3">
        <div className="inline-block w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
        <p className="text-sm text-slate-500 font-medium">Initializing Business Portal...</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Top Welcome Card */}
      <div className="bg-gradient-to-r from-navy-950 via-navy-900 to-blue-950 text-white rounded-3xl p-8 sm:p-10 border border-slate-800 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-900/60 border border-blue-700/50 text-blue-300 text-xs font-semibold">
            <Building2 className="w-3.5 h-3.5 text-amber-400" />
            Franchisor Expansion Headquarters
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            {businessData?.businessName || "Welcome to Your Business Portal"}
          </h1>
          <p className="text-slate-300 text-xs sm:text-sm max-w-xl">
            Package operational SOPs, maintain FDD legal disclosures, benchmark franchise readiness, and review
            pre-vetted multi-unit investor applications.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={handleRunDiagnostic}
            className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold px-5 py-2.5 rounded-xl text-xs shadow-md transition-all flex items-center gap-1.5"
          >
            <Sparkles className="w-4 h-4" />
            Recalculate Readiness Index
          </button>
          <button
            onClick={() => setIsSopModalOpen(true)}
            className="bg-blue-600 hover:bg-blue-500 text-white font-bold px-5 py-2.5 rounded-xl text-xs shadow-md transition-all flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            Add SOP Document
          </button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex border-b border-slate-200 overflow-x-auto gap-2 text-xs font-semibold">
        {[
          { id: "overview", label: "Executive Overview", icon: TrendingUp },
          { id: "readiness", label: "Franchise Readiness Index", icon: Sparkles },
          { id: "sops", label: `SOP Manuals (${sops.length})`, icon: FileText },
          { id: "legal", label: `Legal FDD (${legalDocs.length})`, icon: Scale },
          { id: "applications", label: `Investor Enquiries (${applications.length})`, icon: Users },
          { id: "meetings", label: `Advisory Meetings (${meetings.length})`, icon: Calendar },
        ].map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 py-3 px-4 border-b-2 transition-all whitespace-nowrap ${
                activeTab === tab.id
                  ? "border-blue-600 text-blue-600 bg-blue-50/50 rounded-t-lg"
                  : "border-transparent text-slate-500 hover:text-slate-800"
              }`}
            >
              <Icon className="w-4 h-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* TAB 1: EXECUTIVE OVERVIEW */}
      {activeTab === "overview" && (
        <div className="space-y-8">
          {/* Key Metric Tiles */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-2">
              <span className="text-xs font-medium text-slate-400 uppercase">Readiness Score</span>
              <div className="text-3xl font-extrabold text-navy-900 flex items-center gap-2">
                {assessment?.overallScore || businessData?.readinessScore || 85}
                <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                  / 100
                </span>
              </div>
              <p className="text-[11px] text-slate-500">Benchmark across 8 expansion dimensions</p>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-2">
              <span className="text-xs font-medium text-slate-400 uppercase">Investor Applications</span>
              <div className="text-3xl font-extrabold text-navy-900">{applications.length}</div>
              <p className="text-[11px] text-slate-500">Submitted by vetted multi-unit operators</p>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-2">
              <span className="text-xs font-medium text-slate-400 uppercase">Codified SOPs</span>
              <div className="text-3xl font-extrabold text-navy-900">{sops.length}</div>
              <p className="text-[11px] text-slate-500">Approved operational checklists</p>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-2">
              <span className="text-xs font-medium text-slate-400 uppercase">Approval Status</span>
              <div>
                <StatusBadge status={businessData?.approvalStatus || "approved"} />
              </div>
              <p className="text-[11px] text-slate-500">Brokerage listing compliance</p>
            </div>
          </div>

          {/* Business Profile Review & Edit */}
          <div className="bg-white rounded-2xl border border-slate-200 p-8 space-y-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-navy-900">Brand Profile & Expansion Mandate</h3>
                <p className="text-xs text-slate-500">Your public and brokerage franchise credentials</p>
              </div>
              <button
                onClick={() => setIsEditingProfile(!isEditingProfile)}
                className="text-xs font-semibold text-blue-600 hover:text-blue-800 border border-blue-200 px-3 py-1.5 rounded-lg"
              >
                {isEditingProfile ? "Cancel" : "Edit Profile"}
              </button>
            </div>

            {isEditingProfile ? (
              <form onSubmit={handleSaveProfile} className="space-y-4 text-xs">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-slate-700 font-medium mb-1">Brand Name *</label>
                    <input
                      type="text"
                      required
                      value={profileForm.businessName}
                      onChange={(e) => setProfileForm({ ...profileForm, businessName: e.target.value })}
                      className="w-full px-3 py-2 border rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-700 font-medium mb-1">Founder / Managing Director *</label>
                    <input
                      type="text"
                      required
                      value={profileForm.founderName}
                      onChange={(e) => setProfileForm({ ...profileForm, founderName: e.target.value })}
                      className="w-full px-3 py-2 border rounded-lg"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-slate-700 font-medium mb-1">Headquarters City *</label>
                    <input
                      type="text"
                      required
                      value={profileForm.city}
                      onChange={(e) => setProfileForm({ ...profileForm, city: e.target.value })}
                      className="w-full px-3 py-2 border rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-700 font-medium mb-1">Current Outlets *</label>
                    <input
                      type="number"
                      required
                      min={1}
                      value={profileForm.numberOfOutlets}
                      onChange={(e) => setProfileForm({ ...profileForm, numberOfOutlets: parseInt(e.target.value) || 1 })}
                      className="w-full px-3 py-2 border rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-700 font-medium mb-1">Established Year *</label>
                    <input
                      type="number"
                      required
                      value={profileForm.establishedYear}
                      onChange={(e) =>
                        setProfileForm({ ...profileForm, establishedYear: parseInt(e.target.value) || 2020 })
                      }
                      className="w-full px-3 py-2 border rounded-lg"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-slate-700 font-medium mb-1">Business Description *</label>
                  <textarea
                    rows={3}
                    required
                    value={profileForm.description}
                    onChange={(e) => setProfileForm({ ...profileForm, description: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-medium mb-1">Expansion Goals *</label>
                  <textarea
                    rows={2}
                    required
                    value={profileForm.expansionGoals}
                    onChange={(e) => setProfileForm({ ...profileForm, expansionGoals: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg"
                  />
                </div>

                <div className="pt-2">
                  <button type="submit" className="bg-blue-600 text-white font-bold px-6 py-2 rounded-lg text-xs">
                    Save Profile Changes
                  </button>
                </div>
              </form>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 text-xs text-slate-600">
                <div className="bg-slate-50 p-4 rounded-xl">
                  <span className="text-slate-400 block font-medium">Founder</span>
                  <span className="font-bold text-navy-900 text-sm mt-0.5 block">{businessData?.founderName}</span>
                </div>
                <div className="bg-slate-50 p-4 rounded-xl">
                  <span className="text-slate-400 block font-medium">Headquarters</span>
                  <span className="font-bold text-navy-900 text-sm mt-0.5 block">
                    {businessData?.headquarters?.city}, {businessData?.headquarters?.country}
                  </span>
                </div>
                <div className="bg-slate-50 p-4 rounded-xl">
                  <span className="text-slate-400 block font-medium">Operating Units</span>
                  <span className="font-bold text-navy-900 text-sm mt-0.5 block">
                    {businessData?.numberOfOutlets} Existing Outlets
                  </span>
                </div>
                <div className="bg-slate-50 p-4 rounded-xl sm:col-span-2 lg:col-span-3">
                  <span className="text-slate-400 block font-medium mb-1">Expansion Targets</span>
                  <p className="text-slate-700 text-sm leading-relaxed">{businessData?.expansionGoals}</p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 2: FRANCHISE READINESS INDEX */}
      {activeTab === "readiness" && (
        <div className="space-y-8">
          <div className="bg-white rounded-3xl border border-slate-200 p-8 shadow-sm space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-6">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-blue-600">
                  Diagnostic Benchmark
                </span>
                <h2 className="text-2xl font-bold text-navy-900 mt-1">The 8 Pillars of Franchise Readiness</h2>
                <p className="text-xs text-slate-500 mt-1">
                  Evaluated on financial repeatability, documentation integrity, and management capacity.
                </p>
              </div>
              <div className="text-center sm:text-right">
                <div className="text-4xl font-extrabold text-navy-900">
                  {assessment?.overallScore || 88}
                  <span className="text-sm font-semibold text-slate-400">/100</span>
                </div>
                <StatusBadge status={assessment?.status || "certified_ready"} />
              </div>
            </div>

            {/* 8 Pillars Progress Bars */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
              {[
                { name: "Brand Strength & Market Differentiation", key: "brandStrength", score: 92 },
                { name: "Unit Economics & Store Margins", key: "unitEconomics", score: 90 },
                { name: "SOP Codification & Operations Manuals", key: "sopDocumentation", score: 85 },
                { name: "Legal FDD Disclosures & IP Protection", key: "legalAndIpReadiness", score: 88 },
                { name: "Supply Chain & Vendor Traceability", key: "supplyChainReadiness", score: 86 },
                { name: "Training Academy & Manager Curriculum", key: "trainingSystemReadiness", score: 84 },
                { name: "Unit Repeatability Across Territories", key: "unitRepeatability", score: 89 },
                { name: "Expansion & Franchisee Support Capacity", key: "expansionCapacity", score: 90 },
              ].map((pillar) => {
                const actualScore = assessment?.pillars?.[pillar.key]?.score || pillar.score;
                return (
                  <div key={pillar.key} className="bg-slate-50 p-4 rounded-xl border border-slate-100 space-y-2">
                    <div className="flex justify-between text-xs font-semibold text-navy-900">
                      <span>{pillar.name}</span>
                      <span className="text-blue-600">{actualScore}%</span>
                    </div>
                    <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full ${
                          actualScore >= 80 ? "bg-emerald-500" : actualScore >= 60 ? "bg-amber-500" : "bg-rose-500"
                        }`}
                        style={{ width: `${actualScore}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Summary Recommendation */}
            <div className="bg-blue-50/70 border border-blue-200 p-6 rounded-2xl space-y-2 text-xs">
              <span className="font-bold text-blue-900 uppercase tracking-wider block">Brokerage Advisory Summary:</span>
              <p className="text-slate-700 text-sm leading-relaxed">
                {assessment?.summaryRecommendation ||
                  "Your business demonstrates strong unit economics, high brand equity, and repeatable operational systems. Approved for multi-unit franchisee investor recruitment."}
              </p>
              <div className="text-[11px] text-slate-500 italic pt-2">
                Notice: {assessment?.disclaimerNotice}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: SOP MANUALS */}
      {activeTab === "sops" && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold text-navy-900">Standard Operating Procedures (SOPs)</h3>
              <p className="text-xs text-slate-500">
                Digital operating manuals ensuring consistent execution across every franchise outlet
              </p>
            </div>
            <button
              onClick={() => setIsSopModalOpen(true)}
              className="bg-blue-600 text-white font-semibold text-xs px-4 py-2 rounded-xl flex items-center gap-1.5 shadow"
            >
              <Plus className="w-4 h-4" />
              New Procedure Manual
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {sops.map((sop) => (
              <div key={sop._id} className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4 shadow-sm">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-blue-50 text-blue-700 capitalize">
                    {sop.category?.replace(/_/g, " ")}
                  </span>
                  <StatusBadge status={sop.status} />
                </div>

                <div>
                  <h4 className="text-base font-bold text-navy-900">{sop.title}</h4>
                  <p className="text-xs text-slate-600 mt-1 leading-relaxed">{sop.summary}</p>
                </div>

                {sop.checklists?.length > 0 && (
                  <div className="space-y-1.5 pt-2 border-t border-slate-100">
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                      Mandatory Checkpoints ({sop.checklists.length}):
                    </span>
                    <ul className="space-y-1 text-xs text-slate-700">
                      {sop.checklists.map((item: any, idx: number) => (
                        <li key={idx} className="flex items-center gap-2">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                          <span>{item.item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                <div className="text-[11px] text-slate-400 pt-2 flex justify-between border-t border-slate-100">
                  <span>Version {sop.version}.0</span>
                  <span>Jurisdiction: {sop.jurisdiction}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 4: LEGAL FDD DISCLOSURES */}
      {activeTab === "legal" && (
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-bold text-navy-900">Legal Disclosures & Franchise Documents</h3>
            <p className="text-xs text-slate-500">
              Jurisdiction-compliant documentation (FDD 23 Items / Franchise Information Memorandums)
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {legalDocs.map((doc) => (
              <div key={doc._id} className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4 shadow-sm">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-indigo-50 text-indigo-700">
                    {doc.documentType?.replace(/_/g, " ")}
                  </span>
                  <StatusBadge status={doc.status} />
                </div>

                <div>
                  <h4 className="text-base font-bold text-navy-900">{doc.title}</h4>
                  <p className="text-xs text-slate-500 mt-0.5">File: {doc.originalFileName}</p>
                </div>

                {doc.complianceChecklist?.length > 0 && (
                  <div className="space-y-1.5 pt-2 border-t border-slate-100">
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                      Verified Clauses:
                    </span>
                    <ul className="space-y-1 text-xs text-slate-700">
                      {doc.complianceChecklist.map((c: any, idx: number) => (
                        <li key={idx} className="flex items-center gap-2">
                          <ShieldCheck className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                          <span>{c.clause}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {doc.legalReviewNotes && (
                  <div className="bg-slate-50 p-3 rounded-lg text-xs text-slate-600 border border-slate-100">
                    <span className="font-bold text-slate-700 block">Counsel Feedback:</span>
                    {doc.legalReviewNotes}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 5: INVESTOR APPLICATIONS */}
      {activeTab === "applications" && (
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-bold text-navy-900">Investor Expansion Applications</h3>
            <p className="text-xs text-slate-500">
              Applications submitted by prospective multi-unit operators for your brand
            </p>
          </div>

          <div className="space-y-4">
            {applications.length === 0 ? (
              <div className="bg-white p-8 rounded-2xl border border-slate-200 text-center text-sm text-slate-500">
                No investor applications received yet. Ensure your franchise listing is published.
              </div>
            ) : (
              applications.map((app) => (
                <div
                  key={app._id}
                  className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                    <div>
                      <span className="text-sm font-bold text-navy-900">
                        Candidate: {app.investorProfile?.fullName || "Verified Investor"}
                      </span>
                      <span className="text-xs text-slate-500 ml-2">({app.proposedLocationCity})</span>
                    </div>
                    <StatusBadge status={app.status} />
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
                    <div>
                      <span className="text-slate-400 block font-medium">Proposed Units</span>
                      <span className="font-bold text-navy-900 mt-0.5 block">{app.unitsInterested} Outlets</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block font-medium">Investment Budget</span>
                      <span className="font-bold text-navy-900 mt-0.5 block">
                        {formatCurrency(app.investmentBudget)}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-400 block font-medium">Liquid Capital</span>
                      <span className="font-bold text-navy-900 mt-0.5 block">
                        {formatCurrency(app.availableLiquidCapital)}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-400 block font-medium">Timeline</span>
                      <span className="font-bold text-navy-900 mt-0.5 block capitalize">
                        {app.timeline?.replace(/_/g, " ")}
                      </span>
                    </div>
                  </div>

                  <div className="bg-slate-50 p-3.5 rounded-xl text-xs text-slate-700">
                    <span className="font-bold text-slate-800 block mb-1">Operating Background:</span>
                    {app.businessBackgroundSummary}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* TAB 6: MEETINGS */}
      {activeTab === "meetings" && (
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-bold text-navy-900">Scheduled Brokerage & Advisory Meetings</h3>
            <p className="text-xs text-slate-500">Consultations with franchise brokers, attorneys, and vetted operators</p>
          </div>

          <div className="space-y-4">
            {meetings.map((m) => (
              <div key={m._id} className="bg-white rounded-2xl border border-slate-200 p-6 space-y-3 shadow-sm">
                <div className="flex items-center justify-between">
                  <h4 className="text-base font-bold text-navy-900">{m.title}</h4>
                  <StatusBadge status={m.status} />
                </div>
                <div className="text-xs text-slate-600 flex items-center gap-4">
                  <span>📅 {new Date(m.scheduledStartTime).toLocaleString()}</span>
                  <span>Duration: 45 Mins</span>
                </div>
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
                    Join Video Conference
                  </a>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* New SOP Modal */}
      {isSopModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-8 shadow-2xl border border-slate-200 space-y-6">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <h3 className="text-lg font-bold text-navy-900">Create SOP Document</h3>
              <button
                onClick={() => setIsSopModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 text-lg font-bold"
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleCreateSop} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-700 font-medium mb-1">Document Title *</label>
                <input
                  type="text"
                  required
                  value={sopForm.title}
                  onChange={(e) => setSopForm({ ...sopForm, title: e.target.value })}
                  placeholder="e.g. Daily Barista Calibration & Opening Checklist"
                  className="w-full px-3 py-2 border rounded-lg"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-medium mb-1">Operational Category *</label>
                <select
                  value={sopForm.category}
                  onChange={(e) => setSopForm({ ...sopForm, category: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg"
                >
                  <option value="daily_operations">Daily Operations</option>
                  <option value="employee_training">Employee Training</option>
                  <option value="customer_service">Customer Service</option>
                  <option value="inventory_management">Inventory Management</option>
                  <option value="quality_control">Quality Control</option>
                  <option value="health_and_safety">Health & Safety</option>
                  <option value="opening_closing_procedures">Opening & Closing</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-700 font-medium mb-1">Executive Summary *</label>
                <textarea
                  rows={2}
                  required
                  value={sopForm.summary}
                  onChange={(e) => setSopForm({ ...sopForm, summary: e.target.value })}
                  placeholder="Summary of the process and standards expected..."
                  className="w-full px-3 py-2 border rounded-lg"
                />
              </div>

              <div className="space-y-2">
                <label className="block text-slate-700 font-medium">Checklist Verification Items:</label>
                <input
                  type="text"
                  placeholder="1. First mandatory checkpoint..."
                  value={sopForm.checklist1}
                  onChange={(e) => setSopForm({ ...sopForm, checklist1: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg"
                />
                <input
                  type="text"
                  placeholder="2. Second checkpoint..."
                  value={sopForm.checklist2}
                  onChange={(e) => setSopForm({ ...sopForm, checklist2: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg"
                />
                <input
                  type="text"
                  placeholder="3. Third checkpoint..."
                  value={sopForm.checklist3}
                  onChange={(e) => setSopForm({ ...sopForm, checklist3: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsSopModalOpen(false)}
                  className="px-4 py-2 rounded-lg bg-slate-100 text-slate-600 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold"
                >
                  Save SOP Manual
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
