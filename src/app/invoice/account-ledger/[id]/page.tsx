"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Upload, Filter } from "lucide-react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable"; // optional but recommended if available

interface Transaction {
  date: string;
  description: string;
  wbs: string;
  debit: number | null;
  credit: number | null;
  runningBalance: number;
}

const mockTransactions: Transaction[] = [
  {
    date: "Jun 02, 2026",
    description: "Opening Balance",
    wbs: "-",
    debit: null,
    credit: 5500000,
    runningBalance: 5500000,
  },
  {
    date: "Jun 10, 2026",
    description: "Meridian Engineering Ltd",
    wbs: "WBS-CIVIL-002.1",
    debit: null,
    credit: 245000,
    runningBalance: 5255000,
  },
  {
    date: "Jun 18, 2026",
    description: "Atlas Civil Works LLC",
    wbs: "WBS-CIVIL-002.1",
    debit: 28400,
    credit: 380000,
    runningBalance: 4875000,
  },
  {
    date: "Jun 25, 2026",
    description: "Meridian Engineering Ltd",
    wbs: "WBS-CIVIL-002.1",
    debit: null,
    credit: 28400,
    runningBalance: 4846600,
  },
];

export default async function AccountDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const router = useRouter();
  const [vendorFilter, setVendorFilter] = useState("");
  const [wbsFilter, setWbsFilter] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  const { id } = await params;

  const account = {
    code: id || "1010",
    name: "Main Operating Account",
    currentBalance: 4287340.52,
    projectedBalance: 3258440.52,
  };

  const formatCurrency = (value: number | null) => {
    if (value === null || value === 0) return "-";
    return `N${value.toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  const handleExportPDF = () => {
    const doc = new jsPDF();

    // Header
    doc.setFontSize(16);
    doc.text("Account Ledger Statement", 14, 20);

    doc.setFontSize(11);
    doc.text(`${account.code} – ${account.name}`, 14, 30);
    doc.text(
      `Current Balance: ${formatCurrency(account.currentBalance)}`,
      14,
      38,
    );
    doc.text(
      `30-Day Projected: ${formatCurrency(account.projectedBalance)}`,
      14,
      46,
    );

    // Simple table
    const tableData = mockTransactions.map((t) => [
      t.date,
      t.description,
      t.wbs,
      formatCurrency(t.debit),
      formatCurrency(t.credit),
      formatCurrency(t.runningBalance),
    ]);

    // Using autoTable if available, otherwise basic text
    try {
      // @ts-ignore
      autoTable(doc, {
        startY: 55,
        head: [
          [
            "Date",
            "Description",
            "WBS Element",
            "Debit",
            "Credit",
            "Running Balance",
          ],
        ],
        body: tableData,
        styles: { fontSize: 9 },
        headStyles: { fillColor: [59, 130, 246] },
      });
    } catch {
      // Fallback if autoTable is not installed
      let y = 60;
      tableData.forEach((row) => {
        doc.text(row.join(" | "), 14, y);
        y += 8;
      });
    }

    doc.save(`Account-Ledger-${account.code}.pdf`);
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.back()}
            className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </button>
          <h1 className="text-xl font-semibold text-gray-900">
            Account details
          </h1>
        </div>

        <button
          onClick={handleExportPDF}
          className="flex items-center gap-2 text-blue-600 hover:text-blue-700 text-sm font-medium"
        >
          <Upload className="w-4 h-4" />
          Export
        </button>
      </div>

      {/* Account Summary */}
      <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <p className="text-sm text-gray-500">{account.code}</p>
            <h2 className="text-2xl font-semibold text-gray-900 mt-1">
              {account.name}
            </h2>
          </div>

          <div className="flex gap-8">
            <div className="text-right">
              <p className="text-sm text-gray-500">Current Balance</p>
              <p className="text-xl font-semibold text-gray-900 mt-1">
                {formatCurrency(account.currentBalance)}
              </p>
            </div>
            <div className="text-right border-l border-gray-200 pl-8">
              <p className="text-sm text-gray-500">30-Day Projected</p>
              <p className="text-xl font-semibold text-green-600 mt-1">
                {formatCurrency(account.projectedBalance)}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
          <Filter className="w-4 h-4" />
          Filter
        </div>

        <select
          value={vendorFilter}
          onChange={(e) => setVendorFilter(e.target.value)}
          className="border border-gray-300 rounded-lg px-3 py-2 text-sm min-w-[140px]"
        >
          <option value="">Vendor</option>
          <option value="meridian">Meridian Engineering Ltd</option>
          <option value="atlas">Atlas Civil Works LLC</option>
        </select>

        <select
          value={wbsFilter}
          onChange={(e) => setWbsFilter(e.target.value)}
          className="border border-gray-300 rounded-lg px-3 py-2 text-sm min-w-[140px]"
        >
          <option value="">WBS Elements</option>
          <option value="WBS-CIVIL-002.1">WBS-CIVIL-002.1</option>
        </select>

        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-500">From</span>
          <input
            type="date"
            value={fromDate}
            onChange={(e) => setFromDate(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
          />
        </div>

        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-500">To</span>
          <input
            type="date"
            value={toDate}
            onChange={(e) => setToDate(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
          />
        </div>
      </div>

      {/* Transactions Table */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50/70">
              <th className="text-left py-3.5 px-6 text-sm font-medium text-gray-500">
                Date
              </th>
              <th className="text-left py-3.5 px-6 text-sm font-medium text-gray-500">
                Description
              </th>
              <th className="text-left py-3.5 px-6 text-sm font-medium text-gray-500">
                WBS Element
              </th>
              <th className="text-right py-3.5 px-6 text-sm font-medium text-gray-500">
                Debit
              </th>
              <th className="text-right py-3.5 px-6 text-sm font-medium text-gray-500">
                Credit
              </th>
              <th className="text-right py-3.5 px-6 text-sm font-medium text-gray-500">
                Running Balance
              </th>
            </tr>
          </thead>
          <tbody>
            {mockTransactions.map((tx, idx) => (
              <tr
                key={idx}
                className="border-b border-gray-100 hover:bg-gray-50/50"
              >
                <td className="py-4 px-6 text-sm text-gray-700">{tx.date}</td>
                <td className="py-4 px-6 text-sm text-gray-900">
                  {tx.description}
                </td>
                <td className="py-4 px-6 text-sm text-gray-600">{tx.wbs}</td>
                <td className="py-4 px-6 text-right text-sm font-medium text-red-600">
                  {formatCurrency(tx.debit)}
                </td>
                <td className="py-4 px-6 text-right text-sm font-medium text-green-600">
                  {formatCurrency(tx.credit)}
                </td>
                <td className="py-4 px-6 text-right text-sm font-semibold text-gray-900">
                  {formatCurrency(tx.runningBalance)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
