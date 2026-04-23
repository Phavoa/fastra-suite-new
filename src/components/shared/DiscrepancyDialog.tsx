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
import { AlertTriangle, Undo2, ShoppingCart, X } from "lucide-react";
import { cn } from "@/lib/utils";

export type DiscrepancyType = "backorder" | "return";

interface DiscrepancyDialogProps {
  /** Whether the dialog is open */
  isOpen: boolean;
  /** Callback when the dialog is closed without action */
  onClose: () => void;
  /** The type of discrepancy to handle */
  type: DiscrepancyType | null;
  /** Callback when the user confirms the action (Yes) */
  onConfirm: () => void;
  /** Callback when the user declines the action but acknowledges (No) */
  onDecline: () => void;
  /** Loading state for the action button */
  isLoading?: boolean;
}

export function DiscrepancyDialog({
  isOpen,
  onClose,
  type,
  onConfirm,
  onDecline,
  isLoading = false,
}: DiscrepancyDialogProps) {
  if (!type) return null;

  const isBackorder = type === "backorder";

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md border-none p-0 overflow-hidden rounded-xl">
        <div className="relative">
          {/* Header/Banner Section with Icon */}
          <div className={cn(
            "pt-10 pb-6 flex flex-col items-center justify-center",
            isBackorder ? "bg-amber-50" : "bg-blue-50"
          )}>
            <div className={cn(
              "w-20 h-20 rounded-full flex items-center justify-center mb-4 shadow-sm",
              isBackorder ? "bg-amber-100 text-amber-600" : "bg-blue-100 text-blue-600"
            )}>
              {isBackorder ? (
                <ShoppingCart className="w-10 h-10" />
              ) : (
                <Undo2 className="w-10 h-10" />
              )}
            </div>
            <h2 className="text-2xl font-bold text-gray-900 tracking-tight">OOPS!</h2>
            <div className="flex gap-1 mt-1">
              <div className={cn("h-1.5 w-12 rounded-full", isBackorder ? "bg-amber-400" : "bg-blue-400")} />
              <div className={cn("h-1.5 w-4 rounded-full opacity-60", isBackorder ? "bg-amber-400" : "bg-blue-400")} />
            </div>
          </div>

          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute right-4 top-4 p-1 rounded-full text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>

          {/* Body Content */}
          <div className="px-8 py-8 text-center">
            <p className="text-gray-600 text-lg font-medium leading-relaxed mb-2">
              {isBackorder 
                ? "The received quantity is less than the expected quantity." 
                : "The received quantity is more than the expected quantity."
              }
            </p>
            <p className="text-gray-500 text-md">
              {isBackorder 
                ? "Would you like to place a backorder for the remaining quantity?" 
                : "Do you want to return the extra goods?"
              }
            </p>
          </div>

          {/* Footer Actions */}
          <div className="px-8 pb-8 flex flex-col sm:flex-row gap-3">
            <Button
              variant="outline"
              onClick={onDecline}
              disabled={isLoading}
              className="w-full sm:flex-1 h-12 text-gray-700 border-gray-200 hover:bg-gray-50 font-semibold text-base transition-all duration-200"
            >
              No, Thank You
            </Button>
            <Button
              onClick={onConfirm}
              loading={isLoading}
              className={cn(
                "w-full sm:flex-1 h-12 font-semibold text-base text-white shadow-md transition-all duration-200",
                isBackorder ? "bg-amber-600 hover:bg-amber-700" : "bg-blue-600 hover:bg-blue-700"
              )}
            >
              {isBackorder ? "Yes, Place Backorder" : "Yes, Process Return"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default DiscrepancyDialog;
