import React from "react";
import { cn } from "@/lib/utils";

interface StatusBadgeProps {
  status: string;
  className?: string;
  showDot?: boolean;
}

export function StatusBadge({ status, className, showDot = true }: StatusBadgeProps) {
  const normalized = status ? status.toLowerCase().replace(/_/g, " ") : "unknown";

  let badgeClasses = "bg-slate-100 dark:bg-[#171717] text-slate-700 dark:text-[#D4D4D4] border-slate-200 dark:border-[#262626]";
  let dotClasses = "bg-slate-400 dark:bg-[#A3A3A3]";

  switch (status) {
    case "published":
    case "approved":
    case "deal_closed":
    case "certified_ready":
    case "active":
    case "paid":
    case "converted":
    case "closed":
      badgeClasses = "bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border-emerald-200/80 dark:border-emerald-800/60 shadow-[0_1px_2px_rgba(16,185,129,0.06)]";
      dotClasses = "bg-emerald-500 animate-pulse";
      break;

    case "pending_approval":
    case "under_review":
    case "legal_review":
    case "submitted":
    case "in_discussion":
    case "documentation_review":
    case "negotiation":
    case "in_progress":
    case "contacted":
      badgeClasses = "bg-amber-50 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border-amber-200/80 dark:border-amber-800/60 shadow-[0_1px_2px_rgba(245,158,11,0.06)]";
      dotClasses = "bg-amber-500";
      break;

    case "draft":
    case "self_assessment":
    case "new":
      badgeClasses = "bg-blue-50 dark:bg-blue-950/60 text-blue-800 dark:text-blue-300 border-blue-200/80 dark:border-blue-800/60";
      dotClasses = "bg-blue-500";
      break;

    case "rejected":
    case "lost_cancelled":
    case "suspended":
    case "withdrawn":
      badgeClasses = "bg-rose-50 dark:bg-rose-950/60 text-rose-800 dark:text-rose-300 border-rose-200/80 dark:border-rose-800/60";
      dotClasses = "bg-rose-500";
      break;

    case "vetted_by_broker":
    case "introduced_to_owner":
    case "assigned":
    case "qualified":
      badgeClasses = "bg-indigo-50 dark:bg-indigo-950/60 text-indigo-800 dark:text-indigo-300 border-indigo-200/80 dark:border-indigo-800/60 shadow-[0_1px_2px_rgba(99,102,241,0.06)]";
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
