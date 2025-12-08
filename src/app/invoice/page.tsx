"use client";

import React, { useMemo, useState } from "react";

import { Input } from "@/components/ui/input";
import { SearchIcon } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useGetInvoicesQuery, Invoice } from "@/api/invoice/invoiceApi";

import { InvoiceCards } from "@/components/invoice/InvoiceCards";
import { ViewToggle } from "@/components/invoice/ViewToggle";
import { InvoiceRow } from "@/components/invoice/types";
import { StatusCards } from "@/components/invoice/StatusCards";
import { InvoiceTable } from "@/components/invoice/InvoiceTable";
import { LoadingDots } from "@/components/shared/LoadingComponents";
import { FadeIn } from "@/components/shared/AnimatedWrapper";

// Helper function to format date to "DD MMM YYYY - HH:mm AM/PM" format
const formatDateTime = (dateString: string | undefined): string => {
  if (!dateString) return "N/A";

  const date = new Date(dateString);
  if (isNaN(date.getTime())) return "Invalid Date";

  const day = date.getDate().toString().padStart(2, "0");
  const month = date.toLocaleDateString("en-GB", { month: "short" });
  const year = date.getFullYear();

  let hours = date.getHours();
  const minutes = date.getMinutes().toString().padStart(2, "0");
  const ampm = hours >= 12 ? "PM" : "AM";
  hours = hours % 12;
  hours = hours ? hours : 12; // the hour '0' should be '12'
  const formattedHours = hours.toString().padStart(2, "0");

  return `${day} ${month} ${year} - ${formattedHours}:${minutes} ${ampm}`;
};

// Helper function to format date to "DD MMM YYYY" format
const formatDate = (dateString: string | undefined): string => {
  if (!dateString) return "N/A";

  const date = new Date(dateString);
  if (isNaN(date.getTime())) return "Invalid Date";

  const day = date.getDate().toString().padStart(2, "0");
  const month = date.toLocaleDateString("en-GB", { month: "short" });
  const year = date.getFullYear();

  return `${day} ${month} ${year}`;
};

// Helper function to transform API data to InvoiceRow format
const transformInvoiceToRow = (invoice: Invoice): InvoiceRow => {
  const totalAmount = parseFloat(invoice.total_amount || "0");
  const amountPaid = parseFloat(invoice.amount_paid || "0");
  const balance = parseFloat(invoice.balance || "0");

  // Map API status to our 3 status types
  const mapStatus = (status: string): "paid" | "partial" | "unpaid" => {
    const statusMapping: Record<string, "paid" | "partial" | "unpaid"> = {
      paid: "paid",
      partial: "partial",
      unpaid: "unpaid",
      overdue: "unpaid",
      cancelled: "unpaid",
    };
    return statusMapping[status] || "unpaid";
  };

  return {
    id: invoice.id,
    vendor: invoice.vendor_details?.company_name || "Unknown Vendor",
    dateCreated: formatDateTime(invoice.date_created),
    dueDate: formatDate(invoice.due_date),
    amount: amountPaid.toLocaleString(),
    due: balance.toLocaleString(),
    totalAmount: totalAmount.toLocaleString(),
    status: mapStatus(invoice.status),
  };
};

export default function InvoicePage() {
  const [query, setQuery] = useState("");
  const [currentView, setCurrentView] = useState<"grid" | "list">("list");

  // Use the invoice API query hook
  const {
    data: invoices = [],
    isLoading,
    isError,
    error,
  } = useGetInvoicesQuery({
    search: query || undefined,
  });

  // Transform API data to match component interface
  const rows: InvoiceRow[] = useMemo(() => {
    return invoices.map((invoice) => transformInvoiceToRow(invoice));
  }, [invoices]);

  const handleViewChange = (view: "grid" | "list") => {
    setCurrentView(view);
  };

  // Show loading state
  if (isLoading) {
    return (
      <FadeIn className="h-full text-gray-900 font-sans antialiased pr-4">
        <div className="h-full mx-auto px-6 py-8 bg-white">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <LoadingDots />
              <p className="mt-4 text-gray-600">Loading invoices...</p>
            </div>
          </div>
        </div>
      </FadeIn>
    );
  }

  // Show error state
  if (isError) {
    const errorMessage =
      "data" in error
        ? (error.data as { detail?: string; message?: string })?.detail ||
          (error.data as { detail?: string; message?: string })?.message ||
          "Unable to load invoices"
        : "Unable to load invoices";

    return (
      <FadeIn className="h-full text-gray-900 font-sans antialiased pr-4">
        <div className="h-full mx-auto px-6 py-8 bg-white">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="text-red-500 text-lg font-semibold mb-2">
                Error Loading Invoices
              </div>
              <p className="text-gray-600">{errorMessage}</p>
            </div>
          </div>
        </div>
      </FadeIn>
    );
  }

  return (
    <FadeIn className="h-full text-gray-900 font-sans antialiased pr-4">
      <div className="h-full mx-auto px-6 py-8 bg-white">
        <div className="bg-white rounded-md shadow hover:shadow-lg transition-shadow duration-300 p-6 pb-4 mt-4">
          <StatusCards rows={rows} />
        </div>

        <div className="bg-white p-6 rounded-md flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mt-6">
          <div className="flex items-center space-x-4">
            <h2 className="text-lg text-nowrap">Invoices</h2>

            <div className="relative w-xs">
              <Input
                type="text"
                className="w-full pl-10 pr-4 border border-gray-300 rounded-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                aria-label="Search invoices"
              />
              <SearchIcon
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                size={16}
              />
            </div>
          </div>
          <div className="flex space-x-4">
            <Link href="/invoice/new">
              <Button variant="contained" className="px-4 py-2 cursor-pointer">
                New Invoice
              </Button>
            </Link>
            <ViewToggle
              currentView={currentView}
              onViewChange={handleViewChange}
            />
          </div>
        </div>

        {/* Conditional rendering based on current view */}
        {currentView === "list" ? (
          <InvoiceTable rows={rows} query={query} />
        ) : (
          <InvoiceCards Invoices={rows} />
        )}
      </div>
    </FadeIn>
  );
}
