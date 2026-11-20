"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Building2, Mail, Lock, AlertCircle, ArrowRight } from "lucide-react";
import { useAuth } from "@/providers/AuthProvider";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      await login(email, password);
    } catch (err: any) {
      setError(err.message || "Invalid authentication credentials. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleQuickDemo = (demoEmail: string) => {
    setEmail(demoEmail);
    setPassword("Password123!");
  };

  return (
    <div className="min-h-[85vh] bg-[#F8FAFC] dark:bg-[#000000] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 transition-colors duration-200">
      <div className="max-w-md w-full surface-card p-8 sm:p-10 space-y-6">
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-xl bg-[#14243A] dark:bg-[#101010] mx-auto flex items-center justify-center text-white shadow-sm border border-transparent dark:border-[#262626]">
            <Building2 className="w-6 h-6 text-[#3563FF]" />
          </div>
          <h2 className="text-2xl font-bold text-[#14243A] dark:text-[#FFFFFF] tracking-tight">Access FranchiseBridge</h2>
          <p className="text-xs text-[#64748B] dark:text-[#A3A3A3]">Sign in to your franchisor, investor, or brokerage workspace</p>
        </div>

        {error && (
          <div className="p-3.5 bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800/60 text-rose-700 dark:text-rose-300 rounded-xl text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block text-[#14243A] dark:text-[#FFFFFF] font-semibold mb-1">Corporate or Personal Email</label>
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
            <div className="flex justify-between mb-1">
              <label className="block text-[#14243A] dark:text-[#FFFFFF] font-semibold">Password</label>
              <a href="#" className="text-[#3563FF] hover:underline">
                Forgot password?
              </a>
            </div>
            <div className="relative">
              <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#64748B] dark:text-[#A3A3A3]" />
              <input
                type="password"
                required
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
            {loading ? "Authenticating..." : "Sign In to Workspace"}
            <ArrowRight className="w-4 h-4 ml-1" />
          </button>
        </form>

        {/* Demo Fast Login Switcher */}
        <div className="pt-4 border-t border-[#E7ECF2] dark:border-[#222222] text-center space-y-2">
          <span className="text-[11px] uppercase tracking-wider text-[#64748B] dark:text-[#A3A3A3] font-bold block">
            Instant Demo Account Access
          </span>
          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => handleQuickDemo("business@franchisebridge.com")}
              className="py-1.5 px-2 text-[11px] font-semibold bg-[#F8FAFC] dark:bg-[#171717] border border-[#E7ECF2] dark:border-[#262626] text-[#14243A] dark:text-[#FFFFFF] hover:border-[#3563FF] rounded-lg transition-colors"
            >
              Franchisor
            </button>
            <button
              type="button"
              onClick={() => handleQuickDemo("investor@franchisebridge.com")}
              className="py-1.5 px-2 text-[11px] font-semibold bg-[#F8FAFC] dark:bg-[#171717] border border-[#E7ECF2] dark:border-[#262626] text-[#14243A] dark:text-[#FFFFFF] hover:border-[#3563FF] rounded-lg transition-colors"
            >
              Investor
            </button>
            <button
              type="button"
              onClick={() => handleQuickDemo("admin@franchisebridge.com")}
              className="py-1.5 px-2 text-[11px] font-semibold bg-[#F8FAFC] dark:bg-[#171717] border border-[#E7ECF2] dark:border-[#262626] text-[#14243A] dark:text-[#FFFFFF] hover:border-[#3563FF] rounded-lg transition-colors"
            >
              Admin
            </button>
          </div>
        </div>

        <div className="text-center text-xs text-[#64748B] dark:text-[#A3A3A3]">
          New to FranchiseBridge?{" "}
          <Link href="/register" className="font-semibold text-[#3563FF] hover:underline">
            Create an account
          </Link>
        </div>
      </div>
    </div>
  );
}
