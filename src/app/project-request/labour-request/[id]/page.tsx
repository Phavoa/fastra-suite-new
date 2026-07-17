"use client";

import React, { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  Bell,
  Calendar,
  User,
  Edit,
  Trash2,
  Send,
  CheckCircle,
  XCircle,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { StatusModal, useStatusModal } from "@/components/shared/StatusModal";
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
import {
  useGetLabourRequestQuery,
  useDeleteLabourRequestMutation,
  useSubmitLabourRequestMutation,
  useApproveLabourRequestMutation,
  useRejectLabourRequestMutation,
} from "@/api/requests/labourRequestApi";
import { usePermissionContext } from "@/contexts/PermissionContext";

export default function LabourRequestDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = parseInt(params.id as string);
  const { permissions, isAdmin } = usePermissionContext();
  const statusModal = useStatusModal();

  const {
    data: request,
    isLoading,
    error,
    refetch,
  } = useGetLabourRequestQuery(id, {
    skip: isNaN(id),
  });

  const [deleteRequest, { isLoading: isDeleting }] =
    useDeleteLabourRequestMutation();
  const [submitRequest, { isLoading: isSubmitting }] =
    useSubmitLabourRequestMutation();
  const [approveLabourRequest, { isLoading: isApproving }] =
    useApproveLabourRequestMutation();
  const [rejectLabourRequest, { isLoading: isRejecting }] =
    useRejectLabourRequestMutation();

  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");
  const [isApproveModalOpen, setIsApproveModalOpen] = useState(false);
  const [approvalNotes, setApprovalNotes] = useState("");
  const [isConfirmDeleteOpen, setIsConfirmDeleteOpen] = useState(false);

  const getStatusBadgeClass = (status?: string) => {
    switch (status) {
      case "approved":
        return "bg-[#EAFDF0] text-[#2BA24D] border-none font-bold text-xs px-2.5 py-1 rounded-lg";
      case "pending":
        return "bg-[#FFFDF0] text-[#F0B401] border-none font-bold text-xs px-2.5 py-1 rounded-lg";
      case "draft":
        return "bg-[#EEF4FF] text-[#3B7CED] border-none font-bold text-xs px-2.5 py-1 rounded-lg";
      case "rejected":
      case "cancelled":
        return "bg-[#FFF2F0] text-[#E43D2B] border-none font-bold text-xs px-2.5 py-1 rounded-lg";
      default:
        return "bg-[#FFFDF0] text-[#F0B401] border-none font-bold text-xs px-2.5 py-1 rounded-lg";
    }
  };

  const handleEdit = () => {
    router.push(`/project-request/labour-request/edit/${id}`);
  };

  const handleDelete = async () => {
    try {
      await deleteRequest(id).unwrap();
      setIsConfirmDeleteOpen(false);
      statusModal.showSuccess(
        "Request Deleted",
        "The labour request has been deleted successfully."
      );
    } catch (error) {
      console.error("Failed to delete request:", error);
      statusModal.showError("Error", "Failed to delete the request. Please try again.");
    }
  };

  const handleSubmit = async () => {
    try {
      await submitRequest({ id, data: {} }).unwrap();
      statusModal.showSuccess(
        "Request Submitted",
        "The labour request has been submitted for approval."
      );
      refetch();
    } catch (error) {
      console.error("Failed to submit request:", error);
      statusModal.showError("Error", "Failed to submit the request. Please try again.");
    }
  };

  const handleApprove = async () => {
    try {
      await approveLabourRequest({
        id,
        data: { status: "approved", approval_notes: approvalNotes },
      }).unwrap();
      setIsApproveModalOpen(false);
      statusModal.showSuccess(
        "Request Approved",
        "The labour request has been approved successfully."
      );
      refetch();
    } catch (error) {
      console.error("Failed to approve request:", error);
      statusModal.showError("Error", "Failed to approve the request. Please try again.");
    }
  };

  const handleReject = async () => {
    if (!rejectionReason.trim()) return;
    try {
      await rejectLabourRequest({
        id,
        data: { status: "rejected", rejection_notes: rejectionReason },
      }).unwrap();
      setIsRejectModalOpen(false);
      statusModal.showSuccess(
        "Request Rejected",
        "The labour request has been rejected."
      );
    } catch (error) {
      console.error("Failed to reject request:", error);
      statusModal.showError("Error", "Failed to reject the request. Please try again.");
    }
  };

  const handleModalClose = () => {
    statusModal.close();
    if (
      statusModal.type === "success" &&
      !isApproveModalOpen &&
      !isRejectModalOpen &&
      !isConfirmDeleteOpen
    ) {
      router.push("/project-request/labour-request");
    }
  };

  // Permission checks
  const canEdit =
    request?.status === "draft" &&
    (isAdmin || permissions["labour-request"]?.has("edit"));
  const canDelete =
    request?.status === "draft" &&
    (isAdmin || permissions["labour-request"]?.has("delete"));
  const canSubmit = request?.status === "draft";
  const canApproveReject =
    isAdmin || permissions["labour-request"]?.has("approve");

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#F9FAFB] flex flex-col items-center justify-center gap-3">
        <Loader2 className="w-8 h-8 text-[#3B7CED] animate-spin" />
        <p className="text-sm font-semibold text-gray-500">Loading request details...</p>
      </div>
    );
  }

  if (error || !request) {
    return (
      <div className="min-h-screen bg-[#F9FAFB] flex items-center justify-center p-4">
        <div className="text-center bg-white p-8 rounded-xl border border-gray-200 shadow-sm max-w-sm w-full">
          <XCircle className="h-12 w-12 mx-auto mb-4 text-red-500" />
          <p className="text-gray-700 font-semibold mb-4">Failed to load request details</p>
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

  const detail = request?.detail || (request as any) || {};
  const projectRequest = request?.project_request || (request as any) || {};

  const requesterName =
    projectRequest?.created_by_details?.user?.first_name ||
    projectRequest?.created_by_details?.user?.username ||
    detail?.created_by_name ||
    (request as any)?.created_by_name ||
    `User #${request?.created_by || 1}`;

  const formattedRequiredDate = detail?.date_required
    ? new Date(detail.date_required).toLocaleDateString("en-GB", {
        day: "numeric",
        month: "short",
        year: "numeric",
      })
    : new Date(request?.created_at || Date.now()).toLocaleDateString("en-GB", {
        day: "numeric",
        month: "short",
        year: "numeric",
      });

  const calculatedCost =
    parseFloat(detail?.projected_cost || "0") ||
    (detail?.number_of_workers || 0) *
      parseFloat(detail?.estimated_daily_rate || "0") *
      (detail?.duration || 1);

  const totalCostFormatted = calculatedCost.toLocaleString("en-NG", {
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
              onClick={() => router.push("/project-request/labour-request")}
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
                {request.reference_id || `LR-${request.id}`}
              </span>
              <h2 className="text-lg font-bold text-gray-900 mt-1 capitalize">
                {detail.role_type || "Worker"} ({detail.number_of_workers || 1} Workers)
              </h2>
            </div>
            <span className={getStatusBadgeClass(request.status)}>
              {request.status
                ? request.status.charAt(0).toUpperCase() + request.status.slice(1)
                : "Draft"}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-100 text-xs">
            <div>
              <span className="block text-gray-400 font-semibold mb-0.5">
                Date Required
              </span>
              <span className="font-bold text-gray-800 flex items-center gap-1">
                <Calendar size={14} className="text-gray-500" /> {formattedRequiredDate}
              </span>
            </div>
            <div>
              <span className="block text-gray-400 font-semibold mb-0.5">
                Requested By
              </span>
              <span className="font-bold text-gray-800 flex items-center gap-1">
                <User size={14} className="text-gray-500" /> {requesterName}
              </span>
            </div>
          </div>
        </div>

        {/* Labour Details */}
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-none space-y-4">
          <h3 className="text-sm font-bold text-[#3B7CED] uppercase tracking-wider flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-[#3B7CED]" />
            Labour Details
          </h3>

          <div className="space-y-3 text-xs">
            <div className="flex justify-between py-1.5 border-b border-gray-50">
              <span className="text-gray-500 font-semibold">Project</span>
              <span className="font-bold text-gray-900">
                Project #{projectRequest?.project || "General"}
              </span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-gray-50">
              <span className="text-gray-500 font-semibold">Number of Workers</span>
              <span className="font-bold text-gray-900">
                {detail.number_of_workers || 1} Workers
              </span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-gray-50">
              <span className="text-gray-500 font-semibold">Role / Trade Type</span>
              <span className="font-bold text-gray-900 capitalize">
                {detail.role_type || "Worker"}
              </span>
            </div>
            <div className="flex justify-between py-1.5">
              <span className="text-gray-500 font-semibold">Duration</span>
              <span className="font-bold text-gray-900 capitalize">
                {detail.duration || 1} {detail.duration_unit || "days"}
              </span>
            </div>
          </div>
        </div>

        {/* Cost & Justification */}
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-none space-y-4">
          <h3 className="text-sm font-bold text-[#3B7CED] uppercase tracking-wider flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-[#3B7CED]" />
            Cost Breakdown
          </h3>

          <div className="space-y-3 text-xs">
            <div className="flex justify-between py-1.5 border-b border-gray-50">
              <span className="text-gray-500 font-semibold">
                {detail.duration_unit === "weeks"
                  ? "Weekly Rate"
                  : detail.duration_unit === "months"
                  ? "Monthly Rate"
                  : "Daily Rate"}
              </span>
              <span className="font-bold text-gray-900">
                ₦
                {parseFloat(detail.estimated_daily_rate || "0").toLocaleString(
                  "en-NG",
                  { minimumFractionDigits: 2 }
                )}
              </span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-gray-50">
              <span className="text-gray-500 font-semibold">Projected Cost</span>
              <span className="font-black text-[#3B7CED] text-sm">
                ₦{totalCostFormatted}
              </span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-gray-50">
              <span className="text-gray-500 font-semibold">Destination Module</span>
              <span className="font-bold text-gray-900 capitalize">
                {request.module_destination ? request.module_destination.replace("_", " ") : "N/A"}
              </span>
            </div>
            {detail.justification_notes && (
              <div className="pt-2">
                <span className="block text-gray-500 font-semibold mb-1">
                  Justification Notes
                </span>
                <p className="text-gray-800 bg-gray-50 p-3 rounded-lg border border-gray-100 leading-relaxed">
                  {detail.justification_notes}
                </p>
              </div>
            )}
          </div>
        </div>

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
                  {new Date(request.created_at).toLocaleString("en-GB")}
                </p>
                <p className="text-gray-600 mt-0.5">
                  Initiated by {requesterName}
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
                    {new Date(request.updated_at || request.created_at).toLocaleString(
                      "en-GB"
                    )}
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
                  <p className="text-gray-400 text-[11px]">
                    {new Date(request.updated_at).toLocaleString("en-GB")}
                  </p>
                  {approvalNotes && (
                    <p className="text-green-700 mt-1 italic font-medium">
                      "{approvalNotes}"
                    </p>
                  )}
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
                  <p className="text-gray-400 text-[11px]">
                    {new Date(request.updated_at).toLocaleString("en-GB")}
                  </p>
                  {rejectionReason && (
                    <p className="text-red-600 mt-1 italic font-medium">
                      "{rejectionReason}"
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Action Buttons inside Card */}
        {(canEdit ||
          canDelete ||
          canSubmit ||
          (canApproveReject && request.status === "pending")) && (
          <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-none flex flex-wrap justify-end gap-3">
            {canEdit && (
              <Button
                variant="outline"
                onClick={handleEdit}
                className="h-10 px-5 text-xs font-bold border-gray-300 text-gray-700 hover:bg-gray-50 rounded-xl"
              >
                <Edit size={14} className="mr-2" />
                Edit Request
              </Button>
            )}

            {canDelete && (
              <Button
                variant="outline"
                onClick={() => setIsConfirmDeleteOpen(true)}
                disabled={isDeleting}
                className="h-10 px-5 text-xs font-bold border-red-200 text-red-600 hover:bg-red-50 rounded-xl"
              >
                <Trash2 size={14} className="mr-2" />
                Delete Request
              </Button>
            )}

            {canSubmit && (
              <Button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="h-10 px-6 text-xs font-bold bg-[#3B7CED] hover:bg-[#2d63c7] text-white shadow-xs rounded-xl"
              >
                <Send size={14} className="mr-2" />
                {isSubmitting ? "Submitting..." : "Submit for Approval"}
              </Button>
            )}

            {canApproveReject && request.status === "pending" && (
              <>
                <Button
                  variant="outline"
                  onClick={() => setIsRejectModalOpen(true)}
                  disabled={isRejecting}
                  className="h-10 px-5 text-xs font-bold border-red-200 text-red-600 hover:bg-red-50 rounded-xl"
                >
                  <XCircle size={14} className="mr-2" />
                  Reject Request
                </Button>
                <Button
                  onClick={() => setIsApproveModalOpen(true)}
                  disabled={isApproving}
                  className="h-10 px-6 text-xs font-bold bg-[#2BA24D] hover:bg-[#238c3f] text-white shadow-xs rounded-xl"
                >
                  <CheckCircle size={14} className="mr-2" />
                  Approve Request
                </Button>
              </>
            )}
          </div>
        )}
      </main>

      {/* Reject Modal */}
      <Dialog open={isRejectModalOpen} onOpenChange={setIsRejectModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-red-600">Reject Request</DialogTitle>
            <DialogDescription>
              Please provide a reason for rejecting this labour request. This will be
              logged in the history.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Label htmlFor="reason" className="mb-2 block text-xs font-bold">
              Rejection Reason *
            </Label>
            <Textarea
              id="reason"
              placeholder="e.g. Rate exceeds WBS allocation limit."
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
              disabled={!rejectionReason.trim() || isRejecting}
            >
              {isRejecting ? "Rejecting..." : "Confirm Rejection"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Approve Modal */}
      <Dialog open={isApproveModalOpen} onOpenChange={setIsApproveModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-green-600">Approve Request</DialogTitle>
            <DialogDescription>
              Optional: Enter approval notes for reference.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Label htmlFor="notes" className="mb-2 block text-xs font-bold">
              Approval Notes
            </Label>
            <Textarea
              id="notes"
              placeholder="e.g. Budget check passed."
              value={approvalNotes}
              onChange={(e) => setApprovalNotes(e.target.value)}
              rows={4}
              className="text-xs rounded-xl"
            />
          </div>
          <DialogFooter>
            <Button
              variant="ghost"
              onClick={() => setIsApproveModalOpen(false)}
              className="text-xs font-bold"
            >
              Cancel
            </Button>
            <Button
              className="bg-[#2BA24D] hover:bg-green-700 text-white text-xs font-bold rounded-xl"
              onClick={handleApprove}
              disabled={isApproving}
            >
              {isApproving ? "Approving..." : "Approve Request"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Confirm Delete Modal */}
      <Dialog open={isConfirmDeleteOpen} onOpenChange={setIsConfirmDeleteOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-red-600">Delete Request</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this labour request? This action cannot be
              undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="ghost"
              onClick={() => setIsConfirmDeleteOpen(false)}
              className="text-xs font-bold"
            >
              Cancel
            </Button>
            <Button
              className="bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-xl"
              onClick={handleDelete}
              disabled={isDeleting}
            >
              {isDeleting ? "Deleting..." : "Confirm Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Status Modal */}
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
