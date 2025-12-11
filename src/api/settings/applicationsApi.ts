import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

// AccessRightDetails interface
export interface AccessRightDetails {
  id: number;
  name: string;
}

// Application and Access Right interfaces
export interface ApplicationData {
  [key: string]: string[];
}

export interface ApplicationsResponse {
  applications: ApplicationData[];
  access_rights: AccessRightDetails[];
}

export const applicationsApi = createApi({
  reducerPath: "applicationsApi",
  baseQuery: fetchBaseQuery({
    baseUrl: "https://fastrasuiteapi.com.ng",
  }),
  endpoints: (builder) => ({
    // GET /application/ - Get applications and access rights
    getApplicationsAndAccessRights: builder.query<ApplicationsResponse, void>({
      query: () => "/application/",
    }),
  }),
});

export const { useGetApplicationsAndAccessRightsQuery } = applicationsApi;
