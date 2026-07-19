"use client";

import React from "react";
import { useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Edit, Trash2 } from "lucide-react";
import Link from "next/link";
import { PageGuard } from "@/components/auth/PageGuard";
import Breadcrumbs from "@/components/shared/BreadScrumbs";
import { AutoSaveIcon } from "@/components/shared/icons";
import { BreadcrumbItem } from "@/types/purchase";
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
  const id = (params?.id as string) || "WH-SCRAP-0001";

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
        product_name: "Dangote Cement (50kg Bag)",
        product_description: "Portland Cement Grade 42.5",
        unit_symbol: "Bags",
        quantity: 5,
      },
    ],
  };

  const breadcrumbsItem: BreadcrumbItem[] = [
    { label: "Home", href: "/" },
    { label: "Inventory", href: "/inventory" },
    { label: "Operation", href: "/inventory/operation" },
    { label: "Scrap Recording", href: "/inventory/operation/scrap" },
    { label: `Scrap ${id}`, href: `/inventory/operation/scrap/${id}`, current: true },
  ];

  return (
    <PageGuard application="inventory" module="scrap">
      {/* Two-tone: gray page canvas */}
      <div className="flex flex-col flex-1 min-h-[calc(100vh-64px)] bg-[#F6F9FC] relative pb-20">
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
                <div className="flex items-center gap-3">
                  <h1 className="text-xl font-semibold text-[#32325D]">
                    Scrap Record Details: {dummyData.id}
                  </h1>
                  <span
                    className={`inline-block px-3 py-1 text-xs rounded-full font-semibold capitalize ${
                      dummyData.status === "done"
                        ? "bg-[#E2F2E9] text-[#2BA24D]"
                        : "bg-[#E8F0FE] text-[#1A73E8]"
                    }`}
                  >
                    {dummyData.status === "done" ? "Validated" : dummyData.status}
                  </span>
                </div>
                <p className="text-xs text-[#8898AA] mt-1">
                  Recorded on {dummyData.date} by <strong className="text-[#32325D]">{dummyData.recorded_by}</strong>
                </p>
              </div>
            </div>

            {dummyData.status === "draft" && (
              <Link href={`/inventory/operation/scrap/edit/${id}`}>
                <Button className="bg-[#3B7CED] hover:bg-[#3065c3] text-white h-9 px-4 rounded-md font-medium text-sm shadow-2xs transition-all">
                  <Edit className="w-4 h-4 mr-1.5" /> Edit Draft
                </Button>
              </Link>
            )}
          </div>

          {/* Summary Metadata Card */}
          <div className="bg-white rounded-lg shadow-2xs border border-gray-100 p-6">
            <h2 className="text-base font-semibold text-[#32325D] mb-4 pb-3 border-b border-gray-100">
              Scrap Information
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              <div>
                <span className="font-semibold text-[#8898AA] text-[11.5px] block mb-1">
                  Scrap ID
                </span>
                <span className="text-[#32325D] font-semibold text-sm">
                  {dummyData.id}
                </span>
              </div>
              <div>
                <span className="font-semibold text-[#8898AA] text-[11.5px] block mb-1">
                  Cause of Loss
                </span>
                <span className="text-[#E43D2B] font-semibold text-sm">
                  {dummyData.cause}
                </span>
              </div>
              <div>
                <span className="font-semibold text-[#8898AA] text-[11.5px] block mb-1">
                  Location
                </span>
                <span className="text-[#32325D] font-semibold text-sm">
                  {dummyData.warehouse_location}
                </span>
              </div>
              <div>
                <span className="font-semibold text-[#8898AA] text-[11.5px] block mb-1">
                  Date Recorded
                </span>
                <span className="text-[#32325D] font-semibold text-sm">
                  {dummyData.date}
                </span>
              </div>
              <div className="sm:col-span-2 lg:col-span-4 border-t border-gray-100 pt-4">
                <span className="font-semibold text-[#8898AA] text-[11.5px] block mb-1">
                  Explanation / Notes
                </span>
                <span className="text-[#525F7F] font-normal text-sm">{dummyData.notes}</span>
              </div>
            </div>
          </div>

          {/* Scrapped Product Lines Card */}
          <div className="bg-white rounded-lg shadow-2xs border border-gray-100 overflow-hidden">
            <div className="p-5 border-b border-gray-100">
              <h2 className="text-base font-semibold text-[#32325D]">
                Scrapped Product Lines
              </h2>
            </div>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-[#F6F9FC] hover:bg-[#F6F9FC] border-b border-gray-100">
                    <TableHead className="font-semibold text-[#8898AA] text-[11.5px] py-3.5 px-6 whitespace-nowrap">
                      Product Name
                    </TableHead>
                    <TableHead className="font-semibold text-[#8898AA] text-[11.5px] py-3.5 px-6 whitespace-nowrap">
                      Description
                    </TableHead>
                    <TableHead className="font-semibold text-[#8898AA] text-[11.5px] py-3.5 px-6 whitespace-nowrap text-center">
                      Unit
                    </TableHead>
                    <TableHead className="font-semibold text-[#8898AA] text-[11.5px] py-3.5 px-6 whitespace-nowrap text-right">
                      Scrapped Qty
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {dummyData.items.map((item) => (
                    <TableRow
                      key={item.id}
                      className="hover:bg-gray-50/50 border-b border-[#E9ECEF] transition-colors"
                    >
                      <TableCell className="text-[#32325D] font-semibold text-sm py-3.5 px-6 whitespace-nowrap">
                        {item.product_name}
                      </TableCell>
                      <TableCell className="text-[#525F7F] font-normal text-sm py-3.5 px-6 whitespace-nowrap">
                        {item.product_description}
                      </TableCell>
                      <TableCell className="text-[#525F7F] font-normal text-sm py-3.5 px-6 whitespace-nowrap text-center">
                        {item.unit_symbol}
                      </TableCell>
                      <TableCell className="text-[#E43D2B] font-mono font-bold text-sm py-3.5 px-6 whitespace-nowrap text-right">
                        -{item.quantity}
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
