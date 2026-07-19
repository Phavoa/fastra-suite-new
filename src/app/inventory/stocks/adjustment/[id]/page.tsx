"use client";

import React from "react";
import { useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Edit } from "lucide-react";
import Link from "next/link";
import { PageGuard } from "@/components/auth/PageGuard";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export default function StockAdjustmentDetailPage() {
  const params = useParams();
  const id = (params?.id as string) || "WH-MAIN-ADJ-0001";

  const dummyData = {
    id: id,
    adjustment_type: "Stock Level Update",
    warehouse_location: "Main Warehouse - Site A (WH-MAIN)",
    date: "2026-06-28",
    status: "done",
    notes: "Annual physical inventory audit discrepancy resolution.",
    created_by: "Administrator",
    items: [
      {
        id: "1",
        product_name: "Cement (50kg Bag)",
        product_description: "Portland Cement Grade 42.5",
        unit_symbol: "Bags",
        current_quantity: 505,
        adjusted_quantity: 500,
        variance: -5,
      },
      {
        id: "2",
        product_name: "Reinforcement Steel 16mm",
        product_description: "High Yield Deformed Steel Bars",
        unit_symbol: "Tonnes",
        current_quantity: 138,
        adjusted_quantity: 150,
        variance: 12,
      },
    ],
  };

  return (
    <PageGuard application="inventory" module="stockadjustment">
      <div className="flex flex-col flex-1 min-h-[calc(100vh-64px)] bg-[#F6F9FC] relative pb-20">
        {/* Clean Header Card */}
        <div className="flex items-center justify-between px-6 py-4 bg-white border-b border-gray-100 shadow-2xs">
          <div className="flex items-center gap-3">
            <Link href="/inventory/stocks/adjustment">
              <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-400 hover:text-[#32325D]">
                <ArrowLeft className="h-4 w-4" />
              </Button>
            </Link>
            <div>
              <div className="flex items-center gap-2.5">
                <h1 className="text-lg font-semibold text-[#32325D]">Stock Adjustment: {dummyData.id}</h1>
                <span className={`inline-flex items-center px-2 py-0.5 text-xs rounded-md font-semibold ${dummyData.status === "done" ? "bg-green-50 text-green-700 border border-green-200/60" : "bg-blue-50 text-blue-700 border border-blue-200/60"}`}>
                  {dummyData.status === "done" ? "Done" : "Draft"}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {dummyData.status === "draft" && (
              <Link href={`/inventory/stocks/adjustment/edit/${id}`}>
                <Button className="bg-[#3B7CED] hover:bg-[#3065c3] text-white text-sm font-semibold h-9 px-4 shadow-2xs">
                  <Edit className="w-3.5 h-3.5 mr-1.5" /> Edit Draft
                </Button>
              </Link>
            )}
          </div>
        </div>

        {/* Details Content */}
        <main className="p-6 max-w-[1400px] mx-auto w-full flex flex-col gap-6">
          
          {/* White Container Card 1: General Information */}
          <div className="bg-white rounded-lg shadow-2xs border border-gray-100 overflow-hidden">
            <div className="p-5 border-b border-gray-100">
              <h2 className="text-base font-semibold text-[#32325D]">General Information</h2>
            </div>
            <div className="p-6 grid grid-cols-1 md:grid-cols-4 gap-6">
              <div>
                <span className="text-xs font-semibold text-[#8898AA] block mb-1">Adjustment ID</span>
                <span className="text-sm font-semibold text-[#32325D]">{dummyData.id}</span>
              </div>
              <div>
                <span className="text-xs font-semibold text-[#8898AA] block mb-1">Adjustment Type</span>
                <span className="text-sm font-semibold text-[#32325D]">{dummyData.adjustment_type}</span>
              </div>
              <div>
                <span className="text-xs font-semibold text-[#8898AA] block mb-1">Location</span>
                <span className="text-sm font-semibold text-[#32325D]">{dummyData.warehouse_location}</span>
              </div>
              <div>
                <span className="text-xs font-semibold text-[#8898AA] block mb-1">Date</span>
                <span className="text-sm font-semibold text-[#32325D]">{dummyData.date}</span>
              </div>
              <div className="md:col-span-4 border-t border-gray-100 pt-4 mt-2">
                <span className="text-xs font-semibold text-[#8898AA] block mb-1">Mandatory Reason / Notes</span>
                <span className="text-sm text-[#525F7F]">{dummyData.notes}</span>
              </div>
            </div>
          </div>

          {/* White Container Card 2: Adjusted Product Lines */}
          <div className="bg-white rounded-lg shadow-2xs border border-gray-100 overflow-hidden">
            <div className="p-5 border-b border-gray-100">
              <h2 className="text-base font-semibold text-[#32325D]">Adjusted Product Lines</h2>
            </div>
            <div className="overflow-x-auto w-full">
              <Table className="min-w-[900px] w-full">
                <TableHeader>
                  <TableRow className="bg-[#F6F9FC] hover:bg-[#F6F9FC] border-b border-gray-100">
                    <TableHead className="py-3.5 px-6 font-semibold text-[#8898AA] text-[11.5px] whitespace-nowrap w-64">Product Name</TableHead>
                    <TableHead className="py-3.5 px-6 font-semibold text-[#8898AA] text-[11.5px] whitespace-nowrap">Description</TableHead>
                    <TableHead className="py-3.5 px-6 font-semibold text-[#8898AA] text-[11.5px] whitespace-nowrap text-center w-24">Unit</TableHead>
                    <TableHead className="py-3.5 px-6 font-semibold text-[#8898AA] text-[11.5px] whitespace-nowrap text-center w-36">Previous System Qty</TableHead>
                    <TableHead className="py-3.5 px-6 font-semibold text-[#8898AA] text-[11.5px] whitespace-nowrap text-center w-36">New Actual Count</TableHead>
                    <TableHead className="py-3.5 pr-6 font-semibold text-[#8898AA] text-[11.5px] whitespace-nowrap text-right w-32">Variance</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {dummyData.items.map((item) => (
                    <TableRow key={item.id} className="hover:bg-gray-50 border-b border-gray-100 transition-colors">
                      <TableCell className="px-6 py-3.5 font-semibold text-sm text-[#32325D]">{item.product_name}</TableCell>
                      <TableCell className="px-6 py-3.5 text-sm text-[#525F7F]">{item.product_description}</TableCell>
                      <TableCell className="px-6 py-3.5 text-center text-sm font-medium text-[#525F7F]">{item.unit_symbol}</TableCell>
                      <TableCell className="px-6 py-3.5 text-center font-mono font-semibold text-sm text-[#32325D]">{item.current_quantity}</TableCell>
                      <TableCell className="px-6 py-3.5 text-center font-mono font-bold text-sm text-[#3B7CED]">{item.adjusted_quantity}</TableCell>
                      <TableCell className={`pr-6 py-3.5 text-right font-mono font-bold text-sm ${item.variance < 0 ? "text-[#E43D2B]" : item.variance > 0 ? "text-[#2BA24D]" : "text-[#525F7F]"}`}>
                        {item.variance > 0 ? `+${item.variance}` : item.variance}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>

        </main>
      </div>
    </PageGuard>
  );
}
