"use client";

import React, { useMemo, useRef, useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { PageHeader } from "@/components/purchase/products/PageHeader";
import { BreadcrumbItem } from "@/types/purchase";
import {
  useCreateInvoiceMutation,
  CreateInvoiceItemRequest,
  InvoiceStatus,
} from "@/api/invoice/invoiceApi";
import { useGetVendorsQuery } from "@/api/purchase/vendorsApi";
import {
  useGetPurchaseOrdersQuery,
  PurchaseOrder,
} from "@/api/purchase/purchaseOrderApi";
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

// Invoice line item type
interface InvoiceLineItem {
  id: string;
  product: string;
  product_name: string;
  quantity: number;
  unit_price: string;
  product_description: string;
  unit_of_measure: string;
}

const initialItems: InvoiceLineItem[] = [];

// Invoice form schema
const invoiceFormSchema = z.object({
  due_date: z.string().min(1, "Due date is required"),
  status: z.enum(["paid", "partial", "unpaid", "overdue", "cancelled"]),
  vendor: z.string().min(1, "Vendor is required"),
  purchase_order: z.string().min(1, "Purchase order is required"),
});

type InvoiceFormData = z.infer<typeof invoiceFormSchema>;

export default function Page() {
  const router = useRouter();
  const formRef = useRef<HTMLFormElement>(null);

  // API mutations and queries
  const [createInvoice, { isLoading: isCreating }] = useCreateInvoiceMutation();
  const { data: vendors, isLoading: isLoadingVendors } = useGetVendorsQuery({});
  const { data: purchaseOrders, isLoading: isLoadingPurchaseOrders } =
    useGetPurchaseOrdersQuery({ status: "completed" });

  // Form state
  const [items, setItems] = useState<InvoiceLineItem[]>(initialItems);

  const addRow = () =>
    setItems((prev) => [
      ...prev,
      {
        id: Date.now().toString(),
        product: "",
        product_name: "",
        quantity: 0,
        unit_price: "",
        product_description: "",
        unit_of_measure: "",
      },
    ]);

  const removeRow = (id: string) =>
    setItems((prev) => prev.filter((p) => p.id !== id));

  const total = useMemo(() => {
    return items.reduce((acc, i) => {
      const qty = Number(i.quantity) || 0;
      const price = Number(i.unit_price) || 0;
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
  } = useForm<InvoiceFormData>({
    resolver: zodResolver(invoiceFormSchema) as Resolver<InvoiceFormData>,
    defaultValues: {
      due_date: "",
      status: "unpaid",
      vendor: "",
      purchase_order: "",
    },
  });

  const loggedInUser = useSelector((state: RootState) => state.auth.user);

  // Watch purchase order selection
  const selectedPurchaseOrderId = watch("purchase_order");

  // Auto-fill items when purchase order is selected
  useEffect(() => {
    if (selectedPurchaseOrderId && purchaseOrders) {
      const selectedPO = purchaseOrders.find(
        (po) => po.id === selectedPurchaseOrderId
      );

      if (selectedPO) {
        // Auto-fill vendor
        setValue("vendor", selectedPO.vendor.toString());

        // Auto-fill items from purchase order
        const poItems: InvoiceLineItem[] = selectedPO.items.map(
          (item, index) => ({
            id: `po-item-${item.id}-${index}`,
            product: item.product.toString(),
            product_name: item.product_details?.product_name || "",
            quantity: item.qty,
            unit_price: item.estimated_unit_price,
            product_description:
              item.product_details?.product_description || "",
            unit_of_measure:
              item.product_details?.unit_of_measure_details?.unit_symbol ||
              "N/A",
          })
        );

        setItems(poItems);
      }
    }
  }, [selectedPurchaseOrderId, purchaseOrders, setValue]);

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
  const vendorOptions: Option[] =
    vendors?.map((vendor) => ({
      value: vendor.id.toString(),
      label: vendor.company_name,
    })) || [];

  // Filter only approved purchase orders
  const approvedPurchaseOrders = useMemo(() => {
    return purchaseOrders?.filter((po) => po.status === "completed") || [];
  }, [purchaseOrders]);

  const purchaseOrderOptions: Option[] = approvedPurchaseOrders.map((po) => ({
    value: po.id,
    label: `${po.id} - ${po.vendor_details?.company_name || "Unknown Vendor"}`,
  }));

  const statusOptions: Option[] = [
    { value: "unpaid", label: "Unpaid" },
    { value: "paid", label: "Paid" },
    { value: "partial", label: "Partial" },
    { value: "overdue", label: "Overdue" },
    { value: "cancelled", label: "Cancelled" },
  ];

  const breadcrumbItems: BreadcrumbItem[] = [
    { label: "Home", href: "/" },
    { label: "Invoice", href: "/invoice" },
    { label: "New", href: "/invoice/new", current: true },
  ];

  async function onSubmit(data: InvoiceFormData): Promise<void> {
    // Validate items
    const validItems = items.filter(
      (item) => item.product && item.quantity > 0 && item.unit_price
    );

    if (validItems.length === 0) {
      setNotification({
        message:
          "Please add at least one valid item with product, quantity, and unit price",
        type: "error",
        show: true,
      });
      return;
    }

    try {
      // Transform form data to match API format
      const invoiceData = {
        due_date: data.due_date,
        status: data.status as InvoiceStatus,
        vendor: parseInt(data.vendor),
        purchase_order: data.purchase_order,
        invoice_items: validItems.map(
          (item): CreateInvoiceItemRequest => ({
            product: parseInt(item.product),
            quantity: item.quantity,
            unit_price: item.unit_price,
          })
        ),
      };

      // Call the API mutation
      await createInvoice(invoiceData).unwrap();

      // Show success notification
      setNotification({
        message: "Invoice created successfully!",
        type: "success",
        show: true,
      });

      // Reset form and navigate to invoices page after a short delay
      setTimeout(() => {
        reset();
        setItems(initialItems);
        router.push("/invoice");
      }, 1500);
    } catch (error: unknown) {
      // Handle API errors
      let errorMessage = "Failed to create invoice. Please try again.";

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
    const formattedAmount = new Intl.NumberFormat("en-NG", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);

    return `₦ ${formattedAmount}`;
  };

  // Update item quantity or price
  const updateItem = (id: string, patch: Partial<InvoiceLineItem>) => {
    setItems((prev) =>
      prev.map((it) => (it.id === id ? { ...it, ...patch } : it))
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
        <PageHeader items={breadcrumbItems} title="New Invoice" />
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

          {/* Invoice form fields */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: "easeOut", delay: 0.5 }}
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
              {/* Purchase Order - First so it auto-fills vendor */}
              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium text-gray-700">
                  Purchase Order <span className="text-red-500">*</span>
                </label>
                <Select
                  value={watch("purchase_order")}
                  onValueChange={(value) => setValue("purchase_order", value)}
                  disabled={isLoadingPurchaseOrders}
                >
                  <SelectTrigger size="md" className="w-full h-11">
                    <SelectValue
                      placeholder={
                        isLoadingPurchaseOrders
                          ? "Loading..."
                          : "Select approved purchase order"
                      }
                    />
                  </SelectTrigger>
                  <SelectContent>
                    {purchaseOrderOptions.length === 0 ? (
                      <SelectItem value="__no_po__" disabled>
                        No approved purchase orders available
                      </SelectItem>
                    ) : (
                      purchaseOrderOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
                {errors.purchase_order && (
                  <span className="text-red-500 text-xs">
                    {errors.purchase_order.message}
                  </span>
                )}
              </div>

              {/* Due Date */}
              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium text-gray-700">
                  Due Date <span className="text-red-500">*</span>
                </label>
                <Input type="date" {...register("due_date")} className="h-11" />
                {errors.due_date && (
                  <span className="text-red-500 text-xs">
                    {errors.due_date.message}
                  </span>
                )}
              </div>

              {/* Status */}
              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium text-gray-700">
                  Status <span className="text-red-500">*</span>
                </label>
                <Select
                  value={watch("status")}
                  onValueChange={(value) =>
                    setValue("status", value as InvoiceFormData["status"])
                  }
                >
                  <SelectTrigger size="md" className="w-full h-11">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    {statusOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.status && (
                  <span className="text-red-500 text-xs">
                    {errors.status.message}
                  </span>
                )}
              </div>

              {/* Vendor - Auto-filled from PO but can be changed */}
              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium text-gray-700">
                  Vendor <span className="text-red-500">*</span>
                </label>
                <Select
                  value={watch("vendor")}
                  onValueChange={(value) => setValue("vendor", value)}
                  disabled={isLoadingVendors}
                >
                  <SelectTrigger size="md" className="w-full h-11">
                    <SelectValue
                      placeholder={
                        isLoadingVendors ? "Loading..." : "Select vendor"
                      }
                    />
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
                  <span className="text-red-500 text-xs">
                    {errors.vendor.message}
                  </span>
                )}
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
                        Unit Price
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
                    {items.length === 0 ? (
                      <TableRow>
                        <TableCell
                          colSpan={7}
                          className="border border-gray-200 px-4 py-8 text-center text-gray-500"
                        >
                          Select a purchase order to auto-fill items
                        </TableCell>
                      </TableRow>
                    ) : (
                      items.map((it) => {
                        const rowTotal =
                          it.quantity * Number(it.unit_price || 0);
                        return (
                          <TableRow
                            key={it.id}
                            className="group hover:bg-[#FBFBFB] focus-within:bg-[#FBFBFB] transition-colors duration-150"
                          >
                            <TableCell className="border border-gray-200 px-4 align-middle">
                              <div className="text-sm text-gray-700 font-medium">
                                {it.product_name || `Product #${it.product}`}
                              </div>
                            </TableCell>

                            <TableCell className="border border-gray-200 px-4 align-middle">
                              <div className="text-sm text-gray-600 line-clamp-2">
                                {it.product_description || "No description"}
                              </div>
                            </TableCell>

                            <TableCell className="border border-gray-200 align-middle text-center">
                              <Input
                                type="number"
                                min={1}
                                aria-label="Quantity"
                                value={String(it.quantity)}
                                onChange={(e) =>
                                  updateItem(it.id, {
                                    quantity: Math.max(
                                      1,
                                      Number(e.target.value || 0)
                                    ),
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
                                aria-label="Unit price"
                                value={String(it.unit_price)}
                                onChange={(e) =>
                                  updateItem(it.id, {
                                    unit_price: e.target.value,
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
                      })
                    )}
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
            className="flex justify-end gap-4 mt-8"
          >
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push("/invoice")}
              className="px-6"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isCreating}
              className="px-6 bg-blue-600 hover:bg-blue-700"
            >
              {isCreating ? "Creating..." : "Create Invoice"}
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
