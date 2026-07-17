"use client";

import React, { useMemo } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { StockAdjustmentRow as StockAdjustmentRowType } from "../types";
import { StockAdjustmentRow } from "./StockAdjustmentRow";

export function StockAdjustmentTable({
  rows,
  query,
}: {
  rows: StockAdjustmentRowType[];
  query: string;
}) {
  const [selected, setSelected] = React.useState<Record<string, boolean>>({});

  const filtered = useMemo(() => {
    if (!query.trim()) return rows;
    return rows.filter(
      (r) =>
        r.id.toLowerCase().includes(query.toLowerCase()) ||
        r.adjustmentType.toLowerCase().includes(query.toLowerCase()) ||
        r.location.toLowerCase().includes(query.toLowerCase()) ||
        r.adjustedDate.toLowerCase().includes(query.toLowerCase()) ||
        (r.product && r.product.toLowerCase().includes(query.toLowerCase()))
    );
  }, [rows, query]);

  const allSelected =
    filtered.length > 0 && filtered.every((r) => selected[r.id]);

  function toggleAll() {
    if (allSelected) {
      setSelected({});
      return;
    }
    const map: Record<string, boolean> = {};
    filtered.forEach((r) => (map[r.id] = true));
    setSelected(map);
  }

  function toggleOne(id: string) {
    setSelected((s) => ({ ...s, [id]: !s[id] }));
  }

  return (
    <div className="w-full">
      <div className="overflow-x-auto">
        <Table className="min-w-[950px] w-full">
          <TableHeader>
            <TableRow className="bg-[#F6F9FC] hover:bg-[#F6F9FC] border-b border-gray-100">
              <TableHead className="w-12 py-3.5 pl-6 pr-2">
                <Checkbox
                  id="select-all"
                  aria-label="Select all adjustments"
                  checked={allSelected}
                  onCheckedChange={() => toggleAll()}
                  className="data-[state=checked]:border-[#3B7CED] data-[state=checked]:bg-[#3B7CED] transition-all duration-200"
                />
              </TableHead>
              <TableHead className="py-3.5 px-6 font-semibold text-[#8898AA] text-[11.5px] whitespace-nowrap">
                Stock Adjustment ID
              </TableHead>
              <TableHead className="py-3.5 px-6 font-semibold text-[#8898AA] text-[11.5px] whitespace-nowrap">
                Adjustment Type
              </TableHead>
              <TableHead className="py-3.5 px-6 font-semibold text-[#8898AA] text-[11.5px] whitespace-nowrap">
                Location
              </TableHead>
              <TableHead className="py-3.5 px-6 font-semibold text-[#8898AA] text-[11.5px] whitespace-nowrap">
                Product
              </TableHead>
              <TableHead className="py-3.5 px-6 font-semibold text-[#8898AA] text-[11.5px] whitespace-nowrap text-right">
                Quantity Adjusted
              </TableHead>
              <TableHead className="py-3.5 px-6 font-semibold text-[#8898AA] text-[11.5px] whitespace-nowrap">
                Adjusted Date
              </TableHead>
              <TableHead className="py-3.5 px-6 font-semibold text-[#8898AA] text-[11.5px] whitespace-nowrap text-center">
                Status
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map((v) => (
              <StockAdjustmentRow
                key={v.id}
                request={v}
                isSelected={!!selected[v.id]}
                onToggleSelect={toggleOne}
              />
            ))}
          </TableBody>
        </Table>
      </div>

      {filtered.length === 0 && (
        <div className="p-12 text-center text-[#8898AA] text-sm">
          No stock adjustments found matching your query.
        </div>
      )}

      <div className="px-6 py-4 flex items-center justify-between text-sm text-[#525F7F] bg-[#F6F9FC] border-t border-gray-100">
        <div>Showing {filtered.length} entries</div>
        <nav aria-label="Pagination">
          <ul className="inline-flex items-center gap-2">
            <li>
              <button disabled className="px-3 py-1 rounded-md border border-gray-200 bg-white text-gray-400 cursor-not-allowed text-xs">
                Prev
              </button>
            </li>
            <li>
              <button disabled className="px-3 py-1 rounded-md border border-gray-200 bg-white text-gray-400 cursor-not-allowed text-xs">
                Next
              </button>
            </li>
          </ul>
        </nav>
      </div>
    </div>
  );
}
