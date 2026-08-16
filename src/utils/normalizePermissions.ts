import { PermissionAction } from "../types/permissions";

export interface NormalizedPermissions {
  isAdmin: boolean;
  permissions: Record<string, Set<PermissionAction>>;
  isReady: boolean;
}

export interface PermissionDetail {
  module: string;
  permissions: Array<{
    permission_type: string;
    entitlements: string[];
  }>;
}

export interface PermissionDetailsResponse {
  permissions: Array<{
    module: string;
    permission_type: string;
  }>;
  permission_details: PermissionDetail[];
}

/**
 * Maps Django permission codenames to frontend (application:module) keys.
 *
 * Django codename format: "<app_label>.<action>_<model_name>"
 * Frontend key format:    "<application>:<module>"
 *
 * We map the Django app_label → application and model_name → module,
 * and map Django CRUD verbs → our PermissionAction vocabulary.
 */
const DJANGO_ACTION_MAP: Record<string, PermissionAction> = {
  view: "view",
  add: "create",
  change: "edit",
  delete: "delete",
  approve: "approve",
  reject: "reject",
};

/**
 * Some Django app labels differ from our frontend application names.
 * Add mappings here as needed.
 */
const APP_LABEL_MAP: Record<string, string> = {
  inventory: "inventory",
  purchase: "purchase",
  invoice: "invoice",
  sales: "sales",
  settings: "settings",
  contact: "contact",
  project_request: "project-request",
  projectrequest: "project-request",
  project_costing: "project-costing",
  projectcosting: "project-costing",
};

/**
 * Normalizes the new backend permission format into the frontend permission map.
 *
 * Input: permission_details array from backend
 *
 * Output: NormalizedPermissions with a Record of "module" → Set<entitlement>
 */
function expandPermissionType(type: string): PermissionAction[] {
  const actions: PermissionAction[] = [];
  const normalizedType = type.toLowerCase();
  
  if (normalizedType === "reviewer" || normalizedType === "viewer") {
    actions.push("view");
  } else if (normalizedType === "processor" || normalizedType === "editor") {
    actions.push("view", "create" as any, "add" as any, "edit" as any, "change" as any);
  } else if (normalizedType === "creator") {
    actions.push("view", "create" as any, "add" as any);
  } else if (
    normalizedType === "manager" ||
    normalizedType === "admin" ||
    normalizedType === "administrator"
  ) {
    actions.push("view", "create" as any, "add" as any, "edit" as any, "change" as any, "delete" as any);
  } else if (normalizedType === "approver") {
    actions.push("view", "approve" as any, "reject" as any);
  } else {
    actions.push(type as PermissionAction);
  }
  
  return actions;
}

export function normalizePermissionDetails(
  permissionDetails: PermissionDetail[] | undefined,
): NormalizedPermissions {
  const permissions: Record<string, Set<PermissionAction>> = {};

  if (!Array.isArray(permissionDetails)) {
    return { isAdmin: false, permissions, isReady: false };
  }

  for (const detail of permissionDetails) {
    if (!detail.permissions || !Array.isArray(detail.permissions)) continue;
    for (const perm of detail.permissions) {
      if (!permissions[detail.module]) {
        permissions[detail.module] = new Set();
      }

      // Add the raw permission_type and its expanded actions (e.g. administrator/admin/reviewer)
      if (perm.permission_type) {
        permissions[detail.module].add(perm.permission_type as PermissionAction);
        const expanded = expandPermissionType(perm.permission_type);
        for (const act of expanded) {
          permissions[detail.module].add(act);
        }
      }

      // Add any explicit entitlements
      if (perm.entitlements && Array.isArray(perm.entitlements)) {
        for (let entitlement of perm.entitlements) {
          // --- TEMPORARY WORKAROUND FOR BACKEND TYPOS & MISMATCHES ---
          const toAdd: string[] = [];
          
          if (entitlement === "edit_unit_of_measurecreate_location") {
            toAdd.push("change_unitofmeasure", "add_location");
          } else if (entitlement === "view_unit_of_measureview_location") {
            toAdd.push("view_unitofmeasure", "view_location");
          } else if (entitlement === "create_stock_movecreate_location") {
            toAdd.push("add_stockmove", "add_location");
          } else {
            toAdd.push(entitlement);
          }

          // Map new backend names to the old Django names the frontend UI expects
          const TEMPORARY_MAP: Record<string, string> = {
            "view_product_category": "view_productcategory",
            "create_product_category": "add_productcategory",
            "edit_product_category": "change_productcategory",
            "delete_product_category": "delete_productcategory",
            "view_unit_of_measure": "view_unitofmeasure",
            "create_unit_of_measure": "add_unitofmeasure",
            "edit_unit_of_measure": "change_unitofmeasure",
            "delete_unit_of_measure": "delete_unitofmeasure",
            "create_products": "add_products",
            "edit_products": "change_products",
            "view_stock_adjustment": "view_stockadjustment",
            "create_stock_adjustment": "add_stockadjustment",
            "edit_stock_adjustment": "change_stockadjustment",
            "create_location": "add_location",
            "edit_location": "change_location",
            "create_delivery_return": "add_returnincomingproduct",
            "edit_delivery_return": "change_returnincomingproduct",
            // Add any other specific mappings here if needed
          };

          for (const rawEnt of toAdd) {
            const mappedEnt = TEMPORARY_MAP[rawEnt] || rawEnt;
            const action = DJANGO_ACTION_MAP[mappedEnt] ?? mappedEnt;
            permissions[detail.module].add(action as PermissionAction);
          }
        }
      }
    }
  }

  return { isAdmin: false, permissions, isReady: true };
}

