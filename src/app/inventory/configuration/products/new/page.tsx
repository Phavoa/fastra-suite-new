"use client";

import React, { useState } from "react";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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

export default function NewProductPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [unit, setUnit] = useState("");
  const [category, setCategory] = useState("");
  const [reorderPoint, setReorderPoint] = useState("");
  const [description, setDescription] = useState("");

  const handleSubmit = () => {
    // TODO: Connect to backend mutation
    router.push("/inventory/configuration/products");
  };

  return (
    <PageGuard application="inventory" module="products">
      <div className="flex flex-col flex-1 min-h-[calc(100vh-64px)] bg-white relative pb-20">
        {/* Header */}
        <div className="flex items-center px-6 py-4 border-b border-gray-100">
          <Link href="/inventory/configuration/products">
            <Button variant="ghost" size="icon" className="mr-2">
              <ArrowLeft className="h-5 w-5 text-gray-500" />
            </Button>
          </Link>
          <h1 className="text-lg font-medium text-gray-800">New Product</h1>
        </div>

        {/* Form Container */}
        <div className="p-6 max-w-[1400px] mx-auto w-full flex flex-col gap-10 overflow-y-auto">
          <section>
            <h2 className="text-[#3B7CED] text-xl mb-6 font-medium">Basic Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              
              <div className="flex flex-col gap-2 md:col-span-2">
                <Label className="text-gray-700 font-medium">Product Name <span className="text-red-500">*</span></Label>
                <Input
                  placeholder="Enter unique product name"
                  className="bg-white border-gray-300 rounded"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>

              <div className="flex flex-col gap-2">
                <Label className="text-gray-700 font-medium">Unit of Measure <span className="text-red-500">*</span></Label>
                <Select value={unit} onValueChange={setUnit}>
                  <SelectTrigger className="bg-white border-gray-300 rounded">
                    <SelectValue placeholder="Select unit" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="bags">Bags</SelectItem>
                    <SelectItem value="tonnes">Tonnes</SelectItem>
                    <SelectItem value="liters">Liters</SelectItem>
                    <SelectItem value="pieces">Pieces</SelectItem>
                    <SelectItem value="meters">Meters</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex flex-col gap-2">
                <Label className="text-gray-700 font-medium">Product Category</Label>
                <Select value={category} onValueChange={setCategory}>
                  <SelectTrigger className="bg-white border-gray-300 rounded">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="cement">Cement Products</SelectItem>
                    <SelectItem value="steel">Steel and Iron</SelectItem>
                    <SelectItem value="finishing">Finishing Materials</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex flex-col gap-2">
                <Label className="text-gray-700 font-medium">Reorder Point</Label>
                <Input
                  type="number"
                  placeholder="0"
                  className="bg-white border-gray-300 rounded"
                  value={reorderPoint}
                  onChange={(e) => setReorderPoint(e.target.value)}
                />
              </div>

              <div className="flex flex-col gap-2 md:col-span-3">
                <Label className="text-gray-700 font-medium">Description</Label>
                <Textarea
                  placeholder="Enter additional product details..."
                  className="bg-white border-gray-300 rounded min-h-[100px]"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>

            </div>
          </section>
        </div>

        {/* Footer sticky bar */}
        <div className="absolute bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 flex justify-end gap-4 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
          <Link href="/inventory/configuration/products">
            <Button variant="outline" className="border-blue-400 text-blue-500 hover:bg-blue-50">
              Cancel
            </Button>
          </Link>
          <Button onClick={handleSubmit} className="bg-[#3B7CED] hover:bg-[#3065c3] text-white">
            Save Product
          </Button>
        </div>
      </div>
    </PageGuard>
  );
}
