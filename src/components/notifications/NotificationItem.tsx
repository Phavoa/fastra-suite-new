"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { Check, ExternalLink } from "lucide-react";
import type { AppNotification } from "@/types/notification";
import { useMarkAsReadMutation } from "@/api/notificationApi";
import { getModuleConfig, formatTimeAgo } from "@/utils/notificationHelpers";

interface NotificationItemProps {
  notification: AppNotification;
  onItemClick?: () => void;
  compact?: boolean;
}

export function NotificationItem({
  notification,
  onItemClick,
  compact = false,
}: NotificationItemProps) {
  const router = useRouter();
  const [markAsRead, { isLoading: isMarkingRead }] = useMarkAsReadMutation();
  const config = getModuleConfig(notification.module);
  const Icon = config.Icon;

  const handleCardClick = async () => {
    if (!notification.is_read) {
      markAsRead(notification.id).catch(() => {});
    }

    if (onItemClick) {
      onItemClick();
    }

    if (notification.action_url) {
      router.push(notification.action_url);
    }
  };

  const handleMarkAsReadClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!notification.is_read) {
      markAsRead(notification.id);
    }
  };

  return (
    <div
      onClick={handleCardClick}
      className={`group relative flex items-start gap-3 p-3.5 rounded-xl cursor-pointer transition-all duration-150 border ${
        notification.is_read
          ? "bg-white border-transparent hover:bg-gray-50/80"
          : "bg-blue-50/40 border-blue-100/60 hover:bg-blue-50/70"
      }`}
    >
      {/* Module Icon */}
      <div
        className={`p-2 rounded-xl ${config.iconBg} ${config.iconColor} shrink-0 mt-0.5 shadow-xs`}
      >
        <Icon size={18} />
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2 mb-1">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span
              className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${config.badgeBg} ${config.badgeText}`}
            >
              {config.label}
            </span>
            {!notification.is_read && (
              <span className="inline-block w-2 h-2 rounded-full bg-[#3B7CED] animate-pulse" />
            )}
          </div>
          <span className="text-[11px] text-gray-600 shrink-0 font-medium">
            {formatTimeAgo(notification.created_at)}
          </span>
        </div>

        <h5
          className={`text-xs md:text-sm font-semibold truncate ${
            notification.is_read ? "text-gray-700" : "text-gray-900"
          }`}
        >
          {notification.title || "Notification"}
        </h5>

        <p
          className={`text-xs mt-0.5 leading-relaxed ${
            notification.is_read ? "text-gray-500" : "text-gray-700"
          } ${compact ? "line-clamp-2" : "line-clamp-3"}`}
        >
          {notification.message}
        </p>

        <div className="flex items-center justify-between gap-2 mt-2">
          {notification.actor_name ? (
            <span className="text-[11px] text-gray-600">
              By <span className="font-medium text-gray-700">{notification.actor_name}</span>
            </span>
          ) : (
            <span />
          )}

          <div className="flex items-center gap-1">
            {!notification.is_read && (
              <button
                type="button"
                onClick={handleMarkAsReadClick}
                disabled={isMarkingRead}
                title="Mark as read"
                className="p-1 rounded-md text-gray-600 hover:text-[#3B7CED] hover:bg-blue-100/50 transition-colors opacity-80 group-hover:opacity-100"
              >
                <Check size={14} />
              </button>
            )}

            {notification.action_url && (
              <span className="text-[11px] text-[#3B7CED] font-medium inline-flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                <span>Open</span>
                <ExternalLink size={11} />
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
