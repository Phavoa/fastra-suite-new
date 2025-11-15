"use client";

import * as React from "react";
import { CheckCircle, XCircle, AlertCircle, Info } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type StatusType = "success" | "error" | "warning" | "info";

interface StatusModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  description: string;
  status?: StatusType;
  actionLabel?: string;
  onAction?: () => void;
  showCloseButton?: boolean;
  closeOnAction?: boolean;
}

const statusConfig = {
  success: {
    icon: CheckCircle,
    iconBg: "bg-blue-50",
    iconColor: "text-blue-600",
  },
  error: {
    icon: XCircle,
    iconBg: "bg-red-50",
    iconColor: "text-red-600",
  },
  warning: {
    icon: AlertCircle,
    iconBg: "bg-yellow-50",
    iconColor: "text-yellow-600",
  },
  info: {
    icon: Info,
    iconBg: "bg-blue-50",
    iconColor: "text-blue-600",
  },
};

export function StatusModal({
  isOpen,
  onClose,
  title,
  description,
  status = "success",
  actionLabel = "Continue",
  onAction,
  showCloseButton = true,
  closeOnAction = true,
}: StatusModalProps) {
  const config = statusConfig[status];
  const Icon = config.icon;

  const handleAction = () => {
    if (onAction) {
      onAction();
    }
    if (closeOnAction) {
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent
        className={cn(
          "sm:max-w-lg",
          "bg-white border-0 shadow-xl",
          "data-[state=open]:animate-status-modal-bounce data-[state=closed]:animate-out",
          "data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
          "data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95",
          "data-[state=open]:slide-in-from-bottom-4 data-[state=closed]:slide-out-to-bottom-4"
        )}
        showCloseButton={showCloseButton}
      >
        <DialogHeader className="text-center">
          <div className="flex mb-4">
            <div
              className={cn(
                "w-14 h-14 rounded-full flex items-center justify-center",
                config.iconBg,
                "animate-status-icon-pulse"
              )}
            >
              <Icon
                className={cn(
                  "w-7 h-7",
                  config.iconColor,
                  "animate-checkmark-draw"
                )}
              />
            </div>
          </div>
          <DialogTitle className="text-xl font-semibold text-gray-900">
            {title}
          </DialogTitle>
          <DialogDescription className="text-gray-600 text-sm leading-relaxed">
            {description}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="flex-col gap-2">
          <Button
            onClick={handleAction}
            className="w-full bg-[#3B7CED] hover:bg-[#3B7CED]/90 text-white font-medium py-4 px-4 rounded transition-colors border-none"
          >
            {actionLabel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
