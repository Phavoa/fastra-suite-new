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

const mockCategories = [
  { id: "1", name: "Cement Products", description: "All types of cement and related binding materials.", status: "ACTIVE" },
  { id: "2", name: "Steel and Iron", description: "Rebars, meshes, structural steel.", status: "ACTIVE" },
  { id: "3", name: "Finishing Materials", description: "Paints, tiles, screeding.", status: "INACTIVE" },
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

export default function ProductCategoriesPage() {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState("all");

  const handleRowClick = (id: string) => {
    router.push(`/inventory/configuration/categories/${id}`);
  };

  const filteredCategories = mockCategories.filter((c) => {
    const matchQuery = c.name.toLowerCase().includes(search.toLowerCase()) || c.description.toLowerCase().includes(search.toLowerCase());
    const matchStatus = selectedStatus === "all" || c.status.toUpperCase() === selectedStatus.toUpperCase();
    return matchQuery && matchStatus;
  });

  return (
    <PageGuard application="inventory" module="productcategories">
      <div className="p-6 max-w-7xl mx-auto flex flex-col gap-6 w-full">
        {/* Top Bar Actions */}
        <div className="flex flex-col md:flex-row md:items-center justify-between bg-white p-4 rounded shadow-sm gap-4">
          <div className="flex flex-wrap items-center gap-4 flex-1">
            <h1 className="text-xl font-semibold text-gray-800">Product Categories</h1>
            
            <div className="relative w-full sm:w-[240px]">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-400" />
              <Input
                type="text"
                placeholder="Search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 bg-gray-50 border-gray-200 h-9 text-sm"
              />
            </div>

            <Button
              variant="ghost"
              size="icon"
              onClick={() => setShowFilters(!showFilters)}
              className={`h-9 w-9 border border-gray-200 rounded ${showFilters ? "bg-blue-50 text-[#3B7CED] border-blue-200" : "text-gray-500 hover:text-gray-900"}`}
              title="Toggle Filters"
            >
              <Filter className="h-4 w-4" />
            </Button>

            {showFilters && (
              <div className="flex items-center gap-3">
                <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                  <SelectTrigger className="w-[140px] h-9 border-gray-200 bg-white text-xs">
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
          </div>
          
          <div className="flex items-center gap-3">
            <Link href="/inventory/configuration/categories/new">
              <Button className="bg-[#3B7CED] hover:bg-[#3065c3] text-white h-9 text-sm">
                New Category
              </Button>
            </Link>
          </div>
        </div>

        {/* Table Content */}
        <div className="bg-white rounded shadow-sm border border-gray-100 overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-[#F8F9FA] hover:bg-[#F8F9FA] border-b-gray-100">
                <TableHead className="font-medium text-gray-500">Category Name</TableHead>
                <TableHead className="font-medium text-gray-500">Description</TableHead>
                <TableHead className="font-medium text-gray-500 text-center">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredCategories.map((cat) => (
                <TableRow 
                  key={cat.id} 
                  className="cursor-pointer hover:bg-gray-50 border-b-gray-100 transition-colors"
                  onClick={() => handleRowClick(cat.id)}
                >
                  <TableCell className="text-gray-900 font-medium">{cat.name}</TableCell>
                  <TableCell className="text-gray-600">{cat.description}</TableCell>
                  <TableCell className="text-center">
                    <Badge variant={getStatusVariant(cat.status) as any} className="px-3 py-1 font-normal">
                      {cat.status || "DRAFT"}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
              {filteredCategories.length === 0 && (
                <TableRow>
                  <TableCell colSpan={3} className="text-center py-8 text-gray-500">
                    No categories found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </PageGuard>
  );
}
