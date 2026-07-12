"use client";

import React, { useState } from "react";
import { ArrowLeft, MoreHorizontal, Eye, CheckCircle2, AlertCircle, XCircle, Clock } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { StatusModal, useStatusModal } from "@/components/shared/StatusModal";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { PageGuard } from "@/components/auth/PageGuard";

const pendingRequests = [
  {
    id: "REQ-2026-0142",
    project: "Project #1 - Site A Construction",
    wbsPhase: "Superstructure",
    wbsActivity: "First Floor Slab Reinforcement",
    costCode: "CC-2040 (Structural Reinforcement)",
    availableBudget: 15000000,
    equipmentId: "Tower Crane TC-01 (EQ-102)",
    requester: "Eng. John Doe (Site Engineer)",
    gateReceiver: "Mr. Abubakar (Site Foreman)",
    requisitionDate: "2026-06-27",
    itemsCount: 2,
    totalCost: 10200000,
    status: "pending",
    isOverrun: false,
  },
  {
    id: "REQ-2026-0143",
    project: "Project #2 - Site B Infrastructure",
    wbsPhase: "Substructure / Foundation",
    wbsActivity: "Drainage Trench Concrete",
    costCode: "CC-1020 (Concrete Materials)",
    availableBudget: 3500000,
    equipmentId: "Concrete Mixer CM-04 (EQ-088)",
    requester: "Eng. Jane Smith (Site Supervisor)",
    gateReceiver: "Engr. Kenneth (Project Supervisor)",
    requisitionDate: "2026-06-28",
    itemsCount: 1,
    totalCost: 1375000,
    status: "pending",
    isOverrun: false,
  },
];

const overrunRequests = [
  {
    id: "REQ-2026-0189",
    project: "Project #1 - Site A Construction",
    wbsPhase: "Substructure / Foundation",
    wbsActivity: "Retaining Wall Concrete Pour",
    costCode: "CC-1020 (Concrete Materials)",
    availableBudget: 2000000,
    equipmentId: "Batching Plant BP-01",
    requester: "Eng. Samuel (Site Supervisor)",
    gateReceiver: "Mr. Abubakar (Site Foreman)",
    requisitionDate: "2026-06-29",
    itemsCount: 4,
    totalCost: 4850000,
    status: "held_overrun",
    isOverrun: true,
  },
];

