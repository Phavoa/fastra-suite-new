"use client";

import { useEffect, useState, useCallback } from "react";
import { useSelector } from "react-redux";
import { RootState } from "@/lib/store/store";
import {
  getUserPermissions,
  UserPermissions,
} from "@/utils/modulePermissionsStore";

// Custom event name for immediate permission updates on the same page
export const PERMISSIONS_UPDATE_EVENT = "fastrasuite_permissions_updated";

export function useModulePermissions() {
  const user = useSelector((state: RootState) => state.auth.user);
  const [permissions, setPermissions] = useState<UserPermissions | null>(null);

  const isSuperAdmin =
    user?.id === 1 ||
    user?.email === "admin@fastra.com" ||
    user?.email?.includes("superadmin") ||
    user?.email?.includes("admin");

  const loadPermissions = useCallback(() => {
    if (!user?.id) return;
    const userPerms = getUserPermissions(user.id);
    setPermissions(userPerms);
  }, [user?.id]);

  useEffect(() => {
    loadPermissions();

    const handleUpdate = () => {
      loadPermissions();
    };

    window.addEventListener(PERMISSIONS_UPDATE_EVENT, handleUpdate);
    window.addEventListener("storage", handleUpdate);

    return () => {
      window.removeEventListener(PERMISSIONS_UPDATE_EVENT, handleUpdate);
      window.removeEventListener("storage", handleUpdate);
    };
  }, [loadPermissions]);

  const hasAccess = useCallback(
    (moduleKey: keyof UserPermissions): boolean => {
      if (isSuperAdmin) return true;
      if (!permissions) return true; // Default to true while loading/unconfigured to prevent blocking initial load

      const modPerms = permissions[moduleKey];
      if (!modPerms) return false;

      // Check if any permission is checked for this module
      return Object.values(modPerms).some((val) => val === true);
    },
    [isSuperAdmin, permissions],
  );

  const canDo = useCallback(
    (moduleKey: keyof UserPermissions, permissionType: string): boolean => {
      if (isSuperAdmin) return true;
      if (!permissions) return true;

      const modPerms = permissions[moduleKey];
      if (!modPerms) return false;

      // Check specific permission type
      return modPerms[permissionType as keyof typeof modPerms] === true;
    },
    [isSuperAdmin, permissions],
  );

  return {
    permissions,
    isSuperAdmin,
    hasAccess,
    canDo,
    refreshPermissions: loadPermissions,
  };
}
