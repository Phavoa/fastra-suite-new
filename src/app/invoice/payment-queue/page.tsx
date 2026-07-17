"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Search, TriangleAlert, CircleCheck } from "lucide-react";

interface PaymentQueueItem {
  id: string;
  invoiceId: string;
  vendor: string;
  invoiceDate: string;
  dueDate: string;
  daysUntilDue: number;
  amount: string;
  status: "Awaiting Approved" | "Approved" | "Paid";
  flag: "check" | "warning";
}

const paymentQueueData: PaymentQueueItem[] = [
  {
    id: "1",
    invoiceId: "BILL-2024-0041",
    vendor: "xyz vendor",
    invoiceDate: "2024-05-15",
    dueDate: "2024-05-15",
    daysUntilDue: 1,
    amount: "N200,000",
    status: "Awaiting Approved",
    flag: "check",
  },
  {
    id: "2",
    invoiceId: "BILL-2024-0041",
    vendor: "xyz vendor",
    invoiceDate: "2024-05-15",
    dueDate: "2024-05-15",
    daysUntilDue: 1,
    amount: "N200,000",
    status: "Awaiting Approved",
    flag: "warning",
  },
  {
    id: "3",
    invoiceId: "BILL-2024-0041",
    vendor: "xyz vendor",
    invoiceDate: "2024-05-15",
    dueDate: "2024-05-15",
    daysUntilDue: 2,
    amount: "N200,000",
    status: "Approved",
    flag: "check",
  },
  {
    id: "4",
    invoiceId: "BILL-2024-0041",
    vendor: "xyz vendor",
    invoiceDate: "2024-05-15",
    dueDate: "2024-05-15",
    daysUntilDue: 5,
    amount: "N200,000",
    status: "Approved",
    flag: "warning",
  },
  {
    id: "5",
    invoiceId: "BILL-2024-0041",
    vendor: "xyz vendor",
    invoiceDate: "2024-05-15",
    dueDate: "2024-05-15",
    daysUntilDue: 6,
    amount: "N200,000",
    status: "Paid",
    flag: "check",
  },
  {
    id: "6",
    invoiceId: "BILL-2024-0041",
    vendor: "xyz vendor",
    invoiceDate: "2024-05-15",
    dueDate: "2024-05-15",
    daysUntilDue: 8,
    amount: "N200,000",
    status: "Paid",
    flag: "check",
  },
];

const statusStyles = {
  "Awaiting Approved": "bg-yellow-100 text-yellow-700",
  Approved: "bg-blue-100 text-blue-700",
  Paid: "bg-green-100 text-green-700",
};

export default function PaymentQueuePage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredData, setFilteredData] = useState(paymentQueueData);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const term = e.target.value.toLowerCase();
    setSearchTerm(term);

    if (!term) {
      setFilteredData(paymentQueueData);
      return;
    }

    const filtered = paymentQueueData.filter(
      (item) =>
        item.invoiceId.toLowerCase().includes(term) ||
        item.vendor.toLowerCase().includes(term) ||
        item.status.toLowerCase().includes(term),
    );
    setFilteredData(filtered);
  };

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
                      className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${statusStyles[item.status]}`}
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

      <div className="mt-4 text-xs text-gray-400 text-center">
        Showing {filteredData.length} of {paymentQueueData.length} entries
      </div>
    </div>
  );
}
