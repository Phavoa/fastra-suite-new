import { PermissionAction } from "../types/permissions";

export interface NormalizedPermissions {
  isAdmin: boolean;
  permissions: Record<string, Set<PermissionAction>>;
  isReady: boolean;
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
 * Input: string[] of Django codenames, e.g.:
 *   ["inventory.view_deliveryorder", "purchase.add_purchaserequest"]
 *
 * Output: NormalizedPermissions with a Record of "application:module" → Set<PermissionAction>
 *
 * Admin users receive user_permissions: [] from the backend.
 * They are identified via the isAdmin flag stored in the Redux auth state,
 * NOT via this function. This function is only called for non-admin users.
 */
export function normalizePermissionsFromBackend(
  user_permissions: string[]
): NormalizedPermissions {
  const permissions: Record<string, Set<PermissionAction>> = {};

  if (!Array.isArray(user_permissions)) {
    return { isAdmin: false, permissions, isReady: false };
  }

  for (const codename of user_permissions) {
    // Django codenames look like "inventory.view_deliveryorder"
    // Some might also be plain "view_deliveryorder" (without app label)
    const parts = codename.split(".");
    let appLabel: string;
    let actionAndModel: string;

    if (parts.length === 2) {
      [appLabel, actionAndModel] = parts;
    } else if (parts.length === 1) {
      // No app label prefix — skip or use a default
      continue;
    } else {
      continue;
    }

    // Split "view_deliveryorder" into action="view", model="deliveryorder"
    const underscoreIdx = actionAndModel.indexOf("_");
    if (underscoreIdx === -1) continue;

    const djangoAction = actionAndModel.substring(0, underscoreIdx);
    const modelName = actionAndModel.substring(underscoreIdx + 1);

    const action = DJANGO_ACTION_MAP[djangoAction];
    if (!action) continue; // Unknown action — skip

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
