"use client";

import { useState, useRef } from "react";
import { X, Upload, File, Trash2, ChevronRight, AlertCircle } from "lucide-react";

import { useCreateVendorBillMutation } from "@/api/invoice/invoicesApi";
import { useGetCompanyBankAccountsQuery } from "@/api/invoice/companyBankAccountsApi";
import { CompanyBankAccount } from "@/api/invoice/companyBankAccountsApi";
import { PurchaseOrderLine } from "@/api/invoice/projectPurchaseOrdersApi";
import { ToastNotification } from "@/components/shared/ToastNotification";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface CreateVendorBillModalProps {
  isOpen: boolean;
  onClose: () => void;
  poId: number;
  poNumber: string;
  vendorId: number;
  paymentTerm: number | null;
  products: PurchaseOrderLine[];
  formatCurrency: (amount: number) => string;
  onCreated?: () => void;
}

export default function CreateVendorBillModal({
  isOpen,
  onClose,
  poId,
  poNumber,
  vendorId,
  paymentTerm,
  products,
  formatCurrency,
  onCreated,
}: CreateVendorBillModalProps) {
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [companyBankAccount, setCompanyBankAccount] = useState<number | null>(
    null,
  );
  const [toast, setToast] = useState<{
    show: boolean;
    message: string;
    type: "success" | "error";
  }>({ show: false, message: "", type: "success" });
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { data: bankAccounts } = useGetCompanyBankAccountsQuery();
  const [createVendorBill, { isLoading: isSubmitting }] =
    useCreateVendorBillMutation();

  const activeBankAccounts =
    bankAccounts?.filter((account: CompanyBankAccount) => account.is_active) ||
    [];

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

  const showToast = (message: string, type: "success" | "error") => {
    setToast({ show: true, message, type });
  };

  const handleSubmit = async () => {
    if (!uploadedFile) {
      showToast("Please upload the vendor invoice document", "error");
      return;
    }

    if (!companyBankAccount) {
      showToast("Please select a company bank account", "error");
      return;
    }

    if (!products.length) {
      showToast("Please select at least one product line", "error");
      return;
    }

    if (!paymentTerm) {
      showToast("Payment term is missing for this purchase order", "error");
      return;
    }

    const invoiceDate = new Date().toISOString().split("T")[0];

    const formData = new FormData();
    formData.append("source_type", "PROJECT_PO");
    formData.append("project_purchase_order", String(poId));
    formData.append("vendor", String(vendorId));
    formData.append("invoice_date", invoiceDate);
    formData.append("payment_term", String(paymentTerm));
    formData.append("company_bank_account", String(companyBankAccount));
    formData.append("document", uploadedFile);
    formData.append(
      "lines",
      JSON.stringify(
        products.map((line) => ({
          project_purchase_order_line: line.id,
          description: line.item_name || line.description,
        })),
      ),
    );

    try {
      await createVendorBill(formData).unwrap();
      showToast("Vendor bill created successfully!", "success");
      onCreated?.();
      setTimeout(() => {
        onClose();
      }, 1200);
    } catch (err: any) {
      showToast(
        err?.data?.error || err?.data?.detail || "Failed to create vendor bill.",
        "error",
      );
      console.error(err);
    }
  };

  if (!isOpen) return null;

  return (
    <>
      <ToastNotification
        show={toast.show}
        message={toast.message}
        type={toast.type}
        onClose={() => setToast((prev) => ({ ...prev, show: false }))}
      />

      <div className="fixed inset-0 bg-black/50 z-50" onClick={onClose} />

      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-xl w-full max-w-5xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl">
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 shrink-0">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">
                Create Vendor Bill
              </h2>
              <p className="text-sm text-gray-500 mt-0.5">
                PO-{poNumber} • Originating Request: REQ-2024-0041
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

          <div className="flex-1 overflow-y-auto px-6 py-4">
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

            <div className="mb-6">
              <h3 className="text-sm font-medium text-gray-700 mb-2">
                Select Company Bank Account
              </h3>
              <p className="text-xs text-gray-500 mb-3">
                Choose the company bank account this vendor bill will be paid
                from.
              </p>
              <Select
                value={companyBankAccount ? String(companyBankAccount) : ""}
                onValueChange={(value) =>
                  setCompanyBankAccount(Number(value))
                }
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select company bank account" />
                </SelectTrigger>
                <SelectContent>
                  {activeBankAccounts.length === 0 ? (
                    <SelectItem value="none" disabled>
                      No active bank accounts
                    </SelectItem>
                  ) : (
                    activeBankAccounts.map((account) => (
                      <SelectItem
                        key={account.id}
                        value={String(account.id)}
                      >
                        {account.bank_name} • {account.account_number_display}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>

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
                          PO Unit Price
                        </th>
                        <th className="px-4 py-2.5 text-right text-xs font-medium text-gray-500 uppercase tracking-wider min-w-25">
                          PO Total Price
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
                            {product.item_name || product.description}
                          </td>
                          <td className="px-4 py-3 text-sm text-right text-gray-600">
                            {product.qty}
                          </td>
                          <td className="px-4 py-3 text-sm text-right text-gray-600">
                            {formatCurrency(Number(product.unit_price || 0))}
                          </td>
                          <td className="px-4 py-3 text-sm text-right font-semibold text-gray-900">
                            {formatCurrency(Number(product.line_total || 0))}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot className="bg-gray-50 border-t border-gray-200">
                      <tr>
                        <td
                          colSpan={3}
                          className="px-4 py-3 text-sm font-semibold text-gray-900 text-right"
                        >
                          Total
                        </td>
                        <td className="px-4 py-3 text-sm font-bold text-gray-900 text-right">
                          {formatCurrency(
                            products.reduce(
                              (sum, p) => sum + Number(p.line_total || 0),
                              0,
                            ),
                          )}
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-col-reverse sm:flex-row items-center justify-between gap-3 px-6 py-4 border-t border-gray-200 shrink-0">
            <button
              onClick={onClose}
              className="w-full sm:w-auto px-6 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="w-full sm:w-auto px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isSubmitting ? "Submitting..." : "Submit Vendor Bill"}
              {!isSubmitting && <ChevronRight className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
