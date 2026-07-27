// "use client";

// import React, { useState } from "react";
// import { useRouter } from "next/navigation";
// import {
//   Search,
//   Grid3X3,
//   List,
//   ChevronDown,
//   ChevronRight,
//   Filter,
// } from "lucide-react";

// interface LedgerAccount {
//   code: string;
//   name: string;
//   debits: number | null;
//   credits: number | null;
//   balance: number;
// }

// const mockAccounts: LedgerAccount[] = [
//   {
//     code: "1010",
//     name: "Main Operating Account",
//     debits: null,
//     credits: 1842650,
//     balance: 4287340,
//   },
//   {
//     code: "1010",
//     name: "Main Operating Account",
//     debits: null,
//     credits: 1842650,
//     balance: 4287340,
//   },
//   {
//     code: "1010",
//     name: "Main Operating Account",
//     debits: 28400,
//     credits: 1842650,
//     balance: 4287340,
//   },
//   {
//     code: "1010",
//     name: "Main Operating Account",
//     debits: 28400,
//     credits: 1842650,
//     balance: 4287340,
//   },
//   {
//     code: "1010",
//     name: "Main Operating Account",
//     debits: null,
//     credits: 1842650,
//     balance: 4287340,
//   },
//   {
//     code: "1010",
//     name: "Main Operating Account",
//     debits: null,
//     credits: 1842650,
//     balance: 4287340,
//   },
// ];

// export default function AccountLedgerPage() {
//   const router = useRouter();
//   const [searchTerm, setSearchTerm] = useState("");
//   const [expandedRows, setExpandedRows] = useState<number[]>([]);
//   const [showFilters, setShowFilters] = useState(false);

//   const filtered = mockAccounts.filter(
//     (acc) =>
//       acc.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
//       acc.code.includes(searchTerm),
//   );

//   const toggleRow = (index: number) => {
//     setExpandedRows((prev) =>
//       prev.includes(index) ? prev.filter((i) => i !== index) : [...prev, index],
//     );
//   };

//   const formatCurrency = (value: number | null) => {
//     if (value === null || value === 0) return "-";
//     return `N${value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
//   };

//   return (
//     <div className="p-6 space-y-6">
//       {/* Header */}
//       <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
//         <h1 className="text-2xl font-semibold text-gray-900">Account Ledger</h1>

//         <div className="flex items-center gap-3 w-full sm:w-auto">
//           <div className="relative flex-1 sm:flex-none sm:w-72">
//             <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
//             <input
//               type="text"
//               placeholder="Search"
//               className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
//               value={searchTerm}
//               onChange={(e) => setSearchTerm(e.target.value)}
//             />
//           </div>

//           <button
//             onClick={() => setShowFilters(!showFilters)}
//             className={`flex items-center gap-2 border px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${
//               showFilters
//                 ? "border-blue-500 bg-blue-50 text-blue-600"
//                 : "border-gray-200 text-gray-700 hover:bg-gray-50"
//             }`}
//           >
//             <Filter className="w-4 h-4" />
//             Filter
//           </button>

//           <div className="flex border border-gray-200 rounded-lg overflow-hidden">
//             <button className="p-2.5 bg-white">
//               <List className="w-5 h-5 text-gray-600" />
//             </button>
//             <button className="p-2.5 bg-gray-50">
//               <Grid3X3 className="w-5 h-5 text-gray-600" />
//             </button>
//           </div>
//         </div>
//       </div>

