"use client";

import { useState, useEffect, useRef } from "react";
import {
  X,
  ChevronRight,
  ChevronLeft,
  CalendarIcon,
  InfoIcon,
  Loader2,
  Wrench,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import PaymentTermsSelect from "@/components/shared/PaymentTermsSelect";
import { useGetVendorsQuery } from "@/api/invoice/vendorsApi";
import { useGetActiveCurrenciesQuery } from "@/api/invoice/invoiceCurrencyApi";
import { useGetApprovedProjectRequestDetailsQuery } from "@/api/invoice/approvedProjectRequestsApi";
import { ToastNotification } from "@/components/shared/ToastNotification";

interface Request {
  id: string;
  backendId?: number | string;
  sourceId?: number | string;
  type?: string;
  originalType?: string;
  [key: string]: any;
}

interface ConvertToPOPlantEquipmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  request: Request | null;
  currentStep: number;
  onNextStep: () => void;
  onBackStep: () => void;
  onIssuePO: (payload: {
    vendor: number;
    payment_term: number | null;
    expected_delivery_date: string;
    currency: number;
    source_id: number;
    source_type: string;
  }) => Promise<void>;
  formatCurrency: (amount: number) => string;
  isIssuing?: boolean;
}

function TruncateWithTooltip({
  text,
  maxLength = 40,
  className = "",
}: {
  text: string;
  maxLength?: number;
  className?: string;
}) {
  if (!text) return <span className={className}>—</span>;
  const needsTruncate = text.length > maxLength;
  const display = needsTruncate ? `${text.slice(0, maxLength)}…` : text;

  return (
    <span
      className={`relative group cursor-default ${className}`}
      title={needsTruncate ? text : undefined}
    >
      {display}
      {needsTruncate && (
        <span
          role="tooltip"
          className="pointer-events-none absolute left-0 top-full z-50 mt-1 hidden max-w-xs rounded-md bg-gray-900 px-2.5 py-1.5 text-xs text-white shadow-lg group-hover:block"
        >
          {text}
        </span>
      )}
    </span>
  );
}

