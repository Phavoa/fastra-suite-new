import { useCallback } from "react";
import { usePermissionContext } from "../contexts/PermissionContext";
import { CanParamsV2, PermissionAction } from "../types/permissions";

const LEGACY_ACTION_TO_ENTITLEMENT_PREFIX: Record<string, string> = {
  view: "view",
  create: "create",
  edit: "edit",
  delete: "delete",
  approve: "approve",
  reject: "reject",
};

export function usePermission() {
  const { isAdmin, permissions, isReady } = usePermissionContext();

  const can = useCallback(
    ({ application, module, action, entitlement }: CanParamsV2): boolean => {
      if (isAdmin) {
        return true;
      }

      // New API: direct module + entitlement check
      if (entitlement && module) {
        const hasDirect = permissions[module]?.has(entitlement as PermissionAction) ?? false;
        if (hasDirect) {
          return true;
        }

        // Administrator / Admin / Manager role has access to all actions in this module
        if (
          permissions[module]?.has("administrator" as PermissionAction) ||
          permissions[module]?.has("admin" as PermissionAction) ||
          permissions[module]?.has("manager" as PermissionAction)
        ) {
          return true;
        }

        // Fallback: If user has generic "view" entitlement, and the check is for a view entitlement
        if (entitlement.startsWith("view") && permissions[module]?.has("view" as PermissionAction)) {
          return true;
        }

        // Fallback: If user has generic "create" or "add" entitlement, and the check is for an add/create entitlement
        if ((entitlement.startsWith("add") || entitlement.startsWith("create")) && 
            (permissions[module]?.has("create" as PermissionAction) || permissions[module]?.has("add" as PermissionAction))) {
          return true;
        }

        // Fallback: If user has generic "edit" or "change" entitlement, and the check is for a change/edit entitlement
        if ((entitlement.startsWith("change") || entitlement.startsWith("edit")) && 
            (permissions[module]?.has("edit" as PermissionAction) || permissions[module]?.has("change" as PermissionAction))) {
          return true;
        }

        // Fallback: If user has generic "delete" entitlement, and the check is for a delete entitlement
        if (entitlement.startsWith("delete") && permissions[module]?.has("delete" as PermissionAction)) {
          return true;
        }

        return false;
      }

      // Legacy API: application:module + action check
      if (application && module && action !== undefined) {
        // First try new format: module as direct key
        const newFormatActions = permissions[module];
        if (newFormatActions && newFormatActions.size > 0) {
          // Map legacy action to entitlement prefix for new format
          const prefix = LEGACY_ACTION_TO_ENTITLEMENT_PREFIX[action] ?? action;
          return Array.from(newFormatActions).some((ent) =>
            ent.startsWith(prefix) || ent === action
          );
        }

        // Fall back to old format: application:module as key
        const legacyKey = `${application}:${module}`;
        const legacyActions = permissions[legacyKey];
        if (legacyActions) {
          return legacyActions.has(action);
        }

        // Final fallback: check if any key ends with :module
        const moduleKey = Object.keys(permissions).find((k) =>
          k.endsWith(`:${module}`)
        );
        if (moduleKey) {
          return true;
        }
        return false;
      }

      return false;
    },
    [isAdmin, permissions]
  );

  return {
    can,
    isAdmin,
    isLoading: !isReady,
  };
}
