"use client";

import React from "react";
import { z } from "zod";
import { RequestForm } from "@/components/requests/RequestForm";
import { RequestFormConfig } from "@/components/requests/types";

const formSchema = z.object({
  project: z.string().min(1, "Please select a project"),
  numberOfWorkers: z.coerce
    .number()
    .positive("Enter a correct number")
    .min(1, "Enter a correct number")
    .max(100, "Maximum 100 workers"),
  role: z.string().min(2, "Role is required").max(100, "Role name too long"),
  duration: z.string().min(1, "Please select duration"),
  dailyRate: z.coerce
    .number()
    .positive("Enter a valid daily rate")
    .min(0, "Daily rate cannot be negative"),
  justification: z.string().max(500, "Notes too long (max 500 characters)").optional(),
});

type FormValues = z.infer<typeof formSchema>;

export default function NewLabourRequestPage() {
  const config: RequestFormConfig<FormValues> = {
    title: "Labour Request",
    requestId: "LR00001",
    requesterName: "Firstname Lastname",
    date: "4 Apr 2024",
    sections: [
      {
        title: "Labour Details",
        fields: [
          {
            name: "project",
            label: "Project",
            type: "select",
            placeholder: "Select a project",
            options: [
              { label: "Project #1", value: "project-1" },
              { label: "Project #2", value: "project-2" },
              { label: "Project #3", value: "project-3" },
              { label: "Project #4", value: "project-4" },
            ],
          },
          {
            name: "numberOfWorkers",
            label: "Number of Workers",
            type: "number",
            placeholder: "Enter number of workers",
          },
          {
            name: "role",
            label: "Role / Trade Type",
            type: "text",
            placeholder: "Enter role or trade type",
          },
          {
            name: "duration",
            label: "Duration (days/weeks)",
            type: "select",
            placeholder: "Select duration",
            options: [
              { label: "1 Day", value: "1-day" },
              { label: "3 Days", value: "3-days" },
              { label: "1 Week", value: "1-week" },
              { label: "2 Weeks", value: "2-weeks" },
              { label: "1 Month", value: "1-month" },
            ],
          },
          {
            name: "dailyRate",
            label: "Estimated Daily Rate",
            type: "number",
            placeholder: "Enter estimated daily rate",
          },
          {
            name: "justification",
            label: "Justification Notes",
            type: "textarea",
            placeholder: "Enter justification notes (optional)",
            rows: 4,
          },
        ],
      },
    ],
    schema: formSchema,
    defaultValues: {
      project: "",
      numberOfWorkers: 0,
      role: "",
      duration: "",
      dailyRate: 0,
      justification: "",
    },
    onSubmit: async (data) => {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      console.log("Form submitted:", data);
    },
    successMessage: {
      title: "Request Submitted",
      description: "Your labour request has been submitted successfully. It will be reviewed by the approver.",
    },
    backPath: "/labour-request",
    calculateProjectedCost: (data) => {
      return (data.numberOfWorkers || 0) * (data.dailyRate || 0);
    },
  };

  return <RequestForm config={config} />;
}