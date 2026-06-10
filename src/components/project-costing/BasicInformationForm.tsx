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

interface BasicInformationFormProps {
  name: string;
  setName: (val: string) => void;
  clientName: string;
  setClientName: (val: string) => void;
  projectType: string;
  setProjectType: (val: string) => void;
  startDate: string;
  setStartDate: (val: string) => void;
  expectedEndDate: string;
  setExpectedEndDate: (val: string) => void;
  description: string;
  setDescription: (val: string) => void;
}

export function BasicInformationForm({
  name,
  setName,
  clientName,
  setClientName,
  projectType,
  setProjectType,
  startDate,
  setStartDate,
  expectedEndDate,
  setExpectedEndDate,
  description,
  setDescription,
}: BasicInformationFormProps) {
  return (
    <section>
      <h2 className="text-[#3B7CED] text-xl mb-6">Basic Information</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="flex flex-col gap-2">
          <Label className="text-gray-700 font-medium">Project Name</Label>
          <Input
            placeholder="Enter Project Name"
            className="bg-white border-gray-300 rounded"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>
        <div className="flex flex-col gap-2">
          <Label className="text-gray-700 font-medium">Client Name</Label>
          <Input
            placeholder="Enter Client Name"
            className="bg-white border-gray-300 rounded"
            value={clientName}
            onChange={(e) => setClientName(e.target.value)}
          />
        </div>

        <div className="flex flex-col gap-2">
          <Label className="text-gray-700 font-medium">Project Type</Label>
          <Select value={projectType} onValueChange={setProjectType}>
            <SelectTrigger className="bg-white border-gray-300 rounded w-full">
              <SelectValue placeholder="Select Project Type" />
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
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
          />
        </div>
        <div className="flex flex-col gap-2">
          <Label className="text-gray-700 font-medium">Expected End Date</Label>
          <Input
            type="date"
            placeholder="Enter date"
            className="bg-white border-gray-300 rounded"
            value={expectedEndDate}
            onChange={(e) => setExpectedEndDate(e.target.value)}
          />
        </div>

        <div className="flex flex-col gap-2 md:col-span-3">
          <Label className="text-gray-700 font-medium">Description</Label>
          <Input
            placeholder="Enter descriptions"
            className="bg-white border-gray-300 rounded"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>
      </div>
    </section>
  );
}
