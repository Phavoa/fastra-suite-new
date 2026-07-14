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
  const amountVal = transaction?.amount || transaction?.detail?.total_amount || transaction?.total_amount || 0;
  const amountStr = `N${Number(amountVal).toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
  
  const formatDate = (dateVal: any) => {
    if (!dateVal) return "-";
    const d = new Date(dateVal);
    if (isNaN(d.getTime())) return "-";
    return d.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };
  const dateStr = formatDate(transaction?.date || transaction?.created_at);

  const rawRef = transaction?.reference_id || transaction?.reference_no || transaction?.transaction_number || (transaction?.id ? `TXN-${transaction?.id}` : "");
  const refStr = rawRef ? `#${rawRef.replace("#", "")}` : "-";
  const catStr = transaction?.category || transaction?.type || transaction?.request_type || transaction?.project_type || "-";
  const statusStr = transaction?.status || "Approved";
  const descStr = transaction?.description || transaction?.desc || transaction?.name || transaction?.detail?.lines?.[0]?.description || transaction?.detail?.notes || "-";
  
  const extractWbs = (tx: any) => {
    if (tx?.wbs || tx?.phase_name || tx?.phase) {
      return tx.wbs || tx.phase_name || tx.phase;
    }
    const notes = tx?.detail?.notes || "";
    const match = notes.match(/Phase:\s*([^|]+)/i);
    return match ? match[1].trim() : "-";
  };
  const wbsStr = extractWbs(transaction);

  const costCatStr = transaction?.cost_category || transaction?.cost_category_code || transaction?.cost_code || transaction?.costCat || "-";
  const madeByStr = transaction?.created_by_name || transaction?.user?.name || transaction?.detail?.created_by_name || "John Doe";

  const statusLower = statusStr.toLowerCase();
  let badgeClass = "bg-gray-150 text-gray-700";
  if (statusLower.includes("approv") || statusLower === "done" || statusLower === "success") {
    badgeClass = "bg-[#E2F2E9] text-[#1E8E3E]";
  } else if (statusLower === "paid" || statusLower === "invoice") {
    badgeClass = "bg-[#E8F0FE] text-[#1A73E8]";
  } else if (statusLower.includes("cancel") || statusLower.includes("reject")) {
    badgeClass = "bg-[#FCE8E6] text-[#C5221F]";
  } else if (statusLower.includes("pend")) {
    badgeClass = "bg-[#FFF2CC] text-[#D66011]";
  } else if (statusLower.includes("draft")) {
    badgeClass = "bg-[#E8F0FE] text-[#1A73E8]";
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[500px] p-0 overflow-hidden bg-white">
        <DialogHeader className="p-6 pb-2">
          <DialogTitle className="text-xl font-bold text-gray-900">Transaction Details</DialogTitle>
          <p className="text-sm text-gray-500 mt-1">Transaction number {refStr}</p>
        </DialogHeader>
 
        <div className="px-6 py-4 flex flex-col gap-6">
          {/* Amount */}
          <div>
            <p className="text-sm text-gray-400 font-medium mb-1">Transaction Amount</p>
            <p className="text-3xl font-bold text-gray-900">{amountStr}</p>
          </div>
 
          <hr className="border-gray-100" />
 
          {/* Basic Information */}
          <div>
            <h3 className="font-semibold text-gray-900 mb-4">Basic Information</h3>
            <div className="grid grid-cols-2 gap-y-4 gap-x-8">
              <div>
                <p className="text-sm text-gray-400 font-medium mb-1">Transaction Date</p>
                <p className="text-sm font-semibold text-gray-800">{dateStr}</p>
              </div>
              <div>
                <p className="text-sm text-gray-400 font-medium mb-1">Transaction Number</p>
                <p className="text-sm font-semibold text-gray-800">{refStr}</p>
              </div>
              <div>
                <p className="text-sm text-gray-400 font-medium mb-1">Category</p>
                <p className="text-sm font-semibold text-gray-800 capitalize">{catStr}</p>
              </div>
              <div>
                <p className="text-sm text-gray-400 font-medium mb-1">Status</p>
                <div className="mt-0.5">
                  <span className={`inline-flex items-center justify-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${badgeClass}`}>
                    {statusStr}
                  </span>
                </div>
              </div>
              <div>
                <p className="text-sm text-gray-400 font-medium mb-1">Description</p>
                <p className="text-sm font-semibold text-gray-800">{descStr}</p>
              </div>
              <div>
                <p className="text-sm text-gray-400 font-medium mb-1">Transaction made by</p>
                <p className="text-sm font-semibold text-gray-800">{madeByStr}</p>
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
                <p className="text-sm font-semibold text-gray-800">{wbsStr}</p>
              </div>
              <div>
                <p className="text-sm text-gray-400 font-medium mb-1">Cost Category</p>
                <p className="text-sm font-semibold text-gray-800 font-mono uppercase">{costCatStr}</p>
              </div>
            </div>
          </div>
 
          <hr className="border-gray-100" />
 
          {/* Timeline */}
          <div>
            <h3 className="font-semibold text-gray-900 mb-4">Timeline</h3>
            <div className="flex flex-col relative pl-2">
              <div className="absolute left-[13px] top-3 bottom-8 w-[3px] bg-[#1E8E3E]"></div>
              
              <div className="flex gap-4 mb-6 relative">
                <div className="w-3.5 h-3.5 rounded-full bg-[#1E8E3E] mt-1 z-10 shrink-0 shadow-[0_0_0_4px_rgba(255,255,255,1)]"></div>
                <div>
                  <p className="font-semibold text-sm text-gray-900">Order accepted</p>
                  <p className="text-xs text-gray-400 mt-0.5">12:30pm, 12th May, 2024</p>
                </div>
              </div>
              
              <div className="flex gap-4 mb-6 relative">
                <div className="w-3.5 h-3.5 rounded-full bg-[#1E8E3E] mt-1 z-10 shrink-0 shadow-[0_0_0_4px_rgba(255,255,255,1)]"></div>
                <div>
                  <p className="font-semibold text-sm text-gray-900">Approved</p>
                  <p className="text-xs text-gray-400 mt-0.5">12:30pm, 12th May, 2024</p>
                </div>
              </div>
              
              <div className="flex gap-4 mb-6 relative">
                <div className="w-3.5 h-3.5 rounded-full bg-[#1E8E3E] mt-1 z-10 shrink-0 shadow-[0_0_0_4px_rgba(255,255,255,1)]"></div>
                <div>
                  <p className="font-semibold text-sm text-gray-900">Processing</p>
                  <p className="text-xs text-gray-400 mt-0.5">12:30pm, 12th May, 2024</p>
                </div>
              </div>
              
              <div className="flex gap-4 relative">
                <div className="w-3.5 h-3.5 rounded-full bg-[#1E8E3E] mt-1 z-10 shrink-0 shadow-[0_0_0_4px_rgba(255,255,255,1)]"></div>
                <div>
                  <p className="font-semibold text-sm text-gray-900">Request Approved</p>
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
