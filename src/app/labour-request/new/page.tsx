"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { z } from "zod";
import { RequestForm } from "@/components/requests/RequestForm";
import { RequestFormConfig } from "@/components/requests/types";
import { useCreateLabourRequestMutation } from "@/api/requests/labourRequestApi";
import { useNetworkStatus } from "@/hooks/useNetworkStatus";
import { syncService } from "@/lib/database/syncService";
import { StatusModal } from "@/components/shared/StatusModal";
import extractErrorMessage from "@/components/requests/utils/RequestErrorHandler";

const formSchema = z.object({
  project: z.string().min(1, "Please select a project"),
  numberOfWorkers: z.coerce
    .number()
    .positive("Enter a correct number")
    .min(1, "Enter a correct number")
    .max(100, "Maximum 100 workers"),
  role: z.string().min(2, "Role is required").max(100, "Role name too long"),
  duration: z.coerce
    .number()
    .positive("Enter a valid duration")
    .min(1, "Duration must be at least 1"),
  durationUnit: z.enum(["days"], "Please select duration unit"),
  dailyRate: z.coerce
    .number()
    .positive("Enter a valid daily rate")
    .min(0, "Daily rate cannot be negative"),
  justification: z
    .string()
    .max(500, "Notes too long (max 500 characters)")
    .optional(),
});

type FormValues = z.infer<typeof formSchema>;

export default function NewLabourRequestPage() {
  const router = useRouter();
  const networkStatus = useNetworkStatus();
  const [createLabourRequest, { isLoading: isCreating }] =
    useCreateLabourRequestMutation();
  const [statusModal, setStatusModal] = useState<{
    isOpen: boolean;
    type: "success" | "error";
    title: string;
    description: string;
  }>({
    isOpen: false,
    type: "success",
    title: "",
    description: "",
  });

  const handleSubmit = async (data: FormValues) => {
    try {
      const submitData = {
        project: parseInt(data.project),
        date_required: new Date().toISOString().split("T")[0], // Today's date
        number_of_workers: data.numberOfWorkers,
        role_type: data.role,
        duration: data.duration,
        duration_unit: data.durationUnit,
        estimated_daily_rate: data.dailyRate.toString(),
        justification_notes: data.justification || "",
      };

      if (networkStatus.isOnline) {
        // Online submission
        console.log("submitData from new page", submitData);
        const result = await createLabourRequest(submitData).unwrap();

        setStatusModal({
          isOpen: true,
          type: "success",
          title: "Request Created",
          description: "Your labour request has been submitted successfully.",
        });

        // Navigate to list page after a delay (since we don't have the full object with id)
        setTimeout(() => {
          router.push(`/labour-request`);
        }, 2000);
      } else {
        // Offline submission - save locally
        try {
          await syncService.createRequestOffline(submitData);

          setStatusModal({
            isOpen: true,
            type: "success",
            title: "Request Saved Locally",
            description:
              "Your labour request has been saved locally and will be synchronized when you're back online.",
          });

          // Navigate back to list after a delay
          setTimeout(() => {
            router.push("/labour-request");
          }, 2000);
        } catch (error) {
          console.error("Failed to save request locally:", error);
          setStatusModal({
            isOpen: true,
            type: "error",
            title: "Error",
            description: "Failed to save request locally. Please try again.",
          });
        }
      }
    } catch (error) {
      console.error("Failed to create labour request:", error);
      const errorMessage = extractErrorMessage(error);
      setStatusModal({
        isOpen: true,
        type: "error",
        title: "Error",
        description: errorMessage,
      });
    }
  };

  const config: RequestFormConfig<FormValues> = {
    title: "Labour Request",
    requestId: "", // Will be generated
    requesterName: "You", // Will be populated from auth
    date: new Date().toLocaleDateString("en-GB", {
      day: "numeric",
      month: "short",
      year: "numeric",
    }),
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
              // TODO: Load real projects from API
              { label: "Project #1", value: "1" },
              { label: "Project #2", value: "2" },
              { label: "Project #3", value: "3" },
              { label: "Project #4", value: "4" },
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
            label: "Duration",
            type: "number",
            placeholder: "Enter duration",
            hintText: "Number of days/weeks/months",
          },
          {
            name: "durationUnit",
            label: "Duration Unit",
            type: "select",
            placeholder: "Select unit",
            options: [
              { label: "Days", value: "days" },
              // { label: "Weeks", value: "weeks" },
              // { label: "Months", value: "months" },
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
      duration: 1,
      durationUnit: "days" as const,
      dailyRate: 0,
      justification: "",
    },
    onSubmit: handleSubmit,
    successMessage: {
      title: "Request Submitted",
      description: "Your labour request has been submitted successfully.",
    },
    backPath: "/labour-request",
    calculateProjectedCost: (data) => {
      return (
        (data.numberOfWorkers || 0) *
        (data.dailyRate || 0) *
        (data.duration || 1)
      );
    },
  };

  return (
    <>
      <RequestForm config={config} />

      <StatusModal
        isOpen={statusModal.isOpen}
        onClose={() => setStatusModal((prev) => ({ ...prev, isOpen: false }))}
        type={statusModal.type}
        title={statusModal.title}
        message={statusModal.description}
      />
    </>
  );
}
