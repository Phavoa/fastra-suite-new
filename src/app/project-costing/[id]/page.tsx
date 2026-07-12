"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { StatusModal, useStatusModal } from "@/components/shared/StatusModal";
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
import { ArrowLeft, RefreshCw, Plus, ChevronDown, CheckCircle2 } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { 
  useGetProjectCostingProjectQuery,
  useApproveProjectMutation,
  useRejectProjectMutation,
  useSubmitProjectMutation,
  useGetBudgetAdjustmentsQuery,
  useApproveBudgetAdjustmentMutation,
  useGetProjectTransactionsQuery
} from "@/api/projectCostingApi";
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
  const [activeTab, setActiveTab] = useState("phases");
  const [isAdjExpanded, setIsAdjExpanded] = useState(true);

  // Filter States
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [costCategoryFilter, setCostCategoryFilter] = useState("all");

  const { data: project, isLoading, error, refetch } = useGetProjectCostingProjectQuery(
    Number(id),
    { skip: !id }
  );

  const { data: budgetAdjustments, isLoading: isLoadingAdjustments } = useGetBudgetAdjustmentsQuery(
    Number(id),
    { skip: !id }
  );

  const { data: transactions, isLoading: isLoadingTransactions } = useGetProjectTransactionsQuery(
    Number(id),
    { skip: !id }
  );

  const statusModal = useStatusModal();

  const [approveProject, { isLoading: isApproving }] = useApproveProjectMutation();
  const [rejectProject, { isLoading: isRejecting }] = useRejectProjectMutation();
  const [submitProject, { isLoading: isSubmitting }] = useSubmitProjectMutation();
  const [approveBudgetAdjustment, { isLoading: isApprovingAdjustment }] = useApproveBudgetAdjustmentMutation();

  const handleAction = async (actionFn: any, actionName: string) => {
    try {
      await actionFn({ id: Number(id), body: { project_code: project?.project_code } }).unwrap();
      statusModal.showSuccess(
        "Action Successful",
        `Project ${actionName} successfully.`
      );
      refetch();
    } catch (err) {
      console.error(`Failed to ${actionName} project`, err);
      statusModal.showError(
        "Action Failed",
        `Failed to ${actionName} project.`
      );
    }
  };

  const handleApproveAdjustment = async (adj: any) => {
    try {
      await approveBudgetAdjustment({ 
        id: Number(id), 
        adjustment_id: adj.uuid,
        body: { 
          id: adj.id || adj.uuid,
          uuid: adj.uuid,
          adjustment_id: adj.id || adj.uuid,
          budget_adjustment_id: adj.id || adj.uuid,
          budget_adjustment: adj.id || adj.uuid,
          reference_no: adj.reference_no 
        } 
      }).unwrap();
      statusModal.showSuccess(
        "Action Successful",
        `Budget adjustment ${adj.reference_no || ''} approved successfully.`
      );
      refetch();
    } catch (err) {
      console.error("Failed to approve budget adjustment", err);
      statusModal.showError(
        "Action Failed",
        "Failed to approve budget adjustment."
      );
    }
  };

  const pendingAdjsList = budgetAdjustments?.filter((a: any) => ["PENDING", "PENDING_APPROVAL", "DRAFT"].includes(a.status?.toUpperCase())) || [];
  const pendingAdjsTotal = pendingAdjsList.reduce((acc: number, a: any) => acc + Number(a.total_adjustment || a.amount || 0), 0);
  
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
  let budgetNum = 0;
  let parsedPhases: any[] = [];

  if (project?.phases) {
    try {
      parsedPhases = typeof project.phases === "string" ? JSON.parse(project.phases) : project.phases;
    } catch (e) {
      console.error("Failed to parse phases", e);
    }
  }

  if (project?.financials) {
    try {
      fin = typeof project.financials === "string" ? JSON.parse(project.financials) : project.financials;
      
      if (costCategoryFilter !== "all") {
         // Filter Actual Spend by Category
         if (fin?.category_breakdown) {
            const cat = fin.category_breakdown.find((c: any) => 
               c.request_type.toLowerCase() === costCategoryFilter.toLowerCase() || 
               c.request_type.toLowerCase().replace("_", "") === costCategoryFilter.toLowerCase().replace("_", "")
            );
            actualSpend = cat ? Number(cat.amount) : 0;
            committed = 0; // Committed is generally an aggregate right now
         }

         // Filter Budget by Category (traverse phases)
         let filteredBudget = 0;
         const sumCategoryBudget = (phases: any[]) => {
           for (const phase of phases) {
              if (phase.activities) {
                 for (const act of phase.activities) {
                    if (act.cost_category && act.cost_category.toLowerCase() === costCategoryFilter.toLowerCase()) {
                       filteredBudget += Number(act.amount || 0);
                    }
                 }
              }
           }
         };
         sumCategoryBudget(parsedPhases);
         budgetNum = filteredBudget;
      } else {
        // All Categories
        actualSpend = Number(fin.actual || fin.spent || 0);
        committed = Number(fin.committed || 0);
        budgetNum = Number(fin.budget || 0);
      }
    } catch (e) {
      console.error("Failed to parse financials", e);
    }
  } else {
    if (parsedPhases.length > 0) {
      budgetNum = parsedPhases.reduce((acc, phase) => {
        return acc + (phase.activities || []).reduce((sum: number, act: any) => sum + Number(act.amount || 0), 0);
      }, 0);
    }
  }

  remaining = budgetNum - actualSpend - committed;
  variance = budgetNum > 0 ? `${((actualSpend / budgetNum) * 100).toFixed(1)}%` : "0%";

  const finPercent = budgetNum > 0 ? actualSpend / budgetNum : 0;
  const actualPercent = budgetNum > 0 ? actualSpend / budgetNum : 0;
  const committedPercent = budgetNum > 0 ? committed / budgetNum : 0;
  const availablePercent = budgetNum > 0 ? remaining / budgetNum : 1;

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

  const renderPhaseRows = (phases: any[]): React.ReactNode => {
    if (!phases || !Array.isArray(phases)) return null;
    return phases.flatMap((phase, pIndex) => {
      const phaseName = phase.name || `Phase ${pIndex + 1}`;
      let phaseBudget = 0;
      
      if (phase.activities && Array.isArray(phase.activities)) {
        phaseBudget = phase.activities.reduce((sum: number, act: any) => sum + Number(act.amount || 0), 0);
      }

      const rows = [
        <TableRow key={`phase-${phase.id || pIndex}`} className="bg-[#EEF2FB] hover:bg-[#EEF2FB] border-b border-white">
          <TableCell className="py-3 text-sm font-medium pl-4">{phaseName}</TableCell>
          <TableCell className="py-3 text-sm text-gray-600"></TableCell>
          <TableCell className="py-3 text-sm text-gray-600"></TableCell>
          <TableCell className="py-3 text-sm text-gray-600"></TableCell>
          <TableCell className="font-medium text-sm text-gray-600">{phaseBudget > 0 ? phaseBudget.toLocaleString() : ""}</TableCell>
        </TableRow>
      ];

      if (phase.activities && Array.isArray(phase.activities)) {
        phase.activities.forEach((act: any, aIndex: number) => {
          const actName = act.name || `Activity ${aIndex + 1}`;
          const actBudget = Number(act.amount || 0);
          const quantity = Number(act.quantity || 1);
          const rate = Number(act.rate || (actBudget / quantity) || 0);

          rows.push(
            <TableRow key={`act-${phase.id || pIndex}-${act.id || aIndex}`} className="border-b border-gray-100 hover:bg-transparent">
              <TableCell className="py-3 text-sm font-medium relative pl-10">
                <div className="absolute left-6 top-0 bottom-1/2 w-px bg-gray-300"></div>
                <div className="absolute left-6 top-1/2 w-4 h-px bg-gray-300"></div>
              </TableCell>
              <TableCell className="py-3 text-sm text-gray-600">{actName}</TableCell>
              <TableCell className="py-3 text-sm text-gray-600">{quantity}</TableCell>
              <TableCell className="py-3 text-sm text-gray-600">{rate.toLocaleString()}</TableCell>
              <TableCell className="font-medium text-sm text-gray-600">{actBudget > 0 ? actBudget.toLocaleString() : ""}</TableCell>
            </TableRow>
          );
        });
      }

      return rows;
    });
  };

  // Set up PieChart data
  let pieChartData: any[] = [];
  if (fin?.category_breakdown && Array.isArray(fin.category_breakdown)) {
    const COLORS = ["#3B7CED", "#2BA24D", "#F59E0B", "#EF4444", "#8B5CF6", "#EC4899"];
    pieChartData = fin.category_breakdown
      .filter((cat: any) => Number(cat.amount || 0) > 0)
      .map((cat: any, index: number) => ({
        name: cat.request_type.replace(/_/g, ' '),
        value: Number(cat.amount),
        color: COLORS[index % COLORS.length]
      }));
  }

  return (
    <div className="flex flex-col h-full bg-gray-50 relative pb-20">
      {/* Top Navigation Row */}
      <div className="flex items-center px-6 py-4">
        <Link href="/project-costing" className="flex items-center text-sm text-gray-500 hover:text-gray-900 font-medium">
          <ArrowLeft className="h-4 w-4 mr-2" />
          {project.name}
        </Link>
      </div>

      <div className="px-6 max-w-[1400px] mx-auto w-full flex flex-col gap-6 overflow-y-auto">
        
        {/* Project Header Info */}
        <div className="flex justify-between items-start">
          <div>
            <div className="flex items-center gap-4">
              <h2 className="text-2xl font-bold text-gray-800">{project.name}</h2>
              {project.status === "ACTIVE" ? (
                <Badge className="bg-green-100 text-green-700 hover:bg-green-100 px-3 py-0.5 border-0 font-medium text-xs">Active</Badge>
              ) : (
                <Badge variant={getStatusVariant(project.status) as any} className="px-3 py-0.5 font-medium border-0 text-xs">{project.status || "DRAFT"}</Badge>
              )}
            </div>
            <div className="text-sm text-gray-500 mt-2">{project.project_code || "N/A"}</div>
            <div className="text-sm text-gray-800 mt-1">
              <span className="font-semibold text-gray-600">Project Manager:</span> John Doe <span className="mx-2"> </span> <span className="font-semibold text-gray-600">Date:</span> {project.start_date || "N/A"} - {project.expected_end_date || "N/A"}
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            {(!project.status || project.status === "DRAFT") && (
              <Button 
                onClick={() => handleAction(submitProject, "submitted")}
                disabled={isSubmitting}
                className="bg-[#3B7CED] hover:bg-[#3065c3] text-white"
              >
                {isSubmitting ? "Submitting..." : "Submit Project"}
              </Button>
            )}
            
            {(project.status === "PENDING" || project.status === "PENDING_APPROVAL") && (
              <>
                <Button 
                  onClick={() => handleAction(rejectProject, "rejected")}
                  disabled={isRejecting || isApproving}
                  variant="outline"
                  className="border-red-500 text-red-500 hover:bg-red-50"
                >
                  {isRejecting ? "Rejecting..." : "Reject"}
                </Button>
                <Button 
                  onClick={() => handleAction(approveProject, "approved")}
                  disabled={isApproving || isRejecting}
                  className="bg-[#2BA24D] hover:bg-[#22853d] text-white"
                >
                  {isApproving ? "Approving..." : "Approve"}
                </Button>
              </>
            )}
          </div>
        </div>

        {/* Filters and Actions */}
        <div className="flex items-end justify-between py-2 border-b border-gray-100 pb-6">
          <div className="flex gap-8 items-center">
            <div className="flex flex-col gap-2">
              <label className="text-sm font-semibold text-gray-700">Date Range</label>
              <div className="flex gap-2">
                <Input type="date" placeholder="From" className="w-36 h-9" value={fromDate} onChange={(e) => setFromDate(e.target.value)} />
                <Input type="date" placeholder="To" className="w-36 h-9" value={toDate} onChange={(e) => setToDate(e.target.value)} />
              </div>
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-sm font-semibold text-gray-700">Cost Category</label>
              <Select value={costCategoryFilter} onValueChange={setCostCategoryFilter}>
                <SelectTrigger className="w-56 h-9 text-gray-600">
                  <SelectValue placeholder="All Categories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  <SelectItem value="labour">Labour</SelectItem>
                  <SelectItem value="material_consumption">Material Consumption</SelectItem>
                  <SelectItem value="plant_equipment">Plant Equipment</SelectItem>
                  <SelectItem value="sub_contractor">Sub Contractor</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div>
            <Button onClick={() => setIsBudgetAdjustmentModalOpen(true)} variant="outline" className="border-[#3B7CED] text-[#3B7CED] hover:bg-blue-50 hover:text-[#3B7CED] h-9 font-medium px-6">
              Create Budget Adjustment
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
            <div className="bg-white p-6 rounded shadow-sm border border-gray-100 flex-1 flex flex-col">
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
              <div className="flex-1 w-full min-h-[300px]">
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
                  <div className="text-2xl font-bold text-gray-800">{pendingAdjsList.length}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-500 mb-1">Total Value</div>
                  <div className="text-2xl font-bold text-gray-800">N{pendingAdjsTotal.toLocaleString()}</div>
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
                        data={pieChartData}
                        cx="50%"
                        cy="50%"
                        innerRadius={0}
                        outerRadius={80}
                        paddingAngle={0}
                        dataKey="value"
                        stroke="none"
                      >
                        {pieChartData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                    </PieChart>
                  </ResponsiveContainer>
                  {/* Fallback for empty data */}
                  {pieChartData.length === 0 && (
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                      <p className="text-gray-400 text-sm">No data</p>
                    </div>
                  )}
                </div>
                {pieChartData.length > 0 && (
                  <div className="flex flex-col gap-3 ml-4">
                    {pieChartData.map((entry, index) => (
                      <div key={index} className="flex items-center gap-2 text-sm text-gray-600 capitalize">
                        <div className="w-3 h-3 rounded" style={{ backgroundColor: entry.color }}></div>
                        {entry.name} ({actualSpend > 0 ? ((entry.value / actualSpend) * 100).toFixed(1) : 0}%)
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

          </div>
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-6 border-b border-gray-200 mt-4">
          <button 
            className={`pb-3 text-sm font-medium ${activeTab === 'phases' ? 'text-[#3B7CED] border-b-2 border-[#3B7CED]' : 'text-gray-500 hover:text-gray-700'}`}
            onClick={() => setActiveTab('phases')}
          >
            Phases & Activities
          </button>
          <button 
            className={`pb-3 text-sm font-medium ${activeTab === 'adjustments' ? 'text-[#3B7CED] border-b-2 border-[#3B7CED]' : 'text-gray-500 hover:text-gray-700'}`}
            onClick={() => setActiveTab('adjustments')}
          >
            Budget Adjustments
          </button>
        </div>

        {/* Tabs Content */}
        {activeTab === 'phases' && (
          <div className="bg-white rounded shadow-sm border border-gray-100 overflow-hidden mb-12">
            <div className="flex justify-between items-center p-4 border-b border-gray-100">
              <h3 className="text-lg font-medium text-[#3B7CED]">Project Phases & Activities</h3>
              <Link href={`/project-costing/${project.id}/phases`}>
                <Button variant="outline" size="sm" className="text-xs">See more</Button>
              </Link>
            </div>
            <Table>
              <TableHeader className="bg-gray-50 border-b border-gray-200">
                <TableRow className="hover:bg-gray-50 border-0">
                  <TableHead className="w-[40%] font-medium text-gray-500 py-3">Phase</TableHead>
                  <TableHead className="w-[20%] font-medium text-gray-500 py-3">Activities</TableHead>
                  <TableHead className="w-[10%] font-medium text-gray-500 py-3">Qty</TableHead>
                  <TableHead className="w-[15%] font-medium text-gray-500 py-3">Rate</TableHead>
                  <TableHead className="w-[15%] font-medium text-gray-500 py-3">Budget</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {parsedPhases && parsedPhases.length > 0 ? (
                  renderPhaseRows(parsedPhases)
                ) : (
                  <TableRow>
                    <TableCell colSpan={3} className="text-center py-6 text-gray-500">
                      No phases data available for this project.
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
        )}

        {activeTab === 'adjustments' && (
          <div className="flex flex-col gap-6 mb-12">
            
            {/* Original Budget Box */}
            <div className="border border-gray-200 rounded-lg p-6 bg-white shadow-sm mb-2">
              <div className="text-sm font-medium text-gray-800 mb-2">Original Approved Budget</div>
              <div className="text-3xl font-normal text-[#3B7CED]">N{budgetNum.toLocaleString()}</div>
            </div>

            {/* Pending Approval Section */}
            <div>
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-[#3B7CED] font-medium text-base">Pending Approval</h3>
                <span className="text-xs text-[#3B7CED] cursor-pointer hover:underline">See more</span>
              </div>

              {isLoadingAdjustments ? (
                <div className="border border-gray-200 rounded-lg bg-white shadow-sm p-6 text-center text-gray-500">
                  <p>Loading adjustments...</p>
                </div>
              ) : budgetAdjustments && budgetAdjustments.filter((a: any) => ["PENDING", "PENDING_APPROVAL", "DRAFT"].includes(a.status?.toUpperCase())).length > 0 ? (
                <div className="flex flex-col gap-6">
                  {budgetAdjustments
                    .filter((a: any) => ["PENDING", "PENDING_APPROVAL", "DRAFT"].includes(a.status?.toUpperCase()))
                    .map((adj: any, i: number) => {
                      const totalAdj = Number(adj.total_adjustment || adj.amount || 0);
                      const lines = adj.lines && adj.lines.length > 0 ? adj.lines : [
                        {
                          adjustment_type: "NEW",
                          activity_name: adj.reason || "Planning Phase Activity",
                          reason: "Budget line adjustment",
                          adjustment_amount: totalAdj
                        }
                      ];
                      
                      return (
                        <div key={i} className="border border-gray-200 rounded-lg bg-white shadow-sm overflow-hidden">
                          {/* Top Header */}
                          <div className="p-6 border-b border-gray-100 flex justify-between items-start">
                            <div>
                              <div className="text-base font-semibold text-gray-800">
                                Adjustment {adj.reference_no || `ADJ-00${i + 1}`}
                              </div>
                              <div className="text-xs text-gray-400 mt-1">
                                Submitted by {adj.requested_by_name || "John Doe"} on {adj.created_at ? new Date(adj.created_at).toLocaleDateString() : "5/20/2026"}
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="text-xs text-gray-500 mb-0.5">Total Adjustment</div>
                              <div className={`text-xl font-bold ${totalAdj >= 0 ? "text-green-600" : "text-red-500"}`}>
                                {totalAdj >= 0 ? "+" : ""}N{totalAdj.toLocaleString()}
                              </div>
                            </div>
                          </div>

                          {/* Line Items Section */}
                          <div className="p-6 border-b border-gray-100">
                            <div 
                              className="flex justify-between items-center cursor-pointer mb-4"
                              onClick={() => setIsAdjExpanded(!isAdjExpanded)}
                            >
                              <span className="text-sm font-medium text-gray-700">{lines.length} Adjustment Line Item{lines.length > 1 ? "s" : ""}</span>
                              <ChevronDown className={`w-4 h-4 text-gray-400 transform transition-transform ${isAdjExpanded ? "rotate-180" : ""}`} />
                            </div>
                            
                            {isAdjExpanded && (
                              <div className="flex flex-col gap-3">
                                {lines.map((line: any, idx: number) => {
                                  const lineAmt = Number(line.adjustment_amount || line.amount || totalAdj);
                                  return (
                                    <div key={idx} className="border border-gray-200 rounded-lg p-4 bg-white">
                                      <div className="flex justify-between items-center mb-2">
                                        <div className="flex items-center gap-2.5">
                                          <span className="text-sm font-semibold text-gray-800">Planning Phase</span>
                                          <Badge variant="outline" className="text-[11px] font-normal text-gray-500 border-gray-200 px-2.5 py-0.5 rounded-full">
                                            {line.adjustment_type === "NEW" ? "New Activity" : "Existing Activity"}
                                          </Badge>
                                        </div>
                                      </div>
                                      <div className="flex justify-between items-end mt-2">
                                        <span className="text-xs text-gray-500">
                                          {line.activity_name || "LAB-001"} {line.reason ? `• ${line.reason}` : ""}
                                        </span>
                                        <span className={`text-sm font-bold ${lineAmt >= 0 ? "text-green-600" : "text-red-500"}`}>
                                          {lineAmt >= 0 ? "+" : ""}N{lineAmt.toLocaleString()}
                                        </span>
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                            )}
                          </div>

                          {/* Summary Calculation Section */}
                          <div className="p-6 border-b border-gray-100 bg-gray-50/40 text-xs text-gray-600 flex flex-col gap-3">
                            <div className="flex justify-between items-center">
                              <span>Original Budget:</span>
                              <span className="font-semibold text-gray-800">N{budgetNum.toLocaleString()}.00</span>
                            </div>
                            <div className="flex justify-between items-center">
                              <span>Proposed Budget Change:</span>
                              <span className="font-semibold text-gray-800">N{totalAdj.toLocaleString()}.00</span>
                            </div>
                            <div className="flex justify-between items-center pt-2 border-t border-gray-200 text-sm font-bold text-[#3B7CED]">
                              <span>Proposed Total Budget:</span>
                              <span>N{(budgetNum + totalAdj).toLocaleString()}.00</span>
                            </div>
                          </div>

                          {/* Action Buttons Section */}
                          <div className="p-4 bg-white flex gap-4">
                            <Button
                              variant="destructive"
                              className="flex-1 bg-[#EF4444] hover:bg-red-600 text-white font-medium h-11 rounded-md"
                              disabled={isRejecting}
                            >
                              Reject
                            </Button>
                            <Button
                              className="flex-1 bg-[#10B981] hover:bg-emerald-600 text-white font-medium h-11 rounded-md"
                              onClick={() => handleApproveAdjustment(adj)}
                              disabled={isApprovingAdjustment}
                            >
                              Approve
                            </Button>
                          </div>
                        </div>
                      );
                    })}
                </div>
              ) : (
                <div className="border border-gray-200 rounded-lg bg-white shadow-sm p-6 text-center text-gray-500">
                  <p>No pending adjustments available.</p>
                </div>
              )}
            </div>

            {/* Completed Adjustment Section */}
            <div className="mt-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-[#3B7CED] font-medium text-base">Completed Adjustment</h3>
                <span className="text-xs text-[#3B7CED] cursor-pointer hover:underline">See more</span>
              </div>

              {isLoadingAdjustments ? (
                <div className="border border-gray-200 rounded-lg bg-white shadow-sm p-6 text-center text-gray-500">
                  <p>Loading adjustments...</p>
                </div>
              ) : budgetAdjustments && budgetAdjustments.filter((a: any) => ["APPROVED", "COMPLETED"].includes(a.status?.toUpperCase())).length > 0 ? (
                <div className="flex flex-col gap-6">
                  {budgetAdjustments
                    .filter((a: any) => ["APPROVED", "COMPLETED"].includes(a.status?.toUpperCase()))
                    .map((adj: any, i: number) => {
                      const totalAdj = Number(adj.total_adjustment || adj.amount || 0);
                      const lines = adj.lines && adj.lines.length > 0 ? adj.lines : [
                        {
                          adjustment_type: "NEW",
                          activity_name: adj.reason || "Planning Phase Activity",
                          reason: "Budget line adjustment",
                          adjustment_amount: totalAdj
                        }
                      ];

                      return (
                        <div key={i} className="border border-gray-200 rounded-lg bg-white shadow-sm overflow-hidden">
                          {/* Top Header */}
                          <div className="p-6 border-b border-gray-100 flex justify-between items-start">
                            <div className="flex items-center gap-3">
                              <div>
                                <div className="flex items-center gap-2">
                                  <span className="text-base font-semibold text-gray-800">
                                    Adjustment {adj.reference_no || `ADJ-00${i + 1}`}
                                  </span>
                                  <Badge className="bg-green-100 text-green-700 hover:bg-green-100 font-medium text-xs px-2.5 py-0.5 rounded-full border-0">
                                    Approved
                                  </Badge>
                                </div>
                                <div className="text-xs text-gray-400 mt-1">
                                  Submitted by {adj.requested_by_name || "John Doe"} on {adj.created_at ? new Date(adj.created_at).toLocaleDateString() : "5/20/2026"}
                                </div>
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="text-xs text-gray-500 mb-0.5">Total Adjustment</div>
                              <div className={`text-xl font-bold ${totalAdj >= 0 ? "text-green-600" : "text-red-500"}`}>
                                {totalAdj >= 0 ? "+" : ""}N{totalAdj.toLocaleString()}
                              </div>
                            </div>
                          </div>

                          {/* Line Items Section */}
                          <div className="p-6 border-b border-gray-100">
                            <div 
                              className="flex justify-between items-center cursor-pointer mb-4"
                              onClick={() => setIsAdjExpanded(!isAdjExpanded)}
                            >
                              <span className="text-sm font-medium text-gray-700">{lines.length} Adjustment Line Item{lines.length > 1 ? "s" : ""}</span>
                              <ChevronDown className={`w-4 h-4 text-gray-400 transform transition-transform ${isAdjExpanded ? "rotate-180" : ""}`} />
                            </div>
                            
                            {isAdjExpanded && (
                              <div className="flex flex-col gap-3">
                                {lines.map((line: any, idx: number) => {
                                  const lineAmt = Number(line.adjustment_amount || line.amount || totalAdj);
                                  return (
                                    <div key={idx} className="border border-gray-200 rounded-lg p-4 bg-white">
                                      <div className="flex justify-between items-center mb-2">
                                        <div className="flex items-center gap-2.5">
                                          <span className="text-sm font-semibold text-gray-800">Planning Phase</span>
                                          <Badge variant="outline" className="text-[11px] font-normal text-gray-500 border-gray-200 px-2.5 py-0.5 rounded-full">
                                            {line.adjustment_type === "NEW" ? "New Activity" : "Existing Activity"}
                                          </Badge>
                                        </div>
                                      </div>
                                      <div className="flex justify-between items-end mt-2">
                                        <span className="text-xs text-gray-500">
                                          {line.activity_name || "LAB-001"} {line.reason ? `• ${line.reason}` : ""}
                                        </span>
                                        <span className={`text-sm font-bold ${lineAmt >= 0 ? "text-green-600" : "text-red-500"}`}>
                                          {lineAmt >= 0 ? "+" : ""}N{lineAmt.toLocaleString()}
                                        </span>
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                            )}
                          </div>

                          {/* Summary Calculation Section */}
                          <div className="p-6 border-b border-gray-100 bg-gray-50/40 text-xs text-gray-600 flex flex-col gap-3">
                            <div className="flex justify-between items-center">
                              <span>Original Budget:</span>
                              <span className="font-semibold text-gray-800">N{budgetNum.toLocaleString()}.00</span>
                            </div>
                            <div className="flex justify-between items-center">
                              <span>Current Budget:</span>
                              <span className="font-semibold text-gray-800">N{(budgetNum + totalAdj).toLocaleString()}.00</span>
                            </div>
                            <div className="flex justify-between items-center pt-2 border-t border-gray-200 text-sm font-bold text-[#3B7CED]">
                              <span>New Calculated Budget:</span>
                              <span>N{(budgetNum + totalAdj).toLocaleString()}.00</span>
                            </div>
                          </div>

                          {/* Bottom Status Section */}
                          <div className="p-4 bg-white flex justify-center items-center gap-2 text-sm font-medium text-green-600">
                            <CheckCircle2 className="w-4 h-4 text-green-600" />
                            <span>Approved</span>
                          </div>
                        </div>
                      );
                    })}
                </div>
              ) : (
                <div className="border border-gray-200 rounded-lg bg-white shadow-sm p-6 text-center text-gray-500">
                  <p>No completed adjustments available.</p>
                </div>
              )}
            </div>

          </div>
        )}

        {/* Recent transactions */}
        <div className="bg-white rounded shadow-sm border border-gray-100 overflow-hidden mb-12">
          <div className="flex justify-between items-center p-4 border-b border-gray-100">
            <h3 className="text-lg font-medium text-[#3B7CED]">Recent transactions</h3>
            <Link href={`/project-costing/${project?.id || id}/transactions`}>
              <span className="text-xs text-[#3B7CED] cursor-pointer hover:underline">See more</span>
            </Link>
          </div>
          <Table>
            <TableHeader className="bg-gray-50 border-b border-gray-200">
              <TableRow className="hover:bg-gray-50 border-0">
                <TableHead className="font-medium text-gray-500 py-3">Date</TableHead>
                <TableHead className="font-medium text-gray-500 py-3">Description</TableHead>
                <TableHead className="font-medium text-gray-500 py-3">Category</TableHead>
                <TableHead className="font-medium text-gray-500 py-3">Cost Category</TableHead>
                <TableHead className="font-medium text-gray-500 py-3">Amount</TableHead>
                <TableHead className="font-medium text-gray-500 py-3">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoadingTransactions ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                    Loading recent transactions...
                  </TableCell>
                </TableRow>
              ) : transactions && transactions.length > 0 ? (
                transactions.slice(0, 6).map((tx: any, idx: number) => (
                  <TableRow key={idx} className="border-b border-gray-100 hover:bg-gray-50">
                    <TableCell className="py-3 text-sm text-gray-600">
                      {tx.date || tx.created_at ? new Date(tx.date || tx.created_at).toLocaleDateString() : "N/A"}
                    </TableCell>
                    <TableCell className="py-3 text-sm text-gray-800 font-medium">{tx.description || tx.name || tx.desc || "Transaction"}</TableCell>
                    <TableCell className="py-3 text-sm text-gray-600 capitalize">{tx.category || tx.type || "-"}</TableCell>
                    <TableCell className="py-3 text-sm text-gray-600 font-mono uppercase">{tx.cost_category || tx.cost_code || tx.costCat || "-"}</TableCell>
                    <TableCell className="py-3 text-sm text-gray-800 font-semibold">₦{Number(tx.amount || 0).toLocaleString()}</TableCell>
                    <TableCell className="py-3 text-sm">
                      <Badge className={`px-2 py-0.5 text-xs font-medium border-0 ${
                        (tx.status || 'approved').toLowerCase() === 'approved' || (tx.status || '').toLowerCase() === 'paid'
                          ? 'bg-green-100 text-green-700 hover:bg-green-100'
                          : (tx.status || '').toLowerCase() === 'cancelled'
                          ? 'bg-red-100 text-red-700 hover:bg-red-100'
                          : 'bg-blue-100 text-blue-700 hover:bg-blue-100'
                      }`}>
                        {tx.status || "Approved"}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                    No recent transactions recorded for this project yet.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
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
        onClose={() => {
          setIsBudgetAdjustmentModalOpen(false);
          refetch();
        }}
        project={project}
      />
      
      <StatusModal
        isOpen={statusModal.isOpen}
        onClose={statusModal.close}
        type={statusModal.type}
        title={statusModal.title}
        message={statusModal.message}
        actionText={statusModal.type === "success" ? "Done" : "Try again"}
      />
    </div>
  );
}
