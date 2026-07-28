"use client";

import React from "react";
import { useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Edit, RotateCcw, Package } from "lucide-react";
import Link from "next/link";
import { PageGuard } from "@/components/auth/PageGuard";
import Breadcrumbs from "@/components/shared/BreadScrumbs";
import { AutoSaveIcon } from "@/components/shared/icons";
import { BreadcrumbItem } from "@/types/purchase";

const DUMMY_DATA_LIST = [
  {
    incoming_product_id: "WH-IN-0001",
    receipt_type: "vendor_receipt",
    status: "validated",
    related_po: "PO-2026-0089",
    created_at: "2026-06-25 10:00 AM",
    supplier_name: "Dangote Cement Plc",
    destination_location: "Main Warehouse - Site A",
    has_backorder: true,
    backorder_id: "WH-IN-0001-BO",
    items: [
      {
        id: "1",
        product_name: "Dangote Portland Cement Grade 42.5",
        unit_symbol: "Bags",
        expected_quantity: 600,
        received_quantity: 500,
      },
      {
        id: "2",
        product_name: "Binding Wire 16 Gauge Roll",
        unit_symbol: "Rolls",
        expected_quantity: 50,
        received_quantity: 50,
      },
    ],
  },
  {
    incoming_product_id: "WH-IN-0002",
    receipt_type: "vendor_receipt",
    status: "draft",
    related_po: "PO-2026-0094",
    created_at: "2026-06-28 09:30 AM",
    supplier_name: "Julius Berger Steel",
    destination_location: "Main Warehouse - Site A",
    has_backorder: false,
    items: [
      {
        id: "1",
        product_name: "Iron Rods 12mm",
        unit_symbol: "Tonnes",
        expected_quantity: 100,
        received_quantity: 0,
      },
    ],
  },
  {
    incoming_product_id: "WH-IN-0007",
    receipt_type: "returns",
    status: "canceled",
    related_po: "PO-2026-0055",
    created_at: "2026-07-04 11:15 AM",
    supplier_name: "Stanbic Supplies Ltd",
    destination_location: "Supplier Location",
    has_backorder: false,
    items: [
      {
        id: "1",
        product_name: "Office Chairs",
        unit_symbol: "Pieces",
        expected_quantity: 10,
        received_quantity: 0,
      },
    ],
  },
];

