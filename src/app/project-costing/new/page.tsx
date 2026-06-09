"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { BasicInformationForm } from "@/components/project-costing/BasicInformationForm";
import { WBSTable } from "@/components/project-costing/wbs/WBSTable";

export default function NewProjectPage() {
  return (
    <div className="flex flex-col flex-1 min-h-[calc(100vh-64px)] bg-white relative pb-20">
      {/* Header */}
      <div className="flex items-center px-6 py-4 border-b border-gray-100">
        <Link href="/project-costing">
          <Button variant="ghost" size="icon" className="mr-2">
            <ArrowLeft className="h-5 w-5 text-gray-500" />
          </Button>
        </Link>
        <h1 className="text-lg font-medium text-gray-800">New Project</h1>
      </div>

      <div className="p-6 max-w-[1400px] mx-auto w-full flex flex-col gap-10 overflow-y-auto">
        <BasicInformationForm />
        <WBSTable />
      </div>

      {/* Footer sticky bar */}
      <div className="absolute bottom-0 left-0 right-0 bg-gray-50 border-t border-gray-200 p-4 flex justify-end">
        <Button className="bg-[#3B7CED] hover:bg-[#3065c3] text-white">
          Submit for Approval
        </Button>
      </div>
    </div>
  );
}
