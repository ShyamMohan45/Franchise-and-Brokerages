import React from "react";
import { cn } from "@/lib/utils";

interface StatusBadgeProps {
  status: string;
  className?: string;
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const normalized = status.toLowerCase().replace(/_/g, " ");

  let colorClasses = "bg-slate-100 text-slate-700 border-slate-200";

  switch (status) {
    case "published":
    case "approved":
    case "deal_closed":
    case "certified_ready":
    case "active":
    case "paid":
      colorClasses = "bg-emerald-50 text-emerald-700 border-emerald-200";
      break;

    case "pending_approval":
    case "under_review":
    case "legal_review":
    case "submitted":
    case "in_discussion":
    case "documentation_review":
    case "negotiation":
      colorClasses = "bg-amber-50 text-amber-700 border-amber-200";
      break;

    case "draft":
    case "self_assessment":
      colorClasses = "bg-blue-50 text-blue-700 border-blue-200";
      break;

    case "rejected":
    case "lost_cancelled":
    case "suspended":
    case "withdrawn":
      colorClasses = "bg-rose-50 text-rose-700 border-rose-200";
      break;

    case "vetted_by_broker":
    case "introduced_to_owner":
      colorClasses = "bg-purple-50 text-purple-700 border-purple-200";
      break;
  }

  return (
    <span
      className={cn(
        "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border capitalize",
        colorClasses,
        className
      )}
    >
      {normalized}
    </span>
  );
}