export default function IncomingProductDetailPage() {
  const params = useParams();
  const id = (params?.id as string) || "WH-IN-0001";

  const dummyData = DUMMY_DATA_LIST.find((d) => d.incoming_product_id === id) || {
    incoming_product_id: id,
    receipt_type: "vendor_receipt",
    status: "draft",
    related_po: "PO-2026-0999",
    created_at: "2026-07-28 08:00 AM",
    supplier_name: "Generic Supplier",
    destination_location: "Main Warehouse - Site A",
    has_backorder: false,
    items: [
      {
        id: "1",
        product_name: "Generic Item",
        unit_symbol: "Units",
        expected_quantity: 100,
        received_quantity: 0,
      }
    ],
  };

  const breadcrumbsItem: BreadcrumbItem[] = [
    { label: "Home", href: "/" },
    { label: "Inventory", href: "/inventory" },
    { label: "Operation", href: "/inventory/operation" },
    { label: `Receipt ${id}`, href: `/inventory/operation/incoming_product/${id}`, current: true },
  ];

  return (
    <PageGuard application="inventory" module="incomingproduct">
      <div className="flex flex-col flex-1 min-h-[calc(100vh-64px)] bg-[#F6F9FC] relative pb-20">
        <main className="max-w-[1400px] mx-auto px-4 sm:px-6 py-6 w-full flex flex-col gap-6">
          {/* Breadcrumbs */}
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

          {/* Top Bar Section Card */}
          <div className="bg-white rounded-lg shadow-2xs border border-gray-100 p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-lg bg-[#E8F0FE] text-[#1A73E8]">
                <Package className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-3">
                  <h1 className="text-xl font-semibold text-[#32325D]">
                    Receipt: {dummyData.incoming_product_id}
                  </h1>
                  <span
                    className={`inline-block px-3 py-1 text-xs rounded-full font-semibold capitalize ${
                      dummyData.status === "validated"
                        ? "bg-[#E2F2E9] text-[#2BA24D]"
                        : dummyData.status === "canceled"
                        ? "bg-[#FCE8E6] text-[#C5221F]"
                        : "bg-[#E8F0FE] text-[#1A73E8]"
                    }`}
                  >
                    {dummyData.status}
                  </span>
                  {dummyData.has_backorder && dummyData.backorder_id && (
                    <span className="inline-block px-3 py-1 text-xs rounded-full font-semibold bg-amber-100 text-amber-800">
                      Backorder: {dummyData.backorder_id}
                    </span>
                  )}
                </div>
                <p className="text-xs text-[#8898AA] mt-1">
                  Created on {dummyData.created_at} • Source PO:{" "}
                  <strong className="text-[#3B7CED]">{dummyData.related_po}</strong>
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 self-end sm:self-auto">
              {dummyData.status === "draft" && (
                <Link href={`/inventory/operation/incoming_product/edit/${id}`}>
                  <Button className="bg-[#3B7CED] hover:bg-[#3065c3] text-white h-9 px-4 rounded-md font-medium text-sm shadow-2xs transition-all">
                    <Edit className="w-4 h-4 mr-1.5" /> Confirm Quantities
                  </Button>
                </Link>
              )}
              {dummyData.status === "validated" && (
                <Link href={`/inventory/operation/supplier_return/new`}>
                  <Button variant="outline" className="border-red-300 text-[#E43D2B] hover:bg-red-50 h-9 px-4 rounded-md font-medium text-sm transition-all">
                    <RotateCcw className="w-4 h-4 mr-1.5" /> Return to Supplier
                  </Button>
                </Link>
              )}
            </div>
          </div>

          {/* Summary Metadata Card */}
          <div className="bg-white rounded-lg shadow-2xs border border-gray-100 p-6">
            <h2 className="text-base font-semibold text-[#32325D] mb-4 pb-3 border-b border-gray-100">
              Receipt Details
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
              <div>
                <span className="font-semibold text-[#8898AA] text-[11.5px] block mb-1">
                  Receipt ID
                </span>
                <span className="text-[#32325D] font-semibold text-sm">
                  {dummyData.incoming_product_id}
                </span>
              </div>
              <div>
                <span className="font-semibold text-[#8898AA] text-[11.5px] block mb-1">
                  Receipt Type
                </span>
                <span className="text-[#32325D] font-semibold text-sm capitalize">
                  {dummyData.receipt_type.replace(/_/g, " ")}
                </span>
              </div>
              <div>
                <span className="font-semibold text-[#8898AA] text-[11.5px] block mb-1">
                  Source Document (PO)
                </span>
                <span className="text-[#3B7CED] font-semibold text-sm">
                  {dummyData.related_po}
                </span>
              </div>
              <div>
                <span className="font-semibold text-[#8898AA] text-[11.5px] block mb-1">
                  Supplier / Vendor
                </span>
                <span className="text-[#32325D] font-semibold text-sm">
                  {dummyData.supplier_name}
                </span>
              </div>
              <div>
                <span className="font-semibold text-[#8898AA] text-[11.5px] block mb-1">
                  Destination Location
                </span>
                <span className="text-[#32325D] font-semibold text-sm">
                  {dummyData.destination_location}
                </span>
              </div>
            </div>
          </div>

          {/* Line Items Table Card */}
          <div className="bg-white rounded-lg shadow-2xs border border-gray-100 overflow-hidden">
            <div className="p-5 border-b border-gray-100">
              <h2 className="text-base font-semibold text-[#32325D]">
                Product Lines
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
                      Unit of Measure
                    </TableHead>
                    <TableHead className="font-semibold text-[#8898AA] text-[11.5px] py-3.5 px-6 whitespace-nowrap text-center">
                      Expected Quantity
                    </TableHead>
                    <TableHead className="font-semibold text-[#8898AA] text-[11.5px] py-3.5 px-6 whitespace-nowrap text-center">
                      Quantity Received
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
                        {item.unit_symbol}
                      </TableCell>
                      <TableCell className="text-[#525F7F] font-normal text-sm py-3.5 px-6 whitespace-nowrap text-center">
                        {item.expected_quantity}
                      </TableCell>
                      <TableCell className="text-[#32325D] font-semibold text-sm py-3.5 px-6 whitespace-nowrap text-center">
                        {item.received_quantity}
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
