"use client";

export const dynamic = "force-dynamic";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Bell, FileText, CheckCircle, Clock, XCircle, Plus } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useGetProjectPurchaseRequestsQuery } from "@/api/requests/projectPurchaseRequestApi";

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

export default function PurchaseRequestsDashboard() {
  const router = useRouter();
  const [requests, setRequests] = useState<PurchaseRequestItem[]>([]);
  const [activeFilter, setActiveFilter] = useState<"all" | "draft" | "approved" | "pending" | "rejected">("all");

  const { data: apiRequests, isLoading: isApiLoading } = useGetProjectPurchaseRequestsQuery({});

  useEffect(() => {
    const stored = localStorage.getItem("project_purchase_requests");
    let localList: PurchaseRequestItem[] = [];
    if (stored) {
      try {
        localList = JSON.parse(stored).filter(
          (item: any) =>
            item.id !== "pr-1" && item.id !== "pr-2" && item.id !== "pr-3",
        );
      } catch (e) {
        localList = [];
      }
    }

    let apiList: PurchaseRequestItem[] = [];
    if (apiRequests && Array.isArray(apiRequests)) {
      apiList = apiRequests.map(mapApiRequestToUi);
    }

    const combined = [...localList];
    apiList.forEach((apiReq) => {
      const existingIdx = combined.findIndex((item) => item.id === apiReq.id);
      if (existingIdx > -1) {
        combined[existingIdx] = apiReq;
      } else {
        combined.unshift(apiReq);
      }
    });

    setRequests(combined);
  }, [apiRequests]);

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

  const getStatusCounts = () => {
    const counts = {
      draft: 0,
      approved: 0,
      pending: 0,
      rejected: 0
    };

    requests.forEach(req => {
      if (counts[req.status] !== undefined) {
        counts[req.status]++;
      }
    });

    return counts;
  };

  const statusCounts = getStatusCounts();

  const filteredRequests = requests.filter(
    (req) => activeFilter === "all" || req.status === activeFilter
  );

  return (
    <div className="min-h-screen bg-[#F9FAFB] pb-28">
      {/* Header Bar */}
      <header className="w-full border-b border-gray-100 bg-white sticky top-0 z-30">
        <div className="max-w-2xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.push("/project-request/make-request")}
              className="p-1 rounded-lg hover:bg-gray-50 transition-colors"
              aria-label="Back"
            >
              <ArrowLeft size={20} className="text-gray-600" />
            </button>
            <h1 className="text-lg font-bold text-gray-800">Purchase Request</h1>
          </div>

          <div className="flex items-center gap-3">
            <button
              className="p-2 rounded-lg hover:bg-gray-50 transition-colors relative"
              aria-label="Notifications"
            >
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

      {/* Main Content */}
      <main className="max-w-2xl mx-auto px-4 pt-4 space-y-4">
        {/* Status Summary Grid */}
        <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-xs">
          <div className="grid grid-cols-2 gap-3">
            {/* Draft */}
            <div className="p-4 border border-[#D0E0FB] bg-[#F3F8FF] rounded-lg">
              <div className="flex items-center gap-1.5 mb-1.5">
                <FileText size={16} className="text-[#3B7CED]" />
                <span className="text-xs font-semibold text-[#3B7CED]">Draft</span>
              </div>
              <span className="text-3xl font-bold text-[#3B7CED]">{statusCounts.draft}</span>
            </div>

            {/* Approved */}
            <div className="p-4 border border-[#D7F4DF] bg-[#F2FDF5] rounded-lg">
              <div className="flex items-center gap-1.5 mb-1.5">
                <CheckCircle size={16} className="text-[#2BA24D]" />
                <span className="text-xs font-semibold text-[#2BA24D]">Approved</span>
              </div>
              <span className="text-3xl font-bold text-[#2BA24D]">{statusCounts.approved}</span>
            </div>

            {/* Pending */}
            <div className="p-4 border border-[#FFF2CC] bg-[#FFFDF5] rounded-lg">
              <div className="flex items-center gap-1.5 mb-1.5">
                <Clock size={16} className="text-[#F0B401]" />
                <span className="text-xs font-semibold text-[#F0B401]">Pending</span>
              </div>
              <span className="text-3xl font-bold text-[#F0B401]">{statusCounts.pending}</span>
            </div>

            {/* Rejected */}
            <div className="p-4 border border-[#F9D6D2] bg-[#FFF7F6] rounded-lg">
              <div className="flex items-center gap-1.5 mb-1.5">
                <XCircle size={16} className="text-[#E43D2B]" />
                <span className="text-xs font-semibold text-[#E43D2B]">Rejected</span>
              </div>
              <span className="text-3xl font-bold text-[#E43D2B]">{statusCounts.rejected}</span>
            </div>
          </div>
        </div>

        {/* Requests List Section */}
        <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-xs space-y-4">
          <h2 className="text-sm font-bold text-[#3B7CED] uppercase tracking-wider">
            Purchase Requests
          </h2>

          {/* Filter Pills */}
          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
            {(["all", "draft", "approved", "pending", "rejected"] as const).map((filter) => (
              <button
                key={filter}
                onClick={() => setActiveFilter(filter)}
                className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all whitespace-nowrap ${
                  activeFilter === filter
                    ? "bg-[#3B7CED] text-white"
                    : "bg-gray-100 text-gray-500 hover:bg-gray-200"
                }`}
              >
                {filter.charAt(0).toUpperCase() + filter.slice(1)}
              </button>
            ))}
          </div>

          {/* List items */}
          <div className="space-y-3">
            {filteredRequests.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-gray-400">
                <FileText size={40} className="stroke-[1.5] mb-2" />
                <p className="text-sm">No purchase requests found</p>
              </div>
            ) : (
              filteredRequests.map((req) => (
                <div
                  key={req.id}
                  onClick={() => router.push(`/project-request/purchase-request/${req.id}`)}
                  className="p-4 border border-gray-200 rounded-lg hover:border-[#3B7CED] hover:shadow-xs transition-all cursor-pointer group"
                >
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-xs font-bold text-[#3B7CED]">
                      {req.reference_id}
                    </span>
                    <Badge variant={getStatusBadgeVariant(req.status)}>
                      {req.status.charAt(0).toUpperCase() + req.status.slice(1)}
                    </Badge>
                  </div>

                  <h3 className="text-sm font-bold text-gray-900 mb-4 group-hover:text-[#3B7CED] transition-colors">
                    {req.title}
                  </h3>

                  <div className="grid grid-cols-3 text-xs gap-2 border-t border-gray-50 pt-3">
                    <div>
                      <span className="block text-gray-400 font-medium mb-0.5">Quantity</span>
                      <span className="font-bold text-gray-800">{req.quantity}</span>
                    </div>
                    <div className="text-center">
                      <span className="block text-gray-400 font-medium mb-0.5">Amount</span>
                      <span className="font-bold text-gray-800">
                        ₦{req.amount.toLocaleString("en-NG", { minimumFractionDigits: 2 })}
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="block text-gray-400 font-medium mb-0.5">Requester</span>
                      <span className="font-bold text-gray-800 truncate block">
                        {req.requester}
                      </span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </main>

      {/* Floating Action Button */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 p-4 z-20">
        <div className="max-w-2xl mx-auto">
          <Button
            onClick={() => router.push("/project-request/purchase-request/new")}
            className="w-full h-12 text-sm font-bold flex items-center justify-center gap-2 bg-[#3B7CED] hover:bg-[#2d63c7] text-white rounded-lg shadow-sm"
          >
            <Plus size={18} />
            New Purchase Request
          </Button>
        </div>
      </div>
    </div>
  );
}
