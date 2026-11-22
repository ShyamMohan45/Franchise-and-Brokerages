"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Search,
  Filter,
  MapPin,
  Building2,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  SlidersHorizontal,
  Clock,
  CheckCircle2,
  BadgeCheck,
  TrendingUp,
  RotateCcw,
  Scale,
  ArrowRight,
  ShieldCheck,
  AlertTriangle,
  AlertCircle,
  X,
  ShieldAlert,
  Info,
} from "lucide-react";
import { api } from "@/lib/api";
import { formatCurrency } from "@/lib/utils";
import { StatusBadge } from "@/components/StatusBadge";
import { useAuth } from "@/providers/AuthProvider";
import { Bookmark, BookmarkCheck } from "lucide-react";

export interface MarketplaceListingItem {
  _id: string;
  slug: string;
  brandName: string;
  status: string;
  isDemo?: boolean;
  industry: string;
  bannerUrl: string;
  logoUrl: string;
  opportunityTitle: string;
  tagline?: string;
  summary: string;
  businessModel: string;
  totalInvestmentMin: number;
  totalInvestmentMax: number;
  initialFranchiseFee: number;
  estimatedRoiMonths: number;
  targetLocations: string[];
  commercialSpaceMinSqFt: number;
  commercialSpaceMaxSqFt: number;
}

