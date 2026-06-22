"use client";

import React from "react";
import { FileText, CheckCircle, Clock, XCircle, Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { RequestDashboard } from "@/components/requests/RequestDashboard";
import { RequestDashboardConfig, RequestStatus } from "@/components/requests/types";
import { useGetProjectRequestsQuery } from "@/api/requests/projectRequestApi";
import { useRouter } from "next/navigation";

interface PettyCashRequestItem {
  id: string;
  project: string;
  amountRequested: number;
  requester: string;
  status: RequestStatus;
  realId: number;
}

export default function PettyCashRequestPage() {
  const router = useRouter();
  const { data: apiRequests = [], isLoading } = useGetProjectRequestsQuery({
    request_type: "petty_cash",
  });

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
    }
  };

  const requests = React.useMemo(() => {
    return apiRequests.map((req) => {
      let detail: any = {};
      if (req.detail) {
        if (typeof req.detail === "string") {
          try {
            detail = JSON.parse(req.detail);
          } catch (e) {
            detail = {};
          }
        } else {
          detail = req.detail;
        }
      }
      return {
        id: req.reference_id || `PC-${req.id}`,
        project: req.project_details?.name || "General Project",
        amountRequested: parseFloat(detail.amount_requested) || detail.amountRequested || detail.amount || 0,
        requester: req.created_by_details 
          ? `${req.created_by_details.first_name} ${req.created_by_details.last_name}` 
          : `User #${req.created_by}`,
        status: (req.status === "cancelled" ? "rejected" : req.status) as RequestStatus,
        realId: req.id,
      };
    });
  }, [apiRequests]);

  const counts = React.useMemo(() => {
    const defaultCounts: Record<RequestStatus, number> = {
      draft: 0,
      approved: 0,
      pending: 0,
      rejected: 0,
    };
    requests.forEach((r) => {
      if (r.status in defaultCounts) {
        defaultCounts[r.status]++;
      }
    });
    return defaultCounts;
  }, [requests]);

  const config: RequestDashboardConfig<PettyCashRequestItem> = {
    title: "Petty Cash Request",
    idPrefix: "PC",
    newRequestPath: "/project-request/petty-cash-request/new",
    statusCounts: counts,
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
    renderItem: (request) => (
      <div 
        onClick={() => router.push(`/project-request/petty-cash-request/${request.realId}`)}
        className="p-4 border border-gray-200 rounded-md bg-white hover:shadow-md transition-shadow duration-200 cursor-pointer"
      >
        <div className="flex justify-between items-start">
          <span className="text-sm font-bold text-[#3B7CED]">{request.id}</span>
          <Badge variant={getStatusBadgeVariant(request.status)}>
            {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
          </Badge>
        </div>
        <p className="text-sm font-bold text-gray-900 mt-1">{request.project}</p>

        <div className="flex justify-between items-center mt-4">
          <div>
            <p className="text-xs text-gray-400 font-medium">Amount Requested</p>
            <p className="text-sm font-bold text-gray-900 mt-0.5">
              ₦{request.amountRequested.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </p>
          </div>
          <div className="text-right">
            <p className="text-xs text-gray-400 font-medium">Requester</p>
            <p className="text-sm font-bold text-gray-900 mt-0.5">{request.requester}</p>
          </div>
        </div>
      </div>
    ),
    mockData: requests,
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#F1F5F9] flex flex-col items-center justify-center space-y-4">
        <Loader2 className="w-10 h-10 text-[#3B7CED] animate-spin" />
        <p className="text-gray-500 font-medium">Loading Petty Cash dashboard...</p>
      </div>
    );
  }

  return <RequestDashboard config={config} backUrl="/project-request/make-request" />;
}
