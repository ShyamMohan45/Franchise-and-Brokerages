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
  SlidersHorizontal,
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
      if (res.success && res.data) {
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
    <div className="min-h-screen bg-[#F8FAFC] text-[#14243A] py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-10">
        {/* Header */}
        <div className="text-center space-y-4 max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#EFF4FF] border border-[#BFD3FE] text-[#315EFB] text-xs font-semibold">
            <Calculator className="w-3.5 h-3.5" />
            Financial Intelligence
          </div>
          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-[#14243A]">
            Expansion Cost & ROI Estimator
          </h1>
          <p className="text-[#64748B] text-base leading-relaxed">
            Simulate equipment capex, fitout leases, security deposits, and break-even timelines across Tier-1, Tier-2, and Tier-3 commercial corridors.
          </p>
        </div>

        {/* Main Grid: Inputs vs Results */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Inputs Column (5 cols) */}
          <div className="lg:col-span-5 surface-card p-6 sm:p-8 space-y-6">
            <div className="flex items-center justify-between pb-3 border-b border-[#E7ECF2]">
              <h2 className="text-base font-bold text-[#14243A]">Unit Parameters</h2>
              <button
                onClick={fetchEstimate}
                disabled={loading}
                className="text-xs text-[#315EFB] hover:text-[#2144EB] font-semibold flex items-center gap-1"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
                Recalculate
              </button>
            </div>

            {/* Industry Selection */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-[#64748B] uppercase tracking-wider">
                Sector / Industry
              </label>
              <select
                value={industry}
                onChange={(e) => setIndustry(e.target.value)}
                className="w-full bg-white border border-[#E7ECF2] rounded-xl px-3 py-2 text-xs text-[#14243A] focus:outline-none focus:border-[#315EFB]"
              >
                <option value="Food & Beverage">Food & Beverage (Café / QSR / Casual)</option>
                <option value="Health & Fitness">Health & Fitness (Smart Gym / Pilates)</option>
                <option value="Education & Childcare">Education & Preschool</option>
                <option value="Retail & Lifestyle">Retail & Consumer Goods</option>
                <option value="Salon & Wellness">Salon, Spa & Personal Care</option>
              </select>
            </div>

            {/* City Tier */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-[#64748B] uppercase tracking-wider">
                City / Market Tier
              </label>
              <div className="grid grid-cols-3 gap-2">
                {['Tier 1', 'Tier 2', 'Tier 3'].map((tier) => (
                  <button
                    key={tier}
                    type="button"
                    onClick={() => setCityTier(tier)}
                    className={`py-2 text-xs font-semibold rounded-xl border transition ${
                      cityTier === tier
                        ? 'bg-[#14243A] text-white border-[#14243A] shadow-sm'
                        : 'bg-[#F8FAFC] text-[#64748B] border-[#E7ECF2] hover:bg-white'
                    }`}
                  >
                    {tier}
                  </button>
                ))}
              </div>
            </div>

            {/* Store Size Slider */}
            <div className="space-y-2">
              <div className="flex justify-between items-center text-xs font-semibold">
                <span className="text-[#64748B] uppercase tracking-wider">Store Carpet Area</span>
                <span className="text-[#315EFB] font-bold">{sizeSqFt} sq. ft</span>
              </div>
              <input
                type="range"
                min={300}
                max={4000}
                step={50}
                value={sizeSqFt}
                onChange={(e) => setSizeSqFt(Number(e.target.value))}
                className="w-full accent-[#315EFB] bg-slate-200 rounded-lg cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-[#64748B]">
                <span>300 sq.ft (Kiosk)</span>
                <span>1,500 sq.ft (Standard)</span>
                <span>4,000 sq.ft (Flagship)</span>
              </div>
            </div>

            {/* Upfront Franchise Fee */}
            <div className="space-y-2">
              <div className="flex justify-between items-center text-xs font-semibold">
                <span className="text-[#64748B] uppercase tracking-wider">Upfront Franchise Fee</span>
                <span className="text-[#14243A] font-bold">{formatLakhs(customFranchiseFee)}</span>
              </div>
              <input
                type="range"
                min={200000}
                max={2500000}
                step={50000}
                value={customFranchiseFee}
                onChange={(e) => setCustomFranchiseFee(Number(e.target.value))}
                className="w-full accent-[#315EFB] bg-slate-200 rounded-lg cursor-pointer"
              />
            </div>

            {/* Fitout per Sq Ft */}
            <div className="space-y-2">
              <div className="flex justify-between items-center text-xs font-semibold">
                <span className="text-[#64748B] uppercase tracking-wider">Interior Fitout Rate</span>
                <span className="text-[#14243A] font-bold">₹{customInteriorPerSqFt}/sq.ft</span>
              </div>
              <input
                type="range"
                min={1000}
                max={3500}
                step={100}
                value={customInteriorPerSqFt}
                onChange={(e) => setCustomInteriorPerSqFt(Number(e.target.value))}
                className="w-full accent-[#315EFB] bg-slate-200 rounded-lg cursor-pointer"
              />
            </div>

            {/* Equipment Budget */}
            <div className="space-y-2">
              <div className="flex justify-between items-center text-xs font-semibold">
                <span className="text-[#64748B] uppercase tracking-wider">Equipment & Machinery</span>
                <span className="text-[#14243A] font-bold">{formatLakhs(customEquipment)}</span>
              </div>
              <input
                type="range"
                min={400000}
                max={3500000}
                step={100000}
                value={customEquipment}
                onChange={(e) => setCustomEquipment(Number(e.target.value))}
                className="w-full accent-[#315EFB] bg-slate-200 rounded-lg cursor-pointer"
              />
            </div>

            <div className="pt-2 border-t border-[#E7ECF2] text-[11px] text-[#64748B] flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-amber-500 flex-shrink-0" />
              <span>Includes 6-month rental security deposit and 10% operating reserve.</span>
            </div>
          </div>

          {/* Outputs Column (7 cols) */}
          <div className="lg:col-span-7 space-y-6">
            {/* Main Total Highlight Card */}
            <div className="surface-card p-6 sm:p-8 space-y-4 bg-white border border-[#BFD3FE]">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-[#315EFB] bg-[#EFF4FF] px-3 py-1 rounded-full">
                  Estimated Turnkey Capex
                </span>
                <span className="text-xs text-[#64748B]">
                  {cityTier} • {sizeSqFt} sq.ft
                </span>
              </div>

              <div className="flex items-baseline gap-3">
                <div className="text-4xl sm:text-5xl font-extrabold text-[#14243A] tracking-tight">
                  {formatLakhs(data?.totalEstimatedCapex)}
                </div>
                <span className="text-[#64748B] text-sm">all-in launch budget</span>
              </div>

              {/* Key Financial KPIs */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-4 border-t border-[#E7ECF2]">
                <div className="bg-[#F8FAFC] rounded-xl p-3 border border-[#E7ECF2]">
                  <span className="text-[11px] text-[#64748B] block">Monthly Revenue</span>
                  <span className="text-sm sm:text-base font-bold text-[#14243A]">
                    {formatLakhs(data?.projectedMonthlyRevenue)}
                  </span>
                </div>
                <div className="bg-[#F8FAFC] rounded-xl p-3 border border-[#E7ECF2]">
                  <span className="text-[11px] text-[#64748B] block">Monthly Net Profit (22%)</span>
                  <span className="text-sm sm:text-base font-bold text-[#159D8B]">
                    {formatLakhs(data?.projectedMonthlyNetProfit)}/mo
                  </span>
                </div>
                <div className="bg-[#F8FAFC] rounded-xl p-3 border border-[#E7ECF2] col-span-2 sm:col-span-1">
                  <span className="text-[11px] text-[#64748B] block">Payback Horizon</span>
                  <span className="text-sm sm:text-base font-bold text-[#315EFB]">
                    {data?.scenarios?.medium?.breakEvenMonths || 22} Months
                  </span>
                </div>
              </div>
            </div>

            {/* Line Item Breakdown */}
            <div className="surface-card p-6 sm:p-8 space-y-5">
              <h3 className="text-base font-bold text-[#14243A]">Detailed Cost Breakdown</h3>

              <div className="space-y-3">
                {[
                  { label: 'Interior Fitout & Architecture', val: data?.interiorFitout, pct: 38 },
                  { label: 'Equipment, POS & Hardware', val: data?.equipmentMachinery, pct: 20 },
                  { label: 'Real Estate Deposit (6 Mos)', val: data?.securityDeposit, pct: 18 },
                  { label: 'Franchise Fee & Onboarding', val: data?.franchiseFee, pct: 11 },
                  { label: 'Opening Raw Material Inventory', val: data?.initialInventory, pct: 6 },
                  { label: 'Working Capital & Contingency Buffer', val: data?.workingCapitalBuffer, pct: 5 },
                  { label: 'Marketing Launch & Licenses', val: (data?.grandOpeningMarketing || 0) + (data?.licensingAndLegal || 0), pct: 2 },
                ].map((item, idx) => (
                  <div key={idx} className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span className="text-[#64748B]">{item.label}</span>
                      <span className="font-semibold text-[#14243A]">{formatLakhs(item.val)}</span>
                    </div>
                    <div className="w-full h-1.5 bg-[#E7ECF2] rounded-full overflow-hidden">
                      <div
                        className="h-full bg-[#315EFB] rounded-full"
                        style={{ width: `${item.pct}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Scenarios Comparison */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="surface-card p-4 space-y-1">
                <span className="text-[10px] font-bold text-[#64748B] uppercase">Lean Capex</span>
                <div className="text-base font-bold text-[#14243A]">{formatLakhs(data?.scenarios?.low?.totalCapex)}</div>
                <span className="text-[11px] text-[#64748B]">{data?.scenarios?.low?.breakEvenMonths} mo break-even</span>
              </div>
              <div className="surface-card p-4 space-y-1 border-[#BFD3FE] bg-[#EFF4FF]">
                <span className="text-[10px] font-bold text-[#315EFB] uppercase">Base (Recommended)</span>
                <div className="text-base font-bold text-[#315EFB]">{formatLakhs(data?.scenarios?.medium?.totalCapex)}</div>
                <span className="text-[11px] text-[#64748B]">{data?.scenarios?.medium?.breakEvenMonths} mo break-even</span>
              </div>
              <div className="surface-card p-4 space-y-1">
                <span className="text-[10px] font-bold text-[#64748B] uppercase">Flagship High-Spec</span>
                <div className="text-base font-bold text-[#14243A]">{formatLakhs(data?.scenarios?.high?.totalCapex)}</div>
                <span className="text-[11px] text-[#64748B]">Includes premium fitout</span>
              </div>
            </div>

            {/* Action Bar */}
            <div className="surface-card p-5 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div>
                <span className="text-xs font-bold text-[#14243A] block">Explore Matching Franchises</span>
                <span className="text-[11px] text-[#64748B]">Find verified brands fitting your simulated capital range</span>
              </div>
              <Link href="/franchises" className="btn-primary py-2 px-5 text-xs font-semibold">
                Explore Matching Brands <ArrowRight className="w-3.5 h-3.5 ml-1" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
