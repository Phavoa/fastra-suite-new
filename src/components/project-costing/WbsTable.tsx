import React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ChevronDown, ChevronRight } from "lucide-react";

export function WbsTable() {
  return (
    <div className="bg-white rounded shadow-sm border border-gray-100 overflow-hidden">
      <Table>
        <TableHeader className="bg-gray-50 border-b border-gray-200">
          <TableRow className="hover:bg-gray-50 border-0">
            <TableHead className="w-[50%] font-medium text-gray-500 py-3">WBS Elements</TableHead>
            <TableHead className="w-[30%] font-medium text-gray-500 py-3">Activities</TableHead>
            <TableHead className="w-[20%] font-medium text-gray-500 py-3">Budget</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {/* Phase 1 - 1 */}
          <TableRow className="bg-[#EEF2FB] hover:bg-[#EEF2FB] border-b border-white cursor-pointer">
            <TableCell className="font-medium py-3 text-sm flex items-center gap-2">
              <ChevronDown className="h-4 w-4 text-gray-600" />
              Phase 1
            </TableCell>
            <TableCell></TableCell>
            <TableCell className="font-medium text-sm">3,000,000</TableCell>
          </TableRow>
          <TableRow className="border-b border-gray-100 hover:bg-transparent">
            <TableCell className="border-l border-gray-400 ml-6 relative">
              <div className="absolute left-[1.6rem] top-0 bottom-0 w-px bg-gray-300"></div>
            </TableCell>
            <TableCell className="py-3 text-sm text-gray-600">Activities 1</TableCell>
            <TableCell className="py-3 text-sm text-gray-600">1,000,000</TableCell>
          </TableRow>
          <TableRow className="border-b border-gray-100 hover:bg-transparent">
            <TableCell className="border-l border-gray-400 ml-6 relative">
              <div className="absolute left-[1.6rem] top-0 bottom-0 w-px bg-gray-300"></div>
            </TableCell>
            <TableCell className="py-3 text-sm text-gray-600">Activities 2</TableCell>
            <TableCell className="py-3 text-sm text-gray-600">1,000,000</TableCell>
          </TableRow>
          <TableRow className="bg-[#F4F7FC] hover:bg-[#F4F7FC] border-b border-white cursor-pointer">
            <TableCell className="py-3 pl-[3rem] text-sm font-medium relative flex items-center gap-2">
              <div className="absolute left-[1.6rem] top-0 bottom-1/2 w-px bg-gray-300"></div>
              <div className="absolute left-[1.6rem] top-1/2 w-4 h-px bg-gray-300"></div>
              <ChevronDown className="h-4 w-4 text-gray-600" />
              Sub Phase 1
            </TableCell>
            <TableCell></TableCell>
            <TableCell className="font-medium text-sm">1,000,000</TableCell>
          </TableRow>
          <TableRow className="border-b border-gray-100 hover:bg-transparent">
            <TableCell className="relative">
              <div className="absolute left-[1.6rem] top-0 bottom-0 w-px bg-gray-300"></div>
            </TableCell>
            <TableCell className="py-3 text-sm text-gray-600">Activities 2</TableCell>
            <TableCell className="py-3 text-sm text-gray-600">1,000,000</TableCell>
          </TableRow>

          {/* Phase 1 - 2 */}
          <TableRow className="bg-[#EEF2FB] hover:bg-[#EEF2FB] border-b border-white cursor-pointer">
            <TableCell className="font-medium py-3 text-sm flex items-center gap-2">
              <ChevronDown className="h-4 w-4 text-gray-600" />
              Phase 1
            </TableCell>
            <TableCell></TableCell>
            <TableCell className="font-medium text-sm">3,000,000</TableCell>
          </TableRow>
          <TableRow className="border-b border-gray-100 hover:bg-transparent">
            <TableCell className="relative">
              <div className="absolute left-[1.6rem] top-0 bottom-0 w-px bg-gray-300"></div>
            </TableCell>
            <TableCell className="py-3 text-sm text-gray-600">Activities 1</TableCell>
            <TableCell className="py-3 text-sm text-gray-600">1,000,000</TableCell>
          </TableRow>
          <TableRow className="border-b border-gray-100 hover:bg-transparent">
            <TableCell className="relative">
              <div className="absolute left-[1.6rem] top-0 bottom-0 w-px bg-gray-300"></div>
            </TableCell>
            <TableCell className="py-3 text-sm text-gray-600">Activities 2</TableCell>
            <TableCell className="py-3 text-sm text-gray-600">1,000,000</TableCell>
          </TableRow>
          <TableRow className="bg-[#F4F7FC] hover:bg-[#F4F7FC] border-b border-white cursor-pointer">
            <TableCell className="py-3 pl-[3rem] text-sm font-medium relative flex items-center gap-2">
              <div className="absolute left-[1.6rem] top-0 bottom-1/2 w-px bg-gray-300"></div>
              <div className="absolute left-[1.6rem] top-1/2 w-4 h-px bg-gray-300"></div>
              <ChevronDown className="h-4 w-4 text-gray-600" />
              Sub Phase 1
            </TableCell>
            <TableCell></TableCell>
            <TableCell className="font-medium text-sm">1,000,000</TableCell>
          </TableRow>
          <TableRow className="border-b border-gray-100 hover:bg-transparent">
            <TableCell className="relative">
              <div className="absolute left-[1.6rem] top-0 bottom-0 w-px bg-gray-300"></div>
            </TableCell>
            <TableCell className="py-3 text-sm text-gray-600">Activities 2</TableCell>
            <TableCell className="py-3 text-sm text-gray-600">1,000,000</TableCell>
          </TableRow>

          {/* Phase 1 - 3 */}
          <TableRow className="bg-[#EEF2FB] hover:bg-[#EEF2FB] border-b border-white cursor-pointer">
            <TableCell className="font-medium py-3 text-sm flex items-center gap-2">
              <ChevronDown className="h-4 w-4 text-gray-600" />
              Phase 1
            </TableCell>
            <TableCell></TableCell>
            <TableCell className="font-medium text-sm">3,000,000</TableCell>
          </TableRow>
          <TableRow className="border-b border-gray-100 hover:bg-transparent">
            <TableCell className="relative">
              <div className="absolute left-[1.6rem] top-0 bottom-0 w-px bg-gray-300"></div>
            </TableCell>
            <TableCell className="py-3 text-sm text-gray-600">Activities 1</TableCell>
            <TableCell className="py-3 text-sm text-gray-600">1,000,000</TableCell>
          </TableRow>
          <TableRow className="border-b border-gray-100 hover:bg-transparent">
            <TableCell className="relative">
              <div className="absolute left-[1.6rem] top-0 bottom-0 w-px bg-gray-300"></div>
            </TableCell>
            <TableCell className="py-3 text-sm text-gray-600">Activities 2</TableCell>
            <TableCell className="py-3 text-sm text-gray-600">1,000,000</TableCell>
          </TableRow>
          <TableRow className="bg-[#F4F7FC] hover:bg-[#F4F7FC] border-b border-white cursor-pointer">
            <TableCell className="py-3 pl-[3rem] text-sm font-medium relative flex items-center gap-2">
              <div className="absolute left-[1.6rem] top-0 bottom-1/2 w-px bg-gray-300"></div>
              <div className="absolute left-[1.6rem] top-1/2 w-4 h-px bg-gray-300"></div>
              <ChevronDown className="h-4 w-4 text-gray-600" />
              Sub Phase 1
            </TableCell>
            <TableCell></TableCell>
            <TableCell className="font-medium text-sm">1,000,000</TableCell>
          </TableRow>
          <TableRow className="border-0 hover:bg-transparent">
            <TableCell className="relative">
              <div className="absolute left-[1.6rem] top-0 bottom-0 w-px bg-gray-300"></div>
            </TableCell>
            <TableCell className="py-3 text-sm text-gray-600">Activities 2</TableCell>
            <TableCell className="py-3 text-sm text-gray-600">1,000,000</TableCell>
          </TableRow>
        </TableBody>
      </Table>
      <div className="flex items-center justify-end p-6 border-t border-gray-100 bg-white">
        <div className="text-gray-500 font-medium">
          Total Project Budget: <span className="text-xl font-bold text-gray-800 ml-2">3,000,000</span>
        </div>
      </div>
    </div>
  );
}
