"use client";

import React from "react";
import { useParams } from "next/navigation";
import { FileText } from "lucide-react";
import { BreadcrumbItem } from "@/components/shared/types";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  InventoryPageShell,
  InventoryDetailTopBar,
  InventorySummaryCard,
  SummaryCardItem,
} from "@/components/inventory/shared";

export default function StockMoveDetailPage() {
  const params = useParams();
  const id = (params?.id as string) || "MOV-0001";

  const moveData = {
    id: id,
    date_moved: "2026-06-29 14:30",
    date_created: "2026-06-29",
    transaction_type:
      id === "MOV-0002"
        ? "Consumption"
        : id === "MOV-0003"
        ? "Scrap"
        : id === "MOV-0004"
        ? "Adjustment"
        : id === "MOV-0005"
        ? "Return"
        : "Receipt",
    reference_document: id === "MOV-0002" ? "REQ-2026-0142" : "PO-2026-0089",
    user: id === "MOV-0002" ? "Eng. John Doe (Site Engineer)" : "Mr. Abubakar (Storekeeper)",
    running_balance: id === "MOV-0002" ? 148 : 1200,
    cost_code: id === "MOV-0002" ? "CC-2040 (Structural Reinforcement)" : "CC-1020 (Concrete Materials)",
    product: {
      id: id === "MOV-0002" ? "2" : "1",
      product_name: id === "MOV-0002" ? "Reinforcement Steel 16mm" : "Cement (50kg Bag)",
      product_code: id === "MOV-0002" ? "STL-16" : "CEM-50",
      product_description: id === "MOV-0002" ? "High Yield Deformed Steel Bars" : "Portland Cement Grade 42.5",
      unit_symbol: id === "MOV-0002" ? "Tonnes" : "Bags",
    },
    quantity: id === "MOV-0002" ? -12 : 500,
    unit_cost: id === "MOV-0002" ? 850000 : 5500,
    total_value: id === "MOV-0002" ? 10200000 : 2750000,
    wbs_phase: id === "MOV-0002" ? "Superstructure" : "Substructure / Foundation",
    wbs_activity: id === "MOV-0002" ? "First Floor Slab Reinforcement" : "Concrete Pouring Site A",
    source_location: id === "MOV-0002" ? "Main Warehouse - Site A" : "Vendor Supplier",
    destination_location: id === "MOV-0002" ? "Site Consumption" : "Main Warehouse - Site A",
    notes: "System-generated inventory movement audit log. Verified against physical waybill and site request voucher.",
  };

  const isPositive = moveData.quantity >= 0;

  const breadcrumbsItem: BreadcrumbItem[] = [
    { label: "Home", href: "/" },
    { label: "Inventory", href: "/inventory" },
    { label: "Stocks", href: "/inventory/stocks" },
    { label: "Stock Moves", href: "/inventory/stocks/stock-moves" },
    { label: `Move ${id}`, href: `/inventory/stocks/stock-moves/${id}`, current: true },
  ];

  const summaryItems: SummaryCardItem[] = [
    { label: "Move ID", value: moveData.id },
    { label: "Transaction Type", value: moveData.transaction_type },
    { label: "Reference Document", value: <span className="text-[#3B7CED] font-semibold">{moveData.reference_document}</span> },
    { label: "Recorded By User", value: moveData.user },
    { label: "Source Location", value: moveData.source_location },
    { label: "Destination Store", value: moveData.destination_location },
    { label: "WBS Phase / Activity", value: `${moveData.wbs_phase} — ${moveData.wbs_activity}` },
    { label: "Job Cost Code", value: moveData.cost_code },
    { label: "Remarks & Audit Notes", value: moveData.notes, fullWidth: true },
  ];

  return (
    <InventoryPageShell
      application="inventory"
      module="stockmove"
      breadcrumbs={breadcrumbsItem}
    >
      <InventoryDetailTopBar
        title="Stock Move Details"
        id={moveData.id}
        icon={<FileText className="w-6 h-6" />}
        status={moveData.transaction_type}
        subtitle={
          <>
            Recorded on {moveData.date_moved} • Source Document:{" "}
            <strong className="text-[#3B7CED]">{moveData.reference_document}</strong>
          </>
        }
      />

      <InventorySummaryCard
        title="Move Information"
        items={summaryItems}
      />

      <div className="bg-white rounded-lg shadow-2xs border border-gray-100 overflow-hidden">
        <div className="p-5 border-b border-gray-100">
          <h2 className="text-base font-semibold text-[#32325D]">
            Transacted Product Line & Valuation
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
                <TableHead className="font-semibold text-[#8898AA] text-[11.5px] py-3.5 px-6 whitespace-nowrap text-center">
                  Quantity Moved
                </TableHead>
                <TableHead className="font-semibold text-[#8898AA] text-[11.5px] py-3.5 px-6 whitespace-nowrap text-right">
                  Unit Cost (₦)
                </TableHead>
                <TableHead className="font-semibold text-[#8898AA] text-[11.5px] py-3.5 px-6 whitespace-nowrap text-right">
                  Total Valuation (₦)
                </TableHead>
                <TableHead className="font-semibold text-[#8898AA] text-[11.5px] py-3.5 px-6 whitespace-nowrap text-center">
                  Running Balance
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow className="hover:bg-gray-50 border-b border-gray-100 transition-colors">
                <TableCell className="px-6 py-3.5 font-semibold text-sm text-[#32325D] whitespace-nowrap">
                  {moveData.product.product_name}
                </TableCell>
                <TableCell className="px-6 py-3.5 text-sm text-[#525F7F] whitespace-nowrap">
                  {moveData.product.product_description}
                </TableCell>
                <TableCell className="px-6 py-3.5 text-center text-sm font-medium text-[#525F7F] whitespace-nowrap">
                  {moveData.product.unit_symbol}
                </TableCell>
                <TableCell
                  className={`px-6 py-3.5 text-center font-mono font-bold text-sm whitespace-nowrap ${
                    isPositive ? "text-[#2BA24D]" : "text-[#E43D2B]"
                  }`}
                >
                  {isPositive ? `+${moveData.quantity}` : moveData.quantity}
                </TableCell>
                <TableCell className="px-6 py-3.5 text-right font-mono text-sm text-[#525F7F] whitespace-nowrap">
                  ₦{moveData.unit_cost.toLocaleString()}
                </TableCell>
                <TableCell className="px-6 py-3.5 text-right font-mono font-bold text-sm text-[#32325D] whitespace-nowrap">
                  ₦{moveData.total_value.toLocaleString()}
                </TableCell>
                <TableCell className="px-6 py-3.5 text-center font-mono font-semibold text-sm text-[#3B7CED] whitespace-nowrap">
                  {moveData.running_balance.toLocaleString()} {moveData.product.unit_symbol}
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </div>
      </div>
    </InventoryPageShell>
  );
}
