"use client";

import { useState, useEffect } from "react";
import { X } from "lucide-react";

interface ConvertToInvoicePettyCashModalProps {
  isOpen: boolean;
  onClose: () => void;
  request: any;
  onConfirm: () => void;
  formatCurrency: (amount: number) => string;
}

export default function ConvertToInvoicePettyCashModal({
  isOpen,
  onClose,
  request,
  onConfirm,
  formatCurrency,
}: ConvertToInvoicePettyCashModalProps) {
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

  // Mock data for display
  const data = {
    pettyCashId: "PET-2024-0041",
    amountRequested: 600000,
    requesterName: "John Doe",
    date: "2024-04-08",
    purpose:
      "There will be a short description of the purpose of the request here",
    wbs: "WBS-1.3.1 - Concrete Works",
    projectName: "Concrete Works",
    requestType: "Petty Cash Request",
  };

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
        <div className="bg-white rounded-xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl">
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 shrink-0">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">
                Convert to Invoice
              </h2>
              <p className="text-sm text-gray-500 mt-0.5">
                Originating Request: {request?.id || "REQ-2024-0041"}
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
            <div className="space-y-4">
              {/* Petty Cash Request ID */}
              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-2">
                  Petty Cash Request ID
                </h3>
                <div className="bg-gray-50 rounded-lg px-4 py-3 border border-gray-200">
                  <span className="text-sm font-medium text-gray-900">
                    {data.pettyCashId}
                  </span>
                </div>
              </div>

              {/* Amount Requested */}
              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-2">
                  Amount Requested
                </h3>
                <div className="bg-gray-50 rounded-lg px-4 py-3 border border-gray-200">
                  <span className="text-sm font-medium text-gray-900">
                    {formatCurrency(data.amountRequested)}
                  </span>
                </div>
              </div>

              {/* Request Type */}
              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-2">
                  Request type
                </h3>
                <div className="bg-gray-50 rounded-lg px-4 py-3 border border-gray-200">
                  <span className="text-sm font-medium text-gray-900">
                    {data.requestType}
                  </span>
                </div>
              </div>

              {/* Requester Name */}
              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-2">
                  Requester Name
                </h3>
                <div className="bg-gray-50 rounded-lg px-4 py-3 border border-gray-200">
                  <span className="text-sm font-medium text-gray-900">
                    {data.requesterName}
                  </span>
                </div>
              </div>

              {/* Date */}
              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-2">Date</h3>
                <div className="bg-gray-50 rounded-lg px-4 py-3 border border-gray-200">
                  <span className="text-sm font-medium text-gray-900">
                    {data.date}
                  </span>
                </div>
              </div>

              {/* Purpose */}
              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-2">
                  Purpose
                </h3>
                <div className="bg-gray-50 rounded-lg px-4 py-3 border border-gray-200">
                  <span className="text-sm font-medium text-gray-900">
                    {data.purpose}
                  </span>
                </div>
              </div>

              {/* WBS Element */}
              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-2">
                  WBS Element
                </h3>
                <div className="bg-gray-50 rounded-lg px-4 py-3 border border-gray-200">
                  <span className="text-sm font-medium text-gray-900">
                    {data.wbs}
                  </span>
                </div>
              </div>

              {/* Project Name */}
              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-2">
                  Project Name
                </h3>
                <div className="bg-gray-50 rounded-lg px-4 py-3 border border-gray-200">
                  <span className="text-sm font-medium text-gray-900">
                    {data.projectName}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="flex flex-col-reverse sm:flex-row items-center justify-between gap-3 px-6 py-4 border-t border-gray-200 shrink-0">
            <button
              onClick={onClose}
              className="w-full sm:w-auto px-6 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium"
            >
              Cancel
            </button>
            <button
              onClick={onConfirm}
              className="w-full sm:w-auto px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium flex items-center justify-center"
            >
              Create Bill
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
