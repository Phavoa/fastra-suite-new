"use client";

import React, { useState, useEffect, useMemo } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  CheckCheck,
  Volume2,
  VolumeX,
  Search,
  ArrowRight,
  Inbox,
  Loader2,
  ExternalLink,
  ClipboardList,
  ShoppingCart,
  Package,
  Receipt,
  Briefcase,
  SlidersHorizontal,
} from "lucide-react";
import {
  useGetNotificationsQuery,
  useMarkAllAsReadMutation,
} from "@/api/notificationApi";
import { useNotificationContext } from "@/contexts/NotificationContext";
import { NotificationItem } from "./NotificationItem";

interface NotificationSlideoutProps {
  isOpen: boolean;
  onClose: () => void;
}

const MODULE_FILTERS = [
  { id: "all", label: "All" },
  { id: "project_request", label: "Project Request", icon: ClipboardList },
  { id: "purchase", label: "Purchase", icon: ShoppingCart },
  { id: "inventory", label: "Inventory", icon: Package },
  { id: "invoice", label: "Invoice", icon: Receipt },
  { id: "project_costing", label: "Project Costing", icon: Briefcase },
];

export function NotificationSlideout({ isOpen, onClose }: NotificationSlideoutProps) {
  const [mounted, setMounted] = useState(false);
  const [tab, setTab] = useState<"all" | "unread">("all");
  const [selectedModule, setSelectedModule] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  const {
    data: notifications = [],
    isLoading,
    isFetching,
  } = useGetNotificationsQuery(undefined, {
    pollingInterval: 60000,
  });

  const [markAllAsRead, { isLoading: isMarkingAll }] = useMarkAllAsReadMutation();
  const { isConnected, soundEnabled, setSoundEnabled } = useNotificationContext();

  useEffect(() => {
    setMounted(true);
  }, []);

  // Lock body scroll when drawer is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  // Handle ESC key to close
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  const unreadNotifications = useMemo(
    () => notifications.filter((n) => !n.is_read),
    [notifications]
  );
  const unreadCount = unreadNotifications.length;

  const filteredList = useMemo(() => {
    let list = tab === "unread" ? unreadNotifications : notifications;

    if (selectedModule !== "all") {
      list = list.filter((n) =>
        (n.module || "").toLowerCase().includes(selectedModule.toLowerCase())
      );
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(
        (n) =>
          n.title?.toLowerCase().includes(q) ||
          n.message?.toLowerCase().includes(q) ||
          n.actor_name?.toLowerCase().includes(q) ||
          n.module_display?.toLowerCase().includes(q)
      );
    }

    return list;
  }, [tab, unreadNotifications, notifications, selectedModule, searchQuery]);

  if (!mounted) return null;

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex justify-end">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            aria-hidden="true"
            className="fixed inset-0 bg-black/40 backdrop-blur-xs transition-opacity"
          />

          {/* Slideout Panel */}
          <motion.aside
            role="dialog"
            aria-modal="true"
            aria-label="Notifications Panel"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 28, stiffness: 280 }}
            className="relative w-full max-w-md sm:max-w-lg bg-white h-full shadow-2xl flex flex-col z-50 overflow-hidden border-l border-gray-200"
          >
            {/* Header */}
            <div className="p-4 sm:p-5 border-b border-gray-100 bg-gray-50/70 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <h2 className="text-lg font-bold text-gray-900 tracking-tight">
                  Notifications
                </h2>
                {unreadCount > 0 && (
                  <span className="px-2.5 py-0.5 bg-[#E43D2B] text-white text-xs font-bold rounded-full shadow-xs">
                    {unreadCount} new
                  </span>
                )}
              </div>

              <div className="flex items-center gap-1.5">
                {/* Live Connected Status */}
                <div
                  className="p-1.5 rounded-lg flex items-center"
                  title={isConnected ? "WebSocket connected" : "Connecting to real-time channel..."}
                >
                  <span
                    className={`w-2 h-2 rounded-full ${
                      isConnected ? "bg-emerald-500 animate-pulse" : "bg-amber-500"
                    }`}
                  />
                </div>

                {/* Sound Toggle */}
                <button
                  type="button"
                  onClick={() => setSoundEnabled(!soundEnabled)}
                  title={soundEnabled ? "Mute notification sounds" : "Unmute notification sounds"}
                  className="p-2 rounded-xl text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-colors"
                >
                  {soundEnabled ? <Volume2 size={18} /> : <VolumeX size={18} className="text-gray-600" />}
                </button>

                {/* Mark All Read */}
                {unreadCount > 0 && (
                  <button
                    type="button"
                    onClick={() => markAllAsRead()}
                    disabled={isMarkingAll}
                    title="Mark all notifications as read"
                    className="flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-[#3B7CED] hover:bg-blue-50 rounded-xl transition-colors disabled:opacity-50"
                  >
                    <CheckCheck size={15} />
                    <span className="hidden sm:inline">Mark all read</span>
                  </button>
                )}

                {/* Close Button */}
                <button
                  type="button"
                  onClick={onClose}
                  aria-label="Close notifications panel"
                  className="p-2 rounded-xl text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-colors ml-1"
                >
                  <X size={20} />
                </button>
              </div>
            </div>

            {/* Filter Tabs & Search */}
            <div className="p-4 border-b border-gray-100 bg-white space-y-3">
              {/* Search Bar */}
              <div className="relative">
                <Search
                  size={16}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-600 pointer-events-none"
                />
                <input
                  type="text"
                  placeholder="Search notifications..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-4 py-1.5 bg-gray-50 hover:bg-gray-100/70 focus:bg-white border border-gray-200 rounded-xl text-xs text-gray-900 placeholder:text-gray-600 focus:outline-none focus:ring-2 focus:ring-[#3B7CED] transition-all"
                />
              </div>

              {/* Status Tabs */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 bg-gray-100 p-1 rounded-xl text-xs font-medium">
                  <button
                    onClick={() => setTab("all")}
                    className={`px-3 py-1 rounded-lg transition-all ${
                      tab === "all"
                        ? "bg-white text-[#3B7CED] font-semibold shadow-xs"
                        : "text-gray-600 hover:text-gray-900"
                    }`}
                  >
                    All ({notifications.length})
                  </button>
                  <button
                    onClick={() => setTab("unread")}
                    className={`px-3 py-1 rounded-lg transition-all ${
                      tab === "unread"
                        ? "bg-white text-[#3B7CED] font-semibold shadow-xs"
                        : "text-gray-600 hover:text-gray-900"
                    }`}
                  >
                    Unread ({unreadCount})
                  </button>
                </div>

                {isFetching && (
                  <div className="flex items-center text-gray-600 text-xs gap-1">
                    <Loader2 size={12} className="animate-spin text-[#3B7CED]" />
                    <span className="text-[11px]">Syncing...</span>
                  </div>
                )}
              </div>

              {/* Module Filter Pills */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
                {MODULE_FILTERS.map((mod) => {
                  const isSelected = selectedModule === mod.id;
                  return (
                    <button
                      key={mod.id}
                      onClick={() => setSelectedModule(mod.id)}
                      className={`px-2.5 py-1 rounded-full text-[11px] font-medium shrink-0 flex items-center gap-1 transition-all border ${
                        isSelected
                          ? "bg-[#3B7CED] text-white border-[#3B7CED] shadow-xs"
                          : "bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100"
                      }`}
                    >
                      {mod.icon && <mod.icon size={11} />}
                      <span>{mod.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Notification List Body */}
            <div className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-2">
              {isLoading ? (
                <div className="py-20 flex flex-col items-center justify-center text-gray-600 gap-2.5">
                  <Loader2 size={28} className="animate-spin text-[#3B7CED]" />
                  <p className="text-xs font-medium">Loading your alerts...</p>
                </div>
              ) : filteredList.length === 0 ? (
                <div className="py-20 px-4 flex flex-col items-center justify-center text-center">
                  <div className="w-14 h-14 rounded-2xl bg-blue-50 text-[#3B7CED] flex items-center justify-center mb-3">
                    <Inbox size={26} />
                  </div>
                  <h4 className="text-sm font-bold text-gray-900">
                    {tab === "unread" ? "No unread notifications" : "No notifications found"}
                  </h4>
                  <p className="text-xs text-gray-600 mt-1 max-w-[240px]">
                    {searchQuery || selectedModule !== "all"
                      ? "No matching alerts found for your active filter."
                      : tab === "unread"
                      ? "You've reviewed all pending alerts."
                      : "New activity alerts from all modules will appear here in real-time."}
                  </p>
                </div>
              ) : (
                filteredList.map((notification) => (
                  <NotificationItem
                    key={notification.id}
                    notification={notification}
                    compact={false}
                    onItemClick={onClose}
                  />
                ))
              )}
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-gray-100 bg-gray-50/80 flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs text-gray-600">
                <span
                  className={`w-2 h-2 rounded-full ${
                    isConnected ? "bg-emerald-500" : "bg-gray-400"
                  }`}
                />
                <span className="text-[11px] font-medium">
                  {isConnected ? "Live real-time active" : "Connecting..."}
                </span>
              </div>

              <Link
                href="/notifications"
                onClick={onClose}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-gray-200 hover:border-[#3B7CED] hover:text-[#3B7CED] text-gray-700 text-xs font-semibold rounded-xl shadow-xs transition-all"
              >
                <span>Full Notifications Center</span>
                <ArrowRight size={13} />
              </Link>
            </div>
          </motion.aside>
        </div>
      )}
    </AnimatePresence>,
    document.body
  );
}
