"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  FileText,
  CheckCircle,
  Clock,
  XCircle,
  Wifi,
  WifiOff,
  RefreshCw,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { RequestDashboard } from "@/components/requests/RequestDashboard";
import {
  RequestDashboardConfig,
  RequestStatus,
} from "@/components/requests/types";
import { useGetLabourRequestsQuery, LabourRequest } from "@/api/requests/labourRequestApi";
import { useGetProjectCostingProjectsQuery } from "@/api/projectCostingApi";

// Combined interface for both online and offline data
interface DisplayLabourRequest {
  id: number;
  referenceId: string;
  project?: string;
  workers: number;
  role: string;
  requester: string;
  status: RequestStatus;
}

export default function LabourRequestPage() {
  const router = useRouter();
  const {
    data: apiData,
    isLoading,
    error,
    refetch,
  } = useGetLabourRequestsQuery({});
  const { data: projectsData } = useGetProjectCostingProjectsQuery({});
  const projects = Array.isArray(projectsData)
    ? projectsData
    : (projectsData as any)?.results || [];

  const [combinedData, setCombinedData] = useState<DisplayLabourRequest[]>([]);
  const [statusCounts, setStatusCounts] = useState<
    Record<RequestStatus, number>
  >({
    draft: 0,
    approved: 0,
    pending: 0,
    rejected: 0,
  });

  useEffect(() => {
    const rawApiData = apiData || [];
    const apiRequests: LabourRequest[] = Array.isArray(rawApiData)
      ? rawApiData
      : (rawApiData as any).results || [];

    const displayApiRequests: DisplayLabourRequest[] = apiRequests.map(
      (req) => {
        const projectId = req.project_request?.project || (req as any).project;
        const projectObj = projects.find((p: any) => p.id === projectId || String(p.id) === String(projectId));
        return {
          id: req.id,
          referenceId: req.reference_id,
          project: projectObj?.name || (projectId ? `Project #${projectId}` : "-"),
          workers: req.detail?.number_of_workers || 0,
          role: req.detail?.role_type || "Unknown",
          requester: req.detail?.created_by_name || "Requester",
          status: req.status || "draft",
        };
      },
    );

    setCombinedData(displayApiRequests);

    const counts = displayApiRequests.reduce(
      (acc, req) => {
        acc[req.status] = (acc[req.status] || 0) + 1;
        return acc;
      },
      {} as Record<RequestStatus, number>,
    );

    setStatusCounts({
      draft: counts.draft || 0,
      approved: counts.approved || 0,
      pending: counts.pending || 0,
      rejected: counts.rejected || 0,
    });
  }, [apiData, projects]);

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

  const config: RequestDashboardConfig<DisplayLabourRequest> = {
    title: "Labour Request",
    idPrefix: "LR",
    newRequestPath: "/project-request/labour-request/new",
    statusCounts,
    summaryConfigs: [
      {
        status: "draft",
        label: "Draft",
        icon: FileText,
        colorClass: "text-[#3B7CED]",
        bgColorClass: "bg-[#3B7CED]/5",
        borderColorClass: "border-[#3B7CED]/20",
      },
      {
        status: "approved",
        label: "Approved",
        icon: CheckCircle,
        colorClass: "text-[#2BA24D]",
        bgColorClass: "bg-[#2BA24D]/5",
        borderColorClass: "border-[#2BA24D]/20",
      },
      {
        status: "pending",
        label: "Pending",
        icon: Clock,
        colorClass: "text-[#F0B401]",
        bgColorClass: "bg-[#F0B401]/5",
        borderColorClass: "border-[#F0B401]/20",
      },
      {
        status: "rejected",
        label: "Rejected",
        icon: XCircle,
        colorClass: "text-[#E43D2B]",
        bgColorClass: "bg-[#E43D2B]/5",
        borderColorClass: "border-[#E43D2B]/20",
      },
    ],
    renderItem: (request) => (
      <Card
        className="p-4 hover:shadow-md transition-shadow cursor-pointer"
        onClick={() =>
          router.push(`/project-request/labour-request/${request.id}`)
        }
      >
        <div className="flex justify-between items-start">
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold text-blue-500">
              {request.referenceId}
            </span>
          </div>
          <Badge variant={getStatusBadgeVariant(request.status)}>
            {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
          </Badge>
        </div>
        <p className="text-sm text-gray-600">{request.project}</p>

        <div className="flex justify-between items-center mt-2">
          <div className="flex gap-4">
            <div>
              <p className="text-sm text-gray-500 font-semibold">Workers</p>
              <p className="text-sm text-gray-900">{request.workers}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500 font-semibold">Role</p>
              <p className="text-sm text-gray-900">{request.role}</p>
            </div>
          </div>

          <div>
            <p className="text-sm text-gray-500 font-semibold">Requester</p>
            <p className="text-sm text-gray-900">{request.requester}</p>
          </div>
        </div>
      </Card>
    ),
    mockData: combinedData,
  };

  if (isLoading && combinedData.length === 0) {
    return (
      <div className="min-h-screen bg-[#F1F5F9] flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-2 text-[#3B7CED]" />
          <p className="text-gray-600">Loading labour requests...</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <RequestDashboard
        config={config}
        backUrl="/project-request/make-request"
      />
    </div>
  );
}
