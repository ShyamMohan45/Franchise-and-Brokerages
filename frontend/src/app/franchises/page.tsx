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
  Bookmark,
  Sparkles,
  SlidersHorizontal,
  Clock,
  CheckCircle2,
  BadgeCheck,
  TrendingUp,
  RotateCcw,
} from "lucide-react";
import { api } from "@/lib/api";
import { formatCurrency } from "@/lib/utils";
import { StatusBadge } from "@/components/StatusBadge";
import { useAuth } from "@/providers/AuthProvider";

export default function FranchisesMarketplacePage() {
  const { user } = useAuth();
  const [listings, setListings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [industry, setIndustry] = useState("All");
  const [modelType, setModelType] = useState("All");
  const [sort, setSort] = useState("recent");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  const fetchListings = async () => {
    setLoading(true);
    try {
      const res = await api.get<any[]>("/franchises", {
        search: searchTerm,
        industry,
        modelType,
        sort,
        page,
        limit: 9,
      });

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
  }, [industry, modelType, sort, page]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchListings();
  };

  const industries = [
    "All",
    "Food & Beverage",
    "Health & Wellness",
    "Fast Casual Dining",
    "Education & EdTech",
    "Health & Beauty",
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-10">
      {/* Header */}
      <div className="space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-xs font-bold">
          <Sparkles className="w-3.5 h-3.5 text-blue-600" />
          Verified Brokerage Portfolio
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-navy-900 tracking-tight">
          Franchise Opportunities Marketplace
        </h1>
        <p className="text-slate-600 text-sm max-w-2xl leading-relaxed">
          Explore vetted franchise brand models with codified operating manuals, disclosed store unit economics,
          and protected multi-unit territory expansion mandates.
        </p>
      </div>

      {/* Luxury Filter & Search Bar */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200/90 shadow-[0_4px_25px_rgba(0,0,0,0.03)] space-y-5">
        <form onSubmit={handleSearchSubmit} className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-4 top-3.5 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by brand name, industry, or expansion city (e.g. Bengaluru, Coffee, Gym)..."
              className="w-full pl-11 pr-4 py-3 rounded-2xl border border-slate-200 text-xs sm:text-sm focus:outline-none focus:border-blue-500 bg-slate-50/50"
            />
          </div>
          <button
            type="submit"
            className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-xs sm:text-sm px-7 py-3 rounded-2xl shadow-md transition-all shrink-0"
          >
            Search Portfolio
          </button>
        </form>

        <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-slate-100 text-xs">
          {/* Industry pills */}
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-slate-400 font-semibold mr-1">Industry:</span>
            {industries.map((ind) => (
              <button
                key={ind}
                onClick={() => {
                  setIndustry(ind);
                  setPage(1);
                }}
                className={`px-3 py-1.5 rounded-xl font-bold transition-all text-xs ${
                  industry === ind
                    ? "bg-navy-900 text-white shadow-sm"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                {ind}
              </button>
            ))}
          </div>

          {/* Model Type & Sort options */}
          <div className="flex items-center gap-3">
            <select
              value={modelType}
              onChange={(e) => {
                setModelType(e.target.value);
                setPage(1);
              }}
              className="bg-slate-50 border border-slate-200 text-slate-700 rounded-xl px-3 py-1.5 focus:outline-none font-medium"
            >
              <option value="All">All Formats</option>
              <option value="single_unit">Single-Unit Only</option>
              <option value="multi_unit">Multi-Unit Available</option>
              <option value="both">Both Formats</option>
            </select>

            <select
              value={sort}
              onChange={(e) => {
                setSort(e.target.value);
                setPage(1);
              }}
              className="bg-slate-50 border border-slate-200 text-slate-700 rounded-xl px-3 py-1.5 focus:outline-none font-medium"
            >
              <option value="recent">Recently Added</option>
              <option value="popular">Most Inquired</option>
              <option value="investment_asc">Capital: Low to High</option>
              <option value="investment_desc">Capital: High to Low</option>
            </select>

            {(searchTerm || industry !== "All" || modelType !== "All") && (
              <button
                onClick={() => {
                  setSearchTerm("");
                  setIndustry("All");
                  setModelType("All");
                  setPage(1);
                }}
                className="text-xs text-rose-600 hover:text-rose-700 font-bold flex items-center gap-1 px-2 py-1 rounded-lg hover:bg-rose-50"
              >
                <RotateCcw className="w-3 h-3" /> Reset
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Results Header */}
      <div className="flex items-center justify-between text-xs text-slate-500 font-semibold px-1">
        <span>Showing {listings.length} of {totalCount} verified brand opportunities</span>
        <span>Page {page} of {totalPages}</span>
      </div>

      {/* Listings Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 py-8">
          {[1, 2, 3, 4, 5, 6].map((idx) => (
            <div key={idx} className="bg-white rounded-3xl border border-slate-200 overflow-hidden animate-pulse">
              <div className="h-48 bg-slate-200 w-full" />
              <div className="p-6 space-y-4">
                <div className="h-4 bg-slate-200 rounded w-1/3" />
                <div className="h-6 bg-slate-200 rounded w-3/4" />
                <div className="h-14 bg-slate-100 rounded w-full" />
                <div className="h-10 bg-slate-200 rounded w-full" />
              </div>
            </div>
          ))}
        </div>
      ) : listings.length === 0 ? (
        <div className="bg-white rounded-3xl border border-slate-200 p-16 text-center space-y-4">
          <Building2 className="w-12 h-12 text-slate-300 mx-auto" />
          <h3 className="text-xl font-bold text-navy-900">No matching franchises found</h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            Try adjusting your search criteria or resetting filters to see the full directory.
          </p>
          <button
            onClick={() => {
              setSearchTerm("");
              setIndustry("All");
              setModelType("All");
              setPage(1);
            }}
            className="text-xs font-bold text-blue-600 hover:underline"
          >
            Clear all filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {listings.map((item) => (
            <div
              key={item._id}
              className="bg-white rounded-3xl border border-slate-200/90 overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between group"
            >
              <div>
                {/* Photo Banner */}
                <div className="relative h-48 overflow-hidden bg-slate-900">
                  <img
                    src={item.bannerUrl || "https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=1200&auto=format&fit=crop&q=80"}
                    alt={item.brandName}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                  
                  {/* Category Pill */}
                  <div className="absolute top-3 left-3">
                    <span className="px-2.5 py-1 rounded-lg bg-black/60 backdrop-blur-md text-[11px] font-bold text-white border border-white/[0.15]">
                      {item.industry}
                    </span>
                  </div>

                  {/* Status Badge */}
                  <div className="absolute top-3 right-3">
                    <StatusBadge status={item.status} />
                  </div>

                  {/* Logo Avatar & ROI Pill */}
                  <div className="absolute bottom-3 left-4 right-4 flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="w-10 h-10 rounded-xl bg-white p-0.5 shadow-lg overflow-hidden shrink-0">
                        <img
                          src={item.logoUrl || "https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=200&auto=format&fit=crop&q=80"}
                          alt={item.brandName}
                          className="w-full h-full object-cover rounded-lg"
                        />
                      </div>
                      <span className="text-white font-extrabold text-sm drop-shadow-md truncate">
                        {item.brandName}
                      </span>
                    </div>
                    {item.estimatedRoiMonths && (
                      <span className="px-2 py-0.5 rounded-full bg-emerald-500/90 text-white font-bold text-[10px] shadow-sm">
                        ROI: ~{item.estimatedRoiMonths} Mo
                      </span>
                    )}
                  </div>
                </div>

                {/* Card Content */}
                <div className="p-6 space-y-4">
                  <div>
                    <h3 className="text-lg font-bold text-navy-900 group-hover:text-blue-600 transition-colors">
                      <Link href={`/franchises/${item.slug}`}>{item.brandName}</Link>
                    </h3>
                    <p className="text-xs text-amber-700 font-semibold mt-0.5 line-clamp-1">{item.tagline}</p>
                    <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed mt-1.5">{item.summary}</p>
                  </div>

                  {/* Financial Specs */}
                  <div className="pt-3 border-t border-slate-100 grid grid-cols-2 gap-3 text-xs">
                    <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                      <span className="text-slate-400 uppercase font-medium text-[10px]">Est. Capital Required</span>
                      <div className="font-extrabold text-navy-900 text-xs sm:text-sm mt-0.5">
                        {formatCurrency(item.totalInvestmentMin)} - {formatCurrency(item.totalInvestmentMax)}
                      </div>
                    </div>
                    <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                      <span className="text-slate-400 uppercase font-medium text-[10px]">Franchise Fee</span>
                      <div className="font-extrabold text-navy-900 text-xs sm:text-sm mt-0.5">
                        {formatCurrency(item.initialFranchiseFee)}
                      </div>
                    </div>
                  </div>

                  {/* Operational Tags */}
                  <div className="space-y-1.5 text-xs text-slate-500 pt-1">
                    <div className="flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="truncate">Expansion: {item.expansionLocations?.slice(0, 3).join(", ")}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span>Commercial Space: {item.commercialSpaceMinSqFt} - {item.commercialSpaceMaxSqFt} Sq Ft</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Bottom Footer Action */}
              <div className="bg-slate-50/80 px-6 py-3.5 border-t border-slate-100 flex items-center justify-between">
                <Link
                  href={`/franchises/${item.slug}`}
                  className="text-xs font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1 group-hover:translate-x-0.5 transition-transform"
                >
                  View Details & Apply &rarr;
                </Link>
                <span className="text-[11px] font-semibold text-slate-500 capitalize">
                  {item.franchiseModelType?.replace("_", " ")}
                </span>
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
            className="p-2.5 rounded-xl border border-slate-200 bg-white disabled:opacity-40 hover:bg-slate-50 text-slate-700 transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="text-xs font-bold text-slate-700 px-4">
            Page {page} of {totalPages}
          </span>
          <button
            onClick={() => setPage((prev) => Math.min(prev + 1, totalPages))}
            disabled={page === totalPages}
            className="p-2.5 rounded-xl border border-slate-200 bg-white disabled:opacity-40 hover:bg-slate-50 text-slate-700 transition-colors"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
}
