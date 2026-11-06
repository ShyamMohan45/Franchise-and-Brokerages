import React from "react";

export default function TermsPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-8 text-slate-700">
      <div className="space-y-2 border-b border-slate-200 pb-6">
        <h1 className="text-3xl font-extrabold text-navy-900">Terms and Conditions</h1>
        <p className="text-xs text-slate-500">Last updated: 2026</p>
      </div>

      <section className="space-y-4 text-sm leading-relaxed">
        <h2 className="text-lg font-bold text-navy-900">1. Acceptance of Terms</h2>
        <p>
          By accessing or utilizing FranchiseBridge, you agree to comply with and be bound by these terms. If you do not
          agree, you must cease using the platform immediately.
        </p>

        <h2 className="text-lg font-bold text-navy-900">2. Accuracy of Representations</h2>
        <p>
          Franchisors warrant that all financial, store-count, and operational disclosures provided on the platform are
          truthful and verifiable. Franchise investors warrant that pledged investment budgets reflect genuine,
          unencumbered capital availability.
        </p>

        <h2 className="text-lg font-bold text-navy-900">3. Brokerage & Advisory Scope</h2>
        <p>
          FranchiseBridge acts as a technology platform and commercial franchise broker. We do not provide statutory legal
          certifications or guaranteed investment outcomes.
        </p>
      </section>
    </div>
  );
}
