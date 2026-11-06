import React from "react";
import Link from "next/link";
import { Scale, CheckCircle2 } from "lucide-react";

export default function LegalDocumentationServicePage() {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-12">
      <div className="space-y-4">
        <Link href="/services" className="text-xs font-semibold text-blue-600 hover:underline">
          &larr; Back to Services
        </Link>
        <span className="text-blue-600 font-semibold text-xs uppercase tracking-wider block">Legal & Compliance</span>
        <h1 className="text-4xl font-extrabold text-navy-900 tracking-tight">FDD Packaging & Franchise Agreements</h1>
        <p className="text-base text-slate-600 leading-relaxed max-w-3xl">
          Franchise agreements and disclosure memorandums require specialized regulatory and jurisdictional precision.
          We coordinate with legal counsel to structure compliant documentation.
        </p>
      </div>

      <div className="bg-white rounded-3xl border border-slate-200 p-8 sm:p-10 space-y-8 shadow-sm">
        <h2 className="text-2xl font-bold text-navy-900">Jurisdiction-Specific Regulatory Architecture:</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm text-slate-700">
          <div className="space-y-2 p-5 rounded-2xl bg-slate-50 border border-slate-100">
            <h3 className="font-bold text-navy-900">US FTC 23-Item Franchise Disclosure Document (FDD)</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Strict item-by-item compliance including Item 5 (Initial Fees), Item 7 (Estimated Initial Investment),
              Item 19 (Financial Performance Representations), and audited financial statements.
            </p>
          </div>
          <div className="space-y-2 p-5 rounded-2xl bg-slate-50 border border-slate-100">
            <h3 className="font-bold text-navy-900">India Franchise Information Memorandum (FIM) & Agreement</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Governed under the Indian Contract Act (1872), Trademarks Act (1999), and Competition Act (2002).
              Includes strict non-compete definitions, IP licensing safeguards, and dispute arbitration clauses.
            </p>
          </div>
        </div>

        <div className="bg-amber-50/70 border border-amber-200 p-5 rounded-xl text-xs text-amber-900">
          <strong>Important Regulatory Disclosure:</strong> FranchiseBridge provides operational structuring and
          coordination. All final legal agreements and disclosures are reviewed and executed in conjunction with
          certified franchise attorneys.
        </div>
      </div>
    </div>
  );
}
