"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useAuth } from "@/providers/AuthProvider";
import {
  Building2,
  Search,
  Menu,
  X,
  LogOut,
  ChevronDown,
  TrendingUp,
  Sparkles,
  ArrowRight,
  Shield,
  FileCheck2,
  Scale,
  Users2,
} from "lucide-react";

export function Navbar() {
  const { user, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [servicesOpen, setServicesOpen] = useState(false);

  const getDashboardUrl = () => {
    if (!user) return "/login";
    if (user.role === "admin" || user.role === "super_admin") return "/dashboard/admin";
    if (user.role === "investor") return "/dashboard/investor";
    return "/dashboard/business";
  };

  return (
    <header className="sticky top-0 z-50 bg-[#070B14]/90 backdrop-blur-xl border-b border-white/[0.08] text-white">
      {/* Top Ambient Announcement Bar */}
      <div className="bg-gradient-to-r from-blue-950/90 via-[#0B1220] to-amber-950/70 border-b border-white/[0.06] text-[11px] py-1.5 px-4 text-center font-medium">
        <div className="max-w-7xl mx-auto flex items-center justify-center gap-2">
          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 font-semibold text-[10px] border border-emerald-500/20">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            2026 Cohort
          </span>
          <span className="text-slate-300">
            Multi-Unit Franchise Investor Applications & Brand SOP Review Now Live
          </span>
          <Link
            href="/franchises"
            className="inline-flex items-center gap-1 font-semibold text-amber-400 hover:text-amber-300 ml-1 transition-colors"
          >
            Explore Portfolio <ArrowRight className="w-3 h-3" />
          </Link>
        </div>
      </div>

      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        {/* Brand Logo */}
        <Link href="/" className="flex items-center gap-3.5 group">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 via-blue-600 to-amber-400 p-[1.5px] shadow-[0_0_20px_rgba(37,99,235,0.3)] group-hover:shadow-[0_0_25px_rgba(212,175,55,0.4)] transition-all">
            <div className="w-full h-full bg-[#070B14] rounded-[10px] flex items-center justify-center">
              <Building2 className="w-5 h-5 text-amber-400 group-hover:scale-110 transition-transform" />
            </div>
          </div>
          <div className="flex flex-col">
            <span className="text-xl font-extrabold tracking-tight text-white flex items-center gap-0.5">
              Franchise<span className="gold-gradient-text">Bridge</span>
            </span>
            <span className="text-[10px] uppercase tracking-widest text-slate-400 font-semibold -mt-0.5">
              Development & Brokerage
            </span>
          </div>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden lg:flex items-center gap-8 text-[13px] font-semibold text-slate-300">
          <Link
            href="/franchises"
            className="hover:text-white transition-colors flex items-center gap-1.5 py-1 px-2.5 rounded-lg hover:bg-white/[0.04]"
          >
            <Search className="w-3.5 h-3.5 text-blue-400" />
            Marketplace
          </Link>

          {/* Services Mega Dropdown */}
          <div
            className="relative"
            onMouseEnter={() => setServicesOpen(true)}
            onMouseLeave={() => setServicesOpen(false)}
          >
            <button className="flex items-center gap-1 hover:text-white transition-colors py-2 px-2.5 rounded-lg hover:bg-white/[0.04]">
              Solutions
              <ChevronDown className={`w-3.5 h-3.5 transition-transform ${servicesOpen ? "rotate-180" : ""}`} />
            </button>

            {servicesOpen && (
              <div className="absolute top-full left-0 w-80 bg-[#0B1220]/95 backdrop-blur-2xl border border-white/[0.1] rounded-2xl shadow-2xl p-3 space-y-1.5 animate-in fade-in slide-in-from-top-2 duration-150">
                <Link
                  href="/services/franchise-development"
                  className="flex items-start gap-3 p-2.5 rounded-xl text-slate-300 hover:bg-white/[0.06] hover:text-white transition-all group"
                >
                  <div className="p-2 rounded-lg bg-blue-500/10 text-blue-400 group-hover:bg-blue-500/20">
                    <TrendingUp className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="font-bold text-white text-xs">Franchise Readiness</div>
                    <div className="text-[11px] text-slate-400 mt-0.5">8-Pillar diagnostic & economic packaging</div>
                  </div>
                </Link>

                <Link
                  href="/services/sop-development"
                  className="flex items-start gap-3 p-2.5 rounded-xl text-slate-300 hover:bg-white/[0.06] hover:text-white transition-all group"
                >
                  <div className="p-2 rounded-lg bg-amber-500/10 text-amber-400 group-hover:bg-amber-500/20">
                    <FileCheck2 className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="font-bold text-white text-xs">SOP Codification</div>
                    <div className="text-[11px] text-slate-400 mt-0.5">Operational manuals & quality checklists</div>
                  </div>
                </Link>

                <Link
                  href="/services/legal-documentation"
                  className="flex items-start gap-3 p-2.5 rounded-xl text-slate-300 hover:bg-white/[0.06] hover:text-white transition-all group"
                >
                  <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-400 group-hover:bg-indigo-500/20">
                    <Scale className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="font-bold text-white text-xs">FDD & Legal Structuring</div>
                    <div className="text-[11px] text-slate-400 mt-0.5">FTC 23-Item disclosure & agreements</div>
                  </div>
                </Link>

                <Link
                  href="/services/investor-recruitment"
                  className="flex items-start gap-3 p-2.5 rounded-xl text-slate-300 hover:bg-white/[0.06] hover:text-white transition-all group"
                >
                  <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400 group-hover:bg-emerald-500/20">
                    <Users2 className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="font-bold text-white text-xs">Investor Recruitment</div>
                    <div className="text-[11px] text-slate-400 mt-0.5">Multi-unit operator matching & CRM</div>
                  </div>
                </Link>
              </div>
            )}
          </div>

          <Link href="/for-businesses" className="hover:text-white transition-colors py-1 px-2.5 rounded-lg hover:bg-white/[0.04]">
            For Businesses
          </Link>
          <Link href="/for-investors" className="hover:text-white transition-colors py-1 px-2.5 rounded-lg hover:bg-white/[0.04]">
            For Investors
          </Link>
          <Link href="/calculator" className="hover:text-white transition-colors py-1 px-2.5 rounded-lg hover:bg-white/[0.04] text-emerald-400">
            Cost Calculator
          </Link>
          <Link href="/compare" className="hover:text-white transition-colors py-1 px-2.5 rounded-lg hover:bg-white/[0.04]">
            Compare
          </Link>
          <Link href="/location-intelligence" className="hover:text-white transition-colors py-1 px-2.5 rounded-lg hover:bg-white/[0.04]">
            Location Intel
          </Link>
          <Link href="/deal-room" className="hover:text-white transition-colors py-1 px-2.5 rounded-lg hover:bg-white/[0.04] text-purple-300">
            Deal Rooms
          </Link>
        </div>

        {/* User CTA Actions */}
        <div className="hidden lg:flex items-center gap-3">
          {user ? (
            <div className="flex items-center gap-3">
              <Link
                href={getDashboardUrl()}
                className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white px-4 py-2 rounded-xl text-xs font-bold shadow-[0_4px_14px_rgba(37,99,235,0.3)] transition-all hover:scale-[1.02]"
              >
                <TrendingUp className="w-3.5 h-3.5 text-amber-300" />
                Go to Dashboard
              </Link>
              <button
                onClick={() => logout()}
                title="Log out"
                className="p-2 text-slate-400 hover:text-white hover:bg-white/[0.08] rounded-xl transition-colors"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <Link
                href="/login"
                className="text-xs font-bold text-slate-300 hover:text-white px-3.5 py-2 rounded-xl hover:bg-white/[0.06] transition-colors"
              >
                Sign In
              </Link>
              <Link
                href="/register"
                className="inline-flex items-center gap-1.5 bg-gradient-to-r from-amber-400 via-amber-500 to-amber-600 hover:from-amber-300 hover:to-amber-500 text-slate-950 font-extrabold px-4.5 py-2 rounded-xl text-xs shadow-[0_4px_16px_rgba(212,175,55,0.25)] transition-all hover:scale-[1.03]"
              >
                <Sparkles className="w-3.5 h-3.5 text-slate-950" />
                Get Started
              </Link>
            </div>
          )}
        </div>

        {/* Mobile menu toggle */}
        <div className="lg:hidden flex items-center">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 text-slate-300 hover:text-white"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </nav>

      {/* Mobile dropdown */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-[#070B14] border-b border-white/[0.1] px-5 py-6 space-y-3.5">
          <Link
            href="/franchises"
            onClick={() => setMobileMenuOpen(false)}
            className="block text-sm font-semibold text-slate-200 hover:text-amber-400"
          >
            Franchise Marketplace
          </Link>
          <Link
            href="/services"
            onClick={() => setMobileMenuOpen(false)}
            className="block text-sm font-semibold text-slate-200 hover:text-amber-400"
          >
            Solutions & Services
          </Link>
          <Link
            href="/for-businesses"
            onClick={() => setMobileMenuOpen(false)}
            className="block text-sm font-semibold text-slate-200 hover:text-amber-400"
          >
            For Business Owners
          </Link>
          <Link
            href="/for-investors"
            onClick={() => setMobileMenuOpen(false)}
            className="block text-sm font-semibold text-slate-200 hover:text-amber-400"
          >
            For Franchise Investors
          </Link>
          <Link
            href="/calculator"
            onClick={() => setMobileMenuOpen(false)}
            className="block text-sm font-semibold text-emerald-400 hover:text-emerald-300"
          >
            Cost Estimator Calculator
          </Link>
          <Link
            href="/compare"
            onClick={() => setMobileMenuOpen(false)}
            className="block text-sm font-semibold text-slate-200 hover:text-amber-400"
          >
            Compare Franchises
          </Link>
          <Link
            href="/location-intelligence"
            onClick={() => setMobileMenuOpen(false)}
            className="block text-sm font-semibold text-slate-200 hover:text-amber-400"
          >
            Location Intelligence
          </Link>
          <Link
            href="/deal-room"
            onClick={() => setMobileMenuOpen(false)}
            className="block text-sm font-semibold text-purple-400 hover:text-purple-300"
          >
            Digital Deal Rooms
          </Link>

          <div className="pt-4 border-t border-white/[0.08] space-y-2.5">
            {user ? (
              <Link
                href={getDashboardUrl()}
                onClick={() => setMobileMenuOpen(false)}
                className="block text-center bg-blue-600 text-white py-2.5 rounded-xl font-bold text-xs"
              >
                Go to Dashboard
              </Link>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                <Link
                  href="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-center bg-white/[0.08] text-white py-2.5 rounded-xl font-semibold text-xs"
                >
                  Sign In
                </Link>
                <Link
                  href="/register"
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-center bg-amber-400 text-slate-950 py-2.5 rounded-xl font-bold text-xs"
                >
                  Get Started
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
