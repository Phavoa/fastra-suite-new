"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { FileText, CheckCircle, Clock, XCircle, RefreshCw } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useGetPlantEquipmentRequestsQuery } from "@/api/requests/plantEquipmentRequestApi";
import { RequestDashboard } from "@/components/requests/RequestDashboard";
import { RequestDashboardConfig, RequestStatus } from "@/components/requests/types";
import { useGetProjectCostingProjectsQuery } from "@/api/projectCostingApi";

interface PlantEquipmentRequestItem {
  id: string;
  referenceId: string;
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

export default function PlantEquipmentRequestDashboard() {
  const router = useRouter();
  const [requests, setRequests] = useState<PlantEquipmentRequestItem[]>([]);

  const { data: apiRequests, isLoading: apiLoading } = useGetPlantEquipmentRequestsQuery();
  const { data: projectsData } = useGetProjectCostingProjectsQuery({});
  const projects = Array.isArray(projectsData)
    ? projectsData
    : (projectsData as any)?.results || [];

  useEffect(() => {
    if (apiRequests && Array.isArray(apiRequests)) {
      const mapped = apiRequests.map((req: any) => {
        let requesterName = "Requester";
        if (req.created_by_details && typeof req.created_by_details === "object") {
          const fullName = `${req.created_by_details.first_name || ""} ${req.created_by_details.last_name || ""}`.trim();
          requesterName = fullName || req.created_by_details.username || req.created_by_details.email || "Requester";
        } else if (
          typeof req.project_request === "object" &&
          (req as any).project_request?.created_by_details
        ) {
          const prCreatedBy = (req as any).project_request.created_by_details;
          const fullName = `${prCreatedBy.first_name || ""} ${prCreatedBy.last_name || ""}`.trim();
          requesterName = fullName || prCreatedBy.username || prCreatedBy.email || "Requester";
        } else if (req.requester_details?.user) {
          const userObj = req.requester_details.user;
          const fullName = `${userObj.first_name || ""} ${userObj.last_name || ""}`.trim();
          requesterName = fullName || userObj.username || userObj.email || "Requester";
        } else if (req.created_by_name && typeof req.created_by_name === "string") {
          requesterName = req.created_by_name;
        } else if (req.requester && typeof req.requester === "string" && isNaN(Number(req.requester))) {
          requesterName = req.requester;
        } else if (req.created_by_id) {
          requesterName = `User #${req.created_by_id}`;
        }

        return {
          id: String(req.id),
          referenceId: String((req as any).project_request?.reference_id || req.reference_id || req.id),
          project: req.project_details?.name || "General Project",
          equipment: req.equipment_name || "-",
          description: req.description || "",
          quantity: req.quantity || 0,
          estimatedCost: parseFloat(req.estimated_cost) || 0,
          status: ((req as any).project_request?.status || req.status || "pending") as "draft" | "approved" | "pending" | "rejected",
          requester: requesterName,
          date: new Date(req.created_at || Date.now()).toLocaleDateString("en-GB", {
            day: "numeric",
            month: "short",
            year: "numeric"
          }),
          requiredDate: req.required_date ? new Date(req.required_date).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }) : "-",
          phase: req.phase_details?.name || "-",
          task: req.activity_details?.name || "-",
          notes: req.justification_notes || ""
        };
      });
      setRequests(mapped);
    } else {
      setRequests([]);
    }
  }, [apiRequests, projects]);

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

  const getStatusCounts = () => {
    const counts = {
      draft: 0,
      approved: 0,
      pending: 0,
      rejected: 0,
    };

    requests.forEach((req) => {
      if (counts[req.status] !== undefined) {
        counts[req.status]++;
      }
    });

    return counts;
  };

  const statusCounts = getStatusCounts();

  const config: RequestDashboardConfig<PlantEquipmentRequestItem> = {
    title: "Plant & Equipment Request",
    idPrefix: "PE",
    newRequestPath: "/project-request/plant-equipment-request/new",
    statusCounts,
    summaryConfigs: [
      {
        status: "draft",
        label: "Draft",
        icon: FileText,
        colorClass: "text-[#3B7CED]",
        bgColorClass: "bg-[#EEF4FF]",
        borderColorClass: "border-[#3B7CED]/20",
      },
      {
        status: "approved",
        label: "Approved",
        icon: CheckCircle,
        colorClass: "text-[#2BA24D]",
        bgColorClass: "bg-[#EAFDF0]",
        borderColorClass: "border-[#2BA24D]/20",
      },
      {
        status: "pending",
        label: "Pending",
        icon: Clock,
        colorClass: "text-[#F0B401]",
        bgColorClass: "bg-[#FFFDF0]",
        borderColorClass: "border-[#F0B401]/20",
      },
      {
        status: "rejected",
        label: "Rejected",
        icon: XCircle,
        colorClass: "text-[#E43D2B]",
        bgColorClass: "bg-[#FFF2F0]",
        borderColorClass: "border-[#E43D2B]/20",
      },
    ],
    renderItem: (req) => (
      <div
        key={req.id}
        onClick={() => router.push(`/project-request/plant-equipment-request/${req.id}`)}
        className="p-4 border border-gray-200 rounded-lg bg-white hover:border-[#3B7CED] hover:shadow-xs transition-all cursor-pointer group"
      >
        <div className="flex justify-between items-center mb-1">
          <span className="text-xs font-bold text-[#3B7CED]">
            {req.referenceId || req.id}
          </span>
          <Badge variant={getStatusBadgeVariant(req.status)}>
            {req.status.charAt(0).toUpperCase() + req.status.slice(1)}
          </Badge>
        </div>

        <h3 className="text-sm font-bold text-gray-900 mb-1 group-hover:text-[#3B7CED] transition-colors">
          {req.project}
        </h3>
        <div className="text-xs text-gray-500 mb-4 flex items-center gap-2">
          <span>{req.equipment}</span>
        </div>

        <div className="grid grid-cols-3 text-xs gap-2 border-t border-gray-50 pt-3">
          <div>
            <span className="block text-gray-400 font-medium mb-0.5">
              Quantity
            </span>
            <span className="font-bold text-gray-800">
              {req.quantity}
            </span>
          </div>
          <div className="text-center">
            <span className="block text-gray-400 font-medium mb-0.5">
              Amount
            </span>
            <span className="font-bold text-gray-800">
              ₦{req.estimatedCost.toLocaleString("en-NG", {
                minimumFractionDigits: 2,
              })}
            </span>
          </div>
          <div className="text-right">
            <span className="block text-gray-400 font-medium mb-0.5">
              Requester
            </span>
            <span className="font-bold text-gray-800 truncate block">
              {req.requester}
            </span>
          </div>
        </div>
      </div>
    ),
    mockData: requests,
  };

  return (
    <RequestDashboard
      config={config}
      backUrl="/project-request/make-request"
      isLoading={apiLoading && requests.length === 0}
    />
  );
}

