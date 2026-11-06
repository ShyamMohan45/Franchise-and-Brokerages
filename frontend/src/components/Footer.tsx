import React from "react";
import Link from "next/link";
import { Building2, Mail, Phone, MapPin, Shield, CheckCircle2 } from "lucide-react";

export function Footer() {
  return (
    <footer className="bg-[#080D18] text-slate-300 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12">
          {/* Brand Bio */}
          <div className="lg:col-span-2 space-y-4">
            <Link href="/" className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-amber-500 p-0.5">
                <div className="w-full h-full bg-[#0B1220] rounded-[10px] flex items-center justify-center">
                  <Building2 className="w-5 h-5 text-amber-400" />
                </div>
              </div>
              <span className="text-2xl font-bold tracking-tight text-white">
                Franchise<span className="text-amber-400">Bridge</span>
              </span>
            </Link>
            <p className="text-sm text-slate-400 leading-relaxed max-w-sm">
              Empowering proven regional and local brands to scale nationally through standardized SOP packaging,
              jurisdiction-compliant Franchise Disclosure Documents (FDD), and multi-unit investor brokerage.
            </p>
            <div className="pt-2 text-xs text-slate-500 flex items-center gap-2">
              <Shield className="w-4 h-4 text-emerald-500" />
              <span>Brokerage transactions managed under strict regulatory and confidentiality governance.</span>
            </div>
          </div>

          {/* Solutions & Services */}
          <div>
            <h4 className="text-sm font-semibold text-white tracking-wider uppercase mb-4">Development</h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link href="/services/franchise-development" className="hover:text-amber-400 transition-colors">
                  Franchise Development
                </Link>
              </li>
              <li>
                <Link href="/services/sop-development" className="hover:text-amber-400 transition-colors">
                  SOP Codification
                </Link>
              </li>
              <li>
                <Link href="/services/legal-documentation" className="hover:text-amber-400 transition-colors">
                  Legal FDD & FIM Packaging
                </Link>
              </li>
              <li>
                <Link href="/services/investor-recruitment" className="hover:text-amber-400 transition-colors">
                  Multi-Unit Investor Matching
                </Link>
              </li>
              <li>
                <Link href="/services/expansion-consulting" className="hover:text-amber-400 transition-colors">
                  Territory Expansion Advisory
                </Link>
              </li>
            </ul>
          </div>

          {/* Stakeholders */}
          <div>
            <h4 className="text-sm font-semibold text-white tracking-wider uppercase mb-4">Platform</h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link href="/franchises" className="hover:text-amber-400 transition-colors">
                  Franchise Marketplace
                </Link>
              </li>
              <li>
                <Link href="/for-businesses" className="hover:text-amber-400 transition-colors">
                  For Business Owners
                </Link>
              </li>
              <li>
                <Link href="/for-investors" className="hover:text-amber-400 transition-colors">
                  For Franchise Investors
                </Link>
              </li>
              <li>
                <Link href="/how-it-works" className="hover:text-amber-400 transition-colors">
                  How Franchising Works
                </Link>
              </li>
              <li>
                <Link href="/blog" className="hover:text-amber-400 transition-colors">
                  Research & Case Studies
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact / Office */}
          <div>
            <h4 className="text-sm font-semibold text-white tracking-wider uppercase mb-4">Advisory Offices</h4>
            <ul className="space-y-3 text-sm text-slate-400">
              <li className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <span>Level 7, Prestige Tech Center, Outer Ring Rd, Bengaluru, KA 560103</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Phone className="w-4 h-4 text-amber-400 shrink-0" />
                <span>+91 (080) 4567-8900</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Mail className="w-4 h-4 text-amber-400 shrink-0" />
                <span>advisory@franchisebridge.com</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-8 border-t border-slate-800/80 flex flex-col md:flex-row items-center justify-between text-xs text-slate-500 gap-4">
          <p>© {new Date().getFullYear()} FranchiseBridge Platform Inc. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <Link href="/privacy-policy" className="hover:text-slate-400 transition-colors">
              Privacy Policy
            </Link>
            <Link href="/terms-and-conditions" className="hover:text-slate-400 transition-colors">
              Terms & Conditions
            </Link>
            <Link href="/disclaimer" className="hover:text-slate-400 transition-colors">
              Regulatory Disclaimer
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
