"use client";

import React, { useMemo, useState } from "react";
import { BreadcrumbItem } from "@/components/shared/types";
import { StockMoveTable } from "@/components/inventory/stocks/StockMoveTable";
import { StockMoveCards } from "@/components/inventory/stocks/StockMoveCards";
import { InventoryPageShell, InventoryListHeader } from "@/components/inventory/shared";
import { useGetStockMovesQuery } from "@/api/inventory/stockMoveApi";
import { Skeleton } from "@/components/ui/skeleton";

export default function StockMovesPage() {
  const { data: movesResponse, isLoading, isError } = useGetStockMovesQuery({});
  const moves = movesResponse?.results || [];

  const [query, setQuery] = useState("");
  const [selectedType, setSelectedType] = useState<string>("ALL");
  const [currentView, setCurrentView] = useState<"list" | "grid">("list");

  const items: BreadcrumbItem[] = [
    { label: "Home", href: "/" },
    { label: "Inventory", href: "/inventory" },

    { label: "Inventory Ledger", href: "/inventory/stocks/stock-moves", current: true },
  ];

  const transactionTypes = ["ALL", "INCOMING", "OUTGOING", "TRANSFER"];

  const filteredMoves = useMemo(() => {
    return moves.filter((move: any) => {
      if (selectedType !== "ALL" && move.move_type !== selectedType) {
        return false;
      }
      if (!query.trim()) return true;
      const q = query.toLowerCase();
      return (
        String(move.id).toLowerCase().includes(q) ||
        (move.product_details?.product_name && move.product_details.product_name.toLowerCase().includes(q)) ||
        (move.reference && move.reference.toLowerCase().includes(q))
      );
    });
  }, [moves, query, selectedType]);

  return (
    <InventoryPageShell
      application="inventory"
      module="stockmove"
      breadcrumbs={items}
    >
      <InventoryListHeader
        title="Inventory Ledger"
        query={query}
        onQueryChange={setQuery}
        searchPlaceholder="Search by ID, item, PO/Ref doc, or WBS Phase..."
        viewToggle={{
          currentView,
          onViewChange: setCurrentView,
        }}
        filterTabs={{
          tabs: transactionTypes.map((t) => ({ label: t, value: t })),
          selectedTab: selectedType,
          onTabChange: setSelectedType,
        }}
      />

      <div className="bg-white rounded-lg shadow-2xs border border-gray-100 overflow-hidden">
        {isLoading ? (
          <div className="space-y-4 p-4">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
        ) : isError ? (
          <div className="p-8 text-center text-red-500">
            Failed to load stock moves. Please try again.
          </div>
        ) : currentView === "list" ? (
          <StockMoveTable moves={filteredMoves} query={query} />
        ) : (
          <div className="p-6">
            <StockMoveCards moves={filteredMoves} />
          </div>
        )}
      </div>
    </InventoryPageShell>
  );
}
