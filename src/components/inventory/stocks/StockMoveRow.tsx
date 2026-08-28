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
  const isOutgoing = 
    move.move_type === "CONSUMPTION" || 
    move.move_type === "Consumption" || 
    move.move_type === "SCRAP" || 
    move.move_type === "Scrap" || 
    move.move_type === "OUTGOING" ||
    qty < 0;

  return (
    <TableRow
      onClick={handleRowClick}
      className="hover:bg-gray-50/80 border-b border-gray-100 transition-colors cursor-pointer"
    >
      {/* 1. Date */}
      <TableCell className="px-4 py-3.5 whitespace-nowrap text-sm text-[#525F7F]">
        {move.date_moved ? (() => {
          try {
            const date = new Date(move.date_moved);
            return isNaN(date.getTime()) 
              ? move.date_moved 
              : date.toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "short",
                  day: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                  hour12: true
                });
          } catch {
            return move.date_moved;
          }
        })() : "N/A"}
      </TableCell>

      {/* 2. Reference */}
      <TableCell className="px-4 py-3.5 whitespace-nowrap font-mono text-sm font-semibold">
        <Link
          href={`/inventory/stocks/stock-moves/${move.id}`}
          className="text-[#3B7CED] hover:underline"
          onClick={(e) => e.stopPropagation()}
        >
          {move.reference || `Move #${move.id}`}
        </Link>
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
        {!isOutgoing ? Math.abs(qty) : "—"}
      </TableCell>

      {/* 6. Qty Out */}
      <TableCell className="px-4 py-3.5 whitespace-nowrap font-mono text-sm text-right text-[#E43D2B] font-medium bg-[#FAFAFA]/50 border-x border-gray-100">
        {isOutgoing ? Math.abs(qty) : "—"}
      </TableCell>

      {/* 7. Balance */}
      <TableCell className="px-4 py-3.5 whitespace-nowrap font-mono text-sm text-right text-[#32325D] font-bold bg-[#F4F5F7]/30">
        {move.running_balance !== undefined && move.running_balance !== null ? move.running_balance : "—"}
      </TableCell>

      {/* 8. WBS Phase */}
      <TableCell className="px-4 py-3.5 whitespace-nowrap text-sm text-[#525F7F]">
        {typeof move.wbs_phase === "object" ? (move.wbs_phase as any)?.name || (move.wbs_phase as any)?.id || "—" : move.wbs_phase || "—"}
      </TableCell>

      {/* 9. WBS Activity */}
      <TableCell className="px-4 py-3.5 whitespace-nowrap text-sm text-[#525F7F]">
        {typeof move.wbs_activity === "object" ? (move.wbs_activity as any)?.name || (move.wbs_activity as any)?.id || "—" : move.wbs_activity || "—"}
      </TableCell>

      {/* 10. User */}
      <TableCell className="px-4 py-3.5 whitespace-nowrap text-sm text-[#525F7F]">
        {move.moved_by_details?.first_name 
          ? `${move.moved_by_details.first_name} ${move.moved_by_details.last_name || ""}`.trim() 
          : "System Admin"}
      </TableCell>
    </TableRow>
  );
}
