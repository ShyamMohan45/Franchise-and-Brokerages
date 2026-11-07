"use client";

import React, { useState } from "react";
import { Mail, Phone, MapPin, CheckCircle2, Send, AlertCircle, ShieldCheck, Clock } from "lucide-react";
import { api } from "@/lib/api";

export default function ContactPage() {
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    subject: "",
    message: "",
    interestType: "expand_business",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      const res = await api.post("/public/contact", formData);
      if (res.success) {
        setIsSuccess(true);
        setFormData({
          fullName: "",
          email: "",
          phone: "",
          subject: "",
          message: "",
          interestType: "expand_business",
        });
      } else {
        setError(res.message || "Failed to submit enquiry");
      }
    } catch (err: any) {
      setError(err.message || "Submission error");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-[#F8FAFC] min-h-screen py-16">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#EFF4FF] border border-[#BFD3FE] text-[#315EFB] text-xs font-semibold">
            <Mail className="w-3.5 h-3.5" />
            Advisory Desk
          </div>
          <h1 className="text-4xl font-extrabold text-[#14243A] tracking-tight">
            Connect with Our Advisory Directors
          </h1>
          <p className="text-sm text-[#64748B]">
            Speak with our franchise development consultants or multi-unit brokerage managers.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Contact Info Card */}
          <div className="bg-[#14243A] text-white rounded-2xl p-8 space-y-8 border border-[#1C2A3E] shadow-sm flex flex-col justify-between">
            <div className="space-y-4">
              <h3 className="text-xl font-bold">Advisory & Governance Hub</h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Our brokerage operates across major commercial hubs in India, Middle East, and Southeast Asia.
              </p>

              <div className="space-y-4 text-xs text-slate-300 pt-4 border-t border-slate-700/60">
                <div className="flex items-start gap-3">
                  <MapPin className="w-4 h-4 text-[#315EFB] shrink-0 mt-0.5" />
                  <span>Level 7, Prestige Tech Center, Outer Ring Rd, Bengaluru, KA 560103</span>
                </div>
                <div className="flex items-center gap-3">
                  <Phone className="w-4 h-4 text-[#315EFB] shrink-0" />
                  <span>+91 (080) 4567-8900</span>
                </div>
                <div className="flex items-center gap-3">
                  <Mail className="w-4 h-4 text-[#315EFB] shrink-0" />
                  <span>advisory@franchisebridge.com</span>
                </div>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-[#1C2A3E] space-y-2 text-xs text-slate-300 border border-slate-700/50">
              <div className="flex items-center gap-2 font-semibold text-white">
                <Clock className="w-4 h-4 text-[#159D8B]" />
                <span>Response SLA</span>
              </div>
              <p className="text-[11px] text-slate-400">
                All franchisor and accredited investor inquiries are assigned to a sector director within 24 business hours.
              </p>
            </div>
          </div>

          {/* Contact Form */}
          <div className="lg:col-span-2 surface-card p-8 sm:p-10 space-y-6">
            {isSuccess ? (
              <div className="py-12 text-center space-y-4">
                <CheckCircle2 className="w-16 h-16 text-[#159D8B] mx-auto" />
                <h3 className="text-xl font-bold text-[#14243A]">Enquiry Logged Successfully</h3>
                <p className="text-xs text-[#64748B] max-w-sm mx-auto leading-relaxed">
                  Thank you! Your inquiry has been routed to our senior franchise development desk. An advisory partner will contact you shortly.
                </p>
                <button
                  onClick={() => setIsSuccess(false)}
                  className="btn-secondary py-2 px-5 text-xs font-semibold inline-block"
                >
                  Send another inquiry
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4 text-xs">
                {error && (
                  <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{error}</span>
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[#14243A] font-semibold mb-1">Full Name *</label>
                    <input
                      type="text"
                      required
                      value={formData.fullName}
                      onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                      placeholder="e.g. Ramesh Kumar"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-[#E7ECF2] text-[#14243A] focus:outline-none focus:border-[#315EFB]"
                    />
                  </div>
                  <div>
                    <label className="block text-[#14243A] font-semibold mb-1">Corporate Email *</label>
                    <input
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="e.g. ramesh@company.com"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-[#E7ECF2] text-[#14243A] focus:outline-none focus:border-[#315EFB]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[#14243A] font-semibold mb-1">Phone Number *</label>
                    <input
                      type="tel"
                      required
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      placeholder="+91 98765 43210"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-[#E7ECF2] text-[#14243A] focus:outline-none focus:border-[#315EFB]"
                    />
                  </div>
                  <div>
                    <label className="block text-[#14243A] font-semibold mb-1">Primary Interest *</label>
                    <select
                      value={formData.interestType}
                      onChange={(e) => setFormData({ ...formData, interestType: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-[#E7ECF2] text-[#14243A] focus:outline-none focus:border-[#315EFB] bg-white"
                    >
                      <option value="expand_business">I Want to Franchise My Business</option>
                      <option value="invest_in_franchise">I Want to Invest in Franchises</option>
                      <option value="brokerage_partnership">Brokerage / Legal Partnership</option>
                      <option value="general">General Inquiries</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-[#14243A] font-semibold mb-1">Subject *</label>
                  <input
                    type="text"
                    required
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    placeholder="e.g. Inquiring regarding QSR franchise expansion"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#E7ECF2] text-[#14243A] focus:outline-none focus:border-[#315EFB]"
                  />
                </div>

                <div>
                  <label className="block text-[#14243A] font-semibold mb-1">Message *</label>
                  <textarea
                    rows={4}
                    required
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    placeholder="Provide details about your business concept, current outlets, or investment timeline..."
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#E7ECF2] text-[#14243A] focus:outline-none focus:border-[#315EFB]"
                  />
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="btn-primary w-full py-3 text-sm font-semibold"
                  >
                    <Send className="w-4 h-4 mr-1" />
                    {isSubmitting ? "Submitting Inquiry..." : "Submit Inquiry"}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
