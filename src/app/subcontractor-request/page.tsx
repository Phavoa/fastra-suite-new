"use client";

import React from "react";
import { FileText, CheckCircle, Clock, XCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { RequestDashboard } from "@/components/requests/RequestDashboard";
import { RequestDashboardConfig, RequestStatus } from "@/components/requests/types";

interface SubcontractorRequest {
  id: string;
  project: string;
  scopeOfWork: string;
  subcontractorName: string;
  status: RequestStatus;
}

const mockRequests: SubcontractorRequest[] = [
  {
    id: "SC00001",
    project: "Project #1",
    scopeOfWork: "Constructions",
    subcontractorName: "Firstname Lastname",
    status: "approved",
  },
  {
    id: "SC00002",
    project: "Project #1",
    scopeOfWork: "Constructions",
    subcontractorName: "Firstname Lastname",
    status: "pending",
  },
  {
    id: "SC00003",
    project: "Project #1",
    scopeOfWork: "Constructions",
    subcontractorName: "Firstname Lastname",
    status: "draft",
  },
];

const statusCounts: Record<RequestStatus, number> = {
  draft: 12,
  approved: 12,
  pending: 12,
  rejected: 12,
};

export default function SubcontractorRequestPage() {
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

  const config: RequestDashboardConfig<SubcontractorRequest> = {
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
    renderItem: (request) => (
      <div className="p-4 border border-gray-200 rounded-md bg-white">
        <div className="flex justify-between items-start">
          <span className="text-sm font-bold text-[#3B7CED]">{request.id}</span>
          <Badge variant={getStatusBadgeVariant(request.status)}>
            {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
          </Badge>
        </div>
        <p className="text-sm font-bold text-gray-900 mt-1">{request.project}</p>

        <div className="flex justify-between items-center mt-4">
          <div>
            <p className="text-xs text-gray-400 font-medium">Scope of Work</p>
            <p className="text-sm font-bold text-gray-900 mt-0.5">{request.scopeOfWork}</p>
          </div>
          <div className="text-right">
            <p className="text-xs text-gray-400 font-medium">Subcontractor Name</p>
            <p className="text-sm font-bold text-gray-900 mt-0.5">{request.subcontractorName}</p>
          </div>
        </div>
      </div>
    ),
    mockData: mockRequests,
  };

  return <RequestDashboard config={config} />;
}
