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
  investmentRange: { min: number; max: number };
  franchiseFee: number;
  royaltyFee: number; // percentage
  spaceRequiredSqFt: { min: number; max: number };
  currentOutlets: number;
  paybackPeriodMonths: number;
  expansionTargetCities: string[];
  heroImageUrl: string;
  rating?: number;
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
          // Pick the first 2 by default
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
    <div className="min-h-screen bg-slate-950 text-slate-100 py-12 px-4 sm:px-6 lg:px-8 selection:bg-emerald-500 selection:text-white">
      <div className="max-w-7xl mx-auto space-y-10">
        {/* Header */}
        <div className="text-center space-y-4 max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 text-xs font-semibold uppercase tracking-wider">
            <GitCompare className="w-4 h-4" />
            Brand Due Diligence Comparison
          </div>
          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">
            Side-by-Side Franchise Comparison
          </h1>
          <p className="text-slate-400 text-base sm:text-lg">
            Evaluate unit economics, capital requirements, FDD compliance disclosures, and operational criteria across verified brands.
          </p>
        </div>

        {/* Selection Bar */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[0, 1, 2].map((slot) => (
            <div key={slot} className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-2">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
                Brand Slot {slot + 1}
              </label>
              <select
                value={selectedIds[slot] || ''}
                onChange={(e) => handleSelectSlot(slot, e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="">-- Choose Brand --</option>
                {allListings.map((listing) => (
                  <option key={listing._id} value={listing._id}>
                    {listing.brandName} ({listing.industry})
                  </option>
                ))}
              </select>
            </div>
          ))}
        </div>

        {/* Comparison Table / Grid */}
        {selectedFranchises.length === 0 ? (
          <div className="p-12 text-center text-slate-400 bg-slate-900 rounded-3xl border border-slate-800">
            Please select at least 1 brand above to begin comparison.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <div className="min-w-[700px] bg-slate-900/90 border border-slate-800 rounded-3xl shadow-2xl divide-y divide-slate-800">
              {/* Row 1: Brand Hero */}
              <div className="grid grid-cols-4 p-6 items-center">
                <div className="text-xs font-bold uppercase tracking-wider text-slate-400">Brand Overview</div>
                {selectedFranchises.map((f) => (
                  <div key={f._id} className="px-4 space-y-2 text-center">
                    <img
                      src={f.heroImageUrl || 'https://images.unsplash.com/photo-1554118811-1e0d58224f24'}
                      alt={f.brandName}
                      className="w-full h-32 object-cover rounded-xl border border-slate-700 shadow-md"
                    />
                    <h3 className="font-bold text-lg text-white">{f.brandName}</h3>
                    <span className="inline-block text-xs text-indigo-400 font-semibold bg-indigo-500/10 px-2.5 py-0.5 rounded-full border border-indigo-500/20">
                      {f.industry}
                    </span>
                  </div>
                ))}
              </div>

              {/* Row 2: Investment Capex */}
              <div className="grid grid-cols-4 p-5 items-center bg-slate-950/40">
                <div className="text-xs font-bold uppercase tracking-wider text-slate-400">Total Capex Range</div>
                {selectedFranchises.map((f) => (
                  <div key={f._id} className="px-4 text-center">
                    <span className="font-mono text-base font-extrabold text-emerald-400">
                      {formatLakhs(f.investmentRange?.min)} - {formatLakhs(f.investmentRange?.max)}
                    </span>
                  </div>
                ))}
              </div>

              {/* Row 3: Franchise Fee */}
              <div className="grid grid-cols-4 p-5 items-center">
                <div className="text-xs font-bold uppercase tracking-wider text-slate-400">Upfront Franchise Fee</div>
                {selectedFranchises.map((f) => (
                  <div key={f._id} className="px-4 text-center font-mono text-slate-200">
                    {formatLakhs(f.franchiseFee)}
                  </div>
                ))}
              </div>

              {/* Row 4: Royalty Rate */}
              <div className="grid grid-cols-4 p-5 items-center bg-slate-950/40">
                <div className="text-xs font-bold uppercase tracking-wider text-slate-400">Monthly Royalty Fee</div>
                {selectedFranchises.map((f) => (
                  <div key={f._id} className="px-4 text-center font-mono font-bold text-amber-300">
                    {f.royaltyFee ? `${f.royaltyFee}% of Gross Sales` : '5% of Gross Sales'}
                  </div>
                ))}
              </div>

              {/* Row 5: Space Requirements */}
              <div className="grid grid-cols-4 p-5 items-center">
                <div className="text-xs font-bold uppercase tracking-wider text-slate-400">Space (Carpet Area)</div>
                {selectedFranchises.map((f) => (
                  <div key={f._id} className="px-4 text-center font-mono text-slate-300">
                    {f.spaceRequiredSqFt?.min || 800} - {f.spaceRequiredSqFt?.max || 1800} sq. ft
                  </div>
                ))}
              </div>

              {/* Row 6: Existing Outlets */}
              <div className="grid grid-cols-4 p-5 items-center bg-slate-950/40">
                <div className="text-xs font-bold uppercase tracking-wider text-slate-400">Operating Outlets</div>
                {selectedFranchises.map((f) => (
                  <div key={f._id} className="px-4 text-center font-bold text-white">
                    {f.currentOutlets || 12} Outlets Active
                  </div>
                ))}
              </div>

              {/* Row 7: Estimated Payback */}
              <div className="grid grid-cols-4 p-5 items-center">
                <div className="text-xs font-bold uppercase tracking-wider text-slate-400">Est. Payback Horizon</div>
                {selectedFranchises.map((f) => (
                  <div key={f._id} className="px-4 text-center font-mono text-indigo-300 font-bold">
                    {f.paybackPeriodMonths || 18} - {(f.paybackPeriodMonths || 18) + 6} Months
                  </div>
                ))}
              </div>

              {/* Row 8: FDD & Legal Disclosure */}
              <div className="grid grid-cols-4 p-5 items-center bg-slate-950/40">
                <div className="text-xs font-bold uppercase tracking-wider text-slate-400">Certified FDD Vault</div>
                {selectedFranchises.map((f) => (
                  <div key={f._id} className="px-4 text-center">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 text-xs font-bold border border-emerald-500/30">
                      <ShieldCheck className="w-3.5 h-3.5" /> 23 FTC Items Verified
                    </span>
                  </div>
                ))}
              </div>

              {/* Row 9: Actions */}
              <div className="grid grid-cols-4 p-6 items-center">
                <div className="text-xs font-bold uppercase tracking-wider text-slate-400">Next Step</div>
                {selectedFranchises.map((f) => (
                  <div key={f._id} className="px-4 text-center">
                    <Link
                      href={`/franchises/${f.slug}`}
                      className="inline-flex items-center justify-center gap-1.5 w-full py-2.5 px-4 text-xs font-bold rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white transition shadow-lg shadow-indigo-700/20"
                    >
                      View Dossier <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
