"use client";

import React, { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, CheckCircle2, XCircle, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { StatusModal, useStatusModal } from "@/components/shared/StatusModal";
import { Textarea } from "@/components/ui/textarea";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { PageGuard } from "@/components/auth/PageGuard";

const mockRequestsData: Record<string, any> = {
  "REQ-2026-0142": {
    id: "REQ-2026-0142",
    project: "Project #1 - Site A Construction",
    wbsPhase: "Superstructure",
    wbsActivity: "First Floor Slab Reinforcement",
    costCode: "CC-2040 (Structural Reinforcement)",
    availableBudget: 15000000,
    isOverrun: false,
    equipmentId: "Tower Crane TC-01 (EQ-102)",
    requester: "Eng. John Doe (Site Engineer)",
    gateReceiver: "Mr. Abubakar (Site Foreman - 08031234567)",
    requisitionDate: "2026-06-27",
    issueDate: "2026-06-28",
    totalCost: 10200000,
    itemsList: [
      { id: "1", name: "Reinforcement Steel 16mm", description: "High yield deformed rebar BS4449", unit: "Tonnes", requestedQty: 12, availableStock: 150, unitCost: 850000 },
      { id: "2", name: "Binding Wire", description: "16-gauge annealed steel tie wire", unit: "Rolls", requestedQty: 5, availableStock: 40, unitCost: 15000 }
    ],
    status: "pending",
    notes: "Urgent material consumption required before concrete pouring tomorrow morning at 07:00 AM.",
  },
  "REQ-2026-0143": {
    id: "REQ-2026-0143",
    project: "Project #2 - Site B Infrastructure",
    wbsPhase: "Substructure / Foundation",
    wbsActivity: "Drainage Trench Concrete",
    costCode: "CC-1020 (Concrete Materials)",
    availableBudget: 3500000,
    isOverrun: false,
    equipmentId: "Concrete Mixer CM-04 (EQ-088)",
    requester: "Eng. Jane Smith (Site Supervisor)",
    gateReceiver: "Engr. Kenneth (Project Supervisor - 08029876543)",
    requisitionDate: "2026-06-28",
    issueDate: "2026-06-29",
    totalCost: 1375000,
    itemsList: [
      { id: "3", name: "Cement (50kg Bag)", description: "Portland Cement Grade 42.5", unit: "Bags", requestedQty: 250, availableStock: 500, unitCost: 5500 }
    ],
    status: "pending",
    notes: "Batch 1 concrete preparation for perimeter drainage channels.",
  },
  "REQ-2026-0189": {
    id: "REQ-2026-0189",
    project: "Project #1 - Site A Construction",
    wbsPhase: "Substructure / Foundation",
    wbsActivity: "Retaining Wall Concrete Pour",
    costCode: "CC-1020 (Concrete Materials)",
    availableBudget: 2000000,
    isOverrun: true,
    equipmentId: "Batching Plant BP-01",
    requester: "Eng. Samuel (Site Supervisor)",
    gateReceiver: "Mr. Abubakar (Site Foreman - 08031234567)",
    requisitionDate: "2026-06-29",
    issueDate: "2026-06-30",
    totalCost: 4850000,
    itemsList: [
      { id: "4", name: "Cement (50kg Bag)", description: "Portland Cement Grade 42.5", unit: "Bags", requestedQty: 600, availableStock: 850, unitCost: 5500 },
      { id: "5", name: "Sharp Sand", description: "Clean river sharp sand", unit: "Cubic Meters", requestedQty: 80, availableStock: 120, unitCost: 19375 }
    ],
    status: "held_overrun",
    notes: "PRD 10.2: Requisition held by Budget Validation Gate. Exceeds available WBS line budget by ₦2,850,000.",
  },
};

export default function MaterialConsumptionDetailPage() {
  const params = useParams();
  const router = useRouter();
  const reqId = (params?.id as string) || "REQ-2026-0142";
  
  const req = mockRequestsData[reqId] || {
    id: reqId,
    project: "Project #1 - Site A Construction",
    wbsPhase: "Superstructure",
    wbsActivity: "General Site Operations",
    equipmentId: "General Asset / N/A",
    requester: "Eng. John Doe (Site Engineer)",
    gateReceiver: "Site Foreman - 08031234567",
    requisitionDate: "2026-06-27",
    issueDate: "2026-06-28",
    totalCost: 1500000,
    itemsList: [
      { id: "1", name: "Standard Site Consumables", description: "General structural supplies", unit: "Units", requestedQty: 10, availableStock: 100, unitCost: 150000 }
    ],
    status: "pending",
    notes: "Standard requisition submitted from field operations team.",
  };

  const [status, setStatus] = useState<string>(req.status);
  const [reason, setReason] = useState<string>("");
  const [showReasonBox, setShowReasonBox] = useState<"reject" | "clarify" | null>(null);

  const statusModal = useStatusModal();

  const handleAction = (action: "approve" | "reject" | "clarify") => {
    if (action === "reject" || action === "clarify") {
      if (showReasonBox !== action) {
        setShowReasonBox(action);
        return;
      }
      if (!reason.trim()) {
        statusModal.showError("Reason Required", `Please enter notes explaining why this requisition requires ${action}.`);
        return;
      }
    }

    if (action === "approve") {
      setStatus("approved");
      statusModal.showSuccess(
        "Requisition Approved",
        `Requisition ${req.id} approved successfully. Actual project costing and warehouse stock deduction have been posted to the Inventory Ledger.`
      );
    } else if (action === "reject") {
      setStatus("rejected");
      statusModal.showSuccess(
        "Requisition Rejected",
        `Requisition ${req.id} has been rejected. The submitter has been notified with your feedback.`
      );
    } else {
      setStatus("clarification_requested");
      statusModal.showSuccess(
        "Clarification Requested",
        `Requisition ${req.id} has been sent back to the submitter for clarification.`
      );
    }
    setShowReasonBox(null);
  };

  return (
    <PageGuard application="inventory" module="materialconsumption">
      <div className="flex flex-col flex-1 min-h-[calc(100vh-64px)] bg-white relative pb-20">
        {/* FastraSuite Standard Clean Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-white">
          <div className="flex items-center">
            <Link href="/inventory/operation/material-consumption">
              <Button variant="ghost" size="icon" className="mr-2">
                <ArrowLeft className="h-5 w-5 text-gray-500" />
              </Button>
            </Link>
            <div>
              <h1 className="text-lg font-medium text-gray-800">
                Site Requisition Note: {req.id}
              </h1>
              <div className="flex items-center gap-2 mt-1">
                <span
                  className={`inline-block px-2 py-0.5 text-[11px] rounded font-medium uppercase ${
                    status === "approved"
                      ? "bg-green-100 text-green-700"
                      : status === "rejected"
                      ? "bg-red-100 text-red-700"
                      : status === "clarification_requested"
                      ? "bg-amber-100 text-amber-800"
                      : "bg-amber-100 text-amber-800"
                  }`}
                >
                  {status.replace("_", " ")}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {status === "pending" && (
              <>
                <Button
                  variant="outline"
                  className="border-amber-300 text-amber-700 hover:bg-amber-50 text-xs h-9"
                  onClick={() => handleAction("clarify")}
                >
                  Request Clarification
                </Button>
                <Button
                  variant="outline"
                  className="border-red-400 text-red-600 hover:bg-red-50 text-xs h-9"
                  onClick={() => handleAction("reject")}
                >
                  Reject Requisition
                </Button>
                <Button
                  className="bg-[#2BA24D] hover:bg-[#238A40] text-white text-xs h-9 shadow-sm"
                  onClick={() => handleAction("approve")}
                >
                  <CheckCircle2 className="w-3.5 h-3.5 mr-1.5" /> Approve & Deduct Stock
                </Button>
              </>
            )}
          </div>
        </div>

        {/* Details Content matching rest of FastraSuite */}
        <div className="p-6 max-w-[1400px] mx-auto w-full flex flex-col gap-10">
          {/* Action Notes Box if Rejection or Clarification triggered */}
          {showReasonBox && (
            <div className="bg-amber-50/60 p-5 rounded border border-amber-200">
              <h3 className="text-xs font-semibold text-gray-800 mb-2 uppercase">
                Enter Feedback Notes for {showReasonBox === "reject" ? "Rejection" : "Clarification"}:
              </h3>
              <Textarea
                placeholder={`Type detailed reason for ${showReasonBox}...`}
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className="w-full min-h-[80px] mb-3 text-sm bg-white"
              />
              <div className="flex justify-end gap-2">
                <Button variant="outline" size="sm" className="text-xs h-8" onClick={() => setShowReasonBox(null)}>
                  Cancel
                </Button>
                <Button
                  size="sm"
                  className={`text-xs h-8 text-white ${showReasonBox === "reject" ? "bg-red-600 hover:bg-red-700" : "bg-amber-600 hover:bg-amber-700"}`}
                  onClick={() => handleAction(showReasonBox)}
                >
                  Confirm {showReasonBox === "reject" ? "Rejection" : "Clarification"}
                </Button>
              </div>
            </div>
          )}

          {/* Requisition Summary Section */}
          <section>
            <h2 className="text-[#3B7CED] text-xl mb-6 font-medium">Requisition Summary</h2>
            
            {/* PRD 10.2 Budget Gate Verification Banner */}
            {req.availableBudget !== undefined && (
              <div className={`mb-6 p-4 rounded border flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${req.isOverrun ? "bg-red-50 border-red-300" : "bg-green-50/60 border-green-200"}`}>
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-full ${req.isOverrun ? "bg-red-100 text-red-600" : "bg-green-100 text-green-600"}`}>
                    {req.isOverrun ? <AlertCircle className="w-5 h-5" /> : <CheckCircle2 className="w-5 h-5" />}
                  </div>
                  <div>
                    <h4 className={`text-sm font-semibold ${req.isOverrun ? "text-red-900" : "text-green-900"}`}>
                      Budget Validation Gate (PRD 10.2): {req.isOverrun ? "HELD IN OVERRUN QUEUE" : "PASSED (WITHIN BUDGET)"}
                    </h4>
                    <p className="text-xs text-gray-600 mt-0.5">
                      Cost Code: <strong className="font-mono">{req.costCode || "CC-1020"}</strong> | Available WBS Budget: <strong className="font-mono">₦{req.availableBudget.toLocaleString()}</strong>
                    </p>
                  </div>
                </div>
                {req.isOverrun && (
                  <div className="bg-white px-3 py-1.5 rounded border border-red-200 text-xs text-red-700 font-bold self-start sm:self-auto">
                    Overrun Variance: +₦{(req.totalCost - req.availableBudget).toLocaleString()}
                  </div>
                )}
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 bg-gray-50 p-6 rounded border border-gray-200">
              <div>
                <span className="text-xs text-gray-400 block mb-1">Requisition ID</span>
                <span className="text-sm font-semibold text-gray-800">{req.id}</span>
              </div>
              <div>
                <span className="text-xs text-gray-400 block mb-1">Target Project</span>
                <span className="text-sm font-semibold text-[#3B7CED]">{req.project}</span>
              </div>
              <div>
                <span className="text-xs text-gray-400 block mb-1">WBS Phase & Activity</span>
                <span className="text-sm font-semibold text-gray-800">{req.wbsPhase} → {req.wbsActivity}</span>
              </div>
              <div>
                <span className="text-xs text-gray-400 block mb-1">Total Valuation</span>
                <span className="text-sm font-bold text-gray-900">₦{req.totalCost.toLocaleString()}</span>
              </div>

              <div className="border-t border-gray-200 pt-4 mt-2">
                <span className="text-xs text-gray-400 block mb-1">Requested By</span>
                <span className="text-sm font-medium text-gray-800">{req.requester}</span>
              </div>
              <div className="border-t border-gray-200 pt-4 mt-2">
                <span className="text-xs text-gray-400 block mb-1">Gate Receiver / Signatory</span>
                <span className="text-sm font-medium text-gray-800">{req.gateReceiver}</span>
              </div>
              <div className="border-t border-gray-200 pt-4 mt-2">
                <span className="text-xs text-gray-400 block mb-1">Target Asset / Equipment</span>
                <span className="text-sm font-medium text-amber-800">{req.equipmentId}</span>
              </div>
              <div className="border-t border-gray-200 pt-4 mt-2">
                <span className="text-xs text-gray-400 block mb-1">Requisition vs Issue Date</span>
                <span className="text-sm font-medium text-gray-800">{req.requisitionDate} → {req.issueDate}</span>
              </div>

              {req.notes && (
                <div className="md:col-span-4 border-t border-gray-200 pt-4 mt-2">
                  <span className="text-xs text-gray-400 block mb-1">Field Engineer Notes</span>
                  <span className="text-sm text-gray-700">{req.notes}</span>
                </div>
              )}
            </div>
          </section>

          {/* Line Items & Warehouse Stock Verification Table */}
          <section>
            <h2 className="text-[#3B7CED] text-xl mb-6 font-medium">Requested Material Lines & Warehouse Stock Verification</h2>
            <div className="bg-white rounded border border-gray-200 shadow-sm overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="bg-[#F8F9FA] border-b-gray-100">
                    <TableHead className="pl-4">Product Name</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead className="text-center">Unit</TableHead>
                    <TableHead className="text-center">Requested QTY</TableHead>
                    <TableHead className="text-center">Warehouse Stock</TableHead>
                    <TableHead className="text-right">Unit Cost (₦)</TableHead>
                    <TableHead className="text-right">Total Line Cost (₦)</TableHead>
                    <TableHead className="pr-4 text-center">Audit Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {req.itemsList.map((item: any, idx: number) => {
                    const hasSufficient = item.availableStock >= item.requestedQty;
                    return (
                      <TableRow key={item.id || idx} className="border-b-gray-100 hover:bg-gray-50">
                        <TableCell className="pl-4 font-medium text-gray-800">{item.name}</TableCell>
                        <TableCell className="text-gray-600 text-xs">{item.description || item.name}</TableCell>
                        <TableCell className="text-center text-xs">{item.unit}</TableCell>
                        <TableCell className="text-center font-bold text-[#3B7CED]">{item.requestedQty}</TableCell>
                        <TableCell className="text-center font-bold text-gray-800">{item.availableStock}</TableCell>
                        <TableCell className="text-right text-xs text-gray-600">{item.unitCost.toLocaleString()}</TableCell>
                        <TableCell className="text-right font-bold text-gray-900">{(item.requestedQty * item.unitCost).toLocaleString()}</TableCell>
                        <TableCell className="pr-4 text-center">
                          {hasSufficient ? (
                            <span className="inline-block px-2 py-0.5 text-[11px] rounded font-medium bg-green-100 text-green-700">
                              Sufficient Stock
                            </span>
                          ) : (
                            <span className="inline-block px-2 py-0.5 text-[11px] rounded font-medium bg-red-100 text-red-700">
                              Shortage
                            </span>
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
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
