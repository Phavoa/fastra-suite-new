"use client";

import React, { useMemo, useState } from "react";
import { BreadcrumbItem } from "@/components/shared/types";
import { StockMoveTable } from "@/components/inventory/stocks/StockMoveTable";
import { StockMoveCards } from "@/components/inventory/stocks/StockMoveCards";
import { StockMove } from "@/types/stockMove";
import { InventoryPageShell, InventoryListHeader } from "@/components/inventory/shared";

const DUMMY_LEDGER_MOVES: StockMove[] = [
  {
    id: "MOV-0001",
    date_moved: "2026-06-29 14:30",
    date_created: "2026-06-29",
    transaction_type: "Receipt",
    reference_document: "PO-2026-0089",
    source_document_id: "PO-2026-0089",
    user: "Mr. Abubakar (Storekeeper)",
    running_balance: 1200,
    cost_code: "CC-1020 (Concrete Materials)",
    product: {
      id: "1",
      product_name: "Cement (50kg Bag)",
      product_code: "CEM-50",
      product_description: "Portland Cement Grade 42.5",
      unit_of_measure_details: { id: "1", unit_name: "Bags", unit_symbol: "Bags" },
    },
    quantity: 500,
    unit_cost: 5500,
    total_value: 2750000,
    wbs_phase: "Substructure / Foundation",
    wbs_activity: "Concrete Pouring Site A",
    source_location: "Vendor Supplier",
    destination_location: "Main Warehouse - Site A",
  },
  {
    id: "MOV-0002",
    date_moved: "2026-06-28 11:15",
    date_created: "2026-06-28",
    transaction_type: "Consumption",
    reference_document: "REQ-2026-0142",
    source_document_id: "REQ-2026-0142",
    user: "Eng. John Doe (Site Engineer)",
    running_balance: 148,
    cost_code: "CC-2040 (Structural Reinforcement)",
    product: {
      id: "2",
      product_name: "Reinforcement Steel 16mm",
      product_code: "STL-16",
      product_description: "High Yield Deformed Steel Bars",
      unit_of_measure_details: { id: "2", unit_name: "Tonnes", unit_symbol: "Tonnes" },
    },
    quantity: -12,
    unit_cost: 850000,
    total_value: 10200000,
    wbs_phase: "Superstructure",
    wbs_activity: "First Floor Slab Reinforcement",
    source_location: "Main Warehouse - Site A",
    destination_location: "Site Consumption",
  },
  {
    id: "MOV-0003",
    date_moved: "2026-06-27 16:45",
    date_created: "2026-06-27",
    transaction_type: "Scrap",
    reference_document: "SCRAP-0012",
    source_document_id: "SCRAP-0012",
    user: "Mrs. Ngozi (Controller)",
    running_balance: 700,
    cost_code: "CC-9010 (Overhead Spoilage)",
    product: {
      id: "1",
      product_name: "Cement (50kg Bag)",
      product_code: "CEM-50",
      product_description: "Portland Cement Grade 42.5",
      unit_of_measure_details: { id: "1", unit_name: "Bags", unit_symbol: "Bags" },
    },
    quantity: -5,
    unit_cost: 5500,
    total_value: 27500,
    wbs_phase: "General Site Operations",
    wbs_activity: "Material Handling Loss",
    source_location: "Main Warehouse - Site A",
    destination_location: "Scrap / Disposal",
  },
  {
    id: "MOV-0004",
    date_moved: "2026-06-26 09:20",
    date_created: "2026-06-26",
    transaction_type: "Adjustment",
    reference_document: "WH-MAIN-ADJ-0001",
    source_document_id: "WH-MAIN-ADJ-0001",
    user: "Admin (Inventory Control)",
    running_balance: 118,
    cost_code: "CC-0000 (Inventory Audit)",
    product: {
      id: "3",
      product_name: "Sharp Sand",
      product_code: "SND-01",
      product_description: "Clean river sharp sand",
      unit_of_measure_details: { id: "3", unit_name: "Cubic Meters", unit_symbol: "m³" },
    },
    quantity: -2,
    unit_cost: 18000,
    total_value: 36000,
    wbs_phase: "General Site Operations",
    wbs_activity: "Quarterly Stock Audit Reconciliation",
    source_location: "Main Warehouse - Site A",
    destination_location: "Main Warehouse - Site A",
  },
  {
    id: "MOV-0005",
    date_moved: "2026-06-25 15:10",
    date_created: "2026-06-25",
    transaction_type: "Return",
    reference_document: "RET-2026-0004",
    source_document_id: "RET-2026-0004",
    user: "Site Foreman (Sub-contractor B)",
    running_balance: 120,
    cost_code: "CC-1020 (Concrete Materials)",
    product: {
      id: "3",
      product_name: "Sharp Sand",
      product_code: "SND-01",
      product_description: "Clean river sharp sand",
      unit_of_measure_details: { id: "3", unit_name: "Cubic Meters", unit_symbol: "m³" },
    },
    quantity: 15,
    unit_cost: 18000,
    total_value: 270000,
    wbs_phase: "Substructure / Foundation",
    wbs_activity: "Excess Site Material Return",
    source_location: "Site Consumption",
    destination_location: "Main Warehouse - Site A",
  },
];

export default function StockMovesPage() {
  const [moves] = useState<StockMove[]>(DUMMY_LEDGER_MOVES);
  const [query, setQuery] = useState("");
  const [selectedType, setSelectedType] = useState<string>("ALL");
  const [currentView, setCurrentView] = useState<"list" | "grid">("list");

  const items: BreadcrumbItem[] = [
    { label: "Home", href: "/" },
    { label: "Inventory", href: "/inventory" },
    { label: "Stocks", href: "/inventory/stocks" },
    { label: "Stock Moves", href: "/inventory/stocks/stock-moves", current: true },
  ];

  const transactionTypes = ["ALL", "Receipt", "Consumption", "Scrap", "Adjustment", "Return"];

  const filteredMoves = useMemo(() => {
    return moves.filter((move) => {
      if (selectedType !== "ALL" && move.transaction_type !== selectedType) {
        return false;
      }
      if (!query.trim()) return true;
      const q = query.toLowerCase();
      return (
        String(move.id).toLowerCase().includes(q) ||
        (move.product?.product_name && move.product.product_name.toLowerCase().includes(q)) ||
        (move.reference_document && move.reference_document.toLowerCase().includes(q)) ||
        (move.wbs_phase && move.wbs_phase.toLowerCase().includes(q)) ||
        (move.wbs_activity && move.wbs_activity.toLowerCase().includes(q))
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
        title="Stock Moves"
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
        {currentView === "list" ? (
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
