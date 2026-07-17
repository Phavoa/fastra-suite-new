"use client";

import React, { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ToastNotification } from "@/components/shared/ToastNotification";
import { PageGuard } from "@/components/auth/PageGuard";
import Breadcrumbs from "@/components/shared/BreadScrumbs";
import { AutoSaveIcon } from "@/components/shared/icons";
import { BreadcrumbItem } from "@/types/purchase";
import { Button } from "@/components/ui/button";
import { Plus, Trash, ArrowLeft, Trash2 } from "lucide-react";
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
  unit_cost?: number;
}

const scrapSchema = z.object({
  adjustment_type: z.enum(["damage", "loss"], {
    message: "Cause is required per PRD",
  }),
  warehouse_location: z.string().min(1, "Warehouse location is required"),
  authorizing_manager: z.string().min(1, "Authorizing manager is required"),
  expense_account: z.string().min(1, "Expense account allocation is required"),
  notes: z.string().optional(),
});

type ScrapFormData = z.infer<typeof scrapSchema>;

const DUMMY_LOCATIONS: Option[] = [
  { value: "WH-MAIN", label: "Main Warehouse - Site A (WH-MAIN)" },
  { value: "WH-SEC", label: "Secondary Store - Site B (WH-SEC)" },
];

const DUMMY_MANAGERS: Option[] = [
  { value: "DIR-01", label: "Engr. Tunde (Project Director)" },
  { value: "FC-01", label: "Mrs. Ngozi (Financial Controller)" },
  { value: "SM-01", label: "Engr. David (Site Manager - Site A)" },
];

const DUMMY_ACCOUNTS: Option[] = [
  { value: "ACC-4001", label: "Site A Overhead Write-off (ACC-4001)" },
  { value: "ACC-5002", label: "General Company Spoilage Loss (ACC-5002)" },
  { value: "ACC-3005", label: "Transit Damage Claim Account (ACC-3005)" },
];

const DUMMY_PRODUCTS = [
  { id: "1", product_name: "Cement (50kg Bag)", product_description: "Portland Cement Grade 42.5", unit_symbol: "Bags", current_stock: "500", unit_cost: 5500 },
  { id: "2", product_name: "Reinforcement Steel 16mm", product_description: "High Yield Deformed Steel Bars", unit_symbol: "Tonnes", current_stock: "150", unit_cost: 850000 },
  { id: "3", product_name: "Sharp Sand", product_description: "Clean river sharp sand for plastering", unit_symbol: "m³", current_stock: "45", unit_cost: 12000 },
  { id: "4", product_name: "Safety Helmets (Yellow)", product_description: "HDPE Hard Hats with adjustable strap", unit_symbol: "Pieces", current_stock: "120", unit_cost: 4500 },
];

