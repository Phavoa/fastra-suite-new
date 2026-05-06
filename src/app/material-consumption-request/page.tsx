"use client";

import React from "react";
import { FileText, CheckCircle, Clock, XCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { RequestDashboard } from "@/components/requests/RequestDashboard";
import { RequestDashboardConfig, RequestStatus } from "@/components/requests/types";

interface MaterialConsumptionRequest {
  id: string;
  project: string;
  itemsCount: number;
  totalCost: number;
  requester: string;
  status: RequestStatus;
}

const mockRequests: MaterialConsumptionRequest[] = [
  {
    id: "MCR00001",
    project: "Project #1",
    itemsCount: 3,
    totalCost: 150000,
    requester: "Firstname Lastname",
    status: "approved",
  },
  {
    id: "MCR00002",
    project: "Project #2",
    itemsCount: 1,
    totalCost: 45000,
    requester: "Firstname Lastname",
    status: "pending",
  },
  {
    id: "MCR00003",
    project: "Project #3",
    itemsCount: 5,
    totalCost: 320000,
    requester: "Firstname Lastname",
    status: "draft",
  },
  {
    id: "MCR00004",
    project: "Project #4",
    itemsCount: 2,
    totalCost: 85000,
    requester: "Firstname Lastname",
    status: "rejected",
  },
];

const statusCounts: Record<RequestStatus, number> = {
  draft: 12,
  approved: 12,
  pending: 12,
  rejected: 12,
};

export default function MaterialConsumptionRequestPage() {
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
        return "default";
    }
  };

  const config: RequestDashboardConfig<MaterialConsumptionRequest> = {
    title: "Material Consumption Request",
    idPrefix: "MCR",
    newRequestPath: "/material-consumption-request/new",
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
      <Card className="p-4 hover:shadow-md transition-shadow cursor-pointer">
        <div className="flex justify-between items-start">
          <span className="text-sm font-semibold text-blue-500">{request.id}</span>
          <Badge variant={getStatusBadgeVariant(request.status) as any}>
            {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
          </Badge>
        </div>
        <p className="text-sm text-gray-600">{request.project}</p>

        <div className="flex justify-between items-center mt-2">
          <div className="flex gap-4">
            <div>
              <p className="text-sm text-gray-500 font-semibold">Items</p>
              <p className="text-sm text-gray-900">{request.itemsCount}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500 font-semibold">Total Cost</p>
              <p className="text-sm text-gray-900">
                ₦
                {request.totalCost.toLocaleString("en-NG", {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </p>
            </div>
          </div>

          <div>
            <p className="text-sm text-gray-500 font-semibold">Requester</p>
            <p className="text-sm text-gray-900">{request.requester}</p>
          </div>
        </div>
      </Card>
    ),
    mockData: mockRequests,
  };

  return <RequestDashboard config={config} />;
}
