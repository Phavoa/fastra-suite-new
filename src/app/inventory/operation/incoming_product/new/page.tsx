"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useForm, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { ArrowLeft, Plus, Trash, PackagePlus } from "lucide-react";

import { ToastNotification } from "@/components/shared/ToastNotification";
import { DiscrepancyDialog, type DiscrepancyType } from "@/components/shared/DiscrepancyDialog";
import { PageGuard } from "@/components/auth/PageGuard";
import Breadcrumbs from "@/components/shared/BreadScrumbs";
import { AutoSaveIcon } from "@/components/shared/icons";
import { BreadcrumbItem } from "@/types/purchase";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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

interface GRNLineItem {
  id: string;
  product: string;
  product_name: string;
  product_description: string;
  unit_symbol: string;
  expected_quantity: string;
  received_quantity: string;
  accepted_quantity: string;
  rejected_quantity: string;
  reject_reason: string;
}

const receiptTypes = ["vendor_receipt", "returns", "scrap"] as const;

const incomingProductSchema = z.object({
  receipt_type: z.enum(receiptTypes),
  supplier: z.string().min(1, "Supplier is required"),
  destination_location: z.string().min(1, "Destination location is required"),
  delivery_note: z.string().min(1, "Delivery note / Waybill number is required"),
  notes: z.string().optional(),
});

type IncomingProductFormData = z.infer<typeof incomingProductSchema>;

const DUMMY_LOCATIONS: Option[] = [
  { value: "WH-MAIN", label: "Main Warehouse - Site A (WH-MAIN)" },
  { value: "WH-SEC", label: "Secondary Store - Site B (WH-SEC)" },
];

const DUMMY_SUPPLIERS: Option[] = [
  { value: "SUP-1", label: "Dangote Cement Plc" },
  { value: "SUP-2", label: "Julius Berger Steel Co." },
  { value: "SUP-3", label: "Lafarge Africa Plc" },
];

const DUMMY_PRODUCTS = [
  { id: "1", product_name: "Cement (50kg Bag)", product_description: "Portland Cement Grade 42.5", unit_symbol: "Bags" },
  { id: "2", product_name: "Reinforcement Steel 16mm", product_description: "High Yield Deformed Steel Bars", unit_symbol: "Tonnes" },
  { id: "3", product_name: "Sharp Sand", product_description: "Clean river sharp sand for plastering", unit_symbol: "m³" },
  { id: "4", product_name: "Safety Helmets (Yellow)", product_description: "HDPE Hard Hats with adjustable strap", unit_symbol: "Pcs" },
];

