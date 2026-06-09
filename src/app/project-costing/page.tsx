"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Search, LayoutGrid, List } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

const dummyProjects = [
  {
    id: "1",
    code: "PC-10293",
    name: "Building Project",
    manager: "John Doe",
    type: "Fixed Price",
    startDate: "4 Apr 2024",
    status: "Active",
    statusVariant: "validated",
  },
  {
    id: "2",
    code: "PC-10293",
    name: "Building Project",
    manager: "John Doe",
    type: "Time & Material",
    startDate: "4 Apr 2024",
    status: "Awaiting Approval",
    statusVariant: "pending",
  },
  {
    id: "3",
    code: "PC-10293",
    name: "Building Project",
    manager: "John Doe",
    type: "Cost Plus",
    startDate: "4 Apr 2024",
    status: "Rejected",
    statusVariant: "rejected",
  },
  {
    id: "4",
    code: "PC-10293",
    name: "Building Project",
    manager: "John Doe",
    type: "Milestone-based",
    startDate: "4 Apr 2024",
    status: "Draft",
    statusVariant: "draft",
  },
  {
    id: "5",
    code: "PC-10293",
    name: "Building Project",
    manager: "John Doe",
    type: "Fixed Price",
    startDate: "4 Apr 2024",
    status: "Awaiting Approval",
    statusVariant: "pending",
  },
];

export default function ProjectCostingListPage() {
  const router = useRouter();

  const handleRowClick = (id: string) => {
    router.push(`/project-costing/${id}`);
  };

  return (
    <div className="p-6 max-w-7xl mx-auto flex flex-col gap-6">
      {/* Top Bar Actions */}
      <div className="flex items-center justify-between bg-white p-4 rounded shadow-sm">
        <div className="flex items-center gap-4 flex-1">
          <h1 className="text-xl font-semibold text-gray-800">Project Costing</h1>
          <div className="relative w-[300px] ml-4">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-400" />
            <Input
              type="text"
              placeholder="Search"
              className="pl-9 bg-gray-50 border-gray-200"
            />
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Link href="/project-costing/new">
            <Button className="bg-[#3B7CED] hover:bg-[#3065c3] text-white">
              New Project
            </Button>
          </Link>
          <div className="flex items-center border border-gray-200 rounded">
            <Button variant="ghost" size="icon" className="rounded-none border-r border-gray-200 h-9 w-9">
              <LayoutGrid className="h-4 w-4 text-gray-500" />
            </Button>
            <Button variant="ghost" size="icon" className="rounded-none h-9 w-9 bg-blue-50 text-blue-600">
              <List className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Data Table */}
      <div className="bg-white rounded shadow-sm border border-gray-100">
        <Table>
          <TableHeader>
            <TableRow className="bg-[#F8F9FA] hover:bg-[#F8F9FA] border-b-gray-100">
              <TableHead className="w-[50px]">
                <Checkbox className="border-gray-300" />
              </TableHead>
              <TableHead className="font-medium text-gray-500">Project Code</TableHead>
              <TableHead className="font-medium text-gray-500">Project Name</TableHead>
              <TableHead className="font-medium text-gray-500">Project Manager</TableHead>
              <TableHead className="font-medium text-gray-500">Project Type</TableHead>
              <TableHead className="font-medium text-gray-500">Start Date</TableHead>
              <TableHead className="font-medium text-gray-500">Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {dummyProjects.map((project, index) => (
              <TableRow 
                key={index} 
                className="cursor-pointer hover:bg-gray-50 border-b-gray-100"
                onClick={() => handleRowClick(project.code)}
              >
                <TableCell onClick={(e) => e.stopPropagation()}>
                  <Checkbox className="border-gray-300" />
                </TableCell>
                <TableCell className="text-gray-600">{project.code}</TableCell>
                <TableCell className="text-gray-600">{project.name}</TableCell>
                <TableCell className="text-gray-600">{project.manager}</TableCell>
                <TableCell className="text-gray-600">{project.type}</TableCell>
                <TableCell className="text-gray-600">{project.startDate}</TableCell>
                <TableCell>
                  <Badge variant={project.statusVariant as any} className="px-3 py-1 font-normal">
                    {project.status}
                  </Badge>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
