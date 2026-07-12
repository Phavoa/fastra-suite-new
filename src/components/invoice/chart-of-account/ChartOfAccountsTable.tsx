"use client";

import React, { useState } from "react";
import { ChevronDown, ChevronRight } from "lucide-react";
import { Account } from "./types";

interface Props {
  accounts: Account[];
  viewMode: "detailed" | "ledger";
  activeFilter: string;
  onFilterChange: (filter: string) => void;
  onDeactivate: (account: Account) => void;
}

const filters = [
  "All",
  "Assets",
  "Liabilities",
  "Equity",
  "Revenue",
  "Expenses",
];

export function ChartOfAccountsTable({
  accounts,
  viewMode,
  activeFilter,
  onFilterChange,
  onDeactivate,
}: Props) {
  const [expandedCategories, setExpandedCategories] = useState<string[]>([
    "1000",
    "2000",
    "3000",
    "4000",
    "5000",
  ]);

  const toggleCategory = (code: string) => {
    if (expandedCategories.includes(code)) {
      setExpandedCategories(expandedCategories.filter((c) => c !== code));
    } else {
      setExpandedCategories([...expandedCategories, code]);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      <div className="border-b border-gray-100 p-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">
            {viewMode === "detailed" ? "Accounts" : "Account Ledger"}
          </h2>

          <div className="flex gap-1 bg-gray-100 p-1 rounded-xl">
            {filters.map((filter) => (
              <button
                key={filter}
                onClick={() => onFilterChange(filter)}
                className={`px-4 py-1.5 text-sm rounded-[10px] transition-all ${
                  activeFilter === filter
                    ? "bg-white shadow-sm text-blue-600 font-medium"
                    : "text-gray-600 hover:bg-white/50"
                }`}
              >
                {filter}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-100">
              <th className="text-left py-4 px-6 font-medium text-gray-500 w-20">
                Code
              </th>
              <th className="text-left py-4 px-6 font-medium text-gray-500">
                Account Name
              </th>
              <th className="text-left py-4 px-6 font-medium text-gray-500 w-32">
                Type
              </th>
              <th className="text-right py-4 px-6 font-medium text-gray-500">
                Balance
              </th>
              {viewMode === "detailed" && <th className="w-32"></th>}
            </tr>
          </thead>
          <tbody>
            {accounts.map((category) => (
              <React.Fragment key={category.code}>
                {/* Category Row */}
                <tr className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-4 px-6">
                    <button
                      onClick={() => toggleCategory(category.code)}
                      className="flex items-center gap-2 font-medium text-gray-900"
                    >
                      {expandedCategories.includes(category.code) ? (
                        <ChevronDown className="w-4 h-4" />
                      ) : (
                        <ChevronRight className="w-4 h-4" />
                      )}
                      {category.code}
                    </button>
                  </td>
                  <td className="py-4 px-6 font-semibold text-gray-900">
                    {category.name}
                  </td>
                  <td className="py-4 px-6">
                    <span
                      className={`inline-block px-3 py-1 text-xs font-medium rounded-full 
                      ${category.type === "Assets" ? "bg-blue-100 text-blue-700" : ""}
                      ${category.type === "Liabilities" ? "bg-red-100 text-red-700" : ""}
                      ${category.type === "Equity" ? "bg-amber-100 text-amber-700" : ""}
                      ${category.type === "Revenue" ? "bg-green-100 text-green-700" : ""}
                      ${category.type === "Expenses" ? "bg-orange-100 text-orange-700" : ""}`}
                    >
                      {category.type}
                    </span>
                  </td>
                  <td className="py-4 px-6 text-right font-medium">
                    N{category.balance.toLocaleString()}
                  </td>
                  {viewMode === "detailed" && <td></td>}
                </tr>

                {/* Child Rows */}
                {viewMode === "detailed" &&
                  expandedCategories.includes(category.code) &&
                  category.children?.map((child, idx) => (
                    <tr
                      key={idx}
                      className="border-b border-gray-100 hover:bg-gray-50"
                    >
                      <td className="py-4 px-6 pl-12 text-gray-600">
                        {child.code}
                      </td>
                      <td className="py-4 px-6 text-gray-700">{child.name}</td>
                      <td className="py-4 px-6">
                        <span
                          className={`inline-block px-3 py-1 text-xs font-medium rounded-full 
                          ${child.type === "Assets" ? "bg-blue-100 text-blue-700" : ""}
                          ${child.type === "Liabilities" ? "bg-red-100 text-red-700" : ""}
                          ${child.type === "Equity" ? "bg-amber-100 text-amber-700" : ""}
                          ${child.type === "Revenue" ? "bg-green-100 text-green-700" : ""}
                          ${child.type === "Expenses" ? "bg-orange-100 text-orange-700" : ""}`}
                        >
                          {child.type}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-right font-medium text-gray-700">
                        N{child.balance.toLocaleString()}
                      </td>
                      <td className="py-4 px-6 text-right">
                        <button
                          onClick={() =>
                            onDeactivate({ ...child, isCategory: false })
                          }
                          className="border border-red-500 text-red-600 hover:bg-red-50 px-4 py-1.5 rounded-lg text-sm font-medium transition-colors"
                        >
                          Deactivate
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
