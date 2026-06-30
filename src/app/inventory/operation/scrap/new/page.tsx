"use client";

import React, { useRef, useState } from "react";
import { useRouter } from "next/navigation";
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
        router.push("/inventory/operation");
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
        router.push("/inventory/operation");
      }, 1000);
    }, 500);
  }

  function closeNotification() {
    setNotification((prev) => ({ ...prev, show: false }));
  }

  return (
    <PageGuard application="inventory" module="scrap">
      <div className="flex flex-col flex-1 min-h-[calc(100vh-64px)] bg-white relative pb-20">
        <div className="flex items-center px-6 py-4 border-b border-gray-100">
          <Link href="/inventory/operation">
            <Button variant="ghost" size="icon" className="mr-2">
              <ArrowLeft className="h-5 w-5 text-gray-500" />
            </Button>
          </Link>
          <h1 className="text-lg font-medium text-gray-800">Record Scrap (Damage / Loss)</h1>
        </div>

        <div className="p-6 max-w-[1400px] mx-auto w-full flex flex-col gap-10">
          <form ref={formRef} className="flex flex-col gap-10">
            <section>
              <h2 className="text-[#3B7CED] text-xl mb-6 font-medium">Scrap & Accounting Allocation</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                
                <div className="flex flex-col gap-2">
                  <Label className="text-gray-700 font-medium">
                    Cause <span className="text-red-500">*</span>
                  </Label>
                  <Select
                    value={watch("adjustment_type")}
                    onValueChange={(value) => setValue("adjustment_type", value as any)}
                  >
                    <SelectTrigger className="bg-white border-gray-300 rounded">
                      <SelectValue placeholder="Select cause" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="damage">Damage</SelectItem>
                      <SelectItem value="loss">Loss</SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.adjustment_type && (
                    <p className="text-xs text-red-500 mt-1">{errors.adjustment_type.message}</p>
                  )}
                </div>

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

                <div className="flex flex-col gap-2">
                  <Label className="text-gray-700 font-medium">
                    Authorizing Manager <span className="text-red-500">*</span>
                  </Label>
                  <Select
                    value={watch("authorizing_manager")}
                    onValueChange={(value) => setValue("authorizing_manager", value)}
                  >
                    <SelectTrigger className="bg-white border-gray-300 rounded">
                      <SelectValue placeholder="Select manager" />
                    </SelectTrigger>
                    <SelectContent>
                      {DUMMY_MANAGERS.map((option) => (
                        <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.authorizing_manager && (
                    <p className="text-xs text-red-500 mt-1">{errors.authorizing_manager.message}</p>
                  )}
                </div>

                <div className="flex flex-col gap-2 md:col-span-2">
                  <Label className="text-gray-700 font-medium">
                    Expense Account Allocation (WBS / Cost Center) <span className="text-red-500">*</span>
                  </Label>
                  <Select
                    value={watch("expense_account")}
                    onValueChange={(value) => setValue("expense_account", value)}
                  >
                    <SelectTrigger className="bg-white border-gray-300 rounded">
                      <SelectValue placeholder="Select accounting destination" />
                    </SelectTrigger>
                    <SelectContent>
                      {DUMMY_ACCOUNTS.map((option) => (
                        <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.expense_account && (
                    <p className="text-xs text-red-500 mt-1">{errors.expense_account.message}</p>
                  )}
                </div>

                <div className="flex flex-col gap-2">
                  <Label className="text-gray-700 font-medium">Notes & Incident Summary</Label>
                  <Input
                    {...register("notes")}
                    placeholder="Enter reason for scrap..."
                    className="bg-white border-gray-300 rounded"
                  />
                </div>

              </div>
            </section>

            <section>
              <h2 className="text-[#3B7CED] text-xl mb-6 font-medium">Scrapped Items</h2>
              <div className="bg-white rounded border border-gray-200 shadow-sm overflow-hidden">
                <div className="overflow-x-auto w-full">
                  <Table className="min-w-[900px] w-full">
                    <TableHeader>
                      <TableRow className="bg-[#F8F9FA] hover:bg-[#F8F9FA] border-b-gray-100">
                        <TableHead className="w-64 font-medium text-gray-500 pl-4">Product</TableHead>
                        <TableHead className="w-24 font-medium text-gray-500 text-center">Unit</TableHead>
                        <TableHead className="w-32 font-medium text-gray-500 text-center">Current Stock</TableHead>
                        <TableHead className="w-32 font-medium text-gray-500 text-center">Scrap QTY</TableHead>
                        <TableHead className="w-32 font-medium text-gray-500 text-right">Unit Cost (₦)</TableHead>
                        <TableHead className="w-36 font-medium text-gray-500 text-right">Total Loss (₦)</TableHead>
                        <TableHead className="w-32 font-medium text-gray-500 text-center">Remaining Stock</TableHead>
                        <TableHead className="w-16 font-medium text-gray-500 text-center pr-4">Action</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {items.map((it) => {
                        const remaining = (Number(it.current_quantity) || 0) - (Number(it.scrap_quantity) || 0);
                        const totalLoss = (Number(it.scrap_quantity) || 0) * (it.unit_cost || 0);
                        return (
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
                                className="bg-white border-gray-300 rounded h-9 text-xs text-center w-24 mx-auto"
                              />
                            </TableCell>

                            <TableCell className="py-2 align-middle text-right font-mono text-xs text-gray-700">
                              {it.unit_cost ? `₦${it.unit_cost.toLocaleString()}` : "—"}
                            </TableCell>

                            <TableCell className="py-2 align-middle text-right font-mono font-bold text-red-600 text-xs">
                              {totalLoss > 0 ? `₦${totalLoss.toLocaleString()}` : "₦0"}
                            </TableCell>

                            <TableCell className="py-2 align-middle text-center">
                              <span className={`text-xs font-semibold ${remaining < 0 ? "text-red-600" : "text-gray-700"}`}>
                                {it.product ? remaining.toFixed(2) : "—"}
                              </span>
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
                        );
                      })}
                    </TableBody>
                    <TableFooter className="bg-[#F8F9FA] border-t border-gray-200">
                      <TableRow>
                        <TableCell colSpan={8} className="py-2 pl-4">
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

        <div className="absolute bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-6 py-3 flex items-center justify-between shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] z-10">
          <div className="flex items-center gap-3">
            <span className="text-xs text-gray-500 uppercase font-semibold">Total Financial Write-off:</span>
            <span className="text-lg font-bold font-mono text-red-600">
              ₦{items.reduce((acc, curr) => acc + ((Number(curr.scrap_quantity) || 0) * (curr.unit_cost || 0)), 0).toLocaleString()}
            </span>
          </div>
          <div className="flex gap-4">
            <Link href="/inventory/operation">
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
