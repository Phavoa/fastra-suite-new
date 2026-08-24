"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Mail, FileText, CheckCircle, Loader2, ArrowLeft } from "lucide-react";
import CreateVendorBillModal from "@/components/invoice/CreateVendorBillModal";
import { ToastNotification } from "@/components/shared/ToastNotification";

import {
  useGetPurchaseOrderByIdQuery,
  useIssuePurchaseOrderMutation,
  useFullyReceivePurchaseOrderMutation,
} from "@/api/invoice/projectPurchaseOrdersApi";
import { PurchaseOrderLine } from "@/api/invoice/projectPurchaseOrdersApi";
import { useCreateIncomingProductMutation } from "@/api/inventory/incomingProductApi";
import { useGetLocationsQuery } from "@/api/inventory/locationApi";
import { useGetInventoryProductsQuery } from "@/api/inventory/productsApi";
import { useGetInventoryUnitOfMeasuresQuery } from "@/api/inventory/unitOfMeasureApi";

/* -------------------------------------------------------------------------- */
/*                                   Helpers                                  */
/* -------------------------------------------------------------------------- */

function extractErrorMessage(err: unknown, fallback: string): string {
  if (!err) return fallback;
  const data = (err as any)?.data ?? err;
  if (typeof data === "string") return data;
  if (typeof data?.detail === "string") return data.detail;
  if (typeof data?.error === "string") return data.error;
  if (Array.isArray(data?.error) && data.error.length > 0) {
    const first = data.error[0];
    if (typeof first === "string") return first;
    if (typeof first?.detail === "string") return first.detail;
    if (typeof first?.message === "string") return first.message;
    try {
      return JSON.stringify(first).slice(0, 180);
    } catch {
      /* ignore */
    }
  }
  return (err as any)?.message || fallback;
}

const formatCurrency = (amount: number) =>
  new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount || 0);

const formatToSentenceCase = (text: string) =>
  text
    .split("_")
    .join(" ")
    .replace(/^./, (char) => char.toUpperCase());

const statusBadgeClass = (status?: string) => {
  const s = (status || "").toLowerCase();
  if (s === "draft") return "bg-gray-100 text-gray-700";
  if (s === "issued") return "bg-blue-100 text-blue-800";
  if (s.includes("received")) return "bg-teal-100 text-teal-800";
  if (s.includes("billed")) return "bg-indigo-100 text-indigo-800";
  if (s === "cancelled" || s === "canceled") return "bg-red-100 text-red-800";
  if (s === "closed") return "bg-green-100 text-green-800";
  return "bg-gray-100 text-gray-700";
};

/** Goods-based source types that should be pushed to Inventory after Issue */
const GOODS_SOURCE_TYPES = new Set(["project_purchase_request"]);

/* -------------------------------------------------------------------------- */
/*                                   Page                                     */
/* -------------------------------------------------------------------------- */

