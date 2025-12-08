"use client";

import React, { useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { PageHeader } from "@/components/purchase/products/PageHeader";
import { BreadcrumbItem } from "@/types/purchase";
import { useCreateStockAdjustmentMutation } from "@/api/inventory/stockAdjustmentApi";
import { useGetActiveLocationsQuery } from "@/api/inventory/locationApi";
import { useGetProductsQuery } from "@/api/purchase/productsApi";
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

type Option = { value: string; label: string };

// Stock adjustment item type
interface StockAdjustmentLineItem {
  id: string;
  product: string;
  product_description: string;
  unit_of_measure: string;
  current_quantity: string;
  adjusted_quantity: string;
}

// Form schema for stock adjustment
const stockAdjustmentSchema = z.object({
  warehouse_location: z.string().min(1, "Warehouse location is required"),
  notes: z.string().optional(),
});

type StockAdjustmentFormData = z.infer<typeof stockAdjustmentSchema>;

const initialItems: StockAdjustmentLineItem[] = [
  {
    id: "1",
    product: "",
    product_description: "",
    unit_of_measure: "",
    current_quantity: "0",
    adjusted_quantity: "",
  },
];

export default function Page() {
  const router = useRouter();
  const formRef = useRef<HTMLFormElement>(null);

  // API mutations and queries
  const [createStockAdjustment, { isLoading: isCreating }] =
    useCreateStockAdjustmentMutation();
  const { data: locations, isLoading: isLoadingLocations } =
    useGetActiveLocationsQuery();
  const {
    data: products,
    isLoading: isLoadingProducts,
    error: productsError,
  } = useGetProductsQuery({});

  // Form state
  const [items, setItems] = useState<StockAdjustmentLineItem[]>(initialItems);

  const addRow = () =>
    setItems((prev) => [
      ...prev,
      {
        id: Date.now().toString(),
        product: "",
        product_description: "",
        unit_of_measure: "",
        current_quantity: "0",
        adjusted_quantity: "",
      },
    ]);

  const removeRow = (id: string) =>
    setItems((prev) => prev.filter((p) => p.id !== id));

  const updateItem = (id: string, patch: Partial<StockAdjustmentLineItem>) =>
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
  } = useForm<StockAdjustmentFormData>({
    resolver: zodResolver(
      stockAdjustmentSchema
    ) as Resolver<StockAdjustmentFormData>,
    defaultValues: {
      warehouse_location: "",
      notes: "",
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
  const locationOptions: Option[] =
    locations?.map((location) => ({
      value: location.id.toString(),
      label: `${location.location_name} (${location.location_code})`,
    })) || [];

  const productOptions: Option[] =
    products?.map((product) => ({
      value: product.id.toString(),
      label: product.product_name,
    })) || [];

  // Show notification if products fail to load
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

  const breadcrumsItem: BreadcrumbItem[] = [
    { label: "Home", href: "/" },
    { label: "Inventory", href: "/inventory" },
    {
      label: "Stock Adjustments",
      href: "/inventory/stocks/adjustment",
    },
    { label: "New", href: "/inventory/stocks/adjustment/new", current: true },
  ];

  // Helper function to validate and prepare data
  const prepareSubmissionData = (
    data: StockAdjustmentFormData,
    status: "draft" | "done"
  ) => {
    const validItems = items.filter(
      (item) => item.product && item.adjusted_quantity
    );

    if (validItems.length === 0) {
      return null;
    }

    return {
      warehouse_location: data.warehouse_location,
      notes: data.notes || "",
      status,
      stock_adjustment_items: validItems.map((item) => ({
        product: parseInt(item.product),
        adjusted_quantity: item.adjusted_quantity,
      })),
    };
  };

  // Save as draft
  async function onSave(data: StockAdjustmentFormData): Promise<void> {
    const stockAdjustmentData = prepareSubmissionData(data, "draft");

    if (!stockAdjustmentData) {
      setNotification({
        message:
          "Please add at least one valid item with product and adjusted quantity",
        type: "error",
        show: true,
      });
      return;
    }

    try {
      await createStockAdjustment(stockAdjustmentData).unwrap();

      setNotification({
        message: "Stock adjustment saved as draft!",
        type: "success",
        show: true,
      });

      setTimeout(() => {
        reset();
        setItems(initialItems);
        router.push("/inventory/stocks/adjustment");
      }, 1500);
    } catch (error: unknown) {
      let errorMessage = "Failed to save stock adjustment. Please try again.";

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
  async function onValidate(data: StockAdjustmentFormData): Promise<void> {
    const stockAdjustmentData = prepareSubmissionData(data, "done");

    if (!stockAdjustmentData) {
      setNotification({
        message:
          "Please add at least one valid item with product and adjusted quantity",
        type: "error",
        show: true,
      });
      return;
    }

    try {
      await createStockAdjustment(stockAdjustmentData).unwrap();

      setNotification({
        message: "Stock adjustment validated and completed!",
        type: "success",
        show: true,
      });

      setTimeout(() => {
        reset();
        setItems(initialItems);
        router.push("/inventory/stocks/adjustment");
      }, 1500);
    } catch (error: unknown) {
      let errorMessage =
        "Failed to validate stock adjustment. Please try again.";

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
      description: product?.product_description || "No description available",
      unit: product?.unit_of_measure_details?.unit_symbol || "N/A",
      currentQuantity: product?.available_product_quantity || "0",
    };
  };

  // Enhanced updateItem function that also populates product details
  const updateItemWithProductDetails = (
    id: string,
    patch: Partial<StockAdjustmentLineItem>
  ) => {
    setItems((prev) =>
      prev.map((it) => {
        if (it.id === id) {
          const updatedItem = { ...it, ...patch };

          // If product is being updated, populate description, unit, and current quantity
          if (patch.product && patch.product !== it.product) {
            const productDetails = getProductDetails(patch.product);
            updatedItem.product_description = productDetails.description;
            updatedItem.unit_of_measure = productDetails.unit;
            updatedItem.current_quantity = productDetails.currentQuantity;
          }

          return updatedItem;
        }
        return it;
      })
    );
  };

  // Calculate effective quantity (current + adjusted)
  const calculateEffectiveQuantity = (
    currentQty: string,
    adjustedQty: string
  ) => {
    const current = parseFloat(currentQty) || 0;
    const adjusted = parseFloat(adjustedQty) || 0;
    return (current + adjusted).toFixed(2);
  };

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
        <PageHeader items={breadcrumsItem} title="New Stock Adjustment" />
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
                  {/* Created By */}
                  <FadeIn>
                    <div className="p-4 transition-colors border-r border-gray-300">
                      <h3 className="text-base font-semibold text-[#3B7CED] mb-2">
                        Stock Adjustment Type
                      </h3>
                      <p className="text-gray-700">Stock Level Update</p>
                    </div>
                  </FadeIn>

                  {/* Status */}
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

          {/* Stock adjustment form fields */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: "easeOut", delay: 0.5 }}
            className="mb-8"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Warehouse Location */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">
                  Warehouse Location <span className="text-red-500">*</span>
                </label>
                <Select
                  value={watch("warehouse_location")}
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
                  placeholder="Enter any notes for this adjustment..."
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
                        Adjusted QTY
                      </TableHead>
                      <TableHead className="w-28 border border-gray-200 px-4 py-3 text-center text-sm text-gray-600 font-medium">
                        Effective QTY
                      </TableHead>
                      <TableHead className="w-16 border border-gray-200 px-4 py-3 text-center text-sm text-gray-600 font-medium">
                        Action
                      </TableHead>
                    </TableRow>
                  </TableHeader>

                  <TableBody className="bg-white">
                    {items.map((it) => {
                      const effectiveQty = calculateEffectiveQuantity(
                        it.current_quantity,
                        it.adjusted_quantity
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
                              aria-label="Adjusted quantity"
                              value={it.adjusted_quantity}
                              onChange={(e) =>
                                updateItemWithProductDetails(it.id, {
                                  adjusted_quantity: e.target.value,
                                })
                              }
                              placeholder="0"
                              className="h-11 w-full text-center rounded-none border-0 focus:ring-0 focus:ring-offset-0"
                            />
                          </TableCell>

                          <TableCell className="border border-gray-200 px-4 align-middle text-center">
                            <div
                              className={`text-sm font-medium tabular-nums ${
                                parseFloat(effectiveQty) < 0
                                  ? "text-red-600"
                                  : "text-green-600"
                              }`}
                            >
                              {effectiveQty}
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
              disabled={isCreating}
              onClick={handleSubmit(onSave)}
            >
              {isCreating ? "Saving..." : "Save"}
            </Button>
            <Button
              type="button"
              disabled={isCreating}
              onClick={handleSubmit(onValidate)}
              variant={"contained"}
            >
              {isCreating ? "Validating..." : "Validate"}
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
