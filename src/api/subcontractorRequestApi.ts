import { createApi } from "@reduxjs/toolkit/query/react";
import type { RootState } from "@/lib/store/store";
import type {
  SubcontractorRequest,
  CreateSubcontractorRequest,
  GetSubcontractorRequestsParams,
  Milestone,
} from "@/types/subcontractorRequest";

// Helper function to get tenant-specific base URL
const getTenantBaseUrl = (state: RootState): string => {
  const tenantSchemaName = state.auth.tenant_schema_name;
  const apiDomain = process.env.NEXT_PUBLIC_API_DOMAIN || "fastrasuiteapi.com.ng";
  return `https://${tenantSchemaName}.${apiDomain}`;
};

export const subcontractorRequestApi = createApi({
  reducerPath: "subcontractorRequestApi",
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
    getSubcontractorRequests: builder.query<SubcontractorRequest[], GetSubcontractorRequestsParams>({
      query: (params) => ({
        url: "/project-requests/subcontractor-requests/",
        params,
      }),
    }),
    getSubcontractorRequest: builder.query<SubcontractorRequest, number>({
      query: (id) => `/project-requests/subcontractor-requests/${id}/`,
    }),
    createSubcontractorRequest: builder.mutation<SubcontractorRequest, CreateSubcontractorRequest>({
      query: (body) => ({
        url: "/project-requests/subcontractor-requests/",
        method: "POST",
        body,
      }),
    }),
    updateSubcontractorRequest: builder.mutation<SubcontractorRequest, { id: number; body: Partial<SubcontractorRequest> }>({
      query: ({ id, body }) => ({
        url: `/project-requests/subcontractor-requests/${id}/`,
        method: "PUT",
        body,
      }),
    }),
    deleteSubcontractorRequest: builder.mutation<void, number>({
      query: (id) => ({
        url: `/project-requests/subcontractor-requests/${id}/`,
        method: "DELETE",
      }),
    }),
    // Milestone endpoints
    getSubcontractorMilestones: builder.query<Milestone[], GetSubcontractorRequestsParams>({
      query: (params) => ({
        url: "/project-requests/subcontractor-milestone/",
        params,
      }),
    }),
    createSubcontractorMilestone: builder.mutation<Milestone, Partial<Milestone>>({
      query: (body) => ({
        url: "/project-requests/subcontractor-milestone/",
        method: "POST",
        body,
      }),
    }),
  }),
});

export const {
  useGetSubcontractorRequestsQuery,
  useGetSubcontractorRequestQuery,
  useCreateSubcontractorRequestMutation,
  useUpdateSubcontractorRequestMutation,
  useDeleteSubcontractorRequestMutation,
  useGetSubcontractorMilestonesQuery,
  useCreateSubcontractorMilestoneMutation,
} = subcontractorRequestApi;
