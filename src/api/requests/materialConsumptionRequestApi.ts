import { createApi } from "@reduxjs/toolkit/query/react";
import type { RootState } from "../../lib/store/store";

export interface MaterialConsumptionLine {
  id?: number;
  quantity: number;
  unit_cost: string; // decimal string
  total_cost: string; // decimal string
}

export interface MaterialConsumptionRequest {
  id: number;
  request_id: string;
  project_request: number;
  location: string;
  date_consumed: string;
  notes: string;
  status: "draft" | "approved" | "pending" | "rejected" | "cancelled" | string;
  lines: MaterialConsumptionLine[];
  created_at: string;
}

export interface CreateMaterialConsumptionRequest {
  project: number;
  activity: string; // UUID of activity
  location: string;
  date_consumed: string;
  notes?: string;
  lines: MaterialConsumptionLine[];
}

export interface UpdateMaterialConsumptionRequest {
  project_request?: number;
  location?: string;
  date_consumed?: string;
  notes?: string;
  status?: string;
}

export interface GetMaterialConsumptionsParams {
  ordering?: string;
  search?: string;
}

const getTenantBaseUrl = (state: RootState): string => {
  const tenantSchemaName = state.auth.tenant_schema_name;
  const apiDomain = process.env.NEXT_PUBLIC_API_DOMAIN || "fastrasuiteapi.com.ng";
  return `https://${tenantSchemaName}.${apiDomain}`;
};

export const materialConsumptionRequestApi = createApi({
  reducerPath: "materialConsumptionRequestApi",
  baseQuery: async (args, api, extraOptions) => {
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
        body: typeof args === "string" ? undefined : args.body ? JSON.stringify(args.body) : undefined,
      });

      if (response.status === 204) {
        return { data: undefined };
      }

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
    getMaterialConsumptions: builder.query<MaterialConsumptionRequest[], GetMaterialConsumptionsParams | void>({
      query: (params) => ({
        url: "/project-requests/material-consumption/",
        params: params || undefined,
      }),
    }),
    getMaterialConsumption: builder.query<MaterialConsumptionRequest, number>({
      query: (id) => `/project-requests/material-consumption/${id}/`,
    }),
    createMaterialConsumption: builder.mutation<MaterialConsumptionRequest, CreateMaterialConsumptionRequest>({
      query: (body) => ({
        url: "/project-requests/material-consumption/",
        method: "POST",
        body,
      }),
    }),
    updateMaterialConsumption: builder.mutation<MaterialConsumptionRequest, { id: number; body: UpdateMaterialConsumptionRequest }>({
      query: ({ id, body }) => ({
        url: `/project-requests/material-consumption/${id}/`,
        method: "PUT",
        body,
      }),
    }),
    patchMaterialConsumption: builder.mutation<MaterialConsumptionRequest, { id: number; body: UpdateMaterialConsumptionRequest }>({
      query: ({ id, body }) => ({
        url: `/project-requests/material-consumption/${id}/`,
        method: "PATCH",
        body,
      }),
    }),
    deleteMaterialConsumption: builder.mutation<void, number>({
      query: (id) => ({
        url: `/project-requests/material-consumption/${id}/`,
        method: "DELETE",
      }),
    }),
  }),
});

export const {
  useGetMaterialConsumptionsQuery,
  useGetMaterialConsumptionQuery,
  useCreateMaterialConsumptionMutation,
  useUpdateMaterialConsumptionMutation,
  usePatchMaterialConsumptionMutation,
  useDeleteMaterialConsumptionMutation,
} = materialConsumptionRequestApi;
