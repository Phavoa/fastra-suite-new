import { createApi } from "@reduxjs/toolkit/query/react";
import type { RootState } from "@/lib/store/store";
import type {
  ActivityBudgetLine,
  CreateActivityBudgetLineRequest,
  UpdateActivityBudgetLineRequest,
  CreateProjectCostingProjectRequest,
  CreateProjectCostingProjectResponse,
  ProjectCostingProject,
  UpdateProjectCostingProjectRequest,
  ProjectCostingFilterParams,
  WBSElement,
  CreateWBSElementRequest,
  ProjectActionRequest,
  ProjectSettings,
} from "@/types/projectCosting";

// Helper function to get tenant-specific base URL
const getTenantBaseUrl = (state: RootState): string => {
  const tenantSchemaName = state.auth.tenant_schema_name;
  const apiDomain = process.env.NEXT_PUBLIC_API_DOMAIN || "fastrasuiteapi.com.ng";
  return `https://${tenantSchemaName}.${apiDomain}`;
};

export const projectCostingApi = createApi({
  reducerPath: "projectCostingApi",
  baseQuery: async (args, api, extraOptions) => {
    const state = api.getState() as RootState;
    const baseUrl = getTenantBaseUrl(state);
    const token = state.auth.access_token;

    const headers = new Headers();
    if (token) {
      headers.set("authorization", `Bearer ${token}`);
    }
    headers.set("content-type", "application/json");
    headers.set("accept", "application/json");

    let url: string;
    if (typeof args === "string") {
      url = `${baseUrl}${args}`;
    } else {
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
        body: typeof args === "string" ? undefined : args.body ? JSON.stringify(args.body) : undefined,
      });

      if (!response.ok) {
        return {
          error: {
            status: response.status,
            data: await response.json().catch(() => ({})),
          },
        };
      }

      if (response.status === 204) {
        return { data: null };
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
    // Activity Budget Lines Endpoints
    getActivityBudgetLines: builder.query<ActivityBudgetLine[], ProjectCostingFilterParams>({
      query: (params) => ({
        url: "/project-costing/activity-budget-lines/",
        params,
      }),
    }),
    getActivityBudgetLine: builder.query<ActivityBudgetLine, string>({
      query: (id) => `/project-costing/activity-budget-lines/${id}/`,
    }),
    createActivityBudgetLine: builder.mutation<ActivityBudgetLine, CreateActivityBudgetLineRequest>({
      query: (body) => ({
        url: "/project-costing/activity-budget-lines/",
        method: "POST",
        body,
      }),
    }),
    updateActivityBudgetLine: builder.mutation<ActivityBudgetLine, { id: string; body: UpdateActivityBudgetLineRequest }>({
      query: ({ id, body }) => ({
        url: `/project-costing/activity-budget-lines/${id}/`,
        method: "PUT",
        body,
      }),
    }),
    patchActivityBudgetLine: builder.mutation<ActivityBudgetLine, { id: string; body: Partial<UpdateActivityBudgetLineRequest> }>({
      query: ({ id, body }) => ({
        url: `/project-costing/activity-budget-lines/${id}/`,
        method: "PATCH",
        body,
      }),
    }),
    deleteActivityBudgetLine: builder.mutation<void, string>({
      query: (id) => ({
        url: `/project-costing/activity-budget-lines/${id}/`,
        method: "DELETE",
      }),
    }),

    // Projects Costing Endpoints
    getProjectCostingProjects: builder.query<ProjectCostingProject[], ProjectCostingFilterParams>({
      query: (params) => ({
        url: "/project-costing/projects/",
        params,
      }),
    }),
    getProjectCostingProject: builder.query<ProjectCostingProject, number>({
      query: (id) => `/project-costing/projects/${id}/`,
    }),
    createProjectCostingProject: builder.mutation<CreateProjectCostingProjectResponse, CreateProjectCostingProjectRequest>({
      query: (body) => ({
        url: "/project-costing/projects/",
        method: "POST",
        body,
      }),
    }),
    updateProjectCostingProject: builder.mutation<ProjectCostingProject, { id: number; body: UpdateProjectCostingProjectRequest }>({
      query: ({ id, body }) => ({
        url: `/project-costing/projects/${id}/`,
        method: "PUT",
        body,
      }),
    }),
    patchProjectCostingProject: builder.mutation<ProjectCostingProject, { id: number; body: UpdateProjectCostingProjectRequest }>({
      query: ({ id, body }) => ({
        url: `/project-costing/projects/${id}/`,
        method: "PATCH",
        body,
      }),
    }),
    deleteProjectCostingProject: builder.mutation<void, number>({
      query: (id) => ({
        url: `/project-costing/projects/${id}/`,
        method: "DELETE",
      }),
    }),

    // Project Actions
    approveProject: builder.mutation<ProjectCostingProject, { id: number; body: ProjectActionRequest }>({
      query: ({ id, body }) => ({
        url: `/project-costing/projects/${id}/approve/`,
        method: "POST",
        body,
      }),
    }),
    closeProject: builder.mutation<ProjectCostingProject, { id: number; body: ProjectActionRequest }>({
      query: ({ id, body }) => ({
        url: `/project-costing/projects/${id}/close/`,
        method: "POST",
        body,
      }),
    }),
    rejectProject: builder.mutation<ProjectCostingProject, { id: number; body: ProjectActionRequest }>({
      query: ({ id, body }) => ({
        url: `/project-costing/projects/${id}/reject/`,
        method: "POST",
        body,
      }),
    }),
    submitProject: builder.mutation<ProjectCostingProject, { id: number; body: ProjectActionRequest }>({
      query: ({ id, body }) => ({
        url: `/project-costing/projects/${id}/submit/`,
        method: "POST",
        body,
      }),
    }),

    // Project Sub-resources
    getProjectDashboard: builder.query<ProjectCostingProject, number>({
      query: (id) => `/project-costing/projects/${id}/dashboard/`,
    }),
    getProjectFinancials: builder.query<ProjectCostingProject, number>({
      query: (id) => `/project-costing/projects/${id}/financials/`,
    }),
    getProjectContext: builder.query<ProjectCostingProject, number>({
      query: (id) => `/project-costing/projects/${id}/project_context/`,
    }),
    getProjectWbs: builder.query<ProjectCostingProject, number>({
      query: (id) => `/project-costing/projects/${id}/wbs/`,
    }),

    // Project Settings
    getProjectSettings: builder.query<void, string>({
      query: (id) => `/project-costing/projects/${id}/settings/`,
    }),
    updateProjectSettings: builder.mutation<void, { id: string; body: ProjectSettings }>({
      query: ({ id, body }) => ({
        url: `/project-costing/projects/${id}/settings/`,
        method: "PUT",
        body,
      }),
    }),
    patchProjectSettings: builder.mutation<void, { id: string; body: Partial<ProjectSettings> }>({
      query: ({ id, body }) => ({
        url: `/project-costing/projects/${id}/settings/`,
        method: "PATCH",
        body,
      }),
    }),

    // WBS Elements Endpoints
    getWbsElements: builder.query<WBSElement[], ProjectCostingFilterParams>({
      query: (params) => ({
        url: "/project-costing/wbs-elements/",
        params,
      }),
    }),
    getWbsElement: builder.query<WBSElement, string>({
      query: (id) => `/project-costing/wbs-elements/${id}/`,
    }),
    createWbsElement: builder.mutation<WBSElement, CreateWBSElementRequest>({
      query: (body) => ({
        url: "/project-costing/wbs-elements/",
        method: "POST",
        body,
      }),
    }),
    updateWbsElement: builder.mutation<WBSElement, { id: string; body: CreateWBSElementRequest }>({
      query: ({ id, body }) => ({
        url: `/project-costing/wbs-elements/${id}/`,
        method: "PUT",
        body,
      }),
    }),
    patchWbsElement: builder.mutation<WBSElement, { id: string; body: Partial<CreateWBSElementRequest> }>({
      query: ({ id, body }) => ({
        url: `/project-costing/wbs-elements/${id}/`,
        method: "PATCH",
        body,
      }),
    }),
    deleteWbsElement: builder.mutation<void, string>({
      query: (id) => ({
        url: `/project-costing/wbs-elements/${id}/`,
        method: "DELETE",
      }),
    }),
  }),
});

export const {
  useGetActivityBudgetLinesQuery,
  useGetActivityBudgetLineQuery,
  useCreateActivityBudgetLineMutation,
  useUpdateActivityBudgetLineMutation,
  usePatchActivityBudgetLineMutation,
  useDeleteActivityBudgetLineMutation,
  useGetProjectCostingProjectsQuery,
  useGetProjectCostingProjectQuery,
  useCreateProjectCostingProjectMutation,
  useUpdateProjectCostingProjectMutation,
  usePatchProjectCostingProjectMutation,
  useDeleteProjectCostingProjectMutation,
  useApproveProjectMutation,
  useCloseProjectMutation,
  useRejectProjectMutation,
  useSubmitProjectMutation,
  useGetProjectDashboardQuery,
  useGetProjectFinancialsQuery,
  useGetProjectContextQuery,
  useGetProjectWbsQuery,
  useGetProjectSettingsQuery,
  useUpdateProjectSettingsMutation,
  usePatchProjectSettingsMutation,
  useGetWbsElementsQuery,
  useGetWbsElementQuery,
  useCreateWbsElementMutation,
  useUpdateWbsElementMutation,
  usePatchWbsElementMutation,
  useDeleteWbsElementMutation,
} = projectCostingApi;
