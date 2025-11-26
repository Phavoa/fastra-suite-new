"use client";

import React, { useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { PageHeader } from "@/components/purchase/products/PageHeader";
import {
  PurchaseRequestFormFields,
  PurchaseRequestFormActions,
} from "@/components/purchase/purchaseRequest";
import { BreadcrumbItem } from "@/types/purchase";
import { useCreatePurchaseRequestMutation } from "@/api/purchase/purchaseRequestApi";
import { useGetCurrenciesQuery } from "@/api/purchase/currencyApi";
import { useGetVendorsQuery } from "@/api/purchase/vendorsApi";
import { useGetProductsQuery } from "@/api/purchase/productsApi";
import { ToastNotification } from "@/components/shared/ToastNotification";
import {
  purchaseRequestSchema,
  type PurchaseRequestFormData,
  type LineItem,
} from "@/schemas/purchaseRequestSchema";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type Option = { value: string; label: string };

const initialItems: LineItem[] = [
  { id: "1", product: "", qty: 0, estimated_unit_price: "" },
];

export default function Page() {
  const router = useRouter();
  const formRef = useRef<HTMLFormElement>(null);

  // API mutations and queries
  const [createPurchaseRequest, { isLoading: isCreating }] =
    useCreatePurchaseRequestMutation();
  const { data: currencies, isLoading: isLoadingCurrencies } =
    useGetCurrenciesQuery({});
  const { data: vendors, isLoading: isLoadingVendors } = useGetVendorsQuery({});
  const { data: products, isLoading: isLoadingProducts } = useGetProductsQuery(
    {}
  );

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
    formState: { errors },
    reset,
  } = useForm<PurchaseRequestFormData>({
    resolver: zodResolver(
      purchaseRequestSchema
    ) as Resolver<PurchaseRequestFormData>,
    defaultValues: {
      currency: "",
      vendor: "",
      purpose: "",
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

  const breadcrumsItem: BreadcrumbItem[] = [
    { label: "Home", href: "/" },
    { label: "Purchase", href: "/purchase" },
    {
      label: "Purchase Requests",
      href: "/purchase/purchase_requests",
      current: true,
    },
    { label: "New", href: "/purchase/purchase_requests/new", current: true },
  ];

  async function onSubmit(data: PurchaseRequestFormData): Promise<void> {
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
      const purchaseRequestData = {
        currency: parseInt(data.currency),
        vendor: parseInt(data.vendor),
        purpose: data.purpose,
        requester: loggedInUser?.id || 1, // Default to 1 or logged in user ID
        requesting_location: "main", // Default location, could be made dynamic
        items: validItems.map((item) => ({
          product: parseInt(item.product),
          qty: item.qty,
          estimated_unit_price: item.estimated_unit_price.toString(),
        })),
        status: "draft" as const,
        is_submitted: false,
      };

      // Call the API mutation
      await createPurchaseRequest(purchaseRequestData).unwrap();

      // Show success notification
      setNotification({
        message: "Purchase request created successfully!",
        type: "success",
        show: true,
      });

      // Reset form and navigate to purchase requests page after a short delay
      setTimeout(() => {
        reset();
        setItems(initialItems);
        router.push("/purchase/purchase_requests");
      }, 1500);
    } catch (error: unknown) {
      // Handle API errors
      let errorMessage = "Failed to create purchase request. Please try again.";

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

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
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
        <PageHeader items={breadcrumsItem} title="New Purchase Request" />
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

                  {/* Requester */}
                  <FadeIn>
                    <div className="p-4 transition-colors border-r border-gray-300">
                      <h3 className="text-base font-semibold text-[#3B7CED] mb-2">
                        Requester
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

          {/* Purchase request form fields */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: "easeOut", delay: 0.5 }}
          >
            <PurchaseRequestFormFields
              register={register}
              errors={errors}
              setValue={setValue}
              currencyOptions={currencyOptions}
              vendorOptions={vendorOptions}
              isLoadingCurrencies={isLoadingCurrencies}
              isLoadingVendors={isLoadingVendors}
            />
          </motion.div>

          <section className="bg-white border border-gray-100 rounded-md shadow-sm mt-8">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-100">
                <thead className="bg-gray-50">
                  <tr className="text-sm text-slate-600">
                    <th className="px-4 py-3 text-left">Product</th>
                    <th className="px-4 py-3 text-center w-24">Quantity</th>
                    <th className="px-4 py-3 text-right w-40">
                      Estimated Unit Price
                    </th>
                    <th className="px-4 py-3 text-right w-36">Total Price</th>
                    <th className="px-4 py-3 text-center w-12"> </th>
                  </tr>
                </thead>

                <tbody className="bg-white divide-y divide-gray-100">
                  {items.map((it) => {
                    const rowTotal =
                      it.qty * Number(it.estimated_unit_price || 0);
                    return (
                      <tr key={it.id} className="group hover:bg-gray-50">
                        <td className="px-4 py-3 align-middle">
                          <Select
                            value={it.product}
                            onValueChange={(value) =>
                              updateItem(it.id, { product: value })
                            }
                            disabled={isLoadingProducts}
                          >
                            <SelectTrigger className="h-11 rounded-none rounded-l-md border-r border-gray-100 focus:ring-4 focus:ring-blue-100">
                              <SelectValue placeholder="Select product" />
                            </SelectTrigger>
                            <SelectContent>
                              {productOptions.map((option) => (
                                <SelectItem
                                  key={option.value}
                                  value={option.value}
                                >
                                  {option.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </td>

                        <td className="px-4 py-3 align-middle text-center">
                          <Input
                            type="number"
                            min={1}
                            aria-label="Quantity"
                            value={String(it.qty)}
                            onChange={(e) =>
                              updateItem(it.id, {
                                qty: Math.max(1, Number(e.target.value || 0)),
                              })
                            }
                            className="h-11 w-20 text-center rounded-none border-r border-gray-100 focus:ring-4 focus:ring-blue-100"
                          />
                        </td>

                        <td className="px-4 py-3 align-middle text-right">
                          <Input
                            type="number"
                            step="0.01"
                            min="0"
                            aria-label="Estimated unit price"
                            value={String(it.estimated_unit_price)}
                            onChange={(e) =>
                              updateItem(it.id, {
                                estimated_unit_price: e.target.value,
                              })
                            }
                            placeholder="0.00"
                            className="h-11 w-40 text-right rounded-none border-r border-gray-100 focus:ring-4 focus:ring-blue-100"
                          />
                        </td>

                        <td className="px-4 py-3 align-middle text-right">
                          <div className="h-11 flex items-center justify-end pr-3 text-sm font-medium">
                            {formatCurrency(rowTotal)}
                          </div>
                        </td>

                        <td className="px-4 py-3 align-middle text-center">
                          <button
                            onClick={() => removeRow(it.id)}
                            aria-label="Remove row"
                            className="opacity-0 group-hover:opacity-100 transition-opacity duration-150 p-2 rounded-md hover:bg-red-50"
                            disabled={items.length === 1}
                          >
                            <Trash className="w-4 h-4 text-red-500" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <div className="px-4 py-3 border-t border-gray-100 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
              <div className="flex items-center gap-3">
                <Button
                  variant="ghost"
                  onClick={addRow}
                  className="flex items-center gap-2 px-3 py-2 text-sm border rounded-md hover:bg-gray-50"
                  aria-label="Add row"
                >
                  <Plus className="w-4 h-4" />
                </Button>
              </div>

              <div className="ml-auto flex items-center gap-4">
                <div className="hidden sm:block text-sm text-slate-700 px-4 py-2 bg-white rounded-md border border-gray-100">
                  <div className="flex items-center justify-between gap-6 min-w-[220px]">
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
              submitText={
                isCreating ? "Creating..." : "Create Purchase Request"
              }
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
