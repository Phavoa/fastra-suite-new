"use client";

import React, { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  Bell,
  Calendar,
  User,
  CheckCircle,
  XCircle,
  HelpCircle,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { StatusModal, useStatusModal } from "@/components/shared/StatusModal";
import {
  useGetSubcontractorRequestQuery,
  useUpdateSubcontractorRequestMutation,
} from "@/api/subcontractorRequestApi";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

export default function SubcontractorRequestDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const statusModal = useStatusModal();
  const requestId = Number(params.id);

  const { data: request, isLoading, error } =
    useGetSubcontractorRequestQuery(requestId);
  const [updateRequest, { isLoading: isUpdating }] =
    useUpdateSubcontractorRequestMutation();

  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");
  const [isClarifyModalOpen, setIsClarifyModalOpen] = useState(false);
  const [clarificationNote, setClarificationNote] = useState("");

  const getStatusBadgeClass = (status?: string) => {
    switch (status) {
      case "approved":
      case "completed":
        return "bg-[#EAFDF0] text-[#2BA24D] border-none font-bold text-xs px-2.5 py-1 rounded-lg";
      case "submitted":
      case "clarification_needed":
      case "in_progress":
      case "pending":
        return "bg-[#FFFDF0] text-[#F0B401] border-none font-bold text-xs px-2.5 py-1 rounded-lg";
      case "draft":
        return "bg-[#EEF4FF] text-[#3B7CED] border-none font-bold text-xs px-2.5 py-1 rounded-lg";
      case "rejected":
        return "bg-[#FFF2F0] text-[#E43D2B] border-none font-bold text-xs px-2.5 py-1 rounded-lg";
      default:
        return "bg-[#FFFDF0] text-[#F0B401] border-none font-bold text-xs px-2.5 py-1 rounded-lg";
    }
  };

  const getStatusLabel = (status?: string) => {
    if (!status) return "Pending";
    switch (status) {
      case "clarification_needed":
        return "Clarification Needed";
      case "in_progress":
        return "In Progress";
      default:
        return status.charAt(0).toUpperCase() + status.slice(1);
    }
  };

  const handleApprove = async () => {
    try {
      await updateRequest({
        id: requestId,
        body: { status: "approved" },
      }).unwrap();

      statusModal.showSuccess(
        "Request Approved",
        `Subcontractor request SR-${String(requestId).padStart(
          5,
          "0"
        )} has been approved and moved to the processing queue.`
      );
    } catch (err) {
      statusModal.showError(
        "Approval Failed",
        "There was an error approving the request. Please try again."
      );
    }
  };

  const handleReject = async () => {
    if (!rejectionReason.trim()) return;

    try {
      await updateRequest({
        id: requestId,
        body: {
          status: "rejected",
        },
      }).unwrap();

      setIsRejectModalOpen(false);
      statusModal.showSuccess(
        "Request Rejected",
        `The request has been rejected. The submitter has been notified with the reason: "${rejectionReason}"`
      );
    } catch (err) {
      statusModal.showError(
        "Rejection Failed",
        "There was an error rejecting the request."
      );
    }
  };

  const handleClarify = async () => {
    if (!clarificationNote.trim()) return;

    try {
      await updateRequest({
        id: requestId,
        body: {
          status: "clarification_needed",
        },
      }).unwrap();

      setIsClarifyModalOpen(false);
      statusModal.showSuccess(
        "Clarification Requested",
        `The request has been sent back to the submitter for clarification.`
      );
    } catch (err) {
      statusModal.showError(
        "Action Failed",
        "There was an error processing your request."
      );
    }
  };

  const handleModalClose = () => {
    statusModal.close();
    if (statusModal.type === "success") {
      router.push("/project-request/subcontractor-request");
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#F9FAFB] flex flex-col items-center justify-center gap-3">
        <Loader2 className="w-8 h-8 text-[#3B7CED] animate-spin" />
        <p className="text-sm font-semibold text-gray-500">
          Loading request details...
        </p>
      </div>
    );
  }

  if (error || !request) {
    return (
      <div className="min-h-screen bg-[#F9FAFB] flex items-center justify-center p-4">
        <div className="text-center bg-white p-8 rounded-xl border border-gray-200 shadow-sm max-w-sm w-full">
          <XCircle className="h-12 w-12 mx-auto mb-4 text-red-500" />
          <p className="text-gray-700 font-semibold mb-4">
            Failed to load request details
          </p>
          <Button
            onClick={() => router.back()}
            className="w-full bg-[#3B7CED] text-white hover:bg-blue-600 font-bold h-11 rounded-xl"
          >
            Go Back
          </Button>
        </div>
      </div>
    );
  }

  const formattedDate = request.created_at
    ? new Date(request.created_at).toLocaleDateString("en-GB", {
        day: "numeric",
        month: "short",
        year: "numeric",
      })
    : "N/A";

  const totalContractFormatted = Number(
    request.contract_value || 0
  ).toLocaleString("en-NG", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  return (
    <div className="min-h-screen bg-[#F9FAFB] pb-24 font-sans antialiased text-gray-900">
      {/* Header Bar */}
      <header className="w-full border-b border-gray-100 bg-white sticky top-0 z-30 shadow-none">
        <div className="max-w-2xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.push("/project-request/subcontractor-request")}
              className="p-1.5 rounded-lg hover:bg-gray-50 transition-colors"
              aria-label="Back"
            >
              <ArrowLeft size={20} className="text-gray-600" />
            </button>
            <h1 className="text-lg font-bold text-gray-800">Request Details</h1>
          </div>

          <div className="flex items-center gap-3">
            <button className="p-2 rounded-lg hover:bg-gray-50 transition-colors">
              <Bell size={20} className="text-gray-800" />
            </button>
            <div className="w-8 h-8 rounded-full overflow-hidden border border-gray-200">
              <img
                src="https://api.dicebear.com/7.x/pixel-art/svg?seed=user123"
                alt="User Profile"
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-2xl mx-auto px-4 pt-4 space-y-4">
        {/* Basic Header Info */}
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-none space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <span className="text-xs font-bold text-[#3B7CED] uppercase">
                {request.reference_id || `SR-${String(request.id).padStart(5, "0")}`}
              </span>
              <h2 className="text-lg font-bold text-gray-900 mt-1">
                {request.vendor_name || "Subcontractor Contract"}
              </h2>
            </div>
            <span className={getStatusBadgeClass(request.status)}>
              {getStatusLabel(request.status)}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-100 text-xs">
            <div>
              <span className="block text-gray-400 font-semibold mb-0.5">
                Date Requested
              </span>
              <span className="font-bold text-gray-800 flex items-center gap-1">
                <Calendar size={14} className="text-gray-500" /> {formattedDate}
              </span>
            </div>
            <div>
              <span className="block text-gray-400 font-semibold mb-0.5">
                Requested By
              </span>
              <span className="font-bold text-gray-800 flex items-center gap-1">
                <User size={14} className="text-gray-500" />{" "}
                {request.created_by_name || `User #${request.created_by || 1}`}
              </span>
            </div>
          </div>
        </div>

        {/* Subcontractor Details */}
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-none space-y-4">
          <h3 className="text-sm font-bold text-[#3B7CED] uppercase tracking-wider flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-[#3B7CED]" />
            Contract Details
          </h3>

          <div className="space-y-3 text-xs">
            <div className="flex justify-between py-1.5 border-b border-gray-50">
              <span className="text-gray-500 font-semibold">Subcontractor</span>
              <span className="font-bold text-gray-900">
                {request.vendor_name || "N/A"} ({request.vendor_email})
              </span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-gray-50">
              <span className="text-gray-500 font-semibold">Payment Type</span>
              <span className="font-bold text-gray-900 capitalize">
                {request.payment_type?.replace("_", " ") || "Lump Sum"}
              </span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-gray-50">
              <span className="text-gray-500 font-semibold">Contract Value</span>
              <span className="font-black text-[#3B7CED] text-sm">
                ₦{totalContractFormatted}
              </span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-gray-50">
              <span className="text-gray-500 font-semibold">Timeline</span>
              <span className="font-bold text-gray-900">
                {request.start_date || "N/A"} to {request.end_date || "N/A"}
              </span>
            </div>
            <div className="flex justify-between py-1.5">
              <span className="text-gray-500 font-semibold">Payment Terms</span>
              <span className="font-bold text-gray-900">
                {request.payment_terms || "Standard terms"}
              </span>
            </div>
          </div>
        </div>

        {/* Scope of Work & Justification */}
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-none space-y-4">
          <h3 className="text-sm font-bold text-[#3B7CED] uppercase tracking-wider flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-[#3B7CED]" />
            Scope & Justification
          </h3>

          <div className="space-y-3 text-xs">
            <div>
              <span className="block text-gray-500 font-semibold mb-1">
                Scope of Work
              </span>
              <p className="text-gray-800 bg-gray-50 p-3 rounded-lg border border-gray-100 leading-relaxed italic">
                "{request.scope_of_work || "N/A"}"
              </p>
            </div>
            {request.justification_notes && (
              <div className="pt-2">
                <span className="block text-gray-500 font-semibold mb-1">
                  Justification Notes
                </span>
                <p className="text-gray-800 bg-gray-50 p-3 rounded-lg border border-gray-100 leading-relaxed">
                  {request.justification_notes}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Milestones Section */}
        {request.payment_type === "milestone" &&
          request.milestones &&
          request.milestones.length > 0 && (
            <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-none space-y-4">
              <h3 className="text-sm font-bold text-[#3B7CED] uppercase tracking-wider flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-[#3B7CED]" />
                Project Milestones
              </h3>

              <div className="border border-gray-100 rounded-xl overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead className="bg-gray-50 border-b border-gray-100 text-gray-500 font-bold uppercase">
                    <tr>
                      <th className="p-3">Milestone</th>
                      <th className="p-3 text-center">Weight</th>
                      <th className="p-3 text-right">Value (₦)</th>
                      <th className="p-3 text-center">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {request.milestones.map((m: any, idx: number) => (
                      <tr key={idx} className="hover:bg-gray-50/50">
                        <td className="p-3 font-semibold text-gray-900">
                          <div>{m.name}</div>
                          {m.completion_criteria && (
                            <div className="text-[11px] text-gray-500 font-normal mt-0.5">
                              {m.completion_criteria}
                            </div>
                          )}
                        </td>
                        <td className="p-3 text-center font-medium">
                          {m.percentage}%
                        </td>
                        <td className="p-3 text-right font-bold text-gray-900">
                          ₦
                          {(
                            (Number(m.percentage) / 100) *
                            Number(request.contract_value || 0)
                          ).toLocaleString(undefined, {
                            minimumFractionDigits: 2,
                          })}
                        </td>
                        <td className="p-3 text-center">
                          {m.is_completed ? (
                            <span className="px-2 py-0.5 bg-green-100 text-green-700 text-[10px] font-bold rounded uppercase">
                              Completed
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 bg-gray-100 text-gray-600 text-[10px] font-bold rounded uppercase">
                              Pending
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

        {/* Audit Trail & History */}
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-none space-y-4">
          <h3 className="text-sm font-bold text-[#3B7CED] uppercase tracking-wider flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-[#3B7CED]" />
            Audit Trail
          </h3>

          <div className="space-y-4 relative before:absolute before:left-[11px] before:top-2 before:bottom-2 before:w-0.5 before:bg-gray-100 text-xs">
            <div className="relative pl-7">
              <span className="absolute left-0 top-0.5 w-6 h-6 bg-blue-50 rounded-full flex items-center justify-center border-2 border-white shadow-xs">
                <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
              </span>
              <div>
                <p className="font-bold text-gray-900">Request Created</p>
                <p className="text-gray-400 text-[11px]">
                  {new Date(request.created_at || Date.now()).toLocaleString("en-GB")}
                </p>
              </div>
            </div>

            {request.status !== "draft" && (
              <div className="relative pl-7">
                <span className="absolute left-0 top-0.5 w-6 h-6 bg-amber-50 rounded-full flex items-center justify-center border-2 border-white shadow-xs">
                  <span className="w-2 h-2 bg-amber-500 rounded-full"></span>
                </span>
                <div>
                  <p className="font-bold text-gray-900">Submitted for Approval</p>
                  <p className="text-gray-400 text-[11px]">
                    {new Date(request.created_at || Date.now()).toLocaleString("en-GB")}
                  </p>
                </div>
              </div>
            )}

            {request.status === "approved" && (
              <div className="relative pl-7">
                <span className="absolute left-0 top-0.5 w-6 h-6 bg-green-50 rounded-full flex items-center justify-center border-2 border-white shadow-xs">
                  <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                </span>
                <div>
                  <p className="font-bold text-gray-900">Request Approved</p>
                  <p className="text-gray-400 text-[11px]">Just now</p>
                  <p className="text-green-700 mt-1 italic font-medium">
                    "Budget validation passed. Ready for processing."
                  </p>
                </div>
              </div>
            )}

            {request.status === "rejected" && (
              <div className="relative pl-7">
                <span className="absolute left-0 top-0.5 w-6 h-6 bg-red-50 rounded-full flex items-center justify-center border-2 border-white shadow-xs">
                  <span className="w-2 h-2 bg-red-500 rounded-full"></span>
                </span>
                <div>
                  <p className="font-bold text-gray-900">Request Rejected</p>
                  <p className="text-gray-400 text-[11px]">Just now</p>
                  <p className="text-red-600 mt-1 italic font-medium">
                    "Reason: {rejectionReason || "Exceeds budget allocation."}"
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Action Buttons inside Card */}
        {request.status === "submitted" && (
          <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-none flex flex-wrap justify-end gap-3">
            <Button
              variant="outline"
              onClick={() => setIsClarifyModalOpen(true)}
              className="h-10 px-5 text-xs font-bold border-gray-300 text-gray-700 hover:bg-gray-50 rounded-xl"
            >
              <HelpCircle size={14} className="mr-2" />
              Request Clarification
            </Button>
            <Button
              variant="outline"
              onClick={() => setIsRejectModalOpen(true)}
              className="h-10 px-5 text-xs font-bold border-red-200 text-red-600 hover:bg-red-50 rounded-xl"
            >
              <XCircle size={14} className="mr-2" />
              Reject Request
            </Button>
            <Button
              onClick={handleApprove}
              disabled={isUpdating}
              className="h-10 px-6 text-xs font-bold bg-[#3B7CED] hover:bg-[#2d63c7] text-white shadow-xs rounded-xl"
            >
              <CheckCircle size={14} className="mr-2" />
              {isUpdating ? "Approving..." : "Approve Request"}
            </Button>
          </div>
        )}
      </main>

      {/* Reject Modal */}
      <Dialog open={isRejectModalOpen} onOpenChange={setIsRejectModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-red-600">Reject Request</DialogTitle>
            <DialogDescription>
              Please provide a reason for rejecting this subcontractor request. This
              will be visible to the submitter.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Label htmlFor="reason" className="mb-2 block text-xs font-bold">
              Rejection Reason *
            </Label>
            <Textarea
              id="reason"
              placeholder="e.g. Contract value exceeds budget limits or scope is unclear."
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              rows={4}
              className="text-xs rounded-xl"
            />
          </div>
          <DialogFooter>
            <Button
              variant="ghost"
              onClick={() => setIsRejectModalOpen(false)}
              className="text-xs font-bold"
            >
              Cancel
            </Button>
            <Button
              className="bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-xl"
              onClick={handleReject}
              disabled={!rejectionReason.trim()}
            >
              Confirm Rejection
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Clarification Modal */}
      <Dialog open={isClarifyModalOpen} onOpenChange={setIsClarifyModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Request Clarification</DialogTitle>
            <DialogDescription>
              Explain what information is missing or needs adjustment.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Label htmlFor="note" className="mb-2 block text-xs font-bold">
              Clarification Note *
            </Label>
            <Textarea
              id="note"
              placeholder="Please provide more details on..."
              value={clarificationNote}
              onChange={(e) => setClarificationNote(e.target.value)}
              rows={4}
              className="text-xs rounded-xl"
            />
          </div>
          <DialogFooter>
            <Button
              variant="ghost"
              onClick={() => setIsClarifyModalOpen(false)}
              className="text-xs font-bold"
            >
              Cancel
            </Button>
            <Button
              className="bg-[#3B7CED] text-white hover:bg-blue-700 text-xs font-bold rounded-xl"
              onClick={handleClarify}
              disabled={!clarificationNote.trim()}
            >
              Send Back
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <StatusModal
        isOpen={statusModal.isOpen}
        onClose={handleModalClose}
        type={statusModal.type}
        title={statusModal.title}
        message={statusModal.message}
        actionText="Back to List"
        onAction={handleModalClose}
        showCloseButton={false}
      />
    </div>
  );
}
