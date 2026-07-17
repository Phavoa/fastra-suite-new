"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { TableCell, TableRow } from "@/components/ui/table";
import { StockMove } from "@/types/stockMove";
import Link from "next/link";

interface StockMoveRowProps {
  move: StockMove;
}

export function StockMoveRow({ move }: StockMoveRowProps) {
  const router = useRouter();

  const handleRowClick = () => {
    router.push(`/inventory/stocks/stock-moves/${move.id}`);
  };

  const isPositive = move.quantity >= 0;

  return (
    <TableRow
      onClick={handleRowClick}
      className="hover:bg-gray-50/80 border-b border-gray-100 transition-colors cursor-pointer"
    >
      {/* 1. Move ID */}
      <TableCell className="px-6 py-3.5 whitespace-nowrap font-mono text-sm font-semibold">
        <Link
          href={`/inventory/stocks/stock-moves/${move.id}`}
          className="text-[#3B7CED] hover:underline"
          onClick={(e) => e.stopPropagation()}
        >
          {move.id}
        </Link>
      </TableCell>

      {/* 2. Product Name */}
      <TableCell className="px-6 py-3.5 whitespace-nowrap text-sm font-medium text-[#32325D]">
        {move.product?.product_name || "Unknown Product"}
      </TableCell>

      {/* 3. Quantity */}
      <TableCell
        className={`px-6 py-3.5 whitespace-nowrap font-mono text-sm font-bold text-center ${
          isPositive ? "text-[#2BA24D]" : "text-[#E43D2B]"
        }`}
      >
        {isPositive ? `+${move.quantity}` : move.quantity}
      </TableCell>

      {/* 4. Date and Time */}
      <TableCell className="px-6 py-3.5 whitespace-nowrap text-sm text-[#525F7F]">
        {move.date_moved || "N/A"}
      </TableCell>

      {/* 5. Total Value */}
      <TableCell className="px-6 py-3.5 whitespace-nowrap font-mono text-right text-sm font-bold text-[#32325D]">
        {move.total_value !== undefined ? `₦${move.total_value.toLocaleString()}` : "—"}
      </TableCell>

      {/* 6. Type */}
      <TableCell className="px-6 py-3.5 whitespace-nowrap text-center">
        <span
          className={`inline-block px-3 py-1 rounded-full text-xs font-semibold capitalize ${
            move.transaction_type === "Receipt"
              ? "bg-[#E2F2E9] text-[#2BA24D]"
              : move.transaction_type === "Consumption"
              ? "bg-[#E8F0FE] text-[#1A73E8]"
              : move.transaction_type === "Scrap"
              ? "bg-[#FCE8E6] text-[#E43D2B]"
              : "bg-[#E8F0FE] text-[#1A73E8]"
          }`}
        >
          {move.transaction_type || "Move"}
        </span>
      </TableCell>
    </TableRow>
  );
}
