"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  ChevronLeft,
  Mail,
  FileText,
  Pencil,
  MoreVertical,
  Calendar,
  User,
  CreditCard,
} from "lucide-react";
import CreateVendorBillModal from "@/components/invoice/CreateVendorBillModal";

// Mock data for PO detail
const mockPODetail = {
  id: "PO0018",
  vendor: "xyz Vendor",
  wbs: "WBS-1.3.1 - Concrete Works",
  costCategory: "LAB-001",
  paymentTerms: "Credit Card",
  issuedDate: "2024-05-15",
  issuedBy: "John Doe",
  requestType: "Purchase",
  isPrepaid: false,
  products: [
    {
      description: "Product 1",
      unit: "KG",
      qty: 4,
      unitPrice: 600000,
      total: 2400000,
    },
    {
      description: "Product 2",
      unit: "KG",
      qty: 4,
      unitPrice: 600000,
      total: 2400000,
    },
  ],
};

export default function PurchaseOrderDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [isBillModalOpen, setIsBillModalOpen] = useState(false);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: "NGN",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const totalAmount = mockPODetail.products.reduce(
    (sum, p) => sum + p.total,
    0,
  );

  return (
    <div className="p-6">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-gray-500 mb-6">
        <Link
          href="/invoice/purchase-order"
          className="hover:text-gray-700 transition-colors"
        >
          Home
        </Link>
        <span className="text-gray-400">/</span>
        <Link
          href="/invoice/purchase-order"
          className="hover:text-gray-700 transition-colors"
        >
          Invoice
        </Link>
        <span className="text-gray-400">/</span>
        <Link
          href="/invoice/purchase-order"
          className="hover:text-gray-700 transition-colors"
        >
          Purchase Order
        </Link>
        <span className="text-gray-400">/</span>
        <span className="text-gray-900 font-medium">{mockPODetail.id}</span>
      </div>

      {/* Page Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">
            Purchase Order - {mockPODetail.id}
          </h1>
        </div>
        <div className="flex items-center gap-2">
          <button className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium text-gray-700">
            <Mail className="w-4 h-4" />
            Send Via Email
          </button>
          <button
            onClick={() => setIsBillModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
          >
            <FileText className="w-4 h-4" />
            Create Bill
          </button>
        </div>
      </div>

      {/* Basic Information */}
      <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
        <h2 className="text-sm font-medium text-gray-700 mb-4">
          Basic Information
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <div>
            <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">
              Vendor
            </p>
            <p className="text-sm font-medium text-gray-900">
              {mockPODetail.vendor}
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">
              WBS Element
            </p>
            <p className="text-sm font-medium text-gray-900">
              {mockPODetail.wbs}
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">
              Cost Category
            </p>
            <p className="text-sm font-medium text-gray-900">
              {mockPODetail.costCategory}
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">
              Payment Terms
            </p>
            <p className="text-sm font-medium text-gray-900">
              {mockPODetail.paymentTerms}
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">
              Issued Date
            </p>
            <p className="text-sm font-medium text-gray-900">
              {mockPODetail.issuedDate}
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">
              Issued By
            </p>
            <p className="text-sm font-medium text-gray-900">
              {mockPODetail.issuedBy}
            </p>
          </div>
        </div>
      </div>

      {/* Request Type */}
      <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
        <h2 className="text-sm font-medium text-gray-700 mb-4">Request type</h2>
        <div className="flex items-center gap-4">
          <span className="inline-flex px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-sm font-medium">
            {mockPODetail.requestType}
          </span>
          {mockPODetail.isPrepaid && (
            <span className="inline-flex px-3 py-1 bg-green-50 text-green-700 rounded-full text-sm font-medium">
              Prepaid
            </span>
          )}
        </div>
      </div>

      {/* Products Table */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Product Name
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Unit
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  QTY
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Unit Price
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Total
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {mockPODetail.products.map((product, index) => (
                <tr key={index} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3 text-sm text-gray-900">
                    {product.description}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">
                    {product.unit}
                  </td>
                  <td className="px-4 py-3 text-sm text-right text-gray-600">
                    {product.qty}
                  </td>
                  <td className="px-4 py-3 text-sm text-right text-gray-600">
                    {formatCurrency(product.unitPrice)}
                  </td>
                  <td className="px-4 py-3 text-sm text-right font-semibold text-gray-900">
                    {formatCurrency(product.total)}
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot className="bg-gray-50 border-t border-gray-200">
              <tr>
                <td
                  colSpan={4}
                  className="px-4 py-3 text-sm font-semibold text-gray-900 text-right"
                >
                  Total
                </td>
                <td className="px-4 py-3 text-sm font-bold text-gray-900 text-right">
                  {formatCurrency(totalAmount)}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      {/* Create Vendor Bill Modal */}
      <CreateVendorBillModal
        isOpen={isBillModalOpen}
        onClose={() => setIsBillModalOpen(false)}
        poId={mockPODetail.id}
        products={mockPODetail.products}
        formatCurrency={formatCurrency}
      />
    </div>
  );
}
