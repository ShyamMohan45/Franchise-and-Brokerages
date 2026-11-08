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
  Lock,
  ArrowRight,
  ChevronRight,
  X,
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
  const [submittedRef, setSubmittedRef] = useState<string | null>(null);
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
      const res = await api.post<any>("/applications", {
        franchiseId: listing._id,
        ...appForm,
      });

      if (res.success && res.data) {
        setSubmittedRef(res.data.referenceNumber || null);
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
      <div className="bg-[#F8FAFC] min-h-screen py-24 text-center space-y-4">
        <div className="inline-block w-8 h-8 border-4 border-[#315EFB] border-t-transparent rounded-full animate-spin" />
        <p className="text-sm text-[#64748B] font-medium">Loading franchise profile & audit records...</p>
      </div>
    );
  }

  if (error || !listing) {
    return (
      <div className="bg-[#F8FAFC] min-h-screen py-20">
        <div className="max-w-xl mx-auto px-4 surface-card p-10 text-center space-y-4">
          <AlertCircle className="w-12 h-12 text-rose-500 mx-auto" />
          <h2 className="text-2xl font-bold text-[#14243A]">Franchise Not Found</h2>
          <p className="text-sm text-[#64748B]">
            The franchise listing requested is unlisted or currently undergoing audit review.
          </p>
          <Link href="/franchises" className="btn-primary py-2.5 px-6 text-sm inline-flex">
            Return to Marketplace
          </Link>
        </div>
      </div>
    );
  }

  const galleryList = [listing.bannerUrl, ...(listing.galleryImages || [])].filter(Boolean);

  return (
    <div className="bg-[#F8FAFC] min-h-screen py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Breadcrumb Navigation */}
        <div className="flex items-center gap-2 text-xs font-medium text-[#64748B]">
          <Link href="/franchises" className="hover:text-[#315EFB] flex items-center gap-1 transition-colors">
            <ArrowLeft className="w-3.5 h-3.5" />
            Marketplace
          </Link>
          <span>/</span>
          <span className="text-[#64748B]">{listing.industry}</span>
          <span>/</span>
          <span className="text-[#14243A] font-semibold">{listing.brandName}</span>
        </div>

        {/* Hero Showcase Header Card */}
        <div className="surface-card overflow-hidden">
          <div className="relative h-64 sm:h-80 w-full bg-[#14243A]">
            <img
              src={
                activePhoto ||
                listing.bannerUrl ||
                "https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=1600&auto=format&fit=crop&q=80"
              }
              alt={listing.brandName}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#14243A]/90 via-[#14243A]/40 to-transparent" />

            {/* Floating Brand Header */}
            <div className="absolute bottom-0 left-0 right-0 p-6 sm:p-8 text-white flex flex-col md:flex-row md:items-end justify-between gap-6">
              <div className="flex items-start gap-4 sm:gap-5">
                <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl bg-white p-1 shadow-lg overflow-hidden shrink-0 border border-white/20">
                  <img
                    src={
                      listing.logoUrl ||
                      "https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=200&auto=format&fit=crop&q=80"
                    }
                    alt={listing.brandName}
                    className="w-full h-full object-cover rounded-lg"
                  />
                </div>
                <div className="space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded-md bg-[#315EFB] text-[11px] font-bold text-white">
                      {listing.industry}
                    </span>
                    <StatusBadge status={listing.status} />
                    <span className="text-xs text-slate-300">
                      Est. {listing.business?.establishedYear || 2020}
                    </span>
                  </div>
                  <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white flex items-center gap-2">
                    {listing.brandName}
                    <BadgeCheck className="w-5 h-5 text-[#6092FB]" />
                  </h1>
                  <p className="text-xs sm:text-sm text-slate-200">{listing.tagline}</p>
                </div>
              </div>

              <div className="flex items-center gap-3 shrink-0">
                <button
                  onClick={() => setIsModalOpen(true)}
                  className="btn-primary py-3 px-6 text-sm font-semibold shadow-md"
                >
                  <Send className="w-4 h-4 mr-1" />
                  Apply for Franchise
                </button>
                <button
                  onClick={handleToggleSave}
                  className={`p-3 rounded-xl text-xs font-semibold flex items-center justify-center transition-colors border ${
                    isSaved
                      ? "bg-amber-400 text-[#14243A] border-amber-300"
                      : "bg-white/10 hover:bg-white/20 text-white border-white/20 backdrop-blur-sm"
                  }`}
                  title="Save Opportunity"
                >
                  <Bookmark className={`w-4 h-4 ${isSaved ? "fill-[#14243A]" : ""}`} />
                </button>
              </div>
            </div>
          </div>

          {/* Gallery Thumbnails Strip */}
          {galleryList.length > 1 && (
            <div className="p-4 bg-white border-t border-[#E7ECF2] flex items-center gap-3 overflow-x-auto">
              {galleryList.map((photo, idx) => (
                <button
                  key={idx}
                  onClick={() => setActivePhoto(photo)}
                  className={`h-16 w-24 rounded-lg overflow-hidden shrink-0 border-2 transition-all ${
                    activePhoto === photo
                      ? "border-[#315EFB] shadow-sm"
                      : "border-transparent opacity-60 hover:opacity-100"
                  }`}
                >
                  <img src={photo} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Executive Financial Highlights Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
          <div className="surface-card p-5 space-y-1">
            <span className="text-[10px] uppercase font-bold text-[#64748B]">Total Investment</span>
            <p className="text-base sm:text-lg font-bold text-[#14243A]">
              {formatCurrency(listing.totalInvestmentMin)} - {formatCurrency(listing.totalInvestmentMax)}
            </p>
            <span className="text-[11px] text-[#64748B]">Turnkey store setup</span>
          </div>

          <div className="surface-card p-5 space-y-1">
            <span className="text-[10px] uppercase font-bold text-[#64748B]">Initial Franchise Fee</span>
            <p className="text-base sm:text-lg font-bold text-[#14243A]">
              {formatCurrency(listing.initialFranchiseFee)}
            </p>
            <span className="text-[11px] text-[#64748B]">Per outlet license</span>
          </div>

          <div className="surface-card p-5 space-y-1">
            <span className="text-[10px] uppercase font-bold text-[#64748B]">Ongoing Royalty</span>
            <p className="text-base sm:text-lg font-bold text-[#14243A]">
              {listing.royaltyPercentage}%
            </p>
            <span className="text-[11px] text-[#64748B]">On monthly gross sales</span>
          </div>

          <div className="surface-card p-5 space-y-1">
            <span className="text-[10px] uppercase font-bold text-[#64748B]">Est. Payback (ROI)</span>
            <p className="text-base sm:text-lg font-bold text-[#159D8B]">
              ~{listing.estimatedRoiMonths} Months
            </p>
            <span className="text-[11px] text-[#64748B]">Historical store average</span>
          </div>

          <div className="surface-card p-5 space-y-1 col-span-2 sm:col-span-1">
            <span className="text-[10px] uppercase font-bold text-[#64748B]">Model Format</span>
            <p className="text-base sm:text-lg font-bold text-[#14243A] capitalize">
              {listing.franchiseModelType?.replace("_", " ")}
            </p>
            <span className="text-[11px] text-[#64748B]">Single & Multi-Unit Area</span>
          </div>
        </div>

        {/* Main Grid: Details & Specifications */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left 2 Columns: Concept Story, Operations, FDD */}
          <div className="lg:col-span-2 space-y-8">
            {/* Brand Concept & Story */}
            <div className="surface-card p-7 space-y-4">
              <h2 className="text-lg font-bold text-[#14243A] flex items-center gap-2">
                <Building2 className="w-5 h-5 text-[#315EFB]" />
                Brand Story & Business Model
              </h2>
              <div className="text-sm text-[#14243A] leading-relaxed whitespace-pre-line">
                {listing.brandStory}
              </div>
              <div className="bg-[#F8FAFC] p-4 rounded-xl border border-[#E7ECF2] text-xs text-[#64748B] leading-relaxed mt-4">
                <strong className="text-[#14243A]">Executive Summary:</strong> {listing.summary}
              </div>
            </div>

            {/* Infrastructure & Facility Specs */}
            <div className="surface-card p-7 space-y-6">
              <h2 className="text-lg font-bold text-[#14243A] flex items-center gap-2">
                <Layers className="w-5 h-5 text-[#315EFB]" />
                Store Infrastructure & Operations
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div className="bg-[#F8FAFC] p-4 rounded-xl border border-[#E7ECF2] space-y-1">
                  <span className="text-[#64748B] uppercase font-semibold text-[10px]">
                    Commercial Floor Space
                  </span>
                  <p className="font-bold text-[#14243A] text-base">
                    {listing.commercialSpaceMinSqFt} - {listing.commercialSpaceMaxSqFt} Sq Ft
                  </p>
                  <span className="text-[#64748B]">Prime high street or commercial mall</span>
                </div>

                <div className="bg-[#F8FAFC] p-4 rounded-xl border border-[#E7ECF2] space-y-1">
                  <span className="text-[#64748B] uppercase font-semibold text-[10px]">
                    Store Headcount
                  </span>
                  <p className="font-bold text-[#14243A] text-base">
                    {listing.staffRequiredMin} - {listing.staffRequiredMax} Employees per Outlet
                  </p>
                  <span className="text-[#64748B]">Trained via standardized SOP manual</span>
                </div>

                <div className="bg-[#F8FAFC] p-4 rounded-xl border border-[#E7ECF2] space-y-1">
                  <span className="text-[#64748B] uppercase font-semibold text-[10px]">
                    Initial Training Duration
                  </span>
                  <p className="font-bold text-[#14243A] text-base">
                    {listing.trainingDurationWeeks} Weeks
                  </p>
                  <span className="text-[#64748B]">Classroom + on-site outlet shadowing</span>
                </div>

                <div className="bg-[#F8FAFC] p-4 rounded-xl border border-[#E7ECF2] space-y-1">
                  <span className="text-[#64748B] uppercase font-semibold text-[10px]">
                    Marketing Co-Op Fund
                  </span>
                  <p className="font-bold text-[#14243A] text-base">
                    {listing.marketingFeePercentage}%
                  </p>
                  <span className="text-[#64748B]">National & regional brand campaigns</span>
                </div>
              </div>

              {/* Support Package */}
              <div className="space-y-3 pt-4 border-t border-[#E7ECF2]">
                <h3 className="font-bold text-[#14243A] text-xs uppercase tracking-wide">
                  Franchisor Support Included:
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {listing.supportProvided?.map((item: string, idx: number) => (
                    <div
                      key={idx}
                      className="flex items-start gap-2.5 text-xs text-[#14243A] bg-[#F8FAFC] p-3 rounded-lg border border-[#E7ECF2]"
                    >
                      <CheckCircle2 className="w-4 h-4 text-[#159D8B] shrink-0 mt-0.5" />
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Ideal Partner Profile */}
            <div className="surface-card p-7 space-y-3">
              <h2 className="text-lg font-bold text-[#14243A] flex items-center gap-2">
                <Users className="w-5 h-5 text-[#315EFB]" />
                Ideal Franchisee Profile
              </h2>
              <p className="text-sm text-[#64748B] leading-relaxed">
                {listing.idealFranchiseeProfile}
              </p>
            </div>

            {/* FDD & Legal Disclosure Chamber */}
            <div className="surface-card p-7 space-y-5 bg-white border border-[#BFD3FE]">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#E7ECF2] pb-4">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#315EFB] block">
                    Statutory Legal Packet
                  </span>
                  <h2 className="text-lg font-bold text-[#14243A] flex items-center gap-2 mt-0.5">
                    <Scale className="w-5 h-5 text-[#315EFB]" />
                    Franchise Disclosure Document (FDD Facility)
                  </h2>
                </div>
                <span className="px-3 py-1 rounded-full bg-[#E6F7F5] text-[#159D8B] text-xs font-bold w-fit">
                  ✓ Items 1-23 Audited
                </span>
              </div>

              <p className="text-xs text-[#64748B] leading-relaxed">
                Structured in compliance with international franchise disclosure standards and the Indian Contract Act 1872. All 23 statutory items are audited by FranchiseBridge legal counsel.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="bg-[#F8FAFC] p-3.5 rounded-xl border border-[#E7ECF2] space-y-1">
                  <span className="text-[#14243A] font-bold block">Item 19: Financial Representations</span>
                  <span className="text-[#64748B]">Audited outlet P&L, store EBITDA, and historical payback proof.</span>
                </div>
                <div className="bg-[#F8FAFC] p-3.5 rounded-xl border border-[#E7ECF2] space-y-1">
                  <span className="text-[#14243A] font-bold block">Item 12: Territory Exclusivity</span>
                  <span className="text-[#64748B]">3.5 km contractual radius protection against cannibalization.</span>
                </div>
              </div>

              <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-[#E7ECF2]">
                <div className="text-xs text-[#64748B] flex items-center gap-1.5">
                  <Lock className="w-4 h-4 text-[#315EFB]" />
                  <span>Full PDF unlocked upon mutual NDA acknowledgment</span>
                </div>
                <button
                  onClick={() => setIsModalOpen(true)}
                  className="btn-primary py-2.5 px-5 text-xs font-semibold w-full sm:w-auto"
                >
                  <FileText className="w-3.5 h-3.5 mr-1" />
                  Request Official FDD Package
                </button>
              </div>
            </div>
          </div>

          {/* Right Column: Territories & Actions */}
          <div className="space-y-6">
            {/* Expansion Territories */}
            <div className="surface-card p-6 space-y-4">
              <h3 className="text-sm font-bold text-[#14243A] flex items-center gap-2">
                <MapPin className="w-4 h-4 text-[#315EFB]" />
                Target Expansion Cities
              </h3>
              <p className="text-xs text-[#64748B]">
                Active territories open for multi-unit and single-unit franchise agreements:
              </p>
              <div className="flex flex-wrap gap-2">
                {listing.expansionLocations?.map((loc: string, idx: number) => (
                  <span
                    key={idx}
                    className="px-2.5 py-1 rounded-md bg-[#EFF4FF] text-[#315EFB] text-xs font-medium border border-[#BFD3FE]"
                  >
                    {loc}
                  </span>
                ))}
              </div>
            </div>

            {/* Capex Estimator Callout */}
            <div className="surface-card p-6 space-y-3 bg-[#EFF4FF] border-[#BFD3FE]">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#315EFB]">
                Financial Simulation
              </span>
              <h4 className="text-sm font-bold text-[#14243A]">Calculate Your Territory Capex</h4>
              <p className="text-xs text-[#64748B] leading-relaxed">
                Estimate setup expenses, interior fitouts, working capital, and break-even timeline for this brand.
              </p>
              <Link href="/calculator" className="btn-primary w-full py-2 text-xs font-semibold">
                Open Cost Estimator
              </Link>
            </div>

            {/* Direct Advisor Assistance */}
            <div className="surface-card p-6 space-y-3">
              <h4 className="text-sm font-bold text-[#14243A]">Need Advisory Support?</h4>
              <p className="text-xs text-[#64748B] leading-relaxed">
                Our brokerage team assists with lease negotiations, franchise agreement reviews, and territory mapping.
              </p>
              <Link href="/contact" className="btn-secondary w-full py-2 text-xs font-semibold">
                Speak with Broker
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Application / Due Diligence Request Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-2xl border border-[#E7ECF2] shadow-elevated max-w-lg w-full p-6 space-y-5 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-[#E7ECF2]">
              <div>
                <h3 className="text-lg font-bold text-[#14243A]">Apply for {listing.brandName}</h3>
                <p className="text-xs text-[#64748B]">Direct inquiry to Franchisor and Brokerage desk</p>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-lg text-[#64748B] hover:bg-[#F8FAFC]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {submitSuccess ? (
              <div className="text-center py-6 space-y-4">
                <div className="w-14 h-14 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto border border-emerald-200">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <div className="space-y-1">
                  <h4 className="text-lg font-bold text-[#14243A]">Franchise Enquiry Registered</h4>
                  {submittedRef && (
                    <div className="inline-block bg-slate-100 px-3 py-1 rounded-full text-xs font-mono font-bold text-slate-800 border border-slate-200 mt-1">
                      Ref #{submittedRef}
                    </div>
                  )}
                  <p className="text-xs text-[#64748B] max-w-sm mx-auto pt-2">
                    Your enquiry and territory interest have been recorded in MongoDB. The brokerage advisory team and brand franchisor have been notified.
                  </p>
                </div>
                <div className="flex justify-center gap-3 pt-2">
                  <Link
                    href="/dashboard/investor"
                    className="btn-primary py-2 px-5 text-xs font-semibold"
                  >
                    View Status in Dashboard &rarr;
                  </Link>
                  <button
                    onClick={() => {
                      setIsModalOpen(false);
                      setSubmitSuccess(false);
                    }}
                    className="btn-secondary py-2 px-4 text-xs font-semibold"
                  >
                    Close
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleApplicationSubmit} className="space-y-4 text-xs">
                {submitError && (
                  <div className="p-3 rounded-lg bg-rose-50 text-rose-700 text-xs border border-rose-200">
                    {submitError}
                  </div>
                )}

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="font-semibold text-[#14243A] block mb-1">Target City</label>
                    <input
                      type="text"
                      required
                      value={appForm.proposedLocationCity}
                      onChange={(e) => setAppForm({ ...appForm, proposedLocationCity: e.target.value })}
                      placeholder="e.g. Mumbai"
                      className="w-full p-2.5 rounded-lg border border-[#E7ECF2] focus:outline-none focus:border-[#315EFB]"
                    />
                  </div>
                  <div>
                    <label className="font-semibold text-[#14243A] block mb-1">State / Province</label>
                    <input
                      type="text"
                      required
                      value={appForm.proposedLocationState}
                      onChange={(e) => setAppForm({ ...appForm, proposedLocationState: e.target.value })}
                      placeholder="e.g. Maharashtra"
                      className="w-full p-2.5 rounded-lg border border-[#E7ECF2] focus:outline-none focus:border-[#315EFB]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="font-semibold text-[#14243A] block mb-1">Units Interested</label>
                    <input
                      type="number"
                      min={1}
                      max={20}
                      value={appForm.unitsInterested}
                      onChange={(e) => setAppForm({ ...appForm, unitsInterested: parseInt(e.target.value) || 1 })}
                      className="w-full p-2.5 rounded-lg border border-[#E7ECF2] focus:outline-none focus:border-[#315EFB]"
                    />
                  </div>
                  <div>
                    <label className="font-semibold text-[#14243A] block mb-1">Available Liquid Capital (₹)</label>
                    <input
                      type="number"
                      value={appForm.availableLiquidCapital}
                      onChange={(e) => setAppForm({ ...appForm, availableLiquidCapital: parseInt(e.target.value) || 0 })}
                      className="w-full p-2.5 rounded-lg border border-[#E7ECF2] focus:outline-none focus:border-[#315EFB]"
                    />
                  </div>
                </div>

                <div>
                  <label className="font-semibold text-[#14243A] block mb-1">Your Business Background</label>
                  <textarea
                    rows={3}
                    placeholder="Briefly describe your prior retail, business, or operational management experience..."
                    value={appForm.businessBackgroundSummary}
                    onChange={(e) => setAppForm({ ...appForm, businessBackgroundSummary: e.target.value })}
                    className="w-full p-2.5 rounded-lg border border-[#E7ECF2] focus:outline-none focus:border-[#315EFB]"
                  />
                </div>

                <div className="flex items-start gap-2 pt-2">
                  <input
                    type="checkbox"
                    id="consent"
                    checked={appForm.privacyConsentGiven}
                    onChange={(e) => setAppForm({ ...appForm, privacyConsentGiven: e.target.checked })}
                    className="mt-1"
                  />
                  <label htmlFor="consent" className="text-[#64748B]">
                    I consent to share my verified investment profile and agree to mutual non-disclosure (NDA) terms for confidential FDD access.
                  </label>
                </div>

                <div className="pt-3 border-t border-[#E7ECF2] flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="btn-secondary py-2 px-4 text-xs"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="btn-primary py-2 px-6 text-xs"
                  >
                    {isSubmitting ? "Submitting..." : "Submit Application"}
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
