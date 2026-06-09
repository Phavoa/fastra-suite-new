"use client";

export interface ModulePermissions {
  requester?: boolean;
  reviewer?: boolean;
  approver?: boolean;
  processor?: boolean;
  payer?: boolean;
  manager?: boolean;
  administrator?: boolean;
}

export interface UserPermissions {
  projectRequest: ModulePermissions;
  projectCosting: ModulePermissions;
  invoice: ModulePermissions;
  inventory: ModulePermissions;
  settings: ModulePermissions;
}

export interface PermissionTemplate {
  id: string;
  name: string;
  permissions: UserPermissions;
  isArchived: boolean;
  createdAt: string;
}

export const MODULE_PERMISSIONS_MAPPING = {
  projectRequest: {
    label: "Project Request Module",
    allowed: ["requester", "reviewer", "approver", "manager", "administrator"],
  },
  projectCosting: {
    label: "Project Costing Module",
    allowed: ["reviewer", "approver", "manager", "administrator"],
  },
  invoice: {
    label: "Invoice Module",
    allowed: ["reviewer", "approver", "processor", "payer", "administrator"],
  },
  inventory: {
    label: "Inventory Module",
    allowed: ["requester", "reviewer", "approver", "manager", "administrator"],
  },
  settings: {
    label: "Settings",
    allowed: ["administrator"],
  },
};

export const ALL_PERMISSION_TYPES = [
  { key: "requester", label: "Requester" },
  { key: "reviewer", label: "Reviewer" },
  { key: "approver", label: "Approver" },
  { key: "processor", label: "Processor" },
  { key: "payer", label: "Payer" },
  { key: "manager", label: "Manager" },
  { key: "administrator", label: "Administrator" },
];

export const createEmptyPermissions = (): UserPermissions => ({
  projectRequest: {},
  projectCosting: {},
  invoice: {},
  inventory: {},
  settings: {},
});

// Typical Configurations from Section 8.8
const PRELOADED_TEMPLATES: PermissionTemplate[] = [
  {
    id: "tpl-1",
    name: "Field worker submitting requests",
    isArchived: false,
    createdAt: new Date().toISOString(),
    permissions: {
      projectRequest: { requester: true },
      projectCosting: {},
      invoice: {},
      inventory: { requester: true },
      settings: {},
    },
  },
  {
    id: "tpl-2",
    name: "Person reviewing and approving site requests",
    isArchived: false,
    createdAt: new Date().toISOString(),
    permissions: {
      projectRequest: { reviewer: true, approver: true },
      projectCosting: {},
      invoice: {},
      inventory: {},
      settings: {},
    },
  },
  {
    id: "tpl-3",
    name: "Person managing projects and budgets",
    isArchived: false,
    createdAt: new Date().toISOString(),
    permissions: {
      projectRequest: { approver: true },
      projectCosting: { manager: true },
      invoice: {},
      inventory: {},
      settings: {},
    },
  },
  {
    id: "tpl-4",
    name: "Person monitoring financial performance only",
    isArchived: false,
    createdAt: new Date().toISOString(),
    permissions: {
      projectRequest: {},
      projectCosting: { reviewer: true },
      invoice: { reviewer: true },
      inventory: {},
      settings: {},
    },
  },
  {
    id: "tpl-5",
    name: "Person processing purchase orders",
    isArchived: false,
    createdAt: new Date().toISOString(),
    permissions: {
      projectRequest: { reviewer: true },
      projectCosting: {},
      invoice: { processor: true },
      inventory: {},
      settings: {},
    },
  },
  {
    id: "tpl-6",
    name: "Person authorising payments",
    isArchived: false,
    createdAt: new Date().toISOString(),
    permissions: {
      projectRequest: {},
      projectCosting: {},
      invoice: { payer: true, approver: true },
      inventory: {},
      settings: {},
    },
  },
  {
    id: "tpl-7",
    name: "Person managing stock on site",
    isArchived: false,
    createdAt: new Date().toISOString(),
    permissions: {
      projectRequest: {},
      projectCosting: {},
      invoice: {},
      inventory: { approver: true, reviewer: true },
      settings: {},
    },
  },
  {
    id: "tpl-8",
    name: "Person managing the whole system (System Admin)",
    isArchived: false,
    createdAt: new Date().toISOString(),
    permissions: {
      projectRequest: { administrator: true },
      projectCosting: { administrator: true },
      invoice: { administrator: true },
      inventory: { administrator: true },
      settings: { administrator: true },
    },
  },
];

