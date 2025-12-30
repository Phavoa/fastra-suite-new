import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import type { RootState } from "@/lib/store/store";

// AccessRightDetails interface
export interface AccessRightDetails {
  id: number;
  name: string;
}

// AccessGroupRight interface
export interface AccessGroupRight {
  id: number;
  access_code: string;
  group_name: string;
  application: string;
  application_module: string;
  access_right: number;
  access_right_details: AccessRightDetails;
  date_updated: string;
  date_created: string;
}

// AccessRight interface for access_rights array
export interface AccessRight {
  [key: string]: string;
}

// Create/Update AccessGroupRight request interface
export interface CreateAccessGroupRightRequest {
  group_name: string;
  application: string;
  application_module: string;
  access_rights: AccessRight[];
  access_right: number;
}

// AccessGroupRight response interface (same as AccessGroupRight)
export type AccessGroupRightResponse = AccessGroupRight;

// AccessGroupsByApplication response interface
export interface AccessGroupsByApplication {
  id: number;
  access_code: string;
  group_name: string;
  application: string;
  application_module: string;
  access_right: number;
  access_right_details: AccessRightDetails;
  date_updated: string;
  date_created: string;
}

// Query parameters interface
export interface AccessGroupRightQueryParams {
  ordering?: string;
  search?: string;
}

// Helper to get tenant-specific base URL
const getTenantBaseUrl = (state: RootState) => {
  const tenantSchemaName = state.auth.tenant_schema_name;
  const apiDomain =
    process.env.NEXT_PUBLIC_API_DOMAIN || "fastrasuiteapi.com.ng";
  return `https://${tenantSchemaName}.${apiDomain}`;
};

