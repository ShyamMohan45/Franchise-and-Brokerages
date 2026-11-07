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
              Explore audited franchise brand opportunities with standardized SOP packaging, disclosed unit economics, and protected multi-unit territories.
            </p>
          </div>

          <div className="flex items-center gap-2">
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
                placeholder="Search by brand name, industry, or expansion city (e.g. Coffee, Gym, Delhi)..."
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[#E7ECF2] text-sm text-[#14243A] placeholder-[#64748B] focus:outline-none focus:border-[#315EFB] bg-white"
              />
            </div>
            <button type="submit" className="btn-primary py-2.5 px-6 text-sm shrink-0">
              <Search className="w-4 h-4 mr-1" />
              Search Directory
            </button>
          </form>

          {/* Industry Filter Pills & Format Selectors */}
          <div className="flex flex-wrap items-center justify-between gap-4 pt-3 border-t border-[#E7ECF2] text-xs">
            <div className="flex flex-wrap items-center gap-1.5">
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

            {/* Model & Sorting Dropdowns */}
            <div className="flex items-center gap-2.5">
              <select
                value={modelType}
                onChange={(e) => {
                  setModelType(e.target.value);
                  setPage(1);
                }}
                className="bg-white border border-[#E7ECF2] text-[#14243A] rounded-lg px-3 py-1.5 text-xs font-medium focus:outline-none focus:border-[#315EFB]"
              >
                <option value="All">All Unit Formats</option>
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
                className="bg-white border border-[#E7ECF2] text-[#14243A] rounded-lg px-3 py-1.5 text-xs font-medium focus:outline-none focus:border-[#315EFB]"
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
                  className="text-xs text-rose-600 hover:text-rose-700 font-semibold flex items-center gap-1 px-2 py-1 rounded-md hover:bg-rose-50 transition-colors"
                >
                  <RotateCcw className="w-3 h-3" /> Reset
                </button>
              )}
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

                    <div className="absolute top-3 right-3">
                      <StatusBadge status={item.status} />
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
                      <h3 className="text-base font-bold text-[#14243A] group-hover:text-[#315EFB] transition-colors">
                        <Link href={`/franchises/${item.slug}`}>{item.brandName}</Link>
                      </h3>
                      <p className="text-xs text-[#315EFB] font-medium mt-0.5 line-clamp-1">
                        {item.tagline}
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
                          {formatCurrency(item.totalInvestmentMin)} - {formatCurrency(item.totalInvestmentMax)}
                        </div>
                      </div>
                      <div className="bg-[#F8FAFC] p-2.5 rounded-lg border border-[#E7ECF2]">
                        <span className="text-[#64748B] text-[10px] block font-medium">Franchise Fee</span>
                        <div className="font-bold text-[#14243A] text-xs sm:text-sm mt-0.5">
                          {formatCurrency(item.initialFranchiseFee)}
                        </div>
                      </div>
                    </div>

                    {/* Operational Details */}
                    <div className="space-y-1 text-xs text-[#64748B] pt-1">
                      <div className="flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-[#315EFB] shrink-0" />
                        <span className="truncate">
                          Cities: {item.expansionLocations?.slice(0, 3).join(", ") || "Nationwide"}
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-[#315EFB] shrink-0" />
                        <span>
                          Space: {item.commercialSpaceMinSqFt} - {item.commercialSpaceMaxSqFt} Sq Ft
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Bottom Action */}
                <div className="p-5 pt-0">
                  <Link
                    href={`/franchises/${item.slug}`}
                    className="btn-primary w-full py-2.5 text-xs font-semibold justify-center"
                  >
                    View Details & Apply
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
