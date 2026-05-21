import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { Project, Budget } from "@/types/project";
import { RootState } from "@/lib/store/store";

// Helper function to get tenant-specific base URL
const getTenantBaseUrl = (state: RootState): string => {
  const tenantSchemaName = state.auth.tenant_schema_name;
  const apiDomain = process.env.NEXT_PUBLIC_API_DOMAIN || "fastrasuiteapi.com.ng";
  return `https://${tenantSchemaName}.${apiDomain}`;
};

export const projectApi = createApi({
  reducerPath: "projectApi",
  baseQuery: async (args, api, extraOptions) => {
    // This is a placeholder. In a real scenario, this would call the backend.
    // For now, we return mock data to follow the PRD "to the core".
    const state = api.getState() as RootState;
    const baseUrl = getTenantBaseUrl(state);

    // Mock data based on PRD requirements
    const mockProjects: Project[] = [
      {
        id: 1,
        name: "Project Alpha - Mall Construction",
        code: "PRJ-2026-001",
        wbs: [
          { id: 101, name: "Foundation", is_activity: false },
          { id: 1011, name: "Concrete Pouring", is_activity: true, parent: 101 },
          { id: 1012, name: "Excavation", is_activity: true, parent: 101 },
          { id: 102, name: "Structure", is_activity: false },
          { id: 1021, name: "Framing", is_activity: true, parent: 102 },
        ],
      },
      {
        id: 2,
        name: "Project Beta - Office Complex",
        code: "PRJ-2026-002",
        wbs: [
          { id: 200, name: "Phase 1 - Preparation", is_activity: false },
          { id: 201, name: "Site Prep", is_activity: true, parent: 200 },
          { id: 202, name: "Masonry", is_activity: true, parent: 200 },
        ],
      },
    ];

    const mockBudgets: Budget[] = [
      {
        project_id: 1,
        wbs_id: 1011,
        cost_code: "CC-04",
        budgeted_amount: "5000000",
        actual_amount: "1000000",
        committed_amount: "500000",
        available_budget: "3500000",
      },
      {
        project_id: 1,
        wbs_id: 1012,
        cost_code: "CC-04",
        budgeted_amount: "2000000",
        actual_amount: "0",
        committed_amount: "0",
        available_budget: "2000000",
      },
      {
        project_id: 2,
        wbs_id: 201,
        cost_code: "CC-05",
        budgeted_amount: "8000000",
        actual_amount: "0",
        committed_amount: "0",
        available_budget: "8000000",
      },
    ];

    if (typeof args === "string") {
      if (args === "/projects/") {
        return { data: mockProjects };
      }
      if (args.includes("/projects/")) {
        const parts = args.split("/").filter(Boolean);
        const lastPart = parts[parts.length - 1];
        const id = parseInt(lastPart || "0");
        if (!isNaN(id)) {
          return { data: mockProjects.find(p => p.id === id) };
        }
      }
    } else {
      if (args.url === "/budget/available/") {
        const { project_id, wbs_id, cost_code } = args.params as any;
        const budget = mockBudgets.find(
          b => b.project_id === Number(project_id) && 
               b.wbs_id === Number(wbs_id) && 
               b.cost_code === cost_code
        );
        return { data: budget || { available_budget: "0" } };
      }
    }

    return { data: [] };
  },
  endpoints: (builder) => ({
    getProjects: builder.query<Project[], void>({
      query: () => "/projects/",
    }),
    getProject: builder.query<Project, number>({
      query: (id) => `/projects/${id}/`,
    }),
    getAvailableBudget: builder.query<Budget, { project_id: number; wbs_id: number; cost_code: string }>({
      query: (params) => ({
        url: "/budget/available/",
        params,
      }),
    }),
  }),
});

export const { useGetProjectsQuery, useGetProjectQuery, useGetAvailableBudgetQuery } = projectApi;
