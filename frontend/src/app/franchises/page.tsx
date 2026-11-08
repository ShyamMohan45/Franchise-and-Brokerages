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
} from "lucide-react";
import { api } from "@/lib/api";
import { formatCurrency } from "@/lib/utils";
import { StatusBadge } from "@/components/StatusBadge";
import { useAuth } from "@/providers/AuthProvider";
import { Bookmark, BookmarkCheck } from "lucide-react";

export default function FranchisesMarketplacePage() {
  const { user } = useAuth();
  const [listings, setListings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [industry, setIndustry] = useState("All");
  const [modelType, setModelType] = useState("All");
  const [locationFilter, setLocationFilter] = useState("All");
  const [budgetFilter, setBudgetFilter] = useState("All");
  const [sort, setSort] = useState("recent");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
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

      if (res.success && res.data) {
        setListings(res.data);
        if (res.meta) {
          setTotalPages(res.meta.totalPages || 1);
          setTotalCount(res.meta.total || 0);
        }
      }
    } catch (err) {
      console.error("Failed to fetch franchises:", err);
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
          <span>
            Showing <strong className="text-[#14243A]">{listings.length}</strong> of{" "}
            <strong className="text-[#14243A]">{totalCount}</strong> verified franchises
          </span>
          <span>
            Page {page} of {totalPages}
          </span>
        </div>

        {/* Listings Cards Grid */}
        {loading ? (
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
                    />
                    <div className="absolute top-3 left-3">
                      <span className="px-2.5 py-1 rounded-md bg-white/95 backdrop-blur-sm text-[11px] font-bold text-[#14243A] border border-[#E7ECF2]">
                        {item.industry}
                      </span>
                    </div>

                    <div className="absolute top-3 right-3 flex items-center gap-1.5">
                      <StatusBadge status={item.status} />
                      <button
                        onClick={(e) => handleToggleSave(item._id, e)}
                        title={savedIds.has(item._id) ? "Remove from saved" : "Save opportunity"}
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
                          <Link href={`/franchises/${item.slug || item._id}`}>{item.brandName}</Link>
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
                  <Link
                    href={`/franchises/${item.slug || item._id}`}
                    className="btn-primary flex-1 py-2.5 text-xs font-semibold justify-center"
                  >
                    View Details & Enquire
                    <ArrowRight className="w-3.5 h-3.5 ml-1" />
                  </Link>
                </div>
              </div>
            ))}
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
