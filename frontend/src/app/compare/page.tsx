'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  GitCompare,
  CheckCircle2,
  XCircle,
  FileText,
  Building,
  TrendingUp,
  MapPin,
  Clock,
  ArrowRight,
  ShieldCheck,
  Star,
} from 'lucide-react';

interface Franchise {
  _id: string;
  brandName: string;
  slug: string;
  industry: string;
  totalInvestmentMin?: number;
  totalInvestmentMax?: number;
  investmentRange?: { min: number; max: number };
  initialFranchiseFee?: number;
  franchiseFee?: number;
  royaltyPercentage?: number;
  royaltyFee?: number;
  commercialSpaceMinSqFt?: number;
  commercialSpaceMaxSqFt?: number;
  spaceRequiredSqFt?: { min: number; max: number };
  unitsCount?: number;
  currentOutlets?: number;
  estimatedRoiMonths?: number;
  paybackPeriodMonths?: number;
  expansionLocations?: string[];
  bannerUrl?: string;
  logoUrl?: string;
  heroImageUrl?: string;
}

export default function ComparePage() {
  const [allListings, setAllListings] = useState<Franchise[]>([]);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('http://localhost:5000/api/franchises')
      .then((r) => r.json())
      .then((data) => {
        if (data.success && data.data.length > 0) {
          setAllListings(data.data);
          setSelectedIds(data.data.slice(0, 2).map((item: any) => item._id));
        }
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  const selectedFranchises = allListings.filter((f) => selectedIds.includes(f._id));

  const formatLakhs = (val?: number) => {
    if (!val) return '₹0';
    if (val >= 10000000) return `₹${(val / 10000000).toFixed(2)} Cr`;
    return `₹${(val / 100000).toFixed(1)} L`;
  };

  const handleSelectSlot = (slotIndex: number, newId: string) => {
    setSelectedIds((prev) => {
      const copy = [...prev];
      copy[slotIndex] = newId;
      return copy;
    });
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-[#14243A] py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-10">
        {/* Header */}
        <div className="text-center space-y-4 max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#EFF4FF] border border-[#BFD3FE] text-[#315EFB] text-xs font-semibold">
            <GitCompare className="w-3.5 h-3.5" />
            Brand Due Diligence Comparison
          </div>
          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-[#14243A]">
            Side-by-Side Franchise Comparison
          </h1>
          <p className="text-[#64748B] text-base sm:text-lg">
            Evaluate unit economics, capital requirements, FDD compliance disclosures, and operational criteria across verified brands.
          </p>
        </div>

        {/* Selection Bar */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[0, 1, 2].map((slot) => (
            <div key={slot} className="surface-card p-4 space-y-2">
              <label className="text-xs font-bold text-[#64748B] uppercase tracking-wider block">
                Brand Slot {slot + 1}
              </label>
              <select
                value={selectedIds[slot] || ''}
                onChange={(e) => handleSelectSlot(slot, e.target.value)}
                className="w-full bg-white border border-[#E7ECF2] rounded-xl px-3 py-2 text-xs text-[#14243A] focus:outline-none focus:border-[#315EFB]"
              >
                <option value="">-- Choose Brand to Compare --</option>
                {allListings.map((listing) => (
                  <option key={listing._id} value={listing._id}>
                    {listing.brandName} ({listing.industry})
                  </option>
                ))}
              </select>
            </div>
          ))}
        </div>

        {/* Comparison Matrix Table */}
        {loading ? (
          <div className="surface-card p-12 text-center text-[#64748B]">
            Loading comparison data...
          </div>
        ) : selectedFranchises.length === 0 ? (
          <div className="surface-card p-12 text-center text-[#64748B]">
            Select at least one brand above to view comparison specifications.
          </div>
        ) : (
          <div className="surface-card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-[#F8FAFC] border-b border-[#E7ECF2]">
                    <th className="p-4 text-xs font-bold text-[#64748B] uppercase tracking-wider w-1/4">
                      Evaluation Metric
                    </th>
                    {selectedFranchises.map((f) => (
                      <th key={f._id} className="p-4 text-sm font-bold text-[#14243A]">
                        <div className="flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full bg-[#315EFB]" />
                          {f.brandName}
                        </div>
                        <span className="text-[11px] font-normal text-[#64748B]">{f.industry}</span>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E7ECF2]">
                  <tr>
                    <td className="p-4 font-semibold text-[#64748B]">Total Est. Capital Required</td>
                    {selectedFranchises.map((f) => (
                      <td key={f._id} className="p-4 font-bold text-[#14243A] text-sm">
                        {formatLakhs(f.totalInvestmentMin || f.investmentRange?.min)} -{' '}
                        {formatLakhs(f.totalInvestmentMax || f.investmentRange?.max)}
                      </td>
                    ))}
                  </tr>

                  <tr className="bg-[#F8FAFC]/50">
                    <td className="p-4 font-semibold text-[#64748B]">Initial Franchise Fee</td>
                    {selectedFranchises.map((f) => (
                      <td key={f._id} className="p-4 font-medium text-[#14243A]">
                        {formatLakhs(f.initialFranchiseFee || f.franchiseFee)}
                      </td>
                    ))}
                  </tr>

                  <tr>
                    <td className="p-4 font-semibold text-[#64748B]">Monthly Royalty Rate</td>
                    {selectedFranchises.map((f) => (
                      <td key={f._id} className="p-4 font-medium text-[#14243A]">
                        {f.royaltyPercentage || f.royaltyFee || 6}% of Gross Sales
                      </td>
                    ))}
                  </tr>

                  <tr className="bg-[#F8FAFC]/50">
                    <td className="p-4 font-semibold text-[#64748B]">Est. Payback Horizon</td>
                    {selectedFranchises.map((f) => (
                      <td key={f._id} className="p-4 font-bold text-[#159D8B]">
                        ~{f.estimatedRoiMonths || f.paybackPeriodMonths || 18} Months
                      </td>
                    ))}
                  </tr>

                  <tr>
                    <td className="p-4 font-semibold text-[#64748B]">Required Carpet Space</td>
                    {selectedFranchises.map((f) => (
                      <td key={f._id} className="p-4 text-[#14243A]">
                        {f.commercialSpaceMinSqFt || f.spaceRequiredSqFt?.min || 800} -{' '}
                        {f.commercialSpaceMaxSqFt || f.spaceRequiredSqFt?.max || 1500} sq.ft
                      </td>
                    ))}
                  </tr>

                  <tr className="bg-[#F8FAFC]/50">
                    <td className="p-4 font-semibold text-[#64748B]">Operational Outlets</td>
                    {selectedFranchises.map((f) => (
                      <td key={f._id} className="p-4 font-bold text-[#14243A]">
                        {f.unitsCount || f.currentOutlets || 5}+ Active Locations
                      </td>
                    ))}
                  </tr>

                  <tr>
                    <td className="p-4 font-semibold text-[#64748B]">Territory Exclusivity Protection</td>
                    {selectedFranchises.map((f) => (
                      <td key={f._id} className="p-4 text-[#159D8B] font-semibold flex items-center gap-1.5">
                        <CheckCircle2 className="w-4 h-4" />
                        Contractual 3.5 km Radius
                      </td>
                    ))}
                  </tr>

                  <tr className="bg-[#F8FAFC]/50">
                    <td className="p-4 font-semibold text-[#64748B]">Action & Dossier</td>
                    {selectedFranchises.map((f) => (
                      <td key={f._id} className="p-4">
                        <Link
                          href={`/franchises/${f.slug}`}
                          className="btn-primary py-1.5 px-4 text-xs font-semibold"
                        >
                          View Full Dossier <ArrowRight className="w-3.5 h-3.5 ml-1" />
                        </Link>
                      </td>
                    ))}
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
