"use client";

import React, { useMemo, useRef, useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useRouter, useParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { PageHeader } from "@/components/purchase/products/PageHeader";
import { BreadcrumbItem } from "@/types/purchase";
import {
  useUpdateIncomingProductMutation,
  useGetIncomingProductQuery,
} from "@/api/inventory/incomingProductApi";
import { useGetActiveLocationsQuery } from "@/api/inventory/locationApi";
import { useGetProductsQuery } from "@/api/purchase/productsApi";
import { useGetVendorsQuery } from "@/api/purchase/vendorsApi";
import { ToastNotification } from "@/components/shared/ToastNotification";
import {
  FadeIn,
  SlideUp,
  StaggerContainer,
} from "@/components/shared/AnimatedWrapper";
import { useSelector } from "react-redux";
import { RootState } from "@/lib/store/store";
import { Button } from "@/components/ui/button";
import { Plus, Trash } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { z } from "zod";
import type { Resolver } from "react-hook-form";
import type { UpdateIncomingProductRequest } from "@/types/incomingProduct";

type Option = { value: string; label: string };

// Incoming product item type
interface IncomingProductLineItem {
  id: string;
  product: string;
  product_details: {
    product_name: string;
    product_description: string;
    unit_of_measure_details: {
      unit_symbol: string;
    };
  };
  expected_quantity: string;
  quantity_received: string;
}

// Form schema for incoming product editing
const receiptTypes = [
  "vendor_receipt",
  "manufacturing_receipt",
  "internal_transfer",
  "returns",
  "scrap",
] as const;

const incomingProductSchema = z.object({
  receipt_type: z.enum(receiptTypes),
  supplier: z.string().min(1, "Supplier is required"),
  source_location: z.string().min(1, "Source location is required"),
  destination_location: z.string().min(1, "Destination location is required"),
  related_po: z.string().optional(),
  notes: z.string().optional(),
});

type IncomingProductFormData = z.infer<typeof incomingProductSchema>;

const initialItems: IncomingProductLineItem[] = [
  {
    id: "1",
    product: "",
    product_details: {
      product_name: "",
      product_description: "",
      unit_of_measure_details: {
        unit_symbol: "",
      },
    },
    expected_quantity: "",
    quantity_received: "",
  },
];

export default function EditIncomingProductPage() {
  const router = useRouter();
  const params = useParams();
  const incomingProductId = params.id as string;
  const formRef = useRef<HTMLFormElement>(null);

  // API mutations and queries
  const [updateIncomingProduct, { isLoading: isUpdating }] =
    useUpdateIncomingProductMutation();
  const { data: incomingProduct, isLoading: isLoadingIncomingProduct } =
    useGetIncomingProductQuery(incomingProductId);
  const { data: locations, isLoading: isLoadingLocations } =
    useGetActiveLocationsQuery();
  const {
    data: vendors,
    isLoading: isLoadingVendors,
    error: vendorsError,
  } = useGetVendorsQuery({});
  const {
    data: products,
    isLoading: isLoadingProducts,
    error: productsError,
  } = useGetProductsQuery({});

  // Form state
  const [items, setItems] = useState<IncomingProductLineItem[]>(initialItems);
  const [formKey, setFormKey] = useState(0); // Key to force re-render of form components

  const addRow = () =>
    setItems((prev) => [
      ...prev,
      {
        id: Date.now().toString(),
        product: "",
        product_details: {
          product_name: "",
          product_description: "",
          unit_of_measure_details: {
            unit_symbol: "",
          },
        },
        expected_quantity: "",
        quantity_received: "",
      },
    ]);

  const removeRow = (id: string) =>
    setItems((prev) => prev.filter((p) => p.id !== id));

  const updateItem = (id: string, patch: Partial<IncomingProductLineItem>) =>
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
  } = useForm<IncomingProductFormData>({
    resolver: zodResolver(
      incomingProductSchema
    ) as Resolver<IncomingProductFormData>,
    defaultValues: {
      receipt_type: "vendor_receipt",
      supplier: "",
      source_location: "",
      destination_location: "",
      related_po: "",
      notes: "",
    },
  });

  // Load existing data when component mounts
  useEffect(() => {
    if (incomingProduct && !isLoadingVendors && !isLoadingLocations) {
      // Use reset to set all form values at once
      reset({
        receipt_type: incomingProduct.receipt_type as
          | "vendor_receipt"
          | "manufacturing_receipt"
          | "internal_transfer"
          | "returns"
          | "scrap",
        supplier: incomingProduct.supplier.toString(),
        source_location: incomingProduct.source_location,
        destination_location: incomingProduct.destination_location,
        related_po: incomingProduct.related_po || "",
        notes: "",
      });

      // Force re-render of form components
      setFormKey((prev) => prev + 1);

      // Set items
      if (
        incomingProduct.incoming_product_items &&
        incomingProduct.incoming_product_items.length > 0
      ) {
        const loadedItems: IncomingProductLineItem[] =
          incomingProduct.incoming_product_items.map((item) => ({
            id: item.id,
            product: item.product.toString(),
            product_details: item.product_details,
            expected_quantity: item.expected_quantity,
            quantity_received: item.quantity_received,
          }));
        setItems(loadedItems);
      }
    }
  }, [incomingProduct, isLoadingVendors, isLoadingLocations, reset]);

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

  const vendorOptions: Option[] =
    vendors?.map((vendor) => ({
      value: vendor.id.toString(),
      label: vendor.company_name,
    })) || [];

  const productOptions: Option[] =
    products?.map((product) => ({
      value: product.id.toString(),
      label: product.product_name,
    })) || [];

  // Show notification if products or vendors fail to load
  React.useEffect(() => {
    if (productsError) {
      setNotification({
        message:
          "Failed to load products. Please check your connection and try again.",
        type: "error",
        show: true,
      });
    }
  }, [productsError]);

  React.useEffect(() => {
    if (vendorsError) {
      setNotification({
        message:
          "Failed to load vendors. Please check your connection and try again.",
        type: "error",
        show: true,
      });
    }
  }, [vendorsError]);

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
      label: "Edit",
      href: `/inventory/operation/incoming_product/edit/${incomingProductId}`,
      current: true,
    },
  ];

  // Helper function to validate and prepare data
  const prepareSubmissionData = (
    data: IncomingProductFormData,
    status: "draft" | "validated"
  ): UpdateIncomingProductRequest | null => {
    const validItems = items.filter(
      (item) => item.product && item.expected_quantity && item.quantity_received
    );

    if (validItems.length === 0) {
      return null;
    }

    return {
      incoming_product_id: incomingProductId,
      receipt_type: data.receipt_type,
      related_po: data.related_po || null,
      supplier: parseInt(data.supplier),
      source_location: data.source_location,
      destination_location: data.destination_location,
      incoming_product_items: validItems.map((item) => ({
        id: item.id,
        product: parseInt(item.product),
        expected_quantity: item.expected_quantity,
        quantity_received: item.quantity_received,
      })),
      status,
      is_validated: status === "validated",
      can_edit: status === "draft",
      is_hidden: false,
    };
  };

  // Save as draft
  async function onSave(data: IncomingProductFormData): Promise<void> {
    const incomingProductData = prepareSubmissionData(data, "draft");

    if (!incomingProductData) {
      setNotification({
        message:
          "Please add at least one valid item with product, expected quantity, and quantity received",
        type: "error",
        show: true,
      });
      return;
    }

    try {
      await updateIncomingProduct({
        id: incomingProductId,
        data: incomingProductData,
      }).unwrap();

      setNotification({
        message: "Incoming product updated as draft!",
        type: "success",
        show: true,
      });

      setTimeout(() => {
        router.push("/inventory/operation");
      }, 1500);
    } catch (error: unknown) {
      let errorMessage = "Failed to update incoming product. Please try again.";

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

  // Validate and mark as done
  async function onValidate(data: IncomingProductFormData): Promise<void> {
    const incomingProductData = prepareSubmissionData(data, "validated");

    if (!incomingProductData) {
      setNotification({
        message:
          "Please add at least one valid item with product, expected quantity, and quantity received",
        type: "error",
        show: true,
      });
      return;
    }

    try {
      await updateIncomingProduct({
        id: incomingProductId,
        data: incomingProductData,
      }).unwrap();

      setNotification({
        message: "Incoming product validated and completed!",
        type: "success",
        show: true,
      });

      setTimeout(() => {
        router.push("/inventory/operation");
      }, 1500);
    } catch (error: unknown) {
      let errorMessage =
        "Failed to validate incoming product. Please try again.";

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
    const product = products?.find((p) => p.id.toString() === productId);
    return {
      product_name: product?.product_name || "",
      product_description:
        product?.product_description || "No description available",
      unit_of_measure_details: {
        unit_symbol: product?.unit_of_measure_details?.unit_symbol || "N/A",
      },
    };
  };

  // Enhanced updateItem function that also populates product details
  const updateItemWithProductDetails = (
    id: string,
    patch: Partial<IncomingProductLineItem>
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

  // Show loading state while fetching existing data
  if (isLoadingIncomingProduct) {
    return (
      <main className="min-h-screen text-gray-800 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p>Loading incoming product...</p>
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
        <PageHeader items={breadcrumsItem} title="Edit Incoming Product" />
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

          {/* Content: rows with separators */}
          <div className="flex-1">
            {/* Row 1 (first 3 fields) */}
            <SlideUp delay={0.4}>
              <div className="py-2 mb-6 border-b border-gray-200">
                <StaggerContainer
                  className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-4"
                  staggerDelay={0.15}
                >
                  {/* Receipt Type */}
                  <FadeIn>
                    <div className="p-4 transition-colors border-r border-gray-300">
                      <h3 className="text-base font-semibold text-[#3B7CED] mb-2">
                        Receipt Type
                      </h3>
                      <p className="text-gray-700">
                        {watch("receipt_type") === "vendor_receipt"
                          ? "Vendor Receipt"
                          : watch("receipt_type") === "manufacturing_receipt"
                          ? "Manufacturing Receipt"
                          : watch("receipt_type") === "internal_transfer"
                          ? "Internal Transfer"
                          : watch("receipt_type") === "returns"
                          ? "Returns"
                          : watch("receipt_type") === "scrap"
                          ? "Scrap"
                          : "Select type"}
                      </p>
                    </div>
                  </FadeIn>

                  {/* Date */}
                  <FadeIn>
                    <div className="p-4 transition-colors border-r border-gray-300">
                      <h3 className="text-base font-semibold text-[#3B7CED] mb-2">
                        Date
                      </h3>
                      <p className="text-gray-700">
                        {new Date().toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        })}{" "}
                        -{" "}
                        {new Date().toLocaleTimeString("en-US", {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                    </div>
                  </FadeIn>
                </StaggerContainer>
              </div>
            </SlideUp>
          </div>

          {/* Incoming product form fields */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: "easeOut", delay: 0.5 }}
            className="mb-8"
          >
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Receipt Type */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">
                  Receipt Type <span className="text-red-500">*</span>
                </label>
                <Select
                  key={`receipt_type-${formKey}`}
                  value={watch("receipt_type")}
                  onValueChange={(value) =>
                    setValue(
                      "receipt_type",
                      value as
                        | "vendor_receipt"
                        | "manufacturing_receipt"
                        | "internal_transfer"
                        | "returns"
                        | "scrap"
                    )
                  }
                >
                  <SelectTrigger size="md" className="h-11 w-full">
                    <SelectValue placeholder="Select receipt type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="vendor_receipt">
                      Vendor Receipt
                    </SelectItem>
                    <SelectItem value="manufacturing_receipt">
                      Manufacturing Receipt
                    </SelectItem>
                    <SelectItem value="internal_transfer">
                      Internal Transfer
                    </SelectItem>
                    <SelectItem value="returns">Returns</SelectItem>
                    <SelectItem value="scrap">Scrap</SelectItem>
                  </SelectContent>
                </Select>
                {errors.receipt_type && (
                  <p className="text-sm text-red-500">
                    {errors.receipt_type.message}
                  </p>
                )}
              </div>

              {/* Supplier */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">
                  Supplier <span className="text-red-500">*</span>
                </label>
                <Select
                  key={`supplier-${formKey}`}
                  value={watch("supplier")}
                  onValueChange={(value) => setValue("supplier", value)}
                  disabled={isLoadingVendors}
                >
                  <SelectTrigger size="md" className="h-11 w-full">
                    <SelectValue
                      placeholder={
                        isLoadingVendors
                          ? "Loading suppliers..."
                          : "Select supplier"
                      }
                    />
                  </SelectTrigger>
                  <SelectContent>
                    {isLoadingVendors ? (
                      <SelectItem value="__loading__" disabled>
                        Loading suppliers...
                      </SelectItem>
                    ) : vendorOptions.length === 0 ? (
                      <SelectItem value="__no_vendors__" disabled>
                        No suppliers available
                      </SelectItem>
                    ) : (
                      vendorOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
                {errors.supplier && (
                  <p className="text-sm text-red-500">
                    {errors.supplier.message}
                  </p>
                )}
              </div>

              {/* Source Location */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">
                  Source Location <span className="text-red-500">*</span>
                </label>
                <Select
                  key={`source_location-${formKey}`}
                  value={watch("source_location")}
                  onValueChange={(value) => setValue("source_location", value)}
                  disabled={isLoadingLocations}
                >
                  <SelectTrigger size="md" className="h-11 w-full">
                    <SelectValue
                      placeholder={
                        isLoadingLocations
                          ? "Loading locations..."
                          : "Select source location"
                      }
                    />
                  </SelectTrigger>
                  <SelectContent>
                    {isLoadingLocations ? (
                      <SelectItem value="__loading__" disabled>
                        Loading locations...
                      </SelectItem>
                    ) : locationOptions.length === 0 ? (
                      <SelectItem value="__no_locations__" disabled>
                        No locations available
                      </SelectItem>
                    ) : (
                      locationOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
                {errors.source_location && (
                  <p className="text-sm text-red-500">
                    {errors.source_location.message}
                  </p>
                )}
              </div>

              {/* Destination Location */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">
                  Destination Location <span className="text-red-500">*</span>
                </label>
                <Select
                  key={`destination_location-${formKey}`}
                  value={watch("destination_location")}
                  onValueChange={(value) =>
                    setValue("destination_location", value)
                  }
                  disabled={isLoadingLocations}
                >
                  <SelectTrigger size="md" className="h-11 w-full">
                    <SelectValue
                      placeholder={
                        isLoadingLocations
                          ? "Loading locations..."
                          : "Select destination location"
                      }
                    />
                  </SelectTrigger>
                  <SelectContent>
                    {isLoadingLocations ? (
                      <SelectItem value="__loading__" disabled>
                        Loading locations...
                      </SelectItem>
                    ) : locationOptions.length === 0 ? (
                      <SelectItem value="__no_locations__" disabled>
                        No locations available
                      </SelectItem>
                    ) : (
                      locationOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
                {errors.destination_location && (
                  <p className="text-sm text-red-500">
                    {errors.destination_location.message}
                  </p>
                )}
              </div>

              {/* Related PO */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">
                  Related PO
                </label>
                <Input
                  {...register("related_po")}
                  placeholder="Enter related purchase order..."
                  className="h-11"
                />
              </div>

              {/* Notes */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">
                  Notes
                </label>
                <Textarea
                  {...register("notes")}
                  placeholder="Enter any notes for this incoming product..."
                  className="min-h-11"
                />
              </div>
            </div>
          </motion.div>

          <section className="bg-white mt-8 border-none">
            <div className="mx-auto">
              <div className="overflow-x-auto">
                <Table className="min-w-[1000px] table-fixed">
                  <TableHeader className="bg-[#F6F7F8]">
                    <TableRow>
                      <TableHead className="w-48 border border-gray-200 px-4 py-3 text-left text-sm text-gray-600 font-medium">
                        Product
                      </TableHead>
                      <TableHead className="w-64 border border-gray-200 px-4 py-3 text-left text-sm text-gray-600 font-medium">
                        Description
                      </TableHead>
                      <TableHead className="w-24 border border-gray-200 px-4 py-3 text-center text-sm text-gray-600 font-medium">
                        Unit
                      </TableHead>
                      <TableHead className="w-32 border border-gray-200 px-4 py-3 text-center text-sm text-gray-600 font-medium">
                        Expected QTY
                      </TableHead>
                      <TableHead className="w-32 border border-gray-200 px-4 py-3 text-center text-sm text-gray-600 font-medium">
                        Received QTY
                      </TableHead>
                      <TableHead className="w-16 border border-gray-200 px-4 py-3 text-center text-sm text-gray-600 font-medium">
                        Action
                      </TableHead>
                    </TableRow>
                  </TableHeader>

                  <TableBody className="bg-white">
                    {items.map((it) => (
                      <TableRow
                        key={it.id}
                        className="group hover:bg-[#FBFBFB] focus-within:bg-[#FBFBFB] transition-colors duration-150"
                      >
                        <TableCell className="border border-gray-200 align-middle">
                          <Select
                            value={it.product}
                            onValueChange={(value) =>
                              updateItemWithProductDetails(it.id, {
                                product: value,
                              })
                            }
                            disabled={isLoadingProducts}
                          >
                            <SelectTrigger className="h-11 w-full rounded-none border-0 focus:ring-0 focus:ring-offset-0">
                              <SelectValue
                                placeholder={
                                  isLoadingProducts
                                    ? "Loading products..."
                                    : "Select product"
                                }
                              />
                            </SelectTrigger>
                            <SelectContent>
                              {isLoadingProducts ? (
                                <SelectItem value="__loading__" disabled>
                                  Loading products...
                                </SelectItem>
                              ) : productOptions.length === 0 ? (
                                <SelectItem value="__no_products__" disabled>
                                  No products available
                                </SelectItem>
                              ) : (
                                productOptions.map((option) => (
                                  <SelectItem
                                    key={option.value}
                                    value={option.value}
                                  >
                                    {option.label}
                                  </SelectItem>
                                ))
                              )}
                            </SelectContent>
                          </Select>
                        </TableCell>

                        <TableCell className="border border-gray-200 px-4 align-middle">
                          <div className="text-sm text-gray-600 line-clamp-2">
                            {it.product_details.product_description ||
                              "Select a product"}
                          </div>
                        </TableCell>

                        <TableCell className="border border-gray-200 px-4 align-middle text-center">
                          <div className="text-sm text-gray-700">
                            {it.product_details.unit_of_measure_details
                              .unit_symbol || "N/A"}
                          </div>
                        </TableCell>

                        <TableCell className="border border-gray-200 align-middle text-center">
                          <Input
                            type="number"
                            step="0.01"
                            aria-label="Expected quantity"
                            value={it.expected_quantity}
                            onChange={(e) =>
                              updateItemWithProductDetails(it.id, {
                                expected_quantity: e.target.value,
                              })
                            }
                            placeholder="0"
                            className="h-11 w-full text-center rounded-none border-0 focus:ring-0 focus:ring-offset-0"
                          />
                        </TableCell>

                        <TableCell className="border border-gray-200 align-middle text-center">
                          <Input
                            type="number"
                            step="0.01"
                            aria-label="Quantity received"
                            value={it.quantity_received}
                            onChange={(e) =>
                              updateItemWithProductDetails(it.id, {
                                quantity_received: e.target.value,
                              })
                            }
                            placeholder="0"
                            className="h-11 w-full text-center rounded-none border-0 focus:ring-0 focus:ring-offset-0"
                          />
                        </TableCell>

                        <TableCell className="border border-gray-200 px-4 align-middle text-center">
                          <button
                            type="button"
                            onClick={() => removeRow(it.id)}
                            aria-label="Remove row"
                            className="opacity-0 group-hover:opacity-100 transition-opacity duration-150 p-2 rounded-md hover:bg-red-50"
                            disabled={items.length === 1}
                          >
                            <Trash className="w-4 h-4 text-red-500" />
                          </button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>

                  <TableFooter className="bg-[#FBFCFD] border border-gray-200">
                    <TableRow>
                      <TableCell className="bg-white">
                        <Button
                          type="button"
                          variant="ghost"
                          onClick={addRow}
                          className="flex items-center gap-2 px-3 py-0 text-sm m-auto rounded-md hover:bg-gray-50"
                          aria-label="Add row"
                        >
                          <Plus className="w-4 h-4" />
                        </Button>
                      </TableCell>
                      <TableCell className="bg-white" />
                      <TableCell className="bg-white" />
                      <TableCell className="bg-white" />
                      <TableCell className="bg-white" />
                      <TableCell className="bg-white" />
                    </TableRow>
                  </TableFooter>
                </Table>
              </div>
            </div>
          </section>

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
            >
              {isUpdating ? "Updating..." : "Update"}
            </Button>
            <Button
              type="button"
              disabled={isUpdating}
              onClick={handleSubmit(onValidate)}
              variant={"contained"}
            >
              {isUpdating ? "Validating..." : "Validate"}
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
