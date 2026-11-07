"use client";

import React, { useState, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useAuth } from "@/providers/AuthProvider";
import { Building2, Briefcase, Mail, Lock, User, Phone, AlertCircle, ArrowRight } from "lucide-react";

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
    <div className="min-h-[85vh] bg-[#F8FAFC] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full surface-card p-8 sm:p-10 space-y-6">
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-xl bg-[#14243A] mx-auto flex items-center justify-center text-white shadow-sm">
            <Building2 className="w-6 h-6 text-[#315EFB]" />
          </div>
          <h2 className="text-2xl font-bold text-[#14243A] tracking-tight">Create Your Account</h2>
          <p className="text-xs text-[#64748B]">Join the intelligent franchise development & expansion network</p>
        </div>

        {/* Stakeholder Role Switcher */}
        <div className="grid grid-cols-2 gap-2 bg-[#F8FAFC] p-1.5 rounded-xl border border-[#E7ECF2]">
          <button
            type="button"
            onClick={() => setRole("business_owner")}
            className={`py-2 px-3 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
              role === "business_owner"
                ? "bg-[#14243A] text-white shadow-sm"
                : "text-[#64748B] hover:text-[#14243A]"
            }`}
          >
            <Building2 className="w-3.5 h-3.5" />
            Brand Franchisor
          </button>
          <button
            type="button"
            onClick={() => setRole("investor")}
            className={`py-2 px-3 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
              role === "investor"
                ? "bg-[#14243A] text-white shadow-sm"
                : "text-[#64748B] hover:text-[#14243A]"
            }`}
          >
            <Briefcase className="w-3.5 h-3.5" />
            Franchise Investor
          </button>
        </div>

        {error && (
          <div className="p-3.5 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block text-[#14243A] font-semibold mb-1">Full Legal Name *</label>
            <div className="relative">
              <User className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#64748B]" />
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="e.g. Rahul Sharma"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[#E7ECF2] text-sm text-[#14243A] placeholder-[#64748B] focus:outline-none focus:border-[#315EFB]"
              />
            </div>
          </div>

          <div>
            <label className="block text-[#14243A] font-semibold mb-1">Corporate or Business Email *</label>
            <div className="relative">
              <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#64748B]" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@company.com"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[#E7ECF2] text-sm text-[#14243A] placeholder-[#64748B] focus:outline-none focus:border-[#315EFB]"
              />
            </div>
          </div>

          <div>
            <label className="block text-[#14243A] font-semibold mb-1">Phone Number *</label>
            <div className="relative">
              <Phone className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#64748B]" />
              <input
                type="tel"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+91 98765 43210"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[#E7ECF2] text-sm text-[#14243A] placeholder-[#64748B] focus:outline-none focus:border-[#315EFB]"
              />
            </div>
          </div>

          <div>
            <label className="block text-[#14243A] font-semibold mb-1">Password (min 8 chars) *</label>
            <div className="relative">
              <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#64748B]" />
              <input
                type="password"
                required
                minLength={8}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[#E7ECF2] text-sm text-[#14243A] placeholder-[#64748B] focus:outline-none focus:border-[#315EFB]"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn-primary w-full py-3 text-sm font-semibold justify-center"
          >
            {loading ? "Creating Account..." : "Create Account"}
            <ArrowRight className="w-4 h-4 ml-1" />
          </button>
        </form>

        <div className="text-center text-xs text-[#64748B]">
          Already have an account?{" "}
          <Link href="/login" className="font-semibold text-[#315EFB] hover:underline">
            Sign In here
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function RegisterPage() {
  return (
    <Suspense fallback={<div className="text-center py-20 text-xs text-[#64748B]">Loading form...</div>}>
      <RegisterForm />
    </Suspense>
  );
}
