"use client";

import React, { useMemo, useState } from "react";
import { BreadcrumbItem } from "@/components/shared/types";
import { StockMoveTable } from "@/components/inventory/stocks/StockMoveTable";
import { StockMoveCards } from "@/components/inventory/stocks/StockMoveCards";
import { InventoryPageShell, InventoryListHeader } from "@/components/inventory/shared";
import { useGetStockMovesQuery } from "@/api/inventory/stockMoveApi";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";

export default function StockMovesPage() {
  const { data: movesResponse, isLoading, isError } = useGetStockMovesQuery({});
  const moves = (movesResponse as any)?.results || (Array.isArray(movesResponse) ? movesResponse : []);

  const [query, setQuery] = useState("");
  const [selectedType, setSelectedType] = useState<string>("ALL");
  const [currentView, setCurrentView] = useState<"list" | "grid">("list");

  // Advanced Filters State
  const [showFilters, setShowFilters] = useState(false);
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [selectedProduct, setSelectedProduct] = useState("ALL");
  const [selectedWbsPhase, setSelectedWbsPhase] = useState("ALL");
  const [selectedWbsActivity, setSelectedWbsActivity] = useState("ALL");

  const items: BreadcrumbItem[] = [
    { label: "Home", href: "/" },
    { label: "Inventory", href: "/inventory" },
    { label: "Inventory Ledger", href: "/inventory/stocks/stock-moves", current: true },
  ];

  const transactionTypes = ["ALL", "INCOMING", "OUTGOING", "TRANSFER"];

  // Extract unique options for dropdowns
  const productsList = useMemo(() => {
    const set = new Set<string>();
    moves.forEach((m: any) => {
      if (m.product_details?.product_name) set.add(m.product_details.product_name);
    });
    return Array.from(set).sort();
  }, [moves]);

  const phasesList = useMemo(() => {
    const set = new Set<string>();
    moves.forEach((m: any) => {
      const val = typeof m.wbs_phase === "object" ? m.wbs_phase?.name || m.wbs_phase?.id : m.wbs_phase;
      if (val) set.add(val);
    });
    return Array.from(set).sort();
  }, [moves]);

  const activitiesList = useMemo(() => {
    const set = new Set<string>();
    moves.forEach((m: any) => {
      const val = typeof m.wbs_activity === "object" ? m.wbs_activity?.name || m.wbs_activity?.id : m.wbs_activity;
      if (val) set.add(val);
    });
    return Array.from(set).sort();
  }, [moves]);

  const filteredMoves = useMemo(() => {
    return moves.filter((move: any) => {
      // 1. Transaction Type filter
      if (selectedType !== "ALL") {
        const type = selectedType.toUpperCase();
        if (type === "INCOMING" && !(move.move_type === "INCOMING" || move.move_type === "Receipt")) return false;
        if (type === "OUTGOING" && !(move.move_type === "CONSUMPTION" || move.move_type === "Consumption" || move.move_type === "SCRAP" || move.move_type === "Scrap" || move.move_type === "OUTGOING")) return false;
        if (type === "TRANSFER" && move.move_type !== "TRANSFER") return false;
      }
      
      // 2. Product filter
      if (selectedProduct !== "ALL" && move.product_details?.product_name !== selectedProduct) {
        return false;
      }

      // 3. WBS Phase filter
      const phaseVal = typeof move.wbs_phase === "object" ? move.wbs_phase?.name || move.wbs_phase?.id : move.wbs_phase;
      if (selectedWbsPhase !== "ALL" && phaseVal !== selectedWbsPhase) {
        return false;
      }

      // 4. WBS Activity filter
      const activityVal = typeof move.wbs_activity === "object" ? move.wbs_activity?.name || move.wbs_activity?.id : move.wbs_activity;
      if (selectedWbsActivity !== "ALL" && activityVal !== selectedWbsActivity) {
        return false;
      }

      // 5. Date Range filter
      if (dateFrom && move.date_moved) {
        if (new Date(move.date_moved.split('T')[0]) < new Date(dateFrom)) return false;
      }
      if (dateTo && move.date_moved) {
        if (new Date(move.date_moved.split('T')[0]) > new Date(dateTo)) return false;
      }

      // 6. Search query filter
      if (!query.trim()) return true;
      const q = query.toLowerCase();
      const searchPhaseVal = typeof move.wbs_phase === "object" ? move.wbs_phase?.name || move.wbs_phase?.id : move.wbs_phase;
      const searchActivityVal = typeof move.wbs_activity === "object" ? move.wbs_activity?.name || move.wbs_activity?.id : move.wbs_activity;
      return (
        String(move.id).toLowerCase().includes(q) ||
        (move.product_details?.product_name && move.product_details.product_name.toLowerCase().includes(q)) ||
        (move.reference && move.reference.toLowerCase().includes(q)) ||
        (searchPhaseVal && String(searchPhaseVal).toLowerCase().includes(q)) ||
        (searchActivityVal && String(searchActivityVal).toLowerCase().includes(q))
      );
    });
  }, [moves, query, selectedType, selectedProduct, selectedWbsPhase, selectedWbsActivity, dateFrom, dateTo]);

  const exportToCSV = () => {
    if (filteredMoves.length === 0) return;

    const headers = [
      "Date",
      "Move ID",
      "Reference Document",
      "Type",
      "Product Name",
      "Quantity",
      "Running Balance",
      "WBS Phase",
      "WBS Activity",
      "User"
    ];

    const rows = filteredMoves.map((move: any) => {
      const user = move.moved_by_details?.first_name 
        ? `${move.moved_by_details.first_name} ${move.moved_by_details.last_name || ""}`.trim()
        : "System Admin";

      const phaseVal = typeof move.wbs_phase === "object" ? move.wbs_phase?.name || move.wbs_phase?.id || "" : move.wbs_phase || "";
      const activityVal = typeof move.wbs_activity === "object" ? move.wbs_activity?.name || move.wbs_activity?.id || "" : move.wbs_activity || "";

      return [
        move.date_moved || "",
        move.id || "",
        move.reference || "",
        move.move_type || "",
        move.product_details?.product_name || "",
        move.quantity || "",
        move.running_balance || "",
        phaseVal,
        activityVal,
        user
      ];
    });

    const csvContent = 
      "data:text/csv;charset=utf-8," + 
      [headers.join(","), ...rows.map(e => e.map(val => `"${String(val).replace(/"/g, '""')}"`).join(","))].join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Inventory_Ledger_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

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
          extraActions={
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowFilters(!showFilters)}
                className={`h-9 text-xs border-gray-200 ${showFilters ? "bg-blue-50 text-[#3B7CED] border-blue-200" : "text-[#525F7F]"}`}
              >
                Filters
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={exportToCSV}
                disabled={filteredMoves.length === 0}
                className="h-9 text-xs border-gray-200 text-[#525F7F]"
              >
                Export CSV
              </Button>
            </div>
          }
        />

        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden bg-white border border-gray-100 rounded-lg p-5 mt-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-4 shadow-2xs"
            >
              {/* Date From */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-semibold text-[#525F7F] uppercase tracking-wider">Date From</label>
                <input
                  type="date"
                  value={dateFrom}
                  onChange={(e) => setDateFrom(e.target.value)}
                  className="w-full px-3 py-1.5 border border-gray-200 rounded-md text-xs text-[#32325D] focus:outline-none focus:ring-1 focus:ring-[#3B7CED]"
                />
              </div>

              {/* Date To */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-semibold text-[#525F7F] uppercase tracking-wider">Date To</label>
                <input
                  type="date"
                  value={dateTo}
                  onChange={(e) => setDateTo(e.target.value)}
                  className="w-full px-3 py-1.5 border border-gray-200 rounded-md text-xs text-[#32325D] focus:outline-none focus:ring-1 focus:ring-[#3B7CED]"
                />
              </div>

              {/* Product */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-semibold text-[#525F7F] uppercase tracking-wider">Product</label>
                <select
                  value={selectedProduct}
                  onChange={(e) => setSelectedProduct(e.target.value)}
                  className="w-full px-3 py-1.5 border border-gray-200 rounded-md text-xs text-[#32325D] focus:outline-none focus:ring-1 focus:ring-[#3B7CED] bg-white"
                >
                  <option value="ALL">All Products</option>
                  {productsList.map((prod) => (
                    <option key={prod} value={prod}>{prod}</option>
                  ))}
                </select>
              </div>

              {/* WBS Phase */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-semibold text-[#525F7F] uppercase tracking-wider">WBS Phase</label>
                <select
                  value={selectedWbsPhase}
                  onChange={(e) => setSelectedWbsPhase(e.target.value)}
                  className="w-full px-3 py-1.5 border border-gray-200 rounded-md text-xs text-[#32325D] focus:outline-none focus:ring-1 focus:ring-[#3B7CED] bg-white"
                >
                  <option value="ALL">All Phases</option>
                  {phasesList.map((phase) => (
                    <option key={phase} value={phase}>{phase}</option>
                  ))}
                </select>
              </div>

              {/* WBS Activity */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-semibold text-[#525F7F] uppercase tracking-wider">WBS Activity</label>
                <select
                  value={selectedWbsActivity}
                  onChange={(e) => setSelectedWbsActivity(e.target.value)}
                  className="w-full px-3 py-1.5 border border-gray-200 rounded-md text-xs text-[#32325D] focus:outline-none focus:ring-1 focus:ring-[#3B7CED] bg-white"
                >
                  <option value="ALL">All Activities</option>
                  {activitiesList.map((act) => (
                    <option key={act} value={act}>{act}</option>
                  ))}
                </select>
              </div>

              {/* Reset Button */}
              <div className="sm:col-span-2 md:col-span-5 flex justify-end gap-2 pt-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setDateFrom("");
                    setDateTo("");
                    setSelectedProduct("ALL");
                    setSelectedWbsPhase("ALL");
                    setSelectedWbsActivity("ALL");
                  }}
                  className="text-xs text-[#525F7F] hover:text-[#32325D] hover:bg-gray-100"
                >
                  Reset Filters
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="bg-white rounded-lg shadow-2xs border border-gray-100 overflow-hidden mt-6">
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
            <StockMoveTable moves={filteredMoves} query="" />
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
