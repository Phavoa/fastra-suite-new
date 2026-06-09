import React, { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Phase, Subphase, Activity } from "./types";
import { WBSPhaseRow } from "./WBSPhaseRow";

const generateId = () => Math.random().toString(36).substr(2, 9);

export function WBSTable() {
  const [phases, setPhases] = useState<Phase[]>([
    {
      id: "p1",
      name: "Phase 1",
      activities: [
        { id: "p1-a1", name: "Activities 1", budget: 1000000 },
        { id: "p1-a2", name: "Activities 2", budget: 1000000 },
      ],
      subphases: [
        {
          id: "p1-s1",
          name: "Sub Phase 1",
          activities: [
            { id: "p1-s1-a1", name: "Activities 2", budget: 1000000 },
          ],
        },
      ],
    },
  ]);

  // Compute total budget
  const totalBudget = useMemo(() => {
    let total = 0;
    phases.forEach((p) => {
      p.activities.forEach((a) => (total += a.budget || 0));
      p.subphases.forEach((s) => {
        s.activities.forEach((a) => (total += a.budget || 0));
      });
    });
    return total;
  }, [phases]);

  // Helper to get Phase Budget
  const getPhaseBudget = (phase: Phase) => {
    let total = 0;
    phase.activities.forEach((a) => (total += a.budget || 0));
    phase.subphases.forEach((s) => {
      s.activities.forEach((a) => (total += a.budget || 0));
    });
    return total;
  };

  // Helper to get Subphase Budget
  const getSubphaseBudget = (subphase: Subphase) => {
    return subphase.activities.reduce((sum, a) => sum + (a.budget || 0), 0);
  };

  // --- Handlers ---
  const addPhase = () => {
    const newPhase: Phase = {
      id: generateId(),
      name: `Phase ${phases.length + 1}`,
      subphases: [],
      activities: [],
    };
    setPhases([...phases, newPhase]);
  };

  const addSubphase = (phaseId: string) => {
    setPhases((prev) =>
      prev.map((p) => {
        if (p.id === phaseId) {
          return {
            ...p,
            subphases: [
              ...p.subphases,
              {
                id: generateId(),
                name: `Sub Phase ${p.subphases.length + 1}`,
                activities: [],
              },
            ],
          };
        }
        return p;
      }),
    );
  };

  const addPhaseActivity = (phaseId: string) => {
    setPhases((prev) =>
      prev.map((p) => {
        if (p.id === phaseId) {
          return {
            ...p,
            activities: [
              ...p.activities,
              {
                id: generateId(),
                name: `Activities ${p.activities.length + 1}`,
                budget: 0,
              },
            ],
          };
        }
        return p;
      }),
    );
  };

  const addSubphaseActivity = (phaseId: string, subphaseId: string) => {
    setPhases((prev) =>
      prev.map((p) => {
        if (p.id === phaseId) {
          return {
            ...p,
            subphases: p.subphases.map((s) => {
              if (s.id === subphaseId) {
                return {
                  ...s,
                  activities: [
                    ...s.activities,
                    {
                      id: generateId(),
                      name: `Activities ${s.activities.length + 1}`,
                      budget: 0,
                    },
                  ],
                };
              }
              return s;
            }),
          };
        }
        return p;
      }),
    );
  };

  const updatePhaseName = (phaseId: string, name: string) => {
    setPhases((prev) =>
      prev.map((p) => (p.id === phaseId ? { ...p, name } : p)),
    );
  };

  const updateSubphaseName = (
    phaseId: string,
    subphaseId: string,
    name: string,
  ) => {
    setPhases((prev) =>
      prev.map((p) => {
        if (p.id === phaseId) {
          return {
            ...p,
            subphases: p.subphases.map((s) =>
              s.id === subphaseId ? { ...s, name } : s,
            ),
          };
        }
        return p;
      }),
    );
  };

  const updateActivity = (
    phaseId: string,
    activityId: string,
    updates: Partial<Activity>,
    subphaseId?: string,
  ) => {
    setPhases((prev) =>
      prev.map((p) => {
        if (p.id === phaseId) {
          if (!subphaseId) {
            return {
              ...p,
              activities: p.activities.map((a) =>
                a.id === activityId ? { ...a, ...updates } : a,
              ),
            };
          } else {
            return {
              ...p,
              subphases: p.subphases.map((s) => {
                if (s.id === subphaseId) {
                  return {
                    ...s,
                    activities: s.activities.map((a) =>
                      a.id === activityId ? { ...a, ...updates } : a,
                    ),
                  };
                }
                return s;
              }),
            };
          }
        }
        return p;
      }),
    );
  };

  const removeActivity = (
    phaseId: string,
    activityId: string,
    subphaseId?: string,
  ) => {
    setPhases((prev) =>
      prev.map((p) => {
        if (p.id === phaseId) {
          if (!subphaseId) {
            return {
              ...p,
              activities: p.activities.filter((a) => a.id !== activityId),
            };
          } else {
            return {
              ...p,
              subphases: p.subphases.map((s) => {
                if (s.id === subphaseId) {
                  return {
                    ...s,
                    activities: s.activities.filter((a) => a.id !== activityId),
                  };
                }
                return s;
              }),
            };
          }
        }
        return p;
      }),
    );
  };

  return (
    <section>
      <h2 className="text-[#3B7CED] text-base font-medium mb-4">
        Work Breakdown Structure (WBS)
      </h2>
      <div className="border border-gray-200 rounded overflow-hidden">
        <Table>
          <TableHeader className="bg-gray-50 border-b border-gray-200">
            <TableRow className="hover:bg-gray-50 border-0">
              <TableHead className="w-[50%] font-medium text-gray-500 py-3">
                Name
              </TableHead>
              <TableHead className="w-[30%] font-medium text-gray-500 py-3">
                Activities
              </TableHead>
              <TableHead className="w-[20%] font-medium text-gray-500 py-3">
                Budget
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {phases.map((phase) => (
              <WBSPhaseRow
                key={phase.id}
                phase={phase}
                phaseBudget={getPhaseBudget(phase)}
                getSubphaseBudget={getSubphaseBudget}
                onUpdatePhaseName={(name) => updatePhaseName(phase.id, name)}
                onAddSubphase={() => addSubphase(phase.id)}
                onAddPhaseActivity={() => addPhaseActivity(phase.id)}
                onUpdateSubphaseName={(subphaseId, name) =>
                  updateSubphaseName(phase.id, subphaseId, name)
                }
                onAddSubphaseActivity={(subphaseId) =>
                  addSubphaseActivity(phase.id, subphaseId)
                }
                onUpdateActivity={(activityId, updates, subphaseId) =>
                  updateActivity(phase.id, activityId, updates, subphaseId)
                }
                onRemoveActivity={(activityId, subphaseId) =>
                  removeActivity(phase.id, activityId, subphaseId)
                }
              />
            ))}
          </TableBody>
        </Table>

        {/* WBS Footer */}
        <div className="flex items-center justify-between p-4 bg-white border-t border-gray-200">
          <Button
            onClick={addPhase}
            className="bg-[#3B7CED] hover:bg-[#3065c3] text-white h-9 px-6 rounded"
          >
            Add a Phase
          </Button>
          <div className="text-gray-600 text-sm">
            Total Project Budget:{" "}
            <span className="text-xl font-semibold text-gray-800 ml-2">
              {totalBudget.toLocaleString()}
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
