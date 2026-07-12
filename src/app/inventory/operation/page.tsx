"use client";

import React, { useMemo, useState } from "react";
import { Input } from "@/components/ui/input";
import { Search, Package, Hammer, Trash2, ArrowRight } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { BreadcrumbItem } from "@/types/purchase";
import Breadcrumbs from "@/components/shared/BreadScrumbs";
import { AutoSaveIcon } from "@/components/shared/icons";
import { ViewToggle } from "@/components/inventory/location/ViewToggle";
import { ViewType } from "@/types/purchase";
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
  {
    incoming_product_id: "WH-IN-0001",
    receipt_type: "vendor_receipt",
    status: "validated",
    related_po: "PO-2026-0089",
    created_at: "2026-06-25T10:00:00Z",
    supplier_details: { company_name: "Dangote Cement Plc" },
    source_location_details: { location_name: "Supplier Location" },
    destination_location_details: { location_name: "Main Warehouse - Site A" },
    accepted_qty: "500 Bags",
    rejected_qty: 0,
    has_backorder: false,
  },
  {
    incoming_product_id: "WH-IN-0002",
    receipt_type: "vendor_receipt",
    status: "draft",
    related_po: "PO-2026-0094",
    created_at: "2026-06-28T14:30:00Z",
    supplier_details: { company_name: "Julius Berger Steel" },
    source_location_details: { location_name: "Supplier Location" },
    destination_location_details: { location_name: "Main Warehouse - Site A" },
    accepted_qty: "18 Tonnes",
    rejected_qty: 2,
    has_backorder: true,
  },
  {
    incoming_product_id: "WH-IN-0003",
    receipt_type: "returns",
    status: "validated",
    related_po: "PO-2026-0042",
    created_at: "2026-06-27T09:15:00Z",
    supplier_details: { company_name: "Lafarge Africa Plc" },
    source_location_details: { location_name: "Main Warehouse - Site A" },
    destination_location_details: { location_name: "Supplier Location" },
    accepted_qty: "50 Bags",
    rejected_qty: 0,
    has_backorder: false,
  },
];

