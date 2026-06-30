"use client";

import React, { useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { useForm, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ToastNotification } from "@/components/shared/ToastNotification";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { z } from "zod";
import { PageGuard } from "@/components/auth/PageGuard";

const returnSchema = z.object({
  reason_for_return: z.string().min(1, "Reason for return is required"),
  notes: z.string().optional(),
});

type ReturnFormData = z.infer<typeof returnSchema>;

interface ReturnItem {
  id: string;
  product_name: string;
  unit: string;
  received_qty: number;
  return_qty: string;
}

export default function ProcessReturnPage() {
  const params = useParams();
  const id = (params?.id as string) || "WH-IN-0001";
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [items, setItems] = useState<ReturnItem[]>([
    {
      id: "1",
      product_name: "Cement (50kg Bag)",
      unit: "Bags",
      received_qty: 500,
      return_qty: "10",
    },
  ]);

  const [notification, setNotification] = useState<{
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
    formState: { errors },
  } = useForm<ReturnFormData>({
    resolver: zodResolver(returnSchema) as Resolver<ReturnFormData>,
    defaultValues: {
      reason_for_return: "Damaged packaging discovered during offloading",
      notes: "Please arrange credit note or replacement delivery.",
    },
  });

  const updateReturnQty = (itemId: string, qty: string) => {
    setItems((prev) => prev.map((it) => (it.id === itemId ? { ...it, return_qty: qty } : it)));
  };

  async function onSubmit(data: ReturnFormData) {
    const valid = items.filter((it) => Number(it.return_qty) > 0);
    if (valid.length === 0) {
      setNotification({ message: "Please enter a return quantity greater than 0", type: "error", show: true });
      return;
    }

    for (const item of valid) {
      if (Number(item.return_qty) > item.received_qty) {
        setNotification({ message: `Cannot return more than received quantity (${item.received_qty})`, type: "error", show: true });
        return;
      }
    }

    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setNotification({ message: "Return processed! Supplier debit note generated and stock deducted.", type: "success", show: true });
      setTimeout(() => {
        router.push(`/inventory/operation/incoming_product/${id}`);
      }, 1000);
    }, 500);
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
          <h1 className="text-lg font-medium text-gray-800">Process Supplier Return for GRN: {id}</h1>
        </div>

        <div className="p-6 max-w-[1400px] mx-auto w-full flex flex-col gap-10">
          <form className="flex flex-col gap-10">
            <section>
              <h2 className="text-[#3B7CED] text-xl mb-6 font-medium">Return Details</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex flex-col gap-2">
                  <Label className="text-gray-700 font-medium">Reason for Return <span className="text-red-500">*</span></Label>
                  <Input {...register("reason_for_return")} placeholder="Reason..." className="bg-white border-gray-300 rounded" />
                  {errors.reason_for_return && <p className="text-xs text-red-500">{errors.reason_for_return.message}</p>}
                </div>
                <div className="flex flex-col gap-2">
                  <Label className="text-gray-700 font-medium">Additional Notes / Instructions</Label>
                  <Input {...register("notes")} placeholder="Notes for supplier..." className="bg-white border-gray-300 rounded" />
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-[#3B7CED] text-xl mb-6 font-medium">Products to Return</h2>
              <div className="bg-white rounded border border-gray-200 shadow-sm overflow-hidden">
                <Table className="min-w-[800px] w-full">
                  <TableHeader>
                    <TableRow className="bg-[#F8F9FA] border-b-gray-100">
                      <TableHead className="pl-4">Product Name</TableHead>
                      <TableHead className="text-center">Unit</TableHead>
                      <TableHead className="text-center">Received QTY</TableHead>
                      <TableHead className="text-center pr-4">Return QTY</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {items.map((it) => (
                      <TableRow key={it.id} className="border-b-gray-100 hover:bg-gray-50">
                        <TableCell className="pl-4 font-medium text-gray-800">{it.product_name}</TableCell>
                        <TableCell className="text-center text-xs">{it.unit}</TableCell>
                        <TableCell className="text-center font-medium">{it.received_qty}</TableCell>
                        <TableCell className="text-center pr-4">
                          <Input type="number" value={it.return_qty} onChange={(e) => updateReturnQty(it.id, e.target.value)} className="w-24 mx-auto text-center h-8 text-xs font-bold text-red-600" />
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
          <Button type="button" disabled={isSubmitting} onClick={handleSubmit(onSubmit)} className="bg-[#3B7CED] hover:bg-[#3065c3] text-white">Confirm Supplier Return</Button>
        </div>

        <ToastNotification message={notification.message} type={notification.type} show={notification.show} onClose={() => setNotification(p => ({ ...p, show: false }))} />
      </div>
    </PageGuard>
  );
}
