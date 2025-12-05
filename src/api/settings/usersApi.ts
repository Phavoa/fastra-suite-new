import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import type { RootState } from "@/lib/store/store";

// User interface
export interface User {
  id: number;
  url: string;
  username: string;
  first_name: string;
  last_name: string;
  email: string;
}

// Helper to get tenant-specific base URL
const getTenantBaseUrl = (state: RootState) => {
  const tenantSchemaName = state.auth.tenant_schema_name;
  const apiDomain = process.env.NEXT_PUBLIC_API_DOMAIN || "fastrasuiteapi.com.ng";
  return `https://${tenantSchemaName}.${apiDomain}`;
};

export const usersApi = createApi({
  reducerPath: "usersApi",
  baseQuery: async (args, api) => {
    const state = api.getState() as RootState;
    const baseUrl = getTenantBaseUrl(state);
    const token = state.auth.access_token;

    const headers = new Headers();
    if (token) headers.set("authorization", `Bearer ${token}`);
    headers.set("content-type", "application/json");
    headers.set("accept", "application/json");

    let url: string;

    if (typeof args === "string") {
      url = `${baseUrl}${args}`;
    } else {
      url = `${baseUrl}${args.url}`;
    }

    try {
      const response = await fetch(url, { headers });
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
    getUsers: builder.query<User[], void>({
      query: () => "/users/users/",
    }),
    getUser: builder.query<User, number>({
      query: (id) => `/users/users/${id}/`,
    }),
  }),
});

export const { useGetUsersQuery, useGetUserQuery } = usersApi;
