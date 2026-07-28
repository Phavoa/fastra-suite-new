"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Trash } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { PageGuard } from "@/components/auth/PageGuard";
import Breadcrumbs from "@/components/shared/BreadScrumbs";
import { BreadcrumbItem } from "@/components/shared/types";
import { ToastNotification } from "@/components/shared/ToastNotification";

type ReturnLine = {
  id: string;
  product_description: string;
  unit_of_measure: string;
  received_quantity: number;
  return_quantity: number;
  reason: string;
};

const INITIAL_LINES: ReturnLine[] = [
  {
    id: "line-1",
    product_description: "Dangote Cement (50kg Bag)",
    unit_of_measure: "Bags",
    received_quantity: 100,
    return_quantity: 0,
    reason: "",
  },
  {
    id: "line-2",
    product_description: "Reinforcement Steel 16mm",
    unit_of_measure: "Tonnes",
    received_quantity: 20,
    return_quantity: 0,
    reason: "",
  }
];

export default function NewSupplierReturnPage() {
  const router = useRouter();
  const [items, setItems] = useState<ReturnLine[]>(INITIAL_LINES);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [notification, setNotification] = useState({ show: false, message: "", type: "success" as "success" | "error" });

  const breadcrumbsItem: BreadcrumbItem[] = [
    { label: "Home", href: "/" },
    { label: "Inventory", href: "/inventory" },
    { label: "Operation", href: "/inventory/operation" },
    { label: "Supplier Returns", href: "/inventory/operation/supplier_return" },
    { label: "New Return", href: "#", current: true },
  ];

  const updateItem = (id: string, field: keyof ReturnLine, value: any) => {
    setItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, [field]: value } : item))
    );
  };

  const removeRow = (id: string) => {
    setItems((prev) => prev.filter((item) => item.id !== id));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (items.length === 0) {
      setNotification({ show: true, message: "You must include at least one product to return.", type: "error" });
      return;
    }

    const invalidLines = items.filter(it => it.return_quantity <= 0 || it.return_quantity > it.received_quantity || !it.reason.trim());
    if (invalidLines.length > 0) {
      setNotification({ show: true, message: "Please ensure all lines have a valid return quantity (greater than 0, less than received) and a reason.", type: "error" });
      return;
    }

    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setNotification({ show: true, message: "Supplier return document generated successfully.", type: "success" });
      setTimeout(() => router.push("/inventory/operation/supplier_return"), 1500);
    }, 1000);
  };

  return (
    <PageGuard application="inventory" module="supplier_return">
      <div className="flex flex-col flex-1 min-h-[calc(100vh-64px)] bg-[#F6F9FC] relative pb-20">
        <main className="max-w-[1400px] mx-auto px-4 sm:px-6 py-6 w-full flex flex-col gap-6">
          <Breadcrumbs items={breadcrumbsItem} />

          <form onSubmit={handleSubmit} className="flex flex-col gap-8">
            <section className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
              <h2 className="text-[#3B7CED] text-xl mb-6 font-medium">Original Receipt Details</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="flex flex-col gap-2">
                  <label className="text-gray-700 font-medium text-sm">Receipt ID</label>
                  <div className="p-2.5 bg-gray-50 border border-gray-200 rounded-md text-sm text-gray-600">WH-IN-0012</div>
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-gray-700 font-medium text-sm">Vendor</label>
                  <div className="p-2.5 bg-gray-50 border border-gray-200 rounded-md text-sm text-gray-600">Dangote Cement Plc</div>
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-gray-700 font-medium text-sm">Related PO</label>
                  <div className="p-2.5 bg-gray-50 border border-gray-200 rounded-md text-sm text-gray-600">PO-2026-0089</div>
                </div>
              </div>
            </section>

            <section className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
              <div className="p-6 border-b border-gray-100">
                <h2 className="text-[#3B7CED] text-xl font-medium">Return Lines</h2>
                <p className="text-sm text-gray-500 mt-1">Remove any lines you do not wish to return. Specify the quantity and mandatory reason.</p>
              </div>
              
              <div className="overflow-x-auto">
                <Table className="min-w-[1100px] table-fixed">
                  <TableHeader className="bg-[#F6F7F8]">
                    <TableRow>
                      <TableHead className="w-80 border border-gray-200 px-4 py-3 text-left text-sm text-gray-600 font-medium">
                        Product Description
                      </TableHead>
                      <TableHead className="w-24 border border-gray-200 px-4 py-3 text-center text-sm text-gray-600 font-medium">
                        Unit
                      </TableHead>
                      <TableHead className="w-32 border border-gray-200 px-4 py-3 text-center text-sm text-gray-600 font-medium">
                        Received Qty
                      </TableHead>
                      <TableHead className="w-32 border border-gray-200 px-4 py-3 text-center text-sm text-gray-600 font-medium">
                        Return Qty
                      </TableHead>
                      <TableHead className="w-64 border border-gray-200 px-4 py-3 text-left text-sm text-gray-600 font-medium">
                        Reason for Return
                      </TableHead>
                      <TableHead className="w-16 border border-gray-200 px-4 py-3 text-center text-sm text-gray-600 font-medium">
                        Action
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody className="bg-white">
                    {items.length === 0 ? (
                       <TableRow>
                         <TableCell colSpan={6} className="text-center py-8 text-gray-500">No products selected for return.</TableCell>
                       </TableRow>
                    ) : items.map((it) => (
                      <TableRow key={it.id} className="group hover:bg-[#FBFBFB] focus-within:bg-[#FBFBFB] transition-colors duration-150">
                        <TableCell className="border border-gray-200 px-4 align-middle">
                          <div className="text-sm text-gray-600 line-clamp-2">{it.product_description}</div>
                        </TableCell>
                        <TableCell className="border border-gray-200 px-4 align-middle text-center">
                          <div className="text-sm text-gray-700">{it.unit_of_measure}</div>
                        </TableCell>
                        <TableCell className="border border-gray-200 align-middle text-center">
                          <div className="text-sm font-semibold text-gray-700">{it.received_quantity}</div>
                        </TableCell>
                        <TableCell className="border border-gray-200 align-middle text-center p-0">
                          <Input
                            type="number"
                            min={0}
                            max={it.received_quantity}
                            value={it.return_quantity || ""}
                            onChange={(e) => updateItem(it.id, "return_quantity", Number(e.target.value))}
                            className="h-11 w-full text-center rounded-none border-0 focus:ring-0 focus:ring-offset-0 bg-red-50/30 text-[#E43D2B] font-medium"
                            placeholder="0"
                          />
                        </TableCell>
                        <TableCell className="border border-gray-200 align-middle p-0">
                           <Input
                            type="text"
                            value={it.reason}
                            onChange={(e) => updateItem(it.id, "reason", e.target.value)}
                            className="h-11 w-full rounded-none border-0 focus:ring-0 focus:ring-offset-0 px-4"
                            placeholder="Mandatory reason..."
                          />
                        </TableCell>
                        <TableCell className="border border-gray-200 px-4 align-middle text-center">
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() => removeRow(it.id)}
                            className="h-8 w-8 text-gray-400 hover:text-[#E43D2B] hover:bg-red-50 mx-auto"
                            title="Remove line from return"
                          >
                            <Trash className="w-4 h-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </section>
          </form>
        </main>

        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 flex justify-end gap-3 shadow-lg z-30">
          <Button variant="outline" type="button" onClick={() => router.back()} className="border-blue-400 text-blue-500 hover:bg-blue-50">
            Cancel
          </Button>
          <Button
            type="button"
            disabled={isSubmitting}
            onClick={handleSubmit}
            className="bg-[#3B7CED] hover:bg-[#3065c3] text-white"
          >
            {isSubmitting ? "Validating..." : "Confirm Return"}
          </Button>
        </div>

        <ToastNotification message={notification.message} type={notification.type as any} show={notification.show} onClose={() => setNotification(p => ({...p, show: false}))} />
      </div>
    </PageGuard>
  );
}
