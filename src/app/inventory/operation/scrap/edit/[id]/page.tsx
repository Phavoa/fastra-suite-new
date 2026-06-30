"use client";

import React, { useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useForm, type Resolver } from "react-hook-form";
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

interface ScrapLineItem {
  id: string;
  product: string;
  product_description: string;
  unit_of_measure: string;
  current_quantity: string;
  scrap_quantity: string;
}

const scrapSchema = z.object({
  warehouse_location: z.string().min(1, "Warehouse location is required"),
  cause: z.string().min(1, "Cause of loss/damage is required per PRD"),
  notes: z.string().optional(),
});

type ScrapFormData = z.infer<typeof scrapSchema>;

const DUMMY_LOCATIONS: Option[] = [
  { value: "WH-MAIN", label: "Main Warehouse - Site A (WH-MAIN)" },
  { value: "WH-SEC", label: "Secondary Store - Site B (WH-SEC)" },
];

const CAUSE_OPTIONS: Option[] = [
  { value: "Damage / Spoilage", label: "Damage / Spoilage" },
  { value: "Theft / Unexplained Loss", label: "Theft / Unexplained Loss" },
  { value: "Obsolete / Expired", label: "Obsolete / Expired" },
];

const DUMMY_PRODUCTS = [
  { id: "1", product_name: "Cement (50kg Bag)", product_description: "Portland Cement Grade 42.5", unit_symbol: "Bags", current_stock: "500" },
  { id: "2", product_name: "Reinforcement Steel 16mm", product_description: "High Yield Deformed Steel Bars", unit_symbol: "Tonnes", current_stock: "150" },
  { id: "3", product_name: "Sharp Sand", product_description: "Clean river sharp sand for plastering", unit_symbol: "m³", current_stock: "45" },
  { id: "4", product_name: "Safety Helmets (Yellow)", product_description: "HDPE Hard Hats with adjustable strap", unit_symbol: "Pieces", current_stock: "120" },
];

