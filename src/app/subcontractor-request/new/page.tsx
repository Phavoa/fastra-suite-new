"use client";

import React, { useMemo } from "react";
import { z } from "zod";
import { RequestForm } from "@/components/requests/RequestForm";
import { RequestFormConfig } from "@/components/requests/types";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { useCreateSubcontractorRequestMutation } from "@/api/subcontractorRequestApi";
import { useGetVendorsQuery } from "@/api/purchase/vendorsApi";
import { useRouter } from "next/navigation";

const formSchema = z.object({
  isNewVendor: z.boolean().default(false),
  vendor: z.string().optional(),
  vendor_name: z.string().optional(),
  vendor_email: z.string().email("Invalid email").optional().or(z.literal("")),
  vendor_phone: z.string().optional(),
  scope_of_work: z.string().min(2, "Scope of work is required"),
  start_date: z.string().min(2, "Start date is required"),
  end_date: z.string().min(2, "End date is required"),
  contract_value: z.string().min(1, "Contract value is required"),
  payment_terms: z.string().min(2, "Payment terms are required"),
  justification_notes: z.string().optional(),
  payment_type: z.string().min(1, "Please select a payment type"),
  milestones: z.array(z.object({
    name: z.string().min(1, "Name is required"),
    percentage: z.string().min(1, "Percentage is required"),
    completion_criteria: z.string().min(1, "Criteria is required"),
  })).optional(),
}).refine((data) => {
  if (data.isNewVendor) {
    return !!data.vendor_name;
  }
  return !!data.vendor;
}, {
  message: "Please provide subcontractor details",
  path: ["vendor_name"],
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

  const vendorOptions = useMemo(() => {
    return vendors.map((vendor) => ({
      label: vendor.company_name,
      value: String(vendor.id),
    }));
  }, [vendors]);

  const config: RequestFormConfig<FormValues> = {
    title: "Subcontractor Request",
    requestId: "Auto-generated",
    requesterName: "Current User", // This should ideally come from auth state
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
            <Input id="requestId" value="Auto-generated" readOnly className="bg-white text-gray-900" />
            <p className="text-[10px] text-gray-500 italic">This ID will be automatically assigned after submission.</p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="date" className="text-sm font-semibold text-gray-900">Date</Label>
            <Input id="date" value={new Date().toLocaleDateString("en-GB", {
              day: "numeric",
              month: "short",
              year: "numeric",
            })} readOnly className="bg-white text-gray-900" />
          </div>
        </div>
      </div>
    ),
    sections: [
      {
        title: "Subcontractor Details",
        fields: [
          {
            name: "isNewVendor",
            label: "New Subcontractor?",
            type: "checkbox",
            placeholder: "Check if the subcontractor is not in the system",
          },
          {
            name: "vendor",
            label: "Select Subcontractor",
            type: "select",
            placeholder: isLoadingVendors ? "Loading subcontractors..." : "Select a subcontractor",
            options: vendorOptions,
            visibleIf: { field: "isNewVendor", value: false },
          },
          {
            name: "vendor_name",
            label: "Subcontractor Name",
            type: "text",
            placeholder: "Enter name",
            visibleIf: { field: "isNewVendor", value: true },
          },
          {
            name: "vendor_email",
            label: "Subcontractor Email",
            type: "text",
            placeholder: "Enter email",
            visibleIf: { field: "isNewVendor", value: true },
            halfWidth: true,
          },
          {
            name: "vendor_phone",
            label: "Subcontractor Phone",
            type: "text",
            placeholder: "Enter phone",
            visibleIf: { field: "isNewVendor", value: true },
            halfWidth: true,
          },
          {
            name: "scope_of_work",
            label: "Scope of Work",
            type: "text",
            placeholder: "Enter scope of work",
          },
          {
            name: "payment_type",
            label: "Payment Type",
            type: "select",
            placeholder: "Select payment type",
            options: [
              { label: "Lump Sum", value: "lump_sum" },
              { label: "Milestone", value: "milestone" },
            ],
          },
          {
            name: "start_date",
            label: "Start Date",
            type: "date",
            halfWidth: true,
          },
          {
            name: "end_date",
            label: "End Date",
            type: "date",
            halfWidth: true,
          },
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
          {
            name: "justification_notes",
            label: "Justification Notes",
            type: "text",
            placeholder: "Enter note",
          },
        ],
      },
      {
        title: "Project Milestones",
        fields: [
          {
            name: "milestones",
            label: "Milestones",
            type: "milestones",
          },
        ],
      },
    ],
    schema: formSchema,
    defaultValues: {
      isNewVendor: false,
      vendor: "",
      vendor_name: "",
      vendor_email: "",
      vendor_phone: "",
      scope_of_work: "",
      start_date: "",
      end_date: "",
      contract_value: "",
      payment_terms: "",
      justification_notes: "",
      payment_type: "lump_sum",
      milestones: [],
    },
    onSubmit: async (data) => {
      // PRD Section 4.7: Validate milestone percentages total 100%
      if (data.payment_type === "milestone") {
        const totalPercent = (data.milestones || []).reduce((sum, m) => sum + Number(m.percentage), 0);
        if (totalPercent !== 100) {
          throw new Error("Total milestone percentage must equal 100%");
        }
      }

      try {
        const payload: any = {
          scope_of_work: data.scope_of_work,
          payment_type: data.payment_type,
          contract_value: data.contract_value,
          payment_terms: data.payment_terms,
          start_date: data.start_date,
          end_date: data.end_date,
          justification_notes: data.justification_notes || "",
          milestones: data.payment_type === "milestone" 
            ? (data.milestones || []).map(m => ({
                name: m.name,
                percentage: m.percentage,
                completion_criteria: m.completion_criteria,
                is_completed: false,
              }))
            : [], 
        };

        if (data.isNewVendor) {
          payload.vendor_name = data.vendor_name;
          payload.vendor_email = data.vendor_email;
          payload.vendor_phone = data.vendor_phone;
        } else {
          payload.vendor = Number(data.vendor);
        }

        await createRequest(payload).unwrap();
        
        // Success handled by RequestForm's successMessage config
      } catch (error) {
        console.error("Failed to submit request:", error);
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
    backPath: "/subcontractor-request",
  };

  return <RequestForm config={config} />;
}
