import React from "react";
import { TableCell, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Plus, Trash2 } from "lucide-react";
import { Activity, Phase } from "../types";
import { WBSActivityRow } from "./WBSActivityRow";

interface WBSPhaseRowProps {
  phase: Phase;
  phaseBudget: number;
  extraColumns: string[];
  onUpdatePhaseName: (name: string) => void;
  onAddPhaseActivity: () => void;
  onUpdateActivity: (activityId: string, updates: Partial<Activity>) => void;
  onRemoveActivity: (activityId: string) => void;
  onRemovePhase: () => void;
}

export function WBSPhaseRow({
  phase,
  phaseBudget,
  extraColumns,
  onUpdatePhaseName,
  onAddPhaseActivity,
  onUpdateActivity,
  onRemoveActivity,
  onRemovePhase,
}: WBSPhaseRowProps) {
  return (
    <React.Fragment>
      {/* Phase Header */}
      <TableRow className="bg-[#EEF2FB] hover:bg-[#EEF2FB]/80 border-b border-white">
        <TableCell 
          colSpan={4} 
          className="font-medium p-0 text-sm bg-[#EEF2FB] h-12"
        >
          <div className="flex items-center px-4 h-full">
            <Input
              value={phase.name}
              onChange={(e) => onUpdatePhaseName(e.target.value)}
              className="h-8 w-60 bg-transparent border-0 hover:bg-white/50 focus:bg-white transition-all font-semibold text-gray-800 p-1 mr-4 shadow-none rounded"
            />
            <button
              type="button"
              onClick={onAddPhaseActivity}
              className="ml-4 text-[#3B7CED] text-xs font-normal hover:underline flex items-center"
            >
              <Plus className="w-3 h-3 mr-1" /> Activity
            </button>
            <button
              type="button"
              onClick={onRemovePhase}
              className="ml-4 text-gray-400 hover:text-red-500 flex items-center"
              title="Delete Phase"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </TableCell>
        <TableCell className="font-semibold text-sm py-2 bg-[#EEF2FB] text-gray-800">
          {phaseBudget.toLocaleString()}
        </TableCell>
        {extraColumns.length > 0 && (
          <TableCell colSpan={extraColumns.length} className="py-2 bg-[#EEF2FB]" />
        )}
        <TableCell className="py-2 bg-[#EEF2FB]"></TableCell>
      </TableRow>

      {/* Phase Activities */}
      {phase.activities.map((activity) => (
        <WBSActivityRow
          key={activity.id}
          activity={activity}
          extraColumns={extraColumns}
          onUpdate={(updates) => onUpdateActivity(activity.id, updates)}
          onRemove={() => onRemoveActivity(activity.id)}
        />
      ))}
    </React.Fragment>
  );
}
