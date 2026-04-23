"use client";

import React, { useMemo, useState } from "react";
import { Input } from "@/components/ui/input";
import { SearchIcon } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { BreadcrumbItem } from "@/types/purchase";
import Breadcrumbs from "@/components/shared/BreadScrumbs";
import { AutoSaveIcon } from "@/components/shared/icons";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useGetBackOrdersQuery } from "@/api/inventory/backOrderApi";
import { PageGuard } from "@/components/auth/PageGuard";
import { extractErrorMessage } from "@/lib/utils";
import type { BackOrder } from "@/types/backOrder";
import { StaggerContainer, SlideUp, FadeIn } from "@/components/shared/AnimatedWrapper";

export default function BackOrderListPage() {
  const [query, setQuery] = useState("");
  const [selectedItems, setSelectedItems] = useState<string[]>([]);

  const {
    data: allBackOrders = [],
    isLoading,
    isError,
    error,
  } = useGetBackOrdersQuery({});

  const backOrders = useMemo(() => {
    if (!query) return allBackOrders;
    const lowerQuery = query.toLowerCase();
    return allBackOrders.filter((item) => {
      return (
        item.backorder_id?.toLowerCase().includes(lowerQuery) ||
        item.receipt_type?.toLowerCase().includes(lowerQuery) ||
        item.status?.toLowerCase().includes(lowerQuery) ||
        item.source_location_details?.location_name?.toLowerCase().includes(lowerQuery) ||
        item.destination_location_details?.location_name?.toLowerCase().includes(lowerQuery)
      );
    });
  }, [allBackOrders, query]);

  const highlightText = (text: string, query: string) => {
    if (!query || !text) return text;
    const regex = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")})`, "gi");
    const parts = text.split(regex);
    return parts.map((part, index) =>
      regex.test(part) ? (
        <span key={index} className="bg-yellow-200 text-yellow-800 font-medium">
          {part}
        </span>
      ) : (
        part
      )
    );
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedItems(backOrders.map((item) => item.backorder_id));
    } else {
      setSelectedItems([]);
    }
  };

  const handleSelectItem = (id: string, checked: boolean) => {
    if (checked) {
      setSelectedItems((prev) => [...prev, id]);
    } else {
      setSelectedItems((prev) => prev.filter((item) => item !== id));
    }
  };

  const breadcrumbsItem: BreadcrumbItem[] = [
    { label: "Home", href: "/" },
    { label: "Inventory", href: "/inventory" },
    { label: "Operation", href: "/inventory/operation" },
    { label: "Back Order", href: "/inventory/operation/back_order", current: true },
  ];

  if (isLoading) {
    return (
      <PageGuard application="inventory" module="backorder">
        <main className="min-h-screen text-gray-800 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <p>Loading back orders...</p>
          </div>
        </main>
      </PageGuard>
    );
  }

  if (isError) {
    return (
      <PageGuard application="inventory" module="backorder">
        <main className="min-h-screen text-gray-800 flex items-center justify-center">
          <div className="text-center text-red-600 px-4">
            <p className="text-lg font-semibold">Error loading back orders</p>
            <p className="text-sm mt-2">{extractErrorMessage(error, "An unknown error occurred")}</p>
            <Button onClick={() => window.location.reload()} variant="outline" className="mt-6">
              Try Again
            </Button>
          </div>
        </main>
      </PageGuard>
    );
  }

  return (
    <PageGuard application="inventory" module="backorder">
      <main className="min-h-screen text-gray-800 mr-4">
        <StaggerContainer>
          <SlideUp>
            <Breadcrumbs
              items={breadcrumbsItem}
              action={
                <Button variant="ghost" className="text-sm text-gray-400 flex items-center gap-2 hover:text-[#3B7CED] transition-colors duration-200">
                  Autosaved <AutoSaveIcon />
                </Button>
              }
            />
          </SlideUp>

          <SlideUp>
            <div className="bg-white p-6 rounded-md flex flex-col lg:flex-row items-center justify-between gap-4 mt-6 border border-gray-100 shadow-sm">
              <div className="flex items-center space-x-4">
                <h2 className="text-lg font-medium text-[#3B7CED]">Back Orders</h2>
                <div className="relative w-xs">
                  <Input
                    type="text"
                    className="w-full pl-10 pr-4 border border-gray-300 rounded-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Search"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                  />
                  <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                </div>
              </div>
            </div>
          </SlideUp>

          <FadeIn>
            <div className="bg-white rounded-md shadow-sm border border-gray-100 mt-6 overflow-hidden">
              <Table>
                <TableHeader className="bg-[#F6F7F8]">
                  <TableRow>
                    <TableHead className="w-12 px-4 py-3 text-center">
                      <Checkbox
                        checked={selectedItems.length === backOrders.length && backOrders.length > 0}
                        onCheckedChange={handleSelectAll}
                      />
                    </TableHead>
                    <TableHead className="px-4 py-3 text-left text-sm text-gray-600 font-medium">Backorder ID</TableHead>
                    <TableHead className="px-4 py-3 text-left text-sm text-gray-600 font-medium">Receipt Type</TableHead>
                    <TableHead className="px-4 py-3 text-left text-sm text-gray-600 font-medium">Source Location</TableHead>
                    <TableHead className="px-4 py-3 text-left text-sm text-gray-600 font-medium">Destination Location</TableHead>
                    <TableHead className="px-4 py-3 text-left text-sm text-gray-600 font-medium">Status</TableHead>
                    <TableHead className="px-4 py-3 text-left text-sm text-gray-600 font-medium">Date Created</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {backOrders.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="h-24 text-center text-gray-500">
                        No back orders found.
                      </TableCell>
                    </TableRow>
                  ) : (
                    backOrders.map((item: BackOrder) => (
                      <TableRow key={item.backorder_id} className="hover:bg-gray-50 transition-colors border-b border-gray-50">
                        <TableCell className="px-4 py-3 text-center">
                          <Checkbox
                            checked={selectedItems.includes(item.backorder_id)}
                            onCheckedChange={(checked) => handleSelectItem(item.backorder_id, checked as boolean)}
                          />
                        </TableCell>
                        <TableCell className="px-4 py-3 text-sm font-medium text-blue-600">
                          <Link href={`/inventory/operation/back_order/${item.backorder_id}`} className="hover:underline">
                            {highlightText(item.backorder_id, query)}
                          </Link>
                        </TableCell>
                        <TableCell className="px-4 py-3 text-sm text-gray-900 capitalize">
                          {highlightText((item.receipt_type || "").replace(/_/g, " "), query)}
                        </TableCell>
                        <TableCell className="px-4 py-3 text-sm text-gray-900">
                          {highlightText(item.source_location_details?.location_name || "N/A", query)}
                        </TableCell>
                        <TableCell className="px-4 py-3 text-sm text-gray-900">
                          {highlightText(item.destination_location_details?.location_name || "N/A", query)}
                        </TableCell>
                        <TableCell className="px-4 py-3 text-sm">
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-medium capitalize ${
                              item.status === "validated"
                                ? "bg-green-100 text-green-500"
                                : item.status === "draft"
                                  ? "bg-blue-100 text-blue-500"
                                  : item.status === "canceled"
                                    ? "bg-red-100 text-red-500"
                                    : "bg-gray-100 text-gray-500"
                            }`}
                          >
                            {item.status}
                          </span>
                        </TableCell>
                        <TableCell className="px-4 py-3 text-sm text-gray-500">
                          {item.date_created ? new Date(item.date_created).toLocaleDateString() : "N/A"}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </FadeIn>
        </StaggerContainer>
      </main>
    </PageGuard>
  );
}
