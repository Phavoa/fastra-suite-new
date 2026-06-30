"use client";

import React, { useState } from "react";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PageGuard } from "@/components/auth/PageGuard";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function NewUnitOfMeasurePage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [abbreviation, setAbbreviation] = useState("");

  const handleSubmit = () => {
    router.push("/inventory/configuration/units-of-measure");
  };

  return (
    <PageGuard application="inventory" module="unitsofmeasure">
      <div className="flex flex-col flex-1 min-h-[calc(100vh-64px)] bg-white relative pb-20">
        {/* Header */}
        <div className="flex items-center px-6 py-4 border-b border-gray-100">
          <Link href="/inventory/configuration/units-of-measure">
            <Button variant="ghost" size="icon" className="mr-2">
              <ArrowLeft className="h-5 w-5 text-gray-500" />
            </Button>
          </Link>
          <h1 className="text-lg font-medium text-gray-800">New Unit of Measure</h1>
        </div>

        {/* Form Container */}
        <div className="p-6 max-w-[1400px] mx-auto w-full flex flex-col gap-10 overflow-y-auto">
          <section>
            <h2 className="text-[#3B7CED] text-xl mb-6 font-medium">Unit Attributes</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              
              <div className="flex flex-col gap-2">
                <Label className="text-gray-700 font-medium">Unit Name <span className="text-red-500">*</span></Label>
                <Input
                  placeholder="e.g. Kilograms"
                  className="bg-white border-gray-300 rounded"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>

              <div className="flex flex-col gap-2">
                <Label className="text-gray-700 font-medium">Abbreviation <span className="text-red-500">*</span></Label>
                <Input
                  placeholder="e.g. kg"
                  className="bg-white border-gray-300 rounded"
                  value={abbreviation}
                  onChange={(e) => setAbbreviation(e.target.value)}
                />
              </div>

            </div>
          </section>
        </div>

        {/* Footer sticky bar */}
        <div className="absolute bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 flex justify-end gap-4 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
          <Link href="/inventory/configuration/units-of-measure">
            <Button variant="outline" className="border-blue-400 text-blue-500 hover:bg-blue-50">
              Cancel
            </Button>
          </Link>
          <Button onClick={handleSubmit} className="bg-[#3B7CED] hover:bg-[#3065c3] text-white">
            Save Unit
          </Button>
        </div>
      </div>
    </PageGuard>
  );
}
