"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useAuth } from "@/providers/AuthProvider";
import { Building2, Lock, Mail, ArrowRight, AlertCircle, ShieldCheck } from "lucide-react";

export default function LoginPage() {
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      await login(email, password);
    } catch (err: any) {
      setError(err.message || "Failed to log in. Please check your credentials.");
    } finally {
      setLoading(false);
    }
  };

  const handleQuickDemo = (demoEmail: string) => {
    setEmail(demoEmail);
    setPassword("Password123!");
  };

  return (
    <div className="min-h-[85vh] bg-[#F8FAFC] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full surface-card p-8 sm:p-10 space-y-6">
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-xl bg-[#14243A] mx-auto flex items-center justify-center text-white shadow-sm">
            <Building2 className="w-6 h-6 text-[#315EFB]" />
          </div>
          <h2 className="text-2xl font-bold text-[#14243A] tracking-tight">Access FranchiseBridge</h2>
          <p className="text-xs text-[#64748B]">Sign in to your franchisor, investor, or brokerage workspace</p>
        </div>

        {error && (
          <div className="p-3.5 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block text-[#14243A] font-semibold mb-1">Corporate or Personal Email</label>
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
            <div className="flex justify-between mb-1">
              <label className="block text-[#14243A] font-semibold">Password</label>
              <a href="#" className="text-[#315EFB] hover:underline">
                Forgot password?
              </a>
            </div>
            <div className="relative">
              <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#64748B]" />
              <input
                type="password"
                required
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
            {loading ? "Authenticating..." : "Sign In to Workspace"}
            <ArrowRight className="w-4 h-4 ml-1" />
          </button>
        </form>

        {/* Demo Fast Login Switcher */}
        <div className="pt-4 border-t border-[#E7ECF2] text-center space-y-2">
          <span className="text-[11px] uppercase tracking-wider text-[#64748B] font-bold block">
            Instant Demo Account Access
          </span>
          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => handleQuickDemo("business@franchisebridge.com")}
              className="py-1.5 px-2 text-[11px] font-semibold bg-[#F8FAFC] border border-[#E7ECF2] text-[#14243A] hover:border-[#315EFB] rounded-lg transition-colors"
            >
              Franchisor
            </button>
            <button
              type="button"
              onClick={() => handleQuickDemo("investor@franchisebridge.com")}
              className="py-1.5 px-2 text-[11px] font-semibold bg-[#F8FAFC] border border-[#E7ECF2] text-[#14243A] hover:border-[#315EFB] rounded-lg transition-colors"
            >
              Investor
            </button>
            <button
              type="button"
              onClick={() => handleQuickDemo("admin@franchisebridge.com")}
              className="py-1.5 px-2 text-[11px] font-semibold bg-[#F8FAFC] border border-[#E7ECF2] text-[#14243A] hover:border-[#315EFB] rounded-lg transition-colors"
            >
              Admin
            </button>
          </div>
        </div>

        <div className="text-center text-xs text-[#64748B]">
          New to FranchiseBridge?{" "}
          <Link href="/register" className="font-semibold text-[#315EFB] hover:underline">
            Create an account
          </Link>
        </div>
      </div>
    </div>
  );
}
