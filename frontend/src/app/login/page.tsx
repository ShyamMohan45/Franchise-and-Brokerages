"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useAuth } from "@/providers/AuthProvider";
import { Building2, Lock, Mail, ArrowRight, AlertCircle } from "lucide-react";

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
    <div className="min-h-[80vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full bg-white rounded-3xl border border-slate-200/90 shadow-xl p-8 sm:p-10 space-y-6">
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-navy-900 mx-auto flex items-center justify-center shadow-md">
            <Building2 className="w-6 h-6 text-amber-400" />
          </div>
          <h2 className="text-2xl font-extrabold text-navy-900 tracking-tight">Access FranchiseBridge</h2>
          <p className="text-xs text-slate-500">Sign in to your business, investor, or brokerage portal</p>
        </div>

        {error && (
          <div className="p-3.5 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block text-slate-700 font-semibold mb-1">Corporate or Personal Email</label>
            <div className="relative">
              <Mail className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@company.com"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          <div>
            <div className="flex justify-between mb-1">
              <label className="block text-slate-700 font-semibold">Password</label>
              <a href="#" className="text-blue-600 hover:underline">
                Forgot password?
              </a>
            </div>
            <div className="relative">
              <Lock className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl shadow-md text-sm transition-all flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loading ? "Authenticating..." : "Sign In"}
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        {/* Demo Fast Login Switcher */}
        <div className="pt-4 border-t border-slate-100 text-center space-y-2">
          <span className="text-[11px] uppercase tracking-wider text-slate-400 font-bold block">
            One-Click Demo Credentials
          </span>
          <div className="flex flex-wrap justify-center gap-1.5 text-[11px]">
            <button
              onClick={() => handleQuickDemo("broker.admin@franchisebridge.com")}
              className="px-2.5 py-1 rounded bg-slate-100 text-slate-700 hover:bg-blue-50 hover:text-blue-700 font-medium"
            >
              Broker Admin
            </button>
            <button
              onClick={() => handleQuickDemo("owner.roastcraft@example.com")}
              className="px-2.5 py-1 rounded bg-slate-100 text-slate-700 hover:bg-blue-50 hover:text-blue-700 font-medium"
            >
              Business Owner
            </button>
            <button
              onClick={() => handleQuickDemo("investor.arun@example.com")}
              className="px-2.5 py-1 rounded bg-slate-100 text-slate-700 hover:bg-blue-50 hover:text-blue-700 font-medium"
            >
              Investor
            </button>
          </div>
        </div>

        <div className="text-center text-xs text-slate-500">
          Don't have an account yet?{" "}
          <Link href="/register" className="font-semibold text-blue-600 hover:underline">
            Register here
          </Link>
        </div>
      </div>
    </div>
  );
}
