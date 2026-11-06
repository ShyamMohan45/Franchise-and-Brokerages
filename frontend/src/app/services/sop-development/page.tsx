import React from "react";
import Link from "next/link";
import { FileCheck2, CheckCircle2, ArrowRight } from "lucide-react";

export default function SopDevelopmentServicePage() {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-12">
      <div className="space-y-4">
        <Link href="/services" className="text-xs font-semibold text-blue-600 hover:underline">
          &larr; Back to Services
        </Link>
        <span className="text-blue-600 font-semibold text-xs uppercase tracking-wider block">Operational Codification</span>
        <h1 className="text-4xl font-extrabold text-navy-900 tracking-tight">SOP Codification & Operations Manuals</h1>
        <p className="text-base text-slate-600 leading-relaxed max-w-3xl">
          A franchise is essentially a license to copy an operational system. If your operations reside only in your
          head, you cannot sell a franchise. We codify every process into digital, auditable SOP manuals.
        </p>
      </div>

      <div className="bg-white rounded-3xl border border-slate-200 p-8 sm:p-10 space-y-8 shadow-sm">
        <h2 className="text-2xl font-bold text-navy-900">Core SOP Manual Categories We Build:</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm text-slate-700">
          <div className="space-y-1.5 p-4 rounded-xl bg-slate-50 border border-slate-100">
            <h3 className="font-bold text-navy-900">1. Daily Opening & Closing Protocols</h3>
            <p className="text-xs text-slate-600">Register floats, HVAC sequencing, perimeter safety, security alarm testing.</p>
          </div>
          <div className="space-y-1.5 p-4 rounded-xl bg-slate-50 border border-slate-100">
            <h3 className="font-bold text-navy-900">2. Quality Control & Recipe Formulation</h3>
            <p className="text-xs text-slate-600">Ingredient grammage, extraction yields, batch timing, plating photography benchmarks.</p>
          </div>
          <div className="space-y-1.5 p-4 rounded-xl bg-slate-50 border border-slate-100">
            <h3 className="font-bold text-navy-900">3. Employee Training & Staff Onboarding</h3>
            <p className="text-xs text-slate-600">14-day training curriculum, role testing, customer service dispute resolution matrices.</p>
          </div>
          <div className="space-y-1.5 p-4 rounded-xl bg-slate-50 border border-slate-100">
            <h3 className="font-bold text-navy-900">4. Inventory & Waste Management</h3>
            <p className="text-xs text-slate-600">FIFO rotation, daily variance reconciliation, shrinkage thresholds, supplier reorder triggers.</p>
          </div>
        </div>

        <div className="pt-6 border-t border-slate-100 flex items-center justify-between">
          <div>
            <h4 className="font-bold text-navy-900 text-sm">Need your procedures codified?</h4>
            <p className="text-xs text-slate-500">Access our standardized digital templates directly in your dashboard.</p>
          </div>
          <Link
            href="/register?role=business_owner"
            className="bg-blue-600 text-white font-semibold text-xs px-6 py-3 rounded-xl shadow hover:bg-blue-700 transition-colors"
          >
            Access SOP Module &rarr;
          </Link>
        </div>
      </div>
    </div>
  );
}