export function normalizePermissionsFromBackend(
  user_permissions: string[] | Array<{ module: string; permission_type: string }>
): NormalizedPermissions {
  const permissions: Record<string, Set<PermissionAction>> = {};

  if (!Array.isArray(user_permissions) || user_permissions.length === 0) {
    return { isAdmin: false, permissions, isReady: true };
  }

  // New format: array of {module, permission_type}
  if (typeof user_permissions[0] === "object" && "module" in user_permissions[0]) {
    for (const entry of user_permissions as Array<{ module: string; permission_type: string }>) {
      const key = entry.module;
      if (!permissions[key]) {
        permissions[key] = new Set();
      }
      const expanded = expandPermissionType(entry.permission_type);
      for (const act of expanded) {
        permissions[key].add(act);
      }
      permissions[key].add(entry.permission_type as PermissionAction);
    }
    return { isAdmin: false, permissions, isReady: true };
  }

  // Old format: array of Django codenames
  for (const codename of user_permissions as string[]) {
    const parts = codename.split(".");
    let appLabel: string;
    let actionAndModel: string;

    if (parts.length === 2) {
      [appLabel, actionAndModel] = parts;
    } else if (parts.length === 1) {
      continue;
    } else {
      continue;
    }

    const underscoreIdx = actionAndModel.indexOf("_");
    if (underscoreIdx === -1) continue;

    const djangoAction = actionAndModel.substring(0, underscoreIdx);
    const modelName = actionAndModel.substring(underscoreIdx + 1);

    const action = DJANGO_ACTION_MAP[djangoAction];
    if (!action) continue;

    const application = APP_LABEL_MAP[appLabel] ?? appLabel;
    const key = `${application}:${modelName}`;

    if (!permissions[key]) {
      permissions[key] = new Set();
    }
    permissions[key].add(action);
  }

  return { isAdmin: false, permissions, isReady: true };
}

// ---------------------------------------------------------------------------
// Legacy support — kept for backward compatibility with any remaining callers
// ---------------------------------------------------------------------------

export interface AccessRightDetails {
  name: string;
}

export interface AccessGroup {
  application_module: string;
  access_right_details: AccessRightDetails;
}

export interface UserAccess {
  application: string;
  access_groups: string | AccessGroup[];
}

export interface User {
  user_accesses?: UserAccess[];
}

/** @deprecated Use normalizePermissionsFromBackend instead. */
export function normalizePermissions(user: User): NormalizedPermissions {
  const permissions: Record<string, Set<PermissionAction>> = {};
  let isAdmin = false;

  if (!user.user_accesses || !Array.isArray(user.user_accesses)) {
    return { isAdmin, permissions, isReady: false };
  }

  for (const access of user.user_accesses) {
    if (
      access.application === "all_apps" &&
      access.access_groups === "all_access_groups"
    ) {
      isAdmin = true;
      break;
    }

    if (typeof access.access_groups === "string") {
      continue;
    }

    for (const group of access.access_groups) {
      const key = `${access.application}:${group.application_module}`;
      if (!permissions[key]) {
        permissions[key] = new Set();
      }

      const actionName = group.access_right_details.name.toLowerCase() as PermissionAction;
      permissions[key].add(actionName);
    }
  }

  return { isAdmin, permissions, isReady: true };
}
