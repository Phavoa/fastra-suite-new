"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Bell,
  FileText,
  CheckCircle,
  Clock,
  XCircle,
  Plus,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar } from "@/components/ui/avatar";
import { Card } from "@/components/ui/card";

interface LabourRequest {
  id: string;
  project: string;
  workers: number;
  role: string;
  requester: string;
  status: "draft" | "approved" | "pending" | "rejected";
}

const mockRequests: LabourRequest[] = [
  {
    id: "LR00001",
    project: "Project #1",
    workers: 4,
    role: "Carpenter",
    requester: "Firstname Lastname",
    status: "approved",
  },
  {
    id: "LR00002",
    project: "Project #2",
    workers: 6,
    role: "Electrician",
    requester: "Firstname Lastname",
    status: "pending",
  },
  {
    id: "LR00003",
    project: "Project #3",
    workers: 2,
    role: "Plumber",
    requester: "Firstname Lastname",
    status: "draft",
  },
  {
    id: "LR00004",
    project: "Project #4",
    workers: 8,
    role: "Mason",
    requester: "Firstname Lastname",
    status: "approved",
  },
];

const statusCounts = {
  draft: 12,
  approved: 12,
  pending: 12,
  rejected: 12,
};

const statusFilters = [
  "all",
  "draft",
  "approved",
  "pending",
  "rejected",
] as const;
type StatusFilter = (typeof statusFilters)[number];

export default function LabourRequestDashboard() {
  const router = useRouter();
  const [activeFilter, setActiveFilter] = useState<StatusFilter>("all");

  const filteredRequests = mockRequests.filter(
    (req) => activeFilter === "all" || req.status === activeFilter,
  );

  const getStatusBadgeVariant = (status: LabourRequest["status"]) => {
    switch (status) {
      case "approved":
        return "validated";
      case "pending":
        return "pending";
      case "draft":
        return "draft";
      case "rejected":
        return "rejected";
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-4 py-4 sticky top-0 z-10">
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
            <h1 className="text-xl font-semibold text-gray-900">
              Labour Request
            </h1>
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
              <span className="text-sm font-medium">LR</span>
            </Avatar>
          </div>
        </div>
      </div>

      <div className="p-4 max-w-7xl mx-auto pb-24">
        {/* Status Cards - 2x2 grid responsive */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          {/* Draft */}
          <Card className="p-4 border border-[#3B7CED]/20 bg-[#3B7CED]/5 hover:shadow-md transition-shadow">
            <div className="flex flex-col">
              <div className="flex gap-4">
                <FileText className="h-5 w-5 text-[#3B7CED]" />
                <p className="text-sm text-gray-600 mb-1">Draft</p>
              </div>
              <p className="text-2xl font-bold text-[#3B7CED]">
                {statusCounts.draft}
              </p>

              {/* <div className="p-2 rounded-md bg-[#3B7CED]/10">
                <FileText className="h-5 w-5 text-[#3B7CED]" />
              </div> */}
            </div>
          </Card>

          {/* Approved */}
          <Card className="p-4 border border-[#2BA24D]/20 bg-[#2BA24D]/5 hover:shadow-md transition-shadow">
            <div className="flex flex-col">
              <div className="flex gap-4">
                <CheckCircle className="h-5 w-5 text-[#2BA24D]" />
                <p className="text-sm text-gray-600 mb-1">Approved</p>
              </div>
              <p className="text-2xl font-bold text-[#2BA24D]">
                {statusCounts.approved}
              </p>
            </div>
            {/* <div className="p-2 rounded-md bg-[#2BA24D]/10">
                <CheckCircle className="h-5 w-5 text-[#2BA24D]" />
              </div> */}
          </Card>

          {/* Pending */}
          <Card className="p-4 border border-[#F0B401]/20 bg-[#F0B401]/5 hover:shadow-md transition-shadow">
            <div className="flex flex-col">
              <div className="flex gap-4">
                <Clock className="h-5 w-5 text-[#F0B401]" />
                <p className="text-sm text-gray-600 mb-1">Pending</p>
              </div>
              <p className="text-2xl font-bold text-[#F0B401]">
                {statusCounts.pending}
              </p>
            </div>
            {/* <div className="p-2 rounded-md bg-[#F0B401]/10">
                <Clock className="h-5 w-5 text-[#F0B401]" />
              </div> */}
          </Card>

          {/* Rejected */}
          <Card className="p-4 border border-[#E43D2B]/20 bg-[#E43D2B]/5 hover:shadow-md transition-shadow">
            <div className="flex flex-col">
              <div className="flex gap-4">
                <XCircle className="h-5 w-5 text-[#E43D2B]" />
                <p className="text-sm text-gray-600 mb-1">Rejected</p>
              </div>

              <p className="text-2xl font-bold text-[#E43D2B]">
                {statusCounts.rejected}
              </p>
            </div>
          </Card>
        </div>

        {/* Filter Tabs */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2 scrollbar-hide">
          {statusFilters.map((filter) => (
            <button
              key={filter}
              onClick={() => setActiveFilter(filter)}
              className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
                activeFilter === filter
                  ? "bg-[#3B7CED] text-white shadow-sm"
                  : "bg-white text-gray-600 border border-gray-200 hover:border-gray-300"
              }`}
            >
              {filter.charAt(0).toUpperCase() + filter.slice(1)}
            </button>
          ))}
        </div>

        {/* Labour Request List */}
        <div className="space-y-3">
          {filteredRequests.map((request) => (
            <Card
              key={request.id}
              className="p-4 hover:shadow-md transition-shadow cursor-pointer"
            >
              <div className="flex justify-between items-start">
                <span className="text-sm font-semibold text-blue-500">
                  {request.id}
                </span>
                <Badge variant={getStatusBadgeVariant(request.status)}>
                  {request.status.charAt(0).toUpperCase() +
                    request.status.slice(1)}
                </Badge>
              </div>
              <p className="text-sm text-gray-600">{request.project}</p>

              <div className="flex justify-between items-center">
                <div className="flex gap-4">
                  <div>
                    <p className="text-sm text-gray-500 font-semibold">
                      {" "}
                      Workers
                    </p>
                    <p className="text-sm text-gray-900">{request.workers}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 font-semibold"> Role</p>
                    <p className="text-sm text-gray-900">{request.role}</p>
                  </div>
                </div>

                <div>
                  <p className="text-sm text-gray-500 font-semibold">
                    {" "}
                    Requester
                  </p>
                  <p className="text-sm text-gray-900">{request.requester}</p>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* Floating Action Button */}
      <div className="fixed bottom-6 left-0 right-0 px-4 md:left-16 md:max-w-[calc(100%-4rem)] mx-auto">
        <Button
          variant="contained"
          className="w-full max-w-md mx-auto h-12 text-base font-medium shadow-lg flex items-center justify-center gap-2"
          onClick={() => router.push("/labour-request/new")}
        >
          <Plus className="h-5 w-5" />
          New Labour Request
        </Button>
      </div>
    </div>
  );
}
