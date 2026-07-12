"use client";

import React, { useState } from "react";
import { Search, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { PageGuard } from "@/components/auth/PageGuard";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const mockProducts = [
  { id: "1", code: "PRD-001", name: "Portland Cement", category: "Cement Products", uom: "Bags", reorder: 50, status: "ACTIVE" },
  { id: "2", code: "PRD-002", name: "12mm Rebar Steel", category: "Steel and Iron", uom: "Tonnes", reorder: 10, status: "ACTIVE" },
  { id: "3", code: "PRD-003", name: "White Emulsion Paint", category: "Finishing Materials", uom: "Liters", reorder: 20, status: "INACTIVE" },
];

const getStatusVariant = (status: string) => {
  switch (status?.toUpperCase()) {
    case "ACTIVE":
      return "validated";
    case "INACTIVE":
      return "rejected";
    default:
      return "draft";
  }
};

export default function ProductsPage() {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");

  const handleRowClick = (id: string) => {
    router.push(`/inventory/configuration/products/${id}`);
  };

  const filteredProducts = mockProducts.filter((p) => {
    const matchQuery = p.name.toLowerCase().includes(search.toLowerCase()) || p.code.toLowerCase().includes(search.toLowerCase());
    const matchCategory = selectedCategory === "all" || p.category === selectedCategory;
    const matchStatus = selectedStatus === "all" || p.status.toUpperCase() === selectedStatus.toUpperCase();
    return matchQuery && matchCategory && matchStatus;
  });

  return (
    <PageGuard application="inventory" module="products">
      <div className="p-4 sm:p-6 max-w-7xl mx-auto flex flex-col gap-6 w-full">
        {/* Responsive Top Bar Actions */}
        <div className="flex flex-col md:flex-row md:items-center justify-between bg-white p-4 rounded border border-gray-200 shadow-sm gap-4">
          
          <div className="flex flex-col sm:flex-row sm:items-center gap-3 flex-1 w-full">
            <h1 className="text-xl font-semibold text-gray-800 shrink-0">Products</h1>
            
            <div className="flex items-center gap-2 flex-1 w-full max-w-md">
              <div className="relative flex-1">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-400" />
                <Input
                  type="text"
                  placeholder="Search products or codes..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-9 bg-gray-50 border-gray-200 h-9 text-sm w-full"
                />
              </div>

              <Button
                variant="ghost"
                size="icon"
                onClick={() => setShowFilters(!showFilters)}
                className={`h-9 w-9 shrink-0 border border-gray-200 rounded ${showFilters ? "bg-blue-50 text-[#3B7CED] border-blue-200" : "text-gray-500 hover:text-gray-900"}`}
                title="Toggle Filters"
              >
                <Filter className="h-4 w-4" />
              </Button>
            </div>
          </div>
          
          <div className="flex items-center justify-end pt-2 md:pt-0 border-t md:border-t-0 border-gray-100">
            <Link href="/inventory/configuration/products/new" className="w-full sm:w-auto">
              <Button className="bg-[#3B7CED] hover:bg-[#3065c3] text-white h-9 text-sm w-full sm:w-auto">
                New Product
              </Button>
            </Link>
          </div>
        </div>

        {/* Filter Drawer / Bar */}
        {showFilters && (
          <div className="flex flex-wrap items-center gap-3 bg-white p-4 rounded border border-gray-200 shadow-sm animate-in fade-in-50 duration-200">
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-full sm:w-[180px] h-9 border-gray-200 bg-white text-xs">
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value="Cement Products">Cement Products</SelectItem>
                <SelectItem value="Steel and Iron">Steel and Iron</SelectItem>
                <SelectItem value="Finishing Materials">Finishing Materials</SelectItem>
              </SelectContent>
            </Select>

            <Select value={selectedStatus} onValueChange={setSelectedStatus}>
              <SelectTrigger className="w-full sm:w-[150px] h-9 border-gray-200 bg-white text-xs">
                <SelectValue placeholder="All Statuses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="ACTIVE">Active</SelectItem>
                <SelectItem value="INACTIVE">Inactive</SelectItem>
              </SelectContent>
            </Select>
          </div>
        )}

        {/* Responsive Table Content */}
        <div className="bg-white rounded border border-gray-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto w-full">
            <Table className="min-w-[700px] w-full">
              <TableHeader>
                <TableRow className="bg-[#F8F9FA] hover:bg-[#F8F9FA] border-b-gray-100">
                  <TableHead className="font-medium text-gray-500 whitespace-nowrap pl-4">Product Code</TableHead>
                  <TableHead className="font-medium text-gray-500 whitespace-nowrap">Product Name</TableHead>
                  <TableHead className="font-medium text-gray-500 whitespace-nowrap">Category</TableHead>
                  <TableHead className="font-medium text-gray-500 whitespace-nowrap">Unit</TableHead>
                  <TableHead className="font-medium text-gray-500 text-right whitespace-nowrap">Reorder Pt.</TableHead>
                  <TableHead className="font-medium text-gray-500 text-center whitespace-nowrap pr-4">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredProducts.map((prd) => (
                  <TableRow 
                    key={prd.id} 
                    className="cursor-pointer hover:bg-gray-50 border-b-gray-100 transition-colors"
                    onClick={() => handleRowClick(prd.id)}
                  >
                    <TableCell className="text-gray-600 font-mono text-xs font-semibold pl-4">{prd.code}</TableCell>
                    <TableCell className="text-gray-900 font-medium">{prd.name}</TableCell>
                    <TableCell className="text-gray-600">{prd.category}</TableCell>
                    <TableCell className="text-gray-600">{prd.uom}</TableCell>
                    <TableCell className="text-gray-600 text-right font-mono">{prd.reorder}</TableCell>
                    <TableCell className="text-center pr-4">
                      <Badge variant={getStatusVariant(prd.status) as any} className="px-3 py-1 font-normal">
                        {prd.status || "DRAFT"}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
                {filteredProducts.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                      No products found matching your search.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      </div>
    </PageGuard>
  );
}
