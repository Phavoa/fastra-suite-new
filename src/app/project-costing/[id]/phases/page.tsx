"use client";

import React, { useState } from "react";
import { ArrowLeft, ChevronDown, ChevronRight, CheckCircle2 } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useGetProjectCostingProjectQuery } from "@/api/projectCostingApi";
import { PageGuard } from "@/components/auth/PageGuard";
import { motion, AnimatePresence } from "framer-motion";
import { Skeleton } from "@/components/ui/skeleton";

interface GroupedSubphase {
  name: string;
  activities: any[];
  budget: number;
}

interface GroupedPhase {
  id: string;
  name: string;
  budget: number;
  subphases: GroupedSubphase[];
  directActivities: any[];
}

export default function WorkBreakdownStructurePage() {
  const params = useParams();
  const id = params?.id;

  const { data: project, isLoading, error } = useGetProjectCostingProjectQuery(
    Number(id),
    { skip: !id }
  );

  const [expandedPhases, setExpandedPhases] = useState<Record<string, boolean>>({});
  const [expandedSubphases, setExpandedSubphases] = useState<Record<string, boolean>>({});

  if (isLoading) {
    return (
      <div className="flex flex-col flex-1 min-h-[calc(100vh-64px)] bg-gray-50">
        <div className="flex items-center px-6 py-4 bg-white border-b border-gray-100">
          <Skeleton className="h-4 w-48 bg-gray-200" />
        </div>

        <div className="p-6 max-w-[1200px] mx-auto w-full flex flex-col gap-6">
          {/* Budget Card Skeleton */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6 flex flex-col gap-2">
            <Skeleton className="h-4 w-28 bg-gray-200" />
            <Skeleton className="h-8 w-48 bg-gray-200" />
          </div>

          {/* WBS Table Skeleton */}
          <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden mb-12">
            <div className="p-4 bg-gray-50 border-b border-gray-200 flex justify-between gap-4">
              <Skeleton className="h-4 w-1/4 bg-gray-200" />
              <Skeleton className="h-4 w-1/6 bg-gray-200" />
              <Skeleton className="h-4 w-[10%] bg-gray-200" />
              <Skeleton className="h-4 w-1/6 bg-gray-200" />
              <Skeleton className="h-4 w-1/6 bg-gray-200" />
            </div>
            <div className="divide-y divide-gray-100">
              {Array.from({ length: 6 }).map((_, idx) => (
                <div key={idx} className="p-4 flex justify-between gap-4 bg-white">
                  <Skeleton className="h-4 w-1/3 bg-gray-100" />
                  <Skeleton className="h-4 w-1/6 bg-gray-100" />
                  <Skeleton className="h-4 w-[8%] bg-gray-100" />
                  <Skeleton className="h-4 w-1/6 bg-gray-100" />
                  <Skeleton className="h-4 w-1/6 bg-gray-100" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !project) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-64px)] bg-gray-50">
        <p className="text-red-500 text-sm mb-4">Failed to load Work Breakdown Structure.</p>
        <Link href={`/project-costing/${id}`}>
          <button className="bg-[#3B7CED] text-white px-4 py-2 rounded">Back</button>
        </Link>
      </div>
    );
  }

  let parsedPhases: any[] = [];
  if (project?.phases) {
    try {
      parsedPhases = typeof project.phases === "string" ? JSON.parse(project.phases) : project.phases;
    } catch (e) {
      console.error("Failed to parse phases", e);
    }
  }

  // Calculate project budget
  let projectBudget = 0;
  if (project?.financials) {
    try {
      const fin = typeof project.financials === "string" ? JSON.parse(project.financials) : project.financials;
      projectBudget = Number(fin.budget || 0);
    } catch (e) {
      //
    }
  }
  
  if (projectBudget === 0 && parsedPhases.length > 0) {
    projectBudget = parsedPhases.reduce((acc, phase) => {
      return acc + (phase.activities || []).reduce((sum: number, act: any) => sum + Number(act.amount || 0), 0);
    }, 0);
  }
  let customColumns: string[] = [];
  if (parsedPhases && parsedPhases.length > 0) {
    const colSet = new Set<string>();
    const standardKeys = new Set([
      "id",
      "name",
      "quantity",
      "qty",
      "rate",
      "amount",
      "budget",
      "total_amount",
      "start_date",
      "end_date",
      "status",
      "cost_category",
      "sn",
      "s/n",
      "s_n",
      "serial",
      "serial_number",
      "serial number",
      "serial_no",
      "serial no",
      "phase",
      "phase_name",
      "phase_id",
      "subphase",
      "sub_phase",
      "activity",
      "activity_name",
      "displayname",
      "custom_values",
    ]);
    parsedPhases.forEach((phase: any) => {
      if (phase.activities && Array.isArray(phase.activities)) {
        phase.activities.forEach((act: any) => {
          Object.keys(act).forEach((key) => {
            const lower = key.toLowerCase().trim();
            if (!standardKeys.has(lower)) {
              colSet.add(key);
            }
          });
          if (act.custom_values && typeof act.custom_values === "object") {
            Object.keys(act.custom_values).forEach((key) => {
              const lower = key.toLowerCase().trim();
              if (!standardKeys.has(lower)) {
                colSet.add(key);
              }
            });
          }
        });
      }
    });
    customColumns = Array.from(colSet);
  }

  // Group phases
  const groupedPhases: GroupedPhase[] = parsedPhases.map((phase: any) => {
    let phaseBudget = 0;
    const directActivities: any[] = [];
    const subphasesMap: Record<string, GroupedSubphase> = {};

    if (phase.activities && Array.isArray(phase.activities)) {
      phase.activities.forEach((act: any) => {
        const amount = Number(act.amount || 0);
        phaseBudget += amount;

        const parts = (act.name || "").split(" - ");
        if (parts.length > 1) {
          const subphaseName = parts[0].trim();
          const activityName = parts.slice(1).join(" - ").trim();
          
          if (!subphasesMap[subphaseName]) {
            subphasesMap[subphaseName] = { name: subphaseName, activities: [], budget: 0 };
          }
          subphasesMap[subphaseName].activities.push({ ...act, displayName: activityName });
          subphasesMap[subphaseName].budget += amount;
        } else {
          directActivities.push({ ...act, displayName: act.name });
        }
      });
    }

    return {
      id: phase.id || phase.name,
      name: phase.name,
      budget: phaseBudget,
      subphases: Object.values(subphasesMap),
      directActivities,
    };
  });

  const togglePhase = (phaseId: string) => {
    setExpandedPhases(prev => ({ ...prev, [phaseId]: prev[phaseId] === false ? true : false }));
  };

  const toggleSubphase = (subId: string) => {
    setExpandedSubphases(prev => ({ ...prev, [subId]: prev[subId] === false ? true : false }));
  };

  return (
    <PageGuard module="project_costing" entitlement="view_project">
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, ease: "easeOut" }}
      className="flex flex-col flex-1 min-h-[calc(100vh-64px)] bg-gray-50"
    >
      <div className="flex items-center px-6 py-4 bg-white border-b border-gray-100">
        <Link href={`/project-costing/${id}`}>
          <button className="mr-3 flex items-center justify-center p-1 hover:bg-gray-100 rounded">
            <ArrowLeft className="h-5 w-5 text-gray-500" />
          </button>
        </Link>
        <h1 className="text-lg font-medium text-gray-800">Work Breakdown Structure (WBS)</h1>
      </div>

      <div className="p-6 max-w-[1200px] mx-auto w-full flex flex-col gap-6">
        
        {/* Budget Card */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6 flex flex-col items-start">
          <div className="flex items-center gap-2 mb-2">
            <CheckCircle2 className="h-5 w-5 text-green-500" />
            <span className="text-sm font-medium text-green-500">Project Budget</span>
          </div>
          <div className="text-3xl font-semibold text-green-600">
            ₦{projectBudget.toLocaleString()}
          </div>
        </div>

        {/* WBS Table */}
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden mb-12">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="py-3 px-4 font-semibold text-sm text-gray-600 w-[80px] text-center">S/N</th>
                <th className="py-3 px-4 font-semibold text-sm text-gray-600 min-w-[320px]">Activity</th>
                <th className="py-3 px-4 font-semibold text-sm text-gray-600 w-[120px]">Quantity</th>
                <th className="py-3 px-4 font-semibold text-sm text-gray-600 w-[140px]">Rate</th>
                <th className="py-3 px-4 font-semibold text-sm text-gray-600 w-[160px]">Amount</th>
                {customColumns.map(col => (
                  <th key={col} className="py-3 px-4 font-semibold text-sm text-gray-600 whitespace-nowrap">{col}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {(() => {
                let serialCounter = 1;
                return groupedPhases.map((phase, pIndex) => {
                  const isExpanded = expandedPhases[phase.id] !== false; // default true
                  
                  return (
                    <React.Fragment key={phase.id}>
                      {/* Phase Row */}
                      <tr 
                        className="bg-[#EEF2FB] border-b border-white cursor-pointer hover:bg-[#e4ebf9] transition-colors"
                        onClick={() => togglePhase(phase.id)}
                      >
                        <td colSpan={4} className="py-3 px-4 text-sm font-bold text-gray-800">
                          <div className="flex items-center gap-2">
                            {isExpanded ? <ChevronDown className="h-4 w-4 text-[#3B7CED]" /> : <ChevronRight className="h-4 w-4 text-[#3B7CED]" />}
                            <span className="text-[#3B7CED] text-sm font-bold uppercase tracking-wide">Phase:</span>
                            <span className="font-bold text-base text-gray-900">{phase.name}</span>
                          </div>
                        </td>
                        <td className="py-3 px-4 text-base font-bold text-gray-900 bg-[#EEF2FB]">
                          ₦{phase.budget.toLocaleString()}
                        </td>
                        {customColumns.map(col => <td key={col} className="py-3 px-4 bg-[#EEF2FB]"></td>)}
                      </tr>

                      {/* Phase Content */}
                      {isExpanded && (
                        <>
                          {/* Direct Activities */}
                          {phase.directActivities.map((act, aIndex) => {
                            const currentSn = serialCounter++;
                            return (
                              <tr key={`dir-${phase.id}-${act.id || aIndex}`} className="border-b border-gray-100 hover:bg-gray-50/50 transition-colors">
                                <td className="py-3 px-4 text-sm font-medium text-gray-500 text-center">
                                  {currentSn}
                                </td>
                                <td className="py-3 px-4 text-sm font-medium text-gray-800">{act.displayName}</td>
                                <td className="py-3 px-4 text-sm text-gray-600">{act.quantity || 1}</td>
                                <td className="py-3 px-4 text-sm text-gray-600">₦{Number(act.rate || Number(act.amount || 0) / Number(act.quantity || 1) || 0).toLocaleString()}</td>
                                <td className="py-3 px-4 text-sm font-medium text-gray-800">
                                  ₦{Number(act.amount || 0).toLocaleString()}
                                </td>
                                {customColumns.map(col => (
                                  <td key={col} className="py-3 px-4 text-sm text-gray-600">{act[col] || act.custom_values?.[col] || ""}</td>
                                ))}
                              </tr>
                            );
                          })}

                          {/* Subphases */}
                          {phase.subphases.map((sub, sIndex) => {
                            const subId = `${phase.id}-${sub.name}`;
                            const isSubExpanded = expandedSubphases[subId] !== false; // default true

                            return (
                              <React.Fragment key={subId}>
                                <tr 
                                  className="bg-[#F4F7FC] border-b border-white cursor-pointer hover:bg-[#eef2f9] transition-colors"
                                  onClick={() => toggleSubphase(subId)}
                                >
                                  <td colSpan={4} className="py-3 px-4 text-sm font-semibold text-gray-700">
                                    <div className="flex items-center gap-2 pl-4">
                                      {isSubExpanded ? <ChevronDown className="h-4 w-4 text-gray-500" /> : <ChevronRight className="h-4 w-4 text-gray-500" />}
                                      <span className="text-gray-500 text-xs font-bold uppercase tracking-wide">Sub Phase:</span>
                                      <span className="font-semibold text-sm text-gray-800">{sub.name}</span>
                                    </div>
                                  </td>
                                  <td className="py-3 px-4 text-sm font-bold text-gray-800 bg-[#F4F7FC]">
                                    ₦{sub.budget.toLocaleString()}
                                  </td>
                                  {customColumns.map(col => <td key={col} className="py-3 px-4 bg-[#F4F7FC]"></td>)}
                                </tr>

                                {isSubExpanded && sub.activities.map((act, saIndex) => {
                                  const currentSn = serialCounter++;
                                  return (
                                    <tr key={`subact-${subId}-${act.id || saIndex}`} className="border-b border-gray-100 hover:bg-gray-50/50 transition-colors">
                                      <td className="py-3 px-4 text-sm font-medium text-gray-500 text-center">
                                        {currentSn}
                                      </td>
                                      <td className="py-3 px-4 text-sm font-medium text-gray-800 pl-8">{act.displayName}</td>
                                      <td className="py-3 px-4 text-sm text-gray-600">{act.quantity || 1}</td>
                                      <td className="py-3 px-4 text-sm text-gray-600">₦{Number(act.rate || Number(act.amount || 0) / Number(act.quantity || 1) || 0).toLocaleString()}</td>
                                      <td className="py-3 px-4 text-sm font-medium text-gray-800">
                                        ₦{Number(act.amount || 0).toLocaleString()}
                                      </td>
                                      {customColumns.map(col => (
                                        <td key={col} className="py-3 px-4 text-sm text-gray-600">{act[col] || act.custom_values?.[col] || ""}</td>
                                      ))}
                                    </tr>
                                  );
                                })}
                              </React.Fragment>
                            );
                          })}
                        </>
                      )}
                    </React.Fragment>
                  );
                });
              })()}
            </tbody>
            <tfoot>
              <tr>
                <td colSpan={5 + customColumns.length} className="py-4 px-6 text-right font-medium text-gray-600">
                  Total Project Budget: <span className="text-xl font-semibold text-gray-800 ml-2">₦{projectBudget.toLocaleString()}</span>
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </motion.div>
    </PageGuard>
  );
}
