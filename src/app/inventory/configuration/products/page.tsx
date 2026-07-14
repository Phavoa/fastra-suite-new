"use client";

import React, { useState, useMemo } from "react";
import { Search, Filter, Loader2, Plus } from "lucide-react";
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
import { useGetInventoryProductsQuery } from "@/api/inventory/productsApi";

const getStatusVariant = (status: string) => {
  switch (status?.toUpperCase()) {
    case "ACTIVE":
      return "validated";
    case "HIDDEN":
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

  const { data: rawProducts, isLoading, error } = useGetInventoryProductsQuery({});

  const productsList = useMemo(() => {
    if (!rawProducts) return [];
    if (Array.isArray(rawProducts)) return rawProducts;
    if ((rawProducts as any).results && Array.isArray((rawProducts as any).results)) {
      return (rawProducts as any).results;
    }
    return [];
  }, [rawProducts]);

  const categories = useMemo(() => {
    const cats = new Set<string>(["consumable", "stockable", "service-product"]);
    productsList.forEach((p: any) => {
      const cat = p.product_category || p.category;
      if (cat) cats.add(String(cat));
    });
    return Array.from(cats);
  }, [productsList]);

  const formatCategoryName = (cat?: string) => {
    if (!cat) return "-";
    if (cat === "consumable") return "Consumable";
    if (cat === "stockable") return "Stockable";
    if (cat === "service-product") return "Service Product";
    return cat;
  };

  const handleRowClick = (id: string | number) => {
    router.push(`/inventory/configuration/products/${id}`);
  };

  const filteredProducts = useMemo(() => {
    return productsList.filter((p: any) => {
      if (!p) return false;
      const nameStr = String(p.product_name || p.name || "").toLowerCase();
      const codeStr = String(p.product_code || p.code || `PRD-${p.id}`).toLowerCase();
      const matchQuery =
        !search.trim() ||
        nameStr.includes(search.toLowerCase()) ||
        codeStr.includes(search.toLowerCase());
      const matchCategory =
        selectedCategory === "all" ||
        String(p.product_category || p.category || "") === selectedCategory;
      const statusStr = p.is_hidden
        ? "HIDDEN"
        : p.is_active !== false
        ? "ACTIVE"
        : "INACTIVE";
      const matchStatus =
        selectedStatus === "all" || statusStr === selectedStatus.toUpperCase();
      return matchQuery && matchCategory && matchStatus;
    });
  }, [productsList, search, selectedCategory, selectedStatus]);

  return (
    <PageGuard application="inventory" module="products">
      <div className="p-4 sm:p-6 max-w-7xl mx-auto flex flex-col gap-6 w-full">
        {/* Responsive Top Bar Actions */}
        <div className="flex flex-col md:flex-row md:items-center justify-between bg-white p-4 rounded border border-gray-200 shadow-sm gap-4">
          <div className="flex flex-col sm:flex-row sm:items-center gap-3 flex-1 w-full">
            <h1 className="text-xl font-semibold text-gray-800 shrink-0">
              Products
            </h1>

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
                className={`h-9 w-9 shrink-0 border border-gray-200 rounded ${
                  showFilters
                    ? "bg-blue-50 text-[#3B7CED] border-blue-200"
                    : "text-gray-500 hover:text-gray-900"
                }`}
                title="Toggle Filters"
              >
                <Filter className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div className="flex items-center justify-end pt-2 md:pt-0 border-t md:border-t-0 border-gray-100">
            <Link
              href="/inventory/configuration/products/new"
              className="w-full sm:w-auto"
            >
              <Button className="bg-[#3B7CED] hover:bg-[#3065c3] text-white h-9 text-sm w-full sm:w-auto flex items-center gap-1.5">
                <Plus className="h-4 w-4" /> New Product
              </Button>
            </Link>
          </div>
        </div>

        {/* Filter Drawer / Bar */}
        {showFilters && (
          <div className="flex flex-wrap items-center gap-3 bg-white p-4 rounded border border-gray-200 shadow-sm animate-in fade-in-50 duration-200">
            <Select
              value={selectedCategory}
              onValueChange={setSelectedCategory}
            >
              <SelectTrigger className="w-full sm:w-[180px] h-9 border-gray-200 bg-white text-xs">
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map((cat) => (
                  <SelectItem key={cat} value={cat}>
                    {formatCategoryName(cat)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={selectedStatus} onValueChange={setSelectedStatus}>
              <SelectTrigger className="w-full sm:w-[150px] h-9 border-gray-200 bg-white text-xs">
                <SelectValue placeholder="All Statuses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="ACTIVE">Active</SelectItem>
                <SelectItem value="HIDDEN">Hidden</SelectItem>
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
                  <TableHead className="font-medium text-gray-500 whitespace-nowrap pl-4">
                    Product Code
                  </TableHead>
                  <TableHead className="font-medium text-gray-500 whitespace-nowrap">
                    Product Name
                  </TableHead>
                  <TableHead className="font-medium text-gray-500 whitespace-nowrap">
                    Category
                  </TableHead>
                  <TableHead className="font-medium text-gray-500 whitespace-nowrap">
                    Unit
                  </TableHead>
                  <TableHead className="font-medium text-gray-500 text-right whitespace-nowrap">
                    Standard Cost
                  </TableHead>
                  <TableHead className="font-medium text-gray-500 text-center whitespace-nowrap pr-4">
                    Status
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading && (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-12">
                      <div className="flex items-center justify-center gap-2 text-gray-500">
                        <Loader2 className="h-5 w-5 animate-spin text-[#3B7CED]" />
                        <span>Loading products...</span>
                      </div>
                    </TableCell>
                  </TableRow>
                )}

                {!isLoading &&
                  filteredProducts.map((prd: any) => {
                    const statusStr = prd.is_hidden
                      ? "HIDDEN"
                      : prd.is_active !== false
                      ? "ACTIVE"
                      : "INACTIVE";
                    const uomStr =
                      prd.unit_of_measure_details?.unit_name ||
                      prd.unit_of_measure_details?.unit_symbol ||
                      prd.uom ||
                      String(prd.unit_of_measure || "-");

                    return (
                      <TableRow
                        key={prd.id}
                        className="cursor-pointer hover:bg-gray-50 border-b-gray-100 transition-colors"
                        onClick={() => handleRowClick(prd.id)}
                      >
                        <TableCell className="text-gray-600 font-mono text-xs font-semibold pl-4">
                          {prd.product_code || prd.code || `PRD-${prd.id}`}
                        </TableCell>
                        <TableCell className="text-gray-900 font-medium">
                          {prd.product_name || prd.name}
                        </TableCell>
                        <TableCell className="text-gray-600">
                          {formatCategoryName(prd.product_category || prd.category)}
                        </TableCell>
                        <TableCell className="text-gray-600">
                          {uomStr}
                        </TableCell>
                        <TableCell className="text-gray-600 text-right font-mono">
                          {prd.standard_cost ?? "0.00"}
                        </TableCell>
                        <TableCell className="text-center pr-4">
                          <Badge
                            variant={getStatusVariant(statusStr) as any}
                            className="px-3 py-1 font-normal"
                          >
                            {statusStr}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    );
                  })}

                {!isLoading && filteredProducts.length === 0 && (
                  <TableRow>
                    <TableCell
                      colSpan={6}
                      className="text-center py-8 text-gray-500"
                    >
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
