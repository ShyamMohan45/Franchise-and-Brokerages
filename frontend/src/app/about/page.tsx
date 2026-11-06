import React from "react";
import Link from "next/link";
import { Building2, Shield, Award, Users } from "lucide-react";

export default function AboutPage() {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-16">
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <span className="text-blue-600 font-semibold text-xs uppercase tracking-wider">Our Mission</span>
        <h1 className="text-4xl font-extrabold text-navy-900 tracking-tight">Bridging Local Excellence with National Scale</h1>
        <p className="text-slate-600 text-base leading-relaxed">
          FranchiseBridge was founded to address the largest gap in emerging retail and service commerce: thousands of
          extraordinary local brands fail to scale because packaging standard operating procedures and recruiting
          reputable multi-unit investors has historically been opaque, expensive, and unstructured.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="bg-white rounded-3xl border border-slate-200 p-8 space-y-3 shadow-sm text-center">
          <Shield className="w-10 h-10 text-blue-600 mx-auto" />
          <h3 className="text-lg font-bold text-navy-900">Governance & Trust</h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            Strict investor vetting, NDA-gated disclosures, and zero tolerance for fabricated financial claims.
          </p>
        </div>
        <div className="bg-white rounded-3xl border border-slate-200 p-8 space-y-3 shadow-sm text-center">
          <Award className="w-10 h-10 text-amber-500 mx-auto" />
          <h3 className="text-lg font-bold text-navy-900">Operational Precision</h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            Codifying intuitions into repeatable digital manuals that empower multi-unit franchisee teams.
          </p>
        </div>
        <div className="bg-white rounded-3xl border border-slate-200 p-8 space-y-3 shadow-sm text-center">
          <Users className="w-10 h-10 text-emerald-600 mx-auto" />
          <h3 className="text-lg font-bold text-navy-900">Mutual Success</h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            We structure win-win franchise economic models with fair royalty rates and protected geographic territories.
          </p>
        </div>
      </div>
    </div>
  );
}
