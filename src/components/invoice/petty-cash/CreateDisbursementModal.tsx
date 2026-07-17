"use client";

import { useState, useEffect } from "react";
import { X, ChevronDown, Building, User, CreditCard } from "lucide-react";

interface CreateDisbursementModalProps {
  isOpen: boolean;
  onClose: () => void;
  request: any;
  onSubmit: () => void;
  formatCurrency: (amount: number) => string;
}

export default function CreateDisbursementModal({
  isOpen,
  onClose,
  request,
  onSubmit,
  formatCurrency,
}: CreateDisbursementModalProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [disbursementMethod, setDisbursementMethod] = useState("Bank Transfer");
  const [bankAccount, setBankAccount] = useState("");
  const [bankName, setBankName] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [bank, setBank] = useState("");

  useEffect(() => {
    if (isOpen) {
      setIsVisible(true);
    } else {
      const timer = setTimeout(() => setIsVisible(false), 300);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  if (!isOpen && !isVisible) return null;

  // Mock data
  const data = {
    invId: "INV-2024-0018",
    pettyCashId: "PET-2024-0041",
    wbs: "WBS-1.3.1 – Concrete Works",
    requesterName: "John Doe",
    projectName: "Concrete Works",
    accountType: "Expenses",
    requestType: "Petty Cash Request",
    amountApproved: 600000,
    purpose:
      "There will be a short description of the purpose of the request here",
  };

  const handleSubmit = () => {
    if (!bankAccount) {
      alert("Please select a company bank account");
      return;
    }
    if (disbursementMethod === "Bank Transfer") {
      if (!bankName || !accountNumber || !bank) {
        alert("Please fill in all recipient bank account details");
        return;
      }
    }
    onSubmit();
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
                {data.invId}
              </h2>
              <p className="text-sm text-gray-500 mt-0.5">
                Originating Request: {request?.id || "REQ-2024-0041"}
              </p>
            </div>
            <button
              onClick={onClose}
              type="button"
              aria-label="Close"
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors text-gray-400 hover:text-gray-600"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto px-6 py-4">
            {/* Info Grid - Row 1 */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
              <div className="bg-gray-50 rounded-lg px-4 py-3 border border-gray-200">
                <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">
                  Petty Cash Request ID
                </p>
                <p className="text-sm font-medium text-gray-900">
                  {data.pettyCashId}
                </p>
              </div>
              <div className="bg-gray-50 rounded-lg px-4 py-3 border border-gray-200">
                <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">
                  WBS Element
                </p>
                <p className="text-sm font-medium text-gray-900">{data.wbs}</p>
              </div>
              <div className="bg-gray-50 rounded-lg px-4 py-3 border border-gray-200">
                <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">
                  Requestor Name
                </p>
                <p className="text-sm font-medium text-gray-900">
                  {data.requesterName}
                </p>
              </div>
            </div>

            {/* Info Grid - Row 2 */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
              <div className="bg-gray-50 rounded-lg px-4 py-3 border border-gray-200">
                <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">
                  Project Name
                </p>
                <p className="text-sm font-medium text-gray-900">
                  {data.projectName}
                </p>
              </div>
              <div className="bg-gray-50 rounded-lg px-4 py-3 border border-gray-200">
                <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">
                  Account Type
                </p>
                <p className="text-sm font-medium text-gray-900">
                  {data.accountType}
                </p>
              </div>
              <div className="bg-gray-50 rounded-lg px-4 py-3 border border-gray-200">
                <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">
                  Request type
                </p>
                <p className="text-sm font-medium text-gray-900">
                  {data.requestType}
                </p>
              </div>
            </div>

            {/* Amount Approved */}
            <div className="mb-4">
              <div className="bg-gray-50 rounded-lg px-4 py-3 border border-gray-200 inline-block">
                <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">
                  Amount Approved
                </p>
                <p className="text-sm font-bold text-gray-900">
                  {formatCurrency(data.amountApproved)}
                </p>
              </div>
            </div>

            {/* Purpose */}
            <div className="mb-6">
              <div className="bg-gray-50 rounded-lg px-4 py-3 border border-gray-200">
                <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">
                  Purpose
                </p>
                <p className="text-sm font-medium text-gray-900">
                  {data.purpose}
                </p>
              </div>
            </div>

            {/* Company Bank Account */}
            <div className="mb-6">
              <h3 className="text-sm font-medium text-gray-700 mb-2">
                Company Bank Account
              </h3>
              <p className="text-xs text-gray-500 mb-3">
                Selects the company bank account the disbursement is going out
                from
              </p>
              <select
                id="bank-account-select"
                aria-label="Select Company Bank Account"
                value={bankAccount}
                onChange={(e) => setBankAccount(e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm bg-white"
              >
                <option value="">Select Bank Account</option>
                <option value="GTB-001">GT Bank - 0123456789</option>
                <option value="FBN-001">First Bank - 9876543210</option>
                <option value="UBA-001">UBA - 4567890123</option>
              </select>
            </div>

            {/* Recipients Bank Account */}
            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-2">
                Recipients Bank Account
              </h3>
              <p className="text-xs text-gray-500 mb-3">
                Enter the recipient bank account details
              </p>

              <div className="space-y-4">
                {/* Disbursement Method */}
                <div>
                  <label className="block text-xs text-gray-500 uppercase tracking-wider mb-1">
                    Disbursement Method
                  </label>
                  <select
                    aria-label="Disbursement method"
                    value={disbursementMethod}
                    onChange={(e) => setDisbursementMethod(e.target.value)}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm bg-white"
                  >
                    <option value="Bank Transfer">Bank Transfer</option>
                    <option value="Cash Disbursement">Cash Disbursement</option>
                  </select>
                </div>

                {disbursementMethod === "Bank Transfer" && (
                  <>
                    <div>
                      <label className="block text-xs text-gray-500 uppercase tracking-wider mb-1">
                        Bank Name
                      </label>
                      <input
                        type="text"
                        value={bankName}
                        onChange={(e) => setBankName(e.target.value)}
                        placeholder="Enter Bank Name"
                        className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm bg-white"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-500 uppercase tracking-wider mb-1">
                        Bank Account Number
                      </label>
                      <input
                        type="text"
                        value={accountNumber}
                        onChange={(e) => setAccountNumber(e.target.value)}
                        placeholder="Enter Bank Account Number"
                        className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm bg-white"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-500 uppercase tracking-wider mb-1">
                        Bank
                      </label>
                      <select
                        aria-label="Bank"
                        value={bank}
                        onChange={(e) => setBank(e.target.value)}
                        className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm bg-white"
                      >
                        <option value="">Select Bank</option>
                        <option value="GT Bank">GT Bank</option>
                        <option value="First Bank">First Bank</option>
                        <option value="UBA">UBA</option>
                        <option value="Access Bank">Access Bank</option>
                        <option value="Zenith Bank">Zenith Bank</option>
                      </select>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="flex flex-col-reverse sm:flex-row items-center justify-end gap-3 px-6 py-4 border-t border-gray-200 shrink-0">
            <button
              onClick={onClose}
              className="w-full sm:w-auto px-6 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              className="w-full sm:w-auto px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium flex items-center justify-center"
            >
              Submit Disbursement
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