export default function EditScrapPage() {
  const params = useParams();
  const id = (params?.id as string) || "WH-MAIN-SCRAP-0002";
  const router = useRouter();
  const formRef = useRef<HTMLFormElement>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [items, setItems] = useState<ScrapLineItem[]>([
    {
      id: "1",
      product: "2",
      product_description: "High Yield Deformed Steel Bars",
      unit_of_measure: "Tonnes",
      current_quantity: "150",
      scrap_quantity: "2",
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
        scrap_quantity: "",
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
  } = useForm<ScrapFormData>({
    resolver: zodResolver(scrapSchema) as Resolver<ScrapFormData>,
    defaultValues: {
      warehouse_location: "WH-MAIN",
      cause: "Theft / Unexplained Loss",
      notes: "Discovered missing during morning inventory reconciliation.",
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
              scrap_quantity: "",
            }
          : it
      )
    );
  };

  const updateScrapQty = (itemId: string, qty: string) => {
    setItems((prev) =>
      prev.map((it) => (it.id === itemId ? { ...it, scrap_quantity: qty } : it))
    );
  };

  async function onSave(data: ScrapFormData): Promise<void> {
    const validItems = items.filter(
      (item) => item.product && item.scrap_quantity !== ""
    );

    if (validItems.length === 0) {
      setNotification({
        message: "Please add at least one valid product line to scrap",
        type: "error",
        show: true,
      });
      return;
    }

    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setNotification({
        message: "Scrap record draft updated!",
        type: "success",
        show: true,
      });

      setTimeout(() => {
        router.push(`/inventory/operation/scrap/${id}`);
      }, 1000);
    }, 500);
  }

  async function onValidate(data: ScrapFormData): Promise<void> {
    const validItems = items.filter(
      (item) => item.product && item.scrap_quantity !== ""
    );

    if (validItems.length === 0) {
      setNotification({
        message: "Please add at least one valid product line to scrap",
        type: "error",
        show: true,
      });
      return;
    }

    for (const item of validItems) {
      if (Number(item.scrap_quantity) > Number(item.current_quantity)) {
        setNotification({
          message: `Cannot scrap more than available stock (${item.current_quantity}) for selected product.`,
          type: "error",
          show: true,
        });
        return;
      }
    }

    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setNotification({
        message: "Scrap record validated! Stock deducted and recorded in Ledger.",
        type: "success",
        show: true,
      });

      setTimeout(() => {
        router.push(`/inventory/operation/scrap/${id}`);
      }, 1000);
    }, 500);
  }

  function closeNotification() {
    setNotification((prev) => ({ ...prev, show: false }));
  }

  return (
    <PageGuard application="inventory" module="scrap">
      <div className="flex flex-col flex-1 min-h-[calc(100vh-64px)] bg-white relative pb-20">
        {/* Clean Header */}
        <div className="flex items-center px-6 py-4 border-b border-gray-100">
          <Link href={`/inventory/operation/scrap/${id}`}>
            <Button variant="ghost" size="icon" className="mr-2">
              <ArrowLeft className="h-5 w-5 text-gray-500" />
            </Button>
          </Link>
          <h1 className="text-lg font-medium text-gray-800">Edit Scrap Record Draft: {id}</h1>
        </div>

        {/* Main Form Container */}
        <div className="p-6 max-w-[1400px] mx-auto w-full flex flex-col gap-10">
          <form ref={formRef} className="flex flex-col gap-10">
            <section>
              <h2 className="text-[#3B7CED] text-xl mb-6 font-medium">Scrap Details</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                
                {/* Warehouse Location */}
                <div className="flex flex-col gap-2">
                  <Label className="text-gray-700 font-medium">
                    Warehouse Location <span className="text-red-500">*</span>
                  </Label>
                  <Select
                    value={watch("warehouse_location")}
                    onValueChange={(value) => setValue("warehouse_location", value)}
                  >
                    <SelectTrigger className="bg-white border-gray-300 rounded">
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

                {/* Cause of Loss (Mandatory per PRD) */}
                <div className="flex flex-col gap-2">
                  <Label className="text-gray-700 font-medium">
                    Cause of Loss / Damage <span className="text-red-500">*</span>
                  </Label>
                  <Select
                    value={watch("cause")}
                    onValueChange={(value) => setValue("cause", value)}
                  >
                    <SelectTrigger className="bg-white border-gray-300 rounded">
                      <SelectValue placeholder="Select cause" />
                    </SelectTrigger>
                    <SelectContent>
                      {CAUSE_OPTIONS.map((option) => (
                        <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.cause && (
                    <p className="text-xs text-red-500 mt-1">{errors.cause.message}</p>
                  )}
                </div>

                {/* Notes */}
                <div className="flex flex-col gap-2">
                  <Label className="text-gray-700 font-medium">
                    Explanation / Notes
                  </Label>
                  <Input
                    {...register("notes")}
                    placeholder="Provide additional context..."
                    className="bg-white border-gray-300 rounded"
                  />
                </div>

              </div>
            </section>

            <section>
              <h2 className="text-[#3B7CED] text-xl mb-6 font-medium">Product Lines</h2>
              <div className="bg-white rounded border border-gray-200 shadow-sm overflow-hidden">
                <div className="overflow-x-auto w-full">
                  <Table className="min-w-[800px] w-full">
                    <TableHeader>
                      <TableRow className="bg-[#F8F9FA] hover:bg-[#F8F9FA] border-b-gray-100">
                        <TableHead className="w-64 font-medium text-gray-500 pl-4">Product</TableHead>
                        <TableHead className="w-64 font-medium text-gray-500">Description</TableHead>
                        <TableHead className="w-24 font-medium text-gray-500 text-center">Unit</TableHead>
                        <TableHead className="w-32 font-medium text-gray-500 text-center">Available Stock</TableHead>
                        <TableHead className="w-32 font-medium text-gray-500 text-center">Scrap QTY</TableHead>
                        <TableHead className="w-16 font-medium text-gray-500 text-center pr-4">Action</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {items.map((it) => (
                        <TableRow key={it.id} className="group hover:bg-gray-50 border-b-gray-100 transition-colors">
                          <TableCell className="pl-4 py-2 align-middle">
                            <Select
                              value={it.product}
                              onValueChange={(value) => updateItemWithProductDetails(it.id, value)}
                            >
                              <SelectTrigger className="bg-white border-gray-300 rounded h-9 text-xs">
                                <SelectValue placeholder="Select product" />
                              </SelectTrigger>
                              <SelectContent>
                                {productOptions.map((option) => (
                                  <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </TableCell>

                          <TableCell className="py-2 align-middle">
                            <span className="text-xs text-gray-600 line-clamp-1">
                              {it.product_description || "Select a product"}
                            </span>
                          </TableCell>

                          <TableCell className="py-2 align-middle text-center">
                            <span className="text-xs text-gray-700 font-medium">
                              {it.unit_of_measure || "N/A"}
                            </span>
                          </TableCell>

                          <TableCell className="py-2 align-middle text-center">
                            <span className="text-xs text-gray-700 font-medium">
                              {it.current_quantity}
                            </span>
                          </TableCell>

                          <TableCell className="py-2 align-middle text-center">
                            <Input
                              type="number"
                              step="0.01"
                              value={it.scrap_quantity}
                              onChange={(e) => updateScrapQty(it.id, e.target.value)}
                              placeholder="0"
                              className="bg-white border-gray-300 rounded h-9 text-xs text-center w-24 mx-auto text-red-600 font-bold"
                            />
                          </TableCell>

                          <TableCell className="py-2 align-middle text-center pr-4">
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
                        <TableCell colSpan={6} className="py-2 pl-4">
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

        {/* Signature Sticky Footer Bar */}
        <div className="absolute bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 flex justify-end gap-4 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] z-10">
          <Link href={`/inventory/operation/scrap/${id}`}>
            <Button variant="outline" type="button" className="border-blue-400 text-blue-500 hover:bg-blue-50">
              Cancel
            </Button>
          </Link>
          <Button
            type="button"
            disabled={isSubmitting}
            onClick={handleSubmit(onSave)}
            variant="outline"
            className="border-blue-400 text-blue-500 hover:bg-blue-50"
          >
            {isSubmitting ? "Saving..." : "Save Draft"}
          </Button>
          <Button
            type="button"
            disabled={isSubmitting}
            onClick={handleSubmit(onValidate)}
            className="bg-[#3B7CED] hover:bg-[#3065c3] text-white"
          >
            {isSubmitting ? "Validating..." : "Validate & Deduct Stock"}
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
