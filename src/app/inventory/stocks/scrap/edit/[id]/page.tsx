"use client";

import React, { useMemo, useRef, useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { useParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { PageHeader } from "@/components/purchase/products/PageHeader";
import { BreadcrumbItem } from "@/types/purchase";
import {
  useGetScrapQuery,
  usePatchScrapMutation,
} from "@/api/inventory/scrapApi";
import { useGetActiveLocationsQuery } from "@/api/inventory/locationApi";
import { useGetProductsQuery } from "@/api/purchase/productsApi";
import { ToastNotification } from "@/components/shared/ToastNotification";
import { LoadingDots } from "@/components/shared/LoadingComponents";
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
import type { Scrap } from "@/types/scrap";

type Option = { value: string; label: string };

// Scrap item type for editing
interface EditableScrapItem {
  id: string;
  product: string;
  product_description: string;
  unit_of_measure: string;
  current_quantity: string;
  scrap_quantity: string;
  originalId?: string; // For tracking existing items
}

// Form schema for scrap
const scrapSchema = z.object({
  adjustment_type: z.enum(["damage", "loss"]),
  warehouse_location: z.string().min(1, "Warehouse location is required"),
  notes: z.string().optional(),
});

type ScrapFormData = z.infer<typeof scrapSchema>;

export default function ScrapEditPage() {
  const router = useRouter();
  const params = useParams();
  const scrapId = params.id as string;
  const formRef = useRef<HTMLFormElement>(null);

  // API hooks
  const {
    data: scrap,
    isLoading: isLoadingScrap,
    error: scrapError,
  } = useGetScrapQuery(scrapId);

  const [patchScrap, { isLoading: isUpdating }] = usePatchScrapMutation();

  const { data: locations, isLoading: isLoadingLocations } =
    useGetActiveLocationsQuery();
  const {
    data: products,
    isLoading: isLoadingProducts,
    error: productsError,
  } = useGetProductsQuery({});

  // Form state
  const [items, setItems] = useState<EditableScrapItem[]>([]);
  const [notification, setNotification] = React.useState<{
    message: string;
    type: "success" | "error";
    show: boolean;
  }>({
    message: "",
    type: "success",
    show: false,
  });

  const loggedInUser = useSelector((state: RootState) => state.auth.user);

  // React Hook Form setup
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
    reset,
  } = useForm<ScrapFormData>({
    resolver: zodResolver(scrapSchema) as Resolver<ScrapFormData>,
    defaultValues: {
      adjustment_type: undefined,
      warehouse_location: "",
      notes: "",
    },
    mode: "onChange",
  });

  // Convert API data to option format
  const locationOptions: Option[] = useMemo(
    () =>
      locations?.map((location) => ({
        value: location.id.toString(),
        label: `${location.location_name} (${location.location_code})`,
      })) || [],
    [locations]
  );

  const productOptions: Option[] = useMemo(
    () =>
      products?.map((product) => ({
        value: product.id.toString(),
        label: product.product_name,
      })) || [],
    [products]
  );

  // Helper functions to get display labels
  const getAdjustmentTypeLabel = (value: string) => {
    switch (value) {
      case "damage":
        return "Damage";
      case "loss":
        return "Loss";
      default:
        return "Select adjustment type";
    }
  };

  const getWarehouseLocationLabel = (value: string) => {
    const location = locations?.find((loc) => loc.id.toString() === value);
    return location
      ? `${location.location_name} (${location.location_code})`
      : "Select warehouse location";
  };

  // Initialize form data when scrap and locations are loaded
  useEffect(() => {
    if (scrap && locations) {
      // Set form values
      setValue("adjustment_type", scrap.adjustment_type);
      setValue("warehouse_location", scrap.warehouse_location.toString());
      setValue("notes", scrap.notes || "");

      // Convert API items to editable format
      const editableItems: EditableScrapItem[] = scrap.scrap_items.map(
        (item) => ({
          id: `edit-${item.id}`,
          originalId: item.id,
          product: item.product.toString(),
          product_description: item.product_details?.product_description || "",
          unit_of_measure:
            item.product_details?.unit_of_measure_details?.unit_symbol || "",
          current_quantity:
            item.product_details?.available_product_quantity || "0",
          scrap_quantity: item.scrap_quantity || "0",
        })
      );

      setItems(
        editableItems.length > 0
          ? editableItems
          : [
              {
                id: "1",
                product: "",
                product_description: "",
                unit_of_measure: "",
                current_quantity: "0",
                scrap_quantity: "",
              },
            ]
      );
    }
  }, [scrap, locations, setValue]);

  // Show notification if products fail to load
  useEffect(() => {
    if (productsError) {
      setNotification({
        message:
          "Failed to load products. Please check your connection and try again.",
        type: "error",
        show: true,
      });
    }
  }, [productsError]);

  const breadcrumsItem: BreadcrumbItem[] = [
    { label: "Home", href: "/" },
    { label: "Inventory", href: "/inventory" },
    {
      label: "Scrap Management",
      href: "/inventory/stocks/scrap",
    },
    {
      label: scrap?.id || "Edit",
      href: `/inventory/stocks/scrap/edit/${scrapId}`,
      current: true,
    },
  ];

  // Table operations
  const addRow = () =>
    setItems((prev) => [
      ...prev,
      {
        id: Date.now().toString(),
        product: "",
        product_description: "",
        unit_of_measure: "",
        current_quantity: "0",
        scrap_quantity: "",
      },
    ]);

  const removeRow = (id: string) =>
    setItems((prev) => prev.filter((p) => p.id !== id));

  // Enhanced updateItem function that also populates product details
  const updateItemWithProductDetails = (
    id: string,
    patch: Partial<EditableScrapItem>
  ) => {
    setItems((prev) =>
      prev.map((it) => {
        if (it.id === id) {
          const updatedItem = { ...it, ...patch };

          // If product is being updated, populate description, unit, and current quantity
          if (patch.product && patch.product !== it.product) {
            const product = products?.find(
              (p) => p.id.toString() === patch.product
            );
            if (product) {
              updatedItem.product_description =
                product.product_description || "No description available";
              updatedItem.unit_of_measure =
                product.unit_of_measure_details?.unit_symbol || "N/A";
              updatedItem.current_quantity =
                product.available_product_quantity || "0";
            }
          }

          return updatedItem;
        }
        return it;
      })
    );
  };

  // Calculate remaining quantity after scrap
  const calculateRemainingQuantity = (currentQty: string, scrapQty: string) => {
    const current = parseFloat(currentQty) || 0;
    const scrap = parseFloat(scrapQty) || 0;
    const remaining = Math.max(0, current - scrap);
    return remaining.toFixed(2);
  };

  // Helper function to validate and prepare data for submission
  const prepareSubmissionData = (
    data: ScrapFormData,
    status: "draft" | "done"
  ) => {
    const validItems = items.filter(
      (item) => item.product && item.scrap_quantity
    );

    if (validItems.length === 0) {
      return null;
    }

    // Separate new and existing items
    const existingItems = validItems.filter((item) => item.originalId);
    const newItems = validItems.filter((item) => !item.originalId);

    const scrapItems = [
      // Existing items with IDs for updates
      ...existingItems.map((item) => ({
        id: item.originalId,
        product: parseInt(item.product),
        scrap_quantity: item.scrap_quantity,
      })),
      // New items without IDs
      ...newItems.map((item) => ({
        product: parseInt(item.product),
        scrap_quantity: item.scrap_quantity,
      })),
    ];

    return {
      adjustment_type: data.adjustment_type,
      warehouse_location: data.warehouse_location,
      notes: data.notes || "",
      status,
      scrap_items: scrapItems,
    };
  };

  // Save as draft
  const onSave = async (data: ScrapFormData) => {
    const scrapData = prepareSubmissionData(data, "draft");

    if (!scrapData) {
      setNotification({
        message:
          "Please add at least one valid item with product and scrap quantity",
        type: "error",
        show: true,
      });
      return;
    }

    try {
      await patchScrap({
        id: scrapId,
        data: scrapData,
      }).unwrap();

      setNotification({
        message: "Scrap record updated successfully!",
        type: "success",
        show: true,
      });

      setTimeout(() => {
        router.push("/inventory/stocks/scrap");
      }, 1500);
    } catch (error: unknown) {
      let errorMessage = "Failed to update scrap record. Please try again.";

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
  };

  // Validate and mark as done
  const onValidate = async (data: ScrapFormData) => {
    const scrapData = prepareSubmissionData(data, "done");

    if (!scrapData) {
      setNotification({
        message:
          "Please add at least one valid item with product and scrap quantity",
        type: "error",
        show: true,
      });
      return;
    }

    try {
      await patchScrap({
        id: scrapId,
        data: scrapData,
      }).unwrap();

      setNotification({
        message: "Scrap record validated and completed!",
        type: "success",
        show: true,
      });

      setTimeout(() => {
        router.push("/inventory/stocks/scrap");
      }, 1500);
    } catch (error: unknown) {
      let errorMessage = "Failed to validate scrap record. Please try again.";

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
  };

  // Close notification
  const closeNotification = () => {
    setNotification((prev) => ({ ...prev, show: false }));
  };

  // Loading states
  if (isLoadingScrap) {
    return (
      <FadeIn className="h-full text-gray-900 font-sans antialiased">
        <div className="h-full mx-auto px-6 py-8 bg-white">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <LoadingDots />
              <p className="mt-4 text-gray-600">Loading scrap details...</p>
            </div>
          </div>
        </div>
      </FadeIn>
    );
  }

  // Error state
  if (scrapError || !scrap) {
    const errorMessage =
      scrapError && "data" in scrapError
        ? (scrapError.data as { detail?: string; message?: string })?.detail ||
          (scrapError.data as { detail?: string; message?: string })?.message ||
          "Unable to load scrap details"
        : "Scrap not found";

    return (
      <FadeIn className="h-full text-gray-900 font-sans antialiased">
        <div className="h-full mx-auto px-6 py-8 bg-white">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="text-red-500 text-lg font-semibold mb-2">
                Error Loading Scrap
              </div>
              <p className="text-gray-600">{errorMessage}</p>
            </div>
          </div>
        </div>
      </FadeIn>
    );
  }

  // Check if editable
  if (scrap?.status !== "draft") {
    return (
      <FadeIn className="h-full text-gray-900 font-sans antialiased">
        <div className="h-full mx-auto px-6 py-8 bg-white">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="text-orange-500 text-lg font-semibold mb-2">
                Cannot Edit Scrap Record
              </div>
              <p className="text-gray-600">
                This scrap record cannot be edited because it is not in a draft
                state.
              </p>
            </div>
          </div>
        </div>
      </FadeIn>
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
        <PageHeader items={breadcrumsItem} title="Edit Scrap Record" />
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
                  {/* Scrap ID */}
                  <FadeIn>
                    <div className="p-4 transition-colors border-r border-gray-300">
                      <h3 className="text-base font-semibold text-[#3B7CED] mb-2">
                        Scrap ID
                      </h3>
                      <p className="text-gray-700 font-mono">{scrap.id}</p>
                    </div>
                  </FadeIn>

                  {/* Adjustment Type */}
                  <FadeIn>
                    <div className="p-4 transition-colors border-r border-gray-300">
                      <h3 className="text-base font-semibold text-[#3B7CED] mb-2">
                        Adjustment Type
                      </h3>
                      <p className="text-gray-700 capitalize">
                        {scrap.adjustment_type}
                      </p>
                    </div>
                  </FadeIn>

                  {/* Status */}
                  <FadeIn>
                    <div className="p-4 transition-colors">
                      <h3 className="text-base font-semibold text-[#3B7CED] mb-2">
                        Status
                      </h3>
                      <p className="text-gray-700 capitalize">{scrap.status}</p>
                    </div>
                  </FadeIn>
                </StaggerContainer>
              </div>
            </SlideUp>
          </div>

          {/* Scrap form fields */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: "easeOut", delay: 0.5 }}
            className="mb-8"
          >
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Adjustment Type */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">
                  Adjustment Type <span className="text-red-500">*</span>
                </label>
                <Select
                  value={watch("adjustment_type") || ""}
                  onValueChange={(value) =>
                    setValue("adjustment_type", value as "damage" | "loss")
                  }
                >
                  <SelectTrigger size="md" className="h-11 w-full">
                    <SelectValue placeholder="Select adjustment type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="damage">Damage</SelectItem>
                    <SelectItem value="loss">Loss</SelectItem>
                  </SelectContent>
                </Select>
                {errors.adjustment_type && (
                  <p className="text-sm text-red-500">
                    {errors.adjustment_type.message}
                  </p>
                )}
              </div>

              {/* Warehouse Location */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">
                  Warehouse Location <span className="text-red-500">*</span>
                </label>
                <Select
                  value={watch("warehouse_location") || ""}
                  onValueChange={(value) =>
                    setValue("warehouse_location", value)
                  }
                  disabled={isLoadingLocations}
                >
                  <SelectTrigger size="md" className="h-11 w-full">
                    <SelectValue
                      placeholder={
                        isLoadingLocations
                          ? "Loading locations..."
                          : "Select warehouse location"
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
                {errors.warehouse_location && (
                  <p className="text-sm text-red-500">
                    {errors.warehouse_location.message}
                  </p>
                )}
              </div>

              {/* Notes */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">
                  Notes
                </label>
                <Textarea
                  {...register("notes")}
                  placeholder="Enter any notes for this scrap record..."
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
                      <TableHead className="w-28 border border-gray-200 px-4 py-3 text-center text-sm text-gray-600 font-medium">
                        Current QTY
                      </TableHead>
                      <TableHead className="w-32 border border-gray-200 px-4 py-3 text-center text-sm text-gray-600 font-medium">
                        Scrap QTY
                      </TableHead>
                      <TableHead className="w-28 border border-gray-200 px-4 py-3 text-center text-sm text-gray-600 font-medium">
                        Remaining QTY
                      </TableHead>
                      <TableHead className="w-16 border border-gray-200 px-4 py-3 text-center text-sm text-gray-600 font-medium">
                        Action
                      </TableHead>
                    </TableRow>
                  </TableHeader>

                  <TableBody className="bg-white">
                    {items.map((it) => {
                      const remainingQty = calculateRemainingQuantity(
                        it.current_quantity,
                        it.scrap_quantity
                      );
                      return (
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
                              {it.product_description || "Select a product"}
                            </div>
                          </TableCell>

                          <TableCell className="border border-gray-200 px-4 align-middle text-center">
                            <div className="text-sm text-gray-700">
                              {it.unit_of_measure || "N/A"}
                            </div>
                          </TableCell>

                          <TableCell className="border border-gray-200 px-4 align-middle text-center">
                            <div className="text-sm text-gray-700 font-medium">
                              {it.current_quantity}
                            </div>
                          </TableCell>

                          <TableCell className="border border-gray-200 align-middle text-center">
                            <Input
                              type="number"
                              step="0.01"
                              aria-label="Scrap quantity"
                              value={it.scrap_quantity}
                              onChange={(e) =>
                                updateItemWithProductDetails(it.id, {
                                  scrap_quantity: e.target.value,
                                })
                              }
                              placeholder="0"
                              className="h-11 w-full text-center rounded-none border-0 focus:ring-0 focus:ring-offset-0"
                            />
                          </TableCell>

                          <TableCell className="border border-gray-200 px-4 align-middle text-center">
                            <div
                              className={`text-sm font-medium tabular-nums ${
                                parseFloat(remainingQty) < 0
                                  ? "text-red-600"
                                  : "text-green-600"
                              }`}
                            >
                              {remainingQty}
                            </div>
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
                      );
                    })}
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
              variant="outline"
            >
              {isUpdating ? "Saving..." : "Save as Draft"}
            </Button>
            <Button
              type="button"
              disabled={isUpdating}
              onClick={handleSubmit(onValidate)}
              variant="default"
            >
              {isUpdating ? "Validating..." : "Validate & Complete"}
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
