"use client";

import React from "react";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { PageGuard } from "@/components/auth/PageGuard";
import Link from "next/link";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function CategoryDetailsPage() {
  return (
    <PageGuard application="inventory" module="productcategories">
      <div className="flex flex-col h-full bg-gray-50 relative pb-20 min-h-[calc(100vh-64px)]">
        {/* Top Navigation Row */}
        <div className="flex items-center px-6 py-4 border-b border-gray-100 bg-white">
          <Link href="/inventory/configuration/categories" className="flex items-center text-sm text-gray-500 hover:text-gray-900 font-medium">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Cement Products
          </Link>
        </div>

        <div className="px-6 max-w-[1400px] mx-auto w-full flex flex-col gap-6 overflow-y-auto mt-6">
          
          {/* Header Info */}
          <div className="flex justify-between items-start bg-white p-6 rounded shadow-sm border border-gray-100">
            <div>
              <div className="flex items-center gap-4">
                <h2 className="text-2xl font-bold text-gray-800">Cement Products</h2>
                <Badge className="bg-green-100 text-green-700 hover:bg-green-100 px-3 py-0.5 border-0 font-medium text-xs">Active</Badge>
              </div>
              <div className="text-sm text-gray-500 mt-2">All types of cement and related binding materials.</div>
            </div>
            
            <div className="flex items-center gap-3">
              <Button variant="outline" className="border-red-500 text-red-500 hover:bg-red-50">
                Deactivate
              </Button>
            </div>
          </div>

          {/* Form Content */}
          <div className="bg-white p-6 rounded shadow-sm border border-gray-100 mb-12">
            <h3 className="text-lg font-medium text-[#3B7CED] mb-6">Category Attributes</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              
              <div className="flex flex-col gap-2 md:col-span-2">
                <Label className="text-gray-700 font-medium">Category Name</Label>
                <Input defaultValue="Cement Products" className="bg-white border-gray-300 rounded" />
              </div>

              <div className="flex flex-col gap-2">
                <Label className="text-gray-700 font-medium">Status</Label>
                <Select defaultValue="active">
                  <SelectTrigger className="bg-white border-gray-300 rounded">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex flex-col gap-2 md:col-span-3">
                <Label className="text-gray-700 font-medium">Description</Label>
                <Textarea defaultValue="All types of cement and related binding materials." className="bg-white border-gray-300 rounded min-h-[120px]" />
              </div>

            </div>
          </div>

        </div>

        {/* Footer sticky bar */}
        <div className="absolute bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 flex justify-end gap-4 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
          <Link href="/inventory/configuration/categories">
            <Button variant="outline" className="border-blue-400 text-blue-500 hover:bg-blue-50">
              Cancel
            </Button>
          </Link>
          <Button className="bg-[#3B7CED] hover:bg-[#3065c3] text-white">
            Save Changes
          </Button>
        </div>
      </div>
    </PageGuard>
  );
}
