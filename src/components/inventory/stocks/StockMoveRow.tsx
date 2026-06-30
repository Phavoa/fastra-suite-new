"use client";

import React from "react";
import { motion } from "framer-motion";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";
import { StockMove } from "@/types/stockMove";

interface StockMoveRowProps {
  move: StockMove;
  isSelected: boolean;
  onToggleSelect: (id: string) => void;
}

export function StockMoveRow({
  move,
  isSelected,
  onToggleSelect,
}: StockMoveRowProps) {
  const handleCheckboxChange = (checked: boolean) => {
    onToggleSelect(String(move.id));
  };

  const isPositive = move.quantity >= 0;

  return (
    <motion.div
      className={cn(
        "grid grid-cols-[48px_1.2fr_1fr_1.2fr_1.5fr_0.8fr_1fr_1fr_1.5fr] items-center px-4 py-3.5 text-xs text-slate-700 border-b border-gray-100 hover:bg-gray-50 transition-colors",
      )}
      role="row"
    >
      <div className="flex items-center" onClick={(e) => e.stopPropagation()}>
        <Checkbox
          id={`cb-${move.id}`}
          checked={isSelected}
          onCheckedChange={handleCheckboxChange}
          className="data-[state=checked]:border-blue-600 data-[state=checked]:bg-blue-600 data-[state=checked]:text-white transition-all duration-200"
        />
      </div>

      <div className="text-slate-600 truncate">{move.date_moved || "N/A"}</div>

      <div>
        <span className="inline-block px-2 py-0.5 rounded bg-gray-100 text-gray-700 font-medium text-[11px]">
          {move.transaction_type || "Move"}
        </span>
      </div>

      <div className="font-mono text-slate-600 truncate">{move.reference_document || move.source_document_id || "N/A"}</div>

      <div className="font-medium text-slate-800 truncate">{move.product?.product_name || "Unknown Product"}</div>

      <div className={`font-semibold text-center ${isPositive ? "text-green-600" : "text-red-600"}`}>
        {isPositive ? `+${move.quantity}` : move.quantity}
      </div>

      <div className="text-right pr-4 text-slate-600">
        {move.unit_cost !== undefined ? `₦${move.unit_cost.toLocaleString()}` : "—"}
      </div>

      <div className="text-right pr-4 font-medium text-slate-800">
        {move.total_value !== undefined ? `₦${move.total_value.toLocaleString()}` : "—"}
      </div>

      <div className="text-slate-600 truncate pl-2">
        {move.wbs_phase && move.wbs_activity ? `${move.wbs_phase} / ${move.wbs_activity}` : "General Stock"}
      </div>
    </motion.div>
  );
}
