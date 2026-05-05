"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { ArrowLeft, Plus, Trash2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { StatusModal, useStatusModal } from "@/components/shared/StatusModal";

// --- Mock Data Services ---
const MOCK_BUDGETS: Record<string, number> = {
  "wbs-1_cc-mat": 500000,
  "wbs-2_cc-mat": 150000,
};

const MOCK_INVENTORY: Record<
  string,
  { name: string; unit: string; unitCost: number; stockOnHand: number }
> = {
  "prod-1": {
    name: "Cement (50kg)",
    unit: "Bags",
    unitCost: 4500,
    stockOnHand: 100,
  },
  "prod-2": {
    name: "Steel Rods (12mm)",
    unit: "Lengths",
    unitCost: 8500,
    stockOnHand: 50,
  },
  "prod-3": {
    name: "Marine Board",
    unit: "Sheets",
    unitCost: 15000,
    stockOnHand: 20,
  },
};

// --- Schema ---
const productLineSchema = z.object({
  productId: z.string().min(1, "Product is required"),
  quantity: z.preprocess(
    (val) => (val === "" ? undefined : Number(val)),
    z.number().positive("Quantity must be positive").min(1, "Minimum 1"),
  ),
  unitCost: z.number(),
  totalCost: z.number(),
});

const formSchema = z.object({
  project: z.string().min(1, "Project is required"),
  wbsElement: z.string().min(1, "WBS Element is required"),
  costCode: z.string().min(1, "Cost Code is required"),
  dateConsumed: z.string().min(1, "Date is required"),
  warehouse: z.string().min(1, "Location is required"),
  notes: z.string().max(500).optional(),
  productLines: z
    .array(productLineSchema)
    .min(1, "At least one product is required"),
});

interface ProductLine {
  productId: string;
  quantity: number;
  unitCost: number;
  totalCost: number;
}

interface FormValues {
  project: string;
  wbsElement: string;
  costCode: string;
  dateConsumed: string;
  warehouse: string;
  notes?: string;
  productLines: ProductLine[];
}

