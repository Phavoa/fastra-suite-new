"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  FileText,
  CheckCircle,
  Clock,
  XCircle,
  Wifi,
  WifiOff,
  RefreshCw,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { RequestDashboard } from "@/components/requests/RequestDashboard";
import {
  RequestDashboardConfig,
  RequestStatus,
} from "@/components/requests/types";
import { useGetLabourRequestsQuery } from "@/api/requests/labourRequestApi";
import { useNetworkStatus } from "@/hooks/useNetworkStatus";
import { db } from "@/lib/database/labourRequestDb";
import { syncService } from "@/lib/database/syncService";
import { LocalLabourRequest } from "@/lib/database/labourRequestDb";
import { LabourRequest } from "@/api/requests/labourRequestApi";

// Combined interface for both online and offline data
interface DisplayLabourRequest {
  id: number;
  referenceId: string;
  project?: string;
  workers: number;
  role: string;
  requester: string;
  status: RequestStatus;
  isOffline?: boolean;
  localId?: string;
}

export default function LabourRequestPage() {
  const router = useRouter();
  const networkStatus = useNetworkStatus();
  const {
    data: apiData,
    isLoading,
    error,
    refetch,
  } = useGetLabourRequestsQuery({});
  const [localData, setLocalData] = useState<LocalLabourRequest[]>([]);
  const [combinedData, setCombinedData] = useState<DisplayLabourRequest[]>([]);
  const [statusCounts, setStatusCounts] = useState<
    Record<RequestStatus, number>
  >({
    draft: 0,
    approved: 0,
    pending: 0,
    rejected: 0,
  });

  // Load local data on mount
  useEffect(() => {
    const loadLocalData = async () => {
      try {
        const localRequests = await db.labourRequests.toArray();
        setLocalData(localRequests);
      } catch (error) {
        console.error("Failed to load local data:", error);
      }
    };
    loadLocalData();
  }, []);

  // Combine API and local data
  useEffect(() => {
    const combineData = () => {
      const apiRequests = apiData || [];
      const localRequests = localData;
      console.log("API requests:", apiRequests);
      console.log("Local requests:", localRequests);

      // Convert API data to display format
      const displayApiRequests: DisplayLabourRequest[] = apiRequests.map(
        (req) => ({
          id: req.id,
          referenceId: req.reference_id,
          // project: `${req?.project || "Name here"}`, // to be added later
          workers: req.detail.number_of_workers,
          role: req.detail.role_type,
          requester: req.detail.created_by_name || "Requester",
          status: req.status || "draft",
          isOffline: false,
        }),
      );

      // Convert local data to display format (only show unsynced ones)
      const displayLocalRequests: DisplayLabourRequest[] = localRequests
        .filter((req) => !req.isSynced)
        .map((req) => ({
          id: req.id || 0,
          referenceId: req.reference_id,
          project: `${req.project_request.project || "Project name"}`,
          workers: req.detail.number_of_workers,
          role: req.detail.role_type,
          requester: "You (Offline)",
          status: req.project_request?.status || "draft",
          isOffline: true,
          localId: req.localId,
        }));

      // Combine and deduplicate (prefer API data for synced items)
      const allRequests = [...displayLocalRequests, ...displayApiRequests];
      const uniqueRequests = allRequests.filter(
        (req, index, self) => index === self.findIndex((r) => r.id === req.id),
      );

      setCombinedData(uniqueRequests);

      // Calculate status counts
      const counts = uniqueRequests.reduce(
        (acc, req) => {
          acc[req.status] = (acc[req.status] || 0) + 1;
          return acc;
        },
        {} as Record<RequestStatus, number>,
      );

      setStatusCounts({
        draft: counts.draft || 0,
        approved: counts.approved || 0,
        pending: counts.pending || 0,
        rejected: counts.rejected || 0,
      });
    };

    combineData();
  }, [apiData, localData]);

  const getStatusBadgeVariant = (status: RequestStatus) => {
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

  const config: RequestDashboardConfig<DisplayLabourRequest> = {
    title: "Labour Request",
    idPrefix: "LR",
    newRequestPath: "/project-request/labour-request/new",
    statusCounts,
    summaryConfigs: [
      {
        status: "draft",
        label: "Draft",
        icon: FileText,
        colorClass: "text-[#3B7CED]",
        bgColorClass: "bg-[#3B7CED]/5",
        borderColorClass: "border-[#3B7CED]/20",
      },
      {
        status: "approved",
        label: "Approved",
        icon: CheckCircle,
        colorClass: "text-[#2BA24D]",
        bgColorClass: "bg-[#2BA24D]/5",
        borderColorClass: "border-[#2BA24D]/20",
      },
      {
        status: "pending",
        label: "Pending",
        icon: Clock,
        colorClass: "text-[#F0B401]",
        bgColorClass: "bg-[#F0B401]/5",
        borderColorClass: "border-[#F0B401]/20",
      },
      {
        status: "rejected",
        label: "Rejected",
        icon: XCircle,
        colorClass: "text-[#E43D2B]",
        bgColorClass: "bg-[#E43D2B]/5",
        borderColorClass: "border-[#E43D2B]/20",
      },
    ],
    renderItem: (request) => (
      <Card
        className={`p-4 hover:shadow-md transition-shadow cursor-pointer ${request.isOffline ? "border-orange-200 bg-orange-50/30" : ""}`}
        onClick={() => router.push(`/project-request/labour-request/${request.id}`)}
      >
        <div className="flex justify-between items-start">
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold text-blue-500">
              {request.referenceId}
            </span>
            {request.isOffline && (
              <div className="flex items-center gap-1 text-orange-600 text-xs">
                <WifiOff className="h-3 w-3" />
                <span>Offline</span>
              </div>
            )}
          </div>
          <Badge variant={getStatusBadgeVariant(request.status)}>
            {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
          </Badge>
        </div>
        <p className="text-sm text-gray-600">{request.project}</p>

        <div className="flex justify-between items-center mt-2">
          <div className="flex gap-4">
            <div>
              <p className="text-sm text-gray-500 font-semibold">Workers</p>
              <p className="text-sm text-gray-900">{request.workers}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500 font-semibold">Role</p>
              <p className="text-sm text-gray-900">{request.role}</p>
            </div>
          </div>

          <div>
            <p className="text-sm text-gray-500 font-semibold">Requester</p>
            <p className="text-sm text-gray-900">{request.requester}</p>
          </div>
        </div>
      </Card>
    ),
    mockData: combinedData,
  };

  if (isLoading && combinedData.length === 0) {
    return (
      <div className="min-h-screen bg-[#F1F5F9] flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-2 text-[#3B7CED]" />
          <p className="text-gray-600">Loading labour requests...</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Network Status Indicator */}
      <div className="bg-white px-4 py-2 border-b border-gray-100">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            {networkStatus.isOnline ? (
              <>
                <Wifi className="h-4 w-4 text-green-500" />
                <span className="text-sm text-green-600">Online</span>
              </>
            ) : (
              <>
                <WifiOff className="h-4 w-4 text-orange-500" />
                <span className="text-sm text-orange-600">
                  Offline - Changes saved locally
                </span>
              </>
            )}
          </div>
          {!networkStatus.isOnline && (
            <button
              onClick={() => syncService.performSync()}
              className="text-sm text-[#3B7CED] hover:text-[#2d63c7] flex items-center gap-1"
            >
              <RefreshCw className="h-3 w-3" />
              Sync Now
            </button>
          )}
        </div>
      </div>

      <RequestDashboard config={config} backUrl="/project-request/make-request" />
    </div>
  );
}
