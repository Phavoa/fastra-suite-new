"use client";

import React, { useState } from "react";
import { ChartOfAccountsTable } from "@/components/invoice/chart-of-account/ChartOfAccountsTable";
import { AccountModal } from "@/components/invoice/chart-of-account/AccountModal";
import { DeactivateModals } from "@/components/invoice/chart-of-account/DeactivateModals";
import { Search, Plus, Grid3X3, List } from "lucide-react";
import { Account } from "@/components/invoice/chart-of-account/types";

const mockAccounts: Account[] = [
  {
    code: "1000",
    name: "Assets",
    type: "Assets",
    balance: 482650,
    isCategory: true,
    children: [
      {
        code: "1110",
        name: "Main Operating Account",
        type: "Assets",
        balance: 482650,
      },
      {
        code: "1120",
        name: "Petty Cash Account",
        type: "Assets",
        balance: 482650,
      },
      {
        code: "1200",
        name: "Accounts Receivable",
        type: "Assets",
        balance: 482650,
      },
      { code: "1300", name: "Inventory", type: "Assets", balance: 482650 },
    ],
  },
  {
    code: "2000",
    name: "Liabilities",
    type: "Liabilities",
    balance: 178320,
    isCategory: true,
    children: [
      {
        code: "2100",
        name: "Accounts Payable",
        type: "Liabilities",
        balance: 178320,
      },
      {
        code: "2200",
        name: "Accrued Expenses",
        type: "Liabilities",
        balance: 178320,
      },
    ],
  },
  {
    code: "3000",
    name: "Equity",
    type: "Equity",
    balance: 304330,
    isCategory: true,
    children: [
      { code: "3100", name: "Owner Equity", type: "Equity", balance: 304330 },
      {
        code: "3200",
        name: "Retained Earnings",
        type: "Equity",
        balance: 304330,
      },
    ],
  },
  {
    code: "4000",
    name: "Revenue",
    type: "Revenue",
    balance: 612800,
    isCategory: true,
    children: [
      {
        code: "4100",
        name: "Contract Revenue",
        type: "Revenue",
        balance: 612800,
      },
      { code: "4200", name: "Other Income", type: "Revenue", balance: 612800 },
    ],
  },
  {
    code: "5000",
    name: "Expenses",
    type: "Expenses",
    balance: 572800,
    isCategory: true,
    children: [
      { code: "5100", name: "Labour Costs", type: "Expenses", balance: 572800 },
      {
        code: "5200",
        name: "Materials Costs",
        type: "Expenses",
        balance: 572800,
      },
      {
        code: "5300",
        name: "Subcontractor Costs",
        type: "Expenses",
        balance: 572800,
      },
      {
        code: "5400",
        name: "Plant and Equipment Costs",
        type: "Expenses",
        balance: 572800,
      },
      {
        code: "5500",
        name: "Petty Cash and Miscellaneous",
        type: "Expenses",
        balance: 572800,
      },
      {
        code: "5600",
        name: "Overhead Costs",
        type: "Expenses",
        balance: 572800,
      },
    ],
  },
];

const summaryData = [
  { label: "Assets", value: "N482,650", color: "text-blue-600" },
  { label: "Liabilities", value: "N178,320", color: "text-red-600" },
  { label: "Equity", value: "N304,330", color: "text-amber-600" },
  { label: "Revenue", value: "N612,800", color: "text-green-600" },
  { label: "Expenses", value: "N572,800", color: "text-red-600" },
];

export default function ChartOfAccountsPage() {
  const [accounts, setAccounts] = useState<Account[]>(mockAccounts);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeFilter, setActiveFilter] = useState("All");
  const [viewMode, setViewMode] = useState<"detailed" | "ledger">("detailed");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [deactivateState, setDeactivateState] = useState<{
    isOpen: boolean;
    account: Account | null;
    step: "confirm" | "cannot" | "reassign";
  }>({ isOpen: false, account: null, step: "confirm" });

  const filteredAccounts = accounts
    .map((acc) => ({
      ...acc,
      children: acc.children?.filter(
        (child) =>
          child.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          child.code.includes(searchTerm),
      ),
    }))
    .filter((acc) => {
      if (activeFilter === "All") return true;
      return acc.type === activeFilter;
    })
    .filter((acc) => acc.children && acc.children.length > 0);

  const handleAddAccount = (
    newAccount: Omit<Account, "isCategory" | "children">,
  ) => {
    // Simple implementation - add as child to Assets for demo
    const updated = [...accounts];
    const assets = updated[0];
    if (assets.children) {
      assets.children.push({ ...newAccount, type: "Assets" });
    }
    setAccounts(updated);
    setIsAddModalOpen(false);
  };

  const handleDeactivate = (account: Account) => {
    // Simulate some accounts having transactions
    const hasTransactions = ["1110", "1200", "2100"].includes(account.code);
    setDeactivateState({
      isOpen: true,
      account,
      step: hasTransactions ? "cannot" : "confirm",
    });
  };

  const handleReassignComplete = (accountCode: string) => {
    // Remove account from list
    const updated = accounts.map((cat) => ({
      ...cat,
      children: cat.children?.filter((child) => child.code !== accountCode),
    }));
    setAccounts(
      updated.filter((cat) => !cat.children || cat.children.length > 0),
    );
    setDeactivateState({ isOpen: false, account: null, step: "confirm" });
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl font-semibold text-gray-900">
          Chart of Accounts
        </h1>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="relative flex-1 sm:flex-none sm:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search accounts..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <button
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
          >
            <Plus className="w-4 h-4" />
            New Account
          </button>

          <div className="flex border border-gray-200 rounded-lg overflow-hidden">
            <button
              onClick={() => setViewMode("detailed")}
              className={`p-2 ${viewMode === "detailed" ? "bg-white shadow-sm" : "bg-gray-50"}`}
            >
              <List className="w-5 h-5 text-gray-600" />
            </button>
            <button
              onClick={() => setViewMode("ledger")}
              className={`p-2 ${viewMode === "ledger" ? "bg-white shadow-sm" : "bg-gray-50"}`}
            >
              <Grid3X3 className="w-5 h-5 text-gray-600" />
            </button>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {summaryData.map((item, i) => (
          <div
            key={i}
            className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm"
          >
            <p className="text-sm text-gray-500">{item.label}</p>
            <p className={`text-3xl font-semibold mt-2 ${item.color}`}>
              {item.value}
            </p>
          </div>
        ))}
      </div>

      {/* Main Content */}
      <ChartOfAccountsTable
        accounts={filteredAccounts}
        viewMode={viewMode}
        activeFilter={activeFilter}
        onFilterChange={setActiveFilter}
        onDeactivate={handleDeactivate}
      />

      {/* Modals */}
      <AccountModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSubmit={handleAddAccount}
      />

      <DeactivateModals
        state={deactivateState}
        onClose={() =>
          setDeactivateState({ isOpen: false, account: null, step: "confirm" })
        }
        onReassignComplete={handleReassignComplete}
      />
    </div>
  );
}
