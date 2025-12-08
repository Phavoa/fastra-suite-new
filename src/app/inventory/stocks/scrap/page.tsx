"use client";

import React, { useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { StockAdjustmentRow } from "@/components/inventory/types";
import { Input } from "@/components/ui/input";
import { SearchIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ViewToggle } from "@/components/inventory/location/ViewToggle";
import { useGetScrapsQuery } from "@/api/inventory/scrapApi";
import { Scrap } from "@/types/scrap";
import { motion } from "framer-motion";
import Breadcrumbs from "@/components/shared/BreadScrumbs";
import { AutoSaveIcon } from "@/components/shared/icons";
import { BreadcrumbItem } from "@/components/shared/types";
import { StockAdjustmentTable } from "@/components/inventory/scrap/StockAdjustmentTable";
import { StockAdjustmentCards } from "@/components/inventory/scrap/StockAdjustmentCards";
import { getStatusInfo } from "@/components/inventory/types";
import Link from "next/link";

// Helper function to transform API data to StockAdjustmentRow format
const transformScrapToRow = (scrap: Scrap): StockAdjustmentRow => {
  // Extract location name
  const location =
    scrap.warehouse_location_details?.location_name || "Unknown Location";

  // Format the adjustment type (make it more readable)
  const adjustmentType =
    scrap.adjustment_type
      ?.replace(/_/g, " ")
      .toLowerCase()
      .replace(/\b\w/g, (l) => l.toUpperCase()) || "Unknown Type";

  // Format the date (using a placeholder since scrap doesn't have created_on)
  const adjustedDate = new Date().toLocaleDateString(); // This should be replaced with actual date field

  return {
    id: scrap.id,
    adjustmentType: adjustmentType,
    location: location,
    adjustedDate: adjustedDate,
    status: scrap.status,
  };
};

export default function ScrapPage() {
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
      } Scraps`,
      href: `/inventory/stocks/scrap?status=${status}`,
      current: true,
    },
  ];

  // Use the API query hook with status filter
  const {
    data: scraps = [],
    isLoading,
    isError,
    error,
  } = useGetScrapsQuery({
    search: query || undefined,
    status: status || undefined, // Filter by status if provided
  });

  // Transform API data to match component interface
  const rows: StockAdjustmentRow[] = useMemo(() => {
    return scraps.map((scrap) => {
      const scrapRow = transformScrapToRow(scrap);
      return scrapRow;
    });
  }, [scraps]);

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
          <p>Loading scraps...</p>
        </div>
      </main>
    );
  }

  // Show error state
  if (isError) {
    return (
      <main className="min-h-screen text-gray-800 flex items-center justify-center">
        <div className="text-center text-red-600">
          <p>Error loading scraps</p>
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
            <h2 className="text-xl font-semibold">Scraps</h2>
            <div className="relative w-xs">
              <Input
                type="text"
                className="w-full h-11 pl-10 pr-4 border border-gray-300 rounded-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                aria-label="Search scraps"
              />
              <SearchIcon
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                size={16}
              />
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-4">
          <Link href="/inventory/stocks/scrap/new">
            <Button variant={"contained"}>New Scrap</Button>
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
