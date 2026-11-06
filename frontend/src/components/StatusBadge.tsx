import React from "react";
import { cn } from "@/lib/utils";

interface StatusBadgeProps {
  status: string;
  className?: string;
  showDot?: boolean;
}

export function StatusBadge({ status, className, showDot = true }: StatusBadgeProps) {
  const normalized = status ? status.toLowerCase().replace(/_/g, " ") : "unknown";

  let badgeClasses = "bg-slate-100 text-slate-700 border-slate-200";
  let dotClasses = "bg-slate-400";

  switch (status) {
    case "published":
    case "approved":
    case "deal_closed":
    case "certified_ready":
    case "active":
    case "paid":
      badgeClasses = "bg-emerald-50 text-emerald-800 border-emerald-200/80 shadow-[0_1px_2px_rgba(16,185,129,0.06)]";
      dotClasses = "bg-emerald-500 animate-pulse";
      break;

    case "pending_approval":
    case "under_review":
    case "legal_review":
    case "submitted":
    case "in_discussion":
    case "documentation_review":
    case "negotiation":
      badgeClasses = "bg-amber-50 text-amber-800 border-amber-200/80 shadow-[0_1px_2px_rgba(245,158,11,0.06)]";
      dotClasses = "bg-amber-500";
      break;

    case "draft":
    case "self_assessment":
      badgeClasses = "bg-blue-50 text-blue-800 border-blue-200/80";
      dotClasses = "bg-blue-500";
      break;

    case "rejected":
    case "lost_cancelled":
    case "suspended":
    case "withdrawn":
      badgeClasses = "bg-rose-50 text-rose-800 border-rose-200/80";
      dotClasses = "bg-rose-500";
      break;

    case "vetted_by_broker":
    case "introduced_to_owner":
      badgeClasses = "bg-indigo-50 text-indigo-800 border-indigo-200/80 shadow-[0_1px_2px_rgba(99,102,241,0.06)]";
      dotClasses = "bg-indigo-500";
      break;
  }

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold tracking-tight border capitalize",
        badgeClasses,
        className
      )}
    >
      {showDot && <span className={cn("w-1.5 h-1.5 rounded-full shrink-0", dotClasses)} />}
      <span>{normalized}</span>
    </span>
  );
}
