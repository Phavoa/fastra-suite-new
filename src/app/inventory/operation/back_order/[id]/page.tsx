"use client";

import React, { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { PageHeader } from "@/components/purchase/products/PageHeader";
import { BreadcrumbItem } from "@/types/purchase";
import { 
  useGetBackOrderQuery, 
  useUpdateBackOrderMutation,
  useSoftDeleteBackOrderMutation 
} from "@/api/inventory/backOrderApi";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ArrowLeft, CheckCircle2, XCircle, Trash2 } from "lucide-react";
import { PageGuard } from "@/components/auth/PageGuard";
import { ToastNotification } from "@/components/shared/ToastNotification";
import { extractErrorMessage } from "@/lib/utils";
import { StaggerContainer, SlideUp, FadeIn } from "@/components/shared/AnimatedWrapper";

export default function BackOrderDetailPage() {
  const router = useRouter();
  const params = useParams();
  const backOrderId = params.id as string;
  const [activeTab, setActiveTab] = useState<"expected" | "initial">("expected");

  const [notification, setNotification] = useState<{
    message: string;
    type: "success" | "error";
    show: boolean;
  }>({
    message: "",
    type: "success",
    show: false,
  });

  const {
    data: backOrder,
    isLoading,
    error,
  } = useGetBackOrderQuery(backOrderId);

  const [updateBackOrder, { isLoading: isUpdating }] = useUpdateBackOrderMutation();
  const [deleteBackOrder, { isLoading: isDeleting }] = useSoftDeleteBackOrderMutation();

  const handleStatusChange = async (newStatus: "validated" | "canceled") => {
    try {
      await updateBackOrder({ id: backOrderId, data: { status: newStatus } }).unwrap();
      setNotification({
        message: `Back order marked as ${newStatus}`,
        type: "success",
        show: true,
      });
    } catch (err) {
      setNotification({
        message: extractErrorMessage(err, `Failed to update status to ${newStatus}`),
        type: "error",
        show: true,
      });
    }
  };

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this back order?")) return;
    try {
      await deleteBackOrder(backOrderId).unwrap();
      setNotification({
        message: "Back order deleted successfully",
        type: "success",
        show: true,
      });
      setTimeout(() => {
        router.push("/inventory/operation/back_order");
      }, 1500);
    } catch (err) {
      setNotification({
        message: extractErrorMessage(err, "Failed to delete back order"),
        type: "error",
        show: true,
      });
    }
  };

  const closeNotification = () => {
    setNotification((prev) => ({ ...prev, show: false }));
  };

  const breadcrumbsItem: BreadcrumbItem[] = [
    { label: "Home", href: "/" },
    { label: "Inventory", href: "/inventory" },
    { label: "Operation", href: "/inventory/operation" },
    { label: "Back Order", href: "/inventory/operation/back_order" },
    {
      label: backOrder?.backorder_id || "Detail",
      href: `/inventory/operation/back_order/${backOrderId}`,
      current: true,
    },
  ];

  if (isLoading) {
    return (
      <main className="min-h-screen text-gray-800 flex items-center justify-center font-sans">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p>Loading back order details...</p>
        </div>
      </main>
    );
  }

  if (error || !backOrder) {
    return (
      <main className="min-h-screen text-gray-800 flex items-center justify-center font-sans">
        <div className="text-center text-red-600 px-4">
          <p className="text-lg font-semibold">Error loading back order details</p>
          <p className="text-sm mt-2">{extractErrorMessage(error, "The requested back order could not be found.")}</p>
          <Button onClick={() => router.push("/inventory/operation/back_order")} className="mt-4">
            Back to List
          </Button>
        </div>
      </main>
    );
  }

  const productItems = activeTab === "expected" 
    ? backOrder.backorder_of_details?.incoming_product_items || [] 
    : backOrder.backorder_items || [];

  return (
    <PageGuard application="inventory" module="backorder">
      <div className="min-h-screen bg-gray-50/30">
        <StaggerContainer>
          <SlideUp>
            <PageHeader
              items={breadcrumbsItem}
              title={`Back Order: ${backOrder.backorder_id}`}
            />
          </SlideUp>

          <SlideUp>
            <div className="bg-white px-6 py-4 border-b flex justify-between items-center sticky top-0 z-10 shadow-sm">
              <Button
                variant="outline"
                onClick={() => router.push("/inventory/operation/back_order")}
                className="flex items-center gap-2 hover:bg-gray-50 transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to List
              </Button>

              <div className="flex gap-3">
                {backOrder.status === "draft" && (
                  <>
                    <Button
                      variant="outline"
                      className="text-red-500 border-red-200 hover:bg-red-50"
                      onClick={() => handleStatusChange("canceled")}
                      disabled={isUpdating}
                    >
                      <XCircle className="w-4 h-4 mr-2" />
                      Cancel
                    </Button>
                    <Button
                      className="bg-green-600 hover:bg-green-700"
                      onClick={() => handleStatusChange("validated")}
                      disabled={isUpdating}
                    >
                      <CheckCircle2 className="w-4 h-4 mr-2" />
                      Validate / Done
                    </Button>
                  </>
                )}
                <Button variant="ghost" className="text-gray-400 hover:text-red-600" onClick={handleDelete} disabled={isDeleting}>
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </SlideUp>

          <div className="max-w-7xl mx-auto p-6 space-y-6">
            <SlideUp>
              <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="p-6 border-b border-gray-50 bg-gray-50/50">
                  <div className="flex justify-between items-center">
                    <h2 className="text-lg font-semibold text-blue-600">Back Order Information</h2>
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${
                        backOrder.status === "validated"
                          ? "bg-green-100 text-green-600"
                          : backOrder.status === "draft"
                          ? "bg-blue-100 text-blue-600"
                          : "bg-red-100 text-red-600"
                      }`}
                    >
                      {backOrder.status}
                    </span>
                  </div>
                </div>

                <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  <InfoField label="Receipt Type" value={backOrder.receipt_type?.replace(/_/g, " ")} capitalize />
                  <InfoField label="Source Location" value={backOrder.source_location_details?.location_name || backOrder.backorder_of_details?.source_location_details?.location_name} />
                  <InfoField label="Date Created" value={new Date(backOrder.date_created).toLocaleDateString()} />
                  <InfoField label="Destination Location" value={backOrder.destination_location_details?.location_name || backOrder.backorder_of_details?.destination_location_details?.location_name} />
                  <InfoField label="Supplier" value={backOrder.supplier_details?.company_name || backOrder.backorder_of_details?.supplier_details?.company_name || "N/A"} />
                  <InfoField label="Back Order ID" value={backOrder.backorder_id} />
                </div>
              </div>
            </SlideUp>

            <FadeIn>
              <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-50 flex gap-4">
                  <button
                    onClick={() => setActiveTab("expected")}
                    className={`pb-2 px-1 text-sm font-medium transition-colors border-b-2 ${
                      activeTab === "expected" ? "border-blue-600 text-blue-600" : "border-transparent text-gray-400 hover:text-gray-600"
                    }`}
                  >
                    Expected Products
                  </button>
                  <button
                    onClick={() => setActiveTab("initial")}
                    className={`pb-2 px-1 text-sm font-medium transition-colors border-b-2 ${
                      activeTab === "initial" ? "border-blue-600 text-blue-600" : "border-transparent text-gray-400 hover:text-gray-600"
                    }`}
                  >
                    Initial Demand
                  </button>
                </div>

                <div className="p-0 overflow-x-auto">
                  <Table>
                    <TableHeader className="bg-gray-50/50">
                      <TableRow>
                        <TableHead className="px-6 py-4 text-left text-sm font-semibold text-gray-600">Product Name</TableHead>
                        <TableHead className="px-6 py-4 text-center text-sm font-semibold text-gray-600">Expected Qty</TableHead>
                        <TableHead className="px-6 py-4 text-center text-sm font-semibold text-gray-600">Unit</TableHead>
                        <TableHead className="px-6 py-4 text-center text-sm font-semibold text-gray-600">Qty Received</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {productItems.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={4} className="h-40 text-center text-gray-400 border-none">
                            No items found for this selection.
                          </TableCell>
                        </TableRow>
                      ) : (
                        productItems.map((item, idx) => (
                          <TableRow key={`${item.id}-${idx}`} className="hover:bg-gray-50/80 transition-colors border-b border-gray-50 last:border-0">
                            <TableCell className="px-6 py-4 text-sm font-medium text-gray-900 border-none">
                              {item.product_details?.product_name || "N/A"}
                            </TableCell>
                            <TableCell className="px-6 py-4 text-center text-sm text-gray-700 border-none font-semibold">
                              {item.expected_quantity}
                            </TableCell>
                            <TableCell className="px-6 py-4 text-center text-sm text-gray-500 border-none uppercase">
                              {item.product_details?.unit_of_measure_details?.unit_symbol || "unit"}
                            </TableCell>
                            <TableCell className="px-6 py-4 text-center text-sm border-none font-semibold text-[#2BA24D]">
                              {item.quantity_received}
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>
              </div>
            </FadeIn>
          </div>
        </StaggerContainer>
      </div>

      <ToastNotification
        message={notification.message}
        type={notification.type}
        show={notification.show}
        onClose={closeNotification}
      />
    </PageGuard>
  );
}

function InfoField({ label, value, capitalize = false }: { label: string; value: string | undefined; capitalize?: boolean }) {
  return (
    <div className="space-y-1.5 flex flex-col border-l border-gray-100 pl-4 first:border-0 first:pl-0">
      <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">{label}</span>
      <span className={`text-sm font-medium text-gray-900 ${capitalize ? 'capitalize' : ''}`}>
        {value || "N/A"}
      </span>
    </div>
  );
}
