"use client";

export const dynamic = "force-dynamic";

import React, { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { ArrowLeft, Bell, Calendar, DollarSign, FileText, CheckCircle, Clock, XCircle, Trash2, Edit3, Check, X, AlertCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  useGetProjectPurchaseRequestQuery,
  useDeleteProjectPurchaseRequestMutation,
  usePatchProjectPurchaseRequestMutation,
} from "@/api/requests/projectPurchaseRequestApi";

interface PurchaseRequestLineItemUi {
  id?: string | number;
  productName: string;
  description: string;
  quantity: number;
  unitCost: number;
  lineTotal: number;
}

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
  lines?: PurchaseRequestLineItemUi[];
}

const mapApiRequestToUi = (req: any): PurchaseRequestItem => {
  let parsedProject = req.project_details?.name || (typeof req.project_request === "object" ? req.project_request?.project_details?.name : null) || (typeof req.project === "number" ? `Project #${req.project}` : req.project) || "Project";
  let parsedPhase = req.phase || "Phase";
  let parsedTask = req.activity ? `Activity ${req.activity}` : (req.task || "Task");
  const rawNotes = req.notes || req.purpose || "";
  let parsedNotes = rawNotes;

  if (rawNotes && typeof rawNotes === "string" && rawNotes.includes(" | ")) {
    const parts = rawNotes.split(" | ");
    parts.forEach((part: string) => {
      if (part.startsWith("Project: ")) parsedProject = part.replace("Project: ", "");
      if (part.startsWith("Phase: ")) parsedPhase = part.replace("Phase: ", "");
      if (part.startsWith("Task: ")) parsedTask = part.replace("Task: ", "");
      if (part.startsWith("Activity: ")) parsedTask = part.replace("Activity: ", "");
      if (part.startsWith("Notes: ")) parsedNotes = part.replace("Notes: ", "");
    });
  }

  const rawLines = req.lines || req.items || [];
  const mappedLines: PurchaseRequestLineItemUi[] = rawLines.map((it: any, idx: number) => {
    const qty = Number(it.quantity || it.qty || 0);
    const cost = Number(it.estimated_unit_cost || it.estimated_unit_price || 0);
    const total = Number(it.line_total || (qty * cost) || 0);
    const name = it.product_details?.product_name || (typeof it.product === "number" ? `Product #${it.product}` : it.productName || "Product");
    return {
      id: it.id || idx,
      productName: name,
      description: it.description || it.product_details?.product_description || "",
      quantity: qty,
      unitCost: cost,
      lineTotal: total,
    };
  });

  const totalQty = mappedLines.reduce((sum, item) => sum + item.quantity, 0) || Number(req.quantity || 0);
  const totalAmount = Number(req.total_amount || req.pr_total_price || req.amount || mappedLines.reduce((sum, item) => sum + item.lineTotal, 0));

  let requesterName = "Requester";
  if (req.requester && typeof req.requester === "string" && isNaN(Number(req.requester))) {
    requesterName = req.requester;
  } else if (req.requester_details?.user) {
    requesterName = `${req.requester_details.user.first_name || ""} ${req.requester_details.user.last_name || ""}`.trim() || req.requester_details.user.username;
  } else if (typeof req.project_request === "object" && req.project_request?.created_by_details) {
    requesterName = `${req.project_request.created_by_details.first_name || ""} ${req.project_request.created_by_details.last_name || ""}`.trim() || req.project_request.created_by_details.username;
  }

  const dateValue = req.created_at || req.date_created || req.date || Date.now();
  const formattedDate = new Date(dateValue).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

  const refId = req.reference_id || (typeof req.project_request === "object" ? req.project_request?.reference_id : null) || String(req.id || "PR-REQ");
  const statusVal = req.status || (typeof req.project_request === "object" ? req.project_request?.status : null) || "pending";
  const locationVal = req.site_location || req.requesting_location_details?.location_name || req.requesting_location || req.location || "Lagos Site";
  const reqDateVal = req.required_by_date || req.requiredDate || (req.date_updated ? new Date(req.date_updated).toISOString().split("T")[0] : "");

  const titleVal = req.title || (parsedProject && parsedProject !== "Project" ? `Purchase Request - ${parsedProject}` : `Purchase Request #${req.id || refId}`);

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
    lines: mappedLines,
  };
};

