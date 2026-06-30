"use client";

import React, { useMemo, useState } from "react";
import { Checkbox } from "../../ui/checkbox";
import { motion } from "framer-motion";
import { StockMove } from "@/types/stockMove";
import { StockMoveRow } from "./StockMoveRow";

export function StockMoveTable({
  moves,
  query,
}: {
  moves: StockMove[];
  query: string;
}) {
  const [selected, setSelected] = useState<Record<string, boolean>>({});

  const filtered = useMemo(() => {
    if (!query.trim()) return moves;
    const lowerQuery = query.toLowerCase();
    return moves.filter(
      (m) =>
        String(m.id).toLowerCase().includes(lowerQuery) ||
        (m.product && m.product.product_name.toLowerCase().includes(lowerQuery)) ||
        (m.transaction_type && m.transaction_type.toLowerCase().includes(lowerQuery)) ||
        (m.reference_document && m.reference_document.toLowerCase().includes(lowerQuery)) ||
        (m.wbs_phase && m.wbs_phase.toLowerCase().includes(lowerQuery)) ||
        (m.wbs_activity && m.wbs_activity.toLowerCase().includes(lowerQuery))
    );
  }, [moves, query]);

  const allSelected =
    filtered.length > 0 && filtered.every((m) => selected[String(m.id)]);

  function toggleAll() {
    if (allSelected) {
      setSelected({});
      return;
    }
    const map: Record<string, boolean> = {};
    filtered.forEach((m) => (map[String(m.id)] = true));
    setSelected(map);
  }

  function toggleOne(id: string) {
    setSelected((s) => ({ ...s, [id]: !s[id] }));
  }

  return (
    <section className="w-full">
      <div className="bg-white overflow-x-auto">
        <div className="min-w-[1300px]">
          <div className="grid grid-cols-[40px_1.1fr_1.1fr_0.8fr_1fr_1.3fr_0.6fr_0.7fr_0.9fr_1fr_1.5fr] items-center bg-[#F8F9FA] rounded-t-md px-4 py-3 text-xs font-semibold text-gray-500 border-b border-gray-200">
            <div className="flex items-center" onClick={(e) => e.stopPropagation()}>
              <Checkbox
                id="select-all"
                aria-label="Select all stock moves"
                checked={allSelected}
                onCheckedChange={() => toggleAll()}
                className="data-[state=checked]:border-blue-600 data-[state=checked]:bg-blue-600 data-[state=checked]:text-white transition-all duration-200"
              />
            </div>
            <div>Date / Time</div>
            <div>User</div>
            <div>Type</div>
            <div>Ref Doc</div>
            <div>Item Name</div>
            <div className="text-center">QTY</div>
            <div className="text-center">Run. Bal</div>
            <div className="text-right pr-2">Unit Cost</div>
            <div className="text-right pr-2">Total Value</div>
            <div className="pl-2">WBS / Cost Code</div>
          </div>

          <div className="divide-y divide-gray-100">
            {filtered.map((move) => (
              <StockMoveRow
                key={move.id}
                move={move}
                isSelected={!!selected[String(move.id)]}
                onToggleSelect={toggleOne}
              />
            ))}
          </div>
        </div>

        {filtered.length === 0 && (
          <div className="p-8 text-center text-gray-400 text-sm">
            No inventory ledger records found matching your query.
          </div>
        )}

        <div className="px-4 py-3 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500 bg-[#F8F9FA]">
          <div>Showing {filtered.length} entries</div>
          <div className="flex gap-2">
            <button disabled className="px-2.5 py-1 rounded border border-gray-200 bg-white text-gray-400 cursor-not-allowed">
              Prev
            </button>
            <button disabled className="px-2.5 py-1 rounded border border-gray-200 bg-white text-gray-400 cursor-not-allowed">
              Next
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
