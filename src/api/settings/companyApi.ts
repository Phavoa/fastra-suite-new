import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import type { RootState } from "@/lib/store/store";

// Company interface
export interface Company {
  id: string;
  logo?: string;
  phone: string;
  street_address: string;
  city?: string;
  state?: string;
  country?: string;
  registration_number?: string;
  tax_id?: string;
  industry?: string;
  language?: string;
  company_size?: string;
  website: string;
  roles?: { id: number; name: string }[];
}

// Helper to get tenant-specific base URL
const getTenantBaseUrl = (state: RootState) => {
  const tenantSchemaName = state.auth.tenant_schema_name;
  const apiDomain =
    process.env.NEXT_PUBLIC_API_DOMAIN || "fastrasuiteapi.com.ng";
  return `https://${tenantSchemaName}.${apiDomain}`;
};

export const companyApi = createApi({
  reducerPath: "companyApi",
  baseQuery: async (args, api) => {
    const state = api.getState() as RootState;
    const baseUrl = getTenantBaseUrl(state);
    const token = state.auth.access_token;

    const headers = new Headers();
    if (token) headers.set("authorization", `Bearer ${token}`);
    headers.set("content-type", "application/json");
    headers.set("accept", "application/json");

    // Determine URL and method
    let url: string;
    let method = "GET";
    let body: any = undefined;

    if (typeof args === "string") {
      url = `${baseUrl}${args}`;
    } else {
      url = `${baseUrl}${args.url}`;
      method = args.method || "GET";
      if (args.body) body = JSON.stringify(args.body);
    }

    try {
      const response = await fetch(url, { method, headers, body });
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
    getCompany: builder.query<Company, void>({
    query: () => "/company/update-company-profile/",
  }),
  }),
});

export const { useGetCompanyQuery } = companyApi;
