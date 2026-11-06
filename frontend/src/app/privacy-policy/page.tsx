import React from "react";
import Link from "next/link";

export default function PrivacyPolicyPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-8 text-slate-700">
      <div className="space-y-2 border-b border-slate-200 pb-6">
        <h1 className="text-3xl font-extrabold text-navy-900">Privacy & Confidentiality Policy</h1>
        <p className="text-xs text-slate-500">Effective Date: January 1, 2026</p>
      </div>

      <section className="space-y-4 text-sm leading-relaxed">
        <h2 className="text-lg font-bold text-navy-900">1. Information Governance & Investor Privacy</h2>
        <p>
          At FranchiseBridge, we respect the sensitivity of private wealth and brand proprietary secrets. Direct contact
          details of prospective franchise investors (including personal phone numbers and direct emails) are kept strictly
          confidential and are never published publicly.
        </p>

        <h2 className="text-lg font-bold text-navy-900">2. Non-Disclosure & Mutual Introductions</h2>
        <p>
          Before any proprietary standard operating procedures (SOPs), supplier lists, or Franchise Disclosure Documents
          (FDDs) are shared with a candidate, a bilateral Non-Disclosure Agreement (NDA) must be digitally executed.
        </p>

        <h2 className="text-lg font-bold text-navy-900">3. Data Security & Storage</h2>
        <p>
          We employ enterprise-grade encryption for all stored sensitive files, financial records, and operational
          documents. Authentication tokens are managed strictly using secure HttpOnly cookies and encrypted sessions.
        </p>
      </section>
    </div>
  );
}
