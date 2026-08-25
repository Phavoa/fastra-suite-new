"use client";

import React, { useState, useMemo } from "react";
import {
  Search,
  CheckCheck,
  Filter,
  RefreshCw,
  Volume2,
  VolumeX,
  Inbox,
  Clock,
  Radio,
  ClipboardList,
  ShoppingCart,
  Package,
  Receipt,
  Briefcase,
  SlidersHorizontal,
  CheckCircle2,
  Loader2,
} from "lucide-react";
import {
  useGetNotificationsQuery,
  useMarkAllAsReadMutation,
  useMarkAsReadMutation,
} from "@/api/notificationApi";
import { useNotificationContext } from "@/contexts/NotificationContext";
import { NotificationItem } from "@/components/notifications/NotificationItem";
import type { AppNotification } from "@/types/notification";

const MODULE_FILTERS = [
  { id: "all", label: "All Modules" },
  { id: "project_request", label: "Project Request", icon: ClipboardList },
  { id: "purchase", label: "Purchase", icon: ShoppingCart },
  { id: "inventory", label: "Inventory", icon: Package },
  { id: "invoice", label: "Invoice", icon: Receipt },
  { id: "project_costing", label: "Project Costing", icon: Briefcase },
];

export default function NotificationsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedModule, setSelectedModule] = useState("all");
  const [statusFilter, setStatusFilter] = useState<"all" | "unread" | "read">("all");
  const [selectedIds, setSelectedIds] = useState<number[]>([]);

  const {
    data: notifications = [],
    isLoading,
    isFetching,
    refetch,
  } = useGetNotificationsQuery();

  const [markAllAsRead, { isLoading: isMarkingAll }] = useMarkAllAsReadMutation();
  const [markAsRead] = useMarkAsReadMutation();
  const { isConnected, soundEnabled, setSoundEnabled } = useNotificationContext();

  // Metrics
  const unreadCount = useMemo(
    () => notifications.filter((n) => !n.is_read).length,
    [notifications]
  );

  const projectReqCount = useMemo(
    () => notifications.filter((n) => (n.module || "").includes("project_request")).length,
    [notifications]
  );

  const purchaseCount = useMemo(
    () => notifications.filter((n) => (n.module || "").includes("purchase")).length,
    [notifications]
  );

  const inventoryCount = useMemo(
    () => notifications.filter((n) => (n.module || "").includes("inventory")).length,
    [notifications]
  );

  // Filtered Notifications
  const filteredNotifications = useMemo(() => {
    return notifications.filter((item) => {
      // Status filter
      if (statusFilter === "unread" && item.is_read) return false;
      if (statusFilter === "read" && !item.is_read) return false;

      // Module filter
      if (selectedModule !== "all") {
        const mod = (item.module || "").toLowerCase();
        if (!mod.includes(selectedModule.toLowerCase())) return false;
      }

      // Search query
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchesTitle = item.title?.toLowerCase().includes(query);
        const matchesMessage = item.message?.toLowerCase().includes(query);
        const matchesActor = item.actor_name?.toLowerCase().includes(query);
        const matchesModule = item.module_display?.toLowerCase().includes(query);
        const matchesId = String(item.object_id || "").includes(query);
        if (!matchesTitle && !matchesMessage && !matchesActor && !matchesModule && !matchesId) {
          return false;
        }
      }

      return true;
    });
  }, [notifications, statusFilter, selectedModule, searchQuery]);

  // Bulk actions
  const handleSelectAll = () => {
    if (selectedIds.length === filteredNotifications.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredNotifications.map((n) => n.id));
    }
  };

  const handleToggleSelect = (id: number) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const handleMarkSelectedAsRead = async () => {
    const unreadSelected = filteredNotifications
      .filter((n) => selectedIds.includes(n.id) && !n.is_read)
      .map((n) => n.id);

    for (const id of unreadSelected) {
      await markAsRead(id).unwrap().catch(() => {});
    }
    setSelectedIds([]);
  };

  return (
    <div className="space-y-6">
      {/* Header and Live Status */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">
              Notifications
            </h1>
            {unreadCount > 0 && (
              <span className="px-3 py-0.5 text-xs font-bold bg-[#E43D2B] text-white rounded-full shadow-xs">
                {unreadCount} unread
              </span>
            )}
          </div>
          <p className="text-sm text-gray-600 mt-1">
            Stay informed with real-time updates and activity alerts across all modules.
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2.5 flex-wrap">
          {/* Real-time Status Badge */}
          <div
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium border ${
              isConnected
                ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                : "bg-amber-50 text-amber-700 border-amber-200"
            }`}
          >
            <span
              className={`w-2 h-2 rounded-full ${
                isConnected ? "bg-emerald-500 animate-pulse" : "bg-amber-500"
              }`}
            />
            <span>{isConnected ? "Live Connected" : "Connecting..."}</span>
          </div>

          {/* Sound Toggle */}
          <button
            type="button"
            onClick={() => setSoundEnabled(!soundEnabled)}
            className="p-2 rounded-xl border border-gray-200 bg-white text-gray-700 hover:bg-gray-50 transition-colors shadow-xs"
            title={soundEnabled ? "Mute notification sounds" : "Unmute notification sounds"}
          >
            {soundEnabled ? <Volume2 size={18} /> : <VolumeX size={18} className="text-gray-600" />}
          </button>

          {/* Refresh Button */}
          <button
            type="button"
            onClick={() => refetch()}
            disabled={isFetching}
            className="p-2 rounded-xl border border-gray-200 bg-white text-gray-700 hover:bg-gray-50 transition-colors shadow-xs"
            title="Refresh notifications"
          >
            <RefreshCw size={18} className={isFetching ? "animate-spin" : ""} />
          </button>

          {/* Mark All as Read */}
          {unreadCount > 0 && (
            <button
              type="button"
              onClick={() => markAllAsRead()}
              disabled={isMarkingAll}
              className="flex items-center gap-1.5 px-4 py-2 bg-[#3B7CED] hover:bg-blue-600 text-white text-sm font-semibold rounded-xl transition-all shadow-sm hover:shadow-md disabled:opacity-50"
            >
              <CheckCheck size={16} />
              <span>Mark all as read</span>
            </button>
          )}
        </div>
      </div>

      {/* Metrics Banner */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
        <div className="p-4 rounded-2xl bg-white border border-gray-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-gray-600">Total Alerts</span>
            <span className="p-2 rounded-xl bg-blue-50 text-[#3B7CED]">
              <Inbox size={18} />
            </span>
          </div>
          <p className="text-2xl font-bold text-gray-900 mt-2">{notifications.length}</p>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-gray-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-gray-600">Unread</span>
            <span className="p-2 rounded-xl bg-red-50 text-red-600">
              <Clock size={18} />
            </span>
          </div>
          <p className="text-2xl font-bold text-gray-900 mt-2">{unreadCount}</p>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-gray-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-gray-600">Project Requests</span>
            <span className="p-2 rounded-xl bg-purple-50 text-purple-600">
              <ClipboardList size={18} />
            </span>
          </div>
          <p className="text-2xl font-bold text-gray-900 mt-2">{projectReqCount}</p>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-gray-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-gray-600">Purchases & Orders</span>
            <span className="p-2 rounded-xl bg-blue-50 text-blue-600">
              <ShoppingCart size={18} />
            </span>
          </div>
          <p className="text-2xl font-bold text-gray-900 mt-2">{purchaseCount}</p>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-xs space-y-3">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          {/* Search Input */}
          <div className="relative flex-1 max-w-md">
            <Search
              size={18}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-600 pointer-events-none"
            />
            <input
              type="text"
              placeholder="Search notifications by title, message, or user..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-gray-50 hover:bg-gray-100/70 focus:bg-white border border-gray-200 rounded-xl text-sm text-gray-900 placeholder:text-gray-600 focus:outline-none focus:ring-2 focus:ring-[#3B7CED] transition-all"
            />
          </div>

          {/* Status Filter Tabs */}
          <div className="flex items-center gap-1 bg-gray-100 p-1 rounded-xl self-start md:self-auto">
            <button
              onClick={() => setStatusFilter("all")}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
                statusFilter === "all"
                  ? "bg-white text-[#3B7CED] shadow-xs"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              All ({notifications.length})
            </button>

            <button
              onClick={() => setStatusFilter("unread")}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
                statusFilter === "unread"
                  ? "bg-white text-[#3B7CED] shadow-xs"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              Unread ({unreadCount})
            </button>

            <button
              onClick={() => setStatusFilter("read")}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
                statusFilter === "read"
                  ? "bg-white text-[#3B7CED] shadow-xs"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              Read ({notifications.length - unreadCount})
            </button>
          </div>
        </div>

        {/* Module Category Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none pt-1">
          {MODULE_FILTERS.map((mod) => {
            const isSelected = selectedModule === mod.id;
            return (
              <button
                key={mod.id}
                onClick={() => setSelectedModule(mod.id)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium shrink-0 flex items-center gap-1.5 transition-all border ${
                  isSelected
                    ? "bg-[#3B7CED] text-white border-[#3B7CED] shadow-xs"
                    : "bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100"
                }`}
              >
                {mod.icon && <mod.icon size={13} />}
                <span>{mod.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Bulk Selection Bar */}
      {selectedIds.length > 0 && (
        <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl flex items-center justify-between animate-in fade-in-50 duration-150">
          <span className="text-xs font-semibold text-blue-900">
            {selectedIds.length} item{selectedIds.length > 1 ? "s" : ""} selected
          </span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleMarkSelectedAsRead}
              className="px-3 py-1 bg-[#3B7CED] hover:bg-blue-600 text-white text-xs font-medium rounded-lg transition-colors shadow-xs"
            >
              Mark Selected as Read
            </button>
            <button
              type="button"
              onClick={() => setSelectedIds([])}
              className="px-2 py-1 text-xs text-gray-600 hover:text-gray-800"
            >
              Clear Selection
            </button>
          </div>
        </div>
      )}

      {/* Notification List Body */}
      <div className="space-y-2.5">
        {isLoading ? (
          <div className="py-20 bg-white rounded-2xl border border-gray-200 flex flex-col items-center justify-center text-gray-600 gap-3">
            <Loader2 size={32} className="animate-spin text-[#3B7CED]" />
            <p className="text-sm font-medium">Loading notifications...</p>
          </div>
        ) : filteredNotifications.length === 0 ? (
          <div className="py-20 bg-white rounded-2xl border border-gray-200 flex flex-col items-center justify-center text-center p-6">
            <div className="w-16 h-16 rounded-full bg-blue-50 text-[#3B7CED] flex items-center justify-center mb-3">
              <CheckCircle2 size={32} />
            </div>
            <h3 className="text-base font-bold text-gray-900">No notifications found</h3>
            <p className="text-xs sm:text-sm text-gray-600 max-w-sm mt-1">
              {searchQuery || selectedModule !== "all" || statusFilter !== "all"
                ? "Try adjusting your filters or search terms to find what you're looking for."
                : "You're all caught up! New alerts and notifications will appear here in real-time."}
            </p>
          </div>
        ) : (
          filteredNotifications.map((notification) => (
            <div
              key={notification.id}
              className="flex items-center gap-3 bg-white p-1 rounded-2xl border border-gray-200 shadow-xs hover:border-blue-200 transition-colors"
            >
              <div className="pl-3 py-3">
                <input
                  type="checkbox"
                  checked={selectedIds.includes(notification.id)}
                  onChange={() => handleToggleSelect(notification.id)}
                  className="w-4 h-4 rounded text-[#3B7CED] focus:ring-[#3B7CED] border-gray-300 cursor-pointer"
                  aria-label={`Select notification ${notification.title}`}
                />
              </div>

              <div className="flex-1 min-w-0 pr-1">
                <NotificationItem
                  notification={notification}
                  compact={false}
                />
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
