"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  ArrowLeft,
  Plus,
  Trash2,
  AlertCircle,
  Bell,
  Loader2,
} from "lucide-react";
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

// API hooks
import { useCreateMaterialConsumptionMutation } from "@/api/requests/materialConsumptionRequestApi";
import {
  useGetProjectCostingProjectsQuery,
  useGetProjectCostingProjectQuery,
} from "@/api/projectCostingApi";
import { useGetActiveLocationsFilteredQuery } from "@/api/inventory/locationApi";
import { useGetInventoryProductsQuery } from "@/api/inventory/productsApi";
import { useSelector } from "react-redux";
import { RootState } from "@/lib/store/store";

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
  phase: z.string().min(1, "Phase is required"),
  wbsElement: z.string().min(1, "Activity is required"),
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
  phase: string;
  wbsElement: string;
  dateConsumed: string;
  warehouse: string;
  notes?: string;
  productLines: ProductLine[];
}

// Helper to convert numeric WBS ID to UUID
const toUUID = (val: string): string => {
  const uuidRegex =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  if (uuidRegex.test(val)) return val;
  const num = parseInt(val, 10);
  if (!isNaN(num)) {
    const hex = num.toString(16).padStart(12, "0");
    return `00000000-0000-0000-0000-${hex}`;
  }
  return "00000000-0000-0000-0000-000000000000";
};

