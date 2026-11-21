"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Building2, Mail, AlertCircle, CheckCircle2, ArrowRight, ArrowLeft } from "lucide-react";
import { api } from "@/lib/api";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const cleanEmail = email.trim().toLowerCase();

    // Basic email format check before submitting
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(cleanEmail)) {
      setError("Please enter a valid corporate or personal email address.");
      setLoading(false);
      return;
    }

    try {
      await api.post("/auth/forgot-password", { email: cleanEmail });
      setSuccess(true);
    } catch (err: any) {
      // In case of network errors or server failures, display a safe user-facing message
      setError(
        err.message || "An error occurred while processing your request. Please try again later."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] bg-[#F8FAFC] dark:bg-[#000000] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 transition-colors duration-200">
      <div className="max-w-md w-full surface-card p-8 sm:p-10 space-y-6">
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-xl bg-[#14243A] dark:bg-[#101010] mx-auto flex items-center justify-center text-white shadow-sm border border-transparent dark:border-[#262626]">
            <Building2 className="w-6 h-6 text-[#3563FF]" />
          </div>
          <h2 className="text-2xl font-bold text-[#14243A] dark:text-[#FFFFFF] tracking-tight">
            Forgot Password?
          </h2>
          <p className="text-xs text-[#64748B] dark:text-[#A3A3A3]">
            Enter your registered email to receive secure recovery instructions
          </p>
        </div>

        {error && (
          <div className="p-3.5 bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800/60 text-rose-700 dark:text-rose-300 rounded-xl text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {success ? (
          <div className="space-y-5">
            <div className="p-4 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800/60 text-emerald-800 dark:text-emerald-200 rounded-xl text-xs space-y-2">
              <div className="flex items-center gap-2 font-semibold text-emerald-900 dark:text-emerald-100">
                <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
                <span>Recovery Instructions Sent</span>
              </div>
              <p className="leading-relaxed">
                If an account exists with the email address you entered, you will receive password reset instructions within a few minutes.
              </p>
              <p className="text-[11px] text-emerald-700 dark:text-emerald-300">
                Please check your inbox and spam folder. Reset links expire in 1 hour.
              </p>
            </div>

            <div className="pt-2 flex flex-col gap-3">
              <button
                type="button"
                onClick={() => {
                  setSuccess(false);
                  setEmail("");
                  setError(null);
                }}
                className="w-full py-2.5 px-4 rounded-xl border border-[#E7ECF2] dark:border-[#262626] text-xs font-semibold text-[#14243A] dark:text-[#FFFFFF] hover:bg-[#F8FAFC] dark:hover:bg-[#171717] transition-colors"
              >
                Send Another Request
              </button>

              <Link
                href="/login"
                className="btn-primary w-full py-2.5 text-xs font-semibold justify-center inline-flex items-center gap-1.5"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                Return to Sign In
              </Link>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            <div>
              <label className="block text-[#14243A] dark:text-[#FFFFFF] font-semibold mb-1">
                Corporate or Personal Email
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#64748B] dark:text-[#A3A3A3]" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@company.com"
                  disabled={loading}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[#E7ECF2] dark:border-[#262626] bg-white dark:bg-[#111111] text-sm text-[#14243A] dark:text-[#FFFFFF] placeholder-[#64748B] dark:placeholder-[#A3A3A3] focus:outline-none focus:border-[#3563FF] disabled:opacity-60"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full py-3 text-sm font-semibold justify-center inline-flex items-center"
            >
              {loading ? "Sending Instructions..." : "Send Reset Link"}
              <ArrowRight className="w-4 h-4 ml-1.5" />
            </button>

            <div className="pt-2 text-center">
              <Link
                href="/login"
                className="inline-flex items-center text-xs font-semibold text-[#64748B] dark:text-[#A3A3A3] hover:text-[#3563FF] transition-colors gap-1"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                Back to Sign In
              </Link>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
