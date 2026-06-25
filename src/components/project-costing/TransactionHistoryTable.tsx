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

const transactions = [
  { id: 1, date: "05/15/2026", desc: "Building Project", category: "Labor", costCat: "LAB-001", amount: "N450,000", status: "Approved", statusVariant: "validated" },
  { id: 2, date: "05/15/2026", desc: "Building Project", category: "Sub contractor", costCat: "SUB-001", amount: "N450,000", status: "Paid", statusVariant: "draft" },
  { id: 3, date: "05/15/2026", desc: "Building Project", category: "Sub contractor", costCat: "SUB-001", amount: "N450,000", status: "Paid", statusVariant: "draft" },
  { id: 4, date: "05/15/2026", desc: "Building Project", category: "Labor", costCat: "LAB-001", amount: "N450,000", status: "Cancelled", statusVariant: "canceled" },
  { id: 5, date: "05/15/2026", desc: "Building Project", category: "Labor", costCat: "LAB-001", amount: "N450,000", status: "Paid", statusVariant: "draft" },
  { id: 6, date: "05/15/2026", desc: "Building Project", category: "Labor", costCat: "LAB-001", amount: "N450,000", status: "Approved", statusVariant: "validated" },
  { id: 7, date: "05/15/2026", desc: "Building Project", category: "Labor", costCat: "LAB-001", amount: "N450,000", status: "Approved", statusVariant: "validated" },
  { id: 8, date: "05/15/2026", desc: "Building Project", category: "Sub contractor", costCat: "SUB-001", amount: "N450,000", status: "Paid", statusVariant: "draft" },
  { id: 9, date: "05/15/2026", desc: "Building Project", category: "Sub contractor", costCat: "SUB-001", amount: "N450,000", status: "Paid", statusVariant: "draft" },
  { id: 10, date: "05/15/2026", desc: "Building Project", category: "Sub contractor", costCat: "SUB-001", amount: "N450,000", status: "Paid", statusVariant: "draft" },
  { id: 11, date: "05/15/2026", desc: "Building Project", category: "Labor", costCat: "LAB-001", amount: "N450,000", status: "Approved", statusVariant: "validated" },
];

interface Props {
  onRowClick?: (tx: any) => void;
}

export function TransactionHistoryTable({ onRowClick }: Props) {
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
            {transactions.map((tx) => (
              <TableRow 
                key={tx.id} 
                className="hover:bg-gray-50 border-b-gray-100 cursor-pointer"
                onClick={() => onRowClick?.(tx)}
              >
                <TableCell className="text-gray-600 py-4">{tx.date}</TableCell>
                <TableCell className="text-gray-600 py-4">{tx.desc}</TableCell>
                <TableCell className="text-gray-600 py-4">{tx.category}</TableCell>
                <TableCell className="text-gray-600 py-4">{tx.costCat}</TableCell>
                <TableCell className="text-gray-600 py-4">{tx.amount}</TableCell>
                <TableCell className="py-4">
                  {tx.status === "Approved" && (
                    <Badge className="bg-green-100 text-green-700 hover:bg-green-100 border-none font-normal px-3 py-1">Approved</Badge>
                  )}
                  {tx.status === "Paid" && (
                    <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100 border-none font-normal px-3 py-1">Paid</Badge>
                  )}
                  {tx.status === "Cancelled" && (
                    <Badge className="bg-red-100 text-red-700 hover:bg-red-100 border-none font-normal px-3 py-1">Cancelled</Badge>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      
      {/* Pagination */}
      <div className="flex items-center justify-center p-4 border-t border-gray-100 bg-white">
        <div className="flex items-center gap-1">
          <Button variant="outline" size="icon" className="h-8 w-8 bg-gray-200 border-none text-gray-500" disabled>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="sm" className="h-8 w-8 border-blue-500 text-blue-600 font-medium">1</Button>
          <Button variant="ghost" size="sm" className="h-8 w-8 text-gray-600 font-medium hover:bg-gray-100">2</Button>
          <div className="h-8 w-8 flex items-center justify-center text-gray-500">...</div>
          <Button variant="ghost" size="sm" className="h-8 w-8 text-gray-600 font-medium hover:bg-gray-100">9</Button>
          <Button variant="ghost" size="sm" className="h-8 w-8 text-gray-600 font-medium hover:bg-gray-100">10</Button>
          <Button variant="outline" size="icon" className="h-8 w-8 border-gray-200 text-gray-500 hover:bg-gray-100">
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
