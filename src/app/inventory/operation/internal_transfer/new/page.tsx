"use client";

import React, { useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { PageHeader } from "@/components/purchase/products/PageHeader";
import { BreadcrumbItem } from "@/types/purchase";
import { useCreateInternalTransferMutation } from "@/api/inventory/internalTransferApi";
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
import InternalTransferForm from "../components/InternalTransferForm";
import InternalTransferItemsTable from "../components/InternalTransferItemsTable";
import {
  Option,
  InternalTransferLineItem,
  InternalTransferFormData,
  InternalTransferSubmissionData,
} from "@/types/internalTransfer";

import { PageGuard } from "@/components/auth/PageGuard";
import { extractErrorMessage } from "@/lib/utils";

// Form schema for internal transfer creation
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

export default function Page() {
  const router = useRouter();
  const formRef = useRef<HTMLFormElement>(null);

  // API mutations and queries
  const [createInternalTransfer, { isLoading: isCreating }] =
    useCreateInternalTransferMutation();
  const { data: sourceLocations, isLoading: isLoadingSourceLocations, error: sourceLocationsError } =
    useGetOtherLocationsForUserQuery();
  const {
    data: destinationLocations,
    isLoading: isLoadingDestinationLocations,
    error: destinationLocationsError,
  } = useGetAllUserLocationsQuery();

  // Form state
  const [items, setItems] = useState<InternalTransferLineItem[]>(initialItems);
  const [selectedSourceLocation, setSelectedSourceLocation] =
    useState<string>("");
  const [selectedDestinationLocation, setSelectedDestinationLocation] =
    useState<string>("");

  // Get stock levels for selected source location
  const { data: stockLevels, isLoading: isLoadingStockLevels, error: stockLevelsError } =
    useGetLocationStockLevelsQuery(selectedSourceLocation, {
      skip: !selectedSourceLocation,
    });

  // Handle query errors
  React.useEffect(() => {
    if (stockLevelsError) {
      setNotification({
        message: extractErrorMessage(stockLevelsError, "Failed to load stock levels for this location."),
        type: "error",
        show: true,
      });
    }
  }, [stockLevelsError]);

  React.useEffect(() => {
    if (sourceLocationsError) {
      setNotification({
        message: extractErrorMessage(sourceLocationsError, "Failed to load source locations."),
        type: "error",
        show: true,
      });
    }
  }, [sourceLocationsError]);

  React.useEffect(() => {
    if (destinationLocationsError) {
      setNotification({
        message: extractErrorMessage(destinationLocationsError, "Failed to load destination locations."),
        type: "error",
        show: true,
      });
    }
  }, [destinationLocationsError]);

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
      label: "New",
      href: "/inventory/operation/internal_transfer/new",
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
      status: "draft",
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
      const result = await createInternalTransfer(
        internalTransferData
      ).unwrap();

      setNotification({
        message: "Internal transfer created successfully!",
        type: "success",
        show: true,
      });

      setTimeout(() => {
        reset();
        setItems(initialItems);
        router.push(`/inventory/operation/internal_transfer/${result.id}`);
      }, 1500);
    } catch (error: unknown) {
      const errorMessage = extractErrorMessage(error, "Failed to create internal transfer. Please try again.");

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
        <PageHeader items={breadcrumsItem} title="New Internal Transfer" />
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
          />

          <InternalTransferItemsTable
            items={items}
            productOptions={productOptions}
            isLoadingStockLevels={isLoadingStockLevels}
            selectedSourceLocation={selectedSourceLocation}
            addRow={addRow}
            removeRow={removeRow}
            updateItemWithProductDetails={updateItemWithProductDetails}
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
              disabled={isCreating}
              onClick={handleSubmit(onSave)}
              variant="contained"
            >
              {isCreating ? "Creating..." : "Save"}
            </Button>
          </motion.div>
        </form>
      </motion.main>

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
