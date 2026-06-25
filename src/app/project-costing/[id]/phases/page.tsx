"use client";

import React, { useState } from "react";
import { ArrowLeft, ChevronDown, ChevronRight, CheckCircle2 } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useGetProjectCostingProjectQuery } from "@/api/projectCostingApi";

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
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-64px)] bg-gray-50">
        <p className="text-gray-500 text-sm">Loading Work Breakdown Structure...</p>
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
    <div className="flex flex-col flex-1 min-h-[calc(100vh-64px)] bg-gray-50">
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
            N{projectBudget.toLocaleString()}
          </div>
        </div>

        {/* WBS Table */}
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden mb-12">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="py-3 px-4 font-medium text-sm text-gray-500 w-[45%]">WBS Elements</th>
                <th className="py-3 px-4 font-medium text-sm text-gray-500 w-[35%]">Activities</th>
                <th className="py-3 px-4 font-medium text-sm text-gray-500 w-[20%]">Budget</th>
              </tr>
            </thead>
            <tbody>
              {groupedPhases.map((phase, pIndex) => {
                const isExpanded = expandedPhases[phase.id] !== false; // default true
                
                return (
                  <React.Fragment key={phase.id}>
                    {/* Phase Row */}
                    <tr 
                      className="bg-[#EEF2FB] border-b border-white cursor-pointer hover:bg-[#e4ebf9] transition-colors"
                      onClick={() => togglePhase(phase.id)}
                    >
                      <td className="py-3 px-4 text-sm font-medium text-gray-800 flex items-center gap-2">
                        {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                        {phase.name}
                      </td>
                      <td className="py-3 px-4 text-sm text-gray-600"></td>
                      <td className="py-3 px-4 text-sm font-semibold text-gray-800">
                        {phase.budget.toLocaleString()}
                      </td>
                    </tr>

                    {/* Phase Content */}
                    {isExpanded && (
                      <>
                        {/* Direct Activities */}
                        {phase.directActivities.map((act, aIndex) => (
                          <tr key={`dir-${phase.id}-${act.id || aIndex}`} className="border-b border-gray-100">
                            <td className="py-3 px-4 relative">
                              <div className="absolute left-6 top-0 bottom-1/2 w-px bg-gray-300"></div>
                              <div className="absolute left-6 top-1/2 w-4 h-px bg-gray-300"></div>
                            </td>
                            <td className="py-3 px-4 text-sm text-gray-600">{act.displayName}</td>
                            <td className="py-3 px-4 text-sm text-gray-600">
                              {Number(act.amount || 0).toLocaleString()}
                            </td>
                          </tr>
                        ))}

                        {/* Subphases */}
                        {phase.subphases.map((sub, sIndex) => {
                          const subId = `${phase.id}-${sub.name}`;
                          const isSubExpanded = expandedSubphases[subId] !== false; // default true

                          return (
                            <React.Fragment key={subId}>
                              <tr 
                                className="bg-[#EEF2FB] border-b border-white cursor-pointer hover:bg-[#e4ebf9] transition-colors"
                                onClick={() => toggleSubphase(subId)}
                              >
                                <td className="py-3 px-4 text-sm font-medium text-gray-700 flex items-center pl-10 relative">
                                  <div className="absolute left-6 top-0 bottom-1/2 w-px bg-gray-300"></div>
                                  <div className="absolute left-6 top-1/2 w-4 h-px bg-gray-300"></div>
                                  {isSubExpanded ? <ChevronDown className="h-4 w-4 mr-2 text-gray-500" /> : <ChevronRight className="h-4 w-4 mr-2 text-gray-500" />}
                                  {sub.name}
                                </td>
                                <td className="py-3 px-4 text-sm text-gray-600"></td>
                                <td className="py-3 px-4 text-sm font-semibold text-gray-700">
                                  {sub.budget.toLocaleString()}
                                </td>
                              </tr>

                              {isSubExpanded && sub.activities.map((act, saIndex) => (
                                <tr key={`subact-${subId}-${act.id || saIndex}`} className="border-b border-gray-100">
                                  <td className="py-3 px-4 relative">
                                    <div className="absolute left-6 top-0 bottom-full w-px bg-gray-300"></div>
                                  </td>
                                  <td className="py-3 px-4 text-sm text-gray-600">{act.displayName}</td>
                                  <td className="py-3 px-4 text-sm text-gray-600">
                                    {Number(act.amount || 0).toLocaleString()}
                                  </td>
                                </tr>
                              ))}
                            </React.Fragment>
                          );
                        })}
                      </>
                    )}
                  </React.Fragment>
                );
              })}
            </tbody>
            <tfoot>
              <tr>
                <td colSpan={3} className="py-4 px-6 text-right font-medium text-gray-600">
                  Total Project Budget: <span className="text-xl font-semibold text-gray-800 ml-2">{projectBudget.toLocaleString()}</span>
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </div>
  );
}
