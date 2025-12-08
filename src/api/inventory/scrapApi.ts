import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import type { RootState } from "@/lib/store/store";
import type {
  Scrap,
  CreateScrapRequest,
  UpdateScrapRequest,
  PatchScrapRequest,
  GetScrapsParams,
  ToggleHiddenStatusRequest,
} from "@/types/scrap";

// Helper function to get tenant-specific base URL
const getTenantBaseUrl = (state: RootState): string => {
  const tenantSchemaName = state.auth.tenant_schema_name;
  const apiDomain =
    process.env.NEXT_PUBLIC_API_DOMAIN || "fastrasuiteapi.com.ng";
  return `https://${tenantSchemaName}.${apiDomain}`;
};

export const scrapApi = createApi({
  reducerPath: "scrapApi",
  baseQuery: async (args, api, extraOptions) => {
    const state = api.getState() as RootState;
    const baseUrl = getTenantBaseUrl(state);
    const token = state.auth.access_token;

    // Prepare headers
    const headers = new Headers();
    if (token) {
      headers.set("authorization", `Bearer ${token}`);
    }
    headers.set("content-type", "application/json");
    headers.set("accept", "application/json");

    // Handle both string URLs and object URLs with params
    let url: string;
    if (typeof args === "string") {
      url = `${baseUrl}${args}`;
    } else {
      // Build URL with query parameters
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
    // Query endpoints
    getScraps: builder.query<Scrap[], GetScrapsParams>({
      query: (params) => ({
        url: "/inventory/scrap/",
        params,
      }),
    }),

    getScrap: builder.query<Scrap, string>({
      query: (id) => `/inventory/scrap/${id}/`,
    }),

    getActiveScraps: builder.query<Scrap[], void>({
      query: () => "/inventory/scrap/active_list/",
    }),

    getHiddenScraps: builder.query<Scrap[], void>({
      query: () => "/inventory/scrap/hidden_list/",
    }),

    // Mutation endpoints
    createScrap: builder.mutation<Scrap, CreateScrapRequest>({
      query: (body) => ({
        url: "/inventory/scrap/",
        method: "POST",
        body,
      }),
    }),

    updateScrap: builder.mutation<
      Scrap,
      { id: string; data: UpdateScrapRequest }
    >({
      query: ({ id, data }) => ({
        url: `/inventory/scrap/${id}/`,
        method: "PUT",
        body: data,
      }),
    }),

    patchScrap: builder.mutation<
      Scrap,
      { id: string; data: PatchScrapRequest }
    >({
      query: ({ id, data }) => ({
        url: `/inventory/scrap/${id}/`,
        method: "PATCH",
        body: data,
      }),
    }),

    deleteScrap: builder.mutation<void, string>({
      query: (id) => ({
        url: `/inventory/scrap/${id}/soft_delete/`,
        method: "DELETE",
      }),
    }),

    toggleScrapHiddenStatus: builder.mutation<
      Scrap,
      { id: string; data?: ToggleHiddenStatusRequest }
    >({
      query: ({ id, data }) => ({
        url: `/inventory/scrap/${id}/toggle_hidden_status/`,
        method: "PUT",
        body: data || {},
      }),
    }),

    patchToggleScrapHiddenStatus: builder.mutation<
      Scrap,
      { id: string; data?: ToggleHiddenStatusRequest }
    >({
      query: ({ id, data }) => ({
        url: `/inventory/scrap/${id}/toggle_hidden_status/`,
        method: "PATCH",
        body: data || {},
      }),
    }),
  }),
});

export const {
  // Query hooks
  useGetScrapsQuery,
  useGetScrapQuery,
  useGetActiveScrapsQuery,
  useGetHiddenScrapsQuery,

  // Mutation hooks
  useCreateScrapMutation,
  useUpdateScrapMutation,
  usePatchScrapMutation,
  useDeleteScrapMutation,
  useToggleScrapHiddenStatusMutation,
  usePatchToggleScrapHiddenStatusMutation,
} = scrapApi;
