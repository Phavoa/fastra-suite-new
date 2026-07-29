"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import BankSelectModal from "@/components/invoice/payment-queue/BankSelectModal";
import SuccessModal from "@/components/invoice/payment-queue/SuccessModal";
import { CircleCheck } from "lucide-react";
import { Button } from "@/components/ui/button";

import { useParams } from "next/navigation";
import { useGetInvoiceByIdQuery } from "@/api/invoice/invoicesApi";
import { useMakePaymentMutation } from "@/api/invoice/paymentsApi";

const getDaysUntilDue = (dueDate: string | null) => {
  if (!dueDate) return 0;
  const due = new Date(dueDate);
  const now = new Date();
  const diffTime = due.getTime() - now.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};

export default function PaymentQueueDetailPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const { data: invoice, isLoading } = useGetInvoiceByIdQuery(id, { skip: !id });
  const [makePayment, { isLoading: isPaying }] = useMakePaymentMutation();

  const [showBankModal, setShowBankModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const handlePayBill = () => setShowBankModal(true);
  
  const handleConfirmPayment = async (bankId: string) => {
    if (!invoice) return;
    try {
      await makePayment({
        reference_id: invoice.id,
        amount_paid: invoice.balance || invoice.total_amount || "0",
        payment_method: bankId,
        notes: "Paid via Payment Queue",
      }).unwrap();
      
      setShowBankModal(false);
      setShowSuccessModal(true);
    } catch (err) {
      console.error(err);
      alert("Failed to make payment");
    }
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
            <p className="text-gray-500 mt-1">{invoice?.id || "Loading..."}</p>
          </div>
        </div>

        {isLoading ? (
          <div className="text-center py-12 text-gray-500">Loading invoice...</div>
        ) : !invoice ? (
          <div className="text-center py-12 text-gray-500">Invoice not found.</div>
        ) : (

        <div className="bg-white rounded border p-4 space-y-4">
          {/* Info Sections */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <div className="text-gray-500 text-sm">Purchase Order</div>
              <div className="font-medium mt-1">{invoice.purchase_order || "-"}</div>
            </div>
            <div>
              <div className="text-gray-500 text-sm">Vendor Bill ID</div>
              <div className="font-medium mt-1">{invoice.id}</div>
            </div>
            <div>
              <div className="text-gray-500 text-sm">Supplier Name</div>
              <div className="font-medium mt-1">{invoice.vendor_details?.vendor_name || "-"}</div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <div className="text-gray-500 text-sm">Created Date</div>
              <div className="font-medium mt-1">{invoice.date_created ? new Date(invoice.date_created).toLocaleDateString() : "-"}</div>
            </div>
            <div>
              <div className="text-gray-500 text-sm">Due Date</div>
              <div className="font-medium mt-1">{invoice.due_date || "-"}</div>
            </div>
            <div>
              <div className="text-gray-500 text-sm">Payment Terms</div>
              <div className="font-medium mt-1">{invoice.vendor_details?.payment_term || "-"}</div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <div className="text-gray-500 text-sm mb-1">Status</div>
              <span className="inline-flex px-4 py-1.5 bg-blue-100 text-blue-700 rounded-full text-sm font-medium capitalize">
                {invoice.status}
              </span>
            </div>
            <div>
              <div className="text-gray-500 text-sm mb-1">Days Until Due</div>
              <div className="font-medium text-orange-600">
                {getDaysUntilDue(invoice.due_date)} days
              </div>
            </div>
          </div>

          {/* Upload */}
          <div>
            <div className="font-medium mb-3">
              Uploaded Document
            </div>
            <div className="border border-gray-200 rounded-xl p-5 flex gap-4 bg-gray-50">
              <div className="text-4xl">📄</div>
              <div>
                <div className="font-medium">
                  Invoice_Doc.pdf
                </div>
                <div className="text-sm text-gray-500">
                  Attached to vendor bill
                </div>
              </div>
            </div>
          </div>

          {/* Cost Table */}
          <div>
            <div className="font-medium mb-4">Cost Items</div>
            <table className="w-full border border-gray-200 rounded-2xl overflow-hidden">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-4 text-left">Product / Service</th>
                  <th className="px-6 py-4 text-left">
                    Quantity
                  </th>
                  <th className="px-6 py-4 text-left">
                    Unit Price
                  </th>
                  <th className="px-6 py-4 text-left">
                    Total
                  </th>
                </tr>
              </thead>
              <tbody>
                {invoice.invoice_items?.map((item, idx) => (
                  <tr key={idx} className="border-b">
                    <td className="px-6 py-4 font-medium">
                      {item.product_details?.product_name || "Unknown Product"}
                    </td>
                    <td className="px-6 py-4">
                      {item.quantity}
                    </td>
                    <td className="px-6 py-4">
                      N{parseFloat(item.unit_price).toLocaleString()}
                    </td>
                    <td className="px-6 py-4">
                      N{(item.quantity * parseFloat(item.unit_price)).toLocaleString()}
                    </td>
                  </tr>
                ))}
                {(!invoice.invoice_items || invoice.invoice_items.length === 0) && (
                  <tr className="border-b">
                    <td colSpan={4} className="px-6 py-4 text-center text-gray-500">No items found</td>
                  </tr>
                )}
                <tr className="bg-gray-50 font-semibold">
                  <td className="px-6 py-4" colSpan={3}>Grand Total</td>
                  <td className="px-6 py-4">
                    N{parseFloat(invoice.total_amount).toLocaleString()}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <div className="flex justify-end mt-8 gap-4">
          <Button variant="outline" onClick={() => router.back()}>
            Back
          </Button>
          <Button variant="contained" onClick={handlePayBill} disabled={isPaying || invoice.status === 'paid'}>
            {isPaying ? "Processing..." : "Pay Bill"}
          </Button>
        </div>
        )}
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
