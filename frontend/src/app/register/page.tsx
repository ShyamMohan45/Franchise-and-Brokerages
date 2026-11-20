"use client";

import React, { useState, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useAuth } from "@/providers/AuthProvider";
import { Building2, Briefcase, Mail, Lock, User, Phone, AlertCircle, ArrowRight, ShieldCheck } from "lucide-react";

function RegisterForm() {
  const searchParams = useSearchParams();
  const initialRole = searchParams.get("role") || "business_owner";
  const { register } = useAuth();

  const [role, setRole] = useState(initialRole);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      await register({
        fullName,
        email,
        phone,
        password,
        role,
      });
    } catch (err: any) {
      setError(err.message || "Registration failed. Please check your information.");
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
          <h2 className="text-2xl font-bold text-[#14243A] dark:text-[#FFFFFF] tracking-tight">Create Your Account</h2>
          <p className="text-xs text-[#64748B] dark:text-[#A3A3A3]">Join the intelligent franchise development & expansion network</p>
        </div>

        {/* Stakeholder Role Switcher */}
        <div className="grid grid-cols-3 gap-1.5 bg-[#F8FAFC] dark:bg-[#090909] p-1.5 rounded-xl border border-[#E7ECF2] dark:border-[#262626]">
          <button
            type="button"
            onClick={() => setRole("business_owner")}
            className={`py-2 px-2 rounded-lg text-xs font-semibold flex items-center justify-center gap-1 transition-all ${
              role === "business_owner"
                ? "bg-[#14243A] dark:bg-[#171717] text-white shadow-sm border border-transparent dark:border-[#333333]"
                : "text-[#64748B] dark:text-[#A3A3A3] hover:text-[#14243A] dark:hover:text-[#FFFFFF]"
            }`}
          >
            <Building2 className="w-3.5 h-3.5" />
            <span className="truncate">Franchisor</span>
          </button>
          <button
            type="button"
            onClick={() => setRole("investor")}
            className={`py-2 px-2 rounded-lg text-xs font-semibold flex items-center justify-center gap-1 transition-all ${
              role === "investor"
                ? "bg-[#14243A] dark:bg-[#171717] text-white shadow-sm border border-transparent dark:border-[#333333]"
                : "text-[#64748B] dark:text-[#A3A3A3] hover:text-[#14243A] dark:hover:text-[#FFFFFF]"
            }`}
          >
            <Briefcase className="w-3.5 h-3.5" />
            <span className="truncate">Investor</span>
          </button>
          <button
            type="button"
            onClick={() => setRole("admin")}
            className={`py-2 px-2 rounded-lg text-xs font-semibold flex items-center justify-center gap-1 transition-all ${
              role === "admin"
                ? "bg-[#14243A] dark:bg-[#171717] text-white shadow-sm border border-transparent dark:border-[#333333]"
                : "text-[#64748B] dark:text-[#A3A3A3] hover:text-[#14243A] dark:hover:text-[#FFFFFF]"
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5 text-[#3563FF]" />
            <span className="truncate">Admin</span>
          </button>
        </div>

        {role === "admin" && (
          <div className="p-3 bg-blue-50 dark:bg-[#171717] border border-blue-200 dark:border-[#262626] text-[#14243A] dark:text-[#D4D4D4] rounded-xl text-xs flex items-start gap-2">
            <ShieldCheck className="w-4 h-4 text-[#3563FF] shrink-0 mt-0.5" />
            <span>
              <strong>Platform Administrator:</strong> Full access to brokerage pipeline, franchise listing verifications, deal rooms, user controls, and audit logs.
            </span>
          </div>
        )}

        {error && (
          <div className="p-3.5 bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800/60 text-rose-700 dark:text-rose-300 rounded-xl text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block text-[#14243A] dark:text-[#FFFFFF] font-semibold mb-1">Full Legal Name *</label>
            <div className="relative">
              <User className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#64748B] dark:text-[#A3A3A3]" />
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="e.g. Rahul Sharma"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[#E7ECF2] dark:border-[#262626] bg-white dark:bg-[#111111] text-sm text-[#14243A] dark:text-[#FFFFFF] placeholder-[#64748B] dark:placeholder-[#A3A3A3] focus:outline-none focus:border-[#3563FF]"
              />
            </div>
          </div>

          <div>
            <label className="block text-[#14243A] dark:text-[#FFFFFF] font-semibold mb-1">Corporate or Business Email *</label>
            <div className="relative">
              <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#64748B] dark:text-[#A3A3A3]" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@company.com"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[#E7ECF2] dark:border-[#262626] bg-white dark:bg-[#111111] text-sm text-[#14243A] dark:text-[#FFFFFF] placeholder-[#64748B] dark:placeholder-[#A3A3A3] focus:outline-none focus:border-[#3563FF]"
              />
            </div>
          </div>

          <div>
            <label className="block text-[#14243A] dark:text-[#FFFFFF] font-semibold mb-1">Phone Number *</label>
            <div className="relative">
              <Phone className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#64748B] dark:text-[#A3A3A3]" />
              <input
                type="tel"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+91 98765 43210"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[#E7ECF2] dark:border-[#262626] bg-white dark:bg-[#111111] text-sm text-[#14243A] dark:text-[#FFFFFF] placeholder-[#64748B] dark:placeholder-[#A3A3A3] focus:outline-none focus:border-[#3563FF]"
              />
            </div>
          </div>

          <div>
            <label className="block text-[#14243A] dark:text-[#FFFFFF] font-semibold mb-1">Password (min 8 chars) *</label>
            <div className="relative">
              <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#64748B] dark:text-[#A3A3A3]" />
              <input
                type="password"
                required
                minLength={8}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[#E7ECF2] dark:border-[#262626] bg-white dark:bg-[#111111] text-sm text-[#14243A] dark:text-[#FFFFFF] placeholder-[#64748B] dark:placeholder-[#A3A3A3] focus:outline-none focus:border-[#3563FF]"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn-primary w-full py-3 text-sm font-semibold justify-center"
          >
            {loading ? "Creating Account..." : role === "admin" ? "Create Admin Account" : "Create Account"}
            <ArrowRight className="w-4 h-4 ml-1" />
          </button>
        </form>

        <div className="text-center text-xs text-[#64748B] dark:text-[#A3A3A3]">
          Already have an account?{" "}
          <Link href="/login" className="font-semibold text-[#3563FF] hover:underline">
            Sign In here
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function RegisterPage() {
  return (
    <Suspense fallback={<div className="min-h-[85vh] flex items-center justify-center text-xs text-[#64748B] dark:text-[#A3A3A3]">Loading form...</div>}>
      <RegisterForm />
    </Suspense>
  );
}
