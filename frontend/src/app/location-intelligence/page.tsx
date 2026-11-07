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
  affluenceIndex: number;
  highStreetRentPerSqFt: number;
  mallRentPerSqFt: number;
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
    <div className="min-h-screen bg-[#F8FAFC] text-[#14243A] py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-10">
        {/* Header */}
        <div className="text-center space-y-4 max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#E6F7F5] border border-[#C2EDE7] text-[#159D8B] text-xs font-semibold">
            <Compass className="w-3.5 h-3.5" />
            Catchment Demographic Suite
          </div>
          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-[#14243A]">
            Franchise Location Intelligence
          </h1>
          <p className="text-[#64748B] text-base sm:text-lg">
            Empowering franchisors and multi-unit investors with granular retail rental benchmarks, consumer affluence indexes, and category whitespace analysis.
          </p>
        </div>

        {/* City Filter Pills */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 text-[#64748B] absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Filter city or state..."
              value={searchFilter}
              onChange={(e) => setSearchFilter(e.target.value)}
              className="w-full bg-white border border-[#E7ECF2] rounded-xl pl-9 pr-4 py-2 text-xs text-[#14243A] placeholder-[#64748B] focus:outline-none focus:border-[#315EFB]"
            />
          </div>

          <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto pb-2 sm:pb-0">
            {filteredCities.map((city) => (
              <button
                key={city.id}
                onClick={() => setSelectedCity(city)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold border whitespace-nowrap transition ${
                  selectedCity.id === city.id
                    ? 'bg-[#14243A] text-white border-[#14243A] shadow-sm'
                    : 'bg-white text-[#64748B] border-[#E7ECF2] hover:bg-[#F8FAFC]'
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
          <div className="lg:col-span-5 surface-card p-6 sm:p-8 space-y-6">
            <div className="flex justify-between items-start pb-4 border-b border-[#E7ECF2]">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#159D8B] bg-[#E6F7F5] px-2.5 py-0.5 rounded-md">
                  {selectedCity.tier} Market
                </span>
                <h2 className="text-2xl sm:text-3xl font-extrabold text-[#14243A] mt-2">
                  {selectedCity.cityName}
                </h2>
                <p className="text-xs text-[#64748B] mt-0.5">
                  {selectedCity.state} • Population {selectedCity.population}
                </p>
              </div>
              <div className="text-right">
                <span className="text-[10px] text-[#64748B] uppercase tracking-wider block">Affluence Index</span>
                <span className="text-2xl sm:text-3xl font-bold text-[#315EFB]">
                  {selectedCity.affluenceIndex}/100
                </span>
              </div>
            </div>

            {/* Rental Rates Gauge */}
            <div className="p-4 rounded-xl bg-[#F8FAFC] border border-[#E7ECF2] space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#64748B] flex items-center justify-between">
                <span>Average Retail Real Estate Rentals</span>
                <DollarSign className="w-3.5 h-3.5 text-[#315EFB]" />
              </h3>

              <div className="grid grid-cols-2 gap-3">
                <div className="bg-white p-3 rounded-lg border border-[#E7ECF2]">
                  <span className="text-[11px] text-[#64748B] block">High-Street Ground</span>
                  <span className="text-base font-bold text-[#14243A]">
                    ₹{selectedCity.highStreetRentPerSqFt}
                  </span>
                  <span className="text-[10px] text-[#64748B] block">/sq.ft /month</span>
                </div>
                <div className="bg-white p-3 rounded-lg border border-[#E7ECF2]">
                  <span className="text-[11px] text-[#64748B] block">Grade-A Mall Retail</span>
                  <span className="text-base font-bold text-[#14243A]">
                    ₹{selectedCity.mallRentPerSqFt}
                  </span>
                  <span className="text-[10px] text-[#64748B] block">/sq.ft /month</span>
                </div>
              </div>
            </div>

            {/* Top Micro-Markets */}
            <div className="space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#64748B]">
                Prime High-Street Micro-Markets
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {selectedCity.topMicroMarkets.map((mm, idx) => (
                  <div
                    key={idx}
                    className="p-2.5 rounded-lg bg-[#F8FAFC] border border-[#E7ECF2] text-xs font-medium text-[#14243A] flex items-center gap-2"
                  >
                    <MapPin className="w-3.5 h-3.5 text-[#315EFB] shrink-0" />
                    <span className="truncate">{mm}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column: Whitespace & Expansion Strategy (7 cols) */}
          <div className="lg:col-span-7 space-y-6">
            {/* Whitespace Opportunities Card */}
            <div className="surface-card p-6 sm:p-8 space-y-4">
              <h3 className="text-base font-bold text-[#14243A] flex items-center gap-2">
                <Zap className="w-4 h-4 text-[#315EFB]" />
                Under-Served Whitespace Categories
              </h3>
              <p className="text-xs text-[#64748B] leading-relaxed">
                Categories with high consumer demand and insufficient branded outlet density in {selectedCity.cityName}:
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {selectedCity.whiteSpaceCategories.map((ws, idx) => (
                  <div
                    key={idx}
                    className="p-3.5 rounded-xl bg-[#EFF4FF] border border-[#BFD3FE] text-xs font-bold text-[#315EFB]"
                  >
                    {ws}
                  </div>
                ))}
              </div>

              {/* Saturation Notes */}
              <div className="pt-3 border-t border-[#E7ECF2] text-xs text-[#64748B] leading-relaxed">
                <strong className="text-[#14243A]">Market Saturation Intelligence:</strong>{' '}
                {selectedCity.saturationNotes}
              </div>
            </div>

            {/* Recommended Formats */}
            <div className="surface-card p-6 sm:p-8 space-y-4">
              <h3 className="text-base font-bold text-[#14243A] flex items-center gap-2">
                <Building className="w-4 h-4 text-[#159D8B]" />
                Optimal Unit Formats for {selectedCity.cityName}
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {selectedCity.recommendedFormats.map((fmt, idx) => (
                  <div
                    key={idx}
                    className="p-3.5 rounded-xl bg-[#E6F7F5] border border-[#C2EDE7] text-xs font-bold text-[#159D8B]"
                  >
                    {fmt}
                  </div>
                ))}
              </div>
            </div>

            {/* CTA */}
            <div className="surface-card p-5 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div>
                <span className="text-xs font-bold text-[#14243A] block">Looking to Expand in {selectedCity.cityName}?</span>
                <span className="text-[11px] text-[#64748B]">Explore verified franchise opportunities targeting this territory.</span>
              </div>
              <Link
                href={`/franchises?search=${selectedCity.cityName}`}
                className="btn-primary py-2 px-5 text-xs font-semibold"
              >
                View Opportunities <ArrowRight className="w-3.5 h-3.5 ml-1" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
