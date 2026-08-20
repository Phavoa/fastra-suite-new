"use client";

import React from "react";
import { useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Edit, RotateCcw, Package } from "lucide-react";
import Link from "next/link";
import { PageGuard } from "@/components/auth/PageGuard";
import { PermissionGuard } from "@/components/auth/PermissionGuard";
import { motion, AnimatePresence } from "framer-motion";
import { Skeleton } from "@/components/ui/skeleton";
import Breadcrumbs from "@/components/shared/BreadScrumbs";
import { AutoSaveIcon } from "@/components/shared/icons";
import { BreadcrumbItem } from "@/types/purchase";

import { useGetIncomingProductQuery, useValidateIncomingProductReceiptMutation } from "@/api/inventory/incomingProductApi";
import { Loader2, Check } from "lucide-react";
import StatusModal, { useStatusModal, extractErrorMessage } from "@/components/shared/StatusModal";
import { DiscrepancyDialog, type DiscrepancyType } from "@/components/shared/DiscrepancyDialog";

export default function IncomingProductDetailPage() {
  const params = useParams();
  const id = (params?.id as string) || "";

  const { data: incomingProduct, isLoading, error, refetch } = useGetIncomingProductQuery(id, { skip: !id });
  const [validateIncomingProduct] = useValidateIncomingProductReceiptMutation();
  const [isValidating, setIsValidating] = React.useState(false);
  
  const [discrepancyState, setDiscrepancyState] = React.useState<{
    isOpen: boolean;
    type: DiscrepancyType | null;
    ipId: string | null;
  }>({
    isOpen: false,
    type: null,
    ipId: null,
  });

  const statusModal = useStatusModal();

  const handleValidate = async () => {
    setIsValidating(true);
    try {
      await validateIncomingProduct({ id }).unwrap();
      statusModal.showSuccess(
        "GRN Validated",
        "Stock received into Inventory Ledger."
      );
      refetch();
    } catch (err: any) {
      const isBackorderError = err?.data?.requires_backorder_confirmation || 
                               err?.data?.error?.[0]?.error === "Short quantity detected. Please confirm backorder creation." ||
                               err?.data?.error?.[0]?.requires_backorder_confirmation === true;

      if (isBackorderError) {
        statusModal.close();
        setDiscrepancyState({
          isOpen: true,
          type: "backorder",
          ipId: id,
        });
      } else {
        statusModal.showError(
          "Validation Failed",
          extractErrorMessage(err, "Failed to validate GRN.")
        );
      }
    } finally {
      setIsValidating(false);
    }
  };

  const handleCreateBackorder = async () => {
    if (!discrepancyState.ipId) return;
    setIsValidating(true);
    statusModal.showInfo("Processing Backorder...", "Please wait while the backorder is created.");
    try {
      await validateIncomingProduct({ 
        id: discrepancyState.ipId,
        data: { create_backorder: true }
      }).unwrap();

      setDiscrepancyState({ isOpen: false, type: null, ipId: null });
      statusModal.showSuccess(
        "Backorder Created",
        "GRN Validated & Backorder created for remaining pending balance!"
      );
      refetch();
    } catch (error: any) {
      statusModal.showError(
        "Action Failed",
        extractErrorMessage(error, "Failed to create backorder.")
      );
    } finally {
      setIsValidating(false);
    }
  };

  const handleCloseWithoutBackorder = async () => {
    if (!discrepancyState.ipId) return;
    setIsValidating(true);
    statusModal.showInfo("Closing Delivery...", "Please wait while we close the delivery.");
    try {
      await validateIncomingProduct({ 
        id: discrepancyState.ipId,
        data: { create_backorder: false }
      }).unwrap();

      setDiscrepancyState({ isOpen: false, type: null, ipId: null });
      statusModal.showSuccess(
        "Delivery Closed",
        "GRN Validated! PO closed without backorder."
      );
      refetch();
    } catch (error: any) {
      statusModal.showError(
        "Action Failed",
        extractErrorMessage(error, "Failed to close delivery.")
      );
    } finally {
      setIsValidating(false);
    }
  };

  const breadcrumbsItem: BreadcrumbItem[] = [
    { label: "Home", href: "/" },
    { label: "Inventory", href: "/inventory" },
    { label: "Operation", href: "/inventory/operation" },
    { label: `Receipt ${id}`, href: `/inventory/operation/incoming_product/${id}`, current: true },
  ];

  if (isLoading) {
    return (
      <PageGuard application="inventory" module="incomingproduct">
        <div className="flex flex-col flex-1 min-h-[calc(100vh-64px)] bg-[#F6F9FC] pb-20">
          <main className="max-w-[1400px] mx-auto px-4 sm:px-6 py-6 w-full flex flex-col gap-6">
            <div className="flex items-center gap-3">
              <Skeleton className="w-8 h-8 bg-gray-200 rounded-lg animate-pulse" />
              <Skeleton className="h-6 bg-gray-200 rounded w-36 animate-pulse" />
            </div>
            <div className="bg-white p-6 rounded-lg border border-gray-100 shadow-2xs space-y-4">
              <div className="flex justify-between items-center">
                <Skeleton className="h-7 bg-gray-200 rounded w-64 animate-pulse" />
                <Skeleton className="h-6 bg-gray-200 rounded-full w-20 animate-pulse" />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4 border-t border-gray-100">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <div key={i} className="space-y-2">
                    <Skeleton className="h-4 bg-gray-200 rounded w-24 animate-pulse" />
                    <Skeleton className="h-5 bg-gray-200 rounded w-48 animate-pulse" />
                  </div>
                ))}
              </div>
            </div>
          </main>
        </div>
      </PageGuard>
    );
  }

  if (error || !incomingProduct) {
    return (
      <PageGuard application="inventory" module="incomingproduct">
        <div className="flex flex-col h-screen items-center justify-center bg-[#F6F9FC] gap-4">
          <p className="text-[#525F7F]">Failed to load GRN or it was not found.</p>
          <Link href="/inventory/operation">
            <Button variant="outline" className="border-gray-200 text-gray-600">Back to Operations</Button>
          </Link>
        </div>
      </PageGuard>
    );
  }

  const displayData = {
    incoming_product_id: incomingProduct.incoming_product_id,
    receipt_type: incomingProduct.receipt_type || "vendor_receipt",
    status: incomingProduct.status || "draft",
    related_po: incomingProduct.related_po || incomingProduct.related_ppo_details?.po_number || "N/A",
    created_at: incomingProduct.date_created ? new Date(incomingProduct.date_created).toLocaleString() : "N/A",
    supplier_name: incomingProduct.supplier_details?.vendor_name || incomingProduct.supplier_details?.company_name || "Unknown Supplier",
    destination_location: incomingProduct.destination_location_details?.location_name || incomingProduct.destination_location || "Unknown Location",
    has_backorder: incomingProduct.is_backorder || !!incomingProduct.backorder_of,
    backorder_id: incomingProduct.backorder_of_details?.incoming_product_id || incomingProduct.backorder_of,
    items: incomingProduct.incoming_product_items?.map((item, index) => ({
      id: item.id?.toString() || index.toString(),
      product_name: item.product_details?.product_name || `Product ${item.product}`,
      unit_symbol: item.product_details?.unit_of_measure_details?.unit_symbol || "Units",
      expected_quantity: item.expected_quantity,
      received_quantity: item.quantity_received,
    })) || [],
  };

  return (
    <PageGuard module="inventory" entitlement="view_incomingproduct">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25, ease: "easeOut" }}
        className="flex flex-col flex-1 min-h-[calc(100vh-64px)] bg-[#F6F9FC] relative pb-20"
      >
      <StatusModal
        isOpen={statusModal.isOpen}
        type={statusModal.type}
        title={statusModal.title}
        message={statusModal.message}
        actionText={statusModal.actionText}
        onAction={statusModal.onAction}
        onClose={statusModal.close}
      />
      <DiscrepancyDialog
        isOpen={discrepancyState.isOpen}
        type={discrepancyState.type}
        onClose={() => setDiscrepancyState({ isOpen: false, type: null, ipId: null })}
        onConfirm={handleCreateBackorder}
        onDecline={handleCloseWithoutBackorder}
      />
      
        <main className="max-w-[1400px] mx-auto px-4 sm:px-6 py-6 w-full flex flex-col gap-6">
          {/* Breadcrumbs */}
          <Breadcrumbs
            items={breadcrumbsItem}
            action={
              <Button
                variant="ghost"
                className="text-sm text-gray-400 flex items-center gap-2 hover:text-[#3B7CED] transition-colors duration-200"
              >
                Autosaved <AutoSaveIcon />
              </Button>
            }
          />

          {/* Top Bar Section Card */}
          <div className="bg-white rounded-lg shadow-2xs border border-gray-100 p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-lg bg-[#E8F0FE] text-[#1A73E8]">
                <Package className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-3">
                  <h1 className="text-xl font-semibold text-[#32325D]">
                    Receipt: {displayData.incoming_product_id}
                  </h1>
                  <span
                    className={`inline-block px-3 py-1 text-xs rounded-full font-semibold capitalize ${
                      displayData.status === "validated"
                        ? "bg-[#E2F2E9] text-[#2BA24D]"
                        : displayData.status === "canceled"
                        ? "bg-[#FCE8E6] text-[#C5221F]"
                        : "bg-[#E8F0FE] text-[#1A73E8]"
                    }`}
                  >
                    {displayData.status}
                  </span>
                  {displayData.has_backorder && displayData.backorder_id && (
                    <span className="inline-block px-3 py-1 text-xs rounded-full font-semibold bg-amber-100 text-amber-800">
                      Backorder: {displayData.backorder_id}
                    </span>
                  )}
                </div>
                <p className="text-xs text-[#8898AA] mt-1">
                  Created on {displayData.created_at} • Source PO:{" "}
                  <strong className="text-[#3B7CED]">{displayData.related_po}</strong>
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 self-end sm:self-auto">
              {displayData.status === "draft" && (
                <>
                  <PermissionGuard module="inventory" entitlement="change_incomingproduct">
                    <Link href={`/inventory/operation/incoming_product/edit/${encodeURIComponent(decodeURIComponent(id))}`}>
                      <Button variant="outline" className="border-gray-200 text-gray-600 hover:bg-gray-50 h-9 px-4 rounded-md font-medium text-sm shadow-2xs transition-all">
                        <Edit className="w-4 h-4 mr-1.5" /> Edit
                      </Button>
                    </Link>
                  </PermissionGuard>
                  <PermissionGuard module="inventory" entitlement="change_incomingproduct">
                    <Button 
                      onClick={handleValidate} 
                      disabled={isValidating}
                      className="bg-[#3B7CED] hover:bg-[#3065c3] text-white h-9 px-4 rounded-md font-medium text-sm shadow-2xs transition-all"
                    >
                      {isValidating ? <Loader2 className="w-4 h-4 mr-1.5 animate-spin" /> : <Check className="w-4 h-4 mr-1.5" />}
                      Confirm Quantities
                    </Button>
                  </PermissionGuard>
                </>
              )}
              {displayData.status === "validated" && (
                <PermissionGuard module="inventory" entitlement="add_returnincomingproduct">
                  <Link href={`/inventory/operation/supplier_return/new?receiptId=${encodeURIComponent(decodeURIComponent(id))}`}>
                    <Button variant="outline" className="border-red-300 text-[#E43D2B] hover:bg-red-50 h-9 px-4 rounded-md font-medium text-sm transition-all">
                      <RotateCcw className="w-4 h-4 mr-1.5" /> Return to Supplier
                    </Button>
                  </Link>
                </PermissionGuard>
              )}
            </div>
          </div>

          {/* Summary Metadata Card */}
          <div className="bg-white rounded-lg shadow-2xs border border-gray-100 p-6">
            <h2 className="text-base font-semibold text-[#32325D] mb-4 pb-3 border-b border-gray-100">
              Receipt Details
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
              <div>
                <span className="font-semibold text-[#8898AA] text-[11.5px] block mb-1">
                  Receipt ID
                </span>
                <span className="text-[#32325D] font-semibold text-sm">
                  {displayData.incoming_product_id}
                </span>
              </div>
              <div>
                <span className="font-semibold text-[#8898AA] text-[11.5px] block mb-1">
                  Receipt Type
                </span>
                <span className="text-[#32325D] font-semibold text-sm capitalize">
                  {displayData.receipt_type.replace(/_/g, " ")}
                </span>
              </div>
              <div>
                <span className="font-semibold text-[#8898AA] text-[11.5px] block mb-1">
                  Source Document (PO)
                </span>
                <span className="text-[#3B7CED] font-semibold text-sm">
                  {displayData.related_po}
                </span>
              </div>
              <div>
                <span className="font-semibold text-[#8898AA] text-[11.5px] block mb-1">
                  Supplier / Vendor
                </span>
                <span className="text-[#32325D] font-semibold text-sm">
                  {displayData.supplier_name}
                </span>
              </div>
              <div>
                <span className="font-semibold text-[#8898AA] text-[11.5px] block mb-1">
                  Destination Location
                </span>
                <span className="text-[#32325D] font-semibold text-sm">
                  {displayData.destination_location}
                </span>
              </div>
            </div>
          </div>

          {/* Line Items Table Card */}
          <div className="bg-white rounded-lg shadow-2xs border border-gray-100 overflow-hidden">
            <div className="p-5 border-b border-gray-100">
              <h2 className="text-base font-semibold text-[#32325D]">
                Product Lines
              </h2>
            </div>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-[#F6F9FC] hover:bg-[#F6F9FC] border-b border-gray-100">
                    <TableHead className="font-semibold text-[#8898AA] text-[11.5px] py-3.5 px-6 whitespace-nowrap">
                      Product Name
                    </TableHead>
                    <TableHead className="font-semibold text-[#8898AA] text-[11.5px] py-3.5 px-6 whitespace-nowrap">
                      Unit of Measure
                    </TableHead>
                    <TableHead className="font-semibold text-[#8898AA] text-[11.5px] py-3.5 px-6 whitespace-nowrap text-center">
                      Expected Quantity
                    </TableHead>
                    <TableHead className="font-semibold text-[#8898AA] text-[11.5px] py-3.5 px-6 whitespace-nowrap text-center">
                      Quantity Received
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {displayData.items.map((item) => (
                    <TableRow
                      key={item.id}
                      className="hover:bg-gray-50/50 border-b border-[#E9ECEF] transition-colors"
                    >
                      <TableCell className="text-[#32325D] font-semibold text-sm py-3.5 px-6 whitespace-nowrap">
                        {item.product_name}
                      </TableCell>
                      <TableCell className="text-[#525F7F] font-normal text-sm py-3.5 px-6 whitespace-nowrap">
                        {item.unit_symbol}
                      </TableCell>
                      <TableCell className="text-[#525F7F] font-normal text-sm py-3.5 px-6 whitespace-nowrap text-center">
                        {item.expected_quantity}
                      </TableCell>
                      <TableCell className="text-[#32325D] font-semibold text-sm py-3.5 px-6 whitespace-nowrap text-center">
                        {item.received_quantity}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        </main>
      </motion.div>
    </PageGuard>
  );
}
