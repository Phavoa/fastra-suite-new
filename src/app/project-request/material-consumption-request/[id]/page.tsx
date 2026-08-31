"use client";

import React, { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  Bell,
  Calendar,
  User,
  Loader2,
  XCircle,
  Trash2,
  Edit,
  Send,
  Building2,
  Package,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { 
  useGetMaterialConsumptionQuery,
  useDeleteMaterialConsumptionMutation,
  usePatchMaterialConsumptionMutation,
} from "@/api/requests/materialConsumptionRequestApi";
import { useSubmitProjectRequestMutation } from "@/api/requests/projectRequestApi";
import { StatusModal, useStatusModal } from "@/components/shared/StatusModal";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { useModulePermissions } from "@/hooks/useModulePermissions";
import { PageGuard } from "@/components/auth/PageGuard";
import { motion } from "framer-motion";
import { Skeleton } from "@/components/ui/skeleton";
import { extractErrorMessage } from "@/lib/utils";

export default function MaterialConsumptionRequestDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = Number(params.id);
  const statusModal = useStatusModal();
  const { canDo } = useModulePermissions();

  const { data: request, isLoading, error, refetch } = useGetMaterialConsumptionQuery(id, {
    skip: isNaN(id),
  });

  const [isConfirmDeleteOpen, setIsConfirmDeleteOpen] = useState(false);
  const [deleteRequest, { isLoading: isDeleting }] = useDeleteMaterialConsumptionMutation();
  const [submitProjectRequest, { isLoading: isSubmitting }] = useSubmitProjectRequestMutation();

  const handleDelete = async () => {
    try {
      await deleteRequest(id).unwrap();
      setIsConfirmDeleteOpen(false);
      statusModal.showSuccess(
        "Request Deleted",
        "The material consumption request has been deleted successfully."
      );
    } catch (err: any) {
      console.error("Failed to delete request:", err);
      statusModal.showError(
        "Error",
        extractErrorMessage(err, "Failed to delete the request. Please try again.")
      );
    }
  };

  const handleSubmit = async () => {
    try {
      const parentId = typeof request?.project_request === "object" 
        ? (request?.project_request as any)?.id 
        : request?.project_request;
      if (!parentId) throw new Error("Could not find parent project request ID");

      await submitProjectRequest({ id: parentId as number }).unwrap();
      statusModal.showSuccess(
        "Request Submitted",
        "The material consumption request has been submitted for approval."
      );
      refetch();
    } catch (err: any) {
      console.error("Failed to submit request:", err);
      statusModal.showError(
        "Submit Failed",
        extractErrorMessage(err, "Failed to submit the request. Please try again.")
      );
    }
  };

  const handleModalClose = () => {
    statusModal.close();
    if (statusModal.type === "success" && !isConfirmDeleteOpen) {
      router.push("/project-request/material-consumption-request");
    }
  };

  const handleEdit = () => {
    router.push(`/project-request/material-consumption-request/${id}/edit`);
  };

  const getStatusBadgeClass = (status?: string) => {
    switch (status?.toLowerCase()) {
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

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#F9FAFB] pb-28">
        <header className="w-full border-b border-gray-100 bg-white sticky top-0 z-30">
          <div className="max-w-2xl mx-auto px-4 h-16 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Skeleton className="w-8 h-8 bg-gray-200 rounded-lg animate-pulse" />
              <Skeleton className="h-6 bg-gray-200 rounded w-36 animate-pulse" />
            </div>
            <div className="flex items-center gap-2">
              <Skeleton className="w-20 h-8 bg-gray-200 rounded-lg animate-pulse" />
            </div>
          </div>
        </header>
        <main className="max-w-2xl mx-auto px-4 pt-4 space-y-4">
          <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-xs space-y-4">
            <div className="flex justify-between items-center">
              <Skeleton className="h-6 bg-gray-200 rounded w-48 animate-pulse" />
              <Skeleton className="h-6 bg-gray-200 rounded-full w-20 animate-pulse" />
            </div>
            <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-100">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="space-y-1">
                  <Skeleton className="h-3 bg-gray-200 rounded w-20 animate-pulse" />
                  <Skeleton className="h-5 bg-gray-200 rounded w-32 animate-pulse" />
                </div>
              ))}
            </div>
          </div>
        </main>
      </div>
    );
  }

  if (error || !request) {
    return (
      <div className="min-h-screen bg-[#F9FAFB] flex items-center justify-center p-4">
        <div className="text-center bg-white p-8 rounded-xl border border-gray-200 shadow-sm max-w-sm w-full">
          <XCircle className="h-12 w-12 mx-auto mb-4 text-red-500" />
          <p className="text-gray-700 font-semibold mb-4">
            Failed to load material consumption request details
          </p>
          <Button
            onClick={() => router.push("/project-request/material-consumption-request")}
            className="w-full bg-[#3B7CED] text-white hover:bg-blue-600 font-bold h-11 rounded-xl"
          >
            Go Back
          </Button>
        </div>
      </div>
    );
  }


  const rawReq: any = request;
  const requestId = rawReq.request_id || (rawReq.reference_id || `MCR-${request.id}`);
  const projectName = rawReq.project_details?.name || rawReq.project_name || (rawReq.project ? `Project #${rawReq.project}` : "-");
  const phaseName = rawReq.phase_details?.name || rawReq.phase_name || "-";
  const activityName = rawReq.activity_details?.name || rawReq.activity_name || "-";
  const requesterName = rawReq.created_by_name || rawReq.requester_name || rawReq.requester_details?.name || "Current User";
  const locationName = rawReq.location_details?.location_name || rawReq.location || "On Site Warehouse";

  const formattedDate = rawReq.date_consumed
    ? new Date(rawReq.date_consumed).toLocaleDateString("en-GB", {
        day: "numeric",
        month: "short",
        year: "numeric",
      })
    : new Date(rawReq.created_at || Date.now()).toLocaleDateString("en-GB", {
        day: "numeric",
        month: "short",
        year: "numeric",
      });

  const totalCostNumber = (request.lines || []).reduce(
    (sum: number, l: any) => sum + (parseFloat(l.total_cost) || 0),
    0
  );

  const availableBudgetNumber = rawReq.available_budget !== undefined
    ? parseFloat(rawReq.available_budget)
    : undefined;

  const canEdit = request.status?.toLowerCase() === "draft" && canDo("project_request", "edit");
  const canDelete = request.status?.toLowerCase() === "draft" && canDo("project_request", "delete");
  const canSubmit = request.status?.toLowerCase() === "draft" && canDo("project_request", "submit");

  return (
    <PageGuard module="project_request" entitlement="view">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25, ease: "easeOut" }}
        className="min-h-screen bg-[#F9FAFB] pb-24 font-sans antialiased text-gray-900"
      >
        {/* Header Bar */}
        <header className="w-full border-b border-gray-100 bg-white sticky top-0 z-30 shadow-none">
          <div className="max-w-2xl mx-auto px-4 h-16 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button
                onClick={() => router.push("/project-request/material-consumption-request")}
                className="p-1 rounded-lg hover:bg-gray-50 transition-colors"
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
                  {requestId}
                </span>
                <h2 className="text-lg font-bold text-gray-900 mt-1">
                  Material Consumption Request
                </h2>
              </div>
              <span className={getStatusBadgeClass(request.status)}>
                {request.status
                  ? request.status.charAt(0).toUpperCase() + request.status.slice(1)
                  : "Approved"}
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
                  <User size={14} className="text-gray-500" /> {requesterName}
                </span>
              </div>
            </div>
          </div>

          {/* Consumption Details Card */}
          <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-none space-y-4">
            <h3 className="text-sm font-bold text-[#3B7CED] uppercase tracking-wider flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-[#3B7CED]" />
              Consumption Details
            </h3>

            <div className="space-y-3 text-xs">
              <div className="flex justify-between py-1.5 border-b border-gray-50">
                <span className="text-gray-500 font-semibold">Project</span>
                <span className="font-bold text-gray-900">{projectName}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-gray-50">
                <span className="text-gray-500 font-semibold">Location</span>
                <span className="font-bold text-gray-900">{locationName}</span>
              </div>
              <div className="flex justify-between py-1.5">
                <span className="text-gray-500 font-semibold">Total Line Items</span>
                <span className="font-bold text-gray-900">
                  {(request.lines || []).length} Items
                </span>
              </div>
            </div>
          </div>

          {/* WBS Breakdown Card */}
          <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-none space-y-4">
            <h3 className="text-sm font-bold text-[#3B7CED] uppercase tracking-wider flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-[#3B7CED]" />
              WBS Breakdown
            </h3>

            <div className="space-y-3 text-xs">
              <div className="flex justify-between py-1.5 border-b border-gray-50">
                <span className="text-gray-500 font-semibold">Phase</span>
                <span className="font-bold text-gray-900">{phaseName}</span>
              </div>
              <div className="flex justify-between py-1.5">
                <span className="text-gray-500 font-semibold">Activity</span>
                <span className="font-bold text-gray-900">{activityName}</span>
              </div>
            </div>
          </div>

          {/* Consumed Materials Table */}
          {request.lines && request.lines.length > 0 && (
            <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-none space-y-4">
              <h3 className="text-sm font-bold text-[#3B7CED] uppercase tracking-wider flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-[#3B7CED]" />
                Consumed Materials Breakdown
              </h3>

              <div className="border border-gray-100 rounded-xl overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead className="bg-gray-50 border-b border-gray-100 text-gray-500 font-bold uppercase">
                    <tr>
                      <th className="p-3">Product / Item</th>
                      <th className="p-3 text-center">Quantity</th>
                      <th className="p-3 text-right">Unit Cost (₦)</th>
                      <th className="p-3 text-right">Total (₦)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {request.lines.map((l: any, idx: number) => {
                      const pName = l.product_details?.product_name || l.product_name || `Product #${l.product || idx + 1}`;
                      const uom = l.product_details?.unit_of_measure_details?.unit_symbol || l.unit || "";
                      return (
                        <tr key={idx} className="hover:bg-gray-50/50">
                          <td className="p-3 font-semibold text-gray-900">
                            {pName}
                          </td>
                          <td className="p-3 text-center font-medium text-[#3B7CED]">
                            {l.quantity} {uom}
                          </td>
                          <td className="p-3 text-right font-medium text-gray-600">
                            ₦{parseFloat(l.unit_cost || "0").toLocaleString("en-NG", { minimumFractionDigits: 2 })}
                          </td>
                          <td className="p-3 text-right font-bold text-gray-900">
                            ₦{parseFloat(l.total_cost || "0").toLocaleString("en-NG", { minimumFractionDigits: 2 })}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Cost Summary & Notes */}
          <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-none space-y-4">
            <h3 className="text-sm font-bold text-[#3B7CED] uppercase tracking-wider flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-[#3B7CED]" />
              Cost & Justification
            </h3>

            <div className="space-y-3 text-xs">
              {availableBudgetNumber !== undefined && (
                <div className="flex justify-between py-1.5 border-b border-gray-50">
                  <span className="text-gray-500 font-semibold">Available Budget</span>
                  <span className="font-bold text-gray-900">
                    ₦{availableBudgetNumber.toLocaleString("en-NG", { minimumFractionDigits: 2 })}
                  </span>
                </div>
              )}
              <div className="flex justify-between py-1.5 border-b border-gray-50">
                <span className="text-gray-500 font-semibold">Total Cost</span>
                <span className="font-extrabold text-[#3B7CED]">
                  ₦{totalCostNumber.toLocaleString("en-NG", { minimumFractionDigits: 2 })}
                </span>
              </div>
              {request.notes && (
                <div className="pt-3">
                  <span className="block text-gray-400 font-semibold mb-1">Note</span>
                  <p className="text-gray-700 bg-gray-50 p-3 rounded-lg border border-gray-200 leading-relaxed ">
                    {request.notes}
                  </p>
                </div>
              )}
            </div>
          </div>
        </main>

        {/* Fixed Action Bar for Draft Status (identical to Plant & Equipment) */}
        {(canEdit || canSubmit || canDelete) && (
          <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 z-40 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
            <div className="max-w-2xl mx-auto flex gap-3">
              {canDelete && (
                <Button
                  variant="outline"
                  className="flex-1 border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700 h-11"
                  onClick={() => setIsConfirmDeleteOpen(true)}
                  disabled={isDeleting || isSubmitting}
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete
                </Button>
              )}
              
              {canEdit && (
                <Button
                  variant="outline"
                  className="flex-1 border-[#3B7CED] text-[#3B7CED] hover:bg-blue-50 h-11"
                  onClick={handleEdit}
                  disabled={isDeleting || isSubmitting}
                >
                  <Edit className="w-4 h-4 mr-2" />
                  Edit
                </Button>
              )}

              {canSubmit && (
                <Button
                  className="flex-[2] bg-[#3B7CED] hover:bg-blue-600 text-white h-11"
                  onClick={handleSubmit}
                  disabled={isDeleting || isSubmitting}
                >
                  {isSubmitting ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <Send className="w-4 h-4 mr-2" />
                  )}
                  {isSubmitting ? "Submitting..." : "Submit for Approval"}
                </Button>
              )}
            </div>
          </div>
        )}

        {/* Delete Confirmation Dialog */}
        <Dialog open={isConfirmDeleteOpen} onOpenChange={setIsConfirmDeleteOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="text-red-600 flex items-center gap-2">
                <Trash2 className="w-5 h-5" />
                Delete Material Consumption Request
              </DialogTitle>
              <DialogDescription>
                Are you sure you want to delete this material consumption request? This action cannot be undone.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter className="sm:justify-end gap-2 mt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsConfirmDeleteOpen(false)}
                disabled={isDeleting}
              >
                Cancel
              </Button>
              <Button
                type="button"
                variant="destructive"
                onClick={handleDelete}
                disabled={isDeleting}
                className="bg-red-600 hover:bg-red-700"
              >
                {isDeleting ? "Deleting..." : "Delete Request"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <StatusModal
          isOpen={statusModal.isOpen}
          onClose={handleModalClose}
          title={statusModal.title}
          message={statusModal.message}
          type={statusModal.type}
        />
      </motion.div>
    </PageGuard>
  );
}
