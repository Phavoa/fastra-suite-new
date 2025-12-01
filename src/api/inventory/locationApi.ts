import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import type { RootState } from "../../lib/store/store";
import type {
  Location,
  LocationType,
  GetLocationsParams,
  CreateLocationRequest,
  UpdateLocationRequest,
  PatchLocationRequest,
} from "../../types/location";

// Helper function to get tenant-specific base URL
const getTenantBaseUrl = (state: RootState): string => {
  const tenantSchemaName = state.auth.tenant_schema_name;
  const apiDomain =
    process.env.NEXT_PUBLIC_API_DOMAIN || "fastrasuiteapi.com.ng";
  return `https://${tenantSchemaName}.${apiDomain}`;
};

export const locationApi = createApi({
  reducerPath: "locationApi",
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
    getLocations: builder.query<Location[], GetLocationsParams>({
      query: (params) => ({
        url: "/inventory/location/",
        params,
      }),
    }),

    getLocation: builder.query<Location, string>({
      query: (id) => `/inventory/location/${id}/`,
    }),

    getLocationStockLevels: builder.query<Location, string>({
      query: (id) => `/inventory/location/${id}/location_stock_levels/`,
    }),

    getActiveLocations: builder.query<Location[], void>({
      query: () => "/inventory/location/active_list/",
    }),

    getAllUserLocations: builder.query<Location[], void>({
      query: () => "/inventory/location/get-all-user-locations/",
    }),

    getOtherLocationsForUser: builder.query<Location[], void>({
      query: () => "/inventory/location/get-other-locations-for-user/",
    }),

    getUserManagedLocations: builder.query<Location[], void>({
      query: () => "/inventory/location/get-user-managed-locations/",
    }),

    getUserStoreLocations: builder.query<Location[], void>({
      query: () => "/inventory/location/get-user-store-locations/",
    }),

    getActiveLocationsFiltered: builder.query<Location[], void>({
      query: () => "/inventory/location/get_active_locations/",
    }),

    getHiddenLocations: builder.query<Location[], void>({
      query: () => "/inventory/location/hidden_list/",
    }),

    // Mutation endpoints
    createLocation: builder.mutation<Location, CreateLocationRequest>({
      query: (body) => ({
        url: "/inventory/location/",
        method: "POST",
        body,
      }),
    }),

    updateLocation: builder.mutation<
      Location,
      { id: string; data: UpdateLocationRequest }
    >({
      query: ({ id, data }) => ({
        url: `/inventory/location/${id}/`,
        method: "PUT",
        body: data,
      }),
    }),

    patchLocation: builder.mutation<
      Location,
      { id: string; data: PatchLocationRequest }
    >({
      query: ({ id, data }) => ({
        url: `/inventory/location/${id}/`,
        method: "PATCH",
        body: data,
      }),
    }),

    deleteLocation: builder.mutation<void, string>({
      query: (id) => ({
        url: `/inventory/location/${id}/soft_delete/`,
        method: "DELETE",
      }),
    }),

    toggleLocationHiddenStatus: builder.mutation<
      Location,
      { id: string; data?: PatchLocationRequest }
    >({
      query: ({ id, data }) => ({
        url: `/inventory/location/${id}/toggle_hidden_status/`,
        method: "PATCH",
        body: data || {},
      }),
    }),
  }),
});

export const {
  // Query hooks
  useGetLocationsQuery,
  useGetLocationQuery,
  useGetLocationStockLevelsQuery,
  useGetActiveLocationsQuery,
  useGetAllUserLocationsQuery,
  useGetOtherLocationsForUserQuery,
  useGetUserManagedLocationsQuery,
  useGetUserStoreLocationsQuery,
  useGetActiveLocationsFilteredQuery,
  useGetHiddenLocationsQuery,

  // Mutation hooks
  useCreateLocationMutation,
  useUpdateLocationMutation,
  usePatchLocationMutation,
  useDeleteLocationMutation,
  useToggleLocationHiddenStatusMutation,
} = locationApi;
