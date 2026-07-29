"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Search, TriangleAlert, CircleCheck } from "lucide-react";

import { useGetInvoicesQuery } from "@/api/invoice/invoicesApi";

interface PaymentQueueItem {
  id: string;
  invoiceId: string;
  vendor: string;
  invoiceDate: string;
  dueDate: string;
  daysUntilDue: number;
  amount: string;
  status: string;
  flag: "check" | "warning";
}

const getDaysUntilDue = (dueDate: string | null) => {
  if (!dueDate) return 0;
  const due = new Date(dueDate);
  const now = new Date();
  const diffTime = due.getTime() - now.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};

const statusStyles: Record<string, string> = {
  unpaid: "bg-yellow-100 text-yellow-700",
  overdue: "bg-red-100 text-red-700",
  paid: "bg-green-100 text-green-700",
  partial: "bg-blue-100 text-blue-700",
  cancelled: "bg-gray-100 text-gray-700",
};

export default function PaymentQueuePage() {
  const [searchTerm, setSearchTerm] = useState("");
  const { data: invoices = [], isLoading } = useGetInvoicesQuery();

  const paymentQueueData: PaymentQueueItem[] = React.useMemo(() => {
    return invoices.map((inv) => {
      const daysUntilDue = getDaysUntilDue(inv.due_date);
      return {
        id: inv.id,
        invoiceId: inv.id,
        vendor: inv.vendor_details?.vendor_name || "Unknown Vendor",
        invoiceDate: inv.date_created ? new Date(inv.date_created).toISOString().split('T')[0] : "-",
        dueDate: inv.due_date || "-",
        daysUntilDue: daysUntilDue,
        amount: inv.total_amount,
        status: inv.status,
        flag: daysUntilDue < 0 ? "warning" : "check",
      };
    });
  }, [invoices]);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const filteredData = React.useMemo(() => {
    const term = searchTerm.toLowerCase();
    if (!term) return paymentQueueData;
    return paymentQueueData.filter(
      (item) =>
        item.invoiceId.toLowerCase().includes(term) ||
        item.vendor.toLowerCase().includes(term) ||
        item.status.toLowerCase().includes(term)
    );
  }, [searchTerm, paymentQueueData]);

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-gray-500 mb-6">
        <span>Home</span>
        <span className="text-gray-400">›</span>
        <span>Invoice</span>
        <span className="text-gray-400">›</span>
        <span className="text-gray-700 font-medium">Payment Queue</span>
      </div>

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">
            Payment Queue
          </h1>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative w-full md:w-80">
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
              <Search className="w-4 h-4" />
            </div>
            <input
              type="text"
              placeholder="Search"
              value={searchTerm}
              onChange={handleSearch}
              className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
            />
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-full divide-y divide-gray-200">
            <thead>
              <tr className="bg-gray-50">
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Invoice ID
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Vendor
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Invoice Date
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Due Date
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Days Until Due
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Amount
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Flags
                </th>
                <th className="px-6 py-4 w-20"></th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredData.map((item) => (
                <tr
                  key={item.id}
                  className="hover:bg-gray-50 transition-colors group"
                >
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {item.invoiceId}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                    {item.vendor}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                    {item.invoiceDate}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                    {item.dueDate}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                    {item.daysUntilDue}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {item.amount}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium capitalize ${statusStyles[item.status?.toLowerCase()] || "bg-gray-100 text-gray-700"}`}
                    >
                      {item.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {item.flag === "check" ? (
                      <CircleCheck className="w-5 h-5 text-gray-600" />
                    ) : (
                      <TriangleAlert className="w-5 h-5 text-red-600" />
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <Link
                      href={`/invoice/payment-queue/${item.id}`}
                      className="text-blue-600 hover:text-blue-700 font-medium opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      View →
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {isLoading && (
        <div className="mt-4 text-center text-sm text-gray-500">
          Loading invoices...
        </div>
      )}
      {!isLoading && (
        <div className="mt-4 text-xs text-gray-400 text-center">
          Showing {filteredData.length} of {paymentQueueData.length} entries
        </div>
      )}
    </div>
  );
}
