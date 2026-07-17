"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { ArrowLeft, Bell, User, Loader2 } from "lucide-react";
import { useSelector } from "react-redux";
import type { RootState } from "@/lib/store/store";
import { Button } from "@/components/ui/button";
import { 
  useGetProjectRequestQuery, 
  useApproveProjectRequestMutation, 
  useRejectProjectRequestMutation 
} from "@/api/requests/projectRequestApi";
import { useGetProjectCostingProjectsQuery } from "@/api/projectCostingApi";
import { StatusModal, useStatusModal } from "@/components/shared/StatusModal";

const DataField = ({ label, value, fullWidth = false }: { label: string; value: string | React.ReactNode; fullWidth?: boolean }) => (
  <div className={`flex flex-col gap-1 ${fullWidth ? "col-span-2" : ""}`}>
    <p className="text-[13px] text-gray-400 font-medium">{label}</p>
    <p className="text-[14px] font-semibold text-gray-900">{value}</p>
  </div>
);

const SectionHeader = ({ title }: { title: string }) => (
  <h2 className="text-[17px] font-normal text-[#3B7CED] mb-4 mt-6 first:mt-0">{title}</h2>
);

export default function RequestDetailsPage() {
  const router = useRouter();
  const params = useParams();
  const user = useSelector((state: RootState) => state.auth?.user);
  const statusModal = useStatusModal();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const requestId = typeof params.id === "string" ? params.id : "";
  const numericId = Number(requestId);

  const { data: request, isLoading: isRequestLoading } = useGetProjectRequestQuery(numericId, {
    skip: !requestId || isNaN(numericId),
  });
  const { data: rawProjects } = useGetProjectCostingProjectsQuery({});
  const projects = React.useMemo(() => {
    const list = Array.isArray(rawProjects) ? rawProjects : (rawProjects as any)?.results || [];
    return list;
  }, [rawProjects]);

  const [approveRequest, { isLoading: isApproving }] = useApproveProjectRequestMutation();
  const [rejectRequest, { isLoading: isRejecting }] = useRejectProjectRequestMutation();

  const getProjectName = (projectId?: number) => {
    if (!projectId) return "General Project";
    const proj = projects?.find((p: any) => p.id === projectId);
    return proj ? (proj.name || proj.project_name || `Project #${projectId}`) : `Project #${projectId}`;
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

  const detail = React.useMemo(() => {
    if (!request?.detail) return {};
    if (typeof request.detail === "string") {
      try {
        return JSON.parse(request.detail);
      } catch (e) {
        return {};
      }
    }
    return request.detail;
  }, [request]);

  const requestType = request?.request_type || "";
  const isPettyCash = requestType === "petty_cash";
  const isLabour = requestType === "labour";
  const isSubcontractor = requestType === "subcontractor";
  const isPlantEquipment = requestType === "plant_equipment";
  const isPurchase = requestType === "purchase" || (!isPettyCash && !isLabour && !isSubcontractor && !isPlantEquipment);

  const formatCurrency = (val?: string | number) => {
    if (val === undefined || val === null) return "₦0.00";
    const num = typeof val === "string" ? parseFloat(val) : val;
    if (isNaN(num)) return "₦0.00";
    return "₦" + num.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return "N/A";
    try {
      return new Date(dateStr).toLocaleDateString("en-GB", {
        day: "numeric",
        month: "short",
        year: "numeric",
      });
    } catch (e) {
      return dateStr;
    }
  };

  const getTotalCost = () => {
    if (isPettyCash) return detail.amountRequested || detail.amount || 0;
    if (isLabour) {
      if (detail.projected_cost && parseFloat(detail.projected_cost) > 0)
        return parseFloat(detail.projected_cost);
      return (
        (Number(detail.estimated_daily_rate) || 0) *
        (Number(detail.number_of_workers) || 0) *
        (Number(detail.duration) || 0)
      );
    }
    if (isSubcontractor) return detail.contract_value || 0;
    if (isPlantEquipment) return detail.estimated_cost || 0;
    if (isPurchase) return detail.pr_total_price || 0;
    return 0;
  };

  const handleApprove = async () => {
    try {
      await approveRequest({ id: numericId }).unwrap();
      statusModal.showSuccess(
        "Request Approved",
        `Project request ${request?.reference_id || `ID ${numericId}`} has been successfully approved.`
      );
    } catch (err: any) {
      const errMsg = err?.data?.message || err?.data?.detail || "An error occurred while approving the request.";
      statusModal.showError("Approval Failed", errMsg);
    }
  };

  const handleReject = async () => {
    try {
      await rejectRequest({ id: numericId }).unwrap();
      statusModal.showSuccess(
        "Request Rejected",
        `Project request ${request?.reference_id || `ID ${numericId}`} has been successfully rejected.`
      );
    } catch (err: any) {
      const errMsg = err?.data?.message || err?.data?.detail || "An error occurred while rejecting the request.";
      statusModal.showError("Rejection Failed", errMsg);
    }
  };

  const handleModalClose = () => {
    statusModal.close();
    if (statusModal.type === "success") {
      router.push("/project-request/approve");
    }
  };

  if (!mounted) return null;

  return (
    <div className="min-h-screen bg-[#F9FAFB] pb-32">
      {/* Custom Header */}
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
            <h1 className="text-xl md:text-2xl font-normal text-gray-900">Approve Request</h1>
          </div>

          <div className="flex items-center gap-2 md:gap-4">
            <button className="p-2 rounded-lg hover:bg-gray-100 transition-colors">
              <Bell size={24} className="text-gray-900" />
            </button>
            <div className="w-8 h-8 bg-[#ffcdd2] rounded-full flex items-center justify-center overflow-hidden">
              {user?.user_image ? (
                <img src={user.user_image} alt="Avatar" className="w-full h-full object-cover" />
              ) : (
                <User size={18} className="text-red-900" />
              )}
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 pt-6 bg-white min-h-[calc(100vh-64px)] shadow-sm">
        {isRequestLoading ? (
          <div className="flex flex-col items-center justify-center py-32 space-y-4">
            <Loader2 className="w-10 h-10 text-[#3B7CED] animate-spin" />
            <p className="text-gray-500 font-medium">Loading request details...</p>
          </div>
        ) : request ? (
          <>
            <SectionHeader title="Basic Information" />
            
            <div className="grid grid-cols-2 gap-y-5 gap-x-4">
              <DataField label="Request Type" value={getRequestTypeLabel(request.request_type)} />
              <DataField 
                label="Requested by" 
                value={request.created_by_details 
                  ? `${request.created_by_details.first_name} ${request.created_by_details.last_name}` 
                  : `User #${request.created_by}`} 
              />
              
              <DataField label="Request ID" value={request.reference_id || `REQ-${request.id}`} />
              <DataField label="Date" value={formatDate(request.created_at)} />
              
              <div className="col-span-2 border-t border-gray-200 my-1"></div>
              
              <DataField label="Project" value={getProjectName(request.project)} />
              
              {isPettyCash && (
                <>
                  <DataField label="Purpose / Expense Category" value={detail.purpose || "N/A"} />
                  <DataField label="Description of Expense" value={detail.description || "N/A"} fullWidth />
                </>
              )}

              {isLabour && (
                <>
                  <DataField label="Role / Trade Type" value={detail.role_type || "N/A"} />
                  <DataField label="Number of Workers" value={String(detail.number_of_workers || 0)} />
                </>
              )}

              {isSubcontractor && (
                <>
                  <DataField label="Scope of Work" value={detail.scope_of_work || "N/A"} />
                  <DataField label="Subcontractor Name" value={detail.vendor_name || "N/A"} fullWidth />
                  <DataField label="Start Date" value={formatDate(detail.start_date)} />
                  <DataField label="End Date" value={formatDate(detail.end_date)} />
                </>
              )}

              {isPlantEquipment && (
                <>
                  <DataField label="Equipment Name" value={detail.equipment_name || "N/A"} />
                  <DataField label="Description" value={detail.description || "N/A"} fullWidth />
                  <DataField label="Quantity" value={String(detail.quantity || 0)} />
                  <DataField label="Required Date" value={formatDate(detail.required_date)} />
                </>
              )}

              {isPurchase && (
                <>
                  <DataField label="Required By Date" value={formatDate(detail.required_by_date)} />
                  <DataField label="Site Location" value={detail.requesting_location_details?.location_name || detail.requesting_location || "N/A"} />
                </>
              )}
            </div>

            <SectionHeader title="WBS" />
            <div className="grid grid-cols-2 gap-y-5 gap-x-4">
              <DataField label="Phase" value={detail.phase || "Foundation"} />
              <DataField label="Task" value={detail.task || "Concrete Pouring"} />
            </div>

            {isPettyCash && (
              <>
                <SectionHeader title="Cost Details" />
                <div className="grid grid-cols-2 gap-y-5 gap-x-4">
                  <DataField label="Amount Requested" value={formatCurrency(detail.amountRequested || detail.amount)} fullWidth />
                  <DataField label="Note" value={detail.notes || detail.justification_notes || "N/A"} fullWidth />
                </div>
              </>
            )}

            {isLabour && (
              <>
                <SectionHeader title="Cost Details" />
                <div className="grid grid-cols-2 gap-y-5 gap-x-4">
                  <DataField label="Duration" value={`${detail.duration || 0} ${detail.duration_unit || "days"}`} />
                  <DataField
                    label={
                      detail.duration_unit === "weeks"
                        ? "Estimated Weekly Rate"
                        : detail.duration_unit === "months"
                          ? "Estimated Monthly Rate"
                          : "Estimated Daily Rate"
                    }
                    value={formatCurrency(detail.estimated_daily_rate)}
                  />
                  <DataField label="Note" value={detail.justification_notes || "N/A"} fullWidth />
                </div>
              </>
            )}

            {isSubcontractor && (
              <>
                <SectionHeader title="Cost Details" />
                <div className="grid grid-cols-2 gap-y-5 gap-x-4">
                  <DataField label="Contract Value (Estimated)" value={formatCurrency(detail.contract_value)} />
                  <DataField label="Payment Terms" value={detail.payment_terms || "N/A"} />
                  <DataField label="Note" value={detail.justification_notes || "N/A"} fullWidth />
                </div>
              </>
            )}

            {isPlantEquipment && (
              <>
                <SectionHeader title="Cost Details" />
                <div className="grid grid-cols-2 gap-y-5 gap-x-4">
                  <DataField label="Estimated Cost" value={formatCurrency(detail.estimated_cost)} fullWidth />
                  <DataField label="Note" value={detail.justification_notes || "N/A"} fullWidth />
                </div>
              </>
            )}

            {isPurchase && (
              <>
                <SectionHeader title="Products" />
                <div className="space-y-4">
                  {detail.items && detail.items.length > 0 ? (
                    detail.items.map((item: any, idx: number) => (
                      <div key={idx} className="p-4 border border-gray-200 rounded-lg">
                        <div className="flex justify-between items-start mb-1">
                          <span className="text-[14px] font-semibold text-gray-900">
                            {item.product_details?.product_name || "Unknown Product"}
                          </span>
                          <span className="text-[14px] font-semibold text-gray-900">
                            {formatCurrency(item.estimated_unit_price)}
                          </span>
                        </div>
                        <div className="text-[12px] text-gray-600 mb-1">{item.qty || 0} QTY</div>
                        {item.product_details?.product_description && (
                          <div className="text-[12px] text-gray-400">{item.product_details.product_description}</div>
                        )}
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-gray-500 italic">No products listed.</p>
                  )}
                </div>
                <div className="mt-6">
                  <DataField label="Note" value={detail.purpose || "N/A"} fullWidth />
                </div>
              </>
            )}
          </>
        ) : (
          <div className="text-center py-24">
            <p className="text-red-500 font-semibold">Request not found or failed to load.</p>
            <Button onClick={() => router.back()} className="mt-4">Go Back</Button>
          </div>
        )}
      </main>

      {/* Fixed Bottom Action Bar */}
      {request && request.status === "pending" && (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 px-4 py-4 md:py-6 z-40">
          <div className="max-w-2xl mx-auto space-y-4">
            <div className="space-y-1.5">
              <div className="flex justify-between items-center text-sm font-bold text-gray-900">
                <span>Available Budget</span>
                <span>₦5,000,000.00</span>
              </div>
              <div className="flex justify-between items-center text-sm font-bold text-gray-900">
                <span>Total Cost</span>
                <span className="text-[#3B7CED]">
                  {formatCurrency(getTotalCost())}
                </span>
              </div>
            </div>
            
            <div className="flex gap-3 pt-2">
              <Button 
                variant="outline" 
                className="flex-1 border-red-500 text-red-500 hover:bg-red-50 hover:text-red-600 h-12 text-base font-semibold"
                disabled={isApproving || isRejecting}
                onClick={handleReject}
              >
                {isRejecting ? "Rejecting..." : "Reject"}
              </Button>
              <Button 
                className="flex-1 bg-[#22c55e] hover:bg-[#16a34a] text-white h-12 text-base font-semibold border-none"
                disabled={isApproving || isRejecting}
                onClick={handleApprove}
              >
                {isApproving ? "Approving..." : "Approve"}
              </Button>
            </div>
          </div>
        </div>
      )}

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

