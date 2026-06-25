import React from "react";
import { TableCell, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Plus, Trash2 } from "lucide-react";
import { Activity, Subphase } from "../types";
import { WBSActivityRow } from "./WBSActivityRow";

interface WBSSubphaseRowProps {
  subphase: Subphase;
  subphaseBudget: number;
  onUpdateName: (name: string) => void;
  onAddActivity: () => void;
  onUpdateActivity: (activityId: string, updates: Partial<Activity>) => void;
  onRemoveActivity: (activityId: string) => void;
  onRemoveSubphase: () => void;
}

export function WBSSubphaseRow({
  subphase,
  subphaseBudget,
  onUpdateName,
  onAddActivity,
  onUpdateActivity,
  onRemoveActivity,
  onRemoveSubphase,
}: WBSSubphaseRowProps) {
  return (
    <React.Fragment>
      {/* Subphase Header */}
      <TableRow className="bg-[#F4F7FC] hover:bg-[#F4F7FC] border-b border-white">
        <TableCell className="py-2 pl-[3.2rem] text-sm font-medium relative flex items-center">
          <div className="absolute left-6 top-0 bottom-1/2 w-px bg-gray-300"></div>
          <div className="absolute left-6 top-1/2 w-4 h-px bg-gray-300"></div>
          <Input
            value={subphase.name}
            onChange={(e) => onUpdateName(e.target.value)}
            className="h-8 w-40 bg-transparent border-gray-200 hover:border-gray-300 focus:bg-white transition-all font-medium p-1 shadow-none"
          />
          <button
            onClick={onAddActivity}
            className="ml-4 text-[#3B7CED] text-xs font-normal hover:underline flex items-center"
          >
            <Plus className="w-3 h-3 mr-1" /> Activity
          </button>
          <button
            onClick={onRemoveSubphase}
            className="ml-4 text-gray-400 hover:text-red-500 flex items-center"
            title="Delete Subphase"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </TableCell>
        <TableCell></TableCell>
        <TableCell></TableCell>
        <TableCell></TableCell>
        <TableCell className="font-medium text-sm">
          {subphaseBudget.toLocaleString()}
        </TableCell>
      </TableRow>

      {/* Subphase Activities */}
      {subphase.activities.map((activity) => (
        <WBSActivityRow
          key={activity.id}
          activity={activity}
          isSubphaseActivity={true}
          onUpdate={(updates) => onUpdateActivity(activity.id, updates)}
          onRemove={() => onRemoveActivity(activity.id)}
        />
      ))}
    </React.Fragment>
  );
}
