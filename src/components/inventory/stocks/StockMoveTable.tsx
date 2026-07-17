"use client";

import React from "react";
import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { StockMove } from "@/types/stockMove";
import { StockMoveRow } from "./StockMoveRow";

interface StockMoveTableProps {
  moves: StockMove[];
  query?: string;
}

export function StockMoveTable({ moves, query = "" }: StockMoveTableProps) {
  const filtered = React.useMemo(() => {
    if (!query.trim()) return moves;
    const q = query.toLowerCase();
    return moves.filter((move) => {
      const idStr = String(move.id).toLowerCase();
      const prodStr = move.product?.product_name
        ? move.product.product_name.toLowerCase()
        : "";
      const refStr = move.reference_document
        ? move.reference_document.toLowerCase()
        : "";
      return idStr.includes(q) || prodStr.includes(q) || refStr.includes(q);
    });
  }, [moves, query]);

  return (
    <div className="w-full">
      <div className="overflow-x-auto">
        <Table className="w-full">
          <TableHeader>
            <TableRow className="bg-[#F6F9FC] hover:bg-[#F6F9FC] border-b border-gray-100">
              <TableHead className="py-3.5 px-6 font-semibold text-[#8898AA] text-[11.5px] whitespace-nowrap">
                Move ID
              </TableHead>
              <TableHead className="py-3.5 px-6 font-semibold text-[#8898AA] text-[11.5px] whitespace-nowrap">
                Product Name
              </TableHead>
              <TableHead className="py-3.5 px-6 font-semibold text-[#8898AA] text-[11.5px] whitespace-nowrap text-center">
                Quantity
              </TableHead>
              <TableHead className="py-3.5 px-6 font-semibold text-[#8898AA] text-[11.5px] whitespace-nowrap">
                Date and Time
              </TableHead>
              <TableHead className="py-3.5 px-6 font-semibold text-[#8898AA] text-[11.5px] whitespace-nowrap text-right">
                Total Value
              </TableHead>
              <TableHead className="py-3.5 px-6 font-semibold text-[#8898AA] text-[11.5px] whitespace-nowrap text-center">
                Type
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map((move) => (
              <StockMoveRow key={move.id} move={move} />
            ))}
          </TableBody>
        </Table>
      </div>

      {filtered.length === 0 && (
        <div className="p-12 text-center text-[#8898AA] text-sm">
          No stock move records found matching your query.
        </div>
      )}
    </div>
  );
}
