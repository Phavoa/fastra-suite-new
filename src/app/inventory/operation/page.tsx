"use client";

import React, { useMemo, useState } from "react";
import { Input } from "@/components/ui/input";
import {
  Search,
  Package,
  Hammer,
  Trash2,
  LayoutGrid,
  Menu,
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { BreadcrumbItem } from "@/types/purchase";
import Breadcrumbs from "@/components/shared/BreadScrumbs";
import { AutoSaveIcon } from "@/components/shared/icons";
import { IncomingProductCards } from "@/components/inventory/operation/IncomingProductCards";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { PageGuard } from "@/components/auth/PageGuard";

const DUMMY_INCOMING_PRODUCTS: any[] = [
  { incoming_product_id: "WH-IN-0001", receipt_type: "vendor_receipt", status: "validated", related_po: "PO-2026-0089", created_at: "2026-06-25", supplier_details: { company_name: "Dangote Cement Plc" }, source_location_details: { location_name: "Supplier Location" }, destination_location_details: { location_name: "Main Warehouse - Site A" } },
  { incoming_product_id: "WH-IN-0002", receipt_type: "vendor_receipt", status: "draft", related_po: "PO-2026-0094", created_at: "2026-06-28", supplier_details: { company_name: "Julius Berger Steel" }, source_location_details: { location_name: "Supplier Location" }, destination_location_details: { location_name: "Main Warehouse - Site A" } },
  { incoming_product_id: "WH-IN-0003", receipt_type: "returns", status: "validated", related_po: "PO-2026-0042", created_at: "2026-06-27", supplier_details: { company_name: "Lafarge Africa Plc" }, source_location_details: { location_name: "Main Warehouse - Site A" }, destination_location_details: { location_name: "Supplier Location" } },
  { incoming_product_id: "WH-IN-0004", receipt_type: "vendor_receipt", status: "draft", related_po: "PO-2026-0101", created_at: "2026-07-01", supplier_details: { company_name: "BUA Cement Plc" }, source_location_details: { location_name: "Supplier Location" }, destination_location_details: { location_name: "Site B Warehouse" } },
  { incoming_product_id: "WH-IN-0005", receipt_type: "vendor_receipt", status: "validated", related_po: "PO-2026-0107", created_at: "2026-07-02", supplier_details: { company_name: "Coscharis Motors" }, source_location_details: { location_name: "Supplier Location" }, destination_location_details: { location_name: "Equipment Yard" } },
  { incoming_product_id: "WH-IN-0006", receipt_type: "internal_transfer", status: "draft", related_po: "PO-2026-0112", created_at: "2026-07-03", supplier_details: { company_name: "Cutix Plc" }, source_location_details: { location_name: "Site A Warehouse" }, destination_location_details: { location_name: "Site C Warehouse" } },
  { incoming_product_id: "WH-IN-0007", receipt_type: "returns", status: "canceled", related_po: "PO-2026-0055", created_at: "2026-07-04", supplier_details: { company_name: "Stanbic Supplies Ltd" }, source_location_details: { location_name: "Site B Warehouse" }, destination_location_details: { location_name: "Supplier Location" } },
  { incoming_product_id: "WH-IN-0008", receipt_type: "vendor_receipt", status: "validated", related_po: "PO-2026-0119", created_at: "2026-07-05", supplier_details: { company_name: "Nestle Nigeria Plc" }, source_location_details: { location_name: "Supplier Location" }, destination_location_details: { location_name: "Cold Storage - Site A" } },
  { incoming_product_id: "WH-IN-0009", receipt_type: "vendor_receipt", status: "draft", related_po: "PO-2026-0123", created_at: "2026-07-06", supplier_details: { company_name: "WAPCO Nigeria" }, source_location_details: { location_name: "Supplier Location" }, destination_location_details: { location_name: "Main Warehouse - Site A" } },
  { incoming_product_id: "WH-IN-0010", receipt_type: "internal_transfer", status: "validated", related_po: "PO-2026-0128", created_at: "2026-07-07", supplier_details: { company_name: "Nigerian Breweries" }, source_location_details: { location_name: "Main Warehouse - Site A" }, destination_location_details: { location_name: "Site D Warehouse" } },
  { incoming_product_id: "WH-IN-0011", receipt_type: "vendor_receipt", status: "validated", related_po: "PO-2026-0133", created_at: "2026-07-08", supplier_details: { company_name: "Total Energies Nigeria" }, source_location_details: { location_name: "Supplier Location" }, destination_location_details: { location_name: "Fuel Depot - Site A" } },
  { incoming_product_id: "WH-IN-0012", receipt_type: "returns", status: "draft", related_po: "PO-2026-0078", created_at: "2026-07-09", supplier_details: { company_name: "Flour Mills Nigeria" }, source_location_details: { location_name: "Site C Warehouse" }, destination_location_details: { location_name: "Supplier Location" } },
  { incoming_product_id: "WH-IN-0013", receipt_type: "vendor_receipt", status: "validated", related_po: "PO-2026-0141", created_at: "2026-07-10", supplier_details: { company_name: "IPMAN Petroleum" }, source_location_details: { location_name: "Supplier Location" }, destination_location_details: { location_name: "Fuel Depot - Site B" } },
  { incoming_product_id: "WH-IN-0014", receipt_type: "vendor_receipt", status: "canceled", related_po: "PO-2026-0144", created_at: "2026-07-11", supplier_details: { company_name: "Guinness Nigeria Plc" }, source_location_details: { location_name: "Supplier Location" }, destination_location_details: { location_name: "Site B Warehouse" } },
  { incoming_product_id: "WH-IN-0015", receipt_type: "internal_transfer", status: "validated", related_po: "PO-2026-0150", created_at: "2026-07-12", supplier_details: { company_name: "Zenon Petroleum" }, source_location_details: { location_name: "Site A Warehouse" }, destination_location_details: { location_name: "Main Warehouse - Site A" } },
  { incoming_product_id: "WH-IN-0016", receipt_type: "vendor_receipt", status: "draft", related_po: "PO-2026-0157", created_at: "2026-07-13", supplier_details: { company_name: "Unilever Nigeria" }, source_location_details: { location_name: "Supplier Location" }, destination_location_details: { location_name: "Site C Warehouse" } },
  { incoming_product_id: "WH-IN-0017", receipt_type: "returns", status: "validated", related_po: "PO-2026-0061", created_at: "2026-07-14", supplier_details: { company_name: "Seplat Energy" }, source_location_details: { location_name: "Site D Warehouse" }, destination_location_details: { location_name: "Supplier Location" } },
  { incoming_product_id: "WH-IN-0018", receipt_type: "vendor_receipt", status: "draft", related_po: "PO-2026-0163", created_at: "2026-07-14", supplier_details: { company_name: "Oando Plc" }, source_location_details: { location_name: "Supplier Location" }, destination_location_details: { location_name: "Fuel Depot - Site A" } },
  { incoming_product_id: "WH-IN-0019", receipt_type: "internal_transfer", status: "validated", related_po: "PO-2026-0169", created_at: "2026-07-15", supplier_details: { company_name: "Transcorp Hilton" }, source_location_details: { location_name: "Main Warehouse - Site A" }, destination_location_details: { location_name: "Site B Warehouse" } },
  { incoming_product_id: "WH-IN-0020", receipt_type: "vendor_receipt", status: "canceled", related_po: "PO-2026-0174", created_at: "2026-07-16", supplier_details: { company_name: "Access Bank Plc" }, source_location_details: { location_name: "Supplier Location" }, destination_location_details: { location_name: "Main Warehouse - Site A" } },
];


const STATUS_TABS = [
  { label: "All", value: "all" },
  { label: "Validated", value: "validated" },
  { label: "Draft", value: "draft" },
  { label: "Canceled", value: "canceled" },
];

// StatusCards-style tiles: horizontal row, icon+label top, big colored count below, border-r dividers
function OperationsNavigationTiles({
  incomingCount,
}: {
  incomingCount: number;
}) {
  const operationModules = [
    {
      title: "Pending Incoming Products",
      href: "/inventory/operation",
      count: incomingCount,
      icon: Package,
      color: "#3B7CED",
    },
    {
      title: "Material Consumption",
      href: "/inventory/operation/material-consumption",
      count: 2,
      icon: Hammer,
      color: "#F0B401",
    },
    {
      title: "Scrap Recording",
      href: "/inventory/operation/scrap",
      count: 1,
      icon: Trash2,
      color: "#E43D2B",
    },
  ];

  return (
    <div className="bg-white border border-gray-100 rounded-lg shadow-2xs overflow-hidden">
      <div className="grid grid-cols-1 sm:grid-cols-3">
        {operationModules.map((mod, idx) => (
          <Link
            key={mod.title}
            href={mod.href}
            className={`p-5 cursor-pointer hover:bg-gray-50 transition-colors group flex flex-col ${
              idx < operationModules.length - 1
                ? "border-b sm:border-b-0 sm:border-r border-gray-100"
                : ""
            }`}
          >
            <div className="flex items-center gap-2 mb-4">
              <mod.icon
                className="w-[18px] h-[18px] shrink-0"
                style={{ color: mod.color }}
              />
              <span className="text-sm font-medium text-gray-500 group-hover:text-gray-700 transition-colors leading-tight">
                {mod.title}
              </span>
            </div>
            <div
              className="text-[2rem] font-bold"
              style={{ color: mod.color }}
            >
              {mod.count}
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

const ITEMS_PER_PAGE = 10;

export default function OperationPage() {
  const [query, setQuery] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [currentView, setCurrentView] = useState<"list" | "grid">("list");
  const [currentPage, setCurrentPage] = useState(1);

  const allIncomingProducts = DUMMY_INCOMING_PRODUCTS;

  const filteredProducts = useMemo(() => {
    return allIncomingProducts.filter((item) => {
      const matchesStatus =
        selectedStatus === "all" || item.status === selectedStatus;

      const lowerQuery = query.toLowerCase();
      const matchesSearch =
        !query ||
        item.incoming_product_id.toLowerCase().includes(lowerQuery) ||
        item.receipt_type.toLowerCase().includes(lowerQuery) ||
        item.status.toLowerCase().includes(lowerQuery) ||
        item.supplier_details?.company_name?.toLowerCase().includes(lowerQuery) ||
        item.source_location_details?.location_name?.toLowerCase().includes(lowerQuery) ||
        item.destination_location_details?.location_name?.toLowerCase().includes(lowerQuery) ||
        item.related_po?.toLowerCase().includes(lowerQuery);

      return matchesStatus && matchesSearch;
    });
  }, [allIncomingProducts, query, selectedStatus]);

  const totalPages = Math.max(1, Math.ceil(filteredProducts.length / ITEMS_PER_PAGE));
  const incomingProducts = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredProducts.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredProducts, currentPage]);

  // Reset to page 1 when filters change
  const handleStatusChange = (status: string) => {
    setSelectedStatus(status);
    setCurrentPage(1);
  };
  const handleQueryChange = (q: string) => {
    setQuery(q);
    setCurrentPage(1);
  };

  const highlightText = (text: string, query: string) => {
    if (!query) return text;

    const regex = new RegExp(
      `(${query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")})`,
      "gi",
    );
    const parts = text.split(regex);

    return parts.map((part, index) =>
      regex.test(part) ? (
        <span key={index} className="bg-yellow-200 text-yellow-800 font-medium">
          {part}
        </span>
      ) : (
        part
      ),
    );
  };

  const breadcrumbsItem: BreadcrumbItem[] = [
    { label: "Home", href: "/" },
    { label: "Inventory", href: "/inventory" },
    {
      label: "Operation",
      href: "/inventory/operation",
      current: true,
    },
  ];

  const handleViewChange = (view: "list" | "grid") => {
    setCurrentView(view);
  };

  return (
    <PageGuard application="inventory" module="incomingproduct">
      {/* Two-tone: gray page canvas */}
      <div className="flex flex-col flex-1 min-h-[calc(100vh-64px)] bg-[#F6F9FC] relative pb-20">
        <main className="max-w-[1400px] mx-auto px-4 sm:px-6 py-6 w-full flex flex-col gap-6">
          {/* Breadcrumbs — sits on gray */}
          <Breadcrumbs
            items={breadcrumbsItem}
            action={
              <Button
                variant="ghost"
                className="text-sm text-gray-400 flex items-center gap-2 hover:text-[#3B7CED] transition-colors duration-200"
              >
                Autosaved <AutoSaveIcon />
              </Button>
            }
          />

          {/* StatusCards-style tiles */}
          <OperationsNavigationTiles
            incomingCount={allIncomingProducts.length}
          />

          {/* White section 1: top bar + status pills */}
          <div className="bg-white rounded-lg shadow-2xs border border-gray-100 overflow-hidden">
            {/* Top Bar: title + search + actions */}
            <div className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <h2 className="text-xl font-semibold text-[#32325D] shrink-0">
                  Incoming Products
                </h2>
                <div className="relative w-[240px] md:w-[320px]">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    type="text"
                    placeholder="Search receipt ID, type, or vendor..."
                    className="pl-9 bg-white border-gray-200 h-9 text-sm rounded-lg focus-visible:ring-1 focus-visible:ring-[#3B7CED] focus-visible:border-[#3B7CED] text-[#32325D]"
                    value={query}
                    onChange={(e) => handleQueryChange(e.target.value)}
                    aria-label="Search incoming products"
                  />
                </div>
              </div>

              <div className="flex items-center gap-3 self-end sm:self-auto">
                <Link href="/inventory/operation/incoming_product/new">
                  <Button className="bg-[#3B7CED] hover:bg-[#3065c3] text-white h-9 px-4 rounded-md font-medium text-sm shadow-2xs transition-all">
                    New Incoming Product
                  </Button>
                </Link>
                <div className="flex items-center border border-gray-200 rounded-lg p-0.5 bg-white gap-0.5 shadow-2xs">
                  <button
                    type="button"
                    onClick={() => handleViewChange("grid")}
                    className={`p-1.5 rounded-md transition-all flex items-center justify-center cursor-pointer ${
                      currentView === "grid"
                        ? "bg-blue-50 text-[#3B7CED]"
                        : "text-gray-400 hover:text-gray-600 hover:bg-gray-50"
                    }`}
                    title="Grid View"
                  >
                    <LayoutGrid className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleViewChange("list")}
                    className={`p-1.5 rounded-md transition-all flex items-center justify-center cursor-pointer ${
                      currentView === "list"
                        ? "bg-blue-50 text-[#3B7CED]"
                        : "text-gray-400 hover:text-gray-600 hover:bg-gray-50"
                    }`}
                    title="List View"
                  >
                    <Menu className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* Status Filter Pills */}
            <div className="px-4 pb-4 flex items-center gap-2 flex-wrap">
              {STATUS_TABS.map((tab) => {
                const isSelected = selectedStatus === tab.value;
                return (
                  <button
                    key={tab.value}
                    type="button"
                    onClick={() => handleStatusChange(tab.value)}
                    className={`px-4 py-1.5 rounded-full text-xs transition-all duration-150 cursor-pointer ${
                      isSelected
                        ? "bg-[#E8F0FE] text-[#1A73E8] font-semibold"
                        : "bg-[#E9ECEF] text-[#8898AA] font-normal hover:bg-gray-200"
                    }`}
                  >
                    {tab.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* White section 2: table (separate card below) */}
          <div className="bg-white rounded-lg shadow-2xs border border-gray-100 overflow-hidden">
            {/* Conditional rendering based on current view */}
            {currentView === "list" ? (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-[#F6F9FC] hover:bg-[#F6F9FC] border-b border-gray-100">
                      <TableHead className="font-semibold text-[#8898AA] text-[11.5px] py-3.5 px-6 whitespace-nowrap">
                        Receipt ID
                      </TableHead>
                      <TableHead className="font-semibold text-[#8898AA] text-[11.5px] py-3.5 px-6 whitespace-nowrap">
                        Receipt Type
                      </TableHead>
                      <TableHead className="font-semibold text-[#8898AA] text-[11.5px] py-3.5 px-6 whitespace-nowrap">
                        Supplier
                      </TableHead>
                      <TableHead className="font-semibold text-[#8898AA] text-[11.5px] py-3.5 px-6 whitespace-nowrap">
                        Source Location
                      </TableHead>
                      <TableHead className="font-semibold text-[#8898AA] text-[11.5px] py-3.5 px-6 whitespace-nowrap">
                        Destination
                      </TableHead>
                      <TableHead className="font-semibold text-[#8898AA] text-[11.5px] py-3.5 px-6 whitespace-nowrap">
                        Status
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {incomingProducts.map((item: any) => (
                      <TableRow
                        key={item.incoming_product_id}
                        className="cursor-pointer hover:bg-gray-50/50 border-b border-[#E9ECEF] transition-colors"
                        onClick={() => {}}
                      >
                        <TableCell className="text-[#32325D] font-semibold text-sm py-3.5 px-6 whitespace-nowrap">
                          <Link
                            href={`/inventory/operation/incoming_product/${item.incoming_product_id}`}
                            className="text-[#3B7CED] hover:underline font-semibold"
                            onClick={(e) => e.stopPropagation()}
                          >
                            {highlightText(item.incoming_product_id, query)}
                          </Link>
                        </TableCell>
                        <TableCell className="text-[#525F7F] font-normal text-sm py-3.5 px-6 whitespace-nowrap capitalize">
                          {highlightText(
                            item.receipt_type.replace(/_/g, " "),
                            query,
                          )}
                        </TableCell>
                        <TableCell className="text-[#525F7F] font-normal text-sm py-3.5 px-6 whitespace-nowrap">
                          {highlightText(
                            item.supplier_details?.company_name || "N/A",
                            query,
                          )}
                        </TableCell>
                        <TableCell className="text-[#525F7F] font-normal text-sm py-3.5 px-6 whitespace-nowrap">
                          {highlightText(
                            item.source_location_details?.location_name ||
                              "N/A",
                            query,
                          )}
                        </TableCell>
                        <TableCell className="text-[#525F7F] font-normal text-sm py-3.5 px-6 whitespace-nowrap">
                          {highlightText(
                            item.destination_location_details?.location_name ||
                              "N/A",
                            query,
                          )}
                        </TableCell>
                        <TableCell className="py-3.5 px-6 whitespace-nowrap">
                          <span
                            className={`inline-flex items-center justify-center px-2.5 py-0.5 rounded-full text-xs font-semibold min-w-[80px] ${
                              item.status === "validated"
                                ? "bg-[#E2F2E9] text-[#1E8E3E]"
                                : item.status === "draft"
                                  ? "bg-[#E8F0FE] text-[#1A73E8]"
                                  : item.status === "canceled"
                                    ? "bg-[#FCE8E6] text-[#C5221F]"
                                    : "bg-[#E9ECEF] text-[#8898AA]"
                            }`}
                          >
                            {item.status === "validated"
                              ? "Validated"
                              : item.status === "draft"
                                ? "Draft"
                                : item.status === "canceled"
                                  ? "Canceled"
                                  : item.status}
                          </span>
                        </TableCell>
                      </TableRow>
                    ))}
                    {incomingProducts.length === 0 && (
                      <TableRow>
                        <TableCell
                          colSpan={6}
                          className="text-center py-8 text-[#8898AA] text-sm"
                        >
                          No incoming products found matching your search.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <div className="p-4">
                <IncomingProductCards
                  incomingProducts={incomingProducts}
                  query={query}
                />
              </div>
            )}

            {/* Pagination footer */}
            <div className="px-6 py-3.5 flex items-center justify-between border-t border-gray-100 bg-white text-sm text-[#8898AA]">
              <span>
                Showing{" "}
                <span className="font-semibold text-[#32325D]">
                  {filteredProducts.length === 0
                    ? 0
                    : (currentPage - 1) * ITEMS_PER_PAGE + 1}
                </span>{" "}
                –{" "}
                <span className="font-semibold text-[#32325D]">
                  {Math.min(currentPage * ITEMS_PER_PAGE, filteredProducts.length)}
                </span>{" "}
                of{" "}
                <span className="font-semibold text-[#32325D]">
                  {filteredProducts.length}
                </span>{" "}
                results
              </span>

              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="px-3 py-1 rounded-md border border-gray-200 text-xs font-medium text-[#32325D] hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  Prev
                </button>

                {Array.from({ length: totalPages }, (_, i) => i + 1)
                  .filter(
                    (p) =>
                      p === 1 ||
                      p === totalPages ||
                      Math.abs(p - currentPage) <= 1,
                  )
                  .reduce<(number | "...")[]>((acc, p, idx, arr) => {
                    if (idx > 0 && p - (arr[idx - 1] as number) > 1) {
                      acc.push("...");
                    }
                    acc.push(p);
                    return acc;
                  }, [])
                  .map((item, idx) =>
                    item === "..." ? (
                      <span key={`ellipsis-${idx}`} className="px-2 text-[#8898AA]">
                        …
                      </span>
                    ) : (
                      <button
                        key={item}
                        type="button"
                        onClick={() => setCurrentPage(item as number)}
                        className={`w-8 h-7 rounded-md text-xs font-medium transition-colors ${
                          currentPage === item
                            ? "bg-[#3B7CED] text-white"
                            : "border border-gray-200 text-[#32325D] hover:bg-gray-50"
                        }`}
                      >
                        {item}
                      </button>
                    ),
                  )}

                <button
                  type="button"
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="px-3 py-1 rounded-md border border-gray-200 text-xs font-medium text-[#32325D] hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        </main>
      </div>
    </PageGuard>
  );
}

