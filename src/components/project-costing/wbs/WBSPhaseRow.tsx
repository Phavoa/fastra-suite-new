import React from "react";
import { TableCell, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Plus } from "lucide-react";
import { Activity, Phase, Subphase } from "../types";
import { WBSActivityRow } from "./WBSActivityRow";
import { WBSSubphaseRow } from "./WBSSubphaseRow";

interface WBSPhaseRowProps {
  phase: Phase;
  phaseBudget: number;
  getSubphaseBudget: (subphase: Subphase) => number;
  onUpdatePhaseName: (name: string) => void;
  onAddSubphase: () => void;
  onAddPhaseActivity: () => void;
  onUpdateSubphaseName: (subphaseId: string, name: string) => void;
  onAddSubphaseActivity: (subphaseId: string) => void;
  onUpdateActivity: (activityId: string, updates: Partial<Activity>, subphaseId?: string) => void;
  onRemoveActivity: (activityId: string, subphaseId?: string) => void;
}

export function WBSPhaseRow({
  phase,
  phaseBudget,
  getSubphaseBudget,
  onUpdatePhaseName,
  onAddSubphase,
  onAddPhaseActivity,
  onUpdateSubphaseName,
  onAddSubphaseActivity,
  onUpdateActivity,
  onRemoveActivity,
}: WBSPhaseRowProps) {
  return (
    <React.Fragment>
      {/* Phase Header */}
      <TableRow className="bg-[#EEF2FB] hover:bg-[#EEF2FB] border-b border-white">
        <TableCell className="font-medium py-2 text-sm flex items-center">
          <Input
            value={phase.name}
            onChange={(e) => onUpdatePhaseName(e.target.value)}
            className="h-8 w-40 bg-transparent border-transparent hover:border-gray-300 focus:bg-white transition-all font-medium p-1 mr-4 shadow-none"
          />
          <button
            onClick={onAddSubphase}
            className="ml-4 text-[#3B7CED] text-xs font-normal hover:underline flex items-center"
          >
            <Plus className="w-3 h-3 mr-1" /> Subphase
          </button>
          <button
            onClick={onAddPhaseActivity}
            className="ml-4 text-[#3B7CED] text-xs font-normal hover:underline flex items-center"
          >
            <Plus className="w-3 h-3 mr-1" /> Activity
          </button>
        </TableCell>
        <TableCell></TableCell>
        <TableCell className="font-medium text-sm">
          {phaseBudget.toLocaleString()}
        </TableCell>
      </TableRow>

      {/* Phase Direct Activities */}
      {phase.activities.map((activity) => (
        <WBSActivityRow
          key={activity.id}
          activity={activity}
          isSubphaseActivity={false}
          onUpdate={(updates) => onUpdateActivity(activity.id, updates)}
          onRemove={() => onRemoveActivity(activity.id)}
        />
      ))}

      {/* Subphases */}
      {phase.subphases.map((subphase) => (
        <WBSSubphaseRow
          key={subphase.id}
          subphase={subphase}
          subphaseBudget={getSubphaseBudget(subphase)}
          onUpdateName={(name) => onUpdateSubphaseName(subphase.id, name)}
          onAddActivity={() => onAddSubphaseActivity(subphase.id)}
          onUpdateActivity={(activityId, updates) =>
            onUpdateActivity(activityId, updates, subphase.id)
          }
          onRemoveActivity={(activityId) =>
            onRemoveActivity(activityId, subphase.id)
          }
        />
      ))}
    </React.Fragment>
  );
}
