"use client";

import React from "react";
import Link from "next/link";
import {
  CheckCircle2,
  ArrowRight,
  Sparkles,
  FileCheck2,
  Scale,
  Users2,
  Building2,
  ShieldCheck,
  Compass,
  Lock,
} from "lucide-react";

export default function HowItWorksPage() {
  const stages = [
    {
      num: "01",
      title: "Create Your Profile & Codify Operating Standards",
      desc: "Business founders document store unit economics, equipment capex, and staff requirements. Our system guides you through establishing operational benchmarks and territory availability.",
      points: [
        "Store footprint and capex breakdown",
        "Operational checklist and hygiene standards",
        "Target expansion cities and territory exclusivity radius",
      ],
    },
    {
      num: "02",
      title: "Assess Expansion Readiness & Audit Compliance",
      desc: "Our 8-Pillar Franchise Readiness Engine calculates your brand defensibility, unit EBITDA sustainability, and supply chain readiness before any public or private investor offering.",
      points: [
        "Multi-outlet financial audit",
        "Supply chain & vendor contract verification",
        "Trademark and brand equity evaluation",
      ],
    },
    {
      num: "03",
      title: "Discover Opportunities & Smart Matching",
      desc: "Investors browse pre-vetted brands benchmarked with transparent financials. Our algorithmic matching engine pairs capital capacity and territory preferences with brand requirements.",
      points: [
        "Pre-qualified liquid capital verification",
        "Catchment demographic compatibility",
        "Multi-unit vs single-unit matching algorithms",
      ],
    },
    {
      num: "04",
      title: "Virtual Deal Room & Due Diligence",
      desc: "Both parties enter an encrypted 256-bit Digital Deal Room. After signing mutual non-disclosure agreements (NDAs), investors inspect statutory 23-Item FDD disclosure files.",
      points: [
        "Cryptographic audit trails and document watermarking",
        "13-Pillar standardized due diligence checklist",
        "Integrated multi-party messaging with brokerage counsel",
      ],
    },
    {
      num: "05",
      title: "Legal E-Signature & Rollout Execution",
      desc: "Finalize franchise agreements with legally binding digital signatures. The platform assists with site selection, territory escrow milestones, and turnkey store buildout.",
      points: [
        "Legally binding digital e-signatures",
        "Territory allocation and radius protection",
        "Post-signing store rollout tracking",
      ],
    },
  ];

  return (
    <div className="bg-[#F8FAFC] min-h-screen py-16">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
        {/* Header */}
        <div className="text-center space-y-4 max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#EFF4FF] border border-[#BFD3FE] text-[#315EFB] text-xs font-semibold">
            <Compass className="w-3.5 h-3.5" />
            Standardized Expansion Architecture
          </div>
          <h1 className="text-4xl sm:text-5xl font-extrabold text-[#14243A] tracking-tight">
            How Franchise Expansion Works
          </h1>
          <p className="text-sm sm:text-base text-[#64748B] leading-relaxed">
            A predictable, transparent, and legally audited pathway for brands to scale nationally and investors to build compounding equity.
          </p>
        </div>

        {/* 5-Stage Step-by-Step Flow */}
        <div className="space-y-6">
          {stages.map((stage, idx) => (
            <div
              key={idx}
              className="surface-card p-6 sm:p-8 flex flex-col md:flex-row gap-6 items-start"
            >
              <div className="w-14 h-14 rounded-2xl bg-[#14243A] text-white font-extrabold text-lg flex items-center justify-center shrink-0 shadow-sm">
                {stage.num}
              </div>
              <div className="space-y-3 flex-1">
                <h3 className="text-lg sm:text-xl font-bold text-[#14243A]">{stage.title}</h3>
                <p className="text-xs sm:text-sm text-[#64748B] leading-relaxed">{stage.desc}</p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-2 text-xs">
                  {stage.points.map((pt, pIdx) => (
                    <div
                      key={pIdx}
                      className="bg-[#F8FAFC] p-2.5 rounded-lg border border-[#E7ECF2] text-[#14243A] flex items-center gap-2"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5 text-[#159D8B] shrink-0" />
                      <span className="text-[11px] font-medium">{pt}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Bottom CTA Box */}
        <div className="surface-card p-10 bg-white text-center space-y-6">
          <h2 className="text-2xl font-bold text-[#14243A]">Ready to Take the First Step?</h2>
          <p className="text-xs sm:text-sm text-[#64748B] max-w-lg mx-auto">
            Whether you want to franchise your brand or invest in a vetted business, our team is ready to guide you.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-3">
            <Link href="/for-businesses" className="btn-primary py-2.5 px-6 text-xs font-semibold">
              List Your Franchise
            </Link>
            <Link href="/franchises" className="btn-secondary py-2.5 px-6 text-xs font-semibold">
              Browse Directory
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
