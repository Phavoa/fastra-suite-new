import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import type { RootState } from "@/lib/store/store";
import type {
  StockAdjustment,
  CreateStockAdjustmentRequest,
  UpdateStockAdjustmentRequest,
  PatchStockAdjustmentRequest,
  GetStockAdjustmentsParams,
  ToggleHiddenStatusRequest,
} from "@/types/stockAdjustment";

// Helper function to get tenant-specific base URL
const getTenantBaseUrl = (state: RootState): string => {
  const tenantSchemaName = state.auth.tenant_schema_name;
  const apiDomain =
    process.env.NEXT_PUBLIC_API_DOMAIN || "fastrasuiteapi.com.ng";
  return `https://${tenantSchemaName}.${apiDomain}`;
};

export const stockAdjustmentApi = createApi({
  reducerPath: "stockAdjustmentApi",
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
    getStockAdjustments: builder.query<
      StockAdjustment[],
      GetStockAdjustmentsParams
    >({
      query: (params) => ({
        url: "/inventory/stock-adjustment/",
        params,
      }),
    }),

    getStockAdjustment: builder.query<StockAdjustment, string>({
      query: (id) => `/inventory/stock-adjustment/${id}/`,
    }),

    getStockAdjustmentEditable: builder.query<StockAdjustment, string>({
      query: (id) => `/inventory/stock-adjustment/${id}/check_editable/`,
    }),

    getActiveStockAdjustments: builder.query<StockAdjustment[], void>({
      query: () => "/inventory/stock-adjustment/active_list/",
    }),

    getDoneStockAdjustments: builder.query<StockAdjustment[], void>({
      query: () => "/inventory/stock-adjustment/done_list/",
    }),

    getDraftStockAdjustments: builder.query<StockAdjustment[], void>({
      query: () => "/inventory/stock-adjustment/draft_list/",
    }),

    getHiddenStockAdjustments: builder.query<StockAdjustment[], void>({
      query: () => "/inventory/stock-adjustment/hidden_list/",
    }),

    // Mutation endpoints
    createStockAdjustment: builder.mutation<
      StockAdjustment,
      CreateStockAdjustmentRequest
    >({
      query: (body) => ({
        url: "/inventory/stock-adjustment/",
        method: "POST",
        body,
      }),
    }),

    updateStockAdjustment: builder.mutation<
      StockAdjustment,
      { id: string; data: UpdateStockAdjustmentRequest }
    >({
      query: ({ id, data }) => ({
        url: `/inventory/stock-adjustment/${id}/`,
        method: "PUT",
        body: data,
      }),
    }),

    patchStockAdjustment: builder.mutation<
      StockAdjustment,
      { id: string; data: PatchStockAdjustmentRequest }
    >({
      query: ({ id, data }) => ({
        url: `/inventory/stock-adjustment/${id}/`,
        method: "PATCH",
        body: data,
      }),
    }),

    deleteStockAdjustment: builder.mutation<void, string>({
      query: (id) => ({
        url: `/inventory/stock-adjustment/${id}/soft_delete/`,
        method: "DELETE",
      }),
    }),

    toggleStockAdjustmentHiddenStatus: builder.mutation<
      StockAdjustment,
      { id: string; data?: ToggleHiddenStatusRequest }
    >({
      query: ({ id, data }) => ({
        url: `/inventory/stock-adjustment/${id}/toggle_hidden_status/`,
        method: "PUT",
        body: data || {},
      }),
    }),

    patchToggleStockAdjustmentHiddenStatus: builder.mutation<
      StockAdjustment,
      { id: string; data?: ToggleHiddenStatusRequest }
    >({
      query: ({ id, data }) => ({
        url: `/inventory/stock-adjustment/${id}/toggle_hidden_status/`,
        method: "PATCH",
        body: data || {},
      }),
    }),
  }),
});

export const {
  // Query hooks
  useGetStockAdjustmentsQuery,
  useGetStockAdjustmentQuery,
  useGetStockAdjustmentEditableQuery,
  useGetActiveStockAdjustmentsQuery,
  useGetDoneStockAdjustmentsQuery,
  useGetDraftStockAdjustmentsQuery,
  useGetHiddenStockAdjustmentsQuery,

  // Mutation hooks
  useCreateStockAdjustmentMutation,
  useUpdateStockAdjustmentMutation,
  usePatchStockAdjustmentMutation,
  useDeleteStockAdjustmentMutation,
  useToggleStockAdjustmentHiddenStatusMutation,
  usePatchToggleStockAdjustmentHiddenStatusMutation,
} = stockAdjustmentApi;
