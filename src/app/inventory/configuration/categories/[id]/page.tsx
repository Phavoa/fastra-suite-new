"use client";

import React, { useState } from "react";
import { ArrowLeft, Save, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
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

export default function CategoryDetailsPage() {
  const router = useRouter();
  const [name, setName] = useState("Cement Products");
  const [description, setDescription] = useState("All types of cement and related binding materials.");
  const [status, setStatus] = useState("active");
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
              <div className="flex items-center gap-2.5">
                <h1 className="text-lg font-semibold text-[#32325D]">{name}</h1>
                <Badge className={`px-2.5 py-0.5 font-semibold text-xs rounded-md shadow-none ${status === "active" ? "bg-green-50 text-green-700 border border-green-200/60" : "bg-red-50 text-red-700 border border-red-200/60"}`}>
                  {status.toUpperCase()}
                </Badge>
              </div>
              <p className="text-xs text-[#8898AA] mt-0.5">{description}</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              onClick={() => setStatus(status === "active" ? "inactive" : "active")}
              className="border-gray-300 text-gray-700 hover:bg-gray-50 text-sm h-9 px-4 font-medium"
            >
              {status === "active" ? "Deactivate" : "Activate"}
            </Button>
          </div>
        </div>

        {/* Main Form Container */}
        <main className="p-6 max-w-[1400px] mx-auto w-full flex flex-col gap-6">
          <div className="bg-white rounded-lg shadow-2xs border border-gray-100 overflow-hidden">
            <div className="p-5 border-b border-gray-100">
              <h2 className="text-base font-semibold text-[#32325D]">Category Attributes</h2>
            </div>
            <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="flex flex-col gap-2.5 md:col-span-2">
                <Label className="text-sm font-semibold text-[#32325D]">Category Name</Label>
                <Input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="bg-white border-gray-200 rounded-md h-9 text-sm text-[#32325D] focus:ring-[#3B7CED]"
                />
              </div>

              <div className="flex flex-col gap-2.5">
                <Label className="text-sm font-semibold text-[#32325D]">Status</Label>
                <Select value={status} onValueChange={setStatus}>
                  <SelectTrigger className="bg-white border-gray-200 rounded-md h-9 text-sm text-[#32325D] focus:ring-[#3B7CED]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex flex-col gap-2.5 md:col-span-3">
                <Label className="text-sm font-semibold text-[#32325D]">Description</Label>
                <Textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="bg-white border-gray-200 rounded-md min-h-[110px] text-sm text-[#32325D] focus:ring-[#3B7CED] max-w-2xl"
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
            {isSubmitting ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </div>
    </PageGuard>
  );
}
