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
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";

const lineChartData = [
  { name: "Jan", actual: 100000, planned: 120000 },
  { name: "Feb", actual: 150000, planned: 160000 },
  { name: "Mar", actual: 200000, planned: 190000 },
  { name: "Apr", actual: 230000, planned: 240000 },
  { name: "May", actual: 260000, planned: 270000 },
  { name: "Jun", actual: 300000, planned: 290000 },
  { name: "Jul", actual: 300000, planned: 300000 },
  { name: "Aug", actual: 300000, planned: 300000 },
  { name: "Sep", actual: 300000, planned: 300000 },
  { name: "Oct", actual: 300000, planned: 300000 },
];

const pieData = [
  { name: "Labor (20%)", value: 20, color: "#1D3B74" },
  { name: "Purchase (30%)", value: 30, color: "#3B7CED" },
  { name: "Petty cash (14%)", value: 14, color: "#7BA8F5" },
  { name: "Subcontractor (16%)", value: 16, color: "#2B529E" },
  { name: "Material (20%)", value: 20, color: "#A7C7FA" },
];

const transactions = [
  { id: 1, date: "05/15/2026", desc: "Building Project", category: "Labor", costCat: "LAB-001", amount: "N450,000", status: "Approved", statusVariant: "validated" },
  { id: 2, date: "05/15/2026", desc: "Building Project", category: "Sub contractor", costCat: "SUB-001", amount: "N450,000", status: "Paid", statusVariant: "draft" },
  { id: 3, date: "05/15/2026", desc: "Building Project", category: "Labor", costCat: "LAB-001", amount: "N450,000", status: "Cancelled", statusVariant: "canceled" },
  { id: 4, date: "05/15/2026", desc: "Building Project", category: "Labor", costCat: "LAB-001", amount: "N450,000", status: "Paid", statusVariant: "draft" },
  { id: 5, date: "05/15/2026", desc: "Building Project", category: "Labor", costCat: "LAB-001", amount: "N450,000", status: "Approved", statusVariant: "validated" },
];

