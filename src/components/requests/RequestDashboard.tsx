"use client";

import React, { useState } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { RequestDashboardConfig, RequestStatus } from "./types";
import { NavBar } from "../shared/TopBar/reusableTopBar";

interface RequestDashboardProps<T extends { status: RequestStatus }> {
  config: RequestDashboardConfig<T>;
  backUrl?: string;
}

export function RequestDashboard<T extends { status: RequestStatus }>({
  config,
  backUrl,
}: RequestDashboardProps<T>) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const activeStatusQuery = searchParams.get("status") as RequestStatus | null;
  const [activeFilter, setActiveFilter] = useState<RequestStatus | "all">(
    "all",
  );

  const filteredRequests = config.mockData.filter((req) => {
    const matchesFilter = activeFilter === "all" || req.status === activeFilter;
    const matchesStatusQuery =
      !activeStatusQuery || req.status === activeStatusQuery;
    return matchesFilter && matchesStatusQuery;
  });

  const filters: (RequestStatus | "all")[] = [
    "all",
    "draft",
    "approved",
    "pending",
    "rejected",
  ];

  const navBarBackUrl = activeStatusQuery ? pathname : backUrl;

  console.log(config);
  console.log(config.mockData, "mockData");
  console.log(filteredRequests, "filteredRequests");
  return (
    <div className="min-h-screen bg-[#F1F5F9]">
      {/* Header - Top Bar */}
      <NavBar title={config.title} items={[]} backUrl={navBarBackUrl} />

      <div className="max-w-7xl mx-auto pb-24 space-y-4 pt-4">
        {/* Status Title Header (shown when status query is active) */}
        {activeStatusQuery && (
          <div className="bg-white p-6 rounded-md flex items-center justify-between gap-4">
            <div className="flex items-center space-x-4">
              {(() => {
                const summary = config.summaryConfigs.find(
                  (s) => s.status === activeStatusQuery,
                );
                const dotColor = summary?.colorClass.includes("text-")
                  ? summary.colorClass.replace("text-", "bg-")
                  : "bg-[#3B7CED]";
                const label =
                  summary?.label ||
                  activeStatusQuery.charAt(0).toUpperCase() +
                    activeStatusQuery.slice(1);
                return (
                  <div className="flex items-center gap-3">
                    <div className={`w-4 h-4 rounded-full ${dotColor}`}></div>
                    <h2 className="text-xl font-semibold">
                      {label} {config.title}s
                    </h2>
                    <span
                      className={`px-3 py-1 rounded-full text-sm font-medium ${summary?.colorClass || "text-[#3B7CED]"} bg-gray-100`}
                    >
                      {filteredRequests.length}{" "}
                      {filteredRequests.length === 1 ? "request" : "requests"}
                    </span>
                  </div>
                );
              })()}
            </div>
          </div>
        )}

        {/* Status Cards (hidden when status query is active) */}
        {!activeStatusQuery && (
          <div className="bg-white px-4 py-6">
            <div className="grid grid-cols-2 gap-4">
              {config.summaryConfigs.map((summary) => (
                <div
                  key={summary.status}
                  onClick={() =>
                    router.push(`${pathname}?status=${summary.status}`)
                  }
                  className={`p-4 border rounded-lg cursor-pointer hover:shadow-md transition-shadow ${summary.borderColorClass} ${summary.bgColorClass}`}
                >
                  <div className="flex flex-col">
                    <div className="flex gap-2 items-center mb-2">
                      <summary.icon
                        className={`h-4 w-4 ${summary.colorClass}`}
                      />
                      <p
                        className={`text-sm font-medium ${summary.colorClass}`}
                      >
                        {summary.label}
                      </p>
                    </div>
                    <p className={`text-3xl font-normal ${summary.colorClass}`}>
                      {config.statusCounts[summary.status]}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* List Section */}
        <div className="bg-white px-4 py-6 w-full overflow-hidden">
          <h2 className="text-sm font-medium text-[#3B7CED] mb-4">
            {config.title}
          </h2>

          {/* Filter Tabs (hidden when status query is active) */}
          {!activeStatusQuery && (
            <div className="flex gap-2 mb-6 overflow-x-auto pb-2 scrollbar-hide w-full max-w-full">
              {filters.map((filter) => (
                <button
                  key={filter}
                  onClick={() => setActiveFilter(filter)}
                  className={`px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
                    activeFilter === filter
                      ? "bg-[#3B7CED] text-white"
                      : "bg-gray-100 text-gray-500 hover:bg-gray-200"
                  }`}
                >
                  {filter.charAt(0).toUpperCase() + filter.slice(1)}
                </button>
              ))}
            </div>
          )}

          {/* List */}
          {filteredRequests.length === 0 && (
            <div className="flex items-center justify-center h-48">
              <div className="text-center">
                <p className="text-gray-600">
                  No {config.title.toLowerCase()} found
                </p>
              </div>
            </div>
          )}
          {filteredRequests.length > 0 && (
            <div className="space-y-4">
              {filteredRequests.map((request, index) => (
                <React.Fragment key={index}>
                  {config.renderItem(request)}
                </React.Fragment>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Floating Action Button */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 p-4 md:left-16 md:max-w-[calc(100%-4rem)] mx-auto shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
        <Button
          variant="contained"
          className="w-full max-w-2xl mx-auto h-12 text-base font-medium flex items-center justify-center gap-2 bg-[#3B7CED] hover:bg-[#2d63c7] text-white rounded-md"
          onClick={() => router.push(config.newRequestPath)}
        >
          <Plus className="h-5 w-5" />
          New {config.title}
        </Button>
      </div>
    </div>
  );
}
