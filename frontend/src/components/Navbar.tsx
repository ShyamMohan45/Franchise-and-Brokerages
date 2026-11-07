"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/providers/AuthProvider";
import {
  Building2,
  ChevronDown,
  Menu,
  X,
  LogOut,
  User,
  ArrowRight,
  Calculator,
  Compass,
  FileCheck2,
  ShieldCheck,
  TrendingUp,
  Scale,
  Sparkles,
} from "lucide-react";

export function Navbar() {
  const { user, logout } = useAuth();
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [solutionsOpen, setSolutionsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const getDashboardUrl = () => {
    if (!user) return "/login";
    if (user.role === "admin" || user.role === "super_admin") return "/dashboard/admin";
    if (user.role === "investor") return "/dashboard/investor";
    if (user.role === "broker") return "/dashboard/admin"; // or dedicated broker route
    return "/dashboard/business";
  };

  const navLinks = [
    { label: "Home", href: "/" },
    { label: "Explore Franchises", href: "/franchises" },
    { label: "For Brands", href: "/for-businesses" },
    { label: "For Investors", href: "/for-investors" },
    { label: "How It Works", href: "/how-it-works" },
    { label: "About Us", href: "/about" },
  ];

  return (
    <header
      className={`sticky top-0 z-50 transition-all duration-200 ${
        scrolled
          ? "bg-white/95 backdrop-blur-md border-b border-[#E7ECF2] shadow-[0_2px_12px_rgba(20,36,58,0.03)]"
          : "bg-white border-b border-[#E7ECF2]"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo on the Left */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl bg-[#14243A] flex items-center justify-center text-white shadow-sm group-hover:bg-[#315EFB] transition-colors duration-200">
              <Building2 className="w-5 h-5 text-white" />
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-bold tracking-tight text-[#14243A]">
                Franchise<span className="text-[#315EFB]">Bridge</span>
              </span>
              <span className="text-[10px] tracking-wider uppercase font-semibold text-[#64748B] -mt-0.5">
                Expansion Brokerage
              </span>
            </div>
          </Link>

          {/* Navigation Links in Center */}
          <nav className="hidden lg:flex items-center gap-1 xl:gap-2">
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`px-3.5 py-2 text-[14px] font-medium rounded-lg transition-colors ${
                    isActive
                      ? "text-[#315EFB] font-semibold bg-[#EFF4FF]"
                      : "text-[#64748B] hover:text-[#14243A] hover:bg-[#F8FAFC]"
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}

            {/* Platform Tools Dropdown */}
            <div
              className="relative"
              onMouseEnter={() => setSolutionsOpen(true)}
              onMouseLeave={() => setSolutionsOpen(false)}
            >
              <button
                className={`flex items-center gap-1 px-3.5 py-2 text-[14px] font-medium rounded-lg transition-colors ${
                  solutionsOpen
                    ? "text-[#14243A] bg-[#F8FAFC]"
                    : "text-[#64748B] hover:text-[#14243A] hover:bg-[#F8FAFC]"
                }`}
              >
                Intelligence & Tools
                <ChevronDown
                  className={`w-3.5 h-3.5 transition-transform duration-200 ${
                    solutionsOpen ? "rotate-180 text-[#315EFB]" : "text-[#64748B]"
                  }`}
                />
              </button>

              {solutionsOpen && (
                <div className="absolute top-full left-0 w-80 bg-white border border-[#E7ECF2] rounded-xl shadow-dropdown p-2 mt-1 z-50 animate-in fade-in slide-in-from-top-1">
                  <div className="px-3 py-2 text-[11px] font-bold uppercase tracking-wider text-[#64748B]">
                    Specialized Tools
                  </div>
                  <Link
                    href="/calculator"
                    className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-[#F8FAFC] transition-colors group"
                  >
                    <div className="p-2 rounded-lg bg-[#EFF4FF] text-[#315EFB]">
                      <Calculator className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-xs font-semibold text-[#14243A] group-hover:text-[#315EFB]">
                        Capex & ROI Estimator
                      </div>
                      <div className="text-[11px] text-[#64748B]">
                        Simulate setup costs and break-even timelines
                      </div>
                    </div>
                  </Link>

                  <Link
                    href="/location-intelligence"
                    className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-[#F8FAFC] transition-colors group"
                  >
                    <div className="p-2 rounded-lg bg-[#E6F7F5] text-[#159D8B]">
                      <Compass className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-xs font-semibold text-[#14243A] group-hover:text-[#159D8B]">
                        Location Intelligence
                      </div>
                      <div className="text-[11px] text-[#64748B]">
                        Tier-1, 2 & 3 catchment demographic analysis
                      </div>
                    </div>
                  </Link>

                  <Link
                    href="/deal-room"
                    className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-[#F8FAFC] transition-colors group"
                  >
                    <div className="p-2 rounded-lg bg-indigo-50 text-indigo-600">
                      <ShieldCheck className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-xs font-semibold text-[#14243A] group-hover:text-indigo-600">
                        Digital Deal Rooms
                      </div>
                      <div className="text-[11px] text-[#64748B]">
                        Encrypted FDD, NDA e-sign & due diligence vault
                      </div>
                    </div>
                  </Link>
                </div>
              )}
            </div>
          </nav>

          {/* Action CTAs on Right */}
          <div className="hidden lg:flex items-center gap-3">
            {user ? (
              <div className="flex items-center gap-3">
                <Link
                  href={getDashboardUrl()}
                  className="btn-primary py-2 px-4 text-xs font-semibold"
                >
                  <TrendingUp className="w-3.5 h-3.5" />
                  Dashboard
                </Link>
                <div className="flex items-center gap-2 pl-2 border-l border-[#E7ECF2]">
                  <span className="text-xs text-[#64748B] font-medium hidden xl:inline">
                    {user.name || user.email}
                  </span>
                  <button
                    onClick={logout}
                    title="Log out"
                    className="p-2 text-[#64748B] hover:text-[#14243A] hover:bg-[#F8FAFC] rounded-lg transition-colors"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <Link
                  href="/login"
                  className="px-4 py-2 text-sm font-semibold text-[#14243A] hover:text-[#315EFB] transition-colors"
                >
                  Log In
                </Link>
                <Link
                  href="/for-businesses"
                  className="btn-primary py-2.5 px-4 text-xs font-semibold"
                >
                  Get Started
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Hamburger Button */}
          <div className="flex lg:hidden items-center">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-[#14243A] hover:bg-[#F8FAFC] rounded-lg transition-colors"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-[#E7ECF2] bg-white px-4 pt-3 pb-6 space-y-2 shadow-lg animate-in slide-in-from-top-2">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setMobileMenuOpen(false)}
              className={`block px-3 py-2.5 rounded-lg text-sm font-medium ${
                pathname === link.href
                  ? "bg-[#EFF4FF] text-[#315EFB] font-semibold"
                  : "text-[#14243A] hover:bg-[#F8FAFC]"
              }`}
            >
              {link.label}
            </Link>
          ))}

          <div className="pt-2 pb-1 border-t border-[#E7ECF2] mt-2">
            <div className="px-3 py-1 text-xs font-semibold text-[#64748B] uppercase tracking-wider">
              Specialized Tools
            </div>
            <Link
              href="/calculator"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 text-sm text-[#14243A] hover:bg-[#F8FAFC] rounded-lg"
            >
              Capex & ROI Estimator
            </Link>
            <Link
              href="/location-intelligence"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 text-sm text-[#14243A] hover:bg-[#F8FAFC] rounded-lg"
            >
              Location Intelligence
            </Link>
            <Link
              href="/deal-room"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 text-sm text-[#14243A] hover:bg-[#F8FAFC] rounded-lg"
            >
              Digital Deal Rooms
            </Link>
          </div>

          <div className="pt-3 border-t border-[#E7ECF2] flex flex-col gap-2">
            {user ? (
              <>
                <Link
                  href={getDashboardUrl()}
                  onClick={() => setMobileMenuOpen(false)}
                  className="btn-primary w-full text-center py-2.5"
                >
                  Go to Dashboard
                </Link>
                <button
                  onClick={() => {
                    logout();
                    setMobileMenuOpen(false);
                  }}
                  className="btn-secondary w-full text-center py-2 text-xs"
                >
                  Log Out
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="btn-secondary w-full text-center py-2.5"
                >
                  Log In
                </Link>
                <Link
                  href="/for-businesses"
                  onClick={() => setMobileMenuOpen(false)}
                  className="btn-primary w-full text-center py-2.5"
                >
                  Get Started
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
