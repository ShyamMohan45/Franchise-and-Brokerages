import React from "react";
import Link from "next/link";
import { Compass, CheckCircle2 } from "lucide-react";

export default function ExpansionConsultingPage() {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-12">
      <div className="space-y-4">
        <Link href="/services" className="text-xs font-semibold text-blue-600 hover:underline">
          &larr; Back to Services
        </Link>
        <span className="text-blue-600 font-semibold text-xs uppercase tracking-wider block">Strategic Advisory</span>
        <h1 className="text-4xl font-extrabold text-navy-900 tracking-tight">Territory Expansion & Real Estate Advisory</h1>
        <p className="text-base text-slate-600 leading-relaxed max-w-3xl">
          Selecting the wrong location kills more franchises than bad food or service. We provide demographic mapping,
          catchment footfall analytics, and developer relationship access.
        </p>
      </div>

      <div className="bg-white rounded-3xl border border-slate-200 p-8 sm:p-10 space-y-6 shadow-sm">
        <h2 className="text-2xl font-bold text-navy-900">Expansion Advisory Pillars:</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm text-slate-700">
          <div className="space-y-2 p-5 rounded-2xl bg-slate-50 border border-slate-100">
            <h3 className="font-bold text-navy-900">Demographic Catchment Mapping</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Analyzing disposable income, daytime office worker population density, and direct competitor clustering.
            </p>
          </div>
          <div className="space-y-2 p-5 rounded-2xl bg-slate-50 border border-slate-100">
            <h3 className="font-bold text-navy-900">Commercial Developer Access</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Direct relationships with premier Grade-A mall developers and tech parks across India, UAE, and Southeast Asia.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
