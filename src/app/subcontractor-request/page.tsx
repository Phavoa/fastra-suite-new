"use client";

import React, { useMemo } from "react";
import { useRouter } from "next/navigation";
import { FileText, CheckCircle, Clock, XCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { RequestDashboard } from "@/components/requests/RequestDashboard";
import { RequestDashboardConfig, RequestStatus } from "@/components/requests/types";
import { useGetSubcontractorRequestsQuery } from "@/api/subcontractorRequestApi";
import { SubcontractorRequest } from "@/types/subcontractorRequest";
import { extractErrorMessage } from "@/lib/utils";

export default function SubcontractorRequestPage() {
  const router = useRouter();
  const {
    data: requests = [],
    isLoading,
    isError,
    error,
  } = useGetSubcontractorRequestsQuery({});

  const statusCounts: Record<RequestStatus, number> = useMemo(() => {
    const counts: Record<RequestStatus, number> = {
      draft: 0,
      approved: 0,
      pending: 0,
      rejected: 0,
    };

    // Note: The API doesn't seem to provide a status field in the SubcontractorRequest schema provided
    // but the RequestDashboard component requires it. I'll default to 'pending' or try to map it if I find it.
    // Looking at the provided schema, there is no status. I'll assume 'pending' for now or check if it's hidden.
    // Wait, the previous mock had status. I'll use a placeholder or check if vendor_name exists to count as 'draft'.
    
    requests.forEach((req: any) => {
      const status = (req.status || "pending") as RequestStatus;
      if (counts[status] !== undefined) {
        counts[status]++;
      }
    });

    return counts;
  }, [requests]);

  const getStatusBadgeVariant = (status: RequestStatus) => {
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
        return "pending";
    }
  };

  const config: RequestDashboardConfig<any> = {
    title: "Subcontractor Request",
    idPrefix: "SC",
    newRequestPath: "/subcontractor-request/new",
    statusCounts,
    summaryConfigs: [
      {
        status: "draft",
        label: "Draft",
        icon: FileText,
        colorClass: "text-blue-500",
        bgColorClass: "bg-blue-50",
        borderColorClass: "border-blue-200",
      },
      {
        status: "approved",
        label: "Approved",
        icon: CheckCircle,
        colorClass: "text-green-500",
        bgColorClass: "bg-green-50",
        borderColorClass: "border-green-200",
      },
      {
        status: "pending",
        label: "Pending",
        icon: Clock,
        colorClass: "text-amber-500",
        bgColorClass: "bg-amber-50",
        borderColorClass: "border-amber-200",
      },
      {
        status: "rejected",
        label: "Rejected",
        icon: XCircle,
        colorClass: "text-red-500",
        bgColorClass: "bg-red-50",
        borderColorClass: "border-red-200",
      },
    ],
    renderItem: (request: any) => (
      <div 
        key={request.id}
        onClick={() => router.push(`/subcontractor-request/${request.id}`)}
        className="p-4 border border-gray-200 rounded-lg bg-white hover:border-[#3B7CED] hover:shadow-md transition-all cursor-pointer group"
      >
        <div className="flex justify-between items-start">
          <span className="text-sm font-bold text-[#3B7CED] group-hover:text-blue-600">{request.reference_id || `SR-${String(request.id).padStart(5, "0")}`}</span>
          <Badge variant={getStatusBadgeVariant(request.status || "pending")}>
            {(request.status || "pending").charAt(0).toUpperCase() + (request.status || "pending").slice(1)}
          </Badge>
        </div>
        <p className="text-sm font-bold text-gray-900 mt-1">{request.vendor_name || "No Vendor Name"}</p>

        <div className="flex justify-between items-center mt-4">
          <div>
            <p className="text-xs text-gray-400 font-medium uppercase tracking-tight">Scope of Work</p>
            <p className="text-sm font-semibold text-gray-700 mt-0.5 line-clamp-1">{request.scope_of_work}</p>
          </div>
          <div className="text-right">
            <p className="text-xs text-gray-400 font-medium uppercase tracking-tight">Value</p>
            <p className="text-sm font-bold text-gray-900 mt-0.5">₦{Number(request.contract_value).toLocaleString()}</p>
          </div>
        </div>
      </div>
    ),
    mockData: requests.map(req => ({ ...req, status: req.status || "pending" })),
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F1F5F9]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#3B7CED] mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Loading requests...</p>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F1F5F9]">
        <div className="text-center text-red-600 p-8 bg-white rounded-lg shadow-sm border border-red-100">
          <XCircle className="h-12 w-12 mx-auto mb-4" />
          <h3 className="text-lg font-bold mb-2">Error Loading Requests</h3>
          <p className="text-sm">{extractErrorMessage(error, "Please try again later")}</p>
        </div>
      </div>
    );
  }

  return <RequestDashboard config={config} />;
}
