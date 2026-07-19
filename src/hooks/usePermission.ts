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
        return permissions[module]?.has(entitlement as PermissionAction) ?? false;
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
