import React from "react";
import Link from "next/link";

export default function DisclaimerPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-8 text-slate-700">
      <div className="space-y-2 border-b border-slate-200 pb-6">
        <h1 className="text-3xl font-extrabold text-slate-900">Regulatory & Investment Risk Disclaimer</h1>
        <p className="text-xs text-slate-500">Legal Compliance & Risk Notification | Last Updated: November 2026</p>
      </div>

      <section className="space-y-6 text-sm leading-relaxed">
        <div className="bg-amber-50 p-6 rounded-2xl border border-amber-200 text-amber-900 space-y-2">
          <h2 className="text-base font-bold">Important Notice Regarding Financial & Commercial Risk</h2>
          <p className="text-xs leading-relaxed">
            Franchise investments involve significant commercial risk, market competition, and potential capital loss. Historical revenue, past unit-level EBITDA margins, and payback period estimates displayed across this platform are provided directly by brand franchisors and summarized for preliminary comparative review only. They do <strong>NOT</strong> constitute a guarantee, promise, or warranty of future profits, sales volumes, or return on investment (ROI).
          </p>
        </div>

        <div className="space-y-2">
          <h2 className="text-lg font-bold text-slate-900">1. No Guaranteed Returns or Financial Advice</h2>
          <p>
            FranchiseBridge does not provide certified financial planning, tax accounting, or individualized investment advice. Projections and financial calculators available on the platform are educational models based on parameters entered by users and brands. Actual unit-level economics will vary according to geographic catchment, local rent, managerial capability, labor costs, and macroeconomic factors.
          </p>
        </div>

        <div className="space-y-2">
          <h2 className="text-lg font-bold text-slate-900">2. Statutory & Regulatory Jurisdiction</h2>
          <p>
            Franchising arrangements brokered or listed on this platform are subject to governing commercial laws:
          </p>
          <ul className="list-disc pl-5 space-y-1.5 text-slate-600">
            <li><strong>India:</strong> Governed by the Indian Contract Act (1872), the Specific Relief Act (1963), the Trade Marks Act (1999), and the Competition Act (2002).</li>
            <li><strong>International / United States:</strong> Offers made to prospective franchisees resident in the United States must comply with the Federal Trade Commission (FTC) Franchise Rule (16 C.F.R. Part 436) and state franchise registration requirements.</li>
          </ul>
        </div>

        <div className="space-y-2">
          <h2 className="text-lg font-bold text-slate-900">3. Requirement for Independent Professional Counsel</h2>
          <p>
            Prospective franchise operators and investors are strongly instructed to retain independent legal counsel and chartered accountants (CPAs) to conduct independent due diligence, inspect Franchise Disclosure Documents, and review commercial lease agreements prior to committing non-refundable franchise fees or signing agreements.
          </p>
        </div>

        <div className="space-y-2">
          <h2 className="text-lg font-bold text-slate-900">4. Support & Compliance Desk</h2>
          <p>
            If you encounter discrepancies in published brand metrics, suspect inaccurate representations, or need verification assistance, please alert our brokerage compliance desk immediately:
          </p>
          <div className="bg-slate-100 p-4 rounded-xl text-xs space-y-1 text-slate-700">
            <p><strong>Compliance Desk:</strong> FranchiseBridge Risk & Advisory Team</p>
            <p><strong>Email:</strong> <a href="mailto:compliance@franchisebridge.com" className="text-blue-600 underline">compliance@franchisebridge.com</a></p>
            <p><strong>Direct Helpline:</strong> +91 (80) 4567-8900 (Mon–Fri, 9:00 AM – 6:00 PM IST)</p>
          </div>
        </div>
      </section>

      <div className="pt-6 border-t border-slate-200 flex justify-between items-center text-xs text-slate-500">
        <Link href="/privacy-policy" className="hover:text-blue-600 underline">View Privacy Policy</Link>
        <Link href="/terms-and-conditions" className="hover:text-blue-600 underline">View Terms & Conditions</Link>
      </div>
    </div>
  );
}
