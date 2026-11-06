"use client";

import React, { useState } from "react";
import { ChevronRight } from "lucide-react";

export default function FaqPage() {
  const [activeIdx, setActiveIdx] = useState<number | null>(0);

  const faqs = [
    {
      q: "What is the 8-Pillar Franchise Readiness Index?",
      a: "Our proprietary diagnostic benchmark evaluates: 1) Brand Strength, 2) Unit Economics, 3) SOP Codification, 4) Legal FDD & IP Readiness, 5) Supply Chain Traceability, 6) Training Academy Systems, 7) Multi-Unit Repeatability, and 8) Expansion Support Capacity.",
    },
    {
      q: "Does FranchiseBridge draft legally binding FDD documents?",
      a: "We structure the comprehensive disclosure checklists, Item 1-23 documentation frameworks, and operational exhibits. All final legal certifications and filings are prepared or reviewed by qualified franchise legal counsel in your relevant jurisdiction.",
    },
    {
      q: "How does the platform protect investor privacy?",
      a: "Investor personal contact coordinates (email, phone) are strictly masked. Business owners can only see verified investor criteria (liquid capital, past operating experience, target city) until an introduction is approved by the brokerage team.",
    },
    {
      q: "What fees do you charge business owners vs investors?",
      a: "Browsing opportunities and submitting applications is 100% free for investors. Business owners pay structured development fees for SOP and legal packaging, plus a standardized success-based brokerage commission on closed franchise agreements.",
    },
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-12">
      <div className="text-center space-y-3">
        <span className="text-blue-600 font-semibold text-xs uppercase tracking-wider">Help & Clarifications</span>
        <h1 className="text-4xl font-extrabold text-navy-900 tracking-tight">Frequently Asked Questions</h1>
        <p className="text-slate-600 text-sm">Everything you need to know about our development and brokerage model.</p>
      </div>

      <div className="space-y-4">
        {faqs.map((faq, idx) => (
          <div key={idx} className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
            <button
              onClick={() => setActiveIdx(activeIdx === idx ? null : idx)}
              className="w-full p-6 text-left flex items-center justify-between font-bold text-navy-900 text-base hover:text-blue-600 transition-colors"
            >
              <span>{faq.q}</span>
              <ChevronRight
                className={`w-5 h-5 text-slate-400 transition-transform ${
                  activeIdx === idx ? "rotate-90 text-blue-600" : ""
                }`}
              />
            </button>
            {activeIdx === idx && (
              <div className="px-6 pb-6 text-sm text-slate-600 leading-relaxed border-t border-slate-100 pt-4">
                {faq.a}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
