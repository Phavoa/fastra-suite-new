"use client";

import React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Check, AlertTriangle, Info } from "lucide-react";
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
    icon: Check,
    iconColor: "text-[#3B7CED]",
    bgColor: "bg-[#EEF4FF]",
    borderColor: "border-[#D0E1FD]",
    defaultActionText: "Done",
  },
  error: {
    icon: AlertTriangle,
    iconColor: "text-[#E43D2B]",
    bgColor: "bg-[#FFF2F0]",
    borderColor: "border-[#FFE0DB]",
    defaultActionText: "Try again",
  },
  warning: {
    icon: AlertTriangle,
    iconColor: "text-[#F0B401]",
    bgColor: "bg-[#FFFDF0]",
    borderColor: "border-[#FFEFC2]",
    defaultActionText: "Understood",
  },
  info: {
    icon: Info,
    iconColor: "text-[#3B7CED]",
    bgColor: "bg-[#EEF4FF]",
    borderColor: "border-[#D0E1FD]",
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
      <DialogContent className="max-w-[400px] w-[calc(100%-2rem)] p-6 rounded-2xl bg-white gap-0 border-none shadow-xl" showCloseButton={showCloseButton}>
        <div className="flex flex-col items-start w-full">
          {/* Header section with Icon, Title and Message */}
          <DialogHeader className="flex flex-col items-start text-left gap-0 p-0 w-full">
            <div
              className={cn(
                "w-12 h-12 rounded-full flex items-center justify-center border",
                config.bgColor,
                config.borderColor
              )}
            >
              <Icon className={cn("w-6 h-6", config.iconColor)} />
            </div>
            
            <DialogTitle className="text-lg font-bold text-gray-900 mt-5 leading-snug">
              {title}
            </DialogTitle>
            
            <DialogDescription className="text-sm font-medium text-gray-500 mt-2 leading-relaxed">
              {message}
            </DialogDescription>
          </DialogHeader>

          {/* Action buttons list */}
          <div className="w-full mt-6 flex flex-col gap-2">
            <Button
              onClick={handleAction}
              className="w-full h-12 bg-[#3B7CED] hover:bg-[#2d63c7] text-white rounded-lg font-semibold transition-colors text-sm flex items-center justify-center border-none shadow-none"
            >
              {actionText || config.defaultActionText}
            </Button>

            {secondaryText && onSecondary && (
              <Button
                variant="outline"
                onClick={onSecondary}
                className="w-full h-12 border border-gray-200 hover:bg-gray-50 text-gray-700 rounded-lg font-semibold transition-colors text-sm flex items-center justify-center"
              >
                {secondaryText}
              </Button>
            )}
          </div>
        </div>
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
