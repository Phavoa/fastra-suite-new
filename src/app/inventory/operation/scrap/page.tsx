"use client";

import React, { useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { StockAdjustmentRow, StockAdjustmentStatus } from "@/components/inventory/types";
import { Input } from "@/components/ui/input";
import { SearchIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ViewToggle } from "@/components/inventory/location/ViewToggle";
import Breadcrumbs from "@/components/shared/BreadScrumbs";
import { AutoSaveIcon } from "@/components/shared/icons";
import { BreadcrumbItem } from "@/components/shared/types";
import { StockAdjustmentTable } from "@/components/inventory/scrap/StockAdjustmentTable";
import { StockAdjustmentCards } from "@/components/inventory/scrap/StockAdjustmentCards";
import Link from "next/link";
import { PageGuard } from "@/components/auth/PageGuard";

const DUMMY_SCRAPS: StockAdjustmentRow[] = [
  {
    id: "WH-MAIN-SCRAP-0001",
    adjustmentType: "Damage / Spoilage",
    location: "Main Warehouse - Site A",
    adjustedDate: "2026-06-28",
    status: "done" as StockAdjustmentStatus,
    product: "Cement (50kg Bag)",
    quantity: 5,
  },
  {
    id: "WH-MAIN-SCRAP-0002",
    adjustmentType: "Theft / Unexplained Loss",
    location: "Main Warehouse - Site A",
    adjustedDate: "2026-06-29",
    status: "draft" as StockAdjustmentStatus,
    product: "Reinforcement Steel 16mm",
    quantity: 2,
  },
  {
    id: "WH-SEC-SCRAP-0001",
    adjustmentType: "Damage / Spoilage",
    location: "Secondary Store - Site B",
    adjustedDate: "2026-06-26",
    status: "done" as StockAdjustmentStatus,
    product: "Safety Helmets (Yellow)",
    quantity: 3,
  },
];

export default function ScrapPage() {
  const searchParams = useSearchParams();
  const status = searchParams.get("status") as "draft" | "done" | null;

  const [query, setQuery] = useState("");
  const [currentView, setCurrentView] = useState<"grid" | "list">("list");

  const items: BreadcrumbItem[] = [
    { label: "Home", href: "/" },
    { label: "Inventory", href: "/inventory" },
    { label: "Operations", href: "/inventory/operation" },
    {
      label: `${
        status ? status.charAt(0).toUpperCase() + status.slice(1) : "All"
      } Scrap Records`,
      href: `/inventory/operation/scrap?status=${status || ""}`,
      current: true,
    },
  ];

  const rows = useMemo(() => {
    return DUMMY_SCRAPS.filter((scrap) => {
      if (status && scrap.status !== status) return false;
      if (!query.trim()) return true;
      const q = query.toLowerCase();
      return (
        scrap.id.toLowerCase().includes(q) ||
        scrap.location.toLowerCase().includes(q) ||
        scrap.adjustmentType.toLowerCase().includes(q) ||
        (scrap.product && scrap.product.toLowerCase().includes(q))
      );
    });
  }, [status, query]);

  const handleViewChange = (view: "grid" | "list") => {
    setCurrentView(view);
  };

  return (
    <PageGuard application="inventory" module="scrap">
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
              <h1 className="text-xl font-semibold text-gray-800 shrink-0">Scrap Records (Damaged / Lost Stock)</h1>
              <div className="relative flex-1 w-full max-w-md">
                <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  type="text"
                  className="w-full pl-9 pr-4 bg-gray-50 border-gray-200 rounded h-9 text-sm focus:bg-white focus:ring-1 focus:ring-[#3B7CED]"
                  placeholder="Search scrap records by ID, location, or cause..."
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  aria-label="Search scrap records"
                />
              </div>
            </div>

            <div className="flex items-center gap-3 justify-end pt-2 md:pt-0 border-t md:border-t-0 border-gray-100">
              <Link href="/inventory/operation/scrap/new" className="w-full sm:w-auto">
                <Button className="bg-[#3B7CED] hover:bg-[#3065c3] text-white h-9 px-4 text-sm font-medium w-full sm:w-auto">
                  Record New Scrap
                </Button>
              </Link>
              <ViewToggle
                currentView={currentView}
                onViewChange={handleViewChange}
              />
            </div>
          </div>

          {/* Content */}
          <div className="bg-white rounded border border-gray-200 shadow-sm p-4 overflow-hidden">
            {currentView === "list" ? (
              <StockAdjustmentTable rows={rows} query={query} />
            ) : (
              <StockAdjustmentCards stockAdjustments={rows} />
            )}
          </div>
        </main>
      </div>
    </PageGuard>
  );
}