//       {/* Optional Filter Panel */}
//       {showFilters && (
//         <div className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm flex flex-wrap gap-4 items-end">
//           <div>
//             <label className="block text-xs font-medium text-gray-500 mb-1">
//               Account Type
//             </label>
//             <select className="border border-gray-300 rounded-lg px-3 py-2 text-sm min-w-[160px]">
//               <option value="">All Types</option>
//               <option value="Assets">Assets</option>
//               <option value="Liabilities">Liabilities</option>
//               <option value="Equity">Equity</option>
//               <option value="Revenue">Revenue</option>
//               <option value="Expenses">Expenses</option>
//             </select>
//           </div>
//           <div>
//             <label className="block text-xs font-medium text-gray-500 mb-1">
//               From
//             </label>
//             <input
//               type="date"
//               className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
//             />
//           </div>
//           <div>
//             <label className="block text-xs font-medium text-gray-500 mb-1">
//               To
//             </label>
//             <input
//               type="date"
//               className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
//             />
//           </div>
//           <button className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700">
//             Apply
//           </button>
//         </div>
//       )}

//       {/* Table */}
//       <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
//         <table className="w-full">
//           <thead>
//             <tr className="border-b border-gray-100 bg-gray-50/70">
//               <th className="text-left py-3.5 px-6 text-sm font-medium text-gray-500 w-32">
//                 Code
//               </th>
//               <th className="text-left py-3.5 px-6 text-sm font-medium text-gray-500">
//                 Account Name
//               </th>
//               <th className="text-right py-3.5 px-6 text-sm font-medium text-gray-500">
//                 Debits
//               </th>
//               <th className="text-right py-3.5 px-6 text-sm font-medium text-gray-500">
//                 Credits
//               </th>
//               <th className="text-right py-3.5 px-6 text-sm font-medium text-gray-500">
//                 Current Balance
//               </th>
//             </tr>
//           </thead>
//           <tbody>
//             {filtered.map((account, index) => (
//               <tr
//                 key={index}
//                 className="border-b border-gray-100 hover:bg-gray-50/60 cursor-pointer transition-colors"
//                 onClick={() =>
//                   router.push(`/invoice/account-ledger/${account.code}`)
//                 }
//               >
//                 <td className="py-4 px-6">
//                   <div className="flex items-center gap-2">
//                     <button
//                       onClick={(e) => {
//                         e.stopPropagation();
//                         toggleRow(index);
//                       }}
//                       className="text-gray-500"
//                     >
//                       {expandedRows.includes(index) ? (
//                         <ChevronDown className="w-4 h-4" />
//                       ) : (
//                         <ChevronRight className="w-4 h-4" />
//                       )}
//                     </button>
//                     <span className="font-medium text-gray-900">
//                       {account.code}
//                     </span>
//                   </div>
//                 </td>
//                 <td className="py-4 px-6 text-gray-800">{account.name}</td>
//                 <td className="py-4 px-6 text-right font-medium text-red-600">
//                   {formatCurrency(account.debits)}
//                 </td>
//                 <td className="py-4 px-6 text-right font-medium text-green-600">
//                   {formatCurrency(account.credits)}
//                 </td>
//                 <td className="py-4 px-6 text-right font-semibold text-gray-900">
//                   {formatCurrency(account.balance)}
//                 </td>
//               </tr>
//             ))}
//           </tbody>
//         </table>
//       </div>
//     </div>
//   );
// }

"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Search,
  Grid3X3,
  List,
  ChevronDown,
  ChevronRight,
  Filter,
  Upload,
} from "lucide-react";
import jsPDF from "jspdf";

interface Transaction {
  date: string;
  description: string;
  wbs: string;
  debit: number | null;
  credit: number | null;
  runningBalance: number;
}

interface LedgerAccount {
  code: string;
  name: string;
  debits: number | null;
  credits: number | null;
  balance: number;
  transactions: Transaction[];
}

const mockAccounts: LedgerAccount[] = [
  {
    code: "1010",
    name: "Main Operating Account",
    debits: null,
    credits: 1842650,
    balance: 4287340,
    transactions: [
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
    ],
  },
  {
    code: "1020",
    name: "Petty Cash Account",
    debits: 28400,
    credits: 1842650,
    balance: 4287340,
    transactions: [
      {
        date: "Jun 05, 2026",
        description: "Office Supplies",
        wbs: "WBS-ADMIN-001",
        debit: 15000,
        credit: null,
        runningBalance: 4272340,
      },
      {
        date: "Jun 12, 2026",
        description: "Travel Expenses",
        wbs: "WBS-ADMIN-001",
        debit: 13400,
        credit: null,
        runningBalance: 4258940,
      },
    ],
  },
  {
    code: "1030",
    name: "Accounts Receivable",
    debits: null,
    credits: 1842650,
    balance: 4287340,
    transactions: [],
  },
  {
    code: "1040",
    name: "Inventory",
    debits: 28400,
    credits: 1842650,
    balance: 4287340,
    transactions: [],
  },
];

