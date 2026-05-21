"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Bell, User, Loader2, FileCheck, ArrowRight } from "lucide-react";
import { useSelector } from "react-redux";
import type { RootState } from "@/lib/store/store";
import { Button } from "@/components/ui/button";
import { 
  useGetProjectRequestsQuery, 
  useApproveProjectRequestMutation, 
  useRejectProjectRequestMutation 
} from "@/api/requests/projectRequestApi";
import { useGetProjectsQuery } from "@/api/projectApi";
import { StatusModal, useStatusModal } from "@/components/shared/StatusModal";

export default function ApproveRequestPage() {
  const router = useRouter();
  const user = useSelector((state: RootState) => state.auth?.user);
  const statusModal = useStatusModal();

  const { data: apiRequests, isLoading: isRequestsLoading, refetch } = useGetProjectRequestsQuery({
    status: "pending"
  });
  const { data: projects } = useGetProjectsQuery();

  const [approveRequest, { isLoading: isApproving }] = useApproveProjectRequestMutation();
  const [rejectRequest, { isLoading: isRejecting }] = useRejectProjectRequestMutation();

  const getProjectName = (projectId?: number) => {
    if (!projectId) return "General Project";
    const proj = projects?.find((p) => p.id === projectId);
    return proj ? proj.name : `Project #${projectId}`;
  };

  const getRequestTypeLabel = (type: string) => {
    switch (type) {
      case "labour":
        return "Labour Request";
      case "purchase":
        return "Purchase Request";
      case "petty_cash":
        return "Petty Cash Request";
      case "subcontractor":
        return "Subcontractor Request";
      case "plant_equipment":
        return "Plant & Equipment Request";
      default:
        return type.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
    }
  };

  const handleApprove = async (id: number) => {
    try {
      await approveRequest({ id }).unwrap();
      statusModal.showSuccess(
        "Request Approved",
        `Project request ID ${id} has been successfully approved.`
      );
      refetch();
    } catch (err: any) {
      const errMsg = err?.data?.message || err?.data?.detail || "An error occurred while approving the request.";
      statusModal.showError("Approval Failed", errMsg);
    }
  };

  const handleReject = async (id: number) => {
    try {
      await rejectRequest({ id }).unwrap();
      statusModal.showSuccess(
        "Request Rejected",
        `Project request ID ${id} has been successfully rejected.`
      );
      refetch();
    } catch (err: any) {
      const errMsg = err?.data?.message || err?.data?.detail || "An error occurred while rejecting the request.";
      statusModal.showError("Rejection Failed", errMsg);
    }
  };

  return (
    <div className="min-h-screen bg-[#F9FAFB]">
      {/* Custom Header with Back Button */}
      <header className="w-full border-b border-gray-100 bg-white sticky top-0 z-30">
        <div className="max-w-2xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.back()}
              className="p-2 -ml-2 rounded-lg hover:bg-gray-100 transition-colors"
              aria-label="Go back"
            >
              <ArrowLeft size={24} className="text-gray-600" />
            </button>
            <h1 className="text-xl md:text-2xl font-normal text-gray-900">
              Approve Request
            </h1>
          </div>

          <div className="flex items-center gap-2 md:gap-4">
            <button className="p-2 rounded-lg hover:bg-gray-100 transition-colors">
              <Bell size={24} className="text-gray-900" />
            </button>
            <div className="w-8 h-8 bg-[#ffcdd2] rounded-full flex items-center justify-center overflow-hidden">
              {user?.user_image ? (
                <img
                  src={user.user_image}
                  alt="Avatar"
                  className="w-full h-full object-cover"
                />
              ) : (
                <User size={18} className="text-red-900" />
              )}
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-2xl mx-auto p-4 pt-6 pb-24">
        <div className="space-y-4">
          {isRequestsLoading ? (
            <div className="flex flex-col items-center justify-center py-24 space-y-4 bg-white rounded-lg border border-gray-200">
              <Loader2 className="w-8 h-8 text-[#3B7CED] animate-spin" />
              <p className="text-gray-500 font-medium text-sm">Loading pending requests...</p>
            </div>
          ) : apiRequests && apiRequests.length > 0 ? (
            apiRequests.map((request) => (
              <div
                key={request.id}
                className="bg-white border border-gray-200 rounded-lg p-4 cursor-pointer hover:border-[#3B7CED] transition-colors"
                onClick={() =>
                  router.push(`/project-request/approve/${request.id}`)
                }
              >
                <div className="flex flex-col gap-4">
                  <div>
                    <span className="text-xs font-bold text-[#3B7CED] mb-0.5 block">
                      {request.reference_id || `REQ-${request.id}`}
                    </span>
                    <h3 className="text-base font-bold text-gray-900 leading-tight">
                      {getProjectName(request.project)}
                    </h3>
                  </div>

                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <p className="text-xs text-gray-400 font-medium mb-0.5">
                        Request Type
                      </p>
                      <p className="text-sm font-semibold text-gray-900">
                        {getRequestTypeLabel(request.request_type)}
                      </p>
                    </div>
                    <div className="flex-1 text-right">
                      <p className="text-xs text-gray-400 font-medium mb-0.5">
                        Requester
                      </p>
                      <p className="text-sm font-semibold text-gray-900">
                        {request.created_by_details 
                          ? `${request.created_by_details.first_name} ${request.created_by_details.last_name}` 
                          : `User #${request.created_by}`}
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-3 pt-2">
                    <Button
                      variant="outline"
                      className="flex-1 border-red-500 text-red-500 hover:bg-red-50 hover:text-red-600 h-10 font-semibold"
                      disabled={isApproving || isRejecting}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleReject(request.id);
                      }}
                    >
                      Reject
                    </Button>
                    <Button
                      className="flex-1 border border-[#22c55e] bg-[#22c55e] hover:bg-[#16a34a] text-white h-10 font-semibold"
                      disabled={isApproving || isRejecting}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleApprove(request.id);
                      }}
                    >
                      Approve
                    </Button>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-16 px-6 bg-white rounded-2xl border border-gray-100 shadow-sm flex flex-col items-center justify-center space-y-6 max-w-md mx-auto mt-8 transition-all hover:shadow-md duration-300">
              <div className="relative">
                {/* Decorative background glow */}
                <div className="absolute inset-0 bg-[#3B7CED]/10 rounded-full blur-xl transform scale-150 animate-pulse"></div>
                <div className="w-16 h-16 bg-[#EEF4FF] border border-[#D0E1FD] rounded-full flex items-center justify-center relative z-10 text-[#3B7CED]">
                  <FileCheck size={28} className="animate-pulse" />
                </div>
              </div>
              
              <div className="space-y-2">
                <h3 className="text-lg font-bold text-gray-900">All Caught Up!</h3>
                <p className="text-sm text-gray-500 max-w-[280px] mx-auto leading-relaxed">
                  There are no pending project requests awaiting your approval at the moment.
                </p>
              </div>

              <Button
                onClick={() => router.push("/project-request")}
                className="bg-[#3B7CED] hover:bg-[#2d63c7] text-white px-6 h-11 rounded-xl text-sm font-semibold transition-all duration-200 flex items-center gap-2 border-none shadow-none"
              >
                Go to Dashboard
                <ArrowRight size={16} />
              </Button>
            </div>
          )}
        </div>
      </main>

      <StatusModal
        isOpen={statusModal.isOpen}
        onClose={statusModal.close}
        type={statusModal.type}
        title={statusModal.title}
        message={statusModal.message}
        actionText="Done"
      />
    </div>
  );
}

