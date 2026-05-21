"use client";

export const dynamic = "force-dynamic";

import React, { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { ArrowLeft, Bell, Calendar, DollarSign, FileText, CheckCircle, Clock, XCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useGetProjectPurchaseRequestQuery } from "@/api/requests/projectPurchaseRequestApi";

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
}

const mapApiRequestToUi = (req: any): PurchaseRequestItem => {
  let parsedProject = "Project";
  let parsedPhase = "Phase";
  let parsedTask = "Task";
  let parsedNotes = req.purpose || "";

  if (req.purpose && req.purpose.includes(" | ")) {
    const parts = req.purpose.split(" | ");
    parts.forEach((part: string) => {
      if (part.startsWith("Project: ")) parsedProject = part.replace("Project: ", "");
      if (part.startsWith("Phase: ")) parsedPhase = part.replace("Phase: ", "");
      if (part.startsWith("Task: ")) parsedTask = part.replace("Task: ", "");
      if (part.startsWith("Notes: ")) parsedNotes = part.replace("Notes: ", "");
    });
  }

  const totalQty = req.items?.reduce((sum: number, item: any) => sum + Number(item.qty || 0), 0) || 0;
  const totalAmount = Number(req.pr_total_price || 0);

  const requesterName = req.requester_details?.user
    ? `${req.requester_details.user.first_name || ""} ${req.requester_details.user.last_name || ""}`.trim() || req.requester_details.user.username
    : "Requester";

  const formattedDate = new Date(req.date_created).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

  return {
    id: req.id,
    reference_id: req.id,
    title: req.items?.map((it: any) => it.product_details?.product_name || "Product").join(", ") || parsedProject || "Purchase Request",
    status: req.status || "pending",
    quantity: totalQty,
    amount: totalAmount,
    requester: requesterName,
    date: formattedDate,
    project: parsedProject,
    location: req.requesting_location_details?.location_name || req.requesting_location || "Lagos Site",
    requiredDate: req.date_updated ? new Date(req.date_updated).toISOString().split("T")[0] : "",
    phase: parsedPhase,
    task: parsedTask,
    notes: parsedNotes,
  };
};

