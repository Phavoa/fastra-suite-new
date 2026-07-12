"use client";

import { useState, useEffect } from "react";
import {
  X,
  ChevronRight,
  ChevronLeft,
  AlertCircle,
  CalendarIcon,
  MapPin,
  InfoIcon,
} from "lucide-react";
import { Input } from "../ui/input";
import PaymentTermsSelect from "../shared/PaymentTermsSelect";

interface Product {
  productName: string;
  unit: string;
  qty: number;
  unitPrice: number;
  total: number;
}

interface Request {
  id: string;
  type: string;
  wbs: string;
  approvalDate: string;
  requestedAmount: number;
  products: Product[];
}

interface ConvertToPOModalProps {
  isOpen: boolean;
  onClose: () => void;
  request: Request | null;
  currentStep: number;
  onNextStep: () => void;
  onBackStep: () => void;
  onIssuePO: () => void;
  formatCurrency: (amount: number) => string;
}

export default function ConvertToPOModal({
  isOpen,
  onClose,
  request,
  currentStep,
  onNextStep,
  onBackStep,
  onIssuePO,
  formatCurrency,
}: ConvertToPOModalProps) {
  const [selectedVendor, setSelectedVendor] = useState("xyz Vendor");
  const [selectedPaymentTerms, setSelectedPaymentTerms] =
    useState("Immediate Payment");
  const [deliveryDate, setDeliveryDate] = useState("");
  const [deliveryAddress, setDeliveryAddress] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setIsVisible(true);
    } else {
      const timer = setTimeout(() => setIsVisible(false), 300);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  if (!isOpen && !isVisible) return null;

  const totalAmount =
    request?.products.reduce((sum, product) => sum + product.total, 0) || 0;

  const handleNext = () => {
    if (!selectedVendor || !selectedPaymentTerms) {
      alert("Please select both vendor and payment terms");
      return;
    }
    if (!deliveryDate) {
      alert("Please select an expected delivery date");
      return;
    }
    if (!deliveryAddress.trim()) {
      alert("Please enter the delivery address");
      return;
    }
    onNextStep();
  };

  const handleIssue = () => {
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      onIssuePO();
    }, 1500);
  };

  const renderStepIndicator = () => (
    <div className="flex items-center gap-4 mb-6">
      <div className="flex items-center gap-2">
        <div
          className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium ${
            currentStep === 1
              ? "bg-blue-600 text-white"
              : "bg-gray-200 text-gray-600"
          }`}
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
      <ChevronRight className="w-4 h-4 text-gray-300" />
      <div className="flex items-center gap-2">
        <div
          className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium ${
            currentStep === 2
              ? "bg-blue-600 text-white"
              : "bg-gray-200 text-gray-600"
          }`}
        >
          2
        </div>
        <span
          className={`text-sm ${
            currentStep === 2 ? "text-gray-900 font-medium" : "text-gray-500"
          }`}
        >
          Confirm & Issue
        </span>
      </div>
    </div>
  );

  const renderStep1 = () => (
    <>
      <div className="space-y-6">
        {/* WBS Element */}
        <div>
          <h3 className="text-sm font-medium text-gray-700 mb-2">
            WBS Element
          </h3>
          <div className="bg-gray-50 rounded-lg px-4 py-3 border border-gray-200">
            <span className="text-sm font-semibold text-gray-900">
              {request?.wbs}
            </span>
          </div>
        </div>

        {/* Products Table */}
        <div>
          <h3 className="text-sm font-medium text-gray-700 mb-2">Products</h3>
          <div className="border border-gray-200 rounded-lg overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-2.5 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Product Name
                  </th>
                  <th className="px-4 py-2.5 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Unit
                  </th>
                  <th className="px-4 py-2.5 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    QTY
                  </th>
                  <th className="px-4 py-2.5 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Unit Price
                  </th>
                  <th className="px-4 py-2.5 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Total
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {request?.products.map((product, index) => (
                  <tr
                    key={index}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    <td className="px-4 py-3 text-sm text-gray-900">
                      {product.productName}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {product.unit}
                    </td>
                    <td className="px-4 py-3 text-sm text-right text-gray-600">
                      {product.qty}
                    </td>
                    <td className="px-4 py-3 text-sm text-right text-gray-600">
                      {product.unitPrice.toLocaleString()}
                    </td>
                    <td className="px-4 py-3 text-sm text-right text-gray-900">
                      {product.total.toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="bg-gray-50 border-t border-gray-200">
                <tr>
                  <td
                    colSpan={4}
                    className="px-4 py-3 text-sm font-medium text-gray-900 text-right"
                  >
                    Total:
                  </td>
                  <td className="px-4 py-3 text-sm font-bold text-gray-900 text-right">
                    {totalAmount.toLocaleString()}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>

        {/* Vendor, Payment Terms, Expected Delivery Date and Delivery Full Address */}
        <div className="space-y-4">
          <div>
            <h3 className="text-sm font-medium text-gray-700 mb-2">Vendor</h3>
            <select
              name="vendor"
              title="vendor"
              value={selectedVendor}
              onChange={(e) => setSelectedVendor(e.target.value)}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm bg-white"
            >
              <option value="Select Vendor">Select Vendor</option>
              <option value="xyz Vendor">xyz Vendor</option>
              <option value="ABC Construction">ABC Construction</option>
              <option value="DEF Supplies">DEF Supplies</option>
            </select>
          </div>
          <div>
            <h3 className="text-sm font-medium text-gray-700 mb-2">
              Payment Terms
            </h3>
            <PaymentTermsSelect
              value={selectedPaymentTerms}
              onChange={setSelectedPaymentTerms}
              placeholder="Select payment terms"
            />
          </div>
          <div>
            <h3 className="text-sm font-medium text-gray-700 mb-2">
              Expected Delivery Date
            </h3>
            <div className="relative">
              <Input
                type="date"
                value={deliveryDate}
                onChange={(e) => setDeliveryDate(e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm bg-white"
                min={new Date().toISOString().split("T")[0]}
              />
              <CalendarIcon className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 pointer-events-none" />
            </div>
          </div>
          <div>
            <h3 className="text-sm font-medium text-gray-700 mb-2">
              Delivery Full Address
            </h3>
            <div className="relative">
              <textarea
                value={deliveryAddress}
                onChange={(e) => setDeliveryAddress(e.target.value)}
                placeholder="Enter complete delivery address"
                rows={3}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm bg-white resize-none"
              />
              <MapPin className="absolute right-3 top-3 text-gray-400 w-4 h-4 pointer-events-none" />
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="flex flex-col-reverse sm:flex-row items-center justify-between gap-3 pt-6 border-t border-gray-200 mt-6">
        <button
          onClick={onClose}
          className="w-full sm:w-auto px-6 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium"
        >
          Cancel
        </button>
        <button
          onClick={handleNext}
          className="w-full sm:w-auto px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium flex items-center justify-center gap-2"
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
        {/* Notice Box */}
        <div className="bg-amber-50 border border-amber-200 rounded px-4 py-3 flex items-start gap-2">
          <InfoIcon className="w-4 h-4 text-amber-800 mt-0.5 shrink-0" />
          <p className="text-sm text-amber-800">
            Once issued, this Purchase Order will be sent to{" "}
            <strong>{selectedVendor}</strong>. The Committed Amount of{" "}
            <strong>N{totalAmount.toLocaleString()}</strong> will be locked
            against <strong>{request?.wbs}</strong> until payment is confirmed
            or the PO is cancelled.
          </p>
        </div>

        {/* Summary Grid - 3 columns */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-gray-50 rounded-lg px-4 py-3 border border-gray-200">
            <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">
              Vendor
            </p>
            <p className="text-sm font-medium text-gray-900">
              {selectedVendor}
            </p>
          </div>
          <div className="bg-gray-50 rounded-lg px-4 py-3 border border-gray-200">
            <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">
              WBS Element
            </p>
            <p className="text-sm font-medium text-gray-900">{request?.wbs}</p>
          </div>
          <div className="bg-gray-50 rounded-lg px-4 py-3 border border-gray-200">
            <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">
              Originating Request
            </p>
            <p className="text-sm font-medium text-gray-900">{request?.id}</p>
          </div>
          <div className="bg-gray-50 rounded-lg px-4 py-3 border border-gray-200">
            <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">
              Request Type
            </p>
            <p className="text-sm font-medium text-gray-900">{request?.type}</p>
          </div>
          <div className="bg-gray-50 rounded-lg px-4 py-3 border border-gray-200">
            <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">
              Payment Terms
            </p>
            <p className="text-sm font-medium text-gray-900">
              {selectedPaymentTerms}
            </p>
          </div>
          <div className="bg-gray-50 rounded-lg px-4 py-3 border border-gray-200">
            <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">
              Expected Delivery Date
            </p>
            <p className="text-sm font-medium text-gray-900">
              {deliveryDate
                ? new Date(deliveryDate).toLocaleDateString("en-NG", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })
                : "Not specified"}
            </p>
          </div>
          <div className="bg-gray-50 rounded-lg px-4 py-3 border border-gray-200 col-span-1 sm:col-span-3">
            <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">
              Delivery Address
            </p>
            <p className="text-sm font-medium text-gray-900">
              {deliveryAddress || "Not specified"}
            </p>
          </div>
        </div>

        {/* Products Table */}
        <div>
          <h3 className="text-sm font-medium text-gray-700 mb-2">Products</h3>
          <div className="border border-gray-200 rounded-lg overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-2.5 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Product Name
                  </th>
                  <th className="px-4 py-2.5 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Unit
                  </th>
                  <th className="px-4 py-2.5 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    QTY
                  </th>
                  <th className="px-4 py-2.5 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Unit Price
                  </th>
                  <th className="px-4 py-2.5 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Total
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {request?.products.map((product, index) => (
                  <tr
                    key={index}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    <td className="px-4 py-3 text-sm text-gray-900">
                      {product.productName}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {product.unit}
                    </td>
                    <td className="px-4 py-3 text-sm text-right text-gray-600">
                      {product.qty}
                    </td>
                    <td className="px-4 py-3 text-sm text-right text-gray-600">
                      {product.unitPrice.toLocaleString()}
                    </td>
                    <td className="px-4 py-3 text-sm text-right text-gray-900">
                      {product.total.toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="bg-gray-50 border-t border-gray-200">
                <tr>
                  <td
                    colSpan={4}
                    className="px-4 py-3 text-sm font-medium text-gray-900 text-right"
                  >
                    Total:
                  </td>
                  <td className="px-4 py-3 text-sm font-bold text-gray-900 text-right">
                    {totalAmount.toLocaleString()}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="flex flex-col-reverse sm:flex-row items-center justify-between gap-3 pt-6 border-t border-gray-200 mt-6">
        <button
          onClick={onBackStep}
          className="w-full sm:w-auto px-6 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium"
        >
          Back
        </button>
        <button
          onClick={handleIssue}
          disabled={isSubmitting}
          className="w-full sm:w-auto px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? (
            <>
              <svg
                className="animate-spin h-4 w-4 text-white"
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
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
              Processing...
            </>
          ) : (
            "Issue Purchase Order"
          )}
        </button>
      </div>
    </>
  );

  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 bg-black/50 transition-opacity duration-300 z-50 ${
          isOpen ? "opacity-100" : "opacity-0"
        }`}
        onClick={onClose}
      />

      {/* Modal */}
      <div
        className={`fixed inset-0 z-50 flex items-center justify-center p-4 transition-all duration-300 ${
          isOpen ? "opacity-100 scale-100" : "opacity-0 scale-95"
        }`}
      >
        <div className="bg-white rounded-xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl">
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 shrink-0">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">
                Convert to Purchase Order
              </h2>
              <p className="text-sm text-gray-500 mt-0.5">
                Originating Request: {request?.id}
              </p>
            </div>
            <button
              type="button"
              aria-label="Close"
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors text-gray-400 hover:text-gray-600"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto px-6 py-4">
            {renderStepIndicator()}
            {currentStep === 1 ? renderStep1() : renderStep2()}
          </div>
        </div>
      </div>
    </>
  );
}
