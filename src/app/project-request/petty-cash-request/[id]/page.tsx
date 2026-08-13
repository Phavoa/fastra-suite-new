"use client";

import React from "react";
import { useRouter, useParams } from "next/navigation";
import { ArrowLeft, Bell, Calendar, User, Loader2, Edit, Trash2, Send, AlertCircle } from "lucide-react";
import { useGetProjectRequestQuery, useDeleteProjectRequestMutation, useSubmitProjectRequestMutation } from "@/api/requests/projectRequestApi";
import { useGetProjectCostingProjectsQuery } from "@/api/projectCostingApi";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { StatusModal, useStatusModal } from "@/components/shared/StatusModal";
import { useModulePermissions } from "@/hooks/useModulePermissions";
import { extractErrorMessage } from "@/lib/utils";

interface PettyCashRequestDetail {
  id: string;
  project: string;
  purpose: string;
  description: string;
  amountRequested: number;
  status: "draft" | "approved" | "pending" | "rejected" | "cancelled";
  requester: string;
  date: string;
  phase: string;
  task: string;
  notes: string;
}

export default function PettyCashRequestDetailPage() {
  const router = useRouter();
  const { id } = useParams();
  const numericId = Number(id);
  const { canDo } = useModulePermissions();
  const statusModal = useStatusModal();

  const [deleteRequest, { isLoading: isDeleting }] = useDeleteProjectRequestMutation();
  const [submitRequest, { isLoading: isSubmitting }] = useSubmitProjectRequestMutation();

  const [isConfirmingDelete, setIsConfirmingDelete] = React.useState(false);

  const { data: apiRequest, isLoading: apiLoading } = useGetProjectRequestQuery(numericId, {
    skip: isNaN(numericId),
  });
  const { data: rawProjects } = useGetProjectCostingProjectsQuery({});
  const projects = React.useMemo(() => {
    const list = Array.isArray(rawProjects) ? rawProjects : (rawProjects as any)?.results || [];
    return list;
  }, [rawProjects]);

  const getProjectName = (projectId?: number) => {
    if (!projectId) return "General Project";
    const proj = projects?.find((p: any) => p.id === projectId);
    return proj ? (proj.name || proj.project_name || `Project #${projectId}`) : `Project #${projectId}`;
  };

  const getStatusBadgeClass = (status: string) => {
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

  const request = React.useMemo<PettyCashRequestDetail | null>(() => {
    if (!apiRequest) return null;

    let detail: any = {};
    if (apiRequest.detail) {
      if (typeof apiRequest.detail === "string") {
        try {
          detail = JSON.parse(apiRequest.detail);
        } catch (e) {
          detail = {};
        }
      } else {
        detail = apiRequest.detail;
      }
    }

    // Attempt to map Phase name and Task name from mock project database if they are numeric IDs
    const matchedProject = projects.find((p: any) => p.id === apiRequest.project);
    let phaseName = detail.phase || "Foundation";
    let taskName = detail.task || "Concrete Pouring";

    if (matchedProject && matchedProject.wbs) {
      const matchPhase = matchedProject.wbs.find((w: any) => String(w.id) === String(detail.phase));
      if (matchPhase) phaseName = matchPhase.name;
      const matchTask = matchedProject.wbs.find((w: any) => String(w.id) === String(detail.task));
      if (matchTask) taskName = matchTask.name;
    }

    return {
      id: apiRequest.reference_id || `PC-${apiRequest.id}`,
      project: apiRequest.project_details?.name || getProjectName(apiRequest.project),
      purpose: detail.purpose || "N/A",
      description: detail.description || "N/A",
      amountRequested: parseFloat(detail.amount_requested) || detail.amountRequested || detail.amount || 0,
      status: apiRequest.status as any,
      requester: apiRequest.created_by_details
        ? `${apiRequest.created_by_details.first_name} ${apiRequest.created_by_details.last_name}`
        : `User #${apiRequest.created_by}`,
      date: new Date(apiRequest.created_at || Date.now()).toLocaleDateString("en-GB", {
        day: "numeric",
        month: "short",
        year: "numeric",
      }),
      phase: phaseName,
      task: taskName,
      notes: detail.notes || detail.justification_notes || "",
    };
  }, [apiRequest, projects]);

  const canEdit = request?.status === "draft" && canDo("project_request", "edit");
  const canDelete = request?.status === "draft" && canDo("project_request", "delete");
  const canSubmit = request?.status === "draft" && canDo("project_request", "submit");

  const handleEdit = () => {
    router.push(`/project-request/petty-cash-request/${id}/edit`);
  };

  const handleDelete = async () => {
    try {
      await deleteRequest(numericId).unwrap();
      statusModal.showSuccess("Request Deleted", "The petty cash request has been deleted.");
    } catch (error) {
      statusModal.showError("Delete Failed", extractErrorMessage(error, "Failed to delete the request."));
    }
  };

  const handleSubmit = async () => {
    try {
      await submitRequest({ id: numericId }).unwrap();
      statusModal.showSuccess("Request Submitted", "The petty cash request has been submitted for approval.");
    } catch (error) {
      statusModal.showError("Submit Failed", extractErrorMessage(error, "Failed to submit the request."));
    }
  };

  const handleModalClose = () => {
    statusModal.close();
    if (statusModal.type === "success" && !isConfirmingDelete) {
      router.push("/project-request/petty-cash-request");
    }
  };

  if (apiLoading) {
    return (
      <div className="min-h-screen bg-[#F9FAFB] flex flex-col items-center justify-center space-y-4">
        <Loader2 className="w-10 h-10 text-[#3B7CED] animate-spin" />
        <p className="text-gray-500 font-medium">Loading Petty Cash request details...</p>
      </div>
    );
  }

  if (!request) {
    return (
      <div className="min-h-screen bg-[#F9FAFB] flex flex-col items-center justify-center p-4">
        <p className="text-gray-500 font-semibold mb-4">Request not found.</p>
        <button
          onClick={() => router.push("/project-request/petty-cash-request")}
          className="px-4 py-2 bg-[#3B7CED] text-white rounded-lg text-xs font-bold shadow-none"
        >
          Back to Dashboard
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F9FAFB] pb-24">
      {/* Header Bar */}
      <header className="w-full border-b border-gray-100 bg-white sticky top-0 z-30 shadow-none">
        <div className="max-w-2xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.push("/project-request/petty-cash-request")}
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
              <h2 className="text-lg font-bold text-gray-900 mt-1">{request.purpose}</h2>
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

        {/* Petty Cash Details */}
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-none space-y-4">
          <h3 className="text-sm font-bold text-[#3B7CED] uppercase tracking-wider flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-[#3B7CED]" />
            Petty Cash Details
          </h3>

          <div className="space-y-3 text-xs">
            <div className="flex justify-between py-1.5 border-b border-gray-50">
              <span className="text-gray-500 font-semibold">Project</span>
              <span className="font-bold text-gray-900">{request.project}</span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-gray-50">
              <span className="text-gray-500 font-semibold">Purpose / Expense Category</span>
              <span className="font-bold text-gray-900">{request.purpose}</span>
            </div>
            <div className="flex justify-between py-1.5">
              <span className="text-gray-500 font-semibold">Description of Expense</span>
              <span className="font-bold text-gray-900">{request.description}</span>
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
              <span className="text-gray-500 font-semibold">Amount Requested</span>
              <span className="font-bold text-gray-950">
                ₦{request.amountRequested.toLocaleString("en-US", {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2
                })}
              </span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-gray-50">
              <span className="text-gray-500 font-semibold">Total Cost</span>
              <span className="font-extrabold text-[#3B7CED]">
                ₦{request.amountRequested.toLocaleString("en-US", {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2
                })}
              </span>
            </div>
            {request.notes && (
              <div className="pt-3">
                <span className="block text-gray-400 font-semibold mb-1">Notes / Justification</span>
                <p className="text-gray-700 bg-gray-50 p-3 rounded-lg border border-gray-200 leading-relaxed italic">
                  {request.notes}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Action Bottom Bar */}
        {(canEdit || canDelete || canSubmit) && (
          <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 p-4 z-20">
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
                <div className="w-full flex flex-wrap justify-end gap-3">
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
                      onClick={() => setIsConfirmingDelete(true)}
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
                </div>
              )}
            </div>
          </div>
        )}
      </main>

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
