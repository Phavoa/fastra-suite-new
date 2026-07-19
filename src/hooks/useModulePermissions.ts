"use client";

import { useCallback } from "react";
import { usePermissionContext } from "@/contexts/PermissionContext";
import { UserPermissions } from "@/utils/modulePermissionsStore";
import { PermissionAction } from "@/types/permissions";

// Custom event name for immediate permission updates on the same page
export const PERMISSIONS_UPDATE_EVENT = "fastrasuite_permissions_updated";

/**
 * useModulePermissions
 *
 * This hook reads from the backend-driven PermissionContext (via Redux).
 * It provides the same public API as before so all pages that call
 * hasAccess() / canDo() continue to work unchanged.
 *
 * isAdmin: true  → backend confirmed this user is an owner/admin role.
 * isAdmin: false → regular user whose module access is governed by permission_details.
 */
export function useModulePermissions() {
  const { isAdmin, permissions, isReady } = usePermissionContext();

  /**
   * Checks whether the user has ANY permission for a top-level module key.
   * For legacy callers that use keys like "projectRequest", "inventory", etc.
   * we map those to the backend module names.
   */
  const hasAccess = useCallback(
    (moduleKey: keyof UserPermissions | string): boolean => {
      if (isAdmin) return true;
      if (!isReady) return false;

      const backendModule = LEGACY_MODULE_TO_BACKEND[moduleKey as string] ?? moduleKey;

      // Check new format (module as direct key)
      if (permissions[backendModule]) {
        return true;
      }

      // Check old format (application:module key)
      const legacyKey = `${backendModule}`;
      return Object.keys(permissions).some((key) => key.startsWith(`${legacyKey}:`));
    },
    [isAdmin, permissions, isReady],
  );

  /**
   * Checks whether the user has a specific entitlement for a module.
   */
  const canDo = useCallback(
    (moduleKey: keyof UserPermissions | string, entitlement: string): boolean => {
      if (isAdmin) return true;
      if (!isReady) return false;

      const backendModule = LEGACY_MODULE_TO_BACKEND[moduleKey as string] ?? moduleKey;

      // Check new format (module as direct key)
      if (permissions[backendModule]?.has(entitlement as PermissionAction)) {
        return true;
      }

      // Check old format (application:module key)
      const legacyKey = `${backendModule}`;
      const legacyActions = Object.keys(permissions).find((key) =>
        key.startsWith(`${legacyKey}:`)
      );
      if (legacyActions) {
        return permissions[legacyActions].has(entitlement as PermissionAction);
      }

      return false;
    },
    [isAdmin, permissions, isReady],
  );

  return {
    permissions: null, // Legacy field - kept for compatibility; use usePermissionContext() for new code
    isAdmin,
    hasAccess,
    canDo,
    refreshPermissions: () => {}, // No-op; permissions are now live from Redux
  };
}

// ---------------------------------------------------------------------------
// Mapping tables for backward-compat with legacy moduleKey values
// ---------------------------------------------------------------------------

/**
 * Maps old modulePermissionsStore.ts UserPermissions keys to backend module names.
 */
const LEGACY_MODULE_TO_BACKEND: Record<string, string> = {
  projectRequest: "project_request",
  projectCosting: "project_costing",
  invoice: "invoice",
  inventory: "inventory",
  settings: "settings",
  contact: "contact",
  purchase: "purchase",
};
