"use client";

import React, { useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { PageHeader } from "@/components/purchase/products/PageHeader";
import { BreadcrumbItem } from "@/types/purchase";
import { useGetInvoiceQuery, Invoice } from "@/api/invoice/invoiceApi";
import {
  FadeIn,
  SlideUp,
  StaggerContainer,
} from "@/components/shared/AnimatedWrapper";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ArrowLeft } from "lucide-react";

export default function InvoiceDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const { data: invoice, isLoading, error } = useGetInvoiceQuery(id);

  const breadcrumbItems: BreadcrumbItem[] = [
    { label: "Home", href: "/" },
    { label: "Invoice", href: "/invoice" },
    { label: `Invoice #${id}`, href: `/invoice/${id}`, current: true },
  ];

  const formatCurrency = (amount: string | number) => {
    const numAmount = typeof amount === "string" ? parseFloat(amount) : amount;
    const formattedAmount = new Intl.NumberFormat("en-NG", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(numAmount);

    return `₦ ${formattedAmount}`;
  };

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return (
      date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      }) +
      " - " +
      date.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
      })
    );
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const getStatusLabel = (status: string) => {
    const statusMap: Record<string, string> = {
      paid: "Paid",
      partial: "Partially Paid",
      unpaid: "Unpaid",
      overdue: "Overdue",
      cancelled: "Cancelled",
    };
    return statusMap[status] || status;
  };

  const totalAmount = useMemo(() => {
    if (!invoice?.invoice_items) return 0;
    return invoice.invoice_items.reduce((sum, item) => {
      return sum + item.quantity * parseFloat(item.unit_price);
    }, 0);
  }, [invoice]);

  if (isLoading) {
    return (
      <motion.div
        className="h-full text-gray-900 font-sans antialiased"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
      >
        <div className="h-full mx-auto px-6 py-8 bg-white flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <p>Loading invoice details...</p>
          </div>
        </div>
      </motion.div>
    );
  }

  if (error || !invoice) {
    return (
      <motion.div
        className="h-full text-gray-900 font-sans antialiased"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
      >
        <div className="h-full mx-auto px-6 py-8 bg-white flex items-center justify-center">
          <div className="text-center text-red-600">
            <p>Error loading invoice details</p>
            <p className="text-sm mt-2">{error?.toString()}</p>
            <Button
              onClick={() => router.push("/invoice")}
              className="mt-4"
              variant="outline"
            >
              Back to Invoices
            </Button>
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      className="h-full text-gray-900 font-sans antialiased"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
    >
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
      >
        <PageHeader items={breadcrumbItems} title={`Invoice #${id}`} />
      </motion.div>

      {/* Main content area */}
      <motion.main
        className="h-full mx-auto px-6 py-8 bg-white"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut", delay: 0.2 }}
      >
        <motion.h2
          className="text-lg font-medium text-blue-500 mb-6"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4, ease: "easeOut", delay: 0.3 }}
        >
          Basic Information
        </motion.h2>

        {/* Content: rows with separators */}
        <div className="flex-1">
          {/* Row 1 (first 3 fields) */}
          <SlideUp delay={0.4}>
            <div className="py-2 mb-6 border-b border-gray-200">
              <StaggerContainer
                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-4"
                staggerDelay={0.15}
              >
                {/* Date */}
                <FadeIn>
                  <div className="p-4 transition-colors border-r border-gray-300">
                    <h3 className="text-base font-semibold text-[#3B7CED] mb-2">
                      Date Created
                    </h3>
                    <p className="text-gray-700">
                      {formatDateTime(invoice.date_created)}
                    </p>
                  </div>
                </FadeIn>

                {/* Created By */}
                <FadeIn>
                  <div className="p-4 transition-colors border-r border-gray-300">
                    <h3 className="text-base font-semibold text-[#3B7CED] mb-2">
                      Created By
                    </h3>
                    <p className="text-gray-700">
                      {invoice.created_by_details?.first_name}{" "}
                      {invoice.created_by_details?.last_name}
                    </p>
                  </div>
                </FadeIn>

                {/* Updated By */}
                <FadeIn>
                  <div className="p-4 transition-colors">
                    <h3 className="text-base font-semibold text-[#3B7CED] mb-2">
                      Last Updated
                    </h3>
                    <p className="text-gray-700">
                      {formatDateTime(invoice.date_updated)}
                    </p>
                  </div>
                </FadeIn>
              </StaggerContainer>
            </div>
          </SlideUp>
        </div>

        {/* Invoice details fields */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: "easeOut", delay: 0.5 }}
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
            {/* Purchase Order */}
            <div className="flex flex-col gap-2">
              <h3 className="text-sm font-medium text-gray-700">
                Purchase Order
              </h3>
              <p className="text-gray-900 font-medium">
                {invoice.purchase_order_details?.id || invoice.purchase_order}
              </p>
            </div>

            {/* Due Date */}
            <div className="flex flex-col gap-2">
              <h3 className="text-sm font-medium text-gray-700">Due Date</h3>
              <p className="text-gray-900 font-medium">
                {formatDate(invoice.due_date)}
              </p>
            </div>

            {/* Status */}
            <div className="flex flex-col gap-2">
              <h3 className="text-sm font-medium text-gray-700">Status</h3>
              <p className="text-gray-900 font-medium">
                {getStatusLabel(invoice.status)}
              </p>
            </div>

            {/* Vendor */}
            <div className="flex flex-col gap-2">
              <h3 className="text-sm font-medium text-gray-700">Vendor</h3>
              <p className="text-gray-900 font-medium">
                {invoice.vendor_details?.company_name}
              </p>
            </div>
          </div>
        </motion.div>

        <section className="bg-white mt-8 border-none">
          <div className="mx-auto">
            <div className="overflow-x-auto">
              <Table className="min-w-[1100px] table-fixed">
                <TableHeader className="bg-[#F6F7F8]">
                  <TableRow>
                    <TableHead className="w-30 border border-gray-200 px-4 py-3 text-left text-sm text-gray-600 font-medium">
                      Product
                    </TableHead>
                    <TableHead className="w-80 border border-gray-200 px-4 py-3 text-left text-sm text-gray-600 font-medium">
                      Description
                    </TableHead>
                    <TableHead className="w-20 border border-gray-200 px-4 py-3 text-center text-sm text-gray-600 font-medium">
                      QTY
                    </TableHead>
                    <TableHead className="w-24 border border-gray-200 px-4 py-3 text-center text-sm text-gray-600 font-medium">
                      Unit of Measure
                    </TableHead>
                    <TableHead className="w-32 border border-gray-200 px-4 py-3 text-right text-sm text-gray-600 font-medium">
                      Unit Price
                    </TableHead>
                    <TableHead className="w-28 border border-gray-200 px-4 py-3 text-right text-sm text-gray-600 font-medium">
                      Total Price
                    </TableHead>
                  </TableRow>
                </TableHeader>

                <TableBody className="bg-white">
                  {invoice.invoice_items?.map((item) => {
                    const rowTotal =
                      item.quantity * parseFloat(item.unit_price);
                    return (
                      <TableRow
                        key={item.id}
                        className="group hover:bg-[#FBFBFB] transition-colors duration-150"
                      >
                        <TableCell className="border border-gray-200 px-4 align-middle">
                          <div className="text-sm text-gray-700 font-medium">
                            {item.product_details?.product_name ||
                              `Product #${item.product}`}
                          </div>
                        </TableCell>

                        <TableCell className="border border-gray-200 px-4 align-middle">
                          <div className="text-sm text-gray-600 line-clamp-2">
                            {item.product_details?.product_description ||
                              "No description"}
                          </div>
                        </TableCell>

                        <TableCell className="border border-gray-200 align-middle text-center">
                          <div className="text-sm text-gray-700">
                            {item.quantity}
                          </div>
                        </TableCell>

                        <TableCell className="border border-gray-200 px-4 align-middle text-center">
                          <div className="text-sm text-gray-700">
                            {item.product_details?.unit_of_measure_details
                              ?.unit_symbol || "N/A"}
                          </div>
                        </TableCell>

                        <TableCell className="border border-gray-200 px-4 align-middle text-right">
                          <div className="text-sm text-gray-700">
                            {formatCurrency(item.unit_price)}
                          </div>
                        </TableCell>

                        <TableCell className="border border-gray-200 px-4 align-middle text-right">
                          <div className="text-sm font-medium text-gray-800 tabular-nums">
                            {formatCurrency(rowTotal)}
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          </div>

          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
            <div className="ml-auto flex items-center gap-4 border-x border-b">
              <div className="hidden sm:block text-sm text-slate-700 px-4 py-2 bg-white rounded-md">
                <div className="flex items-center justify-between gap-6 min-w-[220px] ">
                  <span className="text-sm text-slate-600">Total Amount</span>
                  <span className="font-medium">
                    {formatCurrency(invoice.total_amount)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Action buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: "easeOut", delay: 0.6 }}
          className="flex justify-start gap-4 mt-8"
        >
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push("/invoice")}
            className="px-6 flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Invoices
          </Button>
        </motion.div>
      </motion.main>
    </motion.div>
  );
}
