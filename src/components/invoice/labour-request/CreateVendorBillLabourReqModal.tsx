"use client";

import { useState, useEffect, useRef } from "react";
import { X, Upload, File, Trash2, ChevronLeft, CreditCard } from "lucide-react";

interface CreateVendorBillModalProps {
  isOpen: boolean;
  onClose: () => void;
  request: any;
  onSubmit: () => void;
  formatCurrency: (amount: number) => string;
}

export default function CreateVendorBillModal({
  isOpen,
  onClose,
  request,
  onSubmit,
  formatCurrency,
}: CreateVendorBillModalProps) {
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Mock data for the bill
  const billData = {
    invId: "INV-2024-0018",
    vendorBillId: "VEN-2024-0041",
    approvedProjectedCost: 600000,
    invoiceAmount: 600000,
  };

  useEffect(() => {
    if (isOpen) {
      setIsVisible(true);
    } else {
      const timer = setTimeout(() => setIsVisible(false), 300);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  if (!isOpen && !isVisible) return null;

  const handleFileUpload = (file: File) => {
    setUploadedFile(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFileUpload(file);
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFileUpload(file);
  };

  const removeFile = () => {
    setUploadedFile(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleSubmit = () => {
    if (!uploadedFile) {
      alert("Please upload the supplier invoice or timesheet document");
      return;
    }
    onSubmit();
  };

  // Get data from request or use defaults
  const data = {
    requestId: request?.id || "REQ-2024-0041",
    supplierName: request?.supplierName || "John Doe",
    projectName: request?.projectName || "Concrete Works",
    wbs: request?.wbs || "WBS-1.3.1 - Concrete Works",
    paymentTerms: request?.paymentTerms || "One time payment",
    requestType: request?.type || "Labor Request",
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
        <div className="bg-white rounded-xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl">
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 shrink-0">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">
                {billData.invId}
              </h2>
              <p className="text-sm text-gray-500 mt-0.5">
                Originating Request: {data.requestId}
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
            {/* Info Grid - Row 1 */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
              <div className="rounded px-4 py-3 border border-gray-200">
                <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">
                  Request ID
                </p>
                <p className="text-sm font-medium text-gray-900">
                  {data.requestId}
                </p>
              </div>
              <div className="rounded px-4 py-3 border border-gray-200">
                <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">
                  Vendor Bill ID
                </p>
                <p className="text-sm font-medium text-gray-900">
                  {billData.vendorBillId}
                </p>
              </div>
              <div className="rounded px-4 py-3 border border-gray-200">
                <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">
                  Supplier Name
                </p>
                <p className="text-sm font-medium text-gray-900">
                  {data.supplierName}
                </p>
              </div>
            </div>

            {/* Info Grid - Row 2 */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
              <div className="rounded px-4 py-3 border border-gray-200">
                <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">
                  Project Name
                </p>
                <p className="text-sm font-medium text-gray-900">
                  {data.projectName}
                </p>
              </div>
              <div className="rounded px-4 py-3 border border-gray-200">
                <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">
                  WBS Element
                </p>
                <p className="text-sm font-medium text-gray-900">{data.wbs}</p>
              </div>
              <div className="rounded px-4 py-3 border border-gray-200">
                <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">
                  Payment Terms
                </p>
                <p className="text-sm font-medium text-gray-900">
                  {data.paymentTerms}
                </p>
              </div>
            </div>

            {/* Request Type */}
            <div className="mb-6">
              <div className="rounded px-4 py-3 border border-gray-200 inline-block">
                <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">
                  Request type
                </p>
                <p className="text-sm font-medium text-gray-900">
                  {data.requestType}
                </p>
              </div>
            </div>

            {/* Upload Section */}
            <div className="mb-6">
              <h3 className="text-sm font-medium text-gray-700 mb-2">
                Upload Supplier Invoice or Timesheet Document
              </h3>
              <p className="text-xs text-gray-500 mb-3">
                Upload the labor invoice or timesheet document from the supplier
                as a PDF or image.
              </p>

              {!uploadedFile ? (
                <div
                  className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                    isDragging
                      ? "border-blue-500 bg-blue-50"
                      : "border-gray-300 hover:border-gray-400"
                  }`}
                  onDragOver={(e) => {
                    e.preventDefault();
                    setIsDragging(true);
                  }}
                  onDragLeave={() => setIsDragging(false)}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Upload className="w-8 h-8 text-gray-400 mx-auto mb-3" />
                  <p className="text-sm text-gray-600">
                    Drop your invoice document here
                  </p>
                  <p className="text-sm text-blue-600 font-medium mt-1">
                    or click to browse files
                  </p>
                  <p className="text-xs text-gray-400 mt-2">
                    PDF, PNG, JPG up to 20 MB
                  </p>
                  <input
                    id="file-input"
                    name="file"
                    aria-label="upload file"
                    ref={fileInputRef}
                    type="file"
                    accept=".pdf,.png,.jpg,.jpeg"
                    onChange={handleFileInput}
                    className="hidden"
                  />
                </div>
              ) : (
                <div className="border border-gray-200 rounded-lg p-4 flex items-center justify-between bg-gray-50">
                  <div className="flex items-center gap-3">
                    <File className="w-8 h-8 text-blue-600" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {uploadedFile.name}
                      </p>
                      <p className="text-xs text-gray-500">
                        {(uploadedFile.size / (1024 * 1024)).toFixed(1)} MB
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    aria-label="remove file"
                    onClick={removeFile}
                    className="p-1.5 hover:bg-gray-200 rounded-lg transition-colors text-gray-400 hover:text-red-600"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>

            {/* Cost Table */}
            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-3">Cost</h3>
              <div className="border border-gray-200 rounded-lg overflow-hidden">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-2.5 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Vendor Bill ID
                      </th>
                      <th className="px-4 py-2.5 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Approved Projected Cost
                      </th>
                      <th className="px-4 py-2.5 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Invoice Amount
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    <tr className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3 text-sm font-medium text-gray-900">
                        BILL
                      </td>
                      <td className="px-4 py-3 text-sm text-right text-gray-900">
                        {formatCurrency(billData.approvedProjectedCost)}
                      </td>
                      <td className="px-4 py-3 text-sm text-right text-gray-900">
                        {formatCurrency(billData.invoiceAmount)}
                      </td>
                    </tr>
                  </tbody>
                  <tfoot className="bg-gray-50 border-t border-gray-200">
                    <tr>
                      <td className="px-4 py-3 text-sm font-semibold text-gray-900">
                        Total
                      </td>
                      <td className="px-4 py-3 text-sm font-bold text-gray-900 text-right">
                        {formatCurrency(billData.approvedProjectedCost)}
                      </td>
                      <td className="px-4 py-3 text-sm font-bold text-gray-900 text-right">
                        {formatCurrency(billData.invoiceAmount)}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="flex flex-col-reverse sm:flex-row items-center justify-between gap-3 px-6 py-4 border-t border-gray-200 shrink-0">
            <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
              <button
                onClick={onClose}
                className="w-full sm:w-auto px-6 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium"
              >
                Cancel
              </button>
              <button className="w-full sm:w-auto px-6 py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium flex items-center justify-center gap-2">
                <CreditCard className="w-4 h-4" />
                Make Payment
              </button>
            </div>
            <button
              onClick={handleSubmit}
              className="w-full sm:w-auto px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium flex items-center justify-center"
            >
              Submit Vendor Bill
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
