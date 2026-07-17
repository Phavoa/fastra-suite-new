"use client";

export const dynamic = "force-dynamic";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  FileText,
  CheckCircle,
  Clock,
  XCircle,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useGetProjectPurchaseRequestsQuery } from "@/api/requests/projectPurchaseRequestApi";
import { RequestDashboard } from "@/components/requests/RequestDashboard";
import { RequestDashboardConfig, RequestStatus } from "@/components/requests/types";

interface PurchaseRequestItem {
  id: string;
  reference_id: string;
  title: string;
  status: "draft" | "approved" | "pending" | "rejected";
  quantity: number;
  amount: number;
  requester: string;
  date: string;
  project: string;
  location: string;
  requiredDate: string;
  phase: string;
  task: string;
  notes: string;
  lineCount?: number;
}

const mapApiRequestToUi = (req: any): PurchaseRequestItem => {
  let parsedProject =
    req.project_details?.name ||
    (typeof req.project_request === "object"
      ? req.project_request?.project_details?.name
      : null) ||
    (typeof req.project === "number"
      ? `Project #${req.project}`
      : req.project) ||
    "Project";
  let parsedPhase = req.phase || "Phase";
  let parsedTask = req.activity
    ? `Activity ${req.activity}`
    : req.task || "Task";
  const rawNotes = req.notes || req.purpose || "";
  let parsedNotes = rawNotes;

  if (rawNotes && typeof rawNotes === "string" && rawNotes.includes(" | ")) {
    const parts = rawNotes.split(" | ");
    parts.forEach((part: string) => {
      if (part.startsWith("Project: "))
        parsedProject = part.replace("Project: ", "");
      if (part.startsWith("Phase: ")) parsedPhase = part.replace("Phase: ", "");
      if (part.startsWith("Task: ")) parsedTask = part.replace("Task: ", "");
      if (part.startsWith("Activity: "))
        parsedTask = part.replace("Activity: ", "");
      if (part.startsWith("Notes: ")) parsedNotes = part.replace("Notes: ", "");
    });
  }

  const rawLines = req.lines || req.items || [];
  const totalQty =
    rawLines.reduce(
      (sum: number, item: any) => sum + Number(item.quantity || item.qty || 0),
      0,
    ) || Number(req.quantity || 0);
  const totalAmount = Number(
    req.total_amount ||
      req.pr_total_price ||
      req.amount ||
      rawLines.reduce(
        (sum: number, item: any) =>
          sum +
          Number(
            item.line_total ||
              (item.quantity || item.qty || 0) *
                (item.estimated_unit_cost || item.estimated_unit_price || 0) ||
              0,
          ),
        0,
      ),
  );

  let requesterName = "Requester";
  if (
    req.requester &&
    typeof req.requester === "string" &&
    isNaN(Number(req.requester))
  ) {
    requesterName = req.requester;
  } else if (req.requester_details?.user) {
    requesterName =
      `${req.requester_details.user.first_name || ""} ${req.requester_details.user.last_name || ""}`.trim() ||
      req.requester_details.user.username;
  } else if (
    typeof req.project_request === "object" &&
    req.project_request?.created_by_details
  ) {
    requesterName =
      `${req.project_request.created_by_details.first_name || ""} ${req.project_request.created_by_details.last_name || ""}`.trim() ||
      req.project_request.created_by_details.username;
  }

  const dateValue =
    req.created_at || req.date_created || req.date || Date.now();
  const formattedDate = new Date(dateValue).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

  const refId =
    req.reference_id ||
    (typeof req.project_request === "object"
      ? req.project_request?.reference_id
      : null) ||
    String(req.id || "PR-REQ");
  const statusVal =
    req.status ||
    (typeof req.project_request === "object"
      ? req.project_request?.status
      : null) ||
    "pending";
  const locationVal =
    req.site_location ||
    req.requesting_location_details?.location_name ||
    req.requesting_location ||
    req.location ||
    "Lagos Site";
  const reqDateVal =
    req.required_by_date ||
    req.requiredDate ||
    (req.date_updated
      ? new Date(req.date_updated).toISOString().split("T")[0]
      : "");

  const titleVal =
    req.title ||
    (parsedProject && parsedProject !== "Project"
      ? `Purchase Request - ${parsedProject}`
      : `Purchase Request #${req.id || refId}`);

  return {
    id: String(req.id),
    reference_id: refId,
    title: titleVal,
    status: (statusVal.toLowerCase() as any) || "pending",
    quantity: totalQty,
    amount: totalAmount,
    requester: requesterName,
    date: formattedDate,
    project: parsedProject,
    location: locationVal,
    requiredDate: reqDateVal,
    phase: parsedPhase,
    task: parsedTask,
    notes: parsedNotes,
    lineCount: rawLines.length || 1,
  };
};