export default function CreateScrapPage() {
  const router = useRouter();
  const formRef = useRef<HTMLFormElement>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [items, setItems] = useState<ScrapLineItem[]>([
    {
      id: "1",
      product: "",
      product_description: "",
      unit_of_measure: "",
      current_quantity: "0",
      scrap_quantity: "",
      unit_cost: 0,
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
        unit_cost: 0,
      },
    ]);

  const removeRow = (id: string) =>
    setItems((prev) => prev.filter((p) => p.id !== id));

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<ScrapFormData>({
    resolver: zodResolver(scrapSchema) as Resolver<ScrapFormData>,
    defaultValues: {
      adjustment_type: undefined,
      warehouse_location: "WH-MAIN",
      authorizing_manager: "DIR-01",
      expense_account: "ACC-4001",
      notes: "",
    },
  });

  const productOptions: Option[] = DUMMY_PRODUCTS.map((p) => ({
    value: p.id,
    label: p.product_name,
  }));

  const updateItemWithProductDetails = (id: string, productId: string) => {
    const p = DUMMY_PRODUCTS.find((item) => item.id === productId);
    setItems((prev) =>
      prev.map((it) =>
        it.id === id
          ? {
              ...it,
              product: productId,
              product_description: p?.product_description || "",
              unit_of_measure: p?.unit_symbol || "",
              current_quantity: p?.current_stock || "0",
              unit_cost: p?.unit_cost || 0,
            }
          : it
      )
    );
  };

  const updateScrapQty = (id: string, qty: string) => {
    setItems((prev) =>
      prev.map((it) => (it.id === id ? { ...it, scrap_quantity: qty } : it))
    );
  };

  async function onSave(data: ScrapFormData): Promise<void> {
    const validItems = items.filter(
      (item) => item.product && item.scrap_quantity && Number(item.scrap_quantity) > 0
    );

    if (validItems.length === 0) {
      setNotification({
        message: "Please add at least one valid item with product and scrap quantity greater than 0",
        type: "error",
        show: true,
      });
      return;
    }

    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setNotification({
        message: "Scrap order saved as draft!",
        type: "success",
        show: true,
      });

      setTimeout(() => {
        router.push("/inventory/operation/scrap");
      }, 1000);
    }, 500);
  }

  async function onValidate(data: ScrapFormData): Promise<void> {
    const validItems = items.filter(
      (item) => item.product && item.scrap_quantity && Number(item.scrap_quantity) > 0
    );

    if (validItems.length === 0) {
      setNotification({
        message: "Please add at least one valid item with product and scrap quantity greater than 0",
        type: "error",
        show: true,
      });
      return;
    }

    const exceedsStock = validItems.some(
      (it) => Number(it.scrap_quantity) > Number(it.current_quantity)
    );

    if (exceedsStock) {
      setNotification({
        message: "Cannot scrap more stock than currently available on hand!",
        type: "error",
        show: true,
      });
      return;
    }

    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setNotification({
        message: "Scrap order validated! Deducted scrapped quantity from stock on hand.",
        type: "success",
        show: true,
      });

      setTimeout(() => {
        router.push("/inventory/operation/scrap");
      }, 1000);
    }, 500);
  }

  function closeNotification() {
    setNotification((prev) => ({ ...prev, show: false }));
  }

  const breadcrumbsItem: BreadcrumbItem[] = [
    { label: "Home", href: "/" },
    { label: "Inventory", href: "/inventory" },
    { label: "Operation", href: "/inventory/operation" },
    { label: "Scrap Recording", href: "/inventory/operation/scrap" },
    { label: "Record Scrap", href: "/inventory/operation/scrap/new", current: true },
  ];

  const totalWriteOff = items.reduce(
    (acc, curr) => acc + (Number(curr.scrap_quantity) || 0) * (curr.unit_cost || 0),
    0
  );

  return (
    <PageGuard application="inventory" module="scrap">
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
              <div className="p-3 rounded-lg bg-[#FCE8E6] text-[#E43D2B]">
                <Trash2 className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-xl font-semibold text-[#32325D]">
                  Record Scrap (Damage / Spoilage / Loss)
                </h1>
                <p className="text-xs text-[#8898AA] mt-0.5">
                  Document unusable inventory write-offs and automatically allocate losses to accounting cost centers.
                </p>
              </div>
            </div>
            <Link href="/inventory/operation/scrap">
              <Button variant="outline" className="border-gray-200 text-gray-600 hover:bg-gray-50 text-sm h-9 px-3">
                <ArrowLeft className="w-4 h-4 mr-1.5" /> Cancel
              </Button>
            </Link>
          </div>

          <form ref={formRef} className="flex flex-col gap-6">
            {/* Scrap & Accounting Allocation Card */}
            <div className="bg-white rounded-lg shadow-2xs border border-gray-100 p-6">
              <h2 className="text-base font-semibold text-[#32325D] mb-4 pb-3 border-b border-gray-100">
                Scrap & Accounting Allocation
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="flex flex-col gap-2">
                  <Label className="text-xs font-semibold text-[#525F7F]">
                    Cause <span className="text-[#E43D2B]">*</span>
                  </Label>
                  <Select
                    value={watch("adjustment_type")}
                    onValueChange={(value) => setValue("adjustment_type", value as any)}
                  >
                    <SelectTrigger className="bg-white border-gray-200 rounded-md h-9 text-sm text-[#32325D] focus:ring-[#3B7CED]">
                      <SelectValue placeholder="Select cause" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="damage">Damage / Spoilage</SelectItem>
                      <SelectItem value="loss">Theft / Unexplained Loss</SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.adjustment_type && (
                    <p className="text-[11px] text-[#E43D2B]">{errors.adjustment_type.message}</p>
                  )}
                </div>

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

                <div className="flex flex-col gap-2">
                  <Label className="text-xs font-semibold text-[#525F7F]">
                    Authorizing Manager <span className="text-[#E43D2B]">*</span>
                  </Label>
                  <Select
                    value={watch("authorizing_manager")}
                    onValueChange={(value) => setValue("authorizing_manager", value)}
                  >
                    <SelectTrigger className="bg-white border-gray-200 rounded-md h-9 text-sm text-[#32325D] focus:ring-[#3B7CED]">
                      <SelectValue placeholder="Select manager" />
                    </SelectTrigger>
                    <SelectContent>
                      {DUMMY_MANAGERS.map((option) => (
                        <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.authorizing_manager && (
                    <p className="text-[11px] text-[#E43D2B]">{errors.authorizing_manager.message}</p>
                  )}
                </div>

                <div className="flex flex-col gap-2 sm:col-span-2">
                  <Label className="text-xs font-semibold text-[#525F7F]">
                    Expense Account Allocation (WBS / Cost Center) <span className="text-[#E43D2B]">*</span>
                  </Label>
                  <Select
                    value={watch("expense_account")}
                    onValueChange={(value) => setValue("expense_account", value)}
                  >
                    <SelectTrigger className="bg-white border-gray-200 rounded-md h-9 text-sm text-[#32325D] focus:ring-[#3B7CED]">
                      <SelectValue placeholder="Select accounting destination" />
                    </SelectTrigger>
                    <SelectContent>
                      {DUMMY_ACCOUNTS.map((option) => (
                        <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.expense_account && (
                    <p className="text-[11px] text-[#E43D2B]">{errors.expense_account.message}</p>
                  )}
                </div>

                <div className="flex flex-col gap-2">
                  <Label className="text-xs font-semibold text-[#525F7F]">Notes & Incident Summary</Label>
                  <Input
                    {...register("notes")}
                    placeholder="Enter explanation for scrap..."
                    className="bg-white border-gray-200 rounded-md h-9 text-sm text-[#32325D] focus:ring-[#3B7CED]"
                  />
                </div>
              </div>
            </div>

            {/* Scrapped Items Table Card */}
            <div className="bg-white rounded-lg shadow-2xs border border-gray-100 overflow-hidden">
              <div className="p-5 border-b border-gray-100">
                <h2 className="text-base font-semibold text-[#32325D]">
                  Scrapped Items & Stock Deduction
                </h2>
              </div>
              <div className="overflow-x-auto">
                <Table className="min-w-[900px] w-full">
                  <TableHeader>
                    <TableRow className="bg-[#F6F9FC] hover:bg-[#F6F9FC] border-b border-gray-100">
                      <TableHead className="py-3.5 px-6 font-semibold text-[#8898AA] text-[11.5px] whitespace-nowrap w-64">
                        Product
                      </TableHead>
                      <TableHead className="py-3.5 px-6 font-semibold text-[#8898AA] text-[11.5px] whitespace-nowrap text-center w-24">
                        Unit
                      </TableHead>
                      <TableHead className="py-3.5 px-6 font-semibold text-[#8898AA] text-[11.5px] whitespace-nowrap text-center w-32">
                        Current Stock
                      </TableHead>
                      <TableHead className="py-3.5 px-6 font-semibold text-[#8898AA] text-[11.5px] whitespace-nowrap text-center w-32">
                        Scrap Qty
                      </TableHead>
                      <TableHead className="py-3.5 px-6 font-semibold text-[#8898AA] text-[11.5px] whitespace-nowrap text-right w-32">
                        Unit Cost
                      </TableHead>
                      <TableHead className="py-3.5 px-6 font-semibold text-[#8898AA] text-[11.5px] whitespace-nowrap text-right w-36">
                        Total Loss
                      </TableHead>
                      <TableHead className="py-3.5 px-6 font-semibold text-[#8898AA] text-[11.5px] whitespace-nowrap text-center w-32">
                        Remaining
                      </TableHead>
                      <TableHead className="py-3.5 pr-6 font-semibold text-[#8898AA] text-[11.5px] whitespace-nowrap text-center w-16"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {items.map((it) => {
                      const remaining = (Number(it.current_quantity) || 0) - (Number(it.scrap_quantity) || 0);
                      const totalLoss = (Number(it.scrap_quantity) || 0) * (it.unit_cost || 0);
                      return (
                        <TableRow key={it.id} className="hover:bg-gray-50 border-b border-gray-100 transition-colors">
                          <TableCell className="px-6 py-3.5">
                            <Select
                              value={it.product}
                              onValueChange={(value) => updateItemWithProductDetails(it.id, value)}
                            >
                              <SelectTrigger className="bg-white border-gray-200 rounded h-9 text-sm font-semibold text-[#32325D]">
                                <SelectValue placeholder="Select product" />
                              </SelectTrigger>
                              <SelectContent>
                                {productOptions.map((option) => (
                                  <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </TableCell>

                          <TableCell className="px-6 py-3.5 text-center text-sm text-[#525F7F] font-medium">
                            {it.unit_of_measure || "—"}
                          </TableCell>

                          <TableCell className="px-6 py-3.5 text-center text-sm font-semibold text-[#32325D]">
                            {it.current_quantity}
                          </TableCell>

                          <TableCell className="px-6 py-3.5 text-center">
                            <Input
                              type="number"
                              step="0.01"
                              value={it.scrap_quantity}
                              onChange={(e) => updateScrapQty(it.id, e.target.value)}
                              placeholder="0"
                              className="bg-white border-gray-200 rounded h-8 text-sm text-center font-bold text-[#E43D2B] w-24 mx-auto"
                            />
                          </TableCell>

                          <TableCell className="px-6 py-3.5 text-right font-mono text-sm text-[#525F7F]">
                            {it.unit_cost ? `₦${it.unit_cost.toLocaleString()}` : "—"}
                          </TableCell>

                          <TableCell className="px-6 py-3.5 text-right font-mono font-bold text-[#E43D2B] text-sm">
                            {totalLoss > 0 ? `₦${totalLoss.toLocaleString()}` : "₦0"}
                          </TableCell>

                          <TableCell className="px-6 py-3.5 text-center">
                            <span className={`text-sm font-bold font-mono ${remaining < 0 ? "text-[#E43D2B]" : "text-[#2BA24D]"}`}>
                              {it.product ? remaining.toFixed(2) : "—"}
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
                      <TableCell colSpan={8} className="py-3.5 px-6">
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

        {/* Sticky Action Bar */}
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-6 py-3 flex items-center justify-between shadow-lg z-30">
          <div className="flex items-center gap-3">
            <span className="text-xs text-[#8898AA] uppercase font-semibold tracking-wide">
              Total Financial Write-off:
            </span>
            <span className="text-lg font-bold font-mono text-[#E43D2B]">
              ₦{totalWriteOff.toLocaleString()}
            </span>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/inventory/operation/scrap">
              <Button variant="outline" type="button" className="border-gray-200 text-gray-600 hover:bg-gray-50 h-9 px-4 text-sm font-medium">
                Cancel
              </Button>
            </Link>
            <Button
              type="button"
              disabled={isSubmitting}
              onClick={handleSubmit(onSave)}
              variant="outline"
              className="border-gray-200 text-gray-600 hover:bg-gray-50 h-9 px-4 text-sm font-medium"
            >
              {isSubmitting ? "Saving..." : "Save Draft"}
            </Button>
            <Button
              type="button"
              disabled={isSubmitting}
              onClick={handleSubmit(onValidate)}
              className="bg-[#3B7CED] hover:bg-[#3065c3] text-white h-9 px-5 text-sm font-medium shadow-2xs transition-all"
            >
              {isSubmitting ? "Validating..." : "Validate & Deduct Stock"}
            </Button>
          </div>
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
