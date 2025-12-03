"use client";

import React, { useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { PageHeader } from "@/components/purchase/products/PageHeader";
import { PurchaseRequestFormActions } from "@/components/purchase/purchaseOrder";
import { BreadcrumbItem } from "@/types/purchase";
import { useCreatePurchaseOrderMutation } from "@/api/purchase/purchaseOrderApi";
import { useGetCurrenciesQuery } from "@/api/purchase/currencyApi";
import { useGetVendorsQuery } from "@/api/purchase/vendorsApi";
import { useGetProductsQuery } from "@/api/purchase/productsApi";
import { useGetActiveLocationsFilteredQuery } from "@/api/inventory/locationApi";
import { ToastNotification } from "@/components/shared/ToastNotification";
import type { Resolver } from "react-hook-form";
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
import { Label } from "@/components/ui/label";
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

type Option = { value: string; label: string };

// Purchase Order specific schema
const purchaseOrderSchema = z.object({
  currency: z.string().min(1, "Currency is required"),
  vendor: z.string().min(1, "Vendor is required"),
  destination_location: z.string().min(1, "Destination location is required"),
  payment_terms: z.string().min(1, "Payment terms are required"),
  delivery_terms: z.string().optional(),
  purchase_policy: z.string().optional(),
});

type PurchaseOrderFormData = z.infer<typeof purchaseOrderSchema>;

interface LineItem {
  id: string;
  product: string;
  qty: number;
  estimated_unit_price: string;
  product_description: string;
  unit_of_measure: string;
}

const initialItems: LineItem[] = [
  {
    id: "1",
    product: "",
    qty: 0,
    estimated_unit_price: "",
    product_description: "",
    unit_of_measure: "",
  },
];

export default function Page() {
  const router = useRouter();
  const formRef = useRef<HTMLFormElement>(null);

  // API mutations and queries
  const [createPurchaseOrder, { isLoading: isCreating }] =
    useCreatePurchaseOrderMutation();
  const { data: currencies, isLoading: isLoadingCurrencies } =
    useGetCurrenciesQuery({});
  const { data: vendors, isLoading: isLoadingVendors } = useGetVendorsQuery({});
  const {
    data: products,
    isLoading: isLoadingProducts,
    error: productsError,
  } = useGetProductsQuery({});
  const { data: activeLocations, isLoading: isLoadingLocations } =
    useGetActiveLocationsFilteredQuery();

  // Form state
  const [items, setItems] = useState<LineItem[]>(initialItems);

  const addRow = () =>
    setItems((prev) => [
      ...prev,
      {
        id: Date.now().toString(),
        product: "",
        qty: 0,
        estimated_unit_price: "",
        product_description: "",
        unit_of_measure: "",
      },
    ]);

  const removeRow = (id: string) =>
    setItems((prev) => prev.filter((p) => p.id !== id));

  const updateItem = (id: string, patch: Partial<LineItem>) =>
    setItems((prev) =>
      prev.map((it) => (it.id === id ? { ...it, ...patch } : it))
    );

  const total = useMemo(() => {
    return items.reduce((acc, i) => {
      const qty = Number(i.qty) || 0;
      const price = Number(i.estimated_unit_price) || 0;
      return acc + qty * price;
    }, 0);
  }, [items]);

  // React Hook Form setup
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
    reset,
  } = useForm<PurchaseOrderFormData>({
    resolver: zodResolver(
      purchaseOrderSchema
    ) as Resolver<PurchaseOrderFormData>,
    defaultValues: {
      currency: "",
      vendor: "",
      destination_location: "",
      payment_terms: "",
      delivery_terms: "",
      purchase_policy: "",
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
  const currencyOptions: Option[] =
    currencies?.map((currency) => ({
      value: currency.id.toString(),
      label: `${currency.currency_name} (${currency.currency_symbol})`,
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

  const locationOptions: Option[] =
    activeLocations?.map((location) => ({
      value: location.id,
      label: `${location.location_name} (${location.location_code})`,
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
    { label: "Purchase", href: "/purchase" },
    {
      label: "Purchase Orders",
      href: "/purchase/purchase_orders",
      current: true,
    },
    { label: "New", href: "/purchase/purchase_orders/new", current: true },
  ];

  async function onSubmit(data: PurchaseOrderFormData): Promise<void> {
    // Validate items
    const validItems = items.filter(
      (item) => item.product && item.qty > 0 && item.estimated_unit_price
    );

    if (validItems.length === 0) {
      setNotification({
        message:
          "Please add at least one valid item with product, quantity, and price",
        type: "error",
        show: true,
      });
      return;
    }

    try {
      // Transform form data to match API format
      const purchaseOrderData = {
        currency: parseInt(data.currency),
        vendor: parseInt(data.vendor),
        destination_location: data.destination_location,
        payment_terms: data.payment_terms,
        delivery_terms: data.delivery_terms || "",
        purchase_policy: data.purchase_policy || "",
        created_by: loggedInUser?.id || 1,
        items: validItems.map((item) => ({
          product: parseInt(item.product),
          qty: item.qty,
          estimated_unit_price: item.estimated_unit_price.toString(),
        })),
        status: "draft" as const,
        is_submitted: false,
      };

      // Call the API mutation
      await createPurchaseOrder(purchaseOrderData).unwrap();

      // Show success notification
      setNotification({
        message: "Purchase order created successfully!",
        type: "success",
        show: true,
      });

      // Reset form and navigate to purchase orders page after a short delay
      setTimeout(() => {
        reset();
        setItems(initialItems);
        router.push("/purchase/purchase_orders");
      }, 1500);
    } catch (error: unknown) {
      // Handle API errors
      let errorMessage = "Failed to create purchase order. Please try again.";

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

  // Get currently selected currency symbol
  const getCurrentCurrencySymbol = () => {
    const selectedCurrencyId = watch("currency");
    if (!selectedCurrencyId || !currencies) return "₦"; // Default to Naira

    const selectedCurrency = currencies.find(
      (c) => c.id.toString() === selectedCurrencyId
    );
    return selectedCurrency?.currency_symbol || "₦";
  };

  const formatCurrency = (amount: number) => {
    const symbol = getCurrentCurrencySymbol();

    // Format number with proper locale formatting
    const formattedAmount = new Intl.NumberFormat("en-NG", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);

    return `${symbol} ${formattedAmount}`;
  };

  // Function to get product details when a product is selected
  const getProductDetails = (productId: string) => {
    const product = products?.find((p) => p.id.toString() === productId);
    return {
      description: product?.product_description || "No description available",
      unit: product?.unit_of_measure_details?.unit_symbol || "N/A",
    };
  };

  // Enhanced updateItem function that also populates product details
  const updateItemWithProductDetails = (
    id: string,
    patch: Partial<LineItem>
  ) => {
    setItems((prev) =>
      prev.map((it) => {
        if (it.id === id) {
          const updatedItem = { ...it, ...patch };

          // If product is being updated, populate description and unit
          if (patch.product && patch.product !== it.product) {
            const productDetails = getProductDetails(patch.product);
            updatedItem.product_description = productDetails.description;
            updatedItem.unit_of_measure = productDetails.unit;
          }

          return updatedItem;
        }
        return it;
      })
    );
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
        <PageHeader items={breadcrumsItem} title="New Purchase Order" />
      </motion.div>

      {/* Main form area */}
      <motion.main
        className="h-full mx-auto px-6 py-8 bg-white"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut", delay: 0.2 }}
      >
        <form
          ref={formRef}
          onSubmit={handleSubmit(onSubmit)}
          className="bg-white"
        >
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

                  {/* Created By */}
                  <FadeIn>
                    <div className="p-4 transition-colors border-r border-gray-300">
                      <h3 className="text-base font-semibold text-[#3B7CED] mb-2">
                        Created By
                      </h3>
                      <p className="text-gray-700">
                        {loggedInUser?.username || "User"}
                      </p>
                    </div>
                  </FadeIn>
                </StaggerContainer>
              </div>
            </SlideUp>
          </div>

          {/* Purchase order form fields */}
          <motion.div
            className="md:flex md:items-start md:gap-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: "easeOut", delay: 0.5 }}
          >
            <div className="flex-1">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Currency */}
                <motion.div
                  className="col-span-1"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, ease: "easeOut", delay: 0.1 }}
                >
                  <Label
                    htmlFor="currency"
                    className="block text-sm font-medium text-gray-900 mb-2"
                  >
                    Currency *
                  </Label>
                  <Select
                    value={watch("currency") || ""}
                    onValueChange={(value) => setValue("currency", value)}
                    disabled={isLoadingCurrencies}
                  >
                    <SelectTrigger
                      className="w-full h-11 border border-gray-400 rounded bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                      size="md"
                    >
                      <SelectValue placeholder="Select currency" />
                    </SelectTrigger>
                    <SelectContent>
                      {currencyOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.currency && (
                    <p className="text-sm text-red-600 mt-1">
                      {errors.currency.message}
                    </p>
                  )}
                </motion.div>

                {/* Vendor */}
                <motion.div
                  className="col-span-1"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, ease: "easeOut", delay: 0.2 }}
                >
                  <Label
                    htmlFor="vendor"
                    className="block text-sm font-medium text-gray-900 mb-2"
                  >
                    Vendor *
                  </Label>
                  <Select
                    value={watch("vendor") || ""}
                    onValueChange={(value) => setValue("vendor", value)}
                    disabled={isLoadingVendors}
                  >
                    <SelectTrigger
                      className="w-full h-11 border border-gray-400 rounded bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                      size="md"
                    >
                      <SelectValue placeholder="Select vendor" />
                    </SelectTrigger>
                    <SelectContent>
                      {vendorOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.vendor && (
                    <p className="text-sm text-red-600 mt-1">
                      {errors.vendor.message}
                    </p>
                  )}
                </motion.div>

                {/* Destination Location */}
                <motion.div
                  className="col-span-1"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, ease: "easeOut", delay: 0.3 }}
                >
                  <Label
                    htmlFor="destination_location"
                    className="block text-sm font-medium text-gray-900 mb-2"
                  >
                    Destination Location *
                  </Label>
                  <Select
                    value={watch("destination_location") || ""}
                    onValueChange={(value) =>
                      setValue("destination_location", value)
                    }
                    disabled={isLoadingLocations}
                  >
                    <SelectTrigger
                      className="w-full h-11 border border-gray-400 rounded bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                      size="md"
                    >
                      <SelectValue placeholder="Select destination location" />
                    </SelectTrigger>
                    <SelectContent>
                      {locationOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.destination_location && (
                    <p className="text-sm text-red-600 mt-1">
                      {errors.destination_location.message}
                    </p>
                  )}
                </motion.div>

                {/* Payment Terms */}
                <motion.div
                  className="col-span-1"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, ease: "easeOut", delay: 0.4 }}
                >
                  <Label
                    htmlFor="payment_terms"
                    className="block text-sm font-medium text-gray-900 mb-2"
                  >
                    Payment Terms *
                  </Label>
                  <Input
                    id="payment_terms"
                    placeholder="Enter payment terms"
                    {...register("payment_terms")}
                    className="h-11 bg-white border border-gray-400 rounded shadow-none placeholder:text-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all duration-200"
                  />
                  {errors.payment_terms && (
                    <p className="text-sm text-red-600 mt-1">
                      {errors.payment_terms.message}
                    </p>
                  )}
                </motion.div>

                {/* Delivery Terms */}
                <motion.div
                  className="col-span-1"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, ease: "easeOut", delay: 0.5 }}
                >
                  <Label
                    htmlFor="delivery_terms"
                    className="block text-sm font-medium text-gray-900 mb-2"
                  >
                    Delivery Terms
                  </Label>
                  <Input
                    id="delivery_terms"
                    placeholder="Enter delivery terms"
                    {...register("delivery_terms")}
                    className="h-11 bg-white border border-gray-400 rounded shadow-none placeholder:text-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all duration-200"
                  />
                </motion.div>

                {/* Purchase Policy */}
                <motion.div
                  className="col-span-1 lg:col-span-3"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, ease: "easeOut", delay: 0.6 }}
                >
                  <Label
                    htmlFor="purchase_policy"
                    className="block text-sm font-medium text-gray-900 mb-2"
                  >
                    Purchase Policy
                  </Label>
                  <Textarea
                    id="purchase_policy"
                    placeholder="Enter purchase policy"
                    {...register("purchase_policy")}
                    className="bg-white border border-gray-400 rounded shadow-none placeholder:text-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all duration-200"
                    rows={3}
                  />
                </motion.div>
              </div>
            </div>
          </motion.div>

          <section className="bg-white mt-8 border-none">
            <div className="mx-auto">
              <div className="overflow-x-auto">
                <Table className="min-w-[1100px] table-fixed">
                  <TableHeader className="bg-[#F6F7F8]">
                    <TableRow>
                      <TableHead className="w-30 border border-gray-200 px-4 py-3 text-left text-sm text-gray-600 font-medium">
                        Product
                      </TableHead>
                      <TableHead className="w-80 border border-gray-200 px-4 py-3 text-left text-sm text-gray-600 font-medium">
                        Description
                      </TableHead>
                      <TableHead className="w-20 border border-gray-200 px-4 py-3 text-center text-sm text-gray-600 font-medium">
                        QTY
                      </TableHead>
                      <TableHead className="w-24 border border-gray-200 px-4 py-3 text-center text-sm text-gray-600 font-medium">
                        Unit of Measure
                      </TableHead>
                      <TableHead className="w-32 border border-gray-200 px-4 py-3 text-right text-sm text-gray-600 font-medium">
                        Estimated Unit Price
                      </TableHead>
                      <TableHead className="w-28 border border-gray-200 px-4 py-3 text-right text-sm text-gray-600 font-medium">
                        Total Price
                      </TableHead>
                      <TableHead className="w-16 border border-gray-200 px-4 py-3 text-center text-sm text-gray-600 font-medium">
                        Action
                      </TableHead>
                    </TableRow>
                  </TableHeader>

                  <TableBody className="bg-white">
                    {items.map((it) => {
                      const rowTotal =
                        it.qty * Number(it.estimated_unit_price || 0);
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

                          <TableCell className="border border-gray-200 align-middle text-center">
                            <Input
                              type="number"
                              min={1}
                              aria-label="Quantity"
                              value={String(it.qty)}
                              onChange={(e) =>
                                updateItemWithProductDetails(it.id, {
                                  qty: Math.max(1, Number(e.target.value || 0)),
                                })
                              }
                              className="h-11 w-full text-center rounded-none border-0 focus:ring-0 focus:ring-offset-0"
                            />
                          </TableCell>

                          <TableCell className="border border-gray-200 px-4 align-middle text-center">
                            <div className="text-sm text-gray-700">
                              {it.unit_of_measure || "N/A"}
                            </div>
                          </TableCell>

                          <TableCell className="border border-gray-200 px-4 align-middle text-right">
                            <Input
                              type="number"
                              step="0.01"
                              min="0"
                              aria-label="Estimated unit price"
                              value={String(it.estimated_unit_price)}
                              onChange={(e) =>
                                updateItemWithProductDetails(it.id, {
                                  estimated_unit_price: e.target.value,
                                })
                              }
                              placeholder="0.00"
                              className="h-11 w-28 text-right rounded-none border-0 focus:ring-0 focus:ring-offset-0"
                            />
                          </TableCell>

                          <TableCell className="border border-gray-200 px-4 align-middle text-right">
                            <div className="text-sm font-medium text-gray-800 tabular-nums">
                              {formatCurrency(rowTotal)}
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
                    <TableRow className="">
                      {/* Empty cells for alignment */}
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

            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
              <div className="ml-auto flex items-center gap-4 border-x border-b">
                <div className="hidden sm:block text-sm text-slate-700 px-4 py-2 bg-white rounded-md">
                  <div className="flex items-center justify-between gap-6 min-w-[220px] ">
                    <span className="text-sm text-slate-600">Total</span>
                    <span className="font-medium">{formatCurrency(total)}</span>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Form actions */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: "easeOut", delay: 0.6 }}
          >
            <PurchaseRequestFormActions
              formRef={formRef}
              submitText={isCreating ? "Creating..." : "Create Purchase Order"}
              isLoading={isCreating}
            />
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
