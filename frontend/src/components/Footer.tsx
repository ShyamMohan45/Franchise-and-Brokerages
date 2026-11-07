import React from "react";
import Link from "next/link";
import {
  Building2,
  Mail,
  Phone,
  MapPin,
  ShieldCheck,
  ArrowUpRight,
  Globe,
  Twitter,
  Linkedin,
  Github,
} from "lucide-react";

export function Footer() {
  return (
    <footer className="bg-[#14243A] text-white border-t border-[#1C2A3E]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 lg:gap-8 pb-12 border-b border-[#1C2A3E]">
          {/* Column 1: Brand & Bio */}
          <div className="lg:col-span-2 space-y-4">
            <Link href="/" className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#315EFB] flex items-center justify-center text-white shadow-sm">
                <Building2 className="w-5 h-5 text-white" />
              </div>
              <div className="flex flex-col">
                <span className="text-xl font-bold tracking-tight text-white">
                  Franchise<span className="text-[#315EFB]">Bridge</span>
                </span>
                <span className="text-[10px] tracking-wider uppercase font-semibold text-slate-400">
                  Expansion Brokerage
                </span>
              </div>
            </Link>
            <p className="text-sm text-slate-400 leading-relaxed max-w-sm">
              The intelligent franchise management and brokerage platform connecting ambitious business franchisors with vetted multi-unit investors through standardized SOPs and encrypted data rooms.
            </p>
            <div className="flex items-center gap-2 text-xs text-slate-400 pt-2">
              <ShieldCheck className="w-4 h-4 text-[#159D8B] flex-shrink-0" />
              <span>Enterprise 256-bit FDD encryption and regulatory compliance governance.</span>
            </div>
            {/* Social Links */}
            <div className="flex items-center gap-3 pt-2">
              <a
                href="https://linkedin.com"
                target="_blank"
                rel="noreferrer"
                className="w-8 h-8 rounded-lg bg-[#1C2A3E] flex items-center justify-center text-slate-400 hover:text-white hover:bg-[#315EFB] transition-colors"
                aria-label="LinkedIn"
              >
                <Linkedin className="w-4 h-4" />
              </a>
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noreferrer"
                className="w-8 h-8 rounded-lg bg-[#1C2A3E] flex items-center justify-center text-slate-400 hover:text-white hover:bg-[#315EFB] transition-colors"
                aria-label="Twitter"
              >
                <Twitter className="w-4 h-4" />
              </a>
              <a
                href="https://github.com/ShyamMohan45/Franchise-and-Brokerages"
                target="_blank"
                rel="noreferrer"
                className="w-8 h-8 rounded-lg bg-[#1C2A3E] flex items-center justify-center text-slate-400 hover:text-white hover:bg-[#315EFB] transition-colors"
                aria-label="GitHub"
              >
                <Github className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Column 2: Platform Links */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300 mb-4">
              Platform
            </h4>
            <ul className="space-y-2.5 text-sm text-slate-400">
              <li>
                <Link href="/franchises" className="hover:text-white transition-colors">
                  Explore Franchises
                </Link>
              </li>
              <li>
                <Link href="/calculator" className="hover:text-white transition-colors">
                  Capex & ROI Estimator
                </Link>
              </li>
              <li>
                <Link href="/location-intelligence" className="hover:text-white transition-colors">
                  Location Intelligence
                </Link>
              </li>
              <li>
                <Link href="/deal-room" className="hover:text-white transition-colors">
                  Digital Deal Rooms
                </Link>
              </li>
              <li>
                <Link href="/compare" className="hover:text-white transition-colors">
                  Compare Franchises
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: For Brands & Investors */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300 mb-4">
              Stakeholders
            </h4>
            <ul className="space-y-2.5 text-sm text-slate-400">
              <li>
                <Link href="/for-businesses" className="hover:text-white transition-colors">
                  For Brand Franchisors
                </Link>
              </li>
              <li>
                <Link href="/for-investors" className="hover:text-white transition-colors">
                  For Franchise Investors
                </Link>
              </li>
              <li>
                <Link href="/services/franchise-development" className="hover:text-white transition-colors">
                  Franchise Readiness
                </Link>
              </li>
              <li>
                <Link href="/services/sop-development" className="hover:text-white transition-colors">
                  SOP Codification
                </Link>
              </li>
              <li>
                <Link href="/services/legal-documentation" className="hover:text-white transition-colors">
                  FDD & Legal Agreements
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 4: Resources & Contact */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300 mb-4">
              Resources & Contact
            </h4>
            <ul className="space-y-2.5 text-sm text-slate-400">
              <li>
                <Link href="/how-it-works" className="hover:text-white transition-colors">
                  How It Works
                </Link>
              </li>
              <li>
                <Link href="/about" className="hover:text-white transition-colors">
                  About FranchiseBridge
                </Link>
              </li>
              <li>
                <Link href="/blog" className="hover:text-white transition-colors">
                  Research & Insights
                </Link>
              </li>
              <li>
                <Link href="/faq" className="hover:text-white transition-colors">
                  Frequently Asked Questions
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-white transition-colors">
                  Contact Advisory Team
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar: Legal & Copyright */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400">
          <p>© {new Date().getFullYear()} FranchiseBridge Technologies Inc. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <Link href="/privacy-policy" className="hover:text-white transition-colors">
              Privacy Policy
            </Link>
            <Link href="/terms-and-conditions" className="hover:text-white transition-colors">
              Terms of Service
            </Link>
            <Link href="/disclaimer" className="hover:text-white transition-colors">
              Regulatory Disclosures
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
