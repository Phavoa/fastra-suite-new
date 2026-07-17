"use client";

import { useState } from "react";
import { Search, ChevronDown, Eye, FileText, MoreVertical } from "lucide-react";
import Link from "next/link";

// Mock data for purchase orders
const mockPurchaseOrders = [
  {
    id: "PO-2024-0018",
    requestType: "Purchase",
    vendor: "xyz Vendor",
    wbs: "WBS-1.3 - Concrete Works",
    requestedAmount: 200000,
    status: "Issued",
    statusColor: "bg-blue-100 text-blue-700",
  },
  {
    id: "PO-2024-0018",
    requestType: "Subcontractor",
    vendor: "xyz Vendor",
    wbs: "WBS-1.3.1 - Concrete Works",
    requestedAmount: 200000,
    status: "Paid",
    statusColor: "bg-green-100 text-green-700",
  },
  {
    id: "PO-2024-0018",
    requestType: "Plant and Equipment",
    vendor: "xyz Vendor",
    wbs: "WBS-1.3.1 - Concrete Works",
    requestedAmount: 200000,
    status: "Cancelled",
    statusColor: "bg-red-100 text-red-700",
  },
];

const getTypeColor = (type: string) => {
  const colors: Record<string, string> = {
    Purchase: "bg-blue-50 text-blue-700",
    Subcontractor: "bg-purple-50 text-purple-700",
    "Plant and Equipment": "bg-green-50 text-green-700",
  };
  return colors[type] || "bg-gray-50 text-gray-700";
};

const getStatusBadge = (status: string, color: string) => {
  return (
    <span
      className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium ${color}`}
    >
      {status}
    </span>
  );
};

export default function PurchaseOrderPage() {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredOrders = mockPurchaseOrders.filter(
    (order) =>
      order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.vendor.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.wbs.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: "NGN",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="p-6">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-gray-500 mb-6">
        <span className="text-gray-400">Home</span>
        <span className="text-gray-400">/</span>
        <span className="text-gray-400">Invoice</span>
        <span className="text-gray-400">/</span>
        <span className="text-gray-900 font-medium">Purchase Order</span>
      </div>

      {/* Page Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">Purchase Order</h1>
      </div>

      {/* Search Bar */}
      <div className="mb-6">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Search purchase orders..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm bg-white"
          />
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  PO ID
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Request Type
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Vendor
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  WBS element
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Requested Amount
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredOrders.map((order, index) => (
                <tr key={index} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3 text-sm font-medium text-blue-600">
                    <Link
                      href={`/invoice/purchase-order/${order.id}`}
                      className="hover:underline"
                    >
                      {order.id}
                    </Link>
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium ${getTypeColor(order.requestType)}`}
                    >
                      {order.requestType}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">
                    {order.vendor}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">
                    {order.wbs}
                  </td>
                  <td className="px-4 py-3 text-sm text-left font-semibold text-gray-900">
                    {formatCurrency(order.requestedAmount)}
                  </td>
                  <td className="px-4 py-3 text-left">
                    {getStatusBadge(order.status, order.statusColor)}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-center gap-2">
                      <Link
                        href={`/invoice/purchase-order/${order.id}`}
                        className="p-1.5 hover:bg-gray-100 rounded-lg text-gray-400 hover:text-gray-600 transition-colors"
                      >
                        View
                      </Link>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
