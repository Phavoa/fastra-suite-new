"use client";

import React, { useMemo, useState } from "react";
import { Search, Hammer } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Breadcrumbs from "@/components/shared/BreadScrumbs";
import { AutoSaveIcon } from "@/components/shared/icons";
import { BreadcrumbItem } from "@/types/purchase";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { PageGuard } from "@/components/auth/PageGuard";
const DUMMY_CONSUMPTION_REQUESTS = [
  {
    id: "MC-2026-0142",
    wbsActivity: "First Floor Slab Reinforcement",
    requester: "Eng. John Doe (Site Engineer)",
    requestDate: "2026-07-28",
    numberOfItems: 5,
    status: "pending",
    queue: "normal",
    isOverrun: false,
  },
  {
    id: "MC-2026-0143",
    wbsActivity: "Drainage Trench Concrete",
    requester: "Eng. Jane Smith (Site Supervisor)",
    requestDate: "2026-07-27",
    numberOfItems: 12,
    status: "pending",
    queue: "normal",
    isOverrun: false,
  },
  {
    id: "MC-2026-0189",
    wbsActivity: "Retaining Wall Concrete Pour",
    requester: "Eng. Samuel (Site Supervisor)",
    requestDate: "2026-07-26",
    numberOfItems: 8,
    status: "held_overrun",
    queue: "overrun",
    isOverrun: true,
  },
  {
    id: "MC-2026-0192",
    wbsActivity: "Main Switchboard Cabling",
    requester: "Eng. Chinedu (Electrical Lead)",
    requestDate: "2026-07-25",
    numberOfItems: 3,
    status: "pending",
    queue: "normal",
    isOverrun: false,
  },
  {
    id: "MC-2026-0195",
    wbsActivity: "Perimeter Interlocking Paving",
    requester: "Eng. John Doe (Site Engineer)",
    requestDate: "2026-07-24",
    numberOfItems: 25,
    status: "pending",
    queue: "normal",
    isOverrun: false,
  },
  {
    id: "MC-2026-0198",
    wbsActivity: "Steel Columns Erection",
    requester: "Eng. David (Structural Engineer)",
    requestDate: "2026-07-23",
    numberOfItems: 2,
    status: "held_overrun",
    queue: "overrun",
    isOverrun: true,
  },
  {
    id: "MC-2026-0201",
    wbsActivity: "Drywall Partitions Level 4",
    requester: "Eng. Tunde (Finishing Lead)",
    requestDate: "2026-07-22",
    numberOfItems: 15,
    status: "pending",
    queue: "normal",
    isOverrun: false,
  },
  {
    id: "MC-2026-0205",
    wbsActivity: "Ground Floor Tiling & Mortar",
    requester: "Eng. Samuel (Site Supervisor)",
    requestDate: "2026-07-21",
    numberOfItems: 10,
    status: "pending",
    queue: "normal",
    isOverrun: false,
  },
  {
    id: "MC-2026-0208",
    wbsActivity: "Underground Soil & Waste Piping",
    requester: "Eng. Jane Smith (Site Supervisor)",
    requestDate: "2026-07-20",
    numberOfItems: 7,
    status: "pending",
    queue: "normal",
    isOverrun: false,
  },
  {
    id: "MC-2026-0211",
    wbsActivity: "Terrace Waterproofing Membrane",
    requester: "Eng. Chinedu (Electrical Lead)",
    requestDate: "2026-07-19",
    numberOfItems: 4,
    status: "held_overrun",
    queue: "overrun",
    isOverrun: true,
  },
  {
    id: "MC-2026-0215",
    wbsActivity: "Site Access Road Asphalt",
    requester: "Eng. John Doe (Site Engineer)",
    requestDate: "2026-07-18",
    numberOfItems: 6,
    status: "pending",
    queue: "normal",
    isOverrun: false,
  },
  {
    id: "MC-2026-0218",
    wbsActivity: "Pile Cap Reinforcement",
    requester: "Eng. David (Structural Engineer)",
    requestDate: "2026-07-17",
    numberOfItems: 14,
    status: "pending",
    queue: "normal",
    isOverrun: false,
  },
];

const STATUS_TABS = [
  { label: "All Requisitions", value: "all" },
  { label: "Within Budget Queue", value: "normal" },
  { label: "Overrun Queue (Action Req.)", value: "overrun" },
];

import { useRouter } from "next/navigation";

const ITEMS_PER_PAGE = 10;

