"use client";

import React, { useRef, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { useForm, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ToastNotification } from "@/components/shared/ToastNotification";
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
import { PageGuard } from "@/components/auth/PageGuard";

type Option = { value: string; label: string };

interface GRNLineItem {
  id: string;
  product: string;
  product_description: string;
  unit_of_measure: string;
  po_quantity: string;
  received_quantity: string;
  accepted_quantity: string;
  rejected_quantity: string;
  reject_reason: string;
}

const grnSchema = z.object({
  supplier: z.string().min(1, "Supplier is required"),
  destination_location: z.string().min(1, "Destination location is required"),
  notes: z.string().optional(),
});

type GRNFormData = z.infer<typeof grnSchema>;

const DUMMY_LOCATIONS: Option[] = [
  { value: "WH-MAIN", label: "Main Warehouse - Site A (WH-MAIN)" },
  { value: "WH-SEC", label: "Secondary Store - Site B (WH-SEC)" },
];

const DUMMY_SUPPLIERS: Option[] = [
  { value: "SUP-1", label: "Dangote Cement Plc" },
  { value: "SUP-2", label: "BUA Steel Co." },
];

const DUMMY_PRODUCTS = [
  { id: "1", product_name: "Cement (50kg Bag)", product_description: "Portland Cement Grade 42.5", unit_symbol: "Bags" },
  { id: "2", product_name: "Reinforcement Steel 16mm", product_description: "High Yield Deformed Steel Bars", unit_symbol: "Tonnes" },
];

export default function EditIncomingProductPage() {
  const params = useParams();
  const id = (params?.id as string) || "WH-IN-0002";
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [items, setItems] = useState<GRNLineItem[]>([
    {
      id: "1",
      product: "1",
      product_description: "Portland Cement Grade 42.5",
      unit_of_measure: "Bags",
      po_quantity: "600",
      received_quantity: "600",
      accepted_quantity: "590",
      rejected_quantity: "10",
      reject_reason: "Damaged packaging during transit",
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

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<GRNFormData>({
    resolver: zodResolver(grnSchema) as Resolver<GRNFormData>,
    defaultValues: {
      supplier: "SUP-1",
      destination_location: "WH-MAIN",
      notes: "Delivery Note DN-9910 verified.",
    },
  });

  const productOptions: Option[] = DUMMY_PRODUCTS.map((p) => ({
    value: p.id,
    label: p.product_name,
  }));

  const updateItemQty = (itemId: string, field: "received_quantity" | "accepted_quantity" | "rejected_quantity", val: string) => {
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

  async function onSave(data: GRNFormData): Promise<void> {
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setNotification({
        message: "GRN Draft updated successfully!",
        type: "success",
        show: true,
      });
      setTimeout(() => {
        router.push(`/inventory/operation/incoming_product/${id}`);
      }, 1000);
    }, 500);
  }

  async function onValidate(data: GRNFormData): Promise<void> {
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setNotification({
        message: "GRN Validated! Stock received into Inventory Ledger.",
        type: "success",
        show: true,
      });
      setTimeout(() => {
        router.push(`/inventory/operation/incoming_product/${id}`);
      }, 1000);
    }, 500);
  }

  function closeNotification() {
    setNotification((prev) => ({ ...prev, show: false }));
  }

  return (
    <PageGuard application="inventory" module="incomingproduct">
      <div className="flex flex-col flex-1 min-h-[calc(100vh-64px)] bg-white relative pb-20">
        <div className="flex items-center px-6 py-4 border-b border-gray-100">
          <Link href={`/inventory/operation/incoming_product/${id}`}>
            <Button variant="ghost" size="icon" className="mr-2">
              <ArrowLeft className="h-5 w-5 text-gray-500" />
            </Button>
          </Link>
          <h1 className="text-lg font-medium text-gray-800">Edit GRN Draft: {id}</h1>
        </div>

        <div className="p-6 max-w-[1400px] mx-auto w-full flex flex-col gap-10">
          <form className="flex flex-col gap-10">
            <section>
              <h2 className="text-[#3B7CED] text-xl mb-6 font-medium">Receipt Details</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="flex flex-col gap-2">
                  <Label className="text-gray-700 font-medium">Supplier / Vendor</Label>
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
                </div>

                <div className="flex flex-col gap-2">
                  <Label className="text-gray-700 font-medium">Destination Location</Label>
                  <Select value={watch("destination_location")} onValueChange={(v) => setValue("destination_location", v)}>
                    <SelectTrigger className="bg-white border-gray-300 rounded">
                      <SelectValue placeholder="Select location" />
                    </SelectTrigger>
                    <SelectContent>
                      {DUMMY_LOCATIONS.map((o) => (
                        <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex flex-col gap-2">
                  <Label className="text-gray-700 font-medium">Inspection Notes</Label>
                  <Input {...register("notes")} placeholder="Delivery note details..." className="bg-white border-gray-300 rounded" />
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-[#3B7CED] text-xl mb-6 font-medium">Product Inspection Lines</h2>
              <div className="bg-white rounded border border-gray-200 shadow-sm overflow-hidden">
                <Table className="min-w-[900px] w-full">
                  <TableHeader>
                    <TableRow className="bg-[#F8F9FA] border-b-gray-100">
                      <TableHead className="pl-4">Product</TableHead>
                      <TableHead className="text-center">Unit</TableHead>
                      <TableHead className="text-center">PO QTY</TableHead>
                      <TableHead className="text-center">Received QTY</TableHead>
                      <TableHead className="text-center">Accepted QTY</TableHead>
                      <TableHead className="text-center">Rejected QTY</TableHead>
                      <TableHead className="pr-4">Reject Reason</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {items.map((it) => (
                      <TableRow key={it.id} className="border-b-gray-100 hover:bg-gray-50">
                        <TableCell className="pl-4 font-medium text-gray-800">{DUMMY_PRODUCTS.find(p => p.id === it.product)?.product_name || "Product"}</TableCell>
                        <TableCell className="text-center text-xs">{it.unit_of_measure}</TableCell>
                        <TableCell className="text-center font-medium text-gray-500">{it.po_quantity}</TableCell>
                        <TableCell className="text-center">
                          <Input type="number" value={it.received_quantity} onChange={(e) => updateItemQty(it.id, "received_quantity", e.target.value)} className="w-20 mx-auto text-center h-8 text-xs" />
                        </TableCell>
                        <TableCell className="text-center">
                          <Input type="number" value={it.accepted_quantity} onChange={(e) => updateItemQty(it.id, "accepted_quantity", e.target.value)} className="w-20 mx-auto text-center h-8 text-xs font-bold text-green-600" />
                        </TableCell>
                        <TableCell className="text-center font-bold text-red-600">{it.rejected_quantity}</TableCell>
                        <TableCell className="pr-4">
                          <Input value={it.reject_reason} onChange={(e) => updateReason(it.id, e.target.value)} placeholder="Reason if rejected..." className="h-8 text-xs" />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </section>
          </form>
        </div>

        <div className="absolute bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 flex justify-end gap-4 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] z-10">
          <Link href={`/inventory/operation/incoming_product/${id}`}>
            <Button variant="outline" type="button" className="border-blue-400 text-blue-500 hover:bg-blue-50">Cancel</Button>
          </Link>
          <Button type="button" disabled={isSubmitting} onClick={handleSubmit(onSave)} variant="outline" className="border-blue-400 text-blue-500 hover:bg-blue-50">Save Draft</Button>
          <Button type="button" disabled={isSubmitting} onClick={handleSubmit(onValidate)} className="bg-[#3B7CED] hover:bg-[#3065c3] text-white">Validate GRN</Button>
        </div>

        <ToastNotification message={notification.message} type={notification.type} show={notification.show} onClose={closeNotification} />
      </div>
    </PageGuard>
  );
}
