"use client";

import React, { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useForm, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { ArrowLeft, Plus, Trash } from "lucide-react";

import { ToastNotification } from "@/components/shared/ToastNotification";
import { DiscrepancyDialog, type DiscrepancyType } from "@/components/shared/DiscrepancyDialog";
import { PageGuard } from "@/components/auth/PageGuard";

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

    // Check reject reasons
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

  return (
    <PageGuard application="inventory" module="incomingproduct">
      <div className="flex flex-col flex-1 min-h-[calc(100vh-64px)] bg-white relative pb-20">
        <div className="flex items-center px-6 py-4 border-b border-gray-100">
          <Link href="/inventory/operation">
            <Button variant="ghost" size="icon" className="mr-2">
              <ArrowLeft className="h-5 w-5 text-gray-500" />
            </Button>
          </Link>
          <div>
            <h1 className="text-lg font-medium text-gray-800">Record Direct Goods Receipt Note (GRN)</h1>
            <p className="text-xs text-gray-500 mt-0.5">Formalize site delivery inspections and post stock directly into warehouse inventory.</p>
          </div>
        </div>

        <div className="p-6 max-w-[1400px] mx-auto w-full flex flex-col gap-10">
          <form className="flex flex-col gap-10">
            <section>
              <h2 className="text-[#3B7CED] text-xl mb-6 font-medium">Delivery & Supplier Information</h2>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="flex flex-col gap-2">
                  <Label className="text-gray-700 font-medium">Receipt Type <span className="text-red-500">*</span></Label>
                  <Select value={watch("receipt_type")} onValueChange={(v: any) => setValue("receipt_type", v)}>
                    <SelectTrigger className="bg-white border-gray-300 rounded">
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="vendor_receipt">Vendor Receipt</SelectItem>
                      <SelectItem value="returns">Customer Return</SelectItem>
                      <SelectItem value="scrap">Scrap Recovery</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex flex-col gap-2">
                  <Label className="text-gray-700 font-medium">Supplier / Vendor <span className="text-red-500">*</span></Label>
                  <Select value={watch("supplier")} onValueChange={(v) => setValue("supplier", v)}>
                    <SelectTrigger className="bg-white border-gray-300 rounded">
                      <SelectValue placeholder="Select supplier" />
                    </SelectTrigger>
                    <SelectContent>
                      {DUMMY_SUPPLIERS.map((o) => (
                        <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.supplier && <p className="text-xs text-red-500">{errors.supplier.message}</p>}
                </div>

                <div className="flex flex-col gap-2">
                  <Label className="text-gray-700 font-medium">Destination Store <span className="text-red-500">*</span></Label>
                  <Select value={watch("destination_location")} onValueChange={(v) => setValue("destination_location", v)}>
                    <SelectTrigger className="bg-white border-gray-300 rounded">
                      <SelectValue placeholder="Select warehouse" />
                    </SelectTrigger>
                    <SelectContent>
                      {DUMMY_LOCATIONS.map((o) => (
                        <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.destination_location && <p className="text-xs text-red-500">{errors.destination_location.message}</p>}
                </div>

                <div className="flex flex-col gap-2">
                  <Label className="text-gray-700 font-medium">Delivery Note / Waybill <span className="text-red-500">*</span></Label>
                  <Input {...register("delivery_note")} placeholder="e.g. DN-90124" className="bg-white border-gray-300 rounded" />
                  {errors.delivery_note && <p className="text-xs text-red-500">{errors.delivery_note.message}</p>}
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-[#3B7CED] text-xl mb-6 font-medium">4-Tier Quality Inspection Lines</h2>
              <div className="bg-white rounded border border-gray-200 shadow-sm overflow-hidden">
                <div className="overflow-x-auto w-full">
                  <Table className="min-w-[950px] w-full">
                    <TableHeader>
                      <TableRow className="bg-[#F8F9FA] border-b-gray-100">
                        <TableHead className="w-56 pl-4">Product</TableHead>
                        <TableHead className="w-48">Description</TableHead>
                        <TableHead className="w-20 text-center">Unit</TableHead>
                        <TableHead className="w-24 text-center">Expected QTY</TableHead>
                        <TableHead className="w-28 text-center">Received QTY</TableHead>
                        <TableHead className="w-28 text-center">Accepted QTY</TableHead>
                        <TableHead className="w-28 text-center">Rejected QTY</TableHead>
                        <TableHead className="w-44 pr-2">Reject Reason</TableHead>
                        <TableHead className="w-12 text-center pr-4"></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {items.map((it) => (
                        <TableRow key={it.id} className="border-b-gray-100 hover:bg-gray-50 transition-colors">
                          <TableCell className="pl-4 py-2 align-middle">
                            <Select value={it.product} onValueChange={(v) => updateItemProduct(it.id, v)}>
                              <SelectTrigger className="bg-white border-gray-300 rounded h-9 text-xs">
                                <SelectValue placeholder="Select product" />
                              </SelectTrigger>
                              <SelectContent>
                                {productOptions.map((o) => (
                                  <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </TableCell>
                          <TableCell className="py-2 text-xs text-gray-600 line-clamp-1">{it.product_description || "—"}</TableCell>
                          <TableCell className="py-2 text-center text-xs font-medium">{it.unit_symbol || "—"}</TableCell>
                          <TableCell className="py-2 text-center">
                            <Input
                              type="number"
                              value={it.expected_quantity}
                              onChange={(e) => updateItemQty(it.id, "expected_quantity", e.target.value)}
                              className="w-20 mx-auto text-center h-8 text-xs font-semibold text-gray-700"
                            />
                          </TableCell>
                          <TableCell className="py-2 text-center">
                            <Input
                              type="number"
                              value={it.received_quantity}
                              onChange={(e) => updateItemQty(it.id, "received_quantity", e.target.value)}
                              className="w-20 mx-auto text-center h-8 text-xs font-bold"
                            />
                          </TableCell>
                          <TableCell className="py-2 text-center">
                            <Input
                              type="number"
                              value={it.accepted_quantity}
                              onChange={(e) => updateItemQty(it.id, "accepted_quantity", e.target.value)}
                              className="w-20 mx-auto text-center h-8 text-xs font-bold text-green-600"
                            />
                          </TableCell>
                          <TableCell className="py-2 text-center font-bold text-red-600">
                            {it.rejected_quantity}
                          </TableCell>
                          <TableCell className="py-2 pr-2">
                            <Input
                              value={it.reject_reason}
                              onChange={(e) => updateReason(it.id, e.target.value)}
                              placeholder={Number(it.rejected_quantity) > 0 ? "Reason required..." : "None"}
                              disabled={Number(it.rejected_quantity) <= 0}
                              className={`h-8 text-xs ${Number(it.rejected_quantity) > 0 && !it.reject_reason ? "border-red-400 bg-red-50/30" : ""}`}
                            />
                          </TableCell>
                          <TableCell className="py-2 text-center pr-4">
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              onClick={() => removeRow(it.id)}
                              disabled={items.length === 1}
                              className="h-8 w-8 text-red-500 hover:bg-red-50"
                              title="Remove line"
                            >
                              <Trash className="w-4 h-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                    <TableFooter className="bg-[#F8F9FA] border-t border-gray-200">
                      <TableRow>
                        <TableCell colSpan={9} className="py-2 pl-4">
                          <Button
                            type="button"
                            variant="ghost"
                            onClick={addRow}
                            className="text-[#3B7CED] hover:bg-blue-50 text-xs font-medium h-8 px-3"
                          >
                            <Plus className="w-3.5 h-3.5 mr-1.5" /> Add Product Line
                          </Button>
                        </TableCell>
                      </TableRow>
                    </TableFooter>
                  </Table>
                </div>
              </div>
            </section>
          </form>
        </div>

        {/* Sticky Footer Bar */}
        <div className="absolute bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 flex justify-end gap-4 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] z-10">
          <Link href="/inventory/operation">
            <Button variant="outline" type="button" className="border-blue-400 text-blue-500 hover:bg-blue-50">
              Cancel
            </Button>
          </Link>
          <Button
            type="button"
            disabled={isSubmitting}
            onClick={handleSubmit(onSaveDraft)}
            variant="outline"
            className="border-blue-400 text-blue-500 hover:bg-blue-50"
          >
            {isSubmitting ? "Saving..." : "Save Draft"}
          </Button>
          <Button
            type="button"
            disabled={isSubmitting}
            onClick={handleSubmit(onValidateGRN)}
            className="bg-[#3B7CED] hover:bg-[#3065c3] text-white"
          >
            {isSubmitting ? "Validating..." : "Validate GRN & Post Stock"}
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
