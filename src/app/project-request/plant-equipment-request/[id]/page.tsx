"use client";

import React, { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { ArrowLeft, Bell, Calendar, User } from "lucide-react";

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

import { useGetPlantEquipmentRequestQuery } from "@/api/requests/plantEquipmentRequestApi";

export default function PlantEquipmentRequestDetailPage() {
  const router = useRouter();
  const { id } = useParams();
  const [request, setRequest] = useState<PlantEquipmentRequestItem | null>(null);

  const numericId = Number(id);
  const { data: apiRequest, isLoading: apiLoading } = useGetPlantEquipmentRequestQuery(numericId, {
    skip: isNaN(numericId)
  });

  useEffect(() => {
    if (apiRequest) {
      setRequest({
        id: String(apiRequest.id),
        project: apiRequest.project_request === 2 ? "Project Beta - Office Complex" : "Project Alpha - Mall Construction",
        equipment: apiRequest.equipment_name,
        description: apiRequest.description || "",
        quantity: apiRequest.quantity,
        estimatedCost: parseFloat(apiRequest.estimated_cost) || 0,
        status: ((apiRequest as any).status || "pending") as "draft" | "approved" | "pending" | "rejected",
        requester: "Firstname Lastname",
        date: new Date(apiRequest.created_at || Date.now()).toLocaleDateString("en-GB", {
          day: "numeric",
          month: "short",
          year: "numeric"
        }),
        requiredDate: apiRequest.required_date,
        phase: "Foundation",
        task: "Concrete Pouring",
        notes: apiRequest.justification_notes || ""
      });
    } else {
      const stored = localStorage.getItem("plant_equipment_requests");
      if (stored) {
        try {
          const list: PlantEquipmentRequestItem[] = JSON.parse(stored);
          const item = list.find((r) => r.id === id);
          if (item) {
            setRequest(item);
          }
        } catch (e) {
          console.error("Failed to parse requests from local storage");
        }
      }
    }
  }, [apiRequest, id]);

  if (!request) {
    return (
      <div className="min-h-screen bg-[#F9FAFB] flex flex-col items-center justify-center p-4">
        <p className="text-gray-500 font-semibold mb-4">Request not found.</p>
        <button
          onClick={() => router.push("/project-request/plant-equipment-request")}
          className="px-4 py-2 bg-[#3B7CED] text-white rounded-lg text-xs font-bold shadow-none"
        >
          Back to Dashboard
        </button>
      </div>
    );
  }

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case "approved":
        return "bg-[#EAFDF0] text-[#2BA24D] border-none font-bold text-xs px-2.5 py-1 rounded-lg";
      case "pending":
        return "bg-[#FFFDF0] text-[#F0B401] border-none font-bold text-xs px-2.5 py-1 rounded-lg";
      case "draft":
        return "bg-[#EEF4FF] text-[#3B7CED] border-none font-bold text-xs px-2.5 py-1 rounded-lg";
      case "rejected":
        return "bg-[#FFF2F0] text-[#E43D2B] border-none font-bold text-xs px-2.5 py-1 rounded-lg";
      default:
        return "bg-[#FFFDF0] text-[#F0B401] border-none font-bold text-xs px-2.5 py-1 rounded-lg";
    }
  };

  const totalCost = request.quantity * request.estimatedCost;

  return (
    <div className="min-h-screen bg-[#F9FAFB] pb-24">
      {/* Header Bar */}
      <header className="w-full border-b border-gray-100 bg-white sticky top-0 z-30 shadow-none">
        <div className="max-w-2xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.push("/project-request/plant-equipment-request")}
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
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-none space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <span className="text-xs font-bold text-[#3B7CED] uppercase">{request.id}</span>
              <h2 className="text-lg font-bold text-gray-900 mt-1">{request.equipment}</h2>
            </div>
            <span className={getStatusBadgeClass(request.status)}>
              {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
            </span>
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
              <span className="font-bold text-gray-800 flex items-center gap-1">
                <User size={14} className="text-gray-500" /> {request.requester}
              </span>
            </div>
          </div>
        </div>

        {/* Plant & Equipment Details */}
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-none space-y-4">
          <h3 className="text-sm font-bold text-[#3B7CED] uppercase tracking-wider flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-[#3B7CED]" />
            Plant & Equipment Details
          </h3>

          <div className="space-y-3 text-xs">
            <div className="flex justify-between py-1.5 border-b border-gray-50">
              <span className="text-gray-500 font-semibold">Project</span>
              <span className="font-bold text-gray-900">{request.project}</span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-gray-50">
              <span className="text-gray-500 font-semibold">Equipment Name</span>
              <span className="font-bold text-gray-900">{request.equipment}</span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-gray-50">
              <span className="text-gray-500 font-semibold">Description</span>
              <span className="font-bold text-gray-900">{request.description || "N/A"}</span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-gray-50">
              <span className="text-gray-500 font-semibold">Quantity</span>
              <span className="font-bold text-gray-900">{request.quantity}</span>
            </div>
            <div className="flex justify-between py-1.5">
              <span className="text-gray-500 font-semibold">Required Date</span>
              <span className="font-bold text-gray-900">
                {request.requiredDate ? new Date(request.requiredDate).toLocaleDateString("en-GB", {
                  day: "numeric",
                  month: "short",
                  year: "numeric"
                }) : "N/A"}
              </span>
            </div>
          </div>
        </div>

        {/* WBS Details */}
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-none space-y-4">
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
              <span className="font-bold text-gray-900">{request.project === "Project Alpha" ? "CC-04" : "-"}</span>
            </div>
          </div>
        </div>

        {/* Cost Summary & Notes */}
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-none space-y-4">
          <h3 className="text-sm font-bold text-[#3B7CED] uppercase tracking-wider flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-[#3B7CED]" />
            Cost & Justification
          </h3>

          <div className="space-y-3 text-xs">
            <div className="flex justify-between py-1.5 border-b border-gray-50">
              <span className="text-gray-500 font-semibold">Estimated Unit Cost</span>
              <span className="font-bold text-gray-950">
                N{request.estimatedCost.toLocaleString("en-US", {
                  minimumFractionDigits: 2
                })}
              </span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-gray-50">
              <span className="text-gray-500 font-semibold">Total Cost</span>
              <span className="font-extrabold text-[#3B7CED]">
                N{totalCost.toLocaleString("en-US", {
                  minimumFractionDigits: 2
                })}
              </span>
            </div>
            {request.notes && (
              <div className="pt-3">
                <span className="block text-gray-400 font-semibold mb-1">Notes / Justification</span>
                <p className="text-gray-700 bg-gray-50 p-3 rounded-lg border border-gray-200 leading-relaxed italic">
                  {request.notes}
                </p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
