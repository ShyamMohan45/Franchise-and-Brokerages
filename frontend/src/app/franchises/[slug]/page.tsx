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
      setSubmitError("You must accept the privacy and confidentiality disclosure.");
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
      <div className="max-w-6xl mx-auto px-4 py-16 text-center space-y-4">
        <div className="inline-block w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
        <p className="text-sm text-slate-500 font-medium">Loading franchise dossier...</p>
      </div>
    );
  }

  if (error || !listing) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 text-center space-y-4">
        <AlertCircle className="w-12 h-12 text-rose-500 mx-auto" />
        <h2 className="text-2xl font-bold text-navy-900">Franchise Listing Not Found</h2>
        <p className="text-sm text-slate-600">The franchise you requested is either unlisted or unavailable.</p>
        <Link href="/franchises" className="inline-block text-sm font-semibold text-blue-600 hover:underline">
          &larr; Return to Franchise Marketplace
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      {/* Navigation Breadcrumb */}
      <div className="flex items-center gap-2 text-xs font-medium text-slate-500">
        <Link href="/franchises" className="hover:text-blue-600 flex items-center gap-1">
          <ArrowLeft className="w-3.5 h-3.5" />
          Marketplace
        </Link>
        <span>/</span>
        <span className="text-slate-400">{listing.industry}</span>
        <span>/</span>
        <span className="text-navy-900 font-semibold">{listing.brandName}</span>
      </div>

      {/* Hero Header Card */}
      <div className="bg-white rounded-3xl border border-slate-200 p-8 sm:p-10 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-3 max-w-2xl">
          <div className="flex flex-wrap items-center gap-2.5">
            <span className="text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-md bg-blue-50 text-blue-700">
              {listing.industry}
            </span>
            <StatusBadge status={listing.status} />
            <span className="text-xs text-slate-400">Established {listing.business?.establishedYear || 2020}</span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-extrabold text-navy-900 tracking-tight">{listing.brandName}</h1>
          <p className="text-base text-amber-700 font-semibold">{listing.tagline}</p>
          <p className="text-sm text-slate-600 leading-relaxed">{listing.summary}</p>
        </div>

        <div className="flex flex-col sm:flex-row md:flex-col gap-3 shrink-0">
          <button
            onClick={() => setIsModalOpen(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-6 py-3.5 rounded-xl shadow-md transition-all text-sm flex items-center justify-center gap-2"
          >
            <Send className="w-4 h-4" />
            Apply for Franchise
          </button>

          <button
            onClick={handleToggleSave}
            className={`border px-5 py-2.5 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-colors ${
              isSaved
                ? "bg-amber-50 border-amber-300 text-amber-800"
                : "border-slate-300 hover:bg-slate-50 text-slate-700"
            }`}
          >
            <Bookmark className={`w-4 h-4 ${isSaved ? "fill-amber-500 text-amber-500" : ""}`} />
            {isSaved ? "Saved in Portfolio" : "Save Opportunity"}
          </button>
        </div>
      </div>

      {/* Grid: Financials & Operational Specifications */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Comprehensive Dossier */}
        <div className="lg:col-span-2 space-y-8">
          {/* Brand Story */}
          <div className="bg-white rounded-2xl border border-slate-200 p-8 space-y-4 shadow-sm">
            <h2 className="text-xl font-bold text-navy-900 flex items-center gap-2">
              <Building2 className="w-5 h-5 text-blue-600" />
              Brand Story & Core Concept
            </h2>
            <div className="text-sm text-slate-700 leading-relaxed whitespace-pre-line">{listing.brandStory}</div>
          </div>

          {/* Infrastructure & Operations */}
          <div className="bg-white rounded-2xl border border-slate-200 p-8 space-y-6 shadow-sm">
            <h2 className="text-xl font-bold text-navy-900 flex items-center gap-2">
              <Layers className="w-5 h-5 text-amber-600" />
              Operational & Facility Infrastructure
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-sm">
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                <span className="text-slate-400 text-xs uppercase font-medium">Commercial Floor Space</span>
                <p className="font-bold text-navy-900 text-base mt-1">
                  {listing.commercialSpaceMinSqFt} - {listing.commercialSpaceMaxSqFt} Sq Ft
                </p>
                <span className="text-xs text-slate-500">Retail High Street / Mall Corridor</span>
              </div>

              <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                <span className="text-slate-400 text-xs uppercase font-medium">Staffing Requirements</span>
                <p className="font-bold text-navy-900 text-base mt-1">
                  {listing.staffRequiredMin} - {listing.staffRequiredMax} Employees per Outlet
                </p>
                <span className="text-xs text-slate-500">Trained under certified SOPs</span>
              </div>

              <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                <span className="text-slate-400 text-xs uppercase font-medium">Initial Training Duration</span>
                <p className="font-bold text-navy-900 text-base mt-1">{listing.trainingDurationWeeks} Weeks</p>
                <span className="text-xs text-slate-500">Classroom + On-site outlet shadowing</span>
              </div>

              <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                <span className="text-slate-400 text-xs uppercase font-medium">Target Expansion Corridors</span>
                <p className="font-bold text-navy-900 text-base mt-1">
                  {listing.expansionLocations?.slice(0, 4).join(", ")}
                </p>
                <span className="text-xs text-slate-500">Territory exclusivity options available</span>
              </div>
            </div>

            {/* Support Provided */}
            <div className="space-y-3 pt-2">
              <h3 className="font-bold text-navy-900 text-sm">Ongoing Franchisor Support Package:</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-700">
                {listing.supportProvided?.map((item: string, idx: number) => (
                  <div key={idx} className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Ideal Franchisee Profile */}
          <div className="bg-white rounded-2xl border border-slate-200 p-8 space-y-4 shadow-sm">
            <h2 className="text-xl font-bold text-navy-900 flex items-center gap-2">
              <Users className="w-5 h-5 text-indigo-600" />
              Ideal Franchisee Suitability Profile
            </h2>
            <p className="text-sm text-slate-700 leading-relaxed">{listing.idealFranchiseeProfile}</p>
          </div>
        </div>

        {/* Right Column: Financial Disclosures & Economics Card */}
        <div className="space-y-6">
          <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 space-y-6 shadow-sm sticky top-28">
            <div className="border-b border-slate-100 pb-4">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Investment Economics
              </span>
              <div className="text-2xl sm:text-3xl font-extrabold text-navy-900 mt-1">
                {formatCurrency(listing.totalInvestmentMin)} - {formatCurrency(listing.totalInvestmentMax)}
              </div>
              <p className="text-xs text-slate-500 mt-0.5">Estimated total capital required to open</p>
            </div>

            <div className="space-y-3.5 text-xs text-slate-600">
              <div className="flex justify-between py-1.5 border-b border-slate-100">
                <span className="font-medium text-slate-500">Initial Franchise Fee</span>
                <span className="font-bold text-navy-900">{formatCurrency(listing.initialFranchiseFee)}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-100">
                <span className="font-medium text-slate-500">Royalty Fee</span>
                <span className="font-bold text-navy-900">{listing.royaltyPercentage}% of Gross Sales</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-100">
                <span className="font-medium text-slate-500">Marketing & Brand Fund</span>
                <span className="font-bold text-navy-900">{listing.marketingFeePercentage}%</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-100">
                <span className="font-medium text-slate-500">Estimated Payback Period</span>
                <span className="font-bold text-emerald-700">~{listing.estimatedRoiMonths} Months</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-100">
                <span className="font-medium text-slate-500">Franchise Model</span>
                <span className="font-bold text-navy-900 capitalize">
                  {listing.franchiseModelType.replace("_", " ")}
                </span>
              </div>
            </div>

            <button
              onClick={() => setIsModalOpen(true)}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3.5 rounded-xl shadow-md text-sm transition-all"
            >
              Submit Application & Request FDD
            </button>

            <div className="text-[11px] text-slate-400 text-center leading-relaxed">
              Financial estimates are historical representations provided by the franchisor and vetted by FranchiseBridge
              advisors. Actual returns vary by local territory management.
            </div>
          </div>
        </div>
      </div>

      {/* Application Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-lg w-full p-8 shadow-2xl border border-slate-200 my-8 space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <h3 className="text-xl font-bold text-navy-900">Franchise Application</h3>
                <p className="text-xs text-slate-500">Applying for: {listing.brandName}</p>
              </div>
              <button
                onClick={() => {
                  setIsModalOpen(false);
                  setSubmitSuccess(false);
                  setSubmitError(null);
                }}
                className="text-slate-400 hover:text-slate-600 font-bold text-lg p-1"
              >
                &times;
              </button>
            </div>

            {submitSuccess ? (
              <div className="text-center py-6 space-y-4">
                <CheckCircle2 className="w-16 h-16 text-emerald-500 mx-auto" />
                <h4 className="text-lg font-bold text-navy-900">Application Submitted Successfully!</h4>
                <p className="text-xs text-slate-600 max-w-sm mx-auto leading-relaxed">
                  Your application has been registered in the Brokerage Deal Pipeline. Our team will verify your
                  background and facilitate mutual introduction with {listing.brandName}.
                </p>
                <div className="pt-4 flex gap-3 justify-center">
                  <Link
                    href="/dashboard/investor/applications"
                    className="bg-blue-600 text-white text-xs font-semibold px-5 py-2.5 rounded-xl"
                  >
                    Track in Dashboard
                  </Link>
                  <button
                    onClick={() => setIsModalOpen(false)}
                    className="bg-slate-100 text-slate-700 text-xs font-semibold px-5 py-2.5 rounded-xl"
                  >
                    Close
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleApplicationSubmit} className="space-y-4 text-xs">
                {submitError && (
                  <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs">
                    {submitError}
                  </div>
                )}

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-700 font-medium mb-1">Target City *</label>
                    <input
                      type="text"
                      required
                      value={appForm.proposedLocationCity}
                      onChange={(e) => setAppForm({ ...appForm, proposedLocationCity: e.target.value })}
                      placeholder="e.g. Bengaluru"
                      className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-700 font-medium mb-1">Target Units *</label>
                    <input
                      type="number"
                      min={1}
                      max={20}
                      required
                      value={appForm.unitsInterested}
                      onChange={(e) => setAppForm({ ...appForm, unitsInterested: parseInt(e.target.value) || 1 })}
                      className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:border-blue-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-700 font-medium mb-1">Investment Budget (₹) *</label>
                    <input
                      type="number"
                      required
                      value={appForm.investmentBudget}
                      onChange={(e) => setAppForm({ ...appForm, investmentBudget: parseFloat(e.target.value) || 0 })}
                      className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-700 font-medium mb-1">Available Liquid Capital (₹) *</label>
                    <input
                      type="number"
                      required
                      value={appForm.availableLiquidCapital}
                      onChange={(e) =>
                        setAppForm({ ...appForm, availableLiquidCapital: parseFloat(e.target.value) || 0 })
                      }
                      className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:border-blue-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-slate-700 font-medium mb-1">Investment Timeline *</label>
                  <select
                    value={appForm.timeline}
                    onChange={(e) => setAppForm({ ...appForm, timeline: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:border-blue-500"
                  >
                    <option value="immediate">Immediate (&lt; 30 Days)</option>
                    <option value="1_to_3_months">1 to 3 Months</option>
                    <option value="3_to_6_months">3 to 6 Months</option>
                    <option value="6_plus_months">6+ Months Planning</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-700 font-medium mb-1">Business Experience & Background *</label>
                  <textarea
                    rows={3}
                    required
                    value={appForm.businessBackgroundSummary}
                    onChange={(e) => setAppForm({ ...appForm, businessBackgroundSummary: e.target.value })}
                    placeholder="Briefly state your operating experience, past franchises, or real-estate access..."
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div className="flex items-start gap-2 pt-2">
                  <input
                    type="checkbox"
                    id="consent"
                    checked={appForm.privacyConsentGiven}
                    onChange={(e) => setAppForm({ ...appForm, privacyConsentGiven: e.target.checked })}
                    className="mt-0.5 rounded border-slate-300"
                  />
                  <label htmlFor="consent" className="text-[11px] text-slate-500 leading-tight">
                    I verify that all financial representations are accurate, and I consent to brokerage vetting and
                    non-disclosure review before mutual brand introduction.
                  </label>
                </div>

                <div className="pt-3">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl shadow transition-all disabled:opacity-50 text-xs"
                  >
                    {isSubmitting ? "Submitting Application..." : "Confirm & Submit Application"}
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
