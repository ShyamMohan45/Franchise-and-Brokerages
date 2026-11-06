'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  MapPin,
  TrendingUp,
  Building,
  DollarSign,
  Users,
  Compass,
  ArrowRight,
  ShieldCheck,
  Zap,
  BarChart3,
  Search,
} from 'lucide-react';

interface CityIntelligence {
  id: string;
  cityName: string;
  state: string;
  tier: 'Tier 1' | 'Tier 2';
  population: string;
  affluenceIndex: number; // 0-100
  highStreetRentPerSqFt: number; // INR
  mallRentPerSqFt: number; // INR
  footfallDensity: 'Very High' | 'High' | 'Moderate';
  topMicroMarkets: string[];
  whiteSpaceCategories: string[];
  saturationNotes: string;
  recommendedFormats: string[];
}

const CITY_DATA: CityIntelligence[] = [
  {
    id: 'blr',
    cityName: 'Bangalore',
    state: 'Karnataka',
    tier: 'Tier 1',
    population: '13.2 Million',
    affluenceIndex: 94,
    highStreetRentPerSqFt: 180,
    mallRentPerSqFt: 240,
    footfallDensity: 'Very High',
    topMicroMarkets: ['Indiranagar 100ft Rd', 'Koramangala 4th Block', 'HSR Layout 27th Main', 'Whitefield ITPL'],
    whiteSpaceCategories: ['Artisanal Coffee & Roasteries', 'Functional Fitness / Pilates', 'Organic Quick Meals'],
    saturationNotes: 'High QSR burger competition along commercial high-streets; massive white space in suburban tech belts.',
    recommendedFormats: ['Standard Inline (1,200 sq.ft)', 'Flagship Experience Hub (2,200 sq.ft)'],
  },
  {
    id: 'mum',
    cityName: 'Mumbai',
    state: 'Maharashtra',
    tier: 'Tier 1',
    population: '21.0 Million',
    affluenceIndex: 96,
    highStreetRentPerSqFt: 350,
    mallRentPerSqFt: 420,
    footfallDensity: 'Very High',
    topMicroMarkets: ['Bandra West Linking Rd', 'Juhu Tara Rd', 'BKC Commercial Hub', 'Powai Central Ave'],
    whiteSpaceCategories: ['Compact Cloud Kitchens', 'Micro-Boutique Salons', 'Express Grab-and-Go Kiosks'],
    saturationNotes: 'Premium square-foot rentals require high ticket sizes or ultra-compact express kiosk models to ensure 18-month payback.',
    recommendedFormats: ['Kiosk / Express (350 sq.ft)', 'Cloud Kitchen (600 sq.ft)'],
  },
  {
    id: 'del',
    cityName: 'Delhi NCR (Gurugram / Noida)',
    state: 'Delhi NCR',
    tier: 'Tier 1',
    population: '30.5 Million',
    affluenceIndex: 92,
    highStreetRentPerSqFt: 220,
    mallRentPerSqFt: 280,
    footfallDensity: 'Very High',
    topMicroMarkets: ['Cyber Hub Gurugram', 'Golf Course Ext Rd', 'Sector 18 Noida', 'Khan Market'],
    whiteSpaceCategories: ['Regional Casual Dining', 'Premium Preschools & Daycares', 'Wellness & Aesthetic Clinics'],
    saturationNotes: 'Sprawling residential developments in New Gurugram & Expressway Noida offer prime ground-floor retail anchors.',
    recommendedFormats: ['Standard Inline (1,500 sq.ft)', 'Preschool Campus (5,000 sq.ft)'],
  },
  {
    id: 'hyd',
    cityName: 'Hyderabad',
    state: 'Telangana',
    tier: 'Tier 1',
    population: '10.5 Million',
    affluenceIndex: 89,
    highStreetRentPerSqFt: 140,
    mallRentPerSqFt: 190,
    footfallDensity: 'High',
    topMicroMarkets: ['Jubilee Hills Road 36', 'Gachibowli Financial Dist', 'Madhapur', 'Kukatpally KPHB'],
    whiteSpaceCategories: ['Specialty Beverage & Boba', 'Smart 24/7 Fitness Hubs', 'Specialty Biryani & Sweets'],
    saturationNotes: 'Fastest-growing tech talent demographic; lower real estate rentals compared to Mumbai/Delhi maximize franchisee margins.',
    recommendedFormats: ['Standard Inline (1,400 sq.ft)', 'Drive-Thru Highway Format'],
  },
  {
    id: 'pun',
    cityName: 'Pune',
    state: 'Maharashtra',
    tier: 'Tier 2',
    population: '7.2 Million',
    affluenceIndex: 85,
    highStreetRentPerSqFt: 110,
    mallRentPerSqFt: 160,
    footfallDensity: 'High',
    topMicroMarkets: ['Koregaon Park North Main', 'Kalyani Nagar', 'Baner High Street', 'Viman Nagar'],
    whiteSpaceCategories: ['Youth Lifestyle Cafés', 'Automotive Detailing Lounges', 'Co-working Cafes'],
    saturationNotes: 'Massive student and young software engineer cohort; exceptionally receptive to novel beverage and dessert franchises.',
    recommendedFormats: ['Standard Inline (1,000 sq.ft)', 'Café & Bakery (1,200 sq.ft)'],
  },
  {
    id: 'ahm',
    cityName: 'Ahmedabad',
    state: 'Gujarat',
    tier: 'Tier 2',
    population: '8.4 Million',
    affluenceIndex: 87,
    highStreetRentPerSqFt: 95,
    mallRentPerSqFt: 140,
    footfallDensity: 'High',
    topMicroMarkets: ['Sindhu Bhavan Road (SBR)', 'CG Road', 'Bodakdev', 'Prahlad Nagar'],
    whiteSpaceCategories: ['Vegetarian Gourmet / Fine Dining', 'Dessert & Mocktail Bars', 'Education Franchises'],
    saturationNotes: 'Strong domestic entrepreneurship culture; late-night dining culture along SG Highway and Sindhu Bhavan Road.',
    recommendedFormats: ['Large Format Family Dining (2,500 sq.ft)'],
  },
];

