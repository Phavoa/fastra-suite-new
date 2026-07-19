"use client";

import { useRouter } from "next/navigation";
import { Checkbox } from "@/components/ui/checkbox";
import { TableCell, TableRow } from "@/components/ui/table";
import { StatusPill } from "./StatusPill";
import { StockAdjustmentRow as StockAdjustmentRowType } from "../types";

interface StockAdjustmentRowProps {
  request: StockAdjustmentRowType;
  isSelected: boolean;
  onToggleSelect: (id: string) => void;
}

export function StockAdjustmentRow({
  request,
  isSelected,
  onToggleSelect,
}: StockAdjustmentRowProps) {
  const router = useRouter();

  const handleRowClick = () => {
    router.push(`/inventory/stocks/adjustment/${request.id}`);
  };

  const handleCheckboxChange = (e: React.MouseEvent) => {
    e.stopPropagation();
    onToggleSelect(request.id);
  };

  return (
    <TableRow
      className="cursor-pointer hover:bg-gray-50/50 border-b border-[#E9ECEF] transition-colors"
      onClick={handleRowClick}
    >
      <TableCell className="w-12 py-3.5 pl-6 pr-2" onClick={handleCheckboxChange}>
        <Checkbox
          id={`cb-${request.id}`}
          checked={isSelected}
          onCheckedChange={() => onToggleSelect(request.id)}
          className="data-[state=checked]:border-[#3B7CED] data-[state=checked]:bg-[#3B7CED] transition-all duration-200"
        />
      </TableCell>

      <TableCell className="py-3.5 px-6 whitespace-nowrap text-sm font-semibold text-[#3B7CED] hover:underline">
        {request.id}
      </TableCell>

      <TableCell className="py-3.5 px-6 whitespace-nowrap text-sm text-[#525F7F]">
        {request.adjustmentType}
      </TableCell>

      <TableCell className="py-3.5 px-6 whitespace-nowrap text-sm text-[#525F7F]">
        {request.location}
      </TableCell>

      <TableCell className="py-3.5 px-6 whitespace-nowrap text-sm font-medium text-[#32325D]">
        {request.product || "—"}
      </TableCell>

      <TableCell className="py-3.5 px-6 whitespace-nowrap text-sm font-mono font-bold text-right">
        {request.quantity !== undefined ? (
          <span className={request.quantity < 0 ? "text-[#E43D2B]" : "text-[#2BA24D]"}>
            {request.quantity > 0 ? `+${request.quantity}` : request.quantity}
          </span>
        ) : (
          "—"
        )}
      </TableCell>

      <TableCell className="py-3.5 px-6 whitespace-nowrap text-sm text-[#525F7F]">
        {request.adjustedDate}
      </TableCell>

      <TableCell className="py-3.5 px-6 whitespace-nowrap text-center">
        <StatusPill status={request.status} />
      </TableCell>
    </TableRow>
  );
}
