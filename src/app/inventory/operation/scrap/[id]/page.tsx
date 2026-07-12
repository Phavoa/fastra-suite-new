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

export default function ScrapDetailPage() {
  const params = useParams();
  const id = (params?.id as string) || "WH-MAIN-SCRAP-0001";

  const dummyData = {
    id: id,
    cause: "Damage / Spoilage",
    warehouse_location: "Main Warehouse - Site A (WH-MAIN)",
    date: "2026-06-28",
    status: "done",
    notes: "Bags punctured by forklift during offloading operations.",
    recorded_by: "Site Storekeeper",
    items: [
      {
        id: "1",
        product_name: "Cement (50kg Bag)",
        product_description: "Portland Cement Grade 42.5",
        unit_symbol: "Bags",
        quantity: 5,
      },
    ],
  };

  return (
    <PageGuard application="inventory" module="scrap">
      <div className="flex flex-col flex-1 min-h-[calc(100vh-64px)] bg-white relative pb-20">
        {/* Clean Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div className="flex items-center">
            <Link href="/inventory/operation/scrap">
              <Button variant="ghost" size="icon" className="mr-2">
                <ArrowLeft className="h-5 w-5 text-gray-500" />
              </Button>
            </Link>
            <div>
              <h1 className="text-lg font-medium text-gray-800">Scrap Record Details: {dummyData.id}</h1>
              <span className={`inline-block px-2 py-0.5 text-[11px] rounded font-medium mt-1 ${dummyData.status === "done" ? "bg-green-100 text-green-700" : "bg-blue-100 text-blue-700"}`}>
                {dummyData.status.toUpperCase()}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {dummyData.status === "draft" && (
              <Link href={`/inventory/operation/scrap/edit/${id}`}>
                <Button className="bg-[#3B7CED] hover:bg-[#3065c3] text-white text-xs h-9">
                  <Edit className="w-3.5 h-3.5 mr-1.5" /> Edit Draft
                </Button>
              </Link>
            )}
          </div>
        </div>

        {/* Details Content */}
        <div className="p-6 max-w-[1400px] mx-auto w-full flex flex-col gap-10">
          <section>
            <h2 className="text-[#3B7CED] text-xl mb-6 font-medium">Scrap Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 bg-gray-50 p-6 rounded border border-gray-200">
              <div>
                <span className="text-xs text-gray-400 block mb-1">Scrap ID</span>
                <span className="text-sm font-semibold text-gray-800">{dummyData.id}</span>
              </div>
              <div>
                <span className="text-xs text-gray-400 block mb-1">Cause of Loss</span>
                <span className="text-sm font-semibold text-red-600">{dummyData.cause}</span>
              </div>
              <div>
                <span className="text-xs text-gray-400 block mb-1">Location</span>
                <span className="text-sm font-semibold text-gray-800">{dummyData.warehouse_location}</span>
              </div>
              <div>
                <span className="text-xs text-gray-400 block mb-1">Date Recorded</span>
                <span className="text-sm font-semibold text-gray-800">{dummyData.date}</span>
              </div>
              <div className="md:col-span-4 border-t border-gray-200 pt-4 mt-2">
                <span className="text-xs text-gray-400 block mb-1">Explanation / Notes</span>
                <span className="text-sm text-gray-700">{dummyData.notes}</span>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-[#3B7CED] text-xl mb-6 font-medium">Scrapped Product Lines</h2>
            <div className="bg-white rounded border border-gray-200 shadow-sm overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="bg-[#F8F9FA] border-b-gray-100">
                    <TableHead className="pl-4">Product Name</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead className="text-center">Unit</TableHead>
                    <TableHead className="text-center pr-4">Scrapped QTY</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {dummyData.items.map((item) => (
                    <TableRow key={item.id} className="border-b-gray-100 hover:bg-gray-50">
                      <TableCell className="pl-4 font-medium text-gray-800">{item.product_name}</TableCell>
                      <TableCell className="text-gray-600 text-xs">{item.product_description}</TableCell>
                      <TableCell className="text-center text-xs">{item.unit_symbol}</TableCell>
                      <TableCell className="text-center pr-4 font-bold text-red-600">-{item.quantity}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </section>
        </div>
      </div>
    </PageGuard>
  );
}