export default function PurchaseOrderDetailPage() {
  const params = useParams();
  const router = useRouter();
  const poId = Number(params?.id);

  const [isBillModalOpen, setIsBillModalOpen] = useState(false);
  const [selectedLineIds, setSelectedLineIds] = useState<number[]>([]);
  const [toast, setToast] = useState<{
    show: boolean;
    message: string;
    type: "success" | "error";
  }>({ show: false, message: "", type: "success" });

  const {
    data: poDetail,
    isLoading,
    error,
    refetch,
  } = useGetPurchaseOrderByIdQuery(poId, {
    skip: !poId || isNaN(poId),
  });

  const { data: locationsResponse = [] } = useGetLocationsQuery({});
  const locationsData = Array.isArray(locationsResponse)
    ? locationsResponse
    : (locationsResponse as any)?.results || [];

  const { data: productsResponse = [] } = useGetInventoryProductsQuery({});
  const productsData = Array.isArray(productsResponse)
    ? productsResponse
    : (productsResponse as any)?.results || [];

  const { data: uomResponse = [] } = useGetInventoryUnitOfMeasuresQuery({});
  const uomData = Array.isArray(uomResponse)
    ? uomResponse
    : (uomResponse as any)?.results || [];

  const [issuePurchaseOrder, { isLoading: isIssuing }] =
    useIssuePurchaseOrderMutation();
  const [fullyReceivePurchaseOrder, { isLoading: isReceiving }] =
    useFullyReceivePurchaseOrderMutation();
  const [createIncomingProduct] = useCreateIncomingProductMutation();

  const isActionLoading = isIssuing || isReceiving;

  const showToast = (message: string, type: "success" | "error") => {
    setToast({ show: true, message, type });
  };

  const sourceTypeRaw = (
    poDetail?.source_request_type ||
    (poDetail as any)?.request_type ||
    ""
  ).toLowerCase();
  console.log("sourceTypeRaw", sourceTypeRaw);
  console.log("poDetail", poDetail);

  const isGoodsPurchase = GOODS_SOURCE_TYPES.has(sourceTypeRaw);
  // Plant & Equipment hire / subcontractor → issue only (no fully-receive)
  const shouldPushToInventory = isGoodsPurchase;

  const status = (poDetail?.status || "").toLowerCase();
  const isDraft = status === "draft";
  const canCreateBill =
    !isDraft && status !== "cancelled" && status !== "canceled";

  /* ----------------------------- Issue (+ receive) ------------------------ */

  const handleIssuePO = async () => {
    if (!poId) return;

    try {
      await issuePurchaseOrder(poId).unwrap();

      if (shouldPushToInventory) {
        try {
          await fullyReceivePurchaseOrder(poId).unwrap();
          showToast("PO issued and sent to Inventory.", "success");
        } catch (receiveErr: unknown) {
          // Issue succeeded; receive failed — still usable, but warn
          showToast(
            extractErrorMessage(
              receiveErr,
              "PO issued, but could not send to Inventory. Ask the storekeeper or retry from Inventory.",
            ),
            "error",
          );
        }
      } else {
        showToast("Purchase Order issued successfully.", "success");
      }

      await refetch();
    } catch (err: unknown) {
      showToast(
        extractErrorMessage(err, "Failed to issue Purchase Order."),
        "error",
      );
      console.error("[PO Issue]", err);
    }
  };

  /* ----------------------------- Line selection --------------------------- */
  const handleReceiveGoods = async () => {
    if (!poDetail) return;

    if (
      !confirm(
        "Are you sure you want to receive goods for this Purchase Order and generate a draft Incoming Product in Inventory Operations?",
      )
    )
      return;

    try {
      // 1. Mark the PO as received
      await fullyReceivePurchaseOrder(poId).unwrap();

      // 2. Create the corresponding draft Incoming Product in Inventory
      const defaultLoc = locationsData[0]?.id || "";
      const defaultUomId = uomData[0]?.id || 1;

      const payload: any = {
        receipt_type: "vendor_receipt",
        supplier: poDetail.vendor,
        related_ppo: poDetail.id,
        source_location: defaultLoc,
        destination_location: defaultLoc,
        status: "draft",
        notes: `Draft GRN from Purchase Order ${poDetail.po_number}`,
        incoming_product_items: (poDetail.lines || []).map((line) => {
          const matchedProd = productsData.find(
            (p: any) => p.id?.toString() === line.product?.toString(),
          );
          const uom =
            matchedProd?.unit_of_measure ||
            matchedProd?.unit_of_measure_details?.id ||
            defaultUomId;

          return {
            product: line.product,
            expected_quantity: line.qty || "0",
            quantity_received: line.qty || "0",
            ppo_line: line.id,
            unit_of_measure: uom,
          };
        }),
      };

      try {
        await createIncomingProduct(payload).unwrap();
        alert(
          "Goods received! A draft Goods Receipt Note (GRN) has been created in Inventory Operations. You can now view and complete it under Inventory > Operations.",
        );
      } catch (grnErr: any) {
        console.warn("Draft GRN creation notice:", grnErr);
        const errMsg =
          grnErr?.data?.error?.[0]?.incoming_product_items
            ?.unit_of_measure?.[0] ||
          grnErr?.data?.detail ||
          grnErr?.data?.error ||
          "Purchase Order marked as received! Please check Inventory > Operations to review incoming products.";
        alert(typeof errMsg === "string" ? errMsg : JSON.stringify(errMsg));
      }

      refetch();
    } catch (err: any) {
      alert(
        err?.data?.error || err?.data?.detail || "Failed to receive goods.",
      );
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

  const formatToSentenceCase = (text: string) =>
    text
      .split("_")
      .join(" ")
      .replace(/^./, (char) => char.toUpperCase());

  const toggleLineSelection = (lineId: number) => {
    setSelectedLineIds((prev) =>
      prev.includes(lineId)
        ? prev.filter((id) => id !== lineId)
        : [...prev, lineId],
    );
  };

  const toggleSelectAll = () => {
    if (!poDetail?.lines) return;
    const allIds = poDetail.lines.map((line) => line.id);
    setSelectedLineIds((prev) => (prev.length === allIds.length ? [] : allIds));
  };

  const selectedLines =
    poDetail?.lines?.filter((line) => selectedLineIds.includes(line.id)) || [];

  const allSelected =
    !!poDetail?.lines?.length &&
    selectedLineIds.length === poDetail.lines.length;

  /* -------------------------------- Render -------------------------------- */

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center p-6">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (!poDetail || error) {
    return (
      <div className="p-6 text-center text-red-600">
        Error loading Purchase Order or it does not exist.
        <div className="mt-4">
          <Link
            href="/invoice/purchase-order"
            className="text-sm text-blue-600 hover:underline"
          >
            ← Back to Purchase Orders
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6">
      <ToastNotification
        show={toast.show}
        message={toast.message}
        type={toast.type}
        onClose={() => setToast((prev) => ({ ...prev, show: false }))}
      />

      {/* Breadcrumb */}
      <nav className="mb-6 flex flex-wrap items-center gap-2 text-sm text-gray-500">
        <Link
          href="/invoice/purchase-order"
          className="inline-flex items-center gap-1 hover:text-gray-700"
        >
          <ArrowLeft className="h-4 w-4" />
          Purchase Orders
        </Link>
        <span className="text-gray-300">›</span>
        <span className="font-medium text-gray-900">{poDetail.po_number}</span>
      </nav>

      {/* Page Header */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">
            Purchase Order — {poDetail.po_number}
          </h1>
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <span
              className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium capitalize ${statusBadgeClass(
                poDetail.status,
              )}`}
            >
              {(poDetail.status || "—").replace(/_/g, " ")}
            </span>
            {poDetail.source_request_type && (
              <span className="inline-flex rounded-full bg-blue-50 px-2.5 py-1 text-xs font-medium text-blue-700">
                {formatToSentenceCase(poDetail.source_request_type)}
              </span>
            )}
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            className="inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            <Mail className="h-4 w-4" />
            Send Via Email
          </button>

          {isDraft && (
            <button
              type="button"
              onClick={handleIssuePO}
              disabled={isActionLoading}
              className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isActionLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  {isIssuing ? "Issuing…" : "Sending to Inventory…"}
                </>
              ) : (
                <>
                  <CheckCircle className="h-4 w-4" />
                  Issue PO
                </>
              )}
            </button>
          )}

          {canCreateBill && (
            <button
              type="button"
              onClick={() => setIsBillModalOpen(true)}
              disabled={selectedLines.length === 0 || isActionLoading}
              className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <FileText className="h-4 w-4" />
              Create Bill
              {selectedLines.length > 0 && (
                <span className="rounded-full bg-white/20 px-2 py-0.5 text-xs">
                  {selectedLines.length}
                </span>
              )}
            </button>
          )}
        </div>
      </div>

      {isDraft && shouldPushToInventory && (
        <div className="mb-6 rounded-lg border border-blue-100 bg-blue-50 px-4 py-3 text-sm text-blue-800">
          Issuing this PO will also send it to <strong>Inventory</strong> for
          the storekeeper to inspect and confirm received quantities.
        </div>
      )}

      {/* Basic Information */}
      <div className="mb-6 rounded-xl border border-gray-200 bg-white p-5 sm:p-6">
        <h2 className="mb-4 text-sm font-semibold text-gray-800">
          Basic Information
        </h2>
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          <div>
            <p className="mb-1 text-xs uppercase tracking-wider text-gray-500">
              Vendor
            </p>
            <p className="text-sm font-medium text-gray-900">
              {poDetail.vendor_name || "—"}
            </p>
          </div>
          <div>
            <p className="mb-1 text-xs uppercase tracking-wider text-gray-500">
              WBS Element
            </p>
            <p className="text-sm font-medium text-gray-900">
              {typeof poDetail.wbs_element === "object"
                ? (poDetail.wbs_element as any)?.name || "—"
                : poDetail.wbs_element || "—"}
            </p>
          </div>
          <div>
            <p className="mb-1 text-xs uppercase tracking-wider text-gray-500">
              Status
            </p>
            <p className="text-sm font-medium capitalize text-gray-900">
              {(poDetail.status || "—").replace(/_/g, " ")}
            </p>
          </div>
          <div>
            <p className="mb-1 text-xs uppercase tracking-wider text-gray-500">
              Expected Delivery
            </p>
            <p className="text-sm font-medium text-gray-900">
              {poDetail.expected_delivery_date
                ? new Date(poDetail.expected_delivery_date).toLocaleDateString()
                : "—"}
            </p>
          </div>
          <div>
            <p className="mb-1 text-xs uppercase tracking-wider text-gray-500">
              Issued Date
            </p>
            <p className="text-sm font-medium text-gray-900">
              {poDetail.issued_at
                ? new Date(poDetail.issued_at).toLocaleDateString()
                : "Not issued"}
            </p>
          </div>
          <div>
            <p className="mb-1 text-xs uppercase tracking-wider text-gray-500">
              Created Date
            </p>
            <p className="text-sm font-medium text-gray-900">
              {poDetail.created_at
                ? new Date(poDetail.created_at).toLocaleDateString()
                : "—"}
            </p>
          </div>
          <div>
            <p className="mb-1 text-xs uppercase tracking-wider text-gray-500">
              Total Amount
            </p>
            <p className="text-sm font-semibold text-gray-900">
              {formatCurrency(totalAmount)}
            </p>
          </div>
        </div>
      </div>

      {/* Line items */}
      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
        <div className="border-b border-gray-100 px-5 py-3">
          <h2 className="text-sm font-semibold text-gray-800">Line Items</h2>
          <p className="mt-0.5 text-xs text-gray-500">
            Select lines to include when creating a vendor bill.
          </p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px]">
            <thead className="border-b border-gray-200 bg-gray-50">
              <tr>
                <th className="w-12 px-4 py-3 text-left">
                  <input
                    type="checkbox"
                    checked={allSelected}
                    onChange={toggleSelectAll}
                    disabled={!canCreateBill}
                    className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 disabled:opacity-40"
                    aria-label="Select all lines"
                  />
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Product / Description
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Unit
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500">
                  Qty
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500">
                  Unit Price
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500">
                  Total
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {poDetail.lines?.map((line: PurchaseOrderLine) => (
                <tr
                  key={line.id}
                  className={`transition-colors hover:bg-gray-50/80 ${
                    selectedLineIds.includes(line.id) ? "bg-blue-50/50" : ""
                  }`}
                >
                  <td className="px-4 py-3">
                    <input
                      type="checkbox"
                      checked={selectedLineIds.includes(line.id)}
                      onChange={() => toggleLineSelection(line.id)}
                      disabled={!canCreateBill}
                      className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 disabled:opacity-40"
                      aria-label={`Select ${line.item_name || line.description}`}
                    />
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-900">
                    {line.item_name || line.description || "—"}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">
                    {line.unit || "—"}
                  </td>
                  <td className="px-4 py-3 text-right text-sm text-gray-600">
                    {line.qty ?? "—"}
                  </td>
                  <td className="px-4 py-3 text-right text-sm text-gray-600">
                    {formatCurrency(Number(line.unit_price || 0))}
                  </td>
                  <td className="px-4 py-3 text-right text-sm font-semibold text-gray-900">
                    {formatCurrency(Number(line.line_total || 0))}
                  </td>
                </tr>
              ))}
              {(!poDetail.lines || poDetail.lines.length === 0) && (
                <tr>
                  <td
                    colSpan={6}
                    className="px-4 py-10 text-center text-sm text-gray-500"
                  >
                    No line items on this purchase order.
                  </td>
                </tr>
              )}
            </tbody>
            <tfoot className="border-t border-gray-200 bg-gray-50">
              <tr>
                <td
                  colSpan={5}
                  className="px-4 py-3 text-right text-sm font-semibold text-gray-900"
                >
                  Total
                </td>
                <td className="px-4 py-3 text-right text-sm font-bold text-gray-900">
                  {formatCurrency(totalAmount)}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      <CreateVendorBillModal
        isOpen={isBillModalOpen}
        onClose={() => setIsBillModalOpen(false)}
        sourceType="PROJECT_PO"
        sourceId={poDetail.id}
        vendorId={poDetail.vendor}
        paymentTerm={poDetail.payment_term}
        lines={selectedLines.map((line) => ({
          id: line.id,
          description: line.description || line.item_name || "",
          qty: line.qty,
          unit_price: line.unit_price,
          line_total: line.line_total,
          item_name: line.item_name,
        }))}
        formatCurrency={formatCurrency}
        subtitle={`PO ${poDetail.po_number}`}
        onCreated={() => {
          setSelectedLineIds([]);
          refetch();
        }}
      />
    </div>
  );
}