export default function MaterialConsumptionForm() {
  const router = useRouter();
  const statusModal = useStatusModal();

  const [availableBudget, setAvailableBudget] = useState<number | null>(null);
  const [stockErrors, setStockErrors] = useState<Record<number, string>>({});

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema) as any,
    defaultValues: {
      project: "",
      wbsElement: "",
      costCode: "cc-mat", // Default to Materials
      dateConsumed: new Date().toISOString().split("T")[0],
      warehouse: "",
      notes: "",
      productLines: [{ productId: "", quantity: 0, unitCost: 0, totalCost: 0 }],
    },
    mode: "onBlur",
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "productLines",
  });

  const wbsElement = form.watch("wbsElement");
  const costCode = form.watch("costCode");
  const productLines = form.watch("productLines");

  // Fetch Available Budget when WBS and Cost Code change
  useEffect(() => {
    if (wbsElement && costCode) {
      const key = `${wbsElement}_${costCode}`;
      setAvailableBudget(
        MOCK_BUDGETS[key] !== undefined ? MOCK_BUDGETS[key] : 0,
      );
    } else {
      setAvailableBudget(null);
    }
  }, [wbsElement, costCode]);

  // Dual Validation: Validate Stock & Calculate Totals when lines change
  useEffect(() => {
    const newStockErrors: Record<number, string> = {};

    productLines.forEach((line, index) => {
      if (line.productId && line.quantity > 0) {
        const product = MOCK_INVENTORY[line.productId];
        if (product) {
          // Pre-submission Stock Check
          if (line.quantity > product.stockOnHand) {
            newStockErrors[index] =
              `Insufficient stock! Only ${product.stockOnHand} available.`;
          }
          // Calculate Total Cost
          if (line.unitCost !== product.unitCost) {
            form.setValue(`productLines.${index}.unitCost`, product.unitCost, {
              shouldValidate: true,
            });
          }
          const calculatedTotal = line.quantity * product.unitCost;
          if (line.totalCost !== calculatedTotal) {
            form.setValue(`productLines.${index}.totalCost`, calculatedTotal, {
              shouldValidate: true,
            });
          }
        }
      }
    });

    setStockErrors(newStockErrors);
  }, [productLines, form]);

  const totalRequestCost = productLines.reduce(
    (sum, line) => sum + (line.totalCost || 0),
    0,
  );
  const hasStockErrors = Object.keys(stockErrors).length > 0;

  const onSubmit = async (data: FormValues) => {
    if (hasStockErrors) {
      statusModal.showError(
        "Validation Error",
        "Please fix the stock availability errors before submitting.",
      );
      return;
    }

    try {
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // On-submission Budget Check
      if (availableBudget !== null && totalRequestCost > availableBudget) {
        statusModal.showError(
          "Budget Review Required",
          "This request exceeds the available budget and will be held in the Overrun Queue for PM review. Stock will not be deducted until approved.",
        );
      } else {
        statusModal.showSuccess(
          "Request Submitted",
          "Material consumption logged successfully. Actual costs and inventory have been updated.",
        );
      }
    } catch (error) {
      statusModal.showError(
        "Submission Failed",
        "There was an error logging consumption. Please try again.",
      );
    }
  };

  const handleModalAction = () => {
    statusModal.close();
    if (statusModal.type === "success") {
      form.reset();
      router.push("/material-consumption-request");
    } else if (statusModal.title === "Budget Review Required") {
      form.reset();
      router.push("/material-consumption-request");
    }
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="min-h-screen bg-[#F1F5F9]"
      >
        {/* Header */}
        <div className="bg-white border-b border-gray-200 px-4 py-4 sticky top-0 z-10">
          <div className="flex items-center gap-3 max-w-2xl mx-auto">
            <Button
              variant="ghost"
              size="icon-sm"
              className="text-gray-600 hover:text-gray-900 hover:bg-gray-100"
              onClick={() => router.back()}
              type="button"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <h1 className="text-xl font-semibold text-gray-900">
              Material Consumption
            </h1>
          </div>
        </div>

        <div className="max-w-2xl mx-auto pb-24 pt-4 space-y-4">
          {/* Request Details Section */}
          <div className="bg-white px-6 py-8 rounded-xl shadow-sm border border-gray-100">
            <h2 className="text-sm font-bold text-[#3B7CED] mb-6 uppercase tracking-wider flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-[#3B7CED]" />
              Request Details
            </h2>
            <div className="space-y-4">
              <div className="flex justify-between items-center py-2 border-b border-gray-50">
                <span className="text-sm font-semibold text-gray-900">
                  Request ID
                </span>
                <span className="text-sm font-medium text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                  MCR-AUTO
                </span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-gray-50">
                <span className="text-sm font-semibold text-gray-900">
                  Date
                </span>
                <span className="text-sm text-gray-600 font-medium">
                  {new Date().toLocaleDateString("en-GB")}
                </span>
              </div>
              <div className="flex justify-between items-center py-2">
                <span className="text-sm font-semibold text-gray-900">
                  Requested by
                </span>
                <span className="text-sm text-gray-600 font-medium">
                  Firstname Lastname
                </span>
              </div>
            </div>
          </div>

          {/* Project & Location Section */}
          <div className="bg-white px-6 py-8 rounded-xl shadow-sm border border-gray-100">
            <h2 className="text-sm font-bold text-[#3B7CED] mb-6 uppercase tracking-wider flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-[#3B7CED]" />
              Project & Location
            </h2>

            {/* Available Budget Indicator */}
            {availableBudget !== null && (
              <div
                className={cn(
                  "mb-6 p-4 rounded-xl flex items-start gap-3 transition-all duration-300 border shadow-sm",
                  availableBudget > 0
                    ? "bg-blue-50/50 border-blue-100"
                    : "bg-red-50/50 border-red-100",
                )}
              >
                <AlertCircle
                  className={cn(
                    "h-5 w-5 mt-0.5",
                    availableBudget > 0 ? "text-blue-500" : "text-red-500",
                  )}
                />
                <div>
                  <p
                    className={cn(
                      "text-sm font-semibold",
                      availableBudget > 0 ? "text-blue-900" : "text-red-900",
                    )}
                  >
                    Available Budget
                  </p>
                  <p
                    className={cn(
                      "text-lg font-bold tracking-tight",
                      availableBudget > 0 ? "text-[#3B7CED]" : "text-red-600",
                    )}
                  >
                    ₦
                    {availableBudget.toLocaleString("en-NG", {
                      minimumFractionDigits: 2,
                    })}
                  </p>
                </div>
              </div>
            )}

            <div className="p-4 border border-gray-100 bg-gray-50/50 rounded-lg space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="project"
                  render={({ field }) => (
                    <FormItem className="col-span-2">
                      <FormLabel className="text-sm font-semibold text-gray-900">
                        Project
                      </FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger
                            className={cn(
                              "h-11 w-full bg-white border-gray-200 focus:ring-[#3B7CED]/20",
                              form.formState.errors.project &&
                                "border-red-500 focus:ring-red-500/20",
                            )}
                          >
                            <SelectValue placeholder="Select active project" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="proj-1">
                            Project #1 - Alpha
                          </SelectItem>
                          <SelectItem value="proj-2">
                            Project #2 - Beta
                          </SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="warehouse"
                  render={({ field }) => (
                    <FormItem className="col-span-2">
                      <FormLabel className="text-sm font-semibold text-gray-900">
                        Location / Warehouse
                      </FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger
                            className={cn(
                              "h-11 w-full bg-white border-gray-200 focus:ring-[#3B7CED]/20",
                              form.formState.errors.warehouse &&
                                "border-red-500 focus:ring-red-500/20",
                            )}
                          >
                            <SelectValue placeholder="Select site store" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="store-main">
                            Main Site Store
                          </SelectItem>
                          <SelectItem value="store-sub">
                            Sub-Station B Store
                          </SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="wbsElement"
                  render={({ field }) => (
                    <FormItem className="col-span-1">
                      <FormLabel className="text-sm font-semibold text-gray-900">
                        WBS Element (Leaf)
                      </FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger
                            className={cn(
                              "h-11 w-full bg-white border-gray-200 focus:ring-[#3B7CED]/20",
                              form.formState.errors.wbsElement &&
                                "border-red-500 focus:ring-red-500/20",
                            )}
                          >
                            <SelectValue placeholder="Select WBS" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="wbs-1">
                            Foundation / Concrete Pour
                          </SelectItem>
                          <SelectItem value="wbs-2">
                            Structure / Framing
                          </SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="costCode"
                  render={({ field }) => (
                    <FormItem className="col-span-1">
                      <FormLabel className="text-sm font-semibold text-gray-900">
                        Cost Code
                      </FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        disabled
                      >
                        <FormControl>
                          <SelectTrigger className="h-11 w-full bg-gray-50 border-gray-200 text-gray-500">
                            <SelectValue placeholder="Select Code" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="cc-mat">
                            Materials (CC-02)
                          </SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>
          </div>

          {/* Product Lines Section */}
          <div className="bg-white px-6 py-8 rounded-xl shadow-sm border border-gray-100">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-sm font-bold text-[#3B7CED] uppercase tracking-wider flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-[#3B7CED]" />
                Product Lines
              </h2>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() =>
                  append({
                    productId: "",
                    quantity: 0,
                    unitCost: 0,
                    totalCost: 0,
                  })
                }
                className="text-blue-600 border-blue-200 hover:bg-blue-50"
              >
                <Plus className="h-4 w-4 mr-1" /> Add Product
              </Button>
            </div>

            <div className="space-y-6">
              {fields.map((field, index) => (
                <div
                  key={field.id}
                  className="p-4 border border-gray-100 bg-gray-50/50 rounded-lg space-y-4 relative"
                >
                  {fields.length > 1 && (
                    <button
                      type="button"
                      onClick={() => remove(index)}
                      className="absolute top-4 right-4 text-gray-400 hover:text-red-500 transition-colors"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  )}

                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name={`productLines.${index}.productId`}
                      render={({ field }) => (
                        <FormItem className="col-span-2">
                          <FormLabel className="text-xs font-semibold text-gray-700 uppercase tracking-wider">
                            Select Material
                          </FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger
                                className={cn(
                                  "h-11 bg-white border-gray-200 focus:ring-[#3B7CED]/20 w-full",
                                  form.formState.errors.productLines?.[index]
                                    ?.productId &&
                                    "border-red-500 focus:ring-red-500/20",
                                )}
                              >
                                <SelectValue placeholder="Search inventory..." />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {Object.entries(MOCK_INVENTORY).map(
                                ([id, prod]) => (
                                  <SelectItem key={id} value={id}>
                                    {prod.name} (Stock: {prod.stockOnHand}{" "}
                                    {prod.unit})
                                  </SelectItem>
                                ),
                              )}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name={`productLines.${index}.quantity`}
                      render={({ field }) => (
                        <FormItem className="col-span-1">
                          <FormLabel className="text-xs font-semibold text-gray-700 uppercase tracking-wider">
                            Quantity
                          </FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              min="1"
                              className={cn(
                                "h-11 bg-white border-gray-200 focus:ring-[#3B7CED]/20",
                                (form.formState.errors.productLines?.[index]
                                  ?.quantity ||
                                  stockErrors[index]) &&
                                  "border-red-500 focus:ring-red-500/20",
                              )}
                              {...field}
                            />
                          </FormControl>
                          {stockErrors[index] && (
                            <p className="text-[10px] text-red-500 font-medium">
                              {stockErrors[index]}
                            </p>
                          )}
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="col-span-1 space-y-2">
                      <Label className="text-xs font-semibold text-gray-700 uppercase tracking-wider">
                        Unit Cost (Auto)
                      </Label>
                      <div className="h-11 px-3 flex items-center bg-gray-50 border border-gray-200 rounded-md text-gray-500 text-sm font-medium">
                        ₦
                        {form
                          .watch(`productLines.${index}.unitCost`)
                          ?.toLocaleString() || 0}
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-between items-center pt-3 border-t border-gray-200">
                    <span className="text-sm font-semibold text-gray-600">
                      Line Total
                    </span>
                    <span className="text-sm font-bold text-gray-900">
                      ₦
                      {form
                        .watch(`productLines.${index}.totalCost`)
                        ?.toLocaleString("en-NG", { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* Total Cost Summary */}
            <div className="mt-6 pt-5 border-t border-gray-100 flex flex-col items-end">
              <div className="flex justify-between items-center w-full">
                <span className="text-base font-semibold text-gray-900">
                  Total Request Cost
                </span>
                <span
                  className={cn(
                    "text-2xl font-bold tracking-tight",
                    availableBudget !== null &&
                      totalRequestCost > availableBudget
                      ? "text-red-600"
                      : "text-[#3B7CED]",
                  )}
                >
                  ₦
                  {totalRequestCost.toLocaleString("en-NG", {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </span>
              </div>
              {availableBudget !== null &&
                totalRequestCost > availableBudget && (
                  <p className="text-sm text-red-500 mt-1 font-medium flex items-center gap-1.5">
                    <AlertCircle className="h-4 w-4" />
                    Exceeds available budget
                  </p>
                )}
            </div>
          </div>

          {/* Additional Info Section */}
          <div className="bg-white px-6 py-8 rounded-xl shadow-sm border border-gray-100">
            <h2 className="text-sm font-bold text-[#3B7CED] mb-6 uppercase tracking-wider flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-[#3B7CED]" />
              Additional Info
            </h2>
            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-semibold text-gray-900">
                    Notes (Optional)
                  </FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Enter any additional context or justification for this consumption..."
                      className="resize-none bg-gray-50/50 border-gray-200 focus:ring-[#3B7CED]/20 min-h-[120px]"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        {/* Fixed Submit Button */}
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 p-4 md:left-16 md:max-w-[calc(100%-4rem)] mx-auto shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
          <Button
            variant="contained"
            className="w-full max-w-2xl mx-auto h-12 text-base font-medium flex items-center justify-center block bg-[#3B7CED] hover:bg-[#2d63c7] text-white rounded-md disabled:bg-gray-300 disabled:text-gray-500"
            type="submit"
            disabled={form.formState.isSubmitting || hasStockErrors}
          >
            {form.formState.isSubmitting ? "Validating..." : "Submit Request"}
          </Button>
        </div>

        {/* Status Modal */}
        <StatusModal
          isOpen={statusModal.isOpen}
          onClose={statusModal.close}
          type={statusModal.type}
          title={statusModal.title}
          message={statusModal.message}
          actionText={
            statusModal.type === "success" ||
            statusModal.title === "Budget Review Required"
              ? "Done"
              : "Try again"
          }
          onAction={handleModalAction}
          showCloseButton={false}
        />
      </form>
    </Form>
  );
}
