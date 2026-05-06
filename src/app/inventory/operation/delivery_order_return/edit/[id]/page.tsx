"use client";

import React, { useMemo, useRef, useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useRouter, useParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { PageHeader } from "@/components/purchase/products/PageHeader";
import { BreadcrumbItem } from "@/types/purchase";
import {
  usePatchDeliveryOrderReturnMutation,
  useGetDeliveryOrderReturnQuery,
} from "@/api/inventory/deliveryOrderReturnApi";
import { useGetDeliveryOrdersQuery } from "@/api/inventory/deliveryOrderApi";
import { useGetDeliveryOrderQuery } from "@/api/inventory/deliveryOrderApi";
import { ToastNotification } from "@/components/shared/ToastNotification";
import { useSelector } from "react-redux";
import { RootState } from "@/lib/store/store";
import { Button } from "@/components/ui/button";
import { z } from "zod";
import type { Resolver } from "react-hook-form";
import { DeliveryOrderReturnItem } from "@/types/deliveryOrderReturn";
import { PageGuard } from "@/components/auth/PageGuard";

// Form schema for delivery order return editing
const deliveryOrderReturnSchema = z.object({
  source_document: z.string().min(1, "Source document is required"),
  source_location: z.string().min(1, "Source location is required"),
  return_warehouse_location: z
    .string()
    .min(1, "Return warehouse location is required"),
  date_of_return: z.string().min(1, "Date of return is required"),
  reason_for_return: z.string().min(1, "Reason for return is required"),
});

type DeliveryOrderReturnFormData = {
  source_document: string;
  source_location: string;
  return_warehouse_location: string;
  date_of_return: string;
  reason_for_return: string;
};

type DeliveryOrderReturnLineItem = {
  id: string;
  returned_product_item: number;
  product_name: string;
  initial_quantity: number;
  returned_quantity: string;
};

const initialItems: DeliveryOrderReturnLineItem[] = [];

export default function EditDeliveryOrderReturnPage() {
  const router = useRouter();
  const params = useParams();
  const deliveryOrderReturnId = params.id as string;
  const formRef = useRef<HTMLFormElement>(null);

  // API mutations and queries
  const [patchDeliveryOrderReturn, { isLoading: isPatching }] =
    usePatchDeliveryOrderReturnMutation();
  const {
    data: deliveryOrderReturn,
    isLoading: isLoadingDeliveryOrderReturn,
    error: deliveryOrderReturnError,
  } = useGetDeliveryOrderReturnQuery(deliveryOrderReturnId);
  const { data: deliveryOrders, isLoading: isLoadingDeliveryOrders } =
    useGetDeliveryOrdersQuery({ status: "done" });

  // Form state
  const [items, setItems] =
    useState<DeliveryOrderReturnLineItem[]>(initialItems);
  const [selectedSourceDocument, setSelectedSourceDocument] =
    useState<string>("");
  const [formPopulated, setFormPopulated] = useState(false);
  const [returnWarehouseLocationId, setReturnWarehouseLocationId] =
    useState<string>("");

  // Get selected delivery order details
  const { data: selectedDeliveryOrder, isLoading: isLoadingSelectedOrder } =
    useGetDeliveryOrderQuery(selectedSourceDocument, {
      skip: !selectedSourceDocument,
    });

  // React Hook Form setup
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
    reset,
  } = useForm<DeliveryOrderReturnFormData>({
    resolver: zodResolver(
      deliveryOrderReturnSchema
    ) as Resolver<DeliveryOrderReturnFormData>,
    defaultValues: {
      source_document: "",
      source_location: "",
      return_warehouse_location: "",
      date_of_return: "",
      reason_for_return: "",
    },
  });

  // Populate form when delivery order return data is loaded
  useEffect(() => {
    if (deliveryOrderReturn) {
      // Small delay to ensure all data is ready
      const setTimeoutId = setTimeout(() => {
        // Reset form with loaded data
        reset({
          source_document: deliveryOrderReturn.source_document.toString(),
          source_location: deliveryOrderReturn.source_location,
          return_warehouse_location:
            deliveryOrderReturn.return_warehouse_location_details.location_name,
          date_of_return: deliveryOrderReturn.date_of_return.split("T")[0], // Format for date input
          reason_for_return: deliveryOrderReturn.reason_for_return,
        });

        setSelectedSourceDocument(
          deliveryOrderReturn.source_document.toString()
        );
        setReturnWarehouseLocationId(
          deliveryOrderReturn.return_warehouse_location
        );

        // Populate items
        if (
          deliveryOrderReturn.delivery_order_return_items &&
          deliveryOrderReturn.delivery_order_return_items.length > 0
        ) {
          // We need to get product names from the original delivery order
          // For now, we'll use placeholder names or fetch them
          const populatedItems =
            deliveryOrderReturn.delivery_order_return_items.map(
              (item: DeliveryOrderReturnItem, index: number) => ({
                id: (index + 1).toString(),
                returned_product_item: item.returned_product_item,
                product_name: `Product ${item.returned_product_item}`, // Placeholder, should fetch actual name
                initial_quantity: item.initial_quantity,
                returned_quantity: item.returned_quantity.toString(),
              })
            );
          setItems(populatedItems);
        }
        setFormPopulated(true);
      }, 800);

      return () => clearTimeout(setTimeoutId);
    }
  }, [deliveryOrderReturn, reset]);

  // Effect to populate items when delivery order is loaded (for product names)
  useEffect(() => {
    if (selectedDeliveryOrder && deliveryOrderReturn) {
      const populatedItems =
        deliveryOrderReturn.delivery_order_return_items.map(
          (returnItem: DeliveryOrderReturnItem, index: number) => {
            const originalItem =
              selectedDeliveryOrder.delivery_order_items.find(
                (item: any) =>
                  item.product_details.id === returnItem.returned_product_item
              );
            return {
              id: (index + 1).toString(),
              returned_product_item: returnItem.returned_product_item,
              product_name:
                originalItem?.product_details?.product_name ||
                `Product ${returnItem.returned_product_item}`,
              initial_quantity: returnItem.initial_quantity,
              returned_quantity: returnItem.returned_quantity.toString(),
            };
          }
        );
      setItems(populatedItems);
    }
  }, [selectedDeliveryOrder, deliveryOrderReturn]);

  const addRow = () =>
    setItems((prev) => [
      ...prev,
      {
        id: Date.now().toString(),
        returned_product_item: 0,
        product_name: "",
        initial_quantity: 0,
        returned_quantity: "",
      },
    ]);

  const removeRow = (id: string) =>
    setItems((prev) => prev.filter((p) => p.id !== id));

  const updateItem = (
    id: string,
    patch: Partial<DeliveryOrderReturnLineItem>
  ) =>
    setItems((prev) =>
      prev.map((it) => (it.id === id ? { ...it, ...patch } : it))
    );

  const loggedInUser = useSelector((state: RootState) => state.auth.user);

  // Notification state
  const [notification, setNotification] = React.useState<{
    message: string;
    type: "success" | "error";
    show: boolean;
  }>({
    message: "",
    type: "success",
    show: false,
  });

  // Convert API data to option format
  const sourceDocumentOptions = useMemo(() => {
    if (!deliveryOrders) return [];
    return deliveryOrders.map((order) => ({
      value: order.id.toString(),
      label: order.order_unique_id,
    }));
  }, [deliveryOrders]);

  const breadcrumsItem: BreadcrumbItem[] = [
    { label: "Home", href: "/" },
    { label: "Inventory", href: "/inventory" },
    { label: "Operation", href: "/inventory/operation" },
    {
      label: "Delivery Order Return",
      href: "/inventory/operation/delivery_order_return",
    },
    {
      label: deliveryOrderReturn?.unique_record_id || "Edit",
      href: `/inventory/operation/delivery_order_return/edit/${deliveryOrderReturnId}`,
      current: true,
    },
  ];

  // Helper function to validate and prepare data
  const prepareSubmissionData = (
    data: DeliveryOrderReturnFormData
  ): any | null => {
    const validItems = items.filter(
      (item) => item.returned_quantity && parseFloat(item.returned_quantity) > 0
    );

    if (validItems.length === 0) {
      return null;
    }

    return {
      source_document: parseInt(data.source_document),
      date_of_return: data.date_of_return,
      source_location: data.source_location,
      return_warehouse_location: returnWarehouseLocationId,
      reason_for_return: data.reason_for_return,
      delivery_order_return_items: validItems.map((item) => ({
        returned_product_item: item.returned_product_item,
        initial_quantity: item.initial_quantity,
        returned_quantity: parseFloat(item.returned_quantity),
      })),
    };
  };

  // Save delivery order return
  async function onSave(data: DeliveryOrderReturnFormData): Promise<void> {
    const deliveryOrderReturnData = prepareSubmissionData(data);

    if (!deliveryOrderReturnData) {
      setNotification({
        message: "Please add at least one valid item with quantity to return",
        type: "error",
        show: true,
      });
      return;
    }

    try {
      await patchDeliveryOrderReturn({
        id: deliveryOrderReturnId,
        data: deliveryOrderReturnData,
      }).unwrap();

      setNotification({
        message: "Delivery order return updated successfully!",
        type: "success",
        show: true,
      });

      setTimeout(() => {
        router.push(
          `/inventory/operation/delivery_order_return/${deliveryOrderReturnId}`
        );
      }, 1500);
    } catch (error: unknown) {
      let errorMessage =
        "Failed to update delivery order return. Please try again.";

      if (error && typeof error === "object" && "data" in error) {
        const apiError = error as {
          data?: { detail?: string; message?: string };
        };
        errorMessage =
          apiError.data?.detail || apiError.data?.message || errorMessage;
      }

      setNotification({
        message: errorMessage,
        type: "error",
        show: true,
      });
    }
  }

  // Close notification
  function closeNotification() {
    setNotification((prev) => ({ ...prev, show: false }));
  }

  const isAdmin = false; // TODO: Fix user type

  if (isLoadingDeliveryOrderReturn) {
    return (
      <main className="min-h-screen text-gray-800 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p>Loading delivery order return...</p>
        </div>
      </main>
    );
  }

  if (deliveryOrderReturnError || !deliveryOrderReturn) {
    return (
      <main className="min-h-screen text-gray-800 flex items-center justify-center">
        <div className="text-center text-red-600">
          <p>Error loading delivery order return</p>
          <p className="text-sm mt-2">
            The requested delivery order return could not be found.
          </p>
          <Button
            onClick={() =>
              router.push("/inventory/operation/delivery_order_return")
            }
            className="mt-4"
          >
            Back to Delivery Order Returns
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
          title={`Edit Delivery Order Return: ${deliveryOrderReturn.unique_record_id}`}
        />
      </motion.div>

      {/* Main form area */}
      <motion.main
        className="h-full mx-auto px-6 py-8 bg-white"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut", delay: 0.2 }}
      >
        <form ref={formRef} className="bg-white">
          <motion.h2
            className="text-lg font-medium text-blue-500 mb-6"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4, ease: "easeOut", delay: 0.3 }}
          >
            Basic Information
          </motion.h2>

          {/* Form fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Source Document *
              </label>
              <select
                {...register("source_document")}
                disabled // Source document is not editable
                className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 cursor-not-allowed"
              >
                <option value={deliveryOrderReturn.source_document.toString()}>
                  {sourceDocumentOptions.find(
                    (option) =>
                      option.value ===
                      deliveryOrderReturn.source_document.toString()
                  )?.label || deliveryOrderReturn.source_document}
                </option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Source Location
              </label>
              <input
                {...register("source_location")}
                type="text"
                readOnly
                className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Return Warehouse Location
              </label>
              <input
                {...register("return_warehouse_location")}
                type="text"
                readOnly
                className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Date of Return *
              </label>
              <input
                {...register("date_of_return")}
                type="date"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              {errors.date_of_return && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.date_of_return.message}
                </p>
              )}
            </div>
          </div>

          <div className="mb-8">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Reason for Return *
            </label>
            <textarea
              {...register("reason_for_return")}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter reason for return"
            />
            {errors.reason_for_return && (
              <p className="text-red-500 text-sm mt-1">
                {errors.reason_for_return.message}
              </p>
            )}
          </div>

          {/* Items table */}
          <motion.h2
            className="text-lg font-medium text-blue-500 mb-6"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4, ease: "easeOut", delay: 0.4 }}
          >
            Items to Return
          </motion.h2>

          <div className="overflow-x-auto">
            <table className="min-w-full bg-white border border-gray-300">
              <thead>
                <tr className="bg-gray-50">
                  <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">
                    Product Name
                  </th>
                  <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">
                    Initial Quantity
                  </th>
                  <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">
                    Quantity to Return
                  </th>
                  <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {items.map((item) => (
                  <tr key={item.id} className="border-t border-gray-300">
                    <td className="px-4 py-2 text-sm text-gray-900">
                      {item.product_name}
                    </td>
                    <td className="px-4 py-2 text-sm text-gray-900">
                      {item.initial_quantity}
                    </td>
                    <td className="px-4 py-2">
                      <input
                        type="number"
                        value={item.returned_quantity}
                        onChange={(e) =>
                          updateItem(item.id, {
                            returned_quantity: e.target.value,
                          })
                        }
                        className="w-full px-2 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        min="0"
                        max={item.initial_quantity}
                        aria-label={`Quantity to return for ${item.product_name}`}
                      />
                    </td>
                    <td className="px-4 py-2">
                      <button
                        type="button"
                        onClick={() => removeRow(item.id)}
                        className="text-red-500 hover:text-red-700"
                      >
                        Remove
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Form actions */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: "easeOut", delay: 0.6 }}
            className="flex justify-end gap-4 mt-8"
          >
            {isAdmin ? (
              <>
                <Button
                  type="button"
                  disabled={isPatching}
                  onClick={handleSubmit(onSave)}
                  variant="outline"
                >
                  Cancel
                </Button>
                <Button
                  type="button"
                  disabled={isPatching}
                  onClick={handleSubmit(onSave)}
                  variant="contained"
                >
                  {isPatching ? "Patching..." : "Validate"}
                </Button>
              </>
            ) : (
              <Button
                type="button"
                disabled={isPatching}
                onClick={handleSubmit(onSave)}
                variant="contained"
              >
                {isPatching ? "Patching..." : "Update"}
              </Button>
            )}
          </motion.div>
        </form>
      </motion.main>

      {/* Notification */}
      <ToastNotification
        message={notification.message}
        type={notification.type}
        show={notification.show}
        onClose={closeNotification}
      />
    </motion.div>
    </PageGuard>
  );
}
