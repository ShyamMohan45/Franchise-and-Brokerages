import React from "react";
import Link from "next/link";
import { CheckCircle2, ArrowRight } from "lucide-react";

export default function HowItWorksPage() {
  const steps = [
    {
      num: "01",
      title: "Diagnostic Assessment & 8-Pillar Scoring",
      desc: "We analyze unit-level EBITDA, operating repeatability, and brand strength to benchmark franchise readiness.",
    },
    {
      num: "02",
      title: "SOP Codification & Training Manuals",
      desc: "All daily recipes, routines, quality benchmarks, and opening/closing sequences are codified into digital SOPs.",
    },
    {
      num: "03",
      title: "Regulatory Legal FDD & FIM Packaging",
      desc: "We structure the 23-Item disclosure packages, master franchise agreements, and trademark licensing protocols.",
    },
    {
      num: "04",
      title: "Marketplace Publishing & Investor Matching",
      desc: "Vetted multi-unit operators are matched against brand requirements based on capital, location, and industry.",
    },
    {
      num: "05",
      title: "Brokerage Deal Closing & Launch Support",
      desc: "We facilitate NDA signing, founder pitch meetings, lease signing, and ongoing franchise rollout milestones.",
    },
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-12">
      <div className="text-center space-y-3">
        <span className="text-blue-600 font-semibold text-xs uppercase tracking-wider">The Methodology</span>
        <h1 className="text-4xl font-extrabold text-navy-900 tracking-tight">How Franchise Development Works</h1>
        <p className="text-slate-600 text-sm max-w-xl mx-auto">
          A predictable, transparent pathway for brands to scale and investors to build generational equity.
        </p>
      </div>

      <div className="space-y-6">
        {steps.map((s, idx) => (
          <div key={idx} className="bg-white rounded-2xl border border-slate-200 p-6 flex gap-6 items-start shadow-sm">
            <div className="w-12 h-12 rounded-2xl bg-navy-900 text-amber-400 font-extrabold flex items-center justify-center text-lg shrink-0">
              {s.num}
            </div>
            <div className="space-y-1">
              <h3 className="text-lg font-bold text-navy-900">{s.title}</h3>
              <p className="text-sm text-slate-600 leading-relaxed">{s.desc}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
