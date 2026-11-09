import React from "react";
import Link from "next/link";

export default function TermsPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-8 text-slate-700">
      <div className="space-y-2 border-b border-slate-200 pb-6">
        <h1 className="text-3xl font-extrabold text-slate-900">Terms of Service & Brokerage Agreement</h1>
        <p className="text-xs text-slate-500">Effective Date: January 1, 2026 | Last Updated: November 2026</p>
      </div>

      <section className="space-y-6 text-sm leading-relaxed">
        <div className="space-y-2">
          <h2 className="text-lg font-bold text-slate-900">1. Acceptance & Eligibility</h2>
          <p>
            By creating an account, accessing marketplace listings, or utilizing the Deal Room workspaces provided by FranchiseBridge (&quot;the Platform&quot;), you acknowledge that you are at least 18 years of age, legally capable of entering into binding contracts, and agree to these Terms. If you are acting on behalf of a corporation, you represent that you possess the requisite authority to bind that entity.
          </p>
        </div>

        <div className="space-y-2">
          <h2 className="text-lg font-bold text-slate-900">2. Scope of Brokerage & Advisory Services</h2>
          <p>
            FranchiseBridge operates as an intermediary marketplace, CRM, and transactional brokerage management platform. FranchiseBridge facilitates introductions, coordinates due diligence deal rooms, and tracks success milestones. 
          </p>
          <div className="bg-amber-50 border border-amber-200 p-4 rounded-xl text-xs text-amber-900">
            <strong>Notice Regarding Legal Status:</strong> Uploading, previewing, or reviewing franchise contracts, disclosure circulars, or letters of intent (LOI) within the platform does not constitute statutory legal execution or governmental certification. Final binding franchise relationships require independent bilateral execution, applicable stamp duty compliance, and statutory registration under local law.
          </div>
        </div>

        <div className="space-y-2">
          <h2 className="text-lg font-bold text-slate-900">3. Commission Agreements & Fee Calculations</h2>
          <p>
            All commercial brokerage fees, success retainers, and milestone payouts are governed by bilateral Commission Agreements established between FranchiseBridge and participating brand franchisors or institutional investors. 
          </p>
          <ul className="list-disc pl-5 space-y-1.5 text-slate-600">
            <li>Commission fees are strictly denominated in Indian Rupees (INR) and tracked in integer paise to eliminate rounding discrepancies.</li>
            <li>Milestone payments become due upon verified fulfillment of defined triggers (e.g. Agreement Signing, Initial Fee Clearance, Site Possession, Unit Launch).</li>
            <li>Payments are only recorded as settled after administrative receipt and verification of authentic banking transaction references.</li>
          </ul>
        </div>

        <div className="space-y-2">
          <h2 className="text-lg font-bold text-slate-900">4. User Representations & Due Diligence Obligations</h2>
          <p>
            <strong>Brand Franchisors:</strong> Warrant that all published unit economics, royalties, space requirements, and trademarks are authentic, verifiable, and free of encumbrance.
          </p>
          <p>
            <strong>Prospective Franchisees:</strong> Warrant that stated investment budgets, liquid net worth credentials, and business experience profiles reflect genuine, unencumbered capital.
          </p>
        </div>

        <div className="space-y-2">
          <h2 className="text-lg font-bold text-slate-900">5. Limitation of Liability & Dispute Resolution</h2>
          <p>
            To the maximum extent permitted by applicable law, FranchiseBridge shall not be liable for any indirect, incidental, or consequential damages resulting from business decisions or commercial franchise outcomes. Any dispute arising out of or related to these Terms shall be resolved through binding arbitration in accordance with the Indian Arbitration and Conciliation Act, 1996, with the seat of arbitration in Bengaluru, India.
          </p>
        </div>

        <div className="space-y-2">
          <h2 className="text-lg font-bold text-slate-900">6. Support & Inquiries</h2>
          <p>
            For legal inquiries, dispute resolution notices, or general support, contact our operations desk at <a href="mailto:support@franchisebridge.com" className="text-blue-600 underline">support@franchisebridge.com</a>.
          </p>
        </div>
      </section>

      <div className="pt-6 border-t border-slate-200 flex justify-between items-center text-xs text-slate-500">
        <Link href="/privacy-policy" className="hover:text-blue-600 underline">View Privacy Policy</Link>
        <Link href="/disclaimer" className="hover:text-blue-600 underline">View Regulatory Disclaimer</Link>
      </div>
    </div>
  );
}
