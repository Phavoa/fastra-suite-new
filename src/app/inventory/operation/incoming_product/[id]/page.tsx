"use client";

import React from "react";
import { useParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { PageHeader } from "@/components/purchase/products/PageHeader";
import { BreadcrumbItem } from "@/types/purchase";
import { useGetIncomingProductQuery } from "@/api/inventory/incomingProductApi";
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

export default function IncomingProductDetailPage() {
  const router = useRouter();
  const params = useParams();
  const incomingProductId = params.id as string;

  const {
    data: incomingProduct,
    isLoading,
    error,
  } = useGetIncomingProductQuery(incomingProductId);

  const breadcrumsItem: BreadcrumbItem[] = [
    { label: "Home", href: "/" },
    { label: "Inventory", href: "/inventory" },
    {
      label: "Operation",
      href: "/inventory/operation",
    },
    {
      label: "Incoming Product",
      href: "/inventory/operation/incoming_product",
    },
    {
      label: incomingProduct?.incoming_product_id || "Detail",
      href: `/inventory/operation/incoming_product/${incomingProductId}`,
      current: true,
    },
  ];

  if (isLoading) {
    return (
      <main className="min-h-screen text-gray-800 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p>Loading incoming product details...</p>
        </div>
      </main>
    );
  }

  if (error || !incomingProduct) {
    return (
      <main className="min-h-screen text-gray-800 flex items-center justify-center">
        <div className="text-center text-red-600">
          <p>Error loading incoming product details</p>
          <p className="text-sm mt-2">
            The requested incoming product could not be found.
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
          title={`Incoming Product: ${incomingProduct.incoming_product_id}`}
        />
      </motion.div>

      {/* Main content area */}
      <motion.main
        className="h-full mx-auto bg-white"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut", delay: 0.2 }}
      >
        {/* Action buttons */}
        <div className="flex justify-between items-center  px-6 py-4 border-b">
          <Button
            variant="outline"
            onClick={() => router.push("/inventory/operation")}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Operations
          </Button>

          {incomingProduct.can_edit && (
            <Link
              href={`/inventory/operation/incoming_product/edit/${incomingProductId}`}
            >
              <Button className="flex items-center gap-2">
                <Edit className="w-4 h-4" />
                Edit
              </Button>
            </Link>
          )}
        </div>

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
            <div>
              <span
                className={`px-3 py-1 rounded-full text-sm font-medium ${
                  incomingProduct.status === "validated"
                    ? "bg-green-100 text-green-500"
                    : incomingProduct.status === "draft"
                    ? "bg-blue-100 text-blue-500"
                    : incomingProduct.status === "canceled"
                    ? "bg-red-100 text-red-500"
                    : "bg-gray-100 text-gray-500"
                }`}
              >
                {incomingProduct.status}
              </span>
            </div>
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
              <h3 className="font-semibold">Request ID</h3>
              <p>{incomingProduct.incoming_product_id}</p>
            </div>

            <div>
              <h3 className="font-semibold">Receipt Type</h3>
              <p>{incomingProduct.receipt_type.replace("_", " ")}</p>
            </div>

            <div>
              <h3 className="font-semibold">Date Created</h3>
              <p>
                {new Date().toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "short",
                  day: "numeric",
                })}
              </p>
            </div>

            <div>
              <h3 className="font-semibold">Supplier</h3>
              <p>{incomingProduct.supplier_details?.company_name || "N/A"}</p>
            </div>

            <div>
              <h3 className="font-semibold">Related PO</h3>
              <p>{incomingProduct.related_po || "N/A"}</p>
            </div>

            <div>
              <h3 className="font-semibold">Notes</h3>
              <p>{incomingProduct.notes || "No notes available"}</p>
            </div>

            <div>
              <h3 className="font-semibold">Source Location</h3>
              <p>
                {incomingProduct.source_location_details?.location_name ||
                  "N/A"}
              </p>
            </div>

            <div>
              <h3 className="font-semibold">Destination Location</h3>
              <p>
                {incomingProduct.destination_location_details?.location_name ||
                  "N/A"}
              </p>
            </div>
          </div>
        </motion.div>

        {/* Product Items Table */}
        <motion.div
          className="bg-white overflow-hidden p-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: "easeOut", delay: 0.4 }}
        >
          <div className="mb-4">
            <h2 className="text-lg font-medium text-blue-500">
              Inventory Product Content
            </h2>
          </div>
          <div className="overflow-x-auto border border-gray-200">
            <Table>
              <TableHeader className="bg-gray-50">
                <TableRow>
                  <TableHead className="px-6 py-3 text-left text-sm font-medium text-gray-500">
                    Product
                  </TableHead>
                  <TableHead className="px-6 py-3 text-left text-sm font-medium text-gray-500">
                    Description
                  </TableHead>
                  <TableHead className="px-6 py-3 text-center text-sm font-medium text-gray-500">
                    Unit
                  </TableHead>
                  <TableHead className="px-6 py-3 text-center text-sm font-medium text-gray-500">
                    Expected Quantity
                  </TableHead>
                  <TableHead className="px-6 py-3 text-center text-sm font-medium text-gray-500">
                    Received Quantity
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {incomingProduct.incoming_product_items?.map((item) => (
                  <TableRow key={item.id} className="hover:bg-gray-50">
                    <TableCell className="px-6 py-4 text-sm font-medium text-gray-900">
                      {item.product_details?.product_name || "N/A"}
                    </TableCell>
                    <TableCell className="px-6 py-4 text-sm text-gray-600">
                      {item.product_details?.product_description ||
                        "No description"}
                    </TableCell>
                    <TableCell className="px-6 py-4 text-sm text-center text-gray-900">
                      {item.product_details?.unit_of_measure_details
                        ?.unit_symbol || "N/A"}
                    </TableCell>
                    <TableCell className="px-6 py-4 text-sm text-center font-medium text-gray-900">
                      {item.expected_quantity}
                    </TableCell>
                    <TableCell className="px-6 py-4 text-sm text-center font-medium text-gray-900">
                      {item.quantity_received}
                    </TableCell>
                  </TableRow>
                )) || (
                  <TableRow>
                    <TableCell
                      colSpan={5}
                      className="px-6 py-8 text-center text-gray-500"
                    >
                      No product items found
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </motion.div>
      </motion.main>
    </motion.div>
  );
}
