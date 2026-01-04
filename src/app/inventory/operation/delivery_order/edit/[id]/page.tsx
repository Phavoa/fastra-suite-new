"use client";

import React, { useMemo, useRef, useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useRouter, useParams } from "next/navigation";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { PageHeader } from "@/components/purchase/products/PageHeader";
import { BreadcrumbItem } from "@/types/purchase";
import {
  useUpdateDeliveryOrderMutation,
  useGetDeliveryOrderQuery,
} from "@/api/inventory/deliveryOrderApi";
import { useGetActiveLocationsQuery } from "@/api/inventory/locationApi";
import { useGetLocationStockLevelsQuery } from "@/api/inventory/locationApi";
import { useGetUsersQuery } from "@/api/settings/usersApi";
import { ToastNotification } from "@/components/shared/ToastNotification";
import {
  FadeIn,
  SlideUp,
  StaggerContainer,
} from "@/components/shared/AnimatedWrapper";
import { StockLevelItem } from "@/types/location";
import { useSelector } from "react-redux";
import { RootState } from "@/lib/store/store";
import { Button } from "@/components/ui/button";
import { z } from "zod";
import type { Resolver } from "react-hook-form";
import DeliveryOrderForm from "../../components/DeliveryOrderForm";
import DeliveryOrderItemsTable from "../../components/DeliveryOrderItemsTable";
import {
  Option,
  DeliveryOrderLineItem,
  DeliveryOrderFormData,
  DeliveryOrderSubmissionData,
} from "../../components/types";

// Form schema for delivery order creation
const deliveryOrderSchema = z.object({
  source_location: z.string().min(1, "Source location is required"),
  customer_name: z.string().min(1, "Customer name is required"),
  delivery_address: z.string().min(1, "Delivery address is required"),
  delivery_date: z.string().min(1, "Delivery date is required"),
  shipping_policy: z.string().optional(),
  return_policy: z.string().optional(),
  assigned_to: z.string().min(1, "Assigned to is required"),
});

const initialItems: DeliveryOrderLineItem[] = [
  {
    id: "1",
    product: "",
    product_details: {
      product_name: "",
      unit_of_measure_details: {
        unit_symbol: "",
      },
    },
    quantity_to_deliver: "",
    unit_price: "",
    total_price: "",
  },
];

