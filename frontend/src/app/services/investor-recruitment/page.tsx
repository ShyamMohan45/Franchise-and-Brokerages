import React from "react";
import Link from "next/link";
import { Users2, CheckCircle2 } from "lucide-react";

export default function InvestorRecruitmentPage() {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-12">
      <div className="space-y-4">
        <Link href="/services" className="text-xs font-semibold text-blue-600 hover:underline">
          &larr; Back to Services
        </Link>
        <span className="text-blue-600 font-semibold text-xs uppercase tracking-wider block">Brokerage & Capital</span>
        <h1 className="text-4xl font-extrabold text-navy-900 tracking-tight">Multi-Unit Franchisee Investor Recruitment</h1>
        <p className="text-base text-slate-600 leading-relaxed max-w-3xl">
          Recruiting single-unit franchise owners is slow and operationally taxing. FranchiseBridge focuses on
          connecting proven brands with qualified multi-unit operators and syndicates capable of opening 3 to 10
          units in target metropolitan clusters.
        </p>
      </div>

      <div className="bg-white rounded-3xl border border-slate-200 p-8 sm:p-10 space-y-6 shadow-sm">
        <h2 className="text-2xl font-bold text-navy-900">Our Multi-Unit Recruitment Process:</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs text-slate-700">
          <div className="bg-slate-50 p-5 rounded-2xl space-y-2 border border-slate-100">
            <span className="font-bold text-sm text-navy-900 block">1. Capital Qualification</span>
            <p className="text-slate-600 leading-relaxed">
              We verify minimum liquid capital reserves (typically ₹50 Lakh to ₹2 Cr+) before any disclosure
              memorandums are shared.
            </p>
          </div>
          <div className="bg-slate-50 p-5 rounded-2xl space-y-2 border border-slate-100">
            <span className="font-bold text-sm text-navy-900 block">2. Mutual NDA & Consent</span>
            <p className="text-slate-600 leading-relaxed">
              Direct contact info is shielded until an official Non-Disclosure Agreement is executed and both
              parties consent to introduction.
            </p>
          </div>
          <div className="bg-slate-50 p-5 rounded-2xl space-y-2 border border-slate-100">
            <span className="font-bold text-sm text-navy-900 block">3. Deal Brokerage & Closing</span>
            <p className="text-slate-600 leading-relaxed">
              Our brokers facilitate term-sheet alignment, multi-unit step-down royalty schedules, and territorial
              lease coordination.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
