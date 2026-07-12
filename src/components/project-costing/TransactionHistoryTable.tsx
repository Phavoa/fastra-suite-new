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

  return (
    <div className="bg-white rounded shadow-sm border border-gray-100 flex flex-col">
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="bg-gray-50 border-b-gray-100 hover:bg-gray-50">
              <TableHead className="font-medium text-gray-500 py-3">Date</TableHead>
              <TableHead className="font-medium text-gray-500 py-3">Description</TableHead>
              <TableHead className="font-medium text-gray-500 py-3">Category</TableHead>
              <TableHead className="font-medium text-gray-500 py-3">Cost Category</TableHead>
              <TableHead className="font-medium text-gray-500 py-3">Amount</TableHead>
              <TableHead className="font-medium text-gray-500 py-3">Status</TableHead>
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
                const descStr = tx.description || tx.desc || tx.name || `Transaction #${tx.id || idx + 1}`;
                const catStr = tx.category || tx.type || tx.project_type || "-";
                const costCatStr = tx.cost_category || tx.costCat || tx.cost_code || "-";
                const amountVal = tx.amount !== undefined ? tx.amount : (tx.total_amount || 0);
                const amountStr = typeof amountVal === "number" ? `₦${amountVal.toLocaleString()}` : (amountVal || "₦0");
                const statusStr = tx.status || "Approved";
                const statusLower = statusStr.toLowerCase();

                return (
                  <TableRow 
                    key={tx.id || idx} 
                    className="hover:bg-gray-50 border-b-gray-100 cursor-pointer"
                    onClick={() => onRowClick?.(tx)}
                  >
                    <TableCell className="text-gray-600 py-4">{dateStr}</TableCell>
                    <TableCell className="text-gray-600 py-4 font-medium text-gray-800">{descStr}</TableCell>
                    <TableCell className="text-gray-600 py-4 capitalize">{catStr}</TableCell>
                    <TableCell className="text-gray-600 py-4 font-mono uppercase">{costCatStr}</TableCell>
                    <TableCell className="text-gray-800 font-semibold py-4">{amountStr}</TableCell>
                    <TableCell className="py-4">
                      {statusLower.includes("approv") || statusLower === "paid" || statusLower === "done" ? (
                        <Badge className="bg-green-100 text-green-700 hover:bg-green-100 border-none font-normal px-3 py-1">{statusStr}</Badge>
                      ) : statusLower.includes("cancel") || statusLower.includes("reject") ? (
                        <Badge className="bg-red-100 text-red-700 hover:bg-red-100 border-none font-normal px-3 py-1">{statusStr}</Badge>
                      ) : statusLower.includes("pend") ? (
                        <Badge className="bg-yellow-100 text-yellow-700 hover:bg-yellow-100 border-none font-normal px-3 py-1">{statusStr}</Badge>
                      ) : (
                        <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100 border-none font-normal px-3 py-1">{statusStr}</Badge>
                      )}
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
        <div className="flex items-center justify-center p-4 border-t border-gray-100 bg-white">
          <div className="flex items-center gap-1">
            <Button 
              variant="outline" 
              size="icon" 
              className="h-8 w-8 border-gray-200 text-gray-500 hover:bg-gray-100" 
              disabled={currentPage <= 1}
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="text-sm font-medium text-gray-600 px-3">
              Page {currentPage} of {totalPages}
            </span>
            <Button 
              variant="outline" 
              size="icon" 
              className="h-8 w-8 border-gray-200 text-gray-500 hover:bg-gray-100"
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
