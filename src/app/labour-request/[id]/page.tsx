"use client";

import React, { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
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
import {
  useGetLabourRequestQuery,
  useDeleteLabourRequestMutation,
  useSubmitLabourRequestMutation,
  useApproveLabourRequestMutation,
  useRejectLabourRequestMutation,
  useCancelLabourRequestMutation,
} from "@/api/requests/labourRequestApi";
import { useNetworkStatus } from "@/hooks/useNetworkStatus";
import { syncService } from "@/lib/database/syncService";
import { usePermissionContext } from "@/contexts/PermissionContext";
import { StatusModal } from "@/components/shared/StatusModal";
import { format } from "date-fns";

interface LabourRequestDetail {
  id: number;
  date_required: string;
  number_of_workers: number;
  role_type: string;
  duration: number;
  // duration_unit: "days" | "weeks" | "months";
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
  const [cancelLabourRequest, { isLoading: isCancelling }] =
    useCancelLabourRequestMutation();

  const [statusModal, setStatusModal] = useState<{
    isOpen: boolean;
    type: "success" | "error" | "warning";
    title: string;
    description: string;
  }>({
    isOpen: false,
    type: "success",
    title: "",
    description: "",
  });

  const [confirmDelete, setConfirmDelete] = useState(false);

  const getStatusBadgeVariant = (status: string) => {
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

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return format(date, "MMM d, yyyy - HH:mm:ss");
    } catch {
      return dateString;
    }
  };

  const handleEdit = () => {
    router.push(`/labour-request/edit/${id}`);
  };

  const handleDelete = async () => {
    if (!confirmDelete) {
      setConfirmDelete(true);
      return;
    }

    try {
      if (networkStatus.isOnline) {
        await deleteRequest(id).unwrap();
        setStatusModal({
          isOpen: true,
          type: "success",
          title: "Request Deleted",
          description: "The labour request has been deleted successfully.",
        });
        setTimeout(() => {
          router.push("/labour-request");
        }, 2000);
      } else {
        // Offline delete
        await syncService.deleteRequestOffline(id);
        setStatusModal({
          isOpen: true,
          type: "success",
          title: "Request Marked for Deletion",
          description: "The request will be deleted when you're back online.",
        });
        setTimeout(() => {
          router.push("/labour-request");
        }, 2000);
      }
    } catch (error) {
      console.error("Failed to delete request:", error);
      setStatusModal({
        isOpen: true,
        type: "error",
        title: "Error",
        description: "Failed to delete the request. Please try again.",
      });
    } finally {
      setConfirmDelete(false);
    }
  };

  const handleSubmit = async () => {
    try {
      if (networkStatus.isOnline) {
        await submitRequest({ id, data: {} }).unwrap();
        setStatusModal({
          isOpen: true,
          type: "success",
          title: "Request Submitted",
          description: "The labour request has been submitted for approval.",
        });
        refetch();
      } else {
        // Offline submit
        await syncService.submitRequestOffline(id);
        setStatusModal({
          isOpen: true,
          type: "success",
          title: "Request Marked for Submission",
          description: "The request will be submitted when you're back online.",
        });
        refetch();
      }
    } catch (error) {
      console.error("Failed to submit request:", error);
      setStatusModal({
        isOpen: true,
        type: "error",
        title: "Error",
        description: "Failed to submit the request. Please try again.",
      });
    }
  };

  // Permission checks
  const canEdit =
    request?.status === "draft" &&
    (isAdmin || permissions["labour-request"]?.has("edit"));
  const canDelete =
    request?.status === "draft" ||
    (request?.status === "pending" &&
      (isAdmin || permissions["labour-request"]?.has("delete")));
  const canSubmit = request?.status === "draft";
  const canApproveReject =
    isAdmin || permissions["labour-request"]?.has("approve");

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#F1F5F9] flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-2 text-[#3B7CED]" />
          <p className="text-gray-600">Loading request details...</p>
        </div>
      </div>
    );
  }

  if (error || !request) {
    return (
      <div className="min-h-screen bg-[#F1F5F9] flex items-center justify-center">
        <div className="text-center">
          <XCircle className="h-8 w-8 mx-auto mb-2 text-red-500" />
          <p className="text-gray-600 mb-4">Failed to load request details</p>
          <Button onClick={() => router.back()}>Go Back</Button>
        </div>
      </div>
    );
  }

  console.log("params", params);
  console.log("request", request);

  return (
    <div className="min-h-screen bg-[#F1F5F9]">
      {/* Header */}
      <div className="bg-white px-4 py-4 sticky top-0 z-10 shadow-sm">
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon-sm"
              className="text-gray-600 hover:text-gray-900 hover:bg-gray-100"
              onClick={() => router.back()}
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-xl font-semibold text-gray-900">
                Labour Request Details
              </h1>
              <p className="text-sm text-gray-500">{request.reference_id}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {networkStatus.isOnline ? (
              <>
                <Wifi className="h-4 w-4 text-green-500" />
                <span className="text-sm text-green-600">Online</span>
              </>
            ) : (
              <>
                <WifiOff className="h-4 w-4 text-orange-500" />
                <span className="text-sm text-orange-600">Offline</span>
              </>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto pb-24 space-y-4 pt-4">
        {/* Status and Actions */}
        <div className="bg-white px-4 py-6">
          <div className="flex justify-between items-center">
            <div className="flex gap-2 flex-wrap">
              {canEdit && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleEdit}
                  className="flex items-center gap-2"
                >
                  <Edit className="h-4 w-4" />
                  Edit
                </Button>
              )}

              {canSubmit && (
                <Button
                  variant="contained"
                  size="sm"
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                  className="flex items-center gap-2 bg-[#3B7CED] hover:bg-[#2d63c7]"
                >
                  <Send className="h-4 w-4" />
                  {isSubmitting ? "Submitting..." : "Submit for Approval"}
                </Button>
              )}

              {canDelete && (
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={handleDelete}
                  disabled={isDeleting}
                  className="flex items-center gap-2"
                >
                  <Trash2 className="h-4 w-4" />
                  {confirmDelete ? "Confirm Delete" : "Delete"}
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Request Details */}

        <Card className="p-6">
          <h2 className="text-lg font-semibold mb-6">Labour Details</h2>
          <div>
            <Badge
              variant={getStatusBadgeVariant(request.status || "draft")}
              className="text-base px-3 py-1"
            >
              {request.status.charAt(0).toUpperCase() +
                request?.status?.slice(1)}
            </Badge>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Identification Section */}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Reference ID
              </label>
              <p className="text-sm text-gray-900 font-medium">
                {request.reference_id}
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Request Type
              </label>
              <p className="text-sm text-gray-900">
                {request.request_type.charAt(0).toUpperCase() +
                  request.request_type.slice(1)}
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Project
              </label>
              <p className="text-sm text-gray-900">
                Project {request?.project_request?.project || "N/A"}
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Requester
              </label>
              <p className="text-sm text-gray-900">
                {request.detail.created_by_name}
              </p>
            </div>

            {/* Labour Information */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Number of Workers
              </label>
              <p className="text-sm text-gray-900">
                {request.detail.number_of_workers}
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Role / Trade Type
              </label>
              <p className="text-sm text-gray-900">
                {request.detail.role_type}
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Duration
              </label>
              <p className="text-sm text-gray-900">
                {request.detail.duration} {request.detail.duration_unit}
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Estimated Daily Rate
              </label>
              <p className="text-sm text-gray-900">
                ₦
                {parseFloat(
                  request.detail.estimated_daily_rate || "0",
                ).toLocaleString()}
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Projected Cost
              </label>
              <p className="text-sm text-gray-900 font-semibold">
                ₦
                {parseFloat(
                  request.detail.projected_cost || "0",
                ).toLocaleString()}
              </p>
            </div>

            {/* Timestamps */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Date Created
              </label>
              <p className="text-sm text-gray-900">
                {formatDate(request.created_at)}
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Last Updated
              </label>
              <p className="text-sm text-gray-900">
                {formatDate(request.created_at)}
              </p>
            </div>

            {/* Destination */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Destination
              </label>
              <p className="text-sm text-gray-900">
                {request.module_destination.charAt(0).toUpperCase() +
                  request.module_destination.slice(1)}
              </p>
            </div>
          </div>

          {/* Justification Notes - Full Width */}
          {request.detail.justification_notes && (
            <div className="mt-8">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Justification Notes
              </label>
              <div className="bg-gray-50 border border-gray-100 rounded-lg p-4 text-sm text-gray-800 leading-relaxed">
                {request.detail.justification_notes}
              </div>
            </div>
          )}
        </Card>
      </div>

      {/* Approve/Reject/Cancel Buttons */}
      {canApproveReject && request.status === "pending" && (
        <div className="bg-white px-4 py-4 border-t border-gray-100">
          <div className="max-w-7xl mx-auto flex gap-3">
            <Button
              variant="default"
              className="flex items-center gap-2 bg-[#2BA24D] hover:bg-[#238c3f] text-white"
              onClick={async () => {
                const notes = prompt("Enter approval notes (optional):");
                if (notes !== null) {
                  try {
                    if (networkStatus.isOnline) {
                      await approveLabourRequest({
                        id,
                        data: { status: "approved", approval_notes: notes },
                      }).unwrap();
                      setStatusModal({
                        isOpen: true,
                        type: "success",
                        title: "Request Approved",
                        description: "The labour request has been approved.",
                      });
                      refetch();
                    } else {
                      await syncService.approveRequestOffline(id, {
                        status: "approved",
                        approval_notes: notes,
                      });
                      setStatusModal({
                        isOpen: true,
                        type: "success",
                        title: "Request Approved Locally",
                        description:
                          "The request will be approved when you're back online.",
                      });
                    }
                  } catch (error) {
                    console.error("Failed to approve request:", error);
                    setStatusModal({
                      isOpen: true,
                      type: "error",
                      title: "Error",
                      description:
                        "Failed to approve the request. Please try again.",
                    });
                  }
                }
              }}
              disabled={isApproving}
            >
              <CheckCircle className="h-4 w-4" />
              {isApproving ? "Approving..." : "Approve"}
            </Button>
            <Button
              variant="outline"
              className="flex items-center gap-2 border-[#F0B401] text-[#F0B401] hover:bg-[#F0B401] hover:text-white"
              onClick={async () => {
                const notes = prompt("Enter rejection notes:");
                if (notes !== null) {
                  try {
                    if (networkStatus.isOnline) {
                      await rejectLabourRequest({
                        id,
                        data: { status: "rejected", rejection_notes: notes },
                      }).unwrap();
                      setStatusModal({
                        isOpen: true,
                        type: "success",
                        title: "Request Rejected",
                        description: "The labour request has been rejected.",
                      });
                      refetch();
                    } else {
                      await syncService.rejectRequestOffline(id, {
                        status: "rejected",
                        rejection_notes: notes,
                      });
                      setStatusModal({
                        isOpen: true,
                        type: "success",
                        title: "Request Rejected Locally",
                        description:
                          "The request will be rejected when you're back online.",
                      });
                    }
                  } catch (error) {
                    console.error("Failed to reject request:", error);
                    setStatusModal({
                      isOpen: true,
                      type: "error",
                      title: "Error",
                      description:
                        "Failed to reject the request. Please try again.",
                    });
                  }
                }
              }}
              disabled={isRejecting}
            >
              <XCircle className="h-4 w-4" />
              {isRejecting ? "Rejecting..." : "Reject"}
            </Button>
            {/* <Button
              variant="destructive"
              className="flex items-center gap-2"
              onClick={async () => {
                const notes = prompt("Enter cancellation notes:");
                if (notes !== null) {
                  try {
                    if (networkStatus.isOnline) {
                      await cancelLabourRequest({
                        id,
                        data: {
                          status: "cancelled",
                          cancellation_notes: notes,
                        },
                      }).unwrap();
                      setStatusModal({
                        isOpen: true,
                        type: "success",
                        title: "Request Cancelled",
                        description: "The labour request has been cancelled.",
                      });
                      setTimeout(() => {
                        router.push("/labour-request");
                      }, 2000);
                    } else {
                      await syncService.cancelRequestOffline(id, {
                        status: "cancelled",
                        cancellation_notes: notes,
                      });
                      setStatusModal({
                        isOpen: true,
                        type: "success",
                        title: "Request Cancelled Locally",
                        description:
                          "The request will be cancelled when you're back online.",
                      });
                      setTimeout(() => {
                        router.push("/labour-request");
                      }, 2000);
                    }
                  } catch (error) {
                    console.error("Failed to cancel request:", error);
                    setStatusModal({
                      isOpen: true,
                      type: "error",
                      title: "Error",
                      description:
                        "Failed to cancel the request. Please try again.",
                    });
                  }
                }
              }}
              disabled={isCancelling}
            >
              Cancel Request
            </Button> */}
          </div>
        </div>
      )}

      {/* Status Modal */}
      <StatusModal
        isOpen={statusModal.isOpen}
        onClose={() => setStatusModal((prev) => ({ ...prev, isOpen: false }))}
        type={statusModal.type}
        title={statusModal.title}
        message={statusModal.description}
      />
    </div>
  );
}
