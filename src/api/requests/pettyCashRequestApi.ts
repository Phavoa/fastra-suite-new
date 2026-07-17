import { createApi } from "@reduxjs/toolkit/query/react";
import type { RootState } from "../../lib/store/store";

export interface PettyCashRequest {
  id: number;
  reference_id: string;
  amount_requested: string;
  purpose: string;
  description: string;
  notes: string;
  created_at?: string;
  updated_at?: string;
  is_hidden: boolean;
  project_request: number;
}

export interface CreatePettyCashRequest {
  project: number;
  wbs_element: string; // UUID of task
  activity?: string; // UUID of task
  amount_requested: string; // decimal string
  purpose: string;
  description: string;
  notes?: string;
}

const getTenantBaseUrl = (state: RootState): string => {
  const tenantSchemaName = state.auth.tenant_schema_name;
  const apiDomain = process.env.NEXT_PUBLIC_API_DOMAIN || "fastrasuiteapi.com.ng";
  return `https://${tenantSchemaName}.${apiDomain}`;
};

export const pettyCashRequestApi = createApi({
  reducerPath: "pettyCashRequestApi",
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
    createPettyCashRequest: builder.mutation<PettyCashRequest, CreatePettyCashRequest>({
      query: (body) => ({
        url: "/project-requests/petty-cash/",
        method: "POST",
        body,
      }),
    }),
  }),
});

export const { useCreatePettyCashRequestMutation } = pettyCashRequestApi;
