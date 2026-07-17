"use client";

import React, { useState } from "react";
import { ArrowLeft, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { PageGuard } from "@/components/auth/PageGuard";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function NewCategoryPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = () => {
    setIsSubmitting(true);
    setTimeout(() => {
      router.push("/inventory/configuration/categories");
    }, 800);
  };

  return (
    <PageGuard application="inventory" module="productcategories">
      <div className="flex flex-col flex-1 min-h-[calc(100vh-64px)] bg-[#F6F9FC] relative pb-24">
        {/* Clean Header Card */}
        <div className="flex items-center justify-between px-6 py-4 bg-white border-b border-gray-100 shadow-2xs">
          <div className="flex items-center gap-3">
            <Link href="/inventory/configuration/categories">
              <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-400 hover:text-[#32325D]">
                <ArrowLeft className="h-4 w-4" />
              </Button>
            </Link>
            <div>
              <h1 className="text-lg font-semibold text-[#32325D]">New Category</h1>
              <p className="text-xs text-[#8898AA] mt-0.5">Create a new product classification category.</p>
            </div>
          </div>
        </div>

        {/* Main Form Container */}
        <main className="p-6 max-w-[1400px] mx-auto w-full flex flex-col gap-6">
          <div className="bg-white rounded-lg shadow-2xs border border-gray-100 overflow-hidden">
            <div className="p-5 border-b border-gray-100">
              <h2 className="text-base font-semibold text-[#32325D]">Category Attributes</h2>
            </div>
            <div className="p-6 grid grid-cols-1 gap-6">
              <div className="flex flex-col gap-2.5">
                <Label className="text-sm font-semibold text-[#32325D]">
                  Category Name <span className="text-[#E43D2B]">*</span>
                </Label>
                <Input
                  placeholder="e.g. Electrical & Wiring Components"
                  className="bg-white border-gray-200 rounded-md h-9 text-sm text-[#32325D] focus:ring-[#3B7CED] max-w-lg"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>

              <div className="flex flex-col gap-2.5">
                <Label className="text-sm font-semibold text-[#32325D]">Description</Label>
                <Textarea
                  placeholder="Enter detailed explanation of what products are classified under this category..."
                  className="bg-white border-gray-200 rounded-md min-h-[110px] text-sm text-[#32325D] focus:ring-[#3B7CED] max-w-2xl"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>
            </div>
          </div>
        </main>

        {/* Fixed Sticky Footer Bar */}
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 flex justify-end gap-3 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] z-30">
          <Link href="/inventory/configuration/categories">
            <Button variant="outline" className="border-gray-300 text-gray-700 hover:bg-gray-50 h-9 px-4 text-sm font-medium">
              Cancel
            </Button>
          </Link>
          <Button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="bg-[#3B7CED] hover:bg-[#3065c3] text-white h-9 px-4 text-sm font-semibold shadow-2xs flex items-center gap-1.5"
          >
            <Save className="w-4 h-4" />
            {isSubmitting ? "Saving..." : "Save Category"}
          </Button>
        </div>
      </div>
    </PageGuard>
  );
}
