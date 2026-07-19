import React, { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface Props {
  transactions?: any[];
  isLoading?: boolean;
  onRowClick?: (tx: any) => void;
}

export function TransactionHistoryTable({ transactions = [], isLoading = false, onRowClick }: Props) {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const totalPages = Math.max(1, Math.ceil((transactions?.length || 0) / itemsPerPage));
  const paginatedTransactions = (transactions || []).slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const getVisiblePages = () => {
    const pages: (number | string)[] = [];
    if (totalPages <= 5) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      if (currentPage <= 3) {
        pages.push(1, 2, 3, "...", totalPages);
      } else if (currentPage >= totalPages - 2) {
        pages.push(1, "...", totalPages - 2, totalPages - 1, totalPages);
      } else {
        pages.push(1, "...", currentPage, "...", totalPages);
      }
    }
    return pages;
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 flex flex-col overflow-hidden">
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="bg-[#F6F9FC] hover:bg-[#F6F9FC] border-b border-gray-150">
              <TableHead className="font-semibold text-[#8898AA] text-[11.5px] py-3.5 px-6 uppercase tracking-wider">Date</TableHead>
              <TableHead className="font-semibold text-[#8898AA] text-[11.5px] py-3.5 px-6 uppercase tracking-wider">Description</TableHead>
              <TableHead className="font-semibold text-[#8898AA] text-[11.5px] py-3.5 px-6 uppercase tracking-wider">Category</TableHead>
              <TableHead className="font-semibold text-[#8898AA] text-[11.5px] py-3.5 px-6 uppercase tracking-wider">Cost Category</TableHead>
              <TableHead className="font-semibold text-[#8898AA] text-[11.5px] py-3.5 px-6 uppercase tracking-wider">Amount</TableHead>
              <TableHead className="font-semibold text-[#8898AA] text-[11.5px] py-3.5 px-6 uppercase tracking-wider">Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                  Loading transactions...
                </TableCell>
              </TableRow>
            ) : paginatedTransactions && paginatedTransactions.length > 0 ? (
              paginatedTransactions.map((tx: any, idx: number) => {
                const dateStr = tx.date || tx.created_at ? new Date(tx.date || tx.created_at).toLocaleDateString() : "-";
                const descStr = tx.description || tx.desc || tx.name || tx.detail?.lines?.[0]?.description || tx.detail?.notes || tx.reference_id || `Transaction #${tx.id || idx + 1}`;
                const catStr = tx.category || tx.type || tx.request_type || tx.project_type || "-";
                const costCatStr = tx.cost_category || tx.cost_category_code || tx.cost_code || tx.costCat || "-";
                const amountVal = tx.amount || tx.detail?.total_amount || tx.total_amount || 0;
                const amountStr = `N${Number(amountVal).toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
                const statusStr = tx.status || "Approved";
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
                } else if (statusLower === "draft") {
                  badgeClass = "bg-[#E8F0FE] text-[#1A73E8]";
                }

                return (
                  <TableRow 
                    key={tx.id || idx} 
                    className="hover:bg-gray-50/50 border-b border-[#E9ECEF] cursor-pointer"
                    onClick={() => onRowClick?.(tx)}
                  >
                    <TableCell className="text-[#525F7F] py-3.5 px-6 text-sm">{dateStr}</TableCell>
                    <TableCell className="text-[#32325D] py-3.5 px-6 font-semibold text-sm">{descStr}</TableCell>
                    <TableCell className="text-[#525F7F] py-3.5 px-6 capitalize text-sm">{catStr}</TableCell>
                    <TableCell className="text-[#525F7F] py-3.5 px-6 font-mono uppercase text-sm">{costCatStr}</TableCell>
                    <TableCell className="text-[#32325D] font-bold py-3.5 px-6 text-sm">{amountStr}</TableCell>
                    <TableCell className="py-3.5 px-6">
                      <Badge className={`border-none font-semibold px-3 py-1 rounded-full text-xs hover:bg-opacity-80 transition-all ${badgeClass}`}>
                        {statusStr}
                      </Badge>
                    </TableCell>
                  </TableRow>
                );
              })
            ) : (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                  No transactions found for this project.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      
      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center p-4 border-t border-gray-150 bg-white">
          <div className="flex items-center gap-1.5">
            <Button 
              variant="outline" 
              size="icon" 
              className={`h-8 w-8 rounded border-none ${
                currentPage <= 1 ? "bg-gray-200 text-gray-400 cursor-not-allowed" : "bg-[#E9ECEF] text-gray-500 hover:bg-gray-300"
              }`}
              disabled={currentPage <= 1}
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>

            {getVisiblePages().map((page, index) => {
              if (page === "...") {
                return (
                  <span key={`dots-${index}`} className="text-gray-400 px-2 font-medium">
                    ...
                  </span>
                );
              }
              const isPageSelected = currentPage === page;
              return (
                <Button
                  key={`page-${page}`}
                  variant="outline"
                  className={`h-8 w-8 p-0 text-xs font-semibold rounded border ${
                    isPageSelected
                      ? "border-[#3B7CED] text-[#3B7CED] bg-white hover:bg-white hover:text-[#3B7CED]"
                      : "border-gray-200 text-gray-500 hover:bg-gray-50"
                  }`}
                  onClick={() => setCurrentPage(page as number)}
                >
                  {page}
                </Button>
              );
            })}

            <Button 
              variant="outline" 
              size="icon" 
              className={`h-8 w-8 rounded border ${
                currentPage >= totalPages ? "bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed" : "bg-white text-gray-500 hover:bg-gray-100 border-gray-200"
              }`}
              disabled={currentPage >= totalPages}
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
