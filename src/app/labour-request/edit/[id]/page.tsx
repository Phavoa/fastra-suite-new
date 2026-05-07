"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { z } from "zod";
import { RequestForm } from "@/components/requests/RequestForm";
import { RequestFormConfig } from "@/components/requests/types";
import {
  useGetLabourRequestQuery,
  useUpdateLabourRequestMutation,
  usePatchLabourRequestMutation,
} from "@/api/requests/labourRequestApi";
import { useNetworkStatus } from "@/hooks/useNetworkStatus";
import { syncService } from "@/lib/database/syncService";
import { StatusModal } from "@/components/shared/StatusModal";
import { format } from "date-fns";
import extractErrorMessage from "@/components/requests/utils/RequestErrorHandler";
import { db } from "@/lib/database/labourRequestDb";
import { get } from "http";

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

export default function EditLabourRequestPage() {
  const params = useParams();
  const router = useRouter();
  const id = parseInt(params.id as string);
  const networkStatus = useNetworkStatus();

  const {
    data: request,
    isLoading,
    error,
    refetch,
  } = useGetLabourRequestQuery(id, {
    skip: isNaN(id),
  });

  const [updateLabourRequest, { isLoading: isUpdating }] =
    useUpdateLabourRequestMutation();
  const [patchLabourRequest, { isLoading: isPatching }] =
    usePatchLabourRequestMutation();

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
        date_required:
          request?.detail.date_required ||
          new Date().toISOString().split("T")[0],
        number_of_workers: data.numberOfWorkers,
        role_type: data.role,
        duration: data.duration,
        duration_unit: data.durationUnit,
        estimated_daily_rate: data.dailyRate.toString(),
        justification_notes: data.justification || "",
      };

      if (networkStatus.isOnline) {
        // Prefer PATCH for partial updates
        await patchLabourRequest({ id, data: submitData }).unwrap();

        const refetchResult = await refetch();
        const updatedId = refetchResult.data?.detail.id || id;

        setStatusModal({
          isOpen: true,
          type: "success",
          title: "Request Updated",
          description: "Your labour request has been updated successfully.",
        });

        // Navigate back to detail page after a delay
        setTimeout(() => {
          router.push(`/labour-request/${updatedId}`);
        }, 2000);
      } else {
        // Offline update - find local request by server id
        const localRequests = await db.labourRequests.where('id').equals(id).toArray();
        if (localRequests.length > 0) {
          await syncService.updateRequestOffline(localRequests[0].localId, submitData);
        } else {
          // If no local version exists, create one
          await syncService.updateRequestOffline(`server_${id}`, submitData);
        }

        setStatusModal({
          isOpen: true,
          type: "success",
          title: "Request Updated Locally",
          description:
            "Your changes have been saved locally and will be synchronized when you're back online.",
        });

        // Navigate back to detail page after a delay
        setTimeout(() => {
          router.push(`/labour-request/${id}`);
        }, 2000);
      }
    } catch (error) {
      console.error("Failed to update labour request:", error);
      const errorMessage = extractErrorMessage(error);
      setStatusModal({
        isOpen: true,
        type: "error",
        title: "Error",
        description:
          errorMessage || "Failed to update labour request. Please try again.",
      });
    }
  };

  if (isLoading || !request) {
    return (
      <div className="min-h-screen bg-[#F1F5F9] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#3B7CED] mx-auto mb-2"></div>
          <p className="text-gray-600">Loading request...</p>
        </div>
      </div>
    );
  }

  const config: RequestFormConfig<FormValues> = {
    title: "Edit Labour Request",
    requestId: request.reference_id,
    requesterName: request.detail.created_by_name || "John Doe",
    date: format(new Date(request.created_at), "d MMM yyyy"),
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
              // {
              //   label: `Project #${request.project_request.project}`,
              //   value: request.project_request.project.toString(),
              // },
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
      project: request?.project_request?.project.toString() || "",
      numberOfWorkers: request.detail.number_of_workers,
      role: request.detail.role_type,
      duration: request.detail.duration,
      durationUnit: request.detail.duration_unit,
      dailyRate: parseFloat(request.detail.estimated_daily_rate),
      justification: request.detail.justification_notes || "",
    },
    onSubmit: handleSubmit,
    successMessage: {
      title: "Request Updated",
      description: "Your labour request has been updated successfully.",
    },
    backPath: `/labour-request/${id}`,
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
