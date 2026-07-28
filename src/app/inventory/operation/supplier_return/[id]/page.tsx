"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
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

export default function SupplierReturnDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [notification, setNotification] = useState({ show: false, message: "", type: "success" as const });

  // In reality, fetch this based on params.id
  const isDraft = params.id.includes("0002"); // mock condition for draft

  const breadcrumbsItem: BreadcrumbItem[] = [
    { label: "Home", href: "/" },
    { label: "Inventory", href: "/inventory" },
    { label: "Operation", href: "/inventory/operation" },
    { label: "Supplier Returns", href: "/inventory/operation/supplier_return" },
    { label: params.id, href: "#", current: true },
  ];

  const handleValidate = async () => {
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setNotification({ show: true, message: "Supplier return validated and stock deducted.", type: "success" });
      setTimeout(() => router.push("/inventory/operation/supplier_return"), 1500);
    }, 1000);
  };

  return (
    <PageGuard application="inventory" module="supplier_return">
      <div className="flex flex-col flex-1 min-h-[calc(100vh-64px)] bg-[#F6F9FC] relative pb-20">
        <main className="max-w-[1400px] mx-auto px-4 sm:px-6 py-6 w-full flex flex-col gap-6">
          <div className="flex items-center justify-between">
            <Breadcrumbs items={breadcrumbsItem} />
            <div className={`px-4 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wider ${isDraft ? 'bg-[#E8F0FE] text-[#1A73E8]' : 'bg-[#E2F2E9] text-[#2BA24D]'}`}>
              {isDraft ? 'Draft' : 'Validated'}
            </div>
          </div>

          <div className="flex flex-col gap-8">
            <section className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
              <h2 className="text-[#3B7CED] text-xl mb-6 font-medium">Return Details</h2>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                 <div className="flex flex-col gap-2">
                  <label className="text-gray-700 font-medium text-sm">Return ID</label>
                  <div className="text-sm font-semibold text-gray-800">{params.id}</div>
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-gray-700 font-medium text-sm">Receipt ID</label>
                  <div className="text-sm font-semibold text-[#3B7CED]">WH-IN-0012</div>
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-gray-700 font-medium text-sm">Vendor</label>
                  <div className="text-sm font-semibold text-gray-800">Dangote Cement Plc</div>
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-gray-700 font-medium text-sm">Date</label>
                  <div className="text-sm text-gray-800">2026-07-28</div>
                </div>
              </div>
            </section>

            <section className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
              <div className="p-6 border-b border-gray-100">
                <h2 className="text-[#3B7CED] text-xl font-medium">Returned Lines</h2>
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
                        Return Qty
                      </TableHead>
                      <TableHead className="w-64 border border-gray-200 px-4 py-3 text-left text-sm text-gray-600 font-medium">
                        Reason for Return
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody className="bg-white">
                      <TableRow className="group hover:bg-[#FBFBFB] focus-within:bg-[#FBFBFB] transition-colors duration-150">
                        <TableCell className="border border-gray-200 px-4 align-middle">
                          <div className="text-sm text-gray-800 font-medium line-clamp-2">Dangote Cement (50kg Bag)</div>
                        </TableCell>
                        <TableCell className="border border-gray-200 px-4 align-middle text-center">
                          <div className="text-sm text-gray-700">Bags</div>
                        </TableCell>
                        <TableCell className="border border-gray-200 align-middle text-center">
                          <div className="text-sm font-bold text-[#E43D2B]">5</div>
                        </TableCell>
                        <TableCell className="border border-gray-200 px-4 align-middle">
                          <div className="text-sm text-gray-700">Bags were torn and leaking upon inspection</div>
                        </TableCell>
                      </TableRow>
                  </TableBody>
                </Table>
              </div>
            </section>
          </div>
        </main>

        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 flex justify-end gap-3 shadow-lg z-30">
          <Button variant="outline" type="button" onClick={() => router.back()} className="border-blue-400 text-blue-500 hover:bg-blue-50">
            {isDraft ? "Cancel" : "Back"}
          </Button>
          {isDraft && (
             <Button
                type="button"
                disabled={isSubmitting}
                onClick={handleValidate}
                className="bg-[#3B7CED] hover:bg-[#3065c3] text-white"
            >
                {isSubmitting ? "Validating..." : "Validate Return"}
            </Button>
          )}
        </div>

        <ToastNotification message={notification.message} type={notification.type as any} show={notification.show} onClose={() => setNotification(p => ({...p, show: false}))} />
      </div>
    </PageGuard>
  );
}