export default function LocationIntelligencePage() {
  const [selectedCity, setSelectedCity] = useState<CityIntelligence>(CITY_DATA[0]);
  const [searchFilter, setSearchFilter] = useState('');

  const filteredCities = CITY_DATA.filter(
    (c) =>
      c.cityName.toLowerCase().includes(searchFilter.toLowerCase()) ||
      c.state.toLowerCase().includes(searchFilter.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 py-12 px-4 sm:px-6 lg:px-8 selection:bg-emerald-500 selection:text-white">
      <div className="max-w-7xl mx-auto space-y-10">
        {/* Header */}
        <div className="text-center space-y-4 max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-teal-500/10 border border-teal-500/30 text-teal-400 text-xs font-semibold uppercase tracking-wider">
            <Compass className="w-4 h-4" />
            Macro-Demographic Expansion Suite
          </div>
          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">
            Franchise Location Intelligence
          </h1>
          <p className="text-slate-400 text-base sm:text-lg">
            Empowering franchisors and multi-unit investors with granular retail rental benchmarks, consumer spending indexes, and category whitespace analysis.
          </p>
        </div>

        {/* City Filter Pills */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              placeholder="Filter city or state..."
              value={searchFilter}
              onChange={(e) => setSearchFilter(e.target.value)}
              className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-9 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
          </div>

          <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto pb-2 sm:pb-0 scrollbar-none">
            {filteredCities.map((city) => (
              <button
                key={city.id}
                onClick={() => setSelectedCity(city)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold border whitespace-nowrap transition ${
                  selectedCity.id === city.id
                    ? 'bg-teal-600 text-white border-teal-500 shadow-md shadow-teal-700/30'
                    : 'bg-slate-900 text-slate-300 border-slate-800 hover:bg-slate-800'
                }`}
              >
                {city.cityName}
              </button>
            ))}
          </div>
        </div>

        {/* Selected City Intelligence Dashboard */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: City Macro Scorecard (5 cols) */}
          <div className="lg:col-span-5 bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl">
            <div className="flex justify-between items-start">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-teal-400 bg-teal-500/10 px-2.5 py-1 rounded-full border border-teal-500/20">
                  {selectedCity.tier} Market
                </span>
                <h2 className="text-3xl font-extrabold text-white mt-2">{selectedCity.cityName}</h2>
                <p className="text-sm text-slate-400">{selectedCity.state} • Population {selectedCity.population}</p>
              </div>
              <div className="text-right">
                <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Affluence Index</span>
                <span className="text-3xl font-black text-amber-300 font-mono">
                  {selectedCity.affluenceIndex}/100
                </span>
              </div>
            </div>

            {/* Rental Rates Gauge */}
            <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center justify-between">
                <span>Average Retail Real Estate Rentals</span>
                <DollarSign className="w-3.5 h-3.5 text-teal-400" />
              </h3>

              <div className="grid grid-cols-2 gap-3">
                <div className="bg-slate-900 p-3 rounded-xl border border-slate-800">
                  <span className="text-[11px] text-slate-400 block">High-Street Ground Floor</span>
                  <span className="text-lg font-extrabold text-white font-mono">
                    ₹{selectedCity.highStreetRentPerSqFt}
                  </span>
                  <span className="text-[10px] text-slate-500 block">/sq.ft /month</span>
                </div>
                <div className="bg-slate-900 p-3 rounded-xl border border-slate-800">
                  <span className="text-[11px] text-slate-400 block">Grade A Mall / Food Court</span>
                  <span className="text-lg font-extrabold text-white font-mono">
                    ₹{selectedCity.mallRentPerSqFt}
                  </span>
                  <span className="text-[10px] text-slate-500 block">/sq.ft /month</span>
                </div>
              </div>
            </div>

            {/* Top Micro-Markets */}
            <div className="space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-teal-400" />
                Prime High-Footfall Micro-Markets
              </h3>
              <div className="flex flex-wrap gap-2">
                {selectedCity.topMicroMarkets.map((loc, idx) => (
                  <span
                    key={idx}
                    className="px-3 py-1.5 rounded-xl bg-slate-800 text-xs font-medium text-slate-200 border border-slate-700/80"
                  >
                    {loc}
                  </span>
                ))}
              </div>
            </div>

            {/* Recommended Store Formats */}
            <div className="space-y-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Recommended Unit Formats
              </h3>
              <div className="space-y-1.5">
                {selectedCity.recommendedFormats.map((fmt, idx) => (
                  <div key={idx} className="flex items-center gap-2 text-xs text-slate-300">
                    <Zap className="w-3.5 h-3.5 text-teal-400 flex-shrink-0" />
                    <span>{fmt}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column: Market Whitespace & Saturation Notes (7 cols) */}
          <div className="lg:col-span-7 space-y-6">
            {/* Whitespace Opportunities Card */}
            <div className="bg-gradient-to-br from-teal-950/60 via-slate-900 to-slate-900 border border-teal-500/40 rounded-3xl p-6 sm:p-8 space-y-5 shadow-2xl">
              <div className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-teal-400" />
                <h3 className="text-lg font-bold text-white">
                  Identified White Space Sectors in {selectedCity.cityName}
                </h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {selectedCity.whiteSpaceCategories.map((cat, idx) => (
                  <div
                    key={idx}
                    className="p-4 rounded-2xl bg-slate-800/80 border border-slate-700/80 space-y-1"
                  >
                    <span className="text-[10px] font-bold uppercase tracking-wider text-teal-400">
                      High Growth
                    </span>
                    <div className="text-sm font-bold text-white leading-snug">{cat}</div>
                  </div>
                ))}
              </div>

              {/* Saturation Notes */}
              <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-2">
                <span className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4" /> Brokerage Expansion Note
                </span>
                <p className="text-xs text-slate-300 leading-relaxed">
                  {selectedCity.saturationNotes}
                </p>
              </div>
            </div>

            {/* Target Cities Comparison Table */}
            <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-4 shadow-xl">
              <h3 className="text-base font-bold text-white">Cross-Market Benchmark Snapshot</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-slate-800 text-slate-400 uppercase tracking-wider font-semibold">
                      <th className="py-2.5">City</th>
                      <th className="py-2.5">Tier</th>
                      <th className="py-2.5">Affluence</th>
                      <th className="py-2.5">High-Street Rent</th>
                      <th className="py-2.5">Footfall</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 font-mono">
                    {CITY_DATA.map((c) => (
                      <tr
                        key={c.id}
                        onClick={() => setSelectedCity(c)}
                        className={`cursor-pointer hover:bg-slate-800/60 transition ${
                          c.id === selectedCity.id ? 'bg-teal-950/30 font-bold text-teal-300' : 'text-slate-300'
                        }`}
                      >
                        <td className="py-3 font-sans font-medium">{c.cityName}</td>
                        <td className="py-3">{c.tier}</td>
                        <td className="py-3 text-amber-300">{c.affluenceIndex}/100</td>
                        <td className="py-3">₹{c.highStreetRentPerSqFt}/sq.ft</td>
                        <td className="py-3 font-sans">
                          <span className="text-emerald-400 font-semibold">{c.footfallDensity}</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Call to action */}
            <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="space-y-0.5 text-center sm:text-left">
                <div className="text-sm font-bold text-white">Planning your territory rollout?</div>
                <div className="text-xs text-slate-400">
                  Model your capex scenarios or initiate partner screening inside our Digital Deal Room.
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Link
                  href="/calculator"
                  className="px-4 py-2 text-xs font-semibold rounded-xl bg-slate-800 text-slate-200 hover:bg-slate-700 transition"
                >
                  Calculate Capex
                </Link>
                <Link
                  href="/franchises"
                  className="px-5 py-2 text-xs font-bold rounded-xl bg-teal-600 text-white hover:bg-teal-500 transition shadow-lg shadow-teal-700/20 flex items-center gap-1.5"
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
