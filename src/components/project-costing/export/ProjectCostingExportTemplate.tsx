import React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
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
  Legend
} from "recharts";
import { ProjectCostingProject } from "@/types/projectCosting";

// Fake Data Generation
const MOCK_LINE_DATA = [
  { month: "Jan", planned: 500000, actual: 480000 },
  { month: "Feb", planned: 800000, actual: 820000 },
  { month: "Mar", planned: 1200000, actual: 1100000 },
  { month: "Apr", planned: 1500000, actual: 1600000 },
  { month: "May", planned: 2000000, actual: 1950000 },
  { month: "Jun", planned: 2500000, actual: 2600000 },
];

const MOCK_PIE_DATA = [
  { name: "Labor", value: 4500000 },
  { name: "Materials", value: 3200000 },
  { name: "Equipment", value: 1500000 },
  { name: "Subcontractors", value: 800000 },
];
const COLORS = ["#3B7CED", "#F09100", "#2BA24D", "#9B51E0"];

const MOCK_WBS_DATA = [
  {
    id: "PH-001",
    name: "Phase 1: Foundation & Structuring",
    amount: "4500000.00",
    activities: [
      { id: "ACT-001", name: "Site Clearance", amount: "500000.00" },
      { id: "ACT-002", name: "Excavation", amount: "1000000.00" },
      { id: "ACT-003", name: "Concrete Pouring", amount: "3000000.00" },
    ]
  },
  {
    id: "PH-002",
    name: "Phase 2: Core Engineering",
    amount: "3000000.00",
    activities: [
      { id: "ACT-004", name: "Steel Framework", amount: "1500000.00" },
      { id: "ACT-005", name: "Roofing Installation", amount: "1500000.00" },
    ]
  },
  {
    id: "PH-003",
    name: "Phase 3: Interior Finishing",
    amount: "2500000.00",
    activities: [
      { id: "ACT-006", name: "Drywall & Plastering", amount: "800000.00" },
      { id: "ACT-007", name: "Electrical Wiring", amount: "700000.00" },
      { id: "ACT-008", name: "Plumbing", amount: "1000000.00" },
    ]
  }
];

const MOCK_TRANSACTIONS = [
  { date: "2026-07-20", ref: "TRX-1092", category: "Labor", amount: "450000.00", status: "Completed" },
  { date: "2026-07-18", ref: "TRX-1091", category: "Materials", amount: "1200000.00", status: "Completed" },
  { date: "2026-07-15", ref: "TRX-1090", category: "Equipment", amount: "350000.00", status: "Pending" },
  { date: "2026-07-10", ref: "TRX-1089", category: "Subcontractors", amount: "200000.00", status: "Completed" },
];

const formatCurrency = (amount: number | string) => {
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    minimumFractionDigits: 2,
  }).format(Number(amount));
};

