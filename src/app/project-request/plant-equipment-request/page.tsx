"use client";

import React, { useEffect, useState } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { ArrowLeft, Bell, FileText, CheckCircle, Clock, XCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { useSelector } from "react-redux";
import { RootState } from "@/lib/store/store";
import { useGetPlantEquipmentRequestsQuery } from "@/api/requests/plantEquipmentRequestApi";

interface PlantEquipmentRequestItem {
  id: string;
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
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const activeStatusQuery = searchParams.get("status") as "draft" | "approved" | "pending" | "rejected" | null;
  const loggedInUser = useSelector((state: RootState) => state.auth.user);
  const [requests, setRequests] = useState<PlantEquipmentRequestItem[]>([]);
  const [filter, setFilter] = useState<"All" | "Draft" | "Approved" | "Pending" | "Rejected">("All");

  const { data: apiRequests, isLoading: apiLoading } = useGetPlantEquipmentRequestsQuery();

  useEffect(() => {
    if (apiRequests && apiRequests.length > 0) {
      const mapped = apiRequests.map((req) => ({
        id: String(req.id),
        project: req.project_request === 2 ? "Project Beta - Office Complex" : "Project Alpha - Mall Construction",
        equipment: req.equipment_name,
        description: req.description || "",
        quantity: req.quantity,
        estimatedCost: parseFloat(req.estimated_cost) || 0,
        status: ((req as any).status || "pending") as "draft" | "approved" | "pending" | "rejected",
        requester: "Firstname Lastname",
        date: new Date(req.created_at || Date.now()).toLocaleDateString("en-GB", {
          day: "numeric",
          month: "short",
          year: "numeric"
        }),
        requiredDate: req.required_date,
        phase: "Foundation",
        task: "Concrete Pouring",
        notes: req.justification_notes || ""
      }));
      setRequests(mapped);
    } else {
      const stored = localStorage.getItem("plant_equipment_requests");
      if (stored) {
        try {
          setRequests(JSON.parse(stored));
        } catch (e) {
          setRequests([]);
        }
      } else {
        setRequests([]);
      }
    }
  }, [apiRequests]);

  const counts = {
    draft: requests.filter((r) => r.status === "draft").length,
    approved: requests.filter((r) => r.status === "approved").length,
    pending: requests.filter((r) => r.status === "pending").length,
    rejected: requests.filter((r) => r.status === "rejected").length,
  };

  const filteredRequests = requests.filter((r) => {
    const matchesFilter = filter === "All" || r.status.toLowerCase() === filter.toLowerCase();
    const matchesStatusQuery = !activeStatusQuery || r.status === activeStatusQuery;
    return matchesFilter && matchesStatusQuery;
  });

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case "approved":
        return "bg-[#EAFDF0] text-[#2BA24D] border-none font-bold text-xs px-2.5 py-0.5 rounded-lg";
      case "pending":
        return "bg-[#FFFDF0] text-[#F0B401] border-none font-bold text-xs px-2.5 py-0.5 rounded-lg";
      case "draft":
        return "bg-[#EEF4FF] text-[#3B7CED] border-none font-bold text-xs px-2.5 py-0.5 rounded-lg";
      case "rejected":
        return "bg-[#FFF2F0] text-[#E43D2B] border-none font-bold text-xs px-2.5 py-0.5 rounded-lg";
      default:
        return "bg-[#FFFDF0] text-[#F0B401] border-none font-bold text-xs px-2.5 py-0.5 rounded-lg";
    }
  };

  return (
    <div className="min-h-screen bg-[#F9FAFB] pb-28">
      {/* Header */}
      <header className="w-full border-b border-gray-100 bg-white sticky top-0 z-30 shadow-none">
        <div className="max-w-2xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                if (activeStatusQuery) {
                  router.push(pathname);
                } else {
                  router.push("/project-request/make-request");
                }
              }}
              className="p-1 rounded-lg hover:bg-gray-50 transition-colors"
              aria-label="Back"
            >
              <ArrowLeft size={20} className="text-gray-600" />
            </button>
            <h1 className="text-lg font-bold text-gray-800">Plant & Equipment Re...</h1>
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

      {/* Main Content */}
      <main className="max-w-2xl mx-auto px-4 pt-4 space-y-6">
        {/* Status Title Header (shown when status query is active) */}
        {activeStatusQuery && (
          <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-xs flex items-center justify-between gap-4">
            <div className="flex items-center space-x-4">
              {(() => {
                const getStatusStyle = (st: string) => {
                  switch (st) {
                    case "approved":
                      return { color: "text-[#2BA24D]", bgColor: "bg-[#2BA24D]", label: "Approved" };
                    case "pending":
                      return { color: "text-[#F0B401]", bgColor: "bg-[#F0B401]", label: "Pending" };
                    case "draft":
                      return { color: "text-[#3B7CED]", bgColor: "bg-[#3B7CED]", label: "Draft" };
                    case "rejected":
                      return { color: "text-[#E43D2B]", bgColor: "bg-[#E43D2B]", label: "Rejected" };
                    default:
                      return { color: "text-[#F0B401]", bgColor: "bg-[#F0B401]", label: "Pending" };
                  }
                };
                const style = getStatusStyle(activeStatusQuery);
                return (
                  <div className="flex items-center gap-3">
                    <div className={`w-4 h-4 rounded-full ${style.bgColor}`}></div>
                    <h2 className="text-xl font-semibold">
                      {style.label} Plant & Equipment Requests
                    </h2>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${style.color} bg-gray-100`}>
                      {filteredRequests.length} {filteredRequests.length === 1 ? "request" : "requests"}
                    </span>
                  </div>
                );
              })()}
            </div>
          </div>
        )}

        {/* Status Counts Grid (hidden when status query is active) */}
        {!activeStatusQuery && (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {/* Draft */}
            <div
              onClick={() => router.push(`${pathname}?status=draft`)}
              className="p-4 border border-[#3B7CED]/20 bg-[#EEF4FF] rounded-xl flex flex-col justify-between h-24 cursor-pointer hover:shadow-xs transition-shadow"
            >
              <div className="flex items-center gap-1.5 text-xs font-semibold text-[#3B7CED]">
                <FileText size={14} />
                <span>Draft</span>
              </div>
              <span className="text-3xl font-extrabold text-[#3B7CED]">{counts.draft}</span>
            </div>

            {/* Approved */}
            <div
              onClick={() => router.push(`${pathname}?status=approved`)}
              className="p-4 border border-[#2BA24D]/20 bg-[#EAFDF0] rounded-xl flex flex-col justify-between h-24 cursor-pointer hover:shadow-xs transition-shadow"
            >
              <div className="flex items-center gap-1.5 text-xs font-semibold text-[#2BA24D]">
                <CheckCircle size={14} />
                <span>Approved</span>
              </div>
              <span className="text-3xl font-extrabold text-[#2BA24D]">{counts.approved}</span>
            </div>

            {/* Pending */}
            <div
              onClick={() => router.push(`${pathname}?status=pending`)}
              className="p-4 border border-[#F0B401]/20 bg-[#FFFDF0] rounded-xl flex flex-col justify-between h-24 cursor-pointer hover:shadow-xs transition-shadow"
            >
              <div className="flex items-center gap-1.5 text-xs font-semibold text-[#F0B401]">
                <Clock size={14} />
                <span>Pending</span>
              </div>
              <span className="text-3xl font-extrabold text-[#F0B401]">{counts.pending}</span>
            </div>

            {/* Rejected */}
            <div
              onClick={() => router.push(`${pathname}?status=rejected`)}
              className="p-4 border border-[#E43D2B]/20 bg-[#FFF2F0] rounded-xl flex flex-col justify-between h-24 cursor-pointer hover:shadow-xs transition-shadow"
            >
              <div className="flex items-center gap-1.5 text-xs font-semibold text-[#E43D2B]">
                <XCircle size={14} />
                <span>Rejected</span>
              </div>
              <span className="text-3xl font-extrabold text-[#E43D2B]">{counts.rejected}</span>
            </div>
          </div>
        )}

        {/* Section Heading (hidden when status query is active) */}
        {!activeStatusQuery && (
          <div className="space-y-3">
            <h2 className="text-sm font-semibold text-[#3B7CED]">
              Plant & Equipment Request
            </h2>

            {/* Filter Pills */}
            <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
              {(["All", "Draft", "Approved", "Pending", "Rejected"] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setFilter(tab)}
                  className={`px-4 py-2 rounded-full text-xs font-bold transition-all duration-200 whitespace-nowrap ${
                    filter === tab
                      ? "bg-[#3B7CED] text-white shadow-none"
                      : "bg-gray-100 text-gray-500 hover:bg-gray-200"
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Request List */}
        <div className="space-y-3">
          {filteredRequests.length === 0 ? (
            <Card className="p-8 text-center text-gray-500 bg-white">
              No plant & equipment requests found in this section.
            </Card>
          ) : (
            filteredRequests.map((req) => (
              <Card
                key={req.id}
                onClick={() => router.push(`/project-request/plant-equipment-request/${req.id}`)}
                className="p-5 bg-white border border-gray-200 rounded-xl hover:shadow-xs transition-shadow duration-200 cursor-pointer space-y-4"
              >
                <div className="flex justify-between items-center">
                  <span className="text-sm font-bold text-[#3B7CED]">{req.id}</span>
                  <span className={getStatusBadgeClass(req.status)}>
                    {req.status.charAt(0).toUpperCase() + req.status.slice(1)}
                  </span>
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
                      N{req.estimatedCost.toLocaleString("en-US")}
                    </span>
                  </div>
                </div>
              </Card>
            ))
          )}
        </div>
      </main>

      {/* Sticky Bottom Action Button */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 p-4 z-20 shadow-none">
        <div className="max-w-2xl mx-auto">
          <button
            onClick={() => router.push("/project-request/plant-equipment-request/new")}
            className="w-full h-12 text-sm font-bold flex items-center justify-center gap-2 bg-[#3B7CED] hover:bg-[#2d63c7] text-white rounded-lg shadow-none transition-all"
          >
            <span>+</span> New Plant & Equipment Request
          </button>
        </div>
      </div>
    </div>
  );
}