export default function MaterialConsumptionApprovalsPage() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [selectedTab, setSelectedTab] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);

  const filteredRequests = useMemo(() => {
    return DUMMY_CONSUMPTION_REQUESTS.filter((item) => {
      const matchesTab =
        selectedTab === "all" || item.queue === selectedTab;

      const lowerQuery = query.toLowerCase();
      const matchesSearch =
        !query ||
        item.id.toLowerCase().includes(lowerQuery) ||
        item.wbsActivity.toLowerCase().includes(lowerQuery) ||
        item.requester.toLowerCase().includes(lowerQuery);

      return matchesTab && matchesSearch;
    });
  }, [query, selectedTab]);

  const totalPages = Math.max(1, Math.ceil(filteredRequests.length / ITEMS_PER_PAGE));
  const paginatedRequests = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredRequests.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredRequests, currentPage]);

  const handleTabChange = (tab: string) => {
    setSelectedTab(tab);
    setCurrentPage(1);
  };

  const handleQueryChange = (q: string) => {
    setQuery(q);
    setCurrentPage(1);
  };

  const breadcrumbsItem: BreadcrumbItem[] = [
    { label: "Home", href: "/" },
    { label: "Inventory", href: "/inventory" },
    { label: "Operation", href: "/inventory/operation" },
    {
      label: "Material Consumption",
      href: "/inventory/operation/material-consumption",
      current: true,
    },
  ];

  return (
    <PageGuard application="inventory" module="materialconsumption">
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

          {/* White section 1: top bar + search + status tabs */}
          <div className="bg-white rounded-lg shadow-2xs border border-gray-100 overflow-hidden">
            {/* Top Bar: title + search + actions */}
            <div className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-100">
              <div className="flex items-center gap-4">
                <h2 className="text-xl font-semibold text-[#32325D] shrink-0">
                  Material Consumption Approvals
                </h2>
                <div className="relative w-[240px] md:w-[320px]">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    type="text"
                    placeholder="Search requisition ID, project, or WBS..."
                    className="pl-9 bg-white border-gray-200 h-9 text-sm rounded-lg focus-visible:ring-1 focus-visible:ring-[#3B7CED] focus-visible:border-[#3B7CED] text-[#32325D]"
                    value={query}
                    onChange={(e) => handleQueryChange(e.target.value)}
                    aria-label="Search material requisitions"
                  />
                </div>
              </div>

              <div className="flex items-center gap-3 self-end sm:self-auto">
              </div>
            </div>

            {/* Status Filter Pills */}
            <div className="px-4 py-3 flex items-center gap-2 flex-wrap">
              {STATUS_TABS.map((tab) => {
                const isSelected = selectedTab === tab.value;
                return (
                  <button
                    key={tab.value}
                    type="button"
                    onClick={() => handleTabChange(tab.value)}
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

          {/* White section 2: table card */}
          <div className="bg-white rounded-lg shadow-2xs border border-gray-100 overflow-hidden">
            <div className="overflow-x-auto">
              <Table className="min-w-[800px] w-full">
                <TableHeader>
                  <TableRow className="bg-[#F6F9FC] hover:bg-[#F6F9FC] border-b border-gray-100">
                    <TableHead className="py-3 px-4 font-semibold text-[#8898AA] text-[11.5px]">
                      REQUEST ID
                    </TableHead>
                    <TableHead className="py-3 px-4 font-semibold text-[#8898AA] text-[11.5px]">
                      WBS ACTIVITY
                    </TableHead>
                    <TableHead className="py-3 px-4 font-semibold text-[#8898AA] text-[11.5px]">
                      REQUESTED BY
                    </TableHead>
                    <TableHead className="py-3 px-4 font-semibold text-[#8898AA] text-[11.5px]">
                      REQUEST DATE
                    </TableHead>
                    <TableHead className="py-3 px-4 font-semibold text-[#8898AA] text-[11.5px] text-center">
                      NUMBER OF ITEMS
                    </TableHead>
                    <TableHead className="py-3 px-4 font-semibold text-[#8898AA] text-[11.5px] text-center">
                      RELEASE STATUS
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedRequests.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={6}
                        className="px-6 py-12 text-center text-[#8898AA] text-sm"
                      >
                        No requisitions found matching your criteria.
                      </TableCell>
                    </TableRow>
                  ) : (
                    paginatedRequests.map((req) => (
                      <TableRow
                        key={req.id}
                        className="hover:bg-gray-50/80 border-b border-gray-100 transition-colors cursor-pointer"
                        onClick={() => router.push(`/inventory/operation/material-consumption/${req.id}`)}
                      >
                        <TableCell className="px-4 py-3.5 font-mono text-xs font-semibold">
                          <Link
                            href={`/inventory/operation/material-consumption/${req.id}`}
                            className="text-[#3B7CED] hover:underline"
                            onClick={(e) => e.stopPropagation()}
                          >
                            {req.id}
                          </Link>
                        </TableCell>
                        <TableCell className="px-4 py-3.5">
                          <span className="text-[#32325D] text-sm font-medium">
                            {req.wbsActivity}
                          </span>
                        </TableCell>
                        <TableCell className="px-4 py-3.5">
                          <span className="text-[#32325D] text-sm font-medium">
                            {req.requester}
                          </span>
                        </TableCell>
                        <TableCell className="px-4 py-3.5">
                          <span className="text-[#525F7F] text-sm">
                            {req.requestDate}
                          </span>
                        </TableCell>
                        <TableCell className="px-4 py-3.5 text-center font-semibold text-[#32325D] text-sm">
                          {req.numberOfItems}
                        </TableCell>
                        <TableCell className="px-4 py-3.5 text-center">
                          <span
                            className={`inline-block min-w-[80px] px-2.5 py-1 text-[11px] rounded-full font-semibold ${
                              req.isOverrun
                                ? "bg-[#FCE8E6] text-[#E43D2B]"
                                : "bg-[#E8F0FE] text-[#1A73E8]"
                            }`}
                          >
                            {req.isOverrun ? "Held: Overrun" : "Pending"}
                          </span>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>

            {/* Pagination footer */}
            <div className="px-6 py-3.5 flex items-center justify-between border-t border-gray-100 bg-white text-sm text-[#8898AA]">
              <span>
                Showing{" "}
                <span className="font-semibold text-[#32325D]">
                  {filteredRequests.length === 0
                    ? 0
                    : (currentPage - 1) * ITEMS_PER_PAGE + 1}
                </span>{" "}
                –{" "}
                <span className="font-semibold text-[#32325D]">
                  {Math.min(currentPage * ITEMS_PER_PAGE, filteredRequests.length)}
                </span>{" "}
                of{" "}
                <span className="font-semibold text-[#32325D]">
                  {filteredRequests.length}
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