export default function AccountLedgerPage() {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");
  const [expandedRows, setExpandedRows] = useState<string[]>([]);
  const [showFilters, setShowFilters] = useState(false);

  const filtered = mockAccounts.filter(
    (acc) =>
      acc.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      acc.code.includes(searchTerm),
  );

  const toggleRow = (code: string) => {
    setExpandedRows((prev) =>
      prev.includes(code) ? prev.filter((c) => c !== code) : [...prev, code],
    );
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

    doc.setFontSize(16);
    doc.text("Account Ledger Summary", 14, 20);

    doc.setFontSize(10);
    doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 14, 28);

    let y = 40;

    filtered.forEach((account, idx) => {
      if (y > 270) {
        doc.addPage();
        y = 20;
      }

      doc.setFontSize(12);
      doc.setFont("helvetica", "bold");
      doc.text(`${account.code} – ${account.name}`, 14, y);
      y += 7;

      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");
      doc.text(`Debits: ${formatCurrency(account.debits)}`, 14, y);
      doc.text(`Credits: ${formatCurrency(account.credits)}`, 80, y);
      doc.text(`Balance: ${formatCurrency(account.balance)}`, 140, y);
      y += 10;

      // Transactions if expanded or always include a few
      if (account.transactions.length > 0) {
        doc.setFontSize(9);
        account.transactions.forEach((tx) => {
          if (y > 275) {
            doc.addPage();
            y = 20;
          }
          doc.text(
            `${tx.date} | ${tx.description} | Debit: ${formatCurrency(tx.debit)} | Credit: ${formatCurrency(tx.credit)} | Bal: ${formatCurrency(tx.runningBalance)}`,
            18,
            y,
          );
          y += 6;
        });
        y += 6;
      } else {
        y += 4;
      }

      // Separator line
      doc.setDrawColor(220);
      doc.line(14, y, 196, y);
      y += 8;
    });

    doc.save(
      `Account-Ledger-Summary-${new Date().toISOString().slice(0, 10)}.pdf`,
    );
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl font-semibold text-gray-900">Account Ledger</h1>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="relative flex-1 sm:flex-none sm:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search"
              className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-2 border px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${
              showFilters
                ? "border-blue-500 bg-blue-50 text-blue-600"
                : "border-gray-200 text-gray-700 hover:bg-gray-50"
            }`}
          >
            <Filter className="w-4 h-4" />
            Filter
          </button>

          <button
            onClick={handleExportPDF}
            className="flex items-center gap-2 border border-gray-200 text-gray-700 hover:bg-gray-50 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors"
          >
            <Upload className="w-4 h-4" />
            Export
          </button>

          <div className="flex border border-gray-200 rounded-lg overflow-hidden">
            <button className="p-2.5 bg-white">
              <List className="w-5 h-5 text-gray-600" />
            </button>
            <button className="p-2.5 bg-gray-50">
              <Grid3X3 className="w-5 h-5 text-gray-600" />
            </button>
          </div>
        </div>
      </div>

      {/* Filter Panel */}
      {showFilters && (
        <div className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm flex flex-wrap gap-4 items-end">
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">
              Account Type
            </label>
            <select className="border border-gray-300 rounded-lg px-3 py-2 text-sm min-w-[160px]">
              <option value="">All Types</option>
              <option value="Assets">Assets</option>
              <option value="Liabilities">Liabilities</option>
              <option value="Equity">Equity</option>
              <option value="Revenue">Revenue</option>
              <option value="Expenses">Expenses</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">
              From
            </label>
            <input
              type="date"
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">
              To
            </label>
            <input
              type="date"
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
            />
          </div>
          <button className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700">
            Apply
          </button>
        </div>
      )}

      {/* Table */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50/70">
              <th className="text-left py-3.5 px-6 text-sm font-medium text-gray-500 w-32">
                Code
              </th>
              <th className="text-left py-3.5 px-6 text-sm font-medium text-gray-500">
                Account Name
              </th>
              <th className="text-right py-3.5 px-6 text-sm font-medium text-gray-500">
                Debits
              </th>
              <th className="text-right py-3.5 px-6 text-sm font-medium text-gray-500">
                Credits
              </th>
              <th className="text-right py-3.5 px-6 text-sm font-medium text-gray-500">
                Current Balance
              </th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((account) => {
              const isExpanded = expandedRows.includes(account.code);

              return (
                <React.Fragment key={account.code}>
                  {/* Main Row */}
                  <tr
                    className="border-b border-gray-100 hover:bg-gray-50/60 cursor-pointer transition-colors"
                    onClick={() =>
                      router.push(`/invoice/account-ledger/${account.code}`)
                    }
                  >
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleRow(account.code);
                          }}
                          className="text-gray-500 hover:text-gray-700"
                        >
                          {isExpanded ? (
                            <ChevronDown className="w-4 h-4" />
                          ) : (
                            <ChevronRight className="w-4 h-4" />
                          )}
                        </button>
                        <span className="font-medium text-gray-900">
                          {account.code}
                        </span>
                      </div>
                    </td>
                    <td className="py-4 px-6 text-gray-800">{account.name}</td>
                    <td className="py-4 px-6 text-right font-medium text-red-600">
                      {formatCurrency(account.debits)}
                    </td>
                    <td className="py-4 px-6 text-right font-medium text-green-600">
                      {formatCurrency(account.credits)}
                    </td>
                    <td className="py-4 px-6 text-right font-semibold text-gray-900">
                      {formatCurrency(account.balance)}
                    </td>
                  </tr>

                  {/* Expandable Sub-list */}
                  {isExpanded && (
                    <tr className="bg-gray-50/40">
                      <td colSpan={5} className="px-6 py-0">
                        <div className="py-4 pl-8">
                          {account.transactions.length === 0 ? (
                            <p className="text-sm text-gray-500 italic">
                              No transactions found
                            </p>
                          ) : (
                            <table className="w-full text-sm">
                              <thead>
                                <tr className="text-gray-500">
                                  <th className="text-left py-2 font-medium">
                                    Date
                                  </th>
                                  <th className="text-left py-2 font-medium">
                                    Description
                                  </th>
                                  <th className="text-left py-2 font-medium">
                                    WBS
                                  </th>
                                  <th className="text-right py-2 font-medium">
                                    Debit
                                  </th>
                                  <th className="text-right py-2 font-medium">
                                    Credit
                                  </th>
                                  <th className="text-right py-2 font-medium">
                                    Running Balance
                                  </th>
                                </tr>
                              </thead>
                              <tbody>
                                {account.transactions.map((tx, idx) => (
                                  <tr
                                    key={idx}
                                    className="border-t border-gray-100"
                                  >
                                    <td className="py-2.5 text-gray-700">
                                      {tx.date}
                                    </td>
                                    <td className="py-2.5 text-gray-900">
                                      {tx.description}
                                    </td>
                                    <td className="py-2.5 text-gray-600">
                                      {tx.wbs}
                                    </td>
                                    <td className="py-2.5 text-right text-red-600 font-medium">
                                      {formatCurrency(tx.debit)}
                                    </td>
                                    <td className="py-2.5 text-right text-green-600 font-medium">
                                      {formatCurrency(tx.credit)}
                                    </td>
                                    <td className="py-2.5 text-right font-semibold text-gray-900">
                                      {formatCurrency(tx.runningBalance)}
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          )}
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