export const accessGroupRightApi = createApi({
  reducerPath: "accessGroupRightApi",
  baseQuery: async (args, api) => {
    const state = api.getState() as RootState;
    const baseUrl = getTenantBaseUrl(state);
    const token = state.auth.access_token;

    let url: string;
    let method = "GET";
    let body: any = undefined;

    const headers = new Headers();
    if (token) headers.set("authorization", `Bearer ${token}`);
    headers.set("accept", "application/json");

    if (typeof args === "string") {
      url = `${baseUrl}${args}`;
    } else {
      url = `${baseUrl}${args.url}`;
      method = args.method ?? "GET";

      // If body is FormData, don't JSON.stringify it, don't set content-type
      if (args.body instanceof FormData) {
        body = args.body;
      } else if (args.body) {
        body = JSON.stringify(args.body);
        headers.set("content-type", "application/json");
      }
    }

try {
  const response = await fetch(url, { method, body, headers });

  let data: any = null;

  // ✅ SAFE JSON PARSING
  try {
    data = await response.json();
  } catch {
    data = null;
  }

  if (!response.ok) {
    return {
      error: {
        status: response.status,
        data,
      },
    };
  }

  console.log("API Call:", { url, method, body });
  console.log("Response:", data);

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
    // GET /users/access-group-right/ - List all access group rights
    getAccessGroupRights: builder.query<
      AccessGroupRight[],
      AccessGroupRightQueryParams | void
    >({
      query: (params) => {
        const searchParams = new URLSearchParams();
        if (params?.ordering) searchParams.set("ordering", params.ordering);
        if (params?.search) searchParams.set("search", params.search);
        const queryString = searchParams.toString();
        return `/users/access-group-right/`;
      },
    }),

    // POST /users/access-group-right/ - Create new access group right
    createAccessGroupRight: builder.mutation<
      AccessGroupRightResponse,
      CreateAccessGroupRightRequest
    >({
      query: (body) => ({
        url: "/users/access-group-right/",
        method: "POST",
        body,
      }),
    }),

    // GET /users/access-group-right/{access_code}/ - Get specific access group right
    getAccessGroupRight: builder.query<AccessGroupRightResponse[], string>({
      query: (access_code) => `/users/access-group-right/${access_code}/`,
    }),

    // PUT /users/access-group-right/{access_code}/ - Update specific access group right
    updateAccessGroupRight: builder.mutation<
      AccessGroupRightResponse,
      { access_code: string; data: CreateAccessGroupRightRequest }
    >({
      query: ({ access_code, data }) => ({
        url: `/users/access-group-right/${access_code}/`,
        method: "PUT",
        body: data,
      }),
    }),

    // PATCH /users/access-group-right/{access_code}/ - Partially update specific access group right
    partialUpdateAccessGroupRight: builder.mutation<
      AccessGroupRightResponse,
      { access_code: string; data: Partial<CreateAccessGroupRightRequest> }
    >({
      query: ({ access_code, data }) => ({
        url: `/users/access-group-right/${access_code}/`,
        method: "PATCH",
        body: data,
      }),
    }),

    // DELETE /users/access-group-right/{access_code}/ - Delete specific access group right
    deleteAccessGroupRight: builder.mutation<{ success: boolean }, string>({
      query: (access_code) => ({
        url: `/users/access-group-right/${access_code}/`,
        method: "DELETE",
      }),
    }),

    // DELETE /users/access-group-right/{access_code}/soft_delete/ - Soft delete specific access group right
    softDeleteAccessGroupRight: builder.mutation<{ success: boolean }, string>({
      query: (access_code) => ({
        url: `/users/access-group-right/${access_code}/soft_delete/`,
        method: "DELETE",
      }),
    }),

    // PUT /users/access-group-right/{access_code}/toggle_hidden_status/ - Toggle hidden status
    toggleHiddenStatus: builder.mutation<
      AccessGroupRightResponse,
      { access_code: string; data?: CreateAccessGroupRightRequest }
    >({
      query: ({ access_code, data }) => ({
        url: `/users/access-group-right/${access_code}/toggle_hidden_status/`,
        method: "PUT",
        body: data,
      }),
    }),

    // PATCH /users/access-group-right/{access_code}/toggle_hidden_status/ - Toggle hidden status (partial)
    toggleHiddenStatusPartial: builder.mutation<
      AccessGroupRightResponse,
      { access_code: string; data?: Partial<CreateAccessGroupRightRequest> }
    >({
      query: ({ access_code, data }) => ({
        url: `/users/access-group-right/${access_code}/toggle_hidden_status/`,
        method: "PATCH",
        body: data,
      }),
    }),

    // GET /users/access-group-right/active_list/ - Get only active (non-hidden) access group rights
    getActiveAccessGroupRights: builder.query<AccessGroupRightResponse[], void>(
      {
        query: () => "/users/access-group-right/active_list/",
      }
    ),

    // GET /users/access-group-right/hidden_list/ - Get only hidden access group rights
    getHiddenAccessGroupRights: builder.query<AccessGroupRightResponse[], void>(
      {
        query: () => "/users/access-group-right/hidden_list/",
      }
    ),

    // GET /users/access-group-rights/access-groups/ - Get restructured dataset grouped by application
    getAccessGroupsByApplication: builder.query<
      AccessGroupsByApplication[],
      void
    >({
      query: () => "/users/access-group-rights/access-groups/",
    }),
  }),
});

export const {
  useGetAccessGroupRightsQuery,
  useCreateAccessGroupRightMutation,
  useGetAccessGroupRightQuery,
  useUpdateAccessGroupRightMutation,
  usePartialUpdateAccessGroupRightMutation,
  useDeleteAccessGroupRightMutation,
  useSoftDeleteAccessGroupRightMutation,
  useToggleHiddenStatusMutation,
  useToggleHiddenStatusPartialMutation,
  useGetActiveAccessGroupRightsQuery,
  useGetHiddenAccessGroupRightsQuery,
  useGetAccessGroupsByApplicationQuery,
} = accessGroupRightApi;
