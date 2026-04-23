"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Bell, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar } from "@/components/ui/avatar";
import { Card } from "@/components/ui/card";
import { RequestDashboardConfig, RequestStatus } from "./types";

interface RequestDashboardProps<T extends { status: RequestStatus }> {
  config: RequestDashboardConfig<T>;
}

export function RequestDashboard<T extends { status: RequestStatus }>({
  config,
}: RequestDashboardProps<T>) {
  const router = useRouter();
  const [activeFilter, setActiveFilter] = useState<RequestStatus | "all">("all");

  const filteredRequests = config.mockData.filter(
    (req) => activeFilter === "all" || req.status === activeFilter
  );

  const filters: (RequestStatus | "all")[] = ["all", "draft", "approved", "pending", "rejected"];

  return (
    <div className="min-h-screen bg-[#F1F5F9]">
      {/* Header */}
      <div className="bg-white px-4 py-4 sticky top-0 z-10 shadow-sm">
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon-sm"
              className="text-gray-600 hover:text-gray-900 hover:bg-gray-100"
              onClick={() => router.back()}
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <h1 className="text-xl font-semibold text-gray-900">{config.title}</h1>
          </div>
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon-sm"
              className="text-gray-600 hover:text-gray-900 hover:bg-gray-100"
            >
              <Bell className="h-5 w-5" />
            </Button>
            <Avatar className="h-9 w-9 bg-[#3B7CED] text-white">
              <span className="text-sm font-medium">{config.idPrefix}</span>
            </Avatar>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto pb-24 space-y-4 pt-4">
        {/* Status Cards */}
        <div className="bg-white px-4 py-6">
          <div className="grid grid-cols-2 gap-4">
            {config.summaryConfigs.map((summary) => (
              <div
                key={summary.status}
                className={`p-4 border rounded-lg ${summary.borderColorClass} ${summary.bgColorClass}`}
              >
                <div className="flex flex-col">
                  <div className="flex gap-2 items-center mb-2">
                    <summary.icon className={`h-4 w-4 ${summary.colorClass}`} />
                    <p className={`text-sm font-medium ${summary.colorClass}`}>{summary.label}</p>
                  </div>
                  <p className={`text-3xl font-normal ${summary.colorClass}`}>
                    {config.statusCounts[summary.status]}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* List Section */}
        <div className="bg-white px-4 py-6">
          <h2 className="text-sm font-medium text-[#3B7CED] mb-4">{config.title}</h2>
          
          {/* Filter Tabs */}
          <div className="flex gap-2 mb-6 overflow-x-auto pb-2 scrollbar-hide">
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

          {/* List */}
          <div className="space-y-4">
            {filteredRequests.map((request, index) => (
              <React.Fragment key={index}>{config.renderItem(request)}</React.Fragment>
            ))}
          </div>
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
