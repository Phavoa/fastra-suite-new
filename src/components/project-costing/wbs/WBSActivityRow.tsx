import React from "react";
import { TableCell, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Trash2 } from "lucide-react";
import { Activity } from "../types";

interface WBSActivityRowProps {
  activity: Activity;
  isSubphaseActivity?: boolean;
  onUpdate: (updates: Partial<Activity>) => void;
  onRemove: () => void;
}

export function WBSActivityRow({
  activity,
  isSubphaseActivity = false,
  onUpdate,
  onRemove,
}: WBSActivityRowProps) {
  return (
    <TableRow className="border-b border-gray-100 hover:bg-transparent group">
      <TableCell className={isSubphaseActivity ? "relative" : "border-l border-gray-400 ml-4 relative"}>
        {isSubphaseActivity ? (
          <div className="absolute left-[3.2rem] top-0 bottom-0 w-px bg-gray-200"></div>
        ) : (
          <div className="absolute left-6 top-0 bottom-0 w-px bg-gray-300"></div>
        )}
      </TableCell>
      <TableCell className="py-2">
        <Input
          value={activity.name}
          onChange={(e) => onUpdate({ name: e.target.value })}
          className="h-8 w-full bg-transparent border-gray-200 hover:border-gray-300 focus:bg-white text-sm p-1 shadow-none"
        />
      </TableCell>
      <TableCell className="py-2">
        <Input
          type="number"
          value={activity.quantity || ""}
          onChange={(e) => onUpdate({ quantity: Number(e.target.value), budget: Number(e.target.value) * (activity.rate || 0) })}
          className="h-8 w-full max-w-[80px] bg-transparent border-gray-200 hover:border-gray-300 focus:bg-white text-sm p-1 shadow-none"
        />
      </TableCell>
      <TableCell className="py-2">
        <Input
          type="number"
          value={activity.rate || ""}
          onChange={(e) => onUpdate({ rate: Number(e.target.value), budget: (activity.quantity || 0) * Number(e.target.value) })}
          className="h-8 w-full max-w-[120px] bg-transparent border-gray-200 hover:border-gray-300 focus:bg-white text-sm p-1 shadow-none"
        />
      </TableCell>
      <TableCell className="py-2 flex items-center gap-2">
        <Input
          type="number"
          value={activity.budget || ""}
          disabled
          className="h-8 w-full max-w-[120px] bg-gray-50 border-gray-200 text-sm p-1 shadow-none cursor-not-allowed"
        />
        <button
          onClick={onRemove}
          className="text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </TableCell>
    </TableRow>
  );
}