export default function EditDeliveryOrderPage() {
  const router = useRouter();
  const params = useParams();
  const deliveryOrderId = params.id as string;
  const formRef = useRef<HTMLFormElement>(null);

  // API mutations and queries
  const [updateDeliveryOrder, { isLoading: isUpdating }] =
    useUpdateDeliveryOrderMutation();
  const {
    data: deliveryOrder,
    isLoading: isLoadingDeliveryOrder,
    error: deliveryOrderError,
  } = useGetDeliveryOrderQuery(deliveryOrderId);
  const { data: locations, isLoading: isLoadingLocations } =
    useGetActiveLocationsQuery();
  const { data: users, isLoading: isLoadingUsers } = useGetUsersQuery();

  // Form state
  const [items, setItems] = useState<DeliveryOrderLineItem[]>(initialItems);
  const [selectedSourceLocation, setSelectedSourceLocation] =
    useState<string>("");
  const [formPopulated, setFormPopulated] = useState(false);

  // React Hook Form setup
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    control,
    formState: { errors },
    reset,
  } = useForm<DeliveryOrderFormData>({
    resolver: zodResolver(
      deliveryOrderSchema
    ) as Resolver<DeliveryOrderFormData>,
    defaultValues: {
      source_location: "",
      customer_name: "",
      delivery_address: "",
      delivery_date: "",
      shipping_policy: "",
      return_policy: "",
      assigned_to: "",
    },
  });

  // Get stock levels for selected source location
  const { data: stockLevels, isLoading: isLoadingStockLevels } =
    useGetLocationStockLevelsQuery(selectedSourceLocation, {
      skip: !selectedSourceLocation,
    });

  // Populate form when delivery order data is loaded
  useEffect(() => {
    if (deliveryOrder) {
      // Reset form with loaded data
      reset({
        source_location: deliveryOrder.source_location.toString(),
        customer_name: deliveryOrder.customer_name,
        delivery_address: deliveryOrder.delivery_address,
        delivery_date: deliveryOrder.delivery_date.split("T")[0], // Format for date input
        shipping_policy: deliveryOrder.shipping_policy || "",
        return_policy: deliveryOrder.return_policy || "",
        assigned_to: deliveryOrder.assigned_to.toString(),
      });

      setSelectedSourceLocation(deliveryOrder.source_location.toString());

      // Populate items
      if (
        deliveryOrder.delivery_order_items &&
        deliveryOrder.delivery_order_items.length > 0
      ) {
        const populatedItems = deliveryOrder.delivery_order_items.map(
          (
            item: {
              product_details?: {
                id?: number;
                product_name?: string;
                unit_of_measure_details?: { unit_symbol?: string };
              };
              quantity_to_deliver?: number;
              unit_price?: number;
              total_price?: number;
            },
            index: number
          ) => ({
            id: (index + 1).toString(),
            product: item.product_details?.id?.toString() || "",
            product_details: {
              product_name: item.product_details?.product_name || "",
              unit_of_measure_details: {
                unit_symbol:
                  item.product_details?.unit_of_measure_details?.unit_symbol ||
                  "",
              },
            },
            quantity_to_deliver: item.quantity_to_deliver?.toString() || "",
            unit_price: item.unit_price?.toString() || "",
            total_price: item.total_price?.toString() || "",
          })
        );
        setItems(populatedItems);
      }
      setFormPopulated(true);
    }
  }, [deliveryOrder, reset]);

  const addRow = () =>
    setItems((prev) => [
      ...prev,
      {
        id: Date.now().toString(),
        product: "",
        product_details: {
          product_name: "",
          unit_of_measure_details: {
            unit_symbol: "",
          },
        },
        quantity_to_deliver: "",
        unit_price: "",
        total_price: "",
      },
    ]);

  const removeRow = (id: string) =>
    setItems((prev) => prev.filter((p) => p.id !== id));

  const updateItem = (id: string, patch: Partial<DeliveryOrderLineItem>) =>
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
  const locationOptions: Option[] =
    locations?.map((location) => ({
      value: location.id.toString(),
      label: `${location.location_name} (${location.location_code})`,
    })) || [];

  const userOptions: Option[] =
    users?.map((user) => ({
      value: user.id.toString(),
      label: `${user.first_name} ${user.last_name}`,
    })) || [];

  // Product options from stock levels
  const productOptions: Option[] = useMemo(() => {
    if (!stockLevels) return [];
    return stockLevels.map((product: StockLevelItem) => ({
      value: product.product_id.toString(),
      label: product.product_name,
    }));
  }, [stockLevels]);

  const breadcrumsItem: BreadcrumbItem[] = [
    { label: "Home", href: "/" },
    { label: "Inventory", href: "/inventory" },
    { label: "Operation", href: "/inventory/operation" },
    {
      label: "Delivery Order",
      href: "/inventory/operation/delivery_order",
    },
    {
      label: deliveryOrder?.order_unique_id || "Edit",
      href: `/inventory/operation/delivery_order/edit/${deliveryOrderId}`,
      current: true,
    },
  ];

  // Helper function to validate and prepare data
  const prepareSubmissionData = (
    data: DeliveryOrderFormData
  ): DeliveryOrderSubmissionData | null => {
    const validItems = items.filter(
      (item) => item.product && item.quantity_to_deliver && item.unit_price
    );

    if (validItems.length === 0) {
      return null;
    }

    return {
      source_location: data.source_location,
      customer_name: data.customer_name,
      delivery_address: data.delivery_address,
      delivery_date: data.delivery_date,
      shipping_policy: data.shipping_policy || null,
      return_policy: data.return_policy || null,
      assigned_to: parseInt(data.assigned_to),
      delivery_order_items: validItems.map((item) => ({
        product_item: parseInt(item.product),
        quantity_to_deliver: parseFloat(item.quantity_to_deliver),
        unit_price: parseFloat(item.unit_price),
        total_price: parseFloat(item.total_price),
      })),
    };
  };

  // Save delivery order
  async function onSave(data: DeliveryOrderFormData): Promise<void> {
    const deliveryOrderData = prepareSubmissionData(data);

    if (!deliveryOrderData) {
      setNotification({
        message:
          "Please add at least one valid item with product, quantity to deliver, and unit price",
        type: "error",
        show: true,
      });
      return;
    }

    try {
      await updateDeliveryOrder({
        id: deliveryOrderId,
        data: deliveryOrderData,
      }).unwrap();

      setNotification({
        message: "Delivery order updated successfully!",
        type: "success",
        show: true,
      });

      setTimeout(() => {
        router.push(`/inventory/operation/delivery_order/${deliveryOrderId}`);
      }, 1500);
    } catch (error: unknown) {
      let errorMessage = "Failed to update delivery order. Please try again.";

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

  // Function to get product details when a product is selected
  const getProductDetails = (productId: string) => {
    if (!stockLevels) {
      return {
        product_name: "",
        unit_of_measure_details: {
          unit_symbol: "N/A",
        },
      };
    }
    const product = stockLevels.find(
      (p: StockLevelItem) => p.product_id.toString() === productId
    );
    return {
      product_name: product?.product_name || "",
      unit_of_measure_details: {
        unit_symbol: product?.product_unit_of_measure || "N/A",
      },
    };
  };

  // Enhanced updateItem function that also populates product details and calculates total
  const updateItemWithProductDetails = (
    id: string,
    patch: Partial<DeliveryOrderLineItem>
  ) => {
    setItems((prev) =>
      prev.map((it) => {
        if (it.id === id) {
          const updatedItem = { ...it, ...patch };

          // If product is being updated, populate product details
          if (patch.product && patch.product !== it.product) {
            const productDetails = getProductDetails(patch.product);
            updatedItem.product_details = productDetails;
          }

          // Calculate total price
          const quantity = parseFloat(updatedItem.quantity_to_deliver || "0");
          const unitPrice = parseFloat(updatedItem.unit_price || "0");
          updatedItem.total_price = (quantity * unitPrice).toFixed(2);

          return updatedItem;
        }
        return it;
      })
    );
  };

  if (isLoadingDeliveryOrder) {
    return (
      <main className="min-h-screen text-gray-800 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p>Loading delivery order...</p>
        </div>
      </main>
    );
  }

  if (deliveryOrderError || !deliveryOrder) {
    return (
      <main className="min-h-screen text-gray-800 flex items-center justify-center">
        <div className="text-center text-red-600">
          <p>Error loading delivery order</p>
          <p className="text-sm mt-2">
            The requested delivery order could not be found.
          </p>
          <Button
            onClick={() => router.push("/inventory/operation/delivery_order")}
            className="mt-4"
          >
            Back to Delivery Orders
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
          title={`Edit Delivery Order: ${deliveryOrder.order_unique_id}`}
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

          <DeliveryOrderForm
            register={register}
            setValue={setValue}
            watch={watch}
            control={control}
            errors={errors}
            locationOptions={locationOptions}
            userOptions={userOptions}
            isLoadingLocations={isLoadingLocations}
            isLoadingUsers={isLoadingUsers}
            onSourceLocationChange={setSelectedSourceLocation}
          />

          <DeliveryOrderItemsTable
            items={items}
            productOptions={productOptions}
            isLoadingStockLevels={isLoadingStockLevels}
            selectedSourceLocation={selectedSourceLocation}
            addRow={addRow}
            removeRow={removeRow}
            updateItemWithProductDetails={updateItemWithProductDetails}
            formPopulated={formPopulated}
          />

          {/* Form actions */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: "easeOut", delay: 0.6 }}
            className="flex justify-end gap-4 mt-8"
          >
            <Button
              type="button"
              disabled={isUpdating}
              onClick={handleSubmit(onSave)}
              variant="contained"
            >
              {isUpdating ? "Updating..." : "Update Delivery Order"}
            </Button>
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
  );
}
