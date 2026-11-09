import React from "react";
import Link from "next/link";

export default function PrivacyPolicyPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-8 text-slate-700">
      <div className="space-y-2 border-b border-slate-200 pb-6">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">
          DPDP Act 2023 Compliant
        </div>
        <h1 className="text-3xl font-extrabold text-slate-900">Privacy & Data Governance Policy</h1>
        <p className="text-xs text-slate-500">Effective Date: January 1, 2026 | Last Updated: November 2026</p>
      </div>

      <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200 text-slate-800 space-y-2">
        <h2 className="text-sm font-bold text-slate-900">Data Fiduciary Commitment</h2>
        <p className="text-xs leading-relaxed text-slate-600">
          FranchiseBridge Advisory Technologies Pvt. Ltd. (&quot;FranchiseBridge&quot;, &quot;we&quot;, &quot;us&quot;, or &quot;our&quot;) operates as a Data Fiduciary under the provisions of the Indian Digital Personal Data Protection Act, 2023 (DPDP Act) and international data governance frameworks. This policy governs how we collect, store, process, and protect information submitted by investors, brand franchisors, and commercial brokers.
        </p>
      </div>

      <section className="space-y-6 text-sm leading-relaxed">
        <div className="space-y-2">
          <h2 className="text-lg font-bold text-slate-900">1. Information Governance & Investor Privacy</h2>
          <p>
            At FranchiseBridge, we respect the utmost sensitivity of private wealth credentials, financial liquidity declarations, and brand proprietary disclosures. Direct contact details of prospective franchise investors (including personal phone numbers, tax IDs, and direct email addresses) are strictly confidential and are never published publicly, sold to third-party telemarketers, or exposed on public directory listings.
          </p>
        </div>

        <div className="space-y-2">
          <h2 className="text-lg font-bold text-slate-900">2. Categories of Data Collected</h2>
          <ul className="list-disc pl-5 space-y-1.5 text-slate-600">
            <li><strong>Identity & Profile Data:</strong> Full legal name, professional email address, mobile number, city, and jurisdiction.</li>
            <li><strong>Financial Qualifications:</strong> Self-certified net worth bracket, available liquid capital in INR, investment timeframe, and prior business ownership track record.</li>
            <li><strong>Brand Proprietary Collateral:</strong> Franchise Disclosure Documents (FDDs), audited unit economics, master franchise territory plans, store blueprints, and brand trademarks.</li>
            <li><strong>Audit Logs & Technical Telemetry:</strong> Timestamped IP addresses, user-agent metadata, deal room document download records, and system verification signatures.</li>
          </ul>
        </div>

        <div className="space-y-2">
          <h2 className="text-lg font-bold text-slate-900">3. Non-Disclosure & Deal Room Access Control</h2>
          <p>
            Before any proprietary standard operating procedures (SOPs), supplier lists, financial unit models, or confidential franchise documents are unlocked in a virtual Deal Room, all participating parties must be verified and execute an electronic Non-Disclosure Agreement (NDA). All file downloads in the Deal Room are recorded in immutable audit logs with role-based authorization checks.
          </p>
        </div>

        <div className="space-y-2">
          <h2 className="text-lg font-bold text-slate-900">4. Data Principal Rights (DPDP Act 2023)</h2>
          <p>Under the DPDP Act 2023, data principals retain the following statutory rights:</p>
          <ul className="list-disc pl-5 space-y-1.5 text-slate-600">
            <li><strong>Right to Summary:</strong> Request a comprehensive summary of all personal information and audit logs maintained by the platform.</li>
            <li><strong>Right to Correction & Erasure:</strong> Request the rectification of obsolete financial qualifications or the erasure of personal accounts upon completion or termination of brokerage agreements.</li>
            <li><strong>Right to Withdraw Consent:</strong> Withdraw marketing or communications consent at any time without impacting prior lawful processing.</li>
          </ul>
        </div>

        <div className="space-y-2">
          <h2 className="text-lg font-bold text-slate-900">5. Grievance Redressal & Contact Channels</h2>
          <p>
            If you have questions, wish to exercise your data principal rights, or have security concerns, you may contact our designated Data Protection & Grievance Officer:
          </p>
          <div className="bg-slate-100 p-4 rounded-xl text-xs space-y-1 text-slate-700">
            <p><strong>Grievance Officer:</strong> Legal & Compliance Desk</p>
            <p><strong>Entity:</strong> FranchiseBridge Advisory Technologies Pvt. Ltd.</p>
            <p><strong>Direct Email:</strong> <a href="mailto:grievance@franchisebridge.com" className="text-blue-600 underline">grievance@franchisebridge.com</a></p>
            <p><strong>Support Desk:</strong> <a href="mailto:support@franchisebridge.com" className="text-blue-600 underline">support@franchisebridge.com</a></p>
            <p><strong>Response SLA:</strong> Acknowledged within 24 hours, resolved within 15 working days.</p>
          </div>
        </div>
      </section>

      <div className="pt-6 border-t border-slate-200 flex justify-between items-center text-xs text-slate-500">
        <Link href="/terms-and-conditions" className="hover:text-blue-600 underline">View Terms & Conditions</Link>
        <Link href="/disclaimer" className="hover:text-blue-600 underline">View Regulatory Disclaimer</Link>
      </div>
    </div>
  );
}
