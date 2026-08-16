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
  Edit3,
  Check,
  AlertCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { 
  useGetMaterialConsumptionQuery,
  useDeleteMaterialConsumptionMutation,
  usePatchMaterialConsumptionMutation,
} from "@/api/requests/materialConsumptionRequestApi";
import { useSubmitProjectRequestMutation } from "@/api/requests/projectRequestApi";
import { StatusModal } from "@/components/shared/StatusModal";
import { PermissionGuard } from "@/components/auth/PermissionGuard";
import { extractErrorMessage } from "@/lib/utils";

export default function MaterialConsumptionRequestDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = Number(params.id);

  const { data: request, isLoading, error } = useGetMaterialConsumptionQuery(id, {
    skip: isNaN(id),
  });

  const [isConfirmingDelete, setIsConfirmingDelete] = useState(false);
  const [deleteRequest, { isLoading: isDeleting }] = useDeleteMaterialConsumptionMutation();
  const [patchRequest, { isLoading: isUpdating }] = usePatchMaterialConsumptionMutation();
  const [submitProjectRequest] = useSubmitProjectRequestMutation();

  const [modalState, setModalState] = useState<{
    isOpen: boolean;
    type: "success" | "error" | "warning" | "info";
    title: string;
    message: string;
  }>({
    isOpen: false,
    type: "success",
    title: "",
    message: "",
  });

  const handleDelete = async () => {
    try {
      await deleteRequest(id).unwrap();
      setModalState({
        isOpen: true,
        type: "success",
        title: "Deleted",
        message: "Material consumption request deleted successfully.",
      });
    } catch (error: any) {
      setModalState({
        isOpen: true,
        type: "error",
        title: "Delete Failed",
        message: extractErrorMessage(error, "Failed to delete request. Please try again."),
      });
    }
  };

  const handleStatusChange = async (newStatus: "approved" | "rejected" | "pending") => {
    try {
      if (newStatus === "pending" && request) {
        const parentId = typeof request.project_request === "object" 
          ? (request.project_request as any)?.id 
          : request.project_request;
        if (parentId) {
          await submitProjectRequest({ id: parentId as number }).unwrap();
          setModalState({
            isOpen: true,
            type: "success",
            title: "Submitted",
            message: "Material consumption request submitted successfully.",
          });
          return;
        }
      }
      await patchRequest({ id: id, body: { status: newStatus } }).unwrap();
      setModalState({
        isOpen: true,
        type: "success",
        title: "Status Updated",
        message: `Request status updated to ${newStatus} successfully.`,
      });
    } catch (error: any) {
      console.error(error);
      const errMsg = extractErrorMessage(error, "Failed to update status on server.");
      const isBudgetError = errMsg.toLowerCase().includes("insufficient budget");
      setModalState({
        isOpen: true,
        type: "error",
        title: isBudgetError ? "Insufficient Budget" : "Action Failed",
        message: errMsg,
      });
    }
  };

  const handleModalClose = () => {
    setModalState((prev) => ({ ...prev, isOpen: false }));
    if (modalState.type === "success" && modalState.title === "Deleted") {
      router.push("/project-request/material-consumption-request");
    }
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
    : new Date().toLocaleDateString("en-GB", {
        day: "numeric",
        month: "short",
        year: "numeric",
      });

  const totalCostFormatted = (request.lines || [])
    .reduce((sum: number, l: any) => sum + (parseFloat(l.total_cost) || 0), 0)
    .toLocaleString("en-NG", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  const availableBudgetFormatted = (request as any).available_budget
    ? parseFloat((request as any).available_budget).toLocaleString("en-NG", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })
    : "0.00";

  return (
    <div className="min-h-screen bg-[#F9FAFB] pb-24 font-sans antialiased text-gray-900">
      {/* Header Bar */}
      <header className="w-full border-b border-gray-100 bg-white sticky top-0 z-30 shadow-none">
        <div className="max-w-2xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.push("/project-request/material-consumption-request")}
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
                {request.request_id || `MCR-${request.id}`}
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
                Date Consumed / Requested
              </span>
              <span className="font-bold text-gray-800 flex items-center gap-1">
                <Calendar size={14} className="text-gray-500" /> {formattedDate}
              </span>
            </div>
            <div>
              <span className="block text-gray-400 font-semibold mb-0.5">
                Location / Site
              </span>
              <span className="font-bold text-gray-800 flex items-center gap-1">
                <User size={14} className="text-gray-500" /> {request.location || "On Site"}
              </span>
            </div>
          </div>
        </div>

        {/* Consumption Details */}
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-none space-y-4">
          <h3 className="text-sm font-bold text-[#3B7CED] uppercase tracking-wider flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-[#3B7CED]" />
            Summary Details
          </h3>

          <div className="space-y-3 text-xs">
            <div className="flex justify-between py-1.5 border-b border-gray-50">
              <span className="text-gray-500 font-semibold">Project ID</span>
              <span className="font-bold text-gray-900">
                Project #{(request as any).project_request?.reference_id || (request as any).project_request?.id || "General"}
              </span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-gray-50">
              <span className="text-gray-500 font-semibold">Total Line Items</span>
              <span className="font-bold text-gray-900">
                {(request.lines || []).length} Items
              </span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-gray-50">
              <span className="text-gray-500 font-semibold">Total Cost</span>
              <span className="font-black text-[#3B7CED] text-sm">
                ₦{totalCostFormatted}
              </span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-gray-50">
              <span className="text-gray-500 font-semibold">Available Budget</span>
              <span className="font-bold text-gray-900">
                ₦{availableBudgetFormatted}
              </span>
            </div>
            {request.notes && (
              <div className="pt-2">
                <span className="block text-gray-500 font-semibold mb-1">
                  Notes / Description
                </span>
                <p className="text-gray-800 bg-gray-50 p-3 rounded-lg border border-gray-100 leading-relaxed">
                  {request.notes}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Consumed Materials Table */}
        {request.lines && request.lines.length > 0 && (
          <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-none space-y-4">
            <h3 className="text-sm font-bold text-[#3B7CED] uppercase tracking-wider flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-[#3B7CED]" />
              Consumed Items Breakdown
            </h3>

            <div className="border border-gray-100 rounded-xl overflow-hidden">
              <table className="w-full text-left text-xs">
                <thead className="bg-gray-50 border-b border-gray-100 text-gray-500 font-bold uppercase">
                  <tr>
                    <th className="p-3">Item #</th>
                    <th className="p-3 text-center">Quantity</th>
                    <th className="p-3 text-right">Unit Cost (₦)</th>
                    <th className="p-3 text-right">Total (₦)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {request.lines.map((l: any, idx: number) => (
                    <tr key={idx} className="hover:bg-gray-50/50">
                      <td className="p-3 font-semibold text-gray-900">
                        Item #{l.id || idx + 1}
                      </td>
                      <td className="p-3 text-center font-medium">
                        {l.quantity}
                      </td>
                      <td className="p-3 text-right font-medium">
                        ₦{parseFloat(l.unit_cost || "0").toLocaleString(undefined, { minimumFractionDigits: 2 })}
                      </td>
                      <td className="p-3 text-right font-bold text-gray-900">
                        ₦{parseFloat(l.total_cost || "0").toLocaleString(undefined, { minimumFractionDigits: 2 })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>

      {/* Action Bottom Bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 p-4 z-20 shadow-sm">
        <div className="max-w-2xl mx-auto flex items-center justify-between gap-3">
          {isConfirmingDelete ? (
            <div className="w-full flex items-center justify-between gap-2 bg-red-50 p-2 rounded-lg border border-red-100">
              <span className="text-xs font-semibold text-red-700 flex items-center gap-1.5 pl-1">
                <AlertCircle size={16} className="text-red-600" /> Confirm delete?
              </span>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setIsConfirmingDelete(false)}
                  className="h-8 text-xs bg-white border-gray-200 text-gray-700"
                >
                  Cancel
                </Button>
                <Button
                  size="sm"
                  onClick={handleDelete}
                  disabled={isDeleting}
                  className="h-8 text-xs bg-red-600 hover:bg-red-700 text-white"
                >
                  {isDeleting ? "Deleting..." : "Delete"}
                </Button>
              </div>
            </div>
          ) : (
            <>
              <div className="flex items-center gap-2">
                <PermissionGuard module="project_request" entitlement="delete">
                  <Button
                    variant="outline"
                    onClick={() => setIsConfirmingDelete(true)}
                    className="h-11 px-4 text-xs font-bold border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700 gap-1.5"
                  >
                    <Trash2 size={16} /> Delete
                  </Button>
                </PermissionGuard>
                
                {request.status?.toLowerCase() === "draft" && (
                  <PermissionGuard module="project_request" entitlement="edit">
                    <Button
                      variant="outline"
                      onClick={() => router.push(`/project-request/material-consumption-request/${request.id}/edit`)}
                      className="h-11 px-4 text-xs font-bold border-gray-200 text-gray-700 hover:bg-gray-50 gap-1.5"
                    >
                      <Edit3 size={16} /> Edit
                    </Button>
                  </PermissionGuard>
                )}
              </div>

              <div className="flex items-center gap-2 flex-1 justify-end">
                {request.status?.toLowerCase() === "draft" && (
                  <PermissionGuard module="project_request" entitlement="submit">
                    <Button
                      disabled={isUpdating}
                      onClick={() => handleStatusChange("pending")}
                      className="h-11 px-5 text-xs font-bold bg-[#3B7CED] hover:bg-[#2d63c7] text-white gap-1.5"
                    >
                      <Check size={16} /> Submit
                    </Button>
                  </PermissionGuard>
                )}
              </div>
            </>
          )}
        </div>
      </div>

      <StatusModal
        isOpen={modalState.isOpen}
        onClose={handleModalClose}
        type={modalState.type}
        title={modalState.title}
        message={modalState.message}
        onAction={handleModalClose}
      />
    </div>
  );
}