const DEFAULT_MARKETPLACE_LISTINGS: MarketplaceListingItem[] = [
  {
    _id: "demo-roastcraft-1",
    slug: "roastcraft-specialty-coffee",
    brandName: "RoastCraft Specialty Coffee",
    status: "demo",
    isDemo: true,
    industry: "Food & Beverage",
    bannerUrl: "https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=1200&auto=format&fit=crop&q=80",
    logoUrl: "https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=200&auto=format&fit=crop&q=80",
    opportunityTitle: "Flagship High-Volume Cafe & Roastery (Sample Concept)",
    tagline: "Artisanal single-origin specialty coffee roasters with high store gross margins.",
    summary: "Proven turnkey cafe concept with comprehensive barista SOPs, proprietary bean supply chain, and exceptional customer retention. [Sample Showcase Content - Inquiries Disabled]",
    businessModel: "FOFO",
    totalInvestmentMin: 3500000,
    totalInvestmentMax: 5500000,
    initialFranchiseFee: 800000,
    estimatedRoiMonths: 18,
    targetLocations: ["Mumbai", "Pune", "Bengaluru"],
    commercialSpaceMinSqFt: 600,
    commercialSpaceMaxSqFt: 1200,
  },
  {
    _id: "demo-fitpulse-2",
    slug: "fitpulse-24-7-smart-gyms",
    brandName: "FitPulse 24/7 Smart Gyms",
    status: "demo",
    isDemo: true,
    industry: "Health & Wellness",
    bannerUrl: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=1200&auto=format&fit=crop&q=80",
    logoUrl: "https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=200&auto=format&fit=crop&q=80",
    opportunityTitle: "Automated 24/7 Smart Fitness Club (Sample Concept)",
    tagline: "App-enabled, automated 24/7 fitness hubs with biometric turnstiles and low staff overhead.",
    summary: "Ultra-efficient fitness model with keyless RFID access, automated membership billing, and certified trainers on demand. [Sample Showcase Content - Inquiries Disabled]",
    businessModel: "FOCO",
    totalInvestmentMin: 6000000,
    totalInvestmentMax: 9000000,
    initialFranchiseFee: 1200000,
    estimatedRoiMonths: 22,
    targetLocations: ["Bengaluru", "Pune", "Hyderabad"],
    commercialSpaceMinSqFt: 2000,
    commercialSpaceMaxSqFt: 3500,
  },
  {
    _id: "demo-curryleaf-3",
    slug: "curry-leaf-express",
    brandName: "Curry Leaf Express",
    status: "demo",
    isDemo: true,
    industry: "Fast Casual Dining",
    bannerUrl: "https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=1200&auto=format&fit=crop&q=80",
    logoUrl: "https://images.unsplash.com/photo-1610057099443-fde8c4d50f91?w=200&auto=format&fit=crop&q=80",
    opportunityTitle: "Express Coastal South Indian Kitchen (Sample Concept)",
    tagline: "Express South Indian comfort food serving high delivery volumes.",
    summary: "Compact footprint QSR serving authentic dosas, meal boxes, and filter coffee optimized for both high-density footfall and delivery aggregators. [Sample Showcase Content - Inquiries Disabled]",
    businessModel: "FOFO",
    totalInvestmentMin: 2500000,
    totalInvestmentMax: 4000000,
    initialFranchiseFee: 600000,
    estimatedRoiMonths: 15,
    targetLocations: ["Chennai", "Bengaluru", "Hyderabad"],
    commercialSpaceMinSqFt: 350,
    commercialSpaceMaxSqFt: 750,
  },
  {
    _id: "demo-codebloom-4",
    slug: "codebloom-ai-robotics-labs",
    brandName: "CodeBloom AI & Robotics Labs",
    status: "demo",
    isDemo: true,
    industry: "Education & EdTech",
    bannerUrl: "https://images.unsplash.com/photo-1509062522246-3755977927d7?w=1200&auto=format&fit=crop&q=80",
    logoUrl: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=200&auto=format&fit=crop&q=80",
    opportunityTitle: "Next-Gen K-12 STEM & AI Learning Hub (Sample Concept)",
    tagline: "Future-ready experiential coding and robotics academy for school students.",
    summary: "Accredited syllabus with proprietary learning hardware kits, high recurring term tuition fees, and turnkey classroom architecture. [Sample Showcase Content - Inquiries Disabled]",
    businessModel: "FOFO",
    totalInvestmentMin: 2000000,
    totalInvestmentMax: 3500000,
    initialFranchiseFee: 500000,
    estimatedRoiMonths: 14,
    targetLocations: ["Delhi NCR", "Mumbai", "Pune"],
    commercialSpaceMinSqFt: 800,
    commercialSpaceMaxSqFt: 1500,
  },
  {
    _id: "demo-urbanglow-5",
    slug: "urbanglow-luxury-medspa",
    brandName: "UrbanGlow Luxury MedSpa",
    status: "demo",
    isDemo: true,
    industry: "Beauty & Salon",
    bannerUrl: "https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?w=1200&auto=format&fit=crop&q=80",
    logoUrl: "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=200&auto=format&fit=crop&q=80",
    opportunityTitle: "Dermatology & Aesthetic Wellness Clinic (Sample Concept)",
    tagline: "Premium non-invasive clinical aesthetics and physician-supervised skin wellness.",
    summary: "US-FDA approved aesthetic machinery, certified dermatologist protocols, high average ticket size, and recurring client subscriptions. [Sample Showcase Content - Inquiries Disabled]",
    businessModel: "FOCO",
    totalInvestmentMin: 4500000,
    totalInvestmentMax: 7500000,
    initialFranchiseFee: 1000000,
    estimatedRoiMonths: 20,
    targetLocations: ["Mumbai", "Delhi NCR", "Bengaluru"],
    commercialSpaceMinSqFt: 1000,
    commercialSpaceMaxSqFt: 1800,
  },
  {
    _id: "demo-quickbite-6",
    slug: "quickbite-express-kiosks",
    brandName: "QuickBite Express Kiosks",
    status: "demo",
    isDemo: true,
    industry: "Retail",
    bannerUrl: "https://images.unsplash.com/photo-1526367790999-0150786686a2?w=1200&auto=format&fit=crop&q=80",
    logoUrl: "https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=200&auto=format&fit=crop&q=80",
    opportunityTitle: "Compact Automated Retail & Beverage Kiosk (Sample Concept)",
    tagline: "High-density grab-and-go automated retail kiosk for transit and corporate hubs.",
    summary: "Low space requirement, zero cooking ventilation needed, high-margin beverage and snack assortment with cloud telemetry. [Sample Showcase Content - Inquiries Disabled]",
    businessModel: "FOFO",
    totalInvestmentMin: 1500000,
    totalInvestmentMax: 2500000,
    initialFranchiseFee: 350000,
    estimatedRoiMonths: 12,
    targetLocations: ["Pan-India", "Metro Stations", "Tech Parks"],
    commercialSpaceMinSqFt: 100,
    commercialSpaceMaxSqFt: 250,
  },
];

