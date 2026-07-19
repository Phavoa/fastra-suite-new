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

export default function IncomingProductDetailPage() {
  const params = useParams();
  const id = (params?.id as string) || "WH-IN-0001";

  const dummyData = {
    incoming_product_id: id,
    receipt_type: "vendor_receipt",
    status: "validated",
    related_po: "PO-2026-0089",
    created_at: "2026-06-25 10:00 AM",
    supplier_name: "Dangote Cement Plc",
    destination_location: "Main Warehouse - Site A",
    notes: "Batch delivery verified against delivery note DN-89201.",
    has_backorder: true,
    backorder_id: "WH-IN-0001-BO",
    three_way_match_status: "FLAGGED_DISCREPANCY",
    discrepancy_details: "Quantity shortage (100 Bags short) and Unit Invoice Price variance (+₦150/bag vs PO).",
    items: [
      {
        id: "1",
        product_name: "Dangote Portland Cement Grade 42.5",
        unit_symbol: "Bags",
        po_quantity: 600,
        po_unit_price: 5500,
        received_quantity: 500,
        invoice_unit_price: 5650,
        accepted_quantity: 500,
        rejected_quantity: 0,
        match_status: "Variance Detected",
      },
      {
        id: "2",
        product_name: "Binding Wire 16 Gauge Roll",
        unit_symbol: "Rolls",
        po_quantity: 50,
        po_unit_price: 12000,
        received_quantity: 50,
        invoice_unit_price: 12000,
        accepted_quantity: 50,
        rejected_quantity: 0,
        match_status: "Verified",
      },
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
      {/* Two-tone: gray page canvas */}
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
                    Goods Receipt Note: {dummyData.incoming_product_id}
                  </h1>
                  <span
                    className={`inline-block px-3 py-1 text-xs rounded-full font-semibold capitalize ${
                      dummyData.status === "validated"
                        ? "bg-[#E2F2E9] text-[#2BA24D]"
                        : "bg-[#E8F0FE] text-[#1A73E8]"
                    }`}
                  >
                    {dummyData.status}
                  </span>
                  {dummyData.has_backorder && (
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
                    <Edit className="w-4 h-4 mr-1.5" /> Edit GRN Draft
                  </Button>
                </Link>
              )}
              {dummyData.status === "validated" && (
                <Link href={`/inventory/operation/incoming_product/return/${id}`}>
                  <Button variant="outline" className="border-red-300 text-[#E43D2B] hover:bg-red-50 h-9 px-4 rounded-md font-medium text-sm transition-all">
                    <RotateCcw className="w-4 h-4 mr-1.5" /> Process Supplier Return
                  </Button>
                </Link>
              )}
            </div>
          </div>

          {/* 3-Way Match Audit Banner */}
          {dummyData.three_way_match_status && (
            <div className="p-4 rounded-lg border bg-amber-50/80 border-amber-300 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-2xs">
              <div className="flex items-center gap-3">
                <div className="px-2.5 py-1 bg-amber-100 text-amber-900 rounded-full font-bold text-[11px] tracking-wide shrink-0">
                  3-WAY MATCH AUDIT
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-[#32325D]">
                    Discrepancy Flagged: {dummyData.discrepancy_details}
                  </h4>
                  <p className="text-xs text-[#525F7F] mt-0.5">
                    Automated comparison between Purchase Order ({dummyData.related_po}), Supplier Delivery Note, and Physical Received Stock.
                  </p>
                </div>
              </div>
              <span className="px-3 py-1 bg-[#FCE8E6] text-[#E43D2B] font-semibold text-xs rounded-full border border-[#E43D2B]/20 capitalize self-start sm:self-auto">
                {dummyData.three_way_match_status.replace(/_/g, " ").toLowerCase()}
              </span>
            </div>
          )}

          {/* Summary Metadata Card */}
          <div className="bg-white rounded-lg shadow-2xs border border-gray-100 p-6">
            <h2 className="text-base font-semibold text-[#32325D] mb-4 pb-3 border-b border-gray-100">
              Receipt Summary Details
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
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
              <div className="sm:col-span-2 lg:col-span-4 border-t border-gray-100 pt-4">
                <span className="font-semibold text-[#8898AA] text-[11.5px] block mb-1">
                  Inspection Notes
                </span>
                <span className="text-[#525F7F] font-normal text-sm">{dummyData.notes}</span>
              </div>
            </div>
          </div>

          {/* Line Items Table Card */}
          <div className="bg-white rounded-lg shadow-2xs border border-gray-100 overflow-hidden">
            <div className="p-5 border-b border-gray-100">
              <h2 className="text-base font-semibold text-[#32325D]">
                Received Product Lines & 3-Way Match Verification
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
                      Unit
                    </TableHead>
                    <TableHead className="font-semibold text-[#8898AA] text-[11.5px] py-3.5 px-6 whitespace-nowrap text-center">
                      PO Qty
                    </TableHead>
                    <TableHead className="font-semibold text-[#8898AA] text-[11.5px] py-3.5 px-6 whitespace-nowrap text-center">
                      Received Qty
                    </TableHead>
                    <TableHead className="font-semibold text-[#8898AA] text-[11.5px] py-3.5 px-6 whitespace-nowrap text-right">
                      PO Unit Price
                    </TableHead>
                    <TableHead className="font-semibold text-[#8898AA] text-[11.5px] py-3.5 px-6 whitespace-nowrap text-right">
                      Invoice Unit Price
                    </TableHead>
                    <TableHead className="font-semibold text-[#8898AA] text-[11.5px] py-3.5 px-6 whitespace-nowrap text-center">
                      Accepted Qty
                    </TableHead>
                    <TableHead className="font-semibold text-[#8898AA] text-[11.5px] py-3.5 px-6 whitespace-nowrap text-center">
                      3-Way Match Status
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
                        {item.po_quantity}
                      </TableCell>
                      <TableCell className="text-[#32325D] font-semibold text-sm py-3.5 px-6 whitespace-nowrap text-center">
                        {item.received_quantity}
                      </TableCell>
                      <TableCell className="text-[#525F7F] font-mono text-sm py-3.5 px-6 whitespace-nowrap text-right">
                        ₦{item.po_unit_price.toLocaleString()}
                      </TableCell>
                      <TableCell
                        className={`font-mono font-semibold text-sm py-3.5 px-6 whitespace-nowrap text-right ${
                          item.invoice_unit_price !== item.po_unit_price
                            ? "text-[#E43D2B]"
                            : "text-[#32325D]"
                        }`}
                      >
                        ₦{item.invoice_unit_price.toLocaleString()}
                      </TableCell>
                      <TableCell className="text-[#2BA24D] font-bold text-sm py-3.5 px-6 whitespace-nowrap text-center">
                        {item.accepted_quantity}
                      </TableCell>
                      <TableCell className="py-3.5 px-6 whitespace-nowrap text-center">
                        <span
                          className={`inline-block px-3 py-1 text-xs rounded-full font-semibold ${
                            item.match_status === "Verified"
                              ? "bg-[#E2F2E9] text-[#2BA24D]"
                              : "bg-[#FCE8E6] text-[#E43D2B]"
                          }`}
                        >
                          {item.match_status}
                        </span>
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
