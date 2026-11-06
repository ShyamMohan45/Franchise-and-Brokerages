"use client";

import React, { useState } from "react";
import { Mail, Phone, MapPin, CheckCircle2, Send, AlertCircle } from "lucide-react";
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
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-12">
      <div className="text-center max-w-2xl mx-auto space-y-3">
        <span className="text-blue-600 font-semibold text-xs uppercase tracking-wider">Get in Touch</span>
        <h1 className="text-4xl font-extrabold text-navy-900 tracking-tight">Contact Advisory Team</h1>
        <p className="text-slate-600 text-sm">
          Speak with our franchise development consultants or multi-unit brokerage managers.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* Contact Info Card */}
        <div className="bg-[#0B1220] text-white rounded-3xl p-8 space-y-8 border border-slate-800 shadow-xl">
          <div className="space-y-3">
            <h3 className="text-xl font-bold">Headquarters & Advisory</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Our brokerage operates across major commercial hubs in India, Middle East, and Southeast Asia.
            </p>
          </div>

          <div className="space-y-6 text-xs text-slate-300">
            <div className="flex items-start gap-3">
              <MapPin className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
              <span>Level 7, Prestige Tech Center, Outer Ring Rd, Bengaluru, KA 560103</span>
            </div>
            <div className="flex items-center gap-3">
              <Phone className="w-5 h-5 text-amber-400 shrink-0" />
              <span>+91 (080) 4567-8900</span>
            </div>
            <div className="flex items-center gap-3">
              <Mail className="w-5 h-5 text-amber-400 shrink-0" />
              <span>advisory@franchisebridge.com</span>
            </div>
          </div>
        </div>

        {/* Contact Form */}
        <div className="lg:col-span-2 bg-white rounded-3xl border border-slate-200 p-8 sm:p-10 shadow-sm space-y-6">
          {isSuccess ? (
            <div className="py-12 text-center space-y-4">
              <CheckCircle2 className="w-16 h-16 text-emerald-500 mx-auto" />
              <h3 className="text-xl font-bold text-navy-900">Enquiry Received</h3>
              <p className="text-xs text-slate-600 max-w-sm mx-auto leading-relaxed">
                Thank you! Your inquiry has been routed to our senior franchise development team. A partner will contact
                you within 1 business day.
              </p>
              <button
                onClick={() => setIsSuccess(false)}
                className="text-xs font-semibold text-blue-600 hover:underline pt-2 inline-block"
              >
                Send another message
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
                  <label className="block text-slate-700 font-semibold mb-1">Full Name *</label>
                  <input
                    type="text"
                    required
                    value={formData.fullName}
                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Corporate Email *</label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Phone Number *</label>
                  <input
                    type="tel"
                    required
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Primary Interest *</label>
                  <select
                    value={formData.interestType}
                    onChange={(e) => setFormData({ ...formData, interestType: e.target.value })}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-blue-500"
                  >
                    <option value="expand_business">I Want to Franchise My Business</option>
                    <option value="invest_in_franchise">I Want to Invest in Franchises</option>
                    <option value="brokerage_partnership">Brokerage / Legal Partnership</option>
                    <option value="general">General Inquiries</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Subject *</label>
                <input
                  type="text"
                  required
                  value={formData.subject}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                  placeholder="e.g. Inquiry regarding QSR franchise expansion"
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Message *</label>
                <textarea
                  rows={4}
                  required
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  placeholder="Tell us about your brand or investment goals..."
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl shadow text-sm transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  <Send className="w-4 h-4" />
                  {isSubmitting ? "Sending..." : "Submit Enquiry"}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
