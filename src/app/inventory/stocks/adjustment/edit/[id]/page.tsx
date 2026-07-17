"use client";

import React, { useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useForm, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ToastNotification } from "@/components/shared/ToastNotification";
import { PageGuard } from "@/components/auth/PageGuard";
import { Button } from "@/components/ui/button";
import { Plus, Trash, ArrowLeft, Save, CheckCircle } from "lucide-react";
import Link from "next/link";
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
import { z } from "zod";

type Option = { value: string; label: string };

interface StockAdjustmentLineItem {
  id: string;
  product: string;
  product_description: string;
  unit_of_measure: string;
  current_quantity: string;
  adjusted_quantity: string;
}

const stockAdjustmentSchema = z.object({
  warehouse_location: z.string().min(1, "Warehouse location is required"),
  notes: z.string().min(1, "Mandatory reason is required per PRD"),
});

type StockAdjustmentFormData = z.infer<typeof stockAdjustmentSchema>;

const DUMMY_LOCATIONS: Option[] = [
  { value: "WH-MAIN", label: "Main Warehouse - Site A (WH-MAIN)" },
  { value: "WH-SEC", label: "Secondary Store - Site B (WH-SEC)" },
];

const DUMMY_PRODUCTS = [
  { id: "1", product_name: "Cement (50kg Bag)", product_description: "Portland Cement Grade 42.5", unit_symbol: "Bags", current_stock: "500" },
  { id: "2", product_name: "Reinforcement Steel 16mm", product_description: "High Yield Deformed Steel Bars", unit_symbol: "Tonnes", current_stock: "150" },
  { id: "3", product_name: "Sharp Sand", product_description: "Clean river sharp sand for plastering", unit_symbol: "m³", current_stock: "45" },
  { id: "4", product_name: "Safety Helmets (Yellow)", product_description: "HDPE Hard Hats with adjustable strap", unit_symbol: "Pieces", current_stock: "120" },
];

