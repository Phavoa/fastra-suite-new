"use client";

import React from "react";
import Link from "next/link";
import { ArrowLeft, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { WbsTable } from "@/components/project-costing/WbsTable";
import { useParams } from "next/navigation";
import { useGetProjectCostingProjectQuery } from "@/api/projectCostingApi";

export default function WBSPage() {
  const params = useParams();
  const id = params?.id || "1";
  
  const { data: project } = useGetProjectCostingProjectQuery(Number(id), {
    skip: !id,
  });

  const budgetNum = 0;

  return (
    <div className="flex flex-col h-full bg-gray-50 relative min-h-screen">
      {/* Top Navigation Row */}
      <div className="flex items-center px-6 py-4 bg-white border-b border-gray-100 shadow-sm">
        <Link href={`/project-costing/${id}`}>
          <Button variant="ghost" size="icon" className="mr-2 h-8 w-8">
            <ArrowLeft className="h-5 w-5 text-gray-500" />
          </Button>
        </Link>
        <h1 className="text-lg font-medium text-gray-800">Work Breakdown Structure (WBS)</h1>
      </div>

      <div className="p-6 max-w-[1400px] mx-auto w-full flex flex-col gap-6">
        
        {/* Project Budget Card */}
        <div className="bg-white p-6 rounded shadow-sm border border-gray-100">
          <div className="flex items-center gap-2 mb-2">
            <CheckCircle2 className="h-5 w-5 text-green-500" />
            <span className="text-sm font-medium text-green-500">Project Budget</span>
          </div>
          <div className="text-3xl font-semibold text-green-500 mt-2">
            N{budgetNum.toLocaleString()}
          </div>
        </div>

        {/* WBS Table */}
        <WbsTable />

      </div>
    </div>
  );
}
