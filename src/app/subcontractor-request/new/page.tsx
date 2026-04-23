"use client";

import React from "react";
import { z } from "zod";
import { RequestForm } from "@/components/requests/RequestForm";
import { RequestFormConfig } from "@/components/requests/types";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

const formSchema = z.object({
  project: z.string().min(1, "Please select a project"),
  subcontractorName: z.string().min(1, "Please select a subcontractor"),
  scopeOfWork: z.string().min(2, "Scope of work is required"),
  startDate: z.string().min(2, "Start date is required"),
  endDate: z.string().min(2, "End date is required"),
  contractValue: z.string().min(1, "Contract value is required"),
  paymentTerms: z.string().min(2, "Payment terms are required"),
  justificationNotes: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

export default function NewSubcontractorRequestPage() {
  const config: RequestFormConfig<FormValues> = {
    title: "Subcontractor Request",
    requestId: "SC00001",
    requesterName: "Firstname Lastname",
    date: "4 Apr 2024",
    renderHeader: () => (
      <div className="bg-white px-4 py-6">
        <h2 className="text-sm font-medium text-[#3B7CED] mb-4">Request Details</h2>
        <div className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="requestId" className="text-sm font-semibold text-gray-900">Request ID</Label>
            <Input id="requestId" value="SC00001" readOnly className="bg-white text-gray-900" />
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
        title: "Subcontractor Details",
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
            name: "subcontractorName",
            label: "Subcontractor Name",
            type: "select",
            placeholder: "Enter name",
            options: [
              { label: "Subcontractor A", value: "subcontractor-a" },
              { label: "Subcontractor B", value: "subcontractor-b" },
            ],
          },
          {
            name: "scopeOfWork",
            label: "Scope of Work",
            type: "text",
            placeholder: "Enter scope of work",
          },
          {
            name: "startDate",
            label: "Start Date",
            type: "text",
            placeholder: "Enter date",
            halfWidth: true,
          },
          {
            name: "endDate",
            label: "End Date",
            type: "text",
            placeholder: "Enter date",
            halfWidth: true,
          },
          {
            name: "contractValue",
            label: "Contract Value (Estimated)",
            type: "text",
            placeholder: "Enter value",
          },
          {
            name: "paymentTerms",
            label: "Payment Terms",
            type: "text",
            placeholder: "Enter payment terms",
          },
          {
            name: "justificationNotes",
            label: "Justification Notes",
            type: "text",
            placeholder: "Enter note",
          },
        ],
      },
    ],
    schema: formSchema,
    defaultValues: {
      project: "",
      subcontractorName: "",
      scopeOfWork: "",
      startDate: "",
      endDate: "",
      contractValue: "",
      paymentTerms: "",
      justificationNotes: "",
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
    backPath: "/subcontractor-request",
  };

  return <RequestForm config={config} />;
}
