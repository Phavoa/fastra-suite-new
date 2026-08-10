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
import { useGetStockMoveQuery } from "@/api/inventory/stockMoveApi";
import { Skeleton } from "@/components/ui/skeleton";

export default function StockMoveDetailPage() {
  const params = useParams();
  const id = (params?.id as string) || "";

  const { data: moveData, isLoading, isError } = useGetStockMoveQuery(id, {
    skip: !id,
  });

  const qty = Number(moveData?.quantity) || 0;
  const isPositive = qty >= 0;

  const breadcrumbsItem: BreadcrumbItem[] = [
    { label: "Home", href: "/" },
    { label: "Inventory", href: "/inventory" },

    { label: "Inventory Ledger", href: "/inventory/stocks/stock-moves" },
    { label: `Move ${id}`, href: `/inventory/stocks/stock-moves/${id}`, current: true },
  ];

  const summaryItems: SummaryCardItem[] = moveData
    ? [
        { label: "Move ID", value: String(moveData.id) },
        { label: "Transaction Type", value: moveData.move_type || "Move" },
        { label: "Reference Document", value: <span className="text-[#3B7CED] font-semibold">{moveData.reference || "N/A"}</span> },
        { label: "Recorded By User", value: moveData.moved_by_details?.first_name ? `${moveData.moved_by_details.first_name} ${moveData.moved_by_details.last_name || ''}` : "System Admin" },
        { label: "Source Location", value: moveData.source_location_details?.location_name || "External/Unknown" },
        { label: "Destination Store", value: moveData.destination_location_details?.location_name || "External/Unknown" },
        { label: "Notes", value: moveData.notes || "No notes available", fullWidth: true },
      ]
    : [];

  return (
    <InventoryPageShell
      application="inventory"
      module="stockmove"
      breadcrumbs={breadcrumbsItem}
    >
      {isLoading ? (
        <div className="space-y-4 p-4">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-40 w-full" />
          <Skeleton className="h-40 w-full" />
        </div>
      ) : isError || !moveData ? (
        <div className="p-8 text-center text-red-500">
          Failed to load stock move details. Please try again.
        </div>
      ) : (
        <>
          <InventoryDetailTopBar
            title="Stock Move Details"
            id={String(moveData.id)}
            icon={<FileText className="w-6 h-6" />}
            status={moveData.move_type || "Move"}
            subtitle={
              <>
                Recorded on {new Date(moveData.date_moved || moveData.created_at || "").toLocaleDateString() || moveData.date_moved} • Source Document:{" "}
                <strong className="text-[#3B7CED]">{moveData.reference || "N/A"}</strong>
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
                  {moveData.product_details?.product_name || "Unknown Product"}
                </TableCell>
                <TableCell className="px-6 py-3.5 text-sm text-[#525F7F] whitespace-nowrap">
                  {moveData.product_details?.description || "-"}
                </TableCell>
                <TableCell className="px-6 py-3.5 text-center text-sm font-medium text-[#525F7F] whitespace-nowrap">
                  {moveData.unit_of_measure_details?.unit_symbol || "-"}
                </TableCell>
                <TableCell
                  className={`px-6 py-3.5 text-center font-mono font-bold text-sm whitespace-nowrap ${
                    isPositive ? "text-[#2BA24D]" : "text-[#E43D2B]"
                  }`}
                >
                  {isPositive ? `+${qty}` : qty}
                </TableCell>
                <TableCell className="px-6 py-3.5 text-right font-mono text-sm text-[#525F7F] whitespace-nowrap">
                  ₦{moveData.unit_cost !== undefined && moveData.unit_cost !== null ? moveData.unit_cost.toLocaleString() : "—"}
                </TableCell>
                <TableCell className="px-6 py-3.5 text-right font-mono font-bold text-sm text-[#32325D] whitespace-nowrap">
                  ₦{moveData.total_value !== undefined && moveData.total_value !== null ? moveData.total_value.toLocaleString() : "—"}
                </TableCell>
                <TableCell className="px-6 py-3.5 text-center font-mono font-semibold text-sm text-[#3B7CED] whitespace-nowrap">
                  {moveData.running_balance !== undefined && moveData.running_balance !== null ? moveData.running_balance.toLocaleString() : "—"} {moveData.unit_of_measure_details?.unit_symbol || ""}
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </div>
      </div>
        </>
      )}
    </InventoryPageShell>
  );
}