function OperationsNavigationTiles({ incomingCount }: { incomingCount: number }) {
  const operationModules = [
    {
      title: "Incoming Products",
      description: "Confirm goods received on-site against approved Purchase Orders.",
      href: "/inventory/operation",
      count: incomingCount,
      icon: Package,
      color: "text-blue-500",
      bg: "bg-blue-50",
    },
    {
      title: "Material Consumption",
      description: "Record materials consumed from stock against specific project WBS.",
      href: "/inventory/operation/material-consumption",
      count: 2,
      icon: Hammer,
      color: "text-amber-500",
      bg: "bg-amber-50",
    },
    {
      title: "Scrap Recording",
      description: "Record deliberate removal of damaged or lost items from inventory.",
      href: "/inventory/operation/scrap",
      count: 1,
      icon: Trash2,
      color: "text-red-500",
      bg: "bg-red-50",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      {operationModules.map((mod) => (
        <Link
          key={mod.title}
          href={mod.href}
          className="bg-white p-6 rounded border border-gray-200 shadow-sm hover:border-[#3B7CED] transition-all flex flex-col justify-between group"
        >
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className={`w-10 h-10 rounded-full ${mod.bg} flex items-center justify-center`}>
                <mod.icon className={`w-5 h-5 ${mod.color}`} />
              </div>
              <span className="text-2xl font-bold text-gray-900 font-mono">{mod.count}</span>
            </div>
            <h3 className="text-base font-semibold text-gray-900 mb-1 group-hover:text-[#3B7CED] transition-colors">
              {mod.title}
            </h3>
            <p className="text-xs text-gray-500 leading-relaxed">
              {mod.description}
            </p>
          </div>
          <div className="mt-6 flex items-center text-xs font-medium text-[#3B7CED]">
            Open <ArrowRight className="w-3.5 h-3.5 ml-1 group-hover:translate-x-1 transition-transform" />
          </div>
        </Link>
      ))}
    </div>
  );
}

export default function OperationPage() {
  const [query, setQuery] = useState("");
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [currentView, setCurrentView] = useState<ViewType>("list");

  const allIncomingProducts = DUMMY_INCOMING_PRODUCTS;

  const incomingProducts = useMemo(() => {
    if (!query) return allIncomingProducts;

    const lowerQuery = query.toLowerCase();
    return allIncomingProducts.filter((item) => {
      return (
        item.incoming_product_id.toLowerCase().includes(lowerQuery) ||
        item.receipt_type.toLowerCase().includes(lowerQuery) ||
        item.status.toLowerCase().includes(lowerQuery) ||
        item.supplier_details?.company_name
          ?.toLowerCase()
          .includes(lowerQuery) ||
        item.source_location_details?.location_name
          ?.toLowerCase()
          .includes(lowerQuery) ||
        item.destination_location_details?.location_name
          ?.toLowerCase()
          .includes(lowerQuery) ||
        item.related_po?.toLowerCase().includes(lowerQuery)
      );
    });
  }, [allIncomingProducts, query]);

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

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedItems(
        incomingProducts.map((item) => item.incoming_product_id),
      );
    } else {
      setSelectedItems([]);
    }
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

  const handleSelectItem = (id: string, checked: boolean) => {
    if (checked) {
      setSelectedItems((prev) => [...prev, id]);
    } else {
      setSelectedItems((prev) => prev.filter((item) => item !== id));
    }
  };

  const handleViewChange = (view: ViewType) => {
    setCurrentView(view);
  };

  return (
    <PageGuard application="inventory" module="incomingproduct">
      <div className="flex flex-col flex-1 min-h-[calc(100vh-64px)] bg-white relative pb-20">
        <main className="max-w-[1400px] mx-auto px-4 sm:px-6 py-6 w-full flex flex-col gap-6">
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

          <div className="flex items-center justify-between py-4 mb-2">
            <h1 className="text-2xl font-semibold text-gray-900">Inventory Operations</h1>
          </div>

          <OperationsNavigationTiles incomingCount={allIncomingProducts.length} />

          {/* Top Bar Controls for Incoming Products List */}
          <div className="flex flex-col md:flex-row md:items-center justify-between bg-white p-4 rounded border border-gray-200 shadow-sm gap-4 mb-6">
            <div className="flex flex-col sm:flex-row sm:items-center gap-4 flex-1">
              <h2 className="text-lg font-semibold text-gray-800 shrink-0">Incoming Products</h2>

              <div className="relative w-full max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  type="text"
                  className="w-full pl-9 pr-4 bg-gray-50 border-gray-200 rounded h-9 text-sm focus:bg-white focus:ring-1 focus:ring-[#3B7CED]"
                  placeholder="Search receipt ID, type, status, or vendor..."
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  aria-label="Search incoming products"
                />
              </div>
            </div>

            <div className="flex items-center gap-3 justify-end pt-2 md:pt-0 border-t md:border-t-0 border-gray-100">
              <Link href="/inventory/operation/incoming_product/new" className="w-full sm:w-auto">
                <Button className="bg-[#3B7CED] hover:bg-[#3065c3] text-white h-9 text-sm w-full sm:w-auto">
                  New Incoming Product
                </Button>
              </Link>
              <ViewToggle
                currentView={currentView}
                onViewChange={handleViewChange}
              />
            </div>
          </div>

          {/* Conditional rendering based on current view */}
          {currentView === "list" ? (
            <div className="bg-white rounded border border-gray-200 shadow-sm overflow-hidden">
              <div className="overflow-x-auto w-full">
                <Table className="min-w-[800px] w-full">
                  <TableHeader>
                    <TableRow className="bg-[#F8F9FA] hover:bg-[#F8F9FA] border-b-gray-100">
                      <TableHead className="w-12 pl-4 py-3">
                        <Checkbox
                          checked={
                            selectedItems.length === incomingProducts.length &&
                            incomingProducts.length > 0
                          }
                          onCheckedChange={handleSelectAll}
                        />
                      </TableHead>
                      <TableHead className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Request ID
                      </TableHead>
                      <TableHead className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Receipt Type
                      </TableHead>
                      <TableHead className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Source Location
                      </TableHead>
                      <TableHead className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Destination Location
                      </TableHead>
                      <TableHead className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Inspection Summary
                      </TableHead>
                      <TableHead className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Status
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {incomingProducts.map((item: any) => (
                      <TableRow
                        key={item.incoming_product_id}
                        className="hover:bg-gray-50 border-b-gray-100 transition-colors"
                      >
                        <TableCell className="pl-4 py-3.5">
                          <Checkbox
                            checked={selectedItems.includes(item.incoming_product_id)}
                            onCheckedChange={(checked) =>
                              handleSelectItem(
                                item.incoming_product_id,
                                checked as boolean,
                              )
                            }
                          />
                        </TableCell>
                        <TableCell className="px-4 py-3.5 text-xs font-mono font-semibold text-gray-900">
                          <Link
                            href={`/inventory/operation/incoming_product/${item.incoming_product_id}`}
                            className="text-[#3B7CED] hover:underline"
                          >
                            {highlightText(item.incoming_product_id, query)}
                          </Link>
                        </TableCell>
                        <TableCell className="px-4 py-3.5 text-sm text-gray-700 capitalize">
                          {highlightText(item.receipt_type.replace(/_/g, " "), query)}
                        </TableCell>
                        <TableCell className="px-4 py-3.5 text-sm text-gray-600">
                          {highlightText(
                            item.source_location_details?.location_name || "N/A",
                            query,
                          )}
                        </TableCell>
                        <TableCell className="px-4 py-3.5 text-sm text-gray-600">
                          {highlightText(
                            item.destination_location_details?.location_name || "N/A",
                            query,
                          )}
                        </TableCell>
                        <TableCell className="px-4 py-3.5 text-xs">
                          {item.accepted_qty !== undefined ? (
                            <div className="flex flex-col gap-0.5">
                              <span className="font-semibold text-green-600">✓ {item.accepted_qty} Accepted</span>
                              {item.rejected_qty > 0 && (
                                <span className="font-semibold text-red-600">✕ {item.rejected_qty} Rejected</span>
                              )}
                              {item.has_backorder && (
                                <span className="text-[10px] text-amber-700 font-semibold bg-amber-50 px-1.5 py-0.5 rounded w-fit">Backorder Created</span>
                              )}
                            </div>
                          ) : (
                            <span className="text-gray-400">—</span>
                          )}
                        </TableCell>
                        <TableCell className="px-4 py-3.5 text-sm">
                          <span
                            className={`px-2.5 py-1 rounded-full text-xs font-medium capitalize inline-block ${
                              item.status === "validated"
                                ? "bg-green-50 text-green-700 border border-green-200"
                                : item.status === "draft"
                                  ? "bg-blue-50 text-blue-700 border border-blue-200"
                                  : item.status === "canceled"
                                    ? "bg-red-50 text-red-700 border border-red-200"
                                    : "bg-gray-100 text-gray-600 border border-gray-200"
                            }`}
                          >
                            {item.status}
                          </span>
                        </TableCell>
                      </TableRow>
                    ))}
                    {incomingProducts.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center py-8 text-gray-500 text-sm">
                          No incoming products found matching your search.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </div>
          ) : (
            <IncomingProductCards
              incomingProducts={incomingProducts}
              query={query}
            />
          )}
        </main>
      </div>
    </PageGuard>
  );
}

