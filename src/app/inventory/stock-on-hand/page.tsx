"use client";

import React, { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { PageGuard } from "@/components/auth/PageGuard";
import Breadcrumbs from "@/components/shared/BreadScrumbs";
import { BreadcrumbItem } from "@/components/shared/types";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search, Filter, Loader2, List, LayoutGrid } from "lucide-react";
import { useGetStockOnHandListQuery, StockOnHandProduct } from "@/api/inventory/stockOnHandApi";
import { useGetLocationsQuery } from "@/api/inventory/locationApi";

export default function StockOnHandListPage() {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedLocation, setSelectedLocation] = useState<string>("all");
  const [selectedStatus, setSelectedStatus] = useState<string>("all");

  const { data: locationsData } = useGetLocationsQuery({});
  const locations = useMemo(() => {
    if (!locationsData) return [];
    return Array.isArray(locationsData)
      ? locationsData
      : (locationsData as any).results || [];
  }, [locationsData]);

  const queryParams = useMemo(() => {
    const params: any = {};
    if (selectedLocation !== "all") params.location = selectedLocation;
    if (selectedStatus !== "all") params.status = selectedStatus;
    if (searchTerm.trim()) params.search = searchTerm.trim();
    return params;
  }, [selectedLocation, selectedStatus, searchTerm]);

  const { data, isLoading } = useGetStockOnHandListQuery(queryParams);

  const metrics = data?.metrics || {
    total_products: 0,
    products_in_stock: 0,
    low_stock: 0,
    out_of_stock: 0,
  };

  const products = data?.results || [];

  const breadcrumbsItems: BreadcrumbItem[] = [
    { label: "Home", href: "/" },
    { label: "Inventory", href: "/inventory" },
    { label: "Stock on Hand", href: "/inventory/stock-on-hand", current: true },
  ];

  const getStatusBadge = (statusKey: string, statusLabel: string) => {
    switch (statusKey) {
      case "in_stock":
        return (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-[#E8F8EE] text-[#1E8E3E]">
            {statusLabel}
          </span>
        );
      case "low_stock":
        return (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-[#FEF7E6] text-[#B06000]">
            {statusLabel}
          </span>
        );
      case "out_of_stock":
      default:
        return (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-[#FCE8E6] text-[#D93025]">
            {statusLabel}
          </span>
        );
    }
  };

  return (
    <PageGuard module="inventory" entitlement="view_inventory">
      <div className="flex flex-col flex-1 min-h-[calc(100vh-64px)] bg-[#F8FAFC] pb-16">
        <main className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-6 w-full flex flex-col gap-6">
          <Breadcrumbs items={breadcrumbsItems} />

          {/* Metric Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Total Products */}
            <div className="bg-white rounded-xl p-6 shadow-2xs border border-gray-100 flex flex-col gap-2">
              <span className="text-xs font-medium text-[#4285F4] uppercase tracking-wider">
                Total Products
              </span>
              <span className="text-3xl font-semibold text-[#1A73E8]">
                {metrics.total_products}
              </span>
            </div>

            {/* Products in Stock */}
            <div className="bg-white rounded-xl p-6 shadow-2xs border border-gray-100 flex flex-col gap-2">
              <span className="text-xs font-medium text-[#1E8E3E] uppercase tracking-wider">
                Products in Stock
              </span>
              <span className="text-3xl font-semibold text-[#1E8E3E]">
                {metrics.products_in_stock}
              </span>
            </div>

            {/* Low Stock */}
            <div className="bg-white rounded-xl p-6 shadow-2xs border border-gray-100 flex flex-col gap-2">
              <span className="text-xs font-medium text-[#F9AB00] uppercase tracking-wider">
                Low Stock
              </span>
              <span className="text-3xl font-semibold text-[#F9AB00]">
                {metrics.low_stock}
              </span>
            </div>

            {/* Out of Stock */}
            <div className="bg-white rounded-xl p-6 shadow-2xs border border-gray-100 flex flex-col gap-2">
              <span className="text-xs font-medium text-[#D93025] uppercase tracking-wider">
                Out of Stock
              </span>
              <span className="text-3xl font-semibold text-[#D93025]">
                {metrics.out_of_stock}
              </span>
            </div>
          </div>

          {/* Main Table Card */}
          <div className="bg-white rounded-xl shadow-2xs border border-gray-100 overflow-hidden">
            {/* Header & Controls */}
            <div className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-100">
              <h2 className="text-lg font-semibold text-gray-800">
                Stock on Hand
              </h2>

              <div className="flex items-center gap-3 flex-wrap">
                {/* Search Box */}
                <div className="relative w-64 md:w-80">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    type="text"
                    placeholder="Search product code, name, category..."
                    className="pl-9 bg-gray-50/50 border-gray-200 h-9 text-sm rounded-lg focus-visible:ring-1 focus-visible:ring-[#3B7CED] focus-visible:border-[#3B7CED]"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>

                {/* Location Filter */}
                <Select
                  value={selectedLocation}
                  onValueChange={setSelectedLocation}
                >
                  <SelectTrigger className="w-[180px] h-9 text-xs bg-white border-gray-200 rounded-lg">
                    <SelectValue placeholder="All Locations" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Locations</SelectItem>
                    {locations.map((loc: any) => (
                      <SelectItem key={loc.id} value={String(loc.id)}>
                        {loc.location_name || loc.location_code}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {/* Status Filter */}
                <Select
                  value={selectedStatus}
                  onValueChange={setSelectedStatus}
                >
                  <SelectTrigger className="w-[150px] h-9 text-xs bg-white border-gray-200 rounded-lg">
                    <SelectValue placeholder="All Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="in_stock">In Stock</SelectItem>
                    <SelectItem value="low_stock">Low Stock</SelectItem>
                    <SelectItem value="out_of_stock">Out of Stock</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <Table className="min-w-[900px] w-full">
                <TableHeader>
                  <TableRow className="bg-[#F8FAFC] border-b border-gray-100 hover:bg-[#F8FAFC]">
                    <TableHead className="py-3.5 px-6 font-semibold text-gray-500 text-xs uppercase tracking-wider">
                      Code
                    </TableHead>
                    <TableHead className="py-3.5 px-6 font-semibold text-gray-500 text-xs uppercase tracking-wider">
                      Product
                    </TableHead>
                    <TableHead className="py-3.5 px-6 font-semibold text-gray-500 text-xs uppercase tracking-wider">
                      Category
                    </TableHead>
                    <TableHead className="py-3.5 px-6 font-semibold text-gray-500 text-xs uppercase tracking-wider">
                      Unit
                    </TableHead>
                    <TableHead className="py-3.5 px-6 font-semibold text-gray-500 text-xs uppercase tracking-wider text-right">
                      Stock on Hand
                    </TableHead>
                    <TableHead className="py-3.5 px-6 font-semibold text-gray-500 text-xs uppercase tracking-wider text-right">
                      Reorder Point
                    </TableHead>
                    <TableHead className="py-3.5 px-6 font-semibold text-gray-500 text-xs uppercase tracking-wider text-center">
                      Status
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading ? (
                    <TableRow>
                      <TableCell
                        colSpan={7}
                        className="py-16 text-center text-gray-400 text-sm"
                      >
                        <div className="flex flex-col items-center justify-center gap-2">
                          <Loader2 className="w-6 h-6 animate-spin text-[#3B7CED]" />
                          <span>Loading stock on hand...</span>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : products.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={7}
                        className="py-16 text-center text-gray-500 text-sm"
                      >
                        No products found matching the criteria.
                      </TableCell>
                    </TableRow>
                  ) : (
                    products.map((item: StockOnHandProduct) => (
                      <TableRow
                        key={item.id}
                        onClick={() =>
                          router.push(
                            `/inventory/stock-on-hand/${encodeURIComponent(
                              item.code || item.id
                            )}`
                          )
                        }
                        className="border-b border-gray-100 hover:bg-blue-50/40 transition-colors cursor-pointer"
                      >
                        <TableCell className="py-4 px-6 font-medium text-gray-800 text-sm font-mono">
                          <Link
                            href={`/inventory/stock-on-hand/${encodeURIComponent(
                              item.code || item.id
                            )}`}
                            className="text-[#3B7CED] hover:underline"
                            onClick={(e) => e.stopPropagation()}
                          >
                            {item.code || `PRD-${item.id}`}
                          </Link>
                        </TableCell>
                        <TableCell className="py-4 px-6 text-gray-900 font-medium text-sm">
                          {item.product}
                        </TableCell>
                        <TableCell className="py-4 px-6 text-gray-600 text-sm">
                          {item.category}
                        </TableCell>
                        <TableCell className="py-4 px-6 text-gray-600 text-sm">
                          {item.unit}
                        </TableCell>
                        <TableCell className="py-4 px-6 text-right font-semibold text-gray-900 text-sm">
                          {item.stock_on_hand}
                        </TableCell>
                        <TableCell className="py-4 px-6 text-right text-gray-600 text-sm">
                          {item.reorder_point !== null && item.reorder_point !== undefined
                            ? item.reorder_point
                            : "—"}
                        </TableCell>
                        <TableCell className="py-4 px-6 text-center">
                          {getStatusBadge(item.status_key, item.status)}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </div>
        </main>
      </div>
    </PageGuard>
  );
}