export default function MaterialConsumptionForm() {
  const router = useRouter();
  const statusModal = useStatusModal();
  const loggedInUser = useSelector((state: RootState) => state.auth.user);
  const loggedInUserName = React.useMemo(() => {
    if (!loggedInUser) return "Current User";
    const anyUser = loggedInUser as any;
    return `${anyUser.first_name || ""} ${anyUser.last_name || ""}`.trim() || loggedInUser.username || "Current User";
  }, [loggedInUser]);

  // --- API Queries ---
  const { data: rawCostingProjects = [] } = useGetProjectCostingProjectsQuery({});

  // Filter approved/active projects only
  const projects = useMemo(() => {
    const list = Array.isArray(rawCostingProjects)
      ? rawCostingProjects
      : (rawCostingProjects as any)?.results || [];
    return list.filter((p: any) => {
      const st = String(p.status || "").toUpperCase();
      return st === "APPROVED" || st === "ACTIVE" || p.is_approved === true || !p.status;
    });
  }, [rawCostingProjects]);

  const isLoadingProjects = false;
  const { data: locations = [], isLoading: isLoadingLocations } =
    useGetActiveLocationsFilteredQuery();
  const { data: inventoryProducts = [], isLoading: isLoadingProducts } =
    useGetInventoryProductsQuery({});


  // --- Mutation ---
  const [createMaterialConsumption, { isLoading: isSubmitting }] =
    useCreateMaterialConsumptionMutation();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema) as any,
    defaultValues: {
      project: "",
      phase: "",
      wbsElement: "",
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

  const projectId = form.watch("project");
  const phaseId = form.watch("phase");
  const wbsElement = form.watch("wbsElement");
  const productLines = form.watch("productLines");

  // Fetch selected project detail for WBS (declared after projectId is available)
  const { data: selectedProjectDetail } = useGetProjectCostingProjectQuery(
    Number(projectId),
    { skip: !projectId || isNaN(Number(projectId)) },
  );

  // Budget is not yet wired to a real endpoint; show null so indicator is hidden
  const availableBudget = useMemo<number | null>(() => null, [projectId, wbsElement]);

  // --- Derived WBS options (from project-costing data) ---
  const buildWbsList = (proj: any): any[] => {
    if (!proj) return [];
    if (Array.isArray(proj.wbs) && proj.wbs.length > 0) return proj.wbs;
    const items: any[] = [];
    const phasesArr = Array.isArray(proj.phases)
      ? proj.phases
      : Array.isArray(proj.phase_list) ? proj.phase_list : [];
    phasesArr.forEach((ph: any, pi: number) => {
      const phId = ph.id || ph.phase_id || `phase-${pi + 1}`;
      const phName = ph.name || ph.phase_name || `Phase ${pi + 1}`;
      items.push({ id: phId, name: phName, is_activity: false });
      const acts = Array.isArray(ph.activities) ? ph.activities
        : Array.isArray(ph.activity_list) ? ph.activity_list : [];
      acts.forEach((act: any, ai: number) => {
        items.push({ ...act, id: act.id || `act-${phId}-${ai + 1}`, name: act.name || `Activity ${ai + 1}`, is_activity: true, parent: phId });
      });
    });
    return items;
  };

  const wbsList = useMemo(() => buildWbsList(selectedProjectDetail), [selectedProjectDetail]);

  const phases = useMemo(() => {
    return wbsList.filter((w: any) => !w.is_activity);
  }, [wbsList]);

  const activities = useMemo(() => {
    if (!phaseId) return [];
    return wbsList.filter((w: any) => w.is_activity && String(w.parent) === String(phaseId));
  }, [wbsList, phaseId]);

  // Reset dependent fields when project changes
  useEffect(() => {
    form.setValue("phase", "");
    form.setValue("wbsElement", "");
  }, [projectId, form]);

  // Reset activity when phase changes
  useEffect(() => {
    form.setValue("wbsElement", "");
  }, [phaseId, form]);

  // --- Calculate totals when product lines change ---
  useEffect(() => {
    productLines.forEach((line, index) => {
      if (!line.productId || line.quantity <= 0) return;
      const product = inventoryProducts.find(
        (p) => String(p.id) === line.productId,
      );
      if (!product) return;

      const unitCost = Number(product.standard_cost) || 0;
      const totalCost = line.quantity * unitCost;

      if (line.unitCost !== unitCost) {
        form.setValue(`productLines.${index}.unitCost`, unitCost, {
          shouldValidate: true,
        });
      }
      if (line.totalCost !== totalCost) {
        form.setValue(`productLines.${index}.totalCost`, totalCost, {
          shouldValidate: true,
        });
      }
    });
  }, [productLines, inventoryProducts, form]);

  const totalRequestCost = productLines.reduce(
    (sum, line) => sum + (line.totalCost || 0),
    0,
  );

  const onSubmit = async (data: FormValues) => {
    try {
      const payload = {
        project: Number(data.project),
        activity: toUUID(data.wbsElement),
        location: data.warehouse,
        date_consumed: data.dateConsumed,
        notes: data.notes || "",
        lines: data.productLines.map((line) => ({
          id: Number(line.productId),
          quantity: line.quantity,
          unit_cost: line.unitCost.toFixed(2),
          total_cost: line.totalCost.toFixed(2),
        })),
      };

      await createMaterialConsumption(payload).unwrap();

      statusModal.showSuccess(
        "Request Submitted",
        "Material consumption logged successfully.",
      );
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
      router.push("/project-request/material-consumption-request");
    }
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="min-h-screen bg-[#F9FAFB] pb-28"
      >
        {/* Header Bar */}
        <header className="w-full border-b border-gray-100 bg-white sticky top-0 z-30 shadow-none">
          <div className="max-w-2xl mx-auto px-4 h-16 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button
                onClick={() => router.back()}
                className="p-1 rounded-lg hover:bg-gray-50 transition-colors"
                aria-label="Back"
                type="button"
              >
                <ArrowLeft size={20} className="text-gray-600" />
              </button>
              <h1 className="text-lg font-bold text-gray-800">
                Material Consumption
              </h1>
            </div>

            <div className="flex items-center gap-3">
              <button
                className="p-2 rounded-lg hover:bg-gray-50 transition-colors"
                type="button"
              >
                <Bell size={20} className="text-gray-800" />
              </button>
            </div>
          </div>
        </header>

        <div className="max-w-2xl mx-auto pb-24 pt-4 space-y-4 px-4 sm:px-0">
          {/* Request Details Section */}
          <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-xs space-y-5">
            <h2 className="text-xs font-bold text-[#3B7CED] uppercase tracking-wider">
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
              <div className="flex justify-between items-center py-2 border-b border-gray-50">
                <span className="text-sm font-semibold text-gray-900">
                  Requested by
                </span>
                <span className="text-sm text-gray-600 font-medium">
                  {loggedInUserName}
                </span>
              </div>
            </div>
          </div>

          {/* Project & Location Section */}
          <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-xs space-y-5">
            <h2 className="text-xs font-bold text-[#3B7CED] uppercase tracking-wider">
              Project & Location
            </h2>

            {/* Available Budget Indicator */}
            {availableBudget !== null && (
              <div
                className={cn(
                  "mb-2 p-4 rounded-xl flex items-start gap-3 transition-all duration-300 border shadow-sm",
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
                    {(availableBudget ?? 0).toLocaleString("en-NG", {
                      minimumFractionDigits: 2,
                    })}
                  </p>
                </div>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              {/* Project */}
              <FormField
                control={form.control}
                name="project"
                render={({ field }) => (
                  <FormItem className="col-span-2">
                    <FormLabel className="text-xs font-semibold text-gray-700 uppercase tracking-wider">
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
                          <SelectValue
                            placeholder={
                              isLoadingProjects
                                ? "Loading projects..."
                                : "Select active project"
                            }
                          />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {projects.map((p: any) => (
                          <SelectItem key={p.id} value={String(p.id)}>
                            {p.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Phase */}
              <FormField
                control={form.control}
                name="phase"
                render={({ field }) => (
                  <FormItem className="col-span-2">
                    <FormLabel className="text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Phase
                    </FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      value={field.value}
                      disabled={!projectId || phases.length === 0}
                    >
                      <FormControl>
                        <SelectTrigger
                          className={cn(
                            "h-11 w-full bg-white border-gray-200 focus:ring-[#3B7CED]/20",
                            form.formState.errors.phase &&
                              "border-red-500 focus:ring-red-500/20",
                          )}
                        >
                          <SelectValue
                            placeholder={
                              !projectId
                                ? "Select a project first"
                                : "Select phase"
                            }
                          />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {phases.map((p) => (
                          <SelectItem key={p.id} value={String(p.id)}>
                            {p.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Activity / WBS Element */}
              <FormField
                control={form.control}
                name="wbsElement"
                render={({ field }) => (
                  <FormItem className="col-span-2">
                    <FormLabel className="text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Activity
                    </FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      value={field.value}
                      disabled={!phaseId || activities.length === 0}
                    >
                      <FormControl>
                        <SelectTrigger
                          className={cn(
                            "h-11 w-full bg-white border-gray-200 focus:ring-[#3B7CED]/20",
                            form.formState.errors.wbsElement &&
                              "border-red-500 focus:ring-red-500/20",
                          )}
                        >
                          <SelectValue
                            placeholder={
                              !phaseId
                                ? "Select a phase first"
                                : "Select activity"
                            }
                          />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {activities.map((a) => (
                          <SelectItem key={a.id} value={String(a.id)}>
                            {a.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Location / Warehouse */}
              <FormField
                control={form.control}
                name="warehouse"
                render={({ field }) => (
                  <FormItem className="col-span-2">
                    <FormLabel className="text-xs font-semibold text-gray-700 uppercase tracking-wider">
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
                          <SelectValue
                            placeholder={
                              isLoadingLocations
                                ? "Loading locations..."
                                : "Select site store"
                            }
                          />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {locations.map((loc) => (
                          <SelectItem key={loc.id} value={loc.location_name}>
                            {loc.location_name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Date Consumed */}
              <FormField
                control={form.control}
                name="dateConsumed"
                render={({ field }) => (
                  <FormItem className="col-span-2">
                    <FormLabel className="text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Date Consumed
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="date"
                        className={cn(
                          "h-11 bg-white border-gray-200 focus:ring-[#3B7CED]/20",
                          form.formState.errors.dateConsumed &&
                            "border-red-500 focus:ring-red-500/20",
                        )}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>

          {/* Product Lines Section */}
          <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-xs space-y-4">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xs font-bold text-[#3B7CED] uppercase tracking-wider">
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
                    {/* Product Select */}
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
                                <SelectValue
                                  placeholder={
                                    isLoadingProducts
                                      ? "Loading inventory..."
                                      : "Search inventory..."
                                  }
                                />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {inventoryProducts.map((prod) => (
                                <SelectItem
                                  key={prod.id}
                                  value={String(prod.id)}
                                >
                                  {prod.product_name}
                                  {prod.unit_of_measure_details?.unit_symbol
                                    ? ` (${prod.unit_of_measure_details.unit_symbol})`
                                    : ""}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Quantity */}
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
                                form.formState.errors.productLines?.[index]
                                  ?.quantity &&
                                  "border-red-500 focus:ring-red-500/20",
                              )}
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Unit Cost (read-only) */}
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
                        ?.toLocaleString("en-NG", {
                          minimumFractionDigits: 2,
                        })}
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
          <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-xs space-y-4">
            <h2 className="text-xs font-bold text-[#3B7CED] uppercase tracking-wider">
              Additional Info
            </h2>
            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs font-semibold text-gray-700 uppercase tracking-wider">
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
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 p-4 z-20 shadow-none">
          <div className="max-w-2xl mx-auto px-4">
            <Button
              type="submit"
              disabled={isSubmitting}
              className="w-full h-12 text-sm font-bold flex items-center justify-center bg-[#3B7CED] hover:bg-[#2d63c7] text-white rounded-lg shadow-none"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Submitting...
                </>
              ) : (
                "Submit Request"
              )}
            </Button>
          </div>
        </div>

        {/* Status Modal */}
        <StatusModal
          isOpen={statusModal.isOpen}
          onClose={statusModal.close}
          type={statusModal.type}
          title={statusModal.title}
          message={statusModal.message}
          actionText={statusModal.type === "success" ? "Done" : "Try again"}
          onAction={handleModalAction}
          showCloseButton={false}
        />
      </form>
    </Form>
  );
}
