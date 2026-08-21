"use client";

import { useState, useEffect, useRef } from "react";
import {
  X,
  Upload,
  File,
  Trash2,
  Loader2,
  AlertTriangle,
  InfoIcon,
} from "lucide-react";
import { useGetApprovedProjectRequestDetailsQuery } from "@/api/invoice/approvedProjectRequestsApi";
import { useGetCompanyBankAccountsQuery } from "@/api/invoice/companyBankAccountsApi";
import { ToastNotification } from "@/components/shared/ToastNotification";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  request: any;
  onSubmit: (payload: {
    source_id: number;
    company_bank_account_id: number;
    invoice_amount: number;
    discrepancy_acknowledged: boolean;
    document?: File | null;
  }) => void | Promise<void>;
  formatCurrency: (amount: number) => string;
  isSubmitting?: boolean;
}

function Truncate({ text, max = 40 }: { text: string; max?: number }) {
  if (!text) return <span>—</span>;
  return (
    <span title={text.length > max ? text : undefined}>
      {text.length > max ? `${text.slice(0, max)}…` : text}
    </span>
  );
}

export default function CreateVendorBillLabourReqModal({
  isOpen,
  onClose,
  request,
  onSubmit,
  formatCurrency,
  isSubmitting = false,
}: Props) {
  const [isVisible, setIsVisible] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [invoiceAmount, setInvoiceAmount] = useState("");
  const [bankAccountId, setBankAccountId] = useState("");
  const [discrepancyAck, setDiscrepancyAck] = useState(false);
  const [toast, setToast] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const requestId = (() => {
    if (request?.backendId) return Number(request.backendId);
    if (request?.sourceId) return Number(request.sourceId);
    const m = String(request?.id || "").match(/(\d+)$/);
    return m ? Number(m[1]) : undefined;
  })();

  const { data: details, isLoading: isDetailsLoading } =
    useGetApprovedProjectRequestDetailsQuery(requestId as number, {
      skip: !isOpen || !requestId,
    });

  const { data: bankAccountsResponse, isLoading: isBanksLoading } =
    useGetCompanyBankAccountsQuery(undefined, { skip: !isOpen });

  const bankAccounts = Array.isArray(bankAccountsResponse)
    ? bankAccountsResponse.filter((b) => b.is_active)
    : [];

  const projectedCost =
    Number(details?.projected_cost) || Number(request?.requestedAmount) || 0;

  useEffect(() => {
    if (isOpen) {
      setIsVisible(true);
      if (projectedCost && !invoiceAmount) {
        setInvoiceAmount(String(projectedCost));
      }
    } else {
      const t = setTimeout(() => setIsVisible(false), 300);
      return () => clearTimeout(t);
    }
  }, [isOpen, projectedCost, invoiceAmount]);

  useEffect(() => {
    if (!isOpen) {
      setUploadedFile(null);
      setInvoiceAmount("");
      setBankAccountId("");
      setDiscrepancyAck(false);
      setToast(null);
    }
  }, [isOpen]);

  if (!isOpen && !isVisible) return null;

  const refId = details?.project_request?.reference_id || request?.id || "—";
  const wbs = details
    ? `${details.project_details?.name || "—"} › ${details.phase_details?.name || "—"} › ${details.activity_details?.name || "—"}`
    : request?.wbs || "—";
  const projectName = details?.project_details?.name || "—";
  const roleType = details?.role_type || "—";
  const supplierName = details?.created_by_name || request?.supplierName || "—";

  const invoiceNum = Number(invoiceAmount) || 0;
  const hasDiscrepancy =
    projectedCost > 0 && Math.abs(invoiceNum - projectedCost) > 0.01;

  const showToast = (type: "success" | "error", message: string) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 4500);
  };

  const handleFile = (file: File) => {
    const ok =
      ["application/pdf", "image/png", "image/jpeg", "image/jpg"].includes(
        file.type,
      ) || /\.(pdf|png|jpe?g)$/i.test(file.name);
    if (!ok) {
      showToast("error", "Only PDF, PNG, or JPG files are allowed");
      return;
    }
    if (file.size > 20 * 1024 * 1024) {
      showToast("error", "File must be under 20 MB");
      return;
    }
    setUploadedFile(file);
  };

  const handleSubmit = async () => {
    if (!requestId && !details?.id) {
      showToast("error", "Invalid request");
      return;
    }
    if (!bankAccountId) {
      showToast("error", "Please select a company bank account");
      return;
    }
    if (!invoiceAmount || invoiceNum <= 0) {
      showToast("error", "Please enter a valid invoice amount");
      return;
    }
    if (hasDiscrepancy && !discrepancyAck) {
      showToast(
        "error",
        "Invoice amount differs from approved cost. Please acknowledge the discrepancy",
      );
      return;
    }

    const payload = {
      source_id: Number(details?.id ?? requestId),
      company_bank_account_id: Number(bankAccountId),
      invoice_amount: invoiceNum,
      discrepancy_acknowledged: hasDiscrepancy ? discrepancyAck : false,
      document: uploadedFile,
    };

    console.log("Labour Vendor Bill payload →", payload);

    try {
      await onSubmit(payload);
    } catch (e) {
      console.error(e);
    }
  };

  const Info = ({ label, value }: { label: string; value: string }) => (
    <div className="rounded-lg px-4 py-3 border border-gray-200 bg-gray-50">
      <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">
        {label}
      </p>
      <p className="text-sm font-medium text-gray-900">
        <Truncate text={value} />
      </p>
    </div>
  );

  return (
    <>
      <div
        className={`fixed inset-0 bg-black/50 transition-opacity duration-300 z-50 ${
          isOpen ? "opacity-100" : "opacity-0"
        }`}
        onClick={isSubmitting ? undefined : onClose}
        aria-hidden
      />
      <div
        role="dialog"
        aria-modal="true"
        className={`fixed inset-0 z-50 flex items-center justify-center p-4 transition-all duration-300 ${
          isOpen ? "opacity-100 scale-100" : "opacity-0 scale-95"
        }`}
      >
        <div className="bg-white rounded-xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl">
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 shrink-0">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">
                Submit Vendor Bill
              </h2>
              <p className="text-sm text-gray-500 mt-0.5">
                Originating Request: <Truncate text={refId} max={28} />
              </p>
            </div>
            <button
              type="button"
              aria-label="Close"
              onClick={onClose}
              disabled={isSubmitting}
              className="p-2 hover:bg-gray-100 rounded-lg text-gray-400 hover:text-gray-600 disabled:opacity-50"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto px-6 py-4 space-y-6">
            {isDetailsLoading ? (
              <div className="flex justify-center py-12 gap-2 text-sm text-gray-500">
                <Loader2 className="w-5 h-5 animate-spin" /> Loading…
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <Info label="Request ID" value={refId} />
                  <Info label="Supplier / Requester" value={supplierName} />
                  <Info label="Role / Trade" value={roleType} />
                  <Info label="Project" value={projectName} />
                  <Info label="WBS Element" value={wbs} />
                  <Info label="Request Type" value="Labour Request" />
                </div>

                {/* Optional upload — PRD: never blocks submission */}
                <div>
                  <h3 className="text-sm font-medium text-gray-700 mb-1">
                    Supplier Invoice / Timesheet (optional)
                  </h3>
                  <p className="text-xs text-gray-500 mb-3">
                    PDF or image up to 20 MB. Upload does not block submission.
                  </p>
                  {!uploadedFile ? (
                    <div
                      className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
                        isDragging
                          ? "border-blue-500 bg-blue-50"
                          : "border-gray-300 hover:border-gray-400"
                      }`}
                      onDragOver={(e) => {
                        e.preventDefault();
                        setIsDragging(true);
                      }}
                      onDragLeave={() => setIsDragging(false)}
                      onDrop={(e) => {
                        e.preventDefault();
                        setIsDragging(false);
                        const f = e.dataTransfer.files[0];
                        if (f) handleFile(f);
                      }}
                      onClick={() => fileInputRef.current?.click()}
                    >
                      <Upload className="w-8 h-8 text-gray-400 mx-auto mb-3" />
                      <p className="text-sm text-gray-600">
                        Drop document here or{" "}
                        <span className="text-blue-600 font-medium">
                          browse
                        </span>
                      </p>
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept=".pdf,.png,.jpg,.jpeg"
                        className="hidden"
                        onChange={(e) => {
                          const f = e.target.files?.[0];
                          if (f) handleFile(f);
                        }}
                      />
                    </div>
                  ) : (
                    <div className="border border-gray-200 rounded-lg p-4 flex items-center justify-between bg-gray-50">
                      <div className="flex items-center gap-3 min-w-0">
                        <File className="w-8 h-8 text-blue-600 shrink-0" />
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">
                            {uploadedFile.name}
                          </p>
                          <p className="text-xs text-gray-500">
                            {(uploadedFile.size / (1024 * 1024)).toFixed(1)} MB
                          </p>
                        </div>
                      </div>
                      <button
                        type="button"
                        aria-label="Remove file"
                        onClick={() => {
                          setUploadedFile(null);
                          if (fileInputRef.current)
                            fileInputRef.current.value = "";
                        }}
                        className="p-1.5 hover:bg-gray-200 rounded-lg text-gray-400 hover:text-red-600"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>

                {/* Cost + discrepancy */}
                <div>
                  <h3 className="text-sm font-medium text-gray-700 mb-3">
                    Cost
                  </h3>
                  <div className="border border-gray-200 rounded-lg overflow-hidden">
                    <table className="w-full">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-4 py-2.5 text-left text-xs font-medium text-gray-500 uppercase">
                            Description
                          </th>
                          <th className="px-4 py-2.5 text-right text-xs font-medium text-gray-500 uppercase">
                            Approved projected cost
                          </th>
                          <th className="px-4 py-2.5 text-right text-xs font-medium text-gray-500 uppercase">
                            Invoice amount
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr>
                          <td className="px-4 py-3 text-sm text-gray-900">
                            {roleType}
                          </td>
                          <td className="px-4 py-3 text-sm text-right text-gray-900">
                            {formatCurrency(projectedCost)}
                          </td>
                          <td className="px-4 py-3 text-sm text-right">
                            <input
                              type="number"
                              min={0}
                              step="0.01"
                              value={invoiceAmount}
                              onChange={(e) => {
                                setInvoiceAmount(e.target.value);
                                setDiscrepancyAck(false);
                              }}
                              disabled={isSubmitting}
                              className="w-32 ml-auto block px-2 py-1.5 border border-gray-200 rounded text-right text-sm focus:ring-2 focus:ring-blue-500"
                            />
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>

                  {hasDiscrepancy && (
                    <div className="mt-3 bg-amber-50 border border-amber-200 rounded-lg px-4 py-3 flex gap-2">
                      <AlertTriangle className="w-4 h-4 text-amber-700 mt-0.5 shrink-0" />
                      <div className="text-sm text-amber-900">
                        <p className="font-medium mb-1">
                          Amount differs from approved projected cost (
                          {formatCurrency(projectedCost)} vs{" "}
                          {formatCurrency(invoiceNum)})
                        </p>
                        <label className="flex items-start gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={discrepancyAck}
                            onChange={(e) =>
                              setDiscrepancyAck(e.target.checked)
                            }
                            className="mt-0.5 rounded border-gray-300 text-blue-600"
                          />
                          <span>
                            I acknowledge this discrepancy and wish to submit
                            anyway.
                          </span>
                        </label>
                      </div>
                    </div>
                  )}
                </div>

                {/* Company bank account — required */}
                <div>
                  <h3 className="text-sm font-medium text-gray-700 mb-1">
                    Company Bank Account
                  </h3>
                  <p className="text-xs text-gray-500 mb-3">
                    Account the payment will go out from (required before
                    submit).
                  </p>
                  {isBanksLoading ? (
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <Loader2 className="w-4 h-4 animate-spin" /> Loading
                      accounts…
                    </div>
                  ) : bankAccounts.length === 0 ? (
                    <div className="text-sm text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-4 py-3">
                      No active company bank accounts found. Add one under
                      Invoice settings before submitting.
                    </div>
                  ) : (
                    <select
                      value={bankAccountId}
                      onChange={(e) => setBankAccountId(e.target.value)}
                      disabled={isSubmitting}
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm bg-white focus:ring-2 focus:ring-blue-500 disabled:opacity-60"
                    >
                      <option value="">Select bank account</option>
                      {bankAccounts.map((b) => (
                        <option key={b.id} value={b.id}>
                          {b.bank_name} — {b.account_name} (
                          {b.account_number_display || b.account_number})
                        </option>
                      ))}
                    </select>
                  )}
                </div>

                <div className="bg-blue-50 border border-blue-100 rounded-lg px-4 py-3 flex gap-2">
                  <InfoIcon className="w-4 h-4 text-blue-700 mt-0.5 shrink-0" />
                  <p className="text-sm text-blue-800">
                    After submit, the bill enters the{" "}
                    <strong>Payment Queue</strong>. Only a user with Payer
                    permission can complete payment.
                  </p>
                </div>
              </>
            )}
          </div>

          <div className="flex flex-col-reverse sm:flex-row items-center justify-end gap-3 px-6 py-4 border-t border-gray-200 shrink-0">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="w-full sm:w-auto px-6 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 text-sm font-medium disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              disabled={
                isSubmitting || isDetailsLoading || bankAccounts.length === 0
              }
              className="w-full sm:w-auto px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" /> Submitting…
                </>
              ) : (
                "Submit Vendor Bill"
              )}
            </button>
          </div>
        </div>
      </div>

      {toast && (
        <div className="fixed bottom-6 right-6 z-[60] max-w-sm">
          <ToastNotification
            show={true}
            type={toast.type}
            message={toast.message}
            onClose={() => setToast(null)}
          />
        </div>
      )}
    </>
  );
}
