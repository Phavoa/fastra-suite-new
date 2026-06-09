"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ArrowLeft, CheckCircle2, Clock, CheckSquare, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { TransactionHistoryTable } from "@/components/project-costing/TransactionHistoryTable";
import { FilterModal } from "@/components/project-costing/modals/FilterModal";
import { TransactionDetailsModal } from "@/components/project-costing/modals/TransactionDetailsModal";
import { useParams } from "next/navigation";

export default function TransactionsPage() {
  const params = useParams();
  const id = params?.id || "1";
  
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const [isTransactionModalOpen, setIsTransactionModalOpen] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState<any>(null);

  const handleRowClick = (tx: any) => {
    setSelectedTransaction(tx);
    setIsTransactionModalOpen(true);
  };

  return (
    <div className="flex flex-col h-full bg-gray-50 relative min-h-screen">
      {/* Top Navigation Row */}
      <div className="flex items-center justify-between px-6 py-4 bg-white border-b border-gray-100 shadow-sm">
        <div className="flex items-center">
          <Link href={`/project-costing/${id}`}>
            <Button variant="ghost" size="icon" className="mr-2 h-8 w-8">
              <ArrowLeft className="h-5 w-5 text-gray-500" />
            </Button>
          </Link>
          <h1 className="text-lg font-medium text-gray-800">Transaction history</h1>
        </div>
        <Button variant="ghost" size="icon" onClick={() => setIsFilterModalOpen(true)}>
          <Filter className="h-5 w-5 text-gray-600" />
        </Button>
      </div>

      <div className="p-6 max-w-[1400px] mx-auto w-full flex flex-col gap-6">
        
        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded shadow-sm border border-gray-100 border-t-2 border-t-green-500">
            <div className="flex items-center gap-2 mb-2 text-green-500">
              <CheckCircle2 className="h-5 w-5" />
              <span className="text-sm font-medium">Approved transactions</span>
            </div>
            <div className="text-3xl font-semibold text-green-500 mt-2">
              32
            </div>
          </div>
          
          <div className="bg-white p-6 rounded shadow-sm border border-gray-100 border-t-2 border-t-yellow-500">
            <div className="flex items-center gap-2 mb-2 text-yellow-500">
              <Clock className="h-5 w-5" />
              <span className="text-sm font-medium">Pending transactions</span>
            </div>
            <div className="text-3xl font-semibold text-yellow-500 mt-2">
              19
            </div>
          </div>

          <div className="bg-white p-6 rounded shadow-sm border border-gray-100 border-t-2 border-t-blue-500">
            <div className="flex items-center gap-2 mb-2 text-blue-500">
              <CheckSquare className="h-5 w-5" />
              <span className="text-sm font-medium">Total Transactions</span>
            </div>
            <div className="text-3xl font-semibold text-blue-500 mt-2">
              50
            </div>
          </div>
        </div>

        {/* Transaction Table */}
        <TransactionHistoryTable onRowClick={handleRowClick} />

      </div>

      {/* Modals */}
      <FilterModal 
        isOpen={isFilterModalOpen} 
        onClose={() => setIsFilterModalOpen(false)} 
      />
      <TransactionDetailsModal 
        isOpen={isTransactionModalOpen} 
        onClose={() => setIsTransactionModalOpen(false)}
        transaction={selectedTransaction}
      />
    </div>
  );
}
