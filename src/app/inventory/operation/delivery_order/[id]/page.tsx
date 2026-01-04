"use client";

import React from "react";
import { useParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { PageHeader } from "@/components/purchase/products/PageHeader";
import { BreadcrumbItem } from "@/types/purchase";
import {
  useGetDeliveryOrderQuery,
  useConfirmDeliveryOrderMutation,
  useCheckDeliveryOrderAvailabilityMutation,
} from "@/api/inventory/deliveryOrderApi";
import { DeliveryOrderItem } from "@/types/deiveryOrder";
import { useGetUsersQuery } from "@/api/settings/usersApi";
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
import { ToastNotification } from "@/components/shared/ToastNotification";

export default function DeliveryOrderDetailPage() {
  const router = useRouter();
  const params = useParams();
  const deliveryOrderId = params.id as string;

  const {
    data: deliveryOrder,
    isLoading,
    error,
  } = useGetDeliveryOrderQuery(deliveryOrderId);
  const { data: users } = useGetUsersQuery();

  const [notification, setNotification] = React.useState<{
    message: string;
    type: "success" | "error";
    show: boolean;
  }>({
    message: "",
    type: "success",
    show: false,
  });

  const [confirmDelivery, { isLoading: isConfirming }] =
    useConfirmDeliveryOrderMutation();

  const [checkAvailability, { isLoading: isChecking }] =
    useCheckDeliveryOrderAvailabilityMutation();

  // Removed isCheckingAvailability state, using mutation's isLoading instead

  const breadcrumsItem: BreadcrumbItem[] = [
    { label: "Home", href: "/" },
    { label: "Inventory", href: "/inventory" },
    {
      label: "Operation",
      href: "/inventory/operation",
    },
    {
      label: "Delivery Order",
      href: "/inventory/operation/delivery_order",
    },
    {
      label: deliveryOrder?.order_unique_id || "Detail",
      href: `/inventory/operation/delivery_order/${deliveryOrderId}`,
      current: true,
    },
  ];

  const handleCheckAvailability = async () => {
    try {
      const result = await checkAvailability(deliveryOrderId).unwrap();

      if (result.status === "waiting") {
        setNotification({
          message: "Waiting: Stock is not enough. Please check back later",
          type: "error",
          show: true,
        });
      } else if (result.status === "ready") {
        setNotification({
          message: "Available: Proceed to confirm delivery order",
          type: "success",
          show: true,
        });
      }
      // UI will update automatically due to cache invalidation
    } catch {
      setNotification({
        message: "Failed to check availability",
        type: "error",
        show: true,
      });
    }
  };

  const handleConfirmDelivery = async () => {
    try {
      await confirmDelivery(deliveryOrderId).unwrap();
      setNotification({
        message: "Successful: Delivery order is done",
        type: "success",
        show: true,
      });
      // UI will update automatically due to cache invalidation
    } catch {
      setNotification({
        message: "Failed to confirm delivery order",
        type: "error",
        show: true,
      });
    }
  };

  const closeNotification = () => {
    setNotification((prev) => ({ ...prev, show: false }));
  };

  const userOptions =
    users?.map((user) => ({
      value: user.id.toString(),
      label: `${user.first_name} ${user.last_name}`,
    })) || [];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "done":
        return "bg-purple-100 text-purple-500";
      case "ready":
        return "bg-green-100 text-green-500";
      case "waiting":
        return "bg-yellow-100 text-yellow-500";
      case "draft":
        return "bg-blue-100 text-blue-500";
      default:
        return "bg-gray-100 text-gray-500";
    }
  };

  if (isLoading) {
    return (
      <main className="min-h-screen text-gray-800 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p>Loading delivery order details...</p>
        </div>
      </main>
    );
  }

  if (error || !deliveryOrder) {
    return (
      <main className="min-h-screen text-gray-800 flex items-center justify-center">
        <div className="text-center text-red-600">
          <p>Error loading delivery order details</p>
          <p className="text-sm mt-2">
            The requested delivery order could not be found.
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
          title={`Delivery Order: ${deliveryOrder.order_unique_id}`}
          isEdit={
            deliveryOrder.status === "draft" ||
            deliveryOrder.status === "waiting"
              ? `/inventory/operation/delivery_order/edit/${deliveryOrderId}`
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
                  deliveryOrder.status
                )}`}
              >
                {deliveryOrder.status}
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
              <h3 className="font-semibold">Order ID</h3>
              <p>{deliveryOrder.order_unique_id}</p>
            </div>

            <div>
              <h3 className="font-semibold">Customer Name</h3>
              <p>{deliveryOrder.customer_name}</p>
            </div>

            <div>
              <h3 className="font-semibold">Date Created</h3>
              <p>
                {
                  new Date(deliveryOrder.date_created)
                    .toISOString()
                    .split("T")[0]
                }
              </p>
            </div>

            <div>
              <h3 className="font-semibold">Source Location</h3>
              <p>
                {deliveryOrder.source_location_details?.location_name || "N/A"}
              </p>
            </div>

            <div>
              <h3 className="font-semibold">Delivery Address</h3>
              <p>{deliveryOrder.delivery_address}</p>
            </div>

            <div>
              <h3 className="font-semibold">Delivery Date</h3>
              <p>
                {
                  new Date(deliveryOrder.delivery_date)
                    .toISOString()
                    .split("T")[0]
                }
              </p>
            </div>

            <div>
              <h3 className="font-semibold">Assigned To</h3>
              <p>
                {userOptions.find(
                  (user) => user.value === deliveryOrder.assigned_to
                )?.label || deliveryOrder.assigned_to}
              </p>
            </div>

            <div>
              <h3 className="font-semibold">Shipping Policy</h3>
              <p>{deliveryOrder.shipping_policy || "No shipping policy"}</p>
            </div>

            <div>
              <h3 className="font-semibold">Return Policy</h3>
              <p>{deliveryOrder.return_policy || "No return policy"}</p>
            </div>
          </div>
        </motion.div>

        {/* Delivery Order Items Table */}
        <motion.div
          className="bg-white overflow-hidden p-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: "easeOut", delay: 0.4 }}
        >
          <div className="mb-4">
            <h2 className="text-lg font-medium text-blue-500">
              Delivery Order Items
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
                    Quantity to Deliver
                  </TableHead>
                  <TableHead className="px-6 py-3 text-center text-sm font-medium text-gray-500">
                    Unit Price
                  </TableHead>
                  <TableHead className="px-6 py-3 text-center text-sm font-medium text-gray-500">
                    Total Price
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {deliveryOrder.delivery_order_items?.map(
                  (item: DeliveryOrderItem) => (
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
                        {item.quantity_to_deliver}
                      </TableCell>
                      <TableCell className="px-6 py-4 text-sm text-center font-medium text-gray-900">
                        {item.unit_price}
                      </TableCell>
                      <TableCell className="px-6 py-4 text-sm text-center font-medium text-gray-900">
                        {item.total_price}
                      </TableCell>
                    </TableRow>
                  )
                ) || (
                  <TableRow>
                    <TableCell
                      colSpan={6}
                      className="px-6 py-8 text-center text-gray-500"
                    >
                      No delivery order items found
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </motion.div>

        {/* Action buttons */}
        <div className="flex justify-end items-center px-6 py-4 border-b">
          <div className="flex gap-2">
            {(deliveryOrder.status === "draft" ||
              deliveryOrder.status === "waiting") && (
              <Button
                variant="contained"
                onClick={handleCheckAvailability}
                disabled={isChecking}
                className="flex items-center gap-2 cursor-pointer"
              >
                {isChecking ? "Checking..." : "Check Availability"}
              </Button>
            )}
            {deliveryOrder.status === "ready" && (
              <Button
                variant="contained"
                onClick={handleConfirmDelivery}
                disabled={isConfirming}
                className="flex items-center gap-2 cursor-pointer"
              >
                {isConfirming ? "Confirming..." : "Proceed"}
              </Button>
            )}
          </div>
        </div>
      </motion.main>

      {/* Notification */}
      <ToastNotification
        message={notification.message}
        type={notification.type}
        show={notification.show}
        onClose={closeNotification}
      />
    </motion.div>
  );
}
