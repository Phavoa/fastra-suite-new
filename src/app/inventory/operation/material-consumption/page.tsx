"use client";

import React, { useState } from "react";
import { Check, X, Eye, AlertCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { StatusModal, useStatusModal } from "@/components/shared/StatusModal";
import { Textarea } from "@/components/ui/textarea";

// Mock Data for Pending Approvals
const pendingRequests = [
  {
    id: "MCR00012",
    project: "Project #1 - Alpha",
    wbsElement: "Foundation / Concrete Pour",
    requester: "John Doe",
    date: "2026-04-28",
    totalCost: 450000,
    items: 3,
    status: "pending",
  },
  {
    id: "MCR00013",
    project: "Project #2 - Beta",
    wbsElement: "Structure / Framing",
    requester: "Jane Smith",
    date: "2026-04-27",
    totalCost: 125000,
    items: 1,
    status: "pending",
  },
];

export default function MaterialConsumptionApprovalsPage() {
  const [requests, setRequests] = useState(pendingRequests);
  const [selectedRequest, setSelectedRequest] = useState<any>(null);
  const [rejectionReason, setRejectionReason] = useState("");
  const [actionType, setActionType] = useState<"approve" | "reject" | "clarify" | null>(null);
  
  const statusModal = useStatusModal();

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

    // Process Action
    setRequests(requests.filter(r => r.id !== selectedRequest.id));
    
    let title = "";
    let msg = "";
    if (actionType === "approve") {
      title = "Request Approved";
      msg = `Material Consumption ${selectedRequest.id} has been approved. Actual cost and inventory have been updated.`;
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
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">Material Consumption Approvals</h1>
        <p className="text-sm text-gray-500 mt-1">Review and approve site material consumption requests.</p>
      </div>

      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-gray-50 text-gray-600 font-medium border-b border-gray-200">
              <tr>
                <th className="px-6 py-4">Request ID</th>
                <th className="px-6 py-4">Project & WBS</th>
                <th className="px-6 py-4">Requester</th>
                <th className="px-6 py-4">Date</th>
                <th className="px-6 py-4">Total Cost</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {requests.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                    No pending material consumption requests to review.
                  </td>
                </tr>
              ) : (
                requests.map((req) => (
                  <tr key={req.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4 font-medium text-blue-600">{req.id}</td>
                    <td className="px-6 py-4">
                      <div className="font-medium text-gray-900">{req.project}</div>
                      <div className="text-gray-500 text-xs mt-0.5">{req.wbsElement}</div>
                    </td>
                    <td className="px-6 py-4 text-gray-600">{req.requester}</td>
                    <td className="px-6 py-4 text-gray-600">{req.date}</td>
                    <td className="px-6 py-4 font-medium text-gray-900">
                      ₦{req.totalCost.toLocaleString()} <span className="text-xs text-gray-500 font-normal">({req.items} items)</span>
                    </td>
                    <td className="px-6 py-4 text-right space-x-2">
                      <Button variant="outline" size="sm" className="text-blue-600 border-blue-200 hover:bg-blue-50" onClick={() => handleActionClick(req, "clarify")}>
                        Clarify
                      </Button>
                      <Button variant="outline" size="sm" className="text-red-600 border-red-200 hover:bg-red-50" onClick={() => handleActionClick(req, "reject")}>
                        Reject
                      </Button>
                      <Button variant="contained" size="sm" className="bg-[#2BA24D] hover:bg-[#238A40] text-white" onClick={() => handleActionClick(req, "approve")}>
                        Approve
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Action Modal */}
      {selectedRequest && actionType && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <Card className="w-full max-w-md p-6 bg-white shadow-xl">
            <h2 className="text-lg font-semibold text-gray-900 mb-2">
              {actionType === "approve" ? "Approve Request" : actionType === "reject" ? "Reject Request" : "Request Clarification"}
            </h2>
            <p className="text-sm text-gray-600 mb-4">
              Are you sure you want to {actionType} request <strong>{selectedRequest.id}</strong>?
            </p>

            {(actionType === "reject" || actionType === "clarify") && (
              <div className="mb-4 space-y-2">
                <label className="text-sm font-semibold text-gray-900">
                  Reason <span className="text-red-500">*</span>
                </label>
                <Textarea 
                  placeholder={`Please provide a reason for ${actionType === "reject" ? "rejection" : "clarification"}...`}
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  className="resize-none"
                  rows={3}
                />
              </div>
            )}

            <div className="flex justify-end gap-3 mt-6">
              <Button variant="ghost" onClick={() => setSelectedRequest(null)} className="text-gray-600">
                Cancel
              </Button>
              <Button 
                variant="contained" 
                onClick={confirmAction}
                className={
                  actionType === "approve" ? "bg-[#2BA24D] hover:bg-[#238A40] text-white" :
                  actionType === "reject" ? "bg-[#E43D2B] hover:bg-[#C93020] text-white" :
                  "bg-[#3B7CED] hover:bg-[#2d63c7] text-white"
                }
              >
                Confirm {actionType.charAt(0).toUpperCase() + actionType.slice(1)}
              </Button>
            </div>
          </Card>
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
  );
}
