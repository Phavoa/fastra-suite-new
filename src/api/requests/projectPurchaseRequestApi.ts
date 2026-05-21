import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import type { RootState } from "../../lib/store/store";

// Define nested response types
export interface User {
  url: string;
  id: number;
  username: string;
  first_name: string;
  last_name: string;
  email: string;
}

export interface RequesterDetails {
  url: string;
  id: number;
  user: User;
  role: string;
  phone_number: string;
  language: string;
  timezone: string;
  in_app_notifications: boolean;
  email_notifications: boolean;
  groups: string[];
}

export interface UnitOfMeasureDetails {
  url: string;
  unit_name: string;
  unit_symbol: string;
  unit_category: string;
  created_on: string;
  is_hidden: boolean;
}

export interface ProductDetails {
  url: string;
  id: number;
  product_name: string;
  product_description: string;
  product_category: string;
  available_product_quantity: string;
  total_quantity_purchased: string;
  unit_of_measure: number;
  created_on: string;
  updated_on: string;
  is_hidden: boolean;
  unit_of_measure_details: UnitOfMeasureDetails;
}

export interface ProjectPurchaseRequestItemResponse {
  id: number;
  purchase_request: string;
  product: number;
  product_details: ProductDetails;
  qty: number;
  estimated_unit_price: string;
}

export interface RequestingLocationDetails {
  id: string;
  location_code: string;
  location_name: string;
  location_type: string;
  address: string;
  location_manager: number;
  location_manager_details: RequesterDetails;
  store_keeper: number;
  store_keeper_details: RequesterDetails;
  contact_information: string;
  is_hidden: boolean;
}

export interface CurrencyDetails {
  url: string;
  id: number;
  currency_name: string;
  currency_code: string;
  currency_symbol: string;
  created_on: string;
  is_hidden: boolean;
}

export interface VendorDetails {
  url: string;
  id: number;
  company_name: string;
  profile_picture: string;
  email: string;
  address: string;
  phone_number: string;
  is_hidden: boolean;
}

// Main response type
export interface ProjectPurchaseRequest {
  url: string;
  id: string;
  status: "draft" | "approved" | "pending" | "rejected";
  date_created: string;
  date_updated: string;
  currency: number;
  requester: number;
  requester_details: RequesterDetails;
  requesting_location: string;
  purpose: string;
  vendor: number;
  items: ProjectPurchaseRequestItemResponse[];
  pr_total_price: string;
  can_edit: boolean;
  is_submitted: boolean;
  is_hidden: boolean;
  requesting_location_details: RequestingLocationDetails;
  currency_details: CurrencyDetails;
  vendor_details: VendorDetails;
}

// Query parameters types
export interface GetProjectPurchaseRequestsParams {
  currency?: number;
  ordering?: string;
  project_request__created_by?: number;
  project_request__status?: "approved" | "cancelled" | "draft" | "pending" | "rejected";
  requester?: number;
  search?: string;
  status?: "approved" | "draft" | "pending" | "rejected";
  vendor?: number;
  [key: string]: string | number | boolean | undefined;
}

// Request payload types
export interface CreateProjectPurchaseRequestItem {
  product: number;
  qty: number;
  estimated_unit_price: string;
}

export interface CreateProjectPurchaseRequest {
  status?: "draft" | "approved" | "pending" | "rejected";
  currency: number;
  requester: number;
  requesting_location: string;
  purpose: string;
  vendor: number;
  items: CreateProjectPurchaseRequestItem[];
  can_edit?: boolean;
  is_submitted?: boolean;
  is_hidden?: boolean;
}

export interface UpdateProjectPurchaseRequest {
  status?: "draft" | "approved" | "pending" | "rejected";
  currency?: number;
  requester?: number;
  requesting_location?: string;
  purpose?: string;
  vendor?: number;
  items?: CreateProjectPurchaseRequestItem[];
  can_edit?: boolean;
  is_submitted?: boolean;
  is_hidden?: boolean;
}

// Helper to resolve the tenant schema name API base URL
const getTenantBaseUrl = (state: RootState): string => {
  const tenantSchemaName = state.auth.tenant_schema_name;
  const apiDomain =
    process.env.NEXT_PUBLIC_API_DOMAIN || "fastrasuiteapi.com.ng";
  return `https://${tenantSchemaName}.${apiDomain}`;
};

export const projectPurchaseRequestApi = createApi({
  reducerPath: "projectPurchaseRequestApi",
  baseQuery: async (args, api, extraOptions) => {
    const state = api.getState() as RootState;
    const baseUrl = getTenantBaseUrl(state);
    const token = state.auth.access_token;

    // Prepare headers with Authorization token
    const headers = new Headers();
    if (token) {
      headers.set("authorization", `Bearer ${token}`);
    }
    headers.set("content-type", "application/json");

    let url: string;
    if (typeof args === "string") {
      url = `${baseUrl}${args}`;
    } else {
      // Build search params
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
    getProjectPurchaseRequests: builder.query<
      ProjectPurchaseRequest[],
      GetProjectPurchaseRequestsParams
    >({
      query: (params) => ({
        url: "/project-requests/purchase-requests/",
        params,
      }),
    }),
    getProjectPurchaseRequest: builder.query<ProjectPurchaseRequest, string>({
      query: (id) => `/project-requests/purchase-requests/${id}/`,
    }),
    createProjectPurchaseRequest: builder.mutation<
      ProjectPurchaseRequest,
      CreateProjectPurchaseRequest
    >({
      query: (body) => ({
        url: "/project-requests/purchase-requests/",
        method: "POST",
        body,
      }),
    }),
    updateProjectPurchaseRequest: builder.mutation<
      ProjectPurchaseRequest,
      { id: string; data: UpdateProjectPurchaseRequest }
    >({
      query: ({ id, data }) => ({
        url: `/project-requests/purchase-requests/${id}/`,
        method: "PUT",
        body: data,
      }),
    }),
    patchProjectPurchaseRequest: builder.mutation<
      ProjectPurchaseRequest,
      { id: string; data: Partial<CreateProjectPurchaseRequest> }
    >({
      query: ({ id, data }) => ({
        url: `/project-requests/purchase-requests/${id}/`,
        method: "PATCH",
        body: data,
      }),
    }),
    deleteProjectPurchaseRequest: builder.mutation<void, string>({
      query: (id) => ({
        url: `/project-requests/purchase-requests/${id}/`,
        method: "DELETE",
      }),
    }),
  }),
});

export const {
  useGetProjectPurchaseRequestsQuery,
  useGetProjectPurchaseRequestQuery,
  useCreateProjectPurchaseRequestMutation,
  useUpdateProjectPurchaseRequestMutation,
  usePatchProjectPurchaseRequestMutation,
  useDeleteProjectPurchaseRequestMutation,
} = projectPurchaseRequestApi;
