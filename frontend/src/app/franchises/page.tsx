"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Search, Filter, MapPin, Building2, ChevronLeft, ChevronRight, Bookmark } from "lucide-react";
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

  const industries = ["All", "Food & Beverage", "Health & Wellness", "Fast Casual Dining", "Education & EdTech", "Retail"];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
      {/* Header */}
      <div className="space-y-3">
        <span className="text-blue-600 font-semibold text-xs uppercase tracking-wider">Discovery Engine</span>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-navy-900 tracking-tight">
          Franchise Opportunities Marketplace
        </h1>
        <p className="text-slate-600 text-sm sm:text-base max-w-2xl">
          Browse verified franchise opportunities with complete unit economics disclosures, approved operational SOPs,
          and active multi-unit expansion mandates.
        </p>
      </div>

      {/* Search and Filters Bar */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
        <form onSubmit={handleSearchSubmit} className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by brand name, industry, or expansion city..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-blue-500"
            />
          </div>
          <button
            type="submit"
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm px-6 py-2.5 rounded-xl shadow-sm transition-colors"
          >
            Search Listings
          </button>
        </form>

        <div className="flex flex-wrap items-center justify-between gap-4 pt-3 border-t border-slate-100 text-xs">
          {/* Industry pills */}
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-slate-400 font-medium mr-1">Industry:</span>
            {industries.map((ind) => (
              <button
                key={ind}
                onClick={() => {
                  setIndustry(ind);
                  setPage(1);
                }}
                className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
                  industry === ind
                    ? "bg-navy-900 text-white"
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
              className="bg-slate-50 border border-slate-200 text-slate-700 rounded-lg px-2.5 py-1.5 focus:outline-none"
            >
              <option value="All">All Formats</option>
              <option value="single_unit">Single-Unit Only</option>
              <option value="multi_unit">Multi-Unit Available</option>
            </select>

            <select
              value={sort}
              onChange={(e) => {
                setSort(e.target.value);
                setPage(1);
              }}
              className="bg-slate-50 border border-slate-200 text-slate-700 rounded-lg px-2.5 py-1.5 focus:outline-none"
            >
              <option value="recent">Recently Added</option>
              <option value="popular">Most Inquired</option>
              <option value="investment_asc">Investment: Low to High</option>
              <option value="investment_desc">Investment: High to Low</option>
            </select>
          </div>
        </div>
      </div>

      {/* Results Header */}
      <div className="flex items-center justify-between text-xs text-slate-500 font-medium px-1">
        <span>Showing {listings.length} of {totalCount} verified opportunities</span>
        <span>Page {page} of {totalPages}</span>
      </div>

      {/* Listings Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 py-8">
          {[1, 2, 3, 4, 5, 6].map((idx) => (
            <div key={idx} className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4 animate-pulse">
              <div className="h-4 bg-slate-200 rounded w-1/3" />
              <div className="h-6 bg-slate-200 rounded w-3/4" />
              <div className="h-16 bg-slate-100 rounded w-full" />
              <div className="h-10 bg-slate-200 rounded w-full" />
            </div>
          ))}
        </div>
      ) : listings.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center space-y-4">
          <Building2 className="w-12 h-12 text-slate-300 mx-auto" />
          <h3 className="text-lg font-bold text-navy-900">No matching franchises found</h3>
          <p className="text-sm text-slate-500 max-w-md mx-auto">
            Try adjusting your search query, selecting "All" industries, or resetting filter parameters.
          </p>
          <button
            onClick={() => {
              setSearchTerm("");
              setIndustry("All");
              setModelType("All");
              setPage(1);
            }}
            className="text-xs font-semibold text-blue-600 hover:underline"
          >
            Clear all filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {listings.map((item) => (
            <div
              key={item._id}
              className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-lg transition-all flex flex-col justify-between group"
            >
              <div className="p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider px-2.5 py-1 rounded-md bg-blue-50 text-blue-700">
                    {item.industry}
                  </span>
                  <StatusBadge status={item.status} />
                </div>

                <div>
                  <h3 className="text-xl font-bold text-navy-900 group-hover:text-blue-600 transition-colors">
                    <Link href={`/franchises/${item.slug}`}>{item.brandName}</Link>
                  </h3>
                  <p className="text-xs text-amber-700 font-medium mt-0.5">{item.tagline}</p>
                </div>

                <p className="text-sm text-slate-600 line-clamp-3 leading-relaxed">{item.summary}</p>

                <div className="pt-4 border-t border-slate-100 grid grid-cols-2 gap-3 text-xs">
                  <div>
                    <div className="text-slate-400 uppercase font-medium">Est. Capital</div>
                    <div className="font-bold text-navy-900 text-sm mt-0.5">
                      {formatCurrency(item.totalInvestmentMin)} - {formatCurrency(item.totalInvestmentMax)}
                    </div>
                  </div>
                  <div>
                    <div className="text-slate-400 uppercase font-medium">Franchise Fee</div>
                    <div className="font-bold text-navy-900 text-sm mt-0.5">
                      {formatCurrency(item.initialFranchiseFee)}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 text-xs text-slate-500 pt-1">
                  <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span className="truncate">Active In: {item.expansionLocations?.slice(0, 3).join(", ")}</span>
                </div>
              </div>

              <div className="bg-slate-50 px-6 py-3.5 border-t border-slate-100 flex items-center justify-between">
                <Link
                  href={`/franchises/${item.slug}`}
                  className="text-xs font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1"
                >
                  View Details & Apply &rarr;
                </Link>
                <span className="text-[11px] text-slate-400">Royalty: {item.royaltyPercentage}%</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-3 pt-6">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="p-2 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-100 disabled:opacity-40"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <span className="text-xs font-semibold text-slate-700">
            Page {page} of {totalPages}
          </span>
          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="p-2 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-100 disabled:opacity-40"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      )}
    </div>
  );
}
