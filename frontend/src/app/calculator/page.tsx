'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Calculator,
  TrendingUp,
  Building,
  DollarSign,
  ShieldAlert,
  ArrowRight,
  Download,
  Sparkles,
  PieChart,
  CheckCircle2,
  HelpCircle,
  RefreshCw,
} from 'lucide-react';

interface Scenario {
  totalCapex: number;
  monthlyOpex: number;
  breakEvenMonths: number;
}

interface CostBreakdown {
  brandName: string;
  industry: string;
  cityTier: string;
  storeFormat: string;
  sizeSqFt: number;
  franchiseFee: number;
  securityDeposit: number;
  interiorFitout: number;
  equipmentMachinery: number;
  initialInventory: number;
  licensingAndLegal: number;
  grandOpeningMarketing: number;
  workingCapitalBuffer: number;
  totalEstimatedCapex: number;
  projectedMonthlyRevenue: number;
  projectedMonthlyNetProfit: number;
  projectedNetMarginPercent: number;
  scenarios: {
    low: Scenario;
    medium: Scenario;
    high: Scenario;
  };
}

export default function CalculatorPage() {
  const [brandName, setBrandName] = useState('My Dream Franchise');
  const [industry, setIndustry] = useState('Food & Beverage');
  const [cityTier, setCityTier] = useState('Tier 1');
  const [storeFormat, setStoreFormat] = useState('Standard Inline');
  const [sizeSqFt, setSizeSqFt] = useState(1200);
  const [customFranchiseFee, setCustomFranchiseFee] = useState(800000);
  const [customInteriorPerSqFt, setCustomInteriorPerSqFt] = useState(1800);
  const [customEquipment, setCustomEquipment] = useState(1200000);

  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<CostBreakdown | null>(null);

  const fetchEstimate = async () => {
    setLoading(true);
    try {
      const response = await fetch('http://localhost:5000/api/cost-estimator/calculate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          brandName,
          industry,
          cityTier,
          storeFormat,
          sizeSqFt,
          customFranchiseFee,
          customInteriorPerSqFt,
          customEquipment,
        }),
      });
      const res = await response.json();
      if (res.success) {
        setData(res.data);
      }
    } catch (err) {
      console.error('Failed to calculate estimate', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEstimate();
  }, [cityTier, sizeSqFt, customFranchiseFee, customInteriorPerSqFt, customEquipment, industry]);

  const formatLakhs = (val?: number) => {
    if (!val) return '₹0';
    if (val >= 10000000) return `₹${(val / 10000000).toFixed(2)} Cr`;
    return `₹${(val / 100000).toFixed(2)} L`;
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 py-12 px-4 sm:px-6 lg:px-8 selection:bg-emerald-500 selection:text-white">
      <div className="max-w-7xl mx-auto space-y-10">
        {/* Header */}
        <div className="text-center space-y-4 max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold uppercase tracking-wider">
            <Calculator className="w-4 h-4" />
            Enterprise Expansion Calculator
          </div>
          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">
            Franchise Expansion Cost Estimator
          </h1>
          <p className="text-slate-400 text-base sm:text-lg">
            Forecast multi-tier capex requirements, working capital buffers, and break-even timelines based on audited retail models across Indian metro & tier-2 markets.
          </p>
        </div>

        {/* Main Grid: Inputs vs Results */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Inputs Column (5 cols) */}
          <div className="lg:col-span-5 bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6 shadow-xl backdrop-blur-xl">
            <h2 className="text-xl font-bold text-white flex items-center justify-between">
              <span>Unit Parameters</span>
              <button
                onClick={fetchEstimate}
                disabled={loading}
                className="text-xs text-emerald-400 hover:text-emerald-300 flex items-center gap-1"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
                Recalculate
              </button>
            </h2>

            {/* Industry */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Sector / Industry
              </label>
              <select
                value={industry}
                onChange={(e) => setIndustry(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              >
                <option value="Food & Beverage">Food & Beverage (Café / QSR / Casual)</option>
                <option value="Health & Fitness">Health & Fitness (Smart Gym / Pilates)</option>
                <option value="Education & Childcare">Education & Preschool</option>
                <option value="Retail & Lifestyle">Retail & Consumer Goods</option>
                <option value="Salon & Wellness">Salon, Spa & Personal Care</option>
              </select>
            </div>

            {/* City Tier */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                City / Market Tier
              </label>
              <div className="grid grid-cols-3 gap-2">
                {['Tier 1', 'Tier 2', 'Tier 3'].map((tier) => (
                  <button
                    key={tier}
                    type="button"
                    onClick={() => setCityTier(tier)}
                    className={`py-2 text-xs font-bold rounded-xl border transition ${
                      cityTier === tier
                        ? 'bg-emerald-600 text-white border-emerald-500 shadow-md shadow-emerald-700/30'
                        : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-750'
                    }`}
                  >
                    {tier}
                  </button>
                ))}
              </div>
              <p className="text-[11px] text-slate-400">
                {cityTier === 'Tier 1'
                  ? 'Metro: Mumbai, Bangalore, Delhi NCR (High rentals, top spending)'
                  : cityTier === 'Tier 2'
                  ? 'Growth Hub: Pune, Ahmedabad, Hyderabad, Jaipur (Balanced capex)'
                  : 'Emerging: Tier-3 towns with lower rental deposits'}
              </p>
            </div>

            {/* Store Size Slider */}
            <div className="space-y-2">
              <div className="flex justify-between items-center text-xs font-semibold">
                <span className="text-slate-400 uppercase tracking-wider">Store Carpet Area</span>
                <span className="text-emerald-400 font-mono text-sm">{sizeSqFt} sq. ft</span>
              </div>
              <input
                type="range"
                min={300}
                max={4000}
                step={50}
                value={sizeSqFt}
                onChange={(e) => setSizeSqFt(Number(e.target.value))}
                className="w-full accent-emerald-500 bg-slate-800 rounded-lg cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                <span>300 sq.ft (Kiosk)</span>
                <span>1,500 sq.ft (Standard)</span>
                <span>4,000 sq.ft (Flagship)</span>
              </div>
            </div>

            {/* Upfront Franchise Fee */}
            <div className="space-y-2">
              <div className="flex justify-between items-center text-xs font-semibold">
                <span className="text-slate-400 uppercase tracking-wider">Upfront Franchise Fee</span>
                <span className="text-white font-mono">{formatLakhs(customFranchiseFee)}</span>
              </div>
              <input
                type="range"
                min={200000}
                max={2500000}
                step={50000}
                value={customFranchiseFee}
                onChange={(e) => setCustomFranchiseFee(Number(e.target.value))}
                className="w-full accent-emerald-500 bg-slate-800 rounded-lg cursor-pointer"
              />
            </div>

            {/* Fitout per Sq Ft */}
            <div className="space-y-2">
              <div className="flex justify-between items-center text-xs font-semibold">
                <span className="text-slate-400 uppercase tracking-wider">Interior Fitout Rate</span>
                <span className="text-white font-mono">₹{customInteriorPerSqFt}/sq.ft</span>
              </div>
              <input
                type="range"
                min={1000}
                max={3500}
                step={100}
                value={customInteriorPerSqFt}
                onChange={(e) => setCustomInteriorPerSqFt(Number(e.target.value))}
                className="w-full accent-emerald-500 bg-slate-800 rounded-lg cursor-pointer"
              />
            </div>

            {/* Equipment Budget */}
            <div className="space-y-2">
              <div className="flex justify-between items-center text-xs font-semibold">
                <span className="text-slate-400 uppercase tracking-wider">Equipment & Machinery</span>
                <span className="text-white font-mono">{formatLakhs(customEquipment)}</span>
              </div>
              <input
                type="range"
                min={400000}
                max={3500000}
                step={100000}
                value={customEquipment}
                onChange={(e) => setCustomEquipment(Number(e.target.value))}
                className="w-full accent-emerald-500 bg-slate-800 rounded-lg cursor-pointer"
              />
            </div>

            <div className="pt-2 border-t border-slate-800 text-[11px] text-slate-400 flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-amber-400 flex-shrink-0" />
              <span>Calculations incorporate 6-month security deposit and 10% contingency reserve.</span>
            </div>
          </div>

          {/* Outputs Column (7 cols) */}
          <div className="lg:col-span-7 space-y-6">
            {/* Main Total Highlight Card */}
            <div className="bg-gradient-to-br from-emerald-950/70 via-slate-900 to-slate-900 border border-emerald-500/40 rounded-3xl p-6 sm:p-8 relative overflow-hidden shadow-2xl">
              <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
                <Building className="w-48 h-48 text-emerald-400" />
              </div>

              <div className="relative z-10 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/30">
                    Estimated Base Turnkey Capex
                  </span>
                  <span className="text-xs text-slate-400 font-mono">
                    {cityTier} • {sizeSqFt} sq.ft
                  </span>
                </div>

                <div className="flex items-baseline gap-3">
                  <div className="text-4xl sm:text-6xl font-black text-white tracking-tight">
                    {formatLakhs(data?.totalEstimatedCapex)}
                  </div>
                  <span className="text-slate-400 text-sm">all-in turnkey launch</span>
                </div>

                {/* Key Financial KPIs */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-4 border-t border-slate-800/80">
                  <div className="bg-slate-800/60 rounded-2xl p-3 border border-slate-700/60">
                    <span className="text-[11px] text-slate-400 block">Est. Monthly Revenue</span>
                    <span className="text-base font-bold text-white font-mono">
                      {formatLakhs(data?.projectedMonthlyRevenue)}
                    </span>
                  </div>
                  <div className="bg-slate-800/60 rounded-2xl p-3 border border-slate-700/60">
                    <span className="text-[11px] text-slate-400 block">Est. Net Profit (22%)</span>
                    <span className="text-base font-bold text-emerald-400 font-mono">
                      {formatLakhs(data?.projectedMonthlyNetProfit)}/mo
                    </span>
                  </div>
                  <div className="bg-slate-800/60 rounded-2xl p-3 border border-slate-700/60 col-span-2 sm:col-span-1">
                    <span className="text-[11px] text-slate-400 block">Est. Payback Horizon</span>
                    <span className="text-base font-bold text-amber-300 font-mono">
                      {data?.scenarios?.medium?.breakEvenMonths || 22} Months
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Line Item Breakdown */}
            <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-5 shadow-xl">
              <h3 className="text-lg font-bold text-white flex items-center justify-between">
                <span>Detailed Cost Breakdown</span>
                <span className="text-xs text-slate-400 font-normal">Itemized estimation</span>
              </h3>

              <div className="space-y-3">
                {[
                  { label: 'Interior Fitout & Architecture', val: data?.interiorFitout, pct: 38 },
                  { label: 'Equipment, Kitchen Hardware & POS', val: data?.equipmentMachinery, pct: 20 },
                  { label: 'Real Estate Security Deposit (6 Mos)', val: data?.securityDeposit, pct: 18 },
                  { label: 'Franchise Brand Royalty & Onboarding Fee', val: data?.franchiseFee, pct: 11 },
                  { label: 'Opening Raw Material Inventory', val: data?.initialInventory, pct: 6 },
                  { label: 'Working Capital & Contingency Buffer', val: data?.workingCapitalBuffer, pct: 5 },
                  { label: 'Local Marketing Launch & Legal/FSSAI', val: (data?.grandOpeningMarketing || 0) + (data?.licensingAndLegal || 0), pct: 2 },
                ].map((item, idx) => (
                  <div key={idx} className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span className="text-slate-300">{item.label}</span>
                      <span className="font-mono text-white font-medium">{formatLakhs(item.val)}</span>
                    </div>
                    <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full"
                        style={{ width: `${item.pct}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Low / Medium / High Scenario Comparison */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-2">
                <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">Low Capex (Lean)</div>
                <div className="text-xl font-black text-white font-mono">
                  {formatLakhs(data?.scenarios?.low?.totalCapex)}
                </div>
                <p className="text-[11px] text-slate-400">
                  Value-engineered materials with {data?.scenarios?.low?.breakEvenMonths} mo break-even.
                </p>
              </div>

              <div className="bg-emerald-950/40 border border-emerald-500/50 rounded-2xl p-5 space-y-2">
                <div className="text-xs font-bold text-emerald-400 uppercase tracking-wider">Base (Recommended)</div>
                <div className="text-xl font-black text-emerald-300 font-mono">
                  {formatLakhs(data?.scenarios?.medium?.totalCapex)}
                </div>
                <p className="text-[11px] text-slate-300">
                  Standard spec floorplan with {data?.scenarios?.medium?.breakEvenMonths} mo break-even.
                </p>
              </div>

              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-2">
                <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">High (Premium Flagship)</div>
                <div className="text-xl font-black text-white font-mono">
                  {formatLakhs(data?.scenarios?.high?.totalCapex)}
                </div>
                <p className="text-[11px] text-slate-400">
                  Includes 18% contingency and high-spec fitout.
                </p>
              </div>
            </div>

            {/* Actions Bar */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-5 rounded-2xl bg-slate-900 border border-slate-800">
              <div className="space-y-0.5 text-center sm:text-left">
                <div className="text-sm font-bold text-white">Ready to explore matching opportunities?</div>
                <div className="text-xs text-slate-400">Browse verified franchise brands operating within your budget range.</div>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => window.print()}
                  className="px-4 py-2 text-xs font-semibold rounded-xl bg-slate-800 text-slate-200 hover:bg-slate-700 transition flex items-center gap-1.5"
                >
                  <Download className="w-3.5 h-3.5" />
                  Print Summary
                </button>
                <Link
                  href="/franchises"
                  className="px-5 py-2 text-xs font-bold rounded-xl bg-emerald-600 text-white hover:bg-emerald-500 transition shadow-lg shadow-emerald-700/20 flex items-center gap-1.5"
                >
                  Explore Brands <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
