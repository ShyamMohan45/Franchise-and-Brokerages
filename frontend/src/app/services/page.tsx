import React from "react";
import Link from "next/link";
import { TrendingUp, FileCheck2, Scale, Users2, Compass, ArrowRight, CheckCircle2 } from "lucide-react";

export default function ServicesPage() {
  const services = [
    {
      title: "Franchise Development & Readiness Diagnostic",
      slug: "franchise-development",
      icon: TrendingUp,
      desc: "Comprehensive 8-pillar audit evaluating unit-level EBITDA, operating repeatability, and brand equity.",
      deliverables: ["8-Pillar Readiness Score", "Financial Model & Royalty Architecture", "Expansion Feasibility Study"],
    },
    {
      title: "Standard Operating Procedure (SOP) Codification",
      slug: "sop-development",
      icon: FileCheck2,
      desc: "Transforming founder intuition into standardized, step-by-step digital operating manuals and training checklists.",
      deliverables: ["Daily Opening/Closing Manuals", "Quality & Recipe Verification Cards", "Staff Training Curricula"],
    },
    {
      title: "Franchise Disclosure Document (FDD) & Legal Packaging",
      slug: "legal-documentation",
      icon: Scale,
      desc: "Structuring regulatory disclosure packages, trademark licensing protections, and territorial covenants.",
      deliverables: ["Master FDD / FIM Disclosure Package", "Unit & Multi-Unit Franchise Agreements", "IP Licensing & NDA Templates"],
    },
    {
      title: "Multi-Unit Investor Recruitment & Brokerage",
      slug: "investor-recruitment",
      icon: Users2,
      desc: "Targeted matching with certified high-net-worth operators, family offices, and retail franchisees.",
      deliverables: ["Investor Vetting & Liquid Net Worth Verification", "Broker-Assisted Introduction Meetings", "Deal Pipeline & Closing Oversight"],
    },
    {
      title: "Territory Expansion & Real Estate Consulting",
      slug: "expansion-consulting",
      icon: Compass,
      desc: "Strategic corridor mapping, commercial lease negotiation support, and demographic catchment analysis.",
      deliverables: ["Metropolitan Cluster Strategy", "Commercial Space Criteria Standards", "Rollout Milestone Tracking"],
    },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-16">
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <span className="text-blue-600 font-semibold text-xs uppercase tracking-wider">End-to-End Solutions</span>
        <h1 className="text-4xl font-extrabold text-navy-900 tracking-tight">Franchise Development & Advisory Services</h1>
        <p className="text-slate-600 text-base">
          From independent concept to certified national chain. We provide the operational, legal, and brokerage
          scaffolding ambitious brands need to scale responsibly.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {services.map((s, idx) => {
          const Icon = s.icon;
          return (
            <div
              key={idx}
              className="bg-white rounded-3xl border border-slate-200 p-8 space-y-6 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between"
            >
              <div className="space-y-4">
                <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                  <Icon className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold text-navy-900">{s.title}</h3>
                <p className="text-sm text-slate-600 leading-relaxed">{s.desc}</p>
                <div className="space-y-2 pt-2 border-t border-slate-100">
                  <span className="text-xs font-semibold text-slate-400 uppercase">Key Deliverables:</span>
                  <ul className="space-y-1.5 text-xs text-slate-700">
                    {s.deliverables.map((d, i) => (
                      <li key={i} className="flex items-center gap-2">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                        <span>{d}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100">
                <Link
                  href={`/services/${s.slug}`}
                  className="text-xs font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1.5"
                >
                  Explore Detailed Methodology <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
