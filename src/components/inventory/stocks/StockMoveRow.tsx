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

  const qty = Number(move.quantity) || 0;
  const isPositive = qty >= 0;

  return (
    <TableRow
      onClick={handleRowClick}
      className="hover:bg-gray-50/80 border-b border-gray-100 transition-colors cursor-pointer"
    >
      {/* 1. Date */}
      <TableCell className="px-4 py-3.5 whitespace-nowrap text-sm text-[#525F7F]">
        {move.date_moved || "N/A"}
      </TableCell>

      {/* 2. Ref / Move ID */}
      <TableCell className="px-4 py-3.5 whitespace-nowrap font-mono text-sm font-semibold">
        <div className="flex flex-col gap-0.5">
          <Link
            href={`/inventory/stocks/stock-moves/${move.id}`}
            className="text-[#3B7CED] hover:underline"
            onClick={(e) => e.stopPropagation()}
          >
            {move.id}
          </Link>
          <span className="text-xs text-[#8898AA] font-normal">
            {move.reference || "-"}
          </span>
        </div>
      </TableCell>

      {/* 3. Type */}
      <TableCell className="px-4 py-3.5 whitespace-nowrap text-center">
        <span
          className={`inline-block px-2.5 py-0.5 rounded-full text-[11px] font-semibold capitalize ${
            move.move_type === "INCOMING" || move.move_type === "Receipt"
              ? "bg-[#E2F2E9] text-[#2BA24D]"
              : move.move_type === "CONSUMPTION" || move.move_type === "Consumption"
              ? "bg-[#E8F0FE] text-[#1A73E8]"
              : move.move_type === "SCRAP" || move.move_type === "Scrap"
              ? "bg-[#FCE8E6] text-[#E43D2B]"
              : "bg-[#F4F5F7] text-[#525F7F]"
          }`}
        >
          {move.move_type || "Move"}
        </span>
      </TableCell>

      {/* 4. Product */}
      <TableCell className="px-4 py-3.5 whitespace-nowrap text-sm font-medium text-[#32325D]">
        {move.product_details?.product_name || "Unknown Product"}
      </TableCell>

      {/* 5. Qty In */}
      <TableCell className="px-4 py-3.5 whitespace-nowrap font-mono text-sm text-right text-[#2BA24D] font-medium bg-[#FAFAFA]/50 border-l border-gray-100">
        {isPositive ? qty : "—"}
      </TableCell>

      {/* 6. Qty Out */}
      <TableCell className="px-4 py-3.5 whitespace-nowrap font-mono text-sm text-right text-[#E43D2B] font-medium bg-[#FAFAFA]/50 border-x border-gray-100">
        {!isPositive ? Math.abs(qty) : "—"}
      </TableCell>

      {/* 7. Balance */}
      <TableCell className="px-4 py-3.5 whitespace-nowrap font-mono text-sm text-right text-[#32325D] font-bold bg-[#F4F5F7]/30">
        {move.running_balance !== undefined && move.running_balance !== null ? move.running_balance : "—"}
      </TableCell>
    </TableRow>
  );
}