function formatLabel(value?: string | null) {
  if (!value) return "—";
  return value.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

export default function ConvertToPOPlantEquipmentModal({
  isOpen,
  onClose,
  request,
  currentStep,
  onNextStep,
  onBackStep,
  onIssuePO,
  formatCurrency,
  isIssuing = false,
}: ConvertToPOPlantEquipmentModalProps) {
  const { data: vendorsResponse } = useGetVendorsQuery({});
  const vendors = Array.isArray(vendorsResponse)
    ? vendorsResponse
    : (vendorsResponse as any)?.results || [];

  const { data: activeCurrenciesResponse } = useGetActiveCurrenciesQuery();
  const activeCurrencies = Array.isArray(activeCurrenciesResponse)
    ? activeCurrenciesResponse
    : (activeCurrenciesResponse as any)?.results || [];
  const defaultCurrencyId =
    activeCurrencies.length > 0 ? activeCurrencies[0].id : 1;

  const requestId = (() => {
    if (request?.backendId) return Number(request.backendId);
    if (request?.sourceId) return Number(request.sourceId);
    const match = String(request?.id || "").match(/(\d+)$/);
    return match ? Number(match[1]) : undefined;
  })();

  const {
    data: detailsData,
    isLoading: isDetailsLoading,
    isError: isDetailsError,
  } = useGetApprovedProjectRequestDetailsQuery(requestId as number, {
    skip: !isOpen || !requestId,
  });

  const [selectedVendor, setSelectedVendor] = useState("");
  const [selectedPaymentTerms, setSelectedPaymentTerms] = useState("");
  const [deliveryDate, setDeliveryDate] = useState("");
  const [isVisible, setIsVisible] = useState(false);
  const [toast, setToast] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  const primaryButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (isOpen) {
      setIsVisible(true);
      setTimeout(() => primaryButtonRef.current?.focus(), 100);
    } else {
      const timer = setTimeout(() => setIsVisible(false), 300);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  // Prefill delivery date from required_date when details load
  useEffect(() => {
    if (detailsData?.required_date && !deliveryDate) {
      setDeliveryDate(detailsData.required_date.slice(0, 10));
    }
  }, [detailsData, deliveryDate]);

  useEffect(() => {
    if (!isOpen) {
      setSelectedVendor("");
      setSelectedPaymentTerms("");
      setDeliveryDate("");
      setToast(null);
    }
  }, [isOpen]);

  if (!isOpen && !isVisible) return null;

  // ---------- Derived ----------
  const equipmentName = detailsData?.equipment_name || "—";
  const description = detailsData?.description || "—";
  const quantity = detailsData?.quantity ?? 0;
  const estimatedCost = Number(detailsData?.estimated_cost) || 0;
  const paymentType = (detailsData?.payment_type || "purchase").toLowerCase();
  const isHire = paymentType === "hire";
  const expectedReturnDate = detailsData?.expected_return_date
    ? detailsData.expected_return_date.slice(0, 10)
    : null;
  const requiredDate = detailsData?.required_date
    ? detailsData.required_date.slice(0, 10)
    : "—";
  const justification = detailsData?.justification_notes || "";
  const availableBudget = detailsData?.available_budget
    ? Number(detailsData.available_budget)
    : null;

  const wbsLabel = detailsData
    ? `${detailsData.project_details?.name || "—"} › ${detailsData.phase_details?.name || "—"} › ${detailsData.activity_details?.name || "—"}`
    : "—";

  const referenceId =
    detailsData?.project_request?.reference_id ||
    detailsData?.reference_id ||
    request?.id ||
    "—";

  const vendorObj = vendors.find(
    (v: any) => v.id.toString() === selectedVendor,
  );
  const displayVendorName = vendorObj
    ? vendorObj.vendor_name
    : selectedVendor || "Not selected";

  const showToast = (type: "success" | "error", message: string) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 4500);
  };

  const handleNext = () => {
    if (!selectedVendor) {
      showToast("error", "Please select a vendor");
      return;
    }
    if (!selectedPaymentTerms) {
      showToast("error", "Please select payment terms");
      return;
    }
    if (!deliveryDate) {
      showToast("error", "Please select an expected delivery date");
      return;
    }
    onNextStep();
  };

  const handleConvert = async () => {
    const sourceId = detailsData?.id ?? requestId;

    if (!sourceId) {
      showToast("error", "Unable to determine request ID. Please try again.");
      return;
    }

    const payload = {
      vendor: Number(selectedVendor),
      payment_term: selectedPaymentTerms ? Number(selectedPaymentTerms) : null,
      expected_delivery_date: deliveryDate,
      currency: defaultCurrencyId,
      source_id: Number(sourceId),
      source_type: "plant_and_equipment",
    };

    console.log("Convert Plant & Equipment to PO – final payload →", payload);

    try {
      await onIssuePO(payload);
    } catch (err) {
      console.error("Convert Plant & Equipment to PO failed:", err);
    }
  };

  // ---------- UI ----------
  const renderStepIndicator = () => (
    <div className="flex items-center gap-4 mb-6" aria-label="Progress">
      <div className="flex items-center gap-2">
        <div
          className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium ${
            currentStep === 1
              ? "bg-blue-600 text-white"
              : "bg-gray-200 text-gray-600"
          }`}
          aria-current={currentStep === 1 ? "step" : undefined}
        >
          1
        </div>
        <span
          className={`text-sm ${
            currentStep === 1 ? "text-gray-900 font-medium" : "text-gray-500"
          }`}
        >
          Review Details
        </span>
      </div>
      <ChevronRight className="w-4 h-4 text-gray-300" aria-hidden />
      <div className="flex items-center gap-2">
        <div
          className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium ${
            currentStep === 2
              ? "bg-blue-600 text-white"
              : "bg-gray-200 text-gray-600"
          }`}
          aria-current={currentStep === 2 ? "step" : undefined}
        >
          2
        </div>
        <span
          className={`text-sm ${
            currentStep === 2 ? "text-gray-900 font-medium" : "text-gray-500"
          }`}
        >
          Confirm & Convert
        </span>
      </div>
    </div>
  );

  const InfoCard = ({ label, value }: { label: string; value: string }) => (
    <div className="rounded-lg px-4 py-3 border border-gray-200 bg-gray-50">
      <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">
        {label}
      </p>
      <p className="text-sm font-medium text-gray-900">
        <TruncateWithTooltip text={value} maxLength={42} />
      </p>
    </div>
  );

  const renderStep1 = () => (
    <>
      <div className="space-y-6">
        {isDetailsLoading ? (
          <div className="flex items-center justify-center py-16 gap-2 text-sm text-gray-500">
            <Loader2 className="w-5 h-5 animate-spin" />
            Loading equipment details…
          </div>
        ) : isDetailsError ? (
          <div className="border border-red-200 bg-red-50 rounded-lg p-4 text-sm text-red-700">
            Failed to load details. Please close and try again.
          </div>
        ) : (
          <>
            {/* Equipment summary banner */}
            <div className="flex items-start gap-3 rounded-lg border border-blue-100 bg-blue-50 px-4 py-3">
              <Wrench className="w-5 h-5 text-blue-600 mt-0.5 shrink-0" />
              <div>
                <p className="text-sm font-semibold text-blue-900">
                  {equipmentName}
                </p>
                <p className="text-xs text-blue-700 mt-0.5">
                  {description !== equipmentName
                    ? description
                    : "Plant & Equipment Request"}
                  {" · "}
                  Qty: {quantity}
                  {" · "}
                  {formatLabel(paymentType)}
                  {isHire && expectedReturnDate
                    ? ` · Return by ${expectedReturnDate}`
                    : ""}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              <InfoCard label="Equipment Name" value={equipmentName} />
              <InfoCard label="Description" value={description} />
              <InfoCard label="Quantity" value={String(quantity)} />
              <InfoCard
                label="Estimated Cost"
                value={formatCurrency(estimatedCost)}
              />
              <InfoCard label="Payment Type" value={formatLabel(paymentType)} />
              <InfoCard label="Required Date" value={requiredDate} />
              {isHire && (
                <InfoCard
                  label="Expected Return Date"
                  value={expectedReturnDate || "Not set"}
                />
              )}
              <InfoCard label="WBS Element" value={wbsLabel} />
              {availableBudget !== null && (
                <InfoCard
                  label="Available Budget"
                  value={formatCurrency(availableBudget)}
                />
              )}
            </div>

            {justification && (
              <div className="rounded-lg px-4 py-3 border border-gray-200 bg-gray-50">
                <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">
                  Justification Notes
                </p>
                <p className="text-sm text-gray-900">{justification}</p>
              </div>
            )}

            {/* Form fields */}
            <div className="space-y-4 pt-2">
              <div>
                <label
                  htmlFor="pe-vendor"
                  className="text-sm font-medium text-gray-700 mb-2 block"
                >
                  Vendor
                </label>
                <select
                  id="pe-vendor"
                  value={selectedVendor}
                  onChange={(e) => setSelectedVendor(e.target.value)}
                  disabled={isIssuing}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm bg-white disabled:opacity-60"
                >
                  <option value="">Select Vendor</option>
                  {vendors.map((vendor: any) => (
                    <option key={vendor.id} value={vendor.id.toString()}>
                      {vendor.vendor_name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">
                  Payment Terms
                </label>
                <PaymentTermsSelect
                  value={selectedPaymentTerms}
                  onChange={setSelectedPaymentTerms}
                  placeholder="Select payment terms"
                />
              </div>

              <div>
                <label
                  htmlFor="pe-delivery-date"
                  className="text-sm font-medium text-gray-700 mb-2 block"
                >
                  Expected Delivery Date
                </label>
                <div className="relative">
                  <Input
                    id="pe-delivery-date"
                    type="date"
                    value={deliveryDate}
                    onChange={(e) => setDeliveryDate(e.target.value)}
                    disabled={isIssuing}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm bg-white"
                    min={new Date().toISOString().split("T")[0]}
                  />
                  <CalendarIcon className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4 pointer-events-none" />
                </div>
              </div>
            </div>
          </>
        )}
      </div>

      <div className="flex flex-col-reverse sm:flex-row items-center justify-between gap-3 pt-6 border-t border-gray-200 mt-6">
        <button
          type="button"
          onClick={onClose}
          disabled={isIssuing}
          className="w-full sm:w-auto px-6 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium disabled:opacity-50"
        >
          Cancel
        </button>
        <button
          ref={primaryButtonRef}
          type="button"
          onClick={handleNext}
          disabled={isIssuing || isDetailsLoading || isDetailsError}
          className="w-full sm:w-auto px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Review & Confirm
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </>
  );

  const renderStep2 = () => (
    <>
      <div className="space-y-6">
        <div className="bg-amber-50 border border-amber-200 rounded-lg px-4 py-3 flex items-start gap-2">
          <InfoIcon className="w-4 h-4 text-amber-800 mt-0.5 shrink-0" />
          <p className="text-sm text-amber-800">
            Once converted, this Purchase Order will be sent to{" "}
            <strong>
              <TruncateWithTooltip text={displayVendorName} maxLength={28} />
            </strong>
            . The Committed Amount of{" "}
            <strong>{formatCurrency(estimatedCost)}</strong> will be locked
            against{" "}
            <strong>
              <TruncateWithTooltip text={wbsLabel} maxLength={36} />
            </strong>
            {isHire
              ? ". A hire tracking record will be created automatically when the PO is issued."
              : " until payment is confirmed or the PO is cancelled."}
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <InfoCard label="Vendor" value={displayVendorName} />
          <InfoCard label="Equipment Name" value={equipmentName} />
          <InfoCard
            label="Estimated Cost"
            value={formatCurrency(estimatedCost)}
          />
          <InfoCard label="Quantity" value={String(quantity)} />
          <InfoCard label="Payment Type" value={formatLabel(paymentType)} />
          <InfoCard label="WBS Element" value={wbsLabel} />
          <InfoCard
            label="Expected Delivery Date"
            value={
              deliveryDate
                ? new Date(deliveryDate).toLocaleDateString("en-NG", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })
                : "Not specified"
            }
          />
          {isHire && (
            <InfoCard
              label="Expected Return Date"
              value={expectedReturnDate || "Not set"}
            />
          )}
          <InfoCard label="Originating Request" value={referenceId} />
        </div>
      </div>

      <div className="flex flex-col-reverse sm:flex-row items-center justify-between gap-3 pt-6 border-t border-gray-200 mt-6">
        <button
          type="button"
          onClick={onBackStep}
          disabled={isIssuing}
          className="w-full sm:w-auto px-6 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium disabled:opacity-50"
        >
          <span className="flex items-center gap-1">
            <ChevronLeft className="w-4 h-4" />
            Back
          </span>
        </button>
        <button
          ref={primaryButtonRef}
          type="button"
          onClick={handleConvert}
          disabled={isIssuing}
          aria-busy={isIssuing}
          className="w-full sm:w-auto px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isIssuing ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Converting to PO…
            </>
          ) : (
            "Convert to PO"
          )}
        </button>
      </div>
    </>
  );

  return (
    <>
      <div
        className={`fixed inset-0 bg-black/50 transition-opacity duration-300 z-50 ${
          isOpen ? "opacity-100" : "opacity-0"
        }`}
        onClick={isIssuing ? undefined : onClose}
        aria-hidden="true"
      />

      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="convert-pe-po-title"
        className={`fixed inset-0 z-50 flex items-center justify-center p-4 transition-all duration-300 ${
          isOpen ? "opacity-100 scale-100" : "opacity-0 scale-95"
        }`}
      >
        <div className="bg-white rounded-xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl">
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 shrink-0">
            <div>
              <h2
                id="convert-pe-po-title"
                className="text-xl font-semibold text-gray-900"
              >
                Convert to Purchase Order
              </h2>
              <p className="text-sm text-gray-500 mt-0.5">
                Originating Request:{" "}
                <TruncateWithTooltip text={referenceId} maxLength={30} />
                {isHire && (
                  <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800">
                    Hire
                  </span>
                )}
              </p>
            </div>
            <button
              type="button"
              aria-label="Close modal"
              onClick={onClose}
              disabled={isIssuing}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors text-gray-400 hover:text-gray-600 disabled:opacity-50"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto px-6 py-4">
            {renderStepIndicator()}
            {currentStep === 1 ? renderStep1() : renderStep2()}
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
