"use client";

import React, { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ExternalLink, ArrowRight } from "lucide-react";
import { useRouter } from "next/navigation";
import type { AppNotification } from "@/types/notification";
import { getModuleConfig, formatTimeAgo } from "@/utils/notificationHelpers";

interface NotificationToastProps {
  notification: AppNotification | null;
  onClose: () => void;
  onNavigate?: (url: string) => void;
  duration?: number;
}

export function NotificationToast({
  notification,
  onClose,
  onNavigate,
  duration = 6000,
}: NotificationToastProps) {
  const router = useRouter();

  useEffect(() => {
    if (notification && duration > 0) {
      const timer = setTimeout(onClose, duration);
      return () => clearTimeout(timer);
    }
  }, [notification, duration, onClose]);

  if (!notification) return null;

  const config = getModuleConfig(notification.module);
  const Icon = config.Icon;

  const handleClick = () => {
    if (notification.action_url) {
      if (onNavigate) {
        onNavigate(notification.action_url);
      } else {
        router.push(notification.action_url);
      }
    }
    onClose();
  };

  return (
    <AnimatePresence>
      {notification && (
        <motion.div
          initial={{ opacity: 0, y: -40, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -20, scale: 0.95 }}
          transition={{ duration: 0.25, ease: "easeOut" }}
          className="fixed top-5 right-5 z-50 max-w-sm w-full shadow-2xl rounded-xl bg-white border border-gray-100 overflow-hidden ring-1 ring-black/5"
        >
          <div className="p-4 flex items-start gap-3.5">
            <div
              className={`p-2.5 rounded-xl ${config.iconBg} ${config.iconColor} shrink-0 mt-0.5`}
            >
              <Icon size={20} />
            </div>

            <div
              className="flex-1 min-w-0 cursor-pointer"
              onClick={handleClick}
            >
              <div className="flex items-center gap-2 mb-1">
                <span
                  className={`text-[11px] font-semibold px-2 py-0.5 rounded-full border ${config.badgeBg} ${config.badgeText}`}
                >
                  {config.label}
                </span>
                <span className="text-[11px] text-gray-600">
                  {formatTimeAgo(notification.created_at)}
                </span>
              </div>

              <h4 className="text-sm font-semibold text-gray-900 line-clamp-1">
                {notification.title || "New Notification"}
              </h4>

              <p className="text-xs text-gray-600 line-clamp-2 mt-0.5 leading-relaxed">
                {notification.message}
              </p>

              {notification.actor_name && (
                <p className="text-[11px] text-gray-600 mt-1">
                  By <span className="font-medium text-gray-700">{notification.actor_name}</span>
                </p>
              )}

              {notification.action_url && (
                <div className="flex items-center gap-1 text-xs font-semibold text-[#3B7CED] mt-2 group">
                  <span>View Details</span>
                  <ArrowRight size={13} className="transition-transform group-hover:translate-x-0.5" />
                </div>
              )}
            </div>

            <button
              onClick={(e) => {
                e.stopPropagation();
                onClose();
              }}
              className="p-1 rounded-lg text-gray-600 hover:text-gray-600 hover:bg-gray-100 transition-colors shrink-0 -mr-1 -mt-1"
              aria-label="Close notification"
            >
              <X size={16} />
            </button>
          </div>
          
          {/* Subtle animated progress bar */}
          <motion.div
            initial={{ width: "100%" }}
            animate={{ width: "0%" }}
            transition={{ duration: duration / 1000, ease: "linear" }}
            className="h-1 bg-[#3B7CED]/60"
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
