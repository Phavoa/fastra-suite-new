"use client";
import Breadcrumbs from "@/components/shared/BreadScrumbs";
import { AutoSaveIcon } from "@/components/shared/icons";
import AnimatedWrapper, { FadeIn } from "@/components/shared/AnimatedWrapper";
import { motion } from "framer-motion";
import React, { useMemo, useState } from "react";
import { Input } from "@/components/ui/input";
import { SearchIcon } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { BreadcrumbItem } from "@/types/purchase";
import { PageHeader } from "@/components/purchase/products/PageHeader";
import { ViewToggle } from "@/components/inventory/location/ViewToggle";
import { ViewType } from "@/types/purchase";
import { InternalTransferCards } from "@/components/inventory/operation/InternalTransferCards";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useGetInternalTransfersQuery } from "@/api/inventory/internalTransferApi";
import type { RootState } from "@/lib/store/store";
import { useSelector } from "react-redux";

export default function InternalTransferPage() {
  const [query, setQuery] = useState("");
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [currentView, setCurrentView] = useState<ViewType>("list");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 50;

  // Get logged-in user from Redux store
  const loggedInUser = useSelector((state: RootState) => state.auth.user);

  // Use the API query hook for internal transfers
  const {
    data: allInternalTransfers = [],
    isLoading,
    isError,
    error,
  } = useGetInternalTransfersQuery({});

  // Filter internal transfers based on search query
  const filteredInternalTransfers = useMemo(() => {
    if (!query) return allInternalTransfers;

    const lowerQuery = query.toLowerCase();
    return allInternalTransfers.filter((item: any) => {
      return (
        item.id.toLowerCase().includes(lowerQuery) ||
        item.source_location_details?.location_name
          ?.toLowerCase()
          .includes(lowerQuery) ||
        item.destination_location_details?.location_name
          ?.toLowerCase()
          .includes(lowerQuery) ||
        item.status.toLowerCase().includes(lowerQuery) ||
        item.date_created.toLowerCase().includes(lowerQuery)
      );
    });
  }, [allInternalTransfers, query]);

  // Paginate the filtered internal transfers
  const paginatedInternalTransfers = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredInternalTransfers.slice(
      startIndex,
      startIndex + itemsPerPage
    );
  }, [filteredInternalTransfers, currentPage]);

  const totalPages = Math.ceil(filteredInternalTransfers.length / itemsPerPage);

  // Function to highlight search matches
  const highlightText = (text: string, query: string) => {
    if (!query) return text;

    const regex = new RegExp(
      `(${query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")})`,
      "gi"
    );
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
      setSelectedItems(paginatedInternalTransfers.map((item) => item.id));
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

  const handleViewChange = (view: ViewType) => {
    setCurrentView(view);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "draft":
        return "bg-blue-100 text-blue-500";
      case "awaiting_approval":
        return "bg-yellow-100 text-yellow-500";
      case "approved":
        return "bg-green-100 text-green-500";
      case "released":
        return "bg-purple-100 text-purple-500";
      case "done":
        return "bg-green-100 text-green-500";
      case "canceled":
      case "cancelled":
        return "bg-red-100 text-red-500";
      default:
        return "bg-gray-100 text-gray-500";
    }
  };

  const formatStatus = (status: string) => {
    if (status === "awaiting_approval") {
      return "Awaiting Approval";
    }
    return status.charAt(0).toUpperCase() + status.slice(1);
  };

  const breadcrumsItem: BreadcrumbItem[] = [
    { label: "Home", href: "/" },
    { label: "Inventory", href: "/inventory" },
    { label: "Operation", href: "/inventory/operation" },
    {
      label: "Internal Transfer",
      href: "/inventory/operation/internal_transfer",
      current: true,
    },
  ];

  // Show loading state
  if (isLoading) {
    return (
      <main className="min-h-screen text-gray-800 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p>Loading internal transfers...</p>
        </div>
      </main>
    );
  }

  // Show error state
  if (isError) {
    return (
      <main className="min-h-screen text-gray-800 flex items-center justify-center">
        <div className="text-center text-red-600">
          <p>Error loading internal transfers</p>
          <p className="text-sm mt-2">{error?.toString()}</p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen text-gray-800 mr-4">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
      >
        <Breadcrumbs
          items={breadcrumsItem}
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

      <div className="bg-white p-6 rounded-md flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mt-6">
        <div className="flex items-center space-x-4">
          <h2 className="text-lg text-nowrap font-medium">
            Internal Transfers
          </h2>

          <div className="relative w-xs">
            <Input
              type="text"
              className="w-full pl-10 pr-4 border border-gray-300 rounded-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              aria-label="Search internal transfers"
            />
            <SearchIcon
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
              size={16}
            />
          </div>
        </div>
        <div className="flex space-x-4">
          <Link href="/inventory/operation/internal_transfer/new">
            <Button variant="contained" className="px-4 py-2 cursor-pointer">
              New Internal Transfer
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
        <div className="bg-white rounded-md shadow mt-6 overflow-hidden">
          <Table>
            <TableHeader className="bg-[#F6F7F8]">
              <TableRow>
                <TableHead className="w-12 px-4 py-3">
                  <Checkbox
                    checked={
                      selectedItems.length ===
                        paginatedInternalTransfers.length &&
                      paginatedInternalTransfers.length > 0
                    }
                    onCheckedChange={handleSelectAll}
                  />
                </TableHead>
                <TableHead className="px-4 py-3 text-left text-sm text-gray-600 font-medium">
                  ID
                </TableHead>
                <TableHead className="px-4 py-3 text-left text-sm text-gray-600 font-medium">
                  Source Location
                </TableHead>
                <TableHead className="px-4 py-3 text-left text-sm text-gray-600 font-medium">
                  Destination Location
                </TableHead>
                <TableHead className="px-4 py-3 text-left text-sm text-gray-600 font-medium">
                  Date Created
                </TableHead>
                <TableHead className="px-4 py-3 text-left text-sm text-gray-600 font-medium">
                  Status
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedInternalTransfers.map((item: any) => (
                <TableRow
                  key={item.id}
                  className="hover:bg-gray-50 cursor-pointer"
                  onClick={() =>
                    (window.location.href = `/inventory/operation/internal_transfer/${item.id}`)
                  }
                >
                  <TableCell className="px-4 py-3">
                    <Checkbox
                      checked={selectedItems.includes(item.id)}
                      onCheckedChange={(checked) =>
                        handleSelectItem(item.id, checked as boolean)
                      }
                    />
                  </TableCell>
                  <TableCell className="px-4 py-3 text-sm text-gray-900">
                    <Link
                      href={`/inventory/operation/internal_transfer/${item.id}`}
                      className="text-blue-600 hover:text-blue-800 hover:underline"
                    >
                      {highlightText(item.id, query)}
                    </Link>
                  </TableCell>
                  <TableCell className="px-4 py-3 text-sm text-gray-900">
                    {highlightText(
                      item.source_location_details?.location_name || "N/A",
                      query
                    )}
                  </TableCell>
                  <TableCell className="px-4 py-3 text-sm text-gray-900">
                    {highlightText(
                      item.destination_location_details?.location_name || "N/A",
                      query
                    )}
                  </TableCell>
                  <TableCell className="px-4 py-3 text-sm text-gray-900">
                    {new Date(item.date_created).toLocaleDateString()}
                  </TableCell>
                  <TableCell className="px-4 py-3 text-sm">
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium capitalize ${getStatusColor(
                        item.status
                      )}`}
                    >
                      {formatStatus(item.status)}
                    </span>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between px-4 py-3 bg-white border-t border-gray-200">
              <div className="text-sm text-gray-700">
                Showing {(currentPage - 1) * itemsPerPage + 1} to{" "}
                {Math.min(
                  currentPage * itemsPerPage,
                  filteredInternalTransfers.length
                )}{" "}
                of {filteredInternalTransfers.length} results
              </div>
              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                >
                  Previous
                </Button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                  (page) => (
                    <Button
                      key={page}
                      variant={currentPage === page ? "contained" : "outline"}
                      size="sm"
                      onClick={() => handlePageChange(page)}
                    >
                      {page}
                    </Button>
                  )
                )}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </div>
      ) : (
        <InternalTransferCards
          internalTransfers={paginatedInternalTransfers}
          query={query}
        />
      )}
    </main>
  );
}
