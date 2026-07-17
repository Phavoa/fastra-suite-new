"use client";

import React, { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ToastNotification } from "@/components/shared/ToastNotification";
import { PageGuard } from "@/components/auth/PageGuard";
import { Button } from "@/components/ui/button";
import { Plus, Trash, ArrowLeft } from "lucide-react";
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

export default function CreateStockAdjustmentPage() {
  const router = useRouter();
  const formRef = useRef<HTMLFormElement>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [items, setItems] = useState<StockAdjustmentLineItem[]>([
    {
      id: "1",
      product: "",
      product_description: "",
      unit_of_measure: "",
      current_quantity: "0",
      adjusted_quantity: "",
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

  const removeRow = (id: string) => {
    if (items.length > 1) {
      setItems((prev) => prev.filter((it) => it.id !== id));
    }
  };

  const updateItemWithProductDetails = (id: string, productId: string) => {
    const foundProduct = DUMMY_PRODUCTS.find((p) => p.id === productId);
    setItems((prev) =>
      prev.map((it) => {
        if (it.id === id) {
          return {
            ...it,
            product: productId,
            product_description: foundProduct ? foundProduct.product_description : "",
            unit_of_measure: foundProduct ? foundProduct.unit_symbol : "",
            current_quantity: foundProduct ? foundProduct.current_stock : "0",
          };
        }
        return it;
      })
    );
  };

  const updateAdjustedQty = (id: string, qty: string) => {
    setItems((prev) =>
      prev.map((it) => (it.id === id ? { ...it, adjusted_quantity: qty } : it))
    );
  };

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<StockAdjustmentFormData>({
    resolver: zodResolver(stockAdjustmentSchema),
    defaultValues: {
      warehouse_location: "WH-MAIN",
      notes: "",
    },
  });

  const productOptions: Option[] = DUMMY_PRODUCTS.map((p) => ({
    value: p.id,
    label: `${p.product_name} (${p.unit_symbol})`,
  }));

  function onSave(data: StockAdjustmentFormData) {
    setIsSubmitting(true);
    setNotification({
      message: "Stock adjustment saved as draft successfully.",
      type: "success",
      show: true,
    });
    setTimeout(() => {
      setIsSubmitting(false);
      router.push("/inventory/stocks/adjustment");
    }, 1200);
  }

  function onValidate(data: StockAdjustmentFormData) {
    for (const it of items) {
      if (!it.product || it.adjusted_quantity === "") {
        setNotification({
          message: "Please select a product and provide a new physical count for all lines.",
          type: "error",
          show: true,
        });
        return;
      }
    }

    setIsSubmitting(true);
    setNotification({
      message: "Stock adjustment validated & inventory ledger updated.",
      type: "success",
      show: true,
    });
    setTimeout(() => {
      setIsSubmitting(false);
      router.push("/inventory/stocks/adjustment");
    }, 1200);
  }

  function closeNotification() {
    setNotification((prev) => ({ ...prev, show: false }));
  }

  return (
    <PageGuard application="inventory" module="adjustment">
      {/* Two-tone: gray canvas */}
      <div className="flex flex-col flex-1 min-h-[calc(100vh-64px)] bg-[#F6F9FC] relative pb-24">
        {/* Clean Header */}
        <div className="flex items-center px-6 py-4 bg-white border-b border-gray-100 shadow-2xs">
          <Link href="/inventory/stocks/adjustment">
            <Button variant="ghost" size="icon" className="mr-2 h-8 w-8 text-gray-400 hover:text-[#32325D]">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <h1 className="text-lg font-semibold text-[#32325D]">New Stock Adjustment</h1>
        </div>

        {/* Main Form Container */}
        <main className="p-6 max-w-[1400px] mx-auto w-full flex flex-col gap-6">
          <form ref={formRef} className="flex flex-col gap-6">
            
            {/* White Container Card 1: Adjustment Details */}
            <div className="bg-white rounded-lg shadow-2xs border border-gray-100 overflow-hidden">
              <div className="p-5 border-b border-gray-100">
                <h2 className="text-base font-semibold text-[#32325D]">Adjustment Details</h2>
              </div>
              <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
                
                {/* Adjustment Type (Fixed per PRD) */}
                <div className="flex flex-col gap-2">
                  <Label className="text-xs font-semibold text-[#525F7F]">Adjustment Type</Label>
                  <Input
                    value="Stock Level Update"
                    readOnly
                    className="bg-gray-50 border-gray-200 h-9 text-sm text-[#525F7F] cursor-not-allowed rounded-md font-medium"
                  />
                  <p className="text-[11px] text-[#8898AA]">Fixed to Stock Level Update per PRD Core Tier.</p>
                </div>

                {/* Warehouse Location */}
                <div className="flex flex-col gap-2">
                  <Label className="text-xs font-semibold text-[#525F7F]">
                    Warehouse Location <span className="text-[#E43D2B]">*</span>
                  </Label>
                  <Select
                    value={watch("warehouse_location")}
                    onValueChange={(value) => setValue("warehouse_location", value)}
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
                    <p className="text-[11px] text-[#E43D2B]">{errors.warehouse_location.message}</p>
                  )}
                </div>

                {/* Notes (Mandatory Reason per PRD) */}
                <div className="flex flex-col gap-2">
                  <Label className="text-xs font-semibold text-[#525F7F]">
                    Reason / Notes <span className="text-[#E43D2B]">*</span>
                  </Label>
                  <Input
                    {...register("notes")}
                    placeholder="Mandatory reason for discrepancy (e.g. Annual stock audit count)..."
                    className="bg-white border-gray-200 rounded-md h-9 text-sm text-[#32325D] focus:ring-[#3B7CED]"
                  />
                  {errors.notes && (
                    <p className="text-[11px] text-[#E43D2B]">{errors.notes.message}</p>
                  )}
                </div>

              </div>
            </div>

            {/* White Container Card 2: Product Lines */}
            <div className="bg-white rounded-lg shadow-2xs border border-gray-100 overflow-hidden">
              <div className="p-5 border-b border-gray-100">
                <h2 className="text-base font-semibold text-[#32325D]">Product Lines</h2>
              </div>
              <div className="overflow-x-auto w-full">
                <Table className="min-w-[900px] w-full">
                  <TableHeader>
                    <TableRow className="bg-[#F6F9FC] hover:bg-[#F6F9FC] border-b border-gray-100">
                      <TableHead className="py-3.5 px-6 font-semibold text-[#8898AA] text-[11.5px] whitespace-nowrap w-64">Product</TableHead>
                      <TableHead className="py-3.5 px-6 font-semibold text-[#8898AA] text-[11.5px] whitespace-nowrap w-64">Description</TableHead>
                      <TableHead className="py-3.5 px-6 font-semibold text-[#8898AA] text-[11.5px] whitespace-nowrap text-center w-24">Unit</TableHead>
                      <TableHead className="py-3.5 px-6 font-semibold text-[#8898AA] text-[11.5px] whitespace-nowrap text-center w-36">Current System Qty</TableHead>
                      <TableHead className="py-3.5 px-6 font-semibold text-[#8898AA] text-[11.5px] whitespace-nowrap text-center w-36">New Physical Count</TableHead>
                      <TableHead className="py-3.5 px-6 font-semibold text-[#8898AA] text-[11.5px] whitespace-nowrap text-center w-32">Variance</TableHead>
                      <TableHead className="py-3.5 pr-6 font-semibold text-[#8898AA] text-[11.5px] whitespace-nowrap text-center w-16"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {items.map((it) => {
                      const current = Number(it.current_quantity) || 0;
                      const adjusted = Number(it.adjusted_quantity) || 0;
                      const variance = adjusted - current;
                      return (
                        <TableRow key={it.id} className="hover:bg-gray-50 border-b border-gray-100 transition-colors">
                          <TableCell className="px-6 py-3.5">
                            <Select
                              value={it.product}
                              onValueChange={(value) => updateItemWithProductDetails(it.id, value)}
                            >
                              <SelectTrigger className="bg-white border-gray-200 rounded-md h-9 text-sm font-semibold text-[#32325D]">
                                <SelectValue placeholder="Select product" />
                              </SelectTrigger>
                              <SelectContent>
                                {productOptions.map((option) => (
                                  <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </TableCell>

                          <TableCell className="px-6 py-3.5 text-sm text-[#525F7F]">
                            {it.product_description || "Select a product"}
                          </TableCell>

                          <TableCell className="px-6 py-3.5 text-center text-sm font-medium text-[#525F7F]">
                            {it.unit_of_measure || "—"}
                          </TableCell>

                          <TableCell className="px-6 py-3.5 text-center text-sm font-mono font-semibold text-[#32325D]">
                            {it.current_quantity}
                          </TableCell>

                          <TableCell className="px-6 py-3.5 text-center">
                            <Input
                              type="number"
                              step="0.01"
                              value={it.adjusted_quantity}
                              onChange={(e) => updateAdjustedQty(it.id, e.target.value)}
                              placeholder="0"
                              className="bg-white border-gray-200 rounded-md h-8 text-sm text-center font-bold text-[#3B7CED] w-24 mx-auto"
                            />
                          </TableCell>

                          <TableCell className="px-6 py-3.5 text-center">
                            <span className={`text-sm font-mono font-bold ${variance < 0 ? "text-[#E43D2B]" : variance > 0 ? "text-[#2BA24D]" : "text-[#525F7F]"}`}>
                              {it.adjusted_quantity !== "" ? (variance > 0 ? `+${variance.toFixed(2)}` : variance.toFixed(2)) : "—"}
                            </span>
                          </TableCell>

                          <TableCell className="pr-6 py-3.5 text-center">
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              onClick={() => removeRow(it.id)}
                              disabled={items.length === 1}
                              className="h-8 w-8 text-gray-400 hover:text-[#E43D2B] hover:bg-red-50"
                              title="Remove line"
                            >
                              <Trash className="w-4 h-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                  <TableFooter className="bg-[#F6F9FC] border-t border-gray-100">
                    <TableRow>
                      <TableCell colSpan={7} className="py-3.5 px-6">
                        <Button
                          type="button"
                          variant="ghost"
                          onClick={addRow}
                          className="text-[#3B7CED] hover:bg-blue-50 text-sm font-semibold h-8 px-3"
                        >
                          <Plus className="w-4 h-4 mr-1.5" /> Add Product Line
                        </Button>
                      </TableCell>
                    </TableRow>
                  </TableFooter>
                </Table>
              </div>
            </div>
          </form>
        </main>

        {/* Signature Sticky Footer Bar */}
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 flex justify-end gap-3 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] z-30">
          <Link href="/inventory/stocks/adjustment">
            <Button variant="outline" type="button" className="border-gray-300 text-gray-700 hover:bg-gray-50 text-sm h-9 px-4">
              Cancel
            </Button>
          </Link>
          <Button
            type="button"
            disabled={isSubmitting}
            onClick={handleSubmit(onSave)}
            variant="outline"
            className="border-gray-300 text-gray-700 hover:bg-gray-50 text-sm h-9 px-4"
          >
            {isSubmitting ? "Saving..." : "Save Draft"}
          </Button>
          <Button
            type="button"
            disabled={isSubmitting}
            onClick={handleSubmit(onValidate)}
            className="bg-[#3B7CED] hover:bg-[#3065c3] text-white text-sm h-9 px-4 font-semibold shadow-2xs"
          >
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
