"use client";

import { useCallback } from "react";
import { usePermissionContext } from "@/contexts/PermissionContext";
import { UserPermissions } from "@/utils/modulePermissionsStore";

// Custom event name for immediate permission updates on the same page
export const PERMISSIONS_UPDATE_EVENT = "fastrasuite_permissions_updated";

/**
 * useModulePermissions
 *
 * This hook now reads from the backend-driven PermissionContext (via Redux)
 * instead of localStorage. It provides the same public API as before so all
 * pages that call hasAccess() / canDo() continue to work unchanged.
 *
 * isAdmin: true  → backend confirmed this user is an owner/admin role.
 * isAdmin: false → regular user whose module access is governed by user_permissions.
 */
export function useModulePermissions() {
  const { isAdmin, permissions, isReady } = usePermissionContext();

  /**
   * Checks whether the user has ANY permission for a top-level module key.
   * For legacy callers that use keys like "projectRequest", "inventory", etc.
   * we map those to the backend "application:module" pattern.
   */
  const hasAccess = useCallback(
    (moduleKey: keyof UserPermissions | string): boolean => {
      if (isAdmin) return true;
      if (!isReady) return false;

      // Map legacy module keys to their application prefix
      const appPrefix = LEGACY_MODULE_TO_APP[moduleKey as string] ?? moduleKey;

      // Check if any permission entry starts with this application prefix
      return Object.keys(permissions).some((key) => key.startsWith(`${appPrefix}:`));
    },
    [isAdmin, permissions, isReady],
  );

  /**
   * Checks whether the user has a specific permission type for a module.
   */
  const canDo = useCallback(
    (moduleKey: keyof UserPermissions | string, permissionType: string): boolean => {
      if (isAdmin) return true;
      if (!isReady) return false;

      const appPrefix = LEGACY_MODULE_TO_APP[moduleKey as string] ?? moduleKey;
      const action = LEGACY_PERMISSION_TYPE_MAP[permissionType] ?? permissionType;

      // Check if any key under this application has the requested action
      return Object.entries(permissions).some(
        ([key, actions]) => key.startsWith(`${appPrefix}:`) && actions.has(action as any),
      );
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
 * Maps old modulePermissionsStore.ts UserPermissions keys to backend app labels.
 */
const LEGACY_MODULE_TO_APP: Record<string, string> = {
  projectRequest: "project-request",
  projectCosting: "project-costing",
  invoice: "invoice",
  inventory: "inventory",
  settings: "settings",
  contact: "contact",
  purchase: "purchase",
};

/**
 * Maps old modulePermissionsStore.ts permission types to PermissionAction values.
 */
const LEGACY_PERMISSION_TYPE_MAP: Record<string, string> = {
  requester: "create",
  reviewer: "view",
  approver: "approve",
  processor: "edit",
  payer: "approve",
  manager: "edit",
  administrator: "edit",
  view: "view",
  create: "create",
  edit: "edit",
  delete: "delete",
  approve: "approve",
  reject: "reject",
};
