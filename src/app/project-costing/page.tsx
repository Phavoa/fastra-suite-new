"use client";

import React, { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
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
import { Search, Filter } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useGetProjectCostingProjectsQuery } from "@/api/projectCostingApi";

const getStatusVariant = (status: string) => {
  switch (status?.toUpperCase()) {
    case "ACTIVE":
    case "APPROVED":
      return "validated";
    case "AWAITING APPROVAL":
    case "PENDING":
      return "pending";
    case "REJECTED":
      return "rejected";
    default:
      return "draft";
  }
};

export default function ProjectCostingListPage() {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [ordering, setOrdering] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [selectedType, setSelectedType] = useState("all");
  const [showFilters, setShowFilters] = useState(false);

  const { data: projects = [], isLoading } = useGetProjectCostingProjectsQuery({
    search,
    ordering,
  });

  const uniqueProjectTypes = useMemo(() => {
    const types = new Set<string>();
    projects.forEach((p) => {
      if (p.project_type) {
        types.add(p.project_type);
      }
    });
    return Array.from(types);
  }, [projects]);

  const filteredProjects = useMemo(() => {
    return projects.filter((project) => {
      const matchesStatus =
        selectedStatus === "all" ||
        project.status?.toUpperCase() === selectedStatus.toUpperCase();
      const matchesType =
        selectedType === "all" ||
        project.project_type?.toLowerCase() === selectedType.toLowerCase();
      return matchesStatus && matchesType;
    });
  }, [projects, selectedStatus, selectedType]);

  const handleRowClick = (id: number) => {
    router.push(`/project-costing/${id}`);
  };

  return (
    <div className="p-6 max-w-7xl mx-auto flex flex-col gap-6">
      {/* Top Bar Actions */}
      <div className="flex flex-col md:flex-row md:items-center justify-between bg-white p-4 rounded shadow-sm gap-4">
        <div className="flex flex-wrap items-center gap-4 flex-1">
          <h1 className="text-xl font-semibold text-gray-800">Project Costing</h1>
          <div className="relative w-[240px]">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-400" />
            <Input
              type="text"
              placeholder="Search"
              className="pl-9 bg-gray-50 border-gray-200 h-9"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          {/* Toggle Filter Button */}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setShowFilters(!showFilters)}
            className={`h-9 w-9 border border-gray-200 rounded ${showFilters ? "bg-blue-50 text-[#3B7CED] border-blue-200" : "text-gray-500 hover:text-gray-900"}`}
            title="Toggle Filters"
          >
            <Filter className="h-4 w-4" />
          </Button>

          {/* Filtering Menus */}
          {showFilters && (
            <div className="flex items-center gap-3">
              <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                <SelectTrigger className="w-[140px] h-9 border-gray-200 bg-white text-xs">
                  <SelectValue placeholder="All Statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="DRAFT">Draft</SelectItem>
                  <SelectItem value="PENDING">Pending</SelectItem>
                  <SelectItem value="ACTIVE">Active</SelectItem>
                  <SelectItem value="REJECTED">Rejected</SelectItem>
                </SelectContent>
              </Select>

              <Select value={selectedType} onValueChange={setSelectedType}>
                <SelectTrigger className="w-[160px] h-9 border-gray-200 bg-white text-xs">
                  <SelectValue placeholder="All Project Types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Project Types</SelectItem>
                  {uniqueProjectTypes.map((type) => (
                    <SelectItem key={type} value={type.toLowerCase()}>
                      {type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
        </div>

        <div className="flex items-center gap-3">
          <Link href="/project-costing/new">
            <Button className="bg-[#3B7CED] hover:bg-[#3065c3] text-white h-9 text-sm">
              New Project
            </Button>
          </Link>
        </div>
      </div>

      {/* Data Table */}
      <div className="bg-white rounded shadow-sm border border-gray-100">
        <Table>
          <TableHeader>
            <TableRow className="bg-[#F8F9FA] hover:bg-[#F8F9FA] border-b-gray-100">
              <TableHead className="font-medium text-gray-500">Project Code</TableHead>
              <TableHead className="font-medium text-gray-500">Project Name</TableHead>
              <TableHead className="font-medium text-gray-500">Client Name</TableHead>
              <TableHead className="font-medium text-gray-500">Project Type</TableHead>
              <TableHead className="font-medium text-gray-500">Start Date</TableHead>
              <TableHead className="font-medium text-gray-500">Total Budget</TableHead>
              <TableHead className="font-medium text-gray-500">Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8 text-gray-500">
                  Loading projects...
                </TableCell>
              </TableRow>
            ) : filteredProjects.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8 text-gray-500">
                  No projects found.
                </TableCell>
              </TableRow>
            ) : (
              filteredProjects.map((project, index) => (
                <TableRow
                  key={index}
                  className="cursor-pointer hover:bg-gray-50 border-b-gray-100"
                  onClick={() => handleRowClick(project.id)}
                >
                  <TableCell className="text-gray-600">{project.project_code || "N/A"}</TableCell>
                  <TableCell className="text-gray-600">{project.name}</TableCell>
                  <TableCell className="text-gray-600">{project.client_name || "N/A"}</TableCell>
                  <TableCell className="text-gray-600">{project.project_type || "N/A"}</TableCell>
                  <TableCell className="text-gray-600">{project.start_date || "N/A"}</TableCell>
                  <TableCell className="text-gray-600 font-semibold">
                    N{Number(project.total_budget || 0).toLocaleString("en-US", {
                      minimumFractionDigits: 2,
                    })}
                  </TableCell>
                  <TableCell>
                    <Badge variant={getStatusVariant(project.status) as any} className="px-3 py-1 font-normal">
                      {project.status || "DRAFT"}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