export default function NewIncomingProductPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [items, setItems] = useState<GRNLineItem[]>([
    {
      id: "1",
      product: "1",
      product_name: "Cement (50kg Bag)",
      product_description: "Portland Cement Grade 42.5",
      unit_symbol: "Bags",
      expected_quantity: "100",
      received_quantity: "100",
      accepted_quantity: "100",
      rejected_quantity: "0",
      reject_reason: "",
    },
  ]);

  const [discrepancyState, setDiscrepancyState] = useState<{
    isOpen: boolean;
    type: DiscrepancyType | null;
    ipId: string | null;
  }>({
    isOpen: false,
    type: null,
    ipId: null,
  });

  const [notification, setNotification] = React.useState<{
    message: string;
    type: "success" | "error";
    show: boolean;
  }>({
    message: "",
    type: "success",
    show: false,
  });

  const addRow = () =>
    setItems((prev) => [
      ...prev,
      {
        id: Date.now().toString(),
        product: "",
        product_name: "",
        product_description: "",
        unit_symbol: "",
        expected_quantity: "0",
        received_quantity: "0",
        accepted_quantity: "0",
        rejected_quantity: "0",
        reject_reason: "",
      },
    ]);

  const removeRow = (itemId: string) =>
    setItems((prev) => prev.filter((p) => p.id !== itemId));

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<IncomingProductFormData>({
    resolver: zodResolver(incomingProductSchema) as Resolver<IncomingProductFormData>,
    defaultValues: {
      receipt_type: "vendor_receipt",
      supplier: "SUP-1",
      destination_location: "WH-MAIN",
      delivery_note: `DN-${Math.floor(10000 + Math.random() * 90000)}`,
      notes: "Direct site procurement delivery inspection.",
    },
  });

  const productOptions: Option[] = DUMMY_PRODUCTS.map((p) => ({
    value: p.id,
    label: p.product_name,
  }));

  const updateItemProduct = (itemId: string, productId: string) => {
    const p = DUMMY_PRODUCTS.find((item) => item.id === productId);
    setItems((prev) =>
      prev.map((it) =>
        it.id === itemId
          ? {
              ...it,
              product: productId,
              product_name: p?.product_name || "",
              product_description: p?.product_description || "",
              unit_symbol: p?.unit_symbol || "",
            }
          : it
      )
    );
  };

  const updateItemQty = (
    itemId: string,
    field: "expected_quantity" | "received_quantity" | "accepted_quantity" | "rejected_quantity",
    val: string
  ) => {
    setItems((prev) =>
      prev.map((it) => {
        if (it.id !== itemId) return it;
        const updated = { ...it, [field]: val };
        const rec = Number(updated.received_quantity) || 0;
        if (field === "received_quantity" || field === "accepted_quantity") {
          const acc = Number(updated.accepted_quantity) || 0;
          updated.rejected_quantity = Math.max(0, rec - acc).toString();
        }
        return updated;
      })
    );
  };

  const updateReason = (itemId: string, val: string) => {
    setItems((prev) => prev.map((it) => (it.id === itemId ? { ...it, reject_reason: val } : it)));
  };

  async function onSaveDraft(data: IncomingProductFormData) {
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setNotification({
        message: "Direct Goods Receipt Note (GRN) draft saved successfully!",
        type: "success",
        show: true,
      });
      setTimeout(() => {
        router.push("/inventory/operation");
      }, 1000);
    }, 500);
  }

  async function onValidateGRN(data: IncomingProductFormData) {
    const validItems = items.filter((it) => it.product && Number(it.received_quantity) > 0);
    if (validItems.length === 0) {
      setNotification({ message: "Please enter at least one valid product line with received quantity > 0", type: "error", show: true });
      return;
    }

    for (const item of validItems) {
      if (Number(item.rejected_quantity) > 0 && !item.reject_reason.trim()) {
        setNotification({ message: `Please provide a reject reason for ${item.product_name || "rejected item"}`, type: "error", show: true });
        return;
      }
    }

    const hasBackorder = validItems.some((it) => Number(it.accepted_quantity) < Number(it.expected_quantity));

    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      if (hasBackorder) {
        setDiscrepancyState({
          isOpen: true,
          type: "backorder",
          ipId: "WH-IN-0004",
        });
      } else {
        setNotification({
          message: "GRN Validated! Accepted quantities added to active warehouse stock.",
          type: "success",
          show: true,
        });
        setTimeout(() => {
          router.push("/inventory/operation");
        }, 1200);
      }
    }, 500);
  }

  const handleCreateBackorder = () => {
    setDiscrepancyState({ isOpen: false, type: null, ipId: null });
    setNotification({
      message: "GRN Validated & Backorder created for remaining pending balance!",
      type: "success",
      show: true,
    });
    setTimeout(() => {
      router.push("/inventory/operation");
    }, 1200);
  };

  const handleCloseWithoutBackorder = () => {
    setDiscrepancyState({ isOpen: false, type: null, ipId: null });
    setNotification({
      message: "GRN Validated! Delivery closed without backorder.",
      type: "success",
      show: true,
    });
    setTimeout(() => {
      router.push("/inventory/operation");
    }, 1200);
  };

  const breadcrumbsItem: BreadcrumbItem[] = [
    { label: "Home", href: "/" },
    { label: "Inventory", href: "/inventory" },
    { label: "Operation", href: "/inventory/operation" },
    { label: "New Receipt (GRN)", href: "/inventory/operation/incoming_product/new", current: true },
  ];

  return (
    <PageGuard application="inventory" module="incomingproduct">
      {/* Two-tone: gray page canvas */}
      <div className="flex flex-col flex-1 min-h-[calc(100vh-64px)] bg-[#F6F9FC] relative pb-28">
        <main className="max-w-[1400px] mx-auto px-4 sm:px-6 py-6 w-full flex flex-col gap-6">
          <Breadcrumbs
            items={breadcrumbsItem}
            action={
              <Button
                variant="ghost"
                className="text-sm text-gray-400 flex items-center gap-2 hover:text-[#3B7CED] transition-colors duration-200"
              >
                Autosaved <AutoSaveIcon />
              </Button>
            }
          />

          {/* Top Bar Card */}
          <div className="bg-white rounded-lg shadow-2xs border border-gray-100 p-6 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-lg bg-[#E8F0FE] text-[#1A73E8]">
                <PackagePlus className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-xl font-semibold text-[#32325D]">
                  Record Direct Goods Receipt Note (GRN)
                </h1>
                <p className="text-xs text-[#8898AA] mt-0.5">
                  Formalize site delivery inspections and post stock directly into warehouse inventory.
                </p>
              </div>
            </div>
            <Link href="/inventory/operation">
              <Button variant="outline" className="border-gray-200 text-gray-600 hover:bg-gray-50 text-sm h-9 px-3">
                <ArrowLeft className="w-4 h-4 mr-1.5" /> Cancel
              </Button>
            </Link>
          </div>

          <form className="flex flex-col gap-6">
            {/* Delivery & Supplier Information Card */}
            <div className="bg-white rounded-lg shadow-2xs border border-gray-100 p-6">
              <h2 className="text-base font-semibold text-[#32325D] mb-4 pb-3 border-b border-gray-100">
                Delivery & Supplier Information
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="flex flex-col gap-2">
                  <Label className="text-xs font-semibold text-[#525F7F]">
                    Related PO
                  </Label>
                  <div className="p-2 bg-gray-50 border border-gray-200 rounded-md text-sm text-[#32325D]">
                    PO-2026-0105
                  </div>
                </div>

                <div className="flex flex-col gap-2">
                  <Label className="text-xs font-semibold text-[#525F7F]">
                    Supplier / Vendor
                  </Label>
                  <div className="p-2 bg-gray-50 border border-gray-200 rounded-md text-sm text-[#32325D]">
                    Julius Berger Steel
                  </div>
                </div>

                <div className="flex flex-col gap-2">
                  <Label className="text-xs font-semibold text-[#525F7F]">
                    Destination Store
                  </Label>
                  <div className="p-2 bg-gray-50 border border-gray-200 rounded-md text-sm text-[#32325D]">
                    Main Warehouse - Site A
                  </div>
                </div>

                <div className="flex flex-col gap-2">
                  <Label className="text-xs font-semibold text-[#525F7F]">
                    Delivery Note / Waybill <span className="text-[#E43D2B]">*</span>
                  </Label>
                  <Input
                    {...register("delivery_note")}
                    placeholder="e.g. DN-90124"
                    className="bg-white border-gray-200 rounded-md h-9 text-sm text-[#32325D] focus:ring-[#3B7CED]"
                  />
                  {errors.delivery_note && <p className="text-[11px] text-[#E43D2B]">{errors.delivery_note.message}</p>}
                </div>
              </div>
            </div>

            {/* Quality Inspection Lines Card */}
            <div className="bg-white rounded-lg shadow-2xs border border-gray-100 overflow-hidden">
              <div className="p-5 border-b border-gray-100">
                <h2 className="text-base font-semibold text-[#32325D]">
                  4-Tier Quality Inspection Lines
                </h2>
              </div>
              <div className="overflow-x-auto">
                <Table className="min-w-[1100px] table-fixed">
                  <TableHeader className="bg-[#F6F7F8]">
                    <TableRow>
                      <TableHead className="w-64 border border-gray-200 px-4 py-3 text-left text-sm text-gray-600 font-medium">
                        Product
                      </TableHead>
                      <TableHead className="w-80 border border-gray-200 px-4 py-3 text-left text-sm text-gray-600 font-medium">
                        Description
                      </TableHead>
                      <TableHead className="w-32 border border-gray-200 px-4 py-3 text-center text-sm text-gray-600 font-medium">
                        Unit
                      </TableHead>
                      <TableHead className="w-32 border border-gray-200 px-4 py-3 text-center text-sm text-gray-600 font-medium">
                        Expected Qty
                      </TableHead>
                      <TableHead className="w-32 border border-gray-200 px-4 py-3 text-center text-sm text-gray-600 font-medium">
                        Received Qty
                      </TableHead>
                      <TableHead className="w-16 border border-gray-200 px-4 py-3 text-center text-sm text-gray-600 font-medium">
                        Action
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody className="bg-white">
                    {items.map((it) => (
                      <TableRow key={it.id} className="group hover:bg-[#FBFBFB] focus-within:bg-[#FBFBFB] transition-colors duration-150">
                        <TableCell className="border border-gray-200 align-middle p-0">
                          <Select value={it.product} onValueChange={(v) => updateItemProduct(it.id, v)}>
                            <SelectTrigger className="h-11 w-full rounded-none border-0 focus:ring-0 focus:ring-offset-0 px-4">
                              <SelectValue placeholder="Select product" />
                            </SelectTrigger>
                            <SelectContent>
                              {productOptions.map((o) => (
                                <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
                              ))}
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
                            {it.unit_symbol || "N/A"}
                          </div>
                        </TableCell>
                        <TableCell className="border border-gray-200 align-middle text-center p-0">
                          <Input
                            type="number"
                            value={it.expected_quantity}
                            onChange={(e) => updateItemQty(it.id, "expected_quantity", e.target.value)}
                            className="h-11 w-full text-center rounded-none border-0 focus:ring-0 focus:ring-offset-0"
                          />
                        </TableCell>
                        <TableCell className="border border-gray-200 align-middle text-center p-0">
                          <Input
                            type="number"
                            value={it.received_quantity}
                            onChange={(e) => updateItemQty(it.id, "received_quantity", e.target.value)}
                            className="h-11 w-full text-center rounded-none border-0 focus:ring-0 focus:ring-offset-0 bg-blue-50/30 text-[#3B7CED] font-medium"
                          />
                        </TableCell>
                        <TableCell className="border border-gray-200 px-4 align-middle text-center">
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() => removeRow(it.id)}
                            disabled={items.length === 1}
                            className="h-8 w-8 text-gray-400 hover:text-[#E43D2B] hover:bg-red-50 mx-auto"
                            title="Remove line"
                          >
                            <Trash className="w-4 h-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                  <TableFooter className="bg-white border-t border-gray-200">
                    <TableRow>
                      <TableCell colSpan={6} className="py-3 px-4 border-b border-gray-200">
                        <Button
                          type="button"
                          variant="ghost"
                          onClick={addRow}
                          className="text-[#3B7CED] hover:bg-blue-50 text-sm font-medium h-9 px-4"
                        >
                          <Plus className="w-4 h-4 mr-2" /> Add Product Line
                        </Button>
                      </TableCell>
                    </TableRow>
                  </TableFooter>
                </Table>
              </div>
            </div>
          </form>
        </main>

        {/* Sticky Action Bar */}
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 flex justify-end gap-3 shadow-lg z-30">
          <Link href="/inventory/operation">
            <Button variant="outline" type="button" className="border-gray-200 text-gray-600 hover:bg-gray-50 h-9 px-4 text-sm font-medium">
              Cancel
            </Button>
          </Link>
          <Button
            type="button"
            disabled={isSubmitting}
            onClick={handleSubmit(onValidateGRN)}
            className="bg-[#3B7CED] hover:bg-[#3065c3] text-white h-9 px-5 text-sm font-medium shadow-2xs transition-all"
          >
            {isSubmitting ? "Validating..." : "Validate"}
          </Button>
        </div>

        <DiscrepancyDialog
          isOpen={discrepancyState.isOpen}
          onClose={() => setDiscrepancyState({ isOpen: false, type: null, ipId: null })}
          type={discrepancyState.type || "backorder"}
          onConfirm={handleCreateBackorder}
          onDecline={handleCloseWithoutBackorder}
        />

        <ToastNotification
          message={notification.message}
          type={notification.type}
          show={notification.show}
          onClose={() => setNotification((p) => ({ ...p, show: false }))}
        />
      </div>
    </PageGuard>
  );
}
