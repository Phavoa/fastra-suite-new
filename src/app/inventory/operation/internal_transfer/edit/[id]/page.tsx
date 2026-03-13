"use client";

import React, { useMemo, useRef, useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useRouter, useParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { PageHeader } from "@/components/purchase/products/PageHeader";
import { BreadcrumbItem } from "@/types/purchase";
import {
  usePatchInternalTransferMutation,
  useGetInternalTransferQuery,
} from "@/api/inventory/internalTransferApi";
import {
  useGetOtherLocationsForUserQuery,
  useGetAllUserLocationsQuery,
  useGetLocationStockLevelsQuery,
} from "@/api/inventory/locationApi";
import { ToastNotification } from "@/components/shared/ToastNotification";
import { StockLevelItem } from "@/types/location";
import { useSelector } from "react-redux";
import { RootState } from "@/lib/store/store";
import { Button } from "@/components/ui/button";
import { z } from "zod";
import type { Resolver } from "react-hook-form";
import InternalTransferForm from "../../components/InternalTransferForm";
import InternalTransferItemsTable from "../../components/InternalTransferItemsTable";
import {
  Option,
  InternalTransferLineItem,
  InternalTransferFormData,
  InternalTransferSubmissionData,
} from "@/types/internalTransfer";

// Form schema for internal transfer editing
const internalTransferSchema = z
  .object({
    source_location: z.string().min(1, "Source location is required"),
    destination_location: z.string().min(1, "Destination location is required"),
  })
  .refine((data) => data.source_location !== data.destination_location, {
    message: "Source and destination locations cannot be the same",
    path: ["destination_location"],
  });

const initialItems: InternalTransferLineItem[] = [
  {
    id: "1",
    product: "",
    product_details: {
      product_name: "",
      unit_of_measure_details: {
        unit_symbol: "",
      },
    },
    quantity_requested: "",
  },
];

export default function EditInternalTransferPage() {
  const router = useRouter();
  const params = useParams();
  const internalTransferId = params.id as string;
  const formRef = useRef<HTMLFormElement>(null);

  // API mutations and queries
  const [patchInternalTransfer, { isLoading: isPatching }] =
    usePatchInternalTransferMutation();
  const {
    data: internalTransfer,
    isLoading: isLoadingInternalTransfer,
    error: internalTransferError,
  } = useGetInternalTransferQuery(internalTransferId);
  const { data: sourceLocations, isLoading: isLoadingSourceLocations } =
    useGetOtherLocationsForUserQuery();
  const {
    data: destinationLocations,
    isLoading: isLoadingDestinationLocations,
  } = useGetAllUserLocationsQuery();

  // Form state
  const [items, setItems] = useState<InternalTransferLineItem[]>(initialItems);
  const [selectedSourceLocation, setSelectedSourceLocation] =
    useState<string>("");
  const [selectedDestinationLocation, setSelectedDestinationLocation] =
    useState<string>("");
  const [formPopulated, setFormPopulated] = useState(false);

  // React Hook Form setup
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
    reset,
  } = useForm<InternalTransferFormData>({
    resolver: zodResolver(
      internalTransferSchema
    ) as Resolver<InternalTransferFormData>,
    defaultValues: {
      source_location: "",
      destination_location: "",
    },
  });

  // Get stock levels for selected source location
  const { data: stockLevels, isLoading: isLoadingStockLevels } =
    useGetLocationStockLevelsQuery(selectedSourceLocation, {
      skip: !selectedSourceLocation,
    });

  // Populate form when internal transfer data is loaded
  useEffect(() => {
    if (internalTransfer) {
      // Small delay to ensure all data is ready
      const setTimeoutId = setTimeout(() => {
        // Reset form with loaded data
        reset({
          source_location: internalTransfer.source_location,
          destination_location: internalTransfer.destination_location,
        });

        setSelectedSourceLocation(internalTransfer.source_location);
        setSelectedDestinationLocation(internalTransfer.destination_location);

        // Populate items
        if (
          internalTransfer.internal_transfer_items &&
          internalTransfer.internal_transfer_items.length > 0
        ) {
          const populatedItems = internalTransfer.internal_transfer_items.map(
            (item: any, index: number) => ({
              id: (index + 1).toString(),
              product: item.product_details?.id?.toString() || "",
              product_details: {
                product_name: item.product_details?.product_name || "",
                unit_of_measure_details: {
                  unit_symbol:
                    item.product_details?.unit_of_measure_details
                      ?.unit_symbol || "",
                },
              },
              quantity_requested: item.quantity_requested || "",
            })
          );
          setItems(populatedItems);
        }
        setFormPopulated(true);
      }, 800);
      return () => clearTimeout(setTimeoutId);
    }
  }, [internalTransfer, reset]);

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
        quantity_requested: "",
      },
    ]);

  const removeRow = (id: string) =>
    setItems((prev) => prev.filter((p) => p.id !== id));

  const updateItem = (id: string, patch: Partial<InternalTransferLineItem>) =>
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
  const sourceLocationOptions: Option[] =
    sourceLocations?.map((location) => ({
      value: location.id,
      label: `${location.location_name} (${location.location_code})`,
    })) || [];

  const destinationLocationOptions: Option[] =
    destinationLocations?.map((location) => ({
      value: location.id,
      label: `${location.location_name} (${location.location_code})`,
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
      label: "Internal Transfer",
      href: "/inventory/operation/internal_transfer",
    },
    {
      label: internalTransfer?.id || "Edit",
      href: `/inventory/operation/internal_transfer/edit/${internalTransferId}`,
      current: true,
    },
  ];

  // Helper function to validate and prepare data
  const prepareSubmissionData = (
    data: InternalTransferFormData
  ): InternalTransferSubmissionData | null => {
    const validItems = items.filter(
      (item) => item.product && item.quantity_requested
    );

    if (validItems.length === 0) {
      return null;
    }

    return {
      source_location: data.source_location,
      destination_location: data.destination_location,
      // status: internalTransfer?.status || "draft", // Keep existing status
      internal_transfer_items: validItems.map((item) => ({
        product: parseInt(item.product),
        quantity_requested: parseFloat(item.quantity_requested),
      })),
    };
  };

  // Save internal transfer
  async function onSave(data: InternalTransferFormData): Promise<void> {
    const internalTransferData = prepareSubmissionData(data);

    if (!internalTransferData) {
      setNotification({
        message:
          "Please add at least one valid item with product and quantity to transfer",
        type: "error",
        show: true,
      });
      return;
    }

    try {
      await patchInternalTransfer({
        id: internalTransferId,
        data: internalTransferData,
      }).unwrap();

      setNotification({
        message: "Internal transfer updated successfully!",
        type: "success",
        show: true,
      });

      setTimeout(() => {
        router.push(
          `/inventory/operation/internal_transfer/${internalTransferId}`
        );
      }, 1500);
    } catch (error: unknown) {
      let errorMessage =
        "Failed to update internal transfer. Please try again.";

      if (error && typeof error === "object" && "data" in error) {
        const apiError = error as {
          data?: {
            detail?: string;
            message?: string;
            error?: Array<{
              detail: any;
              messages: any;
              non_field_errors?: Record<string, string>;
            }>;
          };
        };

        if (apiError.data?.error && Array.isArray(apiError.data.error)) {
          const errorMessages: string[] = [];
          for (const err of apiError.data.error) {
            if (err.detail) {
              errorMessages.push(err.detail);
            }
            if (err.messages?.message) {
              errorMessages.push(err.messages.message);
            }
            if (err.non_field_errors) {
              errorMessages.push(...Object.values(err.non_field_errors));
            }
          }
          if (errorMessages.length > 0) {
            errorMessage = errorMessages.join(" ");
          }
        } else {
          errorMessage =
            apiError.data?.detail || apiError.data?.message || errorMessage;
        }
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

  // Enhanced updateItem function that also populates product details
  const updateItemWithProductDetails = (
    id: string,
    patch: Partial<InternalTransferLineItem>
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

          return updatedItem;
        }
        return it;
      })
    );
  };

  if (isLoadingInternalTransfer) {
    return (
      <main className="min-h-screen text-gray-800 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p>Loading internal transfer...</p>
        </div>
      </main>
    );
  }

  if (internalTransferError || !internalTransfer) {
    return (
      <main className="min-h-screen text-gray-800 flex items-center justify-center">
        <div className="text-center text-red-600">
          <p>Error loading internal transfer</p>
          <p className="text-sm mt-2">
            The requested internal transfer could not be found.
          </p>
          <Button
            onClick={() =>
              router.push("/inventory/operation/internal_transfer")
            }
            className="mt-4"
          >
            Back to Internal Transfers
          </Button>
        </div>
      </main>
    );
  }

  // Check if editing is allowed based on status
  const allowedStatuses = ["draft", "canceled"];
  if (!allowedStatuses.includes(internalTransfer.status)) {
    return (
      <main className="min-h-screen text-gray-800 flex items-center justify-center">
        <div className="text-center text-red-600">
          <p>Editing not allowed</p>
          <p className="text-sm mt-2">
            Internal transfers with status "{internalTransfer.status}" cannot be
            edited.
          </p>
          <Button
            onClick={() =>
              router.push(
                `/inventory/operation/internal_transfer/${internalTransferId}`
              )
            }
            className="mt-4"
          >
            Back to Details
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
          title={`Edit Internal Transfer: ${internalTransfer.id}`}
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

          <InternalTransferForm
            register={register}
            setValue={setValue}
            watch={watch}
            errors={errors}
            sourceLocationOptions={sourceLocationOptions}
            destinationLocationOptions={destinationLocationOptions}
            isLoadingSourceLocations={isLoadingSourceLocations}
            isLoadingDestinationLocations={isLoadingDestinationLocations}
            onSourceLocationChange={setSelectedSourceLocation}
            onDestinationLocationChange={setSelectedDestinationLocation}
            dateCreated={internalTransfer.date_created}
          />

          <InternalTransferItemsTable
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
              disabled={isPatching}
              onClick={handleSubmit(onSave)}
              variant="contained"
            >
              {isPatching ? "Patching..." : "Save"}
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
