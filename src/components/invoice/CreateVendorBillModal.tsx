"use client";

import { useState, useRef } from "react";
import {
  X,
  Upload,
  File,
  Trash2,
  ChevronRight,
  AlertCircle,
} from "lucide-react";

interface Product {
  description: string;
  unit: string;
  qty: number;
  unitPrice: number;
  total: number;
}

interface CreateVendorBillModalProps {
  isOpen: boolean;
  onClose: () => void;
  poId: string;
  products: Product[];
  formatCurrency: (amount: number) => string;
}

export default function CreateVendorBillModal({
  isOpen,
  onClose,
  poId,
  products,
  formatCurrency,
}: CreateVendorBillModalProps) {
  const [invoiceQuantities, setInvoiceQuantities] = useState<number[]>(
    products.map(() => 0),
  );
  const [invoiceUnitPrices, setInvoiceUnitPrices] = useState<number[]>(
    products.map(() => 0),
  );
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

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

  const updateInvoiceQty = (index: number, value: string) => {
    const newQuantities = [...invoiceQuantities];
    newQuantities[index] = value === "" ? 0 : Number(value);
    setInvoiceQuantities(newQuantities);
  };

  const updateInvoicePrice = (index: number, value: string) => {
    const newPrices = [...invoiceUnitPrices];
    newPrices[index] = value === "" ? 0 : Number(value);
    setInvoiceUnitPrices(newPrices);
  };

  const getInvoiceTotal = (index: number) => {
    return invoiceQuantities[index] * invoiceUnitPrices[index];
  };

  const getTotalInvoiceAmount = () => {
    return products.reduce((sum, _, index) => sum + getInvoiceTotal(index), 0);
  };

  const getTotalPOAmount = () => {
    return products.reduce((sum, product) => sum + product.total, 0);
  };

  const handleSubmit = () => {
    // Validate file upload
    if (!uploadedFile) {
      alert("Please upload the vendor invoice document");
      return;
    }

    // Validate all invoice quantities and prices are filled
    const hasEmptyFields = products.some(
      (_, index) =>
        invoiceQuantities[index] === 0 || invoiceUnitPrices[index] === 0,
    );
    if (hasEmptyFields) {
      alert("Please fill in all invoice quantities and unit prices");
      return;
    }

    alert("Vendor bill submitted successfully!");
    onClose();
  };

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/50 z-50" onClick={onClose} />

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-xl w-full max-w-5xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl">
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 shrink-0">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">
                Create Vendor Bill
              </h2>
              <p className="text-sm text-gray-500 mt-0.5">
                PO-{poId} • Originating Request: REQ-2024-0041
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
            {/* Upload Section */}
            <div className="mb-6">
              <h3 className="text-sm font-medium text-gray-700 mb-2">
                Upload Vendor Invoice Document
              </h3>
              <p className="text-xs text-gray-500 mb-3">
                PDF or image required. Stored permanently as audit evidence
                against this invoice record.
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

            {/* Confirm Prices Button */}
            <div className="flex justify-end mb-6">
              <button className="px-4 py-2 text-sm font-medium text-blue-600 hover:text-blue-700 transition-colors">
                Confirm Prices
              </button>
            </div>

            {/* Products Table */}
            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-2">
                Products
              </h3>
              <div className="border border-gray-200 rounded-lg overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-2.5 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-30">
                          Description
                        </th>
                        <th className="px-4 py-2.5 text-right text-xs font-medium text-gray-500 uppercase tracking-wider min-w-20">
                          PO Qty
                        </th>
                        <th className="px-4 py-2.5 text-right text-xs font-medium text-gray-500 uppercase tracking-wider min-w-25">
                          Invoice Qty
                        </th>
                        <th className="px-4 py-2.5 text-right text-xs font-medium text-gray-500 uppercase tracking-wider min-w-25">
                          PO Unit Price
                        </th>
                        <th className="px-4 py-2.5 text-right text-xs font-medium text-gray-500 uppercase tracking-wider min-w-25">
                          Invoice Unit Price
                        </th>
                        <th className="px-4 py-2.5 text-right text-xs font-medium text-gray-500 uppercase tracking-wider min-w-25">
                          PO Total Price
                        </th>
                        <th className="px-4 py-2.5 text-right text-xs font-medium text-gray-500 uppercase tracking-wider min-w-25">
                          Invoice Total Price
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {products.map((product, index) => (
                        <tr
                          key={index}
                          className="hover:bg-gray-50 transition-colors"
                        >
                          <td className="px-4 py-3 text-sm text-gray-900">
                            {product.description}
                          </td>
                          <td className="px-4 py-3 text-sm text-right text-gray-600">
                            {product.qty}
                          </td>
                          <td className="px-4 py-3 text-right">
                            <input
                              type="number"
                              min="0"
                              step="1"
                              value={invoiceQuantities[index] || ""}
                              onChange={(e) =>
                                updateInvoiceQty(index, e.target.value)
                              }
                              className="w-20 px-2 py-1 text-right text-sm border border-gray-200 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                              placeholder="0"
                            />
                          </td>
                          <td className="px-4 py-3 text-sm text-right text-gray-600">
                            {formatCurrency(product.unitPrice)}
                          </td>
                          <td className="px-4 py-3 text-right">
                            <input
                              type="number"
                              min="0"
                              step="1000"
                              value={invoiceUnitPrices[index] || ""}
                              onChange={(e) =>
                                updateInvoicePrice(index, e.target.value)
                              }
                              className="w-28 px-2 py-1 text-right text-sm border border-gray-200 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                              placeholder="0"
                            />
                          </td>
                          <td className="px-4 py-3 text-sm text-right font-semibold text-gray-900">
                            {formatCurrency(product.total)}
                          </td>
                          <td className="px-4 py-3 text-sm text-right font-semibold text-gray-900">
                            {formatCurrency(getInvoiceTotal(index))}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot className="bg-gray-50 border-t border-gray-200">
                      <tr>
                        <td
                          colSpan={5}
                          className="px-4 py-3 text-sm font-semibold text-gray-900 text-right"
                        >
                          Total
                        </td>
                        <td className="px-4 py-3 text-sm font-bold text-gray-900 text-right">
                          {formatCurrency(getTotalPOAmount())}
                        </td>
                        <td className="px-4 py-3 text-sm font-bold text-gray-900 text-right">
                          {formatCurrency(getTotalInvoiceAmount())}
                        </td>
                      </tr>
                    </tfoot>
                  </table>
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
              onClick={handleSubmit}
              className="w-full sm:w-auto px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium flex items-center justify-center gap-2"
            >
              Submit Vendor Bill
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