export default function ProjectDashboardPage() {
  const [showActual, setShowActual] = useState(true);
  const [showPlanned, setShowPlanned] = useState(true);
  const [isBudgetAdjustmentModalOpen, setIsBudgetAdjustmentModalOpen] = useState(false);
  
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
          <h1 className="text-lg font-medium text-gray-800">Building Project</h1>
        </div>
      </div>

      <div className="p-6 max-w-[1400px] mx-auto w-full flex flex-col gap-6 overflow-y-auto">
        
        {/* Project Header Info */}
        <div className="flex justify-between items-start">
          <div>
            <h2 className="text-xl font-bold text-gray-800">Building project</h2>
            <div className="text-sm text-gray-500 mt-1">PC-10293</div>
            <div className="text-sm text-gray-800 mt-2">
              <span className="font-semibold text-gray-600">Project Manager:</span> John Doe <span className="mx-2">|</span> <span className="font-semibold text-gray-600">Date:</span> 4 Apr 2024 - 9 May 2024
            </div>
          </div>
          <div className="flex flex-col items-end gap-3">
            <Badge variant="validated" className="px-4 py-1 text-sm bg-green-100 text-green-700">Active</Badge>
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
                <div className="text-lg font-semibold text-gray-800">N5,000,000</div>
              </div>
              <div className="p-4 border-r border-gray-100">
                <div className="text-xs text-gray-500 font-medium mb-1">Actual Spend</div>
                <div className="text-lg font-semibold text-gray-800">N3,250,000</div>
              </div>
              <div className="p-4 border-r border-gray-100">
                <div className="text-xs text-gray-500 font-medium mb-1">Committed</div>
                <div className="text-lg font-semibold text-gray-800">N850,000</div>
              </div>
              <div className="p-4 border-r border-gray-100">
                <div className="text-xs text-gray-500 font-medium mb-1">Remaining</div>
                <div className="text-lg font-semibold text-gray-800">N900,000</div>
              </div>
              <div className="p-4">
                <div className="text-xs text-gray-500 font-medium mb-1">Variance</div>
                <div className="text-lg font-semibold text-gray-800">-12.5%</div>
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
                  <LineChart data={lineChartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#6B7280', fontSize: 12}} dy={10} />
                    <YAxis axisLine={false} tickLine={false} tick={{fill: '#6B7280', fontSize: 12}} tickFormatter={(val) => val === 0 ? "N0" : `N${val/1000}k`} />
                    <Tooltip cursor={{stroke: '#E5E7EB', strokeWidth: 1}} contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}} />
                    {showActual && <Line type="monotone" dataKey="actual" stroke="#2BA24D" strokeWidth={2} dot={false} activeDot={{ r: 6 }} />}
                    {showPlanned && <Line type="monotone" dataKey="planned" stroke="#3B7CED" strokeWidth={2} dot={false} strokeDasharray="5 5" />}
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* WBS Table */}
            <div className="bg-white rounded shadow-sm border border-gray-100 overflow-hidden">
              <div className="flex justify-between items-center p-4 border-b border-gray-100">
                <h3 className="text-lg font-medium text-[#3B7CED]">Work Breakdown Structure (WBS)</h3>
                <Link href="/project-costing/1/wbs">
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
                  <TableRow className="bg-[#EEF2FB] hover:bg-[#EEF2FB] border-b border-white">
                    <TableCell className="font-medium py-3 text-sm">Phase 1</TableCell>
                    <TableCell></TableCell>
                    <TableCell className="font-medium text-sm">3,000,000</TableCell>
                  </TableRow>
                  <TableRow className="border-b border-gray-100 hover:bg-transparent">
                    <TableCell className="border-l border-gray-400 ml-4 relative"><div className="absolute left-6 top-0 bottom-0 w-px bg-gray-300"></div></TableCell>
                    <TableCell className="py-3 text-sm text-gray-600">Activities 1</TableCell>
                    <TableCell className="py-3 text-sm text-gray-600">1,000,000</TableCell>
                  </TableRow>
                  <TableRow className="border-b border-gray-100 hover:bg-transparent">
                    <TableCell className="border-l border-gray-400 ml-4 relative"><div className="absolute left-6 top-0 bottom-0 w-px bg-gray-300"></div></TableCell>
                    <TableCell className="py-3 text-sm text-gray-600">Activities 2</TableCell>
                    <TableCell className="py-3 text-sm text-gray-600">1,000,000</TableCell>
                  </TableRow>
                  <TableRow className="bg-[#F4F7FC] hover:bg-[#F4F7FC] border-b border-white">
                    <TableCell className="py-3 pl-[3.2rem] text-sm font-medium relative">
                      <div className="absolute left-6 top-0 bottom-1/2 w-px bg-gray-300"></div>
                      <div className="absolute left-6 top-1/2 w-4 h-px bg-gray-300"></div>
                      Sub Phase 1
                    </TableCell>
                    <TableCell></TableCell>
                    <TableCell className="font-medium text-sm">1,000,000</TableCell>
                  </TableRow>
                  <TableRow className="border-b border-gray-100 hover:bg-transparent">
                    <TableCell></TableCell>
                    <TableCell className="py-3 text-sm text-gray-600">Activities 2</TableCell>
                    <TableCell className="py-3 text-sm text-gray-600">1,000,000</TableCell>
                  </TableRow>

                  {/* Phase 2 duplicated */}
                  <TableRow className="bg-[#EEF2FB] hover:bg-[#EEF2FB] border-b border-white">
                    <TableCell className="font-medium py-3 text-sm">Phase 1</TableCell>
                    <TableCell></TableCell>
                    <TableCell className="font-medium text-sm">3,000,000</TableCell>
                  </TableRow>
                  <TableRow className="border-b border-gray-100 hover:bg-transparent">
                    <TableCell className="relative"><div className="absolute left-6 top-0 bottom-0 w-px bg-gray-300"></div></TableCell>
                    <TableCell className="py-3 text-sm text-gray-600">Activities 1</TableCell>
                    <TableCell className="py-3 text-sm text-gray-600">1,000,000</TableCell>
                  </TableRow>
                  <TableRow className="border-b border-gray-100 hover:bg-transparent">
                    <TableCell className="relative"><div className="absolute left-6 top-0 bottom-0 w-px bg-gray-300"></div></TableCell>
                    <TableCell className="py-3 text-sm text-gray-600">Activities 2</TableCell>
                    <TableCell className="py-3 text-sm text-gray-600">1,000,000</TableCell>
                  </TableRow>
                  <TableRow className="bg-[#F4F7FC] hover:bg-[#F4F7FC] border-b border-white">
                    <TableCell className="py-3 pl-[3.2rem] text-sm font-medium relative">
                      <div className="absolute left-6 top-0 bottom-1/2 w-px bg-gray-300"></div>
                      <div className="absolute left-6 top-1/2 w-4 h-px bg-gray-300"></div>
                      Sub Phase 1
                    </TableCell>
                    <TableCell></TableCell>
                    <TableCell className="font-medium text-sm">1,000,000</TableCell>
                  </TableRow>
                  <TableRow className="border-0 hover:bg-transparent">
                    <TableCell></TableCell>
                    <TableCell className="py-3 text-sm text-gray-600">Activities 2</TableCell>
                    <TableCell className="py-3 text-sm text-gray-600">1,000,000</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
              <div className="flex items-center justify-end p-4 bg-gray-50 border-t border-gray-200">
                <div className="text-gray-600 text-sm">
                  Total Project Budget: <span className="text-xl font-semibold text-gray-800 ml-2">3,000,000</span>
                </div>
              </div>
            </div>

            {/* Recent Transactions */}
            <div className="bg-white rounded shadow-sm border border-gray-100 overflow-hidden">
              <div className="flex justify-between items-center p-4 border-b border-gray-100">
                <h3 className="text-lg font-medium text-[#3B7CED]">Recent transactions</h3>
                <Link href="/project-costing/1/transactions">
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
                  {transactions.map((tx) => (
                    <TableRow key={tx.id} className="hover:bg-gray-50 border-b-gray-100">
                      <TableCell className="text-gray-600">{tx.date}</TableCell>
                      <TableCell className="text-gray-600">{tx.desc}</TableCell>
                      <TableCell className="text-gray-600">{tx.category}</TableCell>
                      <TableCell className="text-gray-600">{tx.costCat}</TableCell>
                      <TableCell className="text-gray-600">{tx.amount}</TableCell>
                      <TableCell>
                        <Badge variant={tx.statusVariant as any} className="px-3 py-1 font-normal">
                          {tx.status}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
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
                <Badge className="bg-orange-100 text-orange-600 border-transparent hover:bg-orange-100 text-xs py-0.5">At Risk</Badge>
              </div>

              <div className="text-right text-xs text-gray-500 mb-2">54,100,000 / 5,000,000(82.0%)</div>
              
              {/* Stacked Progress Bar */}
              <div className="w-full h-8 flex rounded overflow-hidden mb-6">
                <div className="bg-[#3B7CED] h-full" style={{ width: '65%' }}></div>
                <div className="bg-[#7BA8F5] h-full" style={{ width: '17%' }}></div>
                <div className="bg-[#E5E7EB] h-full" style={{ width: '18%' }}></div>
              </div>

              {/* Progress Bar Legend */}
              <div className="flex gap-4 text-xs">
                <div className="flex items-center gap-1.5 text-gray-600">
                  <div className="w-3 h-3 rounded bg-[#3B7CED]"></div>
                  Actual (65.0%)
                </div>
                <div className="flex items-center gap-1.5 text-gray-600">
                  <div className="w-3 h-3 rounded bg-[#7BA8F5]"></div>
                  Committed (17.0%)
                </div>
                <div className="flex items-center gap-1.5 text-gray-600">
                  <div className="w-3 h-3 rounded bg-[#E5E7EB]"></div>
                  Available (18.0%)
                </div>
              </div>
            </div>

            {/* Pending Requests */}
            <div className="bg-white p-6 rounded shadow-sm border border-gray-100">
              <h3 className="text-lg font-medium text-[#3B7CED] mb-6">Pending Requests</h3>
              <div className="flex flex-col gap-4">
                <div>
                  <div className="text-sm text-gray-500 mb-1">Awaiting Approval</div>
                  <div className="text-2xl font-bold text-gray-800">12</div>
                </div>
                <div>
                  <div className="text-sm text-gray-500 mb-1">Total Value</div>
                  <div className="text-2xl font-bold text-gray-800">N245,000</div>
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
                        data={pieData}
                        cx="50%"
                        cy="50%"
                        innerRadius={0}
                        outerRadius={80}
                        paddingAngle={0}
                        dataKey="value"
                        stroke="none"
                      >
                        {pieData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="flex flex-col gap-3 ml-4">
                  {pieData.map((entry, idx) => (
                    <div key={idx} className="flex items-center gap-2 text-xs text-gray-600 whitespace-nowrap">
                      <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: entry.color }}></div>
                      {entry.name}
                    </div>
                  ))}
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
      />
    </div>
  );
}