export default function PurchaseRequestDetailPage() {
  const router = useRouter();
  const { id } = useParams();
  const [request, setRequest] = useState<PurchaseRequestItem | null>(null);

  const { data: apiData, isLoading: isApiLoading } = useGetProjectPurchaseRequestQuery(
    id as string,
    { skip: !id || String(id).startsWith("pr-") }
  );

  useEffect(() => {
    if (id && String(id).startsWith("pr-")) {
      const stored = localStorage.getItem("project_purchase_requests");
      let list: PurchaseRequestItem[] = [];
      if (stored) {
        try {
          list = JSON.parse(stored).filter(
            (item: any) =>
              item.id !== "pr-1" && item.id !== "pr-2" && item.id !== "pr-3",
          );
        } catch (e) {
          list = [];
        }
      } else {
        list = [];
      }

      const found = list.find((r) => r.id === id);
      if (found) {
        setRequest(found);
      } else {
        const fallback = list[0];
        if (fallback) setRequest(fallback);
      }
    } else if (apiData) {
      setRequest(mapApiRequestToUi(apiData));
    }
  }, [id, apiData]);

  if (isApiLoading && !request) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 text-gray-500 text-sm">
        Loading purchase request details from API...
      </div>
    );
  }

  if (!request) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 text-gray-500 text-sm">
        Loading purchase request details...
      </div>
    );
  }

  const getStatusBadgeVariant = (status: "draft" | "approved" | "pending" | "rejected") => {
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

  return (
    <div className="min-h-screen bg-[#F9FAFB] pb-24">
      {/* Header Bar */}
      <header className="w-full border-b border-gray-100 bg-white sticky top-0 z-30">
        <div className="max-w-2xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.push("/project-request/purchase-request")}
              className="p-1 rounded-lg hover:bg-gray-50 transition-colors"
              aria-label="Back"
            >
              <ArrowLeft size={20} className="text-gray-600" />
            </button>
            <h1 className="text-lg font-bold text-gray-800">Request Details</h1>
          </div>

          <div className="flex items-center gap-3">
            <button className="p-2 rounded-lg hover:bg-gray-50 transition-colors">
              <Bell size={20} className="text-gray-800" />
            </button>
            <div className="w-8 h-8 rounded-full overflow-hidden border border-gray-200">
              <img
                src="https://api.dicebear.com/7.x/pixel-art/svg?seed=user123"
                alt="User Profile"
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-2xl mx-auto px-4 pt-4 space-y-4">
        {/* Basic Header Info */}
        <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-xs space-y-4">
          <div className="flex justify-between items-start">
            <div>
              <span className="text-xs font-bold text-[#3B7CED] uppercase">{request.reference_id}</span>
              <h2 className="text-lg font-bold text-gray-900 mt-1">{request.title}</h2>
            </div>
            <Badge variant={getStatusBadgeVariant(request.status)} className="px-3 py-1 text-xs">
              {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
            </Badge>
          </div>

          <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-100 text-xs">
            <div>
              <span className="block text-gray-400 font-semibold mb-0.5">Date Requested</span>
              <span className="font-bold text-gray-800 flex items-center gap-1">
                <Calendar size={14} className="text-gray-500" /> {request.date}
              </span>
            </div>
            <div>
              <span className="block text-gray-400 font-semibold mb-0.5">Requested By</span>
              <span className="font-bold text-gray-800">{request.requester}</span>
            </div>
          </div>
        </div>

        {/* Project & Purchase Details */}
        <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-xs space-y-4">
          <h3 className="text-sm font-bold text-[#3B7CED] uppercase tracking-wider flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-[#3B7CED]" />
            Purchase Details
          </h3>

          <div className="space-y-3 text-xs">
            <div className="flex justify-between py-1.5 border-b border-gray-50">
              <span className="text-gray-500 font-semibold">Project</span>
              <span className="font-bold text-gray-900">{request.project}</span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-gray-50">
              <span className="text-gray-500 font-semibold">Site Location</span>
              <span className="font-bold text-gray-900">{request.location}</span>
            </div>
            <div className="flex justify-between py-1.5">
              <span className="text-gray-500 font-semibold">Required By Date</span>
              <span className="font-bold text-gray-900">{request.requiredDate}</span>
            </div>
          </div>
        </div>

        {/* WBS Details */}
        <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-xs space-y-4">
          <h3 className="text-sm font-bold text-[#3B7CED] uppercase tracking-wider flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-[#3B7CED]" />
            WBS Breakdown
          </h3>

          <div className="space-y-3 text-xs">
            <div className="flex justify-between py-1.5 border-b border-gray-50">
              <span className="text-gray-500 font-semibold">Phase</span>
              <span className="font-bold text-gray-900">{request.phase}</span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-gray-50">
              <span className="text-gray-500 font-semibold">Task</span>
              <span className="font-bold text-gray-900">{request.task}</span>
            </div>
            <div className="flex justify-between py-1.5">
              <span className="text-gray-500 font-semibold">Cost Code</span>
              <span className="font-bold text-gray-900">-</span>
            </div>
          </div>
        </div>

        {/* Cost Summary & Notes */}
        <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-xs space-y-4">
          <h3 className="text-sm font-bold text-[#3B7CED] uppercase tracking-wider flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-[#3B7CED]" />
            Request Cost Summary
          </h3>

          <div className="space-y-3 text-xs">
            <div className="flex justify-between py-1.5 border-b border-gray-50">
              <span className="text-gray-500 font-semibold">Total Quantity</span>
              <span className="font-bold text-gray-900">{request.quantity} Items</span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-gray-50">
              <span className="text-gray-500 font-semibold">Total Estimated Value</span>
              <span className="font-bold text-[#3B7CED]">
                ₦{request.amount.toLocaleString("en-NG", { minimumFractionDigits: 2 })}
              </span>
            </div>
          </div>

          {request.notes && (
            <div className="pt-3 border-t border-gray-100">
              <span className="block text-xs font-semibold text-gray-500 mb-1">Notes / Justification</span>
              <p className="text-xs text-gray-700 bg-gray-50 p-3 rounded-lg border border-gray-100 italic">
                "{request.notes}"
              </p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