const LOCAL_STORAGE_KEYS = {
  USER_PERMISSIONS: "fastrasuite_user_permissions",
  TEMPLATES: "fastrasuite_permission_templates",
};

// --- Templates Storage Functions ---
export const getPermissionTemplates = (): PermissionTemplate[] => {
  if (typeof window === "undefined") return PRELOADED_TEMPLATES;
  try {
    const data = localStorage.getItem(LOCAL_STORAGE_KEYS.TEMPLATES);
    if (!data) {
      localStorage.setItem(LOCAL_STORAGE_KEYS.TEMPLATES, JSON.stringify(PRELOADED_TEMPLATES));
      return PRELOADED_TEMPLATES;
    }
    return JSON.parse(data);
  } catch (error) {
    console.error("Error reading permission templates:", error);
    return PRELOADED_TEMPLATES;
  }
};

export const savePermissionTemplate = (template: PermissionTemplate): void => {
  if (typeof window === "undefined") return;
  try {
    const templates = getPermissionTemplates();
    const index = templates.findIndex((t) => t.id === template.id);
    if (index >= 0) {
      templates[index] = template;
    } else {
      templates.push(template);
    }
    localStorage.setItem(LOCAL_STORAGE_KEYS.TEMPLATES, JSON.stringify(templates));
  } catch (error) {
    console.error("Error saving permission template:", error);
  }
};

export const deletePermissionTemplate = (id: string): void => {
  if (typeof window === "undefined") return;
  try {
    const templates = getPermissionTemplates();
    const filtered = templates.filter((t) => t.id !== id);
    localStorage.setItem(LOCAL_STORAGE_KEYS.TEMPLATES, JSON.stringify(filtered));
  } catch (error) {
    console.error("Error deleting permission template:", error);
  }
};

// --- User Permissions Storage Functions ---
export const getUserPermissions = (userId: number | string): UserPermissions => {
  if (typeof window === "undefined") return createEmptyPermissions();
  try {
    const data = localStorage.getItem(LOCAL_STORAGE_KEYS.USER_PERMISSIONS);
    if (!data) {
      // By default, return all permissions checked so default users aren't locked out
      return {
        projectRequest: { requester: true, reviewer: true, approver: true, manager: true, administrator: true },
        projectCosting: { reviewer: true, approver: true, manager: true, administrator: true },
        invoice: { reviewer: true, approver: true, processor: true, payer: true, administrator: true },
        inventory: { requester: true, reviewer: true, approver: true, manager: true, administrator: true },
        settings: { administrator: true },
      };
    }
    const map = JSON.parse(data);
    if (!map[userId]) {
      return {
        projectRequest: { requester: true, reviewer: true, approver: true, manager: true, administrator: true },
        projectCosting: { reviewer: true, approver: true, manager: true, administrator: true },
        invoice: { reviewer: true, approver: true, processor: true, payer: true, administrator: true },
        inventory: { requester: true, reviewer: true, approver: true, manager: true, administrator: true },
        settings: { administrator: true },
      };
    }
    return map[userId];
  } catch (error) {
    console.error("Error reading user permissions:", error);
    return createEmptyPermissions();
  }
};

export const saveUserPermissions = (userId: number | string, permissions: UserPermissions): void => {
  if (typeof window === "undefined") return;
  try {
    const data = localStorage.getItem(LOCAL_STORAGE_KEYS.USER_PERMISSIONS);
    const map = data ? JSON.parse(data) : {};
    map[userId] = permissions;
    localStorage.setItem(LOCAL_STORAGE_KEYS.USER_PERMISSIONS, JSON.stringify(map));
  } catch (error) {
    console.error("Error saving user permissions:", error);
  }
};
