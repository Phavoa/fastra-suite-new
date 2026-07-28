"use client";

import React, { useMemo, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import Breadcrumbs from "@/components/shared/BreadScrumbs";
import { AutoSaveIcon } from "@/components/shared/icons";
import { BreadcrumbItem } from "@/components/shared/types";
import Link from "next/link";
import { PageGuard } from "@/components/auth/PageGuard";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const DUMMY_RETURNS: any[] = [
  {
    id: "WH-RET-0001",
    vendor: "Dangote Cement Plc",
    relatedReceipt: "WH-IN-0012",
    date: "2026-07-28",
    status: "validated",
    lines: 1,
  },
  {
    id: "WH-RET-0002",
    vendor: "Julius Berger Steel",
    relatedReceipt: "WH-IN-0005",
    date: "2026-07-27",
    status: "draft",
    lines: 2,
  },
];

const STATUS_TABS = [
  { label: "All Records", value: "all" },
  { label: "Validated", value: "validated" },
  { label: "Draft", value: "draft" },
  { label: "Canceled", value: "canceled" },
];

const ITEMS_PER_PAGE = 10;

export default function SupplierReturnPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialStatus = searchParams.get("status") || "all";

  const [query, setQuery] = useState("");
  const [selectedStatus, setSelectedStatus] = useState(initialStatus);
  const [currentPage, setCurrentPage] = useState(1);

  const breadcrumbsItem: BreadcrumbItem[] = [
    { label: "Home", href: "/" },
    { label: "Inventory", href: "/inventory" },
    { label: "Operation", href: "/inventory/operation" },
    {
      label: "Supplier Returns",
      href: "/inventory/operation/supplier_return",
      current: true,
    },
  ];

  const filteredReturns = useMemo(() => {
    return DUMMY_RETURNS.filter((ret) => {
      const matchesStatus =
        selectedStatus === "all" || ret.status === selectedStatus;

      const lowerQuery = query.toLowerCase();
      const matchesSearch =
        !query ||
        ret.id.toLowerCase().includes(lowerQuery) ||
        ret.vendor.toLowerCase().includes(lowerQuery) ||
        ret.relatedReceipt.toLowerCase().includes(lowerQuery);

      return matchesStatus && matchesSearch;
    });
  }, [selectedStatus, query]);

  const totalPages = Math.max(1, Math.ceil(filteredReturns.length / ITEMS_PER_PAGE));
  const paginatedReturns = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredReturns.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredReturns, currentPage]);

  const handleStatusChange = (status: string) => {
    setSelectedStatus(status);
    setCurrentPage(1);
  };

  const handleQueryChange = (q: string) => {
    setQuery(q);
    setCurrentPage(1);
  };

  return (
    <PageGuard application="inventory" module="supplier_return">
      <div className="flex flex-col flex-1 min-h-[calc(100vh-64px)] bg-[#F6F9FC] relative pb-20">
        <main className="max-w-[1400px] mx-auto px-4 sm:px-6 py-6 w-full flex flex-col gap-6">
          <Breadcrumbs
            items={breadcrumbsItem}
          />

          <div className="bg-white rounded-lg shadow-2xs border border-gray-100 overflow-hidden">
            <div className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-100">
              <div className="flex items-center gap-4">
                <h2 className="text-xl font-semibold text-[#32325D] shrink-0">
                  Supplier Returns
                </h2>
                <div className="relative w-[240px] md:w-[320px]">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    type="text"
                    placeholder="Search return ID, vendor, receipt..."
                    className="pl-9 bg-white border-gray-200 h-9 text-sm rounded-lg focus-visible:ring-1 focus-visible:ring-[#3B7CED] focus-visible:border-[#3B7CED] text-[#32325D]"
                    value={query}
                    onChange={(e) => handleQueryChange(e.target.value)}
                  />
                </div>
              </div>
            </div>

            <div className="px-4 py-3 flex items-center gap-2 flex-wrap">
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

          <div className="bg-white rounded-lg shadow-2xs border border-gray-100 overflow-hidden">
            <div className="overflow-x-auto">
              <Table className="min-w-[800px] w-full">
                <TableHeader>
                  <TableRow className="bg-[#F6F9FC] hover:bg-[#F6F9FC] border-b border-gray-100">
                    <TableHead className="py-3 px-4 font-semibold text-[#8898AA] text-[11.5px]">
                      RETURN ID
                    </TableHead>
                    <TableHead className="py-3 px-4 font-semibold text-[#8898AA] text-[11.5px]">
                      DATE
                    </TableHead>
                    <TableHead className="py-3 px-4 font-semibold text-[#8898AA] text-[11.5px]">
                      VENDOR
                    </TableHead>
                    <TableHead className="py-3 px-4 font-semibold text-[#8898AA] text-[11.5px]">
                      RELATED RECEIPT
                    </TableHead>
                    <TableHead className="py-3 px-4 font-semibold text-[#8898AA] text-[11.5px] text-center">
                      LINES
                    </TableHead>
                    <TableHead className="py-3 px-4 font-semibold text-[#8898AA] text-[11.5px] text-center">
                      STATUS
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedReturns.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="px-6 py-12 text-center text-[#8898AA] text-sm">
                        No supplier returns found matching your search.
                      </TableCell>
                    </TableRow>
                  ) : (
                    paginatedReturns.map((ret) => (
                      <TableRow
                        key={ret.id}
                        className="hover:bg-gray-50/80 border-b border-gray-100 transition-colors cursor-pointer"
                        onClick={() => router.push(`/inventory/operation/supplier_return/${ret.id}`)}
                      >
                        <TableCell className="px-4 py-3.5 font-mono text-xs font-semibold">
                          <Link href={`/inventory/operation/supplier_return/${ret.id}`} className="text-[#3B7CED] hover:underline" onClick={(e) => e.stopPropagation()}>
                            {ret.id}
                          </Link>
                        </TableCell>
                        <TableCell className="px-4 py-3.5 text-[#525F7F] text-sm">
                          {ret.date}
                        </TableCell>
                        <TableCell className="px-4 py-3.5">
                          <span className="text-[#32325D] text-sm font-medium">
                            {ret.vendor}
                          </span>
                        </TableCell>
                        <TableCell className="px-4 py-3.5">
                          <span className="text-[#32325D] text-sm">
                            {ret.relatedReceipt}
                          </span>
                        </TableCell>
                        <TableCell className="px-4 py-3.5 text-center text-[#525F7F] text-sm">
                          {ret.lines}
                        </TableCell>
                        <TableCell className="px-4 py-3.5 text-center">
                          <span className={`inline-block min-w-[80px] px-2.5 py-1 text-[11px] rounded-full font-semibold capitalize ${
                            ret.status === "validated" ? "bg-[#E2F2E9] text-[#2BA24D]" : ret.status === "draft" ? "bg-[#E8F0FE] text-[#1A73E8]" : "bg-[#FCE8E6] text-[#E43D2B]"
                          }`}>
                            {ret.status}
                          </span>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
            
            <div className="px-6 py-3.5 flex items-center justify-between border-t border-gray-100 bg-white text-sm text-[#8898AA]">
              <span>
                Showing <span className="font-semibold text-[#32325D]">{filteredReturns.length === 0 ? 0 : (currentPage - 1) * ITEMS_PER_PAGE + 1}</span> – <span className="font-semibold text-[#32325D]">{Math.min(currentPage * ITEMS_PER_PAGE, filteredReturns.length)}</span> of <span className="font-semibold text-[#32325D]">{filteredReturns.length}</span> results
              </span>
              <div className="flex items-center gap-1">
                <button type="button" onClick={() => setCurrentPage((p) => Math.max(1, p - 1))} disabled={currentPage === 1} className="px-3 py-1 rounded-md border border-gray-200 text-xs font-medium text-[#32325D] hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed">Prev</button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((item) => (
                  <button key={item} type="button" onClick={() => setCurrentPage(item as number)} className={`w-8 h-7 rounded-md text-xs font-medium ${currentPage === item ? "bg-[#3B7CED] text-white" : "border border-gray-200 text-[#32325D] hover:bg-gray-50"}`}>{item}</button>
                ))}
                <button type="button" onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} className="px-3 py-1 rounded-md border border-gray-200 text-xs font-medium text-[#32325D] hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed">Next</button>
              </div>
            </div>
          </div>
        </main>
      </div>
    </PageGuard>
  );
}
