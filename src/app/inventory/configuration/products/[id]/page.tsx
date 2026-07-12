"use client";

import React, { useState } from "react";
import { ArrowLeft, History, Package, ArrowUpRight, ArrowDownRight, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { PageGuard } from "@/components/auth/PageGuard";
import Link from "next/link";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const dummyStockMoves = [
  { id: "MV-1001", date: "2026-06-25 08:30", type: "Incoming Receipt", reference: "WH-IN-0042 (Dangote Cement)", qty: "+500", balance: "1,200 Bags", status: "VALIDATED", isPositive: true },
  { id: "MV-1002", date: "2026-06-24 14:15", type: "Project Consumption", reference: "MC-0089 (Lekki Tower WBS 1.2)", qty: "-150", balance: "700 Bags", status: "VALIDATED", isPositive: false },
  { id: "MV-1003", date: "2026-06-23 11:00", type: "Project Consumption", reference: "MC-0081 (Victoria Island Mall)", qty: "-50", balance: "850 Bags", status: "VALIDATED", isPositive: false },
  { id: "MV-1004", date: "2026-06-20 09:45", type: "Scrap Recording", reference: "SCR-0012 (Water Damage in Yard)", qty: "-10", balance: "900 Bags", status: "VALIDATED", isPositive: false },
  { id: "MV-1005", date: "2026-06-18 16:20", type: "Initial Balance", reference: "INV-SETUP-001", qty: "+910", balance: "910 Bags", status: "VALIDATED", isPositive: true },
];

export default function ProductDetailsPage() {
  const [activeTab, setActiveTab] = useState<"attributes" | "history">("attributes");

  return (
    <PageGuard application="inventory" module="products">
      <div className="flex flex-col h-full bg-gray-50 relative pb-24 min-h-[calc(100vh-64px)]">
        {/* Top Navigation Row */}
        <div className="flex items-center px-6 py-4 border-b border-gray-200 bg-white shadow-xs">
          <Link href="/inventory/configuration/products" className="flex items-center text-sm text-gray-500 hover:text-gray-900 font-medium transition-colors">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Portland Cement
          </Link>
        </div>

        <div className="px-4 sm:px-6 max-w-[1400px] mx-auto w-full flex flex-col gap-6 overflow-y-auto mt-6">
          
          {/* Responsive Header Banner */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between bg-white p-6 rounded border border-gray-200 shadow-sm gap-6">
            <div className="flex flex-col gap-2.5">
              <div className="flex flex-wrap items-center gap-3">
                <h2 className="text-xl sm:text-2xl font-bold text-gray-900 tracking-tight">Portland Cement</h2>
                <Badge variant="validated" className="px-2.5 py-0.5 font-medium text-xs">Active</Badge>
              </div>
              
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs sm:text-sm text-gray-500">
                <span>Product Code: <strong className="text-gray-800 font-mono font-semibold">PRD-001</strong></span>
                <span className="hidden sm:inline text-gray-300">•</span>
                <span>Category: <strong className="text-gray-800 font-medium">Cement Products</strong></span>
                <span className="hidden sm:inline text-gray-300">•</span>
                <span>Unit: <strong className="text-gray-800 font-medium">Bags</strong></span>
              </div>
            </div>
            
            <div className="flex items-center sm:self-start pt-4 sm:pt-0 border-t sm:border-t-0 border-gray-100">
              <Button variant="outline" className="w-full sm:w-auto border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300 text-xs sm:text-sm h-9 px-4 font-medium">
                Deactivate Product
              </Button>
            </div>
          </div>

          {/* Module Switcher Tabs */}
          <div className="flex border-b border-gray-200 gap-8 px-2 bg-white rounded-t border border-b-0 pt-2 shadow-xs">
            <button
              onClick={() => setActiveTab("attributes")}
              className={`pb-3 text-sm font-medium border-b-2 transition-all cursor-pointer flex items-center gap-2 ${
                activeTab === "attributes"
                  ? "border-[#3B7CED] text-[#3B7CED]"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
            >
              <Package className="w-4 h-4" /> Basic Attributes
            </button>
            <button
              onClick={() => setActiveTab("history")}
              className={`pb-3 text-sm font-medium border-b-2 transition-all cursor-pointer flex items-center gap-2 ${
                activeTab === "history"
                  ? "border-[#3B7CED] text-[#3B7CED]"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
            >
              <History className="w-4 h-4" /> Stock Movement Ledger
            </button>
          </div>

          {/* Tab 1: Form Content */}
          {activeTab === "attributes" && (
            <div className="bg-white p-6 rounded shadow-sm border border-gray-200 mb-12 animate-in fade-in-50 duration-150">
              <h3 className="text-lg font-medium text-[#3B7CED] mb-6">Product Master Record</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                
                <div className="flex flex-col gap-2">
                  <Label className="text-gray-700 font-medium">Product Name <span className="text-red-500">*</span></Label>
                  <Input defaultValue="Portland Cement" className="bg-white border-gray-300 rounded" />
                </div>

                <div className="flex flex-col gap-2">
                  <Label className="text-gray-700 font-medium">Product Code</Label>
                  <Input defaultValue="PRD-001" disabled className="bg-gray-100 border-gray-300 rounded text-gray-500 font-mono" />
                </div>

                <div className="flex flex-col gap-2">
                  <Label className="text-gray-700 font-medium">Unit of Measure <span className="text-red-500">*</span></Label>
                  <Select defaultValue="bags">
                    <SelectTrigger className="bg-white border-gray-300 rounded">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="bags">Bags (50kg standard)</SelectItem>
                      <SelectItem value="tonnes">Tonnes</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex flex-col gap-2">
                  <Label className="text-gray-700 font-medium">Product Category</Label>
                  <Select defaultValue="cement">
                    <SelectTrigger className="bg-white border-gray-300 rounded">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="cement">Cement Products</SelectItem>
                      <SelectItem value="steel">Steel and Iron</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex flex-col gap-2">
                  <Label className="text-gray-700 font-medium">Default Reorder Unit</Label>
                  <Input defaultValue="50 Bags" disabled className="bg-gray-100 border-gray-300 rounded text-gray-600 font-mono" />
                </div>

                <div className="flex flex-col gap-2">
                  <Label className="text-gray-700 font-medium">Status</Label>
                  <Select defaultValue="active">
                    <SelectTrigger className="bg-white border-gray-300 rounded">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="inactive">Inactive</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex flex-col gap-2 md:col-span-3">
                  <Label className="text-gray-700 font-medium">Description</Label>
                  <Textarea defaultValue="High quality grade 42.5R Portland cement suitable for all structural reinforced concrete works." className="bg-white border-gray-300 rounded min-h-[80px]" />
                </div>
              </div>

              {/* PRD 10.5 Per-Site Low Stock Thresholds */}
              <div className="mt-8 pt-8 border-t border-gray-200">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
                  <div>
                    <h4 className="text-base font-semibold text-[#3B7CED]">Multi-Site Low Stock Thresholds (PRD 10.5)</h4>
                    <p className="text-xs text-gray-500 mt-0.5">
                      Configure reorder points per physical site. Alerts trigger automatically when stock falls below the threshold with direct Purchase Request links.
                    </p>
                  </div>
                </div>

                <div className="border border-gray-200 rounded overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-[#F8F9FA] hover:bg-[#F8F9FA]">
                        <TableHead className="font-semibold text-gray-600 text-xs pl-4">Site Location</TableHead>
                        <TableHead className="font-semibold text-gray-600 text-xs text-center">Current Stock</TableHead>
                        <TableHead className="font-semibold text-gray-600 text-xs text-center">Low Stock Threshold</TableHead>
                        <TableHead className="font-semibold text-gray-600 text-xs">Alert Recipients</TableHead>
                        <TableHead className="font-semibold text-gray-600 text-xs text-center">Alert Status</TableHead>
                        <TableHead className="font-semibold text-gray-600 text-xs text-right pr-4">Action</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      <TableRow className="border-b border-gray-100">
                        <TableCell className="font-medium text-gray-800 text-xs pl-4">Main Warehouse - Site A</TableCell>
                        <TableCell className="text-center font-mono font-semibold text-xs text-green-600">850 Bags</TableCell>
                        <TableCell className="text-center">
                          <Input type="number" defaultValue="200" className="w-24 h-8 text-center mx-auto text-xs font-mono" />
                        </TableCell>
                        <TableCell className="text-xs text-gray-600">Site Mgr & Project Director</TableCell>
                        <TableCell className="text-center">
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold bg-green-50 text-green-700 border border-green-200">
                            Normal
                          </span>
                        </TableCell>
                        <TableCell className="text-right pr-4">
                          <Button variant="ghost" size="sm" className="h-7 text-xs text-gray-400">Up to date</Button>
                        </TableCell>
                      </TableRow>
                      <TableRow className="border-b border-gray-100 bg-red-50/30">
                        <TableCell className="font-medium text-gray-800 text-xs pl-4">Secondary Store - Site B</TableCell>
                        <TableCell className="text-center font-mono font-bold text-xs text-red-600">18 Bags</TableCell>
                        <TableCell className="text-center">
                          <Input type="number" defaultValue="50" className="w-24 h-8 text-center mx-auto text-xs font-mono border-red-300 bg-white" />
                        </TableCell>
                        <TableCell className="text-xs text-gray-600">Site Mgr & Procurement</TableCell>
                        <TableCell className="text-center">
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold bg-red-100 text-red-800 border border-red-300 animate-pulse">
                            Low Stock Alert
                          </span>
                        </TableCell>
                        <TableCell className="text-right pr-4">
                          <Button 
                            size="sm" 
                            className="h-7 text-xs bg-red-600 hover:bg-red-700 text-white shadow-xs"
                            onClick={() => alert("Redirecting to create Purchase Request for Site B...")}
                          >
                            + Create Purchase Request
                          </Button>
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell className="font-medium text-gray-800 text-xs pl-4">Port Storage Facility - Site C</TableCell>
                        <TableCell className="text-center font-mono font-semibold text-xs text-gray-700">332 Bags</TableCell>
                        <TableCell className="text-center">
                          <Input type="number" defaultValue="100" className="w-24 h-8 text-center mx-auto text-xs font-mono" />
                        </TableCell>
                        <TableCell className="text-xs text-gray-600">Warehouse Admin</TableCell>
                        <TableCell className="text-center">
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold bg-green-50 text-green-700 border border-green-200">
                            Normal
                          </span>
                        </TableCell>
                        <TableCell className="text-right pr-4">
                          <Button variant="ghost" size="sm" className="h-7 text-xs text-gray-400">Up to date</Button>
                        </TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </div>
              </div>
            </div>
          )}

          {/* Tab 2: Stock Movement Ledger Dummy Data */}
          {activeTab === "history" && (
            <div className="bg-white rounded shadow-sm border border-gray-200 mb-12 overflow-hidden animate-in fade-in-50 duration-150">
              <div className="p-4 sm:p-6 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#FAFAFA]">
                <div>
                  <h3 className="text-base font-semibold text-gray-800">Chronological Stock Ledger</h3>
                  <p className="text-xs text-gray-500 mt-0.5">Real-time audit trail of all physical receipts, project consumptions, and scrap removals.</p>
                </div>
                <div className="flex items-center gap-2 font-mono text-xs bg-blue-50 text-[#3B7CED] border border-blue-200 px-3 py-1.5 rounded font-semibold self-start sm:self-auto">
                  Current Stock on Hand: 1,200 Bags
                </div>
              </div>

              <div className="overflow-x-auto w-full">
                <Table className="min-w-[750px] w-full">
                  <TableHeader>
                    <TableRow className="bg-[#F8F9FA] hover:bg-[#F8F9FA] border-b-gray-100">
                      <TableHead className="font-medium text-gray-500 whitespace-nowrap pl-6">Timestamp</TableHead>
                      <TableHead className="font-medium text-gray-500 whitespace-nowrap">Movement Type</TableHead>
                      <TableHead className="font-medium text-gray-500 whitespace-nowrap">Document / WBS Ref</TableHead>
                      <TableHead className="font-medium text-gray-500 text-right whitespace-nowrap">Quantity</TableHead>
                      <TableHead className="font-medium text-gray-500 text-right whitespace-nowrap">Running Balance</TableHead>
                      <TableHead className="font-medium text-gray-500 text-center whitespace-nowrap pr-6">Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {dummyStockMoves.map((mv) => (
                      <TableRow key={mv.id} className="hover:bg-gray-50 border-b-gray-100">
                        <TableCell className="text-gray-600 font-mono text-xs pl-6 whitespace-nowrap">{mv.date}</TableCell>
                        <TableCell className="font-medium text-gray-900 whitespace-nowrap">
                          <span className="flex items-center gap-1.5">
                            {mv.isPositive ? (
                              <ArrowDownRight className="w-4 h-4 text-emerald-600 shrink-0" />
                            ) : (
                              <ArrowUpRight className="w-4 h-4 text-orange-500 shrink-0" />
                            )}
                            {mv.type}
                          </span>
                        </TableCell>
                        <TableCell className="text-gray-600 text-xs">{mv.reference}</TableCell>
                        <TableCell className={`text-right font-mono font-bold whitespace-nowrap ${mv.isPositive ? 'text-emerald-600' : 'text-gray-800'}`}>
                          {mv.qty}
                        </TableCell>
                        <TableCell className="text-right font-mono text-gray-600 font-medium whitespace-nowrap">
                          {mv.balance}
                        </TableCell>
                        <TableCell className="text-center pr-6">
                          <Badge variant="validated" className="px-2.5 py-0.5 text-[10px] font-normal">
                            {mv.status}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          )}

        </div>

        {/* Footer sticky bar */}
        <div className="absolute bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 flex justify-end gap-4 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] z-20">
          <Link href="/inventory/configuration/products">
            <Button variant="outline" className="border-blue-400 text-blue-500 hover:bg-blue-50">
              Cancel
            </Button>
          </Link>
          <Button className="bg-[#3B7CED] hover:bg-[#3065c3] text-white">
            Save Changes
          </Button>
        </div>
      </div>
    </PageGuard>
  );
}
