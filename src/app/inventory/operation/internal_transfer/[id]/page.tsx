"use client";

import React from "react";
import { useParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { PageHeader } from "@/components/purchase/products/PageHeader";
import { BreadcrumbItem } from "@/types/purchase";
import {
  useGetInternalTransferQuery,
  useUpdateInternalTransferMutation,
} from "@/api/inventory/internalTransferApi";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ToastNotification } from "@/components/shared/ToastNotification";
import { PageGuard } from "@/components/auth/PageGuard";

export default function InternalTransferDetailPage() {
  const router = useRouter();
  const params = useParams();
  const internalTransferId = params.id as string;

  const {
    data: internalTransfer,
    isLoading,
    error,
    refetch,
  } = useGetInternalTransferQuery(internalTransferId);

  const [notification, setNotification] = React.useState<{
    message: string;
    type: "success" | "error";
    show: boolean;
  }>({
    message: "",
    type: "success",
    show: false,
  });

  const [updateInternalTransfer, { isLoading: isUpdating }] =
    useUpdateInternalTransferMutation();

  const breadcrumsItem: BreadcrumbItem[] = [
    { label: "Home", href: "/" },
    { label: "Inventory", href: "/inventory" },
    {
      label: "Operation",
      href: "/inventory/operation",
    },
    {
      label: "Internal Transfer",
      href: "/inventory/operation/internal_transfer",
    },
    {
      label: internalTransfer?.id || "Detail",
      href: `/inventory/operation/internal_transfer/${internalTransferId}`,
      current: true,
    },
  ];

  const handleStatusUpdate = async (
    newStatus: string,
    successMessage: string
  ) => {
    try {
      await updateInternalTransfer({
        id: internalTransferId,
        data: { status: newStatus },
      }).unwrap();

      setNotification({
        message: successMessage,
        type: "success",
        show: true,
      });
      await refetch();
    } catch {
      setNotification({
        message: "Failed to update status",
        type: "error",
        show: true,
      });
    }
  };

  const closeNotification = () => {
    setNotification((prev) => ({ ...prev, show: false }));
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "draft":
        return "bg-blue-100 text-blue-500";
      case "awaiting_approval":
        return "bg-yellow-100 text-yellow-500";
      case "approved":
        return "bg-green-100 text-green-500";
      case "released":
        return "bg-purple-100 text-purple-500";
      case "done":
        return "bg-green-100 text-green-500";
      case "canceled":
      case "cancelled":
        return "bg-red-100 text-red-500";
      default:
        return "bg-gray-100 text-gray-500";
    }
  };

  const formatStatus = (status: string) => {
    if (status === "awaiting_approval") {
      return "Awaiting Approval";
    }
    return status.charAt(0).toUpperCase() + status.slice(1);
  };

  const getActionButtons = () => {
    if (!internalTransfer) return null;

    const { status } = internalTransfer;

    switch (status) {
      case "draft":
        return (
          <Button
            variant="contained"
            onClick={() =>
              handleStatusUpdate("awaiting_approval", "Sent for approval")
            }
            disabled={isUpdating}
            className="flex items-center gap-2 cursor-pointer"
          >
            {isUpdating ? "Updating..." : "Send for Approval"}
          </Button>
        );
      case "awaiting_approval":
        return (
          <div className="flex gap-2">
            <Button
              variant="contained"
              onClick={() =>
                handleStatusUpdate("approved", "Transfer confirmed")
              }
              disabled={isUpdating}
              className="flex items-center gap-2 cursor-pointer"
            >
              {isUpdating ? "Updating..." : "Confirm Transfer"}
            </Button>
            <Button
              variant="outline"
              onClick={() =>
                handleStatusUpdate("canceled", "Transfer cancelled")
              }
              disabled={isUpdating}
              className="flex items-center gap-2 cursor-pointer"
            >
              {isUpdating ? "Updating..." : "Cancel Transfer"}
            </Button>
          </div>
        );
      case "cancelled":
        return (
          <Button
            variant="contained"
            onClick={() => handleStatusUpdate("draft", "Converted to draft")}
            disabled={isUpdating}
            className="flex items-center gap-2 cursor-pointer"
          >
            {isUpdating ? "Updating..." : "Convert to Draft"}
          </Button>
        );
      case "approved":
        return (
          <Button
            variant="contained"
            onClick={() => handleStatusUpdate("released", "Marked as released")}
            disabled={isUpdating}
            className="flex items-center gap-2 cursor-pointer"
          >
            {isUpdating ? "Updating..." : "Mark as Released"}
          </Button>
        );
      case "released":
        return (
          <Button
            variant="contained"
            onClick={() => handleStatusUpdate("done", "Receipt confirmed")}
            disabled={isUpdating}
            className="flex items-center gap-2 cursor-pointer"
          >
            {isUpdating ? "Updating..." : "Confirm Receipt"}
          </Button>
        );
      case "done":
      default:
        return null;
    }
  };

  if (isLoading) {
    return (
      <main className="min-h-screen text-gray-800 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p>Loading internal transfer details...</p>
        </div>
      </main>
    );
  }

  if (error || !internalTransfer) {
    return (
      <main className="min-h-screen text-gray-800 flex items-center justify-center">
        <div className="text-center text-red-600">
          <p>Error loading internal transfer details</p>
          <p className="text-sm mt-2">
            The requested internal transfer could not be found.
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
    <PageGuard application="inventory" module="internaltransfer">
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
          title={`Internal Transfer: ${internalTransfer.id}`}
          isEdit={
            internalTransfer.status === "draft" ||
            internalTransfer.status === "cancelled"
              ? `/inventory/operation/internal_transfer/edit/${internalTransferId}`
              : undefined
          }
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
            <div>
              <span
                className={`px-3 py-1 rounded-full text-sm font-medium capitalize ${getStatusColor(
                  internalTransfer.status
                )}`}
              >
                {formatStatus(internalTransfer.status)}
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
              <h3 className="font-semibold">ID</h3>
              <p>{internalTransfer.id}</p>
            </div>

            <div>
              <h3 className="font-semibold">Date Created</h3>
              <p>
                {
                  new Date(internalTransfer.date_created)
                    .toISOString()
                    .split("T")[0]
                }
              </p>
            </div>

            <div>
              <h3 className="font-semibold">Source Location</h3>
              <p>
                {internalTransfer.source_location_details?.location_name ||
                  "N/A"}
              </p>
            </div>

            <div>
              <h3 className="font-semibold">Destination Location</h3>
              <p>
                {internalTransfer.destination_location_details?.location_name ||
                  "N/A"}
              </p>
            </div>
          </div>
        </motion.div>

        {/* Product Content Table */}
        <motion.div
          className="bg-white overflow-hidden p-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: "easeOut", delay: 0.4 }}
        >
          <div className="mb-4">
            <h2 className="text-lg font-medium text-blue-500">
              Product Content
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
                    Quantity to Transfer
                  </TableHead>
                  <TableHead className="px-6 py-3 text-center text-sm font-medium text-gray-500">
                    Unit of Measure
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {internalTransfer.internal_transfer_items?.map((item: any) => (
                  <TableRow key={item.id} className="hover:bg-gray-50">
                    <TableCell className="px-6 py-4 text-sm font-medium text-gray-900">
                      {item.product_details?.product_name || "N/A"}
                    </TableCell>
                    <TableCell className="px-6 py-4 text-sm text-center font-medium text-gray-900">
                      {item.quantity_requested}
                    </TableCell>
                    <TableCell className="px-6 py-4 text-sm text-center text-gray-900">
                      {item.product_details?.unit_of_measure_details
                        ?.unit_symbol || "N/A"}
                    </TableCell>
                  </TableRow>
                )) || (
                  <TableRow>
                    <TableCell
                      colSpan={3}
                      className="px-6 py-8 text-center text-gray-500"
                    >
                      No items found
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </motion.div>

        {/* Action buttons */}
        {getActionButtons() && (
          <div className="flex justify-end items-center px-6 py-4 border-b">
            <div className="flex gap-2">{getActionButtons()}</div>
          </div>
        )}
      </motion.main>

      {/* Notification */}
      <ToastNotification
        message={notification.message}
        type={notification.type}
        show={notification.show}
        onClose={closeNotification}
      />
    </PageGuard>
  </motion.div>
  );
}
