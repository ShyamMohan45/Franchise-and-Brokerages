"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Building2,
  ChevronDown,
  Menu,
  X,
  Calculator,
  Compass,
  ShieldCheck,
  ArrowRight,
  LogOut,
} from "lucide-react";
import { useAuth } from "@/providers/AuthProvider";
import { ThemeToggle } from "./ThemeToggle";

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [solutionsOpen, setSolutionsOpen] = useState(false);
  const pathname = usePathname();
  const { user, logout } = useAuth();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const getDashboardUrl = () => {
    if (!user) return "/login";
    switch (user.role) {
      case "business_owner":
        return "/dashboard/business";
      case "investor":
        return "/dashboard/investor";
      case "broker":
        return "/dashboard/brokerage";
      case "admin":
        return "/dashboard/admin";
      default:
        return "/dashboard/investor";
    }
  };

  const navLinks = [
    { label: "Franchises", href: "/franchises" },
    { label: "For Investors", href: "/for-investors" },
    { label: "For Franchisors", href: "/for-businesses" },
    { label: "Compare Models", href: "/compare" },
    { label: "Advisory Services", href: "/services" },
  ];

  return (
    <header
      className={`sticky top-0 z-50 transition-all duration-200 ${
        scrolled
          ? "bg-white/95 dark:bg-[#050505]/95 backdrop-blur-md border-b border-[#E7ECF2] dark:border-[#262626] shadow-[0_2px_12px_rgba(20,36,58,0.03)] dark:shadow-[0_4px_24px_rgba(0,0,0,0.85)]"
          : "bg-white dark:bg-[#050505] border-b border-[#E7ECF2] dark:border-[#262626]"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo on the Left */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl bg-[#14243A] dark:bg-[#101010] flex items-center justify-center text-white shadow-sm group-hover:bg-[#3563FF] dark:group-hover:bg-[#3563FF] transition-colors duration-200 border border-transparent dark:border-[#262626]">
              <Building2 className="w-5 h-5 text-white" />
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-bold tracking-tight text-[#14243A] dark:text-[#FFFFFF]">
                Franchise<span className="text-[#3563FF]">Bridge</span>
              </span>
              <span className="text-[10px] tracking-wider uppercase font-semibold text-[#64748B] dark:text-[#A3A3A3] -mt-0.5">
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
                      ? "text-[#3563FF] font-semibold bg-[#EFF4FF] dark:bg-[#171717]"
                      : "text-[#64748B] dark:text-[#A3A3A3] hover:text-[#14243A] dark:hover:text-[#FFFFFF] hover:bg-[#F8FAFC] dark:hover:bg-[#171717]"
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
                    ? "text-[#14243A] dark:text-[#FFFFFF] bg-[#F8FAFC] dark:bg-[#171717]"
                    : "text-[#64748B] dark:text-[#A3A3A3] hover:text-[#14243A] dark:hover:text-[#FFFFFF] hover:bg-[#F8FAFC] dark:hover:bg-[#171717]"
                }`}
              >
                Intelligence & Tools
                <ChevronDown
                  className={`w-3.5 h-3.5 transition-transform duration-200 ${
                    solutionsOpen ? "rotate-180 text-[#3563FF]" : "text-[#64748B] dark:text-[#A3A3A3]"
                  }`}
                />
              </button>

              {solutionsOpen && (
                <div className="absolute top-full left-0 w-80 bg-white dark:bg-[#101010] border border-[#E7ECF2] dark:border-[#262626] rounded-xl shadow-dropdown dark:shadow-[0_16px_40px_-8px_rgba(0,0,0,0.9)] p-2 mt-1 z-50 animate-in fade-in slide-in-from-top-1">
                  <div className="px-3 py-2 text-[11px] font-bold uppercase tracking-wider text-[#64748B] dark:text-[#A3A3A3]">
                    Specialized Tools
                  </div>
                  <Link
                    href="/calculator"
                    className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-[#F8FAFC] dark:hover:bg-[#202020] transition-colors group"
                  >
                    <div className="p-2 rounded-lg bg-[#EFF4FF] dark:bg-[#171717] text-[#3563FF]">
                      <Calculator className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-xs font-semibold text-[#14243A] dark:text-[#FFFFFF] group-hover:text-[#3563FF]">
                        Capex & ROI Estimator
                      </div>
                      <div className="text-[11px] text-[#64748B] dark:text-[#A3A3A3]">
                        Simulate setup costs and break-even timelines
                      </div>
                    </div>
                  </Link>

                  <Link
                    href="/location-intelligence"
                    className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-[#F8FAFC] dark:hover:bg-[#202020] transition-colors group"
                  >
                    <div className="p-2 rounded-lg bg-[#E6F7F5] dark:bg-[#0A2520] text-[#159D8B] dark:text-[#2DD4BF]">
                      <Compass className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-xs font-semibold text-[#14243A] dark:text-[#FFFFFF] group-hover:text-[#159D8B] dark:group-hover:text-[#2DD4BF]">
                        Location Intelligence
                      </div>
                      <div className="text-[11px] text-[#64748B] dark:text-[#A3A3A3]">
                        Tier-1, 2 & 3 catchment demographic analysis
                      </div>
                    </div>
                  </Link>

                  <Link
                    href="/deal-room"
                    className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-[#F8FAFC] dark:hover:bg-[#202020] transition-colors group"
                  >
                    <div className="p-2 rounded-lg bg-indigo-50 dark:bg-[#171717] text-indigo-600 dark:text-[#3563FF]">
                      <ShieldCheck className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-xs font-semibold text-[#14243A] dark:text-[#FFFFFF] group-hover:text-indigo-600 dark:group-hover:text-[#3563FF]">
                        Digital Deal Rooms
                      </div>
                      <div className="text-[11px] text-[#64748B] dark:text-[#A3A3A3]">
                        Encrypted FDD, NDA e-sign & due diligence vault
                      </div>
                    </div>
                  </Link>
                </div>
              )}
            </div>
          </nav>

          {/* Right Action Section: ThemeToggle + Auth */}
          <div className="hidden lg:flex items-center gap-3">
            <ThemeToggle variant="segmented" />

            {user ? (
              <div className="flex items-center gap-3 pl-2 border-l border-[#E7ECF2] dark:border-[#222222]">
                <Link
                  href={getDashboardUrl()}
                  className="btn-primary py-2 px-3.5 text-xs font-semibold"
                >
                  Dashboard
                </Link>
                <div className="flex items-center gap-2 pl-2 border-l border-[#E7ECF2] dark:border-[#222222]">
                  <span className="text-xs text-[#64748B] dark:text-[#A3A3A3] font-medium hidden xl:inline">
                    {user.name || user.email}
                  </span>
                  <button
                    onClick={logout}
                    title="Log out"
                    className="p-2 text-[#64748B] dark:text-[#A3A3A3] hover:text-[#14243A] dark:hover:text-[#FFFFFF] hover:bg-[#F8FAFC] dark:hover:bg-[#171717] rounded-lg transition-colors"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-3 pl-2 border-l border-[#E7ECF2] dark:border-[#222222]">
                <Link
                  href="/login"
                  className="px-4 py-2 text-sm font-semibold text-[#14243A] dark:text-[#FFFFFF] hover:text-[#3563FF] transition-colors"
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

          {/* Mobile Right Bar: ThemeToggle + Hamburger */}
          <div className="flex lg:hidden items-center gap-2">
            <ThemeToggle variant="compact" />
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-[#14243A] dark:text-[#FFFFFF] hover:bg-[#F8FAFC] dark:hover:bg-[#171717] rounded-lg transition-colors"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-[#E7ECF2] dark:border-[#262626] bg-white dark:bg-[#090909] px-4 pt-3 pb-6 space-y-2 shadow-lg animate-in slide-in-from-top-2">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setMobileMenuOpen(false)}
              className={`block px-3 py-2.5 rounded-lg text-sm font-medium ${
                pathname === link.href
                  ? "bg-[#EFF4FF] dark:bg-[#171717] text-[#3563FF] font-semibold"
                  : "text-[#14243A] dark:text-[#FFFFFF] hover:bg-[#F8FAFC] dark:hover:bg-[#171717]"
              }`}
            >
              {link.label}
            </Link>
          ))}

          <div className="pt-2 pb-1 border-t border-[#E7ECF2] dark:border-[#222222] mt-2">
            <div className="px-3 py-1 text-xs font-semibold text-[#64748B] dark:text-[#A3A3A3] uppercase tracking-wider">
              Specialized Tools
            </div>
            <Link
              href="/calculator"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 text-sm text-[#14243A] dark:text-[#FFFFFF] hover:bg-[#F8FAFC] dark:hover:bg-[#171717] rounded-lg"
            >
              Capex & ROI Estimator
            </Link>
            <Link
              href="/location-intelligence"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 text-sm text-[#14243A] dark:text-[#FFFFFF] hover:bg-[#F8FAFC] dark:hover:bg-[#171717] rounded-lg"
            >
              Location Intelligence
            </Link>
            <Link
              href="/deal-room"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 text-sm text-[#14243A] dark:text-[#FFFFFF] hover:bg-[#F8FAFC] dark:hover:bg-[#171717] rounded-lg"
            >
              Digital Deal Rooms
            </Link>
          </div>

          <div className="flex items-center justify-between px-3 py-2.5 border-t border-[#E7ECF2] dark:border-[#222222] mt-2">
            <span className="text-xs font-semibold text-[#64748B] dark:text-[#A3A3A3] uppercase tracking-wider">
              Theme Mode
            </span>
            <ThemeToggle variant="segmented" />
          </div>

          <div className="pt-3 border-t border-[#E7ECF2] dark:border-[#222222] flex flex-col gap-2">
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
