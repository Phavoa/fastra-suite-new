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
        m.product.product_name.toLowerCase().includes(lowerQuery) ||
        (m.source_location &&
          m.source_location.toLowerCase().includes(lowerQuery)) ||
        (m.destination_location &&
          m.destination_location.toLowerCase().includes(lowerQuery)) ||
        (m.source_document_id &&
          m.source_document_id.toLowerCase().includes(lowerQuery)),
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
    <section className="mx-auto mt-6 mr-4">
      <motion.div
        className="px-6 bg-white h-full"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
      >
        <div className="mt-2 pt-4 bg-white rounded-lg overflow-hidden">
          <motion.div
            className="hidden md:grid grid-cols-[48px_1fr_1.5fr_1fr_1fr_1fr_1fr] items-center bg-gray-100 rounded-md px-4 py-3 text-sm font-medium text-gray-500 border-b border-gray-100"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
          >
            <div
              className="flex items-center"
              onClick={(e) => e.stopPropagation()}
            >
              <Checkbox
                id="select-all"
                aria-label="Select all stock moves"
                checked={allSelected}
                onCheckedChange={() => toggleAll()}
                className="data-[state=checked]:border-blue-600 data-[state=checked]:bg-blue-600 data-[state=checked]:text-white dark:data-[state=checked]:border-blue-700 dark:data-[state=checked]:bg-blue-700 transition-all duration-200"
              />
            </div>
            <div>Move ID</div>
            <div>Product</div>
            <div>Quantity</div>
            <div>Source</div>
            <div>Destination</div>
            <div>Date Moved</div>
          </motion.div>

          <div className="">
            {filtered.map((move, index) => (
              <motion.div
                key={move.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  duration: 0.4,
                  ease: "easeOut",
                  delay: index * 0.05,
                }}
              >
                <StockMoveRow
                  move={move}
                  isSelected={!!selected[String(move.id)]}
                  onToggleSelect={toggleOne}
                />
              </motion.div>
            ))}
          </div>
        </div>

        {filtered.length === 0 && (
          <motion.div
            className="p-8 text-center text-gray-400"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4, ease: "easeOut", delay: 0.3 }}
          >
            No stock moves found
          </motion.div>
        )}

        <div className="px-6 py-4 flex items-center justify-between text-sm text-gray-500">
          <div>{filtered.length} results</div>
          <nav aria-label="Pagination">
            <ul className="inline-flex items-center gap-2">
              <li>
                <button className="px-3 py-1 rounded-md border border-gray-200 hover:bg-gray-50 transition-colors">
                  Prev
                </button>
              </li>
              <li>
                <button className="px-3 py-1 rounded-md border border-gray-200 hover:bg-gray-50 transition-colors">
                  Next
                </button>
              </li>
            </ul>
          </nav>
        </div>
      </motion.div>
    </section>
  );
}
