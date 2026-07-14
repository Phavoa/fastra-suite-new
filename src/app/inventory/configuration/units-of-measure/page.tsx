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
import { useGetInventoryUnitOfMeasuresQuery } from "@/api/inventory/unitOfMeasureApi";

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

export default function UnitsOfMeasurePage() {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState("all");

  const {
    data: rawUnits,
    isLoading,
    error,
  } = useGetInventoryUnitOfMeasuresQuery({});

  const unitsList = useMemo(() => {
    if (!rawUnits) return [];
    if (Array.isArray(rawUnits)) return rawUnits;
    if ((rawUnits as any).results && Array.isArray((rawUnits as any).results)) {
      return (rawUnits as any).results;
    }
    return [];
  }, [rawUnits]);

  const getUnitId = (u: any, idx: number) => {
    if (u.id !== undefined && !isNaN(Number(u.id))) return u.id;
    if (u.url) {
      const parts = u.url.split("/").filter(Boolean);
      const last = parts[parts.length - 1];
      if (!isNaN(Number(last))) return last;
    }
    return idx + 1;
  };

  const handleRowClick = (id: string | number) => {
    router.push(`/inventory/configuration/units-of-measure/${id}`);
  };

  const filteredUnits = useMemo(() => {
    return unitsList.filter((u: any) => {
      if (!u) return false;
      const nameStr = String(u.unit_name || u.name || "").toLowerCase();
      const symbolStr = String(
        u.unit_symbol || u.abbreviation || ""
      ).toLowerCase();
      const catStr = String(u.unit_category || u.category || "").toLowerCase();
      const matchQuery =
        !search.trim() ||
        nameStr.includes(search.toLowerCase()) ||
        symbolStr.includes(search.toLowerCase()) ||
        catStr.includes(search.toLowerCase());

      const statusStr = u.is_hidden ? "HIDDEN" : "ACTIVE";
      const matchStatus =
        selectedStatus === "all" || statusStr === selectedStatus.toUpperCase();
      return matchQuery && matchStatus;
    });
  }, [unitsList, search, selectedStatus]);

  return (
    <PageGuard application="inventory" module="unitsofmeasure">
      <div className="p-6 max-w-7xl mx-auto flex flex-col gap-6 w-full">
        {/* Top Bar Controls */}
        <div className="flex flex-col md:flex-row md:items-center justify-between bg-white p-4 rounded shadow-sm gap-4 border border-gray-100">
          <div className="flex flex-wrap items-center gap-4 flex-1">
            <h1 className="text-xl font-semibold text-gray-800">
              Units of Measure
            </h1>

            <div className="relative w-full sm:w-[240px]">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-400" />
              <Input
                type="text"
                placeholder="Search unit or symbol..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 bg-gray-50 border-gray-200 h-9 text-sm"
              />
            </div>

            <Button
              variant="ghost"
              size="icon"
              onClick={() => setShowFilters(!showFilters)}
              className={`h-9 w-9 border border-gray-200 rounded ${
                showFilters
                  ? "bg-blue-50 text-[#3B7CED] border-blue-200"
                  : "text-gray-500 hover:text-gray-900"
              }`}
              title="Toggle Filters"
            >
              <Filter className="h-4 w-4" />
            </Button>

            {showFilters && (
              <div className="flex items-center gap-3">
                <Select
                  value={selectedStatus}
                  onValueChange={setSelectedStatus}
                >
                  <SelectTrigger className="w-[140px] h-9 border-gray-200 bg-white text-xs">
                    <SelectValue placeholder="All Statuses" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    <SelectItem value="ACTIVE">Active</SelectItem>
                    <SelectItem value="HIDDEN">Hidden</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>

          <div className="flex items-center gap-3">
            <Link href="/inventory/configuration/units-of-measure/new">
              <Button className="bg-[#3B7CED] hover:bg-[#3065c3] text-white h-9 text-sm flex items-center gap-1.5">
                <Plus className="h-4 w-4" /> New Unit
              </Button>
            </Link>
          </div>
        </div>

        {/* Table Content */}
        <div className="bg-white rounded shadow-sm border border-gray-100 overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-[#F8F9FA] hover:bg-[#F8F9FA] border-b-gray-100">
                <TableHead className="font-medium text-gray-500 pl-6">
                  Unit Name
                </TableHead>
                <TableHead className="font-medium text-gray-500">
                  Abbreviation / Symbol
                </TableHead>
                <TableHead className="font-medium text-gray-500">
                  Category
                </TableHead>
                <TableHead className="font-medium text-gray-500 text-center pr-6">
                  Status
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading && (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-12">
                    <div className="flex items-center justify-center gap-2 text-gray-500">
                      <Loader2 className="h-5 w-5 animate-spin text-[#3B7CED]" />
                      <span>Loading units of measure...</span>
                    </div>
                  </TableCell>
                </TableRow>
              )}

              {!isLoading &&
                filteredUnits.map((u: any, idx: number) => {
                  const uId = getUnitId(u, idx);
                  const statusStr = u.is_hidden ? "HIDDEN" : "ACTIVE";
                  return (
                    <TableRow
                      key={uId}
                      className="cursor-pointer hover:bg-gray-50 border-b-gray-100 transition-colors"
                      onClick={() => handleRowClick(uId)}
                    >
                      <TableCell className="text-gray-900 font-medium pl-6">
                        {u.unit_name || u.name}
                      </TableCell>
                      <TableCell className="text-gray-600 font-mono">
                        {u.unit_symbol || u.abbreviation || "-"}
                      </TableCell>
                      <TableCell className="text-gray-600">
                        {u.unit_category || u.category || "General"}
                      </TableCell>
                      <TableCell className="text-center pr-6">
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

              {!isLoading && filteredUnits.length === 0 && (
                <TableRow>
                  <TableCell
                    colSpan={4}
                    className="text-center py-8 text-gray-500"
                  >
                    No units found matching your criteria.
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
