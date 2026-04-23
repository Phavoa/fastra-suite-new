"use client";

import React from "react";
import { z } from "zod";
import { RequestForm } from "@/components/requests/RequestForm";
import { RequestFormConfig } from "@/components/requests/types";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

const formSchema = z.object({
  project: z.string().min(1, "Please select a project"),
  amountRequested: z.coerce
    .number()
    .positive("Enter a valid amount")
    .max(50000, "Maximum Limit is N50,000"),
  purpose: z.string().min(2, "Purpose is required"),
  description: z.string().min(2, "Description is required"),
  notes: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

export default function NewPettyCashRequestPage() {
  const config: RequestFormConfig<FormValues> = {
    title: "Petty Cash Request",
    requestId: "PC00001",
    requesterName: "Firstname Lastname",
    date: "4 Apr 2024",
    renderHeader: () => (
      <div className="bg-white px-4 py-6">
        <h2 className="text-sm font-medium text-[#3B7CED] mb-4">Request Details</h2>
        <div className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="requestId" className="text-sm font-semibold text-gray-900">Request ID</Label>
            <Input id="requestId" value="PC00001" readOnly className="bg-white text-gray-900" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="date" className="text-sm font-semibold text-gray-900">Date</Label>
            <Input id="date" value="4 Apr 2024" readOnly className="bg-white text-gray-900" />
          </div>
        </div>
      </div>
    ),
    sections: [
      {
        title: "Petty Cash Details",
        fields: [
          {
            name: "project",
            label: "Project",
            type: "select",
            placeholder: "Select a project",
            options: [
              { label: "Project #1", value: "project-1" },
              { label: "Project #2", value: "project-2" },
            ],
          },
          {
            name: "amountRequested",
            label: "Amount Requested",
            type: "number",
            placeholder: "Enter amount",
            hintText: "Maximum Limit: N50,000",
          },
          {
            name: "purpose",
            label: "Purpose / Expense Category",
            type: "text",
            placeholder: "Enter purpose",
          },
          {
            name: "description",
            label: "Description of Expense",
            type: "text",
            placeholder: "Enter description of expense",
          },
          {
            name: "notes",
            label: "Notes",
            type: "text",
            placeholder: "Enter note",
          },
        ],
      },
    ],
    schema: formSchema,
    defaultValues: {
      project: "",
      amountRequested: 0,
      purpose: "",
      description: "",
      notes: "",
    },
    onSubmit: async (data) => {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      console.log("Form submitted:", data);
    },
    successMessage: {
      title: "Request Submitted",
      description: "Your request has successfully been submitted",
    },
    errorMessage: {
      title: "Submission Unsuccessful",
      description: "Your request submission was unsuccessful. Please try again.",
    },
    backPath: "/petty-cash-request",
  };

  return <RequestForm config={config} />;
}
