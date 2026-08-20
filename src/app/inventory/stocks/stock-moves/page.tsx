"use client";

import React, { useMemo, useState } from "react";
import { BreadcrumbItem } from "@/components/shared/types";
import { StockMoveTable } from "@/components/inventory/stocks/StockMoveTable";
import { StockMoveCards } from "@/components/inventory/stocks/StockMoveCards";
import { InventoryPageShell, InventoryListHeader } from "@/components/inventory/shared";
import { useGetStockMovesQuery } from "@/api/inventory/stockMoveApi";
import { Skeleton } from "@/components/ui/skeleton";
import { motion, AnimatePresence } from "framer-motion";

export default function StockMovesPage() {
  const { data: movesResponse, isLoading, isError } = useGetStockMovesQuery({});
  const moves = (movesResponse as any)?.results || (Array.isArray(movesResponse) ? movesResponse : []);

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
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, ease: "easeOut" }}
      className="w-full h-full"
    >
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
          <div className="p-4 space-y-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="flex gap-4 items-center border-b border-gray-100 pb-3">
                <Skeleton className="h-5 w-1/6" />
                <Skeleton className="h-5 w-2/6" />
                <Skeleton className="h-5 w-1/6" />
                <Skeleton className="h-5 w-1/6" />
                <Skeleton className="h-5 w-1/6" />
              </div>
            ))}
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
    </motion.div>
  );
}
