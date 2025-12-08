"use client";

import React, { useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { StockAdjustmentRow } from "@/components/inventory/types";
import { Input } from "@/components/ui/input";
import { SearchIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ViewToggle } from "@/components/inventory/location/ViewToggle";
import { useGetStockAdjustmentsQuery } from "@/api/inventory/stockAdjustmentApi";
import { StockAdjustment, StockAdjustmentItem } from "@/types/stockAdjustment";
import { motion } from "framer-motion";
import Breadcrumbs from "@/components/shared/BreadScrumbs";
import { AutoSaveIcon } from "@/components/shared/icons";
import { BreadcrumbItem } from "@/components/shared/types";
import { StockAdjustmentTable } from "@/components/inventory/stocks/StockAdjustmentTable";
import { StockAdjustmentCards } from "@/components/inventory/stocks/StockAdjustmentCards";
import { getStatusInfo } from "@/components/inventory/types";
import Link from "next/link";

// Helper function to transform API data to StockAdjustmentRow format
const transformStockAdjustmentToRow = (
  stockAdjustment: StockAdjustment
): StockAdjustmentRow => {
  // Extract location name
  const location =
    stockAdjustment.warehouse_location_details?.location_name ||
    "Unknown Location";

  // Format the adjustment type (make it more readable)
  const adjustmentType =
    stockAdjustment.adjustment_type
      ?.replace(/_/g, " ")
      .toLowerCase()
      .replace(/\b\w/g, (l) => l.toUpperCase()) || "Unknown Type";

  // Format the date (assuming there's a created_on field or we use current date)
  const adjustedDate = new Date().toLocaleDateString(); // This should be replaced with actual date field

  return {
    id: stockAdjustment.id,
    adjustmentType: adjustmentType,
    location: location,
    adjustedDate: adjustedDate,
    status: stockAdjustment.status,
  };
};

export default function StockAdjustmentPage() {
  const searchParams = useSearchParams();
  const status = searchParams.get("status") as "draft" | "done" | null;

  const [query, setQuery] = useState("");
  const [currentView, setCurrentView] = useState<"grid" | "list">("list");

  const items: BreadcrumbItem[] = [
    { label: "Home", href: "/" },
    { label: "Inventory", href: "/inventory" },
    { label: "Stocks", href: "/inventory/stocks" },
    {
      label: `${
        status ? status.charAt(0).toUpperCase() + status.slice(1) : "All"
      } Adjustments`,
      href: `/inventory/stocks/adjustment?status=${status}`,
      current: true,
    },
  ];

  // Use the API query hook with status filter
  const {
    data: stockAdjustments = [],
    isLoading,
    isError,
    error,
  } = useGetStockAdjustmentsQuery({
    search: query || undefined,
    status: status || undefined, // Filter by status if provided
  });

  // Transform API data to match component interface
  const rows: StockAdjustmentRow[] = useMemo(() => {
    return stockAdjustments.map((stockAdjustment) => {
      const stockAdjustmentRow = transformStockAdjustmentToRow(stockAdjustment);
      return stockAdjustmentRow;
    });
  }, [stockAdjustments]);

  const handleViewChange = (view: "grid" | "list") => {
    setCurrentView(view);
  };

  // Get status info for display
  const statusInfo = status ? getStatusInfo(status) : null;

  // Show loading state
  if (isLoading) {
    return (
      <main className="min-h-screen text-gray-800 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p>Loading stock adjustments...</p>
        </div>
      </main>
    );
  }

  // Show error state
  if (isError) {
    return (
      <main className="min-h-screen text-gray-800 flex items-center justify-center">
        <div className="text-center text-red-600">
          <p>Error loading stock adjustments</p>
          <p className="text-sm mt-2">{error?.toString()}</p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen text-gray-800">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, ease: "easeOut", delay: 0.1 }}
      >
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
      </motion.div>
      {/* Header */}
      <div className="bg-white p-6 rounded-md flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mt-4 mr-4">
        <div className="flex items-center space-x-4">
          <div className="flex items-center gap-3">
            <h2 className="text-xl font-semibold">Stock Adjustments</h2>
            <div className="relative w-xs">
              <Input
                type="text"
                className="w-full h-11 pl-10 pr-4 border border-gray-300 rounded-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                aria-label="Search stock adjustments"
              />
              <SearchIcon
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                size={16}
              />
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-4">
          <Link href="/inventory/stocks/adjustment/new">
            <Button variant={"contained"}>New stock Adjustment</Button>
          </Link>
          <ViewToggle
            currentView={currentView}
            onViewChange={handleViewChange}
          />
        </div>
      </div>

      {/* Content */}
      {currentView === "list" ? (
        <StockAdjustmentTable rows={rows} query={query} />
      ) : (
        <StockAdjustmentCards stockAdjustments={rows} />
      )}
    </main>
  );
}
