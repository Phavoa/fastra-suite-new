"use client";

import React, { useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { useForm, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ToastNotification } from "@/components/shared/ToastNotification";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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

interface GRNLineItem {
  id: string;
  product: string;
  product_description: string;
  unit_of_measure: string;
  expected_quantity: string;
  received_quantity: string;
}

const grnSchema = z.object({
  notes: z.string().optional(),
});

type GRNFormData = z.infer<typeof grnSchema>;

const DUMMY_PRODUCTS = [
  { id: "1", product_name: "Iron Rods 12mm", unit_symbol: "Tonnes" },
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
      product_description: "Iron Rods 12mm",
      unit_of_measure: "Tonnes",
      expected_quantity: "100",
      received_quantity: "0",
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
    formState: { errors },
  } = useForm<GRNFormData>({
    resolver: zodResolver(grnSchema) as Resolver<GRNFormData>,
    defaultValues: {
      notes: "Delivery note details...",
    },
  });

  const updateItemQty = (itemId: string, val: string) => {
    setItems((prev) =>
      prev.map((it) => {
        if (it.id !== itemId) return it;
        return { ...it, received_quantity: val };
      })
    );
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
    // Check for backorder if received < expected
    const hasBackorder = items.some(
      (it) => Number(it.received_quantity) < Number(it.expected_quantity)
    );

    if (hasBackorder) {
       // Ideally we'd show a modal here, but for dummy just notify
       setNotification({
        message: "Received less than expected. Backorder created. Validated!",
        type: "success",
        show: true,
      });
    } else {
      setNotification({
        message: "GRN Validated! Stock received into Inventory Ledger.",
        type: "success",
        show: true,
      });
    }

    setTimeout(() => {
      setIsSubmitting(false);
      router.push(`/inventory/operation/incoming_product/${id}`);
    }, 1500);
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
          <h1 className="text-lg font-medium text-gray-800">Confirm Quantities for Draft: {id}</h1>
        </div>

        <div className="p-6 max-w-[1400px] mx-auto w-full flex flex-col gap-10">
          <form className="flex flex-col gap-10">
            <section>
              <h2 className="text-[#3B7CED] text-xl mb-6 font-medium">Receipt Details</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="flex flex-col gap-2">
                  <Label className="text-gray-700 font-medium">Related PO</Label>
                  <div className="p-2 bg-gray-50 border border-gray-200 rounded text-sm text-gray-600">
                    PO-2026-0094
                  </div>
                </div>

                <div className="flex flex-col gap-2">
                  <Label className="text-gray-700 font-medium">Supplier / Vendor</Label>
                  {/* Pre-filled from PO - not editable */}
                  <div className="p-2 bg-gray-50 border border-gray-200 rounded text-sm text-gray-600">
                    Julius Berger Steel
                  </div>
                </div>

                <div className="flex flex-col gap-2">
                  <Label className="text-gray-700 font-medium">Destination Location</Label>
                  {/* Auto-filled with stockkeeper's assigned location - not editable */}
                  <div className="p-2 bg-gray-50 border border-gray-200 rounded text-sm text-gray-600">
                    Main Warehouse - Site A
                  </div>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-[#3B7CED] text-xl mb-6 font-medium">Product Lines</h2>
              <div className="overflow-x-auto">
                <Table className="min-w-[1100px] table-fixed">
                  <TableHeader className="bg-[#F6F7F8]">
                    <TableRow>
                      <TableHead className="w-80 border border-gray-200 px-4 py-3 text-left text-sm text-gray-600 font-medium">
                        Product
                      </TableHead>
                      <TableHead className="w-32 border border-gray-200 px-4 py-3 text-center text-sm text-gray-600 font-medium">
                        Unit
                      </TableHead>
                      <TableHead className="w-32 border border-gray-200 px-4 py-3 text-center text-sm text-gray-600 font-medium">
                        Expected Qty (PO)
                      </TableHead>
                      <TableHead className="w-32 border border-gray-200 px-4 py-3 text-center text-sm text-gray-600 font-medium">
                        Received Qty
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody className="bg-white">
                    {items.map((it) => (
                      <TableRow key={it.id} className="group hover:bg-[#FBFBFB] focus-within:bg-[#FBFBFB] transition-colors duration-150">
                        <TableCell className="border border-gray-200 px-4 align-middle">
                          <div className="text-sm text-gray-600 line-clamp-2">
                            {it.product_description}
                          </div>
                        </TableCell>
                        <TableCell className="border border-gray-200 px-4 align-middle text-center">
                          <div className="text-sm text-gray-700">
                            {it.unit_of_measure}
                          </div>
                        </TableCell>
                        <TableCell className="border border-gray-200 align-middle text-center">
                          <div className="text-sm font-semibold text-gray-700">
                            {it.expected_quantity}
                          </div>
                        </TableCell>
                        <TableCell className="border border-gray-200 align-middle text-center p-0">
                          <Input
                            type="number"
                            value={it.received_quantity}
                            onChange={(e) => updateItemQty(it.id, e.target.value)}
                            className="h-11 w-full text-center rounded-none border-0 focus:ring-0 focus:ring-offset-0 bg-blue-50/30 text-[#3B7CED] font-medium"
                          />
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
          <Button type="button" disabled={isSubmitting} onClick={handleSubmit(onValidate)} className="bg-[#3B7CED] hover:bg-[#3065c3] text-white">Validate</Button>
        </div>

        <ToastNotification message={notification.message} type={notification.type} show={notification.show} onClose={closeNotification} />
      </div>
    </PageGuard>
  );
}
