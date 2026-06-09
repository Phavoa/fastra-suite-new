import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  transaction?: any;
}

export function TransactionDetailsModal({ isOpen, onClose, transaction }: Props) {
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[500px] p-0 overflow-hidden bg-white">
        <DialogHeader className="p-6 pb-2">
          <DialogTitle className="text-xl font-bold text-gray-900">Transaction Details</DialogTitle>
          <p className="text-sm text-gray-500 mt-1">Transaction number #TXN-00123</p>
        </DialogHeader>

        <div className="px-6 py-4 flex flex-col gap-6">
          {/* Amount */}
          <div>
            <p className="text-sm text-gray-400 font-medium mb-1">Transaction Amount</p>
            <p className="text-3xl font-bold text-gray-900">N50,000</p>
          </div>

          <hr className="border-gray-100" />

          {/* Basic Information */}
          <div>
            <h3 className="font-semibold text-gray-900 mb-4">Basic Information</h3>
            <div className="grid grid-cols-2 gap-y-4 gap-x-8">
              <div>
                <p className="text-sm text-gray-400 font-medium mb-1">Transaction Date</p>
                <p className="text-sm font-semibold text-gray-800">May 15,2026</p>
              </div>
              <div>
                <p className="text-sm text-gray-400 font-medium mb-1">Transaction Number</p>
                <p className="text-sm font-semibold text-gray-800">May 15,2026</p>
              </div>
              <div>
                <p className="text-sm text-gray-400 font-medium mb-1">Category</p>
                <p className="text-sm font-semibold text-gray-800">Labor</p>
              </div>
              <div>
                <p className="text-sm text-gray-400 font-medium mb-1">Status</p>
                <p className="text-sm font-semibold text-gray-800">May 15,2026</p>
              </div>
              <div className="col-span-2">
                <p className="text-sm text-gray-400 font-medium mb-1">Description</p>
                <p className="text-sm font-semibold text-gray-800">Building Project</p>
              </div>
            </div>
          </div>

          <hr className="border-gray-100" />

          {/* Project Category */}
          <div>
            <h3 className="font-semibold text-gray-900 mb-4">Project Category</h3>
            <div className="grid grid-cols-2 gap-y-4 gap-x-8">
              <div>
                <p className="text-sm text-gray-400 font-medium mb-1">WBS</p>
                <p className="text-sm font-semibold text-gray-800">Phase 1</p>
              </div>
              <div>
                <p className="text-sm text-gray-400 font-medium mb-1">Cost Category</p>
                <p className="text-sm font-semibold text-gray-800">LAB-001</p>
              </div>
            </div>
          </div>

          <hr className="border-gray-100" />

          {/* Timeline */}
          <div>
            <h3 className="font-semibold text-gray-900 mb-4">Timeline</h3>
            <div className="flex flex-col relative pl-2">
              <div className="absolute left-[11px] top-3 bottom-8 w-0.5 bg-green-500"></div>
              
              <div className="flex gap-4 mb-6 relative">
                <div className="w-3 h-3 rounded-full bg-green-500 mt-1.5 z-10 shrink-0 shadow-[0_0_0_4px_rgba(255,255,255,1)]"></div>
                <div>
                  <p className="font-semibold text-sm text-gray-900">Order accepted</p>
                  <p className="text-xs text-gray-400 mt-0.5">12:30pm, 12th May, 2024</p>
                </div>
              </div>
              
              <div className="flex gap-4 mb-6 relative">
                <div className="w-3 h-3 rounded-full bg-green-500 mt-1.5 z-10 shrink-0 shadow-[0_0_0_4px_rgba(255,255,255,1)]"></div>
                <div>
                  <p className="font-semibold text-sm text-gray-900">Approved</p>
                  <p className="text-xs text-gray-400 mt-0.5">12:30pm, 12th May, 2024</p>
                </div>
              </div>
              
              <div className="flex gap-4 mb-6 relative">
                <div className="w-3 h-3 rounded-full bg-green-500 mt-1.5 z-10 shrink-0 shadow-[0_0_0_4px_rgba(255,255,255,1)]"></div>
                <div>
                  <p className="font-semibold text-sm text-gray-900">Processing</p>
                  <p className="text-xs text-gray-400 mt-0.5">12:30pm, 12th May, 2024</p>
                </div>
              </div>
              
              <div className="flex gap-4 relative">
                <div className="w-3 h-3 rounded-full bg-green-500 mt-1.5 z-10 shrink-0 shadow-[0_0_0_4px_rgba(255,255,255,1)]"></div>
                <div>
                  <p className="font-semibold text-sm text-gray-900">Request approve</p>
                  <p className="text-xs text-gray-400 mt-0.5">12:30pm, 12th May, 2024</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="p-6 pt-2 flex justify-end">
          <Button onClick={onClose} className="bg-[#3B7CED] hover:bg-[#3065c3] text-white px-8">
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
