import React from "react";
import Link from "next/link";
import { Briefcase, CheckCircle2, ArrowRight } from "lucide-react";

export default function ForInvestorsPage() {
  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-16">
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <span className="text-amber-600 font-semibold text-xs uppercase tracking-wider">For Franchise Investors & Operators</span>
        <h1 className="text-4xl font-extrabold text-navy-900 tracking-tight">Invest in Pre-Vetted, High-Yield Franchises</h1>
        <p className="text-slate-600 text-base leading-relaxed">
          Skip unproven startups. Acquire exclusive territory rights to proven regional brands with audited unit
          economics, complete operating checklists, and full legal disclosures.
        </p>
        <div className="pt-2">
          <Link
            href="/register?role=investor"
            className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold px-8 py-3.5 rounded-xl shadow inline-flex items-center gap-2 text-sm"
          >
            Register as an Investor <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="bg-white rounded-3xl border border-slate-200 p-8 space-y-4 shadow-sm">
          <h3 className="text-lg font-bold text-navy-900">Audited Financial Disclosures</h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            Every opportunity on FranchiseBridge undergoes strict unit-level financial vetting. No fabricated ROI claims.
          </p>
        </div>
        <div className="bg-white rounded-3xl border border-slate-200 p-8 space-y-4 shadow-sm">
          <h3 className="text-lg font-bold text-navy-900">Protected Territory Exclusivity</h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            Secure multi-unit development rights across entire cities or high-density commercial corridors.
          </p>
        </div>
        <div className="bg-white rounded-3xl border border-slate-200 p-8 space-y-4 shadow-sm">
          <h3 className="text-lg font-bold text-navy-900">Turnkey Franchisor Support</h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            Comprehensive on-site barista/chef/manager training, vendor supply chains, and architectural buildout plans.
          </p>
        </div>
      </div>
    </div>
  );
}
