"use client";

import React from "react";
import { useParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { PageHeader } from "@/components/purchase/products/PageHeader";
import { BreadcrumbItem } from "@/types/purchase";
import { useGetDeliveryOrderReturnQuery } from "@/api/inventory/deliveryOrderReturnApi";
import { DeliveryOrderReturnItem } from "@/types/deliveryOrderReturn";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ArrowLeft, Edit } from "lucide-react";
import Link from "next/link";
import { de } from "zod/v4/locales";
import { PageGuard } from "@/components/auth/PageGuard";

export default function DeliveryOrderReturnDetailPage() {
  const router = useRouter();
  const params = useParams();
  const uniqueRecordId = params.id as string;

  const {
    data: deliveryOrderReturn,
    isLoading,
    error,
  } = useGetDeliveryOrderReturnQuery(uniqueRecordId);

  const breadcrumsItem: BreadcrumbItem[] = [
    { label: "Home", href: "/" },
    { label: "Inventory", href: "/inventory" },
    {
      label: "Operation",
      href: "/inventory/operation",
    },
    {
      label: "Delivery Order Return",
      href: "/inventory/operation/delivery_order_return",
    },
    {
      label: deliveryOrderReturn?.unique_record_id || "Detail",
      href: `/inventory/operation/delivery_order_return/${
        deliveryOrderReturn?.unique_record_id || "detail"
      }`,
      current: true,
    },
  ];

  if (isLoading) {
    return (
      <main className="min-h-screen text-gray-800 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p>Loading delivery order return details...</p>
        </div>
      </main>
    );
  }

  if (error || !deliveryOrderReturn) {
    return (
      <main className="min-h-screen text-gray-800 flex items-center justify-center">
        <div className="text-center text-red-600">
          <p>Error loading delivery order return details</p>
          <p className="text-sm mt-2">
            The requested delivery order return could not be found.
          </p>
          <Button
            onClick={() => router.push("/inventory/operation")}
            className="mt-4"
          >
            Back to Operations
          </Button>
        </div>
      </main>
    );
  }

  return (
    <PageGuard application="inventory" module="deliveryorderreturn">
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
        <PageHeader
          items={breadcrumsItem}
          title={`Delivery Order Return: ${deliveryOrderReturn.unique_record_id}`}
          isEdit={`/inventory/operation/delivery_order_return/edit/${deliveryOrderReturn?.id}`}
        />
      </motion.div>

      {/* Main content area */}
      <motion.main
        className="h-full mx-auto bg-white"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut", delay: 0.2 }}
      >
        {/* Basic Information */}
        <motion.div
          className="rounded-none p-6 border-b-16 border-gray-100"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: "easeOut", delay: 0.3 }}
        >
          <div className="flex justify-between mb-6">
            <h2 className="text-lg font-medium text-blue-500">
              Basic Information
            </h2>
          </div>

          <div
            className="
              grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3
              gap-x-2 gap-y-12 text-gray-700

              /* --- No borders on small screens --- */
              border-0 p-0

              /* --- Medium screens: 2 columns --- */
              sm:[&>div:nth-child(2n)]:border-l sm:[&>div:nth-child(2n)]:border-gray-300
              sm:[&>div:nth-child(2n)]:pl-4

              /* --- Large screens: 3 columns --- */
              lg:[&>div]:border-l lg:[&>div]:border-gray-300
              lg:[&>div]:pl-4
              lg:[&>div:nth-child(3n+1)]:border-0 lg:[&>div:nth-child(3n+1)]:pl-0

            "
          >
            <div>
              <h3 className="font-semibold">Record ID</h3>
              <p>{deliveryOrderReturn.unique_record_id}</p>
            </div>

            <div>
              <h3 className="font-semibold">Date of Return</h3>
              <p>
                {
                  new Date(deliveryOrderReturn.date_of_return)
                    .toISOString()
                    .split("T")[0]
                }
              </p>
            </div>

            <div>
              <h3 className="font-semibold">Source Location</h3>
              <p>{deliveryOrderReturn.source_location}</p>
            </div>

            <div>
              <h3 className="font-semibold">Return Warehouse</h3>
              <p>
                {deliveryOrderReturn.return_warehouse_location_details
                  ?.location_name || "N/A"}
              </p>
            </div>

            <div className="sm:col-span-2">
              <h3 className="font-semibold">Reason for Return</h3>
              <p className="whitespace-pre-wrap">
                {deliveryOrderReturn.reason_for_return}
              </p>
            </div>
          </div>
        </motion.div>

        {/* Delivery Order Return Items Table */}
        <motion.div
          className="bg-white overflow-hidden p-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: "easeOut", delay: 0.4 }}
        >
          <div className="mb-4">
            <h2 className="text-lg font-medium text-blue-500">
              Returned Items
            </h2>
          </div>
          <div className="overflow-x-auto border border-gray-200">
            <Table>
              <TableHeader className="bg-gray-50">
                <TableRow>
                  <TableHead className="px-6 py-3 text-left text-sm font-medium text-gray-500">
                    Product Name
                  </TableHead>
                  <TableHead className="px-6 py-3 text-center text-sm font-medium text-gray-500">
                    Initial Quantity
                  </TableHead>
                  <TableHead className="px-6 py-3 text-center text-sm font-medium text-gray-500">
                    Returned Quantity
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {deliveryOrderReturn.delivery_order_return_items?.map(
                  (item: DeliveryOrderReturnItem) => (
                    <TableRow
                      key={item.returned_product_item}
                      className="hover:bg-gray-50"
                    >
                      <TableCell className="px-6 py-4 text-sm font-medium text-gray-900">
                        {item.returned_product_item_details?.product_name ||
                          item.returned_product_item}
                      </TableCell>
                      <TableCell className="px-6 py-4 text-sm text-center font-medium text-gray-900">
                        {item.initial_quantity}
                      </TableCell>
                      <TableCell className="px-6 py-4 text-sm text-center font-medium text-gray-900">
                        {item.returned_quantity}
                      </TableCell>
                    </TableRow>
                  )
                ) || (
                  <TableRow>
                    <TableCell
                      colSpan={3}
                      className="px-6 py-8 text-center text-gray-500"
                    >
                      No returned items found
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </motion.div>
      </motion.main>
    </motion.div>
    </PageGuard>
  );
}
