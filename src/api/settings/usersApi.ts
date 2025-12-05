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

export interface NewUserRequest {
  user_id?: number;
  name: string;
  email: string;
  company_role: number;
  phone_number: string;
  language: string;
  timezone: string;
  in_app_notifications: boolean;
  email_notifications: boolean;
  access_codes: string[];
  signature_image?: string;
  user_image_image?: string;
}

export interface NewUserResponse {
  id: number;
  user_id: number;
  company_role: number;
  company_role_details: { id: number; name: string };
  phone_number: string;
  language: string;
  timezone: string;
  in_app_notifications: boolean;
  email_notifications: boolean;
  temp_password: string;
  date_created: string;
  signature: string;
  user_image: string;
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
    let method = "GET";
    let body: any = undefined;

    if (typeof args === "string") {
      url = `${baseUrl}${args}`;
    } else {
      url = `${baseUrl}${args.url}`;
      method = args.method ?? "GET";
      body = args.body ? JSON.stringify(args.body) : undefined;
    }

    try {
      const response = await fetch(url, { headers, method, body });
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
    createUser: builder.mutation<NewUserResponse, NewUserRequest>({
      query: (body) => ({
        url: "/users/tenant-users/",
        method: "POST",
        body,
      }),
    }),
  }),
});

export const { useGetUsersQuery, useGetUserQuery, useCreateUserMutation } = usersApi;
