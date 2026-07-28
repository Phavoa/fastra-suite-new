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
  project: z.string().min(1, "Project is required"),
  cause: z.string().min(1, "Cause of loss/damage is required  "),
  notes: z.string().optional(),
});

type ScrapFormData = z.infer<typeof scrapSchema>;

const DUMMY_PROJECTS: Option[] = [
  { value: "PROJ-A", label: "Project Alpha" },
  { value: "PROJ-B", label: "Project Beta" },
];

const getProjectLocation = (project: string) => {
  return project === "PROJ-A" ? "Main Warehouse - Site A" : "Secondary Store - Site B";
};

const CAUSE_OPTIONS: Option[] = [
  { value: "damage", label: "Damage / Spoilage" },
  { value: "loss", label: "Loss" },
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
      project: "PROJ-A",
      cause: "loss",
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
                
                {/* Project */}
                <div className="flex flex-col gap-2">
                  <Label className="text-gray-700 font-medium">
                    Project <span className="text-red-500">*</span>
                  </Label>
                  <Select
                    value={watch("project")}
                    onValueChange={(value) => setValue("project", value)}
                  >
                    <SelectTrigger className="bg-white border-gray-300 rounded">
                      <SelectValue placeholder="Select project" />
                    </SelectTrigger>
                    <SelectContent>
                      {DUMMY_PROJECTS.map((option) => (
                        <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.project && (
                    <p className="text-xs text-red-500 mt-1">{errors.project.message}</p>
                  )}
                </div>

                {/* Location Auto-fill */}
                <div className="flex flex-col gap-2">
                  <Label className="text-gray-700 font-medium">
                    Location
                  </Label>
                  <Input
                    readOnly
                    value={watch("project") ? getProjectLocation(watch("project")!) : ""}
                    className="bg-gray-50 border-gray-300 rounded text-gray-500"
                  />
                </div>

                {/* Cause of Loss */}
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
                    Notes
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
                <Table className="min-w-[900px] table-fixed">
                  <TableHeader className="bg-[#F6F7F8]">
                    <TableRow>
                      <TableHead className="w-64 border border-gray-200 px-4 py-3 text-left text-sm text-gray-600 font-medium">Product</TableHead>
                      <TableHead className="w-80 border border-gray-200 px-4 py-3 text-left text-sm text-gray-600 font-medium">Description</TableHead>
                      <TableHead className="w-24 border border-gray-200 px-4 py-3 text-center text-sm text-gray-600 font-medium">Unit</TableHead>
                      <TableHead className="w-32 border border-gray-200 px-4 py-3 text-center text-sm text-gray-600 font-medium">Available Stock</TableHead>
                      <TableHead className="w-32 border border-gray-200 px-4 py-3 text-center text-sm text-gray-600 font-medium">Scrap QTY</TableHead>
                      <TableHead className="w-16 border border-gray-200 px-4 py-3 text-center text-sm text-gray-600 font-medium">Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody className="bg-white">
                    {items.map((it) => (
                      <TableRow key={it.id} className="group hover:bg-[#FBFBFB] focus-within:bg-[#FBFBFB] transition-colors duration-150">
                        <TableCell className="border border-gray-200 align-middle p-0">
                          <Select
                            value={it.product}
                            onValueChange={(value) => updateItemWithProductDetails(it.id, value)}
                          >
                            <SelectTrigger className="h-11 w-full rounded-none border-0 focus:ring-0 focus:ring-offset-0 px-4">
                              <SelectValue placeholder="Select product" />
                            </SelectTrigger>
                            <SelectContent>
                              {productOptions.map((option) => (
                                <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </TableCell>

                        <TableCell className="border border-gray-200 px-4 align-middle">
                          <span className="text-sm text-gray-600 line-clamp-2">
                            {it.product_description || "Select a product"}
                          </span>
                        </TableCell>

                        <TableCell className="border border-gray-200 px-4 align-middle text-center">
                          <span className="text-sm text-gray-700">
                            {it.unit_of_measure || "N/A"}
                          </span>
                        </TableCell>

                        <TableCell className="border border-gray-200 px-4 align-middle text-center">
                          <span className="text-sm text-gray-700 font-semibold">
                            {it.current_quantity}
                          </span>
                        </TableCell>

                        <TableCell className="border border-gray-200 align-middle text-center p-0">
                          <Input
                            type="number"
                            step="0.01"
                            value={it.scrap_quantity}
                            onChange={(e) => updateScrapQty(it.id, e.target.value)}
                            placeholder="0"
                            className="h-11 w-full text-center rounded-none border-0 focus:ring-0 focus:ring-offset-0 bg-red-50/30 text-[#E43D2B] font-medium"
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
            onClick={handleSubmit(onValidate)}
            className="bg-[#3B7CED] hover:bg-[#3065c3] text-white"
          >
            {isSubmitting ? "Validating..." : "Validate"}
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
