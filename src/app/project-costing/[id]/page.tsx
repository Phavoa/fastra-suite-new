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
  useSubmitProjectMutation
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
  const [activeTab, setActiveTab] = useState("adjustments");
  const [isAdjExpanded, setIsAdjExpanded] = useState(true);

  // Filter States
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [costCategoryFilter, setCostCategoryFilter] = useState("all");

  const { data: project, isLoading, error, refetch } = useGetProjectCostingProjectQuery(
    Number(id),
    { skip: !id }
  );

  const statusModal = useStatusModal();

  const [approveProject, { isLoading: isApproving }] = useApproveProjectMutation();
  const [rejectProject, { isLoading: isRejecting }] = useRejectProjectMutation();
  const [submitProject, { isLoading: isSubmitting }] = useSubmitProjectMutation();

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
  let budgetNum = project?.total_budget ? Number(project.total_budget) : 0;
  let parsedWbs: any[] = [];

  if (project?.wbs) {
    try {
      parsedWbs = typeof project.wbs === "string" ? JSON.parse(project.wbs) : project.wbs;
    } catch (e) {
      console.error("Failed to parse WBS", e);
    }
  }

  if (project?.financials) {
    try {
      fin = typeof project.financials === "string" ? JSON.parse(project.financials) : project.financials;
      
      if (costCategoryFilter !== "all") {
         // Filter Actual Spend by Category
         if (fin?.summary?.category_breakdown) {
            const cat = fin.summary.category_breakdown.find((c: any) => 
               c.request_type.toLowerCase() === costCategoryFilter.toLowerCase() || 
               c.request_type.toLowerCase().replace("_", "") === costCategoryFilter.toLowerCase().replace("_", "")
            );
            actualSpend = cat ? cat.amount : 0;
            committed = 0; // Committed is generally an aggregate right now
         }

         // Filter Budget by Category (traverse WBS)
         let filteredBudget = 0;
         const sumCategoryBudget = (items: any[]) => {
           for (const item of items) {
              if (item.element_type === "ACTIVITY" && item.budget_lines) {
                 for (const line of item.budget_lines) {
                    if (line.cost_category && line.cost_category.toLowerCase() === costCategoryFilter.toLowerCase()) {
                       filteredBudget += Number(line.original_budget || line.amount || 0);
                    }
                 }
              }
              if (item.children) {
                 sumCategoryBudget(item.children);
              }
           }
         };
         sumCategoryBudget(parsedWbs);
         budgetNum = filteredBudget;
      } else {
        // All Categories
        if (fin?.summary) {
          actualSpend = fin.summary.actual || fin.summary.spent || 0;
          committed = fin.summary.committed || 0;
        }
      }
    } catch (e) {
      console.error("Failed to parse financials", e);
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

        {/* Tabs */}
        <div className="flex items-center gap-6 border-b border-gray-200 mt-4">
          <button 
            className={`pb-3 text-sm font-medium ${activeTab === 'wbs' ? 'text-[#3B7CED] border-b-2 border-[#3B7CED]' : 'text-gray-500 hover:text-gray-700'}`}
            onClick={() => setActiveTab('wbs')}
          >
            WBS Budget
          </button>
          <button 
            className={`pb-3 text-sm font-medium ${activeTab === 'adjustments' ? 'text-[#3B7CED] border-b-2 border-[#3B7CED]' : 'text-gray-500 hover:text-gray-700'}`}
            onClick={() => setActiveTab('adjustments')}
          >
            Budget Adjustments
          </button>
        </div>

        {/* Tabs Content */}
        {activeTab === 'wbs' && (
          <div className="bg-white rounded shadow-sm border border-gray-100 overflow-hidden mb-12">
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
        )}

        {activeTab === 'adjustments' && (
          <div className="flex flex-col gap-6 mb-12">
            
            {/* Original Budget Box */}
            <div className="border border-gray-200 rounded p-6 bg-white shadow-sm">
              <div className="text-sm font-semibold text-gray-800 mb-2">Original Approved Budget</div>
              <div className="text-3xl font-medium text-[#3B7CED]">N{budgetNum.toLocaleString()}</div>
            </div>

            {/* Pending Approval Section */}
            <div>
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-[#3B7CED] font-medium">Pending Approval</h3>
                <span className="text-xs text-[#3B7CED] cursor-pointer hover:underline">See more</span>
              </div>

              <div className="border border-gray-200 rounded bg-white shadow-sm p-6 text-center text-gray-500">
                <p>No pending adjustments available.</p>
              </div>
            </div>

            {/* Completed Adjustment Section */}
            <div className="mt-4">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-[#3B7CED] font-medium">Completed Adjustment</h3>
                <span className="text-xs text-[#3B7CED] cursor-pointer hover:underline">See more</span>
              </div>

              <div className="border border-gray-200 rounded bg-white shadow-sm p-6 text-center text-gray-500">
                <p>No completed adjustments available.</p>
              </div>
            </div>

          </div>
        )}
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
