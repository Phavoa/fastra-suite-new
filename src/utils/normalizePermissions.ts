import { PermissionAction } from "../types/permissions";

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

export interface NormalizedPermissions {
  isAdmin: boolean;
  permissions: Record<string, Set<PermissionAction>>;
  isReady: boolean;
}

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