export default function PurchaseRequestsDashboard() {
  const router = useRouter();
  const [requests, setRequests] = useState<PurchaseRequestItem[]>([]);

  const { data: apiRequests, isLoading: isApiLoading } =
    useGetProjectPurchaseRequestsQuery({});

  useEffect(() => {
    let apiList: PurchaseRequestItem[] = [];
    if (apiRequests && Array.isArray(apiRequests)) {
      apiList = apiRequests.map(mapApiRequestToUi);
    } else if (apiRequests && Array.isArray((apiRequests as any).results)) {
      apiList = (apiRequests as any).results.map(mapApiRequestToUi);
    }
    setRequests(apiList);
  }, [apiRequests]);

  const getStatusBadgeVariant = (
    status: "draft" | "approved" | "pending" | "rejected",
  ) => {
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

  const config: RequestDashboardConfig<PurchaseRequestItem> = {
    title: "Purchase Request",
    idPrefix: "PR",
    newRequestPath: "/project-request/purchase-request/new",
    statusCounts,
    summaryConfigs: [
      {
        status: "draft",
        label: "Draft",
        icon: FileText,
        colorClass: "text-[#3B7CED]",
        bgColorClass: "bg-[#F3F8FF]",
        borderColorClass: "border-[#D0E0FB]",
      },
      {
        status: "approved",
        label: "Approved",
        icon: CheckCircle,
        colorClass: "text-[#2BA24D]",
        bgColorClass: "bg-[#F2FDF5]",
        borderColorClass: "border-[#D7F4DF]",
      },
      {
        status: "pending",
        label: "Pending",
        icon: Clock,
        colorClass: "text-[#F0B401]",
        bgColorClass: "bg-[#FFFDF5]",
        borderColorClass: "border-[#FFF2CC]",
      },
      {
        status: "rejected",
        label: "Rejected",
        icon: XCircle,
        colorClass: "text-[#E43D2B]",
        bgColorClass: "bg-[#FFF7F6]",
        borderColorClass: "border-[#F9D6D2]",
      },
    ],
    renderItem: (req) => (
      <div
        key={req.id}
        onClick={() =>
          router.push(`/project-request/purchase-request/${req.id}`)
        }
        className="p-4 border border-gray-200 rounded-lg bg-white hover:border-[#3B7CED] hover:shadow-xs transition-all cursor-pointer group"
      >
        <div className="flex justify-between items-center mb-1">
          <span className="text-xs font-bold text-[#3B7CED]">
            {req.reference_id}
          </span>
          <Badge variant={getStatusBadgeVariant(req.status)}>
            {req.status.charAt(0).toUpperCase() + req.status.slice(1)}
          </Badge>
        </div>

        <h3 className="text-sm font-bold text-gray-900 mb-1 group-hover:text-[#3B7CED] transition-colors">
          {req.title}
        </h3>
        <div className="text-xs text-gray-500 mb-4 flex items-center gap-2">
          <span className="font-semibold text-[#3B7CED]">
            {req.lineCount || 1} Line Item
            {(req.lineCount || 1) > 1 ? "s" : ""}
          </span>
          &bull;
          <span>{req.location}</span>
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
              ₦
              {req.amount.toLocaleString("en-NG", {
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

  if (isApiLoading && requests.length === 0) {
    return (
      <div className="min-h-screen bg-[#F9FAFB] pb-28">
        <header className="w-full border-b border-gray-100 bg-white sticky top-0 z-30">
          <div className="max-w-2xl mx-auto px-4 h-16 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gray-200 rounded-lg animate-pulse"></div>
              <div className="h-6 bg-gray-200 rounded w-36 animate-pulse"></div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gray-200 rounded-full animate-pulse"></div>
            </div>
          </div>
        </header>
        <main className="max-w-2xl mx-auto px-4 pt-4 space-y-4">
          <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-xs">
            <div className="grid grid-cols-2 gap-3">
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className="p-4 border border-gray-100 rounded-lg h-24 bg-gray-50 animate-pulse"
                >
                  <div className="h-4 bg-gray-200 rounded w-16 mb-2"></div>
                  <div className="h-8 bg-gray-200 rounded w-10"></div>
                </div>
              ))}
            </div>
          </div>
          <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-xs space-y-4">
            <div className="h-5 bg-gray-200 rounded w-40 animate-pulse"></div>
            <div className="flex gap-2 pb-1">
              {[1, 2, 3, 4, 5].map((i) => (
                <div
                  key={i}
                  className="h-8 bg-gray-200 rounded-full w-20 animate-pulse"
                ></div>
              ))}
            </div>
            <div className="space-y-3 pt-2">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="p-4 border border-gray-100 rounded-lg space-y-3 animate-pulse"
                >
                  <div className="flex justify-between items-center">
                    <div className="h-4 bg-gray-200 rounded w-24"></div>
                    <div className="h-5 bg-gray-200 rounded-full w-16"></div>
                  </div>
                  <div className="h-5 bg-gray-200 rounded w-64"></div>
                  <div className="h-3 bg-gray-200 rounded w-32"></div>
                  <div className="grid grid-cols-3 gap-2 border-t border-gray-50 pt-3">
                    <div className="h-8 bg-gray-200 rounded"></div>
                    <div className="h-8 bg-gray-200 rounded"></div>
                    <div className="h-8 bg-gray-200 rounded"></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <RequestDashboard
      config={config}
      backUrl="/project-request/make-request"
    />
  );
}

