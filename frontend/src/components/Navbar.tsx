"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useAuth } from "@/providers/AuthProvider";
import {
  Building2,
  Briefcase,
  Search,
  Menu,
  X,
  User,
  LogOut,
  ChevronDown,
  ShieldCheck,
  TrendingUp,
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
    <header className="sticky top-0 z-50 bg-[#0B1220]/95 backdrop-blur-md border-b border-slate-800 text-white">
      {/* Top Announcement Bar */}
      <div className="bg-gradient-to-r from-blue-900 via-navy-900 to-amber-900/60 text-xs py-1.5 px-4 text-center font-medium border-b border-slate-800/80">
        <span className="inline-flex items-center gap-1.5">
          <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span>Spring 2026 Multi-Unit Franchise Cohort Now Open for Verified Investors & Brands</span>
          <Link href="/franchises" className="underline font-semibold ml-2 text-amber-300 hover:text-amber-200">
            Explore Opportunities &rarr;
          </Link>
        </span>
      </div>

      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        {/* Brand Logo */}
        <Link href="/" className="flex items-center gap-3 group">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-amber-500 p-0.5 shadow-lg group-hover:scale-105 transition-transform">
            <div className="w-full h-full bg-[#0B1220] rounded-[10px] flex items-center justify-center">
              <Building2 className="w-5 h-5 text-amber-400" />
            </div>
          </div>
          <div>
            <span className="text-xl font-bold tracking-tight text-white flex items-center gap-1">
              Franchise<span className="text-amber-400">Bridge</span>
            </span>
            <span className="block text-[10px] uppercase tracking-widest text-slate-400 font-medium">
              Development & Brokerage
            </span>
          </div>
        </Link>

        {/* Desktop Navigation Links */}
        <div className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-300">
          <Link href="/franchises" className="hover:text-amber-400 transition-colors flex items-center gap-1.5">
            <Search className="w-4 h-4 text-blue-400" />
            Marketplace
          </Link>

          {/* Services Dropdown */}
          <div
            className="relative"
            onMouseEnter={() => setServicesOpen(true)}
            onMouseLeave={() => setServicesOpen(false)}
          >
            <button className="flex items-center gap-1 hover:text-amber-400 transition-colors py-2">
              Services
              <ChevronDown className="w-4 h-4" />
            </button>

            {servicesOpen && (
              <div className="absolute top-full left-0 w-64 bg-[#0B1220] border border-slate-800 rounded-xl shadow-2xl p-2 py-3 space-y-1">
                <Link
                  href="/services/franchise-development"
                  className="block px-3 py-2 rounded-lg text-sm text-slate-300 hover:bg-slate-800/80 hover:text-white"
                >
                  <div className="font-semibold text-white">Franchise Development</div>
                  <div className="text-xs text-slate-400">Readiness & brand packaging</div>
                </Link>
                <Link
                  href="/services/sop-development"
                  className="block px-3 py-2 rounded-lg text-sm text-slate-300 hover:bg-slate-800/80 hover:text-white"
                >
                  <div className="font-semibold text-white">SOP Codification</div>
                  <div className="text-xs text-slate-400">Standard operating procedures</div>
                </Link>
                <Link
                  href="/services/legal-documentation"
                  className="block px-3 py-2 rounded-lg text-sm text-slate-300 hover:bg-slate-800/80 hover:text-white"
                >
                  <div className="font-semibold text-white">FDD & Legal Structuring</div>
                  <div className="text-xs text-slate-400">Disclosure & franchise agreements</div>
                </Link>
                <Link
                  href="/services/investor-recruitment"
                  className="block px-3 py-2 rounded-lg text-sm text-slate-300 hover:bg-slate-800/80 hover:text-white"
                >
                  <div className="font-semibold text-white">Investor Recruitment</div>
                  <div className="text-xs text-slate-400">Multi-unit operator matching</div>
                </Link>
              </div>
            )}
          </div>

          <Link href="/for-businesses" className="hover:text-amber-400 transition-colors">
            For Businesses
          </Link>
          <Link href="/for-investors" className="hover:text-amber-400 transition-colors">
            For Investors
          </Link>
          <Link href="/how-it-works" className="hover:text-amber-400 transition-colors">
            How It Works
          </Link>
          <Link href="/blog" className="hover:text-amber-400 transition-colors">
            Insights
          </Link>
        </div>

        {/* Right CTA / Auth Buttons */}
        <div className="hidden md:flex items-center gap-4">
          {user ? (
            <div className="flex items-center gap-3">
              <Link
                href={getDashboardUrl()}
                className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 text-white px-4 py-2 rounded-lg text-sm font-semibold shadow-md transition-all"
              >
                <TrendingUp className="w-4 h-4 text-amber-300" />
                Dashboard
              </Link>
              <button
                onClick={() => logout()}
                title="Logout"
                className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <Link
                href="/login"
                className="text-sm font-semibold text-slate-300 hover:text-white px-3 py-2 rounded-lg hover:bg-slate-800 transition-colors"
              >
                Log In
              </Link>
              <Link
                href="/register"
                className="inline-flex items-center gap-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-semibold px-4 py-2 rounded-lg text-sm shadow-md transition-all hover:scale-105"
              >
                Get Started
              </Link>
            </div>
          )}
        </div>

        {/* Mobile menu button */}
        <div className="md:hidden flex items-center">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 text-slate-400 hover:text-white focus:outline-none"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </nav>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-[#0B1220] border-b border-slate-800 px-4 pt-2 pb-6 space-y-3">
          <Link
            href="/franchises"
            onClick={() => setMobileMenuOpen(false)}
            className="block py-2 text-slate-200 hover:text-amber-400 font-medium"
          >
            Franchise Marketplace
          </Link>
          <Link
            href="/services"
            onClick={() => setMobileMenuOpen(false)}
            className="block py-2 text-slate-200 hover:text-amber-400 font-medium"
          >
            Services & Solutions
          </Link>
          <Link
            href="/for-businesses"
            onClick={() => setMobileMenuOpen(false)}
            className="block py-2 text-slate-200 hover:text-amber-400 font-medium"
          >
            For Business Owners
          </Link>
          <Link
            href="/for-investors"
            onClick={() => setMobileMenuOpen(false)}
            className="block py-2 text-slate-200 hover:text-amber-400 font-medium"
          >
            For Investors
          </Link>
          <Link
            href="/how-it-works"
            onClick={() => setMobileMenuOpen(false)}
            className="block py-2 text-slate-200 hover:text-amber-400 font-medium"
          >
            How It Works
          </Link>
          <Link
            href="/blog"
            onClick={() => setMobileMenuOpen(false)}
            className="block py-2 text-slate-200 hover:text-amber-400 font-medium"
          >
            Insights & Guides
          </Link>
          <div className="pt-4 border-t border-slate-800 space-y-2">
            {user ? (
              <>
                <Link
                  href={getDashboardUrl()}
                  onClick={() => setMobileMenuOpen(false)}
                  className="block w-full text-center bg-blue-600 text-white py-2.5 rounded-lg font-semibold"
                >
                  My Dashboard
                </Link>
                <button
                  onClick={() => {
                    logout();
                    setMobileMenuOpen(false);
                  }}
                  className="block w-full text-center bg-slate-800 text-slate-300 py-2.5 rounded-lg font-semibold"
                >
                  Sign Out
                </button>
              </>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                <Link
                  href="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-center bg-slate-800 text-white py-2.5 rounded-lg font-semibold"
                >
                  Log In
                </Link>
                <Link
                  href="/register"
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-center bg-amber-500 text-slate-950 py-2.5 rounded-lg font-semibold"
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
