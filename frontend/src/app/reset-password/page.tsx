"use client";

import React, { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Building2,
  Lock,
  Eye,
  EyeOff,
  AlertCircle,
  CheckCircle2,
  ArrowRight,
  ShieldCheck,
  Check,
  X,
} from "lucide-react";
import { api } from "@/lib/api";

function ResetPasswordContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);
  const [isExpiredOrInvalid, setIsExpiredOrInvalid] = useState(false);
  const [countdown, setCountdown] = useState(3);

  useEffect(() => {
    if (!token) {
      setIsExpiredOrInvalid(true);
      setError("No password reset token was provided in the link. Please request a new link.");
    }
  }, [token]);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isSuccess && countdown > 0) {
      timer = setTimeout(() => {
        setCountdown((prev) => prev - 1);
      }, 1000);
    } else if (isSuccess && countdown === 0) {
      router.push("/login");
    }
    return () => clearTimeout(timer);
  }, [isSuccess, countdown, router]);

  // Validation rules
  const hasMinLength = password.length >= 16;
  const passwordsMatch = password.length > 0 && password === confirmPassword;
  const isFormValid = hasMinLength && passwordsMatch;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!token) {
      setIsExpiredOrInvalid(true);
      setError("Missing reset token. Please request a new password reset link.");
      return;
    }

    if (!hasMinLength) {
      setError("Password must be at least 16 characters long.");
      return;
    }

    if (!passwordsMatch) {
      setError("Passwords do not match. Please verify both fields.");
      return;
    }

    setLoading(true);

    try {
      await api.post("/auth/reset-password", {
        token,
        newPassword: password,
      });
      setIsSuccess(true);
    } catch (err: any) {
      const message =
        err.message || "Failed to reset password. The link may have expired or is invalid.";
      setError(message);
      if (
        message.toLowerCase().includes("invalid") ||
        message.toLowerCase().includes("expired")
      ) {
        setIsExpiredOrInvalid(true);
      }
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
            Reset Password
          </h2>
          <p className="text-xs text-[#64748B] dark:text-[#A3A3A3]">
            Create a secure new password for your FranchiseBridge account
          </p>
        </div>

        {error && (
          <div className="p-3.5 bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800/60 text-rose-700 dark:text-rose-300 rounded-xl text-xs flex items-start gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <span>{error}</span>
              {isExpiredOrInvalid && (
                <div className="pt-2">
                  <Link
                    href="/forgot-password"
                    className="inline-flex items-center text-[#3563FF] hover:underline font-semibold"
                  >
                    Request a new password reset link &rarr;
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}

        {isSuccess ? (
          <div className="space-y-5">
            <div className="p-4 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800/60 text-emerald-800 dark:text-emerald-200 rounded-xl text-xs space-y-2">
              <div className="flex items-center gap-2 font-semibold text-emerald-900 dark:text-emerald-100">
                <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
                <span>Password Successfully Updated</span>
              </div>
              <p className="leading-relaxed">
                Your password has been changed securely. You can now use your new password to sign in.
              </p>
              <p className="text-[11px] text-emerald-700 dark:text-emerald-300 font-medium">
                Redirecting to login in {countdown} second{countdown !== 1 ? "s" : ""}...
              </p>
            </div>

            <Link
              href="/login"
              className="btn-primary w-full py-3 text-sm font-semibold justify-center inline-flex items-center gap-2"
            >
              Sign In Now
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        ) : isExpiredOrInvalid && !token ? (
          <div className="pt-4 text-center space-y-4">
            <p className="text-xs text-[#64748B] dark:text-[#A3A3A3]">
              The password reset link is invalid or incomplete.
            </p>
            <Link
              href="/forgot-password"
              className="btn-primary w-full py-2.5 text-xs font-semibold justify-center inline-flex items-center gap-1.5"
            >
              Request New Reset Link
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            <div>
              <label className="block text-[#14243A] dark:text-[#FFFFFF] font-semibold mb-1">
                New Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#64748B] dark:text-[#A3A3A3]" />
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="At least 16 characters"
                  disabled={loading}
                  className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-[#E7ECF2] dark:border-[#262626] bg-white dark:bg-[#111111] text-sm text-[#14243A] dark:text-[#FFFFFF] placeholder-[#64748B] dark:placeholder-[#A3A3A3] focus:outline-none focus:border-[#3563FF] disabled:opacity-60"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#64748B] dark:text-[#A3A3A3] hover:text-[#14243A] dark:hover:text-[#FFFFFF]"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-[#14243A] dark:text-[#FFFFFF] font-semibold mb-1">
                Confirm New Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#64748B] dark:text-[#A3A3A3]" />
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Re-enter your new password"
                  disabled={loading}
                  className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-[#E7ECF2] dark:border-[#262626] bg-white dark:bg-[#111111] text-sm text-[#14243A] dark:text-[#FFFFFF] placeholder-[#64748B] dark:placeholder-[#A3A3A3] focus:outline-none focus:border-[#3563FF] disabled:opacity-60"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#64748B] dark:text-[#A3A3A3] hover:text-[#14243A] dark:hover:text-[#FFFFFF]"
                  aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                >
                  {showConfirmPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            {/* Security checklist */}
            <div className="p-3 bg-[#F8FAFC] dark:bg-[#111111] rounded-xl border border-[#E7ECF2] dark:border-[#262626] space-y-1.5">
              <span className="text-[11px] font-semibold text-[#14243A] dark:text-[#FFFFFF] flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-[#3563FF]" />
                Password Security Checklist:
              </span>
              <ul className="space-y-1 text-[11px]">
                <li
                  className={`flex items-center gap-1.5 ${
                    hasMinLength
                      ? "text-emerald-600 dark:text-emerald-400 font-medium"
                      : "text-[#64748B] dark:text-[#A3A3A3]"
                  }`}
                >
                  {hasMinLength ? (
                    <Check className="w-3.5 h-3.5" />
                  ) : (
                    <X className="w-3.5 h-3.5 opacity-50" />
                  )}
                  At least 16 characters long ({password.length}/16)
                </li>
                <li
                  className={`flex items-center gap-1.5 ${
                    passwordsMatch
                      ? "text-emerald-600 dark:text-emerald-400 font-medium"
                      : "text-[#64748B] dark:text-[#A3A3A3]"
                  }`}
                >
                  {passwordsMatch ? (
                    <Check className="w-3.5 h-3.5" />
                  ) : (
                    <X className="w-3.5 h-3.5 opacity-50" />
                  )}
                  Passwords match
                </li>
              </ul>
            </div>

            <button
              type="submit"
              disabled={loading || !isFormValid}
              className="btn-primary w-full py-3 text-sm font-semibold justify-center inline-flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Updating Password..." : "Reset Password"}
              <ArrowRight className="w-4 h-4 ml-1.5" />
            </button>

            <div className="pt-2 text-center">
              <Link
                href="/login"
                className="text-xs font-semibold text-[#64748B] dark:text-[#A3A3A3] hover:text-[#3563FF] transition-colors"
              >
                Cancel and return to Sign In
              </Link>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-[85vh] bg-[#F8FAFC] dark:bg-[#000000] flex items-center justify-center py-12 px-4">
          <div className="surface-card p-8 text-center text-xs text-[#64748B] dark:text-[#A3A3A3]">
            Loading password recovery session...
          </div>
        </div>
      }
    >
      <ResetPasswordContent />
    </Suspense>
  );
}