export default function FranchisesMarketplacePage() {
  const { user } = useAuth();
  const [listings, setListings] = useState<any[]>(DEFAULT_MARKETPLACE_LISTINGS);
  const [loading, setLoading] = useState(true);
  const [apiError, setApiError] = useState<string | null>(null);
  const [isUsingShowcase, setIsUsingShowcase] = useState(true);
  const [demoNoticeModal, setDemoNoticeModal] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [industry, setIndustry] = useState("All");
  const [modelType, setModelType] = useState("All");
  const [locationFilter, setLocationFilter] = useState("All");
  const [budgetFilter, setBudgetFilter] = useState("All");
  const [sort, setSort] = useState("recent");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(DEFAULT_MARKETPLACE_LISTINGS.length);
  const [savedIds, setSavedIds] = useState<Set<string>>(new Set());
  const [compareIds, setCompareIds] = useState<string[]>([]);

  // Load saved bookmarks if logged in
  useEffect(() => {
    async function loadSaved() {
      if (!user) return;
      try {
        const res = await api.get<any[]>("/franchises/saved");
        if (res.success && res.data) {
          const ids = new Set<string>(res.data.map((item: any) => item.franchise?._id || item.franchise));
          setSavedIds(ids);
        }
      } catch (err) {
        console.error("Failed to load saved franchises", err);
      }
    }
    loadSaved();
  }, [user]);

  const fetchListings = async () => {
    setLoading(true);
    setApiError(null);
    try {
      let minInvestment: number | undefined;
      let maxInvestment: number | undefined;

      if (budgetFilter === "under_25l") {
        maxInvestment = 2500000;
      } else if (budgetFilter === "25l_50l") {
        minInvestment = 2500000;
        maxInvestment = 5000000;
      } else if (budgetFilter === "50l_1cr") {
        minInvestment = 5000000;
        maxInvestment = 10000000;
      } else if (budgetFilter === "above_1cr") {
        minInvestment = 10000000;
      }

      const queryParams: any = {
        search: searchTerm,
        industry,
        modelType,
        sort,
        page,
        limit: 9,
      };

      if (locationFilter && locationFilter !== "All") {
        queryParams.location = locationFilter;
      }
      if (minInvestment !== undefined) queryParams.minInvestment = minInvestment;
      if (maxInvestment !== undefined) queryParams.maxInvestment = maxInvestment;

      const res = await api.get<any[]>("/franchises", queryParams);

      if (!res.success) {
        // Distinct API error response
        setApiError(res.message || "Failed to load listings from the platform service.");
        setIsUsingShowcase(false);
        setListings([]);
        setTotalCount(0);
        setTotalPages(1);
        return;
      }

      // Priority 1: Published database records always take precedence
      if (res.data && res.data.length > 0) {
        setIsUsingShowcase(false);
        setListings(res.data);
        if (res.meta) {
          setTotalPages(res.meta.totalPages || 1);
          setTotalCount(res.meta.total || res.data.length);
        } else {
          setTotalPages(1);
          setTotalCount(res.data.length);
        }
      } else {
        // Empty API response (0 published records returned from database)
        const hasCustomFilters = Boolean(
          (searchTerm && searchTerm.trim()) ||
          (industry && industry !== "All") ||
          (modelType && modelType !== "All") ||
          (locationFilter && locationFilter !== "All") ||
          (budgetFilter && budgetFilter !== "All")
        );

        if (hasCustomFilters) {
          // Legitimate empty search result when user enters restrictive filters
          setIsUsingShowcase(false);
          setListings([]);
          setTotalCount(0);
          setTotalPages(1);
        } else {
          // Platform currently has 0 approved published listings in database
          setIsUsingShowcase(true);
          setListings(DEFAULT_MARKETPLACE_LISTINGS);
          setTotalPages(1);
          setTotalCount(DEFAULT_MARKETPLACE_LISTINGS.length);
        }
      }
    } catch (err: any) {
      console.error("API connection error:", err);
      // Distinctly handle network / server exceptions
      setApiError(err.message || "Unable to reach the FranchiseBridge listing server. Please check connection.");
      setIsUsingShowcase(false);
      setListings([]);
      setTotalCount(0);
      setTotalPages(1);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchListings();
  }, [industry, modelType, locationFilter, budgetFilter, sort, page]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchListings();
  };

  const handleToggleSave = async (id: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (id.startsWith("demo-")) {
      setDemoNoticeModal(
        "Bookmarks are disabled for sample showcase opportunities. Real bookmarks can only be saved for verified, administrator-approved franchises."
      );
      return;
    }
    if (!user) {
      alert("Please login as an investor to bookmark opportunities");
      return;
    }
    try {
      const res = await api.post<{ isSaved: boolean }>(`/franchises/${id}/save`);
      if (res.success && res.data) {
        setSavedIds((prev) => {
          const next = new Set(prev);
          if (res.data!.isSaved) next.add(id);
          else next.delete(id);
          return next;
        });
      }
    } catch (err: any) {
      alert(err.message || "Failed to toggle bookmark");
    }
  };

  const handleDemoEnquiryClick = (brandName: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDemoNoticeModal(
      `"${brandName}" is a demonstration showcase concept provided for platform preview. Real franchise inquiries, capital commitments, NDA execution, and deal rooms cannot be initiated on demo listings.`
    );
  };

  const toggleCompare = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setCompareIds((prev) => {
      if (prev.includes(id)) return prev.filter((item) => item !== id);
      if (prev.length >= 3) {
        alert("You can compare up to 3 franchise brands simultaneously");
        return prev;
      }
      return [...prev, id];
    });
  };

  const industries = [
    "All",
    "Food & Beverage",
    "Retail",
    "Health & Wellness",
    "Education & EdTech",
    "Beauty & Salon",
    "Fast Casual Dining",
  ];

  return (
    <div className="bg-[#F8FAFC] min-h-screen py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Marketplace Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-[#E7ECF2] pb-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#EFF4FF] border border-[#BFD3FE] text-[#315EFB] text-xs font-semibold">
              <ShieldCheck className="w-3.5 h-3.5 text-[#315EFB]" />
              Institutional Franchise Directory
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-[#14243A] tracking-tight">
              Franchise Opportunities Marketplace
            </h1>
            <p className="text-[#64748B] text-sm max-w-2xl leading-relaxed">
              Explore audited franchise opportunities with verified unit economics, standardized operational SOPs, and multi-unit territory exclusivity.
            </p>
          </div>

          <div className="flex items-center gap-3">
            {compareIds.length > 0 && (
              <Link
                href="/compare"
                className="bg-emerald-600 hover:bg-emerald-700 text-white py-2.5 px-4 text-xs font-bold rounded-xl shadow transition-colors flex items-center gap-1.5"
              >
                <Scale className="w-4 h-4" />
                Compare ({compareIds.length}) Brands
              </Link>
            )}
            <Link
              href="/compare"
              className="btn-secondary py-2.5 px-4 text-xs font-semibold flex items-center gap-1.5"
            >
              <Scale className="w-4 h-4 text-[#64748B]" />
              Compare Brands
            </Link>
          </div>
        </div>

        {/* Filter & Search Console */}
        <div className="bg-white p-5 rounded-2xl border border-[#E7ECF2] shadow-sm space-y-4">
          <form onSubmit={handleSearchSubmit} className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#64748B]" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by brand name, opportunity title, or category (e.g. Chai, Coffee, Fitness)..."
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[#E7ECF2] text-sm text-[#14243A] placeholder-[#64748B] focus:outline-none focus:border-[#315EFB] bg-white"
              />
            </div>
            <button type="submit" className="btn-primary py-2.5 px-6 text-sm shrink-0">
              <Search className="w-4 h-4 mr-1" />
              Search Directory
            </button>
          </form>

          {/* Industry Filter Pills */}
          <div className="flex flex-wrap items-center gap-1.5 pt-2 text-xs">
            <span className="text-[#64748B] font-semibold mr-1">Industry:</span>
            {industries.map((ind) => (
              <button
                key={ind}
                onClick={() => {
                  setIndustry(ind);
                  setPage(1);
                }}
                className={`px-3 py-1.5 rounded-lg font-semibold transition-colors text-xs ${
                  industry === ind
                    ? "bg-[#14243A] text-white shadow-sm"
                    : "bg-[#F8FAFC] text-[#64748B] hover:text-[#14243A] hover:bg-[#EFF4FF] border border-[#E7ECF2]"
                }`}
              >
                {ind}
              </button>
            ))}
          </div>

          {/* Multi-Dimensional Dropdown Selectors */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-3 border-t border-[#E7ECF2] text-xs">
            {/* Budget Selector */}
            <div>
              <label className="block text-[#64748B] font-medium mb-1">Investment Budget</label>
              <select
                value={budgetFilter}
                onChange={(e) => {
                  setBudgetFilter(e.target.value);
                  setPage(1);
                }}
                className="w-full bg-white border border-[#E7ECF2] text-[#14243A] rounded-lg px-3 py-2 text-xs font-medium focus:outline-none focus:border-[#315EFB]"
              >
                <option value="All">All Investment Budgets</option>
                <option value="under_25l">Under ₹25 Lakhs</option>
                <option value="25l_50l">₹25 Lakhs – ₹50 Lakhs</option>
                <option value="50l_1cr">₹50 Lakhs – ₹1 Crore</option>
                <option value="above_1cr">Above ₹1 Crore</option>
              </select>
            </div>

            {/* Location Selector */}
            <div>
              <label className="block text-[#64748B] font-medium mb-1">Target Geography</label>
              <select
                value={locationFilter}
                onChange={(e) => {
                  setLocationFilter(e.target.value);
                  setPage(1);
                }}
                className="w-full bg-white border border-[#E7ECF2] text-[#14243A] rounded-lg px-3 py-2 text-xs font-medium focus:outline-none focus:border-[#315EFB]"
              >
                <option value="All">All Locations & States</option>
                <option value="Mumbai">Mumbai / Maharashtra</option>
                <option value="Delhi">Delhi NCR</option>
                <option value="Bengaluru">Bengaluru / Karnataka</option>
                <option value="Pune">Pune</option>
                <option value="Hyderabad">Hyderabad / Telangana</option>
                <option value="Chennai">Chennai / Tamil Nadu</option>
              </select>
            </div>

            {/* Model Type Selector */}
            <div>
              <label className="block text-[#64748B] font-medium mb-1">Business Model</label>
              <select
                value={modelType}
                onChange={(e) => {
                  setModelType(e.target.value);
                  setPage(1);
                }}
                className="w-full bg-white border border-[#E7ECF2] text-[#14243A] rounded-lg px-3 py-2 text-xs font-medium focus:outline-none focus:border-[#315EFB]"
              >
                <option value="All">All Business Models</option>
                <option value="FOFO">FOFO (Franchise Owned)</option>
                <option value="FOCO">FOCO (Company Operated)</option>
                <option value="COCO">COCO</option>
                <option value="Master Franchise">Master Franchise</option>
              </select>
            </div>

            {/* Sort Dropdown */}
            <div>
              <label className="block text-[#64748B] font-medium mb-1">Sort By</label>
              <div className="flex gap-2">
                <select
                  value={sort}
                  onChange={(e) => {
                    setSort(e.target.value);
                    setPage(1);
                  }}
                  className="w-full bg-white border border-[#E7ECF2] text-[#14243A] rounded-lg px-3 py-2 text-xs font-medium focus:outline-none focus:border-[#315EFB]"
                >
                  <option value="recent">Recently Added</option>
                  <option value="popular">Most Inquired</option>
                  <option value="investment_asc">Capital: Low to High</option>
                  <option value="investment_desc">Capital: High to Low</option>
                </select>

                {(searchTerm || industry !== "All" || modelType !== "All" || locationFilter !== "All" || budgetFilter !== "All") && (
                  <button
                    onClick={() => {
                      setSearchTerm("");
                      setIndustry("All");
                      setModelType("All");
                      setLocationFilter("All");
                      setBudgetFilter("All");
                      setPage(1);
                    }}
                    title="Reset filters"
                    className="p-2 text-rose-600 hover:text-rose-700 bg-rose-50 hover:bg-rose-100 rounded-lg transition-colors shrink-0"
                  >
                    <RotateCcw className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Directory Count Bar */}
        <div className="flex items-center justify-between text-xs text-[#64748B] font-medium px-1">
          {isUsingShowcase ? (
            <span>
              Showing <strong className="text-[#14243A]">{listings.length}</strong> sample demonstration concepts{" "}
              <span className="text-amber-600 font-semibold">(Preview Showcase – Inquiries Disabled)</span>
            </span>
          ) : (
            <span>
              Showing <strong className="text-[#14243A]">{listings.length}</strong> of{" "}
              <strong className="text-[#14243A]">{totalCount}</strong> verified franchises
            </span>
          )}
          <span>
            Page {page} of {totalPages}
          </span>
        </div>

        {/* Demonstration Mode Informational Banner */}
        {isUsingShowcase && !loading && !apiError && (
          <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-xs text-amber-900 flex items-start gap-3 shadow-xs">
            <ShieldAlert className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <p className="font-bold text-amber-950">
                Institutional Directory Preview – Demonstration Opportunities
              </p>
              <p className="text-amber-800 leading-relaxed">
                The opportunities displayed below are curated sample concepts designed to demonstrate directory formatting, financials, and space criteria while platform administrators publish new verified brand listings. These sample listings are strictly non-transactional and cannot be used to submit live franchise applications or enter legally binding deal rooms.
              </p>
            </div>
          </div>
        )}

        {/* Listings Cards Grid / States */}
        {apiError ? (
          <div className="surface-card p-12 text-center space-y-4 border border-rose-200 bg-rose-50/50">
            <AlertTriangle className="w-12 h-12 text-rose-500 mx-auto" />
            <h3 className="text-xl font-bold text-[#14243A]">Franchise Service Unavailable</h3>
            <p className="text-xs text-rose-700 max-w-md mx-auto leading-relaxed">
              {apiError}
            </p>
            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                onClick={() => fetchListings()}
                className="btn-primary py-2.5 px-6 text-xs font-semibold"
              >
                Retry Connection
              </button>
              <button
                onClick={() => {
                  setApiError(null);
                  setIsUsingShowcase(true);
                  setListings(DEFAULT_MARKETPLACE_LISTINGS);
                  setTotalCount(DEFAULT_MARKETPLACE_LISTINGS.length);
                  setTotalPages(1);
                }}
                className="btn-secondary py-2.5 px-4 text-xs font-semibold"
              >
                View Offline Showcase
              </button>
            </div>
          </div>
        ) : loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 py-4">
            {[1, 2, 3, 4, 5, 6].map((idx) => (
              <div key={idx} className="surface-card p-6 h-96 animate-pulse space-y-4">
                <div className="h-44 bg-slate-200 rounded-xl w-full" />
                <div className="h-4 bg-slate-200 rounded w-1/3" />
                <div className="h-5 bg-slate-200 rounded w-3/4" />
                <div className="h-12 bg-slate-100 rounded w-full" />
              </div>
            ))}
          </div>
        ) : listings.length === 0 ? (
          <div className="surface-card p-16 text-center space-y-4">
            <Building2 className="w-12 h-12 text-[#64748B] mx-auto" />
            <h3 className="text-xl font-bold text-[#14243A]">No matching franchises found</h3>
            <p className="text-xs text-[#64748B] max-w-md mx-auto">
              Try adjusting your search criteria or resetting filters to browse all verified opportunities.
            </p>
            <button
              onClick={() => {
                setSearchTerm("");
                setIndustry("All");
                setModelType("All");
                setLocationFilter("All");
                setBudgetFilter("All");
                setPage(1);
              }}
              className="text-xs font-semibold text-[#315EFB] hover:underline"
            >
              Clear all filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {listings.map((item) => (
              <div
                key={item._id}
                className="surface-card overflow-hidden flex flex-col justify-between group"
              >
                <div>
                  {/* Banner Image */}
                  <div className="relative h-48 overflow-hidden bg-slate-900">
                    <img
                      src={
                        item.bannerUrl ||
                        "https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=1200&auto=format&fit=crop&q=80"
                      }
                      alt={item.brandName}
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                      onError={(e) => {
                        (e.currentTarget as HTMLImageElement).src =
                          "https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=1200&auto=format&fit=crop&q=80";
                      }}
                    />
                    <div className="absolute top-3 left-3">
                      <span className="px-2.5 py-1 rounded-md bg-white/95 backdrop-blur-sm text-[11px] font-bold text-[#14243A] border border-[#E7ECF2]">
                        {item.industry}
                      </span>
                    </div>

                    <div className="absolute top-3 right-3 flex items-center gap-1.5">
                      {item.isDemo || item._id.startsWith("demo-") ? (
                        <span className="px-2.5 py-1 rounded-md text-[10px] font-bold bg-amber-500/90 text-slate-950 shadow-sm border border-amber-300">
                          Sample / Demo
                        </span>
                      ) : (
                        <StatusBadge status={item.status} />
                      )}
                      <button
                        onClick={(e) => handleToggleSave(item._id, e)}
                        title={
                          item.isDemo || item._id.startsWith("demo-")
                            ? "Sample concept (Bookmarks disabled)"
                            : savedIds.has(item._id)
                            ? "Remove from saved"
                            : "Save opportunity"
                        }
                        className={`p-1.5 rounded-lg backdrop-blur-sm transition-all border ${
                          savedIds.has(item._id)
                            ? "bg-amber-400 text-slate-950 border-amber-300 shadow"
                            : "bg-white/80 text-slate-600 border-white/60 hover:bg-white hover:text-slate-900"
                        }`}
                      >
                        {savedIds.has(item._id) ? (
                          <BookmarkCheck className="w-4 h-4 text-slate-950" />
                        ) : (
                          <Bookmark className="w-4 h-4" />
                        )}
                      </button>
                    </div>

                    {/* Logo & ROI Overlay */}
                    <div className="absolute bottom-3 left-4 right-4 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-9 h-9 rounded-lg bg-white p-0.5 shadow-md overflow-hidden shrink-0">
                          <img
                            src={
                              item.logoUrl ||
                              "https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=200&auto=format&fit=crop&q=80"
                            }
                            alt={item.brandName}
                            className="w-full h-full object-cover rounded-md"
                            onError={(e) => {
                              (e.currentTarget as HTMLImageElement).src =
                                "https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=200&auto=format&fit=crop&q=80";
                            }}
                          />
                        </div>
                        <span className="text-white font-bold text-sm drop-shadow-md truncate">
                          {item.brandName}
                        </span>
                      </div>
                      {item.estimatedRoiMonths && (
                        <span className="px-2 py-0.5 rounded-md bg-[#159D8B] text-white font-bold text-[10px] shadow-sm">
                          ROI ~{item.estimatedRoiMonths} Mo
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Card Body Details */}
                  <div className="p-5 space-y-3">
                    <div>
                      <div className="flex items-center justify-between gap-2">
                        <h3 className="text-base font-bold text-[#14243A] group-hover:text-[#315EFB] transition-colors truncate">
                          {item.isDemo || item._id.startsWith("demo-") ? (
                            <span>{item.brandName}</span>
                          ) : (
                            <Link href={`/franchises/${item.slug || item._id}`}>{item.brandName}</Link>
                          )}
                        </h3>
                        <span className="text-[10px] font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                          {item.businessModel || item.franchiseModelType || "FOFO"}
                        </span>
                      </div>
                      <p className="text-xs text-[#315EFB] font-medium mt-0.5 line-clamp-1">
                        {item.opportunityTitle || item.tagline}
                      </p>
                      <p className="text-xs text-[#64748B] line-clamp-2 leading-relaxed mt-1">
                        {item.summary}
                      </p>
                    </div>

                    {/* Financial Requirements */}
                    <div className="pt-3 border-t border-[#E7ECF2] grid grid-cols-2 gap-2 text-xs">
                      <div className="bg-[#F8FAFC] p-2.5 rounded-lg border border-[#E7ECF2]">
                        <span className="text-[#64748B] text-[10px] block font-medium">Est. Capital</span>
                        <div className="font-bold text-[#14243A] text-xs sm:text-sm mt-0.5">
                          ₹{((item.totalInvestmentMin || 0) / 100000).toFixed(1)}L - ₹{((item.totalInvestmentMax || 0) / 100000).toFixed(1)}L
                        </div>
                      </div>
                      <div className="bg-[#F8FAFC] p-2.5 rounded-lg border border-[#E7ECF2]">
                        <span className="text-[#64748B] text-[10px] block font-medium">Franchise Fee</span>
                        <div className="font-bold text-[#14243A] text-xs sm:text-sm mt-0.5">
                          ₹{((item.initialFranchiseFee || 0) / 100000).toFixed(1)}L
                        </div>
                      </div>
                    </div>

                    {/* Operational Details */}
                    <div className="space-y-1 text-xs text-[#64748B] pt-1">
                      <div className="flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-[#315EFB] shrink-0" />
                        <span className="truncate">
                          Cities: {item.targetLocations?.slice(0, 3).join(", ") || item.expansionLocations?.slice(0, 3).join(", ") || "Pan-India"}
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-[#315EFB] shrink-0" />
                        <span>
                          Space: {item.commercialSpaceMinSqFt || 300} - {item.commercialSpaceMaxSqFt || 800} Sq Ft
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Bottom Action */}
                <div className="p-5 pt-0 flex items-center gap-2">
                  <button
                    onClick={(e) => toggleCompare(item._id, e)}
                    className={`p-2.5 rounded-xl border text-xs font-semibold transition-all shrink-0 ${
                      compareIds.includes(item._id)
                        ? "bg-emerald-50 text-emerald-700 border-emerald-300"
                        : "bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100"
                    }`}
                    title="Compare this brand"
                  >
                    <Scale className="w-4 h-4" />
                  </button>
                  {item.isDemo || item._id.startsWith("demo-") ? (
                    <button
                      type="button"
                      onClick={(e) => handleDemoEnquiryClick(item.brandName, e)}
                      className="btn-secondary flex-1 py-2.5 text-xs font-semibold justify-center text-[#64748B] hover:text-[#14243A] border-dashed hover:border-[#14243A]"
                    >
                      Sample Concept (Enquiries Disabled)
                    </button>
                  ) : (
                    <Link
                      href={`/franchises/${item.slug || item._id}`}
                      className="btn-primary flex-1 py-2.5 text-xs font-semibold justify-center"
                    >
                      View Details & Enquire
                      <ArrowRight className="w-3.5 h-3.5 ml-1" />
                    </Link>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Demo Notice Modal */}
        {demoNoticeModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
            <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl border border-[#E7ECF2]">
              <div className="flex items-center justify-between pb-2 border-b border-[#E7ECF2]">
                <div className="flex items-center gap-2 text-amber-600 font-bold text-sm">
                  <ShieldAlert className="w-5 h-5" />
                  <span>Showcase Demonstration Notice</span>
                </div>
                <button
                  onClick={() => setDemoNoticeModal(null)}
                  className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                {demoNoticeModal}
              </p>
              <div className="bg-amber-50 rounded-xl p-3 border border-amber-200 text-[11px] text-amber-900 leading-relaxed">
                <strong>Governance Policy:</strong> To protect platform integrity, all transactions, investor commitments, and franchise agreements require an administrator-approved brand listing with verified legal documentation.
              </div>
              <div className="pt-2">
                <button
                  onClick={() => setDemoNoticeModal(null)}
                  className="btn-primary w-full py-2.5 text-xs font-semibold justify-center"
                >
                  Understood
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Pagination Bar */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-3 pt-6">
            <button
              onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
              disabled={page === 1}
              className="p-2.5 rounded-lg border border-[#E7ECF2] bg-white disabled:opacity-40 hover:bg-[#F8FAFC] text-[#14243A] transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="text-xs font-bold text-[#14243A] px-4">
              Page {page} of {totalPages}
            </span>
            <button
              onClick={() => setPage((prev) => Math.min(prev + 1, totalPages))}
              disabled={page === totalPages}
              className="p-2.5 rounded-lg border border-[#E7ECF2] bg-white disabled:opacity-40 hover:bg-[#F8FAFC] text-[#14243A] transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Pagination Bar */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-3 pt-6">
            <button
              onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
              disabled={page === 1}
              className="p-2.5 rounded-lg border border-[#E7ECF2] bg-white disabled:opacity-40 hover:bg-[#F8FAFC] text-[#14243A] transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="text-xs font-bold text-[#14243A] px-4">
              Page {page} of {totalPages}
            </span>
            <button
              onClick={() => setPage((prev) => Math.min(prev + 1, totalPages))}
              disabled={page === totalPages}
              className="p-2.5 rounded-lg border border-[#E7ECF2] bg-white disabled:opacity-40 hover:bg-[#F8FAFC] text-[#14243A] transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
