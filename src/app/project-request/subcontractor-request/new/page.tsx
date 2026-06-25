"use client";

import React, { useMemo } from "react";
import { z } from "zod";
import { RequestForm } from "@/components/requests/RequestForm";
import { RequestFormConfig } from "@/components/requests/types";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { useCreateSubcontractorRequestMutation } from "@/api/subcontractorRequestApi";
import { useGetVendorsQuery } from "@/api/purchase/vendorsApi";
import { useGetAvailableBudgetQuery } from "@/api/projectApi";
import { useRouter } from "next/navigation";

const formSchema = z.object({
  project: z.string().min(1, "Please select a project"),
  vendor: z.string().min(1, "Please select a subcontractor"),
  scope_of_work: z.string().min(2, "Scope of work is required"),
  start_date: z.string().min(2, "Start date is required"),
  end_date: z.string().min(2, "End date is required"),
  contract_value: z.string().min(1, "Contract value is required"),
  payment_terms: z.string().min(2, "Payment terms are required"),
  phase: z.string().min(1, "Please select a phase"),
  task: z.string().min(1, "Please select a task"),
  justification_notes: z.string().optional(),
}).refine((data) => {
  if (data.start_date && data.end_date) {
    return new Date(data.end_date) >= new Date(data.start_date);
  }
  return true;
}, {
  message: "End date cannot be earlier than start date",
  path: ["end_date"],
});

type FormValues = z.infer<typeof formSchema>;

export default function NewSubcontractorRequestPage() {
  const router = useRouter();
  const [createRequest, { isLoading: isSubmitting }] = useCreateSubcontractorRequestMutation();
  const { data: vendors = [], isLoading: isLoadingVendors } = useGetVendorsQuery({});

  const [requestId] = React.useState(() => {
    const num = Math.floor(Math.random() * 90000) + 10000;
    return `SC${num}`;
  });

  const vendorOptions = useMemo(() => {
    return vendors.map((vendor) => ({
      label: vendor.company_name,
      value: String(vendor.id),
    }));
  }, [vendors]);

  const config: RequestFormConfig<FormValues> = {
    title: "Subcontractor Request",
    requestId: requestId,
    requesterName: "Current User",
    date: new Date().toLocaleDateString("en-GB", {
      day: "numeric",
      month: "short",
      year: "numeric",
    }),
    renderHeader: () => (
      <div className="bg-white px-4 py-6">
        <h2 className="text-sm font-medium text-[#3B7CED] mb-4">Request Details</h2>
        <div className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="requestId" className="text-sm font-semibold text-gray-900">Request ID</Label>
            <Input id="requestId" value={requestId} readOnly className="bg-white text-gray-900" />
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
            options: [],
          },
          {
            name: "vendor",
            label: "Subcontractor Name",
            type: "select",
            placeholder: isLoadingVendors ? "Loading subcontractors..." : "Enter name",
            options: vendorOptions,
          },
          {
            name: "scope_of_work",
            label: "Scope of Work",
            type: "text",
            placeholder: "Enter scope of work",
          },
          {
            name: "start_date",
            label: "Start Date",
            type: "date",
            placeholder: "Enter date",
            halfWidth: true,
          },
          {
            name: "end_date",
            label: "End Date",
            type: "date",
            placeholder: "Enter date",
            halfWidth: true,
          },
        ],
      },
      {
        title: "Cost Details",
        fields: [
          {
            name: "contract_value",
            label: "Contract Value (Estimated)",
            type: "text",
            placeholder: "Enter value",
          },
          {
            name: "payment_terms",
            label: "Payment Terms",
            type: "text",
            placeholder: "Enter payment terms",
          },
        ],
      },
      {
        title: "WBS",
        fields: [
          {
            name: "phase",
            label: "Phase",
            type: "select",
            placeholder: "Select a phase",
            dependsOn: "project",
            options: [],
          },
          {
            name: "task",
            label: "Task",
            type: "select",
            placeholder: "Select a task",
            dependsOn: "phase",
            options: [],
          },
        ],
        renderBottom: (data: FormValues) => {
          // eslint-disable-next-line react-hooks/rules-of-hooks
          const { data: budgetData } = useGetAvailableBudgetQuery(
            {
              project_id: Number(data.project),
              wbs_id: Number(data.task),
              cost_code: data.project === "2" ? "CC-05" : "CC-04",
            },
            { skip: !data.project || !data.task }
          );
          const available = budgetData?.available_budget ? Number(budgetData.available_budget) : 0;
          return (
            <div className="pt-4 mt-4 border-t border-gray-200 space-y-2">
              <div className="flex justify-between items-center mb-1">
                <span className="text-sm font-semibold text-gray-500">Cost Code</span>
                <span className="text-sm font-semibold text-gray-500">
                  {data.project === "2" ? "CC-05" : data.project ? "CC-04" : "-"}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm font-semibold text-gray-900">Available Budget</span>
                <span className="text-sm font-semibold text-[#3B7CED]">
                  N{available.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                </span>
              </div>
            </div>
          );
        },
      },
      {
        fields: [
          {
            name: "justification_notes",
            label: "Notes / Justification",
            type: "text",
            placeholder: "Enter note",
          },
        ],
        renderTop: (data: FormValues) => {
          // eslint-disable-next-line react-hooks/rules-of-hooks
          const { data: budgetData } = useGetAvailableBudgetQuery(
            {
              project_id: Number(data.project),
              wbs_id: Number(data.task),
              cost_code: data.project === "2" ? "CC-05" : "CC-04",
            },
            { skip: !data.project || !data.task }
          );
          const available = budgetData?.available_budget ? Number(budgetData.available_budget) : 0;
          return (
            <div className="pb-4 mb-4 border-b border-gray-200 space-y-2">
              <div className="flex justify-between items-center mb-1">
                <span className="text-sm font-semibold text-gray-900">Available Budget</span>
                <span className="text-sm font-semibold text-[#3B7CED]">
                  N{available.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm font-semibold text-gray-900">Total Cost</span>
                <span className="text-sm font-semibold text-[#3B7CED]">
                  N{Number(data.contract_value || 0).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
              </div>
            </div>
          );
        },
      },
    ],
    schema: formSchema,
    defaultValues: {
      project: "",
      vendor: "",
      scope_of_work: "",
      start_date: "",
      end_date: "",
      contract_value: "",
      payment_terms: "",
      phase: "",
      task: "",
      justification_notes: "",
    },
    onSubmit: async (data) => {
      try {
        const payload: any = {
          project: Number(data.project),
          project_request: Number(data.project),
          scope_of_work: data.scope_of_work,
          payment_type: "lump_sum",
          contract_value: data.contract_value,
          payment_terms: data.payment_terms,
          start_date: data.start_date,
          end_date: data.end_date,
          justification_notes: data.justification_notes || "",
          milestones: [],
          vendor: Number(data.vendor),
        };

        await createRequest(payload).unwrap();
      } catch (error) {
        console.error("Failed to submit subcontractor request:", error);
        throw error;
      }
    },
    successMessage: {
      title: "Request Submitted",
      description: "Your subcontractor request has successfully been submitted",
    },
    errorMessage: {
      title: "Submission Unsuccessful",
      description: "Your request submission was unsuccessful. Please check your data and try again.",
    },
    backPath: "/project-request/subcontractor-request",
  };

  return <RequestForm config={config} />;
}
