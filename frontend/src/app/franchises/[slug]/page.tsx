"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  Building2,
  DollarSign,
  MapPin,
  Clock,
  CheckCircle2,
  Bookmark,
  Share2,
  ArrowLeft,
  Briefcase,
  Layers,
  Scale,
  Users,
  AlertCircle,
  FileText,
  Send,
  Sparkles,
  BadgeCheck,
  ShieldCheck,
  TrendingUp,
  Percent,
  Check,
  Info,
} from "lucide-react";
import { api } from "@/lib/api";
import { formatCurrency } from "@/lib/utils";
import { StatusBadge } from "@/components/StatusBadge";
import { useAuth } from "@/providers/AuthProvider";

export default function FranchiseDetailPage() {
  const params = useParams();
  const slug = params?.slug as string;
  const router = useRouter();
  const { user } = useAuth();

  const [listing, setListing] = useState<any | null>(null);
  const [isSaved, setIsSaved] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activePhoto, setActivePhoto] = useState<string | null>(null);

  // Application Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [appForm, setAppForm] = useState({
    proposedLocationCity: "",
    proposedLocationState: "",
    unitsInterested: 1,
    investmentBudget: 5000000,
    availableLiquidCapital: 4000000,
    timeline: "1_to_3_months",
    businessBackgroundSummary: "",
    additionalMessage: "",
    privacyConsentGiven: false,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  useEffect(() => {
    async function loadFranchise() {
      try {
        setLoading(true);
        const res = await api.get<{ listing: any; isSaved: boolean }>(`/franchises/${slug}`);
        if (res.success && res.data) {
          const fetchedListing = res.data.listing;
          setListing(fetchedListing);
          setIsSaved(res.data.isSaved);
          if (fetchedListing?.bannerUrl) {
            setActivePhoto(fetchedListing.bannerUrl);
          }
          setAppForm((prev) => ({
            ...prev,
            investmentBudget: fetchedListing?.totalInvestmentMin || 5000000,
            availableLiquidCapital: fetchedListing?.totalInvestmentMin || 4000000,
          }));
        } else {
          setError("Franchise not found");
        }
      } catch (err: any) {
        setError(err.message || "Failed to load franchise");
      } finally {
        setLoading(false);
      }
    }

    if (slug) loadFranchise();
  }, [slug]);

  const handleToggleSave = async () => {
    if (!user) {
      router.push("/login");
      return;
    }
    if (!listing) return;
    try {
      const res = await api.post<{ isSaved: boolean }>(`/franchises/${listing._id}/save`);
      if (res.success && res.data) {
        setIsSaved(res.data.isSaved);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleApplicationSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      router.push("/login");
      return;
    }
    if (!appForm.privacyConsentGiven) {
      setSubmitError("You must accept the confidentiality disclosure.");
      return;
    }

    setIsSubmitting(true);
    setSubmitError(null);

    try {
      const res = await api.post("/applications", {
        franchiseId: listing._id,
        ...appForm,
      });

      if (res.success) {
        setSubmitSuccess(true);
      } else {
        setSubmitError(res.message || "Submission failed");
      }
    } catch (err: any) {
      setSubmitError(err.message || "Failed to submit application");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-24 text-center space-y-4">
        <div className="inline-block w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
        <p className="text-sm text-slate-500 font-medium">Loading verified franchise dossier...</p>
      </div>
    );
  }

  if (error || !listing) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 text-center space-y-4">
        <AlertCircle className="w-12 h-12 text-rose-500 mx-auto" />
        <h2 className="text-2xl font-bold text-navy-900">Franchise Opportunity Not Found</h2>
        <p className="text-sm text-slate-600">The franchise you requested is either unlisted or unavailable.</p>
        <Link href="/franchises" className="inline-block text-sm font-semibold text-blue-600 hover:underline">
          &larr; Return to Franchise Marketplace
        </Link>
      </div>
    );
  }

  const galleryList = [
    listing.bannerUrl,
    ...(listing.galleryImages || []),
  ].filter(Boolean);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Navigation Breadcrumb */}
      <div className="flex items-center gap-2 text-xs font-medium text-slate-500">
        <Link href="/franchises" className="hover:text-blue-600 flex items-center gap-1">
          <ArrowLeft className="w-3.5 h-3.5" />
          Marketplace
        </Link>
        <span>/</span>
        <span className="text-slate-400">{listing.industry}</span>
        <span>/</span>
        <span className="text-navy-900 font-bold">{listing.brandName}</span>
      </div>

      {/* Hero Showcase Banner */}
      <div className="relative rounded-3xl overflow-hidden bg-slate-900 shadow-xl border border-slate-200/90">
        <div className="relative h-72 sm:h-96 w-full">
          <img
            src={activePhoto || listing.bannerUrl || "https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=1600&auto=format&fit=crop&q=80"}
            alt={listing.brandName}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-black/20" />
        </div>

        {/* Floating Brand Header */}
        <div className="absolute bottom-0 left-0 right-0 p-6 sm:p-10 text-white flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="flex items-start gap-4 sm:gap-6">
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-white p-1 shadow-2xl overflow-hidden shrink-0 border border-white/20">
              <img
                src={listing.logoUrl || "https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=200&auto=format&fit=crop&q=80"}
                alt={listing.brandName}
                className="w-full h-full object-cover rounded-xl"
              />
            </div>
            <div className="space-y-1.5">
              <div className="flex flex-wrap items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-md bg-blue-500/80 backdrop-blur-md text-[11px] font-bold text-white">
                  {listing.industry}
                </span>
                <StatusBadge status={listing.status} />
                <span className="text-xs text-slate-300">
                  Established {listing.business?.establishedYear || 2020}
                </span>
              </div>
              <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-white flex items-center gap-2">
                {listing.brandName}
                <BadgeCheck className="w-5 h-5 text-blue-400" />
              </h1>
              <p className="text-sm text-amber-300 font-semibold">{listing.tagline}</p>
            </div>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={() => setIsModalOpen(true)}
              className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold px-6 py-3.5 rounded-xl shadow-lg transition-all text-xs sm:text-sm flex items-center gap-2"
            >
              <Send className="w-4 h-4" />
              Apply for Franchise
            </button>
            <button
              onClick={handleToggleSave}
              className={`p-3.5 rounded-xl text-xs font-semibold flex items-center justify-center transition-colors border ${
                isSaved
                  ? "bg-amber-400 text-slate-950 border-amber-300"
                  : "bg-white/10 hover:bg-white/20 text-white border-white/20 backdrop-blur-md"
              }`}
              title="Save Opportunity"
            >
              <Bookmark className={`w-4 h-4 ${isSaved ? "fill-slate-950" : ""}`} />
            </button>
          </div>
        </div>
      </div>

      {/* Gallery Thumbnails Strip */}
      {galleryList.length > 1 && (
        <div className="flex items-center gap-3 overflow-x-auto pb-2">
          {galleryList.map((photo, idx) => (
            <button
              key={idx}
              onClick={() => setActivePhoto(photo)}
              className={`h-20 w-32 rounded-xl overflow-hidden shrink-0 border-2 transition-all ${
                activePhoto === photo ? "border-blue-600 scale-105 shadow-md" : "border-transparent opacity-70 hover:opacity-100"
              }`}
            >
              <img src={photo} alt="" className="w-full h-full object-cover" />
            </button>
          ))}
        </div>
      )}

      {/* Executive Financial Highlights Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-sm space-y-1">
          <span className="text-[10px] uppercase font-bold text-slate-400">Total Investment</span>
          <p className="text-base sm:text-lg font-black text-navy-900">
            {formatCurrency(listing.totalInvestmentMin)} - {formatCurrency(listing.totalInvestmentMax)}
          </p>
          <span className="text-[11px] text-slate-500">Turnkey store setup</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-sm space-y-1">
          <span className="text-[10px] uppercase font-bold text-slate-400">Initial Franchise Fee</span>
          <p className="text-base sm:text-lg font-black text-navy-900">
            {formatCurrency(listing.initialFranchiseFee)}
          </p>
          <span className="text-[11px] text-slate-500">Per outlet license</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-sm space-y-1">
          <span className="text-[10px] uppercase font-bold text-slate-400">Ongoing Royalty</span>
          <p className="text-base sm:text-lg font-black text-navy-900">
            {listing.royaltyPercentage}%
          </p>
          <span className="text-[11px] text-slate-500">On monthly gross sales</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-sm space-y-1">
          <span className="text-[10px] uppercase font-bold text-slate-400">Est. Payback (ROI)</span>
          <p className="text-base sm:text-lg font-black text-emerald-600">
            ~{listing.estimatedRoiMonths} Months
          </p>
          <span className="text-[11px] text-slate-500">Based on historical stores</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-sm space-y-1 col-span-2 sm:col-span-1">
          <span className="text-[10px] uppercase font-bold text-slate-400">Model Format</span>
          <p className="text-base sm:text-lg font-black text-navy-900 capitalize">
            {listing.franchiseModelType?.replace("_", " ")}
          </p>
          <span className="text-[11px] text-slate-500">Single & Multi-Unit Area</span>
        </div>
      </div>

      {/* Main Grid: Details & Specifications */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left 2 Columns: Concept Story, Operations & Support */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Brand Story & Concept */}
          <div className="bg-white rounded-3xl border border-slate-200/90 p-8 space-y-4 shadow-sm">
            <h2 className="text-xl font-bold text-navy-900 flex items-center gap-2">
              <Building2 className="w-5 h-5 text-blue-600" />
              Brand Story & Core Concept
            </h2>
            <div className="text-sm text-slate-700 leading-relaxed whitespace-pre-line">
              {listing.brandStory}
            </div>
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 text-xs text-slate-600 leading-relaxed mt-4">
              <strong>Business Summary:</strong> {listing.summary}
            </div>
          </div>

          {/* Infrastructure & Facility Specifications */}
          <div className="bg-white rounded-3xl border border-slate-200/90 p-8 space-y-6 shadow-sm">
            <h2 className="text-xl font-bold text-navy-900 flex items-center gap-2">
              <Layers className="w-5 h-5 text-amber-600" />
              Store Infrastructure & Operational Specs
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 space-y-1">
                <span className="text-slate-400 uppercase font-semibold text-[10px]">Commercial Floor Space</span>
                <p className="font-extrabold text-navy-900 text-base">
                  {listing.commercialSpaceMinSqFt} - {listing.commercialSpaceMaxSqFt} Sq Ft
                </p>
                <span className="text-slate-500">Prime high street or commercial mall</span>
              </div>

              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 space-y-1">
                <span className="text-slate-400 uppercase font-semibold text-[10px]">Store Headcount</span>
                <p className="font-extrabold text-navy-900 text-base">
                  {listing.staffRequiredMin} - {listing.staffRequiredMax} Employees per Outlet
                </p>
                <span className="text-slate-500">Certified through structured academy</span>
              </div>

              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 space-y-1">
                <span className="text-slate-400 uppercase font-semibold text-[10px]">Initial Training Duration</span>
                <p className="font-extrabold text-navy-900 text-base">
                  {listing.trainingDurationWeeks} Weeks
                </p>
                <span className="text-slate-500">Classroom + on-site outlet shadowing</span>
              </div>

              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 space-y-1">
                <span className="text-slate-400 uppercase font-semibold text-[10px]">Marketing Fund Contribution</span>
                <p className="font-extrabold text-navy-900 text-base">
                  {listing.marketingFeePercentage}%
                </p>
                <span className="text-slate-500">National and regional advertising co-op</span>
              </div>
            </div>

            {/* Franchisor Support Package */}
            <div className="space-y-3 pt-4 border-t border-slate-100">
              <h3 className="font-bold text-navy-900 text-sm">Full Franchisor Support Package:</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {listing.supportProvided?.map((item: string, idx: number) => (
                  <div key={idx} className="flex items-start gap-2.5 text-xs text-slate-700 bg-slate-50 p-3 rounded-xl border border-slate-100">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Ideal Franchisee Profile */}
          <div className="bg-white rounded-3xl border border-slate-200/90 p-8 space-y-4 shadow-sm">
            <h2 className="text-xl font-bold text-navy-900 flex items-center gap-2">
              <Users className="w-5 h-5 text-indigo-600" />
              Ideal Franchisee Profile
            </h2>
            <p className="text-sm text-slate-700 leading-relaxed">
              {listing.idealFranchiseeProfile}
            </p>
          </div>

          {/* FDD & Legal Disclosure Facility */}
          <div className="bg-gradient-to-br from-[#0B1220] to-[#070B14] rounded-3xl border border-slate-800 p-8 text-white space-y-6 shadow-xl">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/[0.08] pb-4">
              <div>
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-amber-400 block">
                  Regulatory Legal Packet
                </span>
                <h2 className="text-xl font-bold text-white flex items-center gap-2 mt-0.5">
                  <Scale className="w-5 h-5 text-amber-400" />
                  Franchise Disclosure Document (FDD Facility)
                </h2>
              </div>
              <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-bold w-fit">
                ✓ Items 1-23 Audited
              </span>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              This brand maintains certified legal disclosures structured according to the US FTC 16 CFR Part 436 standards and the Indian Contract Act 1872. All 23 statutory items are audited by FranchiseBridge legal counsel.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="bg-white/[0.04] p-3 rounded-xl border border-white/[0.06] space-y-1">
                <span className="text-amber-400 font-bold block">Item 19: Financial Representations</span>
                <span className="text-slate-400">Audited outlet P&L, store EBITDA, and historical payback proof.</span>
              </div>
              <div className="bg-white/[0.04] p-3 rounded-xl border border-white/[0.06] space-y-1">
                <span className="text-amber-400 font-bold block">Item 12: Territory Exclusivity</span>
                <span className="text-slate-400">3.5 km contractual radius protection against cannibalization.</span>
              </div>
              <div className="bg-white/[0.04] p-3 rounded-xl border border-white/[0.06] space-y-1">
                <span className="text-amber-400 font-bold block">Items 5-7: Transparent Fee Matrix</span>
                <span className="text-slate-400">Fixed franchise fees and turnkey capital schedule with zero hidden rebates.</span>
              </div>
              <div className="bg-white/[0.04] p-3 rounded-xl border border-white/[0.06] space-y-1">
                <span className="text-amber-400 font-bold block">Item 22: Contract Form</span>
                <span className="text-slate-400">Standardized franchise agreement ready for execution.</span>
              </div>
            </div>

            <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-white/[0.08]">
              <span className="text-xs text-slate-400">Full PDF document unlocked upon mutual NDA acknowledgment:</span>
              <button
                onClick={() => setIsModalOpen(true)}
                className="bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs px-5 py-2.5 rounded-xl transition-all shadow-md flex items-center gap-1.5 w-full sm:w-auto justify-center"
              >
                <FileText className="w-3.5 h-3.5" />
                Request Official FDD Package
              </button>
            </div>
          </div>

        </div>

        {/* Right Column: Target Corridors, NDA Shield, & CTA */}
        <div className="space-y-6">
          
          {/* Target Expansion Corridors */}
          <div className="bg-white rounded-3xl border border-slate-200/90 p-6 space-y-4 shadow-sm">
            <h3 className="text-base font-bold text-navy-900 flex items-center gap-2">
              <MapPin className="w-4 h-4 text-blue-600" />
              Target Expansion Cities
            </h3>
            <p className="text-xs text-slate-500">
              The brand is actively allocating protected territories in these metropolitan areas:
            </p>
            <div className="flex flex-wrap gap-2">
              {listing.expansionLocations?.map((loc: string) => (
                <span
                  key={loc}
                  className="px-3 py-1 rounded-xl bg-blue-50 text-blue-800 text-xs font-bold border border-blue-100"
                >
                  {loc}
                </span>
              ))}
            </div>
          </div>

          {/* Privacy & Confidentiality Shield Box */}
          <div className="bg-[#0B1220] rounded-3xl p-6 text-white space-y-4 border border-slate-800 shadow-md">
            <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold">
              <ShieldCheck className="w-4 h-4" />
              Institutional Privacy Protocol
            </div>
            <h4 className="text-sm font-bold text-white">
              Protected Inquiry Process
            </h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Your contact details and financial suitability are strictly encrypted until your application is reviewed and a mutual Non-Disclosure Agreement (NDA) is executed.
            </p>
            <button
              onClick={() => setIsModalOpen(true)}
              className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-xs py-3 rounded-xl shadow-md transition-all flex items-center justify-center gap-1.5"
            >
              <Send className="w-3.5 h-3.5" />
              Request Verified Dossier & NDA
            </button>
          </div>

          {/* Headquarters Info */}
          <div className="bg-white rounded-3xl border border-slate-200/90 p-6 space-y-3 shadow-sm text-xs text-slate-600">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100 font-bold text-navy-900">
              <span>Corporate Headquarters</span>
              <Building2 className="w-4 h-4 text-slate-400" />
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Location:</span>
              <span className="font-semibold text-slate-800">
                {listing.business?.headquarters?.city}, {listing.business?.headquarters?.state || "India"}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Total Operating Outlets:</span>
              <span className="font-semibold text-slate-800">
                {listing.business?.numberOfOutlets || 4} Outlets
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Annual Revenue Range:</span>
              <span className="font-semibold text-emerald-700">
                {listing.business?.annualRevenueRange || "Disclosed under NDA"}
              </span>
            </div>
          </div>

        </div>

      </div>

      {/* APPLICATION MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-8 space-y-6 shadow-2xl border border-slate-100 my-8">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600">Confidential Application</span>
                <h3 className="text-lg font-bold text-navy-900">Apply for {listing.brandName}</h3>
              </div>
              <button
                onClick={() => {
                  setIsModalOpen(false);
                  setSubmitSuccess(false);
                  setSubmitError(null);
                }}
                className="text-slate-400 hover:text-slate-600 text-lg font-bold p-1"
              >
                ✕
              </button>
            </div>

            {submitSuccess ? (
              <div className="text-center py-8 space-y-4">
                <div className="w-14 h-14 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-inner">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <h4 className="text-xl font-bold text-navy-900">Application Submitted!</h4>
                <p className="text-xs text-slate-600 max-w-md mx-auto leading-relaxed">
                  Your confidential franchise application and NDA request have been logged with the brokerage team.
                  We will review your territory parameters and reach out within 24 business hours.
                </p>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="bg-navy-900 text-white font-bold text-xs px-6 py-2.5 rounded-xl hover:bg-slate-800 transition-colors"
                >
                  Close Window
                </button>
              </div>
            ) : (
              <form onSubmit={handleApplicationSubmit} className="space-y-4 text-xs">
                {submitError && (
                  <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl">
                    {submitError}
                  </div>
                )}

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-700 font-bold mb-1">Proposed City *</label>
                    <input
                      type="text"
                      required
                      value={appForm.proposedLocationCity}
                      onChange={(e) => setAppForm({ ...appForm, proposedLocationCity: e.target.value })}
                      placeholder="e.g. Bengaluru"
                      className="w-full p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-700 font-bold mb-1">Proposed State *</label>
                    <input
                      type="text"
                      required
                      value={appForm.proposedLocationState}
                      onChange={(e) => setAppForm({ ...appForm, proposedLocationState: e.target.value })}
                      placeholder="e.g. Karnataka"
                      className="w-full p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-blue-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-700 font-bold mb-1">Units Interested *</label>
                    <input
                      type="number"
                      min={1}
                      max={20}
                      value={appForm.unitsInterested}
                      onChange={(e) => setAppForm({ ...appForm, unitsInterested: parseInt(e.target.value) || 1 })}
                      className="w-full p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-700 font-bold mb-1">Timeline *</label>
                    <select
                      value={appForm.timeline}
                      onChange={(e) => setAppForm({ ...appForm, timeline: e.target.value })}
                      className="w-full p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-blue-500 font-medium"
                    >
                      <option value="immediate">Immediate (&lt; 30 Days)</option>
                      <option value="1_to_3_months">1 - 3 Months</option>
                      <option value="3_to_6_months">3 - 6 Months</option>
                      <option value="more_than_6_months">6+ Months</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-700 font-bold mb-1">Total Investment Budget (₹) *</label>
                    <input
                      type="number"
                      value={appForm.investmentBudget}
                      onChange={(e) => setAppForm({ ...appForm, investmentBudget: parseInt(e.target.value) || 0 })}
                      className="w-full p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-700 font-bold mb-1">Available Liquid Capital (₹) *</label>
                    <input
                      type="number"
                      value={appForm.availableLiquidCapital}
                      onChange={(e) => setAppForm({ ...appForm, availableLiquidCapital: parseInt(e.target.value) || 0 })}
                      className="w-full p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-blue-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1">Business & Operator Background *</label>
                  <textarea
                    rows={2}
                    required
                    value={appForm.businessBackgroundSummary}
                    onChange={(e) => setAppForm({ ...appForm, businessBackgroundSummary: e.target.value })}
                    placeholder="Briefly describe your business, retail, or hospitality operating background..."
                    className="w-full p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-blue-500 text-xs"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1">Additional Notes / Preferred Location</label>
                  <textarea
                    rows={2}
                    value={appForm.additionalMessage}
                    onChange={(e) => setAppForm({ ...appForm, additionalMessage: e.target.value })}
                    placeholder="Specify target neighborhood, existing commercial property access, etc."
                    className="w-full p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-blue-500 text-xs"
                  />
                </div>

                <div className="pt-2 flex items-start gap-2.5">
                  <input
                    type="checkbox"
                    id="consent"
                    checked={appForm.privacyConsentGiven}
                    onChange={(e) => setAppForm({ ...appForm, privacyConsentGiven: e.target.checked })}
                    className="mt-1 rounded text-blue-600 focus:ring-blue-500"
                  />
                  <label htmlFor="consent" className="text-[11px] text-slate-500 leading-relaxed">
                    I agree to keep all disclosed FDD financial statements, territory covenants, and operational recipes strictly confidential under mutual NDA.
                  </label>
                </div>

                <div className="pt-3 flex items-center justify-end gap-3 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-bold hover:bg-slate-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold px-6 py-2.5 rounded-xl shadow-md transition-all disabled:opacity-50"
                  >
                    {isSubmitting ? "Submitting..." : "Submit Confidential Application"}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
