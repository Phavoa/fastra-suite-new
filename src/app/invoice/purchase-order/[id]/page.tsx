"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  ChevronLeft,
  Mail,
  FileText,
  Pencil,
  MoreVertical,
  Calendar,
  User,
  CreditCard,
  CheckCircle,
  Package,
} from "lucide-react";
import CreateVendorBillModal from "@/components/invoice/CreateVendorBillModal";

import { useGetPurchaseOrderByIdQuery, useIssuePurchaseOrderMutation, useFullyReceivePurchaseOrderMutation } from "@/api/invoice/projectPurchaseOrdersApi";
import { PurchaseOrderLine } from "@/api/invoice/projectPurchaseOrdersApi";

export default function PurchaseOrderDetailPage() {
  const params = useParams();
  const router = useRouter();
  const poId = Number(params?.id);
  const [isBillModalOpen, setIsBillModalOpen] = useState(false);

  const { data: poDetail, isLoading, error, refetch } = useGetPurchaseOrderByIdQuery(poId, {
    skip: !poId || isNaN(poId),
  });
  
  const [issuePurchaseOrder, { isLoading: isIssuing }] = useIssuePurchaseOrderMutation();
  const [fullyReceivePurchaseOrder, { isLoading: isReceiving }] = useFullyReceivePurchaseOrderMutation();

  const handleIssuePO = async () => {
    try {
      await issuePurchaseOrder(poId).unwrap();
      alert("Purchase Order Issued Successfully!");
      refetch();
    } catch (err: any) {
      alert(err?.data?.error || err?.data?.detail || "Failed to issue Purchase Order.");
      console.error(err);
    }
  };

  const handleReceiveGoods = async () => {
    if (!confirm("Are you sure you want to fully receive all goods for this Purchase Order?")) return;
    
    try {
      await fullyReceivePurchaseOrder(poId).unwrap();
      alert("Goods Received Successfully!");
      refetch();
    } catch (err: any) {
      alert(err?.data?.error || err?.data?.detail || "Failed to receive goods.");
      console.error(err);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: "NGN",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const totalAmount = Number(poDetail?.total_amount || 0);

  if (isLoading) {
    return (
      <div className="p-6 flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!poDetail || error) {
    return (
      <div className="p-6 text-center text-red-600">
        Error loading Purchase Order or it does not exist.
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-gray-500 mb-6">
        <Link
          href="/invoice/purchase-order"
          className="hover:text-gray-700 transition-colors"
        >
          Home
        </Link>
        <span className="text-gray-400">/</span>
        <Link
          href="/invoice/purchase-order"
          className="hover:text-gray-700 transition-colors"
        >
          Invoice
        </Link>
        <span className="text-gray-400">/</span>
        <Link
          href="/invoice/purchase-order"
          className="hover:text-gray-700 transition-colors"
        >
          Purchase Order
        </Link>
        <span className="text-gray-400">/</span>
        <span className="text-gray-900 font-medium">{poDetail.po_number}</span>
      </div>

      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">
            Purchase Order - {poDetail.po_number}
          </h1>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium text-gray-700">
            <Mail className="w-4 h-4" />
            Send Via Email
          </button>
          
          {poDetail.status?.toLowerCase() === "draft" && (
            <button
              onClick={handleIssuePO}
              disabled={isIssuing}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium disabled:opacity-50"
            >
              <CheckCircle className="w-4 h-4" />
              {isIssuing ? "Issuing..." : "Issue PO"}
            </button>
          )}

          {(poDetail.status?.toLowerCase() === "issued" || poDetail.status?.toLowerCase() === "partially_received") && (
            <button
              onClick={handleReceiveGoods}
              disabled={isReceiving}
              className="flex items-center gap-2 px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors text-sm font-medium disabled:opacity-50"
            >
              <Package className="w-4 h-4" />
              {isReceiving ? "Receiving..." : "Receive Goods"}
            </button>
          )}

          {poDetail.status?.toLowerCase() !== "draft" && (
            <button
              onClick={() => setIsBillModalOpen(true)}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
            >
              <FileText className="w-4 h-4" />
              Create Bill
            </button>
          )}
        </div>
      </div>

      {/* Basic Information */}
      <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
        <h2 className="text-sm font-medium text-gray-700 mb-4">
          Basic Information
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <div>
            <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">
              Vendor
            </p>
            <p className="text-sm font-medium text-gray-900">
              {poDetail.vendor_name || "N/A"}
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">
              WBS Element
            </p>
            <p className="text-sm font-medium text-gray-900">
              {poDetail.wbs_element || "N/A"}
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">
              Status
            </p>
            <p className="text-sm font-medium text-gray-900 capitalize">
              {poDetail.status?.replace(/_/g, ' ') || "N/A"}
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">
              Expected Delivery
            </p>
            <p className="text-sm font-medium text-gray-900">
              {poDetail.expected_delivery_date ? new Date(poDetail.expected_delivery_date).toLocaleDateString() : "N/A"}
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">
              Issued Date
            </p>
            <p className="text-sm font-medium text-gray-900">
              {poDetail.issued_at ? new Date(poDetail.issued_at).toLocaleDateString() : "Not Issued"}
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">
              Created Date
            </p>
            <p className="text-sm font-medium text-gray-900">
              {poDetail.created_at ? new Date(poDetail.created_at).toLocaleDateString() : "N/A"}
            </p>
          </div>
        </div>
      </div>

      {/* Request Type */}
      <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
        <h2 className="text-sm font-medium text-gray-700 mb-4">Request type</h2>
        <div className="flex items-center gap-4">
          <span className="inline-flex px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-sm font-medium">
            {poDetail.source_request_type || "Purchase Order"}
          </span>
        </div>
      </div>

      {/* Products Table */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Product Name
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Unit
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  QTY
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Unit Price
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Total
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {poDetail.lines?.map((line: PurchaseOrderLine, index: number) => (
                <tr key={index} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3 text-sm text-gray-900">
                    {line.item_name || line.description}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">
                    - 
                  </td>
                  <td className="px-4 py-3 text-sm text-right text-gray-600">
                    {line.qty}
                  </td>
                  <td className="px-4 py-3 text-sm text-right text-gray-600">
                    {formatCurrency(Number(line.unit_price || 0))}
                  </td>
                  <td className="px-4 py-3 text-sm text-right font-semibold text-gray-900">
                    {formatCurrency(Number(line.line_total || 0))}
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot className="bg-gray-50 border-t border-gray-200">
              <tr>
                <td
                  colSpan={4}
                  className="px-4 py-3 text-sm font-semibold text-gray-900 text-right"
                >
                  Total
                </td>
                <td className="px-4 py-3 text-sm font-bold text-gray-900 text-right">
                  {formatCurrency(totalAmount)}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      {/* Create Vendor Bill Modal */}
      <CreateVendorBillModal
        isOpen={isBillModalOpen}
        onClose={() => setIsBillModalOpen(false)}
        poId={poDetail.id}
        poNumber={poDetail.po_number}
        vendorId={poDetail.vendor}
        products={poDetail.lines || []}
        formatCurrency={formatCurrency}
      />
    </div>
  );
}