export default function PurchaseRequestDetailPage() {
  const router = useRouter();
  const { id } = useParams();
  const [request, setRequest] = useState<PurchaseRequestItem | null>(null);
  const [isConfirmingDelete, setIsConfirmingDelete] = useState(false);

  const { data: apiData, isLoading: isApiLoading } = useGetProjectPurchaseRequestQuery(
    id as string,
    { skip: !id || String(id).startsWith("pr-") }
  );

  const [deleteRequest, { isLoading: isDeleting }] = useDeleteProjectPurchaseRequestMutation();
  const [patchRequest, { isLoading: isUpdating }] = usePatchProjectPurchaseRequestMutation();

  const handleDelete = async () => {
    try {
      const stored = localStorage.getItem("project_purchase_requests");
      if (stored) {
        try {
          const list = JSON.parse(stored);
          const updated = list.filter((r: any) => String(r.id) !== String(id));
          localStorage.setItem("project_purchase_requests", JSON.stringify(updated));
        } catch (e) {}
      }

      if (!String(id).startsWith("pr-")) {
        await deleteRequest(id as string).unwrap();
      }

      router.push("/project-request/purchase-request");
    } catch (error) {
      alert("Failed to delete purchase request. Please try again.");
    }
  };

  const handleStatusChange = async (newStatus: "approved" | "rejected") => {
    try {
      if (request) {
        setRequest((prev) => (prev ? { ...prev, status: newStatus } : null));
      }

      const stored = localStorage.getItem("project_purchase_requests");
      if (stored) {
        try {
          const list = JSON.parse(stored);
          const idx = list.findIndex((r: any) => String(r.id) === String(id));
          if (idx > -1) {
            list[idx].status = newStatus;
            localStorage.setItem("project_purchase_requests", JSON.stringify(list));
          }
        } catch (e) {}
      }

      if (!String(id).startsWith("pr-")) {
        await patchRequest({ id: id as string, data: { status: newStatus } }).unwrap();
      }
    } catch (error) {
      alert("Failed to update status on server.");
    }
  };

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
      <div className="min-h-screen bg-[#F9FAFB] pb-28">
        <header className="w-full border-b border-gray-100 bg-white sticky top-0 z-30">
          <div className="max-w-2xl mx-auto px-4 h-16 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gray-200 rounded-lg animate-pulse"></div>
              <div className="h-6 bg-gray-200 rounded w-36 animate-pulse"></div>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-20 h-8 bg-gray-200 rounded-lg animate-pulse"></div>
            </div>
          </div>
        </header>
        <main className="max-w-2xl mx-auto px-4 pt-4 space-y-4">
          <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-xs space-y-4">
            <div className="flex justify-between items-center">
              <div className="h-6 bg-gray-200 rounded w-48 animate-pulse"></div>
              <div className="h-6 bg-gray-200 rounded-full w-20 animate-pulse"></div>
            </div>
            <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-100">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="space-y-1">
                  <div className="h-3 bg-gray-200 rounded w-20 animate-pulse"></div>
                  <div className="h-5 bg-gray-200 rounded w-32 animate-pulse"></div>
                </div>
              ))}
            </div>
          </div>
          <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-xs space-y-4">
            <div className="h-5 bg-gray-200 rounded w-32 animate-pulse"></div>
            <div className="space-y-3 pt-2">
              {[1, 2].map((i) => (
                <div key={i} className="p-4 border border-gray-100 rounded-lg space-y-2 animate-pulse">
                  <div className="h-4 bg-gray-200 rounded w-40"></div>
                  <div className="h-4 bg-gray-200 rounded w-64"></div>
                  <div className="h-4 bg-gray-200 rounded w-24"></div>
                </div>
              ))}
            </div>
          </div>
        </main>
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
            <div className="flex justify-between py-1.5">
              <span className="text-gray-500 font-semibold">Activity</span>
              <span className="font-bold text-gray-900">{request.task}</span>
            </div>
          </div>
        </div>

        {/* Product Line Items */}
        {request.lines && request.lines.length > 0 && (
          <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-[#3B7CED] uppercase tracking-wider flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-[#3B7CED]" />
              Product Line Items
            </h3>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-gray-100 text-gray-400">
                    <th className="pb-2 font-semibold">Product</th>
                    <th className="pb-2 font-semibold text-center">Qty</th>
                    <th className="pb-2 font-semibold text-right">Est. Unit Cost</th>
                    <th className="pb-2 font-semibold text-right">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {request.lines.map((line, idx) => (
                    <tr key={line.id || idx} className="py-2">
                      <td className="py-2.5 pr-2">
                        <div className="font-bold text-gray-800">{line.productName}</div>
                        {line.description && (
                          <div className="text-[11px] text-gray-400 mt-0.5">{line.description}</div>
                        )}
                      </td>
                      <td className="py-2.5 px-2 text-center font-semibold text-gray-700">{line.quantity}</td>
                      <td className="py-2.5 px-2 text-right font-semibold text-gray-700">
                        ₦{line.unitCost.toLocaleString("en-NG", { minimumFractionDigits: 2 })}
                      </td>
                      <td className="py-2.5 pl-2 text-right font-bold text-gray-900">
                        ₦{line.lineTotal.toLocaleString("en-NG", { minimumFractionDigits: 2 })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

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

      {/* Action Bottom Bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 p-4 z-20">
        <div className="max-w-2xl mx-auto flex items-center justify-between gap-3">
          {isConfirmingDelete ? (
            <div className="w-full flex items-center justify-between gap-2 bg-red-50 p-2 rounded-lg border border-red-100">
              <span className="text-xs font-semibold text-red-700 flex items-center gap-1.5 pl-1">
                <AlertCircle size={16} className="text-red-600" /> Confirm delete?
              </span>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setIsConfirmingDelete(false)}
                  className="h-8 text-xs bg-white border-gray-200 text-gray-700"
                >
                  Cancel
                </Button>
                <Button
                  size="sm"
                  onClick={handleDelete}
                  disabled={isDeleting}
                  className="h-8 text-xs bg-red-600 hover:bg-red-700 text-white"
                >
                  {isDeleting ? "Deleting..." : "Delete"}
                </Button>
              </div>
            </div>
          ) : (
            <>
              <Button
                variant="outline"
                onClick={() => setIsConfirmingDelete(true)}
                className="h-11 px-4 text-xs font-bold border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700 gap-1.5"
              >
                <Trash2 size={16} /> Delete
              </Button>

              <div className="flex items-center gap-2 flex-1 justify-end">
                {request.status !== "rejected" && (
                  <Button
                    variant="outline"
                    disabled={isUpdating}
                    onClick={() => handleStatusChange("rejected")}
                    className="h-11 px-4 text-xs font-bold border-gray-200 text-gray-700 hover:bg-gray-50 gap-1.5"
                  >
                    <X size={16} className="text-red-500" /> Reject
                  </Button>
                )}
                {request.status !== "approved" && (
                  <Button
                    disabled={isUpdating}
                    onClick={() => handleStatusChange("approved")}
                    className="h-11 px-5 text-xs font-bold bg-[#2BA24D] hover:bg-[#238a41] text-white gap-1.5"
                  >
                    <Check size={16} /> Approve
                  </Button>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