export default function MaterialConsumptionApprovalsPage() {
  const router = useRouter();
  const [activeQueue, setActiveQueue] = useState<"normal" | "overrun">("normal");
  const [normalList, setNormalList] = useState(pendingRequests);
  const [overrunList, setOverrunList] = useState(overrunRequests);
  const statusModal = useStatusModal();

  const currentList = activeQueue === "normal" ? normalList : overrunList;

  const handleAction = (id: string, action: "approve" | "reject" | "clarify") => {
    if (activeQueue === "normal") {
      setNormalList(normalList.filter((r) => r.id !== id));
    } else {
      setOverrunList(overrunList.filter((r) => r.id !== id));
    }

    if (action === "approve") {
      statusModal.showSuccess(
        "Requisition Approved",
        `Material Consumption ${id} approved successfully. Actual project costing and warehouse stock deduction have been posted.`
      );
    } else if (action === "reject") {
      statusModal.showSuccess(
        "Requisition Rejected",
        `Material Consumption ${id} has been rejected. The submitter has been notified.`
      );
    } else {
      statusModal.showSuccess(
        "Clarification Requested",
        `Material Consumption ${id} sent back to the submitter for clarification.`
      );
    }
  };

  return (
    <PageGuard application="inventory" module="materialconsumption">
      <div className="flex flex-col flex-1 min-h-[calc(100vh-64px)] bg-white relative pb-20">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-white">
          <div className="flex items-center">
            <Link href="/inventory/operation">
              <Button variant="ghost" size="icon" className="mr-2">
                <ArrowLeft className="h-5 w-5 text-gray-500" />
              </Button>
            </Link>
            <div>
              <h1 className="text-lg font-medium text-gray-800">
                Material Consumption Approvals
              </h1>
              <p className="text-xs text-gray-500 mt-0.5">
                Review site requisitions against WBS job allocations and authorize warehouse stock deductions.
              </p>
            </div>
          </div>
        </div>

        <div className="px-4 sm:px-6 py-6 max-w-[1400px] mx-auto w-full flex flex-col gap-6">
          
          {/* PRD 10.2 Queue Switcher */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-gray-200">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setActiveQueue("normal")}
                className={`px-4 py-2 text-xs font-semibold rounded-md transition-all cursor-pointer flex items-center gap-2 ${
                  activeQueue === "normal"
                    ? "bg-[#3B7CED] text-white shadow-xs"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                <CheckCircle2 className="w-4 h-4" /> Within Budget Queue ({normalList.length})
              </button>
              <button
                onClick={() => setActiveQueue("overrun")}
                className={`px-4 py-2 text-xs font-semibold rounded-md transition-all cursor-pointer flex items-center gap-2 ${
                  activeQueue === "overrun"
                    ? "bg-red-600 text-white shadow-xs animate-pulse"
                    : "bg-red-50 text-red-700 hover:bg-red-100 border border-red-200"
                }`}
              >
                <AlertCircle className="w-4 h-4" /> Overrun Queue - Budget Exceeded ({overrunList.length})
              </button>
            </div>
            <span className="text-xs text-gray-500">
              {activeQueue === "normal"
                ? "Items within WBS budget proceed to stock deduction upon supervisor approval."
                : "PRD 10.2: Items held by Budget Validation Gate. Stock is NOT deducted until PM resolves."}
            </span>
          </div>

          <section>
            <div className="flex justify-between items-center mb-4">
              <h2 className={`text-xl font-medium ${activeQueue === "normal" ? "text-[#3B7CED]" : "text-red-600"}`}>
                {activeQueue === "normal" ? "Pending Site Requisitions (Within Budget)" : "Overrun Queue — PM Review Required"}
              </h2>
              <span className="text-xs font-semibold text-gray-500 bg-gray-100 px-3 py-1 rounded">
                {currentList.length} Request{currentList.length !== 1 ? "s" : ""}
              </span>
            </div>

            <div className="bg-white rounded border border-gray-200 shadow-sm overflow-hidden">
              <div className="overflow-x-auto w-full">
                <Table className="min-w-[900px] w-full">
                  <TableHeader>
                    <TableRow className="bg-[#F8F9FA] hover:bg-[#F8F9FA] border-b-gray-100">
                      <TableHead className="py-3 px-4 font-medium text-gray-500 text-xs uppercase">Requisition ID</TableHead>
                      <TableHead className="py-3 px-4 font-medium text-gray-500 text-xs uppercase">Project & WBS Allocation</TableHead>
                      <TableHead className="py-3 px-4 font-medium text-gray-500 text-xs uppercase">Budget Gate Validation</TableHead>
                      <TableHead className="py-3 px-4 font-medium text-gray-500 text-xs uppercase">Requester & Equipment</TableHead>
                      <TableHead className="py-3 px-4 font-medium text-gray-500 text-xs uppercase text-right">Total Valuation</TableHead>
                      <TableHead className="py-3 px-4 font-medium text-gray-500 text-xs uppercase text-center">Status</TableHead>
                      <TableHead className="py-3 pr-6 font-medium text-gray-500 text-xs uppercase text-right">Options</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {currentList.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7} className="px-6 py-12 text-center text-gray-400 italic">
                          No pending requisitions in this queue.
                        </TableCell>
                      </TableRow>
                    ) : (
                      currentList.map((req) => (
                        <TableRow
                          key={req.id}
                          className="hover:bg-gray-50 border-b-gray-100 transition-colors"
                        >
                          <TableCell className="px-4 py-3.5 font-mono text-xs font-semibold text-gray-900">
                            <Link
                              href={`/inventory/operation/material-consumption/${req.id}`}
                              className="text-[#3B7CED] hover:underline"
                            >
                              {req.id}
                            </Link>
                          </TableCell>
                          <TableCell className="px-4 py-3.5">
                            <div className="font-medium text-gray-800 text-sm">{req.project}</div>
                            <div className="text-gray-500 text-xs mt-0.5">
                              <span className="text-[#3B7CED] font-medium">{req.wbsPhase}</span> → {req.wbsActivity}
                            </div>
                            <div className="text-[11px] text-gray-400 font-mono mt-0.5">{req.costCode}</div>
                          </TableCell>
                          <TableCell className="px-4 py-3.5">
                            <div className="text-xs">
                              <span className="text-gray-500">Avail. WBS Budget:</span>{" "}
                              <strong className="text-gray-800 font-mono">₦{req.availableBudget.toLocaleString()}</strong>
                            </div>
                            <div className="mt-1">
                              {req.isOverrun ? (
                                <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-red-100 text-red-800 border border-red-300">
                                  OVERRUN (+₦{(req.totalCost - req.availableBudget).toLocaleString()})
                                </span>
                              ) : (
                                <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold bg-green-50 text-green-700 border border-green-200">
                                  Within Budget Gate
                                </span>
                              )}
                            </div>
                          </TableCell>
                          <TableCell className="px-4 py-3.5">
                            <div className="text-gray-800 text-sm font-medium">{req.requester}</div>
                            <div className="text-xs text-gray-500 mt-0.5">
                              Asset: <span className="font-medium text-gray-700">{req.equipmentId}</span>
                            </div>
                          </TableCell>
                          <TableCell className="px-4 py-3.5 text-right font-semibold text-gray-800 text-sm">
                            ₦{req.totalCost.toLocaleString()}
                          </TableCell>
                          <TableCell className="px-4 py-3.5 text-center">
                            <span className={`inline-block px-2 py-0.5 text-[11px] rounded font-medium uppercase ${req.isOverrun ? "bg-red-100 text-red-800" : "bg-amber-100 text-amber-800"}`}>
                              {req.isOverrun ? "HELD: OVERRUN" : "PENDING"}
                            </span>
                          </TableCell>
                          <TableCell className="pr-6 py-3.5 text-right">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8 text-gray-500 hover:text-gray-900"
                                >
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end" className="w-48">
                                <DropdownMenuItem
                                  className="text-xs cursor-pointer text-gray-700 flex items-center py-2"
                                  onClick={() => router.push(`/inventory/operation/material-consumption/${req.id}`)}
                                >
                                  <Eye className="w-3.5 h-3.5 mr-2 text-[#3B7CED]" />
                                  View Details
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  className="text-xs cursor-pointer text-green-700 font-medium flex items-center py-2"
                                  onClick={() => handleAction(req.id, "approve")}
                                >
                                  <CheckCircle2 className="w-3.5 h-3.5 mr-2 text-green-600" />
                                  Approve & Deduct Stock
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  className="text-xs cursor-pointer text-amber-700 flex items-center py-2"
                                  onClick={() => handleAction(req.id, "clarify")}
                                >
                                  <AlertCircle className="w-3.5 h-3.5 mr-2 text-amber-600" />
                                  Request Clarification
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  className="text-xs cursor-pointer text-red-600 flex items-center py-2"
                                  onClick={() => handleAction(req.id, "reject")}
                                >
                                  <XCircle className="w-3.5 h-3.5 mr-2 text-red-600" />
                                  Reject Requisition
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </div>
          </section>
        </div>

        <StatusModal
          isOpen={statusModal.isOpen}
          onClose={statusModal.close}
          title={statusModal.title}
          message={statusModal.message}
          type={statusModal.type}
        />
      </div>
    </PageGuard>
  );
}
