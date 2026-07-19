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
export function normalizePermissionDetails(
  permissionDetails: PermissionDetail[] | undefined,
): NormalizedPermissions {
  const permissions: Record<string, Set<PermissionAction>> = {};

  if (!Array.isArray(permissionDetails)) {
    return { isAdmin: false, permissions, isReady: false };
  }

  for (const detail of permissionDetails) {
    for (const perm of detail.permissions) {
      for (const entitlement of perm.entitlements) {
        // Normalize entitlement names to PermissionAction vocabulary
        const action = DJANGO_ACTION_MAP[entitlement] ?? entitlement;
        if (!permissions[detail.module]) {
          permissions[detail.module] = new Set();
        }
        permissions[detail.module].add(action);
      }
    }
  }

  return { isAdmin: false, permissions, isReady: true };
}

/**
 * Normalizes the old backend permission format (array of Django codenames).
 *
 * Input: string[] of Django codenames, e.g.:
 *   ["inventory.view_deliveryorder", "purchase.add_purchaserequest"]
 *
 * Or the new format (array of {module, permission_type}):
 *   [{module: "project_costing", permission_type: "reviewer"}]
 *
 * Output: NormalizedPermissions with a Record of "application:module" → Set<PermissionAction>
 *
 * @deprecated Use normalizePermissionDetails instead.
 */
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
