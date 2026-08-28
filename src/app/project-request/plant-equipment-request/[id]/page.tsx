"use client";

import React, { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { ArrowLeft, Bell, Calendar, User, CheckCircle, XCircle, HelpCircle, Loader2, Edit, Trash2, Send } from "lucide-react";
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
import { useModulePermissions } from "@/hooks/useModulePermissions";
import { extractErrorMessage } from "@/lib/utils";
import { PageGuard } from "@/components/auth/PageGuard";
import { motion, AnimatePresence } from "framer-motion";
import { Skeleton } from "@/components/ui/skeleton";

interface PlantEquipmentRequestItem {
  id: string;
  project: string;
  equipment: string;
  description: string;
  quantity: number;
  estimatedCost: number;
  status: "draft" | "approved" | "pending" | "rejected";
  requester: string;
  date: string;
  requiredDate: string;
  phase: string;
  task: string;
  notes: string;
}

import { 
  useGetPlantEquipmentRequestQuery,
  useDeletePlantEquipmentRequestMutation,
  useSubmitPlantEquipmentRequestMutation
} from "@/api/requests/plantEquipmentRequestApi";
import { useGetProjectCostingProjectsQuery } from "@/api/projectCostingApi";

export default function PlantEquipmentRequestDetailPage() {
  const router = useRouter();
  const { id } = useParams();
  const statusModal = useStatusModal();
  const { canDo } = useModulePermissions();
  const [request, setRequest] = useState<PlantEquipmentRequestItem | null>(null);
  const [isConfirmDeleteOpen, setIsConfirmDeleteOpen] = useState(false);
  const [rawRequestData, setRawRequestData] = useState<any>(null);

  const numericId = Number(id);
  const { data: apiRequest, isLoading: apiLoading, refetch } = useGetPlantEquipmentRequestQuery(numericId, {
    skip: isNaN(numericId)
  });
  const [deleteRequest, { isLoading: isDeleting }] = useDeletePlantEquipmentRequestMutation();
  const [submitRequest, { isLoading: isSubmitting }] = useSubmitPlantEquipmentRequestMutation();

  const { data: projectsData } = useGetProjectCostingProjectsQuery({});
  const projects = Array.isArray(projectsData)
    ? projectsData
    : (projectsData as any)?.results || [];

  useEffect(() => {
    if (apiRequest) {
      const req = apiRequest as any;
      setRawRequestData(req);
      const projectId = (req as any).project_details?.id || (req as any).project_request_id || (req as any).project_request?.id || (req as any).project_request || (req as any).project;
      const projectObj = projects.find((p: any) => p.id === projectId || String(p.id) === String(projectId));
      setRequest({
        id: String(req.reference_id || (req as any).project_request?.reference_id || req.id),
        project: req.project_details?.name || projectObj?.name || (projectId ? `Project #${projectId}` : "-"),
        equipment: req.equipment_name || "-",
        description: req.description || "",
        quantity: req.quantity || 0,
        estimatedCost: parseFloat(req.estimated_cost) || 0,
        status: ((req as any).project_request?.status || req.status || "pending") as "draft" | "approved" | "pending" | "rejected",
        requester: req.created_by_name || req.requester_name || "Current User",
        date: new Date(req.created_at || Date.now()).toLocaleDateString("en-GB", {
          day: "numeric",
          month: "short",
          year: "numeric"
        }),
        requiredDate: req.required_date ? new Date(req.required_date).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }) : "-",
        phase: req.phase_details?.name || "-",
        task: req.activity_details?.name || "-",
        notes: req.justification_notes || ""
      });
    } else {
      setRequest(null);
      setRawRequestData(null);
    }
  }, [apiRequest, id, projects]);

  const handleModalClose = () => {
    statusModal.close();
    if (statusModal.type === "success" && !isConfirmDeleteOpen) {
      router.push("/project-request/plant-equipment-request");
    }
  };

  const handleEdit = () => {
    router.push(`/project-request/plant-equipment-request/edit/${numericId}`);
  };

  const handleDelete = async () => {
    try {
      await deleteRequest(numericId).unwrap();
      setIsConfirmDeleteOpen(false);
      statusModal.showSuccess(
        "Request Deleted",
        "The plant & equipment request has been deleted successfully."
      );
    } catch (error) {
      console.error("Failed to delete request:", error);
      statusModal.showError("Error", extractErrorMessage(error, "Failed to delete the request. Please try again."));
    }
  };

  const handleSubmit = async () => {
    try {
      const parentRequestId = (rawRequestData as any)?.project_request?.id || (rawRequestData as any)?.project_request_id;
      if (!parentRequestId) throw new Error("Could not find parent project request ID");
      await submitRequest({ id: parentRequestId }).unwrap();
      statusModal.showSuccess(
        "Request Submitted",
        "The plant & equipment request has been submitted for approval."
      );
      refetch();
    } catch (error) {
      console.error("Failed to submit request:", error);
      statusModal.showError("Submit Failed", extractErrorMessage(error, "Failed to submit the request. Please try again."));
    }
  };

  const canEdit = request?.status === "draft" && canDo("project_request", "edit");
  const canDelete = request?.status === "draft" && canDo("project_request", "delete");
  const canSubmit = request?.status === "draft" && canDo("project_request", "submit");

  if (apiLoading || !request) {
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

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case "approved":
        return "bg-[#EAFDF0] text-[#2BA24D] border-none font-bold text-xs px-2.5 py-1 rounded-lg";
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

  const totalCost = request.quantity * request.estimatedCost;

  return (
    <PageGuard module="project_request" entitlement="view">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25, ease: "easeOut" }}
        className="min-h-screen bg-[#F9FAFB] pb-24"
      >
      {/* Header Bar */}
      <header className="w-full border-b border-gray-100 bg-white sticky top-0 z-30 shadow-none">
        <div className="max-w-2xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.push("/project-request/plant-equipment-request")}
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
              <span className="text-xs font-bold text-[#3B7CED] uppercase">{request.id}</span>
              <h2 className="text-lg font-bold text-gray-900 mt-1">{request.equipment}</h2>
            </div>
            <span className={getStatusBadgeClass(request.status)}>
              {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-100 text-xs">
            <div>
              <span className="block text-gray-400 font-semibold mb-0.5">Date Requested</span>
              <span className="font-bold text-gray-800 flex items-center gap-1">
                <Calendar size={14} className="text-gray-500" /> {request.date}
              </span>
            </div>
            <div>
              <span className="block text-gray-400 font-semibold mb-0.5">Requested By</span>
              <span className="font-bold text-gray-800 flex items-center gap-1">
                <User size={14} className="text-gray-500" /> {request.requester}
              </span>
            </div>
          </div>
        </div>

        {/* Plant & Equipment Details */}
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-none space-y-4">
          <h3 className="text-sm font-bold text-[#3B7CED] uppercase tracking-wider flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-[#3B7CED]" />
            Plant & Equipment Details
          </h3>

          <div className="space-y-3 text-xs">
            <div className="flex justify-between py-1.5 border-b border-gray-50">
              <span className="text-gray-500 font-semibold">Project</span>
              <span className="font-bold text-gray-900">{request.project}</span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-gray-50">
              <span className="text-gray-500 font-semibold">Equipment Name</span>
              <span className="font-bold text-gray-900">{request.equipment}</span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-gray-50">
              <span className="text-gray-500 font-semibold">Description</span>
              <span className="font-bold text-gray-900">{request.description || "N/A"}</span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-gray-50">
              <span className="text-gray-500 font-semibold">Quantity</span>
              <span className="font-bold text-gray-900">{request.quantity}</span>
            </div>
            <div className="flex justify-between py-1.5">
              <span className="text-gray-500 font-semibold">Required Date</span>
              <span className="font-bold text-gray-900">
                {request.requiredDate ? new Date(request.requiredDate).toLocaleDateString("en-GB", {
                  day: "numeric",
                  month: "short",
                  year: "numeric"
                }) : "N/A"}
              </span>
            </div>
          </div>
        </div>

        {/* WBS Details */}
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-none space-y-4">
          <h3 className="text-sm font-bold text-[#3B7CED] uppercase tracking-wider flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-[#3B7CED]" />
            WBS Breakdown
          </h3>

          <div className="space-y-3 text-xs">
            <div className="flex justify-between py-1.5 border-b border-gray-50">
              <span className="text-gray-500 font-semibold">Phase</span>
              <span className="font-bold text-gray-900">{request.phase}</span>
            </div>
            <div className="flex justify-between py-1.5">
              <span className="text-gray-500 font-semibold">Activity</span>
              <span className="font-bold text-gray-900">{request.task}</span>
            </div>
          </div>
        </div>

        {/* Cost Summary & Notes */}
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-none space-y-4">
          <h3 className="text-sm font-bold text-[#3B7CED] uppercase tracking-wider flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-[#3B7CED]" />
            Cost & Justification
          </h3>

          <div className="space-y-3 text-xs">
            <div className="flex justify-between py-1.5 border-b border-gray-50">
              <span className="text-gray-500 font-semibold">Estimated Unit Cost</span>
              <span className="font-bold text-gray-950">
                N{request.estimatedCost.toLocaleString("en-US", {
                  minimumFractionDigits: 2
                })}
              </span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-gray-50">
              <span className="text-gray-500 font-semibold">Total Cost</span>
              <span className="font-extrabold text-[#3B7CED]">
                N{totalCost.toLocaleString("en-US", {
                  minimumFractionDigits: 2
                })}
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

      {/* Fixed Action Bar for Draft Status */}
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
              Delete Plant & Equipment Request
            </DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this plant and equipment request? This action cannot be undone.
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
