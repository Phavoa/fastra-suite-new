import { z } from "zod";

export type RequestStatus = "draft" | "approved" | "pending" | "rejected";

export interface SummaryCountConfig {
  status: RequestStatus;
  label: string;
  icon: React.ElementType;
  colorClass: string;
  bgColorClass: string;
  borderColorClass: string;
}

export interface RequestDashboardConfig<T> {
  title: string;
  idPrefix: string;
  newRequestPath: string;
  statusCounts: Record<RequestStatus, number>;
  summaryConfigs: SummaryCountConfig[];
  renderItem: (item: T) => React.ReactNode;
  mockData: T[];
}

export type FormFieldType = "text" | "number" | "select" | "textarea" | "date";

export interface FormFieldOption {
  label: string;
  value: string;
}

export interface FormFieldConfig {
  name: string;
  label: string;
  type: FormFieldType;
  placeholder?: string;
  options?: FormFieldOption[];
  rows?: number;
  className?: string;
  hintText?: string;
  halfWidth?: boolean;
}

export interface RequestFormConfig<T extends Record<string, any>> {
  title: string;
  requestId: string;
  requesterName: string;
  date: string;
  sections: {
    title: string;
    fields: FormFieldConfig[];
  }[];
  schema: z.ZodType<T>;
  defaultValues: T;
  onSubmit: (data: T) => Promise<void>;
  successMessage: {
    title: string;
    description: string;
  };
  errorMessage?: {
    title: string;
    description: string;
  };
  backPath: string;
  calculateProjectedCost?: (data: T) => number;
  renderHeader?: () => React.ReactNode;
}