export default function EditStockAdjustmentPage() {
  const params = useParams();
  const id = (params?.id as string) || "WH-MAIN-ADJ-0002";
  const router = useRouter();
  const formRef = useRef<HTMLFormElement>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [items, setItems] = useState<StockAdjustmentLineItem[]>([
    {
      id: "1",
      product: "2",
      product_description: "High Yield Deformed Steel Bars",
      unit_of_measure: "Tonnes",
      current_quantity: "150",
      adjusted_quantity: "162",
    },
  ]);

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
        product_description: "",
        unit_of_measure: "",
        current_quantity: "0",
        adjusted_quantity: "",
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
  } = useForm<StockAdjustmentFormData>({
    resolver: zodResolver(stockAdjustmentSchema) as Resolver<StockAdjustmentFormData>,
    defaultValues: {
      warehouse_location: "WH-MAIN",
      notes: "Quarterly spot check adjustment.",
    },
  });

  const productOptions: Option[] = DUMMY_PRODUCTS.map((p) => ({
    value: p.id,
    label: p.product_name,
  }));

  const updateItemWithProductDetails = (itemId: string, productId: string) => {
    const p = DUMMY_PRODUCTS.find((item) => item.id === productId);
    setItems((prev) =>
      prev.map((it) =>
        it.id === itemId
          ? {
              ...it,
              product: productId,
              product_description: p?.product_description || "",
              unit_of_measure: p?.unit_symbol || "",
              current_quantity: p?.current_stock || "0",
              adjusted_quantity: p?.current_stock || "0",
            }
          : it
      )
    );
  };

  const updateAdjustedQty = (itemId: string, val: string) => {
    setItems((prev) =>
      prev.map((it) =>
        it.id === itemId ? { ...it, adjusted_quantity: val } : it
      )
    );
  };

  function onSave(data: StockAdjustmentFormData) {
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setNotification({
        message: "Stock adjustment draft updated successfully!",
        type: "success",
        show: true,
      });

      setTimeout(() => {
        router.push(`/inventory/stocks/adjustment/${id}`);
      }, 1000);
    }, 400);
  }

  function onValidate(data: StockAdjustmentFormData) {
    const validItems = items.filter(
      (item) => item.product && item.adjusted_quantity !== ""
    );

    if (validItems.length === 0) {
      setNotification({
        message: "Please add at least one valid product line to adjust",
        type: "error",
        show: true,
      });
      return;
    }

    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setNotification({
        message: "Stock adjustment validated! Inventory ledger updated.",
        type: "success",
        show: true,
      });

      setTimeout(() => {
        router.push(`/inventory/stocks/adjustment/${id}`);
      }, 1000);
    }, 500);
  }

  function closeNotification() {
    setNotification((prev) => ({ ...prev, show: false }));
  }

  return (
    <PageGuard application="inventory" module="adjustment">
      <div className="flex flex-col flex-1 min-h-[calc(100vh-64px)] bg-[#F6F9FC] relative pb-24">
        {/* Clean Header Card */}
        <div className="flex items-center justify-between px-6 py-4 bg-white border-b border-gray-100 shadow-2xs">
          <div className="flex items-center gap-3">
            <Link href={`/inventory/stocks/adjustment/${id}`}>
              <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-400 hover:text-[#32325D]">
                <ArrowLeft className="h-4 w-4" />
              </Button>
            </Link>
            <div>
              <h1 className="text-lg font-semibold text-[#32325D]">Edit Stock Adjustment: {id}</h1>
            </div>
          </div>
        </div>

        {/* Main Form Container */}
        <main className="p-6 max-w-[1400px] mx-auto w-full flex flex-col gap-6">
          <form ref={formRef} className="flex flex-col gap-6">
            
            {/* Adjustment Details Card */}
            <div className="bg-white rounded-lg shadow-2xs border border-gray-100 overflow-hidden">
              <div className="p-5 border-b border-gray-100">
                <h2 className="text-base font-semibold text-[#32325D]">Adjustment Details & Reason</h2>
              </div>
              <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex flex-col gap-2.5">
                  <Label className="text-sm font-semibold text-[#32325D]">
                    Warehouse / Store Location <span className="text-[#E43D2B]">*</span>
                  </Label>
                  <Select
                    value={watch("warehouse_location")}
                    onValueChange={(val) => setValue("warehouse_location", val, { shouldValidate: true })}
                  >
                    <SelectTrigger className="bg-white border-gray-200 rounded-md h-9 text-sm text-[#32325D] focus:ring-[#3B7CED]">
                      <SelectValue placeholder="Select location" />
                    </SelectTrigger>
                    <SelectContent>
                      {DUMMY_LOCATIONS.map((option) => (
                        <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.warehouse_location && (
                    <p className="text-xs text-red-500 mt-1">{errors.warehouse_location.message}</p>
                  )}
                </div>

                <div className="flex flex-col gap-2.5">
                  <Label className="text-sm font-semibold text-[#32325D]">
                    Reason / Notes <span className="text-[#E43D2B]">*</span>
                  </Label>
                  <Input
                    {...register("notes")}
                    placeholder="Mandatory reason for physical vs system discrepancy..."
                    className="bg-white border-gray-200 rounded-md h-9 text-sm text-[#32325D] focus:ring-[#3B7CED]"
                  />
                  {errors.notes && (
                    <p className="text-xs text-red-500 mt-1">{errors.notes.message}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Product Lines Card */}
            <div className="bg-white rounded-lg shadow-2xs border border-gray-100 overflow-hidden">
              <div className="p-5 border-b border-gray-100">
                <h2 className="text-base font-semibold text-[#32325D]">Count & Variance Table</h2>
              </div>
              <div className="overflow-x-auto w-full">
                <Table className="min-w-[900px] w-full">
                  <TableHeader>
                    <TableRow className="bg-[#F6F9FC] hover:bg-[#F6F9FC] border-b border-gray-100">
                      <TableHead className="py-3.5 px-6 font-semibold text-[#8898AA] text-[11.5px] whitespace-nowrap">
                        Product
                      </TableHead>
                      <TableHead className="py-3.5 px-6 font-semibold text-[#8898AA] text-[11.5px] whitespace-nowrap">
                        Description
                      </TableHead>
                      <TableHead className="py-3.5 px-6 font-semibold text-[#8898AA] text-[11.5px] whitespace-nowrap text-center">
                        Unit
                      </TableHead>
                      <TableHead className="py-3.5 px-6 font-semibold text-[#8898AA] text-[11.5px] whitespace-nowrap text-right">
                        Current System QTY
                      </TableHead>
                      <TableHead className="py-3.5 px-6 font-semibold text-[#8898AA] text-[11.5px] whitespace-nowrap text-center">
                        New Physical Count
                      </TableHead>
                      <TableHead className="py-3.5 px-6 font-semibold text-[#8898AA] text-[11.5px] whitespace-nowrap text-right">
                        Variance
                      </TableHead>
                      <TableHead className="py-3.5 pr-6 font-semibold text-[#8898AA] text-[11.5px] whitespace-nowrap text-center">
                        Action
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {items.map((it) => {
                      const current = Number(it.current_quantity) || 0;
                      const adjusted = Number(it.adjusted_quantity) || 0;
                      const variance = adjusted - current;
                      return (
                        <TableRow key={it.id} className="group hover:bg-gray-50 border-b border-gray-100 transition-colors">
                          <TableCell className="px-6 py-3.5 align-middle whitespace-nowrap">
                            <Select
                              value={it.product}
                              onValueChange={(value) => updateItemWithProductDetails(it.id, value)}
                            >
                              <SelectTrigger className="bg-white border-gray-200 rounded-md h-9 text-sm text-[#32325D] focus:ring-[#3B7CED] min-w-[200px]">
                                <SelectValue placeholder="Select product" />
                              </SelectTrigger>
                              <SelectContent>
                                {productOptions.map((option) => (
                                  <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </TableCell>

                          <TableCell className="px-6 py-3.5 align-middle whitespace-nowrap">
                            <span className="text-sm text-[#525F7F]">
                              {it.product_description || "Select a product"}
                            </span>
                          </TableCell>

                          <TableCell className="px-6 py-3.5 align-middle text-center whitespace-nowrap">
                            <span className="text-sm font-semibold text-[#525F7F]">
                              {it.unit_of_measure || "N/A"}
                            </span>
                          </TableCell>

                          <TableCell className="px-6 py-3.5 align-middle text-right font-mono font-semibold text-sm text-[#32325D] whitespace-nowrap">
                            {it.current_quantity}
                          </TableCell>

                          <TableCell className="px-6 py-3.5 align-middle text-center whitespace-nowrap">
                            <Input
                              type="number"
                              step="0.01"
                              value={it.adjusted_quantity}
                              onChange={(e) => updateAdjustedQty(it.id, e.target.value)}
                              placeholder="0"
                              className="bg-white border-gray-200 rounded-md h-9 font-mono font-bold text-sm text-[#3B7CED] text-center w-28 mx-auto"
                            />
                          </TableCell>

                          <TableCell className="px-6 py-3.5 align-middle text-right font-mono font-bold text-sm whitespace-nowrap">
                            <span className={variance < 0 ? "text-[#E43D2B]" : variance > 0 ? "text-[#2BA24D]" : "text-[#525F7F]"}>
                              {it.product ? (variance > 0 ? `+${variance.toFixed(2)}` : variance.toFixed(2)) : "—"}
                            </span>
                          </TableCell>

                          <TableCell className="pr-6 py-3.5 align-middle text-center whitespace-nowrap">
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
                      );
                    })}
                  </TableBody>
                  <TableFooter className="bg-gray-50/60 border-t border-gray-100">
                    <TableRow>
                      <TableCell colSpan={7} className="py-3 px-6">
                        <Button
                          type="button"
                          variant="ghost"
                          onClick={addRow}
                          className="text-[#3B7CED] hover:bg-blue-50/50 text-sm font-semibold h-9 px-4 flex items-center gap-1.5"
                        >
                          <Plus className="w-4 h-4" /> Add Product Line
                        </Button>
                      </TableCell>
                    </TableRow>
                  </TableFooter>
                </Table>
              </div>
            </div>
          </form>
        </main>

        {/* Fixed Signature Sticky Footer Bar */}
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 flex justify-end gap-3 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] z-30">
          <Link href={`/inventory/stocks/adjustment/${id}`}>
            <Button
              variant="outline"
              type="button"
              className="border-gray-300 text-gray-700 hover:bg-gray-50 h-9 px-4 text-sm font-medium"
            >
              Cancel
            </Button>
          </Link>
          <Button
            type="button"
            disabled={isSubmitting}
            onClick={handleSubmit(onSave)}
            variant="outline"
            className="border-[#3B7CED] text-[#3B7CED] hover:bg-blue-50/50 h-9 px-4 text-sm font-semibold flex items-center gap-1.5"
          >
            <Save className="w-4 h-4" />
            {isSubmitting ? "Saving..." : "Save Draft"}
          </Button>
          <Button
            type="button"
            disabled={isSubmitting}
            onClick={handleSubmit(onValidate)}
            className="bg-[#3B7CED] hover:bg-[#3065c3] text-white h-9 px-4 text-sm font-semibold shadow-2xs flex items-center gap-1.5"
          >
            <CheckCircle className="w-4 h-4" />
            {isSubmitting ? "Validating..." : "Validate & Update Stock"}
          </Button>
        </div>

        <ToastNotification
          message={notification.message}
          type={notification.type}
          show={notification.show}
          onClose={closeNotification}
        />
      </div>
    </PageGuard>
  );
}
