"use client";

import React from "react";
import { Status } from "../types";

const STATUS_MAP: Record<Status, { bg: string; text: string }> = {
  approved: { bg: "bg-[#D4F4DD]", text: "text-[#0D894F]" },
  pending: { bg: "bg-[#FEF3C7]", text: "text-[#D97706]" },
  rejected: { bg: "bg-[#FEE2E2]", text: "text-[#DC2626]" },
  draft: { bg: "bg-[#DBEAFE]", text: "text-[#2563EB]" },
};

export function StatusPill({ status }: { status: Status }) {
  const styles = STATUS_MAP[status];
  const label = status[0].toUpperCase() + status.slice(1);

  return (
    <span
      role="status"
      aria-label={`Status ${label}`}
      className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ${styles.bg} ${styles.text}`}
    >
      {label}
    </span>
  );
}
