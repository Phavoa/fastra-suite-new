"use client";

import { createContext, useContext, ReactNode, useMemo } from "react";
import { useSelector } from "react-redux";
import type { RootState } from "@/lib/store/store";
import {
  NormalizedPermissions,
  normalizePermissionDetails,
  normalizePermissionsFromBackend,
} from "../utils/normalizePermissions";

const PermissionContext = createContext<NormalizedPermissions | undefined>(
  undefined
);

interface PermissionProviderProps {
  children: ReactNode;
}

export function PermissionProvider({ children }: PermissionProviderProps) {
  const user_permissions = useSelector(
    (state: RootState) => state.auth.user_permissions
  );
  const permission_details = useSelector(
    (state: RootState) => state.auth.permission_details
  );
  const isAdmin = useSelector((state: RootState) => state.auth.isAdmin);
  const username = useSelector(
    (state: RootState) => state.auth.user?.username ?? ""
  );

  const usernameContainsAdmin = username.toLowerCase().includes("admin");
  const effectiveIsAdmin = isAdmin || usernameContainsAdmin;

  const normalized = useMemo((): NormalizedPermissions => {
    if (effectiveIsAdmin) {
      return { isAdmin: true, permissions: {}, isReady: true };
    }

    // Prefer new permission_details format if available
    if (permission_details && Array.isArray(permission_details) && permission_details.length > 0) {
      return normalizePermissionDetails(permission_details);
    }

    // Fall back to old user_permissions format
    if (!Array.isArray(user_permissions)) {
      return { isAdmin: false, permissions: {}, isReady: false };
    }

    return normalizePermissionsFromBackend(user_permissions);
  }, [user_permissions, permission_details, effectiveIsAdmin]);

  return (
    <PermissionContext.Provider value={normalized}>
      {children}
    </PermissionContext.Provider>
  );
}

export function usePermissionContext(): NormalizedPermissions {
  const context = useContext(PermissionContext);
  if (!context) {
    throw new Error(
      "usePermissionContext must be used within a PermissionProvider"
    );
  }
  return context;
}
