"use client";

import React from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ArrowLeft, Edit, RotateCcw } from "lucide-react";
import Link from "next/link";
import { PageGuard } from "@/components/auth/PageGuard";

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
        product_name: "Cement (50kg Bag)",
        product_description: "Portland Cement Grade 42.5",
        unit_symbol: "Bags",
        po_quantity: 600,
        po_unit_price: 5500,
        received_quantity: 500,
        invoice_unit_price: 5650,
        accepted_quantity: 500,
        rejected_quantity: 0,
        reject_reason: "",
        match_status: "Variance Detected",
      },
    ],
  };

  return (
    <PageGuard application="inventory" module="incomingproduct">
      <div className="flex flex-col flex-1 min-h-[calc(100vh-64px)] bg-white relative pb-20">
        {/* Clean Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div className="flex items-center">
            <Link href="/inventory/operation">
              <Button variant="ghost" size="icon" className="mr-2">
                <ArrowLeft className="h-5 w-5 text-gray-500" />
              </Button>
            </Link>
            <div>
              <h1 className="text-lg font-medium text-gray-800">Goods Receipt Note (GRN): {dummyData.incoming_product_id}</h1>
              <div className="flex items-center gap-2 mt-1">
                <span className={`inline-block px-2 py-0.5 text-[11px] rounded font-medium ${dummyData.status === "validated" ? "bg-green-100 text-green-700" : "bg-blue-100 text-blue-700"}`}>
                  {dummyData.status.toUpperCase()}
                </span>
                {dummyData.has_backorder && (
                  <span className="inline-block px-2 py-0.5 text-[11px] rounded font-medium bg-amber-100 text-amber-800">
                    Backorder Created: {dummyData.backorder_id}
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {dummyData.status === "draft" && (
              <Link href={`/inventory/operation/incoming_product/edit/${id}`}>
                <Button className="bg-[#3B7CED] hover:bg-[#3065c3] text-white text-xs h-9">
                  <Edit className="w-3.5 h-3.5 mr-1.5" /> Edit GRN Draft
                </Button>
              </Link>
            )}
            {dummyData.status === "validated" && (
              <Link href={`/inventory/operation/incoming_product/return/${id}`}>
                <Button variant="outline" className="border-red-400 text-red-600 hover:bg-red-50 text-xs h-9">
                  <RotateCcw className="w-3.5 h-3.5 mr-1.5" /> Process Supplier Return
                </Button>
              </Link>
            )}
          </div>
        </div>

        {/* Details Content */}
        <div className="p-6 max-w-[1400px] mx-auto w-full flex flex-col gap-10">
          
          {/* PRD 3-Way Match Audit Banner */}
          {dummyData.three_way_match_status && (
            <div className="p-4 rounded border bg-amber-50/80 border-amber-300 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-amber-100 text-amber-800 rounded-full font-bold text-xs">
                  3-WAY MATCH
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-amber-950">
                    Discrepancy Flagged: {dummyData.discrepancy_details}
                  </h4>
                  <p className="text-xs text-amber-800 mt-0.5">
                    Automated comparison between Purchase Order ({dummyData.related_po}), Supplier Delivery Note, and Physical Received Stock.
                  </p>
                </div>
              </div>
              <span className="px-3 py-1 bg-red-100 text-red-800 font-bold text-xs rounded border border-red-300 uppercase self-start sm:self-auto">
                {dummyData.three_way_match_status.replace("_", " ")}
              </span>
            </div>
          )}

          <section>
            <h2 className="text-[#3B7CED] text-xl mb-6 font-medium">Receipt Summary</h2>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 bg-gray-50 p-6 rounded border border-gray-200">
              <div>
                <span className="text-xs text-gray-400 block mb-1">Receipt ID</span>
                <span className="text-sm font-semibold text-gray-800">{dummyData.incoming_product_id}</span>
              </div>
              <div>
                <span className="text-xs text-gray-400 block mb-1">Source Document (PO)</span>
                <span className="text-sm font-semibold text-[#3B7CED]">{dummyData.related_po}</span>
              </div>
              <div>
                <span className="text-xs text-gray-400 block mb-1">Supplier / Vendor</span>
                <span className="text-sm font-semibold text-gray-800">{dummyData.supplier_name}</span>
              </div>
              <div>
                <span className="text-xs text-gray-400 block mb-1">Destination Location</span>
                <span className="text-sm font-semibold text-gray-800">{dummyData.destination_location}</span>
              </div>
              <div className="md:col-span-4 border-t border-gray-200 pt-4 mt-2">
                <span className="text-xs text-gray-400 block mb-1">Inspection Notes</span>
                <span className="text-sm text-gray-700">{dummyData.notes}</span>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-[#3B7CED] text-xl mb-6 font-medium">Received Product Lines & 3-Way Match Verification</h2>
            <div className="bg-white rounded border border-gray-200 shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <Table className="min-w-[1000px]">
                  <TableHeader>
                    <TableRow className="bg-[#F8F9FA] border-b-gray-100">
                      <TableHead className="pl-4">Product Name</TableHead>
                      <TableHead>Unit</TableHead>
                      <TableHead className="text-center">PO QTY</TableHead>
                      <TableHead className="text-center">Received QTY</TableHead>
                      <TableHead className="text-right">PO Unit Price</TableHead>
                      <TableHead className="text-right">Invoice Unit Price</TableHead>
                      <TableHead className="text-center">Accepted QTY</TableHead>
                      <TableHead className="text-center pr-4">3-Way Match Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {dummyData.items.map((item: any) => (
                      <TableRow key={item.id} className="border-b-gray-100 hover:bg-gray-50">
                        <TableCell className="pl-4 font-medium text-gray-800">
                          <div>{item.product_name}</div>
                          <div className="text-[11px] text-gray-500 font-normal">{item.product_description}</div>
                        </TableCell>
                        <TableCell className="text-xs">{item.unit_symbol}</TableCell>
                        <TableCell className="text-center font-medium text-gray-500">{item.po_quantity}</TableCell>
                        <TableCell className="text-center font-bold text-gray-900">{item.received_quantity}</TableCell>
                        <TableCell className="text-right font-mono text-gray-600">
                          {item.po_unit_price ? `₦${item.po_unit_price.toLocaleString()}` : "—"}
                        </TableCell>
                        <TableCell className={`text-right font-mono font-bold ${item.invoice_unit_price !== item.po_unit_price ? "text-red-600" : "text-gray-900"}`}>
                          {item.invoice_unit_price ? `₦${item.invoice_unit_price.toLocaleString()}` : "—"}
                        </TableCell>
                        <TableCell className="text-center font-bold text-green-600">{item.accepted_quantity}</TableCell>
                        <TableCell className="text-center pr-4">
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-red-100 text-red-800 border border-red-300">
                            {item.match_status || "Verified"}
                          </span>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          </section>
        </div>
      </div>
    </PageGuard>
  );
}
