import { createApi } from "@reduxjs/toolkit/query/react";
import type { RootState } from "../../lib/store/store";

export interface ProjectRequest {
  id: number;
  reference_id: string;
  request_type: "labour" | "purchase" | "petty_cash" | "subcontractor" | "plant_equipment" | string;
  module_destination: string;
  status: "draft" | "pending" | "approved" | "rejected" | "cancelled";
  created_by: number;
  created_at: string;
  updated_at: string;
  detail: any; // Can be parsed JSON or string
  project?: number;
  project_details?: {
    id: number;
    name: string;
    code: string;
  };
  created_by_details?: {
    id: number;
    username: string;
    first_name: string;
    last_name: string;
    email: string;
  };
}

export interface GetProjectRequestsParams {
  ordering?: string;
  project?: number;
  request_type?: string;
  search?: string;
  status?: string;
}

export interface ApproveProjectRequest {
  status?: "approved";
  approval_notes?: string;
}

export interface RejectProjectRequest {
  status?: "rejected";
  rejection_notes?: string;
}

export interface CancelProjectRequest {
  status?: "cancelled";
  cancellation_notes?: string;
}

const getTenantBaseUrl = (state: RootState): string => {
  const tenantSchemaName = state.auth.tenant_schema_name;
  const apiDomain = process.env.NEXT_PUBLIC_API_DOMAIN || "fastrasuiteapi.com.ng";
  return `https://${tenantSchemaName}.${apiDomain}`;
};

export const projectRequestApi = createApi({
  reducerPath: "projectRequestApi",
  baseQuery: async (args, api, extraOptions) => {
    const state = api.getState() as RootState;
    const baseUrl = getTenantBaseUrl(state);
    const token = state.auth.access_token;

    const headers = new Headers();
    if (token) {
      headers.set("authorization", `Bearer ${token}`);
    }
    headers.set("content-type", "application/json");
    headers.set("accept", "application/json");

    let url: string;
    if (typeof args === "string") {
      url = `${baseUrl}${args}`;
    } else {
      const params = new URLSearchParams();
      if (args.params) {
        Object.entries(args.params).forEach(([key, value]) => {
          if (value !== undefined && value !== null && value !== "") {
            params.append(key, String(value));
          }
        });
      }
      const queryString = params.toString();
      url = `${baseUrl}${args.url}${queryString ? `?${queryString}` : ""}`;
    }

    try {
      const response = await fetch(url, {
        method: typeof args === "string" ? "GET" : args.method || "GET",
        headers,
        body: typeof args === "string" ? undefined : args.body ? JSON.stringify(args.body) : undefined,
      });

      if (!response.ok) {
        return {
          error: {
            status: response.status,
            data: await response.json(),
          },
        };
      }

      const data = await response.json();
      return { data };
    } catch (error) {
      return {
        error: {
          status: "FETCH_ERROR" as const,
          data: error,
        },
      };
    }
  },
  endpoints: (builder) => ({
    getProjectRequests: builder.query<ProjectRequest[], GetProjectRequestsParams | void>({
      query: (params) => ({
        url: "/project-requests/project-requests/",
        params: params || undefined,
      }),
    }),
    getProjectRequest: builder.query<ProjectRequest, number>({
      query: (id) => `/project-requests/project-requests/${id}/`,
    }),
    approveProjectRequest: builder.mutation<ProjectRequest, { id: number; data?: ApproveProjectRequest }>({
      query: ({ id, data }) => ({
        url: `/project-requests/project-requests/${id}/approve/`,
        method: "POST",
        body: data || {},
      }),
    }),
    rejectProjectRequest: builder.mutation<ProjectRequest, { id: number; data?: RejectProjectRequest }>({
      query: ({ id, data }) => ({
        url: `/project-requests/project-requests/${id}/reject/`,
        method: "POST",
        body: data || {},
      }),
    }),
    cancelProjectRequest: builder.mutation<ProjectRequest, { id: number; data?: CancelProjectRequest }>({
      query: ({ id, data }) => ({
        url: `/project-requests/project-requests/${id}/cancel/`,
        method: "POST",
        body: data || {},
      }),
    }),
    submitProjectRequest: builder.mutation<ProjectRequest, { id: number; data?: any }>({
      query: ({ id, data }) => ({
        url: `/project-requests/project-requests/${id}/submit/`,
        method: "POST",
        body: data || {},
      }),
    }),
    deleteProjectRequest: builder.mutation<void, number>({
      query: (id) => ({
        url: `/project-requests/project-requests/${id}/`,
        method: "DELETE",
      }),
    }),
  }),
});

export const {
  useGetProjectRequestsQuery,
  useGetProjectRequestQuery,
  useApproveProjectRequestMutation,
  useRejectProjectRequestMutation,
  useCancelProjectRequestMutation,
  useSubmitProjectRequestMutation,
  useDeleteProjectRequestMutation,
} = projectRequestApi;