export const ProjectCostingExportTemplate = ({ project }: { project?: ProjectCostingProject }) => {
  const today = new Date().toLocaleDateString("en-US", { year: 'numeric', month: 'long', day: 'numeric' });

  return (
    <div className="w-[1400px] bg-gray-50 p-8 font-sans text-gray-800 flex flex-col gap-6 relative overflow-hidden">
      
      {/* BACKGROUND WATERMARK */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-0 opacity-[0.03]">
        <img src="/fastraLogo.png" alt="Fastra Watermark" className="w-[800px] h-auto object-contain grayscale" />
      </div>

      <div className="relative z-10 flex flex-col gap-6">
        {/* 1. HEADER SECTION (Matches Fastra Suite UI) */}
        <div className="flex justify-between items-start bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <div className="flex items-center gap-6">
            <div className="h-12 w-auto flex-shrink-0 border-r border-gray-200 pr-6">
              <img src="/fastraLogo.png" alt="Fastra Suite Logo" className="h-full object-contain" />
            </div>
            <div>
              <div className="flex items-center gap-4">
                <h2 className="text-2xl font-bold text-gray-800">{project?.name || "Mock Fastra Residential Estate Project"}</h2>
                <Badge className="bg-green-100 text-green-700 px-3 py-0.5 border-0 font-medium text-xs">
                  {project?.status || "ACTIVE"}
                </Badge>
              </div>
              <div className="text-sm text-gray-500 mt-2">{project?.project_code || "PRJ-2026-X99"}</div>
              <div className="text-sm text-gray-800 mt-1">
                <span className="font-semibold text-gray-600">Project Manager:</span> John Doe <span className="mx-2"> </span> <span className="font-semibold text-gray-600">Date:</span> {project?.start_date || "2026-01-01"} - {project?.expected_end_date || "2026-12-31"}
              </div>
            </div>
          </div>
          <div className="text-right flex flex-col items-end">
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Report Generated</span>
            <span className="text-sm font-medium text-gray-800">{today}</span>
          </div>
        </div>

        {/* 2. KPI CARDS SECTION (Unified Block with Colors) */}
        <div className="grid grid-cols-5 gap-4">
          <div className="p-5 rounded-xl border border-blue-100 bg-blue-50/50 flex flex-col justify-center">
            <div className="text-xs text-blue-600 font-bold mb-1 uppercase tracking-wide">Total Planned Budget</div>
            <div className="text-2xl font-black text-blue-900">{formatCurrency(10000000)}</div>
          </div>
          <div className="p-5 rounded-xl border border-orange-100 bg-orange-50/50 flex flex-col justify-center">
            <div className="text-xs text-orange-600 font-bold mb-1 uppercase tracking-wide">Amount Spent (Actual)</div>
            <div className="text-2xl font-black text-orange-900">{formatCurrency(8550000)}</div>
          </div>
          <div className="p-5 rounded-xl border border-purple-100 bg-purple-50/50 flex flex-col justify-center">
            <div className="text-xs text-purple-600 font-bold mb-1 uppercase tracking-wide">Committed</div>
            <div className="text-2xl font-black text-purple-900">{formatCurrency(250000)}</div>
          </div>
          <div className="p-5 rounded-xl border border-green-100 bg-green-50/50 flex flex-col justify-center">
            <div className="text-xs text-green-600 font-bold mb-1 uppercase tracking-wide">Remaining</div>
            <div className="text-2xl font-black text-green-900">{formatCurrency(1200000)}</div>
          </div>
          <div className="p-5 rounded-xl border border-red-100 bg-red-50/50 flex flex-col justify-center">
            <div className="text-xs text-red-600 font-bold mb-1 uppercase tracking-wide">Variance</div>
            <div className="text-2xl font-black text-red-900">8.5%</div>
          </div>
        </div>

        {/* 3. CHARTS SECTION */}
        <div className="grid grid-cols-3 gap-6 h-[400px]">
          <div className="col-span-2 bg-white border border-gray-200 rounded-xl p-6 flex flex-col shadow-sm">
            <h3 className="text-lg font-medium text-[#3B7CED] mb-6">Spend Over Time vs Budget Curve</h3>
            <div className="flex-1 w-full min-h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={MOCK_LINE_DATA} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                  <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{fill: '#6B7280', fontSize: 12}} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{fill: '#6B7280', fontSize: 12}} tickFormatter={(val) => val === 0 ? "₦0" : `₦${(val/1000000).toFixed(1)}M`} />
                  <Tooltip formatter={(value) => formatCurrency(value as number)} />
                  <Legend />
                  <Line type="monotone" dataKey="planned" name="Planned Spend" stroke="#3B7CED" strokeWidth={3} dot={false} strokeDasharray="5 5" />
                  <Line type="monotone" dataKey="actual" name="Actual Spend" stroke="#2BA24D" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="col-span-1 bg-white border border-gray-200 rounded-xl p-6 flex flex-col shadow-sm relative">
            <h3 className="text-lg font-medium text-[#3B7CED] mb-2">Cost Category Breakdown</h3>
            <div className="flex-1 relative">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={MOCK_PIE_DATA}
                    cx="50%"
                    cy="45%"
                    innerRadius={75}
                    outerRadius={110}
                    paddingAngle={4}
                    dataKey="value"
                    stroke="none"
                    label={({
                      cx,
                      cy,
                      midAngle = 0,
                      innerRadius,
                      outerRadius,
                      percent = 0,
                      index
                    }: any) => {
                      const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
                      const x = cx + radius * Math.cos(-midAngle * Math.PI / 180);
                      const y = cy + radius * Math.sin(-midAngle * Math.PI / 180);
                      return (
                        <text x={x} y={y} fill="white" textAnchor="middle" dominantBaseline="central" fontSize={11} fontWeight="bold">
                          {`${(percent * 100).toFixed(0)}%`}
                        </text>
                      );
                    }}
                    labelLine={false}
                  >
                    {MOCK_PIE_DATA.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    formatter={(value) => formatCurrency(value as number)} 
                    contentStyle={{ borderRadius: "8px", border: "none", boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)" }}
                  />
                  <Legend verticalAlign="bottom" height={40} iconType="circle" iconSize={8} wrapperStyle={{ fontSize: "12px", paddingTop: "20px" }} />
                </PieChart>
              </ResponsiveContainer>
              
              {/* Inner Pie Chart Label (Donut Hole text) */}
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none pb-12">
                <span className="text-[10px] text-gray-400 font-semibold uppercase tracking-wider">Total</span>
                <span className="text-lg font-black text-gray-800">{formatCurrency(10000000).replace(/\.\d+/, '')}</span>
              </div>
            </div>
          </div>
        </div>

        {/* 4. WBS BREAKDOWN SECTION */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden mt-4">
          <div className="p-6 border-b border-gray-200 bg-white">
            <h3 className="text-lg font-medium text-[#3B7CED]">Work Breakdown Structure (WBS)</h3>
          </div>
          <Table>
            <TableHeader className="bg-gray-50 border-b border-gray-200">
              <TableRow className="hover:bg-gray-50">
                <TableHead className="w-20 font-bold text-gray-700">S/N</TableHead>
                <TableHead className="font-bold text-gray-700">Phase / Activity</TableHead>
                <TableHead className="text-right font-bold text-gray-700">Planned Amount</TableHead>
                <TableHead className="text-right font-bold text-gray-700">Actual Cost</TableHead>
                <TableHead className="text-right font-bold text-gray-700">Variance</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {MOCK_WBS_DATA.map((phase, pIndex) => (
                <React.Fragment key={phase.id}>
                  {/* Phase Row */}
                  <TableRow className="bg-gray-50/80 border-b border-gray-200">
                    <TableCell className="font-bold text-gray-800">{pIndex + 1}</TableCell>
                    <TableCell className="font-bold text-gray-800">{phase.name}</TableCell>
                    <TableCell className="text-right font-bold text-gray-800">{formatCurrency(phase.amount)}</TableCell>
                    <TableCell className="text-right font-bold text-gray-800">{formatCurrency(Number(phase.amount) * 0.9)}</TableCell>
                    <TableCell className="text-right font-bold text-green-600">{formatCurrency(Number(phase.amount) * 0.1)}</TableCell>
                  </TableRow>
                  {/* Activity Rows */}
                  {phase.activities.map((act, aIndex) => (
                    <TableRow key={act.id} className="border-b border-gray-100">
                      <TableCell className="text-gray-500 pl-4">{pIndex + 1}.{aIndex + 1}</TableCell>
                      <TableCell className="pl-10 text-gray-600">{act.name}</TableCell>
                      <TableCell className="text-right text-gray-600">{formatCurrency(act.amount)}</TableCell>
                      <TableCell className="text-right text-gray-600">{formatCurrency(Number(act.amount) * 0.85)}</TableCell>
                      <TableCell className="text-right text-green-600">{formatCurrency(Number(act.amount) * 0.15)}</TableCell>
                    </TableRow>
                  ))}
                </React.Fragment>
              ))}
            </TableBody>
          </Table>
        </div>

        {/* 5. RECENT TRANSACTIONS SECTION */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden mt-4">
          <div className="p-6 border-b border-gray-200 bg-white">
            <h3 className="text-lg font-medium text-[#3B7CED]">Recent Transactions & Adjustments</h3>
          </div>
          <Table>
            <TableHeader className="bg-gray-50 border-b border-gray-200">
              <TableRow className="hover:bg-gray-50">
                <TableHead className="font-bold text-gray-700">Date</TableHead>
                <TableHead className="font-bold text-gray-700">Reference</TableHead>
                <TableHead className="font-bold text-gray-700">Category</TableHead>
                <TableHead className="text-right font-bold text-gray-700">Amount</TableHead>
                <TableHead className="font-bold text-gray-700">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {MOCK_TRANSACTIONS.map((trx, idx) => (
                <TableRow key={idx} className="border-b border-gray-100">
                  <TableCell className="text-gray-600">{trx.date}</TableCell>
                  <TableCell className="font-medium text-gray-800">{trx.ref}</TableCell>
                  <TableCell className="text-gray-600">{trx.category}</TableCell>
                  <TableCell className="text-right font-bold text-gray-800">{formatCurrency(trx.amount)}</TableCell>
                  <TableCell>
                    <Badge variant={trx.status === "Completed" ? "validated" : "pending"} className="shadow-none border-0 px-2 py-0.5 font-normal">
                      {trx.status}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

      </div>
    </div>
  );
};
