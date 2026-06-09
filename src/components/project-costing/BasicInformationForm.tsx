import React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export function BasicInformationForm() {
  return (
    <section>
      <h2 className="text-[#3B7CED] text-xl mb-6">Basic Information</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="flex flex-col gap-2">
          <Label className="text-gray-700 font-medium">Project Name</Label>
          <Input
            placeholder="Enter Location Code"
            className="bg-white border-gray-300 rounded"
          />
        </div>
        <div className="flex flex-col gap-2">
          <Label className="text-gray-700 font-medium">Project Code</Label>
          <Input
            defaultValue="PC-10293"
            className="bg-white border-gray-300 rounded"
          />
        </div>
        <div className="flex flex-col gap-2">
          <Label className="text-gray-700 font-medium">Client Name</Label>
          <Input
            placeholder="Enter Location Name"
            className="bg-white border-gray-300 rounded"
          />
        </div>

        <div className="flex flex-col gap-2">
          <Label className="text-gray-700 font-medium">Project Type</Label>
          <Select>
            <SelectTrigger className="bg-white border-gray-300 rounded w-full">
              <SelectValue placeholder="Select Location Manager" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="fixed">Fixed Price</SelectItem>
              <SelectItem value="time">Time & Material</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="flex flex-col gap-2">
          <Label className="text-gray-700 font-medium">Start date</Label>
          <Input
            type="date"
            placeholder="Enter date"
            className="bg-white border-gray-300 rounded"
          />
        </div>
        <div className="flex flex-col gap-2">
          <Label className="text-gray-700 font-medium">Expected End Date</Label>
          <Input
            type="date"
            placeholder="Enter date"
            className="bg-white border-gray-300 rounded"
          />
        </div>

        <div className="flex flex-col gap-2">
          <Label className="text-gray-700 font-medium">Project Manager</Label>
          <Input
            defaultValue="John Doe"
            className="bg-white border-gray-300 rounded"
          />
        </div>
        <div className="flex flex-col gap-2 md:col-span-2">
          <Label className="text-gray-700 font-medium">Description</Label>
          <Input
            placeholder="Enter descriptions"
            className="bg-white border-gray-300 rounded"
          />
        </div>
      </div>
    </section>
  );
}
