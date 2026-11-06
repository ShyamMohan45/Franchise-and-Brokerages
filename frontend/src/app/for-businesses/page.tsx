import React from "react";
import Link from "next/link";
import { Building2, TrendingUp, CheckCircle2, ArrowRight } from "lucide-react";

export default function ForBusinessesPage() {
  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-16">
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <span className="text-blue-600 font-semibold text-xs uppercase tracking-wider">For Brand Founders & Franchisors</span>
        <h1 className="text-4xl font-extrabold text-navy-900 tracking-tight">Scale Nationally Using Other People's Capital</h1>
        <p className="text-slate-600 text-base leading-relaxed">
          You built a successful local concept that customers love. Now discover how to turn it into a multi-unit
          national franchise system without risking your personal balance sheet.
        </p>
        <div className="pt-2">
          <Link
            href="/register?role=business_owner"
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-8 py-3.5 rounded-xl shadow inline-flex items-center gap-2 text-sm"
          >
            Apply for Franchise Packaging <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="bg-white rounded-3xl border border-slate-200 p-8 space-y-4 shadow-sm">
          <h3 className="text-lg font-bold text-navy-900">1. Fast Expansion</h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            Open 5 to 20 units per year funded by franchisee capital while you maintain brand standards.
          </p>
        </div>
        <div className="bg-white rounded-3xl border border-slate-200 p-8 space-y-4 shadow-sm">
          <h3 className="text-lg font-bold text-navy-900">2. Predictable High-Margin Royalties</h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            Collect 5% to 8% top-line monthly royalties with virtually zero outlet-level utility or lease liabilities.
          </p>
        </div>
        <div className="bg-white rounded-3xl border border-slate-200 p-8 space-y-4 shadow-sm">
          <h3 className="text-lg font-bold text-navy-900">3. Multi-Unit Operators</h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            Partner with experienced operators who run multiple locations, reducing your training overhead.
          </p>
        </div>
      </div>
    </div>
  );
}
