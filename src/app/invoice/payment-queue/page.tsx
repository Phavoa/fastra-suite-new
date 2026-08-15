"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Search, TriangleAlert, CircleCheck, ChevronDown } from "lucide-react";

import { useGetVendorBillsQuery } from "@/api/invoice/vendorBillsApi";
import { VendorBill } from "@/api/invoice/vendorBillsApi";

const getDaysUntilDue = (dueDate: string | null) => {
  if (!dueDate) return 0;
  const due = new Date(dueDate);
  const now = new Date();
  const diffTime = due.getTime() - now.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};

const statusStyles: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-700",
  draft: "bg-gray-100 text-gray-700",
  paid: "bg-green-100 text-green-700",
  partial: "bg-blue-100 text-blue-700",
  cancelled: "bg-red-100 text-red-700",
  submitted: "bg-yellow-100 text-yellow-700",
  approved: "bg-blue-100 text-blue-700",
  rejected: "bg-red-100 text-red-700",
};

type FilterKey =
  | "status"
  | "vendor"
  | "payment_status"
  | "bill_number"
  | "date_range";

export default function PaymentQueuePage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [filters, setFilters] = useState<Record<FilterKey, string>>({
    status: "",
    vendor: "",
    payment_status: "",
    bill_number: "",
    date_range: "",
  });
  const [showFilters, setShowFilters] = useState(false);

  const { data: invoices = [], isLoading } = useGetVendorBillsQuery();

  const filteredData = React.useMemo(() => {
    const billNumberTerm = (filters.bill_number || searchTerm).toLowerCase();
    const vendorTerm = filters.vendor.toLowerCase();
    const statusTerm = filters.status.toLowerCase();
    const paymentStatusTerm = filters.payment_status.toLowerCase();

    return invoices.filter((inv: VendorBill) => {
      const daysUntilDue = getDaysUntilDue(inv.due_date);
      const matchesSearch =
        !billNumberTerm ||
        String(inv.id).toLowerCase().includes(billNumberTerm) ||
        (inv.bill_number || "").toLowerCase().includes(billNumberTerm) ||
        (inv.vendor_name || "").toLowerCase().includes(billNumberTerm);

      const matchesVendor =
        !vendorTerm ||
        (inv.vendor_name || "").toLowerCase().includes(vendorTerm);

      const matchesStatus =
        !statusTerm || inv.status.toLowerCase().includes(statusTerm);

      const matchesPayment =
        !paymentStatusTerm ||
        (inv.payment_status || "").toLowerCase().includes(paymentStatusTerm);

      return matchesSearch && matchesVendor && matchesStatus && matchesPayment;
    });
  }, [invoices, searchTerm, filters]);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const handleFilterChange = (key: FilterKey, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const resetFilters = () => {
    setFilters({
      status: "",
      vendor: "",
      payment_status: "",
      bill_number: "",
      date_range: "",
    });
    setSearchTerm("");
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
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">
            Payment Queue
          </h1>
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="relative w-full md:w-80">
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
              <Search className="w-4 h-4" />
            </div>
            <input
              type="text"
              placeholder="Search bill number or vendor"
              value={searchTerm}
              onChange={handleSearch}
              className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
            />
          </div>
          <button
            type="button"
            onClick={() => setShowFilters((v) => !v)}
            className="flex items-center gap-1 px-3 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 text-sm text-gray-700"
            aria-expanded={showFilters}
          >
            <ChevronDown
              className={`w-4 h-4 transition-transform ${showFilters ? "rotate-180" : ""}`}
            />
            Filters
          </button>
        </div>
      </div>

      {/* Filters */}
      {showFilters && (
        <div className="bg-white rounded-lg border border-gray-200 p-4 mb-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          <div>
            <label className="block text-xs text-gray-500 uppercase mb-1">
              Status
            </label>
            <select
              value={filters.status}
              onChange={(e) => handleFilterChange("status", e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All</option>
              <option value="draft">Draft</option>
              <option value="submitted">Submitted</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
              <option value="cancelled">Cancelled</option>
              <option value="paid">Paid</option>
              <option value="partial">Partial</option>
            </select>
          </div>
          <div>
            <label className="block text-xs text-gray-500 uppercase mb-1">
              Vendor
            </label>
            <input
              type="text"
              placeholder="Vendor name"
              value={filters.vendor}
              onChange={(e) => handleFilterChange("vendor", e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-xs text-gray-500 uppercase mb-1">
              Payment Status
            </label>
            <select
              value={filters.payment_status}
              onChange={(e) =>
                handleFilterChange("payment_status", e.target.value)
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All</option>
              <option value="unpaid">Unpaid</option>
              <option value="partial">Partial</option>
              <option value="paid">Paid</option>
            </select>
          </div>
          <div>
            <label className="block text-xs text-gray-500 uppercase mb-1">
              Date Range
            </label>
            <input
              type="date"
              value={filters.date_range}
              onChange={(e) => handleFilterChange("date_range", e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="flex items-end">
            <button
              type="button"
              onClick={resetFilters}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm text-gray-700"
            >
              Reset
            </button>
          </div>
        </div>
      )}

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
              {filteredData.map((inv) => {
                const daysUntilDue = getDaysUntilDue(inv.due_date);
                const flag = daysUntilDue < 0 ? "warning" : "check";
                return (
                  <tr
                    key={inv.id}
                    className="hover:bg-gray-50 transition-colors group"
                  >
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      <Link
                        href={`/invoice/payment-queue/${inv.id}`}
                        className="underline hover:text-blue-700"
                      >
                        {inv.bill_number || inv.id}
                      </Link>
                    </td>
                    <td
                      className="px-6 py-4 whitespace-nowrap text-sm text-gray-700"
                      title={inv.vendor_name || "Unknown Vendor"}
                    >
                      {inv.vendor_name || "-"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                      {inv.invoice_date ? inv.invoice_date : "-"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                      {inv.due_date || "-"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                      {daysUntilDue}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {new Intl.NumberFormat("en-NG", {
                        style: "currency",
                        currency: "NGN",
                        minimumFractionDigits: 0,
                        maximumFractionDigits: 0,
                      }).format(Number(inv.amount || 0))}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium capitalize ${
                          statusStyles[inv.status?.toLowerCase()] ||
                          "bg-gray-100 text-gray-700"
                        }`}
                      >
                        {inv.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {flag === "check" ? (
                        <CircleCheck className="w-5 h-5 text-gray-600" />
                      ) : (
                        <TriangleAlert className="w-5 h-5 text-red-600" />
                      )}
                    </td>
                  </tr>
                );
              })}
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
          Showing {filteredData.length} of {invoices.length} entries
        </div>
      )}
    </div>
  );
}
