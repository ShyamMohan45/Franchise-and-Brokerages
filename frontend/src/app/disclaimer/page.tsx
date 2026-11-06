import React from "react";

export default function DisclaimerPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-8 text-slate-700">
      <div className="space-y-2 border-b border-slate-200 pb-6">
        <h1 className="text-3xl font-extrabold text-navy-900">Regulatory & Financial Disclaimer</h1>
        <p className="text-xs text-slate-500">Legal Compliance Disclosure</p>
      </div>

      <section className="space-y-4 text-sm leading-relaxed">
        <div className="bg-amber-50 p-6 rounded-2xl border border-amber-200 text-amber-900 space-y-2">
          <h2 className="text-base font-bold">Important Notice Regarding Financial & Legal Claims</h2>
          <p className="text-xs leading-relaxed">
            Franchise opportunities involve commercial risk. Historical performance, past unit-level sales figures, and
            EBITDA representations displayed on this platform are voluntarily submitted by brand owners and vetted on an
            advisory basis. They do not constitute a guarantee of future profits or return on investment.
          </p>
        </div>

        <h2 className="text-lg font-bold text-navy-900">Jurisdiction Compliance</h2>
        <p>
          In the United States, franchise offerings must comply with Federal Trade Commission (FTC) franchise disclosure rules
          and relevant state registration requirements. In India, franchising operates within the framework of the Indian
          Contract Act (1872), Trademarks Act (1999), and Consumer Protection Act (2019).
        </p>

        <h2 className="text-lg font-bold text-navy-900">Independent Legal & Financial Counsel</h2>
        <p>
          Prospective franchisees are strongly encouraged to consult independent legal counsel and certified public
          accountants before executing any legally binding franchise agreements or remitting franchise fees.
        </p>
      </section>
    </div>
  );
}
