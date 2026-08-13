import { createApi } from "@reduxjs/toolkit/query/react";
import type { RootState } from "../../lib/store/store";

/** Approved Project Request shape from the new simplified endpoints */
export interface ApprovedProjectRequest {
  id: number;
  reference_id: string;
  request_type: "labour" | string;
  activity_name: string;
  phase_name: string;
  approval_date: string;
  cost_category: string;
  required_amount: string; // can be a numeric string or "-"
}

export interface GetApprovedProjectRequestsParams {
  ordering?: string;
  search?: string;
  [key: string]: string | number | boolean | undefined;
}

const getTenantBaseUrl = (state: RootState): string => {
  const tenantSchemaName = state.auth.tenant_schema_name;
  const apiDomain =
    process.env.NEXT_PUBLIC_API_DOMAIN || "fastrasuiteapi.com.ng";
  return `https://${tenantSchemaName}.${apiDomain}`;
};

export const approvedProjectRequestsApi = createApi({
  reducerPath: "approvedProjectRequestsApi",
  baseQuery: async (args, api, _extraOptions) => {
    const state = api.getState() as RootState;
    const baseUrl = getTenantBaseUrl(state);
    const token = state.auth.access_token;

    const headers = new Headers();
    if (token) {
      headers.set("authorization", `Bearer ${token}`);
    }
    headers.set("content-type", "application/json");

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
        body:
          typeof args === "string"
            ? undefined
            : args.body
              ? JSON.stringify(args.body)
              : undefined,
      });

      if (!response.ok) {
        return {
          error: {
            status: response.status,
            data: await response.json(),
          },
        };
      }

      if (response.status === 204) {
        return { data: null };
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
    getApprovedProjectRequests: builder.query<
      ApprovedProjectRequest[],
      GetApprovedProjectRequestsParams | void
    >({
      query: (params) => ({
        url: "/invoicing/approved-project-request/",
        params,
      }),
    }),

    getApprovedProjectRequestById: builder.query<
      ApprovedProjectRequest,
      number
    >({
      query: (id) => `/invoicing/approved-project-request/${id}/`,
    }),
  }),
});

export const {
  useGetApprovedProjectRequestsQuery,
  useGetApprovedProjectRequestByIdQuery,
} = approvedProjectRequestsApi;
