"use client";

import React, { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  Edit,
  Trash2,
  Send,
  CheckCircle,
  XCircle,
  Wifi,
  WifiOff,
  RefreshCw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { StatusModal, useStatusModal } from "@/components/shared/StatusModal";
import { Skeleton } from "@/components/ui/skeleton";
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
import { PageHeader } from "@/components/purchase/products/PageHeader";
import {
  FadeIn,
  SlideUp,
  StaggerContainer,
} from "@/components/shared/AnimatedWrapper";
import {
  useGetLabourRequestQuery,
  useDeleteLabourRequestMutation,
  useSubmitLabourRequestMutation,
  useApproveLabourRequestMutation,
  useRejectLabourRequestMutation,
} from "@/api/requests/labourRequestApi";
import { useNetworkStatus } from "@/hooks/useNetworkStatus";
import { syncService } from "@/lib/database/syncService";
import { usePermissionContext } from "@/contexts/PermissionContext";
import { db } from "@/lib/database/labourRequestDb";

interface LabourRequestDetail {
  id: number;
  date_required: string;
  number_of_workers: number;
  role_type: string;
  duration: number;
  duration_unit: "days";
  estimated_daily_rate: string;
  projected_cost: string;
  justification_notes: string;
  status?: "draft" | "pending" | "approved" | "rejected" | "cancelled";
}

interface LabourRequestFull {
  id: number;
  reference_id: string;
  request_type: string;
  module_destination: string;
  status: "draft" | "pending" | "approved" | "rejected";
  created_by: number;
  created_at: string;
  updated_at: string;
  detail: LabourRequestDetail;
  project_request: {
    id: number;
    reference_id: string;
    request_type: string;
    status: "draft" | "pending" | "approved" | "rejected";
    module_destination: string;
    created_at: string;
    updated_at: string;
    project: number;
    created_by: number;
    created_by_details?: {
      id: number;
      user: {
        id: number;
        username: string;
        first_name: string;
        last_name: string;
        email: string;
      };
      role: string;
    };
  };
}

export default function LabourRequestDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = parseInt(params.id as string);
  const networkStatus = useNetworkStatus();
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

  const getStatusBadgeVariant = (status?: string) => {
    if (!status) return "draft";
    switch (status) {
      case "approved":
        return "validated";
      case "pending":
        return "pending";
      case "draft":
        return "draft";
      case "rejected":
        return "rejected";
      default:
        return "draft";
    }
  };

  const getStatusLabel = (status?: string) => {
    if (!status) return "Draft";
    return status.charAt(0).toUpperCase() + status.slice(1);
  };

  const handleEdit = () => {
    router.push(`/project-request/labour-request/edit/${id}`);
  };

  const handleDelete = async () => {
    try {
      if (networkStatus.isOnline) {
        await deleteRequest(id).unwrap();
        setIsConfirmDeleteOpen(false);
        statusModal.showSuccess(
          "Request Deleted",
          "The labour request has been deleted successfully."
        );
      } else {
        const localRequests = await db.labourRequests.where('id').equals(id).toArray();
        if (localRequests.length > 0) {
          await syncService.deleteRequestOffline(localRequests[0].localId);
        } else {
          await syncService.deleteRequestOffline(`server_${id}`);
        }
        setIsConfirmDeleteOpen(false);
        statusModal.showSuccess(
          "Request Marked for Deletion",
          "The request will be deleted when you're back online."
        );
      }
    } catch (error) {
      console.error("Failed to delete request:", error);
      statusModal.showError("Error", "Failed to delete the request. Please try again.");
    }
  };

  const handleSubmit = async () => {
    try {
      if (networkStatus.isOnline) {
        await submitRequest({ id, data: {} }).unwrap();
        statusModal.showSuccess(
          "Request Submitted",
          "The labour request has been submitted for approval."
        );
        refetch();
      } else {
        const localRequests = await db.labourRequests.where('id').equals(id).toArray();
        if (localRequests.length > 0) {
          await syncService.submitRequestOffline(localRequests[0].localId);
        } else {
          await syncService.submitRequestOffline(`server_${id}`);
        }
        statusModal.showSuccess(
          "Request Marked for Submission",
          "The request will be submitted when you're back online."
        );
        refetch();
      }
    } catch (error) {
      console.error("Failed to submit request:", error);
      statusModal.showError("Error", "Failed to submit the request. Please try again.");
    }
  };

  const handleApprove = async () => {
    try {
      if (networkStatus.isOnline) {
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
      } else {
        const localRequests = await db.labourRequests.where('id').equals(id).toArray();
        const localId = localRequests.length > 0 ? localRequests[0].localId : `server_${id}`;
        await syncService.approveRequestOffline(localId, {
          status: "approved",
          approval_notes: approvalNotes,
        });
        setIsApproveModalOpen(false);
        statusModal.showSuccess(
          "Request Approved Locally",
          "The request will be approved when you're back online."
        );
        refetch();
      }
    } catch (error) {
      console.error("Failed to approve request:", error);
      statusModal.showError("Error", "Failed to approve the request. Please try again.");
    }
  };

  const handleReject = async () => {
    if (!rejectionReason.trim()) return;
    try {
      if (networkStatus.isOnline) {
        await rejectLabourRequest({
          id,
          data: { status: "rejected", rejection_notes: rejectionReason },
        }).unwrap();
        setIsRejectModalOpen(false);
        statusModal.showSuccess(
          "Request Rejected",
          "The labour request has been rejected."
        );
        refetch();
      } else {
        const localRequests = await db.labourRequests.where('id').equals(id).toArray();
        const localId = localRequests.length > 0 ? localRequests[0].localId : `server_${id}`;
        await syncService.rejectRequestOffline(localId, {
          status: "rejected",
          rejection_notes: rejectionReason,
        });
        setIsRejectModalOpen(false);
        statusModal.showSuccess(
          "Request Rejected Locally",
          "The request will be rejected when you're back online."
        );
        refetch();
      }
    } catch (error) {
      console.error("Failed to reject request:", error);
      statusModal.showError("Error", "Failed to reject the request. Please try again.");
    }
  };

  const handleModalClose = () => {
    statusModal.close();
    if (statusModal.type === "success" && !isApproveModalOpen && !isRejectModalOpen && !isConfirmDeleteOpen) {
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

  const breadcrumbs = [
    { label: "Home", href: "/" },
    { label: "Labour Request", href: "/project-request/labour-request" },
    {
      label: request?.reference_id || "Details",
      href: `/project-request/labour-request/${id}`,
      current: true,
    },
  ];

  if (isLoading) {
    return (
      <div className="p-8 space-y-4">
        <Skeleton className="h-12 w-1/3" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (error || !request) {
    return (
      <div className="min-h-screen bg-[#F9FAFB] flex items-center justify-center p-4">
        <div className="text-center bg-white p-8 rounded-xl border border-gray-200 shadow-sm max-w-sm w-full">
          <XCircle className="h-12 w-12 mx-auto mb-4 text-red-500" />
          <p className="text-gray-700 font-semibold mb-4">Failed to load request details</p>
          <Button onClick={() => router.back()} className="w-full bg-[#3B7CED] text-white hover:bg-blue-600">Go Back</Button>
        </div>
      </div>
    );
  }

  return (
    <FadeIn className="h-full text-gray-900 font-sans antialiased pr-4 bg-[#F9FAFB]">
      <PageHeader items={breadcrumbs} title="Labour Request Details" />

      <div className="max-w-5xl mx-auto px-6 py-8 bg-white min-h-screen shadow-sm rounded-lg my-4">
        <FadeIn delay={0.2}>
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-8">
            <div>
              <h2 className="text-sm font-medium text-[#3B7CED] uppercase tracking-wider mb-1">
                Basic Information
              </h2>
              <h1 className="text-2xl font-bold text-gray-900">
                {request.reference_id}
              </h1>
            </div>
            <div className="flex items-center gap-3">
              <Badge variant={getStatusBadgeVariant(request.status)}>
                {getStatusLabel(request.status)}
              </Badge>
              
              <div className="flex items-center gap-1.5 text-xs font-semibold text-gray-500">
                {networkStatus.isOnline ? (
                  <>
                    <Wifi size={14} className="text-green-500" />
                    <span className="text-green-600">Online</span>
                  </>
                ) : (
                  <>
                    <WifiOff size={14} className="text-orange-500" />
                    <span className="text-orange-600">Offline</span>
                  </>
                )}
              </div>
            </div>
          </div>
        </FadeIn>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <SlideUp delay={0.3}>
            <div className="space-y-6">
              <div>
                <Label className="text-xs text-gray-500 font-bold uppercase">Workers Count</Label>
                <p className="text-gray-900 font-semibold text-lg">{request.detail.number_of_workers} Workers</p>
              </div>
              <div>
                <Label className="text-xs text-gray-500 font-bold uppercase">Role / Trade Type</Label>
                <p className="text-gray-900 font-medium capitalize">{request.detail.role_type}</p>
              </div>
              <div>
                <Label className="text-xs text-gray-500 font-bold uppercase">Duration</Label>
                <p className="text-gray-900 font-medium capitalize">{request.detail.duration} {request.detail.duration_unit}</p>
              </div>
            </div>
          </SlideUp>

          <SlideUp delay={0.4}>
            <div className="space-y-6">
              <div>
                <Label className="text-xs text-gray-500 font-bold uppercase">Daily Rate</Label>
                <p className="text-gray-900 font-semibold">
                  ₦{parseFloat(request.detail.estimated_daily_rate || "0").toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </p>
              </div>
              <div>
                <Label className="text-xs text-gray-500 font-bold uppercase">Projected Cost</Label>
                <p className="text-2xl font-black text-[#3B7CED]">
                  ₦{parseFloat(request.detail.projected_cost || "0").toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </p>
              </div>
              <div>
                <Label className="text-xs text-gray-500 font-bold uppercase">Destination Module</Label>
                <p className="text-gray-950 capitalize">{request.module_destination.replace("_", " ")}</p>
              </div>
            </div>
          </SlideUp>

          <SlideUp delay={0.5}>
            <div className="space-y-6">
              <div>
                <Label className="text-xs text-gray-500 font-bold uppercase">Project</Label>
                <p className="text-gray-900 font-semibold">Project #{request.project_request?.project || "N/A"}</p>
              </div>
              <div>
                <Label className="text-xs text-gray-500 font-bold uppercase">Requester</Label>
                <p className="text-gray-900">{request.detail.created_by_name || "Unknown Submit"}</p>
              </div>
              <div>
                <Label className="text-xs text-gray-500 font-bold uppercase">Date Created</Label>
                <p className="text-gray-900">
                  {new Date(request.created_at).toLocaleDateString("en-GB", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  })}
                </p>
              </div>
            </div>
          </SlideUp>
        </div>

        {/* Audit Trail Timeline */}
        <div className="mt-12">
          <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
            <span className="w-2 h-6 bg-amber-500 rounded-full"></span>
            Audit Trail & History
          </h3>
          <div className="space-y-6 relative before:absolute before:left-[17px] before:top-2 before:bottom-2 before:w-0.5 before:bg-gray-100">
            <div className="relative pl-10">
              <span className="absolute left-0 top-0 w-9 h-9 bg-blue-50 rounded-full flex items-center justify-center border-4 border-white shadow-sm">
                <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
              </span>
              <div>
                <p className="text-sm font-bold text-gray-900">Request Created</p>
                <p className="text-xs text-gray-500">
                  {new Date(request.created_at).toLocaleString("en-GB")}
                </p>
                <p className="text-sm text-gray-600 mt-1">Initiated by {request.detail.created_by_name || "requester"}</p>
              </div>
            </div>

            {request.status !== "draft" && (
              <div className="relative pl-10">
                <span className="absolute left-0 top-0 w-9 h-9 bg-amber-50 rounded-full flex items-center justify-center border-4 border-white shadow-sm">
                  <span className="w-2 h-2 bg-amber-500 rounded-full"></span>
                </span>
                <div>
                  <p className="text-sm font-bold text-gray-900">Submitted for Approval</p>
                  <p className="text-xs text-gray-500">
                    {new Date(request.updated_at || request.created_at).toLocaleString("en-GB")}
                  </p>
                </div>
              </div>
            )}

            {request.status === "approved" && (
              <div className="relative pl-10">
                <span className="absolute left-0 top-0 w-9 h-9 bg-green-50 rounded-full flex items-center justify-center border-4 border-white shadow-sm">
                  <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                </span>
                <div>
                  <p className="text-sm font-bold text-gray-900">Request Approved</p>
                  <p className="text-xs text-gray-500">
                    {new Date(request.updated_at).toLocaleString("en-GB")}
                  </p>
                  {approvalNotes && (
                    <p className="text-sm text-gray-600 mt-1 italic font-medium text-green-700">
                      "Notes: {approvalNotes}"
                    </p>
                  )}
                </div>
              </div>
            )}

            {request.status === "rejected" && (
              <div className="relative pl-10">
                <span className="absolute left-0 top-0 w-9 h-9 bg-red-50 rounded-full flex items-center justify-center border-4 border-white shadow-sm">
                  <span className="w-2 h-2 bg-red-500 rounded-full"></span>
                </span>
                <div>
                  <p className="text-sm font-bold text-gray-900">Request Rejected</p>
                  <p className="text-xs text-gray-500">
                    {new Date(request.updated_at).toLocaleString("en-GB")}
                  </p>
                  {rejectionReason && (
                    <p className="text-sm text-red-600 mt-1 italic font-medium">
                      "Reason: {rejectionReason}"
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Justification Notes */}
        {request.detail.justification_notes && (
          <div className="mt-10 p-4 bg-blue-50/50 rounded-lg border border-blue-100">
            <Label className="text-[10px] font-black uppercase text-blue-600">Justification Notes</Label>
            <p className="mt-1 text-gray-700 text-sm leading-relaxed">
              "{request.detail.justification_notes}"
            </p>
          </div>
        )}

        {/* Action Buttons */}
        <div className="mt-16 pt-8 border-t border-gray-100 flex flex-col sm:flex-row justify-end gap-4">
          {canEdit && (
            <Button
              variant="outline"
              onClick={handleEdit}
              className="px-8 h-12 rounded-xl font-bold border-gray-300 text-gray-700 hover:bg-gray-50"
            >
              <Edit size={16} className="mr-2" />
              Edit Request
            </Button>
          )}

          {canDelete && (
            <Button
              variant="outline"
              onClick={() => setIsConfirmDeleteOpen(true)}
              disabled={isDeleting}
              className="px-8 h-12 rounded-xl font-bold border-red-200 text-red-600 hover:bg-red-50"
            >
              <Trash2 size={16} className="mr-2" />
              Delete Request
            </Button>
          )}

          {canSubmit && (
            <Button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="px-12 h-12 rounded-xl font-bold bg-[#3B7CED] hover:bg-[#2d63c7] text-white shadow-lg shadow-blue-200"
            >
              <Send size={16} className="mr-2" />
              {isSubmitting ? "Submitting..." : "Submit for Approval"}
            </Button>
          )}

          {canApproveReject && request.status === "pending" && (
            <>
              <Button
                variant="outline"
                onClick={() => setIsRejectModalOpen(true)}
                disabled={isRejecting}
                className="px-8 h-12 rounded-xl font-bold border-red-200 text-red-600 hover:bg-red-50"
              >
                <XCircle size={16} className="mr-2" />
                Reject Request
              </Button>
              <Button
                onClick={() => setIsApproveModalOpen(true)}
                disabled={isApproving}
                className="px-12 h-12 rounded-xl font-bold bg-[#2BA24D] hover:bg-[#238c3f] text-white shadow-lg shadow-green-200 animate-pulse-subtle"
              >
                <CheckCircle size={16} className="mr-2" />
                Approve Request
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Reject Modal */}
      <Dialog open={isRejectModalOpen} onOpenChange={setIsRejectModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-red-600">Reject Request</DialogTitle>
            <DialogDescription>
              Please provide a reason for rejecting this labour request. This will be logged in the history.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Label htmlFor="reason" className="mb-2 block">Rejection Reason *</Label>
            <Textarea
              id="reason"
              placeholder="e.g. Rate exceeds WBS allocation limit."
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              rows={4}
            />
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setIsRejectModalOpen(false)}>Cancel</Button>
            <Button
              className="bg-red-600 hover:bg-red-700 text-white"
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
            <Label htmlFor="notes" className="mb-2 block">Approval Notes</Label>
            <Textarea
              id="notes"
              placeholder="e.g. Budget check passed."
              value={approvalNotes}
              onChange={(e) => setApprovalNotes(e.target.value)}
              rows={4}
            />
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setIsApproveModalOpen(false)}>Cancel</Button>
            <Button
              className="bg-[#2BA24D] hover:bg-green-700 text-white"
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
              Are you sure you want to delete this labour request? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setIsConfirmDeleteOpen(false)}>Cancel</Button>
            <Button
              className="bg-red-600 hover:bg-red-700 text-white"
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
    </FadeIn>
  );
}
