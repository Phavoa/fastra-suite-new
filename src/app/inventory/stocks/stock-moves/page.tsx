"use client";

import React, { useMemo, useState } from "react";
import { Input } from "@/components/ui/input";
import { SearchIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ViewToggle } from "@/components/inventory/location/ViewToggle";
import { PageGuard } from "@/components/auth/PageGuard";
import Breadcrumbs from "@/components/shared/BreadScrumbs";
import { AutoSaveIcon } from "@/components/shared/icons";
import { BreadcrumbItem } from "@/components/shared/types";
import { StockMoveTable } from "@/components/inventory/stocks/StockMoveTable";
import { StockMoveCards } from "@/components/inventory/stocks/StockMoveCards";
import { StockMove } from "@/types/stockMove";

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
    cost_code: "CC-3005 (Safety Equipment)",
    product: {
      id: "4",
      product_name: "Safety Helmets (Yellow)",
      product_code: "HLM-YEL",
      product_description: "HDPE Hard Hats",
      unit_of_measure_details: { id: "4", unit_name: "Pieces", unit_symbol: "Pcs" },
    },
    quantity: -2,
    unit_cost: 4500,
    total_value: 9000,
    wbs_phase: "Project Management / HSE",
    wbs_activity: "Quarterly Safety Audit",
    source_location: "Secondary Store - Site B",
    destination_location: "Inventory Adjustment",
  },
  {
    id: "MOV-0005",
    date_moved: "2026-06-25 13:00",
    date_created: "2026-06-25",
    transaction_type: "Return",
    reference_document: "RET-2026-0003",
    source_document_id: "RET-2026-0003",
    user: "Mr. Abubakar (Storekeeper)",
    running_balance: 35,
    cost_code: "CC-1010 (Excavation & Sand)",
    product: {
      id: "3",
      product_name: "Sharp Sand",
      product_code: "SND-SHP",
      product_description: "Clean river sharp sand",
      unit_of_measure_details: { id: "3", unit_name: "Cubic Meters", unit_symbol: "m³" },
    },
    quantity: -10,
    unit_cost: 18000,
    total_value: 180000,
    wbs_phase: "Substructure / Foundation",
    wbs_activity: "Backfill Return to Vendor",
    source_location: "Main Warehouse - Site A",
    destination_location: "Vendor Return",
  },
];

export default function StockMovesPage() {
  const [query, setQuery] = useState("");
  const [currentView, setCurrentView] = useState<"grid" | "list">("list");
  const [selectedType, setSelectedType] = useState<string>("ALL");

  const items: BreadcrumbItem[] = [
    { label: "Home", href: "/" },
    { label: "Inventory", href: "/inventory" },
    { label: "Stocks", href: "/inventory/stocks" },
    {
      label: "Inventory Ledger",
      href: "/inventory/stocks/stock-moves",
      current: true,
    },
  ];

  const filteredMoves = useMemo(() => {
    return DUMMY_LEDGER_MOVES.filter((move) => {
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
  }, [query, selectedType]);

  const handleViewChange = (view: "grid" | "list") => {
    setCurrentView(view);
  };

  const transactionTypes = ["ALL", "Receipt", "Consumption", "Scrap", "Adjustment", "Return"];

  return (
    <PageGuard application="inventory" module="stockmove">
      <div className="flex flex-col flex-1 min-h-[calc(100vh-64px)] bg-white relative pb-20">
        <main className="max-w-[1400px] mx-auto px-4 sm:px-6 py-6 w-full flex flex-col gap-6">
          <Breadcrumbs
            items={items}
            action={
              <Button
                variant="ghost"
                className="text-sm text-gray-400 flex items-center gap-2 hover:text-[#3B7CED] transition-colors duration-200"
              >
                Autosaved <AutoSaveIcon />
              </Button>
            }
          />

          {/* Header Controls */}
          <div className="flex flex-col md:flex-row md:items-center justify-between bg-white p-4 rounded border border-gray-200 shadow-sm gap-4">
            <div className="flex flex-col sm:flex-row sm:items-center gap-3 flex-1 w-full">
              <div>
                <h1 className="text-xl font-semibold text-gray-800 shrink-0">Inventory Ledger</h1>
                <p className="text-xs text-gray-500 mt-0.5">Read-only log of all inventory movements & job costing WBS allocations across project lifecycle.</p>
              </div>
              <div className="relative flex-1 w-full max-w-md sm:ml-4">
                <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  type="text"
                  className="w-full pl-9 pr-4 bg-gray-50 border-gray-200 rounded h-9 text-sm focus:bg-white focus:ring-1 focus:ring-[#3B7CED]"
                  placeholder="Search by ID, item, PO/Ref doc, or WBS Phase..."
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  aria-label="Search inventory ledger"
                />
              </div>
            </div>

            <div className="flex items-center gap-3 justify-end pt-2 md:pt-0 border-t md:border-t-0 border-gray-100">
              <ViewToggle
                currentView={currentView}
                onViewChange={handleViewChange}
              />
            </div>
          </div>

          {/* Type Filter Pills */}
          <div className="flex flex-wrap gap-2 items-center">
            <span className="text-xs font-medium text-gray-500 mr-1">Filter Type:</span>
            {transactionTypes.map((type) => (
              <button
                key={type}
                onClick={() => setSelectedType(type)}
                className={`px-3 py-1 text-xs rounded font-medium transition-colors ${
                  selectedType === type
                    ? "bg-[#3B7CED] text-white"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                {type === "ALL" ? "All Moves" : type}
              </button>
            ))}
          </div>

          {/* Content */}
          <div className="bg-white rounded border border-gray-200 shadow-sm p-4 overflow-hidden">
            {currentView === "list" ? (
              <StockMoveTable moves={filteredMoves} query={query} />
            ) : (
              <StockMoveCards moves={filteredMoves} />
            )}
          </div>
        </main>
      </div>
    </PageGuard>
  );
}
