"use client";

import { motion } from "framer-motion";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";
import { StockMove } from "@/types/stockMove";
import { format } from "date-fns";

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
  const handleRowClick = () => {
    // Navigate to details if needed, for now just toggle selection or do nothing
    // router.push(`/inventory/stocks/stock-moves/${move.id}`);
  };

  const handleCheckboxChange = (checked: boolean) => {
    onToggleSelect(String(move.id));
  };

  return (
    <motion.div
      className={cn(
        "grid grid-cols-[48px_1fr_1.5fr_1fr_1fr_1fr_1fr] items-center px-4 py-4 text-sm text-slate-700 border-b hover:bg-gray-50 focus-within:bg-gray-50 cursor-pointer",
        "",
      )}
      role="row"
      onClick={handleRowClick}
      whileHover={{
        backgroundColor: "rgba(249, 250, 251, 1)",
        transition: { duration: 0.2 },
      }}
      whileTap={{ scale: 0.995 }}
    >
      <div className="flex items-center" onClick={(e) => e.stopPropagation()}>
        <Checkbox
          id={`cb-${move.id}`}
          checked={isSelected}
          onCheckedChange={handleCheckboxChange}
          className="data-[state=checked]:border-blue-600 data-[state=checked]:bg-blue-600 data-[state=checked]:text-white dark:data-[state=checked]:border-blue-700 dark:data-[state=checked]:bg-blue-700 transition-all duration-200"
        />
      </div>

      <div className="truncate font-medium text-slate-800">#{move.id}</div>

      <div className="truncate text-slate-600">{move.product.product_name}</div>

      <div className="text-slate-600">{move.quantity}</div>

      <div className="truncate text-slate-600">
        {move.source_location || "N/A"}
      </div>

      <div className="truncate text-slate-600">
        {move.destination_location || "N/A"}
      </div>

      <div className="truncate text-slate-600">
        {move.date_moved
          ? format(new Date(move.date_moved), "MMM dd, yyyy HH:mm")
          : "N/A"}
      </div>
    </motion.div>
  );
}
