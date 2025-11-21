"use client";

import React, { useMemo, useState } from "react";
import { TopNav } from "@/components/purchase/TopNav";
import { StatusCards } from "@/components/purchase/StatusCards";
import { PurchaseTable } from "@/components/purchase/PurchaseTable";
import { Status, RequestRow } from "@/components/purchase/types";

const MOCK_ROWS: RequestRow[] = Array.from({ length: 5 }).map((_, i) => ({
  id: `PR0000${i + 1}`,
  product: "Laptop, Keyboard & Mouse",
  quantity: 4,
  amount: "2,600,000",
  requester: "Firstname Lastname",
  status: (
    ["approved", "pending", "rejected", "draft", "approved"] as Status[]
  )[i],
}));

export default function PurchaseRequestsPage() {
  const [rows] = useState<RequestRow[]>(MOCK_ROWS);
  const [query, setQuery] = useState("");

  return (
    <main className="min-h-screen bg-[#ffffff] text-gray-800">
      <StatusCards rows={rows} />

      <PurchaseTable rows={rows} query={query} onQueryChange={setQuery} />

      <footer className="max-w-[1440px] mx-auto px-6 py-8 text-xs text-gray-400">
        &copy; Enterprise Purchase Management UI
      </footer>
    </main>
  );
}
