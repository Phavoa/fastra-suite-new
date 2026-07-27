"use client";

import React, { useState } from "react";
import { ChartOfAccountsTable } from "@/components/invoice/chart-of-account/ChartOfAccountsTable";
import { AccountFormModal } from "@/components/invoice/chart-of-account/AccountFormModal";
import { DeactivateModals } from "@/components/invoice/chart-of-account/DeactivateModals";
import { SuccessModal } from "@/components/invoice/chart-of-account/SuccessModal";
import { Search, Plus, Grid3X3, List } from "lucide-react";
import { Account } from "@/components/invoice/chart-of-account/types";

const initialAccounts: Account[] = [
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
        bankName: "GTBank",
        branch: "Lagos",
        sortCode: "16271",
        currency: "Naira",
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
  { label: "Equity", value: "N304,330", color: "text-amber-500" },
  { label: "Revenue", value: "N612,800", color: "text-green-600" },
  { label: "Expenses", value: "N572,800", color: "text-red-600" },
];

export default function ChartOfAccountsPage() {
  const [accounts, setAccounts] = useState<Account[]>(initialAccounts);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeFilter, setActiveFilter] = useState("All");
  const [viewMode, setViewMode] = useState<"detailed" | "ledger">("detailed");

  // Modal states
  const [formModal, setFormModal] = useState<{
    isOpen: boolean;
    mode: "add" | "edit";
    account?: Account | null;
    parentCode?: string;
  }>({ isOpen: false, mode: "add" });

  const [deactivateState, setDeactivateState] = useState<{
    isOpen: boolean;
    account: Account | null;
    step: "confirm" | "cannot" | "reassign";
  }>({ isOpen: false, account: null, step: "confirm" });

  const [successModalOpen, setSuccessModalOpen] = useState(false);

  const filteredAccounts = accounts
    .map((cat) => ({
      ...cat,
      children: cat.children?.filter(
        (child) =>
          child.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          child.code.includes(searchTerm),
      ),
    }))
    .filter((cat) => {
      if (activeFilter === "All") return true;
      return cat.type === activeFilter;
    });

  const handleAddAccount = (parentCode?: string) => {
    setFormModal({ isOpen: true, mode: "add", parentCode });
  };

  const handleEditAccount = (account: Account) => {
    setFormModal({ isOpen: true, mode: "edit", account });
  };

  const handleSaveAccount = (data: any) => {
    if (formModal.mode === "add") {
      // Add new child under the correct category
      const updated = accounts.map((cat) => {
        if (
          cat.code === formModal.parentCode ||
          (formModal.parentCode === undefined && cat.type === data.type)
        ) {
          return {
            ...cat,
            children: [
              ...(cat.children || []),
              {
                code: data.code,
                name: data.name,
                type: data.type,
                balance: 0,
                bankName: data.bankName,
                branch: data.branch,
                sortCode: data.sortCode,
                currency: data.currency,
              },
            ],
          };
        }
        return cat;
      });
      setAccounts(updated);
      setSuccessModalOpen(true);
    } else {
      // Edit existing
      const updated = accounts.map((cat) => ({
        ...cat,
        children: cat.children?.map((child) =>
          child.code === formModal.account?.code
            ? { ...child, ...data }
            : child,
        ),
      }));
      setAccounts(updated);
    }
    setFormModal({ isOpen: false, mode: "add" });
  };

  const handleDeactivateClick = (account: Account) => {
    // Simulate some accounts having transactions
    const hasTransactions = ["1110", "1200", "2100"].includes(account.code);
    setDeactivateState({
      isOpen: true,
      account,
      step: hasTransactions ? "cannot" : "confirm",
    });
  };

  const handleReassignComplete = (code: string) => {
    const updated = accounts.map((cat) => ({
      ...cat,
      children: cat.children?.filter((c) => c.code !== code),
    }));
    setAccounts(updated);
    setDeactivateState({ isOpen: false, account: null, step: "confirm" });
  };

  return (
    <div className="p-6 space-y-4">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-gray-500">
        <span>Home</span>
        <span className="text-gray-400">›</span>
        <span>Invoice</span>
        <span className="text-gray-400">›</span>
        <span className="text-gray-700 font-medium">Payment Queue</span>
      </div>
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl font-semibold text-gray-900">
          Chart of Accounts
        </h1>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="relative flex-1 sm:flex-none sm:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search"
              className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <button
            onClick={() => handleAddAccount()}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded text-sm font-medium transition-colors"
          >
            <Plus className="w-4 h-4" />
            New Account
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {summaryData.map((item) => (
          <div
            key={item.label}
            className="bg-white rounded border border-gray-100 p-5 shadow-sm"
          >
            <p className="text-sm text-gray-500">{item.label}</p>
            <p className={`text-2xl font-semibold mt-1 ${item.color}`}>
              {item.value}
            </p>
          </div>
        ))}
      </div>

      {/* Table */}
      <ChartOfAccountsTable
        accounts={filteredAccounts}
        viewMode={viewMode}
        activeFilter={activeFilter}
        onFilterChange={setActiveFilter}
        onAddAccount={handleAddAccount}
        onEditAccount={handleEditAccount}
      />

      {/* Modals */}
      <AccountFormModal
        isOpen={formModal.isOpen}
        mode={formModal.mode}
        account={formModal.account}
        onClose={() => setFormModal({ isOpen: false, mode: "add" })}
        onSave={handleSaveAccount}
        onDeactivate={() => {
          if (formModal.account) {
            setFormModal({ isOpen: false, mode: "add" });
            handleDeactivateClick(formModal.account);
          }
        }}
      />

      <DeactivateModals
        state={deactivateState}
        onClose={() =>
          setDeactivateState({ isOpen: false, account: null, step: "confirm" })
        }
        onReassignComplete={handleReassignComplete}
        onSwitchToReassign={() =>
          setDeactivateState((prev) => ({ ...prev, step: "reassign" }))
        }
      />

      <SuccessModal
        isOpen={successModalOpen}
        onClose={() => setSuccessModalOpen(false)}
        message="Account has successfully been added"
      />
    </div>
  );
}
