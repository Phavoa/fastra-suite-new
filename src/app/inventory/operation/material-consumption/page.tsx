"use client";

import React, { useState } from "react";
import { ArrowLeft, Eye, ChevronDown, ChevronUp } from "lucide-react";
import Link from "next/link";
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

const pendingRequests = [
  {
    id: "REQ-2026-0142",
    project: "Project #1 - Site A Construction",
    wbsPhase: "Superstructure",
    wbsActivity: "First Floor Slab Reinforcement",
    equipmentId: "Tower Crane TC-01 (EQ-102)",
    requester: "Eng. John Doe (Site Engineer)",
    gateReceiver: "Mr. Abubakar (Site Foreman - 08031234567)",
    requisitionDate: "2026-06-27",
    issueDate: "2026-06-28",
    totalCost: 10200000,
    itemsList: [
      { id: "1", name: "Reinforcement Steel 16mm", unit: "Tonnes", requestedQty: 12, availableStock: 150, unitCost: 850000 },
      { id: "2", name: "Binding Wire", unit: "Rolls", requestedQty: 5, availableStock: 40, unitCost: 15000 }
    ],
    status: "pending",
  },
  {
    id: "REQ-2026-0143",
    project: "Project #2 - Site B Infrastructure",
    wbsPhase: "Substructure / Foundation",
    wbsActivity: "Drainage Trench Concrete",
    equipmentId: "Concrete Mixer CM-04 (EQ-088)",
    requester: "Eng. Jane Smith (Site Supervisor)",
    gateReceiver: "Engr. Kenneth (Project Supervisor - 08029876543)",
    requisitionDate: "2026-06-28",
    issueDate: "2026-06-29",
    totalCost: 1375000,
    itemsList: [
      { id: "3", name: "Cement (50kg Bag)", unit: "Bags", requestedQty: 250, availableStock: 500, unitCost: 5500 }
    ],
    status: "pending",
  },
];

