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
export interface TenantUser {
  user_id?: number;
  first_name: string;
  last_name: string;
  email: string;
  company_role: number;
  phone_number: string;
  language: string;
  timezone: string;
  in_app_notifications: boolean;
  email_notifications: boolean;
  access_codes: string[];
  signature?: string;
  user_image_image?: string;
  user_image?: string;
  company_role_details: { id: number; name: string };
}


export interface NewUserRequest {
  user_id?: number;
  first_name: string;
  last_name: string;
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



/*export interface NewUserRequest {
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
  signature_image?: File;
  user_image_image?: string;
}*/

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
      error: { status: "FETCH_ERROR" as const, data: error },
    };
  }
},
  endpoints: (builder) => ({
  getUsers: builder.query<User[], void>({
    query: () => "/users/tenant-users/", // list all users
  }),

  // Original getUser (keep it)
  getUser: builder.query<User, number>({
    query: (id) => `/users/users/${id}/`,
  }),

  // ✅ New tenant-specific getUserById
  getUserById: builder.query<TenantUser, number>({
    query: (id) => `/users/tenant-users/${id}/`,
  }),

  // ✅ Update user mutation for tenant users
  updateUserById: builder.mutation<NewUserResponse, { id: number; data: FormData }>({
    query: ({ id, data }) => ({
      url: `/users/tenant-users/edit/${id}/`,
      method: "PATCH",
      body: data,
    }),
  }),

  createUser: builder.mutation<NewUserResponse, NewUserRequest>({
    query: (body) => ({
      url: "/users/tenant-users/",
      method: "POST",
      body,
    }),
  }),
})

});

export const { 
  useGetUsersQuery, 
  useGetUserQuery,   // original
  useGetUserByIdQuery, // new tenant-specific
  useUpdateUserByIdMutation, // new mutation
  useCreateUserMutation 
} = usersApi;