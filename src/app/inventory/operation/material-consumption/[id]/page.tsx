"use client";

import React, { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, CheckCircle2, XCircle, AlertCircle, Trash2, Edit, Send, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { StatusModal, useStatusModal } from "@/components/shared/StatusModal";
import { Textarea } from "@/components/ui/textarea";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { PageGuard } from "@/components/auth/PageGuard";

import { 
  useGetMaterialConsumptionQuery, 
  useUpdateMaterialConsumptionMutation,
  useDeleteMaterialConsumptionMutation,
  useSubmitMaterialConsumptionRequestMutation
} from "@/api/requests/materialConsumptionRequestApi";
import { Skeleton } from "@/components/ui/skeleton";

export default function MaterialConsumptionDetailPage() {
  const params = useParams();
  const router = useRouter();
  const reqId = (params?.id as string) || "";
  const [isConfirmDeleteOpen, setIsConfirmDeleteOpen] = useState(false);
  
  const { data: apiData, isLoading, isError } = useGetMaterialConsumptionQuery(Number(reqId), {
    skip: !reqId || isNaN(Number(reqId)),
  });

  const [updateStatus] = useUpdateMaterialConsumptionMutation();
  const [deleteRequest, { isLoading: isDeleting }] = useDeleteMaterialConsumptionMutation();
  const [submitRequest, { isLoading: isSubmitting }] = useSubmitMaterialConsumptionRequestMutation();

  const req: any = React.useMemo(() => {
    if (!apiData) return null;
    
    // Map missing backend fields gracefully to avoid runtime crashes
    return {
      id: apiData.request_id || `MCR-${apiData.id}`,
      project: (apiData as any).project_details?.name || `Project #${apiData.project_request || 'Unknown'}`,
      wbsPhase: (apiData as any).phase_details?.name || "Unknown Phase",
      wbsActivity: (apiData as any).activity_details?.name || "Unknown Activity",
      equipmentId: (apiData as any).equipment_details?.name || "-",
      requester: (apiData as any).requester_details?.name || "-",
      gateReceiver: (apiData as any).gate_receiver_details?.name || "-",
      requisitionDate: apiData.date_consumed || new Date(apiData.created_at || Date.now()).toISOString().split('T')[0],
      issueDate: (apiData as any).issue_date || "-",
      totalCost: apiData.lines?.reduce((sum: number, line: any) => sum + (parseFloat(line.total_cost) || 0), 0) || 0,
      itemsList: apiData.lines?.map((line: any) => ({
        id: line.id || Math.random().toString(),
        name: line.product_details?.product_name || `Product ID: ${line.product || 'Unknown'}`,
        description: line.product_details?.description || "-",
        unit: line.unit_of_measure_details?.unit_symbol || "Units",
        requestedQty: line.quantity || 0,
        availableStock: line.product_details?.available_stock || 0,
        unitCost: parseFloat(line.unit_cost) || 0,
      })) || [],
      status: apiData.status || "pending",
      notes: apiData.notes || "",
      isOverrun: apiData.status === "held_overrun",
      availableBudget: (apiData as any).available_budget ? parseFloat((apiData as any).available_budget) : undefined,
      costCode: (apiData as any).cost_code || "-",
      parentRequestId: (apiData as any).project_request?.id || (apiData as any).project_request,
    };
  }, [apiData]);

  const [reason, setReason] = useState<string>("");

  const statusModal = useStatusModal();

  const handleAction = async (action: "release") => {
    if (!req) return;

    try {
      // Assuming a release status for now until the backend implements the release endpoint
      await updateStatus({
        id: Number(reqId),
        body: { status: "released" }
      }).unwrap();

      statusModal.showSuccess(
        "Material Released",
        `Material Consumption ${req.id} released successfully.`
      );
      router.refresh();
    } catch (err: any) {
      statusModal.showError(
        "Action Failed",
        err.data?.message || err.error || "An error occurred while releasing the material."
      );
    }
  };

  const handleDelete = async () => {
    try {
      await deleteRequest(Number(reqId)).unwrap();
      setIsConfirmDeleteOpen(false);
      statusModal.showSuccess("Deleted", "Material Consumption request deleted successfully.");
      router.push("/inventory/operation/material-consumption");
    } catch (err: any) {
      statusModal.showError("Delete Failed", err.data?.message || err.error || "Failed to delete the request.");
    }
  };

  const handleSubmit = async () => {
    try {
      if (!req.parentRequestId) throw new Error("Could not find parent project request ID");
      await submitRequest({ id: req.parentRequestId }).unwrap();
      statusModal.showSuccess("Submitted", "Material Consumption request submitted successfully.");
      router.refresh();
    } catch (err: any) {
      statusModal.showError("Submit Failed", err.data?.message || err.error || "Failed to submit the request.");
    }
  };

  return (
    <PageGuard application="inventory" module="materialconsumption">
      <div className="flex flex-col flex-1 min-h-[calc(100vh-64px)] bg-white relative pb-20">
        {isLoading ? (
          <div className="p-8 space-y-4">
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-64 w-full" />
          </div>
        ) : isError || !req ? (
          <div className="p-12 text-center text-red-500 font-medium">Failed to load material consumption details.</div>
        ) : (
          <>
        {/* FastraSuite Standard Clean Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-white">
          <div className="flex items-center">
            <Link href="/inventory/operation/material-consumption">
              <Button variant="ghost" size="icon" className="mr-2">
                <ArrowLeft className="h-5 w-5 text-gray-500" />
              </Button>
            </Link>
            <div>
              <h1 className="text-lg font-medium text-gray-800">
                Site Requisition Note: {req.id}
              </h1>
              <div className="flex items-center gap-2 mt-1">
                <span
                  className={`inline-block px-2 py-0.5 text-[11px] rounded font-medium uppercase ${
                    req.status === "approved"
                      ? "bg-green-100 text-green-700"
                      : req.status === "rejected"
                      ? "bg-red-100 text-red-700"
                      : req.status === "clarification_requested"
                      ? "bg-amber-100 text-amber-800"
                      : "bg-amber-100 text-amber-800"
                  }`}
                >
                  {String(req.status).replace("_", " ")}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {req.status === "pending" && (
              <>
                <Button
                  className="bg-[#3B7CED] hover:bg-[#2d63c7] text-white text-xs h-9 shadow-sm"
                  onClick={() => handleAction("release")}
                >
                  <CheckCircle2 className="w-3.5 h-3.5 mr-1.5" /> Release Material
                </Button>
              </>
            )}
          </div>
        </div>

        {/* Details Content matching rest of FastraSuite */}
        <div className="p-6 max-w-[1400px] mx-auto w-full flex flex-col gap-10">


          {/* Requisition Summary Section */}
          <section>
            <h2 className="text-[#3B7CED] text-xl mb-6 font-medium">Requisition Summary</h2>
            
            {/* Budget Gate Verification Banner */}
            {req.availableBudget !== undefined && (
              <div className={`mb-6 p-4 rounded border flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${req.isOverrun ? "bg-red-50 border-red-300" : "bg-green-50/60 border-green-200"}`}>
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-full ${req.isOverrun ? "bg-red-100 text-red-600" : "bg-green-100 text-green-600"}`}>
                    {req.isOverrun ? <AlertCircle className="w-5 h-5" /> : <CheckCircle2 className="w-5 h-5" />}
                  </div>
                  <div>
                    <h4 className={`text-sm font-semibold ${req.isOverrun ? "text-red-900" : "text-green-900"}`}>
                      Budget Validation Gate: {req.isOverrun ? "HELD IN OVERRUN QUEUE" : "PASSED (WITHIN BUDGET)"}
                    </h4>
                    <p className="text-xs text-gray-600 mt-0.5">
                      Cost Code: <strong className="font-mono">{req.costCode || "CC-1020"}</strong> | Available WBS Budget: <strong className="font-mono">₦{req.availableBudget.toLocaleString()}</strong>
                    </p>
                  </div>
                </div>
                {req.isOverrun && (
                  <div className="bg-white px-3 py-1.5 rounded border border-red-200 text-xs text-red-700 font-bold self-start sm:self-auto">
                    Overrun Variance: +₦{(req.totalCost - req.availableBudget).toLocaleString()}
                  </div>
                )}
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 bg-gray-50 p-6 rounded border border-gray-200">
              <div>
                <span className="text-xs text-gray-400 block mb-1">Requisition ID</span>
                <span className="text-sm font-semibold text-gray-800">{req.id}</span>
              </div>
              <div>
                <span className="text-xs text-gray-400 block mb-1">Target Project</span>
                <span className="text-sm font-semibold text-[#3B7CED]">{req.project}</span>
              </div>
              <div>
                <span className="text-xs text-gray-400 block mb-1">WBS Phase & Activity</span>
                <span className="text-sm font-semibold text-gray-800">{req.wbsPhase} → {req.wbsActivity}</span>
              </div>
              <div>
                <span className="text-xs text-gray-400 block mb-1">Total Valuation</span>
                <span className="text-sm font-bold text-gray-900">₦{req.totalCost.toLocaleString()}</span>
              </div>

              <div className="border-t border-gray-200 pt-4 mt-2">
                <span className="text-xs text-gray-400 block mb-1">Requested By</span>
                <span className="text-sm font-medium text-gray-800">{req.requester}</span>
              </div>
              <div className="border-t border-gray-200 pt-4 mt-2">
                <span className="text-xs text-gray-400 block mb-1">Gate Receiver / Signatory</span>
                <span className="text-sm font-medium text-gray-800">{req.gateReceiver}</span>
              </div>
              <div className="border-t border-gray-200 pt-4 mt-2">
                <span className="text-xs text-gray-400 block mb-1">Target Asset / Equipment</span>
                <span className="text-sm font-medium text-amber-800">{req.equipmentId}</span>
              </div>
              <div className="border-t border-gray-200 pt-4 mt-2">
                <span className="text-xs text-gray-400 block mb-1">Requisition vs Issue Date</span>
                <span className="text-sm font-medium text-gray-800">{req.requisitionDate} → {req.issueDate}</span>
              </div>

              {req.notes && (
                <div className="md:col-span-4 border-t border-gray-200 pt-4 mt-2">
                  <span className="text-xs text-gray-400 block mb-1">Field Engineer Notes</span>
                  <span className="text-sm text-gray-700">{req.notes}</span>
                </div>
              )}
            </div>
          </section>

          {/* Line Items & Warehouse Stock Verification Table */}
          <section>
            <h2 className="text-[#3B7CED] text-xl mb-6 font-medium">Requested Material Lines & Warehouse Stock Verification</h2>
            <div className="bg-white rounded border border-gray-200 shadow-sm overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="bg-[#F8F9FA] border-b-gray-100">
                    <TableHead className="pl-4">Product Name</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead className="text-center">Unit</TableHead>
                    <TableHead className="text-center">Requested QTY</TableHead>
                    <TableHead className="text-center">Warehouse Stock</TableHead>
                    <TableHead className="text-right">Unit Cost (₦)</TableHead>
                    <TableHead className="text-right">Total Line Cost (₦)</TableHead>
                    <TableHead className="pr-4 text-center">Audit Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {req.itemsList.map((item: any, idx: number) => {
                    const hasSufficient = item.availableStock >= item.requestedQty;
                    return (
                      <TableRow key={item.id || idx} className="border-b-gray-100 hover:bg-gray-50">
                        <TableCell className="pl-4 font-medium text-gray-800">{item.name}</TableCell>
                        <TableCell className="text-gray-600 text-xs">{item.description || item.name}</TableCell>
                        <TableCell className="text-center text-xs">{item.unit}</TableCell>
                        <TableCell className="text-center font-bold text-[#3B7CED]">{item.requestedQty}</TableCell>
                        <TableCell className="text-center font-bold text-gray-800">{item.availableStock}</TableCell>
                        <TableCell className="text-right text-xs text-gray-600">{item.unitCost.toLocaleString()}</TableCell>
                        <TableCell className="text-right font-bold text-gray-900">{(item.requestedQty * item.unitCost).toLocaleString()}</TableCell>
                        <TableCell className="pr-4 text-center">
                          {hasSufficient ? (
                            <span className="inline-block px-2 py-0.5 text-[11px] rounded font-medium bg-green-100 text-green-700">
                              Sufficient Stock
                            </span>
                          ) : (
                            <span className="inline-block px-2 py-0.5 text-[11px] rounded font-medium bg-red-100 text-red-700">
                              Shortage
                            </span>
                          )}
                        </TableCell>
                        <TableCell className="px-6 py-3 text-right">
                          <span className="font-mono text-sm text-[#525F7F]">
                            ₦{(item.requestedQty * item.unitCost).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                          </span>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
              
              {/* Totals Summary */}
              <div className="border-t border-gray-100 bg-gray-50/50 p-4 flex justify-end">
                <div className="w-full max-w-sm">
                  <div className="flex justify-between items-center py-2 border-b border-gray-100">
                    <span className="text-sm font-medium text-gray-500">Number of Items</span>
                    <span className="text-sm font-semibold text-gray-800">{req.itemsList.length}</span>
                  </div>
                  <div className="flex justify-between items-center py-3">
                    <span className="text-sm font-bold text-gray-700">Total Approved Cost</span>
                    <span className="text-lg font-bold text-[#32325D] font-mono">
                      ₦{req.totalCost.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </div>

        {/* Fixed Action Bar for Draft Status */}
        {req.status === "draft" && (
          <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 z-40 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
            <div className="max-w-2xl mx-auto flex gap-3">
              <Button
                variant="outline"
                className="flex-1 border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700 h-11"
                onClick={() => setIsConfirmDeleteOpen(true)}
                disabled={isDeleting || isSubmitting}
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Delete
              </Button>
              
              <Button
                variant="outline"
                className="flex-1 border-[#3B7CED] text-[#3B7CED] hover:bg-blue-50 h-11"
                onClick={() => router.push(`/inventory/operation/material-consumption/edit/${reqId}`)}
                disabled={isDeleting || isSubmitting}
              >
                <Edit className="w-4 h-4 mr-2" />
                Edit
              </Button>

              <Button
                className="flex-[2] bg-[#3B7CED] hover:bg-blue-600 text-white h-11"
                onClick={handleSubmit}
                disabled={isDeleting || isSubmitting}
              >
                {isSubmitting ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Send className="w-4 h-4 mr-2" />
                )}
                {isSubmitting ? "Submitting..." : "Submit for Approval"}
              </Button>
            </div>
          </div>
        )}

        {/* Delete Confirmation Dialog */}
        {isConfirmDeleteOpen && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg p-6 max-w-sm w-full">
              <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2 mb-2">
                <Trash2 className="w-5 h-5 text-red-600" /> Delete Request
              </h3>
              <p className="text-gray-600 mb-6">Are you sure you want to delete this material consumption request? This cannot be undone.</p>
              <div className="flex gap-3 justify-end">
                <Button variant="outline" onClick={() => setIsConfirmDeleteOpen(false)} disabled={isDeleting}>Cancel</Button>
                <Button variant="destructive" onClick={handleDelete} disabled={isDeleting} className="bg-red-600 hover:bg-red-700">
                  {isDeleting ? "Deleting..." : "Delete"}
                </Button>
              </div>
            </div>
          </div>
        )}

        </>
        )}

        <StatusModal
          isOpen={statusModal.isOpen}
          onClose={statusModal.close}
          title={statusModal.title}
          message={statusModal.message}
          type={statusModal.type}
        />
      </div>
    </PageGuard>
  );
}