export default function MaterialConsumptionApprovalsPage() {
  const [requests, setRequests] = useState(pendingRequests);
  const [expandedReqId, setExpandedReqId] = useState<string | null>(null);
  const [selectedRequest, setSelectedRequest] = useState<any>(null);
  const [rejectionReason, setRejectionReason] = useState("");
  const [actionType, setActionType] = useState<"approve" | "reject" | "clarify" | null>(null);
  
  const statusModal = useStatusModal();

  const toggleExpand = (id: string) => {
    setExpandedReqId(expandedReqId === id ? null : id);
  };

  const handleActionClick = (req: any, type: "approve" | "reject" | "clarify") => {
    setSelectedRequest(req);
    setActionType(type);
    setRejectionReason("");
  };

  const confirmAction = () => {
    if ((actionType === "reject" || actionType === "clarify") && !rejectionReason.trim()) {
      statusModal.showError("Reason Required", "You must provide a reason for rejection or clarification.");
      return;
    }

    setRequests(requests.filter(r => r.id !== selectedRequest.id));
    
    let title = "";
    let msg = "";
    if (actionType === "approve") {
      title = "Request Approved";
      msg = `Material Consumption ${selectedRequest.id} has been approved. Actual project costing and warehouse stock deduction have been posted to the Inventory Ledger.`;
    } else if (actionType === "reject") {
      title = "Request Rejected";
      msg = `Material Consumption ${selectedRequest.id} has been rejected. The submitter has been notified.`;
    } else {
      title = "Clarification Requested";
      msg = `Request sent back to submitter for clarification.`;
    }

    setSelectedRequest(null);
    setActionType(null);
    statusModal.showSuccess(title, msg);
  };

  return (
    <PageGuard application="inventory" module="materialconsumption">
      <div className="flex flex-col flex-1 min-h-[calc(100vh-64px)] bg-white relative pb-20">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-white">
          <div className="flex items-center">
            <Link href="/inventory/operation">
              <Button variant="ghost" size="icon" className="mr-2">
                <ArrowLeft className="h-5 w-5 text-gray-500" />
              </Button>
            </Link>
            <div>
              <h1 className="text-lg font-medium text-gray-800">Material Consumption Approvals (Storekeeper & Project Gate)</h1>
              <p className="text-xs text-gray-500 mt-0.5">Review site requisitions against WBS job allocations and real-time available stock.</p>
            </div>
          </div>
        </div>

        <div className="px-4 sm:px-6 py-6 max-w-[1400px] mx-auto w-full flex flex-col gap-8">
          <section>
            <h2 className="text-[#3B7CED] text-xl mb-6 font-medium">Pending Site Requisitions</h2>
            <div className="bg-white rounded border border-gray-200 shadow-sm overflow-hidden">
              <div className="overflow-x-auto w-full">
                <Table className="min-w-[900px] w-full">
                  <TableHeader>
                    <TableRow className="bg-[#F8F9FA] hover:bg-[#F8F9FA] border-b-gray-200">
                      <TableHead className="w-10 pl-4"></TableHead>
                      <TableHead className="py-3 font-medium text-gray-600 text-xs uppercase">Requisition ID</TableHead>
                      <TableHead className="py-3 font-medium text-gray-600 text-xs uppercase">Project & WBS Allocation</TableHead>
                      <TableHead className="py-3 font-medium text-gray-600 text-xs uppercase">Requester & Equipment</TableHead>
                      <TableHead className="py-3 font-medium text-gray-600 text-xs uppercase">Dates & Receiver</TableHead>
                      <TableHead className="py-3 font-medium text-gray-600 text-xs uppercase">Total Cost</TableHead>
                      <TableHead className="pr-6 py-3 font-medium text-gray-600 text-xs uppercase text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {requests.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7} className="px-6 py-10 text-center text-gray-400 italic">
                          No pending material consumption requests to review.
                        </TableCell>
                      </TableRow>
                    ) : (
                      requests.map((req) => (
                        <React.Fragment key={req.id}>
                          <TableRow className="hover:bg-gray-50/50 transition-colors border-b-gray-100 cursor-pointer" onClick={() => toggleExpand(req.id)}>
                            <TableCell className="pl-4 py-4 text-gray-400">
                              {expandedReqId === req.id ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                            </TableCell>
                            <TableCell className="py-4 font-mono font-semibold text-[#3B7CED]">{req.id}</TableCell>
                            <TableCell className="py-4">
                              <div className="font-medium text-gray-900">{req.project}</div>
                              <div className="text-gray-600 text-xs mt-0.5 font-medium">
                                <span className="text-blue-600">{req.wbsPhase}</span> → <span className="text-gray-700">{req.wbsActivity}</span>
                              </div>
                            </TableCell>
                            <TableCell className="py-4">
                              <div className="text-gray-800 text-sm font-medium">{req.requester}</div>
                              <div className="text-xs text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded w-fit mt-1 font-semibold">
                                🚜 {(req as any).equipmentId || "N/A"}
                              </div>
                            </TableCell>
                            <TableCell className="py-4">
                              <div className="text-xs text-gray-600">Req: <span className="font-semibold text-gray-800">{(req as any).requisitionDate || (req as any).date}</span></div>
                              <div className="text-xs text-gray-600 mt-0.5">Issue: <span className="font-semibold text-blue-600">{(req as any).issueDate || "Pending"}</span></div>
                              <div className="text-[11px] text-gray-500 truncate max-w-48 mt-1" title={(req as any).gateReceiver}>
                                📦 {(req as any).gateReceiver || "Not Specified"}
                              </div>
                            </TableCell>
                            <TableCell className="py-4 font-medium text-gray-900 text-sm">
                              ₦{req.totalCost.toLocaleString()} <span className="text-xs text-gray-500 font-normal">({req.itemsList.length} items)</span>
                            </TableCell>
                            <TableCell className="pr-6 py-4 text-right space-x-2" onClick={(e) => e.stopPropagation()}>
                              <Button variant="outline" size="sm" className="text-[#3B7CED] border-blue-200 hover:bg-blue-50 text-xs font-medium" onClick={() => handleActionClick(req, "clarify")}>
                                Clarify
                              </Button>
                              <Button variant="outline" size="sm" className="text-red-600 border-red-200 hover:bg-red-50 text-xs font-medium" onClick={() => handleActionClick(req, "reject")}>
                                Reject
                              </Button>
                              <Button size="sm" className="bg-[#2BA24D] hover:bg-[#238A40] text-white text-xs font-medium shadow-sm" onClick={() => handleActionClick(req, "approve")}>
                                Approve & Deduct Stock
                              </Button>
                            </TableCell>
                          </TableRow>

                          {/* Expanded Items & Stock Visibility Row */}
                          {expandedReqId === req.id && (
                            <TableRow className="bg-blue-50/30 border-b border-gray-200">
                              <TableCell colSpan={7} className="px-10 py-4">
                                <div className="bg-white rounded border border-gray-200 p-4 shadow-sm">
                                  <div className="flex flex-wrap items-center justify-between bg-gray-50 p-3 rounded border border-gray-100 mb-4 text-xs gap-4">
                                    <div>
                                      <span className="text-gray-500 font-medium">Gate Receiver / Signatory:</span>
                                      <p className="font-semibold text-gray-900 mt-0.5">{(req as any).gateReceiver}</p>
                                    </div>
                                    <div>
                                      <span className="text-gray-500 font-medium">Target Asset / Equipment:</span>
                                      <p className="font-semibold text-amber-700 mt-0.5">{(req as any).equipmentId}</p>
                                    </div>
                                    <div>
                                      <span className="text-gray-500 font-medium">Requisition vs Issue Date:</span>
                                      <p className="font-semibold text-gray-900 mt-0.5">{(req as any).requisitionDate} → {(req as any).issueDate}</p>
                                    </div>
                                  </div>
                                  <h4 className="text-xs font-semibold text-gray-700 uppercase mb-3">Requisition Line Items & Stock Visibility</h4>
                                  <Table className="w-full text-xs">
                                    <TableHeader>
                                      <TableRow className="bg-gray-50">
                                        <TableHead>Item Name</TableHead>
                                        <TableHead className="text-center">Unit</TableHead>
                                        <TableHead className="text-center">Requested QTY</TableHead>
                                        <TableHead className="text-center">Available Warehouse Stock</TableHead>
                                        <TableHead className="text-right">Unit Cost</TableHead>
                                        <TableHead className="text-right">Total Line Cost</TableHead>
                                        <TableHead className="text-center">Stock Status</TableHead>
                                      </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                      {req.itemsList.map((item) => {
                                        const hasSufficient = item.availableStock >= item.requestedQty;
                                        return (
                                          <TableRow key={item.id}>
                                            <TableCell className="font-medium text-gray-800">{item.name}</TableCell>
                                            <TableCell className="text-center">{item.unit}</TableCell>
                                            <TableCell className="text-center font-bold text-blue-600">{item.requestedQty}</TableCell>
                                            <TableCell className="text-center font-medium text-gray-700">{item.availableStock}</TableCell>
                                            <TableCell className="text-right">₦{item.unitCost.toLocaleString()}</TableCell>
                                            <TableCell className="text-right font-semibold">₦{(item.requestedQty * item.unitCost).toLocaleString()}</TableCell>
                                            <TableCell className="text-center">
                                              <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${hasSufficient ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                                                {hasSufficient ? "Sufficient Stock" : "Shortage Warning"}
                                              </span>
                                            </TableCell>
                                          </TableRow>
                                        );
                                      })}
                                    </TableBody>
                                  </Table>
                                </div>
                              </TableCell>
                            </TableRow>
                          )}
                        </React.Fragment>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </div>
          </section>
        </div>

        {/* Action Modal */}
        {selectedRequest && actionType && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="w-full max-w-md p-6 bg-white rounded-lg shadow-xl border border-gray-100">
              <h2 className="text-lg font-semibold text-gray-900 mb-2">
                {actionType === "approve" ? "Approve Requisition" : actionType === "reject" ? "Reject Requisition" : "Request Clarification"}
              </h2>
              <p className="text-sm text-gray-600 mb-4">
                Are you sure you want to {actionType} requisition <span className="font-mono font-semibold">{selectedRequest.id}</span>?
              </p>

              {(actionType === "reject" || actionType === "clarify") && (
                <div className="mb-4 space-y-2">
                  <label className="text-sm font-medium text-gray-700">
                    Reason <span className="text-red-500">*</span>
                  </label>
                  <Textarea 
                    placeholder={`Please provide a reason for ${actionType === "reject" ? "rejection" : "clarification"}...`}
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                    className="resize-none border-gray-300"
                    rows={3}
                  />
                </div>
              )}

              <div className="flex justify-end gap-3 mt-6">
                <Button variant="ghost" onClick={() => setSelectedRequest(null)} className="text-gray-600 hover:bg-gray-100 text-sm font-medium">
                  Cancel
                </Button>
                <Button 
                  onClick={confirmAction}
                  className={
                    actionType === "approve" ? "bg-[#2BA24D] hover:bg-[#238A40] text-white text-sm font-medium shadow-sm" :
                    actionType === "reject" ? "bg-[#E43D2B] hover:bg-[#C93020] text-white text-sm font-medium shadow-sm" :
                    "bg-[#3B7CED] hover:bg-[#2d63c7] text-white text-sm font-medium shadow-sm"
                  }
                >
                  Confirm {actionType.charAt(0).toUpperCase() + actionType.slice(1)}
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Status Modal */}
        <StatusModal
          isOpen={statusModal.isOpen}
          onClose={statusModal.close}
          type={statusModal.type}
          title={statusModal.title}
          message={statusModal.message}
          actionText="Close"
          onAction={statusModal.close}
          showCloseButton={false}
        />
      </div>
    </PageGuard>
  );
}
