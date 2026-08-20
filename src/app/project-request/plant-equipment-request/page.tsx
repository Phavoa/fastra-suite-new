"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { FileText, CheckCircle, Clock, XCircle, RefreshCw } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
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
        return {
          id: String(req.id),
          referenceId: String((req as any).project_request?.reference_id || req.reference_id || req.id),
          project: req.project_details?.name || "General Project",
          equipment: req.equipment_name || "-",
          description: req.description || "",
          quantity: req.quantity || 0,
          estimatedCost: parseFloat(req.estimated_cost) || 0,
          status: ((req as any).project_request?.status || req.status || "pending") as "draft" | "approved" | "pending" | "rejected",
          requester: req.created_by_name || "Requester",
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
      <Card
        key={req.id}
        onClick={() => router.push(`/project-request/plant-equipment-request/${req.id}`)}
        className="p-5 bg-white border border-gray-200 rounded-xl hover:shadow-xs transition-shadow duration-200 cursor-pointer space-y-4"
      >
        <div className="flex justify-between items-center">
          <span className="text-sm font-bold text-[#3B7CED]">{req.referenceId || req.id}</span>
          <Badge variant={getStatusBadgeVariant(req.status)}>
            {req.status.charAt(0).toUpperCase() + req.status.slice(1)}
          </Badge>
        </div>

        <div>
          <h3 className="text-base font-extrabold text-gray-900">{req.project}</h3>
        </div>

        <div className="grid grid-cols-2 gap-4 text-xs">
          <div>
            <span className="block text-gray-400 font-medium mb-1">Equipment</span>
            <span className="font-bold text-gray-900 text-sm">{req.equipment}</span>
          </div>
          <div>
            <span className="block text-gray-400 font-medium mb-1 text-right">Estimated Cost</span>
            <span className="block font-extrabold text-gray-950 text-sm text-right">
              ₦{req.estimatedCost.toLocaleString("en-US")}
            </span>
          </div>
        </div>
      </Card>
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

