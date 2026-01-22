"use client";

import React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { CheckCircle2, XCircle, AlertTriangle, Info, X } from "lucide-react";
import { cn } from "@/lib/utils";

export type StatusType = "success" | "error" | "warning" | "info";

export interface StatusModalProps {
  /** Whether the modal is open */
  isOpen: boolean;
  /** Callback when the modal is closed */
  onClose: () => void;
  /** The type of status to display */
  type: StatusType;
  /** The title of the modal */
  title: string;
  /** The message to display */
  message: string;
  /** Optional action button text (defaults based on type) */
  actionText?: string;
  /** Optional callback for the action button */
  onAction?: () => void;
  /** Optional secondary button text */
  secondaryText?: string;
  /** Optional callback for the secondary button */
  onSecondary?: () => void;
  /** Whether to show the close button in the header */
  showCloseButton?: boolean;
}

const statusConfig: Record<
  StatusType,
  {
    icon: React.ElementType;
    iconColor: string;
    bgColor: string;
    borderColor: string;
    defaultActionText: string;
  }
> = {
  success: {
    icon: CheckCircle2,
    iconColor: "text-green-500",
    bgColor: "bg-green-50",
    borderColor: "border-green-200",
    defaultActionText: "Continue",
  },
  error: {
    icon: XCircle,
    iconColor: "text-red-500",
    bgColor: "bg-red-50",
    borderColor: "border-red-200",
    defaultActionText: "Try Again",
  },
  warning: {
    icon: AlertTriangle,
    iconColor: "text-amber-500",
    bgColor: "bg-amber-50",
    borderColor: "border-amber-200",
    defaultActionText: "Understood",
  },
  info: {
    icon: Info,
    iconColor: "text-blue-500",
    bgColor: "bg-blue-50",
    borderColor: "border-blue-200",
    defaultActionText: "OK",
  },
};

export function StatusModal({
  isOpen,
  onClose,
  type,
  title,
  message,
  actionText,
  onAction,
  secondaryText,
  onSecondary,
  showCloseButton = true,
}: StatusModalProps) {
  const config = statusConfig[type];
  const Icon = config.icon;

  const handleAction = () => {
    if (onAction) {
      onAction();
    } else {
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        {showCloseButton && (
          <button
            onClick={onClose}
            className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground"
          >
            <X className="h-4 w-4" />
            <span className="sr-only">Close</span>
          </button>
        )}

        <DialogHeader className="flex flex-col items-center text-center">
          <div
            className={cn(
              "w-16 h-16 rounded-full flex items-center justify-center mb-4",
              config.bgColor,
              config.borderColor,
              "border"
            )}
          >
            <Icon className={cn("w-8 h-8", config.iconColor)} />
          </div>
          <DialogTitle className="text-xl font-semibold">{title}</DialogTitle>
          <DialogDescription className="text-gray-600 mt-2">
            {message}
          </DialogDescription>
        </DialogHeader>

        <DialogFooter className="flex flex-col sm:flex-row gap-2 mt-6">
          {secondaryText && onSecondary && (
            <Button
              variant="outline"
              onClick={onSecondary}
              className="w-full sm:w-auto"
            >
              {secondaryText}
            </Button>
          )}
          <Button
            onClick={handleAction}
            className={cn(
              "w-full sm:w-auto",
              type === "success" &&
                "bg-green-600 hover:bg-green-700  border-green-700 text-white",
              type === "error" &&
                "bg-red-600 hover:bg-red-700 border-red-700 text-white",
              type === "warning" &&
                "bg-amber-600 hover:bg-amber-700 border-amber-700 text-white",
              type === "info" &&
                "bg-[#3B7CED] hover:bg-[#2d63c7] border-[#3B7CED] text-white"
            )}
          >
            {actionText || config.defaultActionText}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// Hook for easier status modal management
export interface UseStatusModalReturn {
  isOpen: boolean;
  type: StatusType;
  title: string;
  message: string;
  showSuccess: (title: string, message: string) => void;
  showError: (title: string, message: string) => void;
  showWarning: (title: string, message: string) => void;
  showInfo: (title: string, message: string) => void;
  close: () => void;
}

export function useStatusModal(): UseStatusModalReturn {
  const [isOpen, setIsOpen] = React.useState(false);
  const [type, setType] = React.useState<StatusType>("info");
  const [title, setTitle] = React.useState("");
  const [message, setMessage] = React.useState("");

  const show = (
    statusType: StatusType,
    statusTitle: string,
    statusMessage: string
  ) => {
    setType(statusType);
    setTitle(statusTitle);
    setMessage(statusMessage);
    setIsOpen(true);
  };

  return {
    isOpen,
    type,
    title,
    message,
    showSuccess: (t, m) => show("success", t, m),
    showError: (t, m) => show("error", t, m),
    showWarning: (t, m) => show("warning", t, m),
    showInfo: (t, m) => show("info", t, m),
    close: () => setIsOpen(false),
  };
}

export default StatusModal;
