"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { AddBudgetAdjustmentModal } from "@/components/project-costing/modals/AddBudgetAdjustmentModal";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ArrowLeft, RefreshCw, Plus } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useGetProjectCostingProjectQuery } from "@/api/projectCostingApi";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";

const getStatusVariant = (status: string) => {
  switch (status?.toUpperCase()) {
    case "ACTIVE":
    case "APPROVED":
      return "validated";
    case "AWAITING APPROVAL":
    case "PENDING":
      return "pending";
    case "REJECTED":
      return "rejected";
    default:
      return "draft";
  }
};

export default function ProjectDashboardPage() {
  const params = useParams();
  const id = params?.id;
  const [showActual, setShowActual] = useState(true);
  const [showPlanned, setShowPlanned] = useState(true);
  const [isBudgetAdjustmentModalOpen, setIsBudgetAdjustmentModalOpen] = useState(false);

  const { data: project, isLoading, error } = useGetProjectCostingProjectQuery(
    Number(id),
    { skip: !id }
  );
  
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-64px)] bg-gray-50">
        <p className="text-gray-500 text-sm">Loading project costing dashboard...</p>
      </div>
    );
  }

  if (error || !project) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-64px)] bg-gray-50">
        <p className="text-red-500 text-sm mb-4">Failed to load project costing dashboard.</p>
        <Link href="/project-costing">
          <Button className="bg-[#3B7CED] text-white">Back to Project Costing</Button>
        </Link>
      </div>
    );
  }

  let actualSpend = 0;
  let committed = 0;
  let remaining = 0;
  let variance = "0%";
  let fin: any = null;
  
  if (project?.financials) {
    try {
      fin = typeof project.financials === "string" ? JSON.parse(project.financials) : project.financials;
      if (fin?.summary) {
        actualSpend = fin.summary.actual || fin.summary.spent || 0;
        committed = fin.summary.committed || 0;
        remaining = fin.summary.remaining_budget || 0;
        variance = `${(fin.summary.consumed_percent || 0).toFixed(1)}%`;
      }
    } catch (e) {
      console.error("Failed to parse financials", e);
    }
  }

  const budgetNum = project?.total_budget ? Number(project.total_budget) : 0;
  // If API gives us remaining budget, we can use it, otherwise calculate it as a fallback
  if (!fin || !fin.summary) {
    remaining = budgetNum - actualSpend - committed;
    variance = budgetNum > 0 ? `${((actualSpend / budgetNum) * 100).toFixed(1)}%` : "0%";
  }

  const finPercent = budgetNum > 0 ? actualSpend / budgetNum : 0;
  const actualPercent = budgetNum > 0 ? actualSpend / budgetNum : 0;
  const committedPercent = budgetNum > 0 ? committed / budgetNum : 0;
  const availablePercent = budgetNum > 0 ? remaining / budgetNum : 1;

  let parsedWbs: any[] = [];
  if (project?.wbs) {
    try {
      parsedWbs = typeof project.wbs === "string" ? JSON.parse(project.wbs) : project.wbs;
    } catch (e) {
      console.error("Failed to parse WBS", e);
    }
  }

  let dynamicLineChartData: any[] = [];
  if (project?.start_date && project?.expected_end_date && budgetNum > 0) {
    const start = new Date(project.start_date);
    const end = new Date(project.expected_end_date);
    
    if (start >= end) {
      dynamicLineChartData = [
        { name: start.toLocaleString('default', { month: 'short' }), planned: budgetNum, actual: actualSpend }
      ];
    } else {
      const monthDiff = (end.getFullYear() - start.getFullYear()) * 12 + end.getMonth() - start.getMonth() + 1;
      const plannedIncrement = budgetNum / monthDiff;
      const now = new Date();
      const currentMonthIndex = Math.max(0, Math.min(monthDiff, (now.getFullYear() - start.getFullYear()) * 12 + now.getMonth() - start.getMonth() + 1));
      const actualIncrement = currentMonthIndex > 0 ? actualSpend / currentMonthIndex : 0;
      
      let currentPlanned = 0;
      let currentActual = 0;
      
      for (let i = 0; i < monthDiff; i++) {
        const d = new Date(start.getFullYear(), start.getMonth() + i, 1);
        currentPlanned += plannedIncrement;
        
        if (i < currentMonthIndex) {
          currentActual += actualIncrement;
        }
        
        dynamicLineChartData.push({
          name: d.toLocaleString('default', { month: 'short' }),
          planned: Math.round(currentPlanned),
          actual: i < currentMonthIndex ? Math.round(currentActual) : null,
        });
      }
    }
  }

  const renderWbsRows = (items: any[], level = 0): React.ReactNode => {
    if (!items || !Array.isArray(items)) return null;
    return items.map((item, index) => {
      const isPhase = item.element_type === "PHASE";
      const isSubPhase = item.element_type === "SUB_PHASE";
      const isActivity = item.element_type === "ACTIVITY";

      const name = item.name || (isPhase ? `Phase ${index + 1}` : "Unnamed Element");
      
      let budget = 0;
      if (isActivity && item.budget_lines) {
        budget = item.budget_lines.reduce((sum: number, line: any) => sum + Number(line.original_budget || line.amount || 0), 0);
      } else if (item.total_budget) {
        budget = Number(item.total_budget);
      } else if (item.children) {
        const sumChildren = (childItems: any[]): number => {
           let sum = 0;
           for (const child of childItems) {
             if (child.element_type === "ACTIVITY" && child.budget_lines) {
               sum += child.budget_lines.reduce((s: number, l: any) => s + Number(l.original_budget || l.amount || 0), 0);
             }
             if (child.children) {
               sum += sumChildren(child.children);
             }
           }
           return sum;
        };
        budget = sumChildren(item.children);
      }

      let rowClass = "border-b border-gray-100 hover:bg-transparent";
      if (isPhase) rowClass = "bg-[#EEF2FB] hover:bg-[#EEF2FB] border-b border-white";
      else if (isSubPhase) rowClass = "bg-[#F4F7FC] hover:bg-[#F4F7FC] border-b border-white";

      return (
        <React.Fragment key={item.id || `${level}-${index}`}>
          <TableRow className={rowClass}>
            <TableCell className="py-3 text-sm font-medium relative" style={{ paddingLeft: level === 0 ? '1rem' : `${level * 1.5 + 1}rem` }}>
              {level > 0 && (
                <>
                  <div className="absolute left-6 top-0 bottom-1/2 w-px bg-gray-300"></div>
                  <div className="absolute left-6 top-1/2 w-4 h-px bg-gray-300"></div>
                </>
              )}
              {isActivity ? "" : name}
            </TableCell>
            <TableCell className="py-3 text-sm text-gray-600">{isActivity ? name : ""}</TableCell>
            <TableCell className="font-medium text-sm text-gray-600">{budget > 0 ? budget.toLocaleString() : ""}</TableCell>
          </TableRow>
          {renderWbsRows(item.children || [], level + 1)}
        </React.Fragment>
      );
    });
  };

  return (
    <div className="flex flex-col h-full bg-gray-50 relative pb-20">
      {/* Top Navigation Row */}
      <div className="flex items-center justify-between px-6 py-4 bg-white border-b border-gray-100 shadow-sm">
        <div className="flex items-center">
          <Link href="/project-costing">
            <Button variant="ghost" size="icon" className="mr-2">
              <ArrowLeft className="h-5 w-5 text-gray-500" />
            </Button>
          </Link>
          <h1 className="text-lg font-medium text-gray-800">{project.name}</h1>
        </div>
      </div>

      <div className="p-6 max-w-[1400px] mx-auto w-full flex flex-col gap-6 overflow-y-auto">
        
        {/* Project Header Info */}
        <div className="flex justify-between items-start">
          <div>
            <h2 className="text-xl font-bold text-gray-800">{project.name}</h2>
            <div className="text-sm text-gray-500 mt-1">{project.project_code || "N/A"}</div>
            <div className="text-sm text-gray-800 mt-2">
              <span className="font-semibold text-gray-600">Client Name:</span> {project.client_name || "N/A"} <span className="mx-2">|</span> <span className="font-semibold text-gray-600">Date:</span> {project.start_date || "N/A"} - {project.expected_end_date || "N/A"}
            </div>
          </div>
          <div className="flex flex-col items-end gap-3">
            <Badge variant={getStatusVariant(project.status) as any} className="px-4 py-1 text-sm">
              {project.status || "DRAFT"}
            </Badge>
            <Button onClick={() => setIsBudgetAdjustmentModalOpen(true)} className="bg-[#3B7CED] hover:bg-[#3065c3] text-white h-8 text-xs">
              <Plus className="h-4 w-4 mr-1" /> Add Budget Adjustment
            </Button>
          </div>
        </div>

        {/* Filters */}
        <div className="flex items-end gap-6 bg-white p-4 rounded shadow-sm">
          <div className="flex gap-4 items-center">
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-gray-600">Date Range</label>
              <div className="flex gap-2">
                <Input placeholder="From" className="w-32" />
                <Input placeholder="To" className="w-32" />
              </div>
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-gray-600">WBS Elements</label>
              <Select>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="All" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="phase1">Phase 1</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="ml-auto">
            <Button variant="ghost" className="text-gray-500 hover:text-gray-800 flex items-center gap-2">
              Refresh <RefreshCw className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Left Column (2/3 width) */}
          <div className="col-span-1 lg:col-span-2 flex flex-col gap-6">
            
            {/* KPI Cards */}
            <div className="grid grid-cols-2 md:grid-cols-5 bg-white rounded shadow-sm border border-gray-100">
              <div className="p-4 border-r border-gray-100">
                <div className="text-xs text-gray-500 font-medium mb-1">Budget</div>
                <div className="text-lg font-semibold text-gray-800">N{budgetNum.toLocaleString()}</div>
              </div>
              <div className="p-4 border-r border-gray-100">
                <div className="text-xs text-gray-500 font-medium mb-1">Actual Spend</div>
                <div className="text-lg font-semibold text-gray-800">N{actualSpend.toLocaleString()}</div>
              </div>
              <div className="p-4 border-r border-gray-100">
                <div className="text-xs text-gray-500 font-medium mb-1">Committed</div>
                <div className="text-lg font-semibold text-gray-800">N{committed.toLocaleString()}</div>
              </div>
              <div className="p-4 border-r border-gray-100">
                <div className="text-xs text-gray-500 font-medium mb-1">Remaining</div>
                <div className="text-lg font-semibold text-gray-800">N{remaining.toLocaleString()}</div>
              </div>
              <div className="p-4">
                <div className="text-xs text-gray-500 font-medium mb-1">Variance</div>
                <div className="text-lg font-semibold text-gray-800">{variance}</div>
              </div>
            </div>

            {/* Line Chart */}
            <div className="bg-white p-6 rounded shadow-sm border border-gray-100">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-medium text-[#3B7CED]">Spend Over Time vs Budget Curve</h3>
                <div className="flex gap-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" checked={showActual} onChange={() => setShowActual(!showActual)} className="w-4 h-4 rounded border-gray-300 text-[#3B7CED] focus:ring-[#3B7CED] accent-[#3B7CED] cursor-pointer" />
                    <span className="text-sm text-gray-600">Actual Spend</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" checked={showPlanned} onChange={() => setShowPlanned(!showPlanned)} className="w-4 h-4 rounded border-gray-300 text-[#3B7CED] focus:ring-[#3B7CED] accent-[#3B7CED] cursor-pointer" />
                    <span className="text-sm text-gray-600">Planned Spend</span>
                  </label>
                </div>
              </div>
              <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={dynamicLineChartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#6B7280', fontSize: 12}} dy={10} />
                    <YAxis axisLine={false} tickLine={false} tick={{fill: '#6B7280', fontSize: 12}} tickFormatter={(val) => val === 0 ? "N0" : `N${val/1000}k`} />
                    <Tooltip cursor={{stroke: '#E5E7EB', strokeWidth: 1}} contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}} />
                    {showActual && <Line type="monotone" dataKey="actual" stroke="#2BA24D" strokeWidth={2} dot={false} activeDot={{ r: 6 }} />}
                    {showPlanned && <Line type="monotone" dataKey="planned" stroke="#3B7CED" strokeWidth={2} dot={false} strokeDasharray="5 5" />}
                  </LineChart>
                </ResponsiveContainer>
                {/* Fallback for empty data */}
                {dynamicLineChartData.length === 0 && (
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <p className="text-gray-400 text-sm">No spend data available</p>
                  </div>
                )}
              </div>
            </div>

            {/* WBS Table */}
            <div className="bg-white rounded shadow-sm border border-gray-100 overflow-hidden">
              <div className="flex justify-between items-center p-4 border-b border-gray-100">
                <h3 className="text-lg font-medium text-[#3B7CED]">Work Breakdown Structure (WBS)</h3>
                <Link href={`/project-costing/${project.id}/wbs`}>
                  <Button variant="outline" size="sm" className="text-xs">View Full WBS</Button>
                </Link>
              </div>
              <Table>
                <TableHeader className="bg-gray-50 border-b border-gray-200">
                  <TableRow className="hover:bg-gray-50 border-0">
                    <TableHead className="w-[50%] font-medium text-gray-500 py-3">WBS Elements</TableHead>
                    <TableHead className="w-[30%] font-medium text-gray-500 py-3">Activities</TableHead>
                    <TableHead className="w-[20%] font-medium text-gray-500 py-3">Budget</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {parsedWbs && parsedWbs.length > 0 ? (
                    renderWbsRows(parsedWbs)
                  ) : (
                    <TableRow>
                      <TableCell colSpan={3} className="text-center py-6 text-gray-500">
                        No WBS data available for this project.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
              <div className="flex items-center justify-end p-4 bg-gray-50 border-t border-gray-200">
                <div className="text-gray-600 text-sm">
                  Total Project Budget: <span className="text-xl font-semibold text-gray-800 ml-2">{budgetNum.toLocaleString()}</span>
                </div>
              </div>
            </div>

            {/* Recent Transactions */}
            <div className="bg-white rounded shadow-sm border border-gray-100 overflow-hidden">
              <div className="flex justify-between items-center p-4 border-b border-gray-100">
                <h3 className="text-lg font-medium text-[#3B7CED]">Recent transactions</h3>
                <Link href={`/project-costing/${project.id}/transactions`}>
                  <Button variant="outline" size="sm" className="text-xs">View All</Button>
                </Link>
              </div>
              <Table>
                <TableHeader>
                  <TableRow className="bg-gray-50 border-b-gray-100">
                    <TableHead className="font-medium text-gray-500">Date</TableHead>
                    <TableHead className="font-medium text-gray-500">Description</TableHead>
                    <TableHead className="font-medium text-gray-500">Category</TableHead>
                    <TableHead className="font-medium text-gray-500">Cost Category</TableHead>
                    <TableHead className="font-medium text-gray-500">Amount</TableHead>
                    <TableHead className="font-medium text-gray-500">Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-6 text-gray-500">
                      No transactions available for this project.
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </div>

          </div>

          {/* Right Column (1/3 width) */}
          <div className="col-span-1 flex flex-col gap-6">
            
            {/* Budget Utilization */}
            <div className="bg-white p-6 rounded shadow-sm border border-gray-100">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium text-[#3B7CED]">Budget Utilization</h3>
              </div>
              <div className="flex items-center gap-2 mb-6">
                <span className="text-sm text-gray-500">Budget Health:</span>
                {finPercent > 0.8 ? (
                  <Badge className="bg-orange-100 text-orange-600 border-transparent hover:bg-orange-100 text-xs py-0.5">At Risk</Badge>
                ) : (
                  <Badge className="bg-green-100 text-green-600 border-transparent hover:bg-green-100 text-xs py-0.5">On Track</Badge>
                )}
              </div>

              <div className="text-right text-xs text-gray-500 mb-2">{actualSpend.toLocaleString()} / {budgetNum.toLocaleString()}({(finPercent * 100).toFixed(1)}%)</div>
              
              {/* Stacked Progress Bar */}
              <div className="w-full h-8 flex rounded overflow-hidden mb-6">
                <div className="bg-[#3B7CED] h-full" style={{ width: `${actualPercent * 100}%` }}></div>
                <div className="bg-[#7BA8F5] h-full" style={{ width: `${committedPercent * 100}%` }}></div>
                <div className="bg-[#E5E7EB] h-full" style={{ width: `${availablePercent * 100}%` }}></div>
              </div>

              {/* Progress Bar Legend */}
              <div className="flex gap-4 text-xs">
                <div className="flex items-center gap-1.5 text-gray-600">
                  <div className="w-3 h-3 rounded bg-[#3B7CED]"></div>
                  Actual ({(actualPercent * 100).toFixed(1)}%)
                </div>
                <div className="flex items-center gap-1.5 text-gray-600">
                  <div className="w-3 h-3 rounded bg-[#7BA8F5]"></div>
                  Committed ({(committedPercent * 100).toFixed(1)}%)
                </div>
                <div className="flex items-center gap-1.5 text-gray-600">
                  <div className="w-3 h-3 rounded bg-[#E5E7EB]"></div>
                  Available ({(availablePercent * 100).toFixed(1)}%)
                </div>
              </div>
            </div>

            {/* Pending Requests */}
            <div className="bg-white p-6 rounded shadow-sm border border-gray-100">
              <h3 className="text-lg font-medium text-[#3B7CED] mb-6">Pending Requests</h3>
              <div className="flex flex-col gap-4">
                <div>
                  <div className="text-sm text-gray-500 mb-1">Awaiting Approval</div>
                  <div className="text-2xl font-bold text-gray-800">{project?.pending_requests_count || 0}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-500 mb-1">Total Value</div>
                  <div className="text-2xl font-bold text-gray-800">N{(project?.pending_requests_value || 0).toLocaleString()}</div>
                </div>
              </div>
            </div>

            {/* Spend by Category */}
            <div className="bg-white p-6 rounded shadow-sm border border-gray-100">
              <h3 className="text-lg font-medium text-[#3B7CED] mb-6">Spend by category</h3>
              <div className="flex items-center justify-center relative">
                <div className="w-48 h-48">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={[]}
                        cx="50%"
                        cy="50%"
                        innerRadius={0}
                        outerRadius={80}
                        paddingAngle={0}
                        dataKey="value"
                        stroke="none"
                      >
                      </Pie>
                    </PieChart>
                  </ResponsiveContainer>
                  {/* Fallback for empty data */}
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <p className="text-gray-400 text-sm">No data</p>
                  </div>
                </div>
                <div className="flex flex-col gap-3 ml-4">
                  {/* Legends removed as there is no data */}
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* Footer sticky bar */}
      <div className="absolute bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 flex justify-end gap-4 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
        <Button variant="outline" className="border-blue-400 text-blue-500 hover:bg-blue-50">
          Cancel
        </Button>
        <Button className="bg-[#3B7CED] hover:bg-[#3065c3] text-white">
          Save
        </Button>
      </div>

      <AddBudgetAdjustmentModal 
        isOpen={isBudgetAdjustmentModalOpen}
        onClose={() => setIsBudgetAdjustmentModalOpen(false)}
        project={project}
      />
    </div>
  );
}
