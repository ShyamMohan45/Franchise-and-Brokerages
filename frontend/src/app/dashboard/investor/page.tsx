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
} from "lucide-react";
import { useAuth } from "@/providers/AuthProvider";
import { api } from "@/lib/api";
import { formatCurrency, formatDate } from "@/lib/utils";
import { StatusBadge } from "@/components/StatusBadge";

export default function InvestorDashboardPage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  const [activeTab, setActiveTab] = useState<"recommendations" | "applications" | "saved" | "profile" | "meetings">("recommendations");
  const [profile, setProfile] = useState<any | null>(null);
  const [recommendations, setRecommendations] = useState<any[]>([]);
  const [applications, setApplications] = useState<any[]>([]);
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
        const [profRes, recRes, appRes, savedRes, meetRes] = await Promise.all([
          api.get<any>("/investors/profile"),
          api.get<any[]>("/investors/recommendations"),
          api.get<any[]>("/applications/my"),
          api.get<any[]>("/franchises/saved"),
          api.get<any[]>("/meetings/my"),
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
        if (savedRes.success && savedRes.data) setSavedFranchises(savedRes.data);
        if (meetRes.success && meetRes.data) setMeetings(meetRes.data);
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
          { id: "recommendations", label: `Recommended Matches (${recommendations.length})`, icon: Sparkles },
          { id: "applications", label: `My Applications (${applications.length})`, icon: Send },
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
