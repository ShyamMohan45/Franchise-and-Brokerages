import React from "react";
import Link from "next/link";
import { TrendingUp, CheckCircle2, ArrowRight } from "lucide-react";

export default function FranchiseDevelopmentServicePage() {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-12">
      <div className="space-y-4">
        <Link href="/services" className="text-xs font-semibold text-blue-600 hover:underline">
          &larr; Back to Services
        </Link>
        <span className="text-blue-600 font-semibold text-xs uppercase tracking-wider block">Core Advisory</span>
        <h1 className="text-4xl font-extrabold text-navy-900 tracking-tight">Franchise Development & Readiness Diagnostic</h1>
        <p className="text-base text-slate-600 leading-relaxed max-w-3xl">
          Before taking a single rupee or dollar in franchise fees, a brand must prove that its model can be operated
          profitably by an independent third party. Our structured diagnostic benchmarks your business across 8
          critical pillars.
        </p>
      </div>

      <div className="bg-white rounded-3xl border border-slate-200 p-8 sm:p-10 space-y-8 shadow-sm">
        <h2 className="text-2xl font-bold text-navy-900">What Our Development Diagnostic Covers</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm text-slate-700">
          <div className="space-y-2">
            <h3 className="font-bold text-navy-900 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" /> Unit Economics & Gross Margin Resilience
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Stress-testing store-level financial models to ensure franchisees can pay royalties (typically 5-7%) and
              still generate target EBITDA returns exceeding 18-24%.
            </p>
          </div>
          <div className="space-y-2">
            <h3 className="font-bold text-navy-900 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" /> Operational Repeatability
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Assessing whether day-to-day operations can be executed by hired managers without the founder’s physical
              presence or personal culinary/technical craft.
            </p>
          </div>
          <div className="space-y-2">
            <h3 className="font-bold text-navy-900 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" /> Supply Chain Scalability
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Verifying that signature ingredients, packaging, or proprietary equipment can be reliably shipped to
              secondary and tertiary expansion cities.
            </p>
          </div>
          <div className="space-y-2">
            <h3 className="font-bold text-navy-900 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" /> Territory Exclusivity & Cannibalization Modeling
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Defining protected radii (typically 2 to 5 km depending on urban density) to prevent franchisee conflicts.
            </p>
          </div>
        </div>

        <div className="pt-6 border-t border-slate-100 flex items-center justify-between">
          <div>
            <h4 className="font-bold text-navy-900 text-sm">Ready to benchmark your brand?</h4>
            <p className="text-xs text-slate-500">Calculate your 8-Pillar Readiness Index directly inside your dashboard.</p>
          </div>
          <Link
            href="/register?role=business_owner"
            className="bg-blue-600 text-white font-semibold text-xs px-6 py-3 rounded-xl shadow hover:bg-blue-700 transition-colors"
          >
            Start Self-Diagnostic &rarr;
          </Link>
        </div>
      </div>
    </div>
  );
}
