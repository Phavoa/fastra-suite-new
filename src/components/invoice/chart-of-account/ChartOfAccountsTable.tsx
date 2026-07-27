"use client";

import React, { useState } from "react";
import { ChevronDown, ChevronRight } from "lucide-react";
import { Account } from "./types";

interface Props {
  accounts: Account[];
  viewMode: "detailed" | "ledger";
  activeFilter: string;
  onFilterChange: (filter: string) => void;
  onAddAccount: (parentCode?: string) => void;
  onEditAccount: (account: Account) => void;
}

const filters = [
  "All",
  "Assets",
  "Liabilities",
  "Equity",
  "Revenue",
  "Expenses",
];

const typeBadgeStyles: Record<string, string> = {
  Assets: "bg-blue-100 text-blue-700",
  Liabilities: "bg-red-100 text-red-700",
  Equity: "bg-amber-100 text-amber-700",
  Revenue: "bg-green-100 text-green-700",
  Expenses: "bg-orange-100 text-orange-700",
};

export function ChartOfAccountsTable({
  accounts,
  viewMode,
  activeFilter,
  onFilterChange,
  onAddAccount,
  onEditAccount,
}: Props) {
  const [expanded, setExpanded] = useState<string[]>([
    "1000",
    "2000",
    "3000",
    "4000",
    "5000",
  ]);

  const toggle = (code: string) => {
    setExpanded((prev) =>
      prev.includes(code) ? prev.filter((c) => c !== code) : [...prev, code],
    );
  };

  return (
    <div className="bg-white rounded border border-gray-100 shadow-sm overflow-hidden">
      {/* Header + Filters */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
        <h2 className="text-lg font-semibold text-gray-900">
          {viewMode === "detailed" ? "Accounts" : "Account Ledger"}
        </h2>

        <div className="flex gap-1 bg-gray-100 p-1 rounded">
          {filters.map((f) => (
            <button
              key={f}
              onClick={() => onFilterChange(f)}
              className={`px-4 py-1.5 text-sm rounded-lg transition-all ${
                activeFilter === f
                  ? "bg-white shadow-sm text-blue-600 font-medium"
                  : "text-gray-600 hover:bg-white/60"
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50/50">
              <th className="text-left py-3.5 px-6 text-sm font-medium text-gray-500 w-28">
                Code
              </th>
              <th className="text-left py-3.5 px-6 text-sm font-medium text-gray-500">
                Account Name
              </th>
              <th className="text-left py-3.5 px-6 text-sm font-medium text-gray-500">
                Type
              </th>
              <th className="text-right py-3.5 px-6 text-sm font-medium text-gray-500">
                Balance
              </th>
              <th className=""></th>
            </tr>
          </thead>
          <tbody>
            {accounts.map((cat) => (
              <React.Fragment key={cat.code}>
                {/* Category Row */}
                <tr className="border-b border-gray-100 hover:bg-gray-50/50">
                  <td className="py-4 px-6">
                    <button
                      onClick={() => toggle(cat.code)}
                      className="flex items-center gap-2 font-medium text-gray-900"
                    >
                      {expanded.includes(cat.code) ? (
                        <ChevronDown className="w-4 h-4 text-gray-500" />
                      ) : (
                        <ChevronRight className="w-4 h-4 text-gray-500" />
                      )}
                      {cat.code}
                    </button>
                  </td>
                  <td className="py-4 px-6 font-semibold text-gray-900">
                    {cat.name}
                  </td>
                  <td className="py-4 px-6">
                    <span
                      className={`inline-flex px-3 py-1 text-xs font-medium rounded-full ${
                        typeBadgeStyles[cat.type]
                      }`}
                    >
                      {cat.type}
                    </span>
                  </td>
                  <td className="py-4 px-6 text-right font-medium text-gray-900">
                    N{cat.balance.toLocaleString()}
                  </td>
                  <td className="py-4 px-6 text-right">
                    <button
                      onClick={() => onAddAccount(cat.code)}
                      className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-4 py-1.5 rounded transition-colors"
                    >
                      Add account
                    </button>
                  </td>
                </tr>

                {/* Children (only in detailed view) */}
                {viewMode === "detailed" &&
                  expanded.includes(cat.code) &&
                  cat.children?.map((child) => (
                    <tr
                      key={child.code}
                      className="border-b border-gray-100 hover:bg-gray-50/50"
                    >
                      <td className="py-3.5 px-6 pl-14 text-gray-600">
                        {child.code}
                      </td>
                      <td className="py-3.5 px-6 text-gray-800">
                        {child.name}
                      </td>
                      <td className="py-3.5 px-6">
                        <span
                          className={`inline-flex px-3 py-1 text-xs font-medium rounded-full ${
                            typeBadgeStyles[child.type]
                          }`}
                        >
                          {child.type}
                        </span>
                      </td>
                      <td className="py-3.5 px-6 text-right font-medium text-gray-800">
                        N{child.balance.toLocaleString()}
                      </td>
                      <td className="py-3.5 px-6 text-right">
                        <button
                          onClick={() => onEditAccount(child)}
                          className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                        >
                          Edit
                        </button>
                      </td>
                    </tr>
                  ))}
              </React.Fragment>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
