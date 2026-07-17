"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import BankSelectModal from "@/components/invoice/payment-queue/BankSelectModal";
import SuccessModal from "@/components/invoice/payment-queue/SuccessModal";
import { CircleCheck } from "lucide-react";
import { Button } from "@/components/ui/button";

const billDetail = {
  vendorBillId: "VEN-2024-0041",
  poReference: "PO-2024-0041",
  requestReference: "REQ-2024-0041",
  requestId: "REQ-2024-0041",
  supplierName: "John Doe",
  projectName: "Concrete Works",
  wbsElement: "WBS-1.3.1 – Concrete Works",
  paymentTerms: "John Doe",
  requestType: "Labor Request",
  daysUntilDue: "2 days to go",
  uploadedFile: { name: "Invoice.xls", size: "1.3MB" },
  costTable: {
    vendorBillId: "BILL",
    approvedProjectedCost: "600,000",
    invoiceContractValue: "600,000",
  },
};

export default function PaymentQueueDetailPage() {
  const router = useRouter();
  const [showBankModal, setShowBankModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const handlePayBill = () => setShowBankModal(true);
  const handleConfirmPayment = () => {
    setShowBankModal(false);
    setShowSuccessModal(true);
  };
  const handleDone = () => {
    setShowSuccessModal(false);
    router.push("/invoice/payment-queue");
  };

  return (
    <div className="p-6 min-h-screen">
      <div className="max-w-6xl mx-auto">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-gray-500 mb-6">
          <button onClick={() => router.back()} className="hover:text-gray-700">
            ←
          </button>
          <span>Home</span>
          <span className="text-gray-400">›</span>
          <span>Invoicing</span>
          <span className="text-gray-400">›</span>
          <span className="text-gray-700 font-medium">New Invoice</span>
        </div>

        <div className="flex justify-between items-start mb-8">
          <div>
            <h1 className="text-3xl font-semibold">Create Vendor Bill</h1>
            <p className="text-gray-500 mt-1">{billDetail.vendorBillId}</p>
          </div>
        </div>

        <div className="bg-white rounded border p-4 space-y-4">
          {/* Info Sections */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <div className="text-gray-500 text-sm">Request ID</div>
              <div className="font-medium mt-1">{billDetail.requestId}</div>
            </div>
            <div>
              <div className="text-gray-500 text-sm">Vendor Bill ID</div>
              <div className="font-medium mt-1">{billDetail.vendorBillId}</div>
            </div>
            <div>
              <div className="text-gray-500 text-sm">Supplier Name</div>
              <div className="font-medium mt-1">{billDetail.supplierName}</div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <div className="text-gray-500 text-sm">Project Name</div>
              <div className="font-medium mt-1">{billDetail.projectName}</div>
            </div>
            <div>
              <div className="text-gray-500 text-sm">WBS Element</div>
              <div className="font-medium mt-1">{billDetail.wbsElement}</div>
            </div>
            <div>
              <div className="text-gray-500 text-sm">Payment Terms</div>
              <div className="font-medium mt-1">{billDetail.paymentTerms}</div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <div className="text-gray-500 text-sm mb-1">Request type</div>
              <span className="inline-flex px-4 py-1.5 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
                {billDetail.requestType}
              </span>
            </div>
            <div>
              <div className="text-gray-500 text-sm mb-1">Days Until Due</div>
              <div className="font-medium text-orange-600">
                {billDetail.daysUntilDue}
              </div>
            </div>
          </div>

          {/* Upload */}
          <div>
            <div className="font-medium mb-3">
              Upload Supplier Invoice or Timesheet Document
            </div>
            <div className="border border-gray-200 rounded-xl p-5 flex gap-4 bg-gray-50">
              <div className="text-4xl">📄</div>
              <div>
                <div className="font-medium">
                  {billDetail.uploadedFile.name}
                </div>
                <div className="text-sm text-gray-500">
                  {billDetail.uploadedFile.size}
                </div>
              </div>
            </div>
          </div>

          {/* Cost Table */}
          <div>
            <div className="font-medium mb-4">Cost</div>
            <table className="w-full border border-gray-200 rounded-2xl overflow-hidden">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-4 text-left">Vendor Bill ID</th>
                  <th className="px-6 py-4 text-left">
                    Approved Projected Cost
                  </th>
                  <th className="px-6 py-4 text-left">
                    Invoice Contract Value
                  </th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b">
                  <td className="px-6 py-4 font-medium">
                    {billDetail.costTable.vendorBillId}
                  </td>
                  <td className="px-6 py-4">
                    N{billDetail.costTable.approvedProjectedCost}
                  </td>
                  <td className="px-6 py-4">
                    N{billDetail.costTable.invoiceContractValue}
                  </td>
                  <td className="px-6 py-4">
                    <CircleCheck className="text-green-600" />
                  </td>
                </tr>
                <tr className="bg-gray-50 font-semibold">
                  <td className="px-6 py-4">Total</td>
                  <td className="px-6 py-4">
                    N{billDetail.costTable.approvedProjectedCost}
                  </td>
                  <td className="px-6 py-4">
                    N{billDetail.costTable.invoiceContractValue}
                  </td>
                  <td></td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <div className="flex justify-end mt-8">
          <Button variant="contained" onClick={handlePayBill}>
            Pay Bill
          </Button>
        </div>
      </div>

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
  );
}
