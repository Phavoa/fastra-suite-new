"use client";

import React, { useMemo } from "react";
import { Card } from "@/components/ui/card";
import { Status, RequestRow } from "./types";

export function StatusCards({ rows }: { rows: RequestRow[] }) {
  const counts = useMemo(() => {
    return {
      draft: rows.filter((r) => r.status === "draft").length,
      approved: rows.filter((r) => r.status === "approved").length,
      pending: rows.filter((r) => r.status === "pending").length,
      rejected: rows.filter((r) => r.status === "rejected").length,
    };
  }, [rows]);

  const card = (
    label: string,
    value: number,
    icon: React.ReactNode,
    colorClass = "text-gray-700"
  ) => (
    <Card className="p-6 rounded-md border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-150">
      <div className="flex flex-col">
        <div className="flex items-center gap-2 mb-4">
          <div className="text-lg">{icon}</div>
          <div className="text-sm font-medium text-gray-500">{label}</div>
        </div>
        <div className={`text-[2rem] font-bold ${colorClass}`}>{value}</div>
      </div>
    </Card>
  );

  return (
    <section className="max-w-[1440px] mx-auto px-6 mt-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {card(
          "Draft",
          counts.draft,
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            aria-hidden
          >
            <path
              d="M4 7h16"
              stroke="#3B82F6"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>,
          "text-[#3B82F6]"
        )}
        {card(
          "Approved",
          counts.approved,
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            aria-hidden
          >
            <path
              d="M20 6L9 17l-5-5"
              stroke="#10B981"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>,
          "text-[#0D894F]"
        )}
        {card(
          "Pending",
          counts.pending,
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            aria-hidden
          >
            <path
              d="M12 6v6l4 2"
              stroke="#F59E0B"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>,
          "text-[#D97706]"
        )}
        {card(
          "Rejected",
          counts.rejected,
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            aria-hidden
          >
            <path
              d="M18 6L6 18M6 6l12 12"
              stroke="#EF4444"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>,
          "text-[#DC2626]"
        )}
      </div>
    </section>
  );
}
