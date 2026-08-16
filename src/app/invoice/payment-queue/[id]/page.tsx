"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import BankSelectModal from "@/components/invoice/payment-queue/BankSelectModal";
import SuccessModal from "@/components/invoice/payment-queue/SuccessModal";
import { CircleCheck, Download, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";

import { useParams } from "next/navigation";
import {
  useGetVendorBillByIdQuery,
  usePayVendorBillMutation,
  useApproveVendorBillMutation,
  useRejectVendorBillMutation,
  useSubmitVendorBillMutation,
  VendorBill,
  CreateVendorBillRequest,
} from "@/api/invoice/vendorBillsApi";
import { ToastNotification } from "@/components/shared/ToastNotification";

const getDaysUntilDue = (dueDate: string | null) => {
  if (!dueDate) return 0;
  const due = new Date(dueDate);
  const now = new Date();
  const diffTime = due.getTime() - now.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};

const statusBadgeStyles: Record<string, string> = {
  draft: "bg-gray-100 text-gray-700",
  submitted: "bg-yellow-100 text-yellow-700",
  approved: "bg-blue-100 text-blue-700",
  rejected: "bg-red-100 text-red-700",
  cancelled: "bg-red-100 text-red-700",
  paid: "bg-green-100 text-green-700",
  partial: "bg-blue-100 text-blue-700",
};

const formatCurrency = (amount: number | string) => {
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(Number(amount || 0));
};

/**
 * Safely turn any API error payload into a human-readable string.
 * Handles shapes like: "msg", { error: "..." }, { detail: "..." },
 * { error: [{ error: "..." }] }, arrays of strings, etc.
 */
const extractErrorMessage = (err: any, fallback = "An unexpected error occurred"): string => {
  if (!err) return fallback;

  const data = err?.data;
  if (typeof data === "string") return data;

  if (data && typeof data === "object") {
    // { error: "..." | [...] }
    if (Array.isArray(data.error)) {
      return data.error
        .map((e: any) =>
          typeof e === "string"
            ? e
            : e?.error || e?.detail || e?.message || JSON.stringify(e),
        )
        .join("; ");
    }
    if (typeof data.error === "string") return data.error;
    if (typeof data.detail === "string") return data.detail;
    if (Array.isArray(data.detail)) {
      return data.detail
        .map((d: any) =>
          typeof d === "string" ? d : d?.message || d?.error || JSON.stringify(d),
        )
        .join("; ");
    }
  }

  return err?.data?.error || err?.data?.detail || err?.message || fallback;
};

const isDev = process.env.NODE_ENV === "development";

export default function PaymentQueueDetailPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  const billId = Number(params?.id);

  const {
    data: invoice,
    isLoading,
    refetch,
  } = useGetVendorBillByIdQuery(billId, { skip: isNaN(billId) });

  const [approveVendorBill, { isLoading: isApproving }] =
    useApproveVendorBillMutation();
  const [rejectVendorBill, { isLoading: isRejecting }] =
    useRejectVendorBillMutation();
  const [submitVendorBill, { isLoading: isSubmitting }] =
    useSubmitVendorBillMutation();
  const [payVendorBill, { isLoading: isPaying }] = usePayVendorBillMutation();

  const [showBankModal, setShowBankModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const [localStatus, setLocalStatus] = useState<string | null>(
    invoice?.status || null,
  );
  const [actionPending, setActionPending] = useState(false);

  const [toast, setToast] = useState<{
    show: boolean;
    message: string;
    type: "success" | "error";
  }>({ show: false, message: "", type: "success" });

  const showToast = (message: string, type: "success" | "error") => {
    setToast({ show: true, message, type });
  };

  const hideToast = () => setToast((prev) => ({ ...prev, show: false }));

  const isActionLoading = isApproving || isRejecting || isPaying || isSubmitting;

  const optimisticUpdate = (newStatus: string) => {
    setActionPending(true);
    setLocalStatus(newStatus);
  };

  const revertStatus = () => {
    if (invoice) setLocalStatus(invoice.status);
    setActionPending(false);
  };

  const finalizeStatusChange = async (newStatus: string, billNumber: string) => {
    setActionPending(false);
    setLocalStatus(newStatus);
    await refetch();
  };

  const handleSubmit = async () => {
    if (!invoice) return;
    const billNumber = invoice.bill_number || String(invoice.id);
    optimisticUpdate("submitted");
    try {
      await submitVendorBill({ id: invoice.id }).unwrap();
      await finalizeStatusChange("submitted", billNumber);
      showToast(`Bill ${billNumber} submitted`, "success");
     } catch (err: any) {
      if (isDev) console.error("[payment-queue] submit failed", err);
      if (err?.status === 409) {
        refetch();
      } else if (err?.status === 403) {
        showToast("You no longer have permission to act on this bill", "error");
      } else {
        revertStatus();
        showToast(extractErrorMessage(err, "Failed to submit bill. Please try again."), "error");
      }
    }
  };

  const handleApprove = async () => {
    if (!invoice) return;
    const billNumber = invoice.bill_number || String(invoice.id);
    optimisticUpdate("approved");
    try {
      await approveVendorBill({ id: invoice.id }).unwrap();
      await finalizeStatusChange("approved", billNumber);
      showToast(`Bill ${billNumber} approved`, "success");
     } catch (err: any) {
      if (isDev) console.error("[payment-queue] approve failed", err);
      if (err?.status === 409) {
        refetch();
      } else if (err?.status === 403) {
        showToast("You no longer have permission to act on this bill", "error");
      } else {
        revertStatus();
        showToast(extractErrorMessage(err, "Failed to approve bill. Please try again."), "error");
      }
    }
  };

  const handleReject = async () => {
    if (!invoice) return;

    const reason = window.prompt(
      "Enter a reason for rejecting this bill (optional):",
    );
    if (reason === null) return;

    const billNumber = invoice.bill_number || String(invoice.id);
    optimisticUpdate("rejected");
    try {
      await rejectVendorBill({
        id: invoice.id,
        data: reason
          ? ({ reason } as unknown as CreateVendorBillRequest)
          : undefined,
      }).unwrap();
      await finalizeStatusChange("rejected", billNumber);
      showToast(`Bill ${billNumber} rejected`, "success");
     } catch (err: any) {
      if (isDev) console.error("[payment-queue] reject failed", err);
      if (err?.status === 409) {
        refetch();
      } else if (err?.status === 403) {
        showToast("You no longer have permission to act on this bill", "error");
      } else {
        revertStatus();
        showToast(extractErrorMessage(err, "Failed to reject bill. Please try again."), "error");
      }
    }
  };

  const handlePayBill = () => setShowBankModal(true);

  const handleConfirmPayment = async (bankId: string) => {
    if (!invoice) return;
    const billNumber = invoice.bill_number || String(invoice.id);
    optimisticUpdate("paid");
    try {
      await payVendorBill({
        id: invoice.id,
        data: {
          amount_paid: invoice.balance || invoice.amount || "0",
          payment_method: bankId,
          notes: "Paid via Payment Queue",
        } as unknown as CreateVendorBillRequest,
      }).unwrap();
      await finalizeStatusChange("paid", billNumber);
      setShowBankModal(false);
      setShowSuccessModal(true);
      showToast(`Bill ${billNumber} paid`, "success");
     } catch (err: any) {
      if (isDev) console.error("[payment-queue] pay failed", err);
      if (err?.status === 409) {
        refetch();
      } else if (err?.status === 403) {
        showToast("You no longer have permission to act on this bill", "error");
      } else {
        revertStatus();
        showToast(extractErrorMessage(err, "Failed to pay bill. Please try again."), "error");
      }
      setShowBankModal(false);
    }
  };

  const handleDone = () => {
    setShowSuccessModal(false);
    router.push("/invoice/payment-queue");
  };

  const currentStatus = (localStatus || invoice?.status || "").toLowerCase();
  const isReadOnlyStatus =
    currentStatus === "rejected" ||
    currentStatus === "cancelled" ||
    currentStatus === "paid";
  const showSubmit = currentStatus === "draft";
  const showApprove = currentStatus === "submitted";
  const showReject =
    currentStatus === "draft" || currentStatus === "submitted";
  const showPay = currentStatus === "approved" || currentStatus === "partial";

  return (
    <div className="p-6 min-h-screen">
      <ToastNotification
        show={toast.show}
        message={toast.message}
        type={toast.type}
        onClose={hideToast}
      />

      <div className="max-w-6xl mx-auto">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-gray-500 mb-6">
          <button
            onClick={() => router.back()}
            className="hover:text-gray-700"
            aria-label="Go back"
          >
            ←
          </button>
          <span>Home</span>
          <span className="text-gray-400">›</span>
          <span>Invoicing</span>
          <span className="text-gray-400">›</span>
          <span className="text-gray-700 font-medium">
            {invoice?.bill_number || "Vendor Bill"}
          </span>
        </div>

        <div className="flex justify-between items-start mb-8">
          <div>
            <h1 className="text-3xl font-semibold">
              {invoice?.bill_number || "Loading..."}
            </h1>
            <p className="text-gray-500 mt-1">
              Vendor Bill #{invoice?.id || "—"}
            </p>
          </div>
        </div>

        {isLoading ? (
          <div className="text-center py-12 text-gray-500">
            Loading invoice...
          </div>
        ) : !invoice ? (
          <div className="text-center py-12 text-gray-500">
            Invoice not found.
          </div>
        ) : (
          <div className="bg-white rounded border p-4 space-y-4">
            {/* Read-only banner */}
            {isReadOnlyStatus && (
              <div
                className={`p-4 rounded-lg border text-sm font-medium capitalize ${
                  currentStatus === "rejected" || currentStatus === "cancelled"
                    ? "bg-red-50 border-red-200 text-red-800"
                    : "bg-green-50 border-green-200 text-green-800"
                }`}
              >
                This bill is {currentStatus}. No further actions are available.
              </div>
            )}

            {/* Info Sections */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div>
                <div className="text-gray-500 text-sm">Request Id</div>
                <div className="font-medium mt-1">
                  {invoice.request_id || "-"}
                </div>
              </div>
              <div>
                <div className="text-gray-500 text-sm">Vendor Bill ID</div>
                <div className="font-medium mt-1">{invoice.bill_number}</div>
              </div>
              <div>
                <div className="text-gray-500 text-sm">Supplier Name</div>
                <div className="font-medium mt-1">
                  {invoice.vendor_name || `-`}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div>
                <div className="text-gray-500 text-sm">Created Date</div>
                <div className="font-medium mt-1">
                  {invoice.invoice_date
                    ? new Date(invoice.invoice_date).toLocaleDateString()
                    : "-"}
                </div>
              </div>
              <div>
                <div className="text-gray-500 text-sm">Due Date</div>
                <div className="font-medium mt-1">
                  {invoice.due_date || "-"}
                </div>
              </div>
              <div>
                <div className="text-gray-500 text-sm">Payment Terms</div>
                <div className="font-medium mt-1">
                  {invoice.payment_term?.toString() || "-"}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <div className="text-gray-500 text-sm mb-1">Status</div>
                <span
                  className={`inline-flex px-4 py-1.5 rounded-full text-sm font-medium capitalize ${
                    statusBadgeStyles[currentStatus] ||
                    "bg-gray-100 text-gray-700"
                  }`}
                >
                  {currentStatus || invoice.status}
                </span>
              </div>
              <div>
                <div className="text-gray-500 text-sm mb-1">Days Until Due</div>
                <div className="font-medium text-orange-600">
                  {getDaysUntilDue(invoice.due_date)} days
                </div>
              </div>
            </div>

            {/* Document */}
            <div>
              <div className="font-medium mb-3">Uploaded Document</div>
              {invoice.document ? (
                <div className="border border-gray-200 rounded-xl p-5 flex gap-4 bg-gray-50 items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="text-4xl">📄</div>
                    <div>
                      <div className="font-medium">Invoice Document</div>
                      <div className="text-sm text-gray-500">
                        Attached to vendor bill
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <a
                      href={invoice.document}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label="View document"
                      className="p-2 text-gray-600 hover:text-blue-700 rounded-lg hover:bg-gray-100 transition-colors"
                      title="View in new tab"
                    >
                      <ExternalLink className="w-5 h-5" />
                    </a>
                    <a
                      href={invoice.document}
                      download
                      aria-label="Download document"
                      className="p-2 text-gray-600 hover:text-blue-700 rounded-lg hover:bg-gray-100 transition-colors"
                      title="Download"
                    >
                      <Download className="w-5 h-5" />
                    </a>
                  </div>
                </div>
              ) : (
                <div className="border border-gray-200 rounded-xl p-5 flex gap-4 bg-gray-50">
                  <div className="text-4xl">📄</div>
                  <div>
                    <div className="font-medium">No document</div>
                    <div className="text-sm text-gray-500">
                      No document attached
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Cost Table */}
            <div>
              <div className="font-medium mb-4">Cost Items</div>
              <table className="w-full border border-gray-200 rounded-2xl overflow-hidden">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-4 text-left">Product / Service</th>
                    <th className="px-6 py-4 text-left">Quantity</th>
                    <th className="px-6 py-4 text-left">Unit Price</th>
                    <th className="px-6 py-4 text-left">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {invoice.lines?.map((item, idx) => (
                    <tr key={idx} className="border-b">
                      <td className="px-6 py-4 font-medium">
                        {item.description || "-"}
                      </td>
                      <td className="px-6 py-4">{item.quantity || "-"}</td>
                      <td className="px-6 py-4">
                        {item.unit_price
                          ? formatCurrency(item.unit_price)
                          : "-"}
                      </td>
                      <td className="px-6 py-4">
                        {item.quantity && item.unit_price
                          ? formatCurrency(
                              Number(item.quantity) * Number(item.unit_price),
                            )
                          : "-"}
                      </td>
                    </tr>
                  ))}
                  {(!invoice.lines || invoice.lines.length === 0) && (
                    <tr className="border-b">
                      <td
                        colSpan={4}
                        className="px-6 py-4 text-center text-gray-500"
                      >
                        No items found
                      </td>
                    </tr>
                  )}
                  <tr className="bg-gray-50 font-semibold">
                    <td className="px-6 py-4" colSpan={3}>
                      Grand Total
                    </td>
                    <td className="px-6 py-4">
                      {formatCurrency(invoice.amount || "0")}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        {!isLoading && invoice && (
          <div className="flex flex-wrap gap-3 justify-end mt-8">
            {!isReadOnlyStatus && (
              <>
                {showSubmit && (
                  <Button
                    variant={"contained"}
                    onClick={handleSubmit}
                    disabled={actionPending || isActionLoading}
                    aria-label="Submit bill"
                  >
                    {isSubmitting || actionPending ? (
                      <span className="flex items-center gap-2">
                        <svg
                          className="animate-spin h-4 w-4"
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                        >
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                          />
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 818 8 8 8 0 01-8-8z"
                          />
                        </svg>
                        Submitting...
                      </span>
                    ) : (
                      "Submit Bill"
                    )}
                  </Button>
                )}
                {showApprove && (
                  <Button
                    variant={"contained"}
                    onClick={handleApprove}
                    disabled={actionPending || isActionLoading}
                    aria-label="Approve bill"
                  >
                    {isApproving || actionPending ? (
                      <span className="flex items-center gap-2">
                        <svg
                          className="animate-spin h-4 w-4"
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                        >
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                          />
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 818 8 8 8 0 01-8-8z"
                          />
                        </svg>
                        Approving...
                      </span>
                    ) : (
                      "Approve Bill"
                    )}
                  </Button>
                )}
                {showReject && (
                  <Button
                    variant={"outline"}
                    onClick={handleReject}
                    disabled={actionPending || isActionLoading}
                    aria-label="Reject bill"
                  >
                    {isRejecting || actionPending
                      ? "Rejecting..."
                      : "Reject Bill"}
                  </Button>
                )}
                {showPay && (
                  <Button
                    variant={"contained"}
                    onClick={handlePayBill}
                    disabled={actionPending || isActionLoading}
                    aria-label="Pay bill"
                  >
                    {isPaying || actionPending ? "Processing..." : "Pay Bill"}
                  </Button>
                )}
              </>
            )}
            <Button
              variant={"outline"}
              onClick={() => router.push("/invoice/payment-queue")}
              disabled={actionPending || isActionLoading}
              aria-label="Back"
            >
              Back
            </Button>
          </div>
        )}

        {/* Modals */}
        <BankSelectModal
          isOpen={showBankModal}
          onClose={() => setShowBankModal(false)}
          onConfirm={handleConfirmPayment}
        />
        <SuccessModal
          isOpen={showSuccessModal}
          onClose={() => setShowSuccessModal(false)}
          onDone={handleDone}
        />
      </div>
    </div>
  );
}
