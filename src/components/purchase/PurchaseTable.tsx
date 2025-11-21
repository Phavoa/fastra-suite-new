"use client";

import React, { useMemo, useState } from "react";
import { StatusPill } from "./StatusPill";
import { Status, RequestRow } from "./types";

export function PurchaseTable({
  rows,
  query,
  onQueryChange,
}: {
  rows: RequestRow[];
  query: string;
  onQueryChange: (query: string) => void;
}) {
  const [selected, setSelected] = useState<Record<string, boolean>>({});

  const filtered = useMemo(() => {
    if (!query.trim()) return rows;
    return rows.filter(
      (r) =>
        r.id.toLowerCase().includes(query.toLowerCase()) ||
        r.product.toLowerCase().includes(query.toLowerCase())
    );
  }, [rows, query]);

  const toggleRow = (id: string) =>
    setSelected((s) => ({ ...s, [id]: !s[id] }));

  const handleSelectAll = (checked: boolean) => {
    const next: Record<string, boolean> = {};
    if (checked) filtered.forEach((r) => (next[r.id] = true));
    setSelected(next);
  };

  return (
    <section className="max-w-[1440px] mx-auto px-6 mt-8">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <h2 className="text-lg font-semibold">Purchase Requests</h2>

        <div className="relative w-full md:w-[400px]">
          <input
            type="text"
            className="w-full pl-10 pr-4 py-2 h-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Search"
            value={query}
            onChange={(e) => onQueryChange(e.target.value)}
            aria-label="Search purchase requests"
          />
          <svg
            className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            aria-hidden
          >
            <circle
              cx="11"
              cy="11"
              r="8"
              stroke="currentColor"
              strokeWidth="2"
            />
            <path d="21 21l-4.35-4.35" stroke="currentColor" strokeWidth="2" />
          </svg>
        </div>
      </div>

      <div className="mt-6 bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="hidden md:grid grid-cols-12 gap-4 items-center px-6 py-3 bg-gray-50 text-sm text-gray-600 font-medium">
          <div className="col-span-1">
            <input
              aria-label="select all"
              type="checkbox"
              className="h-4 w-4 rounded-sm border-gray-300"
              onChange={(e) => handleSelectAll(e.target.checked)}
            />
          </div>
          <div className="col-span-2">Request ID</div>
          <div className="col-span-4">Product Name</div>
          <div className="col-span-1 text-center">Quantity</div>
          <div className="col-span-2">Amount</div>
          <div className="col-span-1">Requester</div>
          <div className="col-span-1">Status</div>
        </div>

        <ul role="list" className="divide-y divide-gray-100">
          {filtered.map((row) => (
            <li
              key={row.id}
              className="group hover:bg-gray-50 transition-colors duration-150"
              aria-labelledby={`row-${row.id}`}
            >
              <div className="grid grid-cols-12 gap-4 items-center px-4 md:px-6 py-4 md:py-6">
                <div className="col-span-1">
                  <input
                    aria-label={`Select ${row.id}`}
                    type="checkbox"
                    checked={!!selected[row.id]}
                    onChange={() => toggleRow(row.id)}
                    className="h-4 w-4 rounded-sm border-gray-300"
                  />
                </div>

                <div
                  className="col-span-2 text-sm text-gray-700 font-medium"
                  id={`row-${row.id}`}
                >
                  {row.id}
                </div>

                <div className="col-span-4 text-sm text-gray-600">
                  {row.product}
                </div>

                <div className="col-span-1 text-center text-sm text-gray-700">
                  {row.quantity}
                </div>

                <div className="col-span-2 text-sm text-gray-700">
                  {row.amount}
                </div>

                <div className="col-span-1 text-sm text-gray-700">
                  {row.requester}
                </div>

                <div className="col-span-1">
                  <StatusPill status={row.status} />
                </div>
              </div>
            </li>
          ))}
        </ul>

        <div className="px-6 py-4 flex items-center justify-between text-sm text-gray-500">
          <div>{filtered.length} results</div>
          <nav aria-label="Pagination">
            <ul className="inline-flex items-center gap-2">
              <li>
                <button className="px-3 py-1 rounded-md border border-gray-200">
                  Prev
                </button>
              </li>
              <li>
                <button className="px-3 py-1 rounded-md border border-gray-200">
                  Next
                </button>
              </li>
            </ul>
          </nav>
        </div>
      </div>
    </section>
  );
}
