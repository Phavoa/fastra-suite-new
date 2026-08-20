"use client";

import { useState, useEffect, useRef } from "react";
import { X, Loader2, InfoIcon } from "lucide-react";
import { useGetApprovedProjectRequestDetailsQuery } from "@/api/invoice/approvedProjectRequestsApi";

interface ConvertToInvoiceLabourReqModalProps {
  isOpen: boolean;
  onClose: () => void;
  request: any;
  onConfirm: () => void;
  formatCurrency?: (amount: number) => string;
}

function Truncate({ text, max = 48 }: { text: string; max?: number }) {
  if (!text) return <span>—</span>;
  return (
    <span title={text.length > max ? text : undefined}>
      {text.length > max ? `${text.slice(0, max)}…` : text}
    </span>
  );
}

export default function ConvertToInvoiceLabourReqModal({
  isOpen,
  onClose,
  request,
  onConfirm,
  formatCurrency = (n) =>
    new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: "NGN",
      maximumFractionDigits: 0,
    }).format(n),
}: ConvertToInvoiceLabourReqModalProps) {
  const [isVisible, setIsVisible] = useState(false);
  const primaryRef = useRef<HTMLButtonElement>(null);

  const requestId = (() => {
    if (request?.backendId) return Number(request.backendId);
    if (request?.sourceId) return Number(request.sourceId);
    const m = String(request?.id || "").match(/(\d+)$/);
    return m ? Number(m[1]) : undefined;
  })();

  const {
    data: details,
    isLoading,
    isError,
  } = useGetApprovedProjectRequestDetailsQuery(requestId as number, {
    skip: !isOpen || !requestId,
  });

  useEffect(() => {
    if (isOpen) {
      setIsVisible(true);
      setTimeout(() => primaryRef.current?.focus(), 100);
    } else {
      const t = setTimeout(() => setIsVisible(false), 300);
      return () => clearTimeout(t);
    }
  }, [isOpen]);

  if (!isOpen && !isVisible) return null;

  const refId = details?.project_request?.reference_id || request?.id || "—";
  const wbs = details
    ? `${details.project_details?.name || "—"} › ${details.phase_details?.name || "—"} › ${details.activity_details?.name || "—"}`
    : request?.wbs || "—";
  const projectName =
    details?.project_details?.name || request?.projectName || "—";
  const roleType = details?.role_type || "—";
  const workers = details?.number_of_workers ?? "—";
  const duration = details
    ? `${details.duration ?? "—"} ${details.duration_unit || ""}`.trim()
    : "—";
  const projectedCost =
    Number(details?.projected_cost) || request?.requestedAmount || 0;
  const dailyRate = Number(details?.estimated_daily_rate) || 0;
  const requester = details?.created_by_name || "—";
  const dateRequired = details?.date_required?.slice(0, 10) || "—";

  const Info = ({ label, value }: { label: string; value: string }) => (
    <div className="bg-gray-50 rounded-lg px-4 py-3 border border-gray-200">
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
        onClick={onClose}
        aria-hidden
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="labour-convert-title"
        className={`fixed inset-0 z-50 flex items-center justify-center p-4 transition-all duration-300 ${
          isOpen ? "opacity-100 scale-100" : "opacity-0 scale-95"
        }`}
      >
        <div className="bg-white rounded-xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl">
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 shrink-0">
            <div>
              <h2
                id="labour-convert-title"
                className="text-xl font-semibold text-gray-900"
              >
                Create Vendor Bill
              </h2>
              <p className="text-sm text-gray-500 mt-0.5">
                Originating Request: <Truncate text={refId} max={28} />
              </p>
            </div>
            <button
              type="button"
              aria-label="Close"
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg text-gray-400 hover:text-gray-600"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto px-6 py-4">
            <div className="bg-blue-50 border border-blue-100 rounded-lg px-4 py-3 flex gap-2 mb-6">
              <InfoIcon className="w-4 h-4 text-blue-700 mt-0.5 shrink-0" />
              <p className="text-sm text-blue-800">
                Labour is paid as a <strong>direct vendor bill</strong> (no PO).
                Review the approved request, then create the bill.
              </p>
            </div>

            {isLoading ? (
              <div className="flex items-center justify-center py-16 gap-2 text-sm text-gray-500">
                <Loader2 className="w-5 h-5 animate-spin" />
                Loading labour details…
              </div>
            ) : isError ? (
              <div className="border border-red-200 bg-red-50 rounded-lg p-4 text-sm text-red-700">
                Failed to load details. You can still continue with list data.
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Info label="Request ID" value={refId} />
                <Info label="Role / Trade" value={roleType} />
                <Info label="Project" value={projectName} />
                <Info label="WBS Element" value={wbs} />
                <Info label="Workers" value={String(workers)} />
                <Info label="Duration" value={duration} />
                <Info label="Daily Rate" value={formatCurrency(dailyRate)} />
                <Info
                  label="Projected Cost"
                  value={formatCurrency(projectedCost)}
                />
                <Info label="Date Required" value={dateRequired} />
                <Info label="Requested By" value={requester} />
                <Info label="Request Type" value="Labour Request" />
                <Info label="Payment Terms" value="One-time payment" />
              </div>
            )}
          </div>

          <div className="flex flex-col-reverse sm:flex-row items-center justify-between gap-3 px-6 py-4 border-t border-gray-200 shrink-0">
            <button
              type="button"
              onClick={onClose}
              className="w-full sm:w-auto px-6 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 text-sm font-medium"
            >
              Cancel
            </button>
            <button
              ref={primaryRef}
              type="button"
              onClick={onConfirm}
              disabled={isLoading}
              className="w-full sm:w-auto px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium disabled:opacity-50"
            >
              Create Bill
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
